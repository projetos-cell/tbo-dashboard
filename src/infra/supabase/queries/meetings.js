/**
 * TBO OS — Repository: Meetings (PRD v1.2 — Fireflies Integration)
 *
 * CRUD completo para reuniões + upserts Fireflies.
 * Tabelas: meetings, meeting_transcriptions, meeting_participants, fireflies_sync_log.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 *
 * Padrão: segue FinanceRepo (src/infra/supabase/queries/finance.js)
 */

const MeetingsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  return {

    // ═══════════════════════════════════════════════════════════
    // MEETINGS — CRUD
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista reuniões do tenant com filtros opcionais
     */
    async list({ from_date, to_date, project_id, category, search, limit = 100, offset = 0 } = {}) {
      let q = _db().from('meetings')
        .select('*, project:projects(name)')
        .eq('tenant_id', _tid())
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);

      if (from_date) q = q.gte('date', from_date);
      if (to_date) q = q.lte('date', to_date);
      if (project_id) q = q.eq('project_id', project_id);
      if (category) q = q.eq('category', category);
      if (search) q = q.ilike('title', `%${search}%`);

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    /**
     * Busca reunião por ID com participantes
     */
    async getById(id) {
      const { data: meeting, error } = await _db().from('meetings')
        .select('*, project:projects(name)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();
      if (error) throw error;
      if (!meeting) return null;

      // Buscar participantes
      const { data: participants } = await _db().from('meeting_participants')
        .select('*')
        .eq('meeting_id', id)
        .eq('tenant_id', _tid())
        .order('display_name', { ascending: true });

      meeting._participants = participants || [];
      return meeting;
    },

    /**
     * Busca reunião por ID com transcrição completa
     */
    async getByIdWithTranscription(id) {
      const meeting = await this.getById(id);
      if (!meeting) return null;

      const { data: transcription } = await _db().from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', id)
        .eq('tenant_id', _tid())
        .order('raw_index', { ascending: true });

      meeting._transcription = transcription || [];
      return meeting;
    },

    /**
     * Cria nova reunião
     */
    async create(meeting) {
      const { data, error } = await _db().from('meetings')
        .insert({ ...meeting, tenant_id: _tid(), created_by: _uid() })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Atualiza reunião existente
     */
    async update(id, updates) {
      const { data, error } = await _db().from('meetings')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // FIREFLIES — Upsert por fireflies_id
    // ═══════════════════════════════════════════════════════════

    /**
     * Upsert reunião pelo fireflies_id.
     * Retorna { data, isNew } — isNew indica se foi criado (vs atualizado).
     * Usa ON CONFLICT (tenant_id, fireflies_id) para deduplicação.
     */
    async upsertByFirefliesId(firefliesId, meetingData) {
      const tid = _tid();

      // Verificar se já existe
      const { data: existing } = await _db().from('meetings')
        .select('id')
        .eq('tenant_id', tid)
        .eq('fireflies_id', firefliesId)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await _db().from('meetings')
          .update({
            ...meetingData,
            synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .eq('tenant_id', tid)
          .select()
          .single();
        if (error) throw error;
        return { data, isNew: false };
      } else {
        // Insert
        const { data, error } = await _db().from('meetings')
          .insert({
            ...meetingData,
            tenant_id: tid,
            fireflies_id: firefliesId,
            sync_source: 'fireflies',
            synced_at: new Date().toISOString(),
            created_by: _uid()
          })
          .select()
          .single();
        if (error) throw error;
        return { data, isNew: true };
      }
    },

    // ═══════════════════════════════════════════════════════════
    // PARTICIPANTES
    // ═══════════════════════════════════════════════════════════

    /**
     * Batch insert/upsert participantes de uma reunião.
     * Usa ON CONFLICT (meeting_id, email) para evitar duplicação.
     */
    async upsertParticipants(meetingId, participants) {
      if (!participants || participants.length === 0) return [];
      const tid = _tid();

      const rows = participants.map(p => ({
        tenant_id: tid,
        meeting_id: meetingId,
        email: p.email || null,
        display_name: p.name || p.displayName || p.display_name || null,
        is_tbo: p.is_tbo || false,
        profile_id: p.profile_id || null
      }));

      const { data, error } = await _db().from('meeting_participants')
        .upsert(rows, { onConflict: 'meeting_id,email', ignoreDuplicates: false })
        .select();
      if (error) throw error;
      return data || [];
    },

    /**
     * Lista participantes de uma reunião
     */
    async listParticipants(meetingId) {
      const { data, error } = await _db().from('meeting_participants')
        .select('*, profile:profiles(full_name, avatar_url)')
        .eq('meeting_id', meetingId)
        .eq('tenant_id', _tid())
        .order('display_name', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    // ═══════════════════════════════════════════════════════════
    // TRANSCRIÇÕES
    // ═══════════════════════════════════════════════════════════

    /**
     * Salva transcrição completa de uma reunião (batch insert).
     * Remove transcrição anterior se existir (substituição completa).
     */
    async saveTranscription(meetingId, sentences) {
      if (!sentences || sentences.length === 0) return [];
      const tid = _tid();

      // Remover transcrição anterior (se re-sync)
      await _db().from('meeting_transcriptions')
        .delete()
        .eq('meeting_id', meetingId)
        .eq('tenant_id', tid);

      // Inserir nova transcrição em batches de 200
      const BATCH_SIZE = 200;
      const allData = [];

      for (let i = 0; i < sentences.length; i += BATCH_SIZE) {
        const batch = sentences.slice(i, i + BATCH_SIZE).map((s, idx) => ({
          tenant_id: tid,
          meeting_id: meetingId,
          speaker_name: s.speaker_name || s.speakerName || null,
          speaker_email: s.speaker_email || s.speakerEmail || null,
          text: s.text || s.sentence || '',
          start_time: s.start_time || s.startTime || null,
          end_time: s.end_time || s.endTime || null,
          raw_index: i + idx
        }));

        const { data, error } = await _db().from('meeting_transcriptions')
          .insert(batch)
          .select();
        if (error) throw error;
        if (data) allData.push(...data);
      }

      return allData;
    },

    /**
     * Lista transcrição de uma reunião
     */
    async getTranscription(meetingId) {
      const { data, error } = await _db().from('meeting_transcriptions')
        .select('*')
        .eq('meeting_id', meetingId)
        .eq('tenant_id', _tid())
        .order('raw_index', { ascending: true });
      if (error) throw error;
      return data || [];
    },

    // ═══════════════════════════════════════════════════════════
    // AUTO-ASSOCIAÇÃO
    // ═══════════════════════════════════════════════════════════

    /**
     * Tenta associar reunião a um projeto com base no título.
     * Busca projetos do tenant por nome parcial (ilike).
     */
    async autoAssociateProject(meetingId, title) {
      if (!title || !meetingId) return null;
      const tid = _tid();

      // Extrair possível nome de projeto do título (antes de | - — ou :)
      const parts = title.split(/[|\-–—:]/);
      const possibleName = parts[0]?.trim();
      if (!possibleName || possibleName.length < 3) return null;

      // Buscar projetos com nome similar
      const { data: projects } = await _db().from('projects')
        .select('id, name')
        .eq('tenant_id', tid)
        .ilike('name', `%${possibleName}%`)
        .limit(1);

      if (projects && projects.length > 0) {
        await _db().from('meetings')
          .update({ project_id: projects[0].id, project_name: projects[0].name })
          .eq('id', meetingId)
          .eq('tenant_id', tid);
        return projects[0];
      }
      return null;
    },

    /**
     * Tenta associar participantes a profiles do tenant (por email).
     */
    async autoAssociateUsers(meetingId) {
      const tid = _tid();
      const { data: participants } = await _db().from('meeting_participants')
        .select('id, email')
        .eq('meeting_id', meetingId)
        .eq('tenant_id', tid)
        .is('profile_id', null);

      if (!participants || participants.length === 0) return 0;

      let matched = 0;
      for (const p of participants) {
        if (!p.email) continue;

        const { data: profile } = await _db().from('profiles')
          .select('id')
          .eq('email', p.email)
          .maybeSingle();

        if (profile) {
          await _db().from('meeting_participants')
            .update({ profile_id: profile.id })
            .eq('id', p.id);
          matched++;
        }
      }
      return matched;
    },

    // ═══════════════════════════════════════════════════════════
    // SYNC LOG
    // ═══════════════════════════════════════════════════════════

    /**
     * Cria novo registro de sync log
     */
    async createSyncLog(triggerSource = 'manual') {
      const { data, error } = await _db().from('fireflies_sync_log')
        .insert({
          tenant_id: _tid(),
          triggered_by: _uid(),
          trigger_source: triggerSource,
          status: 'running'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Atualiza sync log existente
     */
    async updateSyncLog(logId, updates) {
      const { data, error } = await _db().from('fireflies_sync_log')
        .update({
          ...updates,
          finished_at: new Date().toISOString()
        })
        .eq('id', logId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    /**
     * Lista sync logs recentes
     */
    async listSyncLogs({ limit = 20 } = {}) {
      const { data, error } = await _db().from('fireflies_sync_log')
        .select('*')
        .eq('tenant_id', _tid())
        .order('started_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data || [];
    },

    // ═══════════════════════════════════════════════════════════
    // ESTATÍSTICAS
    // ═══════════════════════════════════════════════════════════

    /**
     * Retorna contagens rápidas para dashboard
     */
    async getStats({ from_date, to_date } = {}) {
      let q = _db().from('meetings')
        .select('id, date, duration_minutes, category, status', { count: 'exact' })
        .eq('tenant_id', _tid());

      if (from_date) q = q.gte('date', from_date);
      if (to_date) q = q.lte('date', to_date);

      const { data, count, error } = await q;
      if (error) throw error;

      const totalMinutes = (data || []).reduce((sum, m) => sum + (m.duration_minutes || 0), 0);
      const categories = {};
      for (const m of (data || [])) {
        const cat = m.category || 'geral';
        categories[cat] = (categories[cat] || 0) + 1;
      }

      return {
        total: count || 0,
        totalMinutes,
        categories
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.MeetingsRepo = MeetingsRepo;
}
