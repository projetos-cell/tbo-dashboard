// TBO OS — Module: Project Detail (Asana-style project page)
// Route: #projeto/{id}
const TBO_PROJECT_DETAIL = {

  _project: null,
  _demands: [],
  _params: null,
  _loaded: false,

  // Section grouping for demands (by status category)
  _SECTIONS: [
    { key: 'planejamento', label: 'Planejamento', icon: 'clipboard-list', statuses: ['A fazer', 'Backlog', 'Planejamento'] },
    { key: 'execucao',     label: 'Execução',     icon: 'play-circle',    statuses: ['Em andamento', 'Em Andamento', 'In Progress'] },
    { key: 'revisao',      label: 'Revisão',       icon: 'eye',           statuses: ['Em revisão', 'Em Revisão', 'Revisão', 'Review'] },
    { key: 'finalizado',   label: 'Finalização',   icon: 'check-circle-2', statuses: ['Concluído', 'Concluido', 'Finalizado', 'Done', 'Cancelado'] },
  ],

  // Status config (reuse from quadro-projetos)
  _STATUS: {
    em_andamento: { label: 'Em Andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'play-circle' },
    producao:     { label: 'Em Produção',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'zap' },
    finalizado:   { label: 'Finalizado',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: 'check-circle-2' },
    parado:       { label: 'Parado',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: 'pause-circle' },
    pausado:      { label: 'Pausado',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'clock' },
  },

  _BU_COLORS: {
    'Branding':    { bg: '#fef3c7', color: '#92400e' },
    'Digital 3D':  { bg: '#ede9fe', color: '#5b21b6' },
    'Marketing':   { bg: '#d1fae5', color: '#065f46' },
    'Audiovisual': { bg: '#fce7f3', color: '#9d174d' },
    'Interiores':  { bg: '#e0f2fe', color: '#0c4a6e' },
  },

  _DEMAND_STATUS_COLORS: {
    'A fazer':        { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Backlog':        { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Planejamento':   { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' },
    'Em andamento':   { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'Em Andamento':   { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'In Progress':    { color: '#3b82f6', bg: 'rgba(59,130,246,0.10)' },
    'Em revisão':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Em Revisão':     { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Revisão':        { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Review':         { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)' },
    'Concluído':      { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Concluido':      { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Finalizado':     { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Done':           { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
    'Cancelado':      { color: '#9ca3af', bg: 'rgba(156,163,175,0.10)' },
  },

  setParams(params) {
    this._params = params;
  },

  render() {
    this._loaded = false;
    setTimeout(() => this._load(), 0);
    return `
      <div class="pd-module" id="projectDetail">
        ${this._renderSkeleton()}
      </div>
    `;
  },

  _renderSkeleton() {
    return `
      <div class="pd-skeleton">
        <div class="pd-skeleton-header">
          <div class="skeleton" style="width:120px;height:14px;border-radius:4px;"></div>
          <div class="skeleton" style="width:260px;height:28px;border-radius:6px;margin-top:8px;"></div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <div class="skeleton" style="width:80px;height:24px;border-radius:12px;"></div>
            <div class="skeleton" style="width:100px;height:24px;border-radius:12px;"></div>
          </div>
        </div>
        <div class="pd-skeleton-body">
          <div class="skeleton" style="width:100%;height:48px;border-radius:8px;"></div>
          <div class="skeleton" style="width:100%;height:48px;border-radius:8px;"></div>
          <div class="skeleton" style="width:100%;height:48px;border-radius:8px;"></div>
        </div>
      </div>
    `;
  },

  async _load() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) {
      this._renderError('Supabase não disponível');
      return;
    }

    const projectId = this._params?.id;
    if (!projectId) {
      this._renderError('ID do projeto não informado');
      return;
    }

    let tid = null;
    try {
      if (typeof RepoBase !== 'undefined' && RepoBase.resolveTenantId) {
        tid = await RepoBase.resolveTenantId();
      } else if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getCurrentTenantId) {
        tid = TBO_SUPABASE.getCurrentTenantId();
      }
    } catch (_e) {}

    try {
      // Fetch project
      let pq = client.from('projects')
        .select('id,name,status,construtora,bus,owner_name,due_date_start,due_date_end,notion_url,code,notion_page_id,tenant_id,notes,client,client_company')
        .eq('id', projectId)
        .single();
      const projRes = await pq;
      if (projRes.error) throw projRes.error;
      this._project = projRes.data;

      // Fetch demands
      let dq = client.from('demands')
        .select('id,title,status,due_date,due_date_end,responsible,bus,project_id,notion_url,prioridade,info,formalizacao,tipo_midia,subitem,item_principal,feito,milestones')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true, nullsFirst: false });
      if (tid) dq = dq.eq('tenant_id', tid);
      const demRes = await dq;
      this._demands = demRes.error ? [] : (demRes.data || []);

      this._loaded = true;
      this._breadcrumbLabel = this._project.name;
      this._projectName = this._project.name;

      const el = document.getElementById('projectDetail');
      if (!el) return;
      el.innerHTML = this._renderPage();
      this._bindEvents();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error('[TBO PD] Load error:', err);
      this._renderError(err.message || 'Erro ao carregar projeto');
    }
  },

  _renderPage() {
    const p = this._project;
    if (!p) return '';
    const info = this._statusInfo(p.status);
    const bus = this._parseBus(p.bus);
    const totalDemands = this._demands.length;
    const doneDemands = this._demands.filter(d => d.status === 'Concluído' || d.status === 'Concluido' || d.status === 'Done' || d.feito).length;
    const progressPct = totalDemands > 0 ? Math.round((doneDemands / totalDemands) * 100) : 0;

    return `
      <!-- Back button + breadcrumb -->
      <div class="pd-topbar">
        <button class="pd-back-btn" onclick="TBO_ROUTER.navigate('quadro-projetos')">
          <i data-lucide="arrow-left" style="width:16px;height:16px;"></i>
          <span>Quadro de Projetos</span>
        </button>
      </div>

      <!-- Header -->
      <div class="pd-header">
        <div class="pd-header-main">
          <div class="pd-header-top">
            <span class="pd-status-pill" style="background:${info.bg};color:${info.color};">
              <i data-lucide="${info.icon}" style="width:13px;height:13px;"></i>
              ${info.label}
            </span>
            ${p.code ? `<span class="pd-code">${this._esc(p.code)}</span>` : ''}
          </div>
          <h1 class="pd-title">${this._esc(p.name)}</h1>
          <div class="pd-header-meta">
            ${p.construtora ? `
              <div class="pd-meta-item">
                <i data-lucide="building-2" style="width:13px;height:13px;"></i>
                <span>${this._esc(p.construtora)}</span>
              </div>
            ` : ''}
            ${p.owner_name ? `
              <div class="pd-meta-item">
                <i data-lucide="user" style="width:13px;height:13px;"></i>
                <span>${this._esc(p.owner_name)}</span>
              </div>
            ` : ''}
            ${(p.due_date_start || p.due_date_end) ? `
              <div class="pd-meta-item">
                <i data-lucide="calendar" style="width:13px;height:13px;"></i>
                <span>${p.due_date_start ? this._fmtDate(p.due_date_start) : '?'} → ${p.due_date_end ? this._fmtDate(p.due_date_end) : '?'}</span>
              </div>
            ` : ''}
            ${bus.length > 0 ? `
              <div class="pd-meta-item pd-meta-bus">
                ${bus.map(b => {
                  const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' };
                  return `<span class="pd-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`;
                }).join('')}
              </div>
            ` : ''}
            ${p.notion_url ? `
              <a href="${p.notion_url}" target="_blank" class="pd-meta-item pd-notion-link" onclick="event.stopPropagation()">
                <i data-lucide="external-link" style="width:13px;height:13px;"></i>
                <span>Notion</span>
              </a>
            ` : ''}
          </div>
        </div>
        <div class="pd-header-stats">
          <div class="pd-progress-ring">
            <svg viewBox="0 0 36 36" class="pd-ring-svg">
              <path class="pd-ring-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
              <path class="pd-ring-fill" stroke="${info.color}" stroke-dasharray="${progressPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
            </svg>
            <div class="pd-ring-text">${progressPct}%</div>
          </div>
          <div class="pd-stats-text">
            <span class="pd-stats-done">${doneDemands}/${totalDemands}</span>
            <span class="pd-stats-label">concluídas</span>
          </div>
        </div>
      </div>

      ${p.notes ? `
        <div class="pd-description">
          <div class="pd-description-label">
            <i data-lucide="file-text" style="width:14px;height:14px;"></i>
            Descrição
          </div>
          <div class="pd-description-text">${this._esc(p.notes)}</div>
        </div>
      ` : ''}

      <!-- Tasks section -->
      <div class="pd-tasks">
        <div class="pd-tasks-header">
          <div class="pd-tasks-title">
            <i data-lucide="list-checks" style="width:16px;height:16px;"></i>
            Tarefas
            <span class="pd-tasks-count">${totalDemands}</span>
          </div>
        </div>

        <!-- Task table header -->
        <div class="pd-table-header">
          <div class="pd-th pd-th-name">Nome da tarefa</div>
          <div class="pd-th pd-th-responsible">Responsável</div>
          <div class="pd-th pd-th-date">Data</div>
          <div class="pd-th pd-th-priority">Prioridade</div>
          <div class="pd-th pd-th-status">Status</div>
        </div>

        <!-- Sections -->
        ${this._renderSections()}
      </div>
    `;
  },

  _renderSections() {
    const demands = this._demands;
    const assigned = new Set();
    let html = '';

    for (const section of this._SECTIONS) {
      const sectionDemands = demands.filter(d => {
        if (assigned.has(d.id)) return false;
        const match = section.statuses.some(s => (d.status || '').toLowerCase() === s.toLowerCase());
        if (match) assigned.add(d.id);
        return match;
      });

      html += this._renderSection(section, sectionDemands);
    }

    // Remaining unassigned demands (catch-all)
    const remaining = demands.filter(d => !assigned.has(d.id));
    if (remaining.length > 0) {
      html += this._renderSection(
        { key: 'outros', label: 'Outros', icon: 'circle', statuses: [] },
        remaining
      );
    }

    if (demands.length === 0) {
      html += `
        <div class="pd-empty-tasks">
          <i data-lucide="clipboard" style="width:24px;height:24px;opacity:0.3;"></i>
          <p>Nenhuma tarefa registrada para este projeto.</p>
        </div>
      `;
    }

    return html;
  },

  _renderSection(section, demands) {
    const isCollapsed = false;
    return `
      <div class="pd-section" data-section="${section.key}">
        <button class="pd-section-toggle" data-toggle="${section.key}">
          <i data-lucide="chevron-down" class="pd-section-chevron" style="width:14px;height:14px;"></i>
          <i data-lucide="${section.icon}" style="width:14px;height:14px;opacity:0.6;"></i>
          <span class="pd-section-label">${section.label}</span>
          <span class="pd-section-count">${demands.length}</span>
        </button>
        <div class="pd-section-body">
          ${demands.map(d => this._renderTaskRow(d)).join('')}
        </div>
      </div>
    `;
  },

  _renderTaskRow(d) {
    const statusColors = this._DEMAND_STATUS_COLORS[d.status] || { color: '#6b7280', bg: 'rgba(107,114,128,0.10)' };
    const isDone = d.status === 'Concluído' || d.status === 'Concluido' || d.status === 'Done' || d.feito;
    const priorityHtml = this._renderPriority(d.prioridade);

    return `
      <div class="pd-task-row ${isDone ? 'pd-task-done' : ''}" data-demand-id="${d.id}">
        <div class="pd-td pd-td-check">
          <span class="pd-check ${isDone ? 'pd-checked' : ''}" style="border-color:${statusColors.color};${isDone ? `background:${statusColors.color};` : ''}">
            ${isDone ? '<i data-lucide="check" style="width:10px;height:10px;color:#fff;"></i>' : ''}
          </span>
        </div>
        <div class="pd-td pd-td-name">
          <span class="pd-task-title ${isDone ? 'pd-task-strikethrough' : ''}">${this._esc(d.title)}</span>
          ${d.notion_url ? `<a href="${d.notion_url}" target="_blank" class="pd-task-notion" onclick="event.stopPropagation()" title="Abrir no Notion"><i data-lucide="external-link" style="width:11px;height:11px;"></i></a>` : ''}
        </div>
        <div class="pd-td pd-td-responsible">
          ${d.responsible ? `
            <div class="pd-avatar-small" title="${this._esc(d.responsible)}">
              ${this._initials(d.responsible)}
            </div>
            <span class="pd-responsible-name">${this._esc(d.responsible)}</span>
          ` : '<span class="pd-empty-cell">—</span>'}
        </div>
        <div class="pd-td pd-td-date">
          ${d.due_date ? `<span class="pd-date-text ${this._isLate(d) ? 'pd-date-late' : ''}">${this._fmtDate(d.due_date)}</span>` : '<span class="pd-empty-cell">—</span>'}
        </div>
        <div class="pd-td pd-td-priority">
          ${priorityHtml}
        </div>
        <div class="pd-td pd-td-status">
          <span class="pd-demand-status" style="background:${statusColors.bg};color:${statusColors.color};">
            ${this._esc(d.status || '—')}
          </span>
        </div>
      </div>
    `;
  },

  _renderPriority(prioridade) {
    if (!prioridade) return '<span class="pd-empty-cell">—</span>';
    const p = prioridade.toLowerCase();
    let color = '#6b7280';
    let bg = 'rgba(107,114,128,0.10)';
    if (p.includes('alta') || p.includes('high') || p.includes('urgente')) { color = '#ef4444'; bg = 'rgba(239,68,68,0.10)'; }
    else if (p.includes('média') || p.includes('media') || p.includes('medium')) { color = '#f59e0b'; bg = 'rgba(245,158,11,0.10)'; }
    else if (p.includes('baixa') || p.includes('low')) { color = '#22c55e'; bg = 'rgba(34,197,94,0.10)'; }
    return `<span class="pd-priority-pill" style="background:${bg};color:${color};">${this._esc(prioridade)}</span>`;
  },

  _bindEvents() {
    // Section toggles
    document.querySelectorAll('.pd-section-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const section = btn.closest('.pd-section');
        if (!section) return;
        section.classList.toggle('pd-section-collapsed');
        const chevron = btn.querySelector('.pd-section-chevron');
        if (chevron) chevron.style.transform = section.classList.contains('pd-section-collapsed') ? 'rotate(-90deg)' : '';
      });
    });
  },

  _renderError(msg) {
    const el = document.getElementById('projectDetail');
    if (el) {
      el.innerHTML = `
        <div class="pd-error">
          <i data-lucide="alert-circle" style="width:24px;height:24px;color:#ef4444;"></i>
          <span>Erro: ${this._esc(msg)}</span>
          <button class="pd-back-btn" onclick="TBO_ROUTER.navigate('quadro-projetos')" style="margin-top:12px;">
            <i data-lucide="arrow-left" style="width:14px;height:14px;"></i>
            Voltar ao Quadro
          </button>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  // Utils
  _statusInfo(status) {
    return this._STATUS[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: 'circle' };
  },

  _parseBus(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  },

  _esc(str) {
    if (str == null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  _fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } catch { return iso.slice(0, 10); }
  },

  _initials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  },

  _isLate(d) {
    if (!d.due_date) return false;
    if (d.status === 'Concluído' || d.status === 'Concluido' || d.status === 'Done' || d.feito) return false;
    return new Date(d.due_date) < new Date();
  },

  destroy() {
    this._project = null;
    this._demands = [];
    this._params = null;
    this._loaded = false;
  },

  init() {}
};
