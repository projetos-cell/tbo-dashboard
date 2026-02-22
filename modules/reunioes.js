// TBO OS — Module: Reunioes & Contexto (PRD v1.2 — Supabase como fonte de verdade)
const TBO_REUNIOES = {
  _meetingsData: null, // Cache local para evitar re-fetch durante render
  _loading: false,

  render() {
    // Usa dados pré-carregados pelo _loadMeetings() ou fallback TBO_STORAGE
    const cached = this._meetingsData;
    const meetings = cached || TBO_STORAGE.get('meetings') || {};
    const meetingsArr = cached ? cached : (meetings.meetings || meetings.reunioes_recentes || []);
    const meta = cached ? {} : (meetings.metadata || meetings._metadata || {});
    const catDist = cached ? this._buildCatDist(meetingsArr) : (meta.category_distribution || meetings.categorias || {});

    // Extract unique participants
    const participantSet = new Set();
    meetingsArr.forEach(r => {
      (r.participants || r.participantes || []).forEach(p => {
        const name = typeof p === 'string' ? p : (p.name || p.email || '');
        if (name) participantSet.add(name);
      });
    });

    // Total action items
    let totalActions = 0;
    meetingsArr.forEach(r => {
      const items = r.action_items || [];
      totalActions += items.length;
    });

    // Total minutes
    let totalMin = 0;
    meetingsArr.forEach(r => {
      totalMin += r.duration_minutes || r.duracao_min || 0;
    });

    // Weekly count — meetings in current week (Mon-Sun)
    const _now = new Date();
    const _dayOfWeek = _now.getDay(); // 0=Sun, 1=Mon...
    const _mondayOffset = _dayOfWeek === 0 ? -6 : 1 - _dayOfWeek;
    const _weekStart = new Date(_now.getFullYear(), _now.getMonth(), _now.getDate() + _mondayOffset);
    const _weekEnd = new Date(_weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = meetingsArr.filter(r => {
      const d = r.date || r.data || '';
      if (!d) return false;
      const dt = new Date(d);
      return dt >= _weekStart && dt < _weekEnd;
    }).length;

    return `
      <div class="reunioes-module">
        <!-- KPIs -->
        <section class="section">
          <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:12px;">
            <div class="kpi-card">
              <div class="kpi-label">Reunioes Registradas</div>
              <div class="kpi-value">${meetingsArr.length}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Esta Semana</div>
              <div class="kpi-value" style="color:var(--accent-gold);">${weeklyCount}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Minutos Totais</div>
              <div class="kpi-value">${Math.round(totalMin)}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Action Items</div>
              <div class="kpi-value">${totalActions}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Categorias</div>
              <div class="kpi-value">${Object.keys(catDist).length}</div>
            </div>
          </div>
        </section>

        <!-- Tabs -->
        <div class="tabs">
          <button class="tab active" data-tab="rn-lista">Lista de Reunioes</button>
          <button class="tab" data-tab="rn-busca">Busca Inteligente</button>
          <button class="tab" data-tab="rn-actions">Action Items</button>
          <button class="tab" data-tab="rn-decisoes">Decisoes & Tarefas</button>
          <button class="tab" data-tab="rn-analise">Analise de Relacionamento</button>
        </div>

        <!-- Meetings List -->
        <div class="tab-panel" id="tab-rn-lista">
          <div style="display:flex; gap:12px; margin-bottom:16px; flex-wrap:wrap;">
            <div class="form-group" style="flex:1; min-width:200px; margin:0;">
              <input type="text" class="form-input" id="rnFilter" placeholder="Filtrar por titulo ou categoria...">
            </div>
            <div class="form-group" style="min-width:150px; margin:0;">
              <select class="form-input" id="rnCatFilter">
                <option value="">Todas categorias</option>
                ${Object.keys(catDist).map(cat => `<option value="${cat}">${cat} (${catDist[cat]})</option>`).join('')}
              </select>
            </div>
          </div>
          <div id="rnMeetingList">
            ${meetingsArr.length > 0 ? meetingsArr.map(r => {
              const title = r.title || r.titulo || '';
              const date = r.date || r.data || '';
              const category = r.category || r.categoria || '';
              const duration = r.duration_minutes || r.duracao_min || 0;
              const summary = r.summary || r.resumo || '';
              const actionItems = r.action_items || [];
              const dateFormatted = date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
              const source = r._source || 'manual';
              const sourceBadge = source === 'google_calendar'
                ? '<span style="font-size:0.65rem;padding:1px 6px;border-radius:4px;background:#4285f4;color:#fff;margin-left:6px;">Google Calendar</span>'
                : source === 'fireflies'
                ? '<span style="font-size:0.65rem;padding:1px 6px;border-radius:4px;background:#a855f7;color:#fff;margin-left:6px;">Fireflies</span>'
                : source === 'supabase'
                ? '<span style="font-size:0.65rem;padding:1px 6px;border-radius:4px;background:#22c55e;color:#fff;margin-left:6px;">Supabase</span>'
                : '<span style="font-size:0.65rem;padding:1px 6px;border-radius:4px;background:#94a3b8;color:#fff;margin-left:6px;">Manual</span>';
              return `
              <div class="card rn-meeting-card" style="margin-bottom:8px; padding:14px;" data-title="${title.toLowerCase()}" data-cat="${category.toLowerCase()}">
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                  <div style="flex:1;">
                    <div style="font-weight:600; font-size:0.9rem;">${title}${sourceBadge}</div>
                    <div style="font-size:0.75rem; color:var(--text-tertiary); margin-top:2px;">
                      ${dateFormatted} &bull; <span class="tag" style="font-size:0.7rem; padding:1px 6px;">${category}</span> &bull; ${Math.round(duration)} min
                    </div>
                    ${summary ? `<div style="font-size:0.82rem; color:var(--text-secondary); margin-top:6px;">${TBO_FORMATTER.truncate(summary, 180)}</div>` : ''}
                    ${actionItems.length > 0 ? `
                      <div style="margin-top:8px; display:flex; gap:4px; flex-wrap:wrap;">
                        ${actionItems.slice(0, 4).map(ai => {
                          const task = typeof ai === 'string' ? ai : (ai.task || ai.tarefa || '');
                          const person = typeof ai === 'object' ? (ai.person || ai.responsavel || '') : '';
                          return `<span class="tag">${person ? person + ': ' : ''}${TBO_FORMATTER.truncate(task, 35)}</span>`;
                        }).join('')}
                        ${actionItems.length > 4 ? `<span class="tag" style="opacity:0.6;">+${actionItems.length - 4}</span>` : ''}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>`;
            }).join('') : '<div class="empty-state"><div class="empty-state-text">Nenhuma reuniao registrada. Verifique a conexao com Fireflies.</div></div>'}
          </div>
        </div>

        <!-- Smart Search -->
        <div class="tab-panel" id="tab-rn-busca" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Busca Inteligente em Reunioes</h3></div>
            <p style="color:var(--text-secondary); font-size:0.82rem; margin-bottom:16px;">
              Busque informacoes especificas nas transcricoes de reunioes.
            </p>
            <div class="form-group">
              <label class="form-label">O que voce quer saber?</label>
              <textarea class="form-input" id="rnBusca" rows="3" placeholder="Ex: O que foi decidido sobre o praco do projeto Porto Batel? Quais as objecoes da Construtora Pessoa?"></textarea>
            </div>
            <button class="btn btn-primary" id="rnGerarBusca" style="width:100%;">Buscar nas Reunioes</button>
          </div>
          <div id="rnBuscaOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>

        <!-- Action Items -->
        <div class="tab-panel" id="tab-rn-actions" style="display:none;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title">Action Items Consolidados</h3>
              <button class="btn btn-sm btn-secondary" id="rnGerarActions">Consolidar com IA</button>
            </div>
            <div id="rnActionsOutput">
              ${this._renderActionItems(meetingsArr)}
            </div>
          </div>
        </div>

        <!-- Decisoes & Tarefas Pipeline -->
        <div class="tab-panel" id="tab-rn-decisoes" style="display:none;">
          ${this._renderDecisionsTab(meetingsArr)}
        </div>

        <!-- Relationship Analysis -->
        <div class="tab-panel" id="tab-rn-analise" style="display:none;">
          <div class="card">
            <div class="card-header"><h3 class="card-title">Analise de Relacionamento</h3></div>
            <div class="form-group">
              <label class="form-label">Cliente / Empresa</label>
              <input type="text" class="form-input" id="rnAnaliseCliente" placeholder="Nome do cliente ou empresa">
            </div>
            <button class="btn btn-primary" id="rnGerarAnalise" style="width:100%;">Analisar Relacionamento</button>
          </div>
          <div id="rnAnaliseOutput" class="ai-response" style="min-height:200px; margin-top:16px;">
            <div class="empty-state"><div class="empty-state-text">Resultado aparecera aqui</div></div>
          </div>
        </div>
      </div>
    `;
  },

  _renderActionItems(meetingsArr) {
    const allActions = [];
    meetingsArr.forEach(r => {
      const title = r.title || r.titulo || '';
      const date = r.date || r.data || '';
      const dateFormatted = date ? new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
      (r.action_items || []).forEach(ai => {
        const task = typeof ai === 'string' ? ai : (ai.task || ai.tarefa || '');
        const person = typeof ai === 'object' ? (ai.person || ai.responsavel || '') : '';
        allActions.push({ task, person, meeting: title, date: dateFormatted });
      });
    });

    if (allActions.length === 0) {
      return '<div class="empty-state"><div class="empty-state-text">Nenhum action item encontrado</div></div>';
    }

    // Group by person
    const byPerson = {};
    allActions.forEach(a => {
      const key = a.person || 'Sem responsavel';
      if (!byPerson[key]) byPerson[key] = [];
      byPerson[key].push(a);
    });

    let html = '';
    Object.entries(byPerson).sort((a, b) => b[1].length - a[1].length).forEach(([person, items]) => {
      html += `<div style="margin-bottom:16px;">
        <div style="font-weight:600; font-size:0.85rem; color:var(--accent-gold); margin-bottom:6px;">${person} <span style="color:var(--text-tertiary); font-weight:400;">(${items.length})</span></div>`;
      items.forEach(a => {
        html += `<div class="alert-item info" style="margin-bottom:4px;">
          <span class="alert-icon">\u2705</span>
          <div class="alert-content">
            <div class="alert-title" style="font-size:0.82rem;">${a.task}</div>
            <div class="alert-message">${a.meeting} — ${a.date}</div>
          </div>
        </div>`;
      });
      html += '</div>';
    });
    return html;
  },

  async init() {
    // PRD v1.2 — Carregar reuniões do Supabase e re-renderizar se necessário
    if (!this._meetingsData) {
      await this._loadMeetings();
      if (this._meetingsData) {
        // Re-render com dados do Supabase (substitui fallback TBO_STORAGE)
        const container = document.getElementById('main-content');
        if (container) {
          container.innerHTML = this.render();
          if (window.lucide) lucide.createIcons();
        }
      }
    }

    // Vincular eventos de UI
    this._initEventBindings();
  },

  /**
   * Vincula eventos de UI (tabs, filtros, botões).
   * Extraído do init() para permitir re-bind após re-render com dados do Supabase.
   */
  _initEventBindings() {
    // Tab switching with breadcrumb + deep link
    document.querySelectorAll('.tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        document.querySelectorAll('.tab-panel').forEach(p => p.style.display = 'none');
        const panel = document.getElementById(`tab-${tab.dataset.tab}`);
        if (panel) panel.style.display = 'block';
        if (typeof TBO_UX !== 'undefined') {
          TBO_UX.updateBreadcrumb('reunioes', tab.textContent.trim());
          TBO_UX.setTabHash('reunioes', tab.dataset.tab);
        }
      });
    });

    // Text filter
    const filter = document.getElementById('rnFilter');
    if (filter) {
      filter.addEventListener('input', () => this._applyFilters());
    }

    // Category filter
    const catFilter = document.getElementById('rnCatFilter');
    if (catFilter) {
      catFilter.addEventListener('change', () => this._applyFilters());
    }

    this._bind('rnGerarBusca', () => this._searchMeetings());
    this._bind('rnGerarActions', () => this._consolidateActions());
    this._bind('rnGerarAnalise', () => this._analyzeRelationship());
  },

  _applyFilters() {
    const q = (document.getElementById('rnFilter')?.value || '').toLowerCase();
    const cat = (document.getElementById('rnCatFilter')?.value || '').toLowerCase();
    document.querySelectorAll('.rn-meeting-card').forEach(card => {
      const title = card.dataset.title || '';
      const cardCat = card.dataset.cat || '';
      const matchText = !q || title.includes(q) || cardCat.includes(q);
      const matchCat = !cat || cardCat === cat;
      card.style.display = (matchText && matchCat) ? '' : 'none';
    });
  },

  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  async _searchMeetings() {
    const query = document.getElementById('rnBusca')?.value || '';
    if (!query) { TBO_TOAST.warning('Escreva sua pergunta'); return; }
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const out = document.getElementById('rnBuscaOutput');
    const btn = document.getElementById('rnGerarBusca');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Buscando nas reunioes...');
      TBO_UX.btnLoading(btn, true, 'Buscando...');
    } else if (out) { out.textContent = 'Buscando...'; }

    try {
      const meetingsArr = this._getMeetingsArr();
      const ctx = JSON.stringify(meetingsArr);
      const result = await TBO_API.callWithContext('reunioes', query, ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._searchMeetings());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  async _consolidateActions() {
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }
    const out = document.getElementById('rnActionsOutput');
    const btn = document.getElementById('rnGerarActions');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Consolidando action items...');
      TBO_UX.btnLoading(btn, true, 'Consolidando...');
    } else if (out) { out.textContent = 'Consolidando...'; }

    try {
      const meetingsArr = this._getMeetingsArr();
      const ctx = JSON.stringify(meetingsArr);
      const result = await TBO_API.callWithContext('reunioes',
        'Consolide TODOS os action items de todas as reunioes. Organize por projeto/cliente. Identifique itens vencidos, pendentes e concluidos. Destaque os mais urgentes.', ctx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._consolidateActions());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  async _analyzeRelationship() {
    const cliente = document.getElementById('rnAnaliseCliente')?.value || '';
    if (!cliente) { TBO_TOAST.warning('Informe o cliente'); return; }
    if (!TBO_API.isConfigured()) { TBO_TOAST.warning('API nao configurada'); return; }

    const out = document.getElementById('rnAnaliseOutput');
    const btn = document.getElementById('rnGerarAnalise');
    if (typeof TBO_UX !== 'undefined') {
      TBO_UX.showLoading(out, 'Analisando relacionamento...');
      TBO_UX.btnLoading(btn, true, 'Analisando...');
    } else if (out) { out.textContent = 'Analisando...'; }

    try {
      const ctx = TBO_STORAGE.getClientContext(cliente);
      const meetingsArr = this._getMeetingsArr();
      const meetingCtx = JSON.stringify(meetingsArr.filter(r => {
        const title = (r.title || r.titulo || '').toLowerCase();
        const summary = (r.summary || r.resumo || '').toLowerCase();
        return title.includes(cliente.toLowerCase()) || summary.includes(cliente.toLowerCase());
      }));
      const result = await TBO_API.callWithContext('reunioes',
        `Analise o relacionamento da TBO com "${cliente}". Construa uma timeline de interacoes, identifique padroes, sentimentos, oportunidades e riscos.`, ctx + '\n' + meetingCtx);
      if (out) out.innerHTML = TBO_FORMATTER.markdownToHtml(result.text);
    } catch (e) {
      if (typeof TBO_UX !== 'undefined') {
        TBO_UX.showError(out, e.message, () => this._analyzeRelationship());
      } else if (out) { out.textContent = 'Erro: ' + e.message; }
    } finally {
      if (typeof TBO_UX !== 'undefined') TBO_UX.btnLoading(btn, false);
    }
  },

  // ===========================================================================
  // DECISOES & TAREFAS — Meeting → Decision → Task pipeline
  // ===========================================================================

  _renderDecisionsTab(meetingsArr) {
    const decisions = TBO_STORAGE.getAllErpEntities('decision');
    const tasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.source === 'decision');
    const pendingTasks = tasks.filter(t => t.status !== 'concluida' && t.status !== 'cancelada');

    // Action items from meetings that could become decisions
    const recentActions = [];
    meetingsArr.slice(0, 10).forEach(r => {
      const title = r.title || r.titulo || '';
      const date = r.date || r.data || '';
      (r.action_items || []).forEach(ai => {
        const task = typeof ai === 'string' ? ai : (ai.task || ai.tarefa || '');
        const person = typeof ai === 'object' ? (ai.person || ai.responsavel || '') : '';
        if (task) recentActions.push({ task, person, meeting: title, date });
      });
    });

    return `
      <div class="grid-3" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Decisoes Registradas</div><div class="kpi-value">${decisions.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Tarefas de Decisoes</div><div class="kpi-value">${tasks.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Tarefas Pendentes</div><div class="kpi-value" style="color:${pendingTasks.length > 0 ? '#f59e0b' : '#22c55e'};">${pendingTasks.length}</div></div>
      </div>

      <!-- Quick Create from Action Items -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <h3 class="card-title">Action Items Recentes (converter em tarefas)</h3>
        </div>
        <div style="max-height:250px;overflow-y:auto;">
          ${recentActions.length === 0 ? '<div style="font-size:0.82rem;color:var(--text-muted);padding:8px;">Nenhum action item encontrado</div>' : ''}
          ${recentActions.slice(0, 15).map((a, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:0.82rem;">
              <div style="flex:1;">
                <span style="font-weight:500;">${a.task}</span>
                <span style="color:var(--text-muted);font-size:0.72rem;"> | ${a.person || 'Sem responsavel'} | ${a.meeting}</span>
              </div>
              <button class="btn btn-secondary" style="font-size:0.65rem;padding:2px 8px;flex-shrink:0;" onclick="TBO_REUNIOES._quickCreateTask(${JSON.stringify(a).replace(/"/g, '&quot;')})">Criar Tarefa</button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Manual Decision Creation -->
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h3 style="font-size:0.95rem;font-weight:700;">Decisoes Registradas</h3>
        <button class="btn btn-primary" style="font-size:0.78rem;" onclick="TBO_REUNIOES._showDecisionModal(null)">+ Nova Decisao</button>
      </div>
      <div id="rnDecisionsList">
        ${decisions.length === 0 ? '<div class="empty-state"><div class="empty-state-text">Nenhuma decisao registrada. Registre decisoes para criar tarefas automaticamente.</div></div>' : ''}
        ${decisions.map(d => {
          const linkedTasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.decision_id === d.id);
          const doneTasks = linkedTasks.filter(t => t.status === 'concluida').length;
          return `<div class="card" style="margin-bottom:6px;padding:14px;cursor:pointer;" onclick="TBO_REUNIOES._showDecisionModal('${d.id}')">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div style="flex:1;">
                <div style="font-weight:600;font-size:0.85rem;">${d.title}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">
                  ${d.description ? TBO_FORMATTER.truncate(d.description, 120) + ' | ' : ''}${linkedTasks.length > 0 ? doneTasks + '/' + linkedTasks.length + ' tarefas' : 'Sem tarefas'}
                  | ${typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.relativeTime(d.createdAt) : ''}
                </div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  _quickCreateTask(actionItem) {
    const owner = actionItem.person || '';
    const title = actionItem.task || '';
    if (!title) return;

    // Find matching project
    const projects = TBO_STORAGE.getAllErpEntities('project');
    const matchProject = projects.find(p =>
      actionItem.meeting && actionItem.meeting.toLowerCase().includes((p.client || '').toLowerCase())
    );

    TBO_STORAGE.addErpEntity('task', {
      title,
      owner,
      status: 'pendente',
      priority: 'media',
      project_id: matchProject ? matchProject.id : null,
      project_name: matchProject ? matchProject.name : '',
      source: 'meeting_action_item',
      meeting_title: actionItem.meeting || '',
      meeting_date: actionItem.date || ''
    });

    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'task', entityId: 'new',
        action: 'created', userId: TBO_ERP._getCurrentUserId(),
        reason: `De action item: ${actionItem.meeting}`,
        entityName: title
      });
    }
    TBO_TOAST.success('Tarefa criada: ' + TBO_FORMATTER.truncate(title, 40));
  },

  _showDecisionModal(decisionId) {
    const existing = decisionId ? TBO_STORAGE.getErpEntity('decision', decisionId) : null;
    const isNew = !existing;
    const projects = TBO_STORAGE.getAllErpEntities('project').filter(p => !['finalizado','cancelado'].includes(p.status));
    const team = typeof TBO_COMERCIAL !== 'undefined' ? TBO_COMERCIAL._getTeamMembers() : ['Marco','Ruy','Nathalia','Nelson','Danniel'];

    // Linked tasks for existing
    let tasksHtml = '';
    if (existing) {
      const linkedTasks = TBO_STORAGE.getAllErpEntities('task').filter(t => t.decision_id === existing.id);
      const taskSm = typeof TBO_ERP !== 'undefined' ? TBO_ERP.stateMachines.task : null;
      tasksHtml = `
        <div style="border-top:1px solid var(--border-subtle);padding-top:12px;margin-top:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <h4 style="font-size:0.85rem;font-weight:700;">Tarefas desta decisao (${linkedTasks.length})</h4>
            <button class="btn btn-secondary" style="font-size:0.68rem;padding:3px 8px;" onclick="TBO_REUNIOES._addTaskFromDecision('${existing.id}')">+ Tarefa</button>
          </div>
          ${linkedTasks.map(t => {
            const tc = taskSm ? taskSm.colors[t.status] || '#94a3b8' : '#94a3b8';
            return `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;font-size:0.78rem;">
              <input type="checkbox" ${t.status === 'concluida' ? 'checked' : ''} onchange="TBO_REUNIOES._toggleDecisionTask('${t.id}', this.checked)">
              <span style="flex:1;">${t.title}</span>
              <span style="font-size:0.65rem;color:${tc};">${taskSm ? taskSm.labels[t.status] : t.status}</span>
              <span style="font-size:0.65rem;color:var(--text-muted);">${t.owner || ''}</span>
            </div>`;
          }).join('')}
        </div>
      `;
    }

    const d = existing || {};
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.innerHTML = `
      <div class="modal modal--lg active" style="max-width:600px;">
        <div class="modal-header">
          <h3 class="modal-title">${isNew ? 'Nova Decisao' : d.title}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
        </div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
          <div class="form-group">
            <label class="form-label">Titulo da Decisao*</label>
            <input type="text" class="form-input" id="rnDecTitle" value="${d.title || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Descricao</label>
            <textarea class="form-input" id="rnDecDesc" rows="3">${d.description || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Projeto Vinculado</label>
            <select class="form-input" id="rnDecProject">
              <option value="">Nenhum</option>
              ${projects.map(p => `<option value="${p.id}" ${d.project_id === p.id ? 'selected' : ''}>${p.name} (${p.client})</option>`).join('')}
            </select>
          </div>
          ${tasksHtml}
        </div>
        <div class="modal-footer" style="display:flex;justify-content:${isNew ? 'flex-end' : 'space-between'};">
          ${!isNew ? `<button class="btn btn-secondary" style="color:#ef4444;" onclick="TBO_REUNIOES._deleteDecision('${d.id}')">Excluir</button>` : ''}
          <div style="display:flex;gap:8px;">
            <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancelar</button>
            <button class="btn btn-primary" onclick="TBO_REUNIOES._saveDecision('${d.id || ''}')">${isNew ? 'Criar' : 'Salvar'}</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  },

  _saveDecision(existingId) {
    const title = document.getElementById('rnDecTitle')?.value?.trim();
    if (!title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }
    const data = {
      title,
      description: document.getElementById('rnDecDesc')?.value?.trim() || '',
      project_id: document.getElementById('rnDecProject')?.value || null
    };

    if (existingId) {
      TBO_STORAGE.updateErpEntity('decision', existingId, data);
      TBO_TOAST.success('Decisao atualizada');
    } else {
      data.status = 'decidida';
      data.tasks_created = [];
      const newD = TBO_STORAGE.addErpEntity('decision', data);
      if (typeof TBO_ERP !== 'undefined') TBO_ERP.addAuditLog({
        entityType: 'decision', entityId: newD.id,
        action: 'created', userId: TBO_ERP._getCurrentUserId(),
        entityName: title
      });
      TBO_TOAST.success('Decisao registrada');
    }
    document.querySelector('.modal-overlay')?.remove();
  },

  _deleteDecision(id) {
    if (!confirm('Excluir esta decisao?')) return;
    TBO_STORAGE.deleteErpEntity('decision', id);
    TBO_TOAST.success('Decisao excluida');
    document.querySelector('.modal-overlay')?.remove();
  },

  _addTaskFromDecision(decisionId) {
    if (typeof TBO_ERP === 'undefined') return;
    const title = prompt('Nome da tarefa:');
    if (!title) return;
    const owner = prompt('Responsavel:', '');
    const dueDate = prompt('Prazo (YYYY-MM-DD):', '');
    const result = TBO_ERP.createTaskFromDecision(decisionId, {
      title,
      owner: owner || '',
      due_date: dueDate || null,
      priority: 'media'
    });
    if (result.ok) {
      TBO_TOAST.success('Tarefa criada');
      document.querySelector('.modal-overlay')?.remove();
    } else {
      TBO_TOAST.error(result.error);
    }
  },

  _toggleDecisionTask(taskId, completed) {
    if (typeof TBO_ERP === 'undefined') return;
    TBO_ERP.transition('task', taskId, completed ? 'concluida' : 'pendente');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PRD v1.2 — Carregamento de dados do Supabase
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Carrega reuniões do Supabase (MeetingsRepo) com fallback TBO_STORAGE/Fireflies.
   * Chamado pelo módulo antes do render para garantir dados atualizados.
   */
  async _loadMeetings() {
    if (this._loading) return;
    this._loading = true;

    try {
      let baseMeetings = null;

      // Prioridade 1: MeetingsRepo (Supabase — fonte de verdade)
      if (typeof MeetingsRepo !== 'undefined') {
        const dbMeetings = await MeetingsRepo.list({ limit: 200 });
        if (dbMeetings && dbMeetings.length > 0) {
          baseMeetings = dbMeetings.map(m => ({ ...m, _source: m._source || 'supabase' }));
        }
      }

      // Prioridade 2: TBO_FIREFLIES.loadFromDb()
      if (!baseMeetings && typeof TBO_FIREFLIES !== 'undefined' && TBO_FIREFLIES.isEnabled()) {
        const fMeetings = await TBO_FIREFLIES.loadFromDb();
        if (fMeetings && fMeetings.length > 0) {
          baseMeetings = fMeetings.map(m => ({ ...m, _source: m._source || 'fireflies' }));
        }
      }

      // Merge Google Calendar events (se disponivel)
      const gcalEvents = this._getGoogleCalendarMeetings();
      if (gcalEvents.length > 0) {
        baseMeetings = (baseMeetings || []).concat(gcalEvents);
        // Ordenar por data desc (mais recentes primeiro)
        baseMeetings.sort((a, b) => {
          const da = a.date || a.data || a.startAt || '';
          const db = b.date || b.data || b.startAt || '';
          return db.localeCompare(da);
        });
      }

      this._meetingsData = baseMeetings || null; // null = render() usará TBO_STORAGE
    } catch (e) {
      console.warn('[TBO Reuniões] _loadMeetings falhou:', e.message);
      this._meetingsData = null;
    } finally {
      this._loading = false;
    }
  },

  /**
   * Converte eventos do Google Calendar para o formato de reuniao do TBO.
   * Filtra apenas eventos confirmados com 2+ participantes (reunioes reais).
   */
  _getGoogleCalendarMeetings() {
    if (typeof TBO_GOOGLE_CALENDAR === 'undefined' || !TBO_GOOGLE_CALENDAR.isEnabled()) return [];
    try {
      const events = TBO_GOOGLE_CALENDAR.getEvents();
      if (!events || events.length === 0) return [];

      return events
        .filter(e => e.status !== 'cancelled')
        .map(e => ({
          title: e.title || '(sem titulo)',
          date: e.startAt || '',
          data: e.startAt || '',
          category: 'Google Calendar',
          categoria: 'Google Calendar',
          duration_minutes: this._calcDurationMin(e.startAt, e.endAt),
          summary: e.description || '',
          resumo: e.description || '',
          participants: (e.attendees || []).map(a => ({ name: a.name || a.email, email: a.email })),
          participantes: (e.attendees || []).map(a => ({ name: a.name || a.email, email: a.email })),
          action_items: [],
          _source: 'google_calendar',
          _googleEventId: e.googleEventId || '',
          _htmlLink: e.htmlLink || ''
        }));
    } catch (e) {
      console.warn('[TBO Reuniões] Google Calendar merge falhou:', e.message);
      return [];
    }
  },

  /**
   * Calcula duracao em minutos entre dois ISO datetimes.
   */
  _calcDurationMin(start, end) {
    if (!start || !end) return 0;
    try {
      return Math.round((new Date(end) - new Date(start)) / 60000);
    } catch { return 0; }
  },

  /**
   * Constrói distribuição de categorias a partir de array de reuniões
   */
  _buildCatDist(meetingsArr) {
    const dist = {};
    for (const m of meetingsArr) {
      const cat = m.category || m.categoria || 'geral';
      dist[cat] = (dist[cat] || 0) + 1;
    }
    return dist;
  },

  /**
   * Retorna meetingsArr normalizado (compatível com tanto DB quanto TBO_STORAGE)
   */
  _getMeetingsArr() {
    if (this._meetingsData && Array.isArray(this._meetingsData)) {
      return this._meetingsData;
    }
    const meetings = TBO_STORAGE.get('meetings') || {};
    return meetings.meetings || meetings.reunioes_recentes || [];
  }
};
