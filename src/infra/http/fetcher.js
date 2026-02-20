/**
 * TBO OS — HTTP Fetcher com retry, timeout e headers padronizados
 *
 * Wrapper sobre fetch() nativo para chamadas a APIs externas.
 * NÃO usar para Supabase (usar TBO_DB).
 */

const TBO_HTTP = (() => {
  const DEFAULT_TIMEOUT = 15000; // 15s
  const DEFAULT_RETRIES = 2;
  const RETRY_DELAYS = [1000, 3000, 5000]; // backoff

  /**
   * Fetch com timeout via AbortController
   */
  async function _fetchWithTimeout(url, options, timeout) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      return response;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * @param {string} url
   * @param {object} options - Opções do fetch + extras
   * @param {number} options.timeout - Timeout em ms (default: 15000)
   * @param {number} options.retries - Tentativas (default: 2)
   * @param {boolean} options.json - Se true, faz JSON.parse no response (default: true)
   * @param {object} options.headers - Headers adicionais
   * @returns {Promise<{ok: boolean, status: number, data: *, error: string|null}>}
   */
  async function request(url, options = {}) {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      json = true,
      ...fetchOpts
    } = options;

    // Headers padrão
    fetchOpts.headers = {
      'Content-Type': 'application/json',
      ...fetchOpts.headers
    };

    let lastError = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await _fetchWithTimeout(url, fetchOpts, timeout);

        if (!response.ok) {
          const text = await response.text().catch(() => '');
          if (response.status >= 500 && attempt < retries) {
            lastError = `HTTP ${response.status}: ${text}`;
            await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt] || 3000));
            continue;
          }
          return {
            ok: false,
            status: response.status,
            data: null,
            error: `HTTP ${response.status}: ${text}`
          };
        }

        const data = json ? await response.json() : await response.text();
        return { ok: true, status: response.status, data, error: null };

      } catch (err) {
        lastError = err.name === 'AbortError' ? 'Request timeout' : err.message;

        if (attempt < retries) {
          await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt] || 3000));
          continue;
        }
      }
    }

    return { ok: false, status: 0, data: null, error: lastError };
  }

  return {
    request,

    async get(url, options = {}) {
      return request(url, { ...options, method: 'GET' });
    },

    async post(url, body, options = {}) {
      return request(url, { ...options, method: 'POST', body: JSON.stringify(body) });
    },

    async put(url, body, options = {}) {
      return request(url, { ...options, method: 'PUT', body: JSON.stringify(body) });
    },

    async patch(url, body, options = {}) {
      return request(url, { ...options, method: 'PATCH', body: JSON.stringify(body) });
    },

    async del(url, options = {}) {
      return request(url, { ...options, method: 'DELETE' });
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_HTTP = TBO_HTTP;
}
