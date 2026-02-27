// ============================================================================
// TBO OS — Modulo: OKRs (v1.1 — Performance + Access Fix)
// Orquestrador: delega para sub-modulos em modules/okrs/*.js
// Acesso: todos os usuarios com permissao ao modulo
//
// Sub-modulos:
//   - modules/okrs/tab-dashboard.js → TBO_OKRS_DASHBOARD
//   - modules/okrs/tab-tree.js     → TBO_OKRS_TREE
//   - modules/okrs/tab-checkins.js → TBO_OKRS_CHECKINS
// ============================================================================

const TBO_OKRS = {
  _tab: 'dashboard',
  _loading: false,
  _dataLoaded: false,
  _error: null,
  _period: '2026-Q1',
  _objectives: [],
  _kpis: null,
  _showModal: null,     // 'createOKR' | 'editOKR' | null
  _modalData: {},
  _profiles: [],        // para select de owner

  // ── Tab config ──────────────────────────────────────────────────────────
  _tabConfig: [
    { id: 'dashboard', icon: 'layout-dashboard', label: 'Dashboard' },
    { id: 'tree',      icon: 'git-branch',       label: 'Alinhamento' },
    { id: 'checkins',  icon: 'check-square',     label: 'Check-ins' }
  ],

  // ── Period options ──────────────────────────────────────────────────────
  _periodOptions: [
    { value: '2026-Q1', label: 'Q1 2026' },
    { value: '2026-Q2', label: 'Q2 2026' },
    { value: '2026-Q3', label: 'Q3 2026' },
    { value: '2026-Q4', label: 'Q4 2026' },
    { value: '2026-H1', label: 'H1 2026' },
    { value: '2026-H2', label: 'H2 2026' },
    { value: '2026',    label: 'Anual 2026' }
  ],

  // ── Render principal ────────────────────────────────────────────────────

  render() {
    // Deep link: #/okrs/tree → ativa tab tree
    if (typeof TBO_ROUTER !== 'undefined' && TBO_ROUTER._currentRoute) {
      const parts = TBO_ROUTER._currentRoute.split('/');
      if (parts.length > 1) {
        const tabHint = parts[1];
        const validTab = this._tabConfig.find(t => t.id === tabHint);
        if (validTab) this._tab = validTab.id;
      }
    }

    return `
      <style>${this._getStyles()}</style>
      <div class="ap-module">
        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">OKRs</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Objetivos e Key Results — alinhamento, progresso e check-ins</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <!-- Period selector -->
            <select id="okrPeriodSelector" class="form-input" style="padding:6px 10px;font-size:0.78rem;width:auto;border-radius:8px;">
              ${this._periodOptions.map(p =>
                `<option value="${p.value}" ${this._period === p.value ? 'selected' : ''}>${p.label}</option>`
              ).join('')}
            </select>
            <button class="btn btn-primary" id="okrNewBtn" style="font-size:0.82rem;padding:6px 14px;">
              <i data-lucide="plus" style="width:14px;height:14px;"></i> Novo OKR
            </button>
          </div>
        </div>

        <!-- Tabs -->
        <div class="ap-tabs">
          ${this._tabConfig.map(t => `
            <button class="ap-tab-btn ${this._tab === t.id ? 'active' : ''}" data-tab="${t.id}">
              <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
              ${t.label}
            </button>
          `).join('')}
        </div>

        <div id="okrTabContent">
          ${this._loading
            ? '<div style="text-align:center;padding:40px;"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:12px;">Carregando OKRs...</p></div>'
            : this._error
              ? this._renderError()
              : this._renderTab()}
        </div>

        ${this._renderModal()}
      </div>
    `;
  },

  // ── Error state ───────────────────────────────────────────────────────

  _renderError() {
    return `
      <div class="card" style="padding:48px;text-align:center;">
        <i data-lucide="shield-alert" style="width:48px;height:48px;color:var(--color-danger, #EF4444);margin-bottom:12px;"></i>
        <h3 style="margin:0 0 8px;font-size:1rem;">Erro ao carregar OKRs</h3>
        <p style="color:var(--text-muted);font-size:0.82rem;margin:0 0 8px;">
          ${this._esc(this._error)}
        </p>
        <p style="color:var(--text-muted);font-size:0.75rem;margin:0 0 16px;">
          Verifique se voce tem acesso ao tenant atual e se as tabelas de OKR foram criadas.
        </p>
        <button class="btn btn-primary" id="okrRetryBtn" style="font-size:0.82rem;">
          <i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Tentar novamente
        </button>
      </div>
    `;
  },

  // ── Delegacao de render para sub-modulos ─────────────────────────────

  _renderTab() {
    this._setupSubModule();

    switch (this._tab) {
      case 'dashboard':
        return typeof TBO_OKRS_DASHBOARD !== 'undefined' ? TBO_OKRS_DASHBOARD.render() : this._renderFallback('Dashboard');
      case 'tree':
        return typeof TBO_OKRS_TREE !== 'undefined' ? TBO_OKRS_TREE.render() : this._renderFallback('Alinhamento');
      case 'checkins':
        return typeof TBO_OKRS_CHECKINS !== 'undefined' ? TBO_OKRS_CHECKINS.render() : this._renderFallback('Check-ins');
      default: return '';
    }
  },

  _setupSubModule() {
    if (typeof TBO_OKRS_DASHBOARD !== 'undefined') {
      TBO_OKRS_DASHBOARD.setup(this);
      TBO_OKRS_DASHBOARD._kpis = this._kpis;
    }
    if (typeof TBO_OKRS_TREE !== 'undefined') TBO_OKRS_TREE.setup(this);
    if (typeof TBO_OKRS_CHECKINS !== 'undefined') TBO_OKRS_CHECKINS.setup(this);
  },

  _renderFallback(tabName) {
    return `<div class="card" style="padding:40px;text-align:center;">
      <p style="color:var(--text-muted);font-size:0.85rem;">Modulo "${tabName}" nao carregado. Verifique se o script esta incluido no index.html.</p>
    </div>`;
  },

  // ── Modal de criacao/edicao ──────────────────────────────────────────

  _renderModal() {
    if (!this._showModal) return '';

    const isEdit = this._showModal === 'editOKR';
    const d = this._modalData || {};
    const profiles = this._profiles || [];
    const objectives = this._objectives.filter(o => o.status === 'active');

    return `
      <div class="okr-modal-overlay" id="okrModalOverlay" style="position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:1000;display:flex;align-items:center;justify-content:center;">
        <div style="background:var(--bg-primary);border-radius:12px;padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,0.2);">
          <h3 style="margin:0 0 16px;font-size:1rem;">${isEdit ? 'Editar OKR' : 'Novo OKR'}</h3>

          <form id="okrForm">
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:0.78rem;">Titulo *</label>
              <input type="text" id="okrFTitle" class="form-input" value="${this._escAttr(d.title || '')}" required placeholder="Ex: Aumentar receita em 30%">
            </div>

            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label" style="font-size:0.78rem;">Descricao</label>
              <textarea id="okrFDesc" class="form-input" rows="2" placeholder="Contexto e motivacao do objetivo">${this._esc(d.description || '')}</textarea>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.78rem;">Nivel *</label>
                <select id="okrFLevel" class="form-input">
                  <option value="company" ${d.level === 'company' ? 'selected' : ''}>Empresa</option>
                  <option value="bu" ${d.level === 'bu' ? 'selected' : ''}>BU / Area</option>
                  <option value="personal" ${!d.level || d.level === 'personal' ? 'selected' : ''}>Pessoal</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.78rem;">BU</label>
                <input type="text" id="okrFBU" class="form-input" value="${this._escAttr(d.bu || '')}" placeholder="Ex: Arquitetura, Branding">
              </div>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
              <div class="form-group">
                <label class="form-label" style="font-size:0.78rem;">Periodo *</label>
                <select id="okrFPeriod" class="form-input">
                  ${this._periodOptions.map(p =>
                    `<option value="${p.value}" ${(d.period || this._period) === p.value ? 'selected' : ''}>${p.label}</option>`
                  ).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" style="font-size:0.78rem;">OKR Pai (opcional)</label>
                <select id="okrFParent" class="form-input">
                  <option value="">— Nenhum (raiz)</option>
                  ${objectives
                    .filter(o => o.id !== d.id)
                    .map(o => `<option value="${o.id}" ${d.parent_id === o.id ? 'selected' : ''}>${this._esc(o.title)} (${o.level})</option>`)
                    .join('')}
                </select>
              </div>
            </div>

            ${profiles.length > 0 ? `
              <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label" style="font-size:0.78rem;">Responsavel</label>
                <select id="okrFOwner" class="form-input">
                  ${profiles.map(p =>
                    `<option value="${p.id}" ${d.owner_id === p.id ? 'selected' : ''}>${this._esc(p.full_name || p.email)}</option>`
                  ).join('')}
                </select>
              </div>
            ` : ''}

            <!-- Key Results (for create, start with one) -->
            ${!isEdit ? `
              <div style="border-top:1px solid var(--border-default);margin-top:16px;padding-top:16px;">
                <h4 style="margin:0 0 12px;font-size:0.85rem;">Key Results</h4>
                <div id="okrKRContainer">
                  ${this._renderKRField(0)}
                </div>
                <button type="button" id="okrAddKR" class="btn btn-sm" style="font-size:0.75rem;margin-top:8px;">
                  <i data-lucide="plus" style="width:12px;height:12px;"></i> Adicionar Key Result
                </button>
              </div>
            ` : ''}

            <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;">
              <button type="button" id="okrModalCancel" class="btn">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                <i data-lucide="check" style="width:14px;height:14px;"></i>
                ${isEdit ? 'Salvar' : 'Criar OKR'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  _renderKRField(index) {
    return `
      <div class="okr-kr-field" data-kr-index="${index}" style="padding:10px;border:1px solid var(--border-default);border-radius:8px;margin-bottom:8px;">
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input type="text" class="form-input okr-kr-title" placeholder="Titulo do Key Result" style="flex:1;">
          <select class="form-input okr-kr-type" style="width:auto;">
            <option value="number">Numero</option>
            <option value="percentage">Percentual</option>
            <option value="currency">Monetario</option>
            <option value="boolean">Sim/Nao</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;">
          <input type="number" step="any" class="form-input okr-kr-target" placeholder="Meta" style="width:100px;">
          <input type="text" class="form-input okr-kr-unit" placeholder="Unidade (ex: leads, R$)" style="width:140px;">
        </div>
      </div>
    `;
  },

  // ── Init (first-time mount only) ──────────────────────────────────────

  async init() {
    this._bindAllEvents();

    // Load data only on first mount (no double render)
    if (!this._dataLoaded) {
      this._dataLoaded = true;
      await this._loadData();
      this._rerender();
    }
  },

  // ── Event Binding (separated from init to avoid recursion) ────────────

  _bindAllEvents() {
    // Tab navigation
    document.querySelectorAll('.ap-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        this._rerender();
      });
    });

    // Period selector
    const periodSel = document.getElementById('okrPeriodSelector');
    if (periodSel) {
      periodSel.addEventListener('change', async () => {
        this._period = periodSel.value;
        this._dataLoaded = false;
        await this._loadData();
        this._rerender();
      });
    }

    // New OKR button
    const newBtn = document.getElementById('okrNewBtn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        this._showModal = 'createOKR';
        this._modalData = { period: this._period };
        this._rerender();
      });
    }

    // Retry button (error state)
    const retryBtn = document.getElementById('okrRetryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', async () => {
        this._error = null;
        this._dataLoaded = false;
        await this._loadData();
        this._rerender();
      });
    }

    // Bind tab-specific events
    this._bindTabEvents();

    // Bind modal events
    this._bindModalEvents();
  },

  _bindTabEvents() {
    switch (this._tab) {
      case 'dashboard':
        if (typeof TBO_OKRS_DASHBOARD !== 'undefined') TBO_OKRS_DASHBOARD.bind();
        break;
      case 'tree':
        if (typeof TBO_OKRS_TREE !== 'undefined') TBO_OKRS_TREE.bind();
        break;
      case 'checkins':
        if (typeof TBO_OKRS_CHECKINS !== 'undefined') TBO_OKRS_CHECKINS.bind();
        break;
    }
  },

  _bindModalEvents() {
    // Cancel
    const cancelBtn = document.getElementById('okrModalCancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this._showModal = null;
        this._modalData = {};
        this._rerender();
      });
    }

    // Overlay click
    const overlay = document.getElementById('okrModalOverlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this._showModal = null;
          this._modalData = {};
          this._rerender();
        }
      });
    }

    // Add KR button
    const addKR = document.getElementById('okrAddKR');
    if (addKR) {
      addKR.addEventListener('click', () => {
        const container = document.getElementById('okrKRContainer');
        if (container) {
          const idx = container.children.length;
          container.insertAdjacentHTML('beforeend', this._renderKRField(idx));
          this._scopedCreateIcons();
        }
      });
    }

    // Form submit
    const form = document.getElementById('okrForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this._handleFormSubmit();
      });
    }
  },

  // ── Data Loading (parallelized, no redundant KPI query) ───────────────

  async _loadData() {
    if (typeof OkrsRepo === 'undefined') {
      console.warn('[OKRs] OkrsRepo nao disponivel');
      this._error = 'Modulo OkrsRepo nao disponivel. Verifique se o script esta carregado.';
      this._loading = false;
      return;
    }

    try {
      this._loading = true;
      this._error = null;

      // Parallel: load objectives tree + profiles at the same time
      const promises = [OkrsRepo.getTree(this._period)];

      const needProfiles = this._profiles.length === 0 && typeof PeopleRepo !== 'undefined';
      if (needProfiles) {
        promises.push(PeopleRepo.list({ is_active: true, limit: 200 }));
      }

      const results = await Promise.allSettled(promises);

      // Process tree result
      const treeResult = results[0];
      if (treeResult.status === 'fulfilled') {
        this._objectives = treeResult.value || [];
      } else {
        const errMsg = treeResult.reason?.message || 'Erro desconhecido';
        console.error('[OKRs] Erro ao carregar objectives:', treeResult.reason);

        // Detect RLS / permission errors
        if (errMsg.includes('permission') || errMsg.includes('RLS') || errMsg.includes('policy') ||
            errMsg.includes('denied') || errMsg.includes('42501') || errMsg.includes('tenant')) {
          this._error = 'Sem permissao para acessar OKRs. Verifique se voce esta vinculado a um tenant.';
        } else if (errMsg.includes('does not exist') || errMsg.includes('42P01') || errMsg.includes('relation')) {
          this._error = 'Tabelas de OKR nao encontradas. Execute a migration 056_okrs.sql no Supabase.';
        } else {
          this._error = 'Erro ao carregar OKRs: ' + errMsg;
        }
        this._objectives = [];
        this._loading = false;
        return;
      }

      // Process profiles result
      if (needProfiles && results[1]) {
        const profileResult = results[1];
        if (profileResult.status === 'fulfilled' && profileResult.value) {
          this._profiles = profileResult.value;
        }
      }

      // Compute KPIs from tree data (eliminates extra Supabase query)
      this._kpis = this._computeKPIs(this._objectives);

      // Auto-flag at risk KRs
      this._autoFlagRisk();

      this._loading = false;
    } catch (err) {
      console.error('[OKRs] Erro ao carregar dados:', err);
      this._loading = false;
      this._error = 'Erro ao carregar dados: ' + (err.message || 'Verifique sua conexao');
    }
  },

  /**
   * Compute KPIs from already-loaded tree data (no extra query)
   */
  _computeKPIs(objectives) {
    const activeObjs = objectives.filter(o => o.status === 'active');

    let totalKRs = 0;
    let atRisk = 0;
    let behind = 0;
    let onTrack = 0;

    activeObjs.forEach(obj => {
      const krs = (obj.okr_key_results || []).filter(k => k.status === 'active');
      totalKRs += krs.length;
      krs.forEach(kr => {
        if (kr.confidence === 'at_risk') atRisk++;
        else if (kr.confidence === 'behind') behind++;
        else if (kr.confidence === 'on_track') onTrack++;
      });
    });

    const avgProgress = activeObjs.length > 0
      ? activeObjs.reduce((sum, o) => sum + Number(o.progress || 0), 0) / activeObjs.length
      : 0;

    return {
      totalObjectives: activeObjs.length,
      avgProgress: Math.round(avgProgress * 100) / 100,
      atRiskCount: atRisk,
      behindCount: behind,
      onTrackCount: onTrack,
      totalKRs
    };
  },

  /**
   * Auto-flag KRs at risk based on progress vs time elapsed
   */
  _autoFlagRisk() {
    const now = new Date();
    const quarter = parseInt(this._period.split('Q')[1]);
    if (!quarter) return;

    // Quarter boundaries
    const qStart = new Date(2026, (quarter - 1) * 3, 1);
    const qEnd = new Date(2026, quarter * 3, 0);
    const elapsed = (now - qStart) / (qEnd - qStart);

    if (elapsed < 0.5) return; // Only flag after 50% of quarter

    this._objectives.forEach(obj => {
      const krs = obj.okr_key_results || [];
      krs.forEach(kr => {
        if (kr.status !== 'active') return;
        const range = Number(kr.target_value) - Number(kr.start_value || 0);
        if (range <= 0) return;
        const current = Number(kr.current_value || 0) - Number(kr.start_value || 0);
        const pct = (current / range) * 100;
        // If less than half progress at more than half time
        if (pct < (elapsed * 50) && kr.confidence === 'on_track') {
          kr._autoFlagged = true;
        }
      });
    });
  },

  // ── Form Submit ─────────────────────────────────────────────────────

  async _handleFormSubmit() {
    if (typeof OkrsRepo === 'undefined') return;

    const title = document.getElementById('okrFTitle')?.value?.trim();
    const description = document.getElementById('okrFDesc')?.value?.trim();
    const level = document.getElementById('okrFLevel')?.value;
    const bu = document.getElementById('okrFBU')?.value?.trim();
    const period = document.getElementById('okrFPeriod')?.value;
    const parent_id = document.getElementById('okrFParent')?.value || null;
    const owner_id = document.getElementById('okrFOwner')?.value || null;

    if (!title) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Titulo e obrigatorio');
      return;
    }

    try {
      // Create objective
      const obj = await OkrsRepo.createObjective({
        title,
        description,
        owner_id,
        period,
        level,
        bu: bu || null,
        parent_id: parent_id || null
      });

      // Create KRs
      const krFields = document.querySelectorAll('.okr-kr-field');
      for (const field of krFields) {
        const krTitle = field.querySelector('.okr-kr-title')?.value?.trim();
        const krType = field.querySelector('.okr-kr-type')?.value;
        const krTarget = parseFloat(field.querySelector('.okr-kr-target')?.value);
        const krUnit = field.querySelector('.okr-kr-unit')?.value?.trim();

        if (krTitle && !isNaN(krTarget)) {
          await OkrsRepo.createKeyResult({
            objective_id: obj.id,
            title: krTitle,
            metric_type: krType,
            target_value: krTarget,
            unit: krUnit || null,
            owner_id: owner_id
          });
        }
      }

      this._showModal = null;
      this._modalData = {};

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('OKR Criado', title);

      // Reload
      this._dataLoaded = false;
      await this._loadData();
      this._rerender();

    } catch (err) {
      console.error('[OKRs] Erro ao criar OKR:', err);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', err.message || 'Falha ao criar OKR');
    }
  },

  // ── Rerender (no recursive init — just DOM + events) ──────────────────

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this._bindAllEvents();
      this._scopedCreateIcons();
    }
  },

  // ── Scoped icon creation (only scans module container) ────────────────

  _scopedCreateIcons() {
    if (typeof lucide !== 'undefined') {
      try {
        const root = document.getElementById('moduleContainer');
        lucide.createIcons(root ? { root } : undefined);
      } catch (e) { /* ignore lucide errors */ }
    }
  },

  // ── Destroy ──────────────────────────────────────────────────────────

  destroy() {
    this._tab = 'dashboard';
    this._loading = false;
    this._dataLoaded = false;
    this._error = null;
    this._objectives = [];
    this._kpis = null;
    this._showModal = null;
    this._modalData = {};
    this._profiles = [];

    // Destroy sub-modules
    if (typeof TBO_OKRS_DASHBOARD !== 'undefined' && TBO_OKRS_DASHBOARD.destroy) TBO_OKRS_DASHBOARD.destroy();
    if (typeof TBO_OKRS_TREE !== 'undefined' && TBO_OKRS_TREE.destroy) TBO_OKRS_TREE.destroy();
    if (typeof TBO_OKRS_CHECKINS !== 'undefined' && TBO_OKRS_CHECKINS.destroy) TBO_OKRS_CHECKINS.destroy();
  },

  // ── CSS ──────────────────────────────────────────────────────────────

  _getStyles() {
    return `
      .ap-module { max-width: 1200px; }

      .ap-tabs {
        display: flex; gap: 2px; margin-bottom: 20px;
        border-bottom: 2px solid var(--border-default);
        overflow-x: auto;
      }
      .ap-tab-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 10px 16px; border: none; background: none;
        font-size: 0.82rem; font-weight: 500;
        color: var(--text-secondary);
        border-bottom: 2px solid transparent;
        margin-bottom: -2px; cursor: pointer;
        transition: all 0.15s; white-space: nowrap;
      }
      .ap-tab-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }
      .ap-tab-btn.active { color: var(--brand-primary); border-bottom-color: var(--brand-primary); font-weight: 600; }

      .okr-badge {
        font-size: 0.62rem; padding: 1px 6px; border-radius: 10px; font-weight: 600;
      }
      .okr-badge--company { background: rgba(139,92,246,0.12); color: #8B5CF6; }
      .okr-badge--bu { background: rgba(59,130,246,0.12); color: #3B82F6; }
      .okr-badge--personal { background: rgba(34,197,94,0.12); color: #22C55E; }

      .okr-tree-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.06); }

      @media (max-width: 768px) {
        .grid-4 { grid-template-columns: 1fr 1fr !important; }
      }
    `;
  },

  // ── Helpers ──────────────────────────────────────────────────────────

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  _escAttr(s) {
    if (!s) return '';
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS = TBO_OKRS;
}
