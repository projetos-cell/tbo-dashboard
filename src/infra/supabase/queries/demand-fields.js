/**
 * TBO OS — Repository: Demand Custom Fields
 *
 * Delegates field DEFINITIONS to OsFieldsRepo (os_custom_fields table).
 * Owns field VALUES for demands (demand_field_values table).
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 * Segue padrão RepoBase: IIFE, _db(), _tid(), throw on error.
 */
const DemandFieldsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    // ═══ Field Definitions (delegates to OsFieldsRepo) ═══

    /** List field definitions for a project (includes global fields). */
    async listFields(projectId) {
      return OsFieldsRepo.listFields(projectId);
    },

    /** Get single field definition. */
    async getField(id) {
      return OsFieldsRepo.getField(id);
    },

    /** Create a new custom field definition. */
    async createField(field) {
      return OsFieldsRepo.createField(field);
    },

    /** Update a custom field definition. */
    async updateField(id, changes) {
      return OsFieldsRepo.updateField(id, changes);
    },

    /** Delete a custom field (cascades to demand_field_values via FK). */
    async deleteField(id) {
      return OsFieldsRepo.deleteField(id);
    },

    // ═══ Demand Field Values (own table: demand_field_values) ═══

    /**
     * List all field values for a single demand.
     */
    async listValues(demandId) {
      const { data, error } = await _db().from('demand_field_values')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('demand_id', demandId);

      if (error) throw error;
      return data || [];
    },

    /**
     * List all field values for all demands in a project.
     */
    async listValuesByProject(projectId) {
      const tid = _tid();

      // First get all demand ids for this project
      const { data: demands, error: demErr } = await _db().from('demands')
        .select('id')
        .eq('tenant_id', tid)
        .eq('project_id', projectId);

      if (demErr) throw demErr;
      if (!demands || demands.length === 0) return [];

      const demandIds = demands.map(d => d.id);

      // Then fetch all values for those demands
      const { data, error } = await _db().from('demand_field_values')
        .select('*')
        .eq('tenant_id', tid)
        .in('demand_id', demandIds);

      if (error) throw error;
      return data || [];
    },

    /**
     * Upsert a single field value (insert or update on demand_id+field_id).
     */
    async upsertValue(demandId, fieldId, valueJson) {
      const tid = _tid();
      const { data, error } = await _db().from('demand_field_values')
        .upsert(
          { tenant_id: tid, demand_id: demandId, field_id: fieldId, value_json: valueJson },
          { onConflict: 'demand_id,field_id' }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a single field value.
     */
    async deleteValue(demandId, fieldId) {
      const { error } = await _db().from('demand_field_values')
        .delete()
        .eq('tenant_id', _tid())
        .eq('demand_id', demandId)
        .eq('field_id', fieldId);

      if (error) throw error;
    },

    /**
     * Bulk upsert field values for a demand.
     * items: [{ field_id, value_json }]
     */
    async bulkUpsertValues(demandId, items) {
      const tid = _tid();
      const records = items.map(item => ({
        tenant_id: tid,
        demand_id: demandId,
        field_id: item.field_id,
        value_json: item.value_json,
      }));

      const { data, error } = await _db().from('demand_field_values')
        .upsert(records, { onConflict: 'demand_id,field_id' })
        .select();

      if (error) throw error;
      return data || [];
    },
  };
})();

if (typeof window !== 'undefined') window.DemandFieldsRepo = DemandFieldsRepo;
