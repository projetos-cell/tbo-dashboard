/**
 * TBO OS — Repository: People (Profiles)
 *
 * Queries centralizadas para profiles/pessoas.
 * UI NUNCA chama supabase.from('profiles') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const PeopleRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Lista todos os membros do tenant
     */
    async list({ role, is_active = true, limit = 100 } = {}) {
      let query = _db().from('profiles')
        .select('id, full_name, email, role, avatar_url, is_active, department, position, created_at')
        .eq('tenant_id', _tid())
        .order('full_name');

      if (is_active !== null) query = query.eq('is_active', is_active);
      if (role) query = query.eq('role', role);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    /**
     * Busca perfil por ID
     */
    async getById(id) {
      const { data, error } = await _db().from('profiles')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza perfil
     */
    async update(id, updates) {
      const { data, error } = await _db().from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Busca por nome ou email
     */
    async search(query, limit = 20) {
      const { data, error } = await _db().from('profiles')
        .select('id, full_name, email, avatar_url, role')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data;
    },

    /**
     * Retorna permissões do usuário via RPC
     * SEGURANÇA: valida que userId pertence ao tenant antes de chamar RPC
     */
    async getPermissions(userId) {
      const tid = _tid();

      // Valida que o userId pertence ao mesmo tenant
      const { data: profile, error: profileError } = await _db().from('profiles')
        .select('id')
        .eq('id', userId)
        .eq('tenant_id', tid)
        .single();

      if (profileError || !profile) {
        throw new Error(`[PeopleRepo] Usuário ${userId} não pertence ao tenant ou não existe`);
      }

      const { data, error } = await _db().rpc('get_user_permissions', { p_user_id: userId });
      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.PeopleRepo = PeopleRepo;
}
