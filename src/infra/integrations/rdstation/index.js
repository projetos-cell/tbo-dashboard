/**
 * TBO OS — Integração: RD Station CRM
 *
 * Contrato padronizado: connect(), sync(), healthcheck()
 * Usa api/rd-proxy.js como thin layer (Vercel serverless).
 */

const RDStationIntegration = (() => {
  const PROXY_BASE = '/api/rd-proxy';
  let _config = null;
  let _connected = false;

  async function _loadConfig() {
    if (_config) return _config;

    try {
      const db = typeof TBO_DB !== 'undefined' ? TBO_DB : (typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE : null);
      if (!db) return null;

      const client = db.getClient ? db.getClient() : db;
      const { data } = await client.from('integration_configs')
        .select('config')
        .eq('provider', 'rdstation')
        .single();

      _config = data?.config || null;
      return _config;
    } catch {
      return null;
    }
  }

  return {
    name: 'rdstation',

    async connect() {
      _config = await _loadConfig();
      _connected = !!_config?.api_token;
      return _connected;
    },

    async healthcheck() {
      try {
        if (!_connected) await this.connect();
        if (!_connected) return { ok: false, error: 'Não configurado' };

        const res = await fetch(`${PROXY_BASE}/deals?limit=1`, {
          headers: {
            'Authorization': `Bearer ${(typeof TBO_AUTH !== 'undefined' ? (await TBO_AUTH.getSession())?.access_token : '')}`
          }
        });

        return { ok: res.ok, status: res.status };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async sync(entity = 'deals') {
      if (!_connected) await this.connect();
      if (!_connected) throw new Error('RD Station não configurado');

      // Sync via proxy
      const res = await fetch(`${PROXY_BASE}/${entity}`, {
        headers: {
          'Authorization': `Bearer ${(typeof TBO_AUTH !== 'undefined' ? (await TBO_AUTH.getSession())?.access_token : '')}`
        }
      });

      if (!res.ok) throw new Error(`RD sync falhou: ${res.status}`);
      return await res.json();
    },

    isConnected() {
      return _connected;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.RDStationIntegration = RDStationIntegration;
}
