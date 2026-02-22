/**
 * TBO OS — Custom Database Repository (Notion-style)
 *
 * CRUD para databases flexíveis + rows com propriedades JSONB.
 * Task #23 — TBO-OS Fase 4
 */

const CustomDatabaseRepo = (() => {
  'use strict';

  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  // ── Database CRUD ──────────────────────────────────────────────────────

  async function listDatabases() {
    const { data, error } = await _db().from('custom_databases')
      .select('*')
      .eq('tenant_id', _tid())
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async function getDatabase(id) {
    const { data, error } = await _db().from('custom_databases')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', _tid())
      .single();
    if (error) throw error;
    return data;
  }

  async function createDatabase({ name, description, icon, color, columns, default_view, views }) {
    const tid = _tid();
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;

    // Generate default title column if columns empty
    const cols = (columns && columns.length > 0) ? columns : [
      { id: _colId(), name: 'Nome', type: 'text', order: 0, width: 300, primary: true }
    ];

    // Generate default table view if views empty
    const defaultViews = (views && views.length > 0) ? views : [
      { id: _viewId(), name: 'Tabela', type: 'table', filters: [], sorts: [], hiddenColumns: [] }
    ];

    const { data, error } = await _db().from('custom_databases')
      .insert({
        tenant_id: tid,
        name: name || 'Novo Database',
        description: description || '',
        icon: icon || 'database',
        color: color || '#3B82F6',
        columns: cols,
        default_view: default_view || 'table',
        views: defaultViews,
        created_by: userId
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateDatabase(id, updates) {
    const allowed = ['name', 'description', 'icon', 'color', 'columns', 'default_view', 'views'];
    const clean = {};
    for (const k of allowed) {
      if (updates[k] !== undefined) clean[k] = updates[k];
    }

    const { data, error } = await _db().from('custom_databases')
      .update(clean)
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function deleteDatabase(id) {
    const { error } = await _db().from('custom_databases')
      .delete()
      .eq('id', id)
      .eq('tenant_id', _tid());
    if (error) throw error;
  }

  // ── Row CRUD ───────────────────────────────────────────────────────────

  async function listRows(databaseId, { filters, sorts, limit = 500, offset = 0 } = {}) {
    let q = _db().from('custom_database_rows')
      .select('*')
      .eq('database_id', databaseId)
      .eq('tenant_id', _tid())
      .range(offset, offset + limit - 1);

    // Apply sorts (default: order_index asc)
    if (sorts && sorts.length > 0) {
      for (const s of sorts) {
        // JSONB sorts: use ->>'col_id'
        q = q.order(`properties->>${s.columnId}`, { ascending: s.direction === 'asc', nullsFirst: false });
      }
    } else {
      q = q.order('order_index', { ascending: true });
    }

    const { data, error } = await q;
    if (error) throw error;

    // Client-side JSONB filtering (Supabase REST filters on JSONB are limited)
    let rows = data || [];
    if (filters && filters.length > 0) {
      rows = _applyFilters(rows, filters);
    }

    return rows;
  }

  async function getRow(id) {
    const { data, error } = await _db().from('custom_database_rows')
      .select('*')
      .eq('id', id)
      .eq('tenant_id', _tid())
      .single();
    if (error) throw error;
    return data;
  }

  async function createRow(databaseId, properties = {}, orderIndex) {
    const tid = _tid();
    const userId = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null;

    const { data, error } = await _db().from('custom_database_rows')
      .insert({
        tenant_id: tid,
        database_id: databaseId,
        properties,
        order_index: orderIndex ?? Date.now(),
        created_by: userId
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateRow(id, properties) {
    const { data, error } = await _db().from('custom_database_rows')
      .update({ properties })
      .eq('id', id)
      .eq('tenant_id', _tid())
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  async function updateRowOrder(id, orderIndex) {
    const { error } = await _db().from('custom_database_rows')
      .update({ order_index: orderIndex })
      .eq('id', id)
      .eq('tenant_id', _tid());
    if (error) throw error;
  }

  async function deleteRow(id) {
    const { error } = await _db().from('custom_database_rows')
      .delete()
      .eq('id', id)
      .eq('tenant_id', _tid());
    if (error) throw error;
  }

  async function deleteRows(ids) {
    const { error } = await _db().from('custom_database_rows')
      .delete()
      .in('id', ids)
      .eq('tenant_id', _tid());
    if (error) throw error;
  }

  // ── Client-side filters ────────────────────────────────────────────────

  function _applyFilters(rows, filters) {
    return rows.filter(row => {
      return filters.every(f => {
        const val = row.properties?.[f.columnId];
        const target = f.value;

        switch (f.operator) {
          case 'is':            return val === target;
          case 'is_not':        return val !== target;
          case 'contains':      return String(val || '').toLowerCase().includes(String(target).toLowerCase());
          case 'not_contains':  return !String(val || '').toLowerCase().includes(String(target).toLowerCase());
          case 'starts_with':   return String(val || '').toLowerCase().startsWith(String(target).toLowerCase());
          case 'ends_with':     return String(val || '').toLowerCase().endsWith(String(target).toLowerCase());
          case 'is_empty':      return val == null || val === '' || (Array.isArray(val) && val.length === 0);
          case 'is_not_empty':  return val != null && val !== '' && !(Array.isArray(val) && val.length === 0);
          case 'gt':            return Number(val) > Number(target);
          case 'gte':           return Number(val) >= Number(target);
          case 'lt':            return Number(val) < Number(target);
          case 'lte':           return Number(val) <= Number(target);
          case 'date_is':       return _dateStr(val) === _dateStr(target);
          case 'date_before':   return new Date(val) < new Date(target);
          case 'date_after':    return new Date(val) > new Date(target);
          case 'includes':      return Array.isArray(val) && val.includes(target);
          case 'not_includes':  return !Array.isArray(val) || !val.includes(target);
          default:              return true;
        }
      });
    });
  }

  function _dateStr(d) {
    try { return new Date(d).toISOString().split('T')[0]; } catch { return ''; }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  function _colId() {
    return 'col_' + Math.random().toString(36).slice(2, 10);
  }

  function _viewId() {
    return 'view_' + Math.random().toString(36).slice(2, 10);
  }

  // ── Public API ─────────────────────────────────────────────────────────

  return {
    // Databases
    listDatabases,
    getDatabase,
    createDatabase,
    updateDatabase,
    deleteDatabase,

    // Rows
    listRows,
    getRow,
    createRow,
    updateRow,
    updateRowOrder,
    deleteRow,
    deleteRows,

    // Utilities
    generateColumnId: _colId,
    generateViewId: _viewId,
    applyFilters: _applyFilters
  };
})();

if (typeof window !== 'undefined') {
  window.CustomDatabaseRepo = CustomDatabaseRepo;
}
