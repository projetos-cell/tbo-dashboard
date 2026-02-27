// ============================================================================
// TBO OS — OKRs v2: Tab Analytics
// Widgets: progress trend, status heatmap, owner leaderboard, completion rate
// ============================================================================

const TBO_OKRS_ANALYTICS = {

  _ctx: null,
  _chart: null,

  setup(ctx) {
    this._ctx = ctx;
  },

  render() {
    const ctx = this._ctx;
    if (!ctx) return '';
    const portal = ctx.portal;
    const objectives = (ctx.allObjectives || []).filter(o => o.status === 'active' && !o.archived_at);

    // Flatten KRs
    const allKRs = [];
    objectives.forEach(o => (o.okr_key_results || []).forEach(kr => {
      if (!kr.archived_at) allKRs.push({ ...kr, _objTitle: o.title, _objLevel: o.level, _ownerId: kr.owner_id || o.owner_id });
    }));

    // Completion rate
    const completed = allKRs.filter(kr => {
      const t = Number(kr.target_value || 1);
      const s = Number(kr.start_value || 0);
      const c = Number(kr.current_value || 0);
      return (t - s) > 0 && ((c - s) / (t - s)) >= 1;
    });
    const completionRate = allKRs.length > 0 ? (completed.length / allKRs.length) * 100 : 0;

    // Average progress
    const avgProg = this._avgKRProgress(allKRs);

    // Owner leaderboard
    const ownerMap = {};
    allKRs.forEach(kr => {
      const oid = kr._ownerId || 'unassigned';
      if (!ownerMap[oid]) ownerMap[oid] = { krs: [], totalProg: 0 };
      const prog = this._krProgress(kr);
      ownerMap[oid].krs.push(kr);
      ownerMap[oid].totalProg += prog;
    });
    const leaderboard = Object.entries(ownerMap)
      .map(([ownerId, data]) => ({
        ownerId,
        avg: data.krs.length > 0 ? data.totalProg / data.krs.length : 0,
        count: data.krs.length,
        name: this._getOwnerName(ownerId)
      }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);

    // Level breakdown
    const levelMap = {};
    objectives.forEach(o => {
      const lv = o.level || 'individual';
      if (!levelMap[lv]) levelMap[lv] = { total: 0, sum: 0 };
      levelMap[lv].total++;
      levelMap[lv].sum += Number(o.progress || 0);
    });

    return `
      <div class="okr-an">
        <!-- KPI Cards -->
        <div class="okr-an-kpis">
          ${this._renderKPI('Progresso Medio', `${Math.round(avgProg)}%`, 'trending-up', portal._progressColor(avgProg))}
          ${this._renderKPI('Taxa de Conclusao', `${Math.round(completionRate)}%`, 'check-circle', completionRate >= 70 ? '#16a34a' : completionRate >= 40 ? '#d97706' : '#dc2626')}
          ${this._renderKPI('KRs Completos', `${completed.length}/${allKRs.length}`, 'award', '#7c3aed')}
          ${this._renderKPI('Objetivos Ativos', `${objectives.length}`, 'target', '#2563eb')}
        </div>

        <div class="okr-an-grid">
          <!-- Progress by Level Chart -->
          <div class="okr-an-widget">
            <h4 class="okr-an-widget-title">
              <i data-lucide="bar-chart-3" style="width:14px;height:14px;"></i>
              Progresso por Nivel
            </h4>
            <div class="okr-an-level-bars">
              ${Object.entries(levelMap).map(([level, data]) => {
                const lc = portal._levelConfig[level] || portal._levelConfig.individual;
                const avg = data.total > 0 ? data.sum / data.total : 0;
                return `
                  <div class="okr-an-level-row">
                    <span class="okr-an-level-label">${lc.label}</span>
                    <div class="okr-an-level-bar">
                      <div class="okr-an-level-fill" style="width:${Math.min(avg, 100)}%;background:${lc.color};"></div>
                    </div>
                    <span class="okr-an-level-val" style="color:${lc.color};">${Math.round(avg)}%</span>
                  </div>
                `;
              }).join('')}
              ${Object.keys(levelMap).length === 0 ? '<p class="okr-an-no-data">Sem dados.</p>' : ''}
            </div>
          </div>

          <!-- Owner Leaderboard -->
          <div class="okr-an-widget">
            <h4 class="okr-an-widget-title">
              <i data-lucide="users" style="width:14px;height:14px;"></i>
              Ranking por Responsavel
            </h4>
            <div class="okr-an-leaderboard">
              ${leaderboard.length === 0 ? '<p class="okr-an-no-data">Sem dados.</p>' : ''}
              ${leaderboard.map((item, i) => `
                <div class="okr-an-lb-row">
                  <span class="okr-an-lb-rank">${i + 1}</span>
                  <span class="okr-an-lb-name">${this._esc(item.name)}</span>
                  <span class="okr-an-lb-count">${item.count} KR${item.count !== 1 ? 's' : ''}</span>
                  <div class="okr-an-lb-bar">
                    <div class="okr-an-lb-fill" style="width:${Math.min(item.avg, 100)}%;background:${portal._progressColor(item.avg)};"></div>
                  </div>
                  <span class="okr-an-lb-pct" style="color:${portal._progressColor(item.avg)};">${Math.round(item.avg)}%</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Status Heatmap -->
          <div class="okr-an-widget okr-an-widget--full">
            <h4 class="okr-an-widget-title">
              <i data-lucide="grid" style="width:14px;height:14px;"></i>
              Mapa de Status dos KRs
            </h4>
            <div class="okr-an-heatmap">
              ${allKRs.length === 0 ? '<p class="okr-an-no-data">Sem dados.</p>' : ''}
              ${allKRs.map(kr => {
                const conf = kr.confidence || 'on_track';
                const colors = { on_track: '#16a34a', attention: '#d97706', at_risk: '#dc2626', behind: '#dc2626' };
                const pct = this._krProgress(kr);
                return `
                  <div class="okr-an-heatmap-cell" title="${this._escAttr(kr.title)} (${Math.round(pct)}%)" style="background:${colors[conf] || colors.on_track};">
                    <span>${Math.round(pct)}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    // No special bindings for analytics
  },

  // ── Widget Helpers ──────────────────────────────────────────

  _renderKPI(label, value, icon, color) {
    return `
      <div class="okr-an-kpi">
        <div class="okr-an-kpi-icon" style="background:${color}15;color:${color};">
          <i data-lucide="${icon}" style="width:18px;height:18px;"></i>
        </div>
        <div>
          <span class="okr-an-kpi-value">${value}</span>
          <span class="okr-an-kpi-label">${label}</span>
        </div>
      </div>
    `;
  },

  // ── Calc Helpers ────────────────────────────────────────────

  _krProgress(kr) {
    const t = Number(kr.target_value || 1);
    const s = Number(kr.start_value || 0);
    const c = Number(kr.current_value || 0);
    const range = t - s;
    return range > 0 ? Math.min(100, Math.max(0, ((c - s) / range) * 100)) : 0;
  },

  _avgKRProgress(krs) {
    if (!krs || krs.length === 0) return 0;
    let sum = 0;
    krs.forEach(kr => { sum += this._krProgress(kr); });
    return sum / krs.length;
  },

  _getOwnerName(ownerId) {
    if (ownerId === 'unassigned') return 'Sem responsavel';
    const profiles = this._ctx?.profiles || [];
    const p = profiles.find(x => x.id === ownerId);
    return p ? (p.full_name || p.email || 'Desconhecido') : 'Desconhecido';
  },

  _esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  },

  _escAttr(s) {
    if (!s) return '';
    return s.replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  destroy() {
    this._ctx = null;
    if (this._chart) { this._chart.destroy(); this._chart = null; }
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_ANALYTICS = TBO_OKRS_ANALYTICS;

  const anStyle = document.createElement('style');
  anStyle.textContent = `
    /* ===== Analytics Tab ===== */
    .okr-an { display: flex; flex-direction: column; gap: 16px; }

    /* KPI Cards Row */
    .okr-an-kpis {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
    }
    .okr-an-kpi {
      display: flex; align-items: center; gap: 12px;
      background: var(--bg-card); border: 1px solid var(--border-default);
      border-radius: 10px; padding: 16px;
    }
    .okr-an-kpi-icon {
      width: 40px; height: 40px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .okr-an-kpi-value { font-size: 1.15rem; font-weight: 800; color: var(--text-primary); display: block; line-height: 1; }
    .okr-an-kpi-label { font-size: 0.65rem; color: var(--text-muted); display: block; margin-top: 2px; }

    /* Widget Grid */
    .okr-an-grid {
      display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;
    }
    .okr-an-widget {
      background: var(--bg-card); border: 1px solid var(--border-default);
      border-radius: 10px; padding: 18px 20px;
    }
    .okr-an-widget--full { grid-column: 1 / -1; }
    .okr-an-widget-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.82rem; font-weight: 700; color: var(--text-primary);
      margin: 0 0 14px;
    }
    .okr-an-no-data { font-size: 0.78rem; color: var(--text-muted); margin: 0; }

    /* Level Bars */
    .okr-an-level-bars { display: flex; flex-direction: column; gap: 10px; }
    .okr-an-level-row { display: flex; align-items: center; gap: 10px; }
    .okr-an-level-label { font-size: 0.75rem; color: var(--text-secondary); min-width: 70px; }
    .okr-an-level-bar {
      flex: 1; height: 8px; background: var(--bg-tertiary);
      border-radius: 4px; overflow: hidden;
    }
    .okr-an-level-fill { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
    .okr-an-level-val { font-size: 0.75rem; font-weight: 700; min-width: 32px; text-align: right; }

    /* Leaderboard */
    .okr-an-leaderboard { display: flex; flex-direction: column; gap: 6px; }
    .okr-an-lb-row {
      display: flex; align-items: center; gap: 8px;
      padding: 6px 0; border-bottom: 1px solid var(--border-default);
    }
    .okr-an-lb-row:last-child { border-bottom: none; }
    .okr-an-lb-rank {
      width: 20px; height: 20px; border-radius: 50%;
      background: var(--bg-tertiary); color: var(--text-muted);
      font-size: 0.65rem; font-weight: 700;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .okr-an-lb-name { font-size: 0.78rem; color: var(--text-primary); flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .okr-an-lb-count { font-size: 0.62rem; color: var(--text-muted); flex-shrink: 0; }
    .okr-an-lb-bar {
      width: 80px; height: 5px; background: var(--bg-tertiary);
      border-radius: 3px; overflow: hidden; flex-shrink: 0;
    }
    .okr-an-lb-fill { height: 100%; border-radius: 3px; transition: width 0.6s ease; }
    .okr-an-lb-pct { font-size: 0.72rem; font-weight: 700; min-width: 30px; text-align: right; }

    /* Heatmap */
    .okr-an-heatmap {
      display: flex; flex-wrap: wrap; gap: 4px;
    }
    .okr-an-heatmap-cell {
      width: 36px; height: 36px; border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      font-size: 0.62rem; font-weight: 700; color: #fff;
      opacity: 0.85; cursor: default; transition: opacity 0.15s;
    }
    .okr-an-heatmap-cell:hover { opacity: 1; }

    @media (max-width: 768px) {
      .okr-an-kpis { grid-template-columns: repeat(2, 1fr); }
      .okr-an-grid { grid-template-columns: 1fr; }
    }
  `;
  document.head.appendChild(anStyle);
}
