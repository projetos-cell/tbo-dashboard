// TBO OS — Permissions & RBAC Definitions
// Central authority for roles, module access, sidebar sections, and user-role mapping.
// Loaded BEFORE auth.js — no dependencies on other TBO modules.

const TBO_PERMISSIONS = {

  // ── Super Administradores (acesso total, NUNCA perdem acesso) ───────────
  _superAdmins: ['marco@agenciatbo.com.br', 'ruy@agenciatbo.com.br'],

  isSuperAdmin(email) {
    return email && this._superAdmins.includes(email.toLowerCase());
  },

  // ── Role Definitions ──────────────────────────────────────────────────────

  // Modules visible to ALL roles (operational basics)
  _sharedModules: [
    'entregas','tarefas','revisoes',
    'decisoes','biblioteca',
    'carga-trabalho','timesheets','capacidade',
    'trilha-aprendizagem','pessoas-avancado',
    'integracoes','templates',
    'workspace','changelog'
  ],

  // Finance-restricted modules (founders + finance only)
  _financeModules: [
    'pagar','receber','margens','conciliacao'
  ],

  // Admin modules (founders + project_owners)
  _adminModules: [
    'permissoes-config'
  ],

  _roles: {
    founder: {
      label: 'Fundador',
      color: '#E85102',
      modules: ['command-center','alerts','inteligencia','pipeline','comercial','clientes','portal-cliente','contratos','conteudo','projetos','mercado','reunioes','financeiro','rh','cultura','configuracoes','admin-onboarding'],
      dashboardVariant: 'full',
      defaultModule: 'command-center'
    },
    project_owner: {
      label: 'Project Owner',
      color: '#8b5cf6',
      modules: ['command-center','alerts','comercial','clientes','portal-cliente','contratos','conteudo','projetos','mercado','reunioes','rh','cultura','configuracoes','admin-onboarding'],
      dashboardVariant: 'projects',
      defaultModule: 'command-center'
    },
    artist: {
      label: 'Artista',
      color: '#3a7bd5',
      modules: ['command-center','alerts','projetos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'tasks',
      defaultModule: 'command-center'
    },
    comercial: {
      label: 'Comercial',
      color: '#f59e0b',
      modules: ['command-center','alerts','pipeline','comercial','clientes','portal-cliente','contratos','projetos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'full',
      defaultModule: 'command-center'
    },
    finance: {
      label: 'Financeiro',
      color: '#2ecc71',
      modules: ['command-center','alerts','inteligencia','pipeline','financeiro','comercial','clientes','portal-cliente','contratos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'financial',
      defaultModule: 'command-center'
    }
  },

  // ── User → Role Mapping ──────────────────────────────────────────────────
  // v2.1: fonte de verdade e Supabase (profiles + tenant_members + roles)
  // Fallback hardcoded mantido apenas para bootstrap inicial / offline
  _userRoles: {},
  _userRolesLoaded: false,

  // Carregar roles do Supabase (chamado apos login)
  async loadUserRolesFromSupabase() {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const tenantId = TBO_SUPABASE.getCurrentTenantId();
      if (!tenantId) return;

      // Buscar profiles com role do tenant_members
      const { data: members, error } = await client
        .from('tenant_members')
        .select('user_id, role_id, roles(name), profiles(username, bu, is_coordinator)')
        .eq('tenant_id', tenantId);

      if (error || !members) {
        console.warn('[TBO Permissions] Falha ao carregar roles do Supabase:', error?.message);
        return;
      }

      const newRoles = {};
      members.forEach(m => {
        const username = m.profiles?.username;
        if (!username) return;
        newRoles[username] = {
          role: m.roles?.name || 'artist',
          bu: m.profiles?.bu || null,
          isCoordinator: m.profiles?.is_coordinator || false
        };
      });

      if (Object.keys(newRoles).length > 0) {
        this._userRoles = newRoles;
        this._userRolesLoaded = true;
        console.log(`[TBO Permissions] ${Object.keys(newRoles).length} user roles carregados do Supabase`);
      }
    } catch (e) {
      console.warn('[TBO Permissions] loadUserRolesFromSupabase error:', e);
    }
  },

  // Fallback hardcoded — usado apenas se Supabase nao estiver disponivel
  _defaultUserRoles: {
    marco:    { role: 'founder',       bu: null,           isCoordinator: false },
    ruy:      { role: 'founder',       bu: null,           isCoordinator: false },
    carol:    { role: 'project_owner', bu: null,           isCoordinator: true  },
    nelson:   { role: 'project_owner', bu: 'Branding',     isCoordinator: false },
    nath:     { role: 'project_owner', bu: 'Digital 3D',   isCoordinator: true  },
    rafa:     { role: 'project_owner', bu: 'Marketing',    isCoordinator: false },
    gustavo:  { role: 'comercial',     bu: 'Vendas',       isCoordinator: false },
    celso:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    erick:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    dann:     { role: 'project_owner', bu: 'Digital 3D',   isCoordinator: false },
    duda:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    tiago:    { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    mari:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    lucca:    { role: 'artist',        bu: 'Marketing',    isCoordinator: false },
    financaazul: { role: 'finance',    bu: null,           isCoordinator: false }
  },

  // ── Sidebar Section Definitions (organized by operational flow) ───────────
  _sections: [
    {
      id: 'command-center-section',
      label: 'COMMAND CENTER',
      icon: 'layout-dashboard',
      modules: ['command-center',  'alerts']
    },
    {
      id: 'receita',
      label: 'RECEITA',
      icon: 'trending-up',
      modules: ['pipeline', 'comercial', 'clientes', 'portal-cliente', 'contratos']
    },
    {
      id: 'projetos-core',
      label: 'PROJETOS',
      icon: 'clipboard-list',
      modules: ['projetos', 'entregas', 'tarefas', 'revisoes']
    },
    {
      id: 'inteligencia',
      label: 'CONTEÚDO & INTELIGÊNCIA',
      icon: 'brain',
      modules: ['inteligencia', 'conteudo', 'mercado', 'reunioes', 'decisoes', 'biblioteca']
    },
    {
      id: 'pessoas',
      label: 'PESSOAS',
      icon: 'users',
      modules: ['rh', 'cultura', 'trilha-aprendizagem', 'pessoas-avancado', 'carga-trabalho', 'timesheets', 'capacidade', 'admin-onboarding']
    },
    {
      id: 'financeiro-section',
      label: 'FINANCEIRO',
      icon: 'coins',
      modules: ['financeiro', 'pagar', 'receber', 'margens', 'conciliacao']
    },
    {
      id: 'sistema',
      label: 'SISTEMA',
      icon: 'settings',
      modules: ['configuracoes', 'templates', 'permissoes-config', 'integracoes', 'changelog']
    }
  ],

  // ── Public API ────────────────────────────────────────────────────────────

  getRoleForUser(userId) {
    // v2.1: tentar do Supabase primeiro, fallback para defaults
    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    if (!mapping) return null;
    const roleDef = this._roles[mapping.role];
    if (!roleDef) return null;
    return {
      ...roleDef,
      roleName: mapping.role,
      bu: mapping.bu,
      isCoordinator: mapping.isCoordinator
    };
  },

  getModulesForUser(userId, email) {
    // v2.1: Super admins SEMPRE tem acesso total, independente do que Supabase retorna
    if (email && this.isSuperAdmin(email)) {
      const allMods = new Set();
      Object.values(this._roles).forEach(r => r.modules.forEach(m => allMods.add(m)));
      this._sharedModules.forEach(m => allMods.add(m));
      this._financeModules.forEach(m => allMods.add(m));
      this._adminModules.forEach(m => allMods.add(m));
      this._sections.forEach(s => s.modules.forEach(m => allMods.add(m)));
      return [...allMods];
    }

    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    if (!mapping) return [];
    const roleDef = this._roles[mapping.role];
    if (!roleDef) return [];

    // Founders: acesso total irrestrito
    if (mapping.role === 'founder') {
      const allMods = new Set();
      Object.values(this._roles).forEach(r => r.modules.forEach(m => allMods.add(m)));
      this._sharedModules.forEach(m => allMods.add(m));
      this._financeModules.forEach(m => allMods.add(m));
      this._adminModules.forEach(m => allMods.add(m));
      this._sections.forEach(s => s.modules.forEach(m => allMods.add(m)));
      return [...allMods];
    }

    // Base: role modules + shared modules
    const mods = [...roleDef.modules, ...this._sharedModules];

    // Finance role: adiciona modulos financeiros restritos
    if (mapping.role === 'finance') {
      mods.push(...this._financeModules);
    }

    // POs/coordenadores: adiciona modulos de admin (permissoes)
    if (mapping.role === 'project_owner' || mapping.isCoordinator) {
      mods.push(...this._adminModules);
    }

    return [...new Set(mods)];
  },

  getDashboardVariant(roleName) {
    const roleDef = this._roles[roleName];
    return roleDef ? roleDef.dashboardVariant : 'full';
  },

  getDefaultModule(roleName) {
    const roleDef = this._roles[roleName];
    return roleDef ? roleDef.defaultModule : 'command-center';
  },

  canAccess(userId, moduleName, email) {
    const modules = this.getModulesForUser(userId, email);
    return modules.includes(moduleName);
  },

  getSectionsForUser(userId, email) {
    const allowed = this.getModulesForUser(userId, email);
    return this._sections
      .map(section => ({
        ...section,
        modules: section.modules.filter(m => allowed.includes(m))
      }))
      .filter(section => section.modules.length > 0);
  },

  getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  getUserBU(userId) {
    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    return mapping ? mapping.bu : null;
  },

  isCoordinator(userId) {
    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    return mapping ? mapping.isCoordinator : false;
  },

  isFounder(userId) {
    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    return mapping ? mapping.role === 'founder' : false;
  }
};
