// ============================================================================
// TBO OS — Notificacoes In-App (Onboarding)
// Escuta onboarding_notificacoes via Realtime, exibe badge e dropdown
// ============================================================================

const TBO_ONBOARDING_NOTIFICACOES = {
  _channel: null,
  _notificacoes: [],
  _dropdownAberto: false,
  _documentClickHandler: null,

  // ── Inicializacao ───────────────────────────────────────────────────────────
  async init() {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const session = await TBO_SUPABASE.getSession();
      if (!session) return;

      // Buscar email do colaborador logado
      const { data: colab } = await client
        .from('colaboradores')
        .select('id, email')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!colab) return;

      // Carregar notificacoes nao lidas
      await this._carregarNotificacoes(client, colab);

      // Renderizar o sino no header
      this._renderBadge();

      // Iniciar Realtime
      this._initRealtime(client, colab);

    } catch (e) {
      console.warn('[TBO Notificacoes] Erro na inicializacao:', e);
    }
  },

  // ── Carregar notificacoes ───────────────────────────────────────────────────
  async _carregarNotificacoes(client, colab) {
    const { data, error } = await client
      .from('onboarding_notificacoes')
      .select('*')
      .or(`colaborador_id.eq.${colab.id},destinatario.eq.${colab.email}`)
      .eq('tipo', 'inapp')
      .order('enviado_em', { ascending: false })
      .limit(20);

    if (error) {
      console.warn('[TBO Notificacoes] Erro ao carregar:', error.message);
      return;
    }

    this._notificacoes = data || [];
  },

  // ── Renderizar badge no header ──────────────────────────────────────────────
  _renderBadge() {
    // Procurar container de notificacoes no header
    let container = document.getElementById('onbNotificacoesContainer');

    // Se nao existe, criar no header-right
    if (!container) {
      const headerRight = document.querySelector('.header-right');
      if (!headerRight) return;

      container = document.createElement('div');
      container.id = 'onbNotificacoesContainer';
      container.style.cssText = 'position:relative;';

      // Inserir antes do menu do usuario
      const userMenu = document.getElementById('userMenu');
      if (userMenu) {
        headerRight.insertBefore(container, userMenu);
      } else {
        headerRight.appendChild(container);
      }
    }

    const naoLidas = this._notificacoes.filter(n => !n.lida).length;

    container.innerHTML = `
      <button class="btn btn-icon" id="onbNotifBtn" title="Notificacoes" style="position:relative;">
        <i data-lucide="bell" style="width:18px;height:18px;"></i>
        ${naoLidas > 0 ? `<span style="
          position:absolute;top:-2px;right:-2px;
          background:var(--brand-orange,#E85102);color:#fff;
          font-size:11px;font-weight:700;
          width:18px;height:18px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;
        ">${naoLidas > 9 ? '9+' : naoLidas}</span>` : ''}
      </button>
      <div id="onbNotifDropdown" style="
        display:none;
        position:absolute;top:100%;right:0;
        width:340px;max-height:400px;overflow-y:auto;
        background:var(--bg-card,#fff);
        border-radius:var(--radius-lg,12px);
        box-shadow:var(--shadow-lg);
        border:1px solid var(--border-light,#DFDFDF);
        z-index:1000;margin-top:8px;
      ">
        <div style="padding:12px 16px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;">
          <strong style="font-size:14px;">Notificacoes</strong>
          ${naoLidas > 0 ? `<button class="btn btn-ghost btn-sm" id="onbMarcarTodasLidas" style="font-size:12px;">Marcar todas como lidas</button>` : ''}
        </div>
        <div id="onbNotifList">
          ${this._notificacoes.length === 0
            ? '<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:14px;">Nenhuma notificacao</div>'
            : this._notificacoes.map(n => this._renderNotificacao(n)).join('')
          }
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
    this._bindDropdown();
  },

  // ── Renderizar notificacao individual ────────────────────────────────────────
  _renderNotificacao(n) {
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => s == null ? '' : String(s);
    const tempo = this._tempoRelativo(n.enviado_em);
    const iconMap = {
      'inicio_onboarding': 'rocket',
      'conclusao_onboarding': 'check-circle',
      'conclusao_onboarding_admin': 'check-circle',
      'conclusao_onboarding_buddy': 'check-circle',
      'inatividade_colaborador': 'alert-circle',
      'inatividade_buddy': 'alert-triangle',
      'inatividade_admin': 'alert-triangle',
      'dia_anterior': 'calendar',
      'dia_anterior_buddy': 'calendar'
    };
    const icon = iconMap[n.gatilho] || 'bell';

    return `
      <div class="onb-notif-item" data-notif-id="${n.id}" style="
        padding:12px 16px;
        border-bottom:1px solid var(--border-light,#DFDFDF);
        cursor:pointer;
        background:${n.lida ? 'transparent' : 'var(--bg-secondary,#f5f5f5)'};
        transition:background 150ms;
      ">
        <div style="display:flex;gap:10px;align-items:flex-start;">
          <i data-lucide="${icon}" style="width:16px;height:16px;color:var(--brand-orange);flex-shrink:0;margin-top:2px;"></i>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;color:var(--text-primary);line-height:1.4;">${esc(n.mensagem)}</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px;">${tempo}</div>
          </div>
          ${!n.lida ? '<div style="width:8px;height:8px;border-radius:50%;background:var(--brand-orange);flex-shrink:0;margin-top:4px;"></div>' : ''}
        </div>
      </div>
    `;
  },

  // ── Bind dropdown toggle ────────────────────────────────────────────────────
  _bindDropdown() {
    const btn = document.getElementById('onbNotifBtn');
    const dropdown = document.getElementById('onbNotifDropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._dropdownAberto = !this._dropdownAberto;
      dropdown.style.display = this._dropdownAberto ? 'block' : 'none';
    });

    // Fechar ao clicar fora (handler reutilizavel para cleanup)
    if (this._documentClickHandler) {
      document.removeEventListener('click', this._documentClickHandler);
    }
    this._documentClickHandler = (e) => {
      const container = document.getElementById('onbNotificacoesContainer');
      if (container && !container.contains(e.target) && this._dropdownAberto) {
        this._dropdownAberto = false;
        dropdown.style.display = 'none';
      }
    };
    document.addEventListener('click', this._documentClickHandler);

    // Marcar como lida ao clicar
    const list = document.getElementById('onbNotifList');
    if (list) {
      list.addEventListener('click', async (e) => {
        const item = e.target.closest('[data-notif-id]');
        if (!item) return;
        await this._marcarComoLida(item.dataset.notifId);
      });
    }

    // Marcar todas como lidas
    document.getElementById('onbMarcarTodasLidas')?.addEventListener('click', async () => {
      await this._marcarTodasComoLidas();
    });
  },

  // ── Marcar notificacao como lida ────────────────────────────────────────────
  async _marcarComoLida(notifId) {
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      await client
        .from('onboarding_notificacoes')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .eq('id', notifId);

      // Atualizar local
      const notif = this._notificacoes.find(n => n.id === notifId);
      if (notif) notif.lida = true;
      this._renderBadge();

    } catch (e) {
      console.warn('[TBO Notificacoes] Erro ao marcar como lida:', e);
    }
  },

  async _marcarTodasComoLidas() {
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const ids = this._notificacoes.filter(n => !n.lida).map(n => n.id);
      if (ids.length === 0) return;

      await client
        .from('onboarding_notificacoes')
        .update({ lida: true, lida_em: new Date().toISOString() })
        .in('id', ids);

      this._notificacoes.forEach(n => n.lida = true);
      this._renderBadge();

    } catch (e) {
      console.warn('[TBO Notificacoes] Erro ao marcar todas como lidas:', e);
    }
  },

  // ── Realtime ────────────────────────────────────────────────────────────────
  _initRealtime(client, colab) {
    this._channel = client
      .channel('onboarding-notificacoes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'onboarding_notificacoes',
        filter: `destinatario=eq.${colab.email}`
      }, (payload) => {
        console.log('[TBO Notificacoes] Nova notificacao:', payload);
        this._notificacoes.unshift(payload.new);
        this._renderBadge();

        // Toast para notificacao nova
        if (typeof TBO_TOAST !== 'undefined') {
          TBO_TOAST.info('Nova notificacao', payload.new.mensagem?.substring(0, 100) || 'Voce tem uma nova notificacao.');
        }
      })
      .subscribe();
  },

  // ── Tempo relativo ──────────────────────────────────────────────────────────
  _tempoRelativo(data) {
    const agora = new Date();
    const quando = new Date(data);
    const diff = Math.floor((agora - quando) / 1000);

    if (diff < 60) return 'agora';
    if (diff < 3600) return `${Math.floor(diff / 60)} min atras`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atras`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} dias atras`;
    return quando.toLocaleDateString('pt-BR');
  },

  // ── Cleanup ─────────────────────────────────────────────────────────────────
  destroy() {
    if (this._channel) {
      const client = TBO_SUPABASE?.getClient();
      if (client) client.removeChannel(this._channel);
      this._channel = null;
    }
    // Remover listener global de click (previne memory leak)
    if (this._documentClickHandler) {
      document.removeEventListener('click', this._documentClickHandler);
      this._documentClickHandler = null;
    }
    // Limpar container do DOM
    const container = document.getElementById('onbNotificacoesContainer');
    if (container) container.remove();
  }
};
