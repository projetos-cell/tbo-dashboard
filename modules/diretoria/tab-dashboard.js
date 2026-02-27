// ============================================================================
// TBO OS — Diretoria: Tab Dashboard
// KPI cards e quick links para diretoria
// ============================================================================

const TBO_DIRETORIA_DASHBOARD = {

  _portal: null,

  setup(portal) {
    this._portal = portal;
  },

  render() {
    const fmt = typeof TBO_FORMATTER !== 'undefined'
      ? TBO_FORMATTER
      : { currency: v => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}` };

    // Dados de equipe via TBO_PEOPLE_SHARED (se disponivel)
    let headcount = 0;
    let activeCount = 0;
    let totalSalary = 0;
    let busCount = 0;

    if (typeof TBO_PEOPLE_SHARED !== 'undefined') {
      const team = TBO_PEOPLE_SHARED._getInternalTeam ? TBO_PEOPLE_SHARED._getInternalTeam() : [];
      headcount = team.length;
      const active = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));
      activeCount = active.length;
      totalSalary = active.reduce((sum, t) => sum + (parseFloat(t.custoMensal) || 0), 0);
      const bus = new Set(active.map(t => t.bu).filter(Boolean));
      busCount = bus.size;
    }

    // Projetos ativos (se TBO_PROJETOS disponivel)
    let projetosAtivos = '—';
    if (typeof TBO_PROJETOS !== 'undefined' && TBO_PROJETOS._projects) {
      projetosAtivos = TBO_PROJETOS._projects.filter(p => p.status === 'em_andamento' || p.status === 'active').length;
    }

    return `
      <div class="card" style="padding:20px;margin-bottom:20px;">
        <h3 style="margin:0 0 4px;font-size:0.92rem;">Visao Geral</h3>
        <p style="color:var(--text-muted);font-size:0.75rem;margin:0;">Resumo executivo da operacao TBO</p>
      </div>

      <!-- KPIs -->
      <div class="grid-4" style="gap:12px;margin-bottom:20px;">
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Headcount</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${headcount}</div>
          <div style="font-size:0.72rem;color:var(--color-success);">${activeCount} ativos</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Mensal</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--brand-primary);margin:4px 0;">${fmt.currency(totalSalary)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">folha PJ</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Projetos Ativos</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${projetosAtivos}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">em andamento</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">BUs Ativas</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${busCount}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">equipes</div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="card" style="padding:20px;">
        <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i data-lucide="compass" style="width:16px;height:16px;color:var(--brand-primary);"></i>
          Acesso Rapido
        </h4>
        <div class="grid-4" style="gap:10px;">
          ${this._quickLink('People Analytics', 'bar-chart-3', 'diretoria/people', '#6366F1')}
          ${this._quickLink('Auditoria', 'scroll-text', 'diretoria/auditoria', '#EF4444')}
          ${this._quickLink('Financeiro', 'coins', 'financeiro', '#F59E0B')}
          ${this._quickLink('Relatorios', 'file-bar-chart', 'relatorios', '#8B5CF6')}
          ${this._quickLink('Equipe (RH)', 'users', 'rh', '#EC4899')}
          ${this._quickLink('Pipeline', 'filter', 'pipeline', '#3B82F6')}
          ${this._quickLink('Admin Portal', 'shield', 'admin', '#DC2626')}
          ${this._quickLink('Configuracoes', 'settings', 'configuracoes', '#64748B')}
        </div>
      </div>
    `;
  },

  _quickLink(label, icon, route, color) {
    return `
      <a href="#/${route}" class="card" style="padding:14px;display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;transition:box-shadow 0.15s;cursor:pointer;" onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
        <div style="width:32px;height:32px;border-radius:8px;background:${color}18;display:flex;align-items:center;justify-content:center;">
          <i data-lucide="${icon}" style="width:16px;height:16px;color:${color};"></i>
        </div>
        <span style="font-size:0.8rem;font-weight:600;">${label}</span>
      </a>
    `;
  },

  bind() {
    // Quick links usam <a href> — nao precisa bind extra
  }
};
