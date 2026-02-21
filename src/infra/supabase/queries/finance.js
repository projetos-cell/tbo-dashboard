/**
 * TBO OS — Repository: Finance (v3.1 — Integracao Omie)
 *
 * CRUD completo para módulo financeiro + upserts Omie.
 * Tabelas reais: fin_payables, fin_receivables, fin_transactions,
 *                fin_categories, fin_cost_centers, fin_vendors,
 *                fin_clients, fin_balance_snapshots, omie_sync_log.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const FinanceRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      // supabaseId e o UUID real; id pode ser slug (ex: "marco")
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  return {

    // ═══════════════════════════════════════════════════════════
    // TRANSACTIONS (Lançamentos)
    // ═══════════════════════════════════════════════════════════

    async listTransactions({ type, status, from_date, to_date, limit = 100, offset = 0 } = {}) {
      let q = _db().from('fin_transactions')
        .select('*, category:fin_categories(name, color), cost_center:fin_cost_centers(name), vendor:fin_vendors(name), client:fin_clients(name)')
        .eq('tenant_id', _tid())
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) q = q.eq('type', type);
      if (status) q = q.eq('status', status);
      if (from_date) q = q.gte('date', from_date);
      if (to_date) q = q.lte('date', to_date);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async createTransaction(transaction) {
      const { data, error } = await _db().from('fin_transactions')
        .insert({ ...transaction, tenant_id: _tid(), created_by: _uid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // PAYABLES (Contas a Pagar)
    // ═══════════════════════════════════════════════════════════

    async listPayables({ status, vendor_id, cost_center_id, project_id, from_date, to_date, search, limit = 100, offset = 0 } = {}) {
      let q = _db().from('fin_payables')
        .select('*, vendor:fin_vendors(name, cnpj), category:fin_categories(name, color), cost_center:fin_cost_centers(name, slug, category), project:projects(name)')
        .eq('tenant_id', _tid())
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (status) q = q.eq('status', status);
      if (vendor_id) q = q.eq('vendor_id', vendor_id);
      if (cost_center_id) q = q.eq('cost_center_id', cost_center_id);
      if (project_id) q = q.eq('project_id', project_id);
      if (from_date) q = q.gte('due_date', from_date);
      if (to_date) q = q.lte('due_date', to_date);
      if (search) q = q.ilike('description', `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async getPayable(id) {
      const { data, error } = await _db().from('fin_payables')
        .select('*, vendor:fin_vendors(name, cnpj, email), category:fin_categories(name, color), cost_center:fin_cost_centers(name, slug, category), project:projects(name)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();
      if (error) throw error;
      return data;
    },

    async createPayable(payable) {
      const { data, error } = await _db().from('fin_payables')
        .insert({ ...payable, tenant_id: _tid(), created_by: _uid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updatePayable(id, updates) {
      const { data, error } = await _db().from('fin_payables')
        .update({ ...updates, updated_by: _uid(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Soft delete: muda status para 'cancelado'
     */
    async deletePayable(id) {
      return this.updatePayable(id, { status: 'cancelado' });
    },

    // ═══════════════════════════════════════════════════════════
    // RECEIVABLES (Contas a Receber)
    // ═══════════════════════════════════════════════════════════

    async listReceivables({ status, client_id, project_id, from_date, to_date, search, limit = 100, offset = 0 } = {}) {
      let q = _db().from('fin_receivables')
        .select('*, client:fin_clients(name, cnpj), project:projects(name)')
        .eq('tenant_id', _tid())
        .order('due_date', { ascending: true })
        .range(offset, offset + limit - 1);

      if (status) q = q.eq('status', status);
      if (client_id) q = q.eq('client_id', client_id);
      if (project_id) q = q.eq('project_id', project_id);
      if (from_date) q = q.gte('due_date', from_date);
      if (to_date) q = q.lte('due_date', to_date);
      if (search) q = q.ilike('description', `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async getReceivable(id) {
      const { data, error } = await _db().from('fin_receivables')
        .select('*, client:fin_clients(name, cnpj, email), project:projects(name)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();
      if (error) throw error;
      return data;
    },

    async createReceivable(receivable) {
      const { data, error } = await _db().from('fin_receivables')
        .insert({ ...receivable, tenant_id: _tid(), created_by: _uid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateReceivable(id, updates) {
      const { data, error } = await _db().from('fin_receivables')
        .update({ ...updates, updated_by: _uid(), updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteReceivable(id) {
      return this.updateReceivable(id, { status: 'cancelado' });
    },

    // ═══════════════════════════════════════════════════════════
    // CATEGORIES (Categorias financeiras)
    // ═══════════════════════════════════════════════════════════

    async listCategories(type = null) {
      let q = _db().from('fin_categories')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name');

      if (type) q = q.eq('type', type);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // COST CENTERS (Centros de custo)
    // ═══════════════════════════════════════════════════════════

    async listCostCenters() {
      const { data, error } = await _db().from('fin_cost_centers')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },

    async createCostCenter(cc) {
      const { data, error } = await _db().from('fin_cost_centers')
        .insert({ ...cc, tenant_id: _tid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateCostCenter(id, updates) {
      const { data, error } = await _db().from('fin_cost_centers')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // VENDORS (Fornecedores)
    // ═══════════════════════════════════════════════════════════

    async listVendors({ search, limit = 100 } = {}) {
      let q = _db().from('fin_vendors')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name')
        .limit(limit);

      if (search) q = q.ilike('name', `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async createVendor(vendor) {
      const { data, error } = await _db().from('fin_vendors')
        .insert({ ...vendor, tenant_id: _tid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateVendor(id, updates) {
      const { data, error } = await _db().from('fin_vendors')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // CLIENTS (Clientes financeiros)
    // ═══════════════════════════════════════════════════════════

    async listClients({ search, limit = 100 } = {}) {
      let q = _db().from('fin_clients')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name')
        .limit(limit);

      if (search) q = q.ilike('name', `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data;
    },

    async createClient(client) {
      const { data, error } = await _db().from('fin_clients')
        .insert({ ...client, tenant_id: _tid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateClient(id, updates) {
      const { data, error } = await _db().from('fin_clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // BALANCE SNAPSHOTS (Saldo manual)
    // ═══════════════════════════════════════════════════════════

    async getLatestBalance() {
      const { data, error } = await _db().from('fin_balance_snapshots')
        .select('*')
        .eq('tenant_id', _tid())
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async recordBalance(balance, note = '') {
      const { data, error } = await _db().from('fin_balance_snapshots')
        .insert({ tenant_id: _tid(), balance, note, recorded_by: _uid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // DASHBOARD KPIs
    // ═══════════════════════════════════════════════════════════

    /**
     * Retorna KPIs consolidados para o dashboard financeiro.
     * Tudo em uma única chamada para minimizar round-trips.
     */
    async getDashboardKPIs() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];
      const in30d = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

      // Executar queries em paralelo
      const [
        balanceRes,
        receivables30dRes,
        payables30dRes,
        overduePayablesRes,
        overdueReceivablesRes,
        topCostCentersRes,
        topProjectsRes
      ] = await Promise.all([
        // Saldo atual (último snapshot)
        _db().from('fin_balance_snapshots')
          .select('balance, recorded_at')
          .eq('tenant_id', tid)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // A receber nos próximos 30 dias
        _db().from('fin_receivables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['previsto', 'emitido', 'aberto', 'parcial'])
          .gte('due_date', today)
          .lte('due_date', in30d),

        // A pagar nos próximos 30 dias
        _db().from('fin_payables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['rascunho', 'aguardando_aprovacao', 'aprovado', 'aberto', 'parcial'])
          .gte('due_date', today)
          .lte('due_date', in30d),

        // Contas a pagar vencidas
        _db().from('fin_payables')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado'])
          .lt('due_date', today),

        // Contas a receber vencidas
        _db().from('fin_receivables')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido'])
          .lt('due_date', today),

        // Top centros de custo (mês atual) — via payables
        _db().from('fin_payables')
          .select('cost_center_id, amount, cost_center:fin_cost_centers(name)')
          .eq('tenant_id', tid)
          .not('cost_center_id', 'is', null)
          .gte('due_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .lte('due_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]),

        // Top projetos (mês atual) — via payables
        _db().from('fin_payables')
          .select('project_id, amount, project:projects(name)')
          .eq('tenant_id', tid)
          .not('project_id', 'is', null)
          .gte('due_date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
          .lte('due_date', new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0])
      ]);

      // Calcular totais
      const saldoAtual = balanceRes.data?.balance || 0;
      const saldoDate = balanceRes.data?.recorded_at || null;

      const aReceber30d = (receivables30dRes.data || []).reduce((s, r) => s + (r.amount - (r.amount_paid || 0)), 0);
      const aPagar30d = (payables30dRes.data || []).reduce((s, p) => s + (p.amount - (p.amount_paid || 0)), 0);
      const saldoProjetado = saldoAtual + aReceber30d - aPagar30d;

      const vencidasPagar = overduePayablesRes.count || 0;
      const vencidasReceber = overdueReceivablesRes.count || 0;

      // Agregar top centros de custo
      const ccMap = {};
      (topCostCentersRes.data || []).forEach(p => {
        const name = p.cost_center?.name || 'Sem CC';
        ccMap[name] = (ccMap[name] || 0) + (p.amount || 0);
      });
      const topCostCenters = Object.entries(ccMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Agregar top projetos
      const projMap = {};
      (topProjectsRes.data || []).forEach(p => {
        const name = p.project?.name || 'Sem Projeto';
        projMap[name] = (projMap[name] || 0) + (p.amount || 0);
      });
      const topProjects = Object.entries(projMap)
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      return {
        saldoAtual,
        saldoDate,
        aReceber30d,
        aPagar30d,
        saldoProjetado,
        vencidasPagar,
        vencidasReceber,
        topCostCenters,
        topProjects
      };
    },

    // ═══════════════════════════════════════════════════════════
    // PJ PAYROLL (Folha PJ)
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista colaboradores PJ ativos do profiles
     */
    async listPJCollaborators() {
      const { data, error } = await _db().from('profiles')
        .select('id, full_name, role_slug, salary_pj, document_cnpj')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .eq('contract_type', 'pj')
        .order('full_name');
      if (error) throw error;
      return data;
    },

    /**
     * Gera batch de fin_payables para PJ do mês.
     * Dedup: verifica se já existe payable com description contendo "Folha PJ" + mês/ano
     * @param {number} month - Mês (1-12)
     * @param {number} year - Ano (ex: 2026)
     */
    async generatePayroll(month, year) {
      const tid = _tid();
      const uid = _uid();
      const monthStr = String(month).padStart(2, '0');
      const dedupeTag = `Folha PJ ${monthStr}/${year}`;

      // Verificar se já existe
      const { data: existing } = await _db().from('fin_payables')
        .select('id')
        .eq('tenant_id', tid)
        .ilike('description', `%${dedupeTag}%`)
        .neq('status', 'cancelado')
        .limit(1);

      if (existing && existing.length > 0) {
        return { created: 0, message: `Folha PJ ${monthStr}/${year} já foi gerada.`, existing: true };
      }

      // Buscar PJs ativos
      const pjs = await this.listPJCollaborators();
      if (!pjs || pjs.length === 0) {
        return { created: 0, message: 'Nenhum colaborador PJ ativo encontrado.', existing: false };
      }

      // Buscar centro de custo "equipe-pessoas"
      const { data: ccData } = await _db().from('fin_cost_centers')
        .select('id')
        .eq('tenant_id', tid)
        .eq('slug', 'equipe-pessoas')
        .maybeSingle();

      // Buscar categoria "folha-pagamento"
      const { data: catData } = await _db().from('fin_categories')
        .select('id')
        .eq('tenant_id', tid)
        .eq('slug', 'folha-pagamento')
        .maybeSingle();

      // Data de vencimento: dia 15 do mês
      const dueDate = `${year}-${monthStr}-15`;

      // Criar payables em batch
      const rows = pjs.map(pj => ({
        tenant_id: tid,
        description: `${dedupeTag} — ${pj.full_name}`,
        amount: pj.salary_pj || 0,
        amount_paid: 0,
        due_date: dueDate,
        status: 'rascunho',
        cost_center_id: ccData?.id || null,
        category_id: catData?.id || null,
        notes: `CNPJ: ${pj.document_cnpj || 'N/A'} | Cargo: ${pj.role_slug || 'N/A'}`,
        created_by: uid
      }));

      const { data, error } = await _db().from('fin_payables')
        .insert(rows)
        .select();

      if (error) throw error;
      return { created: data.length, message: `${data.length} contas a pagar criadas para ${dedupeTag}.`, existing: false };
    },

    // ═══════════════════════════════════════════════════════════
    // CAIXA — Fluxo de Caixa projetado (30 dias)
    // ═══════════════════════════════════════════════════════════

    /**
     * Retorna entradas e saídas agrupadas por dia para os próximos N dias.
     * Usado pela tab Caixa para montar a projeção de fluxo.
     * @param {number} days - Número de dias a projetar (padrão: 30)
     */
    async getCashFlow(days = 30) {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

      const [payablesRes, receivablesRes, balanceRes] = await Promise.all([
        // Saídas previstas (a pagar não quitadas)
        _db().from('fin_payables')
          .select('due_date, amount, amount_paid, description, status, vendor:fin_vendors(name)')
          .eq('tenant_id', tid)
          .in('status', ['rascunho', 'aguardando_aprovacao', 'aprovado', 'aberto', 'parcial'])
          .gte('due_date', today)
          .lte('due_date', endDate)
          .order('due_date', { ascending: true }),

        // Entradas previstas (a receber não quitadas)
        _db().from('fin_receivables')
          .select('due_date, amount, amount_paid, description, status, client:fin_clients(name)')
          .eq('tenant_id', tid)
          .in('status', ['previsto', 'emitido', 'aberto', 'parcial'])
          .gte('due_date', today)
          .lte('due_date', endDate)
          .order('due_date', { ascending: true }),

        // Saldo atual
        _db().from('fin_balance_snapshots')
          .select('balance, recorded_at')
          .eq('tenant_id', tid)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      if (payablesRes.error) throw payablesRes.error;
      if (receivablesRes.error) throw receivablesRes.error;

      return {
        saldoInicial: balanceRes.data?.balance || 0,
        saldoDate: balanceRes.data?.recorded_at || null,
        saidas: payablesRes.data || [],
        entradas: receivablesRes.data || []
      };
    },

    // ═══════════════════════════════════════════════════════════
    // INBOX — Pendências automáticas
    // ═══════════════════════════════════════════════════════════

    /**
     * Retorna lista de pendências financeiras agrupadas por tipo.
     * Tipos: sem_cc (payables sem centro de custo), vencidas_pagar,
     *        vencidas_receber, aguardando_aprovacao, sem_projeto.
     */
    async getInboxItems() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];

      const [semCCRes, vencidasPagarRes, vencidasReceberRes, aguardandoRes, semProjetoRes] = await Promise.all([
        // Payables sem centro de custo
        _db().from('fin_payables')
          .select('id, description, amount, due_date, status, vendor:fin_vendors(name)')
          .eq('tenant_id', tid)
          .is('cost_center_id', null)
          .not('status', 'in', '("pago","cancelado")')
          .order('due_date', { ascending: true })
          .limit(20),

        // Payables vencidas
        _db().from('fin_payables')
          .select('id, description, amount, amount_paid, due_date, status, vendor:fin_vendors(name)')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado'])
          .lt('due_date', today)
          .order('due_date', { ascending: true })
          .limit(20),

        // Receivables vencidas
        _db().from('fin_receivables')
          .select('id, description, amount, amount_paid, due_date, status, client:fin_clients(name)')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido'])
          .lt('due_date', today)
          .order('due_date', { ascending: true })
          .limit(20),

        // Payables aguardando aprovação
        _db().from('fin_payables')
          .select('id, description, amount, due_date, status, vendor:fin_vendors(name), created_by')
          .eq('tenant_id', tid)
          .eq('status', 'aguardando_aprovacao')
          .order('created_at', { ascending: false })
          .limit(20),

        // Payables de CC que requer projeto, mas sem project_id
        _db().from('fin_payables')
          .select('id, description, amount, due_date, status, cost_center:fin_cost_centers(name, requires_project)')
          .eq('tenant_id', tid)
          .is('project_id', null)
          .not('status', 'in', '("pago","cancelado")')
          .not('cost_center_id', 'is', null)
          .order('due_date', { ascending: true })
          .limit(30)
      ]);

      // Filtrar sem_projeto: somente se o CC requer projeto
      const semProjeto = (semProjetoRes.data || []).filter(
        p => p.cost_center?.requires_project === true
      );

      return {
        sem_cc: semCCRes.data || [],
        vencidas_pagar: vencidasPagarRes.data || [],
        vencidas_receber: vencidasReceberRes.data || [],
        aguardando_aprovacao: aguardandoRes.data || [],
        sem_projeto: semProjeto
      };
    },

    // ═══════════════════════════════════════════════════════════
    // CADASTROS — Deactivar (soft delete)
    // ═══════════════════════════════════════════════════════════

    async deactivateVendor(id) {
      return this.updateVendor(id, { is_active: false });
    },

    async deactivateClient(id) {
      return this.updateClient(id, { is_active: false });
    },

    async deactivateCostCenter(id) {
      return this.updateCostCenter(id, { is_active: false });
    },

    // ═══════════════════════════════════════════════════════════
    // OMIE — Upserts por omie_id (Integracao Omie ERP)
    // ═══════════════════════════════════════════════════════════

    /**
     * Upsert fornecedor pelo omie_id.
     * Se ja existe com mesmo tenant_id+omie_id, atualiza. Senao, insere.
     */
    async upsertVendorByOmieId(omieId, vendorData) {
      const tid = _tid();
      const row = {
        ...vendorData,
        tenant_id: tid,
        omie_id: String(omieId),
        omie_synced_at: new Date().toISOString(),
        is_active: true
      };
      const { data, error } = await _db().from('fin_vendors')
        .upsert(row, { onConflict: 'tenant_id,omie_id', ignoreDuplicates: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Upsert cliente pelo omie_id.
     */
    async upsertClientByOmieId(omieId, clientData) {
      const tid = _tid();
      const row = {
        ...clientData,
        tenant_id: tid,
        omie_id: String(omieId),
        omie_synced_at: new Date().toISOString(),
        is_active: true
      };
      const { data, error } = await _db().from('fin_clients')
        .upsert(row, { onConflict: 'tenant_id,omie_id', ignoreDuplicates: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Upsert conta a pagar pelo omie_id.
     */
    async upsertPayableByOmieId(omieId, payData) {
      const tid = _tid();
      const row = {
        ...payData,
        tenant_id: tid,
        omie_id: String(omieId),
        omie_synced_at: new Date().toISOString()
      };
      const { data, error } = await _db().from('fin_payables')
        .upsert(row, { onConflict: 'tenant_id,omie_id', ignoreDuplicates: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Upsert conta a receber pelo omie_id.
     */
    async upsertReceivableByOmieId(omieId, recData) {
      const tid = _tid();
      const row = {
        ...recData,
        tenant_id: tid,
        omie_id: String(omieId),
        omie_synced_at: new Date().toISOString()
      };
      const { data, error } = await _db().from('fin_receivables')
        .upsert(row, { onConflict: 'tenant_id,omie_id', ignoreDuplicates: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ── Lookups por omie_id ──

    async findVendorByOmieId(omieId) {
      const { data, error } = await _db().from('fin_vendors')
        .select('id, name, omie_id')
        .eq('tenant_id', _tid())
        .eq('omie_id', String(omieId))
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async findClientByOmieId(omieId) {
      const { data, error } = await _db().from('fin_clients')
        .select('id, name, omie_id')
        .eq('tenant_id', _tid())
        .eq('omie_id', String(omieId))
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    // ── Omie Sync Log ──

    async createSyncLog(logData = {}) {
      const { data, error } = await _db().from('omie_sync_log')
        .insert({ ...logData, tenant_id: _tid(), triggered_by: _uid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateSyncLog(id, updates) {
      const { data, error } = await _db().from('omie_sync_log')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getLatestSyncLog() {
      const { data, error } = await _db().from('omie_sync_log')
        .select('*')
        .eq('tenant_id', _tid())
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    async listSyncLogs(limit = 10) {
      const { data, error } = await _db().from('omie_sync_log')
        .select('*')
        .eq('tenant_id', _tid())
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Relatorios avancados do Dashboard
    // ═══════════════════════════════════════════════════════════

    /**
     * Composicao de custos: despesas agrupadas por categoria e centro de custo.
     * Retorna totais por categoria + por centro de custo para donut chart + tabela.
     */
    async getCostComposition() {
      const tid = _tid();

      const [byCatRes, byCCRes] = await Promise.all([
        // Despesas por categoria (todas nao canceladas)
        _db().from('fin_payables')
          .select('category_id, amount, status, category:fin_categories(name, color)')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado'),

        // Despesas por centro de custo
        _db().from('fin_payables')
          .select('cost_center_id, amount, status, cost_center:fin_cost_centers(name, slug, category)')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
      ]);

      if (byCatRes.error) throw byCatRes.error;
      if (byCCRes.error) throw byCCRes.error;

      // Agregar por categoria
      const catMap = {};
      (byCatRes.data || []).forEach(p => {
        const name = p.category?.name || 'Sem Categoria';
        const color = p.category?.color || '#6b7280';
        if (!catMap[name]) catMap[name] = { name, color, total: 0, count: 0, pago: 0 };
        catMap[name].total += p.amount || 0;
        catMap[name].count++;
        if (p.status === 'pago') catMap[name].pago += p.amount || 0;
      });
      const byCategory = Object.values(catMap).sort((a, b) => b.total - a.total);

      // Agregar por centro de custo
      const ccMap = {};
      (byCCRes.data || []).forEach(p => {
        const name = p.cost_center?.name || 'Sem Centro de Custo';
        const group = p.cost_center?.category || 'outros';
        if (!ccMap[name]) ccMap[name] = { name, group, total: 0, count: 0, pago: 0 };
        ccMap[name].total += p.amount || 0;
        ccMap[name].count++;
        if (p.status === 'pago') ccMap[name].pago += p.amount || 0;
      });
      const byCostCenter = Object.values(ccMap).sort((a, b) => b.total - a.total);

      const totalDespesas = byCategory.reduce((s, c) => s + c.total, 0);

      return { byCategory, byCostCenter, totalDespesas };
    },

    /**
     * Inadimplencia detalhada por cliente.
     * Retorna lista de clientes com parcelas atrasadas, valores e aging.
     */
    async getDelinquencyByClient() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];

      // Todas as recebiveis vencidas (nao pagas/canceladas)
      const { data, error } = await _db().from('fin_receivables')
        .select('id, description, amount, amount_paid, due_date, status, client_id, client:fin_clients(name, cnpj, email, phone)')
        .eq('tenant_id', tid)
        .in('status', ['aberto', 'parcial', 'emitido'])
        .lt('due_date', today)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Agregar por cliente
      const clientMap = {};
      (data || []).forEach(r => {
        const clientId = r.client_id || 'sem_cliente';
        const clientName = r.client?.name || 'Sem Cliente';
        if (!clientMap[clientId]) {
          clientMap[clientId] = {
            clientId,
            clientName,
            cnpj: r.client?.cnpj || '',
            email: r.client?.email || '',
            phone: r.client?.phone || '',
            totalOverdue: 0,
            count: 0,
            oldestDueDate: r.due_date,
            items: []
          };
        }
        const saldo = (r.amount || 0) - (r.amount_paid || 0);
        clientMap[clientId].totalOverdue += saldo;
        clientMap[clientId].count++;
        if (r.due_date < clientMap[clientId].oldestDueDate) {
          clientMap[clientId].oldestDueDate = r.due_date;
        }
        clientMap[clientId].items.push({
          id: r.id,
          description: r.description,
          amount: r.amount,
          amountPaid: r.amount_paid || 0,
          saldo,
          dueDate: r.due_date,
          status: r.status
        });
      });

      // Calcular dias de atraso e ordenar por total
      const clients = Object.values(clientMap).map(c => {
        const daysOverdue = Math.ceil((new Date(today) - new Date(c.oldestDueDate)) / 86400000);
        return { ...c, daysOverdue };
      }).sort((a, b) => b.totalOverdue - a.totalOverdue);

      const totalOverdue = clients.reduce((s, c) => s + c.totalOverdue, 0);
      const totalCount = clients.reduce((s, c) => s + c.count, 0);

      return { clients, totalOverdue, totalCount };
    },

    /**
     * Dados consolidados para calculo de saude financeira.
     * Retorna receita total, despesa total, resultado, inadimplencia, etc.
     */
    async getFinancialHealthData() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
      const in30d = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

      const [
        allPayablesRes,
        allReceivablesRes,
        overduePayRes,
        overdueRecRes,
        paidPayRes,
        paidRecRes,
        recentPayRes,
        balanceRes
      ] = await Promise.all([
        // Total despesas (nao cancelado)
        _db().from('fin_payables')
          .select('amount, status')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado'),

        // Total receitas (nao cancelado)
        _db().from('fin_receivables')
          .select('amount, status')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado'),

        // Despesas atrasadas
        _db().from('fin_payables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado'])
          .lt('due_date', today),

        // Receitas atrasadas
        _db().from('fin_receivables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido'])
          .lt('due_date', today),

        // Despesas pagas (ultimos 90 dias para tendencia)
        _db().from('fin_payables')
          .select('amount, paid_date, due_date')
          .eq('tenant_id', tid)
          .eq('status', 'pago')
          .gte('paid_date', new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]),

        // Receitas pagas (ultimos 90 dias)
        _db().from('fin_receivables')
          .select('amount, paid_date, due_date')
          .eq('tenant_id', tid)
          .eq('status', 'pago')
          .gte('paid_date', new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]),

        // Contas a pagar proximos 30 dias
        _db().from('fin_payables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado', 'rascunho', 'aguardando_aprovacao'])
          .gte('due_date', today)
          .lte('due_date', in30d),

        // Saldo
        _db().from('fin_balance_snapshots')
          .select('balance')
          .eq('tenant_id', tid)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      // Totais gerais
      const receitaTotal = (allReceivablesRes.data || []).reduce((s, r) => s + (r.amount || 0), 0);
      const despesaTotal = (allPayablesRes.data || []).reduce((s, p) => s + (p.amount || 0), 0);
      const resultado = receitaTotal - despesaTotal;
      const margem = receitaTotal > 0 ? ((resultado / receitaTotal) * 100) : 0;

      // Inadimplencia
      const overduePayTotal = (overduePayRes.data || []).reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);
      const overdueRecTotal = (overdueRecRes.data || []).reduce((s, r) => s + ((r.amount || 0) - (r.amount_paid || 0)), 0);

      // Pagamentos em dia (ratio)
      const totalPaid = (paidPayRes.data || []).length;
      const paidOnTime = (paidPayRes.data || []).filter(p => p.paid_date && p.due_date && p.paid_date <= p.due_date).length;
      const paymentOnTimeRatio = totalPaid > 0 ? (paidOnTime / totalPaid) : 1;

      // Recebimentos em dia
      const totalReceived = (paidRecRes.data || []).length;
      const receivedOnTime = (paidRecRes.data || []).filter(r => r.paid_date && r.due_date && r.paid_date <= r.due_date).length;
      const collectionOnTimeRatio = totalReceived > 0 ? (receivedOnTime / totalReceived) : 1;

      // Compromissos proximos 30d
      const upcoming30d = (recentPayRes.data || []).reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);

      // Saldo
      const saldoAtual = balanceRes.data?.balance || 0;

      // Cobertura: saldo / compromissos 30d
      const cobertura30d = upcoming30d > 0 ? saldoAtual / upcoming30d : 999;

      // Contadores de status
      const statusCount = {};
      (allPayablesRes.data || []).forEach(p => {
        statusCount[p.status] = (statusCount[p.status] || 0) + 1;
      });

      return {
        receitaTotal,
        despesaTotal,
        resultado,
        margem,
        overduePayTotal,
        overdueRecTotal,
        paymentOnTimeRatio,
        collectionOnTimeRatio,
        upcoming30d,
        saldoAtual,
        cobertura30d,
        statusCount,
        totalPayables: (allPayablesRes.data || []).length,
        totalReceivables: (allReceivablesRes.data || []).length
      };
    },

    /**
     * Receita e Despesa mensais (para grafico temporal).
     * Agrupa por mes de vencimento.
     */
    async getMonthlyRevenueCost() {
      const tid = _tid();

      const [payRes, recRes] = await Promise.all([
        _db().from('fin_payables')
          .select('amount, due_date, status')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
          .order('due_date', { ascending: true }),

        _db().from('fin_receivables')
          .select('amount, due_date, status')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
          .order('due_date', { ascending: true })
      ]);

      if (payRes.error) throw payRes.error;
      if (recRes.error) throw recRes.error;

      // Agrupar por YYYY-MM
      const months = {};
      (recRes.data || []).forEach(r => {
        if (!r.due_date) return;
        const key = r.due_date.substring(0, 7); // YYYY-MM
        if (!months[key]) months[key] = { receita: 0, despesa: 0 };
        months[key].receita += r.amount || 0;
      });
      (payRes.data || []).forEach(p => {
        if (!p.due_date) return;
        const key = p.due_date.substring(0, 7);
        if (!months[key]) months[key] = { receita: 0, despesa: 0 };
        months[key].despesa += p.amount || 0;
      });

      // Ordenar por mes e retornar array
      const sorted = Object.entries(months)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, data]) => ({
          month,
          label: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          receita: data.receita,
          despesa: data.despesa,
          resultado: data.receita - data.despesa
        }));

      return sorted;
    },

    /**
     * Detalhamento por cliente: receita, parcelas, % pago, status.
     */
    async getClientBreakdown() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await _db().from('fin_receivables')
        .select('client_id, amount, amount_paid, status, due_date, client:fin_clients(name)')
        .eq('tenant_id', tid)
        .not('status', 'eq', 'cancelado');

      if (error) throw error;

      const clientMap = {};
      (data || []).forEach(r => {
        const clientId = r.client_id || 'sem_cliente';
        const name = r.client?.name || 'Sem Cliente';
        if (!clientMap[clientId]) {
          clientMap[clientId] = {
            clientId,
            name,
            receita: 0,
            parcelas: 0,
            pago: 0,
            emAberto: 0,
            atrasado: 0,
            atrasadoCount: 0
          };
        }
        clientMap[clientId].receita += r.amount || 0;
        clientMap[clientId].parcelas++;
        clientMap[clientId].pago += r.amount_paid || 0;
        if (r.status === 'pago') {
          clientMap[clientId].pago += (r.amount || 0) - (r.amount_paid || 0);
        }
        if (['aberto', 'parcial', 'emitido'].includes(r.status) && r.due_date < today) {
          clientMap[clientId].atrasado += (r.amount || 0) - (r.amount_paid || 0);
          clientMap[clientId].atrasadoCount++;
        } else if (['aberto', 'parcial', 'emitido', 'previsto'].includes(r.status)) {
          clientMap[clientId].emAberto += (r.amount || 0) - (r.amount_paid || 0);
        }
      });

      const clients = Object.values(clientMap).map(c => {
        const pctPago = c.receita > 0 ? Math.round((c.pago / c.receita) * 100) : 0;
        let statusLabel = 'Excelente';
        let statusColor = '#22c55e';
        if (c.atrasadoCount > 0) {
          statusLabel = 'Inadimplente';
          statusColor = '#ef4444';
        } else if (pctPago < 50) {
          statusLabel = 'Atencao';
          statusColor = '#f59e0b';
        } else if (pctPago >= 90) {
          statusLabel = 'Excelente';
          statusColor = '#22c55e';
        } else {
          statusLabel = 'Regular';
          statusColor = '#3b82f6';
        }
        return { ...c, pctPago, statusLabel, statusColor };
      }).sort((a, b) => b.receita - a.receita);

      const receitaTotal = clients.reduce((s, c) => s + c.receita, 0);
      const top5 = clients.slice(0, 5);
      const top5Total = top5.reduce((s, c) => s + c.receita, 0);
      const concentracaoTop5 = receitaTotal > 0 ? ((top5Total / receitaTotal) * 100).toFixed(1) : '0.0';
      const totalClientes = clients.filter(c => c.receita > 0).length;
      const ticketMedio = totalClientes > 0 ? receitaTotal / totalClientes : 0;

      return {
        clients,
        receitaTotal,
        concentracaoTop5,
        totalClientes,
        ticketMedio
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FinanceRepo = FinanceRepo;
}
