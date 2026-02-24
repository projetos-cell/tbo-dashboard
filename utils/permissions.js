// TBO OS — Permissions & RBAC Definitions (v3.0 — Founder Only)
// Central authority for roles, module access, sidebar sections, and user-role mapping.
// Loaded BEFORE auth.js — no dependencies on other TBO modules.
//
// v3.0: Simplificado para role unico: founder com acesso total a tudo.

const TBO_PERMISSIONS = {

  // ── Super Administradores (acesso total, NUNCA perdem acesso) ───────────
  _superAdmins: ['marco@agenciatbo.com.br', 'ruy@agenciatbo.com.br'],

  isSuperAdmin(email) {
    return email && this._superAdmins.includes(email.toLowerCase());
  },

  // ── v2.5: RBAC Granular — dados carregados do Supabase ─────────────────
  _permissionsMatrix: {},
  _dbRoles: [],
  _dbPermissions: [],
  _projectOverrides: {},
  _matrixLoaded: false,

  // ── Role Definitions ──────────────────────────────────────────────────────

  // v3.0: Todos os modulos disponiveis — founder acessa tudo
  _sharedModules: [],
  _financeModules: [],
  _adminModules: [],

  // v3.0: Unico role ativo — founder com acesso total
  _roles: {
    founder: {
      label: 'Fundador',
      color: '#E85102',
      modules: [
        'dashboard','alerts','inteligencia','pipeline','comercial','clientes',
        'portal-cliente','contratos','conteudo','projetos','projetos-notion',
        'mercado','reunioes','financeiro','rh','cultura','configuracoes',
        'admin-onboarding','relatorios','rsm',
        'system-health','entregas','tarefas','revisoes','decisoes',
        'trilha-aprendizagem','changelog','chat','carga-trabalho','notion-embed',
        'pagar','receber','margens','conciliacao','conciliacao-bancaria',
        'permissoes-config','integracoes','templates','workspace','pessoas-avancado',
        'admin-portal','configuracoes','inteligencia-imobiliaria','agenda','inbox'
      ],
      dashboardVariant: 'full',
      defaultModule: 'dashboard'
    }
  },

  // ── User → Role Mapping ──────────────────────────────────────────────────
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
        // v3.0: todos os usuarios sao tratados como founder
        newRoles[username] = {
          role: 'founder',
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

  // v3.0: Fallback — todos os usuarios conhecidos sao founder
  _defaultUserRoles: {
    marco:    { role: 'founder', bu: null, isCoordinator: false },
    ruy:      { role: 'founder', bu: null, isCoordinator: false },
    carol:    { role: 'founder', bu: null, isCoordinator: false },
    nelson:   { role: 'founder', bu: null, isCoordinator: false },
    nath:     { role: 'founder', bu: null, isCoordinator: false },
    rafa:     { role: 'founder', bu: null, isCoordinator: false },
    gustavo:  { role: 'founder', bu: null, isCoordinator: false },
    celso:    { role: 'founder', bu: null, isCoordinator: false },
    duda:     { role: 'founder', bu: null, isCoordinator: false },
    tiago:    { role: 'founder', bu: null, isCoordinator: false },
    lucca:    { role: 'founder', bu: null, isCoordinator: false },
    lucas:    { role: 'founder', bu: null, isCoordinator: false }
  },

  // ── Sidebar Section Definitions (v3.0 — todas as secoes visiveis para founder) ──
  _sections: [
    {
      id: 'inicio',
      label: 'INÍCIO',
      icon: 'home',
      _roles: [],
      modules: ['dashboard', 'inbox', 'alerts', 'chat']
    },
    {
      id: 'execucao',
      label: 'EXECUÇÃO',
      icon: 'clipboard-list',
      _roles: [],
      modules: ['projetos', 'projetos-notion', 'quadro-projetos', 'tarefas', 'reunioes']
    },
    {
      id: 'producao',
      label: 'PRODUÇÃO',
      icon: 'cog',
      _roles: [],
      modules: ['entregas', 'revisoes', 'portal-cliente']
    },
    {
      id: 'pessoas',
      label: 'PESSOAS',
      icon: 'users',
      _roles: [],
      modules: ['rh', 'admin-onboarding', 'trilha-aprendizagem', 'cultura', 'pessoas-avancado', 'decisoes']
    },
    {
      id: 'financeiro-section',
      label: 'FINANCEIRO',
      icon: 'coins',
      _roles: [],
      modules: ['financeiro', 'pagar', 'receber', 'margens', 'conciliacao', 'conciliacao-bancaria']
    },
    {
      id: 'fornecedores',
      label: 'FORNECEDORES',
      icon: 'truck',
      _roles: [],
      modules: ['contratos']
    },
    {
      id: 'comercial',
      label: 'COMERCIAL',
      icon: 'trending-up',
      _roles: [],
      modules: ['pipeline', 'comercial', 'clientes', 'inteligencia', 'inteligencia-imobiliaria', 'mercado', 'rsm']
    },
    {
      id: 'admin',
      label: 'ADMINISTRAÇÃO',
      icon: 'shield',
      _roles: [],
      modules: ['admin-portal', 'permissoes-config', 'integracoes', 'configuracoes', 'changelog', 'relatorios']
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

    // Obter role do usuario para filtro de secao
    const mapping = this._userRoles[userId] || this._defaultUserRoles[userId];
    const userRole = mapping?.role || null;
    const isCoord = mapping?.isCoordinator || false;
    const isSuperAdmin = email && this.isSuperAdmin(email);

    // Roles que sempre veem tudo (bypass de _roles da secao)
    const bypassRoles = ['founder'];
    const hasBypass = isSuperAdmin || bypassRoles.includes(userRole);

    return this._sections
      .filter(section => {
        // Se _roles vazio ou ausente → visivel para todos
        if (!section._roles || section._roles.length === 0) return true;
        // Super admins e founders sempre veem tudo
        if (hasBypass) return true;
        // Coordinators (project_owner com isCoordinator) veem secoes que incluem project_owner
        if (isCoord && section._roles.includes('project_owner')) return true;
        // Verificar se a role do usuario esta na lista de _roles da secao
        return section._roles.includes(userRole);
      })
      .map(section => {
        // Filtrar modulos permitidos pelo RBAC de modulos
        let sectionModules = section.modules.filter(m => allowed.includes(m));

        // Adicionar modulos restritos dentro da secao (pessoas-avancado, decisoes)
        if (section._restrictedModules) {
          Object.entries(section._restrictedModules).forEach(([mod, roles]) => {
            if (!allowed.includes(mod)) return; // modulo nao permitido pelo RBAC global
            const canSee = hasBypass || roles.includes(userRole) || (isCoord && roles.includes('project_owner'));
            if (canSee && !sectionModules.includes(mod)) {
              sectionModules.push(mod);
            }
          });
        }

        return {
          ...section,
          modules: sectionModules
        };
      })
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
