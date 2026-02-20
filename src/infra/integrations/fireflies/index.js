/**
 * TBO OS — Integração: Fireflies.ai
 *
 * Contrato padronizado: connect(), sync(), healthcheck()
 * API key carregada de Supabase integration_configs.
 */

const FirefliesIntegration = (() => {
  const API_BASE = 'https://api.fireflies.ai/graphql';
  let _apiKey = null;
  let _connected = false;

  async function _loadConfig() {
    if (_apiKey) return _apiKey;

    try {
      const db = typeof TBO_DB !== 'undefined' ? TBO_DB : (typeof TBO_SUPABASE !== 'undefined' ? TBO_SUPABASE : null);
      if (!db) return null;

      const client = db.getClient ? db.getClient() : db;
      const { data } = await client.from('integration_configs')
        .select('config')
        .eq('provider', 'fireflies')
        .single();

      _apiKey = data?.config?.api_key || null;
      return _apiKey;
    } catch {
      return null;
    }
  }

  async function _query(gql, variables = {}) {
    if (!_apiKey) throw new Error('Fireflies não configurado');

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${_apiKey}`
      },
      body: JSON.stringify({ query: gql, variables })
    });

    if (!res.ok) throw new Error(`Fireflies API: ${res.status}`);
    const json = await res.json();
    if (json.errors) throw new Error(json.errors[0]?.message || 'GraphQL error');
    return json.data;
  }

  return {
    name: 'fireflies',

    async connect() {
      _apiKey = await _loadConfig();
      _connected = !!_apiKey;
      return _connected;
    },

    async healthcheck() {
      try {
        if (!_connected) await this.connect();
        if (!_connected) return { ok: false, error: 'Não configurado' };

        const data = await _query('{ user { email } }');
        return { ok: true, user: data.user?.email };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async sync(type = 'transcripts') {
      if (!_connected) await this.connect();

      if (type === 'transcripts') {
        return await _query(`{
          transcripts(limit: 20) {
            id title date duration participants
          }
        }`);
      }

      throw new Error(`Tipo de sync não suportado: ${type}`);
    },

    async getTranscript(id) {
      if (!_connected) await this.connect();

      return await _query(`
        query($id: String!) {
          transcript(id: $id) {
            id title date duration participants
            sentences { text speaker_name start_time end_time }
            summary { action_items overview }
          }
        }
      `, { id });
    },

    isConnected() {
      return _connected;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.FirefliesIntegration = FirefliesIntegration;
}
