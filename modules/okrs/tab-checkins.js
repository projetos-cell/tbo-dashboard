// ============================================================================
// TBO OS — OKRs v2: Tab Check-ins — Inbox by Priority
// Groups KRs by urgency: Atrasado > Atencao > Em dia
// Quick check-in flow, recent history
// ============================================================================

const TBO_OKRS_CHECKINS = {

  _ctx: null,
  _recentCheckins: [],
  _loadedRecent: false,

  setup(ctx) {
    this._ctx = ctx;
  },

  render() {
    const ctx = this._ctx;
    if (!ctx) return '';
    const portal = ctx.portal;
    const objectives = ctx.allObjectives || [];

    // Flatten all active KRs with their parent objective info
    const allKRs = [];
    objectives.forEach(obj => {
      if (obj.status !== 'active' || obj.archived_at) return;
      (obj.okr_key_results || []).forEach(kr => {
        if (kr.archived_at) return;
        allKRs.push({ ...kr, _objTitle: obj.title, _objLevel: obj.level, _objId: obj.id });
      });
    });

    // Group by priority
    const behind = allKRs.filter(kr => kr.confidence === 'behind');
    const atRisk = allKRs.filter(kr => kr.confidence === 'at_risk');
    const onTrack = allKRs.filter(kr => kr.confidence === 'on_track' || !kr.confidence);

    const groups = [
      { key: 'behind',   label: 'Atrasado',  color: '#dc2626', bg: 'rgba(239,68,68,0.06)',  icon: 'alert-circle',   items: behind },
      { key: 'at_risk',  label: 'Atencao',    color: '#d97706', bg: 'rgba(245,158,11,0.06)', icon: 'alert-triangle', items: atRisk },
      { key: 'on_track', label: 'Em dia',     color: '#16a34a', bg: 'rgba(34,197,94,0.06)',  icon: 'check-circle',   items: onTrack }
    ];

    const totalKRs = allKRs.length;
    const pendingCount = behind.length + atRisk.length;

    return `
      <div class="okr-ci">
        <!-- Summary strip -->
        <div class="okr-ci-summary">
          <div class="okr-ci-summary-item">
            <span class="okr-ci-summary-value">${totalKRs}</span>
            <span class="okr-ci-summary-label">Key Results</span>
          </div>
          <div class="okr-ci-summary-sep"></div>
          <div class="okr-ci-summary-item ${pendingCount > 0 ? 'okr-ci-summary--warn' : ''}">
            <span class="okr-ci-summary-value">${pendingCount}</span>
            <span class="okr-ci-summary-label">Precisam atencao</span>
          </div>
          <div class="okr-ci-summary-sep"></div>
          <div class="okr-ci-summary-item">
            <span class="okr-ci-summary-value">${onTrack.length}</span>
            <span class="okr-ci-summary-label">No caminho</span>
          </div>
        </div>

        <!-- Priority Groups -->
        ${groups.map(g => this._renderGroup(g)).join('')}

        <!-- Recent Check-ins -->
        <div class="okr-ci-recent">
          <h4 class="okr-ci-section-title">
            <i data-lucide="clock" style="width:14px;height:14px;"></i>
            Check-ins Recentes
          </h4>
          <div id="okrCiRecentList">
            ${this._loadedRecent ? this._renderRecentList() : '<p class="okr-ci-loading-text">Carregando...</p>'}
          </div>
        </div>
      </div>
    `;
  },

  bind() {
    const portal = this._ctx?.portal;
    if (!portal) return;

    // Check-in buttons
    document.querySelectorAll('.okr-ci-checkin-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const kr = this._findKR(btn.dataset.krId);
        const objTitle = btn.dataset.objTitle || '';
        if (kr) portal.openModal('createCheckin', { kr, objTitle });
      });
    });

    // Load recent check-ins if not loaded
    if (!this._loadedRecent) {
      this._loadRecentCheckins();
    }
  },

  async _loadRecentCheckins() {
    if (typeof OkrsRepo === 'undefined') return;
    const portal = this._ctx?.portal;
    try {
      this._recentCheckins = await OkrsRepo.listRecentCheckins({ cycleId: this._ctx?.cycle?.id, limit: 20 });
      this._loadedRecent = true;
      const container = document.getElementById('okrCiRecentList');
      if (container) {
        container.innerHTML = this._renderRecentList();
        if (portal) portal._icons();
      }
    } catch (e) {
      console.warn('[OKRs] Recent checkins:', e.message);
      this._recentCheckins = [];
      this._loadedRecent = true;
    }
  },

  // ── Priority Group ──────────────────────────────────────────
  _renderGroup(group) {
    if (group.items.length === 0) return '';

    return `
      <div class="okr-ci-group">
        <div class="okr-ci-group-header" style="border-left: 3px solid ${group.color}; background: ${group.bg};">
          <div class="okr-ci-group-label">
            <i data-lucide="${group.icon}" style="width:14px;height:14px;color:${group.color};"></i>
            <span style="color:${group.color};font-weight:700;">${group.label}</span>
            <span class="okr-ci-group-count">${group.items.length}</span>
          </div>
        </div>
        <div class="okr-ci-group-items">
          ${group.items.map(kr => this._renderKRInbox(kr, group)).join('')}
        </div>
      </div>
    `;
  },

  _renderKRInbox(kr, group) {
    const portal = this._ctx?.portal;
    if (!portal) return '';

    const target = Number(kr.target_value || 1);
    const start = Number(kr.start_value || 0);
    const current = Number(kr.current_value || 0);
    const range = target - start;
    const pct = range > 0 ? Math.min(100, Math.max(0, ((current - start) / range) * 100)) : 0;

    const lc = portal._levelConfig[kr._objLevel] || portal._levelConfig.individual;

    return `
      <div class="okr-ci-kr-row">
        <div class="okr-ci-kr-info">
          <div class="okr-ci-kr-title">${this._esc(kr.title)}</div>
          <div class="okr-ci-kr-obj">
            <span class="okr2-level-badge okr2-level--${kr._objLevel}" style="font-size:0.58rem;padding:0 5px;">${lc.label}</span>
            <span>${this._esc(kr._objTitle)}</span>
          </div>
          <div class="okr-ci-kr-progress">
            <div class="okr-ci-kr-track">
              <div class="okr-ci-kr-fill" style="width:${pct}%;background:${group.color};"></div>
            </div>
            <span class="okr-ci-kr-val">${current}${kr.unit ? ' ' + kr.unit : ''} / ${kr.target_value}${kr.unit ? ' ' + kr.unit : ''}</span>
            <span style="font-size:0.7rem;font-weight:700;color:${group.color};">${Math.round(pct)}%</span>
          </div>
        </div>
        <button class="okr-ci-checkin-btn okr2-btn-primary" data-kr-id="${kr.id}" data-obj-title="${this._escAttr(kr._objTitle)}" style="padding:6px 14px;font-size:0.75rem;">
          <i data-lucide="check" style="width:12px;height:12px;"></i> Check-in
        </button>
      </div>
    `;
  },

  // ── Recent Check-ins ────────────────────────────────────────
  _renderRecentList() {
    if (!this._recentCheckins || this._recentCheckins.length === 0) {
      return '<p class="okr-ci-no-recent">Nenhum check-in registrado neste ciclo.</p>';
    }

    return this._recentCheckins.map(ci => {
      const sc = {
        on_track: { color: '#16a34a', label: 'On Track' },
        at_risk: { color: '#d97706', label: 'Em Risco' },
        behind: { color: '#dc2626', label: 'Atrasado' }
      };
      const conf = sc[ci.confidence] || sc.on_track;
      const date = ci.created_at ? new Date(ci.created_at) : null;
      const dateStr = date ? date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

      // Try to get KR title from objectives
      let krTitle = '';
      let objTitle = '';
      for (const obj of (this._ctx?.allObjectives || [])) {
        const kr = (obj.okr_key_results || []).find(k => k.id === ci.key_result_id);
        if (kr) { krTitle = kr.title; objTitle = obj.title; break; }
      }

      return `
        <div class="okr-ci-recent-item">
          <div class="okr-ci-recent-dot" style="background:${conf.color};"></div>
          <div class="okr-ci-recent-info">
            <div class="okr-ci-recent-title">
              <strong>${this._esc(krTitle || 'Key Result')}</strong>
              <span class="okr2-status-badge okr2-status--${ci.confidence}" style="font-size:0.6rem;">${conf.label}</span>
            </div>
            <div class="okr-ci-recent-meta">
              <span>${this._esc(objTitle)}</span>
              ${ci.previous_value != null ? `<span>Valor: ${ci.previous_value} → ${ci.new_value}</span>` : `<span>Valor: ${ci.new_value}</span>`}
              ${dateStr ? `<span>${dateStr}</span>` : ''}
            </div>
            ${ci.notes ? `<p class="okr-ci-recent-notes">${this._esc(ci.notes)}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  // ── Helpers ─────────────────────────────────────────────────
  _findKR(id) {
    for (const obj of (this._ctx?.allObjectives || [])) {
      const kr = (obj.okr_key_results || []).find(k => k.id === id);
      if (kr) return kr;
    }
    return null;
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
    this._recentCheckins = [];
    this._loadedRecent = false;
    this._ctx = null;
  }
};

if (typeof window !== 'undefined') {
  window.TBO_OKRS_CHECKINS = TBO_OKRS_CHECKINS;

  const ciStyle = document.createElement('style');
  ciStyle.textContent = `
    /* ===== Check-ins Tab ===== */
    .okr-ci { display: flex; flex-direction: column; gap: 16px; }

    /* Summary Strip */
    .okr-ci-summary {
      display: flex; align-items: center; gap: 20px;
      padding: 14px 20px; background: var(--bg-card);
      border: 1px solid var(--border-default); border-radius: 10px;
    }
    .okr-ci-summary-item { text-align: center; min-width: 80px; }
    .okr-ci-summary-value { font-size: 1.3rem; font-weight: 800; color: var(--text-primary); display: block; line-height: 1; }
    .okr-ci-summary-label { font-size: 0.65rem; color: var(--text-muted); margin-top: 2px; display: block; }
    .okr-ci-summary--warn .okr-ci-summary-value { color: #d97706; }
    .okr-ci-summary-sep { width: 1px; height: 28px; background: var(--border-default); }

    /* Group */
    .okr-ci-group { border-radius: 10px; overflow: hidden; border: 1px solid var(--border-default); }
    .okr-ci-group-header {
      display: flex; align-items: center; padding: 10px 16px;
      border-left: 3px solid transparent;
    }
    .okr-ci-group-label { display: flex; align-items: center; gap: 8px; font-size: 0.82rem; }
    .okr-ci-group-count {
      font-size: 0.68rem; padding: 1px 7px; border-radius: 10px;
      background: rgba(0,0,0,0.06); color: var(--text-muted); font-weight: 600;
    }
    .okr-ci-group-items { background: var(--bg-card); }

    /* KR Inbox Row */
    .okr-ci-kr-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; border-top: 1px solid var(--border-default);
      gap: 12px; transition: background 0.1s;
    }
    .okr-ci-kr-row:hover { background: var(--bg-card-hover); }
    .okr-ci-kr-info { flex: 1; min-width: 0; }
    .okr-ci-kr-title { font-size: 0.82rem; font-weight: 600; color: var(--text-primary); margin-bottom: 3px; }
    .okr-ci-kr-obj {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.7rem; color: var(--text-muted); margin-bottom: 6px;
    }
    .okr-ci-kr-progress { display: flex; align-items: center; gap: 8px; }
    .okr-ci-kr-track {
      width: 100px; height: 4px; background: var(--bg-tertiary);
      border-radius: 2px; overflow: hidden;
    }
    .okr-ci-kr-fill { height: 100%; border-radius: 2px; transition: width 0.4s ease; }
    .okr-ci-kr-val { font-size: 0.68rem; color: var(--text-muted); }

    /* Recent Check-ins */
    .okr-ci-recent {
      background: var(--bg-card); border: 1px solid var(--border-default);
      border-radius: 10px; padding: 16px 20px;
    }
    .okr-ci-section-title {
      display: flex; align-items: center; gap: 6px;
      font-size: 0.85rem; font-weight: 700; color: var(--text-primary);
      margin: 0 0 12px;
    }
    .okr-ci-recent-item {
      display: flex; gap: 10px; padding: 10px 0;
      border-bottom: 1px solid var(--border-default);
    }
    .okr-ci-recent-item:last-child { border-bottom: none; }
    .okr-ci-recent-dot {
      width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; margin-top: 5px;
    }
    .okr-ci-recent-info { flex: 1; min-width: 0; }
    .okr-ci-recent-title {
      display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      font-size: 0.8rem; color: var(--text-primary);
    }
    .okr-ci-recent-meta {
      display: flex; gap: 12px; flex-wrap: wrap;
      font-size: 0.68rem; color: var(--text-muted); margin-top: 3px;
    }
    .okr-ci-recent-notes {
      font-size: 0.75rem; color: var(--text-secondary); margin: 6px 0 0;
      padding: 8px 10px; background: var(--bg-card-hover); border-radius: 6px;
      line-height: 1.4;
    }
    .okr-ci-no-recent { font-size: 0.8rem; color: var(--text-muted); margin: 0; }
    .okr-ci-loading-text { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

    @media (max-width: 768px) {
      .okr-ci-summary { flex-wrap: wrap; gap: 12px; }
      .okr-ci-summary-sep { display: none; }
      .okr-ci-kr-row { flex-direction: column; align-items: flex-start; }
    }
  `;
  document.head.appendChild(ciStyle);
}
