// ============================================================================
// TBO OS — Modulo: Admin Portal (v3.0 — Modular Tabs)
// Orquestrador: delega para sub-modulos em modules/admin/*.js
// Acesso restrito a roles Owner ou Admin
//
// Sub-modulos:
//   - modules/admin/users-tab.js       → TBO_ADMIN_USERS_TAB
//   - modules/admin/roles-tab.js       → TBO_ADMIN_ROLES_TAB
//   - modules/admin/permissions-tab.js → TBO_ADMIN_PERMISSIONS_TAB
//   - modules/admin/audit-tab.js       → TBO_ADMIN_AUDIT_TAB
// ============================================================================

const TBO_ADMIN_PORTAL = {
  _tab: 'usuarios',
  _tenants: [],
  _users: [],
  _roles: [],
  _permissions: [],        // catalogo de permissions do Supabase
  _rolePermissions: {},    // { roleId: Set(['module.action', ...]) }
  _members: [],            // tenant_members raw
  _loading: false,
  _showModal: null,        // 'addRole' | 'editRole' | 'inviteUser' | 'deleteConfirm' | null
  _modalData: {},

  // ── Tab config — icone e label de cada tab ───────────────────────────────
  _tabConfig: [
    { id: 'usuarios',   icon: 'users',       label: 'Usuarios' },
    { id: 'papeis',     icon: 'shield',      label: 'Papeis' },
    { id: 'permissoes', icon: 'lock',        label: 'Permissoes' },
    { id: 'auditoria',  icon: 'scroll-text', label: 'Auditoria' }
  ],

  // ── Render principal ─────────────────────────────────────────────────────

  render() {
    return `
      <style>${this._getStyles()}</style>
      <div class="ap-module">
        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">Admin Portal</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Gestao centralizada de papeis, permissoes, usuarios e auditoria</p>
          </div>
          <div style="display:flex;gap:8px;">
            <span class="tag gold">RBAC v3.0</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="ap-tabs">
          ${this._tabConfig.map(t => `
            <button class="ap-tab-btn ${this._tab === t.id ? 'active' : ''}" data-tab="${t.id}">
              <i data-lucide="${t.icon}" style="width:14px;height:14px;"></i>
              ${t.label}
            </button>
          `).join('')}
        </div>

        <div id="apTabContent">
          ${this._loading ? '<div style="text-align:center;padding:40px;"><div class="spinner"></div><p style="color:var(--text-muted);margin-top:12px;">Carregando...</p></div>' : this._renderTab()}
        </div>

        ${this._renderModal()}
      </div>
    `;
  },

  // ── Delegacao de render para sub-modulos ──────────────────────────────────

  _renderTab() {
    // Setup sub-modulo com dados compartilhados
    this._setupSubModule();

    switch (this._tab) {
      case 'usuarios':
        return typeof TBO_ADMIN_USERS_TAB !== 'undefined' ? TBO_ADMIN_USERS_TAB.render() : this._renderFallback('Usuarios');
      case 'papeis':
        return typeof TBO_ADMIN_ROLES_TAB !== 'undefined' ? TBO_ADMIN_ROLES_TAB.render() : this._renderFallback('Papeis');
      case 'permissoes':
        return typeof TBO_ADMIN_PERMISSIONS_TAB !== 'undefined' ? TBO_ADMIN_PERMISSIONS_TAB.render() : this._renderFallback('Permissoes');
      case 'auditoria':
        return typeof TBO_ADMIN_AUDIT_TAB !== 'undefined' ? TBO_ADMIN_AUDIT_TAB.render() : this._renderFallback('Auditoria');
      default: return '';
    }
  },

  _setupSubModule() {
    // Passa dados compartilhados para o sub-modulo ativo
    if (typeof TBO_ADMIN_USERS_TAB !== 'undefined') TBO_ADMIN_USERS_TAB.setup(this);
    if (typeof TBO_ADMIN_ROLES_TAB !== 'undefined') TBO_ADMIN_ROLES_TAB.setup(this);
    if (typeof TBO_ADMIN_PERMISSIONS_TAB !== 'undefined') TBO_ADMIN_PERMISSIONS_TAB.setup(this);
    if (typeof TBO_ADMIN_AUDIT_TAB !== 'undefined') TBO_ADMIN_AUDIT_TAB.setup(this);
  },

  _renderFallback(tabName) {
    return `<div class="card" style="padding:40px;text-align:center;">
      <p style="color:var(--text-muted);font-size:0.85rem;">Modulo "${tabName}" nao carregado. Verifique se o script esta incluido no index.html.</p>
    </div>`;
  },

  // ── Modal centralizado ────────────────────────────────────────────────────

  _renderModal() {
    if (!this._showModal) return '';

    let title = '';
    let body = '';
    let footer = '';

    if (this._showModal === 'addRole' || this._showModal === 'editRole') {
      const isEdit = this._showModal === 'editRole';
      title = isEdit ? 'Editar Papel' : 'Novo Papel';
      body = typeof TBO_ADMIN_ROLES_TAB !== 'undefined'
        ? TBO_ADMIN_ROLES_TAB.renderRoleModal(this._modalData, isEdit)
        : '<p>Modulo de papeis nao carregado.</p>';
      footer = `
        <button class="btn btn-secondary" id="apModalCancel">Cancelar</button>
        <button class="btn btn-primary" id="apModalSaveRole">${isEdit ? 'Salvar' : 'Criar'}</button>
      `;
    }

    if (this._showModal === 'inviteUser') {
      title = 'Convidar Usuario';
      body = typeof TBO_ADMIN_USERS_TAB !== 'undefined'
        ? TBO_ADMIN_USERS_TAB.renderInviteModal()
        : '<p>Modulo de usuarios nao carregado.</p>';
      footer = `
        <button class="btn btn-secondary" id="apModalCancel">Cancelar</button>
        <button class="btn btn-primary" id="apModalInviteUser">Enviar Convite</button>
      `;
    }

    if (this._showModal === 'deleteConfirm') {
      title = 'Confirmar Exclusao';
      body = typeof TBO_ADMIN_ROLES_TAB !== 'undefined'
        ? TBO_ADMIN_ROLES_TAB.renderDeleteConfirmModal(this._modalData)
        : '<p>Confirma exclusao?</p>';
      footer = `
        <button class="btn btn-secondary" id="apModalCancel">Cancelar</button>
        <button class="btn btn-primary" style="background:var(--color-danger);border-color:var(--color-danger);" id="apModalConfirmDelete">Excluir</button>
      `;
    }

    return `
      <div class="modal-overlay active" id="apModalOverlay">
        <div class="modal-card" style="max-width:500px;">
          <div class="modal-header">
            <h3 style="margin:0;font-size:1rem;">${title}</h3>
            <button class="modal-close" id="apModalClose">&#10005;</button>
          </div>
          <div class="modal-body">${body}</div>
          <div class="modal-footer" style="display:flex;gap:8px;justify-content:flex-end;">${footer}</div>
        </div>
      </div>
    `;
  },

  // ── API publica para sub-modulos ──────────────────────────────────────────

  _openModal(type, data) {
    this._showModal = type;
    this._modalData = data || {};
    this._rerender();
  },

  _closeModal() {
    this._showModal = null;
    this._modalData = {};
    this._rerender();
  },

  // ── Init & Event Binding ──────────────────────────────────────────────────

  async init() {
    // Tab navigation
    document.querySelectorAll('.ap-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        this._rerender();
      });
    });

    // Carregar dados na primeira vez
    if (!this._roles.length) {
      await this._loadData();
    }

    // Bind tab-specific events delegando para sub-modulo
    this._bindTabEvents();
    this._bindModalEvents();
  },

  _bindTabEvents() {
    switch (this._tab) {
      case 'usuarios':
        if (typeof TBO_ADMIN_USERS_TAB !== 'undefined') TBO_ADMIN_USERS_TAB.bind();
        break;
      case 'papeis':
        if (typeof TBO_ADMIN_ROLES_TAB !== 'undefined') TBO_ADMIN_ROLES_TAB.bind();
        break;
      case 'permissoes':
        if (typeof TBO_ADMIN_PERMISSIONS_TAB !== 'undefined') TBO_ADMIN_PERMISSIONS_TAB.bind();
        break;
      case 'auditoria':
        if (typeof TBO_ADMIN_AUDIT_TAB !== 'undefined') TBO_ADMIN_AUDIT_TAB.bind();
        break;
    }
  },

  _bindModalEvents() {
    document.getElementById('apModalOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'apModalOverlay') this._closeModal();
    });
    document.getElementById('apModalClose')?.addEventListener('click', () => this._closeModal());
    document.getElementById('apModalCancel')?.addEventListener('click', () => this._closeModal());

    // Delegar handlers para sub-modulos
    document.getElementById('apModalSaveRole')?.addEventListener('click', () => {
      if (typeof TBO_ADMIN_ROLES_TAB !== 'undefined') TBO_ADMIN_ROLES_TAB.handleSaveRole(this._modalData);
    });
    document.getElementById('apModalInviteUser')?.addEventListener('click', () => {
      if (typeof TBO_ADMIN_USERS_TAB !== 'undefined') TBO_ADMIN_USERS_TAB.handleInvite();
    });
    document.getElementById('apModalConfirmDelete')?.addEventListener('click', () => {
      if (typeof TBO_ADMIN_ROLES_TAB !== 'undefined') TBO_ADMIN_ROLES_TAB.handleDeleteRole(this._modalData);
    });
  },

  // ── Data Loading (centralizado) ───────────────────────────────────────────

  async _loadData() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.getClient()) return;
    const client = TBO_SUPABASE.getClient();
    const tenantId = TBO_SUPABASE.getCurrentTenantId();

    try {
      this._loading = true;

      // Carregar tudo em paralelo
      const [tenantsRes, rolesRes, permsRes, permsCatalogRes, profilesRes, membersRes] = await Promise.all([
        client.from('tenants').select('*'),
        client.from('roles').select('*').eq('tenant_id', tenantId).order('sort_order'),
        client.from('role_permissions').select('*, permissions(module, action)').not('permission_id', 'is', null),
        client.from('permissions').select('*').order('sort_order'),
        client.from('profiles').select('*').eq('tenant_id', tenantId),
        client.from('tenant_members').select('*').eq('tenant_id', tenantId)
      ]);

      this._tenants = tenantsRes.data || [];
      this._roles = rolesRes.data || [];
      this._permissions = permsCatalogRes.data || [];
      this._users = profilesRes.data || [];
      this._members = membersRes.data || [];

      // Build role permissions map: { roleId: Set(['module.action', ...]) }
      this._rolePermissions = {};
      (permsRes.data || []).forEach(rp => {
        if (!rp.granted || !rp.permissions) return;
        if (!this._rolePermissions[rp.role_id]) this._rolePermissions[rp.role_id] = new Set();
        this._rolePermissions[rp.role_id].add(`${rp.permissions.module}.${rp.permissions.action}`);
      });

      // Fallback: se nao tem permissions normalizados, usar VCEDX
      if (permsRes.data?.length === 0 || !permsRes.data?.some(rp => rp.permission_id)) {
        const { data: legacyPerms } = await client.from('role_permissions').select('*');
        (legacyPerms || []).forEach(rp => {
          if (!this._rolePermissions[rp.role_id]) this._rolePermissions[rp.role_id] = new Set();
          if (rp.can_view) this._rolePermissions[rp.role_id].add(`${rp.module}.view`);
          if (rp.can_create) this._rolePermissions[rp.role_id].add(`${rp.module}.create`);
          if (rp.can_edit) this._rolePermissions[rp.role_id].add(`${rp.module}.edit`);
          if (rp.can_delete) this._rolePermissions[rp.role_id].add(`${rp.module}.delete`);
          if (rp.can_export) this._rolePermissions[rp.role_id].add(`${rp.module}.export`);
        });
      }

      // Enriquecer usuarios com role_id
      for (const u of this._users) {
        const mem = this._members.find(m => m.user_id === u.id);
        if (mem) u._role_id = mem.role_id;
      }
      for (const t of this._tenants) {
        t._memberCount = this._members.filter(m => m.tenant_id === t.id).length;
      }

      this._loading = false;
      this._rerender();

      // Carregar audit logs se na tab auditoria
      if (this._tab === 'auditoria' && typeof TBO_ADMIN_AUDIT_TAB !== 'undefined') {
        await TBO_ADMIN_AUDIT_TAB.loadLogs();
      }
    } catch (e) {
      console.warn('[Admin Portal] Erro ao carregar dados:', e.message);
      this._loading = false;
    }
  },

  // ── Rerender ─────────────────────────────────────────────────────────────

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.escapeHtml(String(str || ''));
    if (typeof _escapeHtml === 'function') return _escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  },

  // ── CSS (compartilhado entre tabs) ────────────────────────────────────────
  _getStyles() {
    return `
      .ap-module { max-width: 1200px; }

      .ap-tabs {
        display: flex;
        gap: 2px;
        margin-bottom: 20px;
        border-bottom: 2px solid var(--border-default);
        overflow-x: auto;
      }
      .ap-tab-btn {
        display: flex; align-items: center; gap: 6px;
        padding: 10px 16px;
        border: none; background: none;
        font-size: 0.82rem; font-weight: 500;
        color: var(--text-secondary);
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        transition: all 0.15s;
        white-space: nowrap;
      }
      .ap-tab-btn:hover { color: var(--text-primary); background: var(--bg-secondary); }
      .ap-tab-btn.active { color: var(--brand-primary); border-bottom-color: var(--brand-primary); font-weight: 600; }

      .ap-table {
        width: 100%; border-collapse: collapse; font-size: 0.82rem;
      }
      .ap-table thead tr { border-bottom: 2px solid var(--border-default); }
      .ap-table th { text-align: left; padding: 8px; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.03em; color: var(--text-muted); font-weight: 600; }
      .ap-table tbody tr { border-bottom: 1px solid var(--border-subtle); transition: background 0.1s; }
      .ap-table tbody tr:hover { background: var(--bg-secondary); }
      .ap-table td { padding: 8px; }

      .ap-role-select {
        font-size: 0.75rem; padding: 4px 8px;
        border-radius: var(--radius-sm);
        border: 1px solid var(--border-default);
        background: var(--bg-primary);
        cursor: pointer;
      }

      .ap-status-badge {
        font-size: 0.68rem; padding: 2px 8px; border-radius: 999px; font-weight: 600;
      }
      .ap-status-badge.active { background: #22c55e18; color: #22c55e; }
      .ap-status-badge.inactive { background: #ef444418; color: #ef4444; }

      /* Roles Grid */
      .ap-roles-grid {
        display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;
      }
      .ap-role-card {
        border: 1px solid var(--border-default); border-radius: var(--radius-md);
        background: var(--bg-primary); overflow: hidden; transition: box-shadow 0.15s;
      }
      .ap-role-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .ap-role-card-header { display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; border-bottom: 1px solid var(--border-subtle); }
      .ap-role-card-body { padding: 14px 16px; }
      .ap-role-card-footer { display: flex; gap: 4px; padding: 8px 16px; border-top: 1px solid var(--border-subtle); background: var(--bg-secondary); }
      .ap-color-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
      .ap-badge-system { font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; background: var(--bg-tertiary); color: var(--text-muted); font-weight: 600; }
      .ap-badge-custom { font-size: 0.62rem; padding: 2px 6px; border-radius: 4px; background: #8b5cf618; color: #8b5cf6; font-weight: 600; }

      /* Permission Matrix */
      .ap-perm-matrix {
        width: 100%; border-collapse: collapse; font-size: 0.72rem;
      }
      .ap-perm-matrix thead tr { border-bottom: 2px solid var(--border-default); }
      .ap-perm-matrix th {
        padding: 6px 4px; text-align: center; font-size: 0.65rem;
        font-weight: 600; color: var(--text-muted);
      }
      .ap-perm-sticky-col {
        position: sticky; left: 0; background: var(--bg-primary);
        text-align: left; padding: 6px 8px; min-width: 180px; z-index: 2;
      }
      .ap-perm-role-col { min-width: 75px; }
      .ap-perm-cell { text-align: center; padding: 4px; }
      .ap-perm-cell.pending { background: #f59e0b10; }
      .ap-perm-checkbox {
        width: 16px; height: 16px; cursor: pointer;
        accent-color: var(--brand-primary);
      }
      .ap-perm-group-header td {
        font-weight: 700; font-size: 0.78rem; padding: 10px 8px;
        background: var(--bg-secondary); border-bottom: 1px solid var(--border-default);
      }

      /* Filter Bar */
      .ap-filter-bar {
        display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; align-items: center;
      }
      .ap-filter-input {
        font-size: 0.75rem; padding: 6px 8px;
        border: 1px solid var(--border-default); border-radius: var(--radius-sm);
        background: var(--bg-primary); color: var(--text-primary);
      }

      /* Pagination */
      .ap-pagination {
        display: flex; justify-content: center; align-items: center; gap: 16px;
        padding: 16px 0; margin-top: 8px;
      }

      @media (max-width: 768px) {
        .ap-roles-grid { grid-template-columns: 1fr; }
        .ap-perm-sticky-col { position: relative; }
        .ap-filter-bar { flex-direction: column; }
      }
    `;
  }
};
