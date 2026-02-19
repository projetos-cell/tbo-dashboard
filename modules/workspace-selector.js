// TBO OS v2 — Workspace Selector (Selecao de Empresa/Tenant)
// Exibe cards para o usuario escolher entre TBO e TBO Academy (ou N empresas)
// Persiste tenant ativo em sessionStorage e carrega permissoes do Supabase

const TBO_WORKSPACE = {
  _currentTenant: null,
  _tenants: [],

  // Obter tenant ativo da sessao
  getCurrentTenant() {
    if (this._currentTenant) return this._currentTenant;
    try {
      const raw = sessionStorage.getItem('tbo_active_tenant');
      if (raw) {
        this._currentTenant = JSON.parse(raw);
        return this._currentTenant;
      }
    } catch (e) { /* ignore */ }
    return null;
  },

  // Definir tenant ativo
  setCurrentTenant(tenant) {
    this._currentTenant = tenant;
    sessionStorage.setItem('tbo_active_tenant', JSON.stringify(tenant));
  },

  // Limpar tenant (logout)
  clearTenant() {
    this._currentTenant = null;
    sessionStorage.removeItem('tbo_active_tenant');
  },

  // Carregar tenants do Supabase para o usuario logado
  async loadTenants() {
    if (typeof TBO_SUPABASE === 'undefined') {
      // Fallback: tenants estaticos
      this._tenants = [
        { id: 'tbo', name: 'TBO', slug: 'tbo', logo_url: 'assets/logo-dark.svg', description: 'Studio de Arquitetura & Visualizacao' },
        { id: 'tbo-academy', name: 'TBO Academy', slug: 'tbo-academy', logo_url: null, description: 'Plataforma de Ensino e Capacitacao' }
      ];
      return this._tenants;
    }

    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) throw new Error('Client nao disponivel');

      // Buscar tenants onde o usuario e membro
      const { data: memberships, error: memErr } = await client
        .from('tenant_members')
        .select('tenant_id, roles(name, slug)')
        .eq('user_id', (await client.auth.getUser()).data?.user?.id)
        .eq('is_active', true);

      if (memErr) throw memErr;

      if (memberships && memberships.length > 0) {
        const tenantIds = memberships.map(m => m.tenant_id);
        const { data: tenants, error: tErr } = await client
          .from('tenants')
          .select('*')
          .in('id', tenantIds)
          .eq('is_active', true);

        if (tErr) throw tErr;
        this._tenants = tenants || [];
      } else {
        // Usuario sem memberships — mostrar todos os tenants disponiveis
        const { data: tenants, error: tErr } = await client
          .from('tenants')
          .select('*')
          .eq('is_active', true);

        if (tErr) throw tErr;
        this._tenants = tenants || [];
      }
    } catch (e) {
      console.warn('[TBO Workspace] Erro ao carregar tenants, usando fallback:', e);
      this._tenants = [
        { id: 'tbo', name: 'TBO', slug: 'tbo', logo_url: 'assets/logo-dark.svg', description: 'Studio de Arquitetura & Visualizacao' },
        { id: 'tbo-academy', name: 'TBO Academy', slug: 'tbo-academy', logo_url: null, description: 'Plataforma de Ensino e Capacitacao' }
      ];
    }

    return this._tenants;
  },

  // Renderizar tela de selecao de workspace
  render() {
    const tenants = this._tenants.length > 0 ? this._tenants : [
      { id: 'tbo', name: 'TBO', slug: 'tbo', description: 'Studio de Arquitetura & Visualizacao' },
      { id: 'tbo-academy', name: 'TBO Academy', slug: 'tbo-academy', description: 'Plataforma de Ensino e Capacitacao' }
    ];

    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const greeting = user ? `Ola, ${user.name.split(' ')[0]}` : 'Bem-vindo';

    // Icones por slug
    const icons = {
      'tbo': 'building-2',
      'tbo-academy': 'graduation-cap'
    };

    const cardsHtml = tenants.map(t => `
      <button class="ws-card" data-tenant-id="${t.id}" data-tenant-slug="${t.slug}">
        <div class="ws-card-icon">
          <i data-lucide="${icons[t.slug] || 'briefcase'}" style="width:48px;height:48px;"></i>
        </div>
        <div class="ws-card-info">
          <h3 class="ws-card-name">${t.name}</h3>
          <p class="ws-card-desc">${t.description || ''}</p>
        </div>
        <div class="ws-card-arrow">
          <i data-lucide="arrow-right" style="width:20px;height:20px;"></i>
        </div>
      </button>
    `).join('');

    return `
      <div class="ws-container">
        <div class="ws-header">
          <img src="assets/logo-dark.svg" alt="TBO" class="ws-logo" draggable="false">
          <h1 class="ws-title">${greeting}</h1>
          <p class="ws-subtitle">Selecione o workspace para continuar</p>
        </div>
        <div class="ws-cards">
          ${cardsHtml}
        </div>
        <div class="ws-footer">
          <p class="ws-version">TBO OS v2.0</p>
        </div>
      </div>
    `;
  },

  // Inicializar eventos
  init() {
    document.querySelectorAll('.ws-card').forEach(card => {
      card.addEventListener('click', () => {
        const tenantId = card.dataset.tenantId;
        const tenantSlug = card.dataset.tenantSlug;
        const tenant = this._tenants.find(t => t.id === tenantId || t.slug === tenantSlug);

        if (tenant) {
          this.setCurrentTenant(tenant);

          // Feedback visual
          card.classList.add('ws-card--selected');

          // Navegar para o dashboard apos breve delay
          setTimeout(() => {
            if (typeof TBO_ROUTER !== 'undefined') {
              TBO_ROUTER.navigate('command-center');
            }
          }, 300);

          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('Workspace', `Voce esta em ${tenant.name}`);
          }
        }
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  // Verificar se precisa mostrar selector
  shouldShowSelector() {
    return !this.getCurrentTenant();
  }
};
