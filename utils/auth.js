// TBO OS — Authentication & Session Management
// Delegates role/permission logic to TBO_PERMISSIONS (loaded first).
// Manages login, session, user menu dropdown, sidebar user widget.

const TBO_AUTH = {
  // ── User credentials (role info comes from TBO_PERMISSIONS) ───────────────
  _users: {
    // Diretoria
    marco:    { name: 'Marco Andolfato', pass: 'tbo2026' },
    ruy:      { name: 'Ruy Lima',        pass: 'tbo2026' },
    // Coord & POs
    carol:    { name: 'Carol',           pass: 'tbo123'  },
    nelson:   { name: 'Nelson',          pass: 'tbo123'  },
    nath:     { name: 'Nathalia',        pass: 'tbo123'  },
    rafa:     { name: 'Rafa',            pass: 'tbo123'  },
    // Comercial
    gustavo:  { name: 'Gustavo',         pass: 'tbo123'  },
    // Branding
    celso:    { name: 'Celso',           pass: 'tbo123'  },
    erick:    { name: 'Erick',           pass: 'tbo123'  },
    // Digital 3D
    dann:     { name: 'Danniel',         pass: 'tbo123'  },
    duda:     { name: 'Duda',            pass: 'tbo123'  },
    tiago:    { name: 'Tiago M.',        pass: 'tbo123'  },
    mari:     { name: 'Mariane',         pass: 'tbo123'  },
    // Marketing
    lucca:    { name: 'Lucca',           pass: 'tbo123'  }
  },

  // ── Session ─────────────────────────────────────────────────────────────────

  getCurrentUser() {
    try {
      const raw = sessionStorage.getItem('tbo_auth');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },

  // ── Login ───────────────────────────────────────────────────────────────────

  login(userId, password) {
    const cred = this._users[userId];
    if (!cred) return { ok: false, msg: 'Usuario nao encontrado.' };
    if (cred.pass !== password) return { ok: false, msg: 'Senha incorreta.' };

    // Build enriched session from TBO_PERMISSIONS
    const roleInfo = TBO_PERMISSIONS.getRoleForUser(userId);
    if (!roleInfo) return { ok: false, msg: 'Permissoes nao configuradas.' };

    const session = {
      id: userId,
      name: cred.name,
      role: roleInfo.roleName,
      roleLabel: roleInfo.label,
      roleColor: roleInfo.color,
      modules: roleInfo.modules,
      dashboardVariant: roleInfo.dashboardVariant,
      defaultModule: roleInfo.defaultModule,
      bu: roleInfo.bu,
      isCoordinator: roleInfo.isCoordinator,
      initials: TBO_PERMISSIONS.getInitials(cred.name),
      loginAt: new Date().toISOString()
    };

    sessionStorage.setItem('tbo_auth', JSON.stringify(session));
    return { ok: true, session };
  },

  // ── Logout ──────────────────────────────────────────────────────────────────

  logout() {
    sessionStorage.removeItem('tbo_auth');
  },

  // ── Access checks ───────────────────────────────────────────────────────────

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

  // ── Initialize login UI ────────────────────────────────────────────────────

  initLoginUI() {
    const overlay = document.getElementById('loginOverlay');
    const btn = document.getElementById('loginBtn');
    const passInput = document.getElementById('loginPass');
    const errorEl = document.getElementById('loginError');

    if (!overlay) return;

    const doLogin = () => {
      const userId = document.getElementById('loginUser')?.value;
      const password = passInput?.value || '';
      if (!userId) {
        this._showLoginError(errorEl, 'Selecione um usuario.');
        return;
      }
      const result = this.login(userId, password);
      if (result.ok) {
        overlay.classList.add('hidden');
        this._applyAccess();
        this._renderUserMenu(result.session);
        this._renderSidebarUser(result.session);
        // Navigate to user's default module
        if (typeof TBO_ROUTER !== 'undefined') {
          TBO_ROUTER.initFromHash(result.session.defaultModule);
        }
        // Re-init Lucide icons for new dynamic elements
        if (window.lucide) lucide.createIcons();
      } else {
        this._showLoginError(errorEl, result.msg);
      }
    };

    if (btn) btn.addEventListener('click', doLogin);
    if (passInput) passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doLogin();
    });
  },

  _showLoginError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 3000);
  },

  // ── Apply access control (hide forbidden nav items + empty sections) ─────

  _applyAccess() {
    const allowed = this.getAllowedModules();

    // Hide individual nav items user can't access
    document.querySelectorAll('.nav-item[data-module]').forEach(btn => {
      const mod = btn.dataset.module;
      const li = btn.closest('li');
      if (li) {
        li.style.display = allowed.includes(mod) ? '' : 'none';
      }
    });

    // Hide entire sections that have no visible modules
    document.querySelectorAll('.nav-section').forEach(section => {
      const visibleItems = section.querySelectorAll('li[style=""], li:not([style])');
      // Check if any li is actually visible
      let hasVisible = false;
      section.querySelectorAll('.nav-item[data-module]').forEach(btn => {
        if (allowed.includes(btn.dataset.module)) hasVisible = true;
      });
      section.style.display = hasVisible ? '' : 'none';
    });
  },

  // ── Check session on app start ─────────────────────────────────────────────

  checkSession() {
    const user = this.getCurrentUser();
    const overlay = document.getElementById('loginOverlay');

    if (user) {
      // Detect stale session (missing enriched fields) — force re-login
      if (!user.dashboardVariant || !user.roleLabel) {
        this.logout();
        if (overlay) overlay.classList.remove('hidden');
        return false;
      }

      if (overlay) overlay.classList.add('hidden');
      this._applyAccess();
      this._renderUserMenu(user);
      this._renderSidebarUser(user);
      return true;
    }

    if (overlay) overlay.classList.remove('hidden');
    return false;
  },

  // ── Render User Menu (header dropdown) ─────────────────────────────────────

  _renderUserMenu(user) {
    const container = document.getElementById('userMenu');
    if (!container || !user) return;

    const buLabel = user.bu ? ` \u00B7 ${user.bu}` : '';

    container.innerHTML = `
      <button class="user-menu-trigger" id="userMenuTrigger" aria-haspopup="true" aria-expanded="false">
        <div class="user-avatar" style="background:${user.roleColor};">${user.initials}</div>
        <span class="user-menu-name">${user.name}</span>
        <i data-lucide="chevron-down" class="user-menu-chevron" aria-hidden="true"></i>
      </button>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          <div class="user-avatar user-avatar--lg" style="background:${user.roleColor};">${user.initials}</div>
          <div class="user-dropdown-info">
            <div class="user-dropdown-name">${user.name}</div>
            <div class="user-dropdown-role">${user.roleLabel}${buLabel}</div>
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

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    // Bind theme toggle
    const themeBtn = document.getElementById('dropdownThemeToggle');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');
        document.body.classList.toggle('dark-mode', !isDark);
        document.body.classList.toggle('light-mode', isDark);
        localStorage.setItem('tbo_theme', isDark ? 'light' : 'dark');
        // Update icon text
        const iconEl = themeBtn.querySelector('i');
        if (iconEl) {
          iconEl.setAttribute('data-lucide', isDark ? 'sun' : 'moon');
          if (window.lucide) lucide.createIcons();
        }
        // Re-invalidate Leaflet map if exists
        if (typeof TBO_COMMAND_CENTER !== 'undefined' && TBO_COMMAND_CENTER._leafletMap) {
          setTimeout(() => TBO_COMMAND_CENTER._leafletMap.invalidateSize(), 100);
        }
        // Close dropdown
        if (dropdown) dropdown.classList.remove('open');
      });
    }

    // Bind logout
    const logoutBtn = document.getElementById('dropdownLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
        const overlay = document.getElementById('loginOverlay');
        if (overlay) overlay.classList.remove('hidden');
        const passInput = document.getElementById('loginPass');
        if (passInput) passInput.value = '';
        const errorEl = document.getElementById('loginError');
        if (errorEl) errorEl.style.display = 'none';
        // Close dropdown
        if (dropdown) dropdown.classList.remove('open');
        // Clear user displays
        container.innerHTML = '';
        const sidebarWidget = document.getElementById('sidebarUserWidget');
        if (sidebarWidget) sidebarWidget.innerHTML = '';
      });
    }

    // Set correct theme icon on render
    const isDark = document.body.classList.contains('dark-mode');
    const themeIcon = themeBtn?.querySelector('i');
    if (themeIcon) {
      themeIcon.setAttribute('data-lucide', isDark ? 'moon' : 'sun');
    }
  },

  // ── Render Sidebar User Widget ─────────────────────────────────────────────

  _renderSidebarUser(user) {
    const widget = document.getElementById('sidebarUserWidget');
    if (!widget || !user) return;

    const buLabel = user.bu ? ` \u00B7 ${user.bu}` : '';

    widget.innerHTML = `
      <div class="sidebar-user-avatar" style="background:${user.roleColor}; color:#fff;">${user.initials}</div>
      <div class="sidebar-user-info">
        <div class="sidebar-user-name">${user.name}</div>
        <div class="sidebar-user-role">${user.roleLabel}${buLabel}</div>
      </div>
    `;
  }
};
