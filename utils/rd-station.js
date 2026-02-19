// ============================================================================
// TBO OS — RD Station CRM Integration (Unilateral Sync: RD → TBO)
// RD Station e a fonte unica de verdade para dados comerciais.
// Somente PULL — nenhum dado e enviado de volta ao RD Station.
// Advanced: Deals, Contacts, Activities/Notes, Tasks, Organizations,
//           Products, Sources, Campaigns, Pipelines, Custom Fields
// API Docs: https://developers.rdstation.com/reference
// Base URL: crm.rdstation.com/api/v1 (via Vercel proxy)
// ============================================================================

const TBO_RD_STATION = {
  _baseUrl: 'https://crm.rdstation.com/api/v1/',
  _cache: { deals: null, contacts: null, stages: null, activities: null, tasks: null, organizations: null, products: null, sources: null, campaigns: null, pipelines: null },
  _cacheTTL: 10 * 60 * 1000, // 10 minutes
  _cacheTime: { deals: null, contacts: null, stages: null, activities: null, tasks: null, organizations: null, products: null, sources: null, campaigns: null, pipelines: null },
  _lastSync: localStorage.getItem('tbo_rd_last_sync') || null,
  _syncError: null,
  _syncing: false,
  _lastRequestTime: 0,
  _rateLimitDelay: 500, // 500ms between API calls
  _maxRetries: 3,
  _pageLimit: 200,

  // Stage mapping keywords for auto-mapping
  _stageKeywords: {
    lead: ['lead', 'novo', 'entrada', 'new', 'primeiro contato'],
    qualificacao: ['qualifica', 'qualified', 'qualificação'],
    proposta: ['proposta', 'proposal', 'orcamento', 'orçamento'],
    negociacao: ['negocia', 'negotiat', 'follow', 'acompanhamento'],
    fechado_ganho: ['ganho', 'won', 'fechado ganho', 'closed won', 'venda'],
    fechado_perdido: ['perdido', 'lost', 'fechado perdido', 'closed lost', 'descartado']
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG — API Token stored in localStorage
  // ═══════════════════════════════════════════════════════════════════════════

  getApiToken() {
    return localStorage.getItem('tbo_rd_api_token') || '';
  },

  setApiToken(token) {
    localStorage.setItem('tbo_rd_api_token', token);
    const keys = Object.keys(this._cache);
    keys.forEach(k => { this._cache[k] = null; this._cacheTime[k] = null; });
  },

  isEnabled() {
    return localStorage.getItem('tbo_rd_enabled') !== 'false' && !!this.getApiToken();
  },

  setEnabled(enabled) {
    localStorage.setItem('tbo_rd_enabled', enabled ? 'true' : 'false');
  },

  getProxyUrl() {
    const crm = typeof TBO_STORAGE !== 'undefined' ? TBO_STORAGE.getCrmData() : {};
    return crm.config?.proxyUrl || '';
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HTTP — REST API calls with rate limiting and retry
  // ═══════════════════════════════════════════════════════════════════════════

  async _request(method, endpoint, body = null, retryCount = 0) {
    const token = this.getApiToken();
    if (!token) throw new Error('RD Station API token nao configurado');

    // Rate limiting: wait between requests
    const now = Date.now();
    const elapsed = now - this._lastRequestTime;
    if (elapsed < this._rateLimitDelay) {
      await new Promise(r => setTimeout(r, this._rateLimitDelay - elapsed));
    }

    // Build URL — use Vercel proxy to avoid CORS
    // Proxy at /api/rd-proxy forwards to plugcrm.net/api/v1/
    const proxyBase = '/api/rd-proxy';
    const sep = endpoint.includes('?') ? '&' : '?';
    const url = `${proxyBase}?endpoint=${encodeURIComponent('/' + endpoint.replace(/^\//, ''))}&token=${encodeURIComponent(token)}`;

    const headers = {
      'Content-Type': 'application/json'
    };

    const options = { method, headers };
    if (body && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(body);
    }

    this._lastRequestTime = Date.now();

    try {
      const response = await fetch(url, options);

      // Rate limited — retry
      if (response.status === 429 && retryCount < this._maxRetries) {
        console.warn('[TBO RD Station] Rate limited, retrying...');
        await new Promise(r => setTimeout(r, 2000 * (retryCount + 1)));
        return this._request(method, endpoint, body, retryCount + 1);
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`RD Station API ${response.status}: ${text.slice(0, 200)}`);
      }

      return response.json();
    } catch (e) {
      if (e.message.includes('Failed to fetch') || e.message.includes('NetworkError')) {
        throw new Error('Erro de rede — verifique conexao ou configure um proxy CORS.');
      }
      throw e;
    }
  },

  async _get(endpoint, params = {}) {
    const qs = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    const fullEndpoint = qs ? `${endpoint}?${qs}` : endpoint;
    return this._request('GET', fullEndpoint);
  },

  async _post(endpoint, body) {
    return this._request('POST', endpoint, body);
  },

  async _put(endpoint, body) {
    return this._request('PUT', endpoint, body);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // READ — Fetch data from RD Station
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchDealStages() {
    // Check cache
    if (this._cache.stages && this._cacheTime.stages &&
        (Date.now() - this._cacheTime.stages) < this._cacheTTL) {
      return this._cache.stages;
    }

    const result = await this._get('deal_stages');
    const stages = result.deal_stages || result || [];
    this._cache.stages = stages;
    this._cacheTime.stages = Date.now();

    // Persist to localStorage cache
    try {
      localStorage.setItem('tbo_rd_stages_cache', JSON.stringify(stages));
    } catch (e) { /* ignore */ }

    return stages;
  },

  async fetchDeals(page = 1, limit = 200) {
    const result = await this._get('deals', { page, limit });
    return result.deals || result || [];
  },

  async fetchAllDeals() {
    return this._fetchAllPages('deals', 'deals');
  },

  async fetchContacts(page = 1, limit = 200) {
    const result = await this._get('contacts', { page, limit });
    return result.contacts || result || [];
  },

  async fetchAllContacts() {
    return this._fetchAllPages('contacts', 'contacts');
  },

  async fetchUsers() {
    return this._get('users');
  },

  // ── Activities / Notes (anotações) ──
  async fetchActivities(params = {}) {
    const result = await this._get('activities', { page: 1, limit: this._pageLimit, ...params });
    return result.activities || result || [];
  },

  async fetchActivitiesByDeal(dealId) {
    return this.fetchActivities({ deal_id: dealId });
  },

  async fetchAllActivities() {
    return this._fetchAllPages('activities', 'activities');
  },

  // ── Tasks ──
  async fetchTasks(params = {}) {
    const result = await this._get('tasks', { page: 1, limit: this._pageLimit, ...params });
    return result.tasks || result || [];
  },

  async fetchTasksByDeal(dealId) {
    return this.fetchTasks({ deal_id: dealId });
  },

  async fetchAllTasks() {
    return this._fetchAllPages('tasks', 'tasks');
  },

  // ── Organizations (empresas) ──
  async fetchOrganizations(params = {}) {
    const result = await this._get('organizations', { page: 1, limit: this._pageLimit, ...params });
    return result.organizations || result || [];
  },

  async fetchAllOrganizations() {
    return this._fetchAllPages('organizations', 'organizations');
  },

  // ── Products (catálogo) ──
  async fetchProducts() {
    const result = await this._get('products');
    return result.products || result || [];
  },

  // ── Deal Products (produtos vinculados a um deal) ──
  async fetchDealProducts(dealId) {
    const result = await this._get(`deals/${dealId}/products`);
    return result.deal_products || result || [];
  },

  // ── Sources (origens de negócio) ──
  async fetchSources() {
    const result = await this._get('deal_sources');
    return result.deal_sources || result || [];
  },

  // ── Campaigns ──
  async fetchCampaigns() {
    const result = await this._get('campaigns');
    return result.campaigns || result || [];
  },

  // ── Pipelines (funis) ──
  async fetchPipelines() {
    const result = await this._get('deal_pipelines');
    return result.deal_pipelines || result || [];
  },

  // ── Custom Fields ──
  async fetchCustomFields(entity = 'deal') {
    const result = await this._get('custom_fields', { option: entity });
    return result.custom_fields || result || [];
  },

  // ── Generic paginated fetcher ──
  async _fetchAllPages(endpoint, key) {
    const all = [];
    let page = 1;
    while (true) {
      const result = await this._get(endpoint, { page, limit: this._pageLimit });
      const items = result[key] || result || [];
      if (!Array.isArray(items) || items.length === 0) break;
      all.push(...items);
      if (items.length < this._pageLimit || result.has_more === false) break;
      page++;
    }
    return all;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WRITE — DESATIVADO (v2: sync unilateral, RD e fonte unica de verdade)
  // Os metodos abaixo estao mantidos como stubs para compatibilidade,
  // mas nao enviam dados ao RD Station.
  // ═══════════════════════════════════════════════════════════════════════════

  async createDeal(dealPayload) {
    console.warn('[TBO RD Station] createDeal desativado — sync unilateral (RD → TBO)');
    return null;
  },

  async updateDeal(rdDealId, dealPayload) {
    console.warn('[TBO RD Station] updateDeal desativado — sync unilateral (RD → TBO)');
    return null;
  },

  async upsertContact(contactPayload) {
    console.warn('[TBO RD Station] upsertContact desativado — sync unilateral (RD → TBO)');
    return null;
  },

  async createActivity(dealId, text) {
    console.warn('[TBO RD Station] createActivity desativado — sync unilateral (RD → TBO)');
    return null;
  },

  async createTask(taskPayload) {
    console.warn('[TBO RD Station] createTask desativado — sync unilateral (RD → TBO)');
    return null;
  },

  async updateTask(taskId, taskPayload) {
    console.warn('[TBO RD Station] updateTask desativado — sync unilateral (RD → TBO)');
    return null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE MAPPING — Auto-map RD stages to TBO stages
  // ═══════════════════════════════════════════════════════════════════════════

  getStageMapping() {
    try {
      const raw = localStorage.getItem('tbo_rd_stage_mapping');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return null;
  },

  setStageMapping(mapping) {
    localStorage.setItem('tbo_rd_stage_mapping', JSON.stringify(mapping));
  },

  buildDefaultStageMapping(rdStages) {
    const mapping = { rdToTbo: {}, tboToRd: {} };

    for (const rdStage of rdStages) {
      const name = (rdStage.name || '').toLowerCase();
      let matched = false;

      for (const [tboId, keywords] of Object.entries(this._stageKeywords)) {
        if (keywords.some(kw => name.includes(kw))) {
          mapping.rdToTbo[rdStage.id] = tboId;
          if (!mapping.tboToRd[tboId]) {
            mapping.tboToRd[tboId] = rdStage.id;
          }
          matched = true;
          break;
        }
      }

      // Default unmapped stages to 'lead'
      if (!matched) {
        mapping.rdToTbo[rdStage.id] = 'lead';
      }
    }

    // Ensure all TBO stages have a reverse mapping
    const tboStages = ['lead', 'qualificacao', 'proposta', 'negociacao', 'fechado_ganho', 'fechado_perdido'];
    for (const tboId of tboStages) {
      if (!mapping.tboToRd[tboId] && rdStages.length > 0) {
        // Use first stage as fallback
        mapping.tboToRd[tboId] = rdStages[0].id;
      }
    }

    return mapping;
  },

  mapRdStageToTbo(rdStageId) {
    const mapping = this.getStageMapping();
    return mapping?.rdToTbo?.[rdStageId] || 'lead';
  },

  mapTboStageToRd(tboStageId) {
    const mapping = this.getStageMapping();
    return mapping?.tboToRd?.[tboStageId] || null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFORM — Convert between RD Station and TBO formats
  // ═══════════════════════════════════════════════════════════════════════════

  _ratingToProbability(rating) {
    const map = { 1: 10, 2: 25, 3: 50, 4: 75, 5: 90 };
    return map[rating] || 50;
  },

  _probabilityToRating(probability) {
    if (probability >= 80) return 5;
    if (probability >= 60) return 4;
    if (probability >= 40) return 3;
    if (probability >= 20) return 2;
    return 1;
  },

  _ratingToPriority(rating) {
    if (rating >= 4) return 'alta';
    if (rating >= 2) return 'media';
    return 'baixa';
  },

  _extractServices(customFields) {
    if (!Array.isArray(customFields)) return [];
    const services = [];
    for (const cf of customFields) {
      const val = cf.value || '';
      if (val && typeof val === 'string') {
        // Try to split by comma or semicolon
        val.split(/[,;]/).forEach(s => {
          const trimmed = s.trim();
          if (trimmed) services.push(trimmed);
        });
      }
    }
    return services;
  },

  _rdDealToTboDeal(rdDeal, rdActivities = [], rdTasks = []) {
    const rdStageId = rdDeal.deal_stage?.id || rdDeal.deal_stage_id;
    let stage = rdStageId ? this.mapRdStageToTbo(String(rdStageId)) : 'lead';

    // Override stage based on win status
    if (rdDeal.win === true) stage = 'fechado_ganho';
    if (rdDeal.win === false) stage = 'fechado_perdido';

    // Extract primary contact
    const primaryContact = (rdDeal.contacts || [])[0] || {};
    const contactEmail = primaryContact.email ||
      (primaryContact.emails && primaryContact.emails[0]?.email) || '';

    // Filter activities/notes for this deal
    const dealId = String(rdDeal.id);
    const dealNotes = rdActivities
      .filter(a => String(a.deal_id) === dealId)
      .map(a => ({
        id: a.id || a._id,
        text: a.text || '',
        date: a.date || a.created_at || '',
        userId: a.user_id || '',
        _source: 'rd_station'
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));

    // Filter tasks for this deal
    const dealTasks = rdTasks
      .filter(t => String(t.deal_id) === dealId)
      .map(t => ({
        id: t.id || t._id,
        title: t.title || t.subject || '',
        description: t.description || '',
        dueDate: t.due_date || '',
        status: t.status || '',
        type: t.type || '',
        userId: t.user_id || '',
        _source: 'rd_station'
      }));

    // Extract deal source info
    const dealSource = rdDeal.deal_source?.name || '';
    const campaign = rdDeal.campaign?.name || '';

    return {
      name: rdDeal.name || '',
      company: rdDeal.organization?.name || '',
      contact: primaryContact.name || '',
      contactEmail: contactEmail,
      stage: stage,
      value: rdDeal.amount_total || rdDeal.amount_unique || 0,
      probability: this._ratingToProbability(rdDeal.rating),
      services: this._extractServices(rdDeal.deal_custom_fields),
      owner: rdDeal.user?.name || '',
      notes: rdDeal.markup || '',
      source: 'rd_sync',
      rdDealId: dealId,
      rdOrganizationId: rdDeal.organization?.id || null,
      rdSourceName: dealSource,
      rdCampaign: campaign,
      rdLostReason: rdDeal.deal_lost_reason || null,
      rdClosedAt: rdDeal.closed_at || null,
      rdCreatedAt: rdDeal.created_at || null,
      rdUpdatedAt: rdDeal.updated_at || null,
      rdCustomFields: rdDeal.deal_custom_fields || [],
      margin: null,
      cost: null,
      riskFlag: false,
      priority: this._ratingToPriority(rdDeal.rating),
      expectedClose: rdDeal.prediction_date || '',
      activities: dealNotes,
      rdTasks: dealTasks
    };
  },

  _tboDealToRdDeal(tboDeal) {
    const rdStageId = this.mapTboStageToRd(tboDeal.stage);

    const payload = {
      name: tboDeal.name || '',
      amount_total: tboDeal.value || 0,
      rating: this._probabilityToRating(tboDeal.probability),
      prediction_date: tboDeal.expectedClose || null,
      markup: tboDeal.notes || ''
    };

    if (rdStageId) {
      payload.deal_stage_id = rdStageId;
    }

    // Set win flag for closed stages
    if (tboDeal.stage === 'fechado_ganho') payload.win = true;
    else if (tboDeal.stage === 'fechado_perdido') payload.win = false;

    return payload;
  },

  _rdContactToTboContact(rdContact) {
    return {
      rdContactId: String(rdContact.id),
      name: rdContact.name || '',
      title: rdContact.title || '',
      email: (rdContact.emails && rdContact.emails[0]?.email) || rdContact.email || '',
      phone: (rdContact.phones && rdContact.phones[0]?.phone) || rdContact.phone || '',
      company: rdContact.organization?.name || '',
      rdOrganizationId: rdContact.organization?.id || null,
      deals: (rdContact.deals || []).map(d => ({
        rdDealId: String(d.id),
        name: d.name || ''
      })),
      _source: 'rd_station'
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Unilateral (RD → TBO) — RD Station e fonte unica de verdade
  // ═══════════════════════════════════════════════════════════════════════════

  async sync() {
    if (!this.isEnabled()) return null;
    if (this._syncing) return null;

    this._syncing = true;
    this._syncError = null;

    try {
      console.log('[TBO RD Station] Starting unilateral sync (RD → TBO)...');

      // 1. Fetch and cache deal stages, build mapping if needed
      const rdStages = await this.fetchDealStages();
      if (!this.getStageMapping() && rdStages.length > 0) {
        const mapping = this.buildDefaultStageMapping(rdStages);
        this.setStageMapping(mapping);
        console.log('[TBO RD Station] Auto-mapped', Object.keys(mapping.rdToTbo).length, 'stages');
      }

      // 2. Fetch activities/notes and tasks (needed for deal enrichment)
      let rdActivities = [], rdTasks = [];
      try {
        rdActivities = await this.fetchAllActivities();
        console.log(`[TBO RD Station] Fetched ${rdActivities.length} activities/notes`);
      } catch (e) {
        console.warn('[TBO RD Station] Activities fetch failed (non-blocking):', e.message);
      }
      try {
        rdTasks = await this.fetchAllTasks();
        console.log(`[TBO RD Station] Fetched ${rdTasks.length} tasks`);
      } catch (e) {
        console.warn('[TBO RD Station] Tasks fetch failed (non-blocking):', e.message);
      }

      // 3. Sync deals bidirectionally (enriched with activities + tasks)
      const dealResult = await this._syncDeals(rdActivities, rdTasks);

      // 4. Sync contacts (pull only)
      const contactResult = await this._syncContacts();

      // 5. Sync organizations (pull only)
      const orgResult = await this._syncOrganizations();

      // 6. Sync metadata: sources, campaigns, pipelines, products
      const metaResult = await this._syncMetadata();

      // 7. Cache activities and tasks separately for timeline access
      this._cacheActivities(rdActivities);
      this._cacheTasks(rdTasks);

      // 8. Update sync timestamp
      this._lastSync = new Date().toISOString();
      localStorage.setItem('tbo_rd_last_sync', this._lastSync);

      const result = {
        created: dealResult.created,
        updated: dealResult.updated,
        pushed: dealResult.pushed,
        contacts: contactResult.synced,
        organizations: orgResult.synced,
        activities: rdActivities.length,
        tasks: rdTasks.length,
        sources: metaResult.sources,
        campaigns: metaResult.campaigns,
        pipelines: metaResult.pipelines,
        products: metaResult.products
      };

      console.log(`[TBO RD Station] Sync complete:`, result);
      return result;

    } catch (e) {
      console.warn('[TBO RD Station] Sync failed:', e.message);
      this._syncError = e.message;
      return null;
    } finally {
      this._syncing = false;
    }
  },

  async _syncDeals(rdActivities = [], rdTasks = []) {
    const rdDeals = await this.fetchAllDeals();
    const crmData = TBO_STORAGE.getCrmData();
    const localDeals = crmData.deals || {};
    let created = 0, updated = 0;

    // ── PULL: RD → TBO (unilateral — RD e fonte unica de verdade) ──
    for (const rdDeal of rdDeals) {
      const rdId = String(rdDeal.id);

      // Find local deal by rdDealId
      const localEntry = Object.entries(localDeals).find(
        ([_, d]) => d.rdDealId === rdId
      );

      if (!localEntry) {
        // New deal from RD — import it (enriched with activities + tasks)
        const tboDeal = this._rdDealToTboDeal(rdDeal, rdActivities, rdTasks);
        TBO_STORAGE.addCrmDeal(tboDeal);
        created++;
      } else {
        const [localId, localDeal] = localEntry;
        // RD e sempre fonte de verdade — atualizar local (enriched)
        const updates = this._rdDealToTboDeal(rdDeal, rdActivities, rdTasks);
        delete updates.source;     // preserve source
        delete updates.rdDealId;   // preserve rdDealId
        // Merge activities: keep local-only activities, add RD ones
        const localActivities = (localDeal.activities || []).filter(a => a._source !== 'rd_station');
        updates.activities = [...updates.activities, ...localActivities];
        TBO_STORAGE.updateCrmDeal(localId, updates);
        updated++;
      }
    }

    // PUSH desativado (v2) — RD Station e fonte unica de verdade
    return { created, updated, pushed: 0 };
  },

  async _syncContacts() {
    try {
      const rdContacts = await this.fetchAllContacts();

      // Store contacts in localStorage cache
      const contactMap = {};
      for (const c of rdContacts) {
        contactMap[String(c.id)] = this._rdContactToTboContact(c);
      }

      localStorage.setItem('tbo_rd_contacts_cache', JSON.stringify(contactMap));
      return { synced: rdContacts.length };
    } catch (e) {
      console.warn('[TBO RD Station] Contact sync failed:', e.message);
      return { synced: 0 };
    }
  },

  // ── Organizations sync ──
  async _syncOrganizations() {
    try {
      const rdOrgs = await this.fetchAllOrganizations();
      const orgMap = {};
      for (const org of rdOrgs) {
        orgMap[String(org.id)] = {
          rdOrganizationId: String(org.id),
          name: org.name || '',
          url: org.url || '',
          address: org.address || '',
          city: org.address_city || '',
          state: org.address_state || '',
          cnpj: org.cnpj || '',
          segment: org.segment || '',
          customFields: org.organization_custom_fields || [],
          userId: org.user_id || '',
          createdAt: org.created_at || '',
          _source: 'rd_station'
        };
      }
      localStorage.setItem('tbo_rd_organizations_cache', JSON.stringify(orgMap));
      console.log(`[TBO RD Station] Synced ${rdOrgs.length} organizations`);
      return { synced: rdOrgs.length };
    } catch (e) {
      console.warn('[TBO RD Station] Organization sync failed (non-blocking):', e.message);
      return { synced: 0 };
    }
  },

  // ── Metadata sync (sources, campaigns, pipelines, products) ──
  async _syncMetadata() {
    const result = { sources: 0, campaigns: 0, pipelines: 0, products: 0 };

    // Sources
    try {
      const sources = await this.fetchSources();
      localStorage.setItem('tbo_rd_sources_cache', JSON.stringify(sources));
      result.sources = sources.length;
    } catch (e) { console.warn('[TBO RD Station] Sources fetch failed:', e.message); }

    // Campaigns
    try {
      const campaigns = await this.fetchCampaigns();
      localStorage.setItem('tbo_rd_campaigns_cache', JSON.stringify(campaigns));
      result.campaigns = campaigns.length;
    } catch (e) { console.warn('[TBO RD Station] Campaigns fetch failed:', e.message); }

    // Pipelines
    try {
      const pipelines = await this.fetchPipelines();
      localStorage.setItem('tbo_rd_pipelines_cache', JSON.stringify(pipelines));
      result.pipelines = pipelines.length;
    } catch (e) { console.warn('[TBO RD Station] Pipelines fetch failed:', e.message); }

    // Products
    try {
      const products = await this.fetchProducts();
      localStorage.setItem('tbo_rd_products_cache', JSON.stringify(products));
      result.products = products.length;
    } catch (e) { console.warn('[TBO RD Station] Products fetch failed:', e.message); }

    return result;
  },

  // ── Cache activities and tasks for timeline access ──
  _cacheActivities(activities) {
    try {
      // Index by deal_id for fast lookup
      const byDeal = {};
      for (const a of activities) {
        const did = String(a.deal_id || '');
        if (!did) continue;
        if (!byDeal[did]) byDeal[did] = [];
        byDeal[did].push({
          id: a.id || a._id,
          text: a.text || '',
          date: a.date || a.created_at || '',
          userId: a.user_id || ''
        });
      }
      localStorage.setItem('tbo_rd_activities_cache', JSON.stringify(byDeal));
    } catch (e) { /* storage full — ignore */ }
  },

  _cacheTasks(tasks) {
    try {
      const byDeal = {};
      for (const t of tasks) {
        const did = String(t.deal_id || '');
        if (!did) continue;
        if (!byDeal[did]) byDeal[did] = [];
        byDeal[did].push({
          id: t.id || t._id,
          title: t.title || t.subject || '',
          description: t.description || '',
          dueDate: t.due_date || '',
          status: t.status || '',
          type: t.type || '',
          userId: t.user_id || ''
        });
      }
      localStorage.setItem('tbo_rd_tasks_cache', JSON.stringify(byDeal));
    } catch (e) { /* storage full — ignore */ }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PUSH HOOKS — DESATIVADO (v2: sync unilateral, RD e fonte unica)
  // Mantidos como stubs para compatibilidade com storage.js
  // ═══════════════════════════════════════════════════════════════════════════

  async pushDealCreate(tboDeal) {
    // v2: nao envia dados ao RD Station — sync unilateral
    return null;
  },

  async pushDealUpdate(tboDeal) {
    // v2: nao envia dados ao RD Station — sync unilateral
    return null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — For UI indicators
  // ═══════════════════════════════════════════════════════════════════════════

  getStatus() {
    const hasToken = !!this.getApiToken();
    const enabled = localStorage.getItem('tbo_rd_enabled') !== 'false';

    // Count synced deals
    let dealCount = 0, rdDealCount = 0;
    if (typeof TBO_STORAGE !== 'undefined') {
      const deals = TBO_STORAGE.getCrmDeals();
      dealCount = deals.length;
      rdDealCount = deals.filter(d => d.rdDealId).length;
    }

    // Count cached entities
    const _countCache = (key) => {
      try {
        const c = localStorage.getItem(key);
        if (c) { const p = JSON.parse(c); return Array.isArray(p) ? p.length : Object.keys(p).length; }
      } catch (e) { /* ignore */ }
      return 0;
    };

    return {
      enabled: enabled && hasToken,
      hasToken,
      syncing: this._syncing,
      lastSync: this._lastSync,
      error: this._syncError,
      dealCount,
      rdDealCount,
      contactCount: _countCache('tbo_rd_contacts_cache'),
      organizationCount: _countCache('tbo_rd_organizations_cache'),
      activityCount: _countCache('tbo_rd_activities_cache'),
      taskCount: _countCache('tbo_rd_tasks_cache'),
      sourceCount: _countCache('tbo_rd_sources_cache'),
      campaignCount: _countCache('tbo_rd_campaigns_cache'),
      pipelineCount: _countCache('tbo_rd_pipelines_cache'),
      productCount: _countCache('tbo_rd_products_cache')
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION TEST — Validate token
  // ═══════════════════════════════════════════════════════════════════════════

  async testConnection() {
    const result = await this.fetchUsers();
    return result;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH — Clear cache and re-sync
  // ═══════════════════════════════════════════════════════════════════════════

  async forceRefresh() {
    // Clear all caches
    const keys = Object.keys(this._cache);
    keys.forEach(k => { this._cache[k] = null; this._cacheTime[k] = null; });
    return this.sync();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STAGE MAPPING MODAL — UI for configuring stage mapping
  // ═══════════════════════════════════════════════════════════════════════════

  async _showStageMappingModal() {
    if (typeof TBO_MODAL === 'undefined') return;

    // Fetch stages if not cached
    let rdStages;
    try {
      rdStages = await this.fetchDealStages();
    } catch (e) {
      if (typeof TBO_TOAST !== 'undefined') {
        TBO_TOAST.error('RD Station', 'Erro ao carregar etapas: ' + e.message);
      }
      return;
    }

    const currentMapping = this.getStageMapping() || { rdToTbo: {}, tboToRd: {} };
    const tboStages = [
      { id: 'lead', label: 'Lead' },
      { id: 'qualificacao', label: 'Qualificacao' },
      { id: 'proposta', label: 'Proposta Enviada' },
      { id: 'negociacao', label: 'Negociacao' },
      { id: 'fechado_ganho', label: 'Fechado Ganho' },
      { id: 'fechado_perdido', label: 'Fechado Perdido' }
    ];

    let html = `
      <div style="font-size:0.82rem; color:var(--text-secondary); margin-bottom:12px;">
        Mapeie cada etapa do RD Station para uma etapa do TBO OS.
      </div>
      <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:8px; align-items:center;">
        <div style="font-weight:600; font-size:0.75rem; color:var(--text-muted);">ETAPA RD STATION</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">→</div>
        <div style="font-weight:600; font-size:0.75rem; color:var(--text-muted);">ETAPA TBO</div>
    `;

    for (const rdStage of rdStages) {
      const currentTbo = currentMapping.rdToTbo[rdStage.id] || 'lead';
      html += `
        <div style="font-size:0.82rem; padding:4px 0;">${rdStage.name}</div>
        <div style="color:var(--text-muted);">→</div>
        <select class="form-input rd-stage-select" data-rd-stage-id="${rdStage.id}"
          style="font-size:0.78rem; padding:4px 8px;">
          ${tboStages.map(ts => `<option value="${ts.id}" ${ts.id === currentTbo ? 'selected' : ''}>${ts.label}</option>`).join('')}
        </select>
      `;
    }

    html += `</div>
      <div style="display:flex; gap:8px; margin-top:16px; justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="TBO_MODAL.close()">Cancelar</button>
        <button class="btn btn-primary" id="rdSaveMappingBtn">Salvar Mapeamento</button>
      </div>
    `;

    TBO_MODAL.show('Mapeamento de Etapas — RD Station', html);

    // Bind save
    setTimeout(() => {
      const saveBtn = document.getElementById('rdSaveMappingBtn');
      if (saveBtn) {
        saveBtn.addEventListener('click', () => {
          const newMapping = { rdToTbo: {}, tboToRd: {} };
          document.querySelectorAll('.rd-stage-select').forEach(sel => {
            const rdId = sel.getAttribute('data-rd-stage-id');
            const tboId = sel.value;
            newMapping.rdToTbo[rdId] = tboId;
            if (!newMapping.tboToRd[tboId]) {
              newMapping.tboToRd[tboId] = rdId;
            }
          });
          this.setStageMapping(newMapping);
          TBO_MODAL.close();
          if (typeof TBO_TOAST !== 'undefined') {
            TBO_TOAST.success('RD Station', 'Mapeamento de etapas salvo!');
          }
        });
      }
    }, 100);
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTACTS CACHE — For use by clientes module
  // ═══════════════════════════════════════════════════════════════════════════

  getCachedContacts() {
    try {
      const raw = localStorage.getItem('tbo_rd_contacts_cache');
      if (raw) return JSON.parse(raw);
    } catch (e) { /* ignore */ }
    return {};
  },

  getCachedContactByEmail(email) {
    if (!email) return null;
    const contacts = this.getCachedContacts();
    return Object.values(contacts).find(c =>
      c.email && c.email.toLowerCase() === email.toLowerCase()
    ) || null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE GETTERS — For use by other modules
  // ═══════════════════════════════════════════════════════════════════════════

  getCachedOrganizations() {
    try { return JSON.parse(localStorage.getItem('tbo_rd_organizations_cache') || '{}'); }
    catch (e) { return {}; }
  },

  getCachedActivitiesByDeal(dealId) {
    try {
      const all = JSON.parse(localStorage.getItem('tbo_rd_activities_cache') || '{}');
      return all[String(dealId)] || [];
    } catch (e) { return []; }
  },

  getCachedTasksByDeal(dealId) {
    try {
      const all = JSON.parse(localStorage.getItem('tbo_rd_tasks_cache') || '{}');
      return all[String(dealId)] || [];
    } catch (e) { return []; }
  },

  getCachedSources() {
    try { return JSON.parse(localStorage.getItem('tbo_rd_sources_cache') || '[]'); }
    catch (e) { return []; }
  },

  getCachedCampaigns() {
    try { return JSON.parse(localStorage.getItem('tbo_rd_campaigns_cache') || '[]'); }
    catch (e) { return []; }
  },

  getCachedPipelines() {
    try { return JSON.parse(localStorage.getItem('tbo_rd_pipelines_cache') || '[]'); }
    catch (e) { return []; }
  },

  getCachedProducts() {
    try { return JSON.parse(localStorage.getItem('tbo_rd_products_cache') || '[]'); }
    catch (e) { return []; }
  },

  // Get all activities across all deals (flat list, sorted by date desc)
  getAllCachedActivities() {
    try {
      const byDeal = JSON.parse(localStorage.getItem('tbo_rd_activities_cache') || '{}');
      const all = [];
      for (const [dealId, activities] of Object.entries(byDeal)) {
        activities.forEach(a => all.push({ ...a, dealId }));
      }
      return all.sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) { return []; }
  },

  // Get organization by RD ID
  getCachedOrganizationById(rdOrgId) {
    if (!rdOrgId) return null;
    const orgs = this.getCachedOrganizations();
    return orgs[String(rdOrgId)] || null;
  }
};
