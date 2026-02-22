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
          .in('status', ['previsto', 'emitido', 'aberto', 'parcial', 'atrasado'])
          .gte('due_date', today)
          .lte('due_date', in30d),

        // A pagar nos próximos 30 dias
        _db().from('fin_payables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['rascunho', 'aguardando_aprovacao', 'aprovado', 'aberto', 'parcial', 'atrasado'])
          .gte('due_date', today)
          .lte('due_date', in30d),

        // Contas a pagar vencidas
        _db().from('fin_payables')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado'])
          .lt('due_date', today),

        // Contas a receber vencidas
        _db().from('fin_receivables')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido', 'atrasado'])
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
          .in('status', ['rascunho', 'aguardando_aprovacao', 'aprovado', 'aberto', 'parcial', 'atrasado'])
          .gte('due_date', today)
          .lte('due_date', endDate)
          .order('due_date', { ascending: true }),

        // Entradas previstas (a receber não quitadas)
        _db().from('fin_receivables')
          .select('due_date, amount, amount_paid, description, status, client:fin_clients(name)')
          .eq('tenant_id', tid)
          .in('status', ['previsto', 'emitido', 'aberto', 'parcial', 'atrasado'])
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
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado'])
          .lt('due_date', today)
          .order('due_date', { ascending: true })
          .limit(20),

        // Receivables vencidas
        _db().from('fin_receivables')
          .select('id, description, amount, amount_paid, due_date, status, client:fin_clients(name)')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido', 'atrasado'])
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
        .in('status', ['aberto', 'parcial', 'emitido', 'atrasado'])
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
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado'])
          .lt('due_date', today),

        // Receitas atrasadas
        _db().from('fin_receivables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido', 'atrasado'])
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
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado', 'rascunho', 'aguardando_aprovacao'])
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
        if (['aberto', 'parcial', 'emitido', 'atrasado'].includes(r.status) && r.due_date < today) {
          clientMap[clientId].atrasado += (r.amount || 0) - (r.amount_paid || 0);
          clientMap[clientId].atrasadoCount++;
        } else if (['aberto', 'parcial', 'emitido', 'previsto', 'atrasado'].includes(r.status)) {
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
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — DRE Gerencial
    // ═══════════════════════════════════════════════════════════

    /**
     * DRE Gerencial: receita bruta/liquida, COGS, margem bruta,
     * despesas operacionais por categoria, EBITDA, lucro liquido.
     * Periodo: mes especifico ou acumulado.
     */
    async getDREGerencial({ month, year } = {}) {
      const tid = _tid();
      const now = new Date();
      const m = month ?? now.getMonth();
      const y = year ?? now.getFullYear();
      const startDate = `${y}-${String(m + 1).padStart(2, '0')}-01`;
      const endDate = new Date(y, m + 1, 0).toISOString().split('T')[0];

      const [recRes, payRes] = await Promise.all([
        _db().from('fin_receivables')
          .select('amount, amount_paid, status, due_date, client_id, category_id, category:fin_categories(name)')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
          .gte('due_date', startDate)
          .lte('due_date', endDate),

        _db().from('fin_payables')
          .select('amount, amount_paid, status, due_date, vendor_id, category_id, cost_center_id, category:fin_categories(name), cost_center:fin_cost_centers(name, category)')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
          .gte('due_date', startDate)
          .lte('due_date', endDate)
      ]);

      if (recRes.error) throw recRes.error;
      if (payRes.error) throw payRes.error;

      const receivables = recRes.data || [];
      const payables = payRes.data || [];

      // Receita bruta = soma de todas as recebiveis do periodo
      const receitaBruta = receivables.reduce((s, r) => s + (r.amount || 0), 0);
      // Receita liquida = receita efetivamente recebida (pago)
      const receitaLiquida = receivables
        .filter(r => r.status === 'pago')
        .reduce((s, r) => s + (r.amount || 0), 0);

      // Separar custos diretos (COGS) vs despesas operacionais
      // COGS = payables com centro de custo categoria 'producao'|'projeto'|'direto'
      const cogsKeywords = ['producao', 'projeto', 'direto', 'freelancer', 'terceiro', 'material', 'insumo'];
      const cogs = [];
      const despesasOp = [];

      payables.forEach(p => {
        const ccCat = (p.cost_center?.category || '').toLowerCase();
        const catName = (p.category?.name || '').toLowerCase();
        const isCogs = cogsKeywords.some(k => ccCat.includes(k) || catName.includes(k));
        if (isCogs) {
          cogs.push(p);
        } else {
          despesasOp.push(p);
        }
      });

      const totalCogs = cogs.reduce((s, p) => s + (p.amount || 0), 0);
      const margemBruta = receitaBruta - totalCogs;
      const margemBrutaPct = receitaBruta > 0 ? (margemBruta / receitaBruta) * 100 : 0;

      // Despesas operacionais por categoria
      const despCatMap = {};
      despesasOp.forEach(p => {
        const name = p.category?.name || 'Sem Categoria';
        if (!despCatMap[name]) despCatMap[name] = { name, total: 0, count: 0 };
        despCatMap[name].total += p.amount || 0;
        despCatMap[name].count++;
      });
      const despesasPorCategoria = Object.values(despCatMap).sort((a, b) => b.total - a.total);
      const totalDespesasOp = despesasOp.reduce((s, p) => s + (p.amount || 0), 0);

      // EBITDA = Margem Bruta - Despesas Operacionais (sem depreciacao/amortizacao)
      const ebitda = margemBruta - totalDespesasOp;
      const ebitdaPct = receitaBruta > 0 ? (ebitda / receitaBruta) * 100 : 0;

      // Lucro liquido = EBITDA (sem impostos no modelo atual)
      const lucroLiquido = ebitda;
      const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

      return {
        periodo: { month: m, year: y, startDate, endDate },
        receitaBruta,
        receitaLiquida,
        totalCogs,
        margemBruta,
        margemBrutaPct,
        despesasPorCategoria,
        totalDespesasOp,
        ebitda,
        ebitdaPct,
        lucroLiquido,
        margemLiquida,
        totalPayables: payables.length,
        totalReceivables: receivables.length
      };
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Saude Fiscal (PMR, PMP, Ciclo Financeiro)
    // ═══════════════════════════════════════════════════════════

    /**
     * PMR (Prazo Medio de Recebimento), PMP (Prazo Medio de Pagamento),
     * Ciclo Financeiro, Indice de Endividamento.
     */
    async getSaudeFiscal() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];
      const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0];

      const [paidRecRes, paidPayRes, overdueRecRes, overduePayRes, allOpenPayRes] = await Promise.all([
        // Receivables pagos (ultimos 90d) com datas
        _db().from('fin_receivables')
          .select('amount, due_date, paid_date')
          .eq('tenant_id', tid)
          .eq('status', 'pago')
          .gte('paid_date', ninetyDaysAgo),

        // Payables pagos (ultimos 90d) com datas
        _db().from('fin_payables')
          .select('amount, due_date, paid_date')
          .eq('tenant_id', tid)
          .eq('status', 'pago')
          .gte('paid_date', ninetyDaysAgo),

        // Receivables em atraso (inadimplencia)
        _db().from('fin_receivables')
          .select('amount, amount_paid, due_date')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido', 'atrasado'])
          .lt('due_date', today),

        // Payables em atraso
        _db().from('fin_payables')
          .select('amount, amount_paid, due_date')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado'])
          .lt('due_date', today),

        // Todas payables em aberto (endividamento)
        _db().from('fin_payables')
          .select('amount, amount_paid')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado', 'aguardando_aprovacao'])
      ]);

      // PMR — Prazo Medio de Recebimento (dias entre vencimento e pagamento)
      const recPaid = paidRecRes.data || [];
      let pmrSum = 0, pmrCount = 0;
      recPaid.forEach(r => {
        if (r.paid_date && r.due_date) {
          const diff = Math.max(0, (new Date(r.paid_date) - new Date(r.due_date)) / 86400000);
          pmrSum += diff;
          pmrCount++;
        }
      });
      const pmr = pmrCount > 0 ? Math.round(pmrSum / pmrCount) : 0;

      // PMP — Prazo Medio de Pagamento
      const payPaid = paidPayRes.data || [];
      let pmpSum = 0, pmpCount = 0;
      payPaid.forEach(p => {
        if (p.paid_date && p.due_date) {
          const diff = Math.max(0, (new Date(p.paid_date) - new Date(p.due_date)) / 86400000);
          pmpSum += diff;
          pmpCount++;
        }
      });
      const pmp = pmpCount > 0 ? Math.round(pmpSum / pmpCount) : 0;

      // Ciclo Financeiro = PMR - PMP (positivo = precisa de capital de giro)
      const cicloFinanceiro = pmr - pmp;

      // Inadimplencia
      const inadimplencia = (overdueRecRes.data || [])
        .reduce((s, r) => s + ((r.amount || 0) - (r.amount_paid || 0)), 0);
      const inadimplenciaCount = (overdueRecRes.data || []).length;

      // Payables em atraso
      const payablesAtrasados = (overduePayRes.data || [])
        .reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);

      // Endividamento total (tudo que deve, nao pago)
      const endividamento = (allOpenPayRes.data || [])
        .reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);

      // Receita media mensal (ultimos 90d / 3)
      const receitaMedia90d = recPaid.reduce((s, r) => s + (r.amount || 0), 0) / 3;
      const indiceEndividamento = receitaMedia90d > 0 ? endividamento / receitaMedia90d : 0;

      return {
        pmr,
        pmp,
        cicloFinanceiro,
        inadimplencia,
        inadimplenciaCount,
        payablesAtrasados,
        endividamento,
        indiceEndividamento,
        receitaMedia90d
      };
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Custos Fixos vs Variaveis
    // ═══════════════════════════════════════════════════════════

    /**
     * Breakdown custos fixos vs variaveis com evolucao temporal.
     * Fixos: salarios, ferramentas, estrutura, assinaturas
     * Variaveis: freelancers, materiais, licencas por projeto
     */
    async getCustosFixosVsVariaveis() {
      const tid = _tid();

      const { data, error } = await _db().from('fin_payables')
        .select('amount, due_date, status, cost_center_id, category_id, category:fin_categories(name), cost_center:fin_cost_centers(name, category)')
        .eq('tenant_id', tid)
        .not('status', 'eq', 'cancelado')
        .order('due_date', { ascending: true });

      if (error) throw error;

      const fixoKeywords = ['salario', 'salário', 'folha', 'aluguel', 'ferramenta', 'software', 'assinatura', 'internet', 'telefone', 'energia', 'agua', 'contador', 'contabil', 'estrutura', 'sede', 'escritorio', 'plano'];
      const variavelKeywords = ['freelancer', 'freelance', 'terceiro', 'projeto', 'material', 'insumo', 'licenca', 'viagem', 'evento', 'campanha', 'midia', 'comissao', 'bonus'];

      let totalFixo = 0, totalVariavel = 0, totalOutros = 0;
      const fixoByCategory = {};
      const variavelByCategory = {};
      const monthlyEvolution = {};

      (data || []).forEach(p => {
        const catName = (p.category?.name || '').toLowerCase();
        const ccCat = (p.cost_center?.category || '').toLowerCase();
        const ccName = (p.cost_center?.name || '').toLowerCase();
        const combined = `${catName} ${ccCat} ${ccName}`;
        const amount = p.amount || 0;

        let tipo = 'outros';
        if (fixoKeywords.some(k => combined.includes(k))) {
          tipo = 'fixo';
          totalFixo += amount;
          const cat = p.category?.name || 'Sem Categoria';
          fixoByCategory[cat] = (fixoByCategory[cat] || 0) + amount;
        } else if (variavelKeywords.some(k => combined.includes(k))) {
          tipo = 'variavel';
          totalVariavel += amount;
          const cat = p.category?.name || 'Sem Categoria';
          variavelByCategory[cat] = (variavelByCategory[cat] || 0) + amount;
        } else {
          totalOutros += amount;
        }

        // Evolucao mensal
        if (p.due_date) {
          const key = p.due_date.substring(0, 7);
          if (!monthlyEvolution[key]) monthlyEvolution[key] = { fixo: 0, variavel: 0, outros: 0 };
          monthlyEvolution[key][tipo] += amount;
        }
      });

      const evolucao = Object.entries(monthlyEvolution)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, d]) => ({
          month,
          label: new Date(month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
          fixo: d.fixo,
          variavel: d.variavel,
          outros: d.outros,
          total: d.fixo + d.variavel + d.outros
        }));

      const totalGeral = totalFixo + totalVariavel + totalOutros;

      return {
        totalFixo,
        totalVariavel,
        totalOutros,
        totalGeral,
        pctFixo: totalGeral > 0 ? (totalFixo / totalGeral * 100).toFixed(1) : '0.0',
        pctVariavel: totalGeral > 0 ? (totalVariavel / totalGeral * 100).toFixed(1) : '0.0',
        fixoByCategory: Object.entries(fixoByCategory).sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name, total })),
        variavelByCategory: Object.entries(variavelByCategory).sort((a, b) => b[1] - a[1]).map(([name, total]) => ({ name, total })),
        evolucao
      };
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Camada Comparativa
    // ═══════════════════════════════════════════════════════════

    /**
     * Comparativos: mes atual vs anterior, acumulado YTD vs ano anterior.
     */
    async getComparativo() {
      const tid = _tid();
      const now = new Date();
      const curMonth = now.getMonth();
      const curYear = now.getFullYear();

      // Periodos
      const curStart = `${curYear}-${String(curMonth + 1).padStart(2, '0')}-01`;
      const curEnd = new Date(curYear, curMonth + 1, 0).toISOString().split('T')[0];
      const prevStart = curMonth === 0
        ? `${curYear - 1}-12-01`
        : `${curYear}-${String(curMonth).padStart(2, '0')}-01`;
      const prevEnd = curMonth === 0
        ? `${curYear - 1}-12-31`
        : new Date(curYear, curMonth, 0).toISOString().split('T')[0];
      const ytdStart = `${curYear}-01-01`;
      const prevYtdStart = `${curYear - 1}-01-01`;
      const prevYtdEnd = `${curYear - 1}-${String(curMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const [curRecRes, curPayRes, prevRecRes, prevPayRes, ytdRecRes, ytdPayRes, prevYtdRecRes, prevYtdPayRes] = await Promise.all([
        // Mes atual - receivables
        _db().from('fin_receivables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', curStart).lte('due_date', curEnd),
        // Mes atual - payables
        _db().from('fin_payables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', curStart).lte('due_date', curEnd),
        // Mes anterior - receivables
        _db().from('fin_receivables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', prevStart).lte('due_date', prevEnd),
        // Mes anterior - payables
        _db().from('fin_payables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', prevStart).lte('due_date', prevEnd),
        // YTD - receivables
        _db().from('fin_receivables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', ytdStart).lte('due_date', curEnd),
        // YTD - payables
        _db().from('fin_payables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', ytdStart).lte('due_date', curEnd),
        // YTD ano anterior - receivables
        _db().from('fin_receivables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', prevYtdStart).lte('due_date', prevYtdEnd),
        // YTD ano anterior - payables
        _db().from('fin_payables').select('amount, status').eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado').gte('due_date', prevYtdStart).lte('due_date', prevYtdEnd)
      ]);

      const sum = arr => (arr?.data || []).reduce((s, r) => s + (r.amount || 0), 0);
      const sumPago = arr => (arr?.data || []).filter(r => r.status === 'pago').reduce((s, r) => s + (r.amount || 0), 0);

      const curReceita = sum(curRecRes);
      const curDespesa = sum(curPayRes);
      const curResultado = curReceita - curDespesa;

      const prevReceita = sum(prevRecRes);
      const prevDespesa = sum(prevPayRes);
      const prevResultado = prevReceita - prevDespesa;

      const ytdReceita = sum(ytdRecRes);
      const ytdDespesa = sum(ytdPayRes);
      const ytdResultado = ytdReceita - ytdDespesa;

      const prevYtdReceita = sum(prevYtdRecRes);
      const prevYtdDespesa = sum(prevYtdPayRes);
      const prevYtdResultado = prevYtdReceita - prevYtdDespesa;

      const varReceita = prevReceita > 0 ? ((curReceita - prevReceita) / prevReceita * 100) : 0;
      const varDespesa = prevDespesa > 0 ? ((curDespesa - prevDespesa) / prevDespesa * 100) : 0;

      const varYtdReceita = prevYtdReceita > 0 ? ((ytdReceita - prevYtdReceita) / prevYtdReceita * 100) : 0;
      const varYtdDespesa = prevYtdDespesa > 0 ? ((ytdDespesa - prevYtdDespesa) / prevYtdDespesa * 100) : 0;

      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      return {
        mesAtual: {
          label: `${monthNames[curMonth]}/${curYear}`,
          receita: curReceita,
          despesa: curDespesa,
          resultado: curResultado
        },
        mesAnterior: {
          label: curMonth === 0 ? `Dez/${curYear - 1}` : `${monthNames[curMonth - 1]}/${curYear}`,
          receita: prevReceita,
          despesa: prevDespesa,
          resultado: prevResultado
        },
        variacao: { receita: varReceita, despesa: varDespesa },
        ytd: {
          label: `Jan-${monthNames[curMonth]}/${curYear}`,
          receita: ytdReceita,
          despesa: ytdDespesa,
          resultado: ytdResultado
        },
        ytdAnterior: {
          label: `Jan-${monthNames[curMonth]}/${curYear - 1}`,
          receita: prevYtdReceita,
          despesa: prevYtdDespesa,
          resultado: prevYtdResultado
        },
        variacaoYtd: { receita: varYtdReceita, despesa: varYtdDespesa }
      };
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Visao de Caixa e Liquidez (Runway)
    // ═══════════════════════════════════════════════════════════

    /**
     * Calcula runway (meses de operacao), fluxo realizado vs projetado,
     * contas por vencimento agrupadas.
     */
    async getVisaoCaixa() {
      const tid = _tid();
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();

      const [balanceRes, payablesByWeek, receivablesByWeek, avgMonthlyPayRes] = await Promise.all([
        // Saldo atual
        _db().from('fin_balance_snapshots')
          .select('balance, recorded_at')
          .eq('tenant_id', tid)
          .order('recorded_at', { ascending: false })
          .limit(1)
          .maybeSingle(),

        // Payables proximos 90 dias (para agrupar por semana/vencimento)
        _db().from('fin_payables')
          .select('amount, amount_paid, due_date, status, vendor:fin_vendors(name)')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'aprovado', 'atrasado', 'aguardando_aprovacao'])
          .gte('due_date', today)
          .lte('due_date', new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0])
          .order('due_date', { ascending: true }),

        // Receivables proximos 90 dias
        _db().from('fin_receivables')
          .select('amount, amount_paid, due_date, status, client:fin_clients(name)')
          .eq('tenant_id', tid)
          .in('status', ['aberto', 'parcial', 'emitido', 'atrasado', 'previsto'])
          .gte('due_date', today)
          .lte('due_date', new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0])
          .order('due_date', { ascending: true }),

        // Media mensal de pagamentos (ultimos 6 meses)
        _db().from('fin_payables')
          .select('amount, paid_date')
          .eq('tenant_id', tid)
          .eq('status', 'pago')
          .gte('paid_date', new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0])
      ]);

      const saldo = balanceRes.data?.balance || 0;

      // Agrupar payables por semana
      const payByWeek = {};
      (payablesByWeek.data || []).forEach(p => {
        const d = new Date(p.due_date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split('T')[0];
        if (!payByWeek[key]) payByWeek[key] = { total: 0, items: [] };
        const saldo_item = (p.amount || 0) - (p.amount_paid || 0);
        payByWeek[key].total += saldo_item;
        payByWeek[key].items.push({ vendor: p.vendor?.name, amount: saldo_item, due: p.due_date });
      });

      // Agrupar receivables por semana
      const recByWeek = {};
      (receivablesByWeek.data || []).forEach(r => {
        const d = new Date(r.due_date);
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay());
        const key = weekStart.toISOString().split('T')[0];
        if (!recByWeek[key]) recByWeek[key] = { total: 0, items: [] };
        const saldo_item = (r.amount || 0) - (r.amount_paid || 0);
        recByWeek[key].total += saldo_item;
        recByWeek[key].items.push({ client: r.client?.name, amount: saldo_item, due: r.due_date });
      });

      // Runway = saldo / media mensal de despesas
      const totalPago6m = (avgMonthlyPayRes.data || []).reduce((s, p) => s + (p.amount || 0), 0);
      const mediaMensal = totalPago6m / 6;
      const runway = mediaMensal > 0 ? Math.min(saldo / mediaMensal, 60) : null;

      // Totais proximos 30/60/90 dias
      const in30d = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
      const in60d = new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0];

      const aPagar30d = (payablesByWeek.data || []).filter(p => p.due_date <= in30d).reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);
      const aPagar60d = (payablesByWeek.data || []).filter(p => p.due_date <= in60d).reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);
      const aPagar90d = (payablesByWeek.data || []).reduce((s, p) => s + ((p.amount || 0) - (p.amount_paid || 0)), 0);

      const aReceber30d = (receivablesByWeek.data || []).filter(r => r.due_date <= in30d).reduce((s, r) => s + ((r.amount || 0) - (r.amount_paid || 0)), 0);
      const aReceber60d = (receivablesByWeek.data || []).filter(r => r.due_date <= in60d).reduce((s, r) => s + ((r.amount || 0) - (r.amount_paid || 0)), 0);
      const aReceber90d = (receivablesByWeek.data || []).reduce((s, r) => s + ((r.amount || 0) - (r.amount_paid || 0)), 0);

      return {
        saldo,
        runway: runway != null ? Math.round(runway * 10) / 10 : null,
        mediaMensalDespesa: mediaMensal,
        aPagar: { d30: aPagar30d, d60: aPagar60d, d90: aPagar90d },
        aReceber: { d30: aReceber30d, d60: aReceber60d, d90: aReceber90d },
        saldoProjetado30d: saldo + aReceber30d - aPagar30d,
        payByWeek,
        recByWeek
      };
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Eficiencia e Rentabilidade
    // ═══════════════════════════════════════════════════════════

    /**
     * Margem por cliente, ticket medio, concentracao top 5,
     * ranking de clientes por rentabilidade.
     */
    async getEficienciaRentabilidade() {
      const tid = _tid();
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      const [recRes, payRes] = await Promise.all([
        // Receivables pagos ou em aberto (ultimos 6 meses) com client info
        _db().from('fin_receivables')
          .select('amount, amount_paid, status, client_id, due_date, paid_date, client:fin_clients(name)')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
          .gte('due_date', sixMonthsAgo),

        // Payables dos mesmos 6 meses com project_id para vincular custos a clientes
        _db().from('fin_payables')
          .select('amount, status, project_id, vendor_id, due_date, cost_center_id, category:fin_categories(name), cost_center:fin_cost_centers(name, category)')
          .eq('tenant_id', tid)
          .not('status', 'eq', 'cancelado')
          .gte('due_date', sixMonthsAgo)
      ]);

      const receivables = recRes.data || [];
      const payables = payRes.data || [];

      // Receita por cliente
      const receitaPorCliente = {};
      let receitaTotal = 0;
      let countParcelas = 0;
      let clientesSemId = 0;

      receivables.forEach(r => {
        const valor = r.status === 'pago' ? (r.amount || 0) : (r.amount_paid || 0);
        receitaTotal += (r.amount || 0);
        countParcelas++;

        const clientKey = r.client_id || '__sem_cliente__';
        const clientName = r.client?.name || 'Sem Cliente';

        if (!r.client_id) clientesSemId++;

        if (!receitaPorCliente[clientKey]) {
          receitaPorCliente[clientKey] = { name: clientName, receita: 0, recebido: 0, count: 0 };
        }
        receitaPorCliente[clientKey].receita += (r.amount || 0);
        receitaPorCliente[clientKey].recebido += valor;
        receitaPorCliente[clientKey].count++;
      });

      // Ranking de clientes por receita
      const clienteRanking = Object.entries(receitaPorCliente)
        .map(([id, data]) => ({
          id,
          name: data.name,
          receita: data.receita,
          recebido: data.recebido,
          parcelas: data.count,
          pctReceita: receitaTotal > 0 ? (data.receita / receitaTotal * 100) : 0,
          ticketMedio: data.count > 0 ? data.receita / data.count : 0
        }))
        .sort((a, b) => b.receita - a.receita);

      // Concentracao top 5
      const top5Receita = clienteRanking.slice(0, 5).reduce((s, c) => s + c.receita, 0);
      const concentracaoTop5 = receitaTotal > 0 ? (top5Receita / receitaTotal * 100) : 0;

      // Ticket medio geral
      const ticketMedioGeral = countParcelas > 0 ? receitaTotal / countParcelas : 0;

      // Total de custos (para calcular margem geral)
      const totalCustos = payables.reduce((s, p) => s + (p.amount || 0), 0);
      const margemGeral = receitaTotal > 0 ? ((receitaTotal - totalCustos) / receitaTotal * 100) : 0;

      // Custos diretos vs indiretos (COGS keywords)
      const cogsKeywords = ['produção', 'producao', 'execução', 'execucao', 'material', 'freelancer', 'terceiro', 'direto', 'entrega', 'obra', 'servico prestado', 'custo direto', 'cogs'];
      let totalCustoDireto = 0;
      payables.forEach(p => {
        const catName = (p.category?.name || '').toLowerCase();
        const ccCat = (p.cost_center?.category || '').toLowerCase();
        const ccName = (p.cost_center?.name || '').toLowerCase();
        const combined = `${catName} ${ccCat} ${ccName}`;
        if (cogsKeywords.some(k => combined.includes(k))) {
          totalCustoDireto += (p.amount || 0);
        }
      });
      const margemBruta = receitaTotal > 0 ? ((receitaTotal - totalCustoDireto) / receitaTotal * 100) : 0;

      return {
        receitaTotal,
        totalCustos,
        margemGeral: Math.round(margemGeral * 10) / 10,
        margemBruta: Math.round(margemBruta * 10) / 10,
        ticketMedioGeral: Math.round(ticketMedioGeral * 100) / 100,
        concentracaoTop5: Math.round(concentracaoTop5 * 10) / 10,
        totalClientes: Object.keys(receitaPorCliente).filter(k => k !== '__sem_cliente__').length,
        clientesSemId,
        clienteRanking: clienteRanking.slice(0, 15),
        top5: clienteRanking.slice(0, 5)
      };
    },

    // ═══════════════════════════════════════════════════════════
    // ANALYTICS — Receita e Pipeline Comercial
    // ═══════════════════════════════════════════════════════════

    /**
     * Receita recorrente vs pontual, projecao de faturamento,
     * evolucao mensal de receita, taxa de recebimento.
     */
    async getReceitaPipeline() {
      const tid = _tid();
      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0];
      const today = now.toISOString().split('T')[0];

      const { data, error } = await _db().from('fin_receivables')
        .select('amount, amount_paid, status, due_date, paid_date, client_id, description, client:fin_clients(name)')
        .eq('tenant_id', tid)
        .not('status', 'eq', 'cancelado')
        .gte('due_date', twelveMonthsAgo)
        .order('due_date', { ascending: true });

      if (error) throw error;

      const receivables = data || [];

      // Classificar receita: recorrente (mesmo cliente aparece em 3+ meses) vs pontual
      const clientMeses = {};
      receivables.forEach(r => {
        const clientKey = r.client_id || '__sem__';
        const mesKey = r.due_date ? r.due_date.substring(0, 7) : 'unknown';
        if (!clientMeses[clientKey]) clientMeses[clientKey] = new Set();
        clientMeses[clientKey].add(mesKey);
      });

      const clienteRecorrente = new Set();
      Object.entries(clientMeses).forEach(([clientId, meses]) => {
        if (meses.size >= 3) clienteRecorrente.add(clientId);
      });

      let receitaRecorrente = 0, receitaPontual = 0;
      let recebidoTotal = 0, faturadoTotal = 0;

      // Evolucao mensal
      const mensal = {};
      const ultimosMeses = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        ultimosMeses.push(key);
        mensal[key] = { faturado: 0, recebido: 0, recorrente: 0, pontual: 0 };
      }

      receivables.forEach(r => {
        const clientKey = r.client_id || '__sem__';
        const valor = r.amount || 0;
        const recebido = r.status === 'pago' ? valor : (r.amount_paid || 0);
        const mesKey = r.due_date ? r.due_date.substring(0, 7) : null;

        faturadoTotal += valor;
        recebidoTotal += recebido;

        if (clienteRecorrente.has(clientKey)) {
          receitaRecorrente += valor;
        } else {
          receitaPontual += valor;
        }

        if (mesKey && mensal[mesKey]) {
          mensal[mesKey].faturado += valor;
          mensal[mesKey].recebido += recebido;
          if (clienteRecorrente.has(clientKey)) {
            mensal[mesKey].recorrente += valor;
          } else {
            mensal[mesKey].pontual += valor;
          }
        }
      });

      // Taxa de recebimento
      const taxaRecebimento = faturadoTotal > 0 ? (recebidoTotal / faturadoTotal * 100) : 0;

      // Projecao de faturamento (media dos ultimos 3 meses completos)
      const mesesCompletos = ultimosMeses.slice(-4, -1);
      const somaUltimos3 = mesesCompletos.reduce((s, m) => s + (mensal[m]?.faturado || 0), 0);
      const mediaUltimos3 = somaUltimos3 / 3;

      // Pipeline futuro (receivables com due_date > today em status aberto/previsto/emitido)
      const pipeline = receivables.filter(r =>
        r.due_date > today &&
        ['aberto', 'previsto', 'emitido', 'parcial', 'atrasado'].includes(r.status)
      );
      const totalPipeline = pipeline.reduce((s, r) => s + ((r.amount || 0) - (r.amount_paid || 0)), 0);

      // Pct recorrente vs pontual
      const totalReceita = receitaRecorrente + receitaPontual;
      const pctRecorrente = totalReceita > 0 ? (receitaRecorrente / totalReceita * 100) : 0;

      const evolucao = ultimosMeses.map(m => ({
        month: m,
        label: new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        ...mensal[m]
      }));

      return {
        receitaRecorrente,
        receitaPontual,
        pctRecorrente: Math.round(pctRecorrente * 10) / 10,
        pctPontual: Math.round((100 - pctRecorrente) * 10) / 10,
        clientesRecorrentes: clienteRecorrente.size - (clienteRecorrente.has('__sem__') ? 1 : 0),
        taxaRecebimento: Math.round(taxaRecebimento * 10) / 10,
        faturadoTotal,
        recebidoTotal,
        projecaoProximoMes: Math.round(mediaUltimos3 * 100) / 100,
        totalPipeline,
        countPipeline: pipeline.length,
        evolucao
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FinanceRepo = FinanceRepo;
}
