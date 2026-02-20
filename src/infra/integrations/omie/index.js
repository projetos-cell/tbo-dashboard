/**
 * TBO OS — Integração: Omie ERP
 *
 * Contrato padronizado: connect(), sync(), healthcheck()
 * Usa api/omie-proxy.js como thin layer.
 */

const OmieIntegration = (() => {
  const PROXY_BASE = '/api/omie-proxy';
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
        .eq('provider', 'omie')
        .single();

      _config = data?.config || null;
      return _config;
    } catch {
      return null;
    }
  }

  return {
    name: 'omie',

    async connect() {
      _config = await _loadConfig();
      _connected = !!(_config?.app_key && _config?.app_secret);
      return _connected;
    },

    async healthcheck() {
      try {
        if (!_connected) await this.connect();
        if (!_connected) return { ok: false, error: 'Não configurado' };

        const res = await fetch(`${PROXY_BASE}/geral/empresas/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(typeof TBO_AUTH !== 'undefined' ? (await TBO_AUTH.getSession())?.access_token : '')}`
          },
          body: JSON.stringify({
            call: 'ListarEmpresas',
            param: [{ pagina: 1, registros_por_pagina: 1 }]
          })
        });

        return { ok: res.ok, status: res.status };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async sync(endpoint, payload) {
      if (!_connected) await this.connect();
      if (!_connected) throw new Error('Omie não configurado');

      const res = await fetch(`${PROXY_BASE}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(typeof TBO_AUTH !== 'undefined' ? (await TBO_AUTH.getSession())?.access_token : '')}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(`Omie sync falhou: ${res.status}`);
      return await res.json();
    },

    isConnected() {
      return _connected;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.OmieIntegration = OmieIntegration;
}
