// ============================================================================
// TBO OS — Error Monitor & Performance Tracking
// Captura erros globais, performance metrics, e envia para audit_logs
// v2.1 — Observabilidade basica
// ============================================================================

const TBO_ERROR_MONITOR = {
  _errors: [],
  _maxErrors: 50,
  _initialized: false,

  // ── Inicializar listeners globais ─────────────────────────────────────
  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Capturar erros JS nao tratados
    window.addEventListener('error', (event) => {
      this._captureError({
        type: 'uncaught_error',
        message: event.message,
        source: event.filename,
        line: event.lineno,
        col: event.colno,
        stack: event.error?.stack || null
      });
    });

    // Capturar rejeicoes de Promise nao tratadas
    window.addEventListener('unhandledrejection', (event) => {
      this._captureError({
        type: 'unhandled_rejection',
        message: event.reason?.message || String(event.reason),
        stack: event.reason?.stack || null
      });
    });

    // Performance metrics apos carregamento
    if ('PerformanceObserver' in window) {
      try {
        // Observar Long Tasks (>50ms)
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach(entry => {
            if (entry.duration > 200) {
              console.warn(`[TBO Monitor] Long task: ${entry.duration.toFixed(0)}ms`);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch { /* Browser nao suporta longtask */ }
    }

    // Reportar metricas de carregamento apos load
    window.addEventListener('load', () => {
      setTimeout(() => this._reportLoadMetrics(), 1000);
    });

    console.log('[TBO Monitor] Error monitor inicializado');
  },

  // ── Capturar erro ────────────────────────────────────────────────────
  _captureError(errorData) {
    const entry = {
      ...errorData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      module: typeof TBO_ROUTER !== 'undefined' ? TBO_ROUTER.getCurrent() : null,
      userId: typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser()?.id : null
    };

    this._errors.push(entry);
    if (this._errors.length > this._maxErrors) {
      this._errors.shift();
    }

    // Log no console com contexto
    console.error(`[TBO Monitor] ${errorData.type}: ${errorData.message}`, errorData);

    // Tentar enviar para audit_logs (fire-and-forget)
    this._sendToAuditLog(entry);
  },

  // ── Enviar para Supabase audit_logs ───────────────────────────────────
  async _sendToAuditLog(entry) {
    try {
      if (typeof TBO_SUPABASE === 'undefined') return;
      const client = TBO_SUPABASE.getClient();
      if (!client) return;

      const tenantId = TBO_SUPABASE.getCurrentTenantId();

      await client.from('audit_logs').insert({
        tenant_id: tenantId,
        user_id: entry.userId || null,
        action: 'client_error',
        entity_type: 'error',
        metadata: {
          type: entry.type,
          message: entry.message,
          source: entry.source,
          line: entry.line,
          module: entry.module,
          url: entry.url,
          stack: entry.stack?.substring(0, 500) // Limitar tamanho do stack
        }
      });
    } catch {
      // Silenciar — nao queremos loop de erros
    }
  },

  // ── Metricas de carregamento ─────────────────────────────────────────
  _reportLoadMetrics() {
    if (!window.performance?.timing) return;

    const timing = window.performance.timing;
    const metrics = {
      // Tempo total de carregamento
      pageLoad: timing.loadEventEnd - timing.navigationStart,
      // DOM interativo
      domInteractive: timing.domInteractive - timing.navigationStart,
      // DOM completo
      domComplete: timing.domComplete - timing.navigationStart,
      // Tempo de rede (DNS + TCP + request)
      networkTime: timing.responseEnd - timing.fetchStart,
      // Numero de scripts carregados
      scriptCount: document.querySelectorAll('script[src]').length,
      // Tamanho estimado da pagina
      resourceCount: window.performance.getEntriesByType('resource').length
    };

    console.log('[TBO Monitor] Load metrics:', {
      pageLoad: `${metrics.pageLoad}ms`,
      domInteractive: `${metrics.domInteractive}ms`,
      domComplete: `${metrics.domComplete}ms`,
      networkTime: `${metrics.networkTime}ms`,
      scripts: metrics.scriptCount,
      resources: metrics.resourceCount
    });

    // Core Web Vitals (se disponivel)
    if ('PerformanceObserver' in window) {
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            console.log(`[TBO Monitor] LCP: ${entry.startTime.toFixed(0)}ms`);
          });
        }).observe({ type: 'largest-contentful-paint', buffered: true });

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            console.log(`[TBO Monitor] FID: ${entry.processingStart - entry.startTime}ms`);
          });
        }).observe({ type: 'first-input', buffered: true });

        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          let cls = 0;
          entries.forEach(e => { if (!e.hadRecentInput) cls += e.value; });
          console.log(`[TBO Monitor] CLS: ${cls.toFixed(4)}`);
        }).observe({ type: 'layout-shift', buffered: true });
      } catch { /* Browser nao suporta CWV */ }
    }
  },

  // ── API publica ──────────────────────────────────────────────────────

  // Obter erros recentes
  getErrors() {
    return [...this._errors];
  },

  // Limpar erros
  clearErrors() {
    this._errors = [];
  },

  // Capturar erro manualmente (para modulos usarem)
  captureError(message, context) {
    this._captureError({
      type: 'manual',
      message,
      ...context
    });
  },

  // Medir duracao de uma operacao
  async measure(name, fn) {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      if (duration > 500) {
        console.warn(`[TBO Monitor] Operacao lenta: ${name} (${duration.toFixed(0)}ms)`);
      }
      return result;
    } catch (e) {
      this._captureError({
        type: 'measured_error',
        message: `${name}: ${e.message}`,
        stack: e.stack
      });
      throw e;
    }
  }
};
