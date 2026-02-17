// TBO OS — Permissions & RBAC Definitions
// Central authority for roles, module access, sidebar sections, and user-role mapping.
// Loaded BEFORE auth.js — no dependencies on other TBO modules.

const TBO_PERMISSIONS = {

  // ── Role Definitions ──────────────────────────────────────────────────────
  // Placeholder modules accessible to all roles
  _placeholderModules: [
    'entregas','tarefas','revisoes',
    'decisoes','biblioteca',
    'carga-trabalho','timesheets','capacidade',
    'pagar','receber','margens','conciliacao',
    'templates','permissoes-config','integracoes'
  ],

  _roles: {
    founder: {
      label: 'Fundador',
      color: '#E85102',
      modules: ['command-center','timeline','alerts','pipeline','comercial','clientes','contratos','conteudo','projetos','mercado','reunioes','financeiro','rh','configuracoes'],
      dashboardVariant: 'full',
      defaultModule: 'command-center'
    },
    project_owner: {
      label: 'Project Owner',
      color: '#8b5cf6',
      modules: ['command-center','timeline','alerts','comercial','clientes','contratos','conteudo','projetos','mercado','reunioes','rh','configuracoes'],
      dashboardVariant: 'projects',
      defaultModule: 'command-center'
    },
    artist: {
      label: 'Artista',
      color: '#3a7bd5',
      modules: ['command-center','timeline','alerts','projetos','mercado','reunioes','configuracoes'],
      dashboardVariant: 'tasks',
      defaultModule: 'command-center'
    },
    finance: {
      label: 'Financeiro',
      color: '#2ecc71',
      modules: ['command-center','timeline','alerts','pipeline','financeiro','comercial','clientes','contratos','mercado','reunioes','configuracoes'],
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
    gustavo:  { role: 'artist',        bu: 'Vendas',       isCoordinator: false },
    // Branding team
    celso:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    erick:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    // Digital 3D team
    dann:     { role: 'project_owner', bu: 'Digital 3D',   isCoordinator: false },
    duda:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    tiago:    { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    mari:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    // Marketing team
    lucca:    { role: 'artist',        bu: 'Marketing',    isCoordinator: false }
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
      modules: ['pipeline', 'comercial', 'clientes', 'contratos']
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
      modules: ['conteudo', 'mercado', 'reunioes', 'decisoes', 'biblioteca']
    },
    {
      id: 'pessoas',
      label: 'PESSOAS',
      icon: 'users',
      modules: ['rh', 'carga-trabalho', 'timesheets', 'capacidade']
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
      modules: ['configuracoes', 'templates', 'permissoes-config', 'integracoes']
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
    // Role modules + all placeholders (visible to everyone)
    return [...roleDef.modules, ...this._placeholderModules];
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
