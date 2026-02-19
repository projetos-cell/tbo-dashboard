// ============================================================================
// TBO OS — Fireflies.ai Integration (Real-time Meeting Data)
// Fetches live meeting transcripts from Fireflies GraphQL API
// Replaces static meetings-data.json with real-time data
// ============================================================================

const TBO_FIREFLIES = {
  _endpoint: 'https://api.fireflies.ai/graphql',
  _cache: null,
  _cacheTTL: 10 * 60 * 1000, // 10 minutes
  _cacheTime: null,
  _lastSync: null,
  _syncError: null,
  _syncing: false,

  // TBO team emails for is_tbo detection
  _tboEmails: [
    'marco@agenciatbo.com.br', 'ruy@agenciatbo.com.br',
    'carol@agenciatbo.com.br', 'nelson@agenciatbo.com.br',
    'nath@agenciatbo.com.br', 'rafa@agenciatbo.com.br',
    'gustavo@agenciatbo.com.br', 'celso@agenciatbo.com.br',
    'erick@agenciatbo.com.br', 'dann@agenciatbo.com.br',
    'duda@agenciatbo.com.br', 'tiago@agenciatbo.com.br',
    'mari@agenciatbo.com.br', 'lucca@agenciatbo.com.br',
    'luccan@agenciatbo.com.br', 'rafaela@agenciatbo.com.br',
    'nathalia@agenciatbo.com.br', 'financeiro@agenciatbo.com.br'
  ],

  // Category detection keywords
  _categoryRules: [
    { key: 'daily_socios', patterns: ['daily sócios', 'daily socios', 'daily'] },
    { key: 'cliente', patterns: ['alinhamento semanal', 'reunião cliente', 'cliente -', '| cliente'] },
    { key: 'review_projeto', patterns: ['review', 'revisão', 'aprovação'] },
    { key: 'audio_whatsapp', patterns: ['whatsapp', 'ptt', '.ogg'] },
    { key: 'producao', patterns: ['waves', 'produção', 'producao', 'render', 'animação'] },
    { key: 'estrategia', patterns: ['estratégia', 'estrategia', 'campanha', 'planejamento'] },
    { key: 'alinhamento_interno', patterns: ['alinhamento', 'sync', 'standup', 'kickoff'] }
  ],

  // ═══════════════════════════════════════════════════════════════════════════
  // CONFIG — API Key stored in localStorage
  // ═══════════════════════════════════════════════════════════════════════════

  getApiKey() {
    return localStorage.getItem('tbo_fireflies_api_key') || '';
  },

  setApiKey(key) {
    localStorage.setItem('tbo_fireflies_api_key', key);
    this._cache = null;
    this._cacheTime = null;
  },

  isEnabled() {
    return localStorage.getItem('tbo_fireflies_enabled') !== 'false' && !!this.getApiKey();
  },

  setEnabled(enabled) {
    localStorage.setItem('tbo_fireflies_enabled', enabled ? 'true' : 'false');
  },

  // How many days of meetings to fetch (default: 30)
  getDaysRange() {
    const stored = localStorage.getItem('tbo_fireflies_days');
    return stored ? parseInt(stored, 10) : 30;
  },

  setDaysRange(days) {
    localStorage.setItem('tbo_fireflies_days', String(days));
    this._cache = null;
    this._cacheTime = null;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GRAPHQL — Execute queries against Fireflies API
  // ═══════════════════════════════════════════════════════════════════════════

  async _graphql(query, variables = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Fireflies API key not configured');

    // v2.1: AbortController com timeout de 10s para prevenir hang infinito
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(this._endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Fireflies API error ${response.status}: ${text}`);
      }

      const json = await response.json();
      if (json.errors && json.errors.length > 0) {
        throw new Error(`Fireflies GraphQL error: ${json.errors[0].message}`);
      }

      return json.data;
    } catch (e) {
      if (e.name === 'AbortError') {
        throw new Error('Fireflies API timeout (10s)');
      }
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FETCH TRANSCRIPTS — Get recent meetings from Fireflies
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchTranscripts() {
    // Check cache
    if (this._cache && this._cacheTime && (Date.now() - this._cacheTime) < this._cacheTTL) {
      return this._cache;
    }

    const days = this.getDaysRange();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const query = `
      query Transcripts($fromDate: DateTime, $limit: Int) {
        transcripts(fromDate: $fromDate, limit: $limit) {
          id
          title
          date
          duration
          host_email
          organizer_email
          participants
          meeting_attendees {
            displayName
            email
          }
          transcript_url
          audio_url
          summary {
            keywords
            action_items
            overview
            short_summary
          }
        }
      }
    `;

    const data = await this._graphql(query, {
      fromDate: fromDate.toISOString(),
      limit: 50
    });

    const transcripts = data.transcripts || [];
    return transcripts;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFORM — Convert Fireflies API response to TBO meetings format
  // ═══════════════════════════════════════════════════════════════════════════

  _detectCategory(title) {
    if (!title) return 'geral';
    const lower = title.toLowerCase();
    for (const rule of this._categoryRules) {
      if (rule.patterns.some(p => lower.includes(p))) {
        return rule.key;
      }
    }
    return 'geral';
  },

  _isTboEmail(email) {
    if (!email) return false;
    return this._tboEmails.includes(email.toLowerCase()) ||
           email.toLowerCase().endsWith('@agenciatbo.com.br');
  },

  _parseActionItems(actionItemsStr) {
    if (!actionItemsStr || typeof actionItemsStr !== 'string') return [];
    const items = [];
    let currentPerson = null;

    const lines = actionItemsStr.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Person header: **Name**
      const personMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
      if (personMatch) {
        currentPerson = personMatch[1].trim();
        continue;
      }

      // Action item line (may have timestamp at end)
      if (currentPerson && trimmed.length > 2) {
        const tsMatch = trimmed.match(/\((\d{1,2}:\d{2}(?::\d{2})?)\)\s*$/);
        const timestamp = tsMatch ? tsMatch[1] : null;
        let task = trimmed;
        if (tsMatch) {
          task = task.replace(tsMatch[0], '').trim();
        }
        // Remove leading bullet/dash
        task = task.replace(/^[-•*]\s*/, '').trim();

        if (task.length > 5) {
          items.push({
            person: currentPerson,
            task,
            timestamp: timestamp || '',
            status: 'pending'
          });
        }
      }
    }
    return items;
  },

  _detectRelatedProjects(title, summary) {
    if (!title) return [];
    const projects = [];
    // Try to extract project names from title (before | or - delimiter)
    const parts = title.split(/[|\-–—]/);
    if (parts.length > 1) {
      const projName = parts[0].trim();
      if (projName.length > 2 && projName.length < 50) {
        projects.push(projName);
      }
    }
    return projects;
  },

  _transformToTboFormat(transcripts) {
    const now = new Date().toISOString();
    const meetings = [];
    const categoryCount = {};

    for (const t of transcripts) {
      const category = this._detectCategory(t.title);
      categoryCount[category] = (categoryCount[category] || 0) + 1;

      // Build participants list from meeting_attendees
      const participants = [];
      const attendees = t.meeting_attendees || [];
      const participantEmails = t.participants || [];

      // Use meeting_attendees if available (has display names)
      if (attendees.length > 0) {
        for (const a of attendees) {
          if (a.email) {
            participants.push({
              email: a.email,
              name: a.displayName || null,
              is_tbo: this._isTboEmail(a.email)
            });
          }
        }
      } else {
        // Fallback to participants array (just emails)
        for (const email of participantEmails) {
          if (email) {
            participants.push({
              email,
              name: null,
              is_tbo: this._isTboEmail(email)
            });
          }
        }
      }

      // Parse action items from summary string
      const actionItems = this._parseActionItems(
        t.summary?.action_items || ''
      );

      // Parse keywords
      const keywords = t.summary?.keywords || [];

      // Build meeting object in TBO format
      const meeting = {
        id: t.id,
        title: t.title || 'Sem título',
        date: t.date,
        duration_minutes: t.duration || 0,
        category,
        organizer: t.organizer_email || t.host_email || '',
        participants,
        meeting_link: t.transcript_url || '',
        summary: t.summary?.short_summary || t.summary?.overview || '',
        keywords: typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : keywords,
        action_items: actionItems,
        related_projects: this._detectRelatedProjects(t.title, t.summary?.short_summary),
        related_clients: [],
        _source: 'fireflies_api'
      };

      meetings.push(meeting);
    }

    // Sort by date descending (newest first)
    meetings.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate date range
    const dates = meetings.map(m => new Date(m.date)).filter(d => !isNaN(d));
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;

    // Total minutes
    const totalMinutes = meetings.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);

    return {
      metadata: {
        collected_at: now,
        total_meetings: meetings.length,
        total_minutes: Math.round(totalMinutes * 100) / 100,
        date_range: {
          from: minDate,
          to: maxDate
        },
        account_email: 'marco@agenciatbo.com.br',
        category_distribution: categoryCount,
        _source: 'fireflies_api',
        _fetchedAt: now
      },
      meetings
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Main sync method (called by TBO_STORAGE)
  // ═══════════════════════════════════════════════════════════════════════════

  async sync() {
    if (!this.isEnabled()) return null;
    if (this._syncing) return this._cache;

    this._syncing = true;
    this._syncError = null;

    try {
      console.log('[TBO Fireflies] Fetching transcripts from API...');
      const transcripts = await this.fetchTranscripts();
      const result = this._transformToTboFormat(transcripts);

      this._cache = result;
      this._cacheTime = Date.now();
      this._lastSync = new Date().toISOString();
      this._syncError = null;

      console.log(`[TBO Fireflies] Synced ${result.meetings.length} meetings (${Math.round(result.metadata.total_minutes)} min)`);
      return result;
    } catch (e) {
      console.warn('[TBO Fireflies] Sync failed:', e.message);
      this._syncError = e.message;

      // Return cached data if available
      if (this._cache) return this._cache;
      return null;
    } finally {
      this._syncing = false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — For UI status indicator
  // ═══════════════════════════════════════════════════════════════════════════

  getStatus() {
    const hasKey = !!this.getApiKey();
    const enabled = localStorage.getItem('tbo_fireflies_enabled') !== 'false';
    const cacheAge = this._cacheTime
      ? this._formatAge(Date.now() - this._cacheTime)
      : null;

    return {
      enabled: enabled && hasKey,
      hasApiKey: hasKey,
      syncing: this._syncing,
      lastSync: this._lastSync,
      error: this._syncError,
      meetingCount: this._cache?.meetings?.length || 0,
      cacheAge
    };
  },

  _formatAge(ms) {
    if (ms < 60000) return 'agora';
    if (ms < 3600000) return `${Math.round(ms / 60000)}min atrás`;
    return `${Math.round(ms / 3600000)}h atrás`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH — Clear cache and re-fetch
  // ═══════════════════════════════════════════════════════════════════════════

  async forceRefresh() {
    this._cache = null;
    this._cacheTime = null;
    return this.sync();
  }
};
