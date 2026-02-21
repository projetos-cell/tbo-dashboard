// ============================================================================
// TBO OS — Omie Sync Service
// Motor de sincronizacao: Omie ERP → Supabase (via FinanceRepo)
// Orquestra: Fornecedores → Clientes → Contas a Pagar → Contas a Receber
// ============================================================================

const TBO_OMIE_SYNC = (() => {

  // Estado interno
  let _syncing = false;
  let _lastResult = null;
  let _error = null;
  let _autoSyncTimer = null;
  let _progressCallback = null; // callback(step, percent, message)

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Converte data Omie DD/MM/YYYY para formato ISO YYYY-MM-DD
   */
  function _omieDate(str) {
    if (!str) return null;
    // Ja esta no formato ISO?
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
    // Formato DD/MM/YYYY
    const parts = str.split('/');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return null;
  }

  /**
   * Mapeia status Omie para status TBO (fin_payables/fin_receivables)
   */
  function _mapStatus(omieStatus) {
    if (!omieStatus) return 'aberto';
    const s = omieStatus.toUpperCase().trim();
    if (s === 'LIQUIDADO' || s === 'PAGO' || s === 'RECEBIDO') return 'pago';
    if (s === 'ATRASADO' || s === 'VENCIDO') return 'atrasado';
    if (s === 'CANCELADO') return 'cancelado';
    if (s === 'PARCIAL') return 'parcial';
    // ABERTO, A VENCER, ou qualquer outro
    return 'aberto';
  }

  /**
   * Emite progresso para callback registrado
   */
  function _progress(step, percent, message) {
    if (_progressCallback) {
      try { _progressCallback(step, percent, message); } catch (e) { /* ignore */ }
    }
    console.log(`[TBO Omie Sync] ${message} (${percent}%)`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Fornecedores
  // ═══════════════════════════════════════════════════════════════════════════

  async function _syncVendors() {
    _progress('vendors', 5, 'Buscando fornecedores do Omie...');

    let raw;
    try {
      raw = await TBO_OMIE.fetchFornecedores();
    } catch (e) {
      console.warn('[TBO Omie Sync] fetchFornecedores falhou:', e.message);
      return { synced: 0, errors: [{ entity: 'vendors', message: e.message }] };
    }

    if (!raw || raw.length === 0) {
      _progress('vendors', 10, 'Nenhum fornecedor encontrado no Omie.');
      return { synced: 0, errors: [] };
    }

    _progress('vendors', 8, `Sincronizando ${raw.length} fornecedores...`);

    let synced = 0;
    const errors = [];

    for (const item of raw) {
      try {
        const omieId = String(item.codigo_cliente_omie || item.codigo_cliente_integracao || '');
        if (!omieId) continue;

        await FinanceRepo.upsertVendorByOmieId(omieId, {
          name: item.razao_social || item.nome_fantasia || 'Sem nome',
          cnpj: item.cnpj_cpf || null,
          email: item.email || null,
          phone: item.telefone1_numero || null,
          category: 'fornecedor',
          notes: item.nome_fantasia ? `Fantasia: ${item.nome_fantasia}` : null
        });
        synced++;
      } catch (e) {
        errors.push({ entity: 'vendor', omie_id: item.codigo_cliente_omie, message: e.message });
      }
    }

    _progress('vendors', 25, `${synced} fornecedores sincronizados.`);
    return { synced, errors };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Clientes
  // ═══════════════════════════════════════════════════════════════════════════

  async function _syncClients() {
    _progress('clients', 26, 'Buscando clientes do Omie...');

    let raw;
    try {
      raw = await TBO_OMIE.fetchClientes();
    } catch (e) {
      console.warn('[TBO Omie Sync] fetchClientes falhou:', e.message);
      return { synced: 0, errors: [{ entity: 'clients', message: e.message }] };
    }

    if (!raw || raw.length === 0) {
      _progress('clients', 35, 'Nenhum cliente encontrado no Omie.');
      return { synced: 0, errors: [] };
    }

    // Filtrar: excluir quem tem tag 'Fornecedor' (ja importado em syncVendors)
    const clientesOnly = raw.filter(c => {
      const tags = (c.tags || []).map(t => (t.tag || '').toLowerCase());
      return !tags.includes('fornecedor');
    });

    _progress('clients', 30, `Sincronizando ${clientesOnly.length} clientes...`);

    let synced = 0;
    const errors = [];

    for (const item of clientesOnly) {
      try {
        const omieId = String(item.codigo_cliente_omie || item.codigo_cliente_integracao || '');
        if (!omieId) continue;

        await FinanceRepo.upsertClientByOmieId(omieId, {
          name: item.razao_social || item.nome_fantasia || 'Sem nome',
          cnpj: item.cnpj_cpf || null,
          email: item.email || null,
          phone: item.telefone1_numero || null,
          contact_name: item.nome_fantasia || null
        });
        synced++;
      } catch (e) {
        errors.push({ entity: 'client', omie_id: item.codigo_cliente_omie, message: e.message });
      }
    }

    _progress('clients', 50, `${synced} clientes sincronizados.`);
    return { synced, errors };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Contas a Pagar
  // ═══════════════════════════════════════════════════════════════════════════

  async function _syncPayables() {
    _progress('payables', 51, 'Buscando contas a pagar do Omie...');

    let raw;
    try {
      raw = await TBO_OMIE.fetchContasPagar();
    } catch (e) {
      console.warn('[TBO Omie Sync] fetchContasPagar falhou:', e.message);
      return { synced: 0, errors: [{ entity: 'payables', message: e.message }] };
    }

    if (!raw || raw.length === 0) {
      _progress('payables', 60, 'Nenhuma conta a pagar encontrada no Omie.');
      return { synced: 0, errors: [] };
    }

    _progress('payables', 55, `Sincronizando ${raw.length} contas a pagar...`);

    let synced = 0;
    const errors = [];

    // Cache de vendors ja importados (evitar N+1)
    const vendorCache = {};

    for (const cp of raw) {
      try {
        const omieId = String(cp.codigo_lancamento_omie || cp.codigo_lancamento_integracao || '');
        if (!omieId) continue;

        // Resolver vendor FK
        let vendorId = null;
        const vendorOmieId = String(cp.codigo_cliente_fornecedor || '');
        if (vendorOmieId && vendorOmieId !== '0') {
          if (vendorCache[vendorOmieId] !== undefined) {
            vendorId = vendorCache[vendorOmieId];
          } else {
            const vendor = await FinanceRepo.findVendorByOmieId(vendorOmieId);
            vendorId = vendor?.id || null;
            vendorCache[vendorOmieId] = vendorId;
          }
        }

        const dueDate = _omieDate(cp.data_vencimento);
        const paidDate = _omieDate(cp.data_pagamento);
        const status = _mapStatus(cp.status_titulo);

        await FinanceRepo.upsertPayableByOmieId(omieId, {
          description: cp.observacao || cp.numero_documento || `Omie #${omieId}`,
          amount: parseFloat(cp.valor_documento) || 0,
          amount_paid: parseFloat(cp.valor_pago) || 0,
          due_date: dueDate,
          paid_date: paidDate,
          status: status,
          vendor_id: vendorId,
          notes: cp.numero_documento ? `Doc: ${cp.numero_documento}` : null
        });
        synced++;
      } catch (e) {
        errors.push({ entity: 'payable', omie_id: cp.codigo_lancamento_omie, message: e.message });
      }
    }

    _progress('payables', 75, `${synced} contas a pagar sincronizadas.`);
    return { synced, errors };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Contas a Receber
  // ═══════════════════════════════════════════════════════════════════════════

  async function _syncReceivables() {
    _progress('receivables', 76, 'Buscando contas a receber do Omie...');

    let raw;
    try {
      raw = await TBO_OMIE.fetchContasReceber();
    } catch (e) {
      console.warn('[TBO Omie Sync] fetchContasReceber falhou:', e.message);
      return { synced: 0, errors: [{ entity: 'receivables', message: e.message }] };
    }

    if (!raw || raw.length === 0) {
      _progress('receivables', 85, 'Nenhuma conta a receber encontrada no Omie.');
      return { synced: 0, errors: [] };
    }

    _progress('receivables', 80, `Sincronizando ${raw.length} contas a receber...`);

    let synced = 0;
    const errors = [];

    // Cache de clients ja importados
    const clientCache = {};

    for (const cr of raw) {
      try {
        const omieId = String(cr.codigo_lancamento_omie || cr.codigo_lancamento_integracao || '');
        if (!omieId) continue;

        // Resolver client FK
        // Omie usa o mesmo codigo_cliente_fornecedor para clientes E fornecedores.
        // Primeiro tenta em fin_clients; se nao achar, busca em fin_vendors e
        // cria automaticamente o registro em fin_clients (entidade pode ser ambos).
        let clientId = null;
        const clientOmieId = String(cr.codigo_cliente_fornecedor || '');
        if (clientOmieId && clientOmieId !== '0') {
          if (clientCache[clientOmieId] !== undefined) {
            clientId = clientCache[clientOmieId];
          } else {
            // 1. Tentar em fin_clients
            const client = await FinanceRepo.findClientByOmieId(clientOmieId);
            if (client) {
              clientId = client.id;
            } else {
              // 2. Fallback: buscar em fin_vendors (mesmo codigo Omie)
              const vendor = await FinanceRepo.findVendorByOmieId(clientOmieId);
              if (vendor) {
                // Criar/atualizar em fin_clients com os mesmos dados do vendor
                try {
                  const newClient = await FinanceRepo.upsertClientByOmieId(clientOmieId, {
                    name: vendor.name,
                    cnpj: vendor.cnpj || null,
                    email: vendor.email || null,
                    phone: vendor.phone || null,
                    contact_name: vendor.name
                  });
                  clientId = newClient?.id || null;
                  console.log(`[TBO Omie Sync] Vendor "${vendor.name}" tambem criado como client (omie_id: ${clientOmieId})`);
                } catch (e) {
                  console.warn(`[TBO Omie Sync] Falha ao criar client a partir de vendor ${clientOmieId}:`, e.message);
                }
              }
            }
            clientCache[clientOmieId] = clientId;
          }
        }

        const dueDate = _omieDate(cr.data_vencimento);
        const paidDate = _omieDate(cr.data_pagamento);
        const status = _mapStatus(cr.status_titulo);

        await FinanceRepo.upsertReceivableByOmieId(omieId, {
          description: cr.observacao || cr.numero_documento || `Omie #${omieId}`,
          amount: parseFloat(cr.valor_documento) || 0,
          amount_paid: parseFloat(cr.valor_pago) || 0,
          due_date: dueDate,
          paid_date: paidDate,
          status: status,
          client_id: clientId,
          notes: cr.numero_documento ? `Doc: ${cr.numero_documento}` : null
        });
        synced++;
      } catch (e) {
        errors.push({ entity: 'receivable', omie_id: cr.codigo_lancamento_omie, message: e.message });
      }
    }

    _progress('receivables', 95, `${synced} contas a receber sincronizadas.`);
    return { synced, errors };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Orquestrador principal
  // ═══════════════════════════════════════════════════════════════════════════

  async function sync() {
    if (_syncing) {
      console.warn('[TBO Omie Sync] Sync ja em andamento — ignorando.');
      return null;
    }

    if (typeof TBO_OMIE === 'undefined' || !TBO_OMIE.isEnabled()) {
      console.warn('[TBO Omie Sync] Omie nao configurado ou desativado.');
      return null;
    }

    _syncing = true;
    _error = null;
    _lastResult = null;

    let syncLog = null;
    let _syncLogAvailable = true;

    try {
      // Garantir que tenant_id esteja resolvido (async) antes de qualquer operacao
      if (typeof RepoBase !== 'undefined' && RepoBase.resolveTenantId) {
        await RepoBase.resolveTenantId();
      }

      // Criar registro de sync log (tolera tabela inexistente)
      try {
        syncLog = await FinanceRepo.createSyncLog({ status: 'running' });
      } catch (e) {
        console.warn('[TBO Omie Sync] Nao foi possivel criar sync log:', e.message);
        _syncLogAvailable = false;
      }

      _progress('start', 0, 'Iniciando sincronizacao Omie → Supabase...');

      const allErrors = [];
      const result = {
        vendors_synced: 0,
        clients_synced: 0,
        payables_synced: 0,
        receivables_synced: 0,
        total: 0,
        errors: 0,
        duration_ms: 0
      };

      const startTime = Date.now();

      // 1. Fornecedores (precisam existir antes dos payables para FK)
      const vendorsResult = await _syncVendors();
      result.vendors_synced = vendorsResult.synced;
      allErrors.push(...vendorsResult.errors);

      // 2. Clientes (precisam existir antes dos receivables para FK)
      const clientsResult = await _syncClients();
      result.clients_synced = clientsResult.synced;
      allErrors.push(...clientsResult.errors);

      // 3. Contas a Pagar
      const payablesResult = await _syncPayables();
      result.payables_synced = payablesResult.synced;
      allErrors.push(...payablesResult.errors);

      // 4. Contas a Receber
      const receivablesResult = await _syncReceivables();
      result.receivables_synced = receivablesResult.synced;
      allErrors.push(...receivablesResult.errors);

      // Totais
      result.total = result.vendors_synced + result.clients_synced +
                     result.payables_synced + result.receivables_synced;
      result.errors = allErrors.length;
      result.duration_ms = Date.now() - startTime;

      // Determinar status final
      const status = allErrors.length === 0 ? 'success' :
                     result.total > 0 ? 'partial' : 'error';

      // Atualizar sync log
      if (syncLog && _syncLogAvailable) {
        try {
          await FinanceRepo.updateSyncLog(syncLog.id, {
            finished_at: new Date().toISOString(),
            status,
            vendors_synced: result.vendors_synced,
            clients_synced: result.clients_synced,
            payables_synced: result.payables_synced,
            receivables_synced: result.receivables_synced,
            errors: allErrors.slice(0, 50) // Limitar a 50 erros no log
          });
        } catch (e) {
          console.warn('[TBO Omie Sync] Nao foi possivel atualizar sync log:', e.message);
        }
      }

      // Salvar timestamp da ultima sync
      localStorage.setItem('tbo_omie_last_sync', new Date().toISOString());

      _lastResult = result;
      _progress('done', 100, `Sincronizacao completa: ${result.total} registros em ${(result.duration_ms / 1000).toFixed(1)}s`);

      console.log('[TBO Omie Sync] Resultado:', result);
      if (allErrors.length > 0) {
        console.warn('[TBO Omie Sync] Erros:', allErrors);
      }

      return result;

    } catch (e) {
      console.error('[TBO Omie Sync] Falha critica:', e.message);
      _error = e.message;

      // Atualizar sync log com erro
      if (syncLog && _syncLogAvailable) {
        try {
          await FinanceRepo.updateSyncLog(syncLog.id, {
            finished_at: new Date().toISOString(),
            status: 'error',
            errors: [{ entity: 'sync', message: e.message }]
          });
        } catch (logErr) { /* ignore */ }
      }

      return null;
    } finally {
      _syncing = false;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-SYNC
  // ═══════════════════════════════════════════════════════════════════════════

  function isAutoSyncEnabled() {
    return localStorage.getItem('tbo_omie_auto_sync') === 'true';
  }

  function setAutoSync(enabled) {
    localStorage.setItem('tbo_omie_auto_sync', enabled ? 'true' : 'false');
    if (enabled) {
      scheduleAutoSync();
    } else {
      cancelAutoSync();
    }
  }

  function scheduleAutoSync() {
    cancelAutoSync();
    if (!isAutoSyncEnabled()) return;
    // Sync a cada 30 minutos
    _autoSyncTimer = setInterval(() => {
      if (!_syncing) {
        console.log('[TBO Omie Sync] Auto-sync disparado.');
        sync();
      }
    }, 30 * 60 * 1000);
    console.log('[TBO Omie Sync] Auto-sync agendado (30 min).');
  }

  function cancelAutoSync() {
    if (_autoSyncTimer) {
      clearInterval(_autoSyncTimer);
      _autoSyncTimer = null;
      console.log('[TBO Omie Sync] Auto-sync cancelado.');
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  function getStatus() {
    return {
      syncing: _syncing,
      lastSync: localStorage.getItem('tbo_omie_last_sync') || null,
      lastResult: _lastResult,
      error: _error,
      autoSync: isAutoSyncEnabled()
    };
  }

  /**
   * Registra callback de progresso para a UI.
   * callback(step: string, percent: number, message: string)
   */
  function onProgress(callback) {
    _progressCallback = callback;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INIT — Ativar auto-sync se configurado
  // ═══════════════════════════════════════════════════════════════════════════

  // Agendar auto-sync se estiver ativado (executado no load do script)
  if (typeof TBO_OMIE !== 'undefined' && TBO_OMIE.isEnabled() && isAutoSyncEnabled()) {
    // Delay para garantir que FinanceRepo ja carregou
    setTimeout(() => scheduleAutoSync(), 5000);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // API PUBLICA
  // ═══════════════════════════════════════════════════════════════════════════

  return {
    sync,
    getStatus,
    isAutoSyncEnabled,
    setAutoSync,
    scheduleAutoSync,
    cancelAutoSync,
    onProgress
  };

})();
