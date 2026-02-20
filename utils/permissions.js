// TBO OS — Permissions & RBAC Definitions (v2.5 — RBAC Completo)
// Central authority for roles, module access, sidebar sections, and user-role mapping.
// Loaded BEFORE auth.js — no dependencies on other TBO modules.
//
// v2.5: Suporte a permissoes granulares (module.action) via Supabase.
//       canDo() para checks granulares, canDoInProject() para overrides por projeto.
//       Backwards compatible: canAccess() e getModulesForUser() continuam funcionando.

const TBO_PERMISSIONS = {

  // ── Super Administradores (acesso total, NUNCA perdem acesso) ───────────
  _superAdmins: ['marco@agenciatbo.com.br', 'ruy@agenciatbo.com.br'],

  isSuperAdmin(email) {
    return email && this._superAdmins.includes(email.toLowerCase());
  },

  // ── v2.5: RBAC Granular — dados carregados do Supabase ─────────────────
  _permissionsMatrix: {},   // { 'module.action': true } — flat map para o usuario logado
  _dbRoles: [],             // roles[] completos do Supabase (substituem _roles para UI)
  _dbPermissions: [],       // permissions[] catalogo do Supabase
  _projectOverrides: {},    // { projectId: { 'module.action': true } }
  _matrixLoaded: false,

  // ── Role Definitions ──────────────────────────────────────────────────────

  // Modules visible to ALL roles (operational basics)
  // v2.2.1: Removidos modulos admin que estavam acessiveis a todos os roles
  // integracoes, templates, workspace, pessoas-avancado → movidos para _adminModules
  _sharedModules: [
    'entregas','tarefas','revisoes',
    'decisoes','biblioteca',
    'trilha-aprendizagem',
    'changelog','chat','carga-trabalho'
  ],

  // Finance-restricted modules (founders + finance only)
  _financeModules: [
    'pagar','receber','margens','conciliacao','conciliacao-bancaria'
  ],

  // Admin modules (founders + project_owners com coordenacao)
  // v3: admin-portal, configuracoes, inteligencia-imobiliaria adicionados
  _adminModules: [
    'permissoes-config','integracoes','templates','workspace','pessoas-avancado',
    'admin-portal','configuracoes','inteligencia-imobiliaria'
  ],

  _roles: {
    founder: {
      label: 'Fundador',
      color: '#E85102',
      modules: ['dashboard','alerts','inteligencia','pipeline','comercial','clientes','portal-cliente','contratos','conteudo','projetos','mercado','reunioes','financeiro','rh','cultura','configuracoes','admin-onboarding'],
      dashboardVariant: 'full',
      defaultModule: 'dashboard'
    },
    project_owner: {
      label: 'Project Owner',
      color: '#8b5cf6',
      // v2.2.1: removido 'comercial' (CRM/pipeline com dados financeiros sigilosos)
      // v2.2.2: removidos clientes/contratos (dados de receita) — PO foca em projetos/entregas
      // portal-cliente movido para secao PROJETOS (visivel a POs para acompanhar cliente)
      modules: ['dashboard','alerts','portal-cliente','conteudo','projetos','mercado','reunioes','rh','cultura','configuracoes','admin-onboarding'],
      dashboardVariant: 'projects',
      defaultModule: 'dashboard'
    },
    artist: {
      label: 'Artista',
      color: '#3a7bd5',
      modules: ['dashboard','alerts','projetos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'tasks',
      defaultModule: 'dashboard'
    },
    comercial: {
      label: 'Comercial',
      color: '#f59e0b',
      modules: ['dashboard','alerts','pipeline','comercial','clientes','portal-cliente','contratos','projetos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'full',
      defaultModule: 'dashboard'
    },
    finance: {
      label: 'Financeiro',
      color: '#2ecc71',
      modules: ['dashboard','alerts','inteligencia','pipeline','financeiro','comercial','clientes','portal-cliente','contratos','mercado','reunioes','cultura','configuracoes'],
      dashboardVariant: 'financial',
      defaultModule: 'dashboard'
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
  // v2.2.2: removidos usuarios inativos (Erick, Dann, Mari, FinancaAzul) — deletados do Supabase
  _defaultUserRoles: {
    marco:    { role: 'founder',       bu: null,           isCoordinator: false },
    ruy:      { role: 'founder',       bu: null,           isCoordinator: false },
    carol:    { role: 'project_owner', bu: null,           isCoordinator: true  },
    nelson:   { role: 'project_owner', bu: 'Branding',     isCoordinator: false },
    nath:     { role: 'project_owner', bu: 'Digital 3D',   isCoordinator: true  },
    rafa:     { role: 'project_owner', bu: 'Marketing',    isCoordinator: false },
    gustavo:  { role: 'comercial',     bu: 'Vendas',       isCoordinator: false },
    celso:    { role: 'artist',        bu: 'Branding',     isCoordinator: false },
    duda:     { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    tiago:    { role: 'artist',        bu: 'Digital 3D',   isCoordinator: false },
    lucca:    { role: 'artist',        bu: 'Marketing',    isCoordinator: false },
    lucas:    { role: 'artist',        bu: null,           isCoordinator: false }
  },

  // ── Sidebar Section Definitions (v3 — reorganizado por area operacional) ──
  // Ordem: Inicio > Execucao > Producao > Pessoas > Financeiro > Fornecedores > Comercial > Admin
  _sections: [
    {
      id: 'inicio',
      label: 'INÍCIO',
      icon: 'home',
      modules: ['dashboard', 'alerts', 'chat']
    },
    {
      id: 'execucao',
      label: 'EXECUÇÃO',
      icon: 'clipboard-list',
      modules: ['projetos', 'tarefas', 'reunioes', 'biblioteca']
    },
    {
      id: 'producao',
      label: 'PRODUÇÃO',
      icon: 'cog',
      modules: ['entregas', 'revisoes', 'portal-cliente']
    },
    {
      id: 'pessoas',
      label: 'PESSOAS',
      icon: 'users',
      modules: ['rh', 'admin-onboarding', 'trilha-aprendizagem', 'cultura', 'pessoas-avancado']
    },
    {
      id: 'financeiro-section',
      label: 'FINANCEIRO',
      icon: 'coins',
      modules: ['financeiro', 'pagar', 'receber', 'margens', 'conciliacao', 'conciliacao-bancaria']
    },
    {
      id: 'fornecedores',
      label: 'FORNECEDORES',
      icon: 'truck',
      modules: ['contratos']
    },
    {
      id: 'comercial',
      label: 'COMERCIAL',
      icon: 'trending-up',
      modules: ['pipeline', 'comercial', 'clientes', 'inteligencia', 'inteligencia-imobiliaria', 'mercado']
    },
    {
      id: 'admin',
      label: 'ADMINISTRAÇÃO',
      icon: 'shield',
      // Somente Owner/Admin — controle via RBAC em getModulesForUser
      modules: ['admin-portal', 'permissoes-config', 'integracoes', 'configuracoes', 'changelog']
    }
  ],

  // ── v2.5: Carregar matrix de permissoes granulares do Supabase ───────────

  async loadPermissionsMatrix(userId) {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const tenantId = TBO_SUPABASE.getCurrentTenantId();
      if (!tenantId) return;

      // 1. Carregar todas as roles do tenant (para admin UI)
      const { data: roles } = await client
        .from('roles')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('sort_order');
      this._dbRoles = roles || [];

      // 2. Carregar catalogo de permissions
      const { data: perms } = await client
        .from('permissions')
        .select('*')
        .order('sort_order');
      this._dbPermissions = perms || [];

      // 3. Carregar permissoes do usuario via RPC
      const { data: userPerms, error } = await client
        .rpc('get_user_permissions', { p_user_id: userId });

      if (error) {
        console.warn('[TBO Permissions] RPC get_user_permissions error:', error.message);
        // Fallback: tentar query direta se RPC nao existe (migration nao executada)
        return;
      }

      // 4. Popular matrix como flat map { 'module.action': true }
      this._permissionsMatrix = {};
      (userPerms || []).forEach(p => {
        if (p.granted) {
          this._permissionsMatrix[`${p.module}.${p.action}`] = true;
        }
      });

      this._matrixLoaded = true;
      console.log(`[TBO Permissions] Matrix carregada: ${Object.keys(this._permissionsMatrix).length} permissoes para usuario`);
    } catch (e) {
      console.warn('[TBO Permissions] loadPermissionsMatrix error:', e);
      // Fallback silencioso — canDo() usara canAccess() como fallback
    }
  },

  // v2.5: Carregar overrides de role por projeto
  async loadProjectOverrides(userId) {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const { data: memberships } = await client
        .from('project_memberships')
        .select('project_id, role_id, roles(slug)')
        .eq('user_id', userId);

      if (!memberships || memberships.length === 0) return;

      // Para cada projeto com override, carregar permissoes desse role
      for (const m of memberships) {
        const roleSlug = m.roles?.slug;
        if (!roleSlug) continue;

        // Buscar permissoes do role override
        const { data: rolePerms } = await client
          .rpc('get_user_permissions', { p_user_id: userId });
        // Nota: Na v2.5 os overrides usam o role_id do project_membership
        // Para simplificar, cache o slug — implementacao completa em v2.6
        this._projectOverrides[m.project_id] = { _roleSlug: roleSlug };
      }
    } catch (e) {
      console.warn('[TBO Permissions] loadProjectOverrides error:', e);
    }
  },

  // ── v2.5: canDo() — Core permission check granular ─────────────────────
  // Aceita: canDo('projects', 'create') ou canDo('projects.create')
  canDo(moduleOrKey, action) {
    // Super admin bypass
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (user && this.isSuperAdmin(user.email)) return true;

    // Formato: canDo('projects', 'create') ou canDo('projects.create')
    let key;
    if (action) {
      key = `${moduleOrKey}.${action}`;
    } else {
      key = moduleOrKey; // ja no formato module.action
    }

    // Se matrix carregada, usar permissoes granulares
    if (this._matrixLoaded) {
      return !!this._permissionsMatrix[key];
    }

    // Fallback: se matrix nao carregada, usar modulo-level (backwards compat)
    const mod = key.split('.')[0];
    return this.canAccess(user?.id, mod, user?.email);
  },

  // v2.5: canDoInProject() — Check com override de role por projeto
  canDoInProject(projectId, moduleOrKey, action) {
    const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    if (user && this.isSuperAdmin(user.email)) return true;

    const key = action ? `${moduleOrKey}.${action}` : moduleOrKey;

    // Verificar override do projeto primeiro
    const overrides = this._projectOverrides[projectId];
    if (overrides && key in overrides) {
      return overrides[key];
    }

    // Fallback para permissao global
    return this.canDo(key);
  },

  // v2.5: Getters para admin UI
  getDbRoles() {
    return this._dbRoles;
  },

  getDbPermissions() {
    return this._dbPermissions;
  },

  getPermissionsMatrix() {
    return { ...this._permissionsMatrix };
  },

  isMatrixLoaded() {
    return this._matrixLoaded;
  },

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
      return this._getAllModules();
    }

    // v2.5: Se matrix de permissoes carregada, derivar modulos das permissoes *.view
    if (this._matrixLoaded) {
      const modules = new Set();
      // Extrair modulos unicos das permissoes granted
      Object.keys(this._permissionsMatrix).forEach(key => {
        const mod = key.split('.')[0];
        modules.add(mod);
      });
      // Sempre incluir modulos basicos compartilhados
      this._sharedModules.forEach(m => modules.add(m));
      // Manter modulos hardcoded do role como fallback (para modulos sem permission catalogada)
      const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
      if (mapping) {
        const roleDef = this._roles[mapping.role];
        if (roleDef) {
          roleDef.modules.forEach(m => modules.add(m));
        }
      }
      return [...modules];
    }

    // Fallback: logica hardcoded original (quando Supabase indisponivel)
    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    if (!mapping) return [];
    const roleDef = this._roles[mapping.role];
    if (!roleDef) return [];

    // Founders: acesso total irrestrito
    if (mapping.role === 'founder') {
      return this._getAllModules();
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

  // v2.5: Helper — retorna todos os modulos do sistema
  _getAllModules() {
    const allMods = new Set();
    Object.values(this._roles).forEach(r => r.modules.forEach(m => allMods.add(m)));
    this._sharedModules.forEach(m => allMods.add(m));
    this._financeModules.forEach(m => allMods.add(m));
    this._adminModules.forEach(m => allMods.add(m));
    this._sections.forEach(s => s.modules.forEach(m => allMods.add(m)));
    return [...allMods];
  },

  getDashboardVariant(roleName) {
    const roleDef = this._roles[roleName];
    return roleDef ? roleDef.dashboardVariant : 'full';
  },

  getDefaultModule(roleName) {
    const roleDef = this._roles[roleName];
    return roleDef ? roleDef.defaultModule : 'dashboard';
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
