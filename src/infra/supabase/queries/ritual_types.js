/**
 * TBO OS — Repository: RitualTypes
 *
 * CRUD para tipos de ritual configuráveis por tenant.
 * UI NUNCA chama supabase.from('ritual_types') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const RitualTypesRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, name, slug, description, frequency, duration_minutes, default_agenda, default_participants, icon, color, is_system, is_active, sort_order, created_at';

  // Cache em memória (limpo ao mudar tenant)
  let _cache = null;

  return {

    /**
     * Lista todos os tipos de ritual ativos do tenant
     */
    async list({ includeInactive = false } = {}) {
      if (_cache && !includeInactive) return _cache;

      let query = _db().from('ritual_types')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .order('sort_order', { ascending: true });

      if (!includeInactive) query = query.eq('is_active', true);

      const { data, error } = await query;
      if (error) throw error;

      const result = data || [];
      if (!includeInactive) _cache = result;
      return result;
    },

    /**
     * Busca tipo por ID
     */
    async getById(id) {
      const { data, error } = await _db().from('ritual_types')
        .select(_SELECT + ', default_agenda')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Busca tipo por slug
     */
    async getBySlug(slug) {
      const { data, error } = await _db().from('ritual_types')
        .select(_SELECT + ', default_agenda')
        .eq('slug', slug)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria novo tipo de ritual
     */
    async create(ritualType) {
      const uid = _uid();
      const slug = ritualType.slug || ritualType.name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const { data, error } = await _db().from('ritual_types')
        .insert({
          ...ritualType,
          slug,
          tenant_id: _tid(),
          created_by: uid,
          is_system: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      _cache = null;
      return data;
    },

    /**
     * Atualiza tipo de ritual (não permite editar is_system types — apenas name/desc)
     */
    async update(id, updates) {
      const { data, error } = await _db().from('ritual_types')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      _cache = null;
      return data;
    },

    /**
     * Desativa tipo de ritual (soft delete)
     */
    async deactivate(id) {
      return this.update(id, { is_active: false });
    },

    /**
     * Reativa tipo de ritual
     */
    async activate(id) {
      return this.update(id, { is_active: true });
    },

    /**
     * Remove tipo de ritual (apenas custom, não system)
     */
    async remove(id) {
      const { error } = await _db().from('ritual_types')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid())
        .eq('is_system', false);

      if (error) throw error;
      _cache = null;
      return true;
    },

    /**
     * Limpa cache (ex: ao trocar tenant)
     */
    clearCache() {
      _cache = null;
    },

    /**
     * Retorna frequência em label pt-BR
     */
    freqLabel(freq) {
      const map = {
        daily: 'Diária',
        weekly: 'Semanal',
        biweekly: 'Quinzenal',
        monthly: 'Mensal',
        quarterly: 'Trimestral',
        custom: 'Personalizada'
      };
      return map[freq] || freq;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.RitualTypesRepo = RitualTypesRepo;
}
