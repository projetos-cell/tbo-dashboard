// ============================================================================
// TBO OS — OKRs: Tab Alinhamento (Tree)
// Arvore hierarquica: Company → BU → Personal
// Expandivel/colapsavel, filtros, progress bars, badges confidence
// ============================================================================

const TBO_OKRS_TREE = {

  _portal: null,
  _expandedNodes: new Set(),
  _filterBU: '',
  _filterLevel: '',

  setup(portal) {
    this._portal = portal;
  },

  render() {
    const p = this._portal;
    const objectives = p ? p._objectives : [];
    const tree = this._buildTree(objectives);
    const bus = [...new Set(objectives.map(o => o.bu).filter(Boolean))];

    return `
      <!-- Toolbar -->
      <div class="card" style="padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <select id="okrFilterLevel" class="form-input" style="padding:4px 8px;font-size:0.78rem;width:auto;">
            <option value="">Todos Niveis</option>
            <option value="company" ${this._filterLevel === 'company' ? 'selected' : ''}>Empresa</option>
            <option value="bu" ${this._filterLevel === 'bu' ? 'selected' : ''}>BU</option>
            <option value="personal" ${this._filterLevel === 'personal' ? 'selected' : ''}>Pessoal</option>
          </select>
          ${bus.length > 0 ? `
            <select id="okrFilterBU" class="form-input" style="padding:4px 8px;font-size:0.78rem;width:auto;">
              <option value="">Todas BUs</option>
              ${bus.map(b => `<option value="${this._esc(b)}" ${this._filterBU === b ? 'selected' : ''}>${this._esc(b)}</option>`).join('')}
            </select>
          ` : ''}
        </div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-sm" id="okrExpandAll" style="font-size:0.75rem;padding:4px 10px;">
            <i data-lucide="chevrons-down" style="width:12px;height:12px;"></i> Expandir
          </button>
          <button class="btn btn-sm" id="okrCollapseAll" style="font-size:0.75rem;padding:4px 10px;">
            <i data-lucide="chevrons-up" style="width:12px;height:12px;"></i> Colapsar
          </button>
          <button class="btn btn-primary btn-sm okr-new-btn" style="font-size:0.75rem;padding:4px 12px;">
            <i data-lucide="plus" style="width:12px;height:12px;"></i> Novo OKR
          </button>
        </div>
      </div>

      <!-- Tree -->
      <div class="okr-tree" id="okrTreeContainer">
        ${tree.length === 0 ? this._renderEmptyState() : tree.map(node => this._renderTreeNode(node, 0)).join('')}
      </div>
    `;
  },

  bind() {
    // Expand/collapse toggles
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

    // Filters
    const filterLevel = document.getElementById('okrFilterLevel');
    if (filterLevel) {
      filterLevel.addEventListener('change', () => {
        this._filterLevel = filterLevel.value;
        this._portal._rerender();
      });
    }
    const filterBU = document.getElementById('okrFilterBU');
    if (filterBU) {
      filterBU.addEventListener('change', () => {
        this._filterBU = filterBU.value;
        this._portal._rerender();
      });
    }

    // Expand / Collapse all
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

    // New OKR button
    const newBtn = document.querySelector('.okr-new-btn');
    if (newBtn) {
      newBtn.addEventListener('click', () => {
        if (this._portal) {
          this._portal._showModal = 'createOKR';
          this._portal._rerender();
        }
      });
    }

    // Click on objective card to expand
    document.querySelectorAll('.okr-tree-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.objId;
        if (id) {
          if (this._expandedNodes.has(id)) {
            this._expandedNodes.delete(id);
          } else {
            this._expandedNodes.add(id);
          }
          this._portal._rerender();
        }
      });
    });
  },

  /**
   * Constroi arvore hierarquica a partir de flat list
   * { ...obj, children: [...], krs: [...] }
   */
  _buildTree(objectives) {
    let filtered = [...objectives];

    // Filtros
    if (this._filterLevel) {
      filtered = filtered.filter(o => o.level === this._filterLevel);
    }
    if (this._filterBU) {
      filtered = filtered.filter(o => o.bu === this._filterBU);
    }

    // Mapear por id
    const map = {};
    filtered.forEach(o => {
      map[o.id] = { ...o, children: [], krs: o.okr_key_results || [] };
    });

    // Montar hierarquia
    const roots = [];
    filtered.forEach(o => {
      const node = map[o.id];
      if (o.parent_id && map[o.parent_id]) {
        map[o.parent_id].children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Ordenar: company → bu → personal
    const levelOrder = { company: 0, bu: 1, personal: 2 };
    roots.sort((a, b) => (levelOrder[a.level] || 3) - (levelOrder[b.level] || 3));

    return roots;
  },

  _renderTreeNode(node, depth) {
    const isExpanded = this._expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0 || node.krs.length > 0;
    const progress = Number(node.progress || 0);
    const indent = depth * 24;

    const levelColors = {
      company: { bg: 'rgba(139,92,246,0.12)', color: '#8B5CF6', label: 'Empresa' },
      bu: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'BU' },
      personal: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Pessoal' }
    };
    const lc = levelColors[node.level] || levelColors.personal;

    return `
      <div class="okr-tree-node" style="margin-left:${indent}px;margin-bottom:4px;">
        <div class="okr-tree-card card" data-obj-id="${node.id}" style="padding:12px 16px;cursor:pointer;border-left:3px solid ${lc.color};transition:box-shadow 0.15s;">
          <div style="display:flex;align-items:center;gap:8px;">
            ${hasChildren ? `
              <button class="okr-tree-toggle" data-obj-id="${node.id}" style="background:none;border:none;cursor:pointer;padding:2px;display:flex;align-items:center;">
                <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" style="width:14px;height:14px;color:var(--text-muted);"></i>
              </button>
            ` : '<div style="width:18px;"></div>'}
            <div style="flex:1;min-width:0;">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary);">${this._esc(node.title)}</span>
                <span style="font-size:0.62rem;padding:1px 6px;border-radius:10px;background:${lc.bg};color:${lc.color};font-weight:600;">${lc.label}</span>
                ${node.bu ? `<span style="font-size:0.62rem;padding:1px 6px;border-radius:10px;background:var(--bg-tertiary);color:var(--text-muted);">${this._esc(node.bu)}</span>` : ''}
              </div>
              <div style="display:flex;align-items:center;gap:12px;margin-top:6px;">
                <div style="flex:1;max-width:180px;height:4px;background:var(--bg-tertiary);border-radius:2px;">
                  <div style="width:${Math.min(progress, 100)}%;height:100%;background:${this._progressColor(progress)};border-radius:2px;transition:width 0.5s ease;"></div>
                </div>
                <span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;">${progress.toFixed(0)}%</span>
                <span style="font-size:0.72rem;color:var(--text-muted);">${node.krs.length} KR${node.krs.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        ${isExpanded ? `
          <!-- KRs -->
          ${node.krs.map(kr => this._renderKR(kr, indent + 24)).join('')}
          <!-- Children objectives -->
          ${node.children.map(child => this._renderTreeNode(child, depth + 1)).join('')}
        ` : ''}
      </div>
    `;
  },

  _renderKR(kr, indent) {
    const target = Number(kr.target_value || 1);
    const start = Number(kr.start_value || 0);
    const current = Number(kr.current_value || 0);
    const range = target - start;
    const pct = range > 0 ? Math.min(100, Math.max(0, ((current - start) / range) * 100)) : 0;

    const confStyles = {
      on_track: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'On Track' },
      at_risk:  { bg: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Em Risco' },
      behind:   { bg: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'Atrasado' }
    };
    const cs = confStyles[kr.confidence] || confStyles.on_track;

    return `
      <div style="margin-left:${indent + 24}px;margin-bottom:2px;padding:8px 12px;background:var(--bg-secondary);border-radius:6px;border:1px solid var(--border-light, var(--border-default));">
        <div style="display:flex;align-items:center;gap:8px;">
          <i data-lucide="key-round" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
          <span style="font-size:0.78rem;color:var(--text-primary);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this._esc(kr.title)}</span>
          <span style="font-size:0.62rem;padding:1px 6px;border-radius:10px;background:${cs.bg};color:${cs.color};font-weight:600;white-space:nowrap;">${cs.label}</span>
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
          <div style="flex:1;max-width:140px;height:3px;background:var(--bg-tertiary);border-radius:2px;">
            <div style="width:${pct}%;height:100%;background:${cs.color};border-radius:2px;"></div>
          </div>
          <span style="font-size:0.68rem;color:var(--text-muted);white-space:nowrap;">
            ${current}${kr.unit ? ' ' + kr.unit : ''} / ${target}${kr.unit ? ' ' + kr.unit : ''} (${pct.toFixed(0)}%)
          </span>
        </div>
      </div>
    `;
  },

  _renderEmptyState() {
    return `
      <div class="card" style="padding:48px;text-align:center;">
        <i data-lucide="git-branch" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
        <h3 style="margin:0 0 8px;font-size:1rem;">Nenhum OKR cadastrado</h3>
        <p style="color:var(--text-muted);font-size:0.82rem;margin:0 0 16px;">
          Crie objetivos para visualizar o alinhamento da empresa.
        </p>
        <button class="btn btn-primary okr-new-btn">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> Criar Primeiro OKR
        </button>
      </div>
    `;
  },

  _progressColor(pct) {
    if (pct >= 70) return '#22C55E';
    if (pct >= 40) return '#F59E0B';
    return '#EF4444';
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
    this._filterLevel = '';
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_TREE = TBO_OKRS_TREE;
}
