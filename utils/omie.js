// ============================================================================
// TBO OS — Omie ERP Integration (Unilateral: Omie → TBO)
// Conector REST para sincronizacao de dados financeiros.
// Endpoints: Contas a Pagar, Contas a Receber, Clientes, Fornecedores,
//            Categorias, Plano de Contas, Lancamentos Financeiros.
// API Docs: https://developer.omie.com.br/
// ============================================================================

const TBO_OMIE = {
  _baseUrl: 'https://app.omie.com.br/api/v1/',
  _cache: {},
  _cacheTTL: 15 * 60 * 1000, // 15 minutos
  _cacheTime: {},
  _lastSync: localStorage.getItem('tbo_omie_last_sync') || null,
  _syncError: null,
  _syncing: false,
  _lastRequestTime: 0,
  _rateLimitDelay: 600, // 600ms entre chamadas (Omie limita 3/sec)

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG — Credenciais armazenadas em localStorage
  // ═══════════════════════════════════════════════════════════════════════════

  getAppKey() {
    return localStorage.getItem('tbo_omie_app_key') || '';
  },

  getAppSecret() {
    return localStorage.getItem('tbo_omie_app_secret') || '';
  },

  setCredentials(appKey, appSecret) {
    localStorage.setItem('tbo_omie_app_key', appKey);
    localStorage.setItem('tbo_omie_app_secret', appSecret);
    this._cache = {};
    this._cacheTime = {};
  },

  isEnabled() {
    return localStorage.getItem('tbo_omie_enabled') !== 'false' &&
           !!this.getAppKey() && !!this.getAppSecret();
  },

  setEnabled(enabled) {
    localStorage.setItem('tbo_omie_enabled', enabled ? 'true' : 'false');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HTTP — REST API calls com rate limiting
  // Omie usa POST para TODAS as chamadas (JSON-RPC style)
  // ═══════════════════════════════════════════════════════════════════════════

  async _request(endpoint, call, params = [{}]) {
    const appKey = this.getAppKey();
    const appSecret = this.getAppSecret();
    if (!appKey || !appSecret) throw new Error('Omie: credenciais nao configuradas');

    // Rate limiting
    const now = Date.now();
    const elapsed = now - this._lastRequestTime;
    if (elapsed < this._rateLimitDelay) {
      await new Promise(r => setTimeout(r, this._rateLimitDelay - elapsed));
    }

    // Omie usa proxy para evitar CORS (mesma estrategia do RD Station)
    const proxyBase = '/api/omie-proxy';
    const url = `${proxyBase}?endpoint=${encodeURIComponent(endpoint)}`;

    const body = {
      call: call,
      app_key: appKey,
      app_secret: appSecret,
      param: params
    };

    this._lastRequestTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Omie API ${response.status}: ${text.slice(0, 300)}`);
      }

      const result = await response.json();

      // Omie retorna erros no corpo com faultstring
      if (result.faultstring) {
        throw new Error(`Omie: ${result.faultstring}`);
      }

      return result;
    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        throw new Error('Omie: erro de rede — verifique conexao ou proxy CORS.');
      }
      throw e;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // READ — Buscar dados do Omie (paginado)
  // ═══════════════════════════════════════════════════════════════════════════

  async _fetchAllPages(endpoint, call, listKey, params = {}) {
    const all = [];
    let page = 1;
    const pageSize = 500;

    while (true) {
      const result = await this._request(endpoint, call, [{
        pagina: page,
        registros_por_pagina: pageSize,
        ...params
      }]);

      const items = result[listKey] || [];
      if (!Array.isArray(items) || items.length === 0) break;
      all.push(...items);

      const totalPages = result.total_de_paginas || 1;
      if (page >= totalPages) break;
      page++;
    }

    return all;
  },

  // ── Contas a Pagar ──
  async fetchContasPagar(filtros = {}) {
    return this._fetchAllPages(
      'financas/contapagar/',
      'ListarContasPagar',
      'conta_pagar_cadastro',
      filtros
    );
  },

  // ── Contas a Receber ──
  async fetchContasReceber(filtros = {}) {
    return this._fetchAllPages(
      'financas/contareceber/',
      'ListarContasReceber',
      'conta_receber_cadastro',
      filtros
    );
  },

  // ── Clientes ──
  async fetchClientes(filtros = {}) {
    return this._fetchAllPages(
      'geral/clientes/',
      'ListarClientes',
      'clientes_cadastro',
      filtros
    );
  },

  // ── Fornecedores (mesma API de clientes com filtro) ──
  async fetchFornecedores(filtros = {}) {
    return this._fetchAllPages(
      'geral/clientes/',
      'ListarClientes',
      'clientes_cadastro',
      { ...filtros, clientesFiltro: { tags: [{ tag: 'Fornecedor' }] } }
    );
  },

  // ── Categorias ──
  async fetchCategorias() {
    return this._fetchAllPages(
      'geral/categorias/',
      'ListarCategorias',
      'categoria_cadastro'
    );
  },

  // ── Lancamentos Financeiros (extrato) ──
  async fetchExtrato(filtros = {}) {
    return this._fetchAllPages(
      'financas/mf/',
      'ListarMovFinanceiras',
      'movimentos',
      filtros
    );
  },

  // ── Plano de Contas ──
  async fetchPlanoContas() {
    return this._fetchAllPages(
      'financas/contacorrente/',
      'ListarContasCorrentes',
      'ListarContasCorrentes'
    );
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFORM — Normalizar dados do Omie para formato TBO
  // ═══════════════════════════════════════════════════════════════════════════

  _normalizarContaPagar(cp) {
    return {
      omieId: String(cp.codigo_lancamento_omie || cp.codigo_lancamento_integracao || ''),
      descricao: cp.observacao || cp.numero_documento || '',
      fornecedor: cp.codigo_cliente_fornecedor_integracao || '',
      fornecedorNome: cp.nome_cliente_fornecedor || '',
      valor: parseFloat(cp.valor_documento) || 0,
      vencimento: cp.data_vencimento || '',
      pagamento: cp.data_pagamento || '',
      status: cp.status_titulo || '',
      categoria: cp.codigo_categoria || '',
      categoriaNome: cp.categoria || '',
      documento: cp.numero_documento || '',
      _source: 'omie'
    };
  },

  _normalizarContaReceber(cr) {
    return {
      omieId: String(cr.codigo_lancamento_omie || cr.codigo_lancamento_integracao || ''),
      descricao: cr.observacao || cr.numero_documento || '',
      cliente: cr.codigo_cliente_fornecedor_integracao || '',
      clienteNome: cr.nome_cliente_fornecedor || '',
      valor: parseFloat(cr.valor_documento) || 0,
      vencimento: cr.data_vencimento || '',
      recebimento: cr.data_pagamento || '',
      status: cr.status_titulo || '',
      categoria: cr.codigo_categoria || '',
      categoriaNome: cr.categoria || '',
      documento: cr.numero_documento || '',
      _source: 'omie'
    };
  },

  _normalizarCliente(cl) {
    return {
      omieId: String(cl.codigo_cliente_omie || cl.codigo_cliente_integracao || ''),
      razaoSocial: cl.razao_social || '',
      nomeFantasia: cl.nome_fantasia || '',
      cnpjCpf: cl.cnpj_cpf || '',
      email: cl.email || '',
      telefone: cl.telefone1_numero || '',
      cidade: cl.cidade || '',
      estado: cl.estado || '',
      tags: (cl.tags || []).map(t => t.tag),
      _source: 'omie'
    };
  },

  _normalizarCategoria(cat) {
    return {
      codigo: cat.codigo || '',
      descricao: cat.descricao || '',
      tipo: cat.tipo || '',
      _source: 'omie'
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Pull completo (Omie → TBO)
  // ═══════════════════════════════════════════════════════════════════════════

  async sync() {
    if (!this.isEnabled()) return null;
    if (this._syncing) return null;

    this._syncing = true;
    this._syncError = null;

    try {
      console.log('[TBO Omie] Starting sync (Omie → TBO)...');

      const result = {
        contasPagar: 0,
        contasReceber: 0,
        clientes: 0,
        categorias: 0
      };

      // 1. Contas a Pagar
      try {
        const cp = await this.fetchContasPagar();
        const normalized = cp.map(c => this._normalizarContaPagar(c));
        localStorage.setItem('tbo_omie_contas_pagar', JSON.stringify(normalized));
        result.contasPagar = normalized.length;
        console.log(`[TBO Omie] ${normalized.length} contas a pagar`);
      } catch (e) {
        console.warn('[TBO Omie] Contas a pagar falhou:', e.message);
      }

      // 2. Contas a Receber
      try {
        const cr = await this.fetchContasReceber();
        const normalized = cr.map(c => this._normalizarContaReceber(c));
        localStorage.setItem('tbo_omie_contas_receber', JSON.stringify(normalized));
        result.contasReceber = normalized.length;
        console.log(`[TBO Omie] ${normalized.length} contas a receber`);
      } catch (e) {
        console.warn('[TBO Omie] Contas a receber falhou:', e.message);
      }

      // 3. Clientes/Fornecedores
      try {
        const clientes = await this.fetchClientes();
        const normalized = clientes.map(c => this._normalizarCliente(c));
        localStorage.setItem('tbo_omie_clientes', JSON.stringify(normalized));
        result.clientes = normalized.length;
        console.log(`[TBO Omie] ${normalized.length} clientes/fornecedores`);
      } catch (e) {
        console.warn('[TBO Omie] Clientes falhou:', e.message);
      }

      // 4. Categorias
      try {
        const categorias = await this.fetchCategorias();
        const normalized = categorias.map(c => this._normalizarCategoria(c));
        localStorage.setItem('tbo_omie_categorias', JSON.stringify(normalized));
        result.categorias = normalized.length;
        console.log(`[TBO Omie] ${normalized.length} categorias`);
      } catch (e) {
        console.warn('[TBO Omie] Categorias falhou:', e.message);
      }

      // Atualizar timestamp
      this._lastSync = new Date().toISOString();
      localStorage.setItem('tbo_omie_last_sync', this._lastSync);

      console.log('[TBO Omie] Sync completo:', result);
      return result;

    } catch (e) {
      console.warn('[TBO Omie] Sync falhou:', e.message);
      this._syncError = e.message;
      return null;
    } finally {
      this._syncing = false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE GETTERS — Para uso pelos modulos financeiros
  // ═══════════════════════════════════════════════════════════════════════════

  getContasPagar() {
    try { return JSON.parse(localStorage.getItem('tbo_omie_contas_pagar') || '[]'); }
    catch (e) { return []; }
  },

  getContasReceber() {
    try { return JSON.parse(localStorage.getItem('tbo_omie_contas_receber') || '[]'); }
    catch (e) { return []; }
  },

  getClientes() {
    try { return JSON.parse(localStorage.getItem('tbo_omie_clientes') || '[]'); }
    catch (e) { return []; }
  },

  getCategorias() {
    try { return JSON.parse(localStorage.getItem('tbo_omie_categorias') || '[]'); }
    catch (e) { return []; }
  },

  // Resumo financeiro calculado dos dados sincronizados
  getResumoFinanceiro() {
    const cp = this.getContasPagar();
    const cr = this.getContasReceber();
    const hoje = new Date().toISOString().split('T')[0];

    const totalPagar = cp.reduce((s, c) => s + (c.valor || 0), 0);
    const totalReceber = cr.reduce((s, c) => s + (c.valor || 0), 0);
    const pagarVencido = cp.filter(c => c.vencimento && c.vencimento < hoje && !c.pagamento)
                           .reduce((s, c) => s + (c.valor || 0), 0);
    const receberVencido = cr.filter(c => c.vencimento && c.vencimento < hoje && !c.recebimento)
                             .reduce((s, c) => s + (c.valor || 0), 0);

    return {
      totalPagar,
      totalReceber,
      saldoProjetado: totalReceber - totalPagar,
      pagarVencido,
      receberVencido,
      contasPagar: cp.length,
      contasReceber: cr.length
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — Para indicadores de UI
  // ═══════════════════════════════════════════════════════════════════════════

  getStatus() {
    return {
      enabled: this.isEnabled(),
      hasCredentials: !!this.getAppKey() && !!this.getAppSecret(),
      syncing: this._syncing,
      lastSync: this._lastSync,
      error: this._syncError,
      contasPagar: this.getContasPagar().length,
      contasReceber: this.getContasReceber().length,
      clientes: this.getClientes().length,
      categorias: this.getCategorias().length
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION TEST — Validar credenciais
  // ═══════════════════════════════════════════════════════════════════════════

  async testConnection() {
    // Buscar 1 categoria como teste de conexao
    const result = await this._request(
      'geral/categorias/',
      'ListarCategorias',
      [{ pagina: 1, registros_por_pagina: 1 }]
    );
    return { ok: true, total: result.total_de_registros || 0 };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH — Limpar cache e re-sincronizar
  // ═══════════════════════════════════════════════════════════════════════════

  async forceRefresh() {
    this._cache = {};
    this._cacheTime = {};
    return this.sync();
  }
};
