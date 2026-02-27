// ============================================================================
// TBO OS — Diretoria: Tab Reconhecimentos Dashboard
// Visao executiva: top reconhecidos, distribuicao por valor, custo rewards
// Sprint 2.3.5
// ============================================================================

const TBO_DIRETORIA_RECONHECIMENTOS = {

  _portal: null,
  _kpis: null,
  _profiles: [],
  _loading: false,

  setup(portal) {
    this._portal = portal;
  },

  render() {
    if (this._loading) {
      return `<div style="text-align:center;padding:40px;"><div class="spinner"></div>
        <p style="color:var(--text-muted);margin-top:12px;">Carregando dados de reconhecimentos...</p></div>`;
    }

    if (!this._kpis) {
      return `<div style="text-align:center;padding:40px;color:var(--text-muted);">
        <i data-lucide="award" style="width:40px;height:40px;opacity:0.3;margin-bottom:8px;"></i>
        <p>Carregue os dados para visualizar o dashboard.</p>
      </div>`;
    }

    const k = this._kpis;

    // Build top monthly list
    const topList = (k.topMonthly || []).map(([userId, count], i) => {
      const name = this._getProfileName(userId);
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
      return `<div class="dir-rec-top-item">
        <span class="dir-rec-rank">${medal}</span>
        <span class="dir-rec-name">${name}</span>
        <span class="dir-rec-count">${count}x</span>
      </div>`;
    }).join('') || '<p style="color:var(--text-muted);font-size:0.78rem;">Nenhum reconhecimento este mes.</p>';

    // Build value distribution bars
    const byValue = k.byValue || {};
    const maxVal = Math.max(...Object.values(byValue), 1);
    const valueBars = Object.entries(byValue)
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => {
        const pct = Math.round((count / maxVal) * 100);
        return `<div class="dir-rec-bar-row">
          <span class="dir-rec-bar-label">${this._escapeHtml(name)}</span>
          <div class="dir-rec-bar-track">
            <div class="dir-rec-bar-fill" style="width:${pct}%;"></div>
          </div>
          <span class="dir-rec-bar-val">${count}</span>
        </div>`;
      }).join('') || '<p style="color:var(--text-muted);font-size:0.78rem;">Sem dados de valores.</p>';

    // Trend: compute monthly counts for last 6 months
    const trendHtml = this._renderTrendChart();

    return `
      <style>${this._getStyles()}</style>

      <!-- KPI Cards -->
      <div class="grid-4" style="gap:12px;margin-bottom:20px;">
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Total Reconhecimentos</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${k.totalRecognitions}</div>
          <div style="font-size:0.72rem;color:var(--color-success);">${k.thisMonth} este mes</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Resgates</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--brand-primary);margin:4px 0;">${k.totalRedemptions}</div>
          <div style="font-size:0.72rem;color:${k.pendingRedemptions > 0 ? 'var(--color-warning)' : 'var(--text-muted)'};">${k.pendingRedemptions} pendentes</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Rewards</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--color-warning);margin:4px 0;">R$ ${Number(k.totalRewardsCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">aprovados + entregues</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Media/Pessoa (Mes)</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${this._avgPerPerson()}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">reconhecimentos</div>
        </div>
      </div>

      <!-- Two column layout -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;">
        <!-- Top Reconhecidos do Mes -->
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="trophy" style="width:16px;height:16px;color:#F59E0B;"></i>
            Top Reconhecidos do Mes
          </h4>
          <div class="dir-rec-top-list">
            ${topList}
          </div>
        </div>

        <!-- Distribuicao por Valor TBO -->
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="pie-chart" style="width:16px;height:16px;color:#8B5CF6;"></i>
            Distribuicao por Valor
          </h4>
          ${valueBars}
        </div>
      </div>

      <!-- Trend Chart -->
      <div class="card" style="padding:20px;">
        <h4 style="font-size:0.85rem;margin:0 0 16px;display:flex;align-items:center;gap:8px;">
          <i data-lucide="trending-up" style="width:16px;height:16px;color:#3B82F6;"></i>
          Tendencia (Ultimos 6 Meses)
        </h4>
        ${trendHtml}
      </div>

      <!-- Quick links -->
      <div class="card" style="padding:16px;margin-top:16px;">
        <div style="display:flex;gap:12px;justify-content:center;">
          <a href="#/reconhecimentos" style="font-size:0.8rem;color:var(--brand-primary);text-decoration:none;display:flex;align-items:center;gap:4px;">
            <i data-lucide="heart" style="width:14px;height:14px;"></i> Ver Feed Completo
          </a>
          <span style="color:var(--border-default);">|</span>
          <a href="#/reconhecimentos" style="font-size:0.8rem;color:var(--brand-primary);text-decoration:none;display:flex;align-items:center;gap:4px;">
            <i data-lucide="gift" style="width:14px;height:14px;"></i> Gerenciar Recompensas
          </a>
        </div>
      </div>
    `;
  },

  // ── Trend chart (CSS bars for last 6 months) ──────────────

  _renderTrendChart() {
    if (!this._kpis || !this._kpis._allRecs) return '<p style="color:var(--text-muted);font-size:0.78rem;">Dados insuficientes.</p>';

    const all = this._kpis._allRecs;
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const count = all.filter(r => {
        const rd = new Date(r.created_at);
        return rd >= d && rd <= end;
      }).length;
      months.push({
        label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
        count
      });
    }

    const maxCount = Math.max(...months.map(m => m.count), 1);

    return `
      <div class="dir-rec-trend">
        ${months.map(m => {
          const h = Math.round((m.count / maxCount) * 120);
          return `<div class="dir-rec-trend-col">
            <div class="dir-rec-trend-val">${m.count}</div>
            <div class="dir-rec-trend-bar" style="height:${Math.max(h, 4)}px;"></div>
            <div class="dir-rec-trend-label">${m.label}</div>
          </div>`;
        }).join('')}
      </div>
    `;
  },

  // ── Data Loading ──────────────────────────────────────────

  async loadData() {
    if (this._loading) return;
    this._loading = true;
    this._rerender();

    try {
      // Load KPIs from repo
      if (typeof RecognitionRewardsRepo !== 'undefined') {
        this._kpis = await RecognitionRewardsRepo.getDashboardKPIs();
      }

      // Also fetch the raw recognitions for the trend chart
      if (typeof RecognitionsRepo !== 'undefined') {
        const { data } = await RecognitionsRepo.list({ limit: 500 });
        if (this._kpis) {
          this._kpis._allRecs = data || [];
        }
      }

      // Load profiles for name resolution
      if (typeof PeopleRepo !== 'undefined') {
        this._profiles = await PeopleRepo.list({ is_active: true, limit: 200 }) || [];
      }
    } catch (e) {
      console.error('[Diretoria/Reconhecimentos] Erro:', e);
    }

    this._loading = false;
    this._rerender();
  },

  _rerender() {
    if (this._portal && this._portal._rerender) {
      this._portal._rerender();
    } else {
      const el = document.getElementById('dirTabContent');
      if (el) {
        el.innerHTML = this.render();
        this.bind();
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  },

  // ── Events ────────────────────────────────────────────────

  bind() {
    // No special bindings needed — links use <a href>
  },

  // ── Helpers ───────────────────────────────────────────────

  _getProfileName(userId) {
    if (!userId) return 'Desconhecido';
    const p = this._profiles.find(p => (p.supabase_uid || p.id) === userId);
    return p?.name || p?.full_name || userId.substring(0, 8);
  },

  _avgPerPerson() {
    if (!this._kpis) return '0';
    const topMonthly = this._kpis.topMonthly || [];
    if (!topMonthly.length) return '0';
    const total = topMonthly.reduce((sum, [, count]) => sum + count, 0);
    return (total / topMonthly.length).toFixed(1);
  },

  _escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  // ── Styles ────────────────────────────────────────────────

  _getStyles() {
    return `
      .dir-rec-top-list { display:flex; flex-direction:column; gap:8px; }
      .dir-rec-top-item {
        display:flex; align-items:center; gap:10px; padding:8px 10px;
        background:var(--bg-secondary); border-radius:8px; font-size:0.82rem;
      }
      .dir-rec-rank { font-size:1rem; min-width:28px; text-align:center; }
      .dir-rec-name { flex:1; font-weight:500; }
      .dir-rec-count { font-weight:700; color:var(--brand-primary); }

      .dir-rec-bar-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
      .dir-rec-bar-label { font-size:0.78rem; min-width:100px; color:var(--text-secondary); }
      .dir-rec-bar-track { flex:1; height:20px; background:var(--bg-secondary); border-radius:4px; overflow:hidden; }
      .dir-rec-bar-fill { height:100%; background:linear-gradient(90deg, #8B5CF6, #A78BFA); border-radius:4px; transition:width 0.5s; }
      .dir-rec-bar-val { font-size:0.78rem; font-weight:700; min-width:30px; text-align:right; }

      .dir-rec-trend { display:flex; align-items:flex-end; gap:12px; justify-content:center; padding:10px 0; }
      .dir-rec-trend-col { display:flex; flex-direction:column; align-items:center; gap:4px; }
      .dir-rec-trend-val { font-size:0.7rem; font-weight:600; color:var(--text-secondary); }
      .dir-rec-trend-bar { width:40px; background:linear-gradient(180deg, #3B82F6, #60A5FA); border-radius:4px 4px 0 0; min-height:4px; transition:height 0.5s; }
      .dir-rec-trend-label { font-size:0.68rem; color:var(--text-muted); text-transform:capitalize; }

      @media (max-width: 768px) {
        .grid-4 { grid-template-columns: 1fr 1fr !important; }
        div[style*="grid-template-columns:1fr 1fr"] { grid-template-columns: 1fr !important; }
        .dir-rec-trend-bar { width:28px; }
      }
    `;
  }
};
