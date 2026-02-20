/**
 * TBO OS — Bootstrap (entrypoint centralizado)
 *
 * Sequência de inicialização:
 * 1. Config
 * 2. Error handlers
 * 3. Logger
 * 4. Supabase client (db_ready)
 * 5. Route registry (routes_ready)
 * 6. Boot flag
 *
 * M1: Performance marks em cada etapa
 * M2: Protegido por DOMContentLoaded para garantir DOM pronto
 */

(function () {
  'use strict';

  function _mark(name) {
    try { performance.mark('tbo:' + name); } catch { /* noop */ }
  }

  function _measure(name, start, end) {
    try { performance.measure('tbo:' + name, 'tbo:' + start, 'tbo:' + end); } catch { /* noop */ }
  }

  async function _boot() {
    _mark('boot_start');
    const perfStart = performance.now();

    // ── 1. Config ──
    if (typeof TBO_APP_CONFIG !== 'undefined') {
      TBO_APP_CONFIG.init();
      _mark('config_ready');
      console.log('[BOOT] Config inicializada:', TBO_APP_CONFIG.getEnvironment());
    }

    // ── 2. Error Handlers ──
    if (typeof TBO_ERRORS !== 'undefined') {
      TBO_ERRORS.install();
    }

    // ── 3. Logger ──
    if (typeof TBO_LOGGER !== 'undefined') {
      TBO_LOGGER.setContext({ version: '3.0', build: 'enterprise' });

      if (typeof TBO_APP_CONFIG !== 'undefined' && TBO_APP_CONFIG.isDebug()) {
        TBO_LOGGER.setLevel('debug');
      }

      TBO_LOGGER.info('[BOOT] Logger pronto');
    }

    // ── 4. Supabase Client ──
    if (typeof TBO_DB !== 'undefined') {
      const client = TBO_DB.init();
      _mark('db_ready');
      if (client) {
        console.log('[BOOT] TBO_DB inicializado');
      } else {
        console.warn('[BOOT] TBO_DB falhou — tentando fallback TBO_SUPABASE');
      }
    }

    // ── 5. Route Registry ──
    if (typeof TBO_ROUTE_REGISTRY !== 'undefined' && typeof TBO_ROUTER !== 'undefined') {
      TBO_ROUTE_REGISTRY.applyToRouter(TBO_ROUTER);
      _mark('routes_ready');
      console.log('[BOOT] Route registry aplicado ao router');
    } else {
      console.warn('[BOOT] TBO_ROUTE_REGISTRY ou TBO_ROUTER não disponível');
    }

    // ── 6. Boot completo ──
    _mark('boot_end');
    _measure('bootstrap', 'boot_start', 'boot_end');

    const bootTime = (performance.now() - perfStart).toFixed(1);
    console.log(`[BOOT] Bootstrap completo em ${bootTime}ms`);

    window.__TBO_BOOTSTRAPPED = true;
  }

  // M2: Garantir que DOM está pronto antes de executar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _boot);
  } else {
    // DOM já parseado (defer scripts rodam após parse, mas melhor ser seguro)
    _boot();
  }
})();
