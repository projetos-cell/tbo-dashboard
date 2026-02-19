// ============================================================================
// TBO OS — Google Calendar Integration (Read-Only)
// Sincroniza eventos do Google Calendar para exibicao no TBO OS.
// Usa Supabase Auth (Google OAuth) com scope calendar.readonly.
// ============================================================================

const TBO_GOOGLE_CALENDAR = {
  _baseUrl: 'https://www.googleapis.com/calendar/v3/',
  _cache: { events: null },
  _cacheTTL: 5 * 60 * 1000, // 5 minutos
  _cacheTime: { events: null },
  _lastSync: localStorage.getItem('tbo_gcal_last_sync') || null,
  _syncError: null,
  _syncing: false,

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG — Token obtido via Supabase Auth (Google OAuth provider_token)
  // ═══════════════════════════════════════════════════════════════════════════

  async _getAccessToken() {
    if (typeof TBO_SUPABASE === 'undefined') return null;
    const client = TBO_SUPABASE.getClient();
    if (!client) return null;

    const { data: { session } } = await client.auth.getSession();
    if (!session) return null;

    // provider_token e o Google access_token retornado pelo Supabase Auth
    return session.provider_token || null;
  },

  isEnabled() {
    return localStorage.getItem('tbo_gcal_enabled') !== 'false';
  },

  setEnabled(enabled) {
    localStorage.setItem('tbo_gcal_enabled', enabled ? 'true' : 'false');
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HTTP — Google Calendar API (REST, Bearer token)
  // ═══════════════════════════════════════════════════════════════════════════

  async _request(endpoint, params = {}) {
    const token = await this._getAccessToken();
    if (!token) throw new Error('Google Calendar: token nao disponivel. Faca login via Google OAuth.');

    const qs = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');

    const url = `${this._baseUrl}${endpoint}${qs ? '?' + qs : ''}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });

    if (response.status === 401) {
      throw new Error('Google Calendar: token expirado. Re-autentique via Google.');
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Google Calendar ${response.status}: ${text.slice(0, 200)}`);
    }

    return response.json();
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // READ — Buscar eventos
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchCalendarList() {
    const result = await this._request('users/me/calendarList');
    return result.items || [];
  },

  async fetchEvents(calendarId = 'primary', options = {}) {
    const now = new Date();
    const timeMin = options.timeMin || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const timeMax = options.timeMax || new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const result = await this._request(`calendars/${encodeURIComponent(calendarId)}/events`, {
      timeMin,
      timeMax,
      maxResults: options.maxResults || 250,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return result.items || [];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFORM — Normalizar eventos para formato TBO
  // ═══════════════════════════════════════════════════════════════════════════

  _normalizeEvent(event) {
    const start = event.start?.dateTime || event.start?.date || '';
    const end = event.end?.dateTime || event.end?.date || '';
    const isAllDay = !event.start?.dateTime;

    return {
      googleEventId: event.id || '',
      title: event.summary || '(sem titulo)',
      description: event.description || '',
      startAt: start,
      endAt: end,
      isAllDay,
      location: event.location || '',
      attendees: (event.attendees || []).map(a => ({
        email: a.email || '',
        name: a.displayName || '',
        responseStatus: a.responseStatus || ''
      })),
      organizer: event.organizer?.email || '',
      htmlLink: event.htmlLink || '',
      status: event.status || '',
      _source: 'google_calendar'
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Pull eventos (Google → TBO)
  // ═══════════════════════════════════════════════════════════════════════════

  async sync() {
    if (!this.isEnabled()) return null;
    if (this._syncing) return null;

    this._syncing = true;
    this._syncError = null;

    try {
      console.log('[TBO Google Calendar] Starting sync...');

      // Buscar eventos do calendario primario
      const events = await this.fetchEvents('primary');
      const normalized = events.map(e => this._normalizeEvent(e));

      // Armazenar em localStorage
      localStorage.setItem('tbo_gcal_events', JSON.stringify(normalized));
      this._cache.events = normalized;
      this._cacheTime.events = Date.now();

      // Atualizar timestamp
      this._lastSync = new Date().toISOString();
      localStorage.setItem('tbo_gcal_last_sync', this._lastSync);

      console.log(`[TBO Google Calendar] ${normalized.length} eventos sincronizados`);
      return { events: normalized.length };

    } catch (e) {
      console.warn('[TBO Google Calendar] Sync falhou:', e.message);
      this._syncError = e.message;
      return null;
    } finally {
      this._syncing = false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CACHE GETTERS — Para uso pelos modulos
  // ═══════════════════════════════════════════════════════════════════════════

  getEvents() {
    if (this._cache.events && this._cacheTime.events &&
        (Date.now() - this._cacheTime.events) < this._cacheTTL) {
      return this._cache.events;
    }
    try { return JSON.parse(localStorage.getItem('tbo_gcal_events') || '[]'); }
    catch (e) { return []; }
  },

  getUpcomingEvents(limit = 10) {
    const now = new Date().toISOString();
    return this.getEvents()
      .filter(e => e.startAt >= now)
      .slice(0, limit);
  },

  getTodayEvents() {
    const today = new Date().toISOString().split('T')[0];
    return this.getEvents().filter(e => {
      const eventDate = (e.startAt || '').split('T')[0];
      return eventDate === today;
    });
  },

  getEventsForDate(dateStr) {
    return this.getEvents().filter(e => {
      const eventDate = (e.startAt || '').split('T')[0];
      return eventDate === dateStr;
    });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — Para indicadores de UI
  // ═══════════════════════════════════════════════════════════════════════════

  getStatus() {
    const events = this.getEvents();
    return {
      enabled: this.isEnabled(),
      syncing: this._syncing,
      lastSync: this._lastSync,
      error: this._syncError,
      eventCount: events.length,
      upcomingCount: this.getUpcomingEvents(100).length,
      todayCount: this.getTodayEvents().length
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CONNECTION TEST
  // ═══════════════════════════════════════════════════════════════════════════

  async testConnection() {
    const calendars = await this.fetchCalendarList();
    return { ok: true, calendars: calendars.length };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH
  // ═══════════════════════════════════════════════════════════════════════════

  async forceRefresh() {
    this._cache = { events: null };
    this._cacheTime = { events: null };
    return this.sync();
  }
};
