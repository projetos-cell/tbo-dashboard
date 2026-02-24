/**
 * TBO OS — Single Supabase Client (SSOT)
 *
 * REGRA: Este é o ÚNICO ponto de criação do client Supabase no frontend.
 * Nenhum outro arquivo deve chamar createClient() diretamente.
 *
 * Segurança:
 * - Somente anon key no frontend (NUNCA service_role)
 * - Config carregada de ONBOARDING_CONFIG (injetado pelo runtime)
 * - Fallback seguro se config ausente
 */

const TBO_DB = (() => {
  let _client = null;
  let _url = null;
  let _key = null;
  let _initialized = false;

  /**
   * Resolve credenciais de forma segura
   * Prioridade: env vars > ONBOARDING_CONFIG > erro
   */
  function _resolveCredentials() {
    // 1. Tentar ONBOARDING_CONFIG (padrão atual do TBO OS)
    if (typeof ONBOARDING_CONFIG !== 'undefined' && ONBOARDING_CONFIG.SUPABASE_URL) {
      return {
        url: ONBOARDING_CONFIG.SUPABASE_URL,
        key: ONBOARDING_CONFIG.SUPABASE_ANON_KEY
      };
    }

    // 2. Tentar TBO_CONFIG legado
    if (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.SUPABASE_URL) {
      return {
        url: TBO_CONFIG.SUPABASE_URL,
        key: TBO_CONFIG.SUPABASE_ANON_KEY
      };
    }

    // 3. Fallback: meta tags (para páginas standalone)
    const urlMeta = document.querySelector('meta[name="supabase-url"]');
    const keyMeta = document.querySelector('meta[name="supabase-anon-key"]');
    if (urlMeta && keyMeta) {
      return {
        url: urlMeta.content,
        key: keyMeta.content
      };
    }

    return null;
  }

  /**
   * Valida que a key é anon (NUNCA service_role)
   */
  function _validateKey(key) {
    if (!key) return false;
    try {
      const payload = JSON.parse(atob(key.split('.')[1]));
      if (payload.role === 'service_role') {
        console.error('[TBO_DB] BLOQUEADO: service_role key detectada no frontend. Isso é uma falha de segurança.');
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  return {
    /**
     * Inicializa o client Supabase (idempotente)
     * @returns {object|null} Supabase client
     */
    init() {
      if (_initialized && _client) return _client;

      const creds = _resolveCredentials();
      if (!creds) {
        console.error('[TBO_DB] Credenciais Supabase não encontradas. Verifique ONBOARDING_CONFIG.');
        return null;
      }

      if (!_validateKey(creds.key)) {
        console.error('[TBO_DB] Key inválida ou insegura.');
        return null;
      }

      _url = creds.url;
      _key = creds.key;

      if (typeof supabase === 'undefined' || !supabase.createClient) {
        console.error('[TBO_DB] @supabase/supabase-js não carregado. Inclua o CDN antes deste script.');
        return null;
      }

      _client = supabase.createClient(_url, _key, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false
        },
        global: {
          headers: {
            'x-client-info': 'tbo-os/3.0'
          }
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });

      _initialized = true;
      console.log('[TBO_DB] Client inicializado com sucesso');
      return _client;
    },

    /**
     * Retorna o client Supabase (inicializa se necessário)
     * @returns {object} Supabase client
     */
    getClient() {
      if (!_client) this.init();
      return _client;
    },

    /**
     * Retorna URL do projeto Supabase
     */
    getUrl() {
      if (!_url) this.init();
      return _url;
    },

    /**
     * Atalho: acessa tabela (equivalente a client.from())
     * @param {string} table - Nome da tabela
     * @returns {object} Query builder
     */
    from(table) {
      return this.getClient().from(table);
    },

    /**
     * Atalho: chama RPC
     * @param {string} fn - Nome da função
     * @param {object} params - Parâmetros
     * @returns {Promise}
     */
    rpc(fn, params = {}) {
      return this.getClient().rpc(fn, params);
    },

    /**
     * Atalho: auth
     */
    get auth() {
      return this.getClient().auth;
    },

    /**
     * Atalho: storage
     */
    get storage() {
      return this.getClient().storage;
    },

    /**
     * Atalho: realtime channel
     * @param {string} name - Nome do canal
     * @returns {object} Realtime channel
     */
    channel(name) {
      return this.getClient().channel(name);
    },

    /**
     * Remove todos canais realtime
     */
    removeAllChannels() {
      return this.getClient().removeAllChannels();
    },

    /**
     * Verifica se está inicializado
     */
    isReady() {
      return _initialized && _client !== null;
    },

    /**
     * Reset para testes
     */
    _reset() {
      _client = null;
      _url = null;
      _key = null;
      _initialized = false;
    }
  };
})();

// Compatibilidade: alias para código legado
if (typeof window !== 'undefined') {
  window.TBO_DB = TBO_DB;
}
