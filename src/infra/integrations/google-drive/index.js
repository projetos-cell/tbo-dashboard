/**
 * TBO OS — Integração: Google Drive
 *
 * Contrato padronizado: connect(), sync(), healthcheck(), isConnected()
 * Token via Supabase Auth (Google OAuth provider_token).
 * PRD v1.2 — Integração Google Drive obrigatória.
 */

const GoogleDriveIntegration = (() => {
  let _connected = false;
  let _token = null;

  async function _resolveToken() {
    if (typeof TBO_SUPABASE === 'undefined') return null;
    const client = TBO_SUPABASE.getClient();
    if (!client) return null;

    try {
      const { data: { session } } = await client.auth.getSession();
      return session?.provider_token || null;
    } catch {
      return null;
    }
  }

  return {
    name: 'google-drive',

    /**
     * Verifica se token Google está disponível
     */
    async connect() {
      _token = await _resolveToken();
      _connected = !!_token;
      return _connected;
    },

    /**
     * Testa acesso ao Drive (lista primeiro arquivo)
     */
    async healthcheck() {
      try {
        if (!_connected) await this.connect();
        if (!_connected) return { ok: false, error: 'Token Google não disponível' };

        // Testar listando 1 arquivo
        if (typeof TBO_GOOGLE_DRIVE !== 'undefined') {
          await TBO_GOOGLE_DRIVE._request('files', {
            pageSize: 1,
            fields: 'files(id,name)'
          });
          return { ok: true };
        }

        return { ok: false, error: 'TBO_GOOGLE_DRIVE não disponível' };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },

    /**
     * Sincroniza arquivos do Drive para Supabase
     */
    async sync(options = {}) {
      if (!_connected) await this.connect();
      if (!_connected) throw new Error('Google Drive não conectado');

      if (typeof TBO_GOOGLE_DRIVE !== 'undefined') {
        return await TBO_GOOGLE_DRIVE.sync(options);
      }
      throw new Error('TBO_GOOGLE_DRIVE não disponível');
    },

    /**
     * Retorna status da conexão
     */
    isConnected() {
      return _connected;
    },

    /**
     * Retorna status completo
     */
    getStatus() {
      const driveStatus = typeof TBO_GOOGLE_DRIVE !== 'undefined'
        ? TBO_GOOGLE_DRIVE.getStatus()
        : { enabled: false };

      return {
        connected: _connected,
        ...driveStatus
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.GoogleDriveIntegration = GoogleDriveIntegration;
}
