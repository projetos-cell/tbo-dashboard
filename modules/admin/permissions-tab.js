// ============================================================================
// TBO OS — Admin Portal: Tab Permissoes
// Matrix interativa de permissoes por role, agrupadas por modulo
// Dados carregados do Supabase, zero hardcode
// ============================================================================

const TBO_ADMIN_PERMISSIONS_TAB = {

  _roles: [],
  _permissions: [],      // catalogo do Supabase
  _rolePermissions: {},  // { roleId: Set(['module.action', ...]) }
  _pendingChanges: {},   // { roleId: { 'module.action': granted } }
  _portal: null,

  // Agrupamento de modulos para a matrix — carregado do catalogo
  _moduleGroups: [
    { label: 'Usuarios & Seguranca', modules: ['users', 'roles', 'security'] },
    { label: 'Projetos & Tarefas', modules: ['projects', 'tasks', 'comments', 'files'] },
    { label: 'Comercial & CRM', modules: ['crm', 'vendors', 'contracts'] },
    { label: 'Financeiro', modules: ['finance'] },
    { label: 'Inteligencia & Conteudo', modules: ['insights', 'automations'] },
    { label: 'Comunicacao', modules: ['messages'] }
  ],

  setup(portal) {
    this._portal = portal;
    this._roles = portal._roles || [];
    this._permissions = portal._permissions || [];
    this._rolePermissions = portal._rolePermissions || {};
    // Preservar pending changes entre rerenders
    if (!Object.keys(this._pendingChanges).length) {
      this._pendingChanges = {};
    }
  },

  render() {
    const roles = this._roles.slice().sort((a, b) => (a.sort_order || 100) - (b.sort_order || 100));
    const hasPending = Object.keys(this._pendingChanges).length > 0;

    return `
      <div class="card" style="overflow-x:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;font-size:0.92rem;">Matrix de Permissoes</h3>
            <p style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Marque as permissoes por papel. Alteracoes sao salvas ao clicar "Salvar".</p>
          </div>
          <div style="display:flex;gap:8px;">
            ${hasPending ? '<span class="tag gold">Alteracoes pendentes</span>' : ''}
            <button class="btn btn-primary btn-sm" id="apSavePerms" ${hasPending ? '' : 'disabled'}>
              <i data-lucide="save" style="width:14px;height:14px;"></i> Salvar Alteracoes
            </button>
          </div>
        </div>

        <table class="ap-perm-matrix">
          <thead>
            <tr>
              <th class="ap-perm-sticky-col">Permissao</th>
              ${roles.map(r => `
                <th class="ap-perm-role-col">
                  <div class="ap-color-dot" style="background:${r.color || '#94a3b8'};width:8px;height:8px;margin:0 auto 4px;"></div>
                  <div>${this._esc(r.label || r.name)}</div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${this._moduleGroups.map(group => {
              const groupPerms = this._permissions.filter(p => group.modules.includes(p.module));
              if (groupPerms.length === 0) return '';

              return `
                <tr class="ap-perm-group-header">
                  <td colspan="${roles.length + 1}" style="font-weight:700;font-size:0.78rem;padding:10px 8px;background:var(--bg-secondary);border-bottom:1px solid var(--border-default);">
                    <i data-lucide="chevron-down" style="width:12px;height:12px;"></i> ${group.label}
                  </td>
                </tr>
                ${groupPerms.map(perm => `
                  <tr>
                    <td class="ap-perm-sticky-col">
                      <div style="font-size:0.78rem;font-weight:500;">${this._esc(perm.label)}</div>
                      <div style="font-size:0.65rem;color:var(--text-muted);">${perm.module}.${perm.action}</div>
                    </td>
                    ${roles.map(r => {
                      const key = `${perm.module}.${perm.action}`;
                      const isGranted = this._isPermGranted(r.id, key);
                      const isPending = this._pendingChanges[r.id] && key in this._pendingChanges[r.id];
                      return `
                        <td class="ap-perm-cell ${isPending ? 'pending' : ''}">
                          <input type="checkbox"
                            class="ap-perm-checkbox"
                            data-role-id="${r.id}"
                            data-perm-key="${key}"
                            data-perm-id="${perm.id}"
                            ${isGranted ? 'checked' : ''}
                          >
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  bind() {
    document.querySelectorAll('.ap-perm-checkbox').forEach(cb => {
      cb.addEventListener('change', () => {
        const roleId = cb.dataset.roleId;
        const permKey = cb.dataset.permKey;
        if (!this._pendingChanges[roleId]) this._pendingChanges[roleId] = {};
        this._pendingChanges[roleId][permKey] = cb.checked;
        cb.closest('.ap-perm-cell')?.classList.add('pending');
        const saveBtn = document.getElementById('apSavePerms');
        if (saveBtn) saveBtn.disabled = false;
      });
    });

    document.getElementById('apSavePerms')?.addEventListener('click', () => {
      this._savePermissionChanges();
    });
  },

  // ── Salvar alteracoes em batch ────────────────────────────────────────────

  async _savePermissionChanges() {
    const client = TBO_SUPABASE?.getClient();
    if (!client) return;

    try {
      const operations = [];

      for (const [roleId, changes] of Object.entries(this._pendingChanges)) {
        for (const [permKey, granted] of Object.entries(changes)) {
          const [module, action] = permKey.split('.');
          const perm = this._permissions.find(p => p.module === module && p.action === action);
          if (!perm) continue;

          if (granted) {
            operations.push(
              client.from('role_permissions').upsert({
                role_id: roleId,
                module: module,
                permission_id: perm.id,
                granted: true,
                can_view: action === 'view' || action === 'view_audit',
                can_create: action === 'create' || action === 'upload' || action === 'send',
                can_edit: action === 'edit' || action === 'manage' || action === 'manage_settings',
                can_delete: action === 'delete',
                can_export: action === 'export'
              }, { onConflict: 'role_id,module' })
            );
          } else {
            operations.push(
              client.from('role_permissions')
                .delete()
                .eq('role_id', roleId)
                .eq('permission_id', perm.id)
            );
          }
        }
      }

      await Promise.all(operations);

      this._pendingChanges = {};
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Permissoes salvas', `${operations.length} alteracoes aplicadas.`);
      await this._portal?._loadData();
    } catch (e) {
      console.error('[Admin Permissions] Erro ao salvar:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message || 'Falha ao salvar permissoes.');
    }
  },

  _isPermGranted(roleId, permKey) {
    if (this._pendingChanges[roleId] && permKey in this._pendingChanges[roleId]) {
      return this._pendingChanges[roleId][permKey];
    }
    return this._rolePermissions[roleId]?.has(permKey) || false;
  },

  _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
