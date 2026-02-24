/**
 * TBO OS — Repository: Custom Fields & Task Field Values
 *
 * Tables: os_custom_fields, os_task_field_values
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 * Segue padrão CrmRepo: IIFE, _db(), _tid(), throw on error.
 */
const OsFieldsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    // ═══ Custom Field Definitions ═══

    /**
     * List field definitions for a project (includes global fields).
     */
    async listFields(projectId) {
      const tid = _tid();
      const { data, error } = await _db().from('os_custom_fields')
        .select('*')
        .eq('tenant_id', tid)
        .or('project_id.eq.' + projectId + ',scope.eq.global')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    /**
     * Get single field definition.
     */
    async getField(id) {
      const { data, error } = await _db().from('os_custom_fields')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Create a new custom field.
     */
    async createField(field) {
      const tid = _tid();
      const payload = { ...field, tenant_id: tid };
      delete payload.id;

      const { data, error } = await _db().from('os_custom_fields')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update a custom field definition.
     */
    async updateField(id, changes) {
      const patch = { ...changes };
      delete patch.id;
      delete patch.tenant_id;
      delete patch.created_at;

      const { data, error } = await _db().from('os_custom_fields')
        .update(patch)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a custom field (cascades to os_task_field_values via FK).
     */
    async deleteField(id) {
      const { error } = await _db().from('os_custom_fields')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },

    // ═══ Task Field Values ═══

    /**
     * List all field values for a single task.
     */
    async listValues(taskId) {
      const { data, error } = await _db().from('os_task_field_values')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('task_id', taskId);

      if (error) throw error;
      return data || [];
    },

    /**
     * List all field values for all tasks in a project.
     * Uses inner join via task_id → os_tasks.project_id.
     */
    async listValuesByProject(projectId) {
      const tid = _tid();

      // First get all task ids for this project
      const { data: tasks, error: taskErr } = await _db().from('os_tasks')
        .select('id')
        .eq('tenant_id', tid)
        .eq('project_id', projectId);

      if (taskErr) throw taskErr;
      if (!tasks || tasks.length === 0) return [];

      const taskIds = tasks.map(t => t.id);

      // Then fetch all values for those tasks
      const { data, error } = await _db().from('os_task_field_values')
        .select('*')
        .eq('tenant_id', tid)
        .in('task_id', taskIds);

      if (error) throw error;
      return data || [];
    },

    /**
     * Upsert a single field value (insert or update on task_id+field_id).
     */
    async upsertValue(taskId, fieldId, valueJson) {
      const tid = _tid();
      const { data, error } = await _db().from('os_task_field_values')
        .upsert(
          { tenant_id: tid, task_id: taskId, field_id: fieldId, value_json: valueJson },
          { onConflict: 'task_id,field_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a single field value.
     */
    async deleteValue(taskId, fieldId) {
      const { error } = await _db().from('os_task_field_values')
        .delete()
        .eq('tenant_id', _tid())
        .eq('task_id', taskId)
        .eq('field_id', fieldId);

      if (error) throw error;
    },

    /**
     * Bulk upsert field values for a task.
     * items: [{ field_id, value_json }]
     */
    async bulkUpsertValues(taskId, items) {
      const tid = _tid();
      const records = items.map(item => ({
        tenant_id: tid,
        task_id: taskId,
        field_id: item.field_id,
        value_json: item.value_json,
      }));

      const { data, error } = await _db().from('os_task_field_values')
        .upsert(records, { onConflict: 'task_id,field_id' })
        .select();

      if (error) throw error;
      return data || [];
    },
  };
})();

if (typeof window !== 'undefined') window.OsFieldsRepo = OsFieldsRepo;
