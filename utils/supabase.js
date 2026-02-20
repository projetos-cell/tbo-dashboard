// ============================================================================
// TBO OS — Supabase Client Wrapper
// Singleton client, profile caching, online detection
// Requires: @supabase/supabase-js@2 loaded via CDN before this file
// ============================================================================

const TBO_SUPABASE = {
  _client: null,
  _profileCache: null,
  _profilePromise: null,

  // Credenciais centralizadas via config.js (ONBOARDING_CONFIG) — sem hardcode
  get _url() {
    return (typeof ONBOARDING_CONFIG !== 'undefined' && ONBOARDING_CONFIG.SUPABASE_URL)
      || (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.supabaseUrl)
      || '';
  },
  get _anonKey() {
    return (typeof ONBOARDING_CONFIG !== 'undefined' && ONBOARDING_CONFIG.SUPABASE_ANON_KEY)
      || (typeof TBO_CONFIG !== 'undefined' && TBO_CONFIG.supabaseAnonKey)
      || '';
  },

  // ── Client singleton (H6: delega para TBO_DB quando disponível) ──────
  getClient() {
    // Se TBO_DB está inicializado, reutilizar seu client (evitar 2 instâncias)
    if (typeof TBO_DB !== 'undefined' && TBO_DB.isReady()) {
      if (!this._client) {
        this._client = TBO_DB.getClient();
        console.log('[TBO_SUPABASE] Reutilizando client do TBO_DB (single instance)');
      }
      return this._client;
    }

    // Fallback: criar client próprio (cenário legacy / onboarding)
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

  // ── Business Config CRUD (replaces localStorage overrides) ────────────
  // Table: business_config { id uuid PK, key text UNIQUE, value jsonb, updated_at timestamptz }

  async loadBusinessConfig() {
    try {
      const client = this.getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('business_config')
        .select('key, value')
        .order('key');

      if (error) {
        // Table might not exist yet — fall back silently
        if (error.code === '42P01' || error.message?.includes('does not exist')) {
          console.info('[TBO Supabase] business_config table not found, using defaults');
          return null;
        }
        throw error;
      }

      if (!data || data.length === 0) return null;

      // Reconstruct config object from key-value rows
      const config = {};
      data.forEach(row => {
        config[row.key] = row.value;
      });
      return config;
    } catch (e) {
      console.warn('[TBO Supabase] loadBusinessConfig error:', e.message);
      return null;
    }
  },

  async saveBusinessConfigKey(key, value) {
    try {
      const client = this.getClient();
      if (!client) return false;
      const session = await this.getSession();

      const { error } = await client
        .from('business_config')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
          updated_by: session?.user?.id || null
        }, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('[TBO Supabase] saveBusinessConfigKey error:', e.message);
      return false;
    }
  },

  async saveBusinessConfigBulk(configObject) {
    try {
      const client = this.getClient();
      if (!client) return false;
      const session = await this.getSession();

      const rows = Object.entries(configObject).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
        updated_by: session?.user?.id || null
      }));

      const { error } = await client
        .from('business_config')
        .upsert(rows, { onConflict: 'key' });

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('[TBO Supabase] saveBusinessConfigBulk error:', e.message);
      return false;
    }
  },

  // ── Fluxo de Caixa CRUD (replaces Google Sheets/JSON) ────────────────
  // Table: financial_data { id uuid PK, year int, month text, category text, value jsonb, updated_at timestamptz }

  async loadFinancialData(year) {
    try {
      const client = this.getClient();
      if (!client) return null;

      const { data, error } = await client
        .from('financial_data')
        .select('*')
        .eq('year', year)
        .order('month');

      if (error) {
        if (error.code === '42P01' || error.message?.includes('does not exist')) return null;
        throw error;
      }

      return data;
    } catch (e) {
      console.warn('[TBO Supabase] loadFinancialData error:', e.message);
      return null;
    }
  },

  async saveFinancialData(year, month, category, value) {
    try {
      const client = this.getClient();
      if (!client) return false;
      const session = await this.getSession();

      const { error } = await client
        .from('financial_data')
        .upsert({
          year,
          month,
          category,
          value,
          updated_at: new Date().toISOString(),
          updated_by: session?.user?.id || null
        }, { onConflict: 'year,month,category' });

      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('[TBO Supabase] saveFinancialData error:', e.message);
      return false;
    }
  },

  // ── Carregar credenciais de integracoes do Supabase ────────────────────
  // Fonte de verdade: tabela integration_configs (criada na migration v3)
  // Cacheia em localStorage para uso offline
  async loadIntegrationKeys(tenantId) {
    try {
      const client = this.getClient();
      if (!client || !tenantId) return;

      const { data, error } = await client
        .from('integration_configs')
        .select('integration_type, api_key, api_secret, active')
        .eq('tenant_id', tenantId)
        .eq('active', true);

      if (error) {
        console.warn('[TBO Supabase] loadIntegrationKeys error:', error.message);
        return;
      }

      if (!data || data.length === 0) return;

      // Persistir em localStorage para uso pelas integracoes existentes
      data.forEach(config => {
        if (config.integration_type === 'fireflies' && config.api_key) {
          localStorage.setItem('tbo_fireflies_api_key', config.api_key);
          localStorage.setItem('tbo_fireflies_enabled', 'true');
        } else if (config.integration_type === 'omie' && config.api_key) {
          localStorage.setItem('tbo_omie_app_key', config.api_key);
          if (config.api_secret) localStorage.setItem('tbo_omie_app_secret', config.api_secret);
          localStorage.setItem('tbo_omie_enabled', 'true');
        } else if (config.integration_type === 'rd_station' && config.api_key) {
          localStorage.setItem('tbo_rd_api_token', config.api_key);
          localStorage.setItem('tbo_rd_enabled', 'true');
        } else if (config.integration_type === 'google_calendar') {
          localStorage.setItem('tbo_gcal_enabled', config.active ? 'true' : 'false');
        }
      });

      console.log(`[TBO Supabase] ${data.length} integration keys loaded from DB`);
    } catch (e) {
      console.warn('[TBO Supabase] loadIntegrationKeys failed:', e);
    }
  },

  // ── Obter tenant_id ativo do usuario atual ──────────────────────────
  getCurrentTenantId() {
    // Tentar de workspace selector primeiro
    const wsId = localStorage.getItem('tbo_current_tenant');
    if (wsId) return wsId;

    // Tentar do session
    try {
      const raw = sessionStorage.getItem('tbo_auth');
      if (raw) {
        const session = JSON.parse(raw);
        return session.tenantId || null;
      }
    } catch { /* ignore */ }
    return null;
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
