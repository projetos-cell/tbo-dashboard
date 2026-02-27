/**
 * TBO OS — Repository: RSM (Report Social Media)
 *
 * Queries for social media accounts, metrics, posts, and ideas.
 * tenant_id is REQUIRED — throws if missing.
 * Follows RepoBase pattern (_db(), _tid()).
 */

const RSMRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  return {
    // ════════════════════════════════════════════════════════════
    // ACCOUNTS
    // ════════════════════════════════════════════════════════════

    /**
     * List all social media accounts for the tenant
     * @param {Object} [filters] - Optional filters
     * @param {string} [filters.client_id] - Filter by client
     * @param {boolean} [filters.is_active] - Filter by active status
     */
    async listAccounts(filters = {}) {
      let query = _db().from('rsm_accounts')
        .select('*')
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false });

      if (filters.client_id) query = query.eq('client_id', filters.client_id);
      if (typeof filters.is_active === 'boolean') query = query.eq('is_active', filters.is_active);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Get a single account by ID
     */
    async getAccount(id) {
      const { data, error } = await _db().from('rsm_accounts')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Create a new social media account
     */
    async createAccount(account) {
      const { data, error } = await _db().from('rsm_accounts')
        .insert({
          ...account,
          tenant_id: _tid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update an existing account
     */
    async updateAccount(id, updates) {
      const { data, error } = await _db().from('rsm_accounts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // ════════════════════════════════════════════════════════════
    // METRICS
    // ════════════════════════════════════════════════════════════

    /**
     * List metrics for an account within a date range
     * @param {string} accountId
     * @param {Object} [dateRange] - { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD' }
     */
    async listMetrics(accountId, dateRange = {}) {
      let query = _db().from('rsm_metrics')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('account_id', accountId)
        .order('date', { ascending: false });

      if (dateRange.from) query = query.gte('date', dateRange.from);
      if (dateRange.to) query = query.lte('date', dateRange.to);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Create a new metric snapshot
     */
    async createMetric(metric) {
      const { data, error } = await _db().from('rsm_metrics')
        .insert({
          ...metric,
          tenant_id: _tid(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Get the most recent metric snapshot for an account
     */
    async getLatestMetrics(accountId) {
      const { data, error } = await _db().from('rsm_metrics')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('account_id', accountId)
        .order('date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    // ════════════════════════════════════════════════════════════
    // POSTS
    // ════════════════════════════════════════════════════════════

    /**
     * List posts with optional filters
     * @param {Object} [filters]
     * @param {string} [filters.account_id]
     * @param {string} [filters.status]
     * @param {string} [filters.type]
     * @param {string} [filters.from] - scheduled_date >=
     * @param {string} [filters.to] - scheduled_date <=
     */
    async listPosts(filters = {}) {
      let query = _db().from('rsm_posts')
        .select('*, account:rsm_accounts(id, handle, platform, client_id)')
        .eq('tenant_id', _tid())
        .order('scheduled_date', { ascending: true, nullsFirst: false });

      if (filters.account_id) query = query.eq('account_id', filters.account_id);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.type) query = query.eq('type', filters.type);
      if (filters.from) query = query.gte('scheduled_date', filters.from);
      if (filters.to) query = query.lte('scheduled_date', filters.to);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Get a single post by ID
     */
    async getPost(id) {
      const { data, error } = await _db().from('rsm_posts')
        .select('*, account:rsm_accounts(id, handle, platform, client_id)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Create a new post
     */
    async createPost(post) {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      const { data, error } = await _db().from('rsm_posts')
        .insert({
          ...post,
          tenant_id: _tid(),
          created_by: user?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update an existing post
     */
    async updatePost(id, updates) {
      const { data, error } = await _db().from('rsm_posts')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete a post
     */
    async deletePost(id) {
      const { error } = await _db().from('rsm_posts')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },

    // ════════════════════════════════════════════════════════════
    // IDEAS
    // ════════════════════════════════════════════════════════════

    /**
     * List ideas with optional filters
     * @param {Object} [filters]
     * @param {string} [filters.client_id]
     * @param {string} [filters.status]
     * @param {string} [filters.category]
     */
    async listIdeas(filters = {}) {
      let query = _db().from('rsm_ideas')
        .select('*')
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false });

      if (filters.client_id) query = query.eq('client_id', filters.client_id);
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.category) query = query.eq('category', filters.category);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Create a new idea
     */
    async createIdea(idea) {
      const user = typeof TBO_AUTH !== 'undefined' ? TBO_AUTH.getCurrentUser() : null;
      const { data, error } = await _db().from('rsm_ideas')
        .insert({
          ...idea,
          tenant_id: _tid(),
          created_by: user?.id || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Update an existing idea
     */
    async updateIdea(id, updates) {
      const { data, error } = await _db().from('rsm_ideas')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Delete an idea
     */
    async deleteIdea(id) {
      const { error } = await _db().from('rsm_ideas')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },

    // ════════════════════════════════════════════════════════════
    // DASHBOARD AGGREGATES
    // ════════════════════════════════════════════════════════════

    /**
     * Get dashboard metrics aggregated across all accounts
     * Returns: accounts with their latest metrics + last 7 days sparkline data
     */
    async getDashboardMetrics() {
      const tid = _tid();

      // Get all active accounts
      const { data: accounts, error: accErr } = await _db().from('rsm_accounts')
        .select('*')
        .eq('tenant_id', tid)
        .eq('is_active', true)
        .order('handle');

      if (accErr) throw accErr;
      if (!accounts || accounts.length === 0) return { accounts: [], totals: {}, lastSync: null };

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

      // Get latest metric + last 7 days for each account
      const metricsPromises = accounts.map(async (account) => {
        const [latestRes, sparklineRes] = await Promise.all([
          _db().from('rsm_metrics')
            .select('*')
            .eq('tenant_id', tid)
            .eq('account_id', account.id)
            .order('date', { ascending: false })
            .limit(1)
            .maybeSingle(),
          _db().from('rsm_metrics')
            .select('date, followers, reach, impressions, engagement_rate, source')
            .eq('tenant_id', tid)
            .eq('account_id', account.id)
            .gte('date', sevenDaysAgo)
            .order('date', { ascending: true })
        ]);

        return {
          ...account,
          latestMetric: latestRes.data,
          sparkline: sparklineRes.data || []
        };
      });

      const accountsWithMetrics = await Promise.all(metricsPromises);

      // Calculate totals
      const totals = {
        totalFollowers: 0,
        totalReach: 0,
        totalImpressions: 0,
        avgEngagement: 0,
        accountCount: accounts.length
      };

      let engagementSum = 0;
      let engagementCount = 0;

      accountsWithMetrics.forEach(a => {
        if (a.latestMetric) {
          totals.totalFollowers += a.latestMetric.followers || 0;
          totals.totalReach += a.latestMetric.reach || 0;
          totals.totalImpressions += a.latestMetric.impressions || 0;
          if (a.latestMetric.engagement_rate > 0) {
            engagementSum += parseFloat(a.latestMetric.engagement_rate);
            engagementCount++;
          }
        }
      });

      totals.avgEngagement = engagementCount > 0 ? (engagementSum / engagementCount).toFixed(2) : 0;

      // Get last sync run
      const { data: lastSync } = await _db().from('reportei_sync_runs')
        .select('id, started_at, finished_at, status, accounts_synced, metrics_upserted, error_message')
        .eq('tenant_id', tid)
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return { accounts: accountsWithMetrics, totals, lastSync };
    },

    /**
     * Get metrics evolution for a specific account over a date range
     * Used for detail charts
     */
    async getMetricsEvolution(accountId, days = 30) {
      const fromDate = new Date(Date.now() - days * 86400000).toISOString().split('T')[0];
      const { data, error } = await _db().from('rsm_metrics')
        .select('date, followers, reach, impressions, engagement_rate, clicks, saves, profile_views, source')
        .eq('tenant_id', _tid())
        .eq('account_id', accountId)
        .gte('date', fromDate)
        .order('date', { ascending: true });

      if (error) throw error;
      return data || [];
    },

    /**
     * Get last sync run info
     */
    async getLastSyncRun() {
      const { data, error } = await _db().from('reportei_sync_runs')
        .select('*')
        .eq('tenant_id', _tid())
        .order('started_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    /**
     * Trigger a manual Reportei sync via the proxy endpoint
     */
    async triggerSync() {
      const token = (await _db().auth.getSession())?.data?.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch('/api/reportei-sync?days=7', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Sync failed (${res.status})`);
      }
      return res.json();
    }
  };
})();

if (typeof window !== 'undefined') {
  window.RSMRepo = RSMRepo;
}
