/**
 * TBO OS — Repositories: Tasks & Sections (os_tasks, os_sections)
 *
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 * Segue padrão CrmRepo: IIFE, _db(), _tid(), throw on error.
 */

// ═══════════════════════════════════════════════════════════════════════════
// OsTasksRepo — CRUD for os_tasks
// ═══════════════════════════════════════════════════════════════════════════
const OsTasksRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * List tasks for a project, optionally filtered by section/status.
     */
    async list(projectId, { sectionId, status, parentId, limit = 500 } = {}) {
      let query = _db().from('os_tasks')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (sectionId) query = query.eq('section_id', sectionId);
      if (status) query = query.eq('status', status);
      if (parentId !== undefined) {
        query = parentId === null
          ? query.is('parent_id', null)
          : query.eq('parent_id', parentId);
      }
      query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Get single task by id.
     */
    async get(id) {
      const { data, error } = await _db().from('os_tasks')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Create a new task.
     */
    async create(task) {
      const tid = _tid();
      // Remove client-generated id if present (let DB generate)
      const payload = { ...task, tenant_id: tid };
      delete payload.id;

      const { data, error } = await _db().from('os_tasks')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update task fields.
     */
    async update(id, changes) {
      // Never update tenant_id or id
      const patch = { ...changes };
      delete patch.id;
      delete patch.tenant_id;
      delete patch.created_at;

      const { data, error } = await _db().from('os_tasks')
        .update(patch)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a task.
     */
    async delete(id) {
      const { error } = await _db().from('os_tasks')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },

    /**
     * Batch update order_index (and optionally section_id) for reordering.
     * items: [{ id, order_index, section_id? }]
     */
    async batchUpdateOrder(items) {
      const tid = _tid();
      const promises = items.map(item => {
        const patch = { order_index: item.order_index };
        if (item.section_id !== undefined) patch.section_id = item.section_id;
        return _db().from('os_tasks')
          .update(patch)
          .eq('id', item.id)
          .eq('tenant_id', tid);
      });

      const results = await Promise.all(promises);
      for (const { error } of results) {
        if (error) throw error;
      }
    },
  };
})();

if (typeof window !== 'undefined') window.OsTasksRepo = OsTasksRepo;


// ═══════════════════════════════════════════════════════════════════════════
// OsSectionsRepo — CRUD for os_sections
// ═══════════════════════════════════════════════════════════════════════════
const OsSectionsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * List sections for a project, ordered by order_index.
     */
    async list(projectId) {
      const { data, error } = await _db().from('os_sections')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('project_id', projectId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    /**
     * Get single section.
     */
    async get(id) {
      const { data, error } = await _db().from('os_sections')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Create a new section.
     */
    async create(section) {
      const tid = _tid();
      const payload = { ...section, tenant_id: tid };
      delete payload.id;

      const { data, error } = await _db().from('os_sections')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update section fields.
     */
    async update(id, changes) {
      const patch = { ...changes };
      delete patch.id;
      delete patch.tenant_id;
      delete patch.created_at;

      const { data, error } = await _db().from('os_sections')
        .update(patch)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a section.
     */
    async delete(id) {
      const { error } = await _db().from('os_sections')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },

    /**
     * Batch update order_index for reordering.
     * items: [{ id, order_index }]
     */
    async batchUpdateOrder(items) {
      const tid = _tid();
      const promises = items.map(item =>
        _db().from('os_sections')
          .update({ order_index: item.order_index })
          .eq('id', item.id)
          .eq('tenant_id', tid)
      );

      const results = await Promise.all(promises);
      for (const { error } of results) {
        if (error) throw error;
      }
    },
  };
})();

if (typeof window !== 'undefined') window.OsSectionsRepo = OsSectionsRepo;
