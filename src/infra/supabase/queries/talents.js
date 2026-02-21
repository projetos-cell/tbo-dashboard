/**
 * TBO OS — Repository: Talents (Banco de Talentos)
 *
 * CRUD e queries para gestão de talentos externos (candidatos, freelancers, parceiros).
 * UI NUNCA chama supabase.from('talents') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const TalentsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, full_name, email, phone, specialty, seniority, city, state, portfolio_url, linkedin_url, status, tags, notes, source, created_by, created_at, updated_at';

  return {

    /**
     * Lista talentos com filtros opcionais
     */
    async list({ status, specialty, seniority, search, limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      let query = _db().from('talents')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('full_name');

      if (status) query = query.eq('status', status);
      if (specialty) query = query.eq('specialty', specialty);
      if (seniority) query = query.eq('seniority', seniority);

      if (search) {
        const safe = search.replace(/[%(),.]/g, '');
        query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%,specialty.ilike.%${safe}%`);
      }

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Busca talento por ID
     */
    async getById(id) {
      const { data, error } = await _db().from('talents')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria novo talento
     */
    async create(talent) {
      const { data, error } = await _db().from('talents')
        .insert({
          ...talent,
          tenant_id: _tid(),
          created_by: _uid(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza talento
     */
    async update(id, updates) {
      const { data, error } = await _db().from('talents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Arquiva talento (soft delete)
     */
    async archive(id) {
      return this.update(id, { status: 'archived' });
    },

    /**
     * Busca por nome ou email
     */
    async search(query, limit = 20) {
      const safe = query.replace(/[%(),.]/g, '');
      const { data, error } = await _db().from('talents')
        .select('id, full_name, email, specialty, seniority, status')
        .eq('tenant_id', _tid())
        .neq('status', 'archived')
        .or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`)
        .limit(limit);

      if (error) throw error;
      return data || [];
    },

    /**
     * Talentos vinculados a uma vaga (via vacancy_candidates)
     */
    async getByVacancy(vacancyId) {
      const { data, error } = await _db().from('vacancy_candidates')
        .select('id, stage, notes, linked_at, talent_id, talents(id, full_name, email, phone, specialty, seniority, city, state, status)')
        .eq('tenant_id', _tid())
        .eq('vacancy_id', vacancyId)
        .order('linked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Vincula talento a uma vaga
     */
    async linkToVacancy(talentId, vacancyId, stage = 'applied') {
      const { data, error } = await _db().from('vacancy_candidates')
        .insert({
          tenant_id: _tid(),
          talent_id: talentId,
          vacancy_id: vacancyId,
          stage,
          linked_by: _uid(),
          linked_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Desvincula talento de uma vaga
     */
    async unlinkFromVacancy(talentId, vacancyId) {
      const { error } = await _db().from('vacancy_candidates')
        .delete()
        .eq('tenant_id', _tid())
        .eq('talent_id', talentId)
        .eq('vacancy_id', vacancyId);

      if (error) throw error;
      return true;
    },

    /**
     * Atualiza stage do candidato numa vaga
     */
    async updateCandidateStage(talentId, vacancyId, stage, notes) {
      const updates = { stage };
      if (notes !== undefined) updates.notes = notes;

      const { data, error } = await _db().from('vacancy_candidates')
        .update(updates)
        .eq('tenant_id', _tid())
        .eq('talent_id', talentId)
        .eq('vacancy_id', vacancyId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TalentsRepo = TalentsRepo;
}
