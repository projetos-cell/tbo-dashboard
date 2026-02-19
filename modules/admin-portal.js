// ============================================================================
// TBO OS — Modulo: Admin Portal
// Painel administrativo: Empresas, Usuarios, Roles, Integracoes, Auditoria
// Acesso restrito a roles admin/socio
// ============================================================================

const TBO_ADMIN_PORTAL = {
  _tab: 'empresas',
  _tenants: [],
  _users: [],
  _roles: [],
  _loading: false,

  render() {
    return `
      <div class="admin-portal-module">
        <div class="module-header" style="margin-bottom:24px;">
          <div>
            <h2 class="module-title" style="margin:0;">Admin Portal</h2>
            <p style="color:var(--text-tertiary);font-size:0.82rem;margin-top:4px;">Gestao centralizada de empresas, usuarios, roles e integracoes</p>
          </div>
          <div style="display:flex;gap:8px;">
            <span class="tag gold">Admin</span>
          </div>
        </div>

        <!-- Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:20px;border-bottom:1px solid var(--border-default);">
          ${['empresas', 'usuarios', 'roles', 'integracoes', 'auditoria'].map(t => `
            <button class="btn btn-ghost ap-tab-btn" data-tab="${t}" style="border-radius:var(--radius-md) var(--radius-md) 0 0;border-bottom:2px solid ${this._tab === t ? 'var(--brand-primary)' : 'transparent'};font-weight:${this._tab === t ? '600' : '400'};font-size:0.82rem;padding:8px 16px;">
              ${{ empresas: 'Empresas', usuarios: 'Usuarios', roles: 'Roles & Permissoes', integracoes: 'Integracoes', auditoria: 'Auditoria' }[t]}
            </button>
          `).join('')}
        </div>

        <div id="apTabContent">
          ${this._loading ? '<div style="text-align:center;padding:40px;"><p style="color:var(--text-muted);">Carregando...</p></div>' : this._renderTab()}
        </div>
      </div>
    `;
  },

  _renderTab() {
    switch (this._tab) {
      case 'empresas': return this._renderEmpresas();
      case 'usuarios': return this._renderUsuarios();
      case 'roles': return this._renderRoles();
      case 'integracoes': return this._renderIntegracoes();
      case 'auditoria': return this._renderAuditoria();
      default: return '';
    }
  },

  _renderEmpresas() {
    const tenants = this._tenants;

    return `
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card">
          <div class="kpi-label">Total Empresas</div>
          <div class="kpi-value">${tenants.length}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Ativas</div>
          <div class="kpi-value" style="color:var(--color-success);">${tenants.filter(t => t.is_active !== false).length}</div>
        </div>
      </div>

      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:0.92rem;">Empresas (Tenants)</h3>
          <button class="btn btn-primary" id="apAddTenant" style="font-size:0.78rem;">+ Nova Empresa</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:8px;">Nome</th>
              <th style="text-align:left;padding:8px;">Slug</th>
              <th style="text-align:center;padding:8px;">Membros</th>
              <th style="text-align:center;padding:8px;">Status</th>
              <th style="text-align:left;padding:8px;">Criado em</th>
            </tr>
          </thead>
          <tbody>
            ${tenants.map(t => `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:6px 8px;font-weight:600;">${this._esc(t.name)}</td>
                <td style="padding:6px 8px;"><code style="font-size:0.72rem;">${this._esc(t.slug)}</code></td>
                <td style="padding:6px 8px;text-align:center;">${t._memberCount || '—'}</td>
                <td style="padding:6px 8px;text-align:center;">
                  <span class="tag ${t.is_active !== false ? 'gold' : ''}">${t.is_active !== false ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td style="padding:6px 8px;font-size:0.72rem;">${t.created_at ? new Date(t.created_at).toLocaleDateString('pt-BR') : '—'}</td>
              </tr>
            `).join('')}
            ${!tenants.length ? '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--text-muted);">Nenhuma empresa encontrada</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderUsuarios() {
    const users = this._users;

    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:0.92rem;">Usuarios do Workspace</h3>
          <button class="btn btn-primary" id="apInviteUser" style="font-size:0.78rem;">+ Convidar Usuario</button>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.82rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:8px;">Nome</th>
              <th style="text-align:left;padding:8px;">Email</th>
              <th style="text-align:left;padding:8px;">Role</th>
              <th style="text-align:center;padding:8px;">Status</th>
              <th style="text-align:left;padding:8px;">Ultimo Login</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:6px 8px;">
                  <div style="display:flex;align-items:center;gap:8px;">
                    ${u.avatar_url ? `<img src="${this._esc(u.avatar_url)}" style="width:24px;height:24px;border-radius:50%;">` : '<div style="width:24px;height:24px;border-radius:50%;background:var(--bg-elevated);display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:600;">' + (u.full_name || u.email || '?')[0].toUpperCase() + '</div>'}
                    <span style="font-weight:500;">${this._esc(u.full_name || u.email || 'Sem nome')}</span>
                  </div>
                </td>
                <td style="padding:6px 8px;font-size:0.78rem;color:var(--text-secondary);">${this._esc(u.email || '—')}</td>
                <td style="padding:6px 8px;">
                  <select class="ap-role-select" data-user-id="${u.id}" style="font-size:0.72rem;padding:2px 6px;border-radius:var(--radius-sm);border:1px solid var(--border-default);background:var(--bg-primary);">
                    ${this._roles.map(r => `<option value="${r.id}" ${u._role_id === r.id ? 'selected' : ''}>${this._esc(r.name)}</option>`).join('')}
                  </select>
                </td>
                <td style="padding:6px 8px;text-align:center;">
                  <span class="tag ${u.is_active !== false ? 'gold' : ''}">${u.is_active !== false ? 'Ativo' : 'Inativo'}</span>
                </td>
                <td style="padding:6px 8px;font-size:0.72rem;color:var(--text-muted);">${u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('pt-BR') : 'Nunca'}</td>
              </tr>
            `).join('')}
            ${!users.length ? '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--text-muted);">Nenhum usuario encontrado</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderRoles() {
    const roles = this._roles;
    const modules = [
      'command-center', 'projetos', 'tarefas', 'entregas', 'revisoes', 'timeline',
      'timesheets', 'carga-trabalho', 'capacidade', 'comercial', 'pipeline', 'clientes',
      'inteligencia', 'mercado', 'conteudo', 'financeiro', 'receber', 'pagar', 'margens',
      'conciliacao', 'contratos', 'rh', 'pessoas-avancado', 'cultura', 'reunioes',
      'decisoes', 'biblioteca', 'alerts', 'changelog', 'configuracoes', 'integracoes'
    ];

    return `
      <div class="card" style="overflow-x:auto;">
        <h3 style="margin:0 0 16px;font-size:0.92rem;">Matrix de Permissoes</h3>
        <p style="font-size:0.72rem;color:var(--text-muted);margin-bottom:16px;">V = View, C = Create, E = Edit, D = Delete, X = Export</p>
        <table style="width:100%;border-collapse:collapse;font-size:0.68rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:6px;position:sticky;left:0;background:var(--bg-primary);min-width:120px;">Modulo</th>
              ${roles.map(r => `<th style="text-align:center;padding:6px;min-width:80px;">${this._esc(r.name)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${modules.map(mod => `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:4px 6px;position:sticky;left:0;background:var(--bg-primary);font-weight:500;">${mod}</td>
                ${roles.map(r => {
                  const perms = r._permissions?.[mod];
                  if (!perms) return '<td style="padding:4px 6px;text-align:center;color:var(--text-muted);">—</td>';
                  const flags = [
                    perms.can_view ? 'V' : '',
                    perms.can_create ? 'C' : '',
                    perms.can_edit ? 'E' : '',
                    perms.can_delete ? 'D' : '',
                    perms.can_export ? 'X' : ''
                  ].filter(Boolean).join('');
                  return `<td style="padding:4px 6px;text-align:center;color:var(--color-success);font-weight:600;">${flags || '—'}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  _renderIntegracoes() {
    const integrations = typeof TBO_INTEGRACOES !== 'undefined' ? TBO_INTEGRACOES._checkAll() : [];

    return `
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;">
        ${integrations.map(integ => {
          const statusColor = integ.status === 'connected' ? 'var(--color-success)' : integ.status === 'partial' ? 'var(--color-warning)' : 'var(--color-danger)';
          const statusLabel = integ.status === 'connected' ? 'Conectado' : integ.status === 'partial' ? 'Parcial' : 'Desconectado';

          return `
            <div class="card" style="position:relative;overflow:hidden;">
              <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${statusColor};"></div>
              <div style="display:flex;align-items:center;gap:12px;padding-top:8px;">
                <i data-lucide="${integ.icon}" style="width:20px;height:20px;color:${statusColor};"></i>
                <div style="flex:1;">
                  <strong style="font-size:0.85rem;">${this._esc(integ.name)}</strong>
                  <span style="font-size:0.65rem;padding:2px 6px;border-radius:999px;background:${statusColor}18;color:${statusColor};margin-left:8px;">${statusLabel}</span>
                </div>
              </div>
              <p style="font-size:0.75rem;color:var(--text-secondary);margin:8px 0 0;">${this._esc(integ.details || integ.description)}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  _renderAuditoria() {
    const logs = this._getRecentAuditLogs();

    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 style="margin:0;font-size:0.92rem;">Logs de Auditoria (Recentes)</h3>
          <span class="tag">${logs.length} registros</span>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.78rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--border-default);">
              <th style="text-align:left;padding:8px;">Quando</th>
              <th style="text-align:left;padding:8px;">Usuario</th>
              <th style="text-align:left;padding:8px;">Acao</th>
              <th style="text-align:left;padding:8px;">Entidade</th>
              <th style="text-align:left;padding:8px;">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            ${logs.slice(0, 50).map(l => `
              <tr style="border-bottom:1px solid var(--border-subtle);">
                <td style="padding:6px 8px;white-space:nowrap;font-size:0.72rem;">${l.created_at ? new Date(l.created_at).toLocaleString('pt-BR') : '—'}</td>
                <td style="padding:6px 8px;">${this._esc(l.user_name || l.user_id || '—')}</td>
                <td style="padding:6px 8px;">
                  <span class="tag" style="font-size:0.65rem;">${this._esc(l.action || '—')}</span>
                </td>
                <td style="padding:6px 8px;font-size:0.72rem;">${this._esc(l.entity_type || '')} ${this._esc(l.entity_name || '')}</td>
                <td style="padding:6px 8px;font-size:0.72rem;color:var(--text-muted);max-width:200px;overflow:hidden;text-overflow:ellipsis;">${this._esc(l.details || '—')}</td>
              </tr>
            `).join('')}
            ${!logs.length ? '<tr><td colspan="5" style="padding:24px;text-align:center;color:var(--text-muted);">Nenhum log encontrado</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    `;
  },

  async init() {
    // Tab navigation
    document.querySelectorAll('.ap-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._tab = btn.dataset.tab;
        this._rerender();
      });
    });

    // Carregar dados do Supabase
    await this._loadData();
  },

  async _loadData() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.getClient()) return;

    const client = TBO_SUPABASE.getClient();

    try {
      // Tenants
      const { data: tenants } = await client.from('tenants').select('*');
      this._tenants = tenants || [];

      // Roles do tenant atual
      const { data: roles } = await client.from('roles').select('*');
      this._roles = roles || [];

      // Permissions
      const { data: perms } = await client.from('role_permissions').select('*');
      if (perms) {
        for (const r of this._roles) {
          r._permissions = {};
          perms.filter(p => p.role_id === r.id).forEach(p => {
            r._permissions[p.module] = p;
          });
        }
      }

      // Profiles (usuarios)
      const { data: profiles } = await client.from('profiles').select('*');
      this._users = profiles || [];

      // Enrichir com tenant_members
      const { data: members } = await client.from('tenant_members').select('*');
      if (members) {
        for (const u of this._users) {
          const mem = members.find(m => m.user_id === u.id);
          if (mem) u._role_id = mem.role_id;
        }
        for (const t of this._tenants) {
          t._memberCount = members.filter(m => m.tenant_id === t.id).length;
        }
      }

      this._rerender();
    } catch (e) {
      console.warn('[Admin Portal] Erro ao carregar dados:', e.message);
    }
  },

  _getRecentAuditLogs() {
    try {
      const logs = JSON.parse(localStorage.getItem('tbo_audit_log') || '[]');
      return logs.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || '')).slice(0, 100);
    } catch { return []; }
  },

  _rerender() {
    const container = document.getElementById('moduleContainer');
    if (container) {
      container.innerHTML = this.render();
      this.init();
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  },

  _esc(str) {
    if (typeof _escapeHtml === 'function') return _escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
