/**
 * TBO OS — Configuração centralizada
 *
 * Carrega config de forma segura:
 * 1. Variáveis de ambiente (Vercel)
 * 2. ONBOARDING_CONFIG (runtime)
 * 3. Defaults seguros
 *
 * NUNCA armazena secrets — apenas referências.
 */

const TBO_APP_CONFIG = (() => {
  // Defaults seguros (zero secrets)
  const DEFAULTS = {
    app: {
      name: 'TBO OS',
      version: '3.0.0',
      environment: 'production',
      debug: false,
      defaultModule: 'dashboard',
      defaultLocale: 'pt-BR'
    },
    supabase: {
      // URL e key vêm de ONBOARDING_CONFIG ou meta tags — não hardcode aqui
      realtimeEventsPerSecond: 10,
      authRedirectUrl: null // auto-detectado
    },
    performance: {
      skeletonDelayMs: 0,
      pageTransitionMs: 180,
      toastDurationMs: 4000,
      maxConcurrentRequests: 6,
      lazyLoadThresholdPx: 200
    },
    security: {
      maxInputLength: 10000,
      maxFileUploadMB: 50,
      sessionTimeoutMinutes: 480, // 8 horas
      csrfEnabled: false // Supabase usa JWT, não precisa CSRF
    },
    ui: {
      navigationStyle: 'notion' // 'notion' | 'classic'
    },
    features: {
      realtime: true,
      notifications: true,
      chat: true,
      academy: false, // desativado para performance
      analytics: true,
      debugPanel: false
    }
  };

  let _config = null;

  function _deepMerge(target, source) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = _deepMerge(result[key] || {}, source[key]);
      } else if (source[key] !== undefined) {
        result[key] = source[key];
      }
    }
    return result;
  }

  function _detectEnvironment() {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'development';
    if (hostname.includes('preview') || hostname.includes('staging')) return 'staging';
    return 'production';
  }

  return {
    /**
     * Inicializa config (idempotente)
     * @param {object} overrides - Overrides opcionais
     * @returns {object} Config final
     */
    init(overrides = {}) {
      if (_config) return _config;

      const env = _detectEnvironment();
      const envOverrides = {
        app: {
          environment: env,
          debug: env === 'development'
        }
      };

      _config = _deepMerge(DEFAULTS, envOverrides);
      _config = _deepMerge(_config, overrides);

      // Auth redirect URL auto-detectado
      if (!_config.supabase.authRedirectUrl) {
        _config.supabase.authRedirectUrl = `${window.location.origin}/`;
      }

      // Debug mode: logger em nível debug
      if (_config.app.debug && typeof TBO_LOGGER !== 'undefined') {
        TBO_LOGGER.setLevel('debug');
      }

      return _config;
    },

    /**
     * Acessa config (inicializa se necessário)
     * @param {string} path - Ex: 'app.version', 'features.chat'
     * @returns {*}
     */
    get(path) {
      if (!_config) this.init();

      return path.split('.').reduce((obj, key) => obj?.[key], _config);
    },

    /**
     * Retorna config completa (read-only)
     */
    getAll() {
      if (!_config) this.init();
      return { ..._config };
    },

    /**
     * Verifica se uma feature está ativa
     * @param {string} featureName
     * @returns {boolean}
     */
    isFeatureEnabled(featureName) {
      return this.get(`features.${featureName}`) === true;
    },

    /**
     * Retorna ambiente atual
     */
    getEnvironment() {
      return this.get('app.environment');
    },

    /**
     * Modo debug ativo?
     */
    isDebug() {
      return this.get('app.debug') === true;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_APP_CONFIG = TBO_APP_CONFIG;
}
