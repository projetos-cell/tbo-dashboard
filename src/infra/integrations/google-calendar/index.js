/**
 * TBO OS — Integração: Google Calendar
 *
 * Contrato padronizado: connect(), sync(), healthcheck()
 */

const GoogleCalendarIntegration = (() => {
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
        .eq('provider', 'google_calendar')
        .single();

      _config = data?.config || null;
      return _config;
    } catch {
      return null;
    }
  }

  return {
    name: 'google-calendar',

    async connect() {
      _config = await _loadConfig();
      _connected = !!_config;
      return _connected;
    },

    async healthcheck() {
      try {
        if (!_connected) await this.connect();
        return { ok: _connected, error: _connected ? null : 'Não configurado' };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    async sync() {
      if (!_connected) await this.connect();
      if (!_connected) throw new Error('Google Calendar não configurado');

      // Delegado para utils/google-calendar.js existente
      if (typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
        return await TBO_GOOGLE_CALENDAR.syncEvents();
      }
      throw new Error('TBO_GOOGLE_CALENDAR não disponível');
    },

    isConnected() {
      return _connected;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.GoogleCalendarIntegration = GoogleCalendarIntegration;
}
