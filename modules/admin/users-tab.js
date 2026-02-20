// ============================================================================
// TBO OS — Admin Portal: Tab Usuarios
// Gestao de membros do workspace: listagem, role assignment, convite, status
// Dados carregados do Supabase, zero hardcode
// ============================================================================

const TBO_ADMIN_USERS_TAB = {

  _users: [],
  _roles: [],
  _members: [],  // tenant_members join
  _portal: null, // referencia ao admin-portal pai

  // Recebe referencia ao portal pai e dados compartilhados
  setup(portal) {
    this._portal = portal;
    this._users = portal._users || [];
    this._roles = portal._roles || [];
    this._members = portal._members || [];
  },

  render() {
    const users = this._users;
    const activeCount = users.filter(u => u.is_active !== false).length;

    return `
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card"><div class="kpi-label">Total</div><div class="kpi-value">${users.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Ativos</div><div class="kpi-value" style="color:var(--color-success);">${activeCount}</div></div>
        <div class="kpi-card"><div class="kpi-label">Inativos</div><div class="kpi-value" style="color:var(--color-danger);">${users.length - activeCount}</div></div>
        <div class="kpi-card"><div class="kpi-label">Roles</div><div class="kpi-value">${this._roles.length}</div></div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:0.92rem;">Membros do Workspace</h3>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" id="apReloadUsers"><i data-lucide="refresh-cw" style="width:14px;height:14px;"></i> Recarregar</button>
            <button class="btn btn-primary btn-sm" id="apInviteUser"><i data-lucide="user-plus" style="width:14px;height:14px;"></i> Convidar</button>
          </div>
        </div>
        <table class="ap-table">
          <thead>
            <tr>
              <th style="width:250px;">Membro</th>
              <th>Email</th>
              <th style="width:160px;">Role</th>
              <th style="width:100px;">BU</th>
              <th style="width:80px;text-align:center;">Status</th>
              <th style="width:100px;">Ultimo Login</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const role = this._roles.find(r => r.id === u._role_id);
              const roleColor = role?.color || '#94a3b8';
              return `
                <tr>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px;">
                      ${u.avatar_url
                        ? `<img src="${this._esc(u.avatar_url)}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                        : ''
                      }
                      <div style="width:28px;height:28px;border-radius:50%;background:${roleColor};display:${u.avatar_url ? 'none' : 'flex'};align-items:center;justify-content:center;font-size:0.65rem;font-weight:700;color:#fff;">${(u.full_name || u.email || '?')[0].toUpperCase()}</div>
                      <div>
                        <div style="font-weight:600;font-size:0.82rem;">${this._esc(u.full_name || 'Sem nome')}</div>
                        <div style="font-size:0.68rem;color:var(--text-muted);">${this._esc(u.username || '')}</div>
                      </div>
                    </div>
                  </td>
                  <td style="font-size:0.78rem;color:var(--text-secondary);">${this._esc(u.email || '—')}</td>
                  <td>
                    <select class="ap-role-select" data-user-id="${u.id}" style="border-left:3px solid ${roleColor};">
                      ${this._roles.map(r => `<option value="${r.id}" ${u._role_id === r.id ? 'selected' : ''}>${this._esc(r.label || r.name)}</option>`).join('')}
                    </select>
                  </td>
                  <td style="font-size:0.72rem;">${this._esc(u.bu || '—')}</td>
                  <td style="text-align:center;">
                    <span class="ap-status-badge ${u.is_active !== false ? 'active' : 'inactive'}">${u.is_active !== false ? 'Ativo' : 'Inativo'}</span>
                  </td>
                  <td style="font-size:0.68rem;color:var(--text-muted);">${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}</td>
                </tr>
              `;
            }).join('')}
            ${!users.length ? '<tr><td colspan="6" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum usuario encontrado</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  },

  bind() {
    document.getElementById('apInviteUser')?.addEventListener('click', () => {
      this._portal?._openModal('inviteUser', {});
    });

    document.getElementById('apReloadUsers')?.addEventListener('click', () => {
      this._portal?._loadData();
    });

    // Role selects (inline change)
    document.querySelectorAll('.ap-role-select').forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const newRoleId = sel.value;
        await this._updateUserRole(userId, newRoleId);
      });
    });
  },

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async _updateUserRole(userId, newRoleId) {
    const client = TBO_SUPABASE?.getClient();
    if (!client) return;
    const tenantId = TBO_SUPABASE.getCurrentTenantId();

    try {
      const { error } = await client
        .from('tenant_members')
        .update({ role_id: newRoleId })
        .eq('user_id', userId)
        .eq('tenant_id', tenantId);

      if (error) throw error;

      // Atualizar localmente
      const user = this._users.find(u => u.id === userId);
      if (user) user._role_id = newRoleId;

      const role = this._roles.find(r => r.id === newRoleId);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Role alterado', `Atribuido "${role?.label || role?.name}" ao usuario.`);
    } catch (e) {
      console.error('[Admin Users] Erro ao atualizar role:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message || 'Falha ao atualizar role.');
    }
  },

  // Modal de convite — delegado ao portal
  renderInviteModal() {
    return `
      <div style="display:grid;gap:12px;">
        <div>
          <label class="form-label">Email</label>
          <input type="email" class="form-input" id="apModalUserEmail" placeholder="email@agenciatbo.com.br">
        </div>
        <div>
          <label class="form-label">Role</label>
          <select class="form-input" id="apModalUserRole">
            ${this._roles.map(r => `<option value="${r.id}">${this._esc(r.label || r.name)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="form-label">BU (Business Unit)</label>
          <select class="form-input" id="apModalUserBU">
            <option value="">Nenhuma</option>
            <option value="Branding">Branding</option>
            <option value="Digital 3D">Digital 3D</option>
            <option value="Marketing">Marketing</option>
            <option value="Vendas">Vendas</option>
          </select>
        </div>
      </div>
    `;
  },

  async handleInvite() {
    const email = document.getElementById('apModalUserEmail')?.value?.trim();
    if (!email) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Email obrigatorio', 'Informe o email do usuario.');
      return;
    }
    // Magic Link via Supabase requer server-side — mostrar instrucao
    if (typeof TBO_TOAST !== 'undefined') {
      TBO_TOAST.info('Convite', `Para convidar ${email}, envie o link de login do TBO OS. O usuario sera provisionado automaticamente ao fazer login com @agenciatbo.com.br via Google.`);
    }
    this._portal?._closeModal();
  },

  _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
