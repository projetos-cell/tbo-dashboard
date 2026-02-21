// ============================================================================
// TBO OS — Google Calendar Integration (Read + Write)
// Sincroniza eventos do Google Calendar para exibicao no TBO OS.
// Cria/atualiza/deleta eventos (1:1s, reunioes).
// Usa Supabase Auth (Google OAuth) com scope calendar.events.
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

  async _request(endpoint, params = {}, options = {}) {
    const token = await this._getAccessToken();
    if (!token) throw new Error('Google Calendar: token nao disponivel. Faca login via Google OAuth.');

    const method = options.method || 'GET';
    const body = options.body || null;

    let url = `${this._baseUrl}${endpoint}`;

    // Query string apenas para GET
    if (method === 'GET' && Object.keys(params).length > 0) {
      const qs = Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      url += `?${qs}`;
    }

    const fetchOptions = {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    };

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (response.status === 401) {
      throw new Error('Google Calendar: token expirado. Re-autentique via Google.');
    }

    // DELETE retorna 204 No Content
    if (response.status === 204) return { ok: true };

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
  // WRITE — Criar, atualizar e deletar eventos
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cria um evento no Google Calendar.
   * @param {Object} event - Dados do evento
   * @param {string} event.summary - Titulo do evento
   * @param {string} event.description - Descricao
   * @param {string} event.startDateTime - ISO datetime (ex: '2026-03-01T10:00:00-03:00')
   * @param {string} event.endDateTime - ISO datetime
   * @param {string[]} [event.attendees] - Array de emails dos participantes
   * @param {boolean} [event.addMeet] - Adicionar link do Google Meet (default: true)
   * @param {string} [event.location] - Local do evento
   * @param {string} [calendarId] - ID do calendario (default: 'primary')
   * @returns {Object} Evento criado com id, htmlLink, hangoutLink
   */
  async createEvent(event, calendarId = 'primary') {
    const body = {
      summary: event.summary || 'Reunião TBO',
      description: event.description || '',
      start: {
        dateTime: event.startDateTime,
        timeZone: event.timeZone || 'America/Sao_Paulo'
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: event.timeZone || 'America/Sao_Paulo'
      }
    };

    // Participantes
    if (event.attendees && event.attendees.length > 0) {
      body.attendees = event.attendees.map(email => ({ email }));
    }

    // Google Meet
    if (event.addMeet !== false) {
      body.conferenceData = {
        createRequest: {
          requestId: `tbo-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      };
    }

    // Local
    if (event.location) body.location = event.location;

    // Reminders
    body.reminders = {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 10 }
      ]
    };

    const endpoint = `calendars/${encodeURIComponent(calendarId)}/events`;
    const qs = event.addMeet !== false ? '?conferenceDataVersion=1' : '';

    const result = await this._request(endpoint + qs, {}, {
      method: 'POST',
      body
    });

    console.log(`[TBO Google Calendar] Evento criado: ${result.id} — ${result.summary}`);
    return {
      id: result.id,
      htmlLink: result.htmlLink,
      hangoutLink: result.hangoutLink || result.conferenceData?.entryPoints?.[0]?.uri || null,
      summary: result.summary
    };
  },

  /**
   * Cria evento de 1:1 no Google Calendar.
   * Wrapper com defaults para reunioes 1:1.
   * @param {Object} params
   * @param {string} params.leaderName - Nome do lider
   * @param {string} params.leaderEmail - Email do lider
   * @param {string} params.collaboratorName - Nome do colaborador
   * @param {string} params.collaboratorEmail - Email do colaborador
   * @param {string} params.scheduledAt - ISO datetime da reuniao
   * @param {number} [params.durationMinutes] - Duracao em minutos (default: 30)
   * @returns {Object} { id, htmlLink, hangoutLink }
   */
  async create1on1Event({ leaderName, leaderEmail, collaboratorName, collaboratorEmail, scheduledAt, durationMinutes = 30 }) {
    // Verificar token antes de tentar criar
    const token = await this._getAccessToken();
    if (!token) {
      throw new Error('Token Google não disponível. Faça login via Google OAuth para agendar no Calendar.');
    }

    const start = new Date(scheduledAt);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return this.createEvent({
      summary: `1:1 ${leaderName} ↔ ${collaboratorName}`,
      description: `Reunião 1:1 — TBO OS\n\nLíder: ${leaderName}\nColaborador: ${collaboratorName}\n\nPauta sugerida:\n- PDI e desenvolvimento\n- Feedback bidirecional\n- Ações pendentes\n- Próximos passos`,
      startDateTime: start.toISOString(),
      endDateTime: end.toISOString(),
      attendees: [leaderEmail, collaboratorEmail].filter(Boolean),
      addMeet: true
    });
  },

  /**
   * Atualiza um evento existente.
   * @param {string} eventId - ID do evento Google
   * @param {Object} updates - Campos a atualizar
   * @param {string} [calendarId] - ID do calendario
   */
  async updateEvent(eventId, updates, calendarId = 'primary') {
    const body = {};

    if (updates.summary) body.summary = updates.summary;
    if (updates.description) body.description = updates.description;
    if (updates.startDateTime) {
      body.start = { dateTime: updates.startDateTime, timeZone: updates.timeZone || 'America/Sao_Paulo' };
    }
    if (updates.endDateTime) {
      body.end = { dateTime: updates.endDateTime, timeZone: updates.timeZone || 'America/Sao_Paulo' };
    }
    if (updates.attendees) {
      body.attendees = updates.attendees.map(email => ({ email }));
    }
    if (updates.location !== undefined) body.location = updates.location;

    const endpoint = `calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    const result = await this._request(endpoint, {}, { method: 'PATCH', body });

    console.log(`[TBO Google Calendar] Evento atualizado: ${eventId}`);
    return result;
  },

  /**
   * Deleta um evento do Google Calendar.
   * @param {string} eventId - ID do evento Google
   * @param {string} [calendarId] - ID do calendario
   */
  async deleteEvent(eventId, calendarId = 'primary') {
    if (!eventId) return;
    const endpoint = `calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;

    try {
      await this._request(endpoint, {}, { method: 'DELETE' });
      console.log(`[TBO Google Calendar] Evento deletado: ${eventId}`);
    } catch (e) {
      // 404 = evento ja deletado, ignorar
      if (e.message.includes('404')) {
        console.warn(`[TBO Google Calendar] Evento ${eventId} ja nao existe`);
      } else {
        throw e;
      }
    }
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
