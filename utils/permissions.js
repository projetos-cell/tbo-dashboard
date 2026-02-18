// TBO OS — Permissions & RBAC Definitions
// Central authority for roles, module access, sidebar sections, and user-role mapping.
// Loaded BEFORE auth.js — no dependencies on other TBO modules.

const TBO_PERMISSIONS = {

  // ── Role Definitions ──────────────────────────────────────────────────────

  // Modules visible to ALL roles (operational basics)
  _sharedModules: [
    'entregas','tarefas','revisoes',
    'decisoes','biblioteca',
    'carga-trabalho','timesheets','capacidade',
    'trilha-aprendizagem','pessoas-avancado',
    'integracoes','templates'
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
      modules: ['command-center','timeline','alerts','inteligencia','pipeline','comercial','clientes','portal-cliente','contratos','conteudo','projetos','mercado','reunioes','financeiro','rh','cultura','configuracoes'],
      dashboardVariant: 'full',
      defaultModule: 'command-center'
    },
    project_owner: {
      label: 'Project Owner',
      color: '#8b5cf6',
      modules: ['command-center','timeline','alerts','comercial','clientes','portal-cliente','contratos','conteudo','projetos','mercado','reunioes','rh','cultura','configuracoes'],
      dashboardVariant: 'projects',
      defaultModule: 'command-center'
    },
    artist: {
      label: 'Artista',
      color: '#3a7bd5',
      modules: ['command-center','timeline','alerts','projetos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'tasks',
      defaultModule: 'command-center'
    },
    comercial: {
      label: 'Comercial',
      color: '#f59e0b',
      modules: ['command-center','timeline','alerts','pipeline','comercial','clientes','portal-cliente','contratos','projetos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'full',
      defaultModule: 'command-center'
    },
    finance: {
      label: 'Financeiro',
      color: '#2ecc71',
      modules: ['command-center','timeline','alerts','inteligencia','pipeline','financeiro','comercial','clientes','portal-cliente','contratos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'financial',
      defaultModule: 'command-center'
    }
  },

  // ── User → Role Mapping (real TBO team — Feb 2026) ──────────────────────
  _userRoles: {
    // Diretoria
    marco:    { role: 'founder',       bu: null,           isCoordinator: false },
    ruy:      { role: 'founder',       bu: null,           isCoordinator: false },
    // Coord. Atendimento — acesso amplo (coordena projetos)
    carol:    { role: 'project_owner', bu: null,           isCoordinator: true  },
    // POs — acesso a modulos operacionais da sua BU
    nelson:   { role: 'project_owner', bu: 'Branding',     isCoordinator: false },
    nath:     { role: 'project_owner', bu: 'Digital 3D',   isCoordinator: true  },
    rafa:     { role: 'project_owner', bu: 'Marketing',    isCoordinator: false },
    // Comercial
    gustavo:  { role: 'comercial',     bu: 'Vendas',       isCoordinator: false },
    // Branding team
    celso:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    erick:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    // Digital 3D team
    dann:     { role: 'project_owner', bu: 'Digital 3D',   isCoordinator: false },
    duda:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    tiago:    { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    mari:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    // Marketing team
    lucca:    { role: 'artist',        bu: 'Marketing',    isCoordinator: false },
    // Terceirizado — Financeiro
    financaazul: { role: 'finance',    bu: null,           isCoordinator: false }
  },

  // ── Sidebar Section Definitions (organized by operational flow) ───────────
  _sections: [
    {
      id: 'command-center-section',
      label: 'COMMAND CENTER',
      icon: 'layout-dashboard',
      modules: ['command-center', 'timeline', 'alerts']
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
      label: 'CONTEUDO & INTELIGENCIA',
      icon: 'brain',
      modules: ['inteligencia', 'conteudo', 'mercado', 'reunioes', 'decisoes', 'biblioteca']
    },
    {
      id: 'pessoas',
      label: 'PESSOAS',
      icon: 'users',
      modules: ['rh', 'cultura', 'trilha-aprendizagem', 'pessoas-avancado', 'carga-trabalho', 'timesheets', 'capacidade']
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
    const mapping = this._userRoles[userId];
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

  getModulesForUser(userId) {
    const mapping = this._userRoles[userId];
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

  canAccess(userId, moduleName) {
    const modules = this.getModulesForUser(userId);
    return modules.includes(moduleName);
  },

  getSectionsForUser(userId) {
    const allowed = this.getModulesForUser(userId);
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
    const mapping = this._userRoles[userId];
    return mapping ? mapping.bu : null;
  },

  isCoordinator(userId) {
    const mapping = this._userRoles[userId];
    return mapping ? mapping.isCoordinator : false;
  },

  isFounder(userId) {
    const mapping = this._userRoles[userId];
    return mapping ? mapping.role === 'founder' : false;
  }
};
