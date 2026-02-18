// ============================================================================
// TBO OS — Supabase Client Wrapper
// Singleton client, profile caching, online detection
// Requires: @supabase/supabase-js@2 loaded via CDN before this file
// ============================================================================

const TBO_SUPABASE = {
  _client: null,
  _profileCache: null,
  _profilePromise: null,

  // Supabase project credentials
  _url: 'https://olnndpultyllyhzxuyxh.supabase.co',
  _anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU',

  // ── Client singleton ──────────────────────────────────────────────────
  getClient() {
    if (!this._client) {
      if (typeof supabase === 'undefined' || !supabase.createClient) {
        console.error('[TBO Supabase] supabase-js CDN not loaded');
        return null;
      }
      this._client = supabase.createClient(this._url, this._anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    }
    return this._client;
  },

  // ── Current session ───────────────────────────────────────────────────
  async getSession() {
    const client = this.getClient();
    if (!client) return null;
    const { data: { session } } = await client.auth.getSession();
    return session;
  },

  // ── Current user profile (cached) ─────────────────────────────────────
  async getProfile(forceRefresh) {
    if (this._profileCache && !forceRefresh) return this._profileCache;

    // Prevent duplicate concurrent fetches
    if (this._profilePromise) return this._profilePromise;

    this._profilePromise = (async () => {
      try {
        const session = await this.getSession();
        if (!session) return null;

        const { data, error } = await this.getClient()
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.warn('[TBO Supabase] Profile fetch error:', error.message);
          return null;
        }

        this._profileCache = data;
        return data;
      } catch (e) {
        console.warn('[TBO Supabase] Profile fetch failed:', e);
        return null;
      } finally {
        this._profilePromise = null;
      }
    })();

    return this._profilePromise;
  },

  clearProfileCache() {
    this._profileCache = null;
    this._profilePromise = null;
  },

  // ── Online detection ──────────────────────────────────────────────────
  isOnline() {
    return navigator.onLine;
  },

  // ── Check if Supabase is reachable ────────────────────────────────────
  async isReachable() {
    if (!navigator.onLine) return false;
    try {
      const client = this.getClient();
      if (!client) return false;
      const { error } = await client.from('profiles').select('id').limit(1);
      return !error;
    } catch {
      return false;
    }
  },

  // ── Table name mapping from legacy entity types ───────────────────────
  _tableMap: {
    'project': 'projects',
    'task': 'tasks',
    'deliverable': 'deliverables',
    'proposal': 'proposals',
    'decision': 'decisions',
    'meeting_erp': 'meetings',
    'time_entry': 'time_entries',
    'knowledge_item': 'knowledge_items'
  },

  getTable(entityType) {
    return this._tableMap[entityType] || null;
  },

  // ── Sync queue (offline writes) ───────────────────────────────────────
  _syncQueue: null,

  getSyncQueue() {
    if (this._syncQueue === null) {
      try {
        const raw = localStorage.getItem('tbo_sync_queue');
        this._syncQueue = raw ? JSON.parse(raw) : [];
      } catch { this._syncQueue = []; }
    }
    return this._syncQueue;
  },

  addToSyncQueue(op) {
    this.getSyncQueue().push({ ...op, queuedAt: new Date().toISOString() });
    localStorage.setItem('tbo_sync_queue', JSON.stringify(this._syncQueue));
  },

  async processSyncQueue() {
    const queue = this.getSyncQueue();
    if (queue.length === 0 || !this.isOnline()) return;

    const remaining = [];
    for (const op of queue) {
      try {
        const client = this.getClient();
        if (op.action === 'insert') {
          const entity = { ...op.entity };
          delete entity._pendingSync;
          if (entity.id && entity.id.startsWith('tmp_')) delete entity.id;
          await client.from(op.table).insert(entity);
        } else if (op.action === 'update') {
          await client.from(op.table).update(op.updates).eq('id', op.id);
        } else if (op.action === 'delete') {
          await client.from(op.table).delete().eq('id', op.id);
        }
      } catch (e) {
        console.warn('[TBO Supabase] Sync failed for op:', op, e);
        remaining.push(op);
      }
    }

    this._syncQueue = remaining;
    localStorage.setItem('tbo_sync_queue', JSON.stringify(remaining));

    if (remaining.length === 0) {
      console.log('[TBO Supabase] Sync queue processed successfully');
    } else {
      console.warn(`[TBO Supabase] ${remaining.length} ops remaining in sync queue`);
    }
  },

  // ── Storage helpers ──────────────────────────────────────────────────
  _storageBucket: 'contract-files',

  async uploadFile(bucket, path, file) {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client not initialized');
    const { data, error } = await client.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;
    return data;
  },

  async deleteFile(bucket, path) {
    const client = this.getClient();
    if (!client) throw new Error('Supabase client not initialized');
    const { error } = await client.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  getPublicUrl(bucket, path) {
    const client = this.getClient();
    if (!client) return '';
    const { data } = client.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  },

  async listFiles(bucket, folder) {
    const client = this.getClient();
    if (!client) return [];
    const { data, error } = await client.storage.from(bucket).list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });
    if (error) { console.warn('[TBO Supabase] listFiles error:', error); return []; }
    return data || [];
  },

  // ── Online/offline listeners ──────────────────────────────────────────
  initOnlineListeners() {
    window.addEventListener('online', () => {
      console.log('[TBO Supabase] Back online, processing sync queue...');
      this.processSyncQueue();
      document.dispatchEvent(new CustomEvent('tbo:online'));
    });

    window.addEventListener('offline', () => {
      console.log('[TBO Supabase] Gone offline');
      document.dispatchEvent(new CustomEvent('tbo:offline'));
    });
  }
};
