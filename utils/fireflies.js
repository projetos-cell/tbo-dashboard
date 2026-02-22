// ============================================================================
// TBO OS — Fireflies.ai Integration (PRD v1.2 — Persistência Supabase)
// Fetches live meeting transcripts from Fireflies GraphQL API
// Persiste reuniões, participantes e transcrições no Supabase via MeetingsRepo
// ============================================================================

const TBO_FIREFLIES = {
  _endpoint: 'https://api.fireflies.ai/graphql',
  _cache: null,
  _cacheTTL: 10 * 60 * 1000, // 10 minutos
  _cacheTime: null,
  _lastSync: null,
  _syncError: null,
  _syncing: false,
  _autoSyncTimer: null,
  _autoSyncInterval: 30 * 60 * 1000, // 30 minutos

  // Emails TBO para detecção is_tbo
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

  // Regras de categorização por título
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
  // CONFIG — API Key armazenada em localStorage
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
  // GRAPHQL — Queries contra a API Fireflies
  // ═══════════════════════════════════════════════════════════════════════════

  async _graphql(query, variables = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error('Fireflies API key not configured');

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
  // FETCH — Buscar transcrições da API Fireflies
  // ═══════════════════════════════════════════════════════════════════════════

  async fetchTranscripts() {
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

    return data.transcripts || [];
  },

  /**
   * Busca transcrição completa de uma reunião (sentences) via GraphQL
   */
  async fetchTranscript(transcriptId) {
    const query = `
      query Transcript($id: String!) {
        transcript(id: $id) {
          id
          sentences {
            text
            speaker_name
            speaker_id
            start_time
            end_time
          }
        }
      }
    `;

    const data = await this._graphql(query, { id: transcriptId });
    return data.transcript?.sentences || [];
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TRANSFORM — Converter resposta Fireflies para formato TBO
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

      const personMatch = trimmed.match(/^\*\*(.+?)\*\*$/);
      if (personMatch) {
        currentPerson = personMatch[1].trim();
        continue;
      }

      if (currentPerson && trimmed.length > 2) {
        const tsMatch = trimmed.match(/\((\d{1,2}:\d{2}(?::\d{2})?)\)\s*$/);
        const timestamp = tsMatch ? tsMatch[1] : null;
        let task = trimmed;
        if (tsMatch) task = task.replace(tsMatch[0], '').trim();
        task = task.replace(/^[-•*]\s*/, '').trim();

        if (task.length > 5) {
          items.push({ person: currentPerson, task, timestamp: timestamp || '', status: 'pending' });
        }
      }
    }
    return items;
  },

  _detectRelatedProjects(title, summary) {
    if (!title) return [];
    const projects = [];
    const parts = title.split(/[|\-–—]/);
    if (parts.length > 1) {
      const projName = parts[0].trim();
      if (projName.length > 2 && projName.length < 50) {
        projects.push(projName);
      }
    }
    return projects;
  },

  /**
   * Extrai participantes de um transcript da API Fireflies
   */
  _extractParticipants(transcript) {
    const participants = [];
    const attendees = transcript.meeting_attendees || [];
    const participantEmails = transcript.participants || [];

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
    return participants;
  },

  /**
   * Transforma array de transcripts no formato TBO (compatibilidade com UI existente)
   */
  _transformToTboFormat(transcripts) {
    const now = new Date().toISOString();
    const meetings = [];
    const categoryCount = {};

    for (const t of transcripts) {
      const category = this._detectCategory(t.title);
      categoryCount[category] = (categoryCount[category] || 0) + 1;

      const participants = this._extractParticipants(t);
      const actionItems = this._parseActionItems(t.summary?.action_items || '');
      const keywords = t.summary?.keywords || [];

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

    meetings.sort((a, b) => new Date(b.date) - new Date(a.date));

    const dates = meetings.map(m => new Date(m.date)).filter(d => !isNaN(d));
    const minDate = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : null;
    const maxDate = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : null;
    const totalMinutes = meetings.reduce((sum, m) => sum + (m.duration_minutes || 0), 0);

    return {
      metadata: {
        collected_at: now,
        total_meetings: meetings.length,
        total_minutes: Math.round(totalMinutes * 100) / 100,
        date_range: { from: minDate, to: maxDate },
        account_email: 'marco@agenciatbo.com.br',
        category_distribution: categoryCount,
        _source: 'fireflies_api',
        _fetchedAt: now
      },
      meetings
    };
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTÊNCIA — Salvar no Supabase via MeetingsRepo
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Mapeia um transcript da API Fireflies para o formato da tabela meetings
   */
  _mapToDbRow(transcript) {
    const category = this._detectCategory(transcript.title);
    const keywords = transcript.summary?.keywords || [];
    return {
      title: transcript.title || 'Sem título',
      date: transcript.date ? new Date(transcript.date).toISOString().split('T')[0] : null,
      time: transcript.date ? new Date(transcript.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null,
      duration_minutes: transcript.duration || 0,
      category,
      organizer_email: transcript.organizer_email || transcript.host_email || null,
      host_email: transcript.host_email || null,
      fireflies_url: transcript.transcript_url || null,
      audio_url: transcript.audio_url || null,
      meeting_link: transcript.transcript_url || null,
      keywords: typeof keywords === 'string' ? keywords.split(',').map(k => k.trim()) : (Array.isArray(keywords) ? keywords : []),
      overview: transcript.summary?.overview || null,
      short_summary: transcript.summary?.short_summary || null,
      summary: transcript.summary?.short_summary || transcript.summary?.overview || null,
      action_items: this._parseActionItems(transcript.summary?.action_items || ''),
      status: 'concluida'
    };
  },

  /**
   * Persiste transcripts no Supabase via MeetingsRepo.
   * Retorna stats { created, updated, errors }.
   */
  async _persistToSupabase(transcripts, syncLog, onProgress) {
    const stats = { created: 0, updated: 0, transcriptsSynced: 0, errors: [] };
    const hasMeetingsRepo = typeof MeetingsRepo !== 'undefined';

    if (!hasMeetingsRepo) {
      console.warn('[TBO Fireflies] MeetingsRepo não disponível — persistência desabilitada');
      return stats;
    }

    for (let i = 0; i < transcripts.length; i++) {
      const t = transcripts[i];
      try {
        // 1. Upsert meeting
        const dbRow = this._mapToDbRow(t);
        const { data: meeting, isNew } = await MeetingsRepo.upsertByFirefliesId(t.id, dbRow);

        if (isNew) {
          stats.created++;
        } else {
          stats.updated++;
        }

        // 2. Upsert participantes
        const participants = this._extractParticipants(t);
        if (participants.length > 0 && meeting?.id) {
          await MeetingsRepo.upsertParticipants(meeting.id, participants);
        }

        // 3. Buscar e salvar transcrição completa (apenas para novos)
        if (isNew && meeting?.id) {
          try {
            const sentences = await this.fetchTranscript(t.id);
            if (sentences.length > 0) {
              await MeetingsRepo.saveTranscription(meeting.id, sentences);
              stats.transcriptsSynced++;
            }
          } catch (tErr) {
            console.warn(`[TBO Fireflies] Transcrição ${t.id} falhou:`, tErr.message);
            stats.errors.push({ fireflies_id: t.id, step: 'transcription', error: tErr.message });
          }
        }

        // 4. Auto-associação (apenas para novos)
        if (isNew && meeting?.id) {
          try {
            await MeetingsRepo.autoAssociateProject(meeting.id, t.title);
            await MeetingsRepo.autoAssociateUsers(meeting.id);
          } catch (assocErr) {
            console.warn(`[TBO Fireflies] Auto-associação ${t.id} falhou:`, assocErr.message);
          }

          // 5. Auto-criar ações de 1:1 (se for reunião 1:1)
          try {
            const tboMeeting = this._transformToTboFormat([t]).meetings[0];
            if (tboMeeting) {
              await this.autoCreateActionsFor1on1(tboMeeting, meeting.id);
            }
          } catch (actErr) {
            console.warn(`[TBO Fireflies] Auto-actions 1:1 ${t.id} falhou:`, actErr.message);
          }
        }

        // Progress callback
        if (onProgress) onProgress(i + 1, transcripts.length);
      } catch (e) {
        console.error(`[TBO Fireflies] Persistência ${t.id} falhou:`, e.message);
        stats.errors.push({ fireflies_id: t.id, step: 'upsert', error: e.message });
      }
    }

    return stats;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYNC — Método principal (fetch API + persistência DB)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Sincronização completa: API Fireflies → cache local + Supabase.
   * @param {Object} options
   * @param {Function} options.onProgress - Callback (current, total) para UI
   * @param {string} options.triggerSource - 'manual' | 'auto' | 'zapier'
   * @returns {Object|null} Dados transformados no formato TBO
   */
  async sync({ onProgress, triggerSource = 'manual' } = {}) {
    if (!this.isEnabled()) return null;
    if (this._syncing) return this._cache;

    this._syncing = true;
    this._syncError = null;
    let syncLog = null;

    try {
      console.log('[TBO Fireflies] Iniciando sync...');

      // Criar sync log no DB
      const hasMeetingsRepo = typeof MeetingsRepo !== 'undefined';
      if (hasMeetingsRepo) {
        try {
          syncLog = await MeetingsRepo.createSyncLog(triggerSource);
        } catch (logErr) {
          console.warn('[TBO Fireflies] Sync log creation falhou:', logErr.message);
        }
      }

      // 1. Fetch da API
      const transcripts = await this.fetchTranscripts();

      // 2. Transformar para formato TBO (compatibilidade UI)
      const result = this._transformToTboFormat(transcripts);

      // 3. Persistir no Supabase
      const stats = await this._persistToSupabase(transcripts, syncLog, onProgress);

      // 4. Atualizar cache local
      this._cache = result;
      this._cacheTime = Date.now();
      this._lastSync = new Date().toISOString();
      this._syncError = null;

      // 5. Atualizar sync log
      if (syncLog && hasMeetingsRepo) {
        const logStatus = stats.errors.length > 0 ? 'partial' : 'success';
        try {
          await MeetingsRepo.updateSyncLog(syncLog.id, {
            status: logStatus,
            meetings_fetched: transcripts.length,
            meetings_created: stats.created,
            meetings_updated: stats.updated,
            transcriptions_synced: stats.transcriptsSynced,
            errors: stats.errors.length > 0 ? stats.errors : []
          });
        } catch { /* ignore */ }
      }

      console.log(`[TBO Fireflies] Sync OK: ${result.meetings.length} reuniões (${stats.created} novas, ${stats.updated} atualizadas, ${stats.transcriptsSynced} transcrições)`);

      // 6. Toast de resultado
      if (typeof TBO_TOAST !== 'undefined') {
        if (stats.created > 0) {
          TBO_TOAST.success('Fireflies', `${stats.created} reuniões novas sincronizadas`);
        } else if (stats.updated > 0) {
          TBO_TOAST.info('Fireflies', `${stats.updated} reuniões atualizadas`);
        }
      }

      return result;
    } catch (e) {
      console.warn('[TBO Fireflies] Sync falhou:', e.message);
      this._syncError = e.message;

      // Atualizar sync log com erro
      if (syncLog && typeof MeetingsRepo !== 'undefined') {
        try {
          await MeetingsRepo.updateSyncLog(syncLog.id, {
            status: 'error',
            errors: [{ step: 'fetch', error: e.message }]
          });
        } catch { /* ignore */ }
      }

      // Re-lancar erro para que o backoff do storage.js funcione
      throw e;
    } finally {
      this._syncing = false;
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO ACTION ITEMS — Criar ações de 1:1 automaticamente a partir do Fireflies
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Após sync, detecta meetings que são 1:1s e cria action items automaticamente.
   * Conecta action_items do Fireflies → one_on_one_actions + person_tasks.
   * @param {Object} meeting - Meeting do formato TBO (com action_items parseados)
   * @param {string} meetingDbId - ID do meeting no Supabase
   */
  async autoCreateActionsFor1on1(meeting, meetingDbId) {
    if (!meeting || !meeting.action_items || meeting.action_items.length === 0) return { created: 0 };
    if (typeof OneOnOnesRepo === 'undefined' || typeof PeopleRepo === 'undefined') return { created: 0 };

    try {
      const tid = typeof RepoBase !== 'undefined' ? RepoBase.requireTenantId() : null;
      if (!tid) return { created: 0 };

      // Detectar se é uma 1:1 (2 participantes TBO, ou titulo contem "1:1")
      const tboParticipants = (meeting.participants || []).filter(p => p.is_tbo);
      const is1on1 = tboParticipants.length === 2 ||
                     (meeting.title || '').toLowerCase().includes('1:1') ||
                     (meeting.title || '').toLowerCase().includes('1on1');

      if (!is1on1) return { created: 0 };

      // Encontrar a 1:1 correspondente no sistema
      // Buscar por data + participantes
      const meetingDate = meeting.date ? new Date(meeting.date).toISOString().split('T')[0] : null;
      if (!meetingDate) return { created: 0 };

      // Buscar 1:1s agendadas na mesma data
      const { data: ones } = await OneOnOnesRepo.list({ status: 'scheduled', limit: 100 });
      const candidates = (ones || []).filter(o => {
        const oDate = o.scheduled_at ? new Date(o.scheduled_at).toISOString().split('T')[0] : null;
        return oDate === meetingDate;
      });

      // Tentar match por participantes
      let matched1on1 = null;
      if (tboParticipants.length >= 2) {
        const emails = tboParticipants.map(p => p.email.toLowerCase());
        // Buscar pessoas por email para obter IDs
        for (const candidate of candidates) {
          // Verificar se leader/collaborator estão entre os participantes
          // (precisamos dos emails dos users — pode vir de cache do módulo RH)
          matched1on1 = candidate; // fallback: primeiro candidato da mesma data
          break;
        }
      }

      if (!matched1on1 && candidates.length > 0) {
        matched1on1 = candidates[0];
      }

      if (!matched1on1) {
        console.log(`[TBO Fireflies] Nenhuma 1:1 encontrada para match com meeting ${meeting.title}`);
        return { created: 0 };
      }

      // Marcar 1:1 como concluida
      await OneOnOnesRepo.update(matched1on1.id, { status: 'completed' });

      // Criar action items
      let created = 0;
      for (const item of meeting.action_items) {
        try {
          // Criar como one_on_one_action
          await OneOnOnesRepo.createAction(matched1on1.id, {
            text: `[Fireflies] ${item.task}`,
            assignee_id: matched1on1.collaborator_id, // default: colaborador
            due_date: null,
            completed: false
          });
          created++;
        } catch (e) {
          console.warn(`[TBO Fireflies] Falha ao criar action: ${e.message}`);
        }
      }

      console.log(`[TBO Fireflies] ${created} ações criadas para 1:1 ${matched1on1.id} a partir de ${meeting.title}`);
      return { created, oneOnOneId: matched1on1.id };
    } catch (e) {
      console.warn('[TBO Fireflies] autoCreateActionsFor1on1 falhou:', e.message);
      return { created: 0, error: e.message };
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTO-SYNC — Scheduler automático (padrão Omie)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Inicia sync automático periódico
   */
  scheduleAutoSync(intervalMs) {
    this.cancelAutoSync();
    const interval = intervalMs || this._autoSyncInterval;
    this._autoSyncTimer = setInterval(() => {
      this.sync({ triggerSource: 'auto' }).catch(e => {
        console.warn('[TBO Fireflies] Auto-sync falhou:', e.message);
      });
    }, interval);
    console.log(`[TBO Fireflies] Auto-sync agendado a cada ${Math.round(interval / 60000)}min`);
  },

  /**
   * Cancela sync automático
   */
  cancelAutoSync() {
    if (this._autoSyncTimer) {
      clearInterval(this._autoSyncTimer);
      this._autoSyncTimer = null;
      console.log('[TBO Fireflies] Auto-sync cancelado');
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS — Para indicador de status na UI
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
      cacheAge,
      autoSync: !!this._autoSyncTimer
    };
  },

  _formatAge(ms) {
    if (ms < 60000) return 'agora';
    if (ms < 3600000) return `${Math.round(ms / 60000)}min atrás`;
    return `${Math.round(ms / 3600000)}h atrás`;
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // FORCE REFRESH — Limpa cache e re-sincroniza
  // ═══════════════════════════════════════════════════════════════════════════

  async forceRefresh() {
    this._cache = null;
    this._cacheTime = null;
    return this.sync({ triggerSource: 'manual' });
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DB FETCH — Carrega reuniões do Supabase (para uso pelo módulo reunioes)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Carrega reuniões do Supabase (fonte de verdade).
   * Fallback para cache em memória se MeetingsRepo não disponível.
   */
  async loadFromDb(filters = {}) {
    if (typeof MeetingsRepo !== 'undefined') {
      try {
        return await MeetingsRepo.list(filters);
      } catch (e) {
        console.warn('[TBO Fireflies] loadFromDb falhou, usando cache:', e.message);
      }
    }

    // Fallback: cache em memória
    if (this._cache?.meetings) return this._cache.meetings;
    return [];
  }
};
