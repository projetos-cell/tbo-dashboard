// TBO OS — Module: Permissoes Config (Role Management)
// v2.2.2: Reescrito para carregar/salvar diretamente do Supabase
// Founders/admins gerenciam roles, BU, coordenador de todos os membros
const TBO_PERMISSOES_CONFIG = {

  _users: [],
  _loading: true,
  _supabaseRoles: [], // roles da tabela roles do Supabase

  render() {
    const currentUser = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUserSync() : null;
    const isFounder = currentUser?.role === 'founder';
    const roles = typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS._roles : {};

    if (this._loading) {
      return `
        <div class="permissoes-module">
          <div style="padding:40px;text-align:center;color:var(--text-muted);">
            <i data-lucide="loader" style="width:24px;height:24px;animation:spin 1s linear infinite;"></i>
            <p style="margin-top:12px;font-size:0.85rem;">Carregando equipe do Supabase...</p>
          </div>
        </div>
      `;
    }

    const users = this._users;
    const founders = users.filter(u => u.role === 'founder');
    const pos = users.filter(u => u.role === 'project_owner');
    const artists = users.filter(u => u.role === 'artist');
    const comerciais = users.filter(u => u.role === 'comercial');
    const finance = users.filter(u => u.role === 'finance');

    return `
      <div class="permissoes-module">
        <!-- KPIs -->
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card">
            <div class="kpi-label">Total Membros</div>
            <div class="kpi-value">${users.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Founders</div>
            <div class="kpi-value">${founders.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Project Owners</div>
            <div class="kpi-value">${pos.length}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Artistas</div>
            <div class="kpi-value">${artists.length}</div>
          </div>
        </div>

        <!-- Info bar -->
        ${!isFounder ? '<div class="card" style="margin-bottom:16px;padding:12px 16px;background:var(--bg-tertiary);border-left:3px solid var(--text-muted);"><p style="margin:0;font-size:0.78rem;color:var(--text-secondary);"><i data-lucide="lock" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Somente Founders podem editar roles.</p></div>' : ''}

        <!-- Users Table -->
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="margin:0;font-size:0.95rem;">Equipe TBO</h3>
            <span style="font-size:0.72rem;color:var(--text-muted);">Dados do Supabase</span>
          </div>
          <div style="overflow-x:auto;">
            <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
              <thead>
                <tr style="border-bottom:2px solid var(--border-default);">
                  <th style="text-align:left;padding:8px 12px;">Membro</th>
                  <th style="text-align:left;padding:8px;">Role</th>
                  <th style="text-align:left;padding:8px;">BU</th>
                  <th style="text-align:center;padding:8px;">Coord.</th>
                  <th style="text-align:center;padding:8px;">Status</th>
                  ${isFounder ? '<th style="text-align:center;padding:8px;">Acoes</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${users.map(u => {
                  const roleInfo = roles[u.role] || {};
                  const roleBadge = `<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:0.72rem;font-weight:600;background:${roleInfo.color || '#666'}22;color:${roleInfo.color || '#666'};">${roleInfo.label || u.role}</span>`;
                  const initials = this._getInitials(u.name);
                  const isNew = !u.first_login_completed;
                  return `
                    <tr style="border-bottom:1px solid var(--border-subtle);" data-user-id="${u.supabaseId}">
                      <td style="padding:8px 12px;">
                        <div style="display:flex;align-items:center;gap:10px;">
                          ${u.avatarUrl
                            ? `<img src="${this._esc(u.avatarUrl)}" alt="${initials}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="width:32px;height:32px;border-radius:50%;background:${roleInfo.color || '#94a3b8'}22;color:${roleInfo.color || '#94a3b8'};display:none;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;flex-shrink:0;">${initials}</div>`
                            : `<div style="width:32px;height:32px;border-radius:50%;background:${roleInfo.color || '#94a3b8'}22;color:${roleInfo.color || '#94a3b8'};display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:600;flex-shrink:0;">${initials}</div>`
                          }
                          <div>
                            <div style="font-weight:500;">${this._esc(u.name)}</div>
                            <div style="font-size:0.72rem;color:var(--text-muted);">${this._esc(u.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td style="padding:8px;">${roleBadge}</td>
                      <td style="padding:8px;color:var(--text-secondary);">${u.bu || '<span style="color:var(--text-muted);">—</span>'}</td>
                      <td style="padding:8px;text-align:center;">${u.isCoordinator ? '<i data-lucide="check-circle" style="width:16px;height:16px;color:var(--color-success);"></i>' : '<span style="color:var(--text-muted);">—</span>'}</td>
                      <td style="padding:8px;text-align:center;">${isNew ? '<span style="font-size:0.7rem;padding:2px 6px;background:#f59e0b22;color:#f59e0b;border-radius:4px;">Novo</span>' : '<span style="font-size:0.7rem;padding:2px 6px;background:#2ecc7122;color:#2ecc71;border-radius:4px;">Ativo</span>'}</td>
                      ${isFounder ? `<td style="padding:8px;text-align:center;">
                        <button class="btn btn-sm btn-ghost perm-edit-btn" data-sid="${u.supabaseId}" data-username="${this._esc(u.username)}" title="Editar ${this._esc(u.name)}">
                          <i data-lucide="pencil" style="width:14px;height:14px;"></i>
                        </button>
                      </td>` : ''}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Roles Reference -->
        <div class="card" style="margin-top:16px;">
          <h3 style="margin:0 0 12px;font-size:0.88rem;color:var(--text-secondary);">Referencia de Roles & Modulos</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
            ${Object.entries(roles).map(([key, role]) => {
              const mods = role.modules || [];
              return `
                <div style="padding:12px;background:var(--bg-tertiary);border-radius:var(--radius-md);border-left:3px solid ${role.color};">
                  <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                    <span style="width:8px;height:8px;border-radius:50%;background:${role.color};"></span>
                    <strong style="font-size:0.82rem;">${role.label}</strong>
                    <span style="font-size:0.68rem;color:var(--text-muted);">(${mods.length} modulos)</span>
                  </div>
                  <div style="display:flex;gap:4px;flex-wrap:wrap;">
                    ${mods.slice(0, 8).map(m => `<span style="font-size:0.65rem;padding:1px 5px;background:var(--bg-primary);border-radius:3px;color:var(--text-muted);">${m}</span>`).join('')}
                    ${mods.length > 8 ? `<span style="font-size:0.65rem;color:var(--text-muted);">+${mods.length - 8}</span>` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Edit Modal -->
        <div id="permEditModal" style="display:none;">
          <div class="ux-confirm-overlay visible" id="permEditOverlay">
            <div class="ux-confirm-modal" style="max-width:420px;width:90%;">
              <div class="ux-confirm-title" id="permEditTitle">Editar Membro</div>
              <input type="hidden" id="permEditSid">
              <input type="hidden" id="permEditUsername">
              <div style="display:flex;flex-direction:column;gap:14px;margin:16px 0;">
                <div class="form-group">
                  <label class="form-label">Role</label>
                  <select class="form-input" id="permEditRole">
                    ${Object.entries(roles).map(([k, r]) => `<option value="${k}">${r.label} (${k})</option>`).join('')}
                  </select>
                  <small style="color:var(--text-muted);font-size:0.7rem;margin-top:4px;display:block;">Define quais modulos o membro pode acessar</small>
                </div>
                <div class="form-group">
                  <label class="form-label">Business Unit (BU)</label>
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
                    Coordenador (acesso a modulos de admin)
                  </label>
                </div>
              </div>
              <div class="ux-confirm-actions">
                <button class="btn btn-secondary" id="permEditCancel">Cancelar</button>
                <button class="btn btn-primary" id="permEditSave">
                  <i data-lucide="save" style="width:14px;height:14px;margin-right:4px;"></i>
                  Salvar no Supabase
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async init() {
    // Carregar dados do Supabase
    await this._loadUsersFromSupabase();

    // Re-render com dados carregados
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      if (window.lucide) lucide.createIcons();
    }

    // Bind eventos
    this._bindEvents();
  },

  _bindEvents() {
    // Edit buttons
    document.querySelectorAll('.perm-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._openEdit(btn.dataset.sid, btn.dataset.username);
      });
    });

    // Modal controls
    document.getElementById('permEditCancel')?.addEventListener('click', () => this._closeEdit());
    document.getElementById('permEditSave')?.addEventListener('click', () => this._saveEdit());
    document.getElementById('permEditOverlay')?.addEventListener('click', (e) => {
      if (e.target.id === 'permEditOverlay') this._closeEdit();
    });

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this._closeEdit();
    });
  },

  async _loadUsersFromSupabase() {
    this._loading = true;
    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (!client) {
        console.warn('[Permissoes] Supabase nao disponivel — usando fallback');
        this._users = this._getFallbackUsers();
        this._loading = false;
        return;
      }

      const tenantId = TBO_SUPABASE.getCurrentTenantId();
      if (!tenantId) {
        this._users = this._getFallbackUsers();
        this._loading = false;
        return;
      }

      // Query profiles com tenant_id
      const { data: profiles, error } = await client
        .from('profiles')
        .select('id, username, full_name, email, role, bu, is_coordinator, is_active, tenant_id, first_login_completed, avatar_url')
        .eq('tenant_id', tenantId)
        .eq('is_active', true)
        .order('full_name');

      if (error) {
        console.warn('[Permissoes] Erro ao carregar profiles:', error.message);
        this._users = this._getFallbackUsers();
        this._loading = false;
        return;
      }

      this._users = (profiles || []).map(p => ({
        supabaseId: p.id,
        username: p.username || p.email?.split('@')[0] || '',
        name: p.full_name || p.username || 'Sem nome',
        email: p.email || '',
        role: p.role || 'artist',
        bu: p.bu || null,
        isCoordinator: p.is_coordinator || false,
        first_login_completed: p.first_login_completed,
        avatarUrl: p.avatar_url
      }));

      // Tambem atualizar TBO_PERMISSIONS._userRoles em memoria
      if (typeof TBO_PERMISSIONS !== 'undefined') {
        this._users.forEach(u => {
          TBO_PERMISSIONS._userRoles[u.username] = {
            role: u.role,
            bu: u.bu,
            isCoordinator: u.isCoordinator
          };
        });
        TBO_PERMISSIONS._userRolesLoaded = true;
      }

      console.log(`[Permissoes] ${this._users.length} membros carregados do Supabase`);
    } catch (e) {
      console.error('[Permissoes] Erro ao carregar:', e);
      this._users = this._getFallbackUsers();
    }
    this._loading = false;
  },

  _getFallbackUsers() {
    // Fallback usando _defaultUserRoles se Supabase offline
    if (typeof TBO_PERMISSIONS === 'undefined') return [];
    return Object.entries(TBO_PERMISSIONS._defaultUserRoles).map(([id, info]) => ({
      supabaseId: '',
      username: id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      email: `${id}@agenciatbo.com.br`,
      role: info.role,
      bu: info.bu,
      isCoordinator: info.isCoordinator,
      first_login_completed: true,
      avatarUrl: null
    }));
  },

  _openEdit(supabaseId, username) {
    const user = this._users.find(u => u.supabaseId === supabaseId);
    if (!user) return;

    document.getElementById('permEditSid').value = supabaseId;
    document.getElementById('permEditUsername').value = username;

    // Titulo com avatar do Google (se disponivel)
    const titleEl = document.getElementById('permEditTitle');
    if (titleEl) {
      const roleInfo = (typeof TBO_PERMISSIONS !== 'undefined' ? TBO_PERMISSIONS._roles[user.role] : {}) || {};
      const initials = this._getInitials(user.name);
      const avatarHtml = user.avatarUrl
        ? `<img src="${this._esc(user.avatarUrl)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="width:36px;height:36px;border-radius:50%;background:${roleInfo.color || '#94a3b8'}22;color:${roleInfo.color || '#94a3b8'};display:none;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;">${initials}</div>`
        : `<div style="width:36px;height:36px;border-radius:50%;background:${roleInfo.color || '#94a3b8'}22;color:${roleInfo.color || '#94a3b8'};display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:600;">${initials}</div>`;
      titleEl.innerHTML = `<div style="display:flex;align-items:center;gap:10px;">${avatarHtml}<span>Editar: ${this._esc(user.name)}</span></div>`;
    }

    document.getElementById('permEditRole').value = user.role;
    document.getElementById('permEditBU').value = user.bu || '';
    document.getElementById('permEditCoord').checked = user.isCoordinator;
    document.getElementById('permEditModal').style.display = 'block';
  },

  _closeEdit() {
    const modal = document.getElementById('permEditModal');
    if (modal) modal.style.display = 'none';
  },

  async _saveEdit() {
    const supabaseId = document.getElementById('permEditSid')?.value;
    const username = document.getElementById('permEditUsername')?.value;
    if (!supabaseId) return;

    const newRole = document.getElementById('permEditRole')?.value;
    const newBU = document.getElementById('permEditBU')?.value || null;
    const newCoord = document.getElementById('permEditCoord')?.checked || false;

    // Salvar no Supabase
    const saveBtn = document.getElementById('permEditSave');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Salvando...';
    }

    try {
      const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
      if (client) {
        const { error } = await client
          .from('profiles')
          .update({
            role: newRole,
            bu: newBU,
            is_coordinator: newCoord
          })
          .eq('id', supabaseId);

        if (error) {
          console.error('[Permissoes] Erro ao salvar:', error.message);
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Falha ao salvar no Supabase: ' + error.message);
          return;
        }
      }

      // Atualizar em memoria
      if (typeof TBO_PERMISSIONS !== 'undefined' && username) {
        TBO_PERMISSIONS._userRoles[username] = {
          role: newRole,
          bu: newBU,
          isCoordinator: newCoord
        };
      }

      // Atualizar lista local
      const user = this._users.find(u => u.supabaseId === supabaseId);
      if (user) {
        user.role = newRole;
        user.bu = newBU;
        user.isCoordinator = newCoord;
      }

      this._closeEdit();
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.success('Salvo', `Permissoes de ${user?.name || username} atualizadas no Supabase.`);
      }

      // Re-render
      const container = document.getElementById('moduleContainer');
      if (container) {
        container.innerHTML = this.render();
        if (window.lucide) lucide.createIcons();
        this._bindEvents();
      }
    } catch (e) {
      console.error('[Permissoes] Erro:', e);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', e.message);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i data-lucide="save" style="width:14px;height:14px;margin-right:4px;"></i>Salvar no Supabase';
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  _getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  _esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }
};
