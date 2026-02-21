// TBO OS — Authentication & Session Management
// Supabase Auth exclusivo (Google OAuth, email/password, Magic Link) — v2.1
// Legacy mode (TBO_CRYPTO) removido em v2.1 por seguranca
// Delegates role/permission logic to TBO_PERMISSIONS.
// Manages login, session, user menu dropdown, sidebar user widget.

const TBO_AUTH = {
  // ── Controle centralizado do overlay de login (evita race condition / flash) ────
  _overlayState: null, // 'login' | 'app' — estado atual do overlay
  _authResolved: false, // true quando auth flow terminou (logado ou nao)

  /**
   * Metodo UNICO para mostrar/esconder login overlay.
   * Todos os code paths devem usar este metodo em vez de manipular classList diretamente.
   */
  _setOverlayState(state) {
    if (this._overlayState === state) return;
    this._overlayState = state;

    const overlay = document.getElementById('loginOverlay');
    if (!overlay) return;

    if (state === 'app') {
      // Usuario logado: esconder login, mostrar app
      overlay.classList.add('hidden');
      overlay.classList.remove('visible');
      document.body.classList.remove('auth-pending');
      document.body.classList.add('auth-resolved');
    } else {
      // Nao logado: mostrar login, esconder app
      overlay.classList.remove('hidden');
      overlay.classList.add('visible');
      document.body.classList.remove('auth-pending');
      document.body.classList.add('auth-resolved');
    }
    this._authResolved = true;
  },

  // REMOVIDO: _users hardcoded (legacy mode eliminado — v2.1 seguranca)
  // Todos os usuarios agora sao gerenciados via Supabase Auth + profiles table

  // Session state
  _cachedUser: null,

  // ═══════════════════════════════════════════════════════════════════════════
  // AVATAR — Cadeia de fallback robusta para resolver URL do avatar
  // Prioridade: 1) profiles.avatar_url  2) user_metadata.avatar_url
  //             3) provider identity_data.avatar_url  4) null (iniciais)
  // ═══════════════════════════════════════════════════════════════════════════

  _resolveAvatarUrl(profile, authUser) {
    // 1. Avatar persistido na tabela profiles
    if (profile?.avatar_url && /^https:\/\//i.test(profile.avatar_url)) {
      return profile.avatar_url;
    }
    // 2. Avatar nos metadados do usuario (Supabase Auth)
    const metaAvatar = authUser?.user_metadata?.avatar_url || authUser?.user_metadata?.picture;
    if (metaAvatar && /^https:\/\//i.test(metaAvatar)) {
      return metaAvatar;
    }
    // 3. Avatar nos dados do provider Google (identities array)
    if (authUser?.identities?.length) {
      for (const identity of authUser.identities) {
        const providerAvatar = identity.identity_data?.avatar_url || identity.identity_data?.picture;
        if (providerAvatar && /^https:\/\//i.test(providerAvatar)) {
          return providerAvatar;
        }
      }
    }
    // 4. Nenhum avatar disponivel — UI usara iniciais como fallback
    return null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION — Read current user (synchronous, from cache)
  // ═══════════════════════════════════════════════════════════════════════════

  getCurrentUser() {
    // Retorna usuario cacheado se disponivel
    if (this._cachedUser) return this._cachedUser;

    try {
      const raw = sessionStorage.getItem('tbo_auth');
      if (!raw) return null;
      const session = JSON.parse(raw);

      // v2.1: Rejeitar sessoes legacy (authMode != 'supabase')
      if (session.authMode && session.authMode !== 'supabase') {
        console.warn('[TBO Auth] Sessao legacy detectada, forçando relogin');
        this.logout();
        return null;
      }

      // v2.1: Validar campos obrigatorios (prevenir session tampering)
      if (!session.id || !session.role || !session.modules || !Array.isArray(session.modules)) {
        console.warn('[TBO Auth] Sessao invalida (campos ausentes), forçando relogin');
        sessionStorage.removeItem('tbo_auth');
        return null;
      }

      // v2.5: Validar que role e um dos roles conhecidos (hardcoded + dinamicos do Supabase)
      const hardcodedRoles = Object.keys(typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS._roles : {});
      const dbRoleSlugs = (typeof TBO_PERMISSIONS !== 'undefined' && TBO_PERMISSIONS._dbRoles.length > 0)
        ? TBO_PERMISSIONS._dbRoles.map(r => r.slug)
        : [];
      const validRoles = [...new Set([...hardcodedRoles, ...dbRoleSlugs])];
      if (validRoles.length > 0 && !validRoles.includes(session.role)) {
        console.warn('[TBO Auth] Role invalido na sessao:', session.role);
        sessionStorage.removeItem('tbo_auth');
        return null;
      }

      this._cachedUser = session;
      return session;
    } catch (e) {
      return null;
    }
  },

  // Alias for sync reads
  getCurrentUserSync() {
    return this.getCurrentUser();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN — Supabase Auth (email/password)
  // ═══════════════════════════════════════════════════════════════════════════

  async loginWithEmail(email, password) {
    if (typeof TBO_SUPABASE === 'undefined') {
      return { ok: false, msg: 'Supabase nao disponivel. Use login legado.' };
    }

    const client = TBO_SUPABASE.getClient();
    if (!client) return { ok: false, msg: 'Supabase client nao inicializado.' };

    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, msg: error.message };

    // Build session from Supabase profile
    const session = await this._buildSupabaseSession(data.user);
    if (!session) return { ok: false, msg: 'Perfil nao encontrado no Supabase.' };

    // v2.1: auth mode sempre supabase
    this._cachedUser = session;
    sessionStorage.setItem('tbo_auth', JSON.stringify(session));

    return { ok: true, session };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN — Google OAuth via Supabase
  // ═══════════════════════════════════════════════════════════════════════════

  async loginWithGoogle() {
    if (typeof TBO_SUPABASE === 'undefined') {
      return { ok: false, msg: 'Supabase nao disponivel.' };
    }

    const client = TBO_SUPABASE.getClient();
    if (!client) return { ok: false, msg: 'Supabase client nao inicializado.' };

    try {
      // PRD v1.2 — Solicitar scopes Drive + Calendar para provider_token
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/',
          scopes: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/calendar.readonly'
        }
      });

      if (error) {
        // Handle "provider not enabled" error gracefully
        if (error.message && (error.message.includes('provider is not enabled') || error.message.includes('Unsupported provider'))) {
          console.warn('[TBO Auth] Google OAuth not enabled in Supabase. Use legacy login.');
          return { ok: false, msg: 'Login com Google nao habilitado. Use usuario e senha.', providerDisabled: true };
        }
        return { ok: false, msg: error.message };
      }

      // OAuth redirects — session is handled on redirect return via initAuthListener
      return { ok: true, redirecting: true };
    } catch (e) {
      console.warn('[TBO Auth] Google OAuth error:', e);
      if (e.message && (e.message.includes('provider is not enabled') || e.message.includes('Unsupported provider') || e.message.includes('validation_failed'))) {
        return { ok: false, msg: 'Login com Google nao habilitado. Use usuario e senha.', providerDisabled: true };
      }
      return { ok: false, msg: e.message || 'Erro ao conectar com Google.' };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN — Magic Link via Supabase
  // ═══════════════════════════════════════════════════════════════════════════

  async loginWithMagicLink(email) {
    if (typeof TBO_SUPABASE === 'undefined') {
      return { ok: false, msg: 'Supabase nao disponivel.' };
    }

    const client = TBO_SUPABASE.getClient();
    if (!client) return { ok: false, msg: 'Supabase client nao inicializado.' };

    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin + '/'
        }
      });

      if (error) return { ok: false, msg: error.message };

      return { ok: true, magicLinkSent: true };
    } catch (e) {
      return { ok: false, msg: e.message || 'Erro ao enviar Magic Link.' };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN — Email/password via Supabase (legacy mode REMOVIDO em v2.1)
  // ═══════════════════════════════════════════════════════════════════════════

  async login(userId, password) {
    // v2.1: Login exclusivamente via Supabase Auth
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) {
      return { ok: false, msg: 'Supabase indisponivel. Verifique sua conexao.' };
    }

    // Converter userId para email se necessario
    const email = userId.includes('@') ? userId : `${userId}@agenciatbo.com.br`;

    try {
      const result = await this.loginWithEmail(email, password);
      return result;
    } catch (e) {
      console.error('[TBO Auth] Login error:', e);
      return { ok: false, msg: e.message || 'Erro ao fazer login.' };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD SESSION FROM SUPABASE PROFILE
  // ═══════════════════════════════════════════════════════════════════════════

  async _buildSupabaseSession(authUser) {
    if (!authUser) return null;

    // Fetch profile from Supabase
    const profile = await TBO_SUPABASE.getProfile(true);

    // v2.1: Super admins SEMPRE recebem role 'founder', independente do Supabase
    const isSuperAdmin = TBO_PERMISSIONS.isSuperAdmin(authUser.email);

    // If profile exists in Supabase, use it
    if (profile) {
      const userId = profile.username || authUser.email?.split('@')[0] || authUser.id;
      const roleName = isSuperAdmin ? 'founder' : (profile.role || 'artist');
      const roleDef = TBO_PERMISSIONS._roles[roleName];

      // v2.6.2: Resolver avatar com cadeia de fallback completa
      const resolvedAvatar = this._resolveAvatarUrl(profile, authUser);

      // Sincronizar avatar para profiles se necessario (fire-and-forget)
      if (resolvedAvatar && resolvedAvatar !== profile.avatar_url) {
        TBO_SUPABASE.getClient()
          .from('profiles').update({ avatar_url: resolvedAvatar }).eq('id', authUser.id)
          .then(() => console.log('[TBO Auth] Avatar sincronizado com profiles'))
          .catch(e => console.warn('[TBO Auth] Avatar sync error:', e.message));
      }

      // PRD v1.2 — Sync nome/email do Google para profiles (fire-and-forget)
      // Garante que dados do Google são propagados para o banco mesmo em re-login
      const googleName = authUser.user_metadata?.full_name;
      const googleEmail = authUser.email;
      const profileUpdates = {};
      if (googleName && googleName !== profile.full_name) profileUpdates.full_name = googleName;
      if (googleEmail && googleEmail !== profile.email) profileUpdates.email = googleEmail;
      if (Object.keys(profileUpdates).length > 0) {
        TBO_SUPABASE.getClient()
          .from('profiles').update(profileUpdates).eq('id', authUser.id)
          .then(() => console.log('[TBO Auth] Perfil Google sincronizado:', Object.keys(profileUpdates).join(', ')))
          .catch(e => console.warn('[TBO Auth] Profile sync error:', e.message));
      }

      // v2.5: Carregar permissoes granulares do Supabase (non-blocking)
      try {
        await TBO_PERMISSIONS.loadPermissionsMatrix(authUser.id);
      } catch (e) {
        console.warn('[TBO Auth] loadPermissionsMatrix fallback:', e);
      }

      return {
        id: userId,
        supabaseId: authUser.id,
        name: profile.full_name || authUser.user_metadata?.full_name || userId,
        email: authUser.email,
        role: roleName,
        roleLabel: roleDef?.label || roleName,
        roleColor: roleDef?.color || '#94a3b8',
        // v2.2.2: Se getModulesForUser retorna [] (user nao encontrado nos mappings),
        // fallback para roleDef.modules + sharedModules (garante acesso basico para novos membros)
        modules: (() => {
          const m = TBO_PERMISSIONS.getModulesForUser(userId, authUser.email);
          if (m && m.length > 0) return m;
          // Fallback: role modules + shared modules (mesmo comportamento do getModulesForUser)
          const base = roleDef?.modules || [];
          const shared = TBO_PERMISSIONS._sharedModules || [];
          return [...new Set([...base, ...shared])];
        })(),
        dashboardVariant: roleDef?.dashboardVariant || 'tasks',
        defaultModule: roleDef?.defaultModule || 'dashboard',
        bu: profile.bu || TBO_PERMISSIONS.getUserBU(userId),
        isCoordinator: profile.is_coordinator || TBO_PERMISSIONS.isCoordinator(userId),
        initials: TBO_PERMISSIONS.getInitials(profile.full_name || userId),
        loginAt: new Date().toISOString(),
        authMode: 'supabase',
        avatarUrl: resolvedAvatar
      };
    }

    // v2.1: Super admins sem profile — criar sessao minima garantida
    if (isSuperAdmin) {
      const userId = authUser.email.split('@')[0];
      const roleDef = TBO_PERMISSIONS._roles['founder'];
      console.warn('[TBO Auth] Super admin sem profile — criando sessao founder:', authUser.email);
      return {
        id: userId,
        supabaseId: authUser.id,
        name: authUser.user_metadata?.full_name || userId,
        email: authUser.email,
        role: 'founder',
        roleLabel: roleDef.label,
        roleColor: roleDef.color,
        modules: TBO_PERMISSIONS.getModulesForUser(userId, authUser.email),
        dashboardVariant: 'full',
        defaultModule: 'dashboard',
        bu: null,
        isCoordinator: false,
        initials: TBO_PERMISSIONS.getInitials(authUser.user_metadata?.full_name || userId),
        loginAt: new Date().toISOString(),
        authMode: 'supabase',
        avatarUrl: this._resolveAvatarUrl(null, authUser)
      };
    }

    // v2.2.2: Auto-provisionamento para novos membros @agenciatbo.com.br via Google OAuth
    // Cria profile automatico com role 'artist' (menor permissao) — admin configura depois
    if (authUser.email && authUser.email.toLowerCase().endsWith('@agenciatbo.com.br')) {
      console.log('[TBO Auth] Novo membro detectado — auto-provisionando profile:', authUser.email);
      try {
        const client = TBO_SUPABASE.getClient();
        const tenantId = TBO_SUPABASE.getCurrentTenantId() || '89080d1a-bc79-4c3f-8fce-20aabc561c0d';
        const username = authUser.email.split('@')[0];
        const fullName = authUser.user_metadata?.full_name || username;

        // Criar profile com role padrao 'artist'
        const { data: newProfile, error: profileErr } = await client
          .from('profiles')
          .insert({
            id: authUser.id,
            username: username,
            full_name: fullName,
            email: authUser.email,
            role: 'artist',
            bu: null,
            is_coordinator: false,
            is_active: true,
            tenant_id: tenantId,
            first_login_completed: false,
            onboarding_wizard_completed: false,
            avatar_url: authUser.user_metadata?.avatar_url || null
          })
          .select()
          .single();

        if (profileErr) {
          console.warn('[TBO Auth] Erro ao criar profile:', profileErr.message);
        } else {
          console.log('[TBO Auth] Profile criado com sucesso para:', username);
        }

        // Adicionar ao tenant_members com role Artista
        // Buscar role_id do Artista
        const { data: artistRole } = await client
          .from('roles')
          .select('id')
          .eq('tenant_id', tenantId)
          .ilike('slug', 'artista')
          .single();

        if (artistRole) {
          const { error: tmErr } = await client
            .from('tenant_members')
            .insert({
              user_id: authUser.id,
              tenant_id: tenantId,
              role_id: artistRole.id
            });
          if (tmErr) console.warn('[TBO Auth] Erro ao criar tenant_member:', tmErr.message);
        }

        // Construir sessao com os dados recem-criados
        const roleDef = TBO_PERMISSIONS._roles['artist'];
        return {
          id: username,
          supabaseId: authUser.id,
          name: fullName,
          email: authUser.email,
          role: 'artist',
          roleLabel: roleDef?.label || 'Artista',
          roleColor: roleDef?.color || '#3a7bd5',
          modules: [...new Set([...(roleDef?.modules || []), ...TBO_PERMISSIONS._sharedModules])],
          dashboardVariant: roleDef?.dashboardVariant || 'tasks',
          defaultModule: roleDef?.defaultModule || 'dashboard',
          bu: null,
          isCoordinator: false,
          initials: TBO_PERMISSIONS.getInitials(fullName),
          loginAt: new Date().toISOString(),
          authMode: 'supabase',
          avatarUrl: this._resolveAvatarUrl(null, authUser),
          _isNewMember: true // flag para mostrar boas-vindas
        };
      } catch (e) {
        console.error('[TBO Auth] Auto-provisionamento falhou:', e);
      }
    }

    // Sem fallback — profile obrigatorio para dominios externos
    console.warn('[TBO Auth] Nenhum profile encontrado para:', authUser.email);
    return null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH STATE LISTENER (Supabase onAuthStateChange)
  // ═══════════════════════════════════════════════════════════════════════════

  initAuthListener() {
    if (typeof TBO_SUPABASE === 'undefined') return;
    const client = TBO_SUPABASE.getClient();
    if (!client) return;

    client.auth.onAuthStateChange(async (event, supaSession) => {
      console.log('[TBO Auth] Auth event:', event);

      if (event === 'SIGNED_IN' && supaSession?.user) {
        // Build session if not already logged in
        if (!this._cachedUser || this._cachedUser.supabaseId !== supaSession.user.id) {
          const session = await this._buildSupabaseSession(supaSession.user);
          if (session) {
            // v2.1: auth mode sempre supabase
            this._cachedUser = session;
            sessionStorage.setItem('tbo_auth', JSON.stringify(session));

            // Update UI via metodo centralizado (evita flash)
            this._setOverlayState('app');
            this._applyAccess();
            this._renderUserMenu(session);
            this._renderSidebarUser(session);
            // Re-render sidebar navigation items (now that user is logged in)
            if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebar) {
              TBO_APP._renderSidebar();
              TBO_APP._bindSectionToggles();
            }
            // v2.5.1: Apenas navegar se ainda nao tiver modulo ativo (evita
            // sobrescrever hash do usuario durante reload — corrige bug onde
            // recarregar #projetos redirecionava para dashboard)
            if (typeof TBO_ROUTER !== 'undefined' && !TBO_ROUTER._currentModule) {
              TBO_ROUTER.initFromHash(session.defaultModule);
            }
            if (window.lucide) lucide.createIcons();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        this._cachedUser = null;
        sessionStorage.removeItem('tbo_auth');
        TBO_SUPABASE.clearProfileCache();

        this._setOverlayState('login');
        const container = document.getElementById('userMenu');
        if (container) container.innerHTML = '';
        const sidebarWidget = document.getElementById('sidebarUserWidget');
        if (sidebarWidget) sidebarWidget.innerHTML = '';
      } else if (event === 'TOKEN_REFRESHED' && supaSession?.user) {
        // v2.6.2: Atualizar avatar se mudou apos refresh de token
        if (this._cachedUser) {
          const freshAvatar = this._resolveAvatarUrl(null, supaSession.user);
          if (freshAvatar && freshAvatar !== this._cachedUser.avatarUrl) {
            this._cachedUser.avatarUrl = freshAvatar;
            sessionStorage.setItem('tbo_auth', JSON.stringify(this._cachedUser));
            this._renderUserMenu(this._cachedUser);
            this._renderSidebarUser(this._cachedUser);
            if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebarFooter) {
              TBO_APP._renderSidebarFooter();
            }
            if (window.lucide) lucide.createIcons();
          }
        }
      }
    });

    // Process OAuth redirect (if returning from Google sign-in)
    this._handleOAuthRedirect();
  },

  async _handleOAuthRedirect() {
    // Supabase detects session in URL hash automatically via detectSessionInUrl option
    // Just check if we have a session after redirect
    if (typeof TBO_SUPABASE === 'undefined') return;
    const session = await TBO_SUPABASE.getSession();
    if (session && !this._cachedUser) {
      const userSession = await this._buildSupabaseSession(session.user);
      if (userSession) {
        // v2.1: auth mode sempre supabase
        this._cachedUser = userSession;
        sessionStorage.setItem('tbo_auth', JSON.stringify(userSession));
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGOUT
  // ═══════════════════════════════════════════════════════════════════════════

  async logout() {
    // Supabase signout
    if (typeof TBO_SUPABASE !== 'undefined') {
      const client = TBO_SUPABASE.getClient();
      if (client) {
        try { await client.auth.signOut(); } catch (e) { /* ignore */ }
      }
      TBO_SUPABASE.clearProfileCache();
    }

    this._cachedUser = null;
    sessionStorage.removeItem('tbo_auth');
    // Limpar tenant ativo (v2 multi-tenant)
    if (typeof TBO_WORKSPACE !== 'undefined') {
      TBO_WORKSPACE.clearTenant();
    }
  },

  // REMOVIDO: _startExpirationCheck, _stopExpirationCheck, _showSessionExpiredMessage
  // (legacy mode eliminado em v2.1 — Supabase gerencia expiracão via autoRefreshToken)

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  canAccess(moduleName) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.modules.includes(moduleName);
  },

  // v2.5: Permissao granular — delega para TBO_PERMISSIONS.canDo()
  // Aceita: canDo('projects', 'create') ou canDo('projects.create')
  canDo(module, action) {
    if (typeof TBO_PERMISSIONS !== 'undefined') {
      return TBO_PERMISSIONS.canDo(module, action);
    }
    // Fallback seguro: apenas admins
    return this.isAdmin();
  },

  // v2.5: Permissao granular com override por projeto
  canDoInProject(projectId, module, action) {
    if (typeof TBO_PERMISSIONS !== 'undefined') {
      return TBO_PERMISSIONS.canDoInProject(projectId, module, action);
    }
    return this.isAdmin();
  },

  isAdmin() {
    const user = this.getCurrentUser();
    // v2.5: admin = founder OU role admin/owner do Supabase
    return user && (user.role === 'founder' || user.role === 'owner' || user.role === 'admin');
  },

  isFounder() {
    const user = this.getCurrentUser();
    return user && (user.role === 'founder' || user.role === 'owner');
  },

  getAllowedModules() {
    const user = this.getCurrentUser();
    return user ? user.modules : [];
  },

  getDashboardVariant() {
    const user = this.getCurrentUser();
    return user ? user.dashboardVariant : 'full';
  },

  getUserBU() {
    const user = this.getCurrentUser();
    return user ? user.bu : null;
  },

  canSeeAllProjects() {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.role === 'founder' || user.isCoordinator;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN UI INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  initLoginUI() {
    const overlay = document.getElementById('loginOverlay');
    const btn = document.getElementById('loginBtn');
    const passInput = document.getElementById('loginPass');
    const errorEl = document.getElementById('loginError');

    if (!overlay) return;

    // Google OAuth button
    const googleBtn = document.getElementById('loginGoogleBtn');
    if (googleBtn) {
      googleBtn.addEventListener('click', async () => {
        googleBtn.disabled = true;
        googleBtn.textContent = 'Redirecionando...';
        const result = await this.loginWithGoogle();
        if (!result.ok && !result.redirecting) {
          if (result.providerDisabled) {
            // Google provider not enabled — show clear message and highlight legacy login
            this._showLoginError(errorEl, 'Google OAuth nao habilitado no Supabase. Habilite o provider Google em Authentication > Providers no painel do Supabase, ou use login com usuario/senha abaixo.');
            if (typeof TBO_TOAST !== 'undefined') {
              TBO_TOAST.warning('Google OAuth', 'Provider Google nao habilitado. Configure em Supabase Dashboard > Authentication > Providers > Google.');
            }
          } else {
            this._showLoginError(errorEl, result.msg);
          }
          googleBtn.disabled = false;
          googleBtn.textContent = 'Entrar com Google';
        }
      });
    }

    // v2.1: Login apenas por email via Supabase Auth
    const doLogin = async () => {
      const emailInput = document.getElementById('loginEmail');
      const email = emailInput?.value?.trim();

      if (!email) {
        this._showLoginError(errorEl, 'Informe seu email para entrar.');
        return;
      }

      const password = passInput?.value || '';

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Entrando...';
      }

      let result;
      if (typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.isOnline()) {
        try {
          result = await this.loginWithEmail(email, password);
        } catch (e) {
          console.warn('[TBO Auth] Supabase email auth error:', e);
          result = { ok: false, msg: e.message };
        }
      } else {
        result = { ok: false, msg: 'Sem conexao com o servidor. Verifique sua internet.' };
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }

      if (result.ok) {
        this._setOverlayState('app');
        this._applyAccess();
        this._renderUserMenu(result.session);
        this._renderSidebarUser(result.session);
        // Re-render sidebar navigation items (now that user is logged in)
        if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebar) {
          TBO_APP._renderSidebar();
          TBO_APP._bindSectionToggles();
        }
        if (typeof TBO_ROUTER !== 'undefined') {
          TBO_ROUTER.initFromHash(result.session.defaultModule);
        }
        if (window.lucide) lucide.createIcons();
      } else {
        this._showLoginError(errorEl, result.msg);
      }
    };

    if (btn) btn.addEventListener('click', doLogin);
    if (passInput) passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });

    // Also bind Enter on email input
    const emailInput = document.getElementById('loginEmail');
    if (emailInput) {
      emailInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          if (passInput) passInput.focus();
          else doLogin();
        }
      });
    }

    // Magic Link button
    const magicBtn = document.getElementById('loginMagicBtn');
    if (magicBtn) {
      magicBtn.addEventListener('click', async () => {
        const email = document.getElementById('loginEmail')?.value?.trim();
        if (!email) {
          this._showLoginError(errorEl, 'Informe o email para receber o Magic Link.');
          return;
        }
        magicBtn.disabled = true;
        magicBtn.textContent = 'Enviando...';
        const result = await this.loginWithMagicLink(email);
        magicBtn.disabled = false;
        magicBtn.textContent = 'Enviar Magic Link por e-mail';
        if (result.ok && result.magicLinkSent) {
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('Magic Link enviado', `Verifique seu e-mail (${email}) e clique no link para entrar.`);
          }
        } else {
          this._showLoginError(errorEl, result.msg || 'Erro ao enviar Magic Link.');
        }
      });
    }
  },

  _showLoginError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS CONTROL (hide forbidden nav items)
  // ═══════════════════════════════════════════════════════════════════════════

  _applyAccess() {
    const allowed = this.getAllowedModules();

    document.querySelectorAll('.nav-item[data-module]').forEach(btn => {
      const mod = btn.dataset.module;
      const li = btn.closest('li');
      if (li) {
        li.style.display = allowed.includes(mod) ? '' : 'none';
      }
    });

    document.querySelectorAll('.nav-section').forEach(section => {
      let hasVisible = false;
      section.querySelectorAll('.nav-item[data-module]').forEach(btn => {
        if (allowed.includes(btn.dataset.module)) hasVisible = true;
      });
      section.style.display = hasVisible ? '' : 'none';
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CHECK SESSION ON APP START
  // ═══════════════════════════════════════════════════════════════════════════

  checkSession() {
    const user = this.getCurrentUser();

    if (user) {
      if (!user.dashboardVariant || !user.roleLabel) {
        this.logout();
        this._setOverlayState('login');
        return false;
      }

      this._setOverlayState('app');
      this._applyAccess();
      this._renderUserMenu(user);
      this._renderSidebarUser(user);

      // v2.6.2: Re-verificar avatar assincronamente no reload
      // Se sessionStorage nao tem avatar, buscar do Supabase session + profiles
      this._ensureAvatarAsync(user);

      return true;
    }

    this._setOverlayState('login');
    return false;
  },

  /**
   * v2.6.2: Garante que o avatar esta disponivel apos reload/restauracao de sessao.
   * Busca do Supabase Auth session + profiles table e atualiza UI se necessario.
   * Non-blocking — nao impede renderizacao inicial (iniciais aparecem instantaneamente).
   */
  async _ensureAvatarAsync(user) {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const supaSession = await TBO_SUPABASE.getSession();
      if (!supaSession?.user) return;

      const profile = await TBO_SUPABASE.getProfile();
      const resolvedAvatar = this._resolveAvatarUrl(profile, supaSession.user);

      // Se avatar mudou (era null e agora existe, ou URL diferente)
      if (resolvedAvatar && resolvedAvatar !== user.avatarUrl) {
        user.avatarUrl = resolvedAvatar;
        this._cachedUser = user;
        sessionStorage.setItem('tbo_auth', JSON.stringify(user));

        // Re-renderizar UI com avatar atualizado
        this._renderUserMenu(user);
        this._renderSidebarUser(user);
        // Atualizar sidebar footer (app.js)
        if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebarFooter) {
          TBO_APP._renderSidebarFooter();
        }
        if (window.lucide) lucide.createIcons();
        console.log('[TBO Auth] Avatar restaurado apos reload');

        // Sincronizar com profiles se necessario
        if (profile && resolvedAvatar !== profile.avatar_url) {
          TBO_SUPABASE.getClient()
            .from('profiles').update({ avatar_url: resolvedAvatar }).eq('id', supaSession.user.id)
            .then(() => console.log('[TBO Auth] Avatar sincronizado com profiles'))
            .catch(e => console.warn('[TBO Auth] Avatar sync error:', e.message));
        }
      }
    } catch (e) {
      console.warn('[TBO Auth] _ensureAvatarAsync error:', e);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER USER MENU (header dropdown)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderUserMenu(user) {
    const container = document.getElementById('userMenu');
    if (!container || !user) return;

    // v2.1: Escapar dados do usuario para prevenir XSS
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
    const safeName = esc(user.name);
    const safeRoleLabel = esc(user.roleLabel);
    const safeInitials = esc(user.initials);
    // Validar avatar URL: aceitar apenas https://
    const safeAvatarUrl = (user.avatarUrl && /^https:\/\//i.test(user.avatarUrl)) ? user.avatarUrl : null;

    const buLabel = user.bu ? ` \u00B7 ${esc(user.bu)}` : '';

    // v2.2.1: Removido "Autenticado via Supabase" (info tecnica nao relevante para usuario)
    // Mostrar apenas info util: horario de login
    let sessionInfo = '';
    if (user.loginAt) {
      const loginTime = new Date(user.loginAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      sessionInfo = `<div class="user-dropdown-session">Conectado desde ${loginTime}</div>`;
    }

    // Avatar: usar avatar resolvido com fallback para iniciais + onerror
    const avatarHtml = safeAvatarUrl
      ? `<img src="${safeAvatarUrl}" class="user-avatar user-avatar--img" alt="${safeName}" style="width:32px;height:32px;border-radius:50%;" onerror="this.outerHTML='<div class=\\'user-avatar\\' style=\\'background:${user.roleColor}\\'>${safeInitials}</div>'">`
      : `<div class="user-avatar" style="background:${user.roleColor};">${safeInitials}</div>`;

    const avatarLgHtml = safeAvatarUrl
      ? `<img src="${safeAvatarUrl}" class="user-avatar user-avatar--lg user-avatar--img" alt="${safeName}" style="width:48px;height:48px;border-radius:50%;" onerror="this.outerHTML='<div class=\\'user-avatar user-avatar--lg\\' style=\\'background:${user.roleColor}\\'>${safeInitials}</div>'">`
      : `<div class="user-avatar user-avatar--lg" style="background:${user.roleColor};">${safeInitials}</div>`;

    container.innerHTML = `
      <button class="user-menu-trigger" id="userMenuTrigger" aria-haspopup="true" aria-expanded="false">
        ${avatarHtml}
        <span class="user-menu-name">${safeName}</span>
        <i data-lucide="chevron-down" class="user-menu-chevron" aria-hidden="true"></i>
      </button>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          ${avatarLgHtml}
          <div class="user-dropdown-info">
            <div class="user-dropdown-name">${safeName}</div>
            <div class="user-dropdown-role">${safeRoleLabel}${buLabel}</div>
            ${sessionInfo}
          </div>
        </div>
        <div class="user-dropdown-body">
          <button class="user-dropdown-item" id="dropdownThemeToggle">
            <i data-lucide="sun" aria-hidden="true"></i>
            <span>Alternar tema</span>
          </button>
          <div class="user-dropdown-divider"></div>
          <button class="user-dropdown-item user-dropdown-item--danger" id="dropdownLogout">
            <i data-lucide="log-out" aria-hidden="true"></i>
            <span>Sair</span>
          </button>
        </div>
      </div>
    `;

    // Bind trigger toggle
    const trigger = document.getElementById('userMenuTrigger');
    const dropdown = document.getElementById('userDropdown');

    if (trigger && dropdown) {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = dropdown.classList.contains('open');
        dropdown.classList.toggle('open', !isOpen);
        trigger.setAttribute('aria-expanded', !isOpen);
      });

      // Remove previous document click listener to prevent memory leak
      if (this._docClickCloseMenu) {
        document.removeEventListener('click', this._docClickCloseMenu);
      }
      this._docClickCloseMenu = (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      };
      document.addEventListener('click', this._docClickCloseMenu);
    }

    // Theme toggle
    const themeBtn = document.getElementById('dropdownThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', (e) => {
        const isDark = document.body.classList.contains('dark-mode');
        const newTheme = isDark ? 'light' : 'dark';

        // Transicao cinematica circular (tipo Android 12)
        const rect = themeBtn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const maxRadius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));

        // Criar overlay circular
        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;pointer-events:none;`;
        const bg = newTheme === 'dark' ? '#141414' : '#EAEAEA';
        overlay.style.background = bg;
        overlay.style.clipPath = `circle(0px at ${cx}px ${cy}px)`;
        overlay.style.transition = 'clip-path 500ms cubic-bezier(0.4, 0, 0.2, 1)';
        document.body.appendChild(overlay);

        // Trigger transicao
        requestAnimationFrame(() => {
          overlay.style.clipPath = `circle(${maxRadius}px at ${cx}px ${cy}px)`;
        });

        // Aplicar tema apos metade da animacao
        setTimeout(() => {
          document.body.classList.toggle('dark-mode', !isDark);
          document.body.classList.toggle('light-mode', isDark);
          localStorage.setItem('tbo_theme', newTheme);
          const iconEl = themeBtn.querySelector('i');
          if (iconEl) {
            iconEl.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
            if (window.lucide) lucide.createIcons();
          }
        }, 250);

        // Remover overlay apos animacao
        setTimeout(() => overlay.remove(), 550);

        if (typeof TBO_COMMAND_CENTER !== 'undefined' && TBO_COMMAND_CENTER._leafletMap) {
          setTimeout(() => TBO_COMMAND_CENTER._leafletMap.invalidateSize(), 600);
        }
        if (dropdown) dropdown.classList.remove('open');
      });
    }

    // Logout
    const logoutBtn = document.getElementById('dropdownLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await this.logout();
        this._setOverlayState('login');
        const passInput = document.getElementById('loginPass');
        if (passInput) passInput.value = '';
        const emailInput = document.getElementById('loginEmail');
        if (emailInput) emailInput.value = '';
        const errorEl = document.getElementById('loginError');
        if (errorEl) errorEl.style.display = 'none';
        if (dropdown) dropdown.classList.remove('open');
        container.innerHTML = '';
        const sidebarWidget = document.getElementById('sidebarUserWidget');
        if (sidebarWidget) sidebarWidget.innerHTML = '';
      });
    }

    // Set correct theme icon
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = themeBtn?.querySelector('i');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER SIDEBAR USER WIDGET
  // ═══════════════════════════════════════════════════════════════════════════

  _renderSidebarUser(user) {
    const widget = document.getElementById('sidebarUserWidget');
    if (!widget || !user) return;

    // v2.1: Escapar dados do usuario para prevenir XSS
    const esc = typeof _escapeHtml === 'function' ? _escapeHtml : (s) => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#x27;'}[c]));
    const safeName = esc(user.name);
    const safeRoleLabel = esc(user.roleLabel);
    const safeInitials = esc(user.initials);
    const safeAvatarUrl = (user.avatarUrl && /^https:\/\//i.test(user.avatarUrl)) ? user.avatarUrl : null;

    const buLabel = user.bu ? ` \u00B7 ${esc(user.bu)}` : '';

    const avatarHtml = safeAvatarUrl
      ? `<img src="${safeAvatarUrl}" class="sidebar-user-avatar" alt="${safeName}" style="width:32px;height:32px;border-radius:50%;" onerror="this.outerHTML='<div class=\\'sidebar-user-avatar\\' style=\\'background:${user.roleColor};color:#fff\\'>${safeInitials}</div>'">`
      : `<div class="sidebar-user-avatar" style="background:${user.roleColor}; color:#fff;">${safeInitials}</div>`;

    widget.innerHTML = `
      ${avatarHtml}
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${safeName}</div>
        <div class="sidebar-user-role">${safeRoleLabel}${buLabel}</div>
      </div>
    `;
  }
};
