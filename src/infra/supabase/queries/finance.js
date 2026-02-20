/**
 * TBO OS — Repository: Finance
 *
 * Queries centralizadas para transações financeiras,
 * categorias, centros de custo, contas.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const FinanceRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    /**
     * Lista transações com filtros
     */
    async listTransactions({ type, category_id, from_date, to_date, limit = 100, offset = 0 } = {}) {
      let query = _db().from('financial_transactions')
        .select('*, category:financial_categories(name, color)')
        .eq('tenant_id', _tid())
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) query = query.eq('type', type);
      if (category_id) query = query.eq('category_id', category_id);
      if (from_date) query = query.gte('date', from_date);
      if (to_date) query = query.lte('date', to_date);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    /**
     * Cria transação
     */
    async createTransaction(transaction) {
      const tid = _tid();
      const { data, error } = await _db().from('financial_transactions')
        .insert({ ...transaction, tenant_id: tid })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Lista categorias financeiras
     */
    async listCategories(type = null) {
      let query = _db().from('financial_categories')
        .select('*')
        .eq('tenant_id', _tid())
        .order('name');

      if (type) query = query.eq('type', type);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    /**
     * Lista centros de custo
     */
    async listCostCenters() {
      const { data, error } = await _db().from('cost_centers')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    },

    /**
     * Lista contas bancárias
     */
    async listAccounts() {
      const { data, error } = await _db().from('bank_accounts')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FinanceRepo = FinanceRepo;
}
