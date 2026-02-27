// ============================================================================
// TBO OS — OKRs v2: Tab Estrutura (Structure)
// ObjectiveCard + KeyResultRow, inline actions, CRUD, drag-like reorder
// ============================================================================

const TBO_OKRS_STRUCTURE = {

  _ctx: null,
  _expandedObjectives: new Set(),

  setup(ctx) {
    this._ctx = ctx;
  },

  render() {
    const ctx = this._ctx;
    if (!ctx) return '';
    const objectives = ctx.objectives || [];
    const portal = ctx.portal;

    // Build tree from flat list
    const tree = this._buildTree(objectives);

    return `
      <div class="okr-str">
        ${tree.length === 0 ? this._renderEmpty(portal) : ''}

        ${tree.map(node => this._renderObjectiveCard(node, 0)).join('')}
      </div>
    `;
  },

  bind() {
    const portal = this._ctx?.portal;
    if (!portal) return;

    // Expand/collapse objective
    document.querySelectorAll('.okr-str-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (this._expandedObjectives.has(id)) this._expandedObjectives.delete(id);
        else this._expandedObjectives.add(id);
        portal._rerender();
      });
    });

    // Click card header to toggle
    document.querySelectorAll('.okr-str-card-header').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.id;
        if (!id) return;
        if (this._expandedObjectives.has(id)) this._expandedObjectives.delete(id);
        else this._expandedObjectives.add(id);
        portal._rerender();
      });
    });

    // Edit objective
    document.querySelectorAll('.okr-str-edit-obj').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const obj = this._findObj(btn.dataset.id);
        if (obj) portal.openModal('editObjective', { ...obj });
      });
    });

    // Duplicate objective
    document.querySelectorAll('.okr-str-dup-obj').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (typeof OkrsRepo === 'undefined') return;
        try {
          await OkrsRepo.duplicateObjective(btn.dataset.id);
          portal._toast('success', 'Objetivo duplicado');
          await portal.reloadAndRender();
        } catch (err) { portal._toast('error', err.message); }
      });
    });

    // Archive objective
    document.querySelectorAll('.okr-str-archive-obj').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Arquivar este objetivo?')) return;
        if (typeof OkrsRepo === 'undefined') return;
        try {
          await OkrsRepo.archiveObjective(btn.dataset.id);
          portal._toast('success', 'Objetivo arquivado');
          await portal.reloadAndRender();
        } catch (err) { portal._toast('error', err.message); }
      });
    });

    // Add KR to objective
    document.querySelectorAll('.okr-str-add-kr').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        portal.openModal('createKR', { objective_id: btn.dataset.objId });
      });
    });

    // Edit KR
    document.querySelectorAll('.okr-str-edit-kr').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const kr = this._findKR(btn.dataset.id);
        if (kr) portal.openModal('editKR', { ...kr });
      });
    });

    // Check-in on KR
    document.querySelectorAll('.okr-str-checkin-kr').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const kr = this._findKR(btn.dataset.id);
        const obj = this._findObjByKR(btn.dataset.id);
        if (kr && obj) portal.openModal('createCheckin', { kr, objTitle: obj.title });
      });
    });

    // Archive KR
    document.querySelectorAll('.okr-str-archive-kr').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Arquivar este Key Result?')) return;
        if (typeof OkrsRepo === 'undefined') return;
        try {
          await OkrsRepo.archiveKeyResult(btn.dataset.id);
          portal._toast('success', 'KR arquivado');
          await portal.reloadAndRender();
        } catch (err) { portal._toast('error', err.message); }
      });
    });

    // Inline status override for objective
    document.querySelectorAll('.okr-str-status-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (typeof OkrsRepo === 'undefined') return;
        const newStatus = btn.dataset.status;
        const objId = btn.dataset.objId;
        try {
          await OkrsRepo.updateObjective(objId, { status_override: newStatus || null });
          portal._toast('success', 'Status atualizado');
          await portal.reloadAndRender();
        } catch (err) { portal._toast('error', err.message); }
      });
    });

    // Toggle action menus
    document.querySelectorAll('.okr-str-menu-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        if (!menu) return;
        // Close all other menus
        document.querySelectorAll('.okr-str-menu-dropdown.visible').forEach(m => {
          if (m !== menu) m.classList.remove('visible');
        });
        menu.classList.toggle('visible');
      });
    });

    // Close menus on outside click
    document.addEventListener('click', () => {
      document.querySelectorAll('.okr-str-menu-dropdown.visible').forEach(m => m.classList.remove('visible'));
    }, { once: true });
  },

  // ── Build Tree ──────────────────────────────────────────────
  _buildTree(objectives) {
    const map = {};
    objectives.forEach(o => {
      map[o.id] = { ...o, children: [], krs: o.okr_key_results || [] };
    });

    const roots = [];
    objectives.forEach(o => {
      const node = map[o.id];
      if (o.parent_id && map[o.parent_id]) {
        map[o.parent_id].children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort by level, then sort_order
    const levelOrder = { company: 0, directorate: 1, bu: 1, squad: 2, individual: 3, personal: 3 };
    roots.sort((a, b) => (levelOrder[a.level] ?? 3) - (levelOrder[b.level] ?? 3) || (a.sort_order || 0) - (b.sort_order || 0));

    return roots;
  },

  // ── Objective Card ──────────────────────────────────────────
  _renderObjectiveCard(node, depth) {
    const portal = this._ctx?.portal;
    if (!portal) return '';

    const isExpanded = this._expandedObjectives.has(node.id);
    const krs = (node.krs || []).filter(kr => !kr.archived_at);
    const children = node.children || [];
    const hasContent = krs.length > 0 || children.length > 0;

    // Calculate progress
    const progress = this._calcObjProgress(krs);
    const lc = portal._levelConfig[node.level] || portal._levelConfig.individual;
    const sc = portal._statusConfig;

    // Determine effective status
    const effectiveStatus = node.status_override || this._autoStatus(progress, krs);
    const statusCfg = sc[effectiveStatus] || sc.on_track;

    // Owner name
    const owner = (this._ctx.profiles || []).find(p => p.id === node.owner_id);
    const ownerName = owner ? (owner.full_name || owner.email) : '';

    return `
      <div class="okr-str-node" style="margin-left:${depth * 24}px;">
        <div class="okr-str-card okr2-card" style="border-left: 3px solid ${lc.color};">
          <div class="okr-str-card-header" data-id="${node.id}">
            <div class="okr-str-card-left">
              ${hasContent ? `
                <button class="okr-str-toggle" data-id="${node.id}">
                  <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" style="width:14px;height:14px;"></i>
                </button>
              ` : '<div style="width:22px;"></div>'}

              <div class="okr-str-card-info">
                <div class="okr-str-title-row">
                  <span class="okr-str-title">${this._esc(node.title)}</span>
                  <span class="okr2-level-badge okr2-level--${node.level}">${lc.label}</span>
                  ${node.bu ? `<span class="okr-str-bu">${this._esc(node.bu)}</span>` : ''}
                </div>
                <div class="okr-str-meta-row">
                  <div class="okr-str-progress-wrap">
                    <div class="okr-str-progress-track">
                      <div class="okr-str-progress-fill" style="width:${Math.min(progress, 100)}%;background:${portal._progressColor(progress)};"></div>
                    </div>
                    <span class="okr-str-pct" style="color:${portal._progressColor(progress)};">${Math.round(progress)}%</span>
                  </div>
                  <span class="okr2-status-badge okr2-status--${effectiveStatus}">
                    <i data-lucide="${statusCfg.icon}" style="width:10px;height:10px;"></i>
                    ${statusCfg.label}
                  </span>
                  <span class="okr-str-kr-count">${krs.length} KR${krs.length !== 1 ? 's' : ''}</span>
                  ${ownerName ? `<span class="okr-str-owner"><i data-lucide="user" style="width:10px;height:10px;"></i> ${this._esc(ownerName)}</span>` : ''}
                </div>
              </div>
            </div>

            <div class="okr-str-card-actions">
              <button class="okr-str-add-kr okr2-btn-ghost" data-obj-id="${node.id}" title="Adicionar KR">
                <i data-lucide="plus" style="width:14px;height:14px;"></i>
              </button>
              <div class="okr-str-menu">
                <button class="okr-str-menu-trigger okr2-btn-ghost" title="Acoes">
                  <i data-lucide="more-vertical" style="width:14px;height:14px;"></i>
                </button>
                <div class="okr-str-menu-dropdown">
                  <button class="okr-str-edit-obj okr-str-menu-item" data-id="${node.id}">
                    <i data-lucide="pencil" style="width:13px;height:13px;"></i> Editar
                  </button>
                  <button class="okr-str-dup-obj okr-str-menu-item" data-id="${node.id}">
                    <i data-lucide="copy" style="width:13px;height:13px;"></i> Duplicar
                  </button>
                  <div class="okr-str-menu-sep"></div>
                  <div class="okr-str-menu-group-label">Status manual</div>
                  <button class="okr-str-status-btn okr-str-menu-item" data-obj-id="${node.id}" data-status="">
                    <i data-lucide="refresh-cw" style="width:13px;height:13px;"></i> Auto
                  </button>
                  <button class="okr-str-status-btn okr-str-menu-item" data-obj-id="${node.id}" data-status="on_track">
                    <span class="okr-str-dot" style="background:#16a34a;"></span> No caminho
                  </button>
                  <button class="okr-str-status-btn okr-str-menu-item" data-obj-id="${node.id}" data-status="attention">
                    <span class="okr-str-dot" style="background:#d97706;"></span> Atencao
                  </button>
                  <button class="okr-str-status-btn okr-str-menu-item" data-obj-id="${node.id}" data-status="at_risk">
                    <span class="okr-str-dot" style="background:#dc2626;"></span> Em risco
                  </button>
                  <div class="okr-str-menu-sep"></div>
                  <button class="okr-str-archive-obj okr-str-menu-item okr-str-menu-item--danger" data-id="${node.id}">
                    <i data-lucide="archive" style="width:13px;height:13px;"></i> Arquivar
                  </button>
                </div>
              </div>
            </div>
          </div>

          ${isExpanded ? `
            <div class="okr-str-krs">
              ${krs.map((kr, i) => this._renderKRRow(kr, i, krs.length, node)).join('')}
              ${krs.length === 0 ? `
                <div class="okr-str-kr-empty">
                  <span>Nenhum Key Result — </span>
                  <button class="okr-str-add-kr okr-str-link" data-obj-id="${node.id}">adicionar</button>
                </div>
              ` : ''}
            </div>
          ` : ''}
        </div>

        ${isExpanded && children.length > 0 ? `
          <div class="okr-str-children">
            ${children.map(child => this._renderObjectiveCard(child, depth + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  },

  // ── Key Result Row ──────────────────────────────────────────
  _renderKRRow(kr, index, total, parentObj) {
    const portal = this._ctx?.portal;
    if (!portal) return '';

    const target = Number(kr.target_value || 1);
    const start = Number(kr.start_value || 0);
    const current = Number(kr.current_value || 0);
    const range = target - start;
    const pct = range > 0 ? Math.min(100, Math.max(0, ((current - start) / range) * 100)) : 0;

    const sc = portal._statusConfig;
    const conf = kr.confidence || 'on_track';
    const confCfg = sc[conf] || sc.on_track;

    const weightLabel = kr.weight ? `${Math.round(kr.weight * 100)}%` : '';
    const cadenceLabel = { weekly: 'Sem', biweekly: 'Quinz', monthly: 'Mensal' }[kr.cadence] || '';

    const formatValue = (val) => {
      if (kr.metric_type === 'currency') return `R$ ${Number(val).toLocaleString('pt-BR')}`;
      if (kr.metric_type === 'percent' || kr.metric_type === 'percentage') return `${val}%`;
      if (kr.metric_type === 'binary' || kr.metric_type === 'boolean') return Number(val) >= 1 ? 'Sim' : 'Nao';
      return `${val}${kr.unit ? ' ' + kr.unit : ''}`;
    };

    return `
      <div class="okr-str-kr" style="border-left: 3px solid ${confCfg.color};">
        <div class="okr-str-kr-left">
          <i data-lucide="key-round" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
          <div class="okr-str-kr-info">
            <div class="okr-str-kr-title-row">
              <span class="okr-str-kr-title">${this._esc(kr.title)}</span>
              <span class="okr2-status-badge okr2-status--${conf}">${confCfg.label}</span>
              ${weightLabel ? `<span class="okr-str-kr-weight" title="Peso">${weightLabel}</span>` : ''}
              ${cadenceLabel ? `<span class="okr-str-kr-cadence" title="Cadencia">${cadenceLabel}</span>` : ''}
            </div>
            <div class="okr-str-kr-values">
              <div class="okr-str-kr-progress-track">
                <div class="okr-str-kr-progress-fill" style="width:${pct}%;background:${confCfg.color};"></div>
              </div>
              <span class="okr-str-kr-val">${formatValue(current)} / ${formatValue(target)}</span>
              <span class="okr-str-kr-pct" style="color:${confCfg.color};">${Math.round(pct)}%</span>
            </div>
          </div>
        </div>
        <div class="okr-str-kr-actions">
          <button class="okr-str-checkin-kr okr2-btn-ghost" data-id="${kr.id}" title="Check-in">
            <i data-lucide="check-circle" style="width:13px;height:13px;"></i>
          </button>
          <button class="okr-str-edit-kr okr2-btn-ghost" data-id="${kr.id}" title="Editar">
            <i data-lucide="pencil" style="width:13px;height:13px;"></i>
          </button>
          <button class="okr-str-archive-kr okr2-btn-ghost" data-id="${kr.id}" title="Arquivar">
            <i data-lucide="archive" style="width:13px;height:13px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  // ── Empty State ─────────────────────────────────────────────
  _renderEmpty(portal) {
    return `
      <div class="okr2-empty">
        <div class="okr2-empty-icon" style="background:rgba(139,92,246,0.1);">
          <i data-lucide="target" style="width:28px;height:28px;color:#7c3aed;"></i>
        </div>
        <h3>Nenhum objetivo neste ciclo</h3>
        <p>Crie seu primeiro objetivo para comecar a estruturar seus OKRs.</p>
        <button class="okr2-btn-primary" style="margin-top:16px;" onclick="TBO_OKRS.openModal('createObjective',{cycle_id:TBO_OKRS._activeCycleId})">
          <i data-lucide="plus" style="width:14px;height:14px;"></i> Criar Objetivo
        </button>
      </div>
    `;
  },

  // ── Helpers ─────────────────────────────────────────────────
  _calcObjProgress(krs) {
    if (!krs || krs.length === 0) return 0;
    const active = krs.filter(kr => !kr.archived_at);
    if (active.length === 0) return 0;

    const hasWeights = active.some(kr => kr.weight && kr.weight > 0);
    let total = 0;
    let divisor = 0;

    active.forEach(kr => {
      const t = Number(kr.target_value || 1);
      const s = Number(kr.start_value || 0);
      const c = Number(kr.current_value || 0);
      const range = t - s;
      const pct = range > 0 ? Math.min(100, Math.max(0, ((c - s) / range) * 100)) : 0;
      const w = hasWeights ? (kr.weight || 0) : 1;
      total += pct * w;
      divisor += w;
    });

    return divisor > 0 ? total / divisor : 0;
  },

  _autoStatus(progress, krs) {
    const hasRisky = (krs || []).some(kr => kr.confidence === 'behind' || kr.confidence === 'at_risk');
    if (hasRisky) return 'at_risk';
    if (progress >= 70) return 'on_track';
    if (progress >= 40) return 'attention';
    return 'at_risk';
  },

  _findObj(id) {
    return (this._ctx?.allObjectives || []).find(o => o.id === id);
  },

  _findKR(id) {
    for (const obj of (this._ctx?.allObjectives || [])) {
      const kr = (obj.okr_key_results || []).find(k => k.id === id);
      if (kr) return kr;
    }
    return null;
  },

  _findObjByKR(krId) {
    for (const obj of (this._ctx?.allObjectives || [])) {
      if ((obj.okr_key_results || []).some(k => k.id === krId)) return obj;
    }
    return null;
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  destroy() {
    this._expandedObjectives.clear();
    this._ctx = null;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_STRUCTURE = TBO_OKRS_STRUCTURE;

  const strStyle = document.createElement('style');
  strStyle.textContent = `
    /* ===== Structure Tab ===== */
    .okr-str { display: flex; flex-direction: column; gap: 8px; }

    .okr-str-node { display: flex; flex-direction: column; gap: 6px; }

    .okr-str-card { padding: 0 !important; overflow: hidden; }

    .okr-str-card-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; cursor: pointer; gap: 8px;
      transition: background 0.1s;
    }
    .okr-str-card-header:hover { background: var(--bg-card-hover); }

    .okr-str-card-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; min-width: 0; }

    .okr-str-toggle {
      background: none; border: none; cursor: pointer; padding: 2px;
      color: var(--text-muted); display: flex; align-items: center;
      flex-shrink: 0; margin-top: 2px; transition: color 0.15s;
    }
    .okr-str-toggle:hover { color: var(--text-primary); }

    .okr-str-card-info { flex: 1; min-width: 0; }

    .okr-str-title-row {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      margin-bottom: 6px;
    }
    .okr-str-title {
      font-size: 0.85rem; font-weight: 600; color: var(--text-primary);
      overflow: hidden; text-overflow: ellipsis;
    }
    .okr-str-bu {
      font-size: 0.62rem; padding: 1px 6px; border-radius: 4px;
      background: var(--bg-tertiary); color: var(--text-muted);
    }

    .okr-str-meta-row {
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    }
    .okr-str-progress-wrap { display: flex; align-items: center; gap: 6px; }
    .okr-str-progress-track {
      width: 120px; height: 5px; background: var(--bg-tertiary);
      border-radius: 3px; overflow: hidden;
    }
    .okr-str-progress-fill {
      height: 100%; border-radius: 3px;
      transition: width 0.6s ease;
    }
    .okr-str-pct { font-size: 0.72rem; font-weight: 700; }
    .okr-str-kr-count { font-size: 0.68rem; color: var(--text-muted); }
    .okr-str-owner {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 0.68rem; color: var(--text-muted);
    }

    .okr-str-card-actions {
      display: flex; align-items: center; gap: 2px; flex-shrink: 0;
      opacity: 0; transition: opacity 0.15s;
    }
    .okr-str-card-header:hover .okr-str-card-actions { opacity: 1; }

    /* ===== Menu Dropdown ===== */
    .okr-str-menu { position: relative; }
    .okr-str-menu-dropdown {
      position: absolute; top: 100%; right: 0; z-index: 50;
      min-width: 180px; padding: 4px 0;
      background: var(--bg-card); border: 1px solid var(--border-default);
      border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12);
      display: none;
    }
    .okr-str-menu-dropdown.visible { display: block; }
    .okr-str-menu-item {
      display: flex; align-items: center; gap: 8px;
      width: 100%; padding: 8px 14px; border: none; background: none;
      font-size: 0.78rem; color: var(--text-secondary); cursor: pointer;
      text-align: left; transition: background 0.1s;
    }
    .okr-str-menu-item:hover { background: var(--bg-card-hover); }
    .okr-str-menu-item--danger { color: #dc2626; }
    .okr-str-menu-item--danger:hover { background: rgba(239,68,68,0.06); }
    .okr-str-menu-sep { border-top: 1px solid var(--border-default); margin: 4px 0; }
    .okr-str-menu-group-label {
      padding: 4px 14px 2px; font-size: 0.62rem; font-weight: 600;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px;
    }
    .okr-str-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
    }

    /* ===== Key Results Section ===== */
    .okr-str-krs {
      border-top: 1px solid var(--border-default);
      padding: 6px 0;
    }

    .okr-str-kr {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px 10px 48px; border-left: 3px solid transparent;
      transition: background 0.1s; gap: 8px;
    }
    .okr-str-kr:hover { background: var(--bg-card-hover); }

    .okr-str-kr-left { display: flex; align-items: flex-start; gap: 8px; flex: 1; min-width: 0; }
    .okr-str-kr-info { flex: 1; min-width: 0; }

    .okr-str-kr-title-row {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      margin-bottom: 4px;
    }
    .okr-str-kr-title {
      font-size: 0.78rem; color: var(--text-primary);
      overflow: hidden; text-overflow: ellipsis;
    }
    .okr-str-kr-weight {
      font-size: 0.6rem; padding: 0 5px; border-radius: 3px;
      background: var(--bg-tertiary); color: var(--text-muted); font-weight: 600;
    }
    .okr-str-kr-cadence {
      font-size: 0.6rem; padding: 0 5px; border-radius: 3px;
      background: var(--bg-tertiary); color: var(--text-muted);
    }

    .okr-str-kr-values {
      display: flex; align-items: center; gap: 8px;
    }
    .okr-str-kr-progress-track {
      width: 80px; height: 4px; background: var(--bg-tertiary);
      border-radius: 2px; overflow: hidden;
    }
    .okr-str-kr-progress-fill {
      height: 100%; border-radius: 2px;
      transition: width 0.6s ease;
    }
    .okr-str-kr-val { font-size: 0.68rem; color: var(--text-muted); }
    .okr-str-kr-pct { font-size: 0.7rem; font-weight: 700; }

    .okr-str-kr-actions {
      display: flex; gap: 2px; flex-shrink: 0;
      opacity: 0; transition: opacity 0.15s;
    }
    .okr-str-kr:hover .okr-str-kr-actions { opacity: 1; }

    .okr-str-kr-empty {
      padding: 12px 48px; font-size: 0.75rem; color: var(--text-muted);
    }
    .okr-str-link {
      background: none; border: none; color: var(--brand-orange);
      font-size: 0.75rem; cursor: pointer; text-decoration: underline;
      padding: 0;
    }

    /* ===== Children ===== */
    .okr-str-children {
      margin-left: 16px; padding-left: 12px;
      border-left: 2px solid var(--border-default);
      display: flex; flex-direction: column; gap: 6px;
    }

    @media (max-width: 768px) {
      .okr-str-kr { padding-left: 16px; }
      .okr-str-progress-track { width: 80px; }
      .okr-str-title { font-size: 0.8rem; }
      .okr-str-card-actions { opacity: 1; }
      .okr-str-kr-actions { opacity: 1; }
    }
  `;
  document.head.appendChild(strStyle);
}
