// ============================================================================
// TBO OS — Google Sheets Integration (Real-time Financial Data)
// Fetches live data from the "Orçamento Agência TBO" spreadsheet
// Uses public gviz/tq CSV API — no OAuth needed
// ============================================================================

const TBO_SHEETS = {
  // Default spreadsheet ID (Orçamento Agência TBO)
  _defaultSpreadsheetId: '1hmU6k-9W4Qaj76_tYjGyTc9FZUTvXIOBbWGi3iUn5v4',

  // Cache: { sheetName: { data, fetchedAt } }
  _cache: {},
  _cacheTTL: 5 * 60 * 1000, // 5 minutes

  // Sync status
  _lastSync: null,
  _syncError: null,
  _syncing: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG — Spreadsheet ID (can be overridden in Configurações)
  // ═══════════════════════════════════════════════════════════════════════════

  getSpreadsheetId() {
    return localStorage.getItem('tbo_sheets_id') || this._defaultSpreadsheetId;
  },

  setSpreadsheetId(id) {
    localStorage.setItem('tbo_sheets_id', id);
    this._cache = {}; // Clear cache on ID change
  },

  isEnabled() {
    return localStorage.getItem('tbo_sheets_enabled') !== 'false'; // Default: enabled
  },

  setEnabled(enabled) {
    localStorage.setItem('tbo_sheets_enabled', enabled ? 'true' : 'false');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH CSV — Core method to get data from a sheet tab
  // ═══════════════════════════════════════════════════════════════════════════

  async _fetchCSV(sheetName) {
    // Check cache
    const cached = this._cache[sheetName];
    if (cached && (Date.now() - cached.fetchedAt) < this._cacheTTL) {
      return cached.data;
    }

    const spreadsheetId = this.getSpreadsheetId();
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(sheetName)}`;

    // v2.1: AbortController com timeout de 10s para prevenir hang infinito
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let response;
    try {
      response = await fetch(url, { signal: controller.signal });
    } catch (e) {
      clearTimeout(timeout);
      if (e.name === 'AbortError') {
        throw new Error(`Sheets "${sheetName}" timeout (10s)`);
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      throw new Error(`Sheets fetch failed: ${response.status} ${response.statusText}`);
    }

    const csv = await response.text();
    if (!csv || csv.length < 10) {
      throw new Error(`Sheet "${sheetName}" returned empty data`);
    }

    const rows = this._parseCSV(csv);

    // Cache result
    this._cache[sheetName] = { data: rows, fetchedAt: Date.now() };
    return rows;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CSV PARSER — Handles quoted fields, commas in values, R$ formatting
  // ═══════════════════════════════════════════════════════════════════════════

  _parseCSV(csv) {
    const rows = [];
    const lines = csv.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      const row = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          row.push(current.trim());
          current = '';
        } else {
          current += ch;
        }
      }
      row.push(current.trim());
      rows.push(row);
    }

    return rows;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // VALUE PARSER — Parse R$ formatted values to numbers
  // ═══════════════════════════════════════════════════════════════════════════

  _parseValue(str) {
    if (!str || str === '' || str === '""') return 0;
    // Remove R$, spaces, dots (thousands separator), replace comma with dot (decimal)
    let clean = str.replace(/R\$\s*/g, '').replace(/\s/g, '').trim();
    if (!clean) return 0;

    // Handle Brazilian format: R$130.581 or R$86.854,50
    // Dots are thousands separators, comma is decimal
    if (clean.includes(',')) {
      // Has decimal comma: 86.854,50 → 86854.50
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // No decimal: 130.581 → 130581 (dots are thousands separators)
      clean = clean.replace(/\./g, '');
    }

    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  },

  _parsePercent(str) {
    if (!str || str === '') return 0;
    let clean = str.replace(/%/g, '').replace(',', '.').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FLUXO DE CAIXA 2026 — Parse into context-data.json format
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchFluxoCaixa() {
    const rows = await this._fetchCSV('Fluxo de Caixa 2026');

    // Build label → row map for easy access
    const labelMap = {};
    rows.forEach((row, i) => {
      const label = (row[0] || '').trim();
      if (label) labelMap[label] = { row, index: i };
    });

    // Month columns: B=1(Jan), C=2(Fev), D=3(Mar), ..., M=12(Dez), N=13(Total)
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const getMonthly = (label) => {
      const entry = labelMap[label];
      if (!entry) return {};
      const result = {};
      meses.forEach((m, i) => {
        result[m] = this._parseValue(entry.row[i + 1]);
      });
      return result;
    };
    const getTotal = (label) => {
      const entry = labelMap[label];
      if (!entry) return 0;
      return this._parseValue(entry.row[13]); // Column N = index 13
    };

    // ── Receita mensal ──
    const receita_mensal = getMonthly('Receita Total');

    // ── Despesa mensal (from "Despesa Total" or "Despesas Totais") ──
    const despesa_mensal_raw = getMonthly('Despesas Totais') || getMonthly('Despesa Total');
    const despesa_mensal = {};
    meses.forEach(m => {
      despesa_mensal[m] = despesa_mensal_raw[m] || 0;
    });

    // ── Resultado mensal ──
    const resultado_mensal_raw = getMonthly('Resultado Líquido') || getMonthly('Resultado Operacional');
    const resultado_mensal = {};
    meses.forEach(m => {
      resultado_mensal[m] = resultado_mensal_raw[m] || (receita_mensal[m] - despesa_mensal[m]);
    });

    // ── Margem mensal ──
    const margem_mensal_raw = getMonthly('Margem Líquida');
    const margem_mensal = {};
    meses.forEach(m => {
      if (margem_mensal_raw[m]) {
        margem_mensal[m] = margem_mensal_raw[m].toString();
      } else {
        const rec = receita_mensal[m] || 0;
        const res = resultado_mensal[m] || 0;
        margem_mensal[m] = rec > 0 ? ((res / rec) * 100).toFixed(2) + '%' : '0%';
      }
    });
    // Fix: margem is a percentage string from the sheet
    // Re-parse from sheet if available
    const margemEntry = labelMap['Margem Líquida'];
    if (margemEntry) {
      meses.forEach((m, i) => {
        const raw = (margemEntry.row[i + 1] || '').trim();
        if (raw) {
          margem_mensal[m] = raw.replace(/"/g, '');
        }
      });
    }

    // ── Despesas detalhadas ──
    const despesas_detalhadas = {
      pessoas: {
        total_anual: getTotal('Despesas de Pessoas'),
        equipe: this._parseSalarios(rows, labelMap)
      },
      terceirizacao: {
        total_anual: getTotal('Despesas de Tercerização') || getTotal('Despesas de Terceirização'),
        fixos_mensais: this._parseTerceirizacao(rows, labelMap)
      },
      operacionais: {
        total_anual: getTotal('Despesas Operacionais'),
        itens: this._parseOperacionais(rows, labelMap)
      },
      marketing: {
        total_anual: getTotal('Despesas de Área de Marketing'),
        valor_mensal: this._parseValue((labelMap['Despesas de Área de Marketing'] || {}).row?.[2]) || 5000
      },
      vendas: {
        total_anual: getTotal('Despesas de Área de Vendas'),
        valor_mensal: this._parseValue((labelMap['Despesas de Área de Vendas'] || {}).row?.[2]) || 12388
      }
    };

    // ── Critérios da Operação ──
    const criterios_operacao = {
      tributacao: (labelMap['% de tributação'] || {}).row?.[1] || '10%',
      criterio_contrato_virando_caixa: (labelMap['% Critério de Contrato virando Caixa'] || {}).row?.[1] || '30%',
      comissao_venda_liquido: (labelMap['Comissão de Venda do Líquido'] || {}).row?.[1] || '10%',
      participacao_plr: (labelMap['Participação % de PLR'] || {}).row?.[1] || '10%'
    };

    // ── Totals ──
    const receita_total = meses.reduce((s, m) => s + (receita_mensal[m] || 0), 0);
    const despesa_total = meses.reduce((s, m) => s + (despesa_mensal[m] || 0), 0);
    const resultado_total = receita_total - despesa_total;

    // ── Saldo de Caixa ──
    const saldo_caixa_entry = labelMap['Saldo de Caixa'];
    const saldo_caixa_projetado = saldo_caixa_entry ? this._parseValue(saldo_caixa_entry.row[12]) : resultado_total;

    // ── Determine meses realizados ──
    // Priority: 1) localStorage override, 2) existing static JSON value, 3) auto-detect fallback
    const meses_realizados = this._getMesesRealizados(receita_mensal);
    const meses_projetados = meses.filter(m => !meses_realizados.includes(m));

    return {
      meta_vendas_mensal: TBO_CONFIG.business.financial.monthlyTarget,
      meta_vendas_anual: TBO_CONFIG.business.financial.monthlyTarget * 12,
      receita_mensal,
      despesa_mensal,
      resultado_mensal,
      margem_mensal,
      receita_total_projetada: receita_total,
      despesa_total_projetada: despesa_total,
      resultado_liquido_projetado: resultado_total,
      saldo_caixa_projetado,
      meses_realizados,
      meses_projetados,
      despesas_detalhadas,
      criterios_operacao,
      // Preserve budget fields from static JSON (sheet doesn't have these separately)
      receita_total_orcada: getTotal('Receita Total') || receita_total,
      despesa_total_orcada: getTotal('Despesas Totais') || getTotal('Despesa Total') || despesa_total,
      resultado_liquido_orcado: resultado_total,
      margem_liquida_orcada: receita_total > 0 ? ((resultado_total / receita_total) * 100).toFixed(2) + '%' : '0%',
      _source: 'google_sheets',
      _fetchedAt: new Date().toISOString()
    };
  },

  // ── Parse salary rows (between "Despesas de Pessoas" and next section) ──
  _parseSalarios(rows, labelMap) {
    const equipe = [];
    const pessoasIdx = (labelMap['Despesas de Pessoas'] || {}).index;
    if (pessoasIdx === undefined) return equipe;

    for (let i = pessoasIdx + 1; i < rows.length; i++) {
      const label = (rows[i][0] || '').trim();
      if (!label.startsWith('Salário ') && !label.startsWith('Salario ')) break;

      // Parse "Salário Ruy | Sócio" → { nome: "Ruy", cargo: "Sócio" }
      const clean = label.replace(/^Sal[aá]rio\s+/, '');
      const parts = clean.split('|').map(s => s.trim());
      const nome = parts[0] || '';
      const cargo = parts[1] || '';

      // Use Feb salary (col C = index 2) as the stable monthly value
      const salario = this._parseValue(rows[i][2]) || this._parseValue(rows[i][1]);

      if (nome && salario > 0) {
        equipe.push({ nome, cargo, salario });
      }
    }
    return equipe;
  },

  // ── Parse terceirização rows ──
  _parseTerceirizacao(rows, labelMap) {
    const fixos = [];
    const tercIdx = (labelMap['Despesas de Tercerização'] || labelMap['Despesas de Terceirização'] || {}).index;
    if (tercIdx === undefined) return fixos;

    for (let i = tercIdx + 1; i < rows.length; i++) {
      const label = (rows[i][0] || '').trim();
      if (!label || label.startsWith('Despesas ') || label === 'Resultados') break;

      // Get total annual (col N = index 13)
      const total = this._parseValue(rows[i][13]);
      if (total > 0) {
        fixos.push({ nome: label, valor: Math.round(total / 12) || total });
      }
    }
    return fixos;
  },

  // ── Parse operacionais rows ──
  _parseOperacionais(rows, labelMap) {
    const itens = [];
    const opIdx = (labelMap['Despesas Operacionais'] || {}).index;
    if (opIdx === undefined) return itens;

    for (let i = opIdx + 1; i < rows.length; i++) {
      const label = (rows[i][0] || '').trim();
      if (!label || label === 'Despesa Total' || label === 'Resultados') break;

      // Use Feb value (col C = index 2) as stable monthly
      const valor_mensal = this._parseValue(rows[i][2]) || this._parseValue(rows[i][1]);
      if (label && valor_mensal > 0) {
        itens.push({ nome: label, valor_mensal });
      }
    }
    return itens;
  },

  // ── Get meses realizados ──
  // Uses: 1) localStorage override, 2) existing static JSON, 3) safe default
  _getMesesRealizados(receita_mensal) {
    // 1. Check localStorage override (set by user or Configuracoes module)
    const override = localStorage.getItem('tbo_sheets_meses_realizados');
    if (override) {
      try { return JSON.parse(override); } catch (e) { /* ignore */ }
    }

    // 2. Check existing static JSON data (from context-data.json loaded before Sheets)
    if (typeof TBO_STORAGE !== 'undefined') {
      const ctx = TBO_STORAGE._data?.context || {};
      const existingFC = ctx.dados_comerciais?.[TBO_CONFIG.app.fiscalYear]?.fluxo_caixa;
      if (existingFC && existingFC.meses_realizados && existingFC._source !== 'google_sheets') {
        return existingFC.meses_realizados;
      }
    }

    // 3. Safe fallback — default to jan/fev (known realized from context-data.json)
    return ['jan', 'fev'];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // A RECEBER — Parse accounts receivable data
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchContasReceber() {
    const rows = await this._fetchCSV('A receber');
    if (!rows || rows.length < 2) return {};

    // Headers: VENC., MESES, ENTRADA, STATUS, CLIENTE, DESCRIÇÃO
    // Group by month
    const byMonth = {};
    let currentMonthTotal = 0;

    for (let i = 1; i < rows.length; i++) {
      const venc = (rows[i][0] || '').trim();
      const mes = (rows[i][1] || '').trim().toUpperCase();
      const valor = this._parseValue(rows[i][2]);
      const status = (rows[i][3] || '').trim().toUpperCase();
      const cliente = (rows[i][4] || '').trim();
      const descricao = (rows[i][5] || '').trim();

      if (!mes && !venc && !cliente) continue;

      // Map month name to key
      const mesKey = this._normalizeMonthName(mes);
      if (!mesKey) continue;

      if (!byMonth[mesKey]) {
        byMonth[mesKey] = { total: 0, pago: 0, em_aberto: 0, clientes: [] };
      }

      byMonth[mesKey].total += valor;
      if (status === 'PAGO' || status === 'RECEBIDO') {
        byMonth[mesKey].pago += valor;
      } else {
        byMonth[mesKey].em_aberto += valor;
      }

      if (cliente) {
        const statusNorm = status === 'PAGO' ? 'pago' : (status === 'PARCIAL' ? 'parcial' : 'em_aberto');
        byMonth[mesKey].clientes.push({
          nome: cliente,
          valor,
          status: statusNorm,
          descricao: descricao.substring(0, 120),
          vencimento: venc
        });
      }
    }

    return byMonth;
  },

  _normalizeMonthName(mes) {
    const map = {
      'JANEIRO': 'janeiro', 'FEVEREIRO': 'fevereiro', 'MARÇO': 'marco', 'MARCO': 'marco',
      'ABRIL': 'abril', 'MAIO': 'maio', 'JUNHO': 'junho',
      'JULHO': 'julho', 'AGOSTO': 'agosto', 'SETEMBRO': 'setembro',
      'OUTUBRO': 'outubro', 'NOVEMBRO': 'novembro', 'DEZEMBRO': 'dezembro'
    };
    return map[mes.trim()] || null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOS & PRECIFICAÇÃO — Parse BU cost distribution
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchCustosPorBU() {
    const rows = await this._fetchCSV('Custos & Precificação');
    if (!rows || rows.length < 2) return {};

    // Headers row 0: "", "Branding", "Marketing", "Digital 3D", "Interiores", "Audiovisual", "TBO (Vendas & Mkt)", "Operação & Gestão", "TOTAL"
    // Find the "Despesas Fixa" row or similar for BU costs
    const buNames = ['branding', 'marketing', 'digital_3d', 'interiores', 'audiovisual'];
    const result = {};

    // Look for despesa fixa row
    for (let i = 0; i < rows.length; i++) {
      const label = (rows[i][0] || '').trim().toLowerCase();
      if (label.includes('despesa') && label.includes('fixa')) {
        // Next rows should have the BU cost values
        buNames.forEach((bu, j) => {
          const col = j + 1; // BU columns start at col 1
          result[bu] = {
            despesa_fixa: this._parseValue(rows[i][col]),
            time: 0
          };
        });
        break;
      }
    }

    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL SYNC — Load all financial data and return merged object
  // ═══════════════════════════════════════════════════════════════════════════

  async syncAll() {
    if (!this.isEnabled()) {
      console.log('[TBO Sheets] Integration disabled');
      return null;
    }

    this._syncing = true;
    this._syncError = null;

    try {
      console.log('[TBO Sheets] Syncing financial data from Google Sheets...');
      const startTime = Date.now();

      // Fetch all tabs in parallel
      const [fluxoCaixa, contasReceber, custosBU] = await Promise.all([
        this.fetchFluxoCaixa().catch(e => { console.warn('[TBO Sheets] Fluxo de Caixa fetch failed:', e); return null; }),
        this.fetchContasReceber().catch(e => { console.warn('[TBO Sheets] A Receber fetch failed:', e); return null; }),
        this.fetchCustosPorBU().catch(e => { console.warn('[TBO Sheets] Custos BU fetch failed:', e); return null; })
      ]);

      const elapsed = Date.now() - startTime;
      this._lastSync = new Date().toISOString();
      this._syncing = false;

      // Merge contas a receber into fluxo_caixa
      if (fluxoCaixa && contasReceber) {
        fluxoCaixa.contas_a_receber = contasReceber;
      }

      const result = {
        fluxo_caixa: fluxoCaixa,
        custos_por_bu: custosBU,
        _sheetsSync: {
          lastSync: this._lastSync,
          elapsed: elapsed + 'ms',
          source: 'google_sheets',
          spreadsheetId: this.getSpreadsheetId()
        }
      };

      // Cache in localStorage for offline access
      try {
        localStorage.setItem('tbo_sheets_cache', JSON.stringify(result));
        localStorage.setItem('tbo_sheets_last_sync', this._lastSync);
      } catch (e) { /* ignore */ }

      console.log(`[TBO Sheets] Sync complete in ${elapsed}ms`);
      return result;

    } catch (e) {
      this._syncError = e.message;
      this._syncing = false;
      console.error('[TBO Sheets] Sync failed:', e);

      // Try localStorage cache as fallback
      try {
        const cached = localStorage.getItem('tbo_sheets_cache');
        if (cached) {
          console.log('[TBO Sheets] Using cached data from localStorage');
          return JSON.parse(cached);
        }
      } catch (e2) { /* ignore */ }

      return null;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — For UI status indicators
  // ═══════════════════════════════════════════════════════════════════════════

  getStatus() {
    return {
      enabled: this.isEnabled(),
      syncing: this._syncing,
      lastSync: this._lastSync || localStorage.getItem('tbo_sheets_last_sync'),
      error: this._syncError,
      spreadsheetId: this.getSpreadsheetId(),
      cacheAge: this._getCacheAge()
    };
  },

  _getCacheAge() {
    const lastSync = this._lastSync || localStorage.getItem('tbo_sheets_last_sync');
    if (!lastSync) return null;
    const age = Date.now() - new Date(lastSync).getTime();
    if (age < 60000) return 'agora';
    if (age < 3600000) return Math.round(age / 60000) + 'min atrás';
    if (age < 86400000) return Math.round(age / 3600000) + 'h atrás';
    return Math.round(age / 86400000) + 'd atrás';
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH — Clear cache and re-sync
  // ═══════════════════════════════════════════════════════════════════════════

  async forceRefresh() {
    this._cache = {};
    localStorage.removeItem('tbo_sheets_cache');
    return this.syncAll();
  }
};
