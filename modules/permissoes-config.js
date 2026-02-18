// TBO OS — Module: Permissoes Config (Role Management)
// View/edit user roles, BU, coordinator status (founder only)
const TBO_PERMISSOES_CONFIG = {

  render() {
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
    const isFounder = currentUser?.role === 'founder';
    const users = this._getUserList();
    const roles = typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS._roles : {};

    return `
      <div class="permissoes-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Total Usuarios</div>
            <div class="kpi-value">${users.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Founders</div>
            <div class="kpi-value">${users.filter(u => u.role === 'founder').length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Project Owners</div>
            <div class="kpi-value">${users.filter(u => u.role === 'project_owner').length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Artistas</div>
            <div class="kpi-value">${users.filter(u => u.role === 'artist').length}</div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tab-bar" style="margin-bottom:20px;">
          <button class="tab active" data-tab="perm-users">Usuarios</button>
          <button class="tab" data-tab="perm-roles">Roles & Modulos</button>
        </div>

        <!-- Tab: Users -->
        <div class="tab-content active" id="tab-perm-users">
          <div class="card">
            <h3 style="margin:0 0 16px;font-size:0.95rem;">Equipe TBO — Roles & BU</h3>
            ${!isFounder ? '<p style="font-size:0.78rem;color:var(--text-muted);margin:0 0 12px;">Somente Founders podem editar roles.</p>' : ''}
            <div style="overflow-x:auto;">
              <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
                <thead>
                  <tr style="border-bottom:2px solid var(--border-default);">
                    <th style="text-align:left;padding:8px;">Usuario</th>
                    <th style="text-align:left;padding:8px;">Role</th>
                    <th style="text-align:left;padding:8px;">BU</th>
                    <th style="text-align:center;padding:8px;">Coordenador</th>
                    ${isFounder ? '<th style="text-align:center;padding:8px;">Acoes</th>' : ''}
                  </tr>
                </thead>
                <tbody>
                  ${users.map(u => {
                    const roleInfo = roles[u.role] || {};
                    const roleBadge = `<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:600;background:${roleInfo.color || '#666'}22;color:${roleInfo.color || '#666'};">${roleInfo.label || u.role}</span>`;
                    return `
                      <tr style="border-bottom:1px solid var(--border-subtle);" data-user="${u.id}">
                        <td style="padding:8px;font-weight:500;">${this._esc(u.name)}</td>
                        <td style="padding:8px;">${roleBadge}</td>
                        <td style="padding:8px;color:var(--text-secondary);">${u.bu || '—'}</td>
                        <td style="padding:8px;text-align:center;">${u.isCoordinator ? '<span style="color:var(--color-success);">Sim</span>' : '<span style="color:var(--text-muted);">Nao</span>'}</td>
                        ${isFounder ? `<td style="padding:8px;text-align:center;">
                          <button class="btn btn-sm btn-ghost perm-edit-btn" data-user="${u.id}">Editar</button>
                        </td>` : ''}
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab: Roles & Modules -->
        <div class="tab-content" id="tab-perm-roles">
          <div class="card">
            <h3 style="margin:0 0 16px;font-size:0.95rem;">Permissoes por Role</h3>
            ${Object.entries(roles).map(([key, role]) => {
              const mods = role.modules || [];
              return `
                <div style="margin-bottom:20px;padding:14px;background:var(--bg-tertiary);border-radius:var(--radius-md);">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                    <span style="width:10px;height:10px;border-radius:50%;background:${role.color};"></span>
                    <strong style="font-size:0.88rem;">${role.label}</strong>
                    <span style="font-size:0.72rem;color:var(--text-muted);">(${key})</span>
                  </div>
                  <div style="display:flex;gap:6px;flex-wrap:wrap;">
                    ${mods.map(m => `<span class="badge" style="font-size:0.7rem;">${m}</span>`).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Edit modal -->
        <div id="permEditModal" style="display:none;">
          <div class="ux-confirm-overlay visible" id="permEditOverlay">
            <div class="ux-confirm-modal" style="max-width:400px;width:90%;">
              <div class="ux-confirm-title">Editar Usuario</div>
              <input type="hidden" id="permEditUserId">
              <div style="display:flex;flex-direction:column;gap:12px;margin:16px 0;">
                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select class="form-input" id="permEditRole">
                    ${Object.entries(roles).map(([k, r]) => `<option value="${k}">${r.label}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">BU</label>
                  <select class="form-input" id="permEditBU">
                    <option value="">Nenhuma</option>
                    <option value="Branding">Branding</option>
                    <option value="Digital 3D">Digital 3D</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Vendas">Vendas</option>
                  </select>
                </div>
                <div class="form-group">
                  <label style="display:flex;align-items:center;gap:8px;font-size:0.82rem;cursor:pointer;">
                    <input type="checkbox" id="permEditCoord">
                    Coordenador
                  </label>
                </div>
              </div>
              <div class="ux-confirm-actions">
                <button class="btn btn-secondary" id="permEditCancel">Cancelar</button>
                <button class="btn btn-primary" id="permEditSave">Salvar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init() {
    // Tab switching
    document.querySelectorAll('.permissoes-module .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.permissoes-module .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.permissoes-module .tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById('tab-' + tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    // Edit buttons
    document.querySelectorAll('.perm-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => this._openEdit(btn.dataset.user));
    });

    // Modal
    document.getElementById('permEditCancel')?.addEventListener('click', () => this._closeEdit());
    document.getElementById('permEditSave')?.addEventListener('click', () => this._saveEdit());
    document.getElementById('permEditOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'permEditOverlay') this._closeEdit();
    });
  },

  _openEdit(userId) {
    if (typeof TBO_PERMISSIONS === 'undefined') return;
    const userInfo = TBO_PERMISSIONS._userRoles[userId];
    if (!userInfo) return;

    document.getElementById('permEditUserId').value = userId;
    document.getElementById('permEditRole').value = userInfo.role;
    document.getElementById('permEditBU').value = userInfo.bu || '';
    document.getElementById('permEditCoord').checked = userInfo.isCoordinator;

    document.getElementById('permEditModal').style.display = 'block';
  },

  _closeEdit() {
    document.getElementById('permEditModal').style.display = 'none';
  },

  _saveEdit() {
    const userId = document.getElementById('permEditUserId')?.value;
    if (!userId || typeof TBO_PERMISSIONS === 'undefined') return;

    const newRole = document.getElementById('permEditRole')?.value;
    const newBU = document.getElementById('permEditBU')?.value || null;
    const newCoord = document.getElementById('permEditCoord')?.checked || false;

    TBO_PERMISSIONS._userRoles[userId] = {
      role: newRole,
      bu: newBU,
      isCoordinator: newCoord
    };

    // Also update Supabase profile if available
    this._updateSupabaseProfile(userId, newRole, newBU, newCoord);

    // Audit log
    if (typeof TBO_ERP !== 'undefined') {
      TBO_ERP.addAuditLog({
        entityType: 'user', entityId: userId,
        action: 'role_updated',
        userId: TBO_AUTH?.getCurrentUser?.()?.id,
        reason: `Role: ${newRole}, BU: ${newBU || 'none'}, Coord: ${newCoord}`
      });
    }

    this._closeEdit();
    if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Salvo', `Permissoes de ${userId} atualizadas.`);

    // Re-render
    const container = document.getElementById('moduleContainer');
    if (container) { container.innerHTML = this.render(); this.init(); }
  },

  async _updateSupabaseProfile(userId, role, bu, isCoordinator) {
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (!client || !TBO_SUPABASE.isOnline()) return;

      await client.from('profiles')
        .update({ role, bu, is_coordinator: isCoordinator })
        .eq('username', userId);
    } catch (e) {
      console.warn('[Permissoes] Supabase profile update failed:', e);
    }
  },

  _getUserList() {
    if (typeof TBO_PERMISSIONS === 'undefined') return [];
    return Object.entries(TBO_PERMISSIONS._userRoles).map(([id, info]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      role: info.role,
      bu: info.bu,
      isCoordinator: info.isCoordinator
    }));
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
