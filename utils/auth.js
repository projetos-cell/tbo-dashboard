// TBO OS — Authentication & Session Management
// Supports: Supabase Auth (Google OAuth + email/password) + legacy fallback
// Delegates role/permission logic to TBO_PERMISSIONS.
// Manages login, session, user menu dropdown, sidebar user widget.

const TBO_AUTH = {
  // ── Legacy user credentials (fallback when Supabase is unavailable) ────
  _users: {
    marco:    { name: 'Marco Andolfato',  email: 'marco@agenciatbo.com.br' },
    ruy:      { name: 'Ruy Lima',         email: 'ruy@agenciatbo.com.br' },
    carol:    { name: 'Carol',            email: 'carol@agenciatbo.com.br' },
    nelson:   { name: 'Nelson',           email: 'nelson@agenciatbo.com.br' },
    nath:     { name: 'Nathalia',         email: 'nath@agenciatbo.com.br' },
    rafa:     { name: 'Rafa',             email: 'rafa@agenciatbo.com.br' },
    gustavo:  { name: 'Gustavo',          email: 'gustavo@agenciatbo.com.br' },
    celso:    { name: 'Celso',            email: 'celso@agenciatbo.com.br' },
    erick:    { name: 'Erick',            email: 'erick@agenciatbo.com.br' },
    dann:     { name: 'Danniel',          email: 'dann@agenciatbo.com.br' },
    duda:     { name: 'Duda',             email: 'duda@agenciatbo.com.br' },
    tiago:    { name: 'Tiago M.',         email: 'tiago@agenciatbo.com.br' },
    mari:     { name: 'Mariane',          email: 'mari@agenciatbo.com.br' },
    lucca:    { name: 'Lucca',            email: 'lucca@agenciatbo.com.br' },
    financaazul: { name: 'Financa Azul',  email: 'financeiro@agenciatbo.com.br' }
  },

  // Session state
  _sessionExpiresHours: 8,
  _expirationCheckInterval: null,
  _supabaseAuthMode: false, // true when authenticated via Supabase
  _cachedUser: null,

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION — Read current user (synchronous, from cache)
  // ═══════════════════════════════════════════════════════════════════════════

  getCurrentUser() {
    // Return cached user if available
    if (this._cachedUser) return this._cachedUser;

    try {
      const raw = sessionStorage.getItem('tbo_auth');
      if (!raw) return null;
      const session = JSON.parse(raw);

      // Check token expiration (legacy mode)
      if (!this._supabaseAuthMode && session.expiresAt) {
        if (typeof TBO_CRYPTO !== 'undefined' && TBO_CRYPTO.isTokenExpired(session.expiresAt)) {
          this.logout();
          this._showSessionExpiredMessage();
          return null;
        }
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

    this._supabaseAuthMode = true;
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
      const { error } = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
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
  // LOGIN — Legacy (username + password via TBO_CRYPTO)
  // ═══════════════════════════════════════════════════════════════════════════

  async login(userId, password, skipSupabase) {
    // Try Supabase email auth first (unless explicitly skipped)
    if (!skipSupabase && typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.isOnline()) {
      try {
        const email = this._users[userId]?.email || `${userId}@agenciatbo.com.br`;
        const result = await this.loginWithEmail(email, password);
        if (result.ok) return result;
        console.warn('[TBO Auth] Supabase login failed, trying legacy:', result.msg);
      } catch (e) {
        console.warn('[TBO Auth] Supabase login error, falling back to legacy:', e);
      }
    }

    // Legacy path: TBO_CRYPTO hash verification
    const cred = this._users[userId];
    if (!cred) return { ok: false, msg: 'Usuario nao encontrado.' };

    if (typeof TBO_CRYPTO === 'undefined') {
      return { ok: false, msg: 'Modulo de criptografia nao disponivel.' };
    }

    const userHashes = await TBO_CRYPTO.getDefaultUserHashes();
    const stored = userHashes[userId];
    if (!stored) return { ok: false, msg: 'Credenciais nao configuradas.' };

    const valid = await TBO_CRYPTO.verifyPassword(password, stored.hash, stored.salt);
    if (!valid) return { ok: false, msg: 'Senha incorreta.' };

    // Build session from TBO_PERMISSIONS
    const roleInfo = TBO_PERMISSIONS.getRoleForUser(userId);
    if (!roleInfo) return { ok: false, msg: 'Permissoes nao configuradas.' };

    const { token, expiresAt } = TBO_CRYPTO.generateSessionToken(this._sessionExpiresHours);

    const session = {
      id: userId,
      name: cred.name,
      role: roleInfo.roleName,
      roleLabel: roleInfo.label,
      roleColor: roleInfo.color,
      modules: TBO_PERMISSIONS.getModulesForUser(userId),
      dashboardVariant: roleInfo.dashboardVariant,
      defaultModule: roleInfo.defaultModule,
      bu: roleInfo.bu,
      isCoordinator: roleInfo.isCoordinator,
      initials: TBO_PERMISSIONS.getInitials(cred.name),
      loginAt: new Date().toISOString(),
      token,
      expiresAt,
      authMode: 'legacy'
    };

    this._supabaseAuthMode = false;
    this._cachedUser = session;
    sessionStorage.setItem('tbo_auth', JSON.stringify(session));
    this._startExpirationCheck();

    return { ok: true, session };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUILD SESSION FROM SUPABASE PROFILE
  // ═══════════════════════════════════════════════════════════════════════════

  async _buildSupabaseSession(authUser) {
    if (!authUser) return null;

    // Fetch profile from Supabase
    const profile = await TBO_SUPABASE.getProfile(true);

    // If profile exists in Supabase, use it
    if (profile) {
      const userId = profile.username || authUser.email?.split('@')[0] || authUser.id;
      const roleName = profile.role || 'artist';
      const roleDef = TBO_PERMISSIONS._roles[roleName];

      return {
        id: userId,
        supabaseId: authUser.id,
        name: profile.full_name || authUser.user_metadata?.full_name || userId,
        email: authUser.email,
        role: roleName,
        roleLabel: roleDef?.label || roleName,
        roleColor: roleDef?.color || '#94a3b8',
        modules: TBO_PERMISSIONS.getModulesForUser(userId) || roleDef?.modules || [],
        dashboardVariant: roleDef?.dashboardVariant || 'tasks',
        defaultModule: roleDef?.defaultModule || 'command-center',
        bu: profile.bu || TBO_PERMISSIONS.getUserBU(userId),
        isCoordinator: profile.is_coordinator || TBO_PERMISSIONS.isCoordinator(userId),
        initials: TBO_PERMISSIONS.getInitials(profile.full_name || userId),
        loginAt: new Date().toISOString(),
        authMode: 'supabase',
        avatarUrl: authUser.user_metadata?.avatar_url || null
      };
    }

    // Fallback: try to map by email to legacy user
    const email = authUser.email;
    if (email) {
      const legacyId = Object.keys(this._users).find(k => this._users[k].email === email);
      if (legacyId) {
        const roleInfo = TBO_PERMISSIONS.getRoleForUser(legacyId);
        if (roleInfo) {
          return {
            id: legacyId,
            supabaseId: authUser.id,
            name: this._users[legacyId].name,
            email,
            role: roleInfo.roleName,
            roleLabel: roleInfo.label,
            roleColor: roleInfo.color,
            modules: TBO_PERMISSIONS.getModulesForUser(legacyId),
            dashboardVariant: roleInfo.dashboardVariant,
            defaultModule: roleInfo.defaultModule,
            bu: roleInfo.bu,
            isCoordinator: roleInfo.isCoordinator,
            initials: TBO_PERMISSIONS.getInitials(this._users[legacyId].name),
            loginAt: new Date().toISOString(),
            authMode: 'supabase',
            avatarUrl: authUser.user_metadata?.avatar_url || null
          };
        }
      }
    }

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
            this._supabaseAuthMode = true;
            this._cachedUser = session;
            sessionStorage.setItem('tbo_auth', JSON.stringify(session));

            // Update UI
            const overlay = document.getElementById('loginOverlay');
            if (overlay) overlay.classList.add('hidden');
            this._applyAccess();
            this._renderUserMenu(session);
            this._renderSidebarUser(session);
            // Re-render sidebar navigation items (now that user is logged in)
            if (typeof TBO_APP !== 'undefined' && TBO_APP._renderSidebar) {
              TBO_APP._renderSidebar();
              TBO_APP._bindSectionToggles();
            }
            if (typeof TBO_ROUTER !== 'undefined') {
              TBO_ROUTER.initFromHash(session.defaultModule);
            }
            if (window.lucide) lucide.createIcons();
          }
        }
      } else if (event === 'SIGNED_OUT') {
        this._cachedUser = null;
        sessionStorage.removeItem('tbo_auth');
        TBO_SUPABASE.clearProfileCache();

        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.classList.remove('hidden');
        const container = document.getElementById('userMenu');
        if (container) container.innerHTML = '';
        const sidebarWidget = document.getElementById('sidebarUserWidget');
        if (sidebarWidget) sidebarWidget.innerHTML = '';
      } else if (event === 'TOKEN_REFRESHED') {
        // Supabase auto-refreshes tokens — no action needed
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
        this._supabaseAuthMode = true;
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
    if (this._supabaseAuthMode && typeof TBO_SUPABASE !== 'undefined') {
      const client = TBO_SUPABASE.getClient();
      if (client) {
        try { await client.auth.signOut(); } catch (e) { /* ignore */ }
      }
      TBO_SUPABASE.clearProfileCache();
    }

    this._cachedUser = null;
    this._supabaseAuthMode = false;
    sessionStorage.removeItem('tbo_auth');
    this._stopExpirationCheck();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SESSION EXPIRATION (legacy mode only)
  // ═══════════════════════════════════════════════════════════════════════════

  _startExpirationCheck() {
    this._stopExpirationCheck();
    this._expirationCheckInterval = setInterval(() => {
      const user = this.getCurrentUser();
      if (!user) {
        this._stopExpirationCheck();
      }
    }, 60 * 1000);
  },

  _stopExpirationCheck() {
    if (this._expirationCheckInterval) {
      clearInterval(this._expirationCheckInterval);
      this._expirationCheckInterval = null;
    }
  },

  _showSessionExpiredMessage() {
    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.remove('hidden');

    const container = document.getElementById('userMenu');
    if (container) container.innerHTML = '';
    const sidebarWidget = document.getElementById('sidebarUserWidget');
    if (sidebarWidget) sidebarWidget.innerHTML = '';

    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.warning('Sessao expirada', 'Sua sessao expirou. Faca login novamente.');
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ACCESS CHECKS
  // ═══════════════════════════════════════════════════════════════════════════

  canAccess(moduleName) {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.modules.includes(moduleName);
  },

  isAdmin() {
    const user = this.getCurrentUser();
    return user && user.role === 'founder';
  },

  isFounder() {
    return this.isAdmin();
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

    // Email/password or legacy login
    const doLogin = async () => {
      // Check if email field exists (new UI) or select (legacy UI)
      const emailInput = document.getElementById('loginEmail');
      const userSelect = document.getElementById('loginUser');

      let userId, email, password;

      if (emailInput && emailInput.value) {
        email = emailInput.value.trim();
        password = passInput?.value || '';
        // Extract userId from email for legacy bridge
        userId = email.split('@')[0];
      } else if (userSelect && userSelect.value) {
        userId = userSelect.value;
        password = passInput?.value || '';
      } else {
        this._showLoginError(errorEl, 'Informe o email ou selecione um usuario.');
        return;
      }

      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Entrando...';
      }

      let result;
      if (email && typeof TBO_SUPABASE !== 'undefined' && TBO_SUPABASE.isOnline()) {
        // Try Supabase email auth
        try {
          result = await this.loginWithEmail(email, password);
        } catch (e) {
          console.warn('[TBO Auth] Supabase email auth error:', e);
          result = { ok: false, msg: e.message };
        }
        if (!result.ok) {
          // Fallback to legacy — skip Supabase retry since we already tried
          if (userId && this._users[userId]) {
            result = await this.login(userId, password, true);
          }
        }
      } else {
        // Legacy login
        result = await this.login(userId, password);
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Entrar';
      }

      if (result.ok) {
        overlay.classList.add('hidden');
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
    const overlay = document.getElementById('loginOverlay');

    if (user) {
      if (!user.dashboardVariant || !user.roleLabel) {
        this.logout();
        if (overlay) overlay.classList.remove('hidden');
        return false;
      }

      if (overlay) overlay.classList.add('hidden');
      this._applyAccess();
      this._renderUserMenu(user);
      this._renderSidebarUser(user);

      if (!this._supabaseAuthMode) {
        this._startExpirationCheck();
      }

      return true;
    }

    if (overlay) overlay.classList.remove('hidden');
    return false;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER USER MENU (header dropdown)
  // ═══════════════════════════════════════════════════════════════════════════

  _renderUserMenu(user) {
    const container = document.getElementById('userMenu');
    if (!container || !user) return;

    const buLabel = user.bu ? ` \u00B7 ${user.bu}` : '';

    // Session info
    let sessionInfo = '';
    if (user.authMode === 'supabase') {
      sessionInfo = '<div class="user-dropdown-session">Autenticado via Supabase</div>';
    } else if (user.expiresAt) {
      const remaining = new Date(user.expiresAt) - new Date();
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      sessionInfo = `<div class="user-dropdown-session">Sessao expira em ${hours}h${minutes.toString().padStart(2, '0')}m</div>`;
    }

    // Avatar: use Google avatar if available, else initials
    const avatarHtml = user.avatarUrl
      ? `<img src="${user.avatarUrl}" class="user-avatar user-avatar--img" alt="${user.name}" style="width:32px;height:32px;border-radius:50%;">`
      : `<div class="user-avatar" style="background:${user.roleColor};">${user.initials}</div>`;

    const avatarLgHtml = user.avatarUrl
      ? `<img src="${user.avatarUrl}" class="user-avatar user-avatar--lg user-avatar--img" alt="${user.name}" style="width:48px;height:48px;border-radius:50%;">`
      : `<div class="user-avatar user-avatar--lg" style="background:${user.roleColor};">${user.initials}</div>`;

    container.innerHTML = `
      <button class="user-menu-trigger" id="userMenuTrigger" aria-haspopup="true" aria-expanded="false">
        ${avatarHtml}
        <span class="user-menu-name">${user.name}</span>
        <i data-lucide="chevron-down" class="user-menu-chevron" aria-hidden="true"></i>
      </button>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          ${avatarLgHtml}
          <div class="user-dropdown-info">
            <div class="user-dropdown-name">${user.name}</div>
            <div class="user-dropdown-role">${user.roleLabel}${buLabel}</div>
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
      themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', !isDark);
        document.body.classList.toggle('light-mode', isDark);
        localStorage.setItem('tbo_theme', isDark ? 'light' : 'dark');
        const iconEl = themeBtn.querySelector('i');
        if (iconEl) {
          iconEl.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
          if (window.lucide) lucide.createIcons();
        }
        if (typeof TBO_COMMAND_CENTER !== 'undefined' && TBO_COMMAND_CENTER._leafletMap) {
          setTimeout(() => TBO_COMMAND_CENTER._leafletMap.invalidateSize(), 100);
        }
        if (dropdown) dropdown.classList.remove('open');
      });
    }

    // Logout
    const logoutBtn = document.getElementById('dropdownLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', async () => {
        await this.logout();
        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.classList.remove('hidden');
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

    const buLabel = user.bu ? ` \u00B7 ${user.bu}` : '';

    const avatarHtml = user.avatarUrl
      ? `<img src="${user.avatarUrl}" class="sidebar-user-avatar" alt="${user.name}" style="width:32px;height:32px;border-radius:50%;">`
      : `<div class="sidebar-user-avatar" style="background:${user.roleColor}; color:#fff;">${user.initials}</div>`;

    widget.innerHTML = `
      ${avatarHtml}
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.name}</div>
        <div class="sidebar-user-role">${user.roleLabel}${buLabel}</div>
      </div>
    `;
  }
};
