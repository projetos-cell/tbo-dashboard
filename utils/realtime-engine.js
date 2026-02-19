// ============================================================================
// TBO OS — Realtime Engine
// Subscriptions Supabase em todas as tabelas ERP, Presence, KPIs em tempo real
// ============================================================================

const TBO_REALTIME = {
  _channels: {},
  _presenceChannel: null,
  _onlineUsers: [],
  _callbacks: {},

  // ══════════════════════════════════════════════════════════════════════
  // REALTIME EM TABELAS ERP
  // ══════════════════════════════════════════════════════════════════════
  _erpTables: ['projects', 'tasks', 'deliverables', 'proposals', 'crm_deals'],

  subscribeErp() {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client) return;

    this._erpTables.forEach(table => {
      const channelName = `realtime-${table}`;
      if (this._channels[channelName]) return; // Ja inscrito

      this._channels[channelName] = client
        .channel(channelName)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table
        }, (payload) => {
          console.log(`[TBO Realtime] ${table} ${payload.eventType}:`, payload.new?.id || payload.old?.id);

          // Notificar UI
          const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
          const isOwnChange = payload.new?.owner_id === user?.supabaseId;

          if (!isOwnChange && payload.eventType !== 'DELETE') {
            const entityName = payload.new?.name || payload.new?.title || '';
            const tableLabels = {
              projects: 'Projeto', tasks: 'Tarefa', deliverables: 'Entrega',
              proposals: 'Proposta', crm_deals: 'Deal'
            };
            const label = tableLabels[table] || table;
            const action = payload.eventType === 'INSERT' ? 'criado' : 'atualizado';

            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.info('Atualizacao em tempo real',
                `${label} "${entityName}" foi ${action}.`, 5000, {
                  label: 'Ver',
                  callback: () => {
                    const moduleMap = { projects: 'projetos', tasks: 'tarefas', deliverables: 'entregas', proposals: 'comercial', crm_deals: 'pipeline' };
                    if (typeof TBO_ROUTER !== 'undefined') TBO_ROUTER.navigate(moduleMap[table] || 'command-center');
                  }
                }
              );
            }
          }

          // Disparar callbacks registrados
          (this._callbacks[table] || []).forEach(cb => {
            try { cb(payload); } catch (e) { console.warn(e); }
          });
        })
        .subscribe();
    });

    console.log('[TBO Realtime] Subscribed to', this._erpTables.length, 'ERP tables');
  },

  // Registrar callback para mudancas em tabela especifica
  onTableChange(table, callback) {
    if (!this._callbacks[table]) this._callbacks[table] = [];
    this._callbacks[table].push(callback);
  },

  // ══════════════════════════════════════════════════════════════════════
  // PRESENCE — QUEM ESTA ONLINE
  // ══════════════════════════════════════════════════════════════════════
  initPresence() {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client) return;

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (!user) return;

    this._presenceChannel = client
      .channel('tbo-presence', { config: { presence: { key: user.id } } })
      .on('presence', { event: 'sync' }, () => {
        const state = this._presenceChannel.presenceState();
        this._onlineUsers = [];
        Object.values(state).forEach(presences => {
          presences.forEach(p => {
            this._onlineUsers.push({
              id: p.user_id,
              name: p.user_name,
              initials: p.initials,
              module: p.current_module,
              avatar: p.avatar_url,
              onlineSince: p.online_ref
            });
          });
        });
        this._renderPresenceIndicator();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const p = newPresences[0];
        if (p && p.user_id !== user.id) {
          console.log(`[TBO Presence] ${p.user_name} entrou`);
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const p = leftPresences[0];
        if (p && p.user_id !== user.id) {
          console.log(`[TBO Presence] ${p.user_name} saiu`);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await this._presenceChannel.track({
            user_id: user.id,
            user_name: user.name || user.id,
            initials: user.initials || (user.name || 'U').substring(0, 2).toUpperCase(),
            avatar_url: user.avatarUrl || null,
            current_module: typeof TBO_ROUTER !== 'undefined' ? TBO_ROUTER.getCurrent() : 'dashboard',
            online_ref: Date.now()
          });
        }
      });

    // Atualizar modulo atual ao navegar
    if (typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTER.onChange((moduleName) => {
        if (this._presenceChannel) {
          this._presenceChannel.track({
            user_id: user.id,
            user_name: user.name || user.id,
            initials: user.initials || (user.name || 'U').substring(0, 2).toUpperCase(),
            avatar_url: user.avatarUrl || null,
            current_module: moduleName,
            online_ref: Date.now()
          });
        }
      });
    }
  },

  _renderPresenceIndicator() {
    let container = document.getElementById('presenceIndicator');
    if (!container) {
      // Criar container no header
      const headerRight = document.querySelector('.header-right');
      if (!headerRight) return;
      container = document.createElement('div');
      container.id = 'presenceIndicator';
      container.className = 'presence-indicator';
      container.style.cssText = 'display:flex;align-items:center;gap:-6px;margin-right:8px;';
      headerRight.insertBefore(container, headerRight.firstChild);
    }

    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const others = this._onlineUsers.filter(u => u.id !== currentUser?.id);

    if (others.length === 0) {
      container.innerHTML = '';
      return;
    }

    const maxShow = 4;
    const shown = others.slice(0, maxShow);
    const extra = others.length - maxShow;

    container.innerHTML = `
      <div style="display:flex;align-items:center;" title="${others.map(u => `${u.name} (${u.module})`).join('\n')}">
        ${shown.map((u, i) => `
          <div class="presence-avatar" style="width:28px;height:28px;border-radius:50%;background:var(--brand-orange);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:600;border:2px solid var(--bg-header);margin-left:${i > 0 ? '-6px' : '0'};z-index:${maxShow - i};position:relative;cursor:default;"
               title="${u.name} — ${u.module}">
            ${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : u.initials}
            <span style="position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:#2ecc71;border:2px solid var(--bg-header);"></span>
          </div>
        `).join('')}
        ${extra > 0 ? `<div style="width:28px;height:28px;border-radius:50%;background:var(--bg-tertiary);color:var(--text-muted);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:600;border:2px solid var(--bg-header);margin-left:-6px;">+${extra}</div>` : ''}
      </div>
    `;
  },

  getOnlineUsers() {
    return this._onlineUsers;
  },

  // ══════════════════════════════════════════════════════════════════════
  // REALTIME DASHBOARD KPIs
  // ══════════════════════════════════════════════════════════════════════
  subscribeDashboardKpis(onUpdate) {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client) return;

    // Escutar mudancas em crm_deals para atualizar KPIs
    this.onTableChange('crm_deals', (payload) => {
      if (onUpdate) onUpdate('crm_deals', payload);

      // Auto-update KPI elements no DOM
      this._updateKpiElements();
    });

    // Escutar mudancas em projects
    this.onTableChange('projects', (payload) => {
      if (onUpdate) onUpdate('projects', payload);
      this._updateKpiElements();
    });
  },

  _updateKpiElements() {
    // Buscar elementos de KPI com data-kpi e atualizar com animacao
    document.querySelectorAll('[data-kpi]').forEach(el => {
      const kpiType = el.dataset.kpi;
      let newValue = null;

      if (kpiType === 'deals_count') {
        const deals = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getAllErpEntities('deal') : [];
        newValue = deals.length;
      } else if (kpiType === 'projects_active') {
        const projects = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getAllErpEntities('project') : [];
        newValue = projects.filter(p => p.status === 'em_andamento' || p.status === 'ativo').length;
      }

      if (newValue !== null && typeof TBO_UI !== 'undefined') {
        TBO_UI.countUp(el, newValue, { duration: 600 });
      }
    });
  },

  // ══════════════════════════════════════════════════════════════════════
  // CLEANUP
  // ══════════════════════════════════════════════════════════════════════
  destroy() {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client) return;

    Object.values(this._channels).forEach(ch => client.removeChannel(ch));
    if (this._presenceChannel) client.removeChannel(this._presenceChannel);
    this._channels = {};
    this._presenceChannel = null;
    this._onlineUsers = [];
  },

  // ══════════════════════════════════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════════════════════════════════
  init() {
    this.subscribeErp();
    this.initPresence();
    this.subscribeDashboardKpis();
    console.log('[TBO Realtime] Engine initialized');
  }
};
