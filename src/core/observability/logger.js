/**
 * TBO OS — Logger com contexto estruturado
 *
 * Níveis: debug, info, warn, error, fatal
 * Contexto automático: user_id, org_id, route, timestamp
 * Preparado para integrar Sentry/Logtail/Highlight via transport
 */

const TBO_LOGGER = (() => {
  const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, fatal: 4 };

  // Auto-detect environment: production = Vercel deploy, dev = localhost/127.0.0.1
  const _isProduction = (() => {
    try {
      const h = window.location.hostname;
      return h !== 'localhost' && h !== '127.0.0.1' && !h.startsWith('192.168.');
    } catch { return false; }
  })();

  // Em produção: apenas warn+ (silencia debug/info)
  // Em dev: info+ (mostra tudo exceto debug)
  let _level = _isProduction ? LOG_LEVELS.warn : LOG_LEVELS.info;
  let _context = {};
  const _transports = []; // [{name, fn}]
  let _buffer = [];
  const MAX_BUFFER = 500;

  function _getTimestamp() {
    return new Date().toISOString();
  }

  function _getCurrentRoute() {
    try {
      return window.location.hash.replace('#', '') || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  function _getUserContext() {
    try {
      if (typeof TBO_AUTH !== 'undefined') {
        const user = TBO_AUTH.getCurrentUser();
        if (user) {
          return {
            user_id: user.id,
            org_id: user.tenant_id || user.org_id || null,
            role: user.role || null
          };
        }
      }
    } catch { /* noop */ }
    return { user_id: null, org_id: null, role: null };
  }

  function _buildEntry(level, message, data = {}) {
    return {
      timestamp: _getTimestamp(),
      level,
      message,
      route: _getCurrentRoute(),
      ..._getUserContext(),
      ..._context,
      data: data instanceof Error ? {
        name: data.name,
        message: data.message,
        stack: data.stack
      } : data
    };
  }

  function _dispatch(level, message, data) {
    if (LOG_LEVELS[level] < _level) return;

    const entry = _buildEntry(level, message, data);

    // Buffer circular
    _buffer.push(entry);
    if (_buffer.length > MAX_BUFFER) _buffer.shift();

    // Console nativo
    const consoleFn = level === 'fatal' ? 'error' : level;
    const prefix = `[TBO ${level.toUpperCase()}]`;
    if (data instanceof Error) {
      console[consoleFn](prefix, message, data);
    } else if (Object.keys(data).length > 0) {
      console[consoleFn](prefix, message, data);
    } else {
      console[consoleFn](prefix, message);
    }

    // Transports externos (Sentry, Logtail, etc.)
    _transports.forEach(t => {
      try {
        t.fn(entry);
      } catch (e) {
        console.warn(`[TBO_LOGGER] Transport "${t.name}" falhou:`, e);
      }
    });
  }

  return {
    debug(msg, data = {}) { _dispatch('debug', msg, data); },
    info(msg, data = {}) { _dispatch('info', msg, data); },
    warn(msg, data = {}) { _dispatch('warn', msg, data); },
    error(msg, data = {}) { _dispatch('error', msg, data); },
    fatal(msg, data = {}) { _dispatch('fatal', msg, data); },

    /**
     * Define nível mínimo de log
     * @param {'debug'|'info'|'warn'|'error'|'fatal'} level
     */
    setLevel(level) {
      if (LOG_LEVELS[level] !== undefined) _level = LOG_LEVELS[level];
    },

    /**
     * Adiciona contexto persistente a todos os logs
     * @param {object} ctx - Ex: { feature: 'chat', version: '3.0' }
     */
    setContext(ctx) {
      _context = { ..._context, ...ctx };
    },

    /**
     * Registra transport externo
     * @param {string} name - Nome do transport
     * @param {function} fn - Recebe entry {timestamp, level, message, ...}
     */
    addTransport(name, fn) {
      _transports.push({ name, fn });
    },

    /**
     * Retorna buffer de logs (últimos N entries)
     * @param {number} limit
     * @returns {Array}
     */
    getBuffer(limit = 50) {
      return _buffer.slice(-limit);
    },

    /**
     * Limpa buffer
     */
    clearBuffer() {
      _buffer = [];
    },

    /**
     * Exporta buffer como JSON (para debug/support)
     */
    exportJSON() {
      return JSON.stringify(_buffer, null, 2);
    },

    /**
     * Retorna se está em ambiente de produção
     * @returns {boolean}
     */
    isProduction() { return _isProduction; },

    /**
     * Performance mark wrapper
     * @param {string} name - Nome da marca
     * @returns {function} Função para encerrar a medição
     */
    perf(name) {
      const start = performance.now();
      const markName = `tbo_${name}`;
      try { performance.mark(`${markName}_start`); } catch { /* noop */ }

      return () => {
        const duration = performance.now() - start;
        try {
          performance.mark(`${markName}_end`);
          performance.measure(markName, `${markName}_start`, `${markName}_end`);
        } catch { /* noop */ }

        _dispatch('debug', `[PERF] ${name}: ${duration.toFixed(1)}ms`, { duration, perfMark: name });
        return duration;
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_LOGGER = TBO_LOGGER;
}
