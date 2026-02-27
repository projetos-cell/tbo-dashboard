// ============================================================================
// TBO OS — OKRs: Tab Alinhamento (Tree) v2.0 — Qulture-Inspired
// Arvore hierarquica com cards elegantes, expand/collapse, progress bars
// ============================================================================

const TBO_OKRS_TREE = {

  _portal: null,
  _expandedNodes: new Set(),
  _filterBU: '',

  setup(portal) {
    this._portal = portal;
  },

  render() {
    const p = this._portal;
    const objectives = p ? p.getFilteredObjectives() : [];
    const tree = this._buildTree(objectives);
    const bus = [...new Set((p ? p._objectives : []).map(o => o.bu).filter(Boolean))];

    // Summary stats
    const totalActive = objectives.filter(o => o.status === 'active').length;
    const expandedCount = this._expandedNodes.size;

    return `
      <!-- Toolbar -->
      <div class="okr-tree-toolbar">
        <div class="okr-tree-toolbar-left">
          ${bus.length > 0 ? `
            <select id="okrFilterBU" class="okr-filter-select">
              <option value="">Todas as areas</option>
              ${bus.map(b => `<option value="${this._esc(b)}" ${this._filterBU === b ? 'selected' : ''}>${this._esc(b)}</option>`).join('')}
            </select>
          ` : ''}
          <span class="okr-tree-count">${totalActive} objetivo${totalActive !== 1 ? 's' : ''}</span>
        </div>
        <div class="okr-tree-toolbar-right">
          <button class="okr-btn-icon" id="okrExpandAll" title="Expandir todos">
            <i data-lucide="chevrons-down" style="width:14px;height:14px;"></i>
          </button>
          <button class="okr-btn-icon" id="okrCollapseAll" title="Colapsar todos">
            <i data-lucide="chevrons-up" style="width:14px;height:14px;"></i>
          </button>
        </div>
      </div>

      <!-- Tree -->
      <div class="okr-tree-container" id="okrTreeContainer">
        ${tree.length === 0 ? this._renderEmptyState() : tree.map(node => this._renderTreeNode(node, 0)).join('')}
      </div>
    `;
  },

  bind() {
    // Toggle expand/collapse
    document.querySelectorAll('.okr-tree-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.objId;
        if (this._expandedNodes.has(id)) {
          this._expandedNodes.delete(id);
        } else {
          this._expandedNodes.add(id);
        }
        this._portal._rerender();
      });
    });

    // Card click = toggle
    document.querySelectorAll('.okr-tree-card-main').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.objId;
        if (id) {
          if (this._expandedNodes.has(id)) this._expandedNodes.delete(id);
          else this._expandedNodes.add(id);
          this._portal._rerender();
        }
      });
    });

    // Filter BU
    const filterBU = document.getElementById('okrFilterBU');
    if (filterBU) {
      filterBU.addEventListener('change', () => {
        this._filterBU = filterBU.value;
        this._portal._rerender();
      });
    }

    // Expand/Collapse all
    const expandBtn = document.getElementById('okrExpandAll');
    if (expandBtn) {
      expandBtn.addEventListener('click', () => {
        const objs = this._portal ? this._portal._objectives : [];
        objs.forEach(o => this._expandedNodes.add(o.id));
        this._portal._rerender();
      });
    }
    const collapseBtn = document.getElementById('okrCollapseAll');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        this._expandedNodes.clear();
        this._portal._rerender();
      });
    }
  },

  _buildTree(objectives) {
    let filtered = [...objectives];

    if (this._filterBU) {
      filtered = filtered.filter(o => o.bu === this._filterBU);
    }

    const map = {};
    filtered.forEach(o => {
      map[o.id] = { ...o, children: [], krs: o.okr_key_results || [] };
    });

    const roots = [];
    filtered.forEach(o => {
      const node = map[o.id];
      if (o.parent_id && map[o.parent_id]) {
        map[o.parent_id].children.push(node);
      } else {
        roots.push(node);
      }
    });

    const levelOrder = { company: 0, bu: 1, personal: 2 };
    roots.sort((a, b) => (levelOrder[a.level] || 3) - (levelOrder[b.level] || 3));

    return roots;
  },

  _renderTreeNode(node, depth) {
    const isExpanded = this._expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0 || node.krs.length > 0;
    const progress = Number(node.progress || 0);

    const levelConfig = {
      company:  { color: '#7c3aed', bg: 'rgba(139,92,246,0.1)', label: 'Company', border: 'rgba(139,92,246,0.3)' },
      bu:       { color: '#2563eb', bg: 'rgba(59,130,246,0.1)', label: 'Diretoria', border: 'rgba(59,130,246,0.3)' },
      personal: { color: '#16a34a', bg: 'rgba(34,197,94,0.1)', label: 'Individual', border: 'rgba(34,197,94,0.3)' }
    };
    const lc = levelConfig[node.level] || levelConfig.personal;

    // Determine overall confidence from KRs
    const krs = node.krs || [];
    const hasRisky = krs.some(k => k.confidence === 'behind');
    const hasAtRisk = krs.some(k => k.confidence === 'at_risk');
    const conf = hasRisky ? 'behind' : hasAtRisk ? 'at_risk' : 'on_track';

    return `
      <div class="okr-tree-node" style="margin-left:${depth * 28}px;">
        <div class="okr-tree-card-main okr-card" data-obj-id="${node.id}"
             style="border-left: 3px solid ${lc.color}; cursor:pointer;">
          <div class="okr-tree-card-top">
            <div class="okr-tree-card-left">
              ${hasChildren ? `
                <button class="okr-tree-toggle" data-obj-id="${node.id}">
                  <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" style="width:14px;height:14px;"></i>
                </button>
              ` : '<div style="width:22px;"></div>'}
              <div class="okr-tree-card-info">
                <div class="okr-tree-card-title-row">
                  <span class="okr-tree-card-title">${this._esc(node.title)}</span>
                  <span class="okr-level-badge okr-level--${node.level}">${lc.label}</span>
                  ${node.bu ? `<span class="okr-tree-bu-tag">${this._esc(node.bu)}</span>` : ''}
                </div>
                <div class="okr-tree-card-metrics">
                  <div class="okr-tree-progress-wrapper">
                    <div class="okr-progress-track okr-progress-sm" style="width:160px;">
                      <div class="okr-progress-fill" style="width:${Math.min(progress, 100)}%;background:${this._progressColor(progress)};"></div>
                    </div>
                    <span class="okr-tree-pct" style="color:${this._progressColor(progress)};">${progress.toFixed(0)}%</span>
                  </div>
                  <span class="okr-tree-kr-count">${krs.length} KR${krs.length !== 1 ? 's' : ''}</span>
                  ${conf !== 'on_track' ? `
                    <span class="okr-status-badge okr-status--${conf}">
                      <i data-lucide="${conf === 'behind' ? 'alert-circle' : 'alert-triangle'}" style="width:10px;height:10px;"></i>
                      ${conf === 'behind' ? 'Atrasado' : 'Em Risco'}
                    </span>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        ${isExpanded ? `
          <div class="okr-tree-children">
            ${krs.map(kr => this._renderKR(kr)).join('')}
            ${node.children.map(child => this._renderTreeNode(child, depth + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  _renderKR(kr) {
    const target = Number(kr.target_value || 1);
    const start = Number(kr.start_value || 0);
    const current = Number(kr.current_value || 0);
    const range = target - start;
    const pct = range > 0 ? Math.min(100, Math.max(0, ((current - start) / range) * 100)) : 0;

    const confConfig = {
      on_track: { color: '#16a34a', bg: 'rgba(34,197,94,0.08)', label: 'On Track' },
      at_risk:  { color: '#d97706', bg: 'rgba(245,158,11,0.08)', label: 'Em Risco' },
      behind:   { color: '#dc2626', bg: 'rgba(239,68,68,0.08)', label: 'Atrasado' }
    };
    const cc = confConfig[kr.confidence] || confConfig.on_track;

    return `
      <div class="okr-tree-kr" style="background:${cc.bg};">
        <div class="okr-tree-kr-top">
          <i data-lucide="key-round" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
          <span class="okr-tree-kr-title">${this._esc(kr.title)}</span>
          <span class="okr-status-badge okr-status--${kr.confidence}">${cc.label}</span>
        </div>
        <div class="okr-tree-kr-bottom">
          <div class="okr-progress-track okr-progress-sm" style="width:120px;">
            <div class="okr-progress-fill" style="width:${pct}%;background:${cc.color};"></div>
          </div>
          <span class="okr-tree-kr-value">
            ${current}${kr.unit ? ' ' + kr.unit : ''} / ${target}${kr.unit ? ' ' + kr.unit : ''}
          </span>
          <span class="okr-tree-kr-pct" style="color:${cc.color};">${pct.toFixed(0)}%</span>
        </div>
      </div>
    `;
  },

  _renderEmptyState() {
    return `
      <div class="okr-empty-state">
        <div class="okr-empty-icon" style="background:rgba(59,130,246,0.1);">
          <i data-lucide="network" style="width:28px;height:28px;color:#2563eb;"></i>
        </div>
        <h3>Nenhum OKR encontrado</h3>
        <p>Crie objetivos para visualizar o alinhamento hierarquico da empresa.</p>
      </div>
    `;
  },

  _progressColor(pct) {
    if (pct >= 70) return '#16a34a';
    if (pct >= 40) return '#d97706';
    return '#dc2626';
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  destroy() {
    this._expandedNodes.clear();
    this._filterBU = '';
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_TREE = TBO_OKRS_TREE;

  const treeStyle = document.createElement('style');
  treeStyle.textContent = `
    /* ===== Tree Toolbar ===== */
    .okr-tree-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 14px; flex-wrap: wrap; gap: 8px;
    }
    .okr-tree-toolbar-left { display: flex; align-items: center; gap: 10px; }
    .okr-tree-toolbar-right { display: flex; gap: 4px; }
    .okr-tree-count { font-size: 0.75rem; color: var(--text-muted); }

    .okr-btn-icon {
      width: 32px; height: 32px; border-radius: 6px; border: 1px solid var(--border-default);
      background: var(--bg-card); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: all 0.15s;
    }
    .okr-btn-icon:hover { background: var(--bg-card-hover); color: var(--text-primary); }

    /* ===== Tree Container ===== */
    .okr-tree-container { display: flex; flex-direction: column; gap: 6px; }

    /* ===== Tree Node ===== */
    .okr-tree-node { display: flex; flex-direction: column; gap: 4px; }

    .okr-tree-card-main { padding: 14px 18px !important; }
    .okr-tree-card-top { display: flex; align-items: center; justify-content: space-between; }
    .okr-tree-card-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; min-width: 0; }

    .okr-tree-toggle {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--text-muted); display: flex; align-items: center;
      flex-shrink: 0; margin-top: 1px;
      transition: color 0.15s;
    }
    .okr-tree-toggle:hover { color: var(--text-primary); }

    .okr-tree-card-info { flex: 1; min-width: 0; }
    .okr-tree-card-title-row {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .okr-tree-card-title {
      font-size: 0.85rem; font-weight: 600; color: var(--text-primary);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      max-width: 400px;
    }
    .okr-tree-bu-tag {
      font-size: 0.62rem; padding: 1px 6px; border-radius: 4px;
      background: var(--bg-tertiary); color: var(--text-muted);
    }

    .okr-tree-card-metrics {
      display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    }
    .okr-tree-progress-wrapper { display: flex; align-items: center; gap: 8px; }
    .okr-tree-pct { font-size: 0.75rem; font-weight: 700; }
    .okr-tree-kr-count { font-size: 0.72rem; color: var(--text-muted); }

    /* ===== Tree Children ===== */
    .okr-tree-children {
      display: flex; flex-direction: column; gap: 3px;
      margin-left: 30px; padding-left: 16px;
      border-left: 2px solid var(--border-default);
    }

    /* ===== Key Result in Tree ===== */
    .okr-tree-kr {
      padding: 10px 14px; border-radius: 8px; margin-bottom: 2px;
    }
    .okr-tree-kr-top {
      display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
    }
    .okr-tree-kr-title {
      font-size: 0.78rem; color: var(--text-primary); flex: 1; min-width: 0;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .okr-tree-kr-bottom {
      display: flex; align-items: center; gap: 10px;
    }
    .okr-tree-kr-value { font-size: 0.68rem; color: var(--text-muted); }
    .okr-tree-kr-pct { font-size: 0.72rem; font-weight: 700; }

    @media (max-width: 768px) {
      .okr-tree-card-title { max-width: 200px; }
      .okr-tree-children { margin-left: 12px; padding-left: 10px; }
    }
  `;
  document.head.appendChild(treeStyle);
}
