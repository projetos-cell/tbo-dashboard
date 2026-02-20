/**
 * TBO OS — Repository: CRM (Deals, Clients, Pipeline)
 *
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const CrmRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    async listDeals({ status, limit = 100, offset = 0 } = {}) {
      let query = _db().from('crm_deals')
        .select('*, client:clients(name)')
        .eq('tenant_id', _tid())
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getDeal(id) {
      const { data, error } = await _db().from('crm_deals')
        .select('*, client:clients(*)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    async createDeal(deal) {
      const tid = _tid();
      const { data, error } = await _db().from('crm_deals')
        .insert({ ...deal, tenant_id: tid })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateDeal(id, updates) {
      const { data, error } = await _db().from('crm_deals')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async listClients({ limit = 200 } = {}) {
      const { data, error } = await _db().from('clients')
        .select('*')
        .eq('tenant_id', _tid())
        .order('name')
        .limit(limit);

      if (error) throw error;
      return data;
    },

    async getClient(id) {
      const { data, error } = await _db().from('clients')
        .select('*, deals:crm_deals(id, name, status, value)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    async createClient(client) {
      const tid = _tid();
      const { data, error } = await _db().from('clients')
        .insert({ ...client, tenant_id: tid })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.CrmRepo = CrmRepo;
}
