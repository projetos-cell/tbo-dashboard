// TBO OS — Module: Quadro de Projetos
// Board view com dados do Supabase (projects + demands/Notion sync)
const TBO_QUADRO_PROJETOS = {

  _data: { projects: [], demands: [] },
  _filters: { status: 'all', construtora: '', bus: '', search: '' },
  _view: 'board', // 'board' | 'list'
  _loaded: false,

  // ── Status config ──────────────────────────────────────────────────────────
  _STATUS: {
    em_andamento: { label: 'Em Andamento', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: 'play-circle' },
    producao:     { label: 'Em Produção',  color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: 'zap' },
    finalizado:   { label: 'Finalizado',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: 'check-circle-2' },
    parado:       { label: 'Parado',       color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  icon: 'pause-circle' },
    pausado:      { label: 'Pausado',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: 'clock' },
  },

  // ── BU badge colors ────────────────────────────────────────────────────────
  _BU_COLORS: {
    'Branding':    { bg: '#fef3c7', color: '#92400e' },
    'Digital 3D':  { bg: '#ede9fe', color: '#5b21b6' },
    'Marketing':   { bg: '#d1fae5', color: '#065f46' },
    'Audiovisual': { bg: '#fce7f3', color: '#9d174d' },
    'Interiores':  { bg: '#e0f2fe', color: '#0c4a6e' },
  },

  // ── Entry point ────────────────────────────────────────────────────────────
  render() {
    this._loaded = false;
    setTimeout(() => this._load(), 0);
    return `
      <div class="quadro-projetos-module" id="quadroProjetos">
        <div class="qp-toolbar">
          <div class="qp-title">
            <i data-lucide="layout-dashboard" style="width:18px;height:18px;"></i>
            Quadro de Projetos
          </div>
          <div class="qp-toolbar-actions">
            <input type="text" class="qp-search" id="qpSearch" placeholder="Buscar projeto..." autocomplete="off">
            <select class="qp-filter" id="qpFilterStatus">
              <option value="all">Todos os status</option>
              <option value="em_andamento">Em Andamento</option>
              <option value="producao">Em Produção</option>
              <option value="parado">Parado</option>
              <option value="pausado">Pausado</option>
              <option value="finalizado">Finalizado</option>
            </select>
            <select class="qp-filter" id="qpFilterBU">
              <option value="">Todas as BUs</option>
              <option value="Branding">Branding</option>
              <option value="Digital 3D">Digital 3D</option>
              <option value="Marketing">Marketing</option>
              <option value="Audiovisual">Audiovisual</option>
              <option value="Interiores">Interiores</option>
            </select>
            <select class="qp-filter" id="qpFilterConstrutora">
              <option value="">Todas as construtoras</option>
            </select>
            <div class="qp-view-toggle">
              <button class="qp-view-btn active" id="qpViewBoard" title="Quadro Kanban">
                <i data-lucide="layout-grid" style="width:15px;height:15px;"></i>
              </button>
              <button class="qp-view-btn" id="qpViewList" title="Lista">
                <i data-lucide="list" style="width:15px;height:15px;"></i>
              </button>
            </div>
          </div>
        </div>

        <div id="qpKpis" class="qp-kpis">
          ${this._renderKpiSkeleton()}
        </div>

        <div id="qpContent" class="qp-content">
          ${this._renderLoadingSkeleton()}
        </div>
      </div>
    `;
  },

  async _load() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) {
      document.getElementById('qpContent').innerHTML = this._renderError('Supabase não disponível');
      return;
    }

    // Obter tenant_id via async para garantir resolução (mesmo padrão de outros módulos)
    let tid = null;
    try {
      if (typeof RepoBase !== 'undefined' && RepoBase.resolveTenantId) {
        tid = await RepoBase.resolveTenantId();
      } else if (typeof RepoBase !== 'undefined' && RepoBase.requireTenantId) {
        tid = RepoBase.requireTenantId();
      } else if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.getCurrentTenantId) {
        tid = TBO_SUPABASE.getCurrentTenantId();
      }
    } catch (_e) { /* sem tenant_id — RLS vai filtrar pelo auth */ }

    try {
      // Projetos — tenta com colunas completas (pós-migration 028)
      // Se falhar por coluna inexistente, cai no fallback com colunas básicas
      const FULL_COLS   = 'id,name,status,construtora,bus,owner_name,due_date_start,due_date_end,notion_url,code,notion_page_id,tenant_id';
      const BASIC_COLS  = 'id,name,status,owner_name,tenant_id';

      let projRes = null;

      // Tentativa 1: colunas completas
      let q1 = client.from('projects').select(FULL_COLS).order('name');
      if (tid) q1 = q1.eq('tenant_id', tid);
      projRes = await q1;

      // Se der erro de schema/coluna, tenta colunas básicas
      if (projRes.error && (
        projRes.error.code === 'PGRST204' ||
        projRes.error.message?.includes('schema cache') ||
        projRes.error.message?.includes('column') ||
        projRes.error.message?.includes('does not exist')
      )) {
        console.warn('[TBO QP] Colunas completas indisponíveis, usando básicas:', projRes.error.message);
        let q2 = client.from('projects').select(BASIC_COLS).order('name');
        if (tid) q2 = q2.eq('tenant_id', tid);
        projRes = await q2;
      }

      if (projRes.error) throw projRes.error;
      this._data.projects = projRes.data || [];

      // Demandas — opcional (tabela pode não existir em todos os tenants)
      try {
        let demQuery = client.from('demands')
          .select('id,title,status,due_date,responsible,bus,project_id,notion_url')
          .order('due_date', { ascending: true });
        if (tid) demQuery = demQuery.eq('tenant_id', tid);

        const demRes = await demQuery;
        this._data.demands = demRes.error ? [] : (demRes.data || []);
        if (demRes.error) console.warn('[TBO QP] demands não disponível:', demRes.error.message);
      } catch (_e) {
        this._data.demands = [];
        console.warn('[TBO QP] demands indisponível:', _e.message);
      }

      this._loaded = true;
      this._populateConstrutoraFilter();
      this._renderKpis();
      this._renderContent();
      this._bindEvents();

      if (typeof lucide !== 'undefined') lucide.createIcons();
    } catch (err) {
      console.error('[TBO QP] Load error:', err);
      document.getElementById('qpContent').innerHTML = this._renderError(err.message || 'Erro ao carregar dados');
    }
  },

  // ── Filters & helpers ──────────────────────────────────────────────────────
  _filtered() {
    const { status, construtora, bus, search } = this._filters;
    return this._data.projects.filter(p => {
      if (status !== 'all' && p.status !== status) return false;
      if (construtora && p.construtora !== construtora) return false;
      if (bus) {
        const pBus = Array.isArray(p.bus) ? p.bus : (p.bus ? JSON.parse(p.bus) : []);
        if (!pBus.includes(bus)) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!(p.name||'').toLowerCase().includes(q) && !(p.construtora||'').toLowerCase().includes(q)) return false;
      }
      return true;
    });
  },

  _demandsForProject(projectId) {
    return this._data.demands.filter(d => d.project_id === projectId);
  },

  _parseBus(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
  },

  _statusInfo(status) {
    return this._STATUS[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: 'circle' };
  },

  // ── Populate construtora filter ────────────────────────────────────────────
  _populateConstrutoraFilter() {
    const sel = document.getElementById('qpFilterConstrutora');
    if (!sel) return;
    const unique = [...new Set(this._data.projects.map(p => p.construtora).filter(Boolean))].sort();
    unique.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      sel.appendChild(opt);
    });
  },

  // ── KPIs ────────────────────────────────────────────────────────────────────
  _renderKpis() {
    const p = this._data.projects;
    const d = this._data.demands;
    const counts = {
      total: p.length,
      em_andamento: p.filter(x => x.status === 'em_andamento').length,
      producao: p.filter(x => x.status === 'producao').length,
      finalizado: p.filter(x => x.status === 'finalizado').length,
      parado: p.filter(x => x.status === 'parado' || x.status === 'pausado').length,
    };
    const demandas_total = d.length;
    const demandas_abertas = d.filter(x => x.status !== 'Concluído' && x.status !== 'Cancelado').length;

    const kpis = [
      { label: 'Total Projetos', value: counts.total, icon: 'folder', color: '#6b7280' },
      { label: 'Em Andamento', value: counts.em_andamento, icon: 'play-circle', color: '#3b82f6' },
      { label: 'Em Produção', value: counts.producao, icon: 'zap', color: '#8b5cf6' },
      { label: 'Finalizados', value: counts.finalizado, icon: 'check-circle-2', color: '#22c55e' },
      { label: 'Parados/Pausados', value: counts.parado, icon: 'pause-circle', color: '#f59e0b' },
      { label: 'Demandas Abertas', value: demandas_abertas, icon: 'clipboard-list', color: '#ec4899', sub: `de ${demandas_total}` },
    ];

    const el = document.getElementById('qpKpis');
    if (!el) return;
    el.innerHTML = kpis.map(k => `
      <div class="qp-kpi-card">
        <div class="qp-kpi-icon" style="color:${k.color};">
          <i data-lucide="${k.icon}" style="width:18px;height:18px;"></i>
        </div>
        <div class="qp-kpi-body">
          <div class="qp-kpi-value" style="color:${k.color};">${k.value}</div>
          <div class="qp-kpi-label">${k.label}</div>
          ${k.sub ? `<div class="qp-kpi-sub">${k.sub}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  // ── Main content ───────────────────────────────────────────────────────────
  _renderContent() {
    const el = document.getElementById('qpContent');
    if (!el) return;
    el.innerHTML = this._view === 'board' ? this._renderBoard() : this._renderList();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── BOARD VIEW ─────────────────────────────────────────────────────────────
  _renderBoard() {
    const statusOrder = ['em_andamento', 'producao', 'pausado', 'parado', 'finalizado'];
    const filtered = this._filtered();

    const columns = statusOrder.map(s => {
      const info = this._statusInfo(s);
      const cards = filtered.filter(p => p.status === s);
      return { status: s, info, cards };
    });

    return `
      <div class="qp-board">
        ${columns.map(col => `
          <div class="qp-column">
            <div class="qp-column-header" style="border-top:3px solid ${col.info.color};">
              <span class="qp-column-title">
                <i data-lucide="${col.info.icon}" style="width:14px;height:14px;color:${col.info.color};"></i>
                ${col.info.label}
              </span>
              <span class="qp-column-count" style="background:${col.info.bg};color:${col.info.color};">${col.cards.length}</span>
            </div>
            <div class="qp-column-body">
              ${col.cards.length === 0
                ? `<div class="qp-empty-col">Nenhum projeto</div>`
                : col.cards.map(p => this._renderProjectCard(p)).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  _renderProjectCard(p) {
    const bus = this._parseBus(p.bus);
    const demands = this._demandsForProject(p.id);
    const openDemands = demands.filter(d => d.status !== 'Concluído' && d.status !== 'Cancelado');
    const info = this._statusInfo(p.status);
    const due = p.due_date_start ? this._fmtDate(p.due_date_start) : (p.due_date_end ? this._fmtDate(p.due_date_end) : null);

    return `
      <div class="qp-card" data-id="${p.id}" onclick="TBO_QUADRO_PROJETOS._openDetail('${p.id}')">
        <div class="qp-card-header">
          <div class="qp-card-name">${this._esc(p.name)}</div>
          ${p.notion_url ? `<a href="${p.notion_url}" target="_blank" class="qp-notion-link" onclick="event.stopPropagation()" title="Abrir no Notion">
            <i data-lucide="external-link" style="width:12px;height:12px;"></i>
          </a>` : ''}
        </div>
        ${p.construtora ? `<div class="qp-card-construtora">${this._esc(p.construtora)}</div>` : ''}
        <div class="qp-card-meta">
          ${bus.map(b => {
            const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' };
            return `<span class="qp-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`;
          }).join('')}
        </div>
        <div class="qp-card-footer">
          <div class="qp-card-info">
            ${p.owner_name ? `<span class="qp-owner"><i data-lucide="user" style="width:11px;height:11px;"></i>${this._esc(p.owner_name)}</span>` : ''}
            ${due ? `<span class="qp-due"><i data-lucide="calendar" style="width:11px;height:11px;"></i>${due}</span>` : ''}
          </div>
          ${demands.length > 0 ? `
            <div class="qp-demands-badge" title="${openDemands.length} demandas abertas / ${demands.length} total">
              <i data-lucide="clipboard-list" style="width:11px;height:11px;"></i>
              <span>${openDemands.length}/${demands.length}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  _renderList() {
    const filtered = this._filtered();
    if (filtered.length === 0) return `<div class="qp-empty">Nenhum projeto encontrado.</div>`;

    return `
      <div class="qp-list">
        <table class="qp-table">
          <thead>
            <tr>
              <th>Projeto</th>
              <th>Construtora</th>
              <th>Status</th>
              <th>BUs</th>
              <th>Responsável</th>
              <th>Prazo</th>
              <th>Demandas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => this._renderListRow(p)).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderListRow(p) {
    const bus = this._parseBus(p.bus);
    const demands = this._demandsForProject(p.id);
    const openDemands = demands.filter(d => d.status !== 'Concluído' && d.status !== 'Cancelado');
    const info = this._statusInfo(p.status);
    const due = p.due_date_start ? this._fmtDate(p.due_date_start) : (p.due_date_end ? this._fmtDate(p.due_date_end) : '—');

    return `
      <tr class="qp-row" onclick="TBO_QUADRO_PROJETOS._openDetail('${p.id}')" style="cursor:pointer;">
        <td class="qp-row-name">
          <span class="qp-row-name-text">${this._esc(p.name)}</span>
          ${p.code ? `<span class="qp-row-code">${p.code}</span>` : ''}
        </td>
        <td>${this._esc(p.construtora || '—')}</td>
        <td>
          <span class="qp-status-pill" style="background:${info.bg};color:${info.color};">
            <i data-lucide="${info.icon}" style="width:11px;height:11px;"></i>
            ${info.label}
          </span>
        </td>
        <td>
          <div style="display:flex;gap:3px;flex-wrap:wrap;">
            ${bus.map(b => {
              const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' };
              return `<span class="qp-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`;
            }).join('')}
          </div>
        </td>
        <td>${this._esc(p.owner_name || '—')}</td>
        <td>${due}</td>
        <td>
          ${demands.length > 0
            ? `<span class="qp-demands-pill">${openDemands.length} abertas / ${demands.length}</span>`
            : '<span style="color:var(--text-muted);">—</span>'}
        </td>
        <td>
          ${p.notion_url ? `<a href="${p.notion_url}" target="_blank" class="qp-notion-link" onclick="event.stopPropagation()" title="Abrir no Notion">
            <i data-lucide="external-link" style="width:13px;height:13px;"></i>
          </a>` : ''}
        </td>
      </tr>
    `;
  },

  // ── Detail panel ───────────────────────────────────────────────────────────
  _openDetail(projectId) {
    const p = this._data.projects.find(x => x.id === projectId);
    if (!p) return;

    const demands = this._demandsForProject(projectId);
    const bus = this._parseBus(p.bus);
    const info = this._statusInfo(p.status);

    // Remove existing panel
    document.getElementById('qpDetailPanel')?.remove();

    const panel = document.createElement('div');
    panel.id = 'qpDetailPanel';
    panel.className = 'qp-detail-panel';
    panel.innerHTML = `
      <div class="qp-detail-overlay" onclick="document.getElementById('qpDetailPanel')?.remove()"></div>
      <div class="qp-detail-drawer">
        <div class="qp-detail-header">
          <div class="qp-detail-title">
            <span class="qp-status-pill" style="background:${info.bg};color:${info.color};">
              <i data-lucide="${info.icon}" style="width:12px;height:12px;"></i>
              ${info.label}
            </span>
            <h2>${this._esc(p.name)}</h2>
          </div>
          <button class="qp-detail-close" onclick="document.getElementById('qpDetailPanel')?.remove()">
            <i data-lucide="x" style="width:18px;height:18px;"></i>
          </button>
        </div>

        <div class="qp-detail-body">
          <div class="qp-detail-section">
            <div class="qp-detail-row">
              <span class="qp-detail-label">Construtora</span>
              <span class="qp-detail-value">${this._esc(p.construtora || '—')}</span>
            </div>
            ${p.code ? `<div class="qp-detail-row">
              <span class="qp-detail-label">Código</span>
              <span class="qp-detail-value">${this._esc(p.code)}</span>
            </div>` : ''}
            ${p.owner_name ? `<div class="qp-detail-row">
              <span class="qp-detail-label">Responsável</span>
              <span class="qp-detail-value">${this._esc(p.owner_name)}</span>
            </div>` : ''}
            <div class="qp-detail-row">
              <span class="qp-detail-label">BUs</span>
              <span class="qp-detail-value" style="display:flex;gap:4px;flex-wrap:wrap;">
                ${bus.map(b => {
                  const bc = this._BU_COLORS[b] || { bg: '#f3f4f6', color: '#374151' };
                  return `<span class="qp-bu-tag" style="background:${bc.bg};color:${bc.color};">${b}</span>`;
                }).join('') || '—'}
              </span>
            </div>
            ${(p.due_date_start || p.due_date_end) ? `<div class="qp-detail-row">
              <span class="qp-detail-label">Período</span>
              <span class="qp-detail-value">${p.due_date_start ? this._fmtDate(p.due_date_start) : '?'} → ${p.due_date_end ? this._fmtDate(p.due_date_end) : '?'}</span>
            </div>` : ''}
            ${p.notion_url ? `<div class="qp-detail-row">
              <span class="qp-detail-label">Notion</span>
              <a href="${p.notion_url}" target="_blank" class="qp-detail-link">
                <i data-lucide="external-link" style="width:12px;height:12px;"></i>
                Abrir no Notion
              </a>
            </div>` : ''}
          </div>

          <div class="qp-detail-demands">
            <div class="qp-detail-section-title">
              <i data-lucide="clipboard-list" style="width:14px;height:14px;"></i>
              Demandas (${demands.length})
            </div>
            ${demands.length === 0
              ? `<div class="qp-empty" style="padding:12px 0;font-size:0.8rem;">Nenhuma demanda registrada.</div>`
              : `<div class="qp-demands-list">
                  ${demands.map(d => {
                    const dinfo = d.status === 'Concluído'
                      ? { color: '#22c55e', bg: 'rgba(34,197,94,0.1)' }
                      : d.status === 'Em andamento'
                      ? { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' }
                      : d.status === 'Cancelado'
                      ? { color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' }
                      : { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
                    return `
                      <div class="qp-demand-item">
                        <div class="qp-demand-info">
                          <span class="qp-demand-title">${this._esc(d.title)}</span>
                          <span class="qp-demand-status" style="background:${dinfo.bg};color:${dinfo.color};">${this._esc(d.status || '—')}</span>
                        </div>
                        <div class="qp-demand-meta">
                          ${d.responsible ? `<span><i data-lucide="user" style="width:10px;height:10px;"></i>${this._esc(d.responsible)}</span>` : ''}
                          ${d.due_date ? `<span><i data-lucide="calendar" style="width:10px;height:10px;"></i>${this._fmtDate(d.due_date)}</span>` : ''}
                          ${d.notion_url ? `<a href="${d.notion_url}" target="_blank" onclick="event.stopPropagation()" class="qp-notion-link">
                            <i data-lucide="external-link" style="width:10px;height:10px;"></i>
                          </a>` : ''}
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>`
            }
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);
    if (typeof lucide !== 'undefined') lucide.createIcons();
  },

  // ── Event bindings ─────────────────────────────────────────────────────────
  _bindEvents() {
    const search = document.getElementById('qpSearch');
    const filterStatus = document.getElementById('qpFilterStatus');
    const filterBU = document.getElementById('qpFilterBU');
    const filterConst = document.getElementById('qpFilterConstrutora');
    const btnBoard = document.getElementById('qpViewBoard');
    const btnList = document.getElementById('qpViewList');

    if (search) {
      search.addEventListener('input', e => {
        this._filters.search = e.target.value.trim();
        this._renderContent();
      });
    }
    if (filterStatus) {
      filterStatus.addEventListener('change', e => {
        this._filters.status = e.target.value;
        this._renderContent();
      });
    }
    if (filterBU) {
      filterBU.addEventListener('change', e => {
        this._filters.bus = e.target.value;
        this._renderContent();
      });
    }
    if (filterConst) {
      filterConst.addEventListener('change', e => {
        this._filters.construtora = e.target.value;
        this._renderContent();
      });
    }
    if (btnBoard) {
      btnBoard.addEventListener('click', () => {
        this._view = 'board';
        btnBoard.classList.add('active');
        btnList?.classList.remove('active');
        this._renderContent();
      });
    }
    if (btnList) {
      btnList.addEventListener('click', () => {
        this._view = 'list';
        btnList.classList.add('active');
        btnBoard?.classList.remove('active');
        this._renderContent();
      });
    }
  },

  // ── Skeletons / error ──────────────────────────────────────────────────────
  _renderKpiSkeleton() {
    return Array(6).fill(0).map(() => `
      <div class="qp-kpi-card" style="opacity:.4;">
        <div class="skeleton" style="width:36px;height:36px;border-radius:8px;"></div>
        <div class="qp-kpi-body">
          <div class="skeleton" style="width:32px;height:24px;border-radius:4px;margin-bottom:4px;"></div>
          <div class="skeleton" style="width:80px;height:12px;border-radius:3px;"></div>
        </div>
      </div>
    `).join('');
  },

  _renderLoadingSkeleton() {
    return `<div style="display:flex;gap:12px;padding:8px 0;">
      ${Array(5).fill(0).map(() => `
        <div style="flex:1;min-width:160px;background:var(--bg-secondary);border-radius:10px;padding:12px;">
          <div class="skeleton" style="height:14px;width:70%;border-radius:4px;margin-bottom:16px;"></div>
          ${Array(3).fill(0).map(() => `
            <div class="skeleton" style="height:72px;border-radius:8px;margin-bottom:8px;"></div>
          `).join('')}
        </div>
      `).join('')}
    </div>`;
  },

  _renderError(msg) {
    return `<div class="qp-error">
      <i data-lucide="alert-circle" style="width:20px;height:20px;color:#ef4444;"></i>
      <span>Erro ao carregar: ${this._esc(msg)}</span>
    </div>`;
  },

  // ── Utils ──────────────────────────────────────────────────────────────────
  _esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  },

  _fmtDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso.slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso.slice(0, 10); }
  },

  init() { /* router calls render() */ }
};
