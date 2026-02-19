// ============================================================================
// TBO OS — Omie Bridge (Omie → fluxo_caixa adapter)
// Transforma transacoes individuais do Omie no formato fluxo_caixa
// que todos os modulos financeiros consomem.
// Prioridade: Override manual > Omie > Dados estaticos
// Persistencia: Supabase (omie_sync_cache) + localStorage (fallback)
// ============================================================================

const TBO_OMIE_BRIDGE = {
  _cache: null,
  _cacheTime: 0,
  _cacheTTL: 5 * 60 * 1000, // 5 minutos

  // Mapeamento Omie categorias → TBO despesas_detalhadas
  _defaultCategoryMap: {
    'salario': 'pessoas', 'salarios': 'pessoas', 'folha': 'pessoas',
    'encargos': 'pessoas', 'pro-labore': 'pessoas', 'prolabore': 'pessoas',
    'beneficios': 'pessoas', 'vale': 'pessoas', 'ferias': 'pessoas',
    'rescisao': 'pessoas', '13': 'pessoas', 'inss': 'pessoas', 'fgts': 'pessoas',
    'aluguel': 'operacionais', 'energia': 'operacionais', 'agua': 'operacionais',
    'internet': 'operacionais', 'telefone': 'operacionais', 'contabilidade': 'operacionais',
    'software': 'operacionais', 'escritorio': 'operacionais', 'manutencao': 'operacionais',
    'seguro': 'operacionais', 'limpeza': 'operacionais', 'material': 'operacionais',
    'terceiro': 'terceirizacao', 'freelancer': 'terceirizacao', 'prestador': 'terceirizacao',
    'servico': 'terceirizacao', 'subcontratacao': 'terceirizacao', 'consultoria': 'terceirizacao',
    'comissao': 'vendas', 'venda': 'vendas', 'comercial': 'vendas',
    'representante': 'vendas', 'bonificacao': 'vendas',
    'marketing': 'marketing', 'publicidade': 'marketing', 'propaganda': 'marketing',
    'midia': 'marketing', 'anuncio': 'marketing', 'evento': 'marketing',
    'patrocinio': 'marketing', 'brinde': 'marketing'
  },

  _meses: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  _mesesFull: ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
               'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'],

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  isActive() {
    if (typeof TBO_OMIE === 'undefined') return false;
    if (!TBO_OMIE.isEnabled()) return false;
    const cp = TBO_OMIE.getContasPagar();
    const cr = TBO_OMIE.getContasReceber();
    return (cp.length > 0 || cr.length > 0);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CORE: Construir fluxo_caixa a partir dos dados Omie
  // ═══════════════════════════════════════════════════════════════════════════

  buildFluxoCaixa(existingFc = {}) {
    const cp = TBO_OMIE.getContasPagar();
    const cr = TBO_OMIE.getContasReceber();
    const fy = (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.app?.fiscalYear) || new Date().getFullYear();

    // Inicializar meses zerados
    const receita_mensal = {};
    const despesa_mensal = {};
    const resultado_mensal = {};
    this._meses.forEach(m => { receita_mensal[m] = 0; despesa_mensal[m] = 0; });

    // Agrupar recebiveis por mes (filtrando pelo ano fiscal)
    cr.forEach(item => {
      const parsed = this._parseDate(item.vencimento);
      if (!parsed || parsed.year !== fy) return;
      const m = this._meses[parsed.month];
      if (m) receita_mensal[m] += (item.valor || 0);
    });

    // Agrupar pagaveis por mes
    cp.forEach(item => {
      const parsed = this._parseDate(item.vencimento);
      if (!parsed || parsed.year !== fy) return;
      const m = this._meses[parsed.month];
      if (m) despesa_mensal[m] += (item.valor || 0);
    });

    // Resultado mensal
    this._meses.forEach(m => {
      resultado_mensal[m] = receita_mensal[m] - despesa_mensal[m];
    });

    // Meses realizados: meses passados com >= 80% dos valores liquidados
    const hoje = new Date();
    const mesAtual = hoje.getMonth(); // 0-based
    const meses_realizados = [];

    this._meses.forEach((m, idx) => {
      if (idx >= mesAtual && fy >= hoje.getFullYear()) return; // mes futuro
      const mesCR = cr.filter(i => {
        const p = this._parseDate(i.vencimento);
        return p && p.year === fy && p.month === idx;
      });
      const mesCP = cp.filter(i => {
        const p = this._parseDate(i.vencimento);
        return p && p.year === fy && p.month === idx;
      });
      if (mesCR.length === 0 && mesCP.length === 0) return;

      const totalCR = mesCR.reduce((s, i) => s + (i.valor || 0), 0);
      const pagoCR = mesCR.filter(i => this._isRealized(i)).reduce((s, i) => s + (i.valor || 0), 0);
      const totalCP = mesCP.reduce((s, i) => s + (i.valor || 0), 0);
      const pagoCP = mesCP.filter(i => this._isRealized(i)).reduce((s, i) => s + (i.valor || 0), 0);
      const totalGeral = totalCR + totalCP;
      const pagoGeral = pagoCR + pagoCP;

      if (totalGeral > 0 && (pagoGeral / totalGeral) >= 0.8) {
        meses_realizados.push(m);
      }
    });

    // Despesas detalhadas por categoria
    const categoriaTotals = { pessoas: 0, operacionais: 0, terceirizacao: 0, vendas: 0, marketing: 0 };
    cp.forEach(item => {
      const parsed = this._parseDate(item.vencimento);
      if (!parsed || parsed.year !== fy) return;
      const cat = this._mapCategoria(item.categoriaNome || '');
      categoriaTotals[cat] += (item.valor || 0);
    });

    // Contas a receber detalhadas (por mes, com clientes)
    const contas_a_receber = {};
    cr.forEach(item => {
      const parsed = this._parseDate(item.vencimento);
      if (!parsed || parsed.year !== fy) return;
      const mesNome = this._mesesFull[parsed.month];
      if (!mesNome) return;
      if (!contas_a_receber[mesNome]) {
        contas_a_receber[mesNome] = { total: 0, pago: 0, em_aberto: 0, clientes: [] };
      }
      const isPaid = this._isRealized(item);
      contas_a_receber[mesNome].total += (item.valor || 0);
      if (isPaid) contas_a_receber[mesNome].pago += (item.valor || 0);
      else contas_a_receber[mesNome].em_aberto += (item.valor || 0);
      contas_a_receber[mesNome].clientes.push({
        nome: item.clienteNome || item.descricao || 'Sem nome',
        valor: item.valor || 0,
        status: isPaid ? 'pago' : 'em_aberto',
        omieId: item.omieId,
        vencimento: item.vencimento
      });
    });

    // Montar fluxo_caixa final — metas e equipe vem do existingFc (nao substituir)
    return {
      receita_mensal,
      despesa_mensal,
      resultado_mensal,
      meses_realizados,
      meta_vendas_mensal: existingFc.meta_vendas_mensal || 0,
      meta_vendas_anual: existingFc.meta_vendas_anual || 0,
      receita_total_orcada: existingFc.receita_total_orcada || Object.values(receita_mensal).reduce((a, b) => a + b, 0),
      despesa_total_orcada: existingFc.despesa_total_orcada || Object.values(despesa_mensal).reduce((a, b) => a + b, 0),
      resultado_liquido_orcado: existingFc.resultado_liquido_orcado || 0,
      margem_liquida_orcada: existingFc.margem_liquida_orcada || null,
      despesas_detalhadas: {
        pessoas: { total_anual: categoriaTotals.pessoas, equipe: existingFc.despesas_detalhadas?.pessoas?.equipe || [] },
        operacionais: { total_anual: categoriaTotals.operacionais, itens: existingFc.despesas_detalhadas?.operacionais?.itens || [] },
        terceirizacao: { total_anual: categoriaTotals.terceirizacao },
        vendas: { total_anual: categoriaTotals.vendas },
        marketing: { total_anual: categoriaTotals.marketing }
      },
      contas_a_receber,
      criterios_operacao: existingFc.criterios_operacao || {},
      _source: 'omie',
      _lastSync: (typeof TBO_OMIE !== 'undefined') ? TBO_OMIE._lastSync : null
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MERGE: Combinar Omie + Estatico + Overrides
  // ═══════════════════════════════════════════════════════════════════════════

  getMergedFluxoCaixa(staticFc = {}) {
    if (!this.isActive()) return staticFc;
    const omieFc = this.buildFluxoCaixa(staticFc);
    const overrides = this.getOverrides();
    return this._applyOverrides(omieFc, overrides);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ITENS INDIVIDUAIS (para pagar.js e receber.js)
  // ═══════════════════════════════════════════════════════════════════════════

  getContasPagar(filters = {}) {
    if (typeof TBO_OMIE === 'undefined') return [];
    const fy = (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.app?.fiscalYear) || new Date().getFullYear();
    let items = TBO_OMIE.getContasPagar().filter(i => {
      const p = this._parseDate(i.vencimento);
      return p && p.year === fy;
    });

    if (filters.mes) {
      items = items.filter(i => {
        const p = this._parseDate(i.vencimento);
        return p && this._meses[p.month] === filters.mes;
      });
    }
    if (filters.status === 'pago') items = items.filter(i => this._isRealized(i));
    if (filters.status === 'aberto') items = items.filter(i => !this._isRealized(i));
    if (filters.status === 'vencido') {
      const hoje = new Date();
      items = items.filter(i => !this._isRealized(i) && this._toDate(i.vencimento) < hoje);
    }
    if (filters.categoria) {
      items = items.filter(i => this._mapCategoria(i.categoriaNome || '') === filters.categoria);
    }

    // Ordenar por vencimento
    items.sort((a, b) => (this._toDate(a.vencimento) || 0) - (this._toDate(b.vencimento) || 0));
    return items;
  },

  getContasReceber(filters = {}) {
    if (typeof TBO_OMIE === 'undefined') return [];
    const fy = (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.app?.fiscalYear) || new Date().getFullYear();
    let items = TBO_OMIE.getContasReceber().filter(i => {
      const p = this._parseDate(i.vencimento);
      return p && p.year === fy;
    });

    if (filters.mes) {
      items = items.filter(i => {
        const p = this._parseDate(i.vencimento);
        return p && this._meses[p.month] === filters.mes;
      });
    }
    if (filters.status === 'pago') items = items.filter(i => this._isRealized(i));
    if (filters.status === 'aberto') items = items.filter(i => !this._isRealized(i));
    if (filters.status === 'vencido') {
      const hoje = new Date();
      items = items.filter(i => !this._isRealized(i) && this._toDate(i.vencimento) < hoje);
    }
    if (filters.cliente) {
      const q = filters.cliente.toLowerCase();
      items = items.filter(i => (i.clienteNome || '').toLowerCase().includes(q));
    }

    items.sort((a, b) => (this._toDate(a.vencimento) || 0) - (this._toDate(b.vencimento) || 0));
    return items;
  },

  getResumoFinanceiro() {
    if (typeof TBO_OMIE === 'undefined') return null;
    return TBO_OMIE.getResumoFinanceiro();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // OVERRIDES MANUAIS (persistidos em Supabase + localStorage fallback)
  // ═══════════════════════════════════════════════════════════════════════════

  getOverrides() {
    try {
      return JSON.parse(localStorage.getItem('tbo_omie_overrides')) || {};
    } catch { return {}; }
  },

  setOverride(type, month, value) {
    const overrides = this.getOverrides();
    if (!overrides[type]) overrides[type] = {};
    overrides[type][month] = value;
    localStorage.setItem('tbo_omie_overrides', JSON.stringify(overrides));
    this._cache = null; // invalidar cache
    // Persistir no Supabase
    this._saveOverridesToSupabase(overrides);
  },

  clearOverrides() {
    localStorage.removeItem('tbo_omie_overrides');
    this._cache = null;
    this._saveOverridesToSupabase({});
  },

  async _saveOverridesToSupabase(overrides) {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) return;
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;
      const tenantId = localStorage.getItem('tbo_current_tenant');
      if (!tenantId) return;
      await client.from('company_context').upsert({
        tenant_id: tenantId,
        key: 'omie_overrides',
        value: JSON.stringify(overrides),
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id,key' });
    } catch (e) {
      console.warn('[Omie Bridge] Falha ao salvar overrides no Supabase:', e.message);
    }
  },

  async loadOverridesFromSupabase() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) return;
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;
      const tenantId = localStorage.getItem('tbo_current_tenant');
      if (!tenantId) return;
      const { data } = await client.from('company_context')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('key', 'omie_overrides')
        .single();
      if (data?.value) {
        const overrides = JSON.parse(data.value);
        localStorage.setItem('tbo_omie_overrides', JSON.stringify(overrides));
      }
    } catch (e) {
      // Nao encontrou — ok, sem overrides
    }
  },

  // Persistir cache do sync no Supabase para que dados sobrevivam ao limpar localStorage
  async persistSyncToSupabase() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) return;
    if (typeof TBO_OMIE === 'undefined') return;
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return;
      const tenantId = localStorage.getItem('tbo_current_tenant');
      if (!tenantId) return;

      const syncData = {
        contas_pagar: TBO_OMIE.getContasPagar(),
        contas_receber: TBO_OMIE.getContasReceber(),
        clientes: TBO_OMIE.getClientes(),
        categorias: TBO_OMIE.getCategorias(),
        last_sync: TBO_OMIE._lastSync
      };

      await client.from('company_context').upsert({
        tenant_id: tenantId,
        key: 'omie_sync_cache',
        value: JSON.stringify(syncData),
        updated_at: new Date().toISOString()
      }, { onConflict: 'tenant_id,key' });

      console.log('[Omie Bridge] Sync cache persistido no Supabase');
    } catch (e) {
      console.warn('[Omie Bridge] Falha ao persistir sync no Supabase:', e.message);
    }
  },

  // Restaurar dados do Supabase quando localStorage estiver vazio
  async restoreFromSupabase() {
    if (typeof TBO_SUPABASE === 'undefined' || !TBO_SUPABASE.isOnline()) return false;
    try {
      const client = TBO_SUPABASE.getClient();
      if (!client) return false;
      const tenantId = localStorage.getItem('tbo_current_tenant');
      if (!tenantId) return false;

      const { data } = await client.from('company_context')
        .select('value')
        .eq('tenant_id', tenantId)
        .eq('key', 'omie_sync_cache')
        .single();

      if (data?.value) {
        const syncData = JSON.parse(data.value);
        if (syncData.contas_pagar) localStorage.setItem('tbo_omie_contas_pagar', JSON.stringify(syncData.contas_pagar));
        if (syncData.contas_receber) localStorage.setItem('tbo_omie_contas_receber', JSON.stringify(syncData.contas_receber));
        if (syncData.clientes) localStorage.setItem('tbo_omie_clientes', JSON.stringify(syncData.clientes));
        if (syncData.categorias) localStorage.setItem('tbo_omie_categorias', JSON.stringify(syncData.categorias));
        if (syncData.last_sync) localStorage.setItem('tbo_omie_last_sync', syncData.last_sync);
        console.log('[Omie Bridge] Dados restaurados do Supabase');
        return true;
      }
    } catch (e) {
      console.warn('[Omie Bridge] Falha ao restaurar do Supabase:', e.message);
    }
    return false;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  _applyOverrides(fc, overrides) {
    if (!overrides || Object.keys(overrides).length === 0) return fc;
    const result = { ...fc };

    if (overrides.receita) {
      result.receita_mensal = { ...fc.receita_mensal };
      Object.entries(overrides.receita).forEach(([m, v]) => {
        if (result.receita_mensal.hasOwnProperty(m)) result.receita_mensal[m] = v;
      });
    }
    if (overrides.despesa) {
      result.despesa_mensal = { ...fc.despesa_mensal };
      Object.entries(overrides.despesa).forEach(([m, v]) => {
        if (result.despesa_mensal.hasOwnProperty(m)) result.despesa_mensal[m] = v;
      });
    }

    // Recalcular resultado
    result.resultado_mensal = {};
    this._meses.forEach(m => {
      result.resultado_mensal[m] = (result.receita_mensal[m] || 0) - (result.despesa_mensal[m] || 0);
    });

    return result;
  },

  _parseDate(dateStr) {
    if (!dateStr) return null;
    let d, m, y;
    if (dateStr.includes('/')) {
      // dd/mm/yyyy
      const parts = dateStr.split('/');
      d = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10) - 1; // 0-based
      y = parseInt(parts[2], 10);
    } else if (dateStr.includes('-')) {
      // yyyy-mm-dd
      const parts = dateStr.split('-');
      y = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10) - 1;
      d = parseInt(parts[2], 10);
    } else {
      return null;
    }
    if (isNaN(y) || isNaN(m) || m < 0 || m > 11) return null;
    return { year: y, month: m, day: d };
  },

  _toDate(dateStr) {
    const p = this._parseDate(dateStr);
    if (!p) return null;
    return new Date(p.year, p.month, p.day);
  },

  _isRealized(item) {
    if (!item) return false;
    const s = (item.status || '').toUpperCase();
    return s === 'LIQUIDADO' || s === 'PAGO' || s === 'RECEBIDO' || s === 'QUITADO' ||
           !!(item.pagamento || item.recebimento);
  },

  _mapCategoria(categoriaNome) {
    if (!categoriaNome) return 'operacionais';
    const lower = categoriaNome.toLowerCase();
    const map = this.getCategoryMap();
    for (const [keyword, cat] of Object.entries(map)) {
      if (lower.includes(keyword.toLowerCase())) return cat;
    }
    return 'operacionais'; // fallback
  },

  getCategoryMap() {
    try {
      const custom = JSON.parse(localStorage.getItem('tbo_omie_category_map'));
      if (custom && Object.keys(custom).length > 0) return custom;
    } catch {}
    return this._defaultCategoryMap;
  },

  setCategoryMap(map) {
    localStorage.setItem('tbo_omie_category_map', JSON.stringify(map));
    this._cache = null;
  },

  // Formatar valor BRL
  _fmt(v) {
    return (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  // Formatar data curta
  _fmtDate(dateStr) {
    const p = this._parseDate(dateStr);
    if (!p) return dateStr || '—';
    return `${String(p.day).padStart(2, '0')}/${String(p.month + 1).padStart(2, '0')}/${p.year}`;
  }
};
