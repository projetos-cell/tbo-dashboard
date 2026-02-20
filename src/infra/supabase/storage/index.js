/**
 * TBO OS — Storage Layer (Supabase Storage)
 *
 * Centraliza operações de upload/download de arquivos.
 * Buckets: onboarding-files, avatars, project-files, chat-attachments
 */

const TBO_STORAGE = (() => {
  const BUCKETS = {
    ONBOARDING: 'onboarding-files',
    AVATARS: 'avatars',
    PROJECTS: 'project-files',
    CHAT: 'chat-attachments'
  };

  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

  function _storage() {
    if (typeof TBO_DB !== 'undefined') return TBO_DB.storage;
    if (typeof TBO_SUPABASE !== 'undefined') return TBO_SUPABASE.getClient().storage;
    throw new Error('[TBO_STORAGE] Nenhum client Supabase disponível');
  }

  return {
    BUCKETS,

    /**
     * Upload de arquivo
     * @param {string} bucket - Nome do bucket
     * @param {string} path - Caminho dentro do bucket
     * @param {File} file - Arquivo a enviar
     * @param {object} options - Opções extras (upsert, cacheControl)
     * @returns {Promise<{path: string, url: string}>}
     */
    async upload(bucket, path, file, options = {}) {
      if (file.size > MAX_FILE_SIZE) {
        throw new Error(`Arquivo muito grande (máx: ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
      }

      const { data, error } = await _storage()
        .from(bucket)
        .upload(path, file, {
          upsert: options.upsert || false,
          cacheControl: options.cacheControl || '3600'
        });

      if (error) throw error;

      const { data: urlData } = _storage()
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: urlData.publicUrl
      };
    },

    /**
     * Retorna URL pública de um arquivo
     */
    getPublicUrl(bucket, path) {
      const { data } = _storage().from(bucket).getPublicUrl(path);
      return data?.publicUrl || null;
    },

    /**
     * Download de arquivo
     */
    async download(bucket, path) {
      const { data, error } = await _storage().from(bucket).download(path);
      if (error) throw error;
      return data;
    },

    /**
     * Remove arquivo
     */
    async remove(bucket, paths) {
      const pathArray = Array.isArray(paths) ? paths : [paths];
      const { error } = await _storage().from(bucket).remove(pathArray);
      if (error) throw error;
    },

    /**
     * Lista arquivos em um diretório
     */
    async list(bucket, folder = '', { limit = 100 } = {}) {
      const { data, error } = await _storage()
        .from(bucket)
        .list(folder, { limit, sortBy: { column: 'created_at', order: 'desc' } });

      if (error) throw error;
      return data;
    },

    /**
     * Upload de avatar (helper)
     */
    async uploadAvatar(userId, file) {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar.${ext}`;
      return this.upload(BUCKETS.AVATARS, path, file, { upsert: true });
    }
  };
})();

if (typeof window !== 'undefined') {
  window.TBO_STORAGE = TBO_STORAGE;
}
