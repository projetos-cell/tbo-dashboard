// ============================================================================
// TBO OS — Google Drive Integration (PRD v1.2)
// Acesso a arquivos do Google Drive via OAuth provider_token.
// Padrão: segue utils/google-calendar.js
// ============================================================================

const TBO_GOOGLE_DRIVE = {
  _baseUrl: 'https://www.googleapis.com/drive/v3/',
  _cache: {},
  _cacheTTL: 5 * 60 * 1000, // 5 minutos
  _cacheTime: {},
  _lastSync: localStorage.getItem('tbo_gdrive_last_sync') || null,
  _syncError: null,
  _syncing: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG — Token via Supabase Auth (Google OAuth provider_token)
  // ═══════════════════════════════════════════════════════════════════════════

  async _getAccessToken() {
    if (typeof TBO_SUPABASE === 'undefined') return null;
    const client = TBO_SUPABASE.getClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session) return null;

    return session.provider_token || null;
  },

  isEnabled() {
    return localStorage.getItem('tbo_gdrive_enabled') !== 'false';
  },

  setEnabled(enabled) {
    localStorage.setItem('tbo_gdrive_enabled', enabled ? 'true' : 'false');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HTTP — Google Drive API v3 (REST, Bearer token)
  // ═══════════════════════════════════════════════════════════════════════════

  async _request(endpoint, params = {}) {
    const token = await this._getAccessToken();
    if (!token) throw new Error('Google Drive: token não disponível. Faça login via Google OAuth.');

    const qs = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const url = `${this._baseUrl}${endpoint}${qs ? '?' + qs : ''}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      if (response.status === 401) {
        throw new Error('Google Drive: token expirado. Re-autentique via Google.');
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Google Drive ${response.status}: ${text.slice(0, 200)}`);
      }

      return response.json();
    } catch (e) {
      if (e.name === 'AbortError') throw new Error('Google Drive: timeout (15s)');
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // READ — Operações de leitura
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lista arquivos de uma pasta do Drive
   */
  async listFiles(folderId, { pageSize = 100, orderBy = 'modifiedTime desc' } = {}) {
    const cacheKey = `folder_${folderId}`;
    if (this._cache[cacheKey] && this._cacheTime[cacheKey] && (Date.now() - this._cacheTime[cacheKey]) < this._cacheTTL) {
      return this._cache[cacheKey];
    }

    const result = await this._request('files', {
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'files(id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,modifiedTime,lastModifyingUser)',
      pageSize,
      orderBy
    });

    const files = (result.files || []).map(f => this._normalizeFile(f, folderId));
    this._cache[cacheKey] = files;
    this._cacheTime[cacheKey] = Date.now();
    return files;
  },

  /**
   * Busca arquivos por query
   */
  async searchFiles(query, { pageSize = 50 } = {}) {
    const result = await this._request('files', {
      q: `name contains '${query.replace(/'/g, "\\'")}' and trashed = false`,
      fields: 'files(id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,modifiedTime,lastModifyingUser)',
      pageSize
    });
    return (result.files || []).map(f => this._normalizeFile(f));
  },

  /**
   * Busca metadata de um arquivo específico
   */
  async getFileMetadata(fileId) {
    return await this._request(`files/${fileId}`, {
      fields: 'id,name,mimeType,size,webViewLink,webContentLink,thumbnailLink,iconLink,modifiedTime,lastModifyingUser,parents'
    });
  },

  /**
   * Normaliza resposta da API para formato TBO
   */
  _normalizeFile(file, folderId = null) {
    return {
      google_file_id: file.id,
      name: file.name || 'Sem nome',
      mime_type: file.mimeType || '',
      size_bytes: file.size ? parseInt(file.size, 10) : null,
      web_view_link: file.webViewLink || null,
      web_content_link: file.webContentLink || null,
      thumbnail_link: file.thumbnailLink || null,
      icon_link: file.iconLink || null,
      google_folder_id: folderId,
      last_modified_by: file.lastModifyingUser?.displayName || null,
      last_modified_at: file.modifiedTime || null
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Sincronizar arquivos de projetos para o Supabase
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sincroniza todos os projetos que têm google_folder_id configurado.
   * Persiste arquivos em project_files via FilesRepo.
   */
  async sync({ onProgress } = {}) {
    if (!this.isEnabled()) return null;
    if (this._syncing) return null;

    this._syncing = true;
    this._syncError = null;

    try {
      const hasFilesRepo = typeof FilesRepo !== 'undefined';
      if (!hasFilesRepo) {
        console.warn('[TBO Google Drive] FilesRepo não disponível');
        return null;
      }

      // Buscar projetos com google_folder_id configurado
      const hasProjectsRepo = typeof ProjectsRepo !== 'undefined';
      let projects = [];

      if (hasProjectsRepo) {
        const allProjects = await ProjectsRepo.list({ limit: 500 });
        projects = (allProjects || []).filter(p => p.google_folder_id);
      }

      if (projects.length === 0) {
        console.log('[TBO Google Drive] Nenhum projeto com google_folder_id');
        this._syncing = false;
        return { synced: 0, projects: 0 };
      }

      let totalSynced = 0;

      for (let i = 0; i < projects.length; i++) {
        const project = projects[i];
        try {
          const files = await this.listFiles(project.google_folder_id);
          for (const file of files) {
            await FilesRepo.upsertByGoogleFileId(file.google_file_id, {
              ...file,
              project_id: project.id
            });
            totalSynced++;
          }
          if (onProgress) onProgress(i + 1, projects.length);
        } catch (e) {
          console.warn(`[TBO Google Drive] Sync projeto ${project.name} falhou:`, e.message);
        }
      }

      this._lastSync = new Date().toISOString();
      localStorage.setItem('tbo_gdrive_last_sync', this._lastSync);

      console.log(`[TBO Google Drive] Sync OK: ${totalSynced} arquivos de ${projects.length} projetos`);
      return { synced: totalSynced, projects: projects.length };

    } catch (e) {
      console.warn('[TBO Google Drive] Sync falhou:', e.message);
      this._syncError = e.message;
      return null;
    } finally {
      this._syncing = false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS
  // ═══════════════════════════════════════════════════════════════════════════

  getStatus() {
    return {
      enabled: this.isEnabled(),
      syncing: this._syncing,
      lastSync: this._lastSync,
      error: this._syncError
    };
  },

  async forceRefresh() {
    this._cache = {};
    this._cacheTime = {};
    return this.sync();
  }
};
