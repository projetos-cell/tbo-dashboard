// ============================================================================
// TBO OS — OKRs v2: Tab Visao Geral (Overview)
// Widgets: progress by level, status distribution, top at risk, recent activity
// ============================================================================

const TBO_OKRS_OVERVIEW = {

  _ctx: null,

  setup(ctx) {
    this._ctx = ctx;
  },

  render() {
    const ctx = this._ctx;
    if (!ctx) return '';
    const portal = ctx.portal;
    const objectives = ctx.allObjectives || [];
    const kpis = ctx.kpis || {};
    const cycle = ctx.cycle;

    // Only active, non-archived
    const active = objectives.filter(o => o.status === 'active' && !o.archived_at);

    // Flatten KRs
    const allKRs = [];
    active.forEach(o => (o.okr_key_results || []).forEach(kr => {
      if (!kr.archived_at) allKRs.push({ ...kr, _objTitle: o.title, _objLevel: o.level });
    }));

    // Progress by level
    const levelGroups = {};
    active.forEach(o => {
      const lv = o.level || 'individual';
      if (!levelGroups[lv]) levelGroups[lv] = [];
      levelGroups[lv].push(o);
    });

    // Status distribution
    const statusCounts = { on_track: 0, attention: 0, at_risk: 0 };
    allKRs.forEach(kr => {
      const c = kr.confidence || 'on_track';
      if (c === 'behind' || c === 'at_risk') statusCounts.at_risk++;
      else if (c === 'attention') statusCounts.attention++;
      else statusCounts.on_track++;
    });

    // Top at risk KRs
    const atRiskKRs = allKRs
      .filter(kr => kr.confidence === 'behind' || kr.confidence === 'at_risk')
      .slice(0, 5);

    return `
      <div class="okr-ov">
        <!-- Widget Grid -->
        <div class="okr-ov-grid">

          <!-- Progress by Level -->
          <div class="okr-ov-widget">
            <h4 class="okr-ov-widget-title">
              <i data-lucide="layers" style="width:14px;height:14px;"></i>
              Progresso por Nivel
            </h4>
            <div class="okr-ov-levels">
              ${Object.entries(levelGroups).map(([level, objs]) => {
                const lc = portal._levelConfig[level] || portal._levelConfig.individual;
                const avgProg = this._avgProgress(objs);
                return `
                  <div class="okr-ov-level-row">
                    <div class="okr-ov-level-info">
                      <span class="okr2-level-badge okr2-level--${level}">${lc.label}</span>
                      <span class="okr-ov-level-count">${objs.length} obj.</span>
                    </div>
                    <div class="okr-ov-level-bar-wrap">
                      <div class="okr-ov-level-bar">
                        <div class="okr-ov-level-fill" style="width:${Math.min(avgProg, 100)}%;background:${lc.color};"></div>
                      </div>
                      <span class="okr-ov-level-pct" style="color:${lc.color};">${Math.round(avgProg)}%</span>
                    </div>
                  </div>
                `;
              }).join('')}
              ${Object.keys(levelGroups).length === 0 ? '<p class="okr-ov-no-data">Nenhum objetivo ativo.</p>' : ''}
            </div>
          </div>

          <!-- Status Distribution -->
          <div class="okr-ov-widget">
            <h4 class="okr-ov-widget-title">
              <i data-lucide="pie-chart" style="width:14px;height:14px;"></i>
              Distribuicao de Status
            </h4>
            <div class="okr-ov-status-bars">
              ${this._renderStatusBar('No caminho', statusCounts.on_track, allKRs.length, '#16a34a')}
              ${this._renderStatusBar('Atencao', statusCounts.attention, allKRs.length, '#d97706')}
              ${this._renderStatusBar('Em risco', statusCounts.at_risk, allKRs.length, '#dc2626')}
            </div>
            ${allKRs.length === 0 ? '<p class="okr-ov-no-data">Nenhum KR criado.</p>' : ''}
          </div>

          <!-- Top At Risk -->
          <div class="okr-ov-widget">
            <h4 class="okr-ov-widget-title">
              <i data-lucide="alert-triangle" style="width:14px;height:14px;color:#d97706;"></i>
              KRs que Precisam de Atencao
            </h4>
            ${atRiskKRs.length === 0
              ? '<p class="okr-ov-no-data">Todos os KRs estao no caminho!</p>'
              : `<div class="okr-ov-risk-list">
                  ${atRiskKRs.map(kr => this._renderRiskItem(kr, portal)).join('')}
                </div>`
            }
          </div>

          <!-- Cycle Summary -->
          <div class="okr-ov-widget">
            <h4 class="okr-ov-widget-title">
              <i data-lucide="calendar" style="width:14px;height:14px;"></i>
              Resumo do Ciclo
            </h4>
            <div class="okr-ov-summary-grid">
              ${this._renderSummaryItem('Objetivos', active.length, 'target', '#7c3aed')}
              ${this._renderSummaryItem('Key Results', allKRs.length, 'key-round', '#2563eb')}
              ${this._renderSummaryItem('Progresso', `${Math.round(kpis.cycleProgress || kpis.avgProgress || 0)}%`, 'trending-up', portal._progressColor(kpis.cycleProgress || kpis.avgProgress || 0))}
              ${this._renderSummaryItem('Check-ins', kpis.totalCheckins || 0, 'check-circle', '#16a34a')}
            </div>
            ${cycle ? `
              <div class="okr-ov-cycle-timeline">
                <div class="okr-ov-timeline-bar">
                  <div class="okr-ov-timeline-fill" style="width:${this._cycleElapsed(cycle)}%;"></div>
                </div>
                <div class="okr-ov-timeline-labels">
                  <span>${this._fmtDate(cycle.start_date)}</span>
                  <span>${Math.round(this._cycleElapsed(cycle))}% decorrido</span>
                  <span>${this._fmtDate(cycle.end_date)}</span>
                </div>
              </div>
            ` : ''}
          </div>

        </div>
      </div>
    `;
  },

  bind() {
    // Check-in buttons in risk list
    const portal = this._ctx?.portal;
    if (!portal) return;

    document.querySelectorAll('.okr-ov-risk-checkin').forEach(btn => {
      btn.addEventListener('click', () => {
        const kr = this._findKR(btn.dataset.krId);
        if (kr) {
          const obj = this._findObjByKR(btn.dataset.krId);
          portal.openModal('createCheckin', { kr, objTitle: obj?.title || '' });
        }
      });
    });
  },

  // ── Widget Helpers ──────────────────────────────────────────

  _renderStatusBar(label, count, total, color) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return `
      <div class="okr-ov-status-row">
        <div class="okr-ov-status-label">
          <span class="okr-ov-status-dot" style="background:${color};"></span>
          <span>${label}</span>
        </div>
        <div class="okr-ov-status-bar-wrap">
          <div class="okr-ov-status-bar">
            <div class="okr-ov-status-fill" style="width:${pct}%;background:${color};"></div>
          </div>
          <span class="okr-ov-status-count">${count}</span>
        </div>
      </div>
    `;
  },

  _renderRiskItem(kr, portal) {
    const target = Number(kr.target_value || 1);
    const start = Number(kr.start_value || 0);
    const current = Number(kr.current_value || 0);
    const range = target - start;
    const pct = range > 0 ? Math.min(100, Math.max(0, ((current - start) / range) * 100)) : 0;
    const conf = kr.confidence || 'on_track';
    const confColor = conf === 'behind' ? '#dc2626' : '#d97706';

    return `
      <div class="okr-ov-risk-item">
        <div class="okr-ov-risk-info">
          <span class="okr-ov-risk-title">${this._esc(kr.title)}</span>
          <span class="okr-ov-risk-obj">${this._esc(kr._objTitle)}</span>
        </div>
        <div class="okr-ov-risk-right">
          <div class="okr-ov-risk-bar">
            <div class="okr-ov-risk-fill" style="width:${pct}%;background:${confColor};"></div>
          </div>
          <span style="font-size:0.7rem;font-weight:700;color:${confColor};">${Math.round(pct)}%</span>
          <button class="okr-ov-risk-checkin okr2-btn-ghost" data-kr-id="${kr.id}" title="Check-in">
            <i data-lucide="check-circle" style="width:13px;height:13px;"></i>
          </button>
        </div>
      </div>
    `;
  },

  _renderSummaryItem(label, value, icon, color) {
    return `
      <div class="okr-ov-summary-item">
        <div class="okr-ov-summary-icon" style="background:${color}15;color:${color};">
          <i data-lucide="${icon}" style="width:16px;height:16px;"></i>
        </div>
        <div>
          <span class="okr-ov-summary-value">${value}</span>
          <span class="okr-ov-summary-label">${label}</span>
        </div>
      </div>
    `;
  },

  // ── Calc Helpers ────────────────────────────────────────────

  _avgProgress(objectives) {
    if (!objectives || objectives.length === 0) return 0;
    let total = 0;
    objectives.forEach(o => { total += Number(o.progress || 0); });
    return total / objectives.length;
  },

  _cycleElapsed(cycle) {
    if (!cycle) return 0;
    const now = new Date();
    const start = new Date(cycle.start_date);
    const end = new Date(cycle.end_date);
    const total = end - start;
    return total > 0 ? Math.min(100, Math.max(0, ((now - start) / total) * 100)) : 0;
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

  _fmtDate(d) {
    if (!d) return '';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  destroy() {
    this._ctx = null;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_OVERVIEW = TBO_OKRS_OVERVIEW;

  const ovStyle = document.createElement('style');
  ovStyle.textContent = `
    /* ===== Overview Tab ===== */
    .okr-ov { }

    .okr-ov-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
    }

    .okr-ov-widget {
      background: var(--bg-card); border: 1px solid var(--border-default);
      border-radius: 10px; padding: 18px 20px;
    }
    .okr-ov-widget-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.82rem; font-weight: 700; color: var(--text-primary);
      margin: 0 0 14px;
    }
    .okr-ov-no-data { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

    /* Progress by Level */
    .okr-ov-levels { display: flex; flex-direction: column; gap: 10px; }
    .okr-ov-level-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .okr-ov-level-info { display: flex; align-items: center; gap: 8px; min-width: 120px; }
    .okr-ov-level-count { font-size: 0.65rem; color: var(--text-muted); }
    .okr-ov-level-bar-wrap { display: flex; align-items: center; gap: 8px; flex: 1; }
    .okr-ov-level-bar {
      flex: 1; height: 6px; background: var(--bg-tertiary);
      border-radius: 3px; overflow: hidden;
    }
    .okr-ov-level-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .okr-ov-level-pct { font-size: 0.72rem; font-weight: 700; min-width: 32px; text-align: right; }

    /* Status Distribution */
    .okr-ov-status-bars { display: flex; flex-direction: column; gap: 10px; }
    .okr-ov-status-row { display: flex; align-items: center; gap: 12px; }
    .okr-ov-status-label { display: flex; align-items: center; gap: 6px; min-width: 90px; font-size: 0.75rem; color: var(--text-secondary); }
    .okr-ov-status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .okr-ov-status-bar-wrap { display: flex; align-items: center; gap: 8px; flex: 1; }
    .okr-ov-status-bar {
      flex: 1; height: 6px; background: var(--bg-tertiary);
      border-radius: 3px; overflow: hidden;
    }
    .okr-ov-status-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .okr-ov-status-count { font-size: 0.72rem; font-weight: 700; color: var(--text-secondary); min-width: 20px; text-align: right; }

    /* At Risk KRs */
    .okr-ov-risk-list { display: flex; flex-direction: column; gap: 6px; }
    .okr-ov-risk-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 0; border-bottom: 1px solid var(--border-default); gap: 8px;
    }
    .okr-ov-risk-item:last-child { border-bottom: none; }
    .okr-ov-risk-info { flex: 1; min-width: 0; }
    .okr-ov-risk-title { font-size: 0.78rem; font-weight: 600; color: var(--text-primary); display: block; }
    .okr-ov-risk-obj { font-size: 0.65rem; color: var(--text-muted); }
    .okr-ov-risk-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
    .okr-ov-risk-bar {
      width: 60px; height: 4px; background: var(--bg-tertiary);
      border-radius: 2px; overflow: hidden;
    }
    .okr-ov-risk-fill { height: 100%; border-radius: 2px; }

    /* Cycle Summary */
    .okr-ov-summary-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
      margin-bottom: 16px;
    }
    .okr-ov-summary-item { display: flex; align-items: center; gap: 10px; }
    .okr-ov-summary-icon {
      width: 36px; height: 36px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .okr-ov-summary-value { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); display: block; line-height: 1; }
    .okr-ov-summary-label { font-size: 0.62rem; color: var(--text-muted); display: block; margin-top: 1px; }

    .okr-ov-cycle-timeline { margin-top: 4px; }
    .okr-ov-timeline-bar {
      width: 100%; height: 6px; background: var(--bg-tertiary);
      border-radius: 3px; overflow: hidden;
    }
    .okr-ov-timeline-fill {
      height: 100%; border-radius: 3px; background: var(--brand-orange);
      transition: width 0.6s ease;
    }
    .okr-ov-timeline-labels {
      display: flex; justify-content: space-between; margin-top: 4px;
      font-size: 0.62rem; color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .okr-ov-grid { grid-template-columns: 1fr; }
      .okr-ov-summary-grid { grid-template-columns: repeat(2, 1fr); }
    }
  `;
  document.head.appendChild(ovStyle);
}
