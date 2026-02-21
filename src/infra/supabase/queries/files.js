/**
 * TBO OS — Repository: Files (PRD v1.2 — Google Drive Integration)
 *
 * CRUD para project_files (arquivos do Google Drive associados a projetos).
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 *
 * Padrão: segue FinanceRepo (src/infra/supabase/queries/finance.js)
 */

const FilesRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  return {

    // ═══════════════════════════════════════════════════════════
    // LIST / GET
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista arquivos por projeto
     */
    async listByProject(projectId, { limit = 100, offset = 0 } = {}) {
      const { data, error } = await _db().from('project_files')
        .select('*, project:projects(name)')
        .eq('tenant_id', _tid())
        .eq('project_id', projectId)
        .order('last_modified_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return data || [];
    },

    /**
     * Lista arquivos por usuário
     */
    async listByUser(profileId, { limit = 100, offset = 0 } = {}) {
      const { data, error } = await _db().from('project_files')
        .select('*, project:projects(name)')
        .eq('tenant_id', _tid())
        .eq('profile_id', profileId)
        .order('last_modified_at', { ascending: false })
        .range(offset, offset + limit - 1);
      if (error) throw error;
      return data || [];
    },

    /**
     * Busca arquivos por nome
     */
    async search(query, { limit = 50 } = {}) {
      const { data, error } = await _db().from('project_files')
        .select('*, project:projects(name)')
        .eq('tenant_id', _tid())
        .ilike('name', `%${query}%`)
        .order('last_modified_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    /**
     * Busca arquivo por ID
     */
    async getById(id) {
      const { data, error } = await _db().from('project_files')
        .select('*, project:projects(name)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // UPSERT — Google Drive sync
    // ═══════════════════════════════════════════════════════════

    /**
     * Upsert arquivo pelo google_file_id.
     * Deduplicação via UNIQUE INDEX (tenant_id, google_file_id).
     */
    async upsertByGoogleFileId(googleFileId, fileData) {
      const tid = _tid();

      const { data: existing } = await _db().from('project_files')
        .select('id')
        .eq('tenant_id', tid)
        .eq('google_file_id', googleFileId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await _db().from('project_files')
          .update({
            ...fileData,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .eq('tenant_id', tid)
          .select()
          .single();
        if (error) throw error;
        return { data, isNew: false };
      } else {
        const { data, error } = await _db().from('project_files')
          .insert({
            ...fileData,
            tenant_id: tid,
            google_file_id: googleFileId,
            synced_at: new Date().toISOString()
          })
          .select()
          .single();
        if (error) throw error;
        return { data, isNew: true };
      }
    },

    // ═══════════════════════════════════════════════════════════
    // DELETE
    // ═══════════════════════════════════════════════════════════

    async delete(id) {
      const { error } = await _db().from('project_files')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());
      if (error) throw error;
    },

    // ═══════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════

    async getStats() {
      const { data, count, error } = await _db().from('project_files')
        .select('id, project_id, size_bytes', { count: 'exact' })
        .eq('tenant_id', _tid());
      if (error) throw error;

      const totalSize = (data || []).reduce((sum, f) => sum + (f.size_bytes || 0), 0);
      const projectIds = new Set((data || []).map(f => f.project_id).filter(Boolean));

      return {
        totalFiles: count || 0,
        totalSizeBytes: totalSize,
        projectsWithFiles: projectIds.size
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FilesRepo = FilesRepo;
}
