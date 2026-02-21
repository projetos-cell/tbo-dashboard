// ============================================================================
// TBO OS — Integration Sync Orchestrator (PRD v1.2)
// Gerencia sincronização de todas as integrações com retry e logging.
// Padrão: backoff exponencial (1s, 3s, 5s), logging via TBO_LOGGER.
// ============================================================================

const TBO_INTEGRATION_SYNC = (() => {
  const _integrations = {};
  const _status = {};
  const _timers = {};

  /**
   * Registra uma integração
   * @param {string} name - Nome da integração (ex: 'fireflies')
   * @param {Function} syncFn - Função de sync (async)
   * @param {Object} options - { retries: 2, interval: 1800000 }
   */
  function register(name, syncFn, options = {}) {
    _integrations[name] = {
      name,
      syncFn,
      retries: options.retries ?? 2,
      interval: options.interval || null,
      enabled: options.enabled !== false
    };
    _status[name] = {
      lastSync: null,
      lastError: null,
      syncing: false,
      attempts: 0,
      success: null
    };
    console.log(`[IntegSync] Registrado: ${name} (retries: ${options.retries ?? 2})`);
  }

  /**
   * Desregistra uma integração
   */
  function unregister(name) {
    cancelAutoSync(name);
    delete _integrations[name];
    delete _status[name];
  }

  /**
   * Executa sync de uma integração com retry e backoff exponencial
   */
  async function _syncWithRetry(name, attempt = 0) {
    const integ = _integrations[name];
    if (!integ || !integ.enabled) return;

    const backoffMs = [1000, 3000, 5000];
    _status[name].syncing = true;
    _status[name].attempts = attempt + 1;

    const startTime = Date.now();

    try {
      if (typeof TBO_LOGGER !== 'undefined') {
        TBO_LOGGER.info(`[IntegSync] ${name} sync iniciando (tentativa ${attempt + 1}/${integ.retries + 1})`);
      }

      await integ.syncFn();

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      _status[name].lastSync = new Date().toISOString();
      _status[name].lastError = null;
      _status[name].success = true;

      if (typeof TBO_LOGGER !== 'undefined') {
        TBO_LOGGER.info(`[IntegSync] ${name} sync OK (${elapsed}s)`);
      }
      console.log(`[IntegSync] ${name} sync OK (${elapsed}s)`);

    } catch (err) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (attempt < integ.retries) {
        const delay = backoffMs[attempt] || 5000;
        if (typeof TBO_LOGGER !== 'undefined') {
          TBO_LOGGER.warn(`[IntegSync] ${name} falhou (${elapsed}s), retry em ${delay}ms: ${err.message}`);
        }
        console.warn(`[IntegSync] ${name} falhou, retry em ${delay}ms:`, err.message);

        await new Promise(resolve => setTimeout(resolve, delay));
        return _syncWithRetry(name, attempt + 1);
      } else {
        _status[name].lastError = err.message;
        _status[name].success = false;

        if (typeof TBO_LOGGER !== 'undefined') {
          TBO_LOGGER.error(`[IntegSync] ${name} falhou após ${integ.retries + 1} tentativas: ${err.message}`);
        }
        console.error(`[IntegSync] ${name} falhou após ${integ.retries + 1} tentativas:`, err.message);
      }
    } finally {
      _status[name].syncing = false;
    }
  }

  /**
   * Executa sync de uma integração específica
   */
  async function syncOne(name) {
    if (!_integrations[name]) {
      console.warn(`[IntegSync] Integração '${name}' não registrada`);
      return;
    }
    await _syncWithRetry(name, 0);
  }

  /**
   * Executa sync de todas as integrações em sequência
   */
  async function syncAll() {
    const names = Object.keys(_integrations).filter(n => _integrations[n].enabled);
    console.log(`[IntegSync] Sincronizando ${names.length} integrações: ${names.join(', ')}`);

    for (const name of names) {
      await _syncWithRetry(name, 0);
    }

    console.log('[IntegSync] Sync completo de todas integrações');
  }

  /**
   * Inicia auto-sync periódico para uma integração
   */
  function scheduleAutoSync(name, intervalMs) {
    const integ = _integrations[name];
    if (!integ) return;

    cancelAutoSync(name);
    const interval = intervalMs || integ.interval || 30 * 60 * 1000;

    _timers[name] = setInterval(() => {
      _syncWithRetry(name, 0).catch(e => {
        console.warn(`[IntegSync] Auto-sync ${name} falhou:`, e.message);
      });
    }, interval);

    console.log(`[IntegSync] Auto-sync ${name} agendado a cada ${Math.round(interval / 60000)}min`);
  }

  /**
   * Cancela auto-sync de uma integração
   */
  function cancelAutoSync(name) {
    if (_timers[name]) {
      clearInterval(_timers[name]);
      delete _timers[name];
    }
  }

  /**
   * Cancela todos os auto-syncs
   */
  function cancelAll() {
    for (const name of Object.keys(_timers)) {
      cancelAutoSync(name);
    }
  }

  /**
   * Retorna status de todas integrações
   */
  function getStatus() {
    const result = {};
    for (const [name, status] of Object.entries(_status)) {
      result[name] = {
        ...status,
        registered: true,
        enabled: _integrations[name]?.enabled || false,
        autoSync: !!_timers[name]
      };
    }
    return result;
  }

  /**
   * Retorna status de uma integração específica
   */
  function getIntegrationStatus(name) {
    return _status[name] || null;
  }

  /**
   * Lista nomes das integrações registradas
   */
  function list() {
    return Object.keys(_integrations);
  }

  return {
    register,
    unregister,
    syncOne,
    syncAll,
    scheduleAutoSync,
    cancelAutoSync,
    cancelAll,
    getStatus,
    getIntegrationStatus,
    list
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_INTEGRATION_SYNC = TBO_INTEGRATION_SYNC;
}
