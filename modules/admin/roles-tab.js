// ============================================================================
// TBO OS — Admin Portal: Tab Papeis (Roles)
// Gestao de roles do sistema: listagem, criar, editar, clonar, excluir
// Dados carregados do Supabase, zero hardcode
// ============================================================================

const TBO_ADMIN_ROLES_TAB = {

  _roles: [],
  _users: [],
  _rolePermissions: {},  // { roleId: Set(['module.action', ...]) }
  _portal: null,

  setup(portal) {
    this._portal = portal;
    this._roles = portal._roles || [];
    this._users = portal._users || [];
    this._rolePermissions = portal._rolePermissions || {};
  },

  render() {
    const roles = this._roles;
    const systemCount = roles.filter(r => r.is_system).length;

    return `
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card"><div class="kpi-label">Total Roles</div><div class="kpi-value">${roles.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Sistema</div><div class="kpi-value">${systemCount}</div></div>
        <div class="kpi-card"><div class="kpi-label">Custom</div><div class="kpi-value">${roles.length - systemCount}</div></div>
        <div class="kpi-card"><div class="kpi-label">Permissoes</div><div class="kpi-value">${this._portal?._permissions?.length || 0}</div></div>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3 style="margin:0;font-size:0.92rem;">Papeis do Sistema</h3>
        <button class="btn btn-primary btn-sm" id="apAddRole"><i data-lucide="plus" style="width:14px;height:14px;"></i> Novo Papel</button>
      </div>

      <div class="ap-roles-grid">
        ${roles.map(r => {
          const permCount = this._rolePermissions[r.id] ? this._rolePermissions[r.id].size : 0;
          const userCount = this._users.filter(u => u._role_id === r.id).length;
          return `
            <div class="ap-role-card" data-role-id="${r.id}">
              <div class="ap-role-card-header">
                <div style="display:flex;align-items:center;gap:8px;">
                  <div class="ap-color-dot" style="background:${r.color || '#94a3b8'};"></div>
                  <div>
                    <div style="font-weight:600;font-size:0.85rem;">${this._esc(r.label || r.name)}</div>
                    <div style="font-size:0.68rem;color:var(--text-muted);">${this._esc(r.slug)}</div>
                  </div>
                </div>
                ${r.is_system ? '<span class="ap-badge-system">Sistema</span>' : '<span class="ap-badge-custom">Custom</span>'}
              </div>
              <div class="ap-role-card-body">
                <p style="font-size:0.72rem;color:var(--text-secondary);margin:0 0 12px;">${this._esc(r.description || 'Sem descricao')}</p>
                <div style="display:flex;gap:16px;font-size:0.72rem;">
                  <span><strong>${permCount}</strong> permissoes</span>
                  <span><strong>${userCount}</strong> usuarios</span>
                </div>
              </div>
              <div class="ap-role-card-footer">
                <button class="btn btn-ghost btn-sm ap-edit-role" data-role-id="${r.id}" title="Editar"><i data-lucide="pencil" style="width:12px;height:12px;"></i></button>
                <button class="btn btn-ghost btn-sm ap-clone-role" data-role-id="${r.id}" title="Clonar"><i data-lucide="copy" style="width:12px;height:12px;"></i></button>
                ${!r.is_system ? `<button class="btn btn-ghost btn-sm ap-delete-role" data-role-id="${r.id}" title="Excluir" style="color:var(--color-danger);"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  bind() {
    document.getElementById('apAddRole')?.addEventListener('click', () => {
      this._portal?._openModal('addRole', { name: '', slug: '', label: '', color: '#94a3b8', description: '' });
    });

    document.querySelectorAll('.ap-edit-role').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const role = this._roles.find(r => r.id === btn.dataset.roleId);
        if (role) this._portal?._openModal('editRole', { ...role });
      });
    });

    document.querySelectorAll('.ap-clone-role').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await this._cloneRole(btn.dataset.roleId);
      });
    });

    document.querySelectorAll('.ap-delete-role').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const role = this._roles.find(r => r.id === btn.dataset.roleId);
        if (role) {
          role._userCount = this._users.filter(u => u._role_id === role.id).length;
          this._portal?._openModal('deleteConfirm', { ...role });
        }
      });
    });
  },

  // ── Modais: render body + handler ─────────────────────────────────────────

  renderRoleModal(data, isEdit) {
    return `
      <div style="display:grid;gap:12px;">
        <div>
          <label class="form-label">Nome</label>
          <input type="text" class="form-input" id="apModalRoleName" value="${this._esc(data.name || '')}" placeholder="Ex: Creative Director">
        </div>
        <div>
          <label class="form-label">Slug (identificador)</label>
          <input type="text" class="form-input" id="apModalRoleSlug" value="${this._esc(data.slug || '')}" placeholder="Ex: creative-dir" ${data.is_system ? 'disabled' : ''}>
        </div>
        <div>
          <label class="form-label">Label (PT-BR)</label>
          <input type="text" class="form-input" id="apModalRoleLabel" value="${this._esc(data.label || '')}" placeholder="Ex: Diretor Criativo">
        </div>
        <div style="display:flex;gap:12px;">
          <div style="flex:1;">
            <label class="form-label">Cor</label>
            <input type="color" id="apModalRoleColor" value="${data.color || '#94a3b8'}" style="width:100%;height:36px;border:1px solid var(--border-default);border-radius:var(--radius-sm);cursor:pointer;">
          </div>
          <div style="flex:2;">
            <label class="form-label">Descricao</label>
            <input type="text" class="form-input" id="apModalRoleDesc" value="${this._esc(data.description || '')}" placeholder="Descricao do papel">
          </div>
        </div>
      </div>
    `;
  },

  renderDeleteConfirmModal(data) {
    return `
      <p style="font-size:0.85rem;color:var(--text-secondary);">
        Tem certeza que deseja excluir o papel <strong>"${this._esc(data.name || '')}"</strong>?
        ${data._userCount > 0 ? `<br><br><span style="color:var(--color-danger);">Atencao: ${data._userCount} usuario(s) atribuido(s) a este papel serao movidos para "Viewer".</span>` : ''}
      </p>
    `;
  },

  async handleSaveRole(data) {
    const client = TBO_SUPABASE?.getClient();
    if (!client) return;
    const tenantId = TBO_SUPABASE.getCurrentTenantId();

    const name = document.getElementById('apModalRoleName')?.value?.trim();
    const slug = document.getElementById('apModalRoleSlug')?.value?.trim();
    const label = document.getElementById('apModalRoleLabel')?.value?.trim();
    const color = document.getElementById('apModalRoleColor')?.value;
    const description = document.getElementById('apModalRoleDesc')?.value?.trim();

    if (!name || !slug) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Campos obrigatorios', 'Nome e Slug sao obrigatorios.');
      return;
    }

    try {
      if (data.id) {
        // Update
        const { error } = await client.from('roles').update({ name, slug, label, color, description }).eq('id', data.id);
        if (error) throw error;
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Papel atualizado', `"${name}" salvo com sucesso.`);
      } else {
        // Insert
        const { error } = await client.from('roles').insert({ tenant_id: tenantId, name, slug, label, color, description, is_system: false });
        if (error) throw error;
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Papel criado', `"${name}" criado com sucesso.`);
      }

      this._portal?._closeModal();
      await this._portal?._loadData();
    } catch (e) {
      console.error('[Admin Roles] Erro ao salvar:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message || 'Falha ao salvar papel.');
    }
  },

  async handleDeleteRole(data) {
    const client = TBO_SUPABASE?.getClient();
    if (!client || !data.id) return;

    try {
      const tenantId = TBO_SUPABASE.getCurrentTenantId();
      const viewerRole = this._roles.find(r => r.slug === 'viewer');
      if (viewerRole) {
        await client.from('tenant_members').update({ role_id: viewerRole.id }).eq('role_id', data.id).eq('tenant_id', tenantId);
      }

      const { error } = await client.from('roles').delete().eq('id', data.id);
      if (error) throw error;

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Papel excluido', `"${data.name}" removido.`);
      this._portal?._closeModal();
      await this._portal?._loadData();
    } catch (e) {
      console.error('[Admin Roles] Erro ao excluir:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message || 'Falha ao excluir papel.');
    }
  },

  async _cloneRole(roleId) {
    const client = TBO_SUPABASE?.getClient();
    if (!client) return;
    const tenantId = TBO_SUPABASE.getCurrentTenantId();
    const original = this._roles.find(r => r.id === roleId);
    if (!original) return;

    try {
      const { data: newRole, error } = await client
        .from('roles')
        .insert({
          tenant_id: tenantId,
          name: `${original.name} (Copia)`,
          slug: `${original.slug}-copy-${Date.now().toString(36)}`,
          label: `${original.label || original.name} (Copia)`,
          color: original.color,
          description: original.description,
          is_system: false,
          sort_order: (original.sort_order || 100) + 1
        })
        .select()
        .single();

      if (error) throw error;

      // Copiar permissoes
      if (newRole) {
        const { data: rolePerms } = await client.from('role_permissions').select('*').eq('role_id', roleId);
        if (rolePerms?.length) {
          const newPerms = rolePerms.map(rp => ({
            role_id: newRole.id,
            module: rp.module,
            permission_id: rp.permission_id,
            granted: rp.granted,
            can_view: rp.can_view,
            can_create: rp.can_create,
            can_edit: rp.can_edit,
            can_delete: rp.can_delete,
            can_export: rp.can_export
          }));
          await client.from('role_permissions').insert(newPerms);
        }
      }

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Papel clonado', `"${original.name}" clonado com sucesso.`);
      await this._portal?._loadData();
    } catch (e) {
      console.error('[Admin Roles] Erro ao clonar:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message || 'Falha ao clonar papel.');
    }
  },

  _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
