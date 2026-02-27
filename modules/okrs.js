// ============================================================================
// TBO OS — Modulo: OKRs v2.0 — Enterprise OKR System
// 4 modos: Visao Geral | Estrutura | Check-ins | Analytics
// Cycle-based, full CRUD, weighted progress, Qulture-inspired UX
// ============================================================================

const TBO_OKRS = {
  // State
  _tab: 'overview',
  _loading: false,
  _dataLoaded: false,
  _error: null,
  _cycles: [],
  _activeCycleId: null,
  _activeCycle: null,
  _activePeriod: null, // v1 fallback: period string for filtering
  _objectives: [],
  _kpis: null,
  _profiles: [],
  _showModal: null,
  _modalData: {},
  _searchQuery: '',
  _filterStatus: '',
  _filterLevel: '',
  _filterOwner: '',

  // Tab config
  _tabConfig: [
    { id: 'overview',  icon: 'layout-dashboard', label: 'Visao Geral' },
    { id: 'structure', icon: 'network',           label: 'Estrutura' },
    { id: 'checkins',  icon: 'check-circle',      label: 'Check-ins' },
    { id: 'analytics', icon: 'bar-chart-3',       label: 'Analytics' }
  ],

  // Level config
  _levelConfig: {
    company:     { label: 'Empresa',    icon: 'building-2', color: '#7c3aed', bg: 'rgba(139,92,246,0.1)' },
    directorate: { label: 'Diretoria',  icon: 'briefcase',  color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
    squad:       { label: 'Squad',      icon: 'users',      color: '#0891b2', bg: 'rgba(8,145,178,0.1)' },
    individual:  { label: 'Individual', icon: 'user',        color: '#16a34a', bg: 'rgba(34,197,94,0.1)' },
    bu:          { label: 'Diretoria',  icon: 'briefcase',  color: '#2563eb', bg: 'rgba(59,130,246,0.1)' },
    personal:    { label: 'Individual', icon: 'user',        color: '#16a34a', bg: 'rgba(34,197,94,0.1)' }
  },

  // Status config
  _statusConfig: {
    on_track:  { label: 'No caminho',  color: '#16a34a', bg: 'rgba(34,197,94,0.1)',  icon: 'check-circle' },
    attention: { label: 'Atencao',     color: '#d97706', bg: 'rgba(245,158,11,0.1)', icon: 'alert-triangle' },
    at_risk:   { label: 'Em risco',    color: '#dc2626', bg: 'rgba(239,68,68,0.1)',  icon: 'alert-circle' },
    behind:    { label: 'Atrasado',    color: '#dc2626', bg: 'rgba(239,68,68,0.1)',  icon: 'alert-circle' }
  },

  // ── Render ────────────────────────────────────────────────────

  render() {
    // Parse tab from route
    if (typeof TBO_ROUTER !== 'undefined' && TBO_ROUTER._currentRoute) {
      const parts = TBO_ROUTER._currentRoute.split('/');
      if (parts.length > 1) {
        const hint = parts[1];
        if (this._tabConfig.find(t => t.id === hint)) this._tab = hint;
      }
    }

    return `
      <style>${this._getStyles()}</style>
      <div class="okr2">

        ${this._renderCycleHeader()}

        ${this._renderTabBar()}

        <div class="okr2-content" id="okr2Content">
          ${this._loading ? this._renderLoading()
            : this._error ? this._renderError()
            : this._renderActiveTab()}
        </div>

        ${this._renderModals()}
      </div>
    `;
  },

  // ── Cycle Header (Control Center) ────────────────────────────

  _renderCycleHeader() {
    const cycle = this._activeCycle;
    const kpis = this._kpis || {};
    const progress = kpis.cycleProgress || kpis.avgProgress || 0;

    // Elapsed percentage
    let elapsed = 0;
    if (cycle) {
      const now = new Date();
      const start = new Date(cycle.start_date);
      const end = new Date(cycle.end_date);
      const total = end - start;
      elapsed = total > 0 ? Math.min(100, Math.max(0, ((now - start) / total) * 100)) : 0;
    }

    return `
      <div class="okr2-cycle-header">
        <div class="okr2-cycle-top">
          <div class="okr2-cycle-selector">
            <div class="okr2-cycle-icon">
              <i data-lucide="target" style="width:20px;height:20px;"></i>
            </div>
            <div class="okr2-cycle-info">
              <select id="okr2CycleSelect" class="okr2-cycle-select">
                ${this._cycles.length === 0
                  ? '<option value="">Nenhum ciclo</option>'
                  : `<option value="">Todos os periodos</option>
                     ${this._cycles.map(c =>
                       `<option value="${c.id}" ${this._activeCycleId === c.id ? 'selected' : ''}>${this._esc(c.name)}</option>`
                     ).join('')}`}
              </select>
              ${cycle ? `<span class="okr2-cycle-dates">${this._fmtDate(cycle.start_date)} — ${this._fmtDate(cycle.end_date)}</span>` : ''}
            </div>
            <button class="okr2-btn-ghost" id="okr2ManageCycles" title="Gerenciar ciclos">
              <i data-lucide="settings" style="width:14px;height:14px;"></i>
            </button>
          </div>

          <div class="okr2-cycle-actions">
            <button class="okr2-btn-primary" id="okr2NewObjective">
              <i data-lucide="plus" style="width:14px;height:14px;"></i>
              Novo Objetivo
            </button>
            <button class="okr2-btn-secondary" id="okr2NewCheckin">
              <i data-lucide="check-circle" style="width:14px;height:14px;"></i>
              Novo Check-in
            </button>
          </div>
        </div>

        <div class="okr2-cycle-metrics">
          <div class="okr2-metric-progress">
            <div class="okr2-metric-progress-ring">
              <svg viewBox="0 0 80 80" class="okr2-ring">
                <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border-default)" stroke-width="5"/>
                <circle cx="40" cy="40" r="34" fill="none"
                        stroke="${this._progressColor(progress)}"
                        stroke-width="5" stroke-linecap="round"
                        stroke-dasharray="${Math.PI * 68}"
                        stroke-dashoffset="${Math.PI * 68 * (1 - Math.min(progress, 100) / 100)}"
                        transform="rotate(-90 40 40)"
                        style="transition: stroke-dashoffset 1s ease;"/>
              </svg>
              <span class="okr2-ring-value">${Math.round(progress)}<small>%</small></span>
            </div>
            <div class="okr2-metric-progress-info">
              <span class="okr2-metric-label">Progresso do Ciclo</span>
              <div class="okr2-progress-bar">
                <div class="okr2-progress-fill" style="width:${Math.min(progress, 100)}%;background:${this._progressColor(progress)};"></div>
                ${elapsed > 0 ? `<div class="okr2-progress-expected" style="left:${Math.min(elapsed, 100)}%;"></div>` : ''}
              </div>
              ${elapsed > 0 ? `<span class="okr2-metric-sub">${Math.round(elapsed)}% do tempo decorrido</span>` : ''}
            </div>
          </div>

          <div class="okr2-metric-counters">
            <div class="okr2-counter">
              <span class="okr2-counter-value">${kpis.totalObjectives || 0}</span>
              <span class="okr2-counter-label">Objetivos</span>
            </div>
            <div class="okr2-counter-sep"></div>
            <div class="okr2-counter">
              <span class="okr2-counter-value">${kpis.totalKRs || 0}</span>
              <span class="okr2-counter-label">Key Results</span>
            </div>
            <div class="okr2-counter-sep"></div>
            <div class="okr2-counter ${(kpis.atRiskCount || 0) > 0 ? 'okr2-counter--danger' : ''}">
              <span class="okr2-counter-value">${kpis.atRiskCount || 0}</span>
              <span class="okr2-counter-label">Em Risco</span>
            </div>
            <div class="okr2-counter-sep"></div>
            <div class="okr2-counter">
              <span class="okr2-counter-value">${kpis.pendingCheckins || 0}</span>
              <span class="okr2-counter-label">Check-ins</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  // ── Tab Bar ──────────────────────────────────────────────────

  _renderTabBar() {
    return `
      <div class="okr2-tabbar">
        <div class="okr2-tabs">
          ${this._tabConfig.map(t => `
            <button class="okr2-tab ${this._tab === t.id ? 'okr2-tab--active' : ''}" data-tab="${t.id}">
              <i data-lucide="${t.icon}" style="width:15px;height:15px;"></i>
              <span>${t.label}</span>
            </button>
          `).join('')}
          <div class="okr2-tab-indicator" id="okr2TabIndicator"></div>
        </div>

        <div class="okr2-tabbar-right">
          <div class="okr2-search">
            <i data-lucide="search" class="okr2-search-icon"></i>
            <input type="text" id="okr2Search" class="okr2-search-input"
                   placeholder="Buscar..." value="${this._escAttr(this._searchQuery)}">
          </div>
          <select id="okr2FilterStatus" class="okr2-filter">
            <option value="">Status</option>
            <option value="on_track" ${this._filterStatus === 'on_track' ? 'selected' : ''}>No caminho</option>
            <option value="attention" ${this._filterStatus === 'attention' ? 'selected' : ''}>Atencao</option>
            <option value="at_risk" ${this._filterStatus === 'at_risk' ? 'selected' : ''}>Em risco</option>
          </select>
          <select id="okr2FilterLevel" class="okr2-filter">
            <option value="">Nivel</option>
            <option value="company" ${this._filterLevel === 'company' ? 'selected' : ''}>Empresa</option>
            <option value="directorate" ${this._filterLevel === 'directorate' ? 'selected' : ''}>Diretoria</option>
            <option value="squad" ${this._filterLevel === 'squad' ? 'selected' : ''}>Squad</option>
            <option value="individual" ${this._filterLevel === 'individual' ? 'selected' : ''}>Individual</option>
          </select>
        </div>
      </div>
    `;
  },

  // ── Tab Content Delegation ───────────────────────────────────

  _renderActiveTab() {
    this._setupSubModules();

    switch (this._tab) {
      case 'overview':
        return typeof TBO_OKRS_OVERVIEW !== 'undefined' ? TBO_OKRS_OVERVIEW.render() : this._renderFallback('Visao Geral');
      case 'structure':
        return typeof TBO_OKRS_STRUCTURE !== 'undefined' ? TBO_OKRS_STRUCTURE.render() : this._renderFallback('Estrutura');
      case 'checkins':
        return typeof TBO_OKRS_CHECKINS !== 'undefined' ? TBO_OKRS_CHECKINS.render() : this._renderFallback('Check-ins');
      case 'analytics':
        return typeof TBO_OKRS_ANALYTICS !== 'undefined' ? TBO_OKRS_ANALYTICS.render() : this._renderFallback('Analytics');
      default: return '';
    }
  },

  _setupSubModules() {
    const ctx = { portal: this, objectives: this.getFilteredObjectives(), allObjectives: this._objectives, cycle: this._activeCycle, kpis: this._kpis, profiles: this._profiles };
    if (typeof TBO_OKRS_OVERVIEW !== 'undefined') TBO_OKRS_OVERVIEW.setup(ctx);
    if (typeof TBO_OKRS_STRUCTURE !== 'undefined') TBO_OKRS_STRUCTURE.setup(ctx);
    if (typeof TBO_OKRS_CHECKINS !== 'undefined') TBO_OKRS_CHECKINS.setup(ctx);
    if (typeof TBO_OKRS_ANALYTICS !== 'undefined') TBO_OKRS_ANALYTICS.setup(ctx);
  },

  _renderFallback(name) {
    return `<div class="okr2-empty"><p>Modulo "${name}" nao carregado.</p></div>`;
  },

  // ── Filtered Objectives ──────────────────────────────────────

  getFilteredObjectives() {
    let objs = [...this._objectives].filter(o => o.status === 'active' && !o.archived_at);

    if (this._filterLevel) {
      objs = objs.filter(o => o.level === this._filterLevel);
    }

    if (this._searchQuery) {
      const q = this._searchQuery.toLowerCase();
      objs = objs.filter(o => {
        const titleMatch = (o.title || '').toLowerCase().includes(q);
        const krsMatch = (o.okr_key_results || []).some(kr => (kr.title || '').toLowerCase().includes(q));
        return titleMatch || krsMatch;
      });
    }

    if (this._filterStatus) {
      objs = objs.filter(o => {
        const krs = o.okr_key_results || [];
        if (this._filterStatus === 'at_risk') {
          return krs.some(kr => kr.confidence === 'at_risk' || kr.confidence === 'behind');
        }
        return krs.some(kr => kr.confidence === this._filterStatus);
      });
    }

    if (this._filterOwner) {
      objs = objs.filter(o => o.owner_id === this._filterOwner);
    }

    return objs;
  },

  // ── Modals ──────────────────────────────────────────────────

  _renderModals() {
    if (!this._showModal) return '';

    switch (this._showModal) {
      case 'createObjective':
      case 'editObjective':
        return this._renderObjectiveModal();
      case 'createKR':
      case 'editKR':
        return this._renderKRModal();
      case 'createCheckin':
        return this._renderCheckinModal();
      case 'manageCycles':
        return this._renderCyclesModal();
      case 'createCycle':
      case 'editCycle':
        return this._renderCycleFormModal();
      default:
        return '';
    }
  },

  _renderObjectiveModal() {
    const isEdit = this._showModal === 'editObjective';
    const d = this._modalData || {};
    const profiles = this._profiles || [];
    const objectives = this._objectives.filter(o => o.status === 'active' && !o.archived_at);

    return `
      <div class="okr2-overlay" id="okr2Overlay">
        <div class="okr2-modal">
          <div class="okr2-modal-header">
            <h3>${isEdit ? 'Editar Objetivo' : 'Novo Objetivo'}</h3>
            <button class="okr2-modal-close" id="okr2ModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
          </div>
          <form id="okr2ObjForm" class="okr2-modal-body">
            <div class="okr2-field">
              <label>Titulo do Objetivo *</label>
              <input type="text" id="okr2ObjTitle" value="${this._escAttr(d.title || '')}" required placeholder="Ex: Aumentar receita recorrente em 30%">
            </div>
            <div class="okr2-field">
              <label>Descricao</label>
              <textarea id="okr2ObjDesc" rows="2" placeholder="Contexto e motivacao">${this._esc(d.description || '')}</textarea>
            </div>
            <div class="okr2-field-row">
              <div class="okr2-field">
                <label>Nivel *</label>
                <select id="okr2ObjLevel">
                  <option value="company" ${d.level === 'company' ? 'selected' : ''}>Empresa</option>
                  <option value="directorate" ${d.level === 'directorate' || d.level === 'bu' ? 'selected' : ''}>Diretoria</option>
                  <option value="squad" ${d.level === 'squad' ? 'selected' : ''}>Squad</option>
                  <option value="individual" ${!d.level || d.level === 'individual' || d.level === 'personal' ? 'selected' : ''}>Individual</option>
                </select>
              </div>
              <div class="okr2-field">
                <label>Area / BU</label>
                <input type="text" id="okr2ObjBU" value="${this._escAttr(d.bu || '')}" placeholder="Ex: Engenharia">
              </div>
            </div>
            <div class="okr2-field-row">
              <div class="okr2-field">
                <label>OKR Pai</label>
                <select id="okr2ObjParent">
                  <option value="">Nenhum (raiz)</option>
                  ${objectives.filter(o => o.id !== d.id).map(o =>
                    `<option value="${o.id}" ${d.parent_id === o.id ? 'selected' : ''}>${this._esc(o.title)}</option>`
                  ).join('')}
                </select>
              </div>
              ${profiles.length > 0 ? `
                <div class="okr2-field">
                  <label>Responsavel</label>
                  <select id="okr2ObjOwner">
                    ${profiles.map(p => `<option value="${p.id}" ${d.owner_id === p.id ? 'selected' : ''}>${this._esc(p.full_name || p.email)}</option>`).join('')}
                  </select>
                </div>
              ` : ''}
            </div>

            ${!isEdit ? `
              <div class="okr2-divider"></div>
              <div class="okr2-section-title"><i data-lucide="key-round" style="width:14px;height:14px;"></i> Key Results</div>
              <div id="okr2KRContainer">${this._renderKRField(0)}</div>
              <button type="button" id="okr2AddKR" class="okr2-btn-dashed">
                <i data-lucide="plus" style="width:13px;height:13px;"></i> Adicionar Key Result
              </button>
            ` : ''}

            <div class="okr2-modal-footer">
              <button type="button" class="okr2-btn-secondary" id="okr2ModalCancel">Cancelar</button>
              <button type="submit" class="okr2-btn-primary">
                <i data-lucide="check" style="width:14px;height:14px;"></i>
                ${isEdit ? 'Salvar' : 'Criar Objetivo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  _renderKRField(index) {
    return `
      <div class="okr2-kr-field" data-kr-idx="${index}">
        <div class="okr2-field-row">
          <div class="okr2-field" style="flex:2;"><input type="text" class="okr2-kr-title" placeholder="Titulo do Key Result"></div>
          <div class="okr2-field" style="flex:0 0 120px;">
            <select class="okr2-kr-type">
              <option value="number">Numero</option>
              <option value="percent">Percentual</option>
              <option value="currency">Monetario</option>
              <option value="binary">Sim/Nao</option>
            </select>
          </div>
        </div>
        <div class="okr2-field-row">
          <div class="okr2-field" style="flex:0 0 100px;"><input type="number" step="any" class="okr2-kr-target" placeholder="Meta"></div>
          <div class="okr2-field" style="flex:0 0 100px;"><input type="text" class="okr2-kr-unit" placeholder="Unidade"></div>
          <div class="okr2-field" style="flex:0 0 80px;"><input type="number" step="0.01" class="okr2-kr-weight" placeholder="Peso" min="0" max="1"></div>
        </div>
      </div>
    `;
  },

  _renderKRModal() {
    const isEdit = this._showModal === 'editKR';
    const d = this._modalData || {};

    return `
      <div class="okr2-overlay" id="okr2Overlay">
        <div class="okr2-modal" style="max-width:480px;">
          <div class="okr2-modal-header">
            <h3>${isEdit ? 'Editar Key Result' : 'Novo Key Result'}</h3>
            <button class="okr2-modal-close" id="okr2ModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
          </div>
          <form id="okr2KRForm" class="okr2-modal-body">
            <div class="okr2-field">
              <label>Titulo *</label>
              <input type="text" id="okr2KRTitle" value="${this._escAttr(d.title || '')}" required placeholder="Ex: Aumentar NPS para 70">
            </div>
            <div class="okr2-field-row">
              <div class="okr2-field">
                <label>Tipo</label>
                <select id="okr2KRType">
                  <option value="number" ${d.metric_type === 'number' ? 'selected' : ''}>Numero</option>
                  <option value="percent" ${d.metric_type === 'percent' || d.metric_type === 'percentage' ? 'selected' : ''}>Percentual</option>
                  <option value="currency" ${d.metric_type === 'currency' ? 'selected' : ''}>Monetario</option>
                  <option value="binary" ${d.metric_type === 'binary' || d.metric_type === 'boolean' ? 'selected' : ''}>Sim/Nao</option>
                </select>
              </div>
              <div class="okr2-field">
                <label>Meta *</label>
                <input type="number" step="any" id="okr2KRTarget" value="${d.target_value || ''}" required>
              </div>
            </div>
            <div class="okr2-field-row">
              <div class="okr2-field"><label>Valor Inicial</label><input type="number" step="any" id="okr2KRStart" value="${d.start_value || 0}"></div>
              <div class="okr2-field"><label>Unidade</label><input type="text" id="okr2KRUnit" value="${this._escAttr(d.unit || '')}"></div>
            </div>
            <div class="okr2-field-row">
              <div class="okr2-field"><label>Peso (0-1)</label><input type="number" step="0.01" id="okr2KRWeight" value="${d.weight || ''}" min="0" max="1"></div>
              <div class="okr2-field">
                <label>Cadencia</label>
                <select id="okr2KRCadence">
                  <option value="weekly" ${d.cadence === 'weekly' ? 'selected' : ''}>Semanal</option>
                  <option value="biweekly" ${d.cadence === 'biweekly' ? 'selected' : ''}>Quinzenal</option>
                  <option value="monthly" ${d.cadence === 'monthly' ? 'selected' : ''}>Mensal</option>
                </select>
              </div>
            </div>
            ${isEdit ? `
              <div class="okr2-field">
                <label>Valor Atual</label>
                <input type="number" step="any" id="okr2KRCurrent" value="${d.current_value || 0}">
              </div>
            ` : ''}
            <div class="okr2-modal-footer">
              <button type="button" class="okr2-btn-secondary" id="okr2ModalCancel">Cancelar</button>
              <button type="submit" class="okr2-btn-primary"><i data-lucide="check" style="width:14px;height:14px;"></i> ${isEdit ? 'Salvar' : 'Criar KR'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  _renderCheckinModal() {
    const d = this._modalData || {};
    const kr = d.kr;
    if (!kr) return '';

    const current = Number(kr.current_value || 0);
    return `
      <div class="okr2-overlay" id="okr2Overlay">
        <div class="okr2-modal" style="max-width:480px;">
          <div class="okr2-modal-header">
            <div>
              <h3>Check-in</h3>
              <p class="okr2-modal-subtitle">${this._esc(kr.title)}</p>
            </div>
            <button class="okr2-modal-close" id="okr2ModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
          </div>
          <form id="okr2CheckinForm" class="okr2-modal-body">
            <div class="okr2-checkin-ctx">
              <div class="okr2-ctx-item"><span class="okr2-ctx-label">Objetivo</span><span>${this._esc(d.objTitle || '')}</span></div>
              <div class="okr2-ctx-item"><span class="okr2-ctx-label">Atual</span><span>${current}${kr.unit ? ' ' + kr.unit : ''}</span></div>
              <div class="okr2-ctx-item"><span class="okr2-ctx-label">Meta</span><span>${kr.target_value}${kr.unit ? ' ' + kr.unit : ''}</span></div>
            </div>
            <div class="okr2-field">
              <label>Novo Valor *</label>
              <input type="number" step="any" id="okr2CiValue" value="${current}" required style="font-size:1.1rem;font-weight:700;">
            </div>
            <div class="okr2-field">
              <label>Confianca</label>
              <div class="okr2-conf-options">
                ${['on_track', 'at_risk', 'behind'].map(c => {
                  const sc = this._statusConfig[c];
                  return `<label class="okr2-conf-opt ${kr.confidence === c ? 'selected' : ''}">
                    <input type="radio" name="okr2CiConf" value="${c}" ${kr.confidence === c ? 'checked' : ''}>
                    <span class="okr2-conf-dot" style="background:${sc.color};"></span>${sc.label}
                  </label>`;
                }).join('')}
              </div>
            </div>
            <div class="okr2-field">
              <label>Notas</label>
              <textarea id="okr2CiNotes" rows="3" placeholder="O que mudou? Bloqueios?"></textarea>
            </div>
            <div class="okr2-modal-footer">
              <button type="button" class="okr2-btn-secondary" id="okr2ModalCancel">Cancelar</button>
              <button type="submit" class="okr2-btn-primary"><i data-lucide="check" style="width:14px;height:14px;"></i> Salvar Check-in</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  _renderCyclesModal() {
    return `
      <div class="okr2-overlay" id="okr2Overlay">
        <div class="okr2-modal" style="max-width:520px;">
          <div class="okr2-modal-header">
            <h3>Gerenciar Ciclos</h3>
            <button class="okr2-modal-close" id="okr2ModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
          </div>
          <div class="okr2-modal-body">
            <button class="okr2-btn-primary" id="okr2NewCycle" style="margin-bottom:16px;">
              <i data-lucide="plus" style="width:14px;height:14px;"></i> Novo Ciclo
            </button>
            <div class="okr2-cycles-list">
              ${this._cycles.length === 0
                ? '<p class="okr2-muted">Nenhum ciclo criado.</p>'
                : this._cycles.map(c => `
                  <div class="okr2-cycle-item ${c.is_active ? 'okr2-cycle-item--active' : ''}">
                    <div class="okr2-cycle-item-info">
                      <span class="okr2-cycle-item-name">${this._esc(c.name)}</span>
                      <span class="okr2-cycle-item-dates">${this._fmtDate(c.start_date)} — ${this._fmtDate(c.end_date)}</span>
                    </div>
                    <div class="okr2-cycle-item-actions">
                      ${c.is_active ? '<span class="okr2-badge-active">Ativo</span>' : `<button class="okr2-btn-ghost okr2-cycle-activate" data-id="${c.id}" title="Ativar"><i data-lucide="check-circle" style="width:14px;height:14px;"></i></button>`}
                      <button class="okr2-btn-ghost okr2-cycle-edit" data-id="${c.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                      <button class="okr2-btn-ghost okr2-cycle-delete" data-id="${c.id}" title="Excluir"><i data-lucide="trash-2" style="width:14px;height:14px;"></i></button>
                    </div>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  _renderCycleFormModal() {
    const isEdit = this._showModal === 'editCycle';
    const d = this._modalData || {};

    return `
      <div class="okr2-overlay" id="okr2Overlay">
        <div class="okr2-modal" style="max-width:420px;">
          <div class="okr2-modal-header">
            <h3>${isEdit ? 'Editar Ciclo' : 'Novo Ciclo'}</h3>
            <button class="okr2-modal-close" id="okr2ModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
          </div>
          <form id="okr2CycleForm" class="okr2-modal-body">
            <div class="okr2-field"><label>Nome *</label><input type="text" id="okr2CycleName" value="${this._escAttr(d.name || '')}" required placeholder="Ex: Q1 2026"></div>
            <div class="okr2-field-row">
              <div class="okr2-field"><label>Inicio *</label><input type="date" id="okr2CycleStart" value="${d.start_date || ''}" required></div>
              <div class="okr2-field"><label>Fim *</label><input type="date" id="okr2CycleEnd" value="${d.end_date || ''}" required></div>
            </div>
            <div class="okr2-field">
              <label class="okr2-checkbox-label">
                <input type="checkbox" id="okr2CycleActive" ${d.is_active ? 'checked' : ''}>
                Definir como ciclo ativo
              </label>
            </div>
            <div class="okr2-modal-footer">
              <button type="button" class="okr2-btn-secondary" id="okr2ModalCancel">Cancelar</button>
              <button type="submit" class="okr2-btn-primary"><i data-lucide="check" style="width:14px;height:14px;"></i> ${isEdit ? 'Salvar' : 'Criar Ciclo'}</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  // ── Loading / Error ──────────────────────────────────────────

  _renderLoading() {
    return `<div class="okr2-loading"><div class="okr2-spinner"></div><p>Carregando OKRs...</p></div>`;
  },

  _renderError() {
    return `<div class="okr2-empty">
      <div class="okr2-empty-icon" style="background:rgba(239,68,68,0.1);"><i data-lucide="shield-alert" style="width:28px;height:28px;color:#dc2626;"></i></div>
      <h3>Erro ao carregar</h3><p>${this._esc(this._error)}</p>
      <button class="okr2-btn-primary" id="okr2Retry" style="margin-top:12px;"><i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Tentar novamente</button>
    </div>`;
  },

  // ── Init ──────────────────────────────────────────────────────

  async init() {
    this._bindEvents();
    if (!this._dataLoaded) {
      this._dataLoaded = true;
      await this._loadData();
      this._rerender();
    }
  },

  // ── Event Binding ─────────────────────────────────────────────

  _bindEvents() {
    // Tabs
    document.querySelectorAll('.okr2-tab').forEach(btn => {
      btn.addEventListener('click', () => { this._tab = btn.dataset.tab; this._rerender(); });
    });

    // Animated tab indicator
    this._positionTabIndicator();

    // Cycle selector
    const cycleSel = document.getElementById('okr2CycleSelect');
    if (cycleSel) {
      cycleSel.addEventListener('change', async () => {
        this._activeCycleId = cycleSel.value || null;
        this._activeCycle = this._cycles.find(c => c.id === this._activeCycleId) || null;
        this._activePeriod = this._activeCycle?._period || null;
        await this._loadObjectives();
        this._rerender();
      });
    }

    // Search
    const search = document.getElementById('okr2Search');
    if (search) {
      let deb;
      search.addEventListener('input', () => {
        clearTimeout(deb);
        deb = setTimeout(() => { this._searchQuery = search.value.trim(); this._rerender(); const el = document.getElementById('okr2Search'); if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length; } }, 300);
      });
    }

    // Filters
    const fStatus = document.getElementById('okr2FilterStatus');
    if (fStatus) fStatus.addEventListener('change', () => { this._filterStatus = fStatus.value; this._rerender(); });
    const fLevel = document.getElementById('okr2FilterLevel');
    if (fLevel) fLevel.addEventListener('change', () => { this._filterLevel = fLevel.value; this._rerender(); });

    // CTA buttons
    const newObj = document.getElementById('okr2NewObjective');
    if (newObj) newObj.addEventListener('click', () => { this._showModal = 'createObjective'; this._modalData = { cycle_id: this._activeCycleId }; this._rerender(); });

    const newCi = document.getElementById('okr2NewCheckin');
    if (newCi) newCi.addEventListener('click', () => { this._tab = 'checkins'; this._rerender(); });

    const manageCycles = document.getElementById('okr2ManageCycles');
    if (manageCycles) manageCycles.addEventListener('click', () => { this._showModal = 'manageCycles'; this._rerender(); });

    // Retry
    const retry = document.getElementById('okr2Retry');
    if (retry) retry.addEventListener('click', async () => { this._error = null; this._dataLoaded = false; await this._loadData(); this._rerender(); });

    // Bind sub-module events
    this._bindTabEvents();
    this._bindModalEvents();
  },

  _positionTabIndicator() {
    requestAnimationFrame(() => {
      const active = document.querySelector('.okr2-tab--active');
      const indicator = document.getElementById('okr2TabIndicator');
      if (active && indicator) {
        const tabs = active.parentElement;
        const tabRect = active.getBoundingClientRect();
        const parentRect = tabs.getBoundingClientRect();
        indicator.style.width = tabRect.width + 'px';
        indicator.style.left = (tabRect.left - parentRect.left) + 'px';
      }
    });
  },

  _bindTabEvents() {
    switch (this._tab) {
      case 'overview': if (typeof TBO_OKRS_OVERVIEW !== 'undefined') TBO_OKRS_OVERVIEW.bind(); break;
      case 'structure': if (typeof TBO_OKRS_STRUCTURE !== 'undefined') TBO_OKRS_STRUCTURE.bind(); break;
      case 'checkins': if (typeof TBO_OKRS_CHECKINS !== 'undefined') TBO_OKRS_CHECKINS.bind(); break;
      case 'analytics': if (typeof TBO_OKRS_ANALYTICS !== 'undefined') TBO_OKRS_ANALYTICS.bind(); break;
    }
  },

  _bindModalEvents() {
    // Close buttons
    ['okr2ModalClose', 'okr2ModalCancel'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', () => this._closeModal());
    });

    // Overlay click
    const overlay = document.getElementById('okr2Overlay');
    if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) this._closeModal(); });

    // Add KR button in create objective modal
    const addKR = document.getElementById('okr2AddKR');
    if (addKR) addKR.addEventListener('click', () => {
      const c = document.getElementById('okr2KRContainer');
      if (c) { c.insertAdjacentHTML('beforeend', this._renderKRField(c.children.length)); this._icons(); }
    });

    // Form submissions
    const objForm = document.getElementById('okr2ObjForm');
    if (objForm) objForm.addEventListener('submit', e => { e.preventDefault(); this._submitObjective(); });

    const krForm = document.getElementById('okr2KRForm');
    if (krForm) krForm.addEventListener('submit', e => { e.preventDefault(); this._submitKR(); });

    const ciForm = document.getElementById('okr2CheckinForm');
    if (ciForm) ciForm.addEventListener('submit', e => { e.preventDefault(); this._submitCheckin(); });

    const cycleForm = document.getElementById('okr2CycleForm');
    if (cycleForm) cycleForm.addEventListener('submit', e => { e.preventDefault(); this._submitCycle(); });

    // Cycle management events
    const newCycle = document.getElementById('okr2NewCycle');
    if (newCycle) newCycle.addEventListener('click', () => { this._showModal = 'createCycle'; this._modalData = {}; this._rerender(); });

    document.querySelectorAll('.okr2-cycle-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const c = this._cycles.find(x => x.id === btn.dataset.id);
        if (c) { this._showModal = 'editCycle'; this._modalData = { ...c }; this._rerender(); }
      });
    });

    document.querySelectorAll('.okr2-cycle-activate').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await OkrsRepo.updateCycle(btn.dataset.id, { is_active: true });
          this._toast('success', 'Ciclo ativado');
          this._activeCycleId = btn.dataset.id;
          await this._loadCycles();
          this._activeCycle = this._cycles.find(c => c.id === this._activeCycleId);
          this._rerender();
        } catch (e) { this._toast('error', e.message); }
      });
    });

    document.querySelectorAll('.okr2-cycle-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Excluir este ciclo? Os OKRs vinculados nao serao excluidos.')) return;
        try {
          await OkrsRepo.deleteCycle(btn.dataset.id);
          this._toast('success', 'Ciclo excluido');
          await this._loadCycles();
          if (this._activeCycleId === btn.dataset.id) {
            this._activeCycleId = this._cycles[0]?.id || null;
            this._activeCycle = this._cycles[0] || null;
          }
          this._rerender();
        } catch (e) { this._toast('error', e.message); }
      });
    });

    // Confidence radio visual feedback
    document.querySelectorAll('.okr2-conf-opt input[type="radio"]').forEach(radio => {
      radio.addEventListener('change', () => {
        document.querySelectorAll('.okr2-conf-opt').forEach(o => o.classList.remove('selected'));
        radio.closest('.okr2-conf-opt').classList.add('selected');
      });
    });
  },

  _closeModal() {
    this._showModal = null;
    this._modalData = {};
    this._rerender();
  },

  // ── Form Submissions ─────────────────────────────────────────

  async _submitObjective() {
    if (typeof OkrsRepo === 'undefined') return;
    const title = document.getElementById('okr2ObjTitle')?.value?.trim();
    if (!title) { this._toast('error', 'Titulo obrigatorio'); return; }

    const isEdit = this._showModal === 'editObjective';
    const payload = {
      title,
      description: document.getElementById('okr2ObjDesc')?.value?.trim() || null,
      level: document.getElementById('okr2ObjLevel')?.value || 'individual',
      bu: document.getElementById('okr2ObjBU')?.value?.trim() || null,
      parent_id: document.getElementById('okr2ObjParent')?.value || null,
      owner_id: document.getElementById('okr2ObjOwner')?.value || null
    };

    try {
      if (isEdit) {
        await OkrsRepo.updateObjective(this._modalData.id, payload);
        this._toast('success', 'Objetivo atualizado');
      } else {
        payload.cycle_id = this._activeCycleId;
        const obj = await OkrsRepo.createObjective(payload);

        // Create KRs from modal fields
        const krFields = document.querySelectorAll('.okr2-kr-field');
        for (const field of krFields) {
          const krTitle = field.querySelector('.okr2-kr-title')?.value?.trim();
          const krType = field.querySelector('.okr2-kr-type')?.value;
          const krTarget = parseFloat(field.querySelector('.okr2-kr-target')?.value);
          const krUnit = field.querySelector('.okr2-kr-unit')?.value?.trim();
          const krWeight = parseFloat(field.querySelector('.okr2-kr-weight')?.value) || null;

          if (krTitle && !isNaN(krTarget)) {
            await OkrsRepo.createKeyResult({ objective_id: obj.id, title: krTitle, metric_type: krType, target_value: krTarget, unit: krUnit, owner_id: payload.owner_id, weight: krWeight });
          }
        }
        this._toast('success', 'Objetivo criado');
      }

      this._closeModal();
      await this._loadObjectives();
      this._rerender();
    } catch (e) { this._toast('error', e.message || 'Erro ao salvar'); }
  },

  async _submitKR() {
    if (typeof OkrsRepo === 'undefined') return;
    const title = document.getElementById('okr2KRTitle')?.value?.trim();
    if (!title) { this._toast('error', 'Titulo obrigatorio'); return; }

    const isEdit = this._showModal === 'editKR';
    const payload = {
      title,
      metric_type: document.getElementById('okr2KRType')?.value || 'number',
      target_value: parseFloat(document.getElementById('okr2KRTarget')?.value) || 0,
      start_value: parseFloat(document.getElementById('okr2KRStart')?.value) || 0,
      unit: document.getElementById('okr2KRUnit')?.value?.trim() || null,
      weight: parseFloat(document.getElementById('okr2KRWeight')?.value) || null,
      cadence: document.getElementById('okr2KRCadence')?.value || 'weekly'
    };

    try {
      if (isEdit) {
        payload.current_value = parseFloat(document.getElementById('okr2KRCurrent')?.value) || 0;
        await OkrsRepo.updateKeyResult(this._modalData.id, payload);
        this._toast('success', 'Key Result atualizado');
      } else {
        payload.objective_id = this._modalData.objective_id;
        await OkrsRepo.createKeyResult(payload);
        this._toast('success', 'Key Result criado');
      }

      this._closeModal();
      await this._loadObjectives();
      this._rerender();
    } catch (e) { this._toast('error', e.message || 'Erro ao salvar'); }
  },

  async _submitCheckin() {
    if (typeof OkrsRepo === 'undefined') return;
    const newValue = parseFloat(document.getElementById('okr2CiValue')?.value);
    if (isNaN(newValue)) { this._toast('error', 'Valor invalido'); return; }

    const conf = document.querySelector('input[name="okr2CiConf"]:checked')?.value || 'on_track';
    const notes = document.getElementById('okr2CiNotes')?.value || '';

    try {
      await OkrsRepo.createCheckin({ key_result_id: this._modalData.kr.id, new_value: newValue, confidence: conf, notes });
      this._toast('success', 'Check-in salvo');
      this._closeModal();
      await this._loadObjectives();
      this._rerender();
    } catch (e) { this._toast('error', e.message || 'Erro no check-in'); }
  },

  async _submitCycle() {
    if (typeof OkrsRepo === 'undefined') return;
    const name = document.getElementById('okr2CycleName')?.value?.trim();
    if (!name) { this._toast('error', 'Nome obrigatorio'); return; }

    const isEdit = this._showModal === 'editCycle';
    const payload = {
      name,
      start_date: document.getElementById('okr2CycleStart')?.value,
      end_date: document.getElementById('okr2CycleEnd')?.value,
      is_active: document.getElementById('okr2CycleActive')?.checked || false
    };

    try {
      if (isEdit) {
        await OkrsRepo.updateCycle(this._modalData.id, payload);
        this._toast('success', 'Ciclo atualizado');
      } else {
        const cycle = await OkrsRepo.createCycle(payload);
        this._activeCycleId = cycle.id;
        this._toast('success', 'Ciclo criado');
      }

      await this._loadCycles();
      this._activeCycle = this._cycles.find(c => c.id === this._activeCycleId);
      this._showModal = 'manageCycles';
      this._modalData = {};
      this._rerender();
    } catch (e) { this._toast('error', e.message || 'Erro ao salvar ciclo'); }
  },

  // ── Data Loading ──────────────────────────────────────────────

  async _loadData() {
    if (typeof OkrsRepo === 'undefined') {
      this._error = 'OkrsRepo nao disponivel.';
      this._loading = false;
      return;
    }

    try {
      this._loading = true;
      this._error = null;

      // Load cycles first (returns [] on v1)
      await this._loadCycles();

      // If real cycles exist (v2), set active from them
      if (this._cycles.length > 0 && !this._cycles[0]._virtual) {
        if (!this._activeCycleId) {
          const active = this._cycles.find(c => c.is_active);
          this._activeCycleId = active ? active.id : this._cycles[0].id;
          this._activeCycle = active || this._cycles[0];
        } else {
          this._activeCycle = this._cycles.find(c => c.id === this._activeCycleId) || null;
        }
      }

      // Load objectives (on v1 loads ALL, then we build virtual cycles)
      await this._loadObjectives();

      // V1 fallback: build virtual cycles from objective periods
      if (this._cycles.length === 0 && this._objectives.length > 0) {
        this._cycles = this._buildVirtualCycles();
        if (this._cycles.length > 0 && !this._activeCycleId) {
          const active = this._cycles.find(c => c.is_active);
          this._activeCycleId = active ? active.id : this._cycles[0].id;
          this._activeCycle = active || this._cycles[0];
          this._activePeriod = this._activeCycle._period;
          // Re-load objectives filtered by selected period
          await this._loadObjectives();
        }
      }

      // Load profiles (once)
      if (this._profiles.length === 0 && typeof PeopleRepo !== 'undefined') {
        try {
          this._profiles = await PeopleRepo.list({ is_active: true, limit: 200 }) || [];
        } catch (e) { console.warn('[OKRs] Profiles:', e.message); }
      }

      this._loading = false;
    } catch (err) {
      this._loading = false;
      const msg = err?.message || 'Erro desconhecido';
      if (msg.includes('permission') || msg.includes('RLS') || msg.includes('denied') || msg.includes('42501') || msg.includes('tenant')) {
        this._error = 'Sem permissao para acessar OKRs. Verifique se voce esta vinculado a um tenant.';
      } else if (msg.includes('does not exist') || msg.includes('42P01') || msg.includes('relation')) {
        this._error = 'Tabelas de OKR nao encontradas. Execute a migration 062 no Supabase.';
      } else {
        this._error = 'Erro: ' + msg;
      }
    }
  },

  async _loadCycles() {
    try {
      this._cycles = await OkrsRepo.listCycles();
    } catch (e) {
      // If okr_cycles table doesn't exist yet, create a virtual cycle from period
      console.warn('[OKRs] Cycles table not available, using fallback:', e.message);
      this._cycles = [];
    }
  },

  async _loadObjectives() {
    try {
      const params = {};
      if (this._activePeriod) {
        // V1 fallback: filter by period string
        params.period = this._activePeriod;
      } else if (this._activeCycleId) {
        params.cycleId = this._activeCycleId;
      }
      this._objectives = await OkrsRepo.getTree(params);
      this._kpis = await OkrsRepo.getDashboardKPIs(params);
    } catch (e) {
      console.warn('[OKRs] Load objectives:', e.message);
      this._objectives = [];
      this._kpis = {};
    }
  },

  // ── Virtual Cycles (v1 fallback from period field) ────────────

  _buildVirtualCycles() {
    // Collect distinct periods from ALL objectives (before any filtering)
    const allPeriods = [...new Set(this._objectives.map(o => o.period).filter(Boolean))];

    // Sort: years last, semesters, quarters first (most specific first)
    allPeriods.sort((a, b) => {
      const ra = this._periodSortRank(a);
      const rb = this._periodSortRank(b);
      return ra - rb;
    });

    const now = new Date();
    const curYear = now.getFullYear();
    const curQ = Math.ceil((now.getMonth() + 1) / 3);
    const curH = now.getMonth() < 6 ? 1 : 2;

    return allPeriods.map(p => {
      const info = this._parsePeriodInfo(p);
      return {
        id: `period:${p}`,
        name: info.name,
        start_date: info.start,
        end_date: info.end,
        is_active: info.isCurrent(curYear, curQ, curH),
        _virtual: true,
        _period: p
      };
    });
  },

  _parsePeriodInfo(p) {
    // Formats: "2026", "2026-H1", "2026-Q1", "2026-Q2", etc.
    const yearMatch = p.match(/^(\d{4})$/);
    const halfMatch = p.match(/^(\d{4})-H([12])$/i);
    const qMatch = p.match(/^(\d{4})-Q([1-4])$/i);

    if (qMatch) {
      const y = parseInt(qMatch[1]);
      const q = parseInt(qMatch[2]);
      const startM = (q - 1) * 3;
      return {
        name: `Q${q} ${y}`,
        start: `${y}-${String(startM + 1).padStart(2, '0')}-01`,
        end: `${y}-${String(startM + 3).padStart(2, '0')}-${startM + 3 === 12 ? 31 : [30, 31, 30][q - 1] || 30}`,
        isCurrent: (cy, cq) => cy === y && cq === q
      };
    }

    if (halfMatch) {
      const y = parseInt(halfMatch[1]);
      const h = parseInt(halfMatch[2]);
      return {
        name: `${h}o Semestre ${y}`,
        start: h === 1 ? `${y}-01-01` : `${y}-07-01`,
        end: h === 1 ? `${y}-06-30` : `${y}-12-31`,
        isCurrent: (cy, cq, ch) => cy === y && ch === h
      };
    }

    if (yearMatch) {
      const y = parseInt(yearMatch[1]);
      return {
        name: `Anual ${y}`,
        start: `${y}-01-01`,
        end: `${y}-12-31`,
        isCurrent: (cy) => cy === y
      };
    }

    // Unknown format — use as-is
    return {
      name: p,
      start: null,
      end: null,
      isCurrent: () => false
    };
  },

  _periodSortRank(p) {
    const qMatch = p.match(/^(\d{4})-Q([1-4])$/i);
    const hMatch = p.match(/^(\d{4})-H([12])$/i);
    const yMatch = p.match(/^(\d{4})$/);
    if (qMatch) return parseInt(qMatch[1]) * 100 + parseInt(qMatch[2]);
    if (hMatch) return parseInt(hMatch[1]) * 100 + 10 + parseInt(hMatch[2]);
    if (yMatch) return parseInt(yMatch[1]) * 100 + 50;
    return 99999;
  },

  // ── Public API for sub-modules ────────────────────────────────

  openModal(type, data = {}) {
    this._showModal = type;
    this._modalData = data;
    this._rerender();
  },

  async reloadAndRender() {
    await this._loadObjectives();
    this._rerender();
  },

  // ── Rerender ──────────────────────────────────────────────────

  _rerender() {
    const c = document.getElementById('moduleContainer');
    if (c) { c.innerHTML = this.render(); this._bindEvents(); this._icons(); }
  },

  _icons() {
    if (typeof lucide !== 'undefined') {
      try { const r = document.getElementById('moduleContainer'); lucide.createIcons(r ? { root: r } : undefined); } catch (e) { /* */ }
    }
  },

  // ── Destroy ───────────────────────────────────────────────────

  destroy() {
    this._tab = 'overview';
    this._loading = false;
    this._dataLoaded = false;
    this._error = null;
    this._cycles = [];
    this._activeCycleId = null;
    this._activeCycle = null;
    this._objectives = [];
    this._kpis = null;
    this._profiles = [];
    this._showModal = null;
    this._modalData = {};
    this._searchQuery = '';
    this._filterStatus = '';
    this._filterLevel = '';
    this._filterOwner = '';

    if (typeof TBO_OKRS_OVERVIEW !== 'undefined' && TBO_OKRS_OVERVIEW.destroy) TBO_OKRS_OVERVIEW.destroy();
    if (typeof TBO_OKRS_STRUCTURE !== 'undefined' && TBO_OKRS_STRUCTURE.destroy) TBO_OKRS_STRUCTURE.destroy();
    if (typeof TBO_OKRS_CHECKINS !== 'undefined' && TBO_OKRS_CHECKINS.destroy) TBO_OKRS_CHECKINS.destroy();
    if (typeof TBO_OKRS_ANALYTICS !== 'undefined' && TBO_OKRS_ANALYTICS.destroy) TBO_OKRS_ANALYTICS.destroy();
  },

  // ── Helpers ───────────────────────────────────────────────────

  _esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; },
  _escAttr(s) { if (!s) return ''; return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); },

  _progressColor(pct) {
    if (pct >= 70) return '#16a34a';
    if (pct >= 40) return '#d97706';
    return '#dc2626';
  },

  _fmtDate(d) {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  },

  _toast(type, msg) {
    if (typeof TBO_TOAST !== 'undefined') {
      if (type === 'success') TBO_TOAST.success('OKRs', msg);
      else TBO_TOAST.error('Erro', msg);
    }
  },

  // ── Styles ────────────────────────────────────────────────────

  _getStyles() {
    return `
      /* ===== OKR v2 Base ===== */
      .okr2 { max-width: 1200px; margin: 0 auto; }

      /* ===== Cycle Header ===== */
      .okr2-cycle-header {
        background: var(--bg-card); border: 1px solid var(--border-default);
        border-radius: 12px; padding: 20px 24px; margin-bottom: 20px;
      }
      .okr2-cycle-top {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 20px; flex-wrap: wrap; gap: 12px;
      }
      .okr2-cycle-selector { display: flex; align-items: center; gap: 10px; }
      .okr2-cycle-icon {
        width: 40px; height: 40px; border-radius: 10px;
        background: var(--accent-gold-dim); color: var(--brand-orange);
        display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      }
      .okr2-cycle-info { display: flex; flex-direction: column; gap: 2px; }
      .okr2-cycle-select {
        padding: 4px 8px; border: 1px solid var(--border-default); border-radius: 6px;
        background: var(--bg-card); color: var(--text-primary);
        font-size: 1rem; font-weight: 700; cursor: pointer; outline: none;
      }
      .okr2-cycle-dates { font-size: 0.72rem; color: var(--text-muted); }
      .okr2-cycle-actions { display: flex; gap: 8px; }

      /* Metrics */
      .okr2-cycle-metrics {
        display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
      }
      .okr2-metric-progress {
        display: flex; align-items: center; gap: 16px; flex: 1; min-width: 280px;
      }
      .okr2-metric-progress-ring { position: relative; width: 72px; height: 72px; flex-shrink: 0; }
      .okr2-ring { width: 100%; height: 100%; }
      .okr2-ring-value {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        font-size: 1.15rem; font-weight: 800; color: var(--text-primary);
      }
      .okr2-ring-value small { font-size: 0.6rem; font-weight: 600; }
      .okr2-metric-progress-info { flex: 1; }
      .okr2-metric-label { font-size: 0.72rem; font-weight: 600; color: var(--text-secondary); display: block; margin-bottom: 6px; }
      .okr2-metric-sub { font-size: 0.65rem; color: var(--text-muted); margin-top: 4px; display: block; }
      .okr2-progress-bar {
        width: 100%; height: 6px; background: var(--bg-tertiary);
        border-radius: 3px; overflow: visible; position: relative;
      }
      .okr2-progress-fill {
        height: 100%; border-radius: 3px;
        transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .okr2-progress-expected {
        position: absolute; top: -3px; width: 2px; height: 12px;
        background: var(--text-muted); border-radius: 1px; opacity: 0.5;
      }

      /* Counters */
      .okr2-metric-counters { display: flex; align-items: center; gap: 16px; }
      .okr2-counter { text-align: center; min-width: 60px; }
      .okr2-counter-value { font-size: 1.35rem; font-weight: 800; color: var(--text-primary); display: block; line-height: 1; }
      .okr2-counter-label { font-size: 0.65rem; color: var(--text-muted); margin-top: 2px; display: block; }
      .okr2-counter--danger .okr2-counter-value { color: #dc2626; }
      .okr2-counter-sep { width: 1px; height: 32px; background: var(--border-default); }

      /* ===== Tab Bar ===== */
      .okr2-tabbar {
        display: flex; align-items: center; justify-content: space-between;
        border-bottom: 1px solid var(--border-default);
        margin-bottom: 20px; flex-wrap: wrap; gap: 8px;
      }
      .okr2-tabs { display: flex; position: relative; }
      .okr2-tab {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 12px 20px; border: none; background: none;
        font-size: 0.82rem; font-weight: 500;
        color: var(--text-muted); cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px; transition: color 0.15s;
      }
      .okr2-tab:hover { color: var(--text-primary); }
      .okr2-tab--active {
        color: var(--brand-orange); font-weight: 600;
        border-bottom-color: var(--brand-orange);
      }
      .okr2-tab-indicator {
        position: absolute; bottom: -1px; height: 2px;
        background: var(--brand-orange); border-radius: 1px;
        transition: left 0.3s ease, width 0.3s ease;
      }

      .okr2-tabbar-right { display: flex; align-items: center; gap: 8px; padding-bottom: 8px; }
      .okr2-search { position: relative; }
      .okr2-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--text-muted); pointer-events: none; }
      .okr2-search-input {
        padding: 6px 10px 6px 30px; border: 1px solid var(--border-default);
        border-radius: 6px; font-size: 0.78rem; background: var(--bg-card);
        color: var(--text-primary); width: 180px; outline: none;
        transition: border-color 0.15s;
      }
      .okr2-search-input:focus { border-color: var(--brand-orange); }
      .okr2-filter {
        padding: 6px 8px; border: 1px solid var(--border-default); border-radius: 6px;
        background: var(--bg-card); color: var(--text-secondary);
        font-size: 0.75rem; cursor: pointer; outline: none;
      }

      /* ===== Content ===== */
      .okr2-content { min-height: 200px; }

      /* ===== Buttons ===== */
      .okr2-btn-primary {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; border: none; border-radius: 8px;
        background: var(--brand-orange); color: #fff;
        font-size: 0.8rem; font-weight: 600; cursor: pointer;
        transition: background 0.15s, transform 0.1s;
      }
      .okr2-btn-primary:hover { background: var(--brand-orange-dark, #c74400); }
      .okr2-btn-primary:active { transform: scale(0.97); }

      .okr2-btn-secondary {
        display: inline-flex; align-items: center; gap: 6px;
        padding: 8px 16px; border: 1px solid var(--border-default); border-radius: 8px;
        background: var(--bg-card); color: var(--text-secondary);
        font-size: 0.8rem; font-weight: 500; cursor: pointer;
        transition: background 0.15s;
      }
      .okr2-btn-secondary:hover { background: var(--bg-card-hover); }

      .okr2-btn-ghost {
        display: inline-flex; align-items: center; justify-content: center;
        width: 32px; height: 32px; border: none; border-radius: 6px;
        background: none; color: var(--text-muted); cursor: pointer;
        transition: all 0.15s;
      }
      .okr2-btn-ghost:hover { background: var(--bg-tertiary); color: var(--text-primary); }

      .okr2-btn-dashed {
        display: inline-flex; align-items: center; gap: 5px;
        padding: 6px 12px; border: 1px dashed var(--border-default); border-radius: 8px;
        background: none; color: var(--text-muted);
        font-size: 0.75rem; cursor: pointer; transition: all 0.15s; margin-bottom: 12px;
      }
      .okr2-btn-dashed:hover { border-color: var(--brand-orange); color: var(--brand-orange); }

      /* ===== Modal ===== */
      .okr2-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
        display: flex; align-items: center; justify-content: center;
        backdrop-filter: blur(2px); animation: okr2FadeIn 0.15s ease;
      }
      @keyframes okr2FadeIn { from { opacity: 0; } to { opacity: 1; } }
      .okr2-modal {
        background: var(--bg-card); border-radius: 14px; width: 100%; max-width: 580px;
        max-height: 90vh; overflow: hidden; display: flex; flex-direction: column;
        box-shadow: 0 24px 80px rgba(0,0,0,0.2); animation: okr2SlideUp 0.2s ease;
      }
      @keyframes okr2SlideUp { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      .okr2-modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 20px 24px 0;
      }
      .okr2-modal-header h3 { margin: 0; font-size: 1.05rem; font-weight: 700; }
      .okr2-modal-subtitle { margin: 2px 0 0; font-size: 0.75rem; color: var(--text-muted); }
      .okr2-modal-close {
        width: 32px; height: 32px; border-radius: 8px; border: none;
        background: var(--bg-tertiary); cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        color: var(--text-muted); transition: background 0.15s;
      }
      .okr2-modal-close:hover { background: var(--border-default); }
      .okr2-modal-body { padding: 16px 24px; overflow-y: auto; flex: 1; }
      .okr2-modal-footer { display: flex; gap: 8px; justify-content: flex-end; padding: 16px 24px 20px; }

      /* ===== Form Fields ===== */
      .okr2-field { margin-bottom: 12px; }
      .okr2-field label { display: block; font-size: 0.75rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 4px; }
      .okr2-field input, .okr2-field select, .okr2-field textarea {
        width: 100%; padding: 8px 12px; border: 1px solid var(--border-default);
        border-radius: 8px; font-size: 0.82rem; background: var(--bg-card);
        color: var(--text-primary); outline: none; transition: border-color 0.15s;
      }
      .okr2-field input:focus, .okr2-field select:focus, .okr2-field textarea:focus {
        border-color: var(--brand-orange);
      }
      .okr2-field textarea { resize: vertical; min-height: 48px; }
      .okr2-field-row { display: flex; gap: 12px; }
      .okr2-field-row .okr2-field { flex: 1; }
      .okr2-divider { border: none; border-top: 1px solid var(--border-default); margin: 16px 0; }
      .okr2-section-title { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; font-weight: 600; color: var(--text-primary); margin-bottom: 12px; }
      .okr2-kr-field { padding: 12px; border: 1px solid var(--border-default); border-radius: 8px; margin-bottom: 8px; background: var(--bg-card-hover); }
      .okr2-kr-field .okr2-field-row { margin-bottom: 0; }
      .okr2-checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; cursor: pointer; }

      /* ===== Check-in Context ===== */
      .okr2-checkin-ctx { display: flex; gap: 16px; padding: 12px; background: var(--bg-card-hover); border-radius: 8px; margin-bottom: 16px; flex-wrap: wrap; }
      .okr2-ctx-item { display: flex; flex-direction: column; gap: 2px; }
      .okr2-ctx-label { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; }
      .okr2-ctx-item > span:last-child { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }

      /* ===== Confidence Options ===== */
      .okr2-conf-options { display: flex; gap: 8px; }
      .okr2-conf-opt {
        display: flex; align-items: center; gap: 6px;
        padding: 8px 14px; border: 1px solid var(--border-default); border-radius: 8px;
        cursor: pointer; font-size: 0.8rem; color: var(--text-secondary); transition: all 0.15s;
      }
      .okr2-conf-opt input { display: none; }
      .okr2-conf-opt:hover { border-color: var(--brand-orange); }
      .okr2-conf-opt.selected { border-color: var(--brand-orange); background: var(--accent-gold-dim); font-weight: 600; color: var(--text-primary); }
      .okr2-conf-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

      /* ===== Cycles List ===== */
      .okr2-cycles-list { display: flex; flex-direction: column; gap: 6px; }
      .okr2-cycle-item {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 16px; border: 1px solid var(--border-default); border-radius: 8px;
        background: var(--bg-card); transition: border-color 0.15s;
      }
      .okr2-cycle-item--active { border-color: var(--brand-orange); background: var(--accent-gold-dim); }
      .okr2-cycle-item-info { }
      .okr2-cycle-item-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); display: block; }
      .okr2-cycle-item-dates { font-size: 0.72rem; color: var(--text-muted); }
      .okr2-cycle-item-actions { display: flex; gap: 4px; align-items: center; }
      .okr2-badge-active {
        padding: 2px 8px; border-radius: 12px; font-size: 0.65rem; font-weight: 600;
        background: rgba(34,197,94,0.1); color: #16a34a;
      }

      /* ===== Shared ===== */
      .okr2-card {
        background: var(--bg-card); border: 1px solid var(--border-default);
        border-radius: 10px; padding: 16px 20px; transition: box-shadow 0.15s;
      }
      .okr2-card:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.04); }

      .okr2-status-badge {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 2px 8px; border-radius: 12px;
        font-size: 0.68rem; font-weight: 600; white-space: nowrap;
      }
      .okr2-status--on_track { background: rgba(34,197,94,0.1); color: #16a34a; }
      .okr2-status--attention { background: rgba(245,158,11,0.1); color: #d97706; }
      .okr2-status--at_risk { background: rgba(239,68,68,0.1); color: #dc2626; }
      .okr2-status--behind { background: rgba(239,68,68,0.1); color: #dc2626; }

      .okr2-level-badge {
        display: inline-flex; align-items: center; gap: 3px;
        padding: 1px 8px; border-radius: 12px;
        font-size: 0.65rem; font-weight: 600; white-space: nowrap;
      }
      .okr2-level--company { background: rgba(139,92,246,0.1); color: #7c3aed; }
      .okr2-level--directorate, .okr2-level--bu { background: rgba(59,130,246,0.1); color: #2563eb; }
      .okr2-level--squad { background: rgba(8,145,178,0.1); color: #0891b2; }
      .okr2-level--individual, .okr2-level--personal { background: rgba(34,197,94,0.1); color: #16a34a; }

      .okr2-muted { color: var(--text-muted); font-size: 0.82rem; }

      /* ===== Loading / Empty ===== */
      .okr2-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; gap: 12px; }
      .okr2-loading p { color: var(--text-muted); font-size: 0.82rem; margin: 0; }
      .okr2-spinner { width: 32px; height: 32px; border: 3px solid var(--border-default); border-top-color: var(--brand-orange); border-radius: 50%; animation: okr2Spin 0.7s linear infinite; }
      @keyframes okr2Spin { to { transform: rotate(360deg); } }
      .okr2-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px; text-align: center; }
      .okr2-empty h3 { margin: 16px 0 6px; font-size: 1rem; color: var(--text-primary); }
      .okr2-empty p { margin: 0; font-size: 0.82rem; color: var(--text-muted); max-width: 360px; }
      .okr2-empty-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }

      /* ===== Responsive ===== */
      @media (max-width: 768px) {
        .okr2-cycle-top { flex-direction: column; align-items: flex-start; }
        .okr2-cycle-metrics { flex-direction: column; }
        .okr2-metric-counters { flex-wrap: wrap; }
        .okr2-tabbar { flex-direction: column; align-items: flex-start; }
        .okr2-tabbar-right { width: 100%; flex-wrap: wrap; }
        .okr2-field-row { flex-direction: column; gap: 0; }
        .okr2-conf-options { flex-direction: column; }
      }
    `;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS = TBO_OKRS;
}
