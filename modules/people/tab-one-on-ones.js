// TBO OS — People Tab: 1:1s & Rituais
// Sub-modulo lazy-loaded

(function() {
  const S = TBO_PEOPLE_SHARED;

  const TabOneOnOnes = {
    // ── Estado especifico da tab ──
    _oneOnOnesCache: null,
    _oneOnOneActionsCache: null,
    _ctxCleanup: null,

    // ══════════════════════════════════════════════════════════════════
    // RENDER
    // ══════════════════════════════════════════════════════════════════
    render() {
      return this._render1on1s();
    },

    _render1on1s() {
      // Usar cache Supabase ou fallback localStorage
      const fromSupabase = this._oneOnOnesCache !== null;
      const items = fromSupabase ? this._oneOnOnesCache : S._getStore('1on1s');
      const isAdmin = S._isAdmin();
      const userId = S._currentUserId();

      // Filtrar por participante (admin ve tudo)
      let filtered;
      if (fromSupabase) {
        filtered = isAdmin ? items : items.filter(o => o.leader_id === userId || o.collaborator_id === userId);
      } else {
        filtered = isAdmin ? items : items.filter(o => o.lider === userId || o.colaborador === userId);
      }

      // Contagens
      const concluidas = filtered.filter(o => (o.status === 'concluida' || o.status === 'completed')).length;
      const agendadas = filtered.filter(o => (o.status === 'agendada' || o.status === 'scheduled')).length;

      // Acoes pendentes
      let pendingActions = [];
      if (fromSupabase) {
        pendingActions = this._oneOnOneActionsCache || [];
      } else {
        const allActions = filtered.flatMap(o => o.items || []);
        pendingActions = allActions.filter(i => !i.concluido);
      }

      // Helper para nome pela id (Supabase usa UUID, localStorage usa username)
      const getName = (id) => {
        if (fromSupabase) {
          const p = S._team.find(t => t.supabaseId === id);
          return p ? p.nome : S._getPersonName(id);
        }
        return S._getPersonName(id);
      };

      // Helper para data
      const getDate = (o) => fromSupabase ? (o.scheduled_at || o.created_at) : o.data;
      const getLeader = (o) => fromSupabase ? o.leader_id : o.lider;
      const getCollab = (o) => fromSupabase ? o.collaborator_id : o.colaborador;
      const getActionText = (a) => fromSupabase ? a.text : a.texto;
      const getActionAssignee = (a) => fromSupabase ? a.assignee_id : a.responsavel;
      const getActionDue = (a) => fromSupabase ? a.due_date : a.prazo;

      // Carregar dados do Supabase async
      if (!fromSupabase) this._load1on1sFromSupabase();

      const rituais = [
        { nome: 'Daily Socios', freq: 'Diaria', desc: 'Alinhamento rapido entre fundadores' },
        { nome: '1:1 Mensal', freq: 'Mensal', desc: 'PDI + feedback bidirecional' },
        { nome: 'Review Semanal', freq: 'Semanal', desc: 'Revisao de entregas por BU' },
        { nome: 'Retrospectiva', freq: 'Mensal', desc: 'O que foi bem, o que melhorar' },
        { nome: 'All Hands', freq: 'Trimestral', desc: 'Resultados + visao da empresa' }
      ];

      return `
        ${S._pageHeader('1:1s & Rituais', 'Reuniões individuais, ações e rituais da equipe')}
        <div class="grid-4" style="margin-bottom:16px;">
          <div class="kpi-card"><div class="kpi-label">Total 1:1s</div><div class="kpi-value">${filtered.length}</div></div>
          <div class="kpi-card kpi-card--blue"><div class="kpi-label">Agendadas</div><div class="kpi-value">${agendadas}</div></div>
          <div class="kpi-card kpi-card--success"><div class="kpi-label">Concluidas</div><div class="kpi-value">${concluidas}</div></div>
          <div class="kpi-card kpi-card--warning"><div class="kpi-label">Acoes Pendentes</div><div class="kpi-value">${pendingActions.length}</div></div>
        </div>

        ${pendingActions.length ? `<div class="card" style="margin-bottom:16px;"><div class="card-header"><h3 class="card-title">Acoes Pendentes</h3></div><div style="max-height:200px;overflow-y:auto;">
          ${pendingActions.map(a => `<div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
            <input type="checkbox" class="rh-action-check" data-id="${a.id}" ${(fromSupabase ? a.completed : a.concluido) ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent-gold);">
            <div style="flex:1;font-size:0.82rem;">${getActionText(a)}</div>
            <span style="font-size:0.72rem;color:var(--text-muted);">${getName(getActionAssignee(a))}</span>
            <span style="font-size:0.68rem;color:${getActionDue(a) && new Date(getActionDue(a)) < new Date() ? 'var(--color-danger)' : 'var(--text-muted)'};">${getActionDue(a) ? new Date(getActionDue(a) + (getActionDue(a).includes('T') ? '' : 'T12:00')).toLocaleDateString('pt-BR') : ''}</span>
            <button class="btn btn-ghost btn-sm rh-action-delete" data-id="${a.id}" title="Excluir acao" style="color:var(--color-danger);padding:2px 6px;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
          </div>`).join('')}
        </div></div>` : ''}

        <div class="grid-2" style="gap:16px;margin-bottom:16px;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Proximas 1:1s</h3><button class="btn btn-primary btn-sm" id="rhNew1on1">+ Nova</button></div>
            <div id="rh1on1Form" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
              <div class="grid-2" style="gap:12px;margin-bottom:12px;">
                <div class="form-group" style="margin-bottom:0;"><label class="form-label">Lider</label><select class="form-input" id="ooLider">${S._team.filter(t => !t.lider || t.cargo.includes('Coord') || t.cargo.includes('PO') || t.cargo.includes('Lider') || t.cargo.includes('Diretor')).map(t => `<option value="${t.supabaseId || t.id}">${t.nome}</option>`).join('')}</select></div>
                <div class="form-group" style="margin-bottom:0;"><label class="form-label">Colaborador</label><select class="form-input" id="ooColab">${S._team.filter(t => !t.terceirizado).map(t => `<option value="${t.supabaseId || t.id}">${t.nome}</option>`).join('')}</select></div>
              </div>
              <div class="grid-2" style="gap:12px;margin-bottom:12px;">
                <div class="form-group" style="margin-bottom:0;"><label class="form-label">Data</label><input type="datetime-local" class="form-input" id="ooData"></div>
                <div class="form-group" style="margin-bottom:0;"><label class="form-label">Recorrência</label><select class="form-input" id="ooRecurrence"><option value="daily">Diária — seg a sex (padrão)</option><option value="weekly">Semanal</option><option value="biweekly">Quinzenal</option><option value="monthly">Mensal</option><option value="">Única vez</option></select></div>
              </div>
              <div style="display:flex;gap:8px;align-items:center;">
                <button class="btn btn-primary btn-sm" id="ooSave"><i data-lucide="calendar-plus" style="width:12px;height:12px;vertical-align:-2px;"></i> Agendar + Google Calendar</button>
                <button class="btn btn-secondary btn-sm" id="ooCancel">Cancelar</button>
                <span id="oo1on1Status" style="font-size:0.68rem;color:var(--text-muted);margin-left:auto;"></span>
              </div>
            </div>
            ${filtered.filter(o => (o.status === 'agendada' || o.status === 'scheduled')).sort((a, b) => new Date(getDate(a)) - new Date(getDate(b))).map(o => `<div class="rh-1on1-row" data-id="${o.id}" style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background=''"><input type="checkbox" class="rh-1on1-select" data-id="${o.id}" style="width:16px;height:16px;accent-color:var(--accent-gold);cursor:pointer;flex-shrink:0;" onclick="event.stopPropagation();"><div style="flex:1;"><div style="font-size:0.85rem;font-weight:600;">${getName(getLeader(o))} ↔ ${getName(getCollab(o))}</div><div style="font-size:0.72rem;color:var(--text-muted);">${new Date(getDate(o)).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${o.recurrence ? ` · <i data-lucide="repeat" style="width:10px;height:10px;vertical-align:-1px;"></i> ${o.recurrence === 'daily' ? 'Diária' : o.recurrence === 'monthly' ? 'Mensal' : o.recurrence === 'biweekly' ? 'Quinzenal' : 'Semanal'}` : ''}${o.google_event_id ? ' · <i data-lucide="calendar" style="width:10px;height:10px;vertical-align:-1px;color:var(--color-info);"></i>' : ''}${!o.google_event_id && o.status === 'scheduled' ? ' · <i data-lucide="calendar-x" style="width:10px;height:10px;vertical-align:-1px;color:var(--color-danger);"></i>' : ''}</div></div><span class="tag" style="font-size:0.65rem;background:var(--color-info)20;color:var(--color-info);">Agendada</span></div>`).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma agendada</div>'}
          </div>
          <div class="card">
            <div class="card-header"><h3 class="card-title">Historico</h3></div>
            ${filtered.filter(o => (o.status !== 'agendada' && o.status !== 'scheduled')).sort((a, b) => new Date(getDate(b)) - new Date(getDate(a))).slice(0, 15).map(o => {
              const statusMap = { completed: { label: 'Concluída', bg: 'var(--color-success)20', color: 'var(--color-success)' }, concluida: { label: 'Concluída', bg: 'var(--color-success)20', color: 'var(--color-success)' }, cancelled: { label: 'Cancelada', bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' }, no_show: { label: 'No-show', bg: 'var(--color-danger)20', color: 'var(--color-danger)' } };
              const st = statusMap[o.status] || statusMap.completed;
              return `<div class="rh-1on1-row" data-id="${o.id}" style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background=''"><div style="display:flex;align-items:center;gap:10px;"><input type="checkbox" class="rh-1on1-select" data-id="${o.id}" style="width:16px;height:16px;accent-color:var(--accent-gold);cursor:pointer;flex-shrink:0;" onclick="event.stopPropagation();"><div style="flex:1;"><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.85rem;font-weight:600;">${getName(getLeader(o))} ↔ ${getName(getCollab(o))}</div><div style="font-size:0.72rem;color:var(--text-muted);">${new Date(getDate(o)).toLocaleDateString('pt-BR')}</div></div><span class="tag" style="font-size:0.65rem;background:${st.bg};color:${st.color};">${st.label}</span></div>${o.notes ? `<div style="font-size:0.72rem;color:var(--text-secondary);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;">${S._esc((o.notes || '').slice(0, 80))}${(o.notes || '').length > 80 ? '...' : ''}</div>` : ''}</div></div></div>`;
            }).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma no historico</div>'}
          </div>
        </div>

        <!-- Rituais -->
        <div class="card">
          <div class="card-header"><h3 class="card-title">Rituais da Empresa</h3></div>
          <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
            ${rituais.map(r => `<div style="padding:12px;background:var(--bg-elevated);border-radius:8px;"><div style="font-weight:600;font-size:0.85rem;margin-bottom:4px;">${r.nome}</div><div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">${r.desc}</div><span class="tag" style="font-size:0.62rem;">${r.freq}</span></div>`).join('')}
          </div>
        </div>

        <!-- Bulk actions bar (multi-selecao 1:1) -->
        <div id="rh1on1BulkBar" style="display:none;position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#fff;border:1px solid #e5e5e5;border-radius:12px;padding:10px 20px;align-items:center;gap:12px;z-index:100;box-shadow:0 4px 24px rgba(0,0,0,0.18);">
          <span id="rh1on1BulkCount" style="font-size:0.8rem;font-weight:600;">0 selecionados</span>
          <button class="btn btn-sm" id="rh1on1BulkDelete" style="color:var(--color-danger);border:1px solid var(--color-danger);"><i data-lucide="trash-2" style="width:12px;height:12px;vertical-align:-2px;"></i> Excluir selecionados</button>
          <button class="btn btn-sm" id="rh1on1BulkSelectAll">Selecionar todos</button>
          <button class="btn btn-sm" id="rh1on1BulkCancel">Cancelar</button>
        </div>
      `;
    },

    // ══════════════════════════════════════════════════════════════════
    // INIT (bindings)
    // ══════════════════════════════════════════════════════════════════
    init() {
      const self = this;

      // 1:1 CRUD
      S._bindToggle('rhNew1on1', 'rh1on1Form');
      S._bindToggle('ooCancel', 'rh1on1Form', false);
      S._bind('ooSave', async () => {
        const leaderId = document.getElementById('ooLider')?.value;
        const collabId = document.getElementById('ooColab')?.value;
        const dataValue = document.getElementById('ooData')?.value || new Date().toISOString();
        const recurrence = document.getElementById('ooRecurrence')?.value || '';
        const statusEl = document.getElementById('oo1on1Status');

        const leaderPerson = S._team.find(t => (t.supabaseId || t.id) === leaderId);
        const collabPerson = S._team.find(t => (t.supabaseId || t.id) === collabId);

        if (statusEl) statusEl.textContent = 'Salvando...';

        // Tentar salvar no Supabase
        if (typeof OneOnOnesRepo !== 'undefined') {
          try {
            // Calcular datas recorrentes
            const dates = [dataValue];
            if (recurrence) {
              if (recurrence === 'daily') {
                // Diária: seg a sex, gerar ~20 dias úteis (≈1 mês)
                let current = new Date(dataValue);
                let count = 0;
                while (count < 19) {
                  current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                  const day = current.getDay(); // 0=dom, 6=sáb
                  if (day !== 0 && day !== 6) {
                    dates.push(current.toISOString());
                    count++;
                  }
                }
              } else {
                const intervalDays = recurrence === 'weekly' ? 7 : recurrence === 'biweekly' ? 14 : 30;
                for (let i = 1; i <= 5; i++) {
                  const d = new Date(new Date(dataValue).getTime() + i * intervalDays * 24 * 60 * 60 * 1000);
                  dates.push(d.toISOString());
                }
              }
            }

            let createdCount = 0;
            for (const dt of dates) {
              if (statusEl) statusEl.textContent = `Criando ${createdCount + 1}/${dates.length}...`;

              const oneOnOne = await OneOnOnesRepo.create({
                leader_id: leaderId,
                collaborator_id: collabId,
                scheduled_at: dt,
                status: 'scheduled',
                recurrence: recurrence || null
              });

              // Criar evento no Google Calendar automaticamente
              if (typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
                try {
                  if (statusEl) statusEl.textContent = `Google Calendar ${createdCount + 1}/${dates.length}...`;
                  const gcalResult = await TBO_GOOGLE_CALENDAR.create1on1Event({
                    leaderName: leaderPerson?.nome || 'Líder',
                    leaderEmail: leaderPerson?.email || '',
                    collaboratorName: collabPerson?.nome || 'Colaborador',
                    collaboratorEmail: collabPerson?.email || '',
                    scheduledAt: dt,
                    durationMinutes: 30
                  });

                  // Salvar google_event_id na 1:1
                  if (gcalResult?.id && oneOnOne?.id) {
                    await OneOnOnesRepo.update(oneOnOne.id, { google_event_id: gcalResult.id });
                  }
                } catch (gcalErr) {
                  console.warn('[RH] Google Calendar falhou (continuando):', gcalErr.message);
                  if (gcalErr.message?.includes('403') || gcalErr.message?.includes('insufficient')) {
                    TBO_TOAST.warning('Google Calendar', 'Permissão insuficiente. Faça logout e login via Google para atualizar permissões.');
                  } else {
                    TBO_TOAST.warning('Google Calendar', gcalErr.message || 'Falha ao criar evento. Verifique login Google OAuth.');
                  }
                  if (statusEl) statusEl.textContent = `⚠ Calendar falhou — ${createdCount + 1}/${dates.length}`;
                }
              }
              createdCount++;
            }

            const recLabel = { daily: 'Diária (seg-sex)', weekly: 'Semanal', biweekly: 'Quinzenal', monthly: 'Mensal' };
            TBO_TOAST.success(`${createdCount} 1:1(s) agendada(s)!`, recurrence ? `Recorrência ${recLabel[recurrence] || recurrence}` : '');
            if (statusEl) statusEl.textContent = '';
            self._oneOnOnesCache = null;
            self._oneOnOneActionsCache = null;
            await self._load1on1sFromSupabase();
            return;
          } catch (e) {
            console.warn('[RH] Erro ao salvar 1:1 no Supabase:', e.message);
            if (statusEl) statusEl.textContent = 'Erro!';
          }
        }

        // Fallback: localStorage
        const oo = { id: S._genId(), lider: leaderId, colaborador: collabId, data: dataValue, status: 'agendada', items: [] };
        const items = S._getStore('1on1s'); items.push(oo); S._setStore('1on1s', items);
        TBO_TOAST.success('1:1 agendada!');
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) { tabContent.innerHTML = self.render(); self.init(); }
      });

      // 1:1 detail panel (click to expand) + context menu (right-click)
      document.querySelectorAll('.rh-1on1-row').forEach(row => {
        row.addEventListener('click', async () => {
          const id = row.dataset.id;
          if (!id) return;
          await self._open1on1Detail(id);
        });
        row.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          const id = row.dataset.id;
          if (!id) return;
          self._show1on1ContextMenu(id, e.clientX, e.clientY);
        });
      });

      // v3.0: Multi-selecao de 1:1s (checkboxes + bulk bar)
      this._bind1on1BulkActions();

      // Action checkboxes
      this._bindActionChecks();

      // Lucide icons
      if (window.lucide) lucide.createIcons();
    },

    // ══════════════════════════════════════════════════════════════════
    // Carregar 1:1s do Supabase
    // ══════════════════════════════════════════════════════════════════
    async _load1on1sFromSupabase() {
      try {
        if (typeof OneOnOnesRepo === 'undefined') return;
        const { data: ones } = await OneOnOnesRepo.list({ limit: 100 });
        this._oneOnOnesCache = ones || [];

        // Carregar acoes pendentes
        const actions = await OneOnOnesRepo.listPendingActions();
        this._oneOnOneActionsCache = actions || [];

        // Re-renderizar se estiver na tab 1on1
        if (S._activeTab === 'one-on-ones') {
          const tabContent = document.getElementById('rhTabContent');
          if (tabContent) {
            tabContent.innerHTML = this.render();
            this.init();
          }
        }
      } catch (e) {
        console.warn('[RH] Erro ao carregar 1:1s do Supabase:', e.message);
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // 1:1 Detail Panel (modal com notas + acoes)
    // ══════════════════════════════════════════════════════════════════
    async _open1on1Detail(oneOnOneId) {
      if (typeof OneOnOnesRepo === 'undefined') return;
      const self = this;

      try {
        const data = await OneOnOnesRepo.getById(oneOnOneId);
        if (!data) { TBO_TOAST.warning('1:1 não encontrada'); return; }

        const leaderName = S._getPersonNameByUid(data.leader_id);
        const collabName = S._getPersonNameByUid(data.collaborator_id);
        const actions = data.one_on_one_actions || [];
        const statusColors = { scheduled: 'var(--color-info)', completed: 'var(--color-success)', cancelled: 'var(--text-muted)', no_show: 'var(--color-danger)' };
        const statusLabels = { scheduled: 'Agendada', completed: 'Concluída', cancelled: 'Cancelada', no_show: 'No-show' };

        // Modal overlay
        const overlay = document.createElement('div');
        overlay.id = 'rh1on1DetailOverlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
        overlay.innerHTML = `
          <div style="background:var(--bg-card, #ffffff);border-radius:16px;width:560px;max-width:calc(100vw - 48px);max-height:80vh;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,0.25);padding:24px;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
              <div>
                <h3 style="font-size:1rem;font-weight:700;margin-bottom:2px;">1:1 ${S._esc(leaderName)} ↔ ${S._esc(collabName)}</h3>
                <div style="font-size:0.75rem;color:var(--text-muted);">${data.scheduled_at ? new Date(data.scheduled_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                  ${data.google_event_id ? ' · <i data-lucide="calendar" style="width:10px;height:10px;vertical-align:-1px;color:var(--color-info);"></i> Google Calendar' : ''}
                  ${data.recurrence ? ` · <i data-lucide="repeat" style="width:10px;height:10px;vertical-align:-1px;"></i> ${data.recurrence === 'daily' ? 'Diária' : data.recurrence === 'monthly' ? 'Mensal' : data.recurrence === 'biweekly' ? 'Quinzenal' : 'Semanal'}` : ''}
                </div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;">
                <span class="tag" style="font-size:0.65rem;background:${statusColors[data.status] || 'var(--text-muted)'}20;color:${statusColors[data.status] || 'var(--text-muted)'};">${statusLabels[data.status] || data.status}</span>
                <button id="rh1on1Close" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
              </div>
            </div>

            <!-- Status buttons -->
            <div style="display:flex;gap:6px;margin-bottom:16px;align-items:center;">
              ${data.status === 'scheduled' ? `
                <button class="btn btn-sm btn-primary" id="rh1on1Complete"><i data-lucide="check" style="width:12px;height:12px;"></i> Marcar Concluída</button>
                <button class="btn btn-sm btn-secondary" id="rh1on1Cancel">Cancelar</button>
              ` : ''}
              <button class="btn btn-sm" style="margin-left:auto;color:var(--color-danger);border:1px solid var(--color-danger);" id="rh1on1Delete"><i data-lucide="trash-2" style="width:12px;height:12px;"></i> Excluir</button>
            </div>

            <!-- Notas -->
            <div style="margin-bottom:16px;">
              <label style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:6px;"><i data-lucide="file-text" style="width:14px;height:14px;vertical-align:-2px;color:var(--accent-gold);"></i> Notas da Reunião</label>
              <textarea id="rh1on1Notes" class="form-input" rows="4" placeholder="Escreva notas sobre a reunião..." style="font-size:0.8rem;resize:vertical;">${S._esc(data.notes || '')}</textarea>
              <button class="btn btn-sm btn-secondary" id="rh1on1SaveNotes" style="margin-top:6px;font-size:0.68rem;">Salvar Notas</button>
            </div>

            <!-- Ações -->
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <label style="font-weight:600;font-size:0.82rem;"><i data-lucide="check-square" style="width:14px;height:14px;vertical-align:-2px;color:var(--color-info);"></i> Ações (${actions.length})</label>
                <button class="btn btn-sm btn-secondary" id="rh1on1AddAction" style="font-size:0.66rem;padding:2px 8px;"><i data-lucide="plus" style="width:10px;height:10px;"></i> Ação</button>
              </div>
              <div id="rh1on1ActionForm" style="display:none;margin-bottom:8px;padding:8px;background:var(--bg-elevated);border-radius:8px;">
                <input type="text" class="form-input" id="rh1on1ActionText" placeholder="Descreva a ação..." style="font-size:0.78rem;margin-bottom:6px;">
                <div style="display:flex;gap:6px;">
                  <input type="date" class="form-input" id="rh1on1ActionDue" style="font-size:0.72rem;flex:1;">
                  <button class="btn btn-primary btn-sm" id="rh1on1ActionSave" style="font-size:0.66rem;">Criar</button>
                </div>
              </div>
              <div id="rh1on1ActionList">
                ${actions.length ? actions.map(a => `
                  <div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border-subtle);">
                    <input type="checkbox" class="rh1on1-action-toggle" data-id="${a.id}" ${a.completed ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent-gold);">
                    <div style="flex:1;">
                      <div style="font-size:0.78rem;${a.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">${S._esc(a.text)}</div>
                      ${a.due_date ? `<div style="font-size:0.65rem;color:${new Date(a.due_date) < new Date() && !a.completed ? 'var(--color-danger)' : 'var(--text-muted)'};">Prazo: ${new Date(a.due_date + 'T12:00').toLocaleDateString('pt-BR')}</div>` : ''}
                    </div>
                    <button class="rh1on1-action-delete" data-id="${a.id}" style="background:none;border:none;cursor:pointer;color:var(--color-danger);padding:2px;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
                  </div>
                `).join('') : '<div style="font-size:0.72rem;color:var(--text-muted);padding:8px;">Nenhuma ação registrada</div>'}
              </div>
            </div>
          </div>
        `;

        document.body.appendChild(overlay);
        if (window.lucide) lucide.createIcons({ root: overlay });

        // Binds
        overlay.querySelector('#rh1on1Close')?.addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Salvar notas
        overlay.querySelector('#rh1on1SaveNotes')?.addEventListener('click', async () => {
          const notes = overlay.querySelector('#rh1on1Notes')?.value || '';
          try {
            await OneOnOnesRepo.update(oneOnOneId, { notes });
            TBO_TOAST.success('Notas salvas!');
          } catch (e) { TBO_TOAST.error('Erro ao salvar notas'); }
        });

        // Marcar concluida
        overlay.querySelector('#rh1on1Complete')?.addEventListener('click', async () => {
          const notes = overlay.querySelector('#rh1on1Notes')?.value || '';
          try {
            await OneOnOnesRepo.complete(oneOnOneId, notes);
            TBO_TOAST.success('1:1 concluída!');
            overlay.remove();
            self._oneOnOnesCache = null;
            await self._load1on1sFromSupabase();
          } catch (e) { TBO_TOAST.error('Erro ao concluir'); }
        });

        // Cancelar 1:1
        overlay.querySelector('#rh1on1Cancel')?.addEventListener('click', async () => {
          try {
            await OneOnOnesRepo.cancel(oneOnOneId);
            // Deletar evento do Google Calendar
            if (data.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
              try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
            }
            TBO_TOAST.info('1:1 cancelada');
            overlay.remove();
            self._oneOnOnesCache = null;
            await self._load1on1sFromSupabase();
          } catch (e) { TBO_TOAST.error('Erro ao cancelar'); }
        });

        // Excluir 1:1 (hard delete)
        overlay.querySelector('#rh1on1Delete')?.addEventListener('click', async () => {
          if (!confirm('Excluir esta 1:1 permanentemente? Esta ação não pode ser desfeita.')) return;
          try {
            // Deletar evento do Google Calendar primeiro
            if (data.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
              try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
            }
            // Deletar do banco
            await OneOnOnesRepo.remove(oneOnOneId);
            TBO_TOAST.success('1:1 excluída');
            overlay.remove();
            self._oneOnOnesCache = null;
            await self._load1on1sFromSupabase();
          } catch (e) {
            console.error('[RH] Erro ao excluir 1:1:', e);
            TBO_TOAST.error('Erro ao excluir 1:1');
          }
        });

        // Toggle acoes
        overlay.querySelectorAll('.rh1on1-action-toggle').forEach(chk => {
          chk.addEventListener('change', async () => {
            try {
              await OneOnOnesRepo.toggleAction(chk.dataset.id, chk.checked);
            } catch (e) { TBO_TOAST.error('Erro ao atualizar ação'); }
          });
        });

        // Delete acoes
        overlay.querySelectorAll('.rh1on1-action-delete').forEach(btn => {
          btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
              await OneOnOnesRepo.removeAction(btn.dataset.id);
              btn.closest('div[style*="border-bottom"]')?.remove();
            } catch (err) { TBO_TOAST.error('Erro ao remover ação'); }
          });
        });

        // Adicionar acao
        overlay.querySelector('#rh1on1AddAction')?.addEventListener('click', () => {
          const form = overlay.querySelector('#rh1on1ActionForm');
          if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
        });
        overlay.querySelector('#rh1on1ActionSave')?.addEventListener('click', async () => {
          const text = overlay.querySelector('#rh1on1ActionText')?.value;
          const dueDate = overlay.querySelector('#rh1on1ActionDue')?.value;
          if (!text) return;
          try {
            const action = await OneOnOnesRepo.createAction(oneOnOneId, {
              text,
              assignee_id: data.collaborator_id,
              due_date: dueDate || null,
              completed: false
            });
            TBO_TOAST.success('Ação criada!');
            // Reload detail
            overlay.remove();
            await self._open1on1Detail(oneOnOneId);
          } catch (e) { TBO_TOAST.error('Erro ao criar ação'); }
        });
      } catch (e) {
        console.error('[RH] Erro ao abrir detalhe 1:1:', e);
        TBO_TOAST.error('Erro ao carregar detalhe da 1:1');
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // Multi-selecao e delete em massa de 1:1s
    // ══════════════════════════════════════════════════════════════════
    _bind1on1BulkActions() {
      const self = this;

      // Checkbox change → atualizar bulk bar
      document.querySelectorAll('.rh-1on1-select').forEach(cb => {
        cb.addEventListener('change', () => self._update1on1BulkBar());
      });

      // Selecionar todos
      document.getElementById('rh1on1BulkSelectAll')?.addEventListener('click', () => {
        document.querySelectorAll('.rh-1on1-select').forEach(cb => { cb.checked = true; });
        self._update1on1BulkBar();
      });

      // Cancelar seleção
      document.getElementById('rh1on1BulkCancel')?.addEventListener('click', () => {
        document.querySelectorAll('.rh-1on1-select').forEach(cb => { cb.checked = false; });
        self._update1on1BulkBar();
      });

      // Excluir selecionados em massa
      document.getElementById('rh1on1BulkDelete')?.addEventListener('click', async () => {
        const selected = [...document.querySelectorAll('.rh-1on1-select:checked')].map(cb => cb.dataset.id);
        if (selected.length === 0) return;
        if (!confirm(`Excluir ${selected.length} reunião(ões) permanentemente? Esta ação não pode ser desfeita.`)) return;

        let errors = 0;
        for (const id of selected) {
          try {
            const data = await OneOnOnesRepo.getById(id);
            if (data?.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
              try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
            }
            await OneOnOnesRepo.remove(id);
          } catch { errors++; }
        }

        const ok = selected.length - errors;
        if (ok > 0) TBO_TOAST.success(`${ok} reunião(ões) excluída(s)`);
        if (errors > 0) TBO_TOAST.warning(`${errors} erro(s) ao excluir`);
        self._oneOnOnesCache = null;
        await self._load1on1sFromSupabase();
      });
    },

    _update1on1BulkBar() {
      const selected = document.querySelectorAll('.rh-1on1-select:checked');
      const bar = document.getElementById('rh1on1BulkBar');
      const countEl = document.getElementById('rh1on1BulkCount');
      if (!bar) return;

      if (selected.length > 0) {
        bar.style.display = 'flex';
        countEl.textContent = `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`;
        if (window.lucide) lucide.createIcons({ root: bar });
      } else {
        bar.style.display = 'none';
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // Context Menu: 1:1 (botão direito)
    // ══════════════════════════════════════════════════════════════════
    _close1on1ContextMenu() {
      const menu = document.getElementById('rh1on1ContextMenu');
      if (menu) menu.style.display = 'none';
      // Remover listeners antigos
      if (this._ctxCleanup) { this._ctxCleanup(); this._ctxCleanup = null; }
    },

    _show1on1ContextMenu(oneOnOneId, x, y) {
      // Fechar menu anterior antes de abrir novo
      this._close1on1ContextMenu();
      const self = this;

      const items = this._oneOnOnesCache || [];
      const oneOnOne = items.find(o => o.id === oneOnOneId);
      if (!oneOnOne) return;

      const isScheduled = oneOnOne.status === 'scheduled' || oneOnOne.status === 'agendada';
      const hasGcalEvent = !!oneOnOne.google_event_id;

      const menuItems = [
        { icon: 'eye', label: 'Ver detalhes', action: 'view_detail' },
        { icon: 'check-circle', label: 'Marcar concluída', action: 'complete', condition: isScheduled },
        { icon: 'calendar-clock', label: 'Reagendar', action: 'reschedule', condition: isScheduled },
        { icon: 'external-link', label: 'Abrir no Google Calendar', action: 'open_gcal', condition: hasGcalEvent },
        { divider: true },
        { icon: 'x-circle', label: 'Cancelar', action: 'cancel', condition: isScheduled },
        { icon: 'trash-2', label: 'Excluir', action: 'delete', danger: true }
      ];

      const filtered = menuItems.filter(item => {
        if (item.divider) return true;
        return item.condition !== false;
      });

      // Remover dividers consecutivos ou no final
      const clean = filtered.filter((item, idx, arr) => {
        if (!item.divider) return true;
        if (idx === arr.length - 1) return false;
        if (idx === 0) return false;
        if (arr[idx - 1]?.divider) return false;
        return true;
      });

      let menu = document.getElementById('rh1on1ContextMenu');
      if (!menu) {
        menu = document.createElement('div');
        menu.id = 'rh1on1ContextMenu';
        menu.className = 'rh-context-menu';
        document.body.appendChild(menu);
      }

      // Remover backdrop legado se existir (v3.0.1 — backdrop bloqueava right-click)
      const oldBackdrop = document.getElementById('rh1on1ContextBackdrop');
      if (oldBackdrop) oldBackdrop.remove();

      const leaderName = S._getPersonNameByUid(oneOnOne.leader_id);
      const collabName = S._getPersonNameByUid(oneOnOne.collaborator_id);

      menu.innerHTML = `
        <div style="padding:8px 14px;border-bottom:1px solid var(--border-subtle);font-size:0.72rem;color:var(--text-muted);font-weight:600;">
          1:1 ${S._esc(leaderName)} ↔ ${S._esc(collabName)}
        </div>
        ${clean.map(item => {
          if (item.divider) return '<div style="height:1px;background:var(--border-subtle);margin:4px 0;"></div>';
          return `<button class="rh-ctx-item${item.danger ? ' rh-ctx-danger' : ''}" data-action="${item.action}" data-1on1="${oneOnOneId}" style="display:flex;align-items:center;gap:10px;width:100%;padding:8px 14px;border:none;background:none;cursor:pointer;font-size:0.8rem;color:${item.danger ? 'var(--color-danger)' : 'var(--text-primary)'};text-align:left;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
            <i data-lucide="${item.icon}" style="width:14px;height:14px;flex-shrink:0;"></i>
            <span>${item.label}</span>
          </button>`;
        }).join('')}
      `;

      // Posicionamento viewport-aware (z-index alto para ficar acima de tudo)
      const menuW = 240, menuH = clean.length * 38 + 44;
      const vw = window.innerWidth, vh = window.innerHeight;
      const posX = x + menuW > vw ? x - menuW : x;
      const posY = y + menuH > vh ? Math.max(8, y - menuH) : y;

      menu.style.cssText = `display:block;position:fixed;top:${posY}px;left:${posX}px;z-index:9999;min-width:${menuW}px;background:#fff;border-radius:8px;border:1px solid #e5e5e5;box-shadow:0 8px 24px rgba(0,0,0,0.18);overflow:hidden;`;
      if (window.lucide) lucide.createIcons({ root: menu });

      // Bind acoes do menu
      menu.querySelectorAll('.rh-ctx-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          self._close1on1ContextMenu();
          self._handle1on1ContextAction(btn.dataset.action, btn.dataset['1on1']);
        });
      });

      // Listeners para fechar ao clicar fora / ESC
      const onClickOutside = (e) => {
        if (!menu.contains(e.target)) self._close1on1ContextMenu();
      };
      const onRightClickOutside = (e) => {
        // Não fechar se clicou numa row (o handler da row vai reabrir com novo menu)
        if (menu.contains(e.target)) return;
        if (e.target.closest('.rh-1on1-row')) return; // deixar o row handler cuidar
        self._close1on1ContextMenu();
      };
      const escHandler = (e) => {
        if (e.key === 'Escape') self._close1on1ContextMenu();
      };

      // Registrar cleanup para remover listeners quando menu fechar
      this._ctxCleanup = () => {
        document.removeEventListener('click', onClickOutside);
        document.removeEventListener('contextmenu', onRightClickOutside);
        document.removeEventListener('keydown', escHandler);
      };

      setTimeout(() => {
        document.addEventListener('click', onClickOutside);
        document.addEventListener('contextmenu', onRightClickOutside);
        document.addEventListener('keydown', escHandler);
      }, 10);
    },

    async _handle1on1ContextAction(action, oneOnOneId) {
      const self = this;
      switch (action) {
        case 'view_detail':
          await self._open1on1Detail(oneOnOneId);
          break;

        case 'complete': {
          try {
            await OneOnOnesRepo.complete(oneOnOneId);
            TBO_TOAST.success('1:1 concluída!');
            self._oneOnOnesCache = null;
            await self._load1on1sFromSupabase();
          } catch (e) { TBO_TOAST.error('Erro ao concluir'); }
          break;
        }

        case 'reschedule': {
          // Fase 1: abrir detail para editar (modal de data pode vir depois)
          await self._open1on1Detail(oneOnOneId);
          break;
        }

        case 'open_gcal': {
          const items = self._oneOnOnesCache || [];
          const o = items.find(i => i.id === oneOnOneId);
          if (o?.google_event_id) {
            window.open(`https://calendar.google.com/calendar/event?eid=${btoa(o.google_event_id + ' ' + (o.collaborator_id || ''))}`, '_blank');
          }
          break;
        }

        case 'cancel': {
          if (!confirm('Cancelar esta 1:1?')) return;
          try {
            const data = await OneOnOnesRepo.getById(oneOnOneId);
            await OneOnOnesRepo.cancel(oneOnOneId);
            if (data?.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
              try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
            }
            TBO_TOAST.info('1:1 cancelada');
            self._oneOnOnesCache = null;
            await self._load1on1sFromSupabase();
          } catch (e) { TBO_TOAST.error('Erro ao cancelar'); }
          break;
        }

        case 'delete': {
          if (!confirm('Excluir esta 1:1 permanentemente? Esta ação não pode ser desfeita.')) return;
          try {
            const data = await OneOnOnesRepo.getById(oneOnOneId);
            if (data?.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
              try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
            }
            await OneOnOnesRepo.remove(oneOnOneId);
            TBO_TOAST.success('1:1 excluída');
            self._oneOnOnesCache = null;
            await self._load1on1sFromSupabase();
          } catch (e) { TBO_TOAST.error('Erro ao excluir'); }
          break;
        }
      }
    },

    // ══════════════════════════════════════════════════════════════════
    // Action Checks (acoes pendentes — checkboxes + delete)
    // ══════════════════════════════════════════════════════════════════
    _bindActionChecks() {
      const self = this;

      document.querySelectorAll('.rh-action-check').forEach(chk => {
        chk.addEventListener('change', async () => {
          const actionId = chk.dataset.id;
          // Tentar Supabase primeiro
          if (typeof OneOnOnesRepo !== 'undefined' && self._oneOnOnesCache !== null) {
            try {
              await OneOnOnesRepo.toggleAction(actionId, chk.checked);
              TBO_TOAST.success('Acao atualizada!');
              return;
            } catch (e) { console.warn('[RH] Erro toggle action Supabase:', e.message); }
          }
          // Fallback localStorage
          const items = S._getStore('1on1s');
          items.forEach(o => { (o.items || []).forEach(a => { if (a.id === actionId) a.concluido = chk.checked; }); });
          S._setStore('1on1s', items);
          TBO_TOAST.success('Acao atualizada!');
        });
      });

      // Delete de acoes pendentes
      document.querySelectorAll('.rh-action-delete').forEach(btn => {
        btn.addEventListener('click', async () => {
          const actionId = btn.dataset.id;
          // Tentar Supabase primeiro
          if (typeof OneOnOnesRepo !== 'undefined' && self._oneOnOnesCache !== null) {
            try {
              await OneOnOnesRepo.removeAction(actionId);
              TBO_TOAST.success('Acao removida');
              self._oneOnOneActionsCache = null;
              await self._load1on1sFromSupabase();
              return;
            } catch (e) { console.warn('[RH] Erro delete action Supabase:', e.message); }
          }
          // Fallback localStorage
          const items = S._getStore('1on1s');
          items.forEach(o => {
            if (o.items) o.items = o.items.filter(a => a.id !== actionId);
          });
          S._setStore('1on1s', items);
          TBO_TOAST.success('Acao removida');
          const tabContent = document.getElementById('rhTabContent');
          if (tabContent) { tabContent.innerHTML = self.render(); self.init(); }
          if (window.lucide) lucide.createIcons();
        });
      });
    },

    // ══════════════════════════════════════════════════════════════════
    // DESTROY
    // ══════════════════════════════════════════════════════════════════
    destroy() {
      this._close1on1ContextMenu();
    }
  };

  TBO_PEOPLE.registerTab('one-on-ones', TabOneOnOnes);
})();
