/**
 * TBO OS — Global Error Handler
 *
 * Captura erros não tratados (window.onerror, unhandledrejection)
 * e roteia para TBO_LOGGER + transports.
 *
 * Também fornece helpers para error boundaries em módulos.
 */

const TBO_ERRORS = (() => {
  let _installed = false;
  let _errorCount = 0;
  let _lastErrors = [];
  const MAX_LAST_ERRORS = 20;
  const ERROR_THROTTLE_MS = 1000;
  let _lastErrorTime = 0;

  function _shouldThrottle() {
    const now = Date.now();
    if (now - _lastErrorTime < ERROR_THROTTLE_MS) return true;
    _lastErrorTime = now;
    return false;
  }

  function _captureError(error, context = {}) {
    if (_shouldThrottle()) return;
    _errorCount++;

    const entry = {
      timestamp: new Date().toISOString(),
      message: error?.message || String(error),
      stack: error?.stack || null,
      name: error?.name || 'Error',
      context,
      url: window.location.href,
      route: window.location.hash.replace('#', '')
    };

    _lastErrors.push(entry);
    if (_lastErrors.length > MAX_LAST_ERRORS) _lastErrors.shift();

    if (typeof TBO_LOGGER !== 'undefined') {
      TBO_LOGGER.error(`[UNCAUGHT] ${entry.message}`, { ...entry, error });
    } else {
      console.error('[TBO_ERRORS]', entry.message, error);
    }
  }

  return {
    /**
     * Instala handlers globais (chamar uma vez no boot)
     */
    install() {
      if (_installed) return;

      // Erros síncronos
      window.addEventListener('error', (event) => {
        _captureError(event.error || new Error(event.message), {
          type: 'window.onerror',
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        });
      });

      // Promises rejeitadas sem handler
      window.addEventListener('unhandledrejection', (event) => {
        const error = event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

        _captureError(error, {
          type: 'unhandledrejection'
        });
      });

      _installed = true;
      if (typeof TBO_LOGGER !== 'undefined') {
        TBO_LOGGER.info('[TBO_ERRORS] Global error handlers instalados');
      }
    },

    /**
     * Wrapper try/catch para funções assíncronas
     * @param {function} fn - Função a executar
     * @param {string} label - Label para identificação
     * @returns {Promise<*>} Resultado ou null em caso de erro
     */
    async safe(fn, label = 'unknown') {
      try {
        return await fn();
      } catch (error) {
        _captureError(error, { type: 'safe_wrapper', label });
        return null;
      }
    },

    /**
     * Wrapper síncrono
     */
    safeSync(fn, label = 'unknown') {
      try {
        return fn();
      } catch (error) {
        _captureError(error, { type: 'safe_sync', label });
        return null;
      }
    },

    /**
     * Captura manual de erro
     */
    capture(error, context = {}) {
      _captureError(error, { type: 'manual', ...context });
    },

    /**
     * Retorna últimos erros capturados
     */
    getLastErrors(limit = 10) {
      return _lastErrors.slice(-limit);
    },

    /**
     * Retorna contagem total de erros
     */
    getErrorCount() {
      return _errorCount;
    },

    /**
     * Reset contadores (para testes)
     */
    _reset() {
      _errorCount = 0;
      _lastErrors = [];
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_ERRORS = TBO_ERRORS;
}
