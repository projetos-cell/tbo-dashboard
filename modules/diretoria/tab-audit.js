// ============================================================================
// TBO OS — Diretoria: Tab Auditoria
// Logs de auditoria adaptado de modules/admin/audit-tab.js
// Filtros, paginacao, export CSV
// ============================================================================

const TBO_DIRETORIA_AUDIT = {

  _logs: [],
  _filters: { dateFrom: null, dateTo: null, action: null, entity: null },
  _page: 0,
  _pageSize: 50,
  _total: 0,
  _portal: null,

  setup(portal) {
    this._portal = portal;
  },

  render() {
    const logs = this._logs;
    const totalPages = Math.ceil(this._total / this._pageSize) || 1;

    return `
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <div>
            <h3 style="margin:0;font-size:0.92rem;">Logs de Auditoria</h3>
            <p style="color:var(--text-muted);font-size:0.72rem;margin:4px 0 0;">Historico de acoes do sistema</p>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <span style="font-size:0.72rem;color:var(--text-muted);">${this._total} registros</span>
            <button class="btn btn-ghost btn-sm" id="dirExportAudit"><i data-lucide="download" style="width:14px;height:14px;"></i> CSV</button>
            <button class="btn btn-ghost btn-sm" id="dirRefreshAudit"><i data-lucide="refresh-cw" style="width:14px;height:14px;"></i></button>
          </div>
        </div>

        <!-- Filtros -->
        <div class="ap-filter-bar">
          <input type="date" class="ap-filter-input" id="dirFilterDateFrom" value="${this._filters.dateFrom || ''}" placeholder="De">
          <input type="date" class="ap-filter-input" id="dirFilterDateTo" value="${this._filters.dateTo || ''}" placeholder="Ate">
          <select class="ap-filter-input" id="dirFilterAction">
            <option value="">Todas acoes</option>
            <option value="create" ${this._filters.action === 'create' ? 'selected' : ''}>Create</option>
            <option value="update" ${this._filters.action === 'update' ? 'selected' : ''}>Update</option>
            <option value="delete" ${this._filters.action === 'delete' ? 'selected' : ''}>Delete</option>
          </select>
          <select class="ap-filter-input" id="dirFilterEntity">
            <option value="">Todas entidades</option>
            <option value="profiles" ${this._filters.entity === 'profiles' ? 'selected' : ''}>Profiles</option>
            <option value="projects" ${this._filters.entity === 'projects' ? 'selected' : ''}>Projects</option>
            <option value="tasks" ${this._filters.entity === 'tasks' ? 'selected' : ''}>Tasks</option>
            <option value="roles" ${this._filters.entity === 'roles' ? 'selected' : ''}>Roles</option>
            <option value="role_permissions" ${this._filters.entity === 'role_permissions' ? 'selected' : ''}>Permissions</option>
          </select>
          <button class="btn btn-ghost btn-sm" id="dirApplyFilter">Filtrar</button>
        </div>

        <table class="ap-table" style="font-size:0.75rem;">
          <thead>
            <tr>
              <th style="width:140px;">Quando</th>
              <th style="width:140px;">Usuario</th>
              <th style="width:80px;">Acao</th>
              <th>Entidade</th>
              <th>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(l => {
              const actionColor = { create: 'var(--color-success)', update: 'var(--color-warning)', delete: 'var(--color-danger)' }[l.action] || 'var(--text-muted)';
              const details = l.metadata ? this._formatDetails(l.metadata) : '\u2014';
              return `
                <tr>
                  <td style="white-space:nowrap;font-size:0.68rem;">${l.created_at ? new Date(l.created_at).toLocaleString('pt-BR') : '\u2014'}</td>
                  <td>${this._esc(l._user_name || l.user_id?.substring(0, 8) || '\u2014')}</td>
                  <td><span style="color:${actionColor};font-weight:600;text-transform:uppercase;font-size:0.68rem;">${this._esc(l.action || '\u2014')}</span></td>
                  <td style="font-size:0.72rem;">${this._esc(l.entity_type || '')} <span style="color:var(--text-muted);">${l.entity_id ? l.entity_id.substring(0, 8) : ''}</span></td>
                  <td style="font-size:0.68rem;color:var(--text-muted);max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${details}</td>
                </tr>
              `;
            }).join('')}
            ${!logs.length ? '<tr><td colspan="5" style="padding:32px;text-align:center;color:var(--text-muted);">Nenhum log encontrado</td></tr>' : ''}
          </tbody>
        </table>

        <!-- Paginacao -->
        ${this._total > this._pageSize ? `
          <div class="ap-pagination">
            <button class="btn btn-ghost btn-sm" id="dirPrevPage" ${this._page === 0 ? 'disabled' : ''}>\u2190 Anterior</button>
            <span style="font-size:0.72rem;color:var(--text-muted);">Pagina ${this._page + 1} de ${totalPages}</span>
            <button class="btn btn-ghost btn-sm" id="dirNextPage" ${this._page >= totalPages - 1 ? 'disabled' : ''}>Proxima \u2192</button>
          </div>
        ` : ''}
      </div>
    `;
  },

  bind() {
    document.getElementById('dirApplyFilter')?.addEventListener('click', () => {
      this._filters.dateFrom = document.getElementById('dirFilterDateFrom')?.value || null;
      this._filters.dateTo = document.getElementById('dirFilterDateTo')?.value || null;
      this._filters.action = document.getElementById('dirFilterAction')?.value || null;
      this._filters.entity = document.getElementById('dirFilterEntity')?.value || null;
      this._page = 0;
      this.loadLogs();
    });

    document.getElementById('dirRefreshAudit')?.addEventListener('click', () => this.loadLogs());
    document.getElementById('dirExportAudit')?.addEventListener('click', () => this._exportCSV());
    document.getElementById('dirPrevPage')?.addEventListener('click', () => { this._page--; this.loadLogs(); });
    document.getElementById('dirNextPage')?.addEventListener('click', () => { this._page++; this.loadLogs(); });
  },

  // ── Carregamento de logs ──────────────────────────────────────────────

  async loadLogs() {
    const client = typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE.getClient() : null;
    if (!client) return;
    const tenantId = TBO_SUPABASE.getCurrentTenantId();

    try {
      let query = client
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .range(this._page * this._pageSize, (this._page + 1) * this._pageSize - 1);

      if (this._filters.dateFrom) query = query.gte('created_at', this._filters.dateFrom);
      if (this._filters.dateTo) query = query.lte('created_at', this._filters.dateTo + 'T23:59:59');
      if (this._filters.action) query = query.eq('action', this._filters.action);
      if (this._filters.entity) query = query.eq('entity_type', this._filters.entity);

      const { data, count } = await query;
      this._logs = data || [];
      this._total = count || 0;

      // Enriquecer com nomes de usuario
      const userIds = [...new Set(this._logs.map(l => l.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        const { data: profiles } = await client.from('profiles').select('id, full_name').in('id', userIds);
        const nameMap = {};
        (profiles || []).forEach(p => { nameMap[p.id] = p.full_name; });
        this._logs.forEach(l => { l._user_name = nameMap[l.user_id] || null; });
      }

      this._portal?._rerender();
    } catch (e) {
      console.warn('[Diretoria Audit] Erro ao carregar logs:', e.message);
    }
  },

  // ── Helpers ────────────────────────────────────────────────────────────

  _formatDetails(metadata) {
    if (!metadata) return '\u2014';
    try {
      const m = typeof metadata === 'string' ? JSON.parse(metadata) : metadata;
      if (m.changed_fields) {
        const changes = Object.entries(m.changed_fields).map(([k]) => k).join(', ');
        return changes ? `Campos: ${this._esc(changes)}` : '\u2014';
      }
      if (m.new_data) return 'Novo registro';
      if (m.old_data) return 'Registro removido';
      return '\u2014';
    } catch { return '\u2014'; }
  },

  _exportCSV() {
    if (!this._logs.length) return;
    const headers = ['Data', 'Usuario', 'Acao', 'Entidade', 'ID Entidade'];
    const rows = this._logs.map(l => [
      l.created_at ? new Date(l.created_at).toLocaleString('pt-BR') : '',
      l._user_name || l.user_id || '',
      l.action || '',
      l.entity_type || '',
      l.entity_id || ''
    ]);

    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diretoria-audit-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  _esc(str) {
    if (typeof TBO_FORMATTER !== 'undefined') return TBO_FORMATTER.escapeHtml(String(str || ''));
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
};
