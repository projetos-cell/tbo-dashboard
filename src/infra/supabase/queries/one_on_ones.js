/**
 * TBO OS — Repository: OneOnOnes (Reunioes 1:1)
 *
 * CRUD para 1:1s entre lider e colaborador, com acoes vinculadas.
 * UI NUNCA chama supabase.from('one_on_ones') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const OneOnOnesRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _SELECT = 'id, leader_id, collaborator_id, scheduled_at, status, notes, google_event_id, recurrence, ritual_type_id, fireflies_meeting_id, transcript_summary, created_by, created_at, updated_at';

  return {

    /**
     * Lista 1:1s com filtros opcionais
     */
    async list({ status, limit = 50, offset = 0 } = {}) {
      const tid = _tid();
      let query = _db().from('one_on_ones')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('scheduled_at', { ascending: false });

      if (status) query = query.eq('status', status);

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Busca 1:1 por ID com acoes vinculadas
     */
    async getById(id) {
      const { data, error } = await _db().from('one_on_ones')
        .select('*, one_on_one_actions(id, text, assignee_id, due_date, completed, completed_at, created_at)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria nova 1:1
     */
    async create(oneOnOne) {
      const uid = _uid();
      const { data, error } = await _db().from('one_on_ones')
        .insert({
          ...oneOnOne,
          tenant_id: _tid(),
          created_by: uid,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza 1:1 (status, notes)
     */
    async update(id, updates) {
      const { data, error } = await _db().from('one_on_ones')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Marca 1:1 como concluida
     */
    async complete(id, notes) {
      const updates = { status: 'completed' };
      if (notes !== undefined) updates.notes = notes;
      return this.update(id, updates);
    },

    /**
     * Cancela 1:1
     */
    async cancel(id) {
      return this.update(id, { status: 'cancelled' });
    },

    /**
     * Remove 1:1 (admin only — RLS)
     */
    async remove(id) {
      const { error } = await _db().from('one_on_ones')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
      return true;
    },

    // ════════════════════════════════════════
    // ACOES de 1:1
    // ════════════════════════════════════════

    /**
     * Lista acoes de uma 1:1
     */
    async listActions(oneOnOneId) {
      const { data, error } = await _db().from('one_on_one_actions')
        .select('id, one_on_one_id, text, assignee_id, due_date, completed, completed_at, created_at')
        .eq('tenant_id', _tid())
        .eq('one_on_one_id', oneOnOneId)
        .order('created_at');

      if (error) throw error;
      return data || [];
    },

    /**
     * Lista todas as acoes pendentes do tenant
     */
    async listPendingActions() {
      const { data, error } = await _db().from('one_on_one_actions')
        .select('id, one_on_one_id, text, assignee_id, due_date, completed, created_at')
        .eq('tenant_id', _tid())
        .eq('completed', false)
        .order('due_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Cria acao numa 1:1
     */
    async createAction(oneOnOneId, action) {
      const { data, error } = await _db().from('one_on_one_actions')
        .insert({
          ...action,
          tenant_id: _tid(),
          one_on_one_id: oneOnOneId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Marca acao como concluida/pendente
     */
    async toggleAction(actionId, completed) {
      const updates = { completed };
      if (completed) updates.completed_at = new Date().toISOString();
      else updates.completed_at = null;

      const { data, error } = await _db().from('one_on_one_actions')
        .update(updates)
        .eq('id', actionId)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Remove acao
     */
    async removeAction(actionId) {
      const { error } = await _db().from('one_on_one_actions')
        .delete()
        .eq('id', actionId)
        .eq('tenant_id', _tid());

      if (error) throw error;
      return true;
    },

    // ════════════════════════════════════════
    // FIREFLIES LINKING (Sprint 2.2.3)
    // ════════════════════════════════════════

    /**
     * Vincula uma 1:1 a um meeting do Fireflies
     */
    async linkToMeeting(oneOnOneId, meetingId, transcriptSummary) {
      const updates = {
        fireflies_meeting_id: meetingId,
        updated_at: new Date().toISOString()
      };
      if (transcriptSummary) updates.transcript_summary = transcriptSummary;

      const { data, error } = await _db().from('one_on_ones')
        .update(updates)
        .eq('id', oneOnOneId)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Busca 1:1 que pode ser vinculada a um meeting (match por data e participantes)
     * Retorna a 1:1 mais provavel ou null
     */
    async findMatchForMeeting(meetingDate, participantEmails) {
      const tid = _tid();
      if (!meetingDate || !participantEmails?.length) return null;

      // Buscar 1:1s agendadas proximo a data da reuniao (+-2 dias) sem meeting vinculado
      const dateObj = new Date(meetingDate);
      const dayBefore = new Date(dateObj); dayBefore.setDate(dayBefore.getDate() - 2);
      const dayAfter = new Date(dateObj); dayAfter.setDate(dayAfter.getDate() + 2);

      const { data, error } = await _db().from('one_on_ones')
        .select('id, leader_id, collaborator_id, scheduled_at, status')
        .eq('tenant_id', tid)
        .is('fireflies_meeting_id', null)
        .gte('scheduled_at', dayBefore.toISOString())
        .lte('scheduled_at', dayAfter.toISOString())
        .in('status', ['scheduled', 'completed'])
        .order('scheduled_at', { ascending: true })
        .limit(10);

      if (error || !data?.length) return null;

      // Tentar match por participantes: buscar profiles pelos emails
      const lowerEmails = participantEmails.map(e => e.toLowerCase());
      const { data: profiles } = await _db().from('profiles')
        .select('supabase_uid, email')
        .eq('tenant_id', tid)
        .in('email', lowerEmails);

      if (!profiles?.length) return null;

      const profileUids = profiles.map(p => p.supabase_uid).filter(Boolean);

      // Match: 1:1 onde leader_id ou collaborator_id esta nos profileUids
      for (const oneOnOne of data) {
        const leaderMatch = profileUids.includes(oneOnOne.leader_id);
        const collabMatch = profileUids.includes(oneOnOne.collaborator_id);
        if (leaderMatch && collabMatch) return oneOnOne; // Ambos participam = match forte
      }
      // Fallback: pelo menos um match
      for (const oneOnOne of data) {
        const leaderMatch = profileUids.includes(oneOnOne.leader_id);
        const collabMatch = profileUids.includes(oneOnOne.collaborator_id);
        if (leaderMatch || collabMatch) return oneOnOne;
      }
      return null;
    },

    /**
     * Salvar resumo da transcricao numa 1:1
     */
    async saveTranscriptSummary(oneOnOneId, summary) {
      return this.update(oneOnOneId, { transcript_summary: summary });
    },

    /**
     * Disparar processamento de transcrição com IA
     * Chama o endpoint /api/process-1on1-transcript
     */
    async processTranscript(oneOnOneId, meetingId) {
      const tid = _tid();
      const resp = await fetch('/api/process-1on1-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await _db().auth.getSession())?.data?.session?.access_token || ''}`,
          'X-Tenant-Id': tid
        },
        body: JSON.stringify({ one_on_one_id: oneOnOneId, meeting_id: meetingId, tenant_id: tid })
      });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || `Erro ${resp.status}`);
      }
      return resp.json();
    },

    /**
     * Buscar meetings disponíveis para vincular a uma 1:1
     * Retorna meetings recentes sem vínculo com 1:1
     */
    async listAvailableMeetings(scheduledAt) {
      const tid = _tid();
      const dateObj = scheduledAt ? new Date(scheduledAt) : new Date();
      const dayBefore = new Date(dateObj); dayBefore.setDate(dayBefore.getDate() - 7);
      const dayAfter = new Date(dateObj); dayAfter.setDate(dayAfter.getDate() + 2);

      // Buscar meetings próximos à data
      const { data, error } = await _db().from('meetings')
        .select('id, title, date, time, duration_minutes, summary, fireflies_url, organizer_email')
        .eq('tenant_id', tid)
        .gte('date', dayBefore.toISOString().split('T')[0])
        .lte('date', dayAfter.toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Filtrar meetings já vinculados
      const { data: linked } = await _db().from('one_on_ones')
        .select('fireflies_meeting_id')
        .eq('tenant_id', tid)
        .not('fireflies_meeting_id', 'is', null);

      const linkedIds = new Set((linked || []).map(o => o.fireflies_meeting_id));
      return (data || []).filter(m => !linkedIds.has(m.id));
    },

    /**
     * Buscar log de processamento de transcrição
     */
    async getTranscriptLog(oneOnOneId) {
      const { data, error } = await _db().from('one_on_one_transcript_logs')
        .select('id, ai_summary, ai_actions, ai_model, tokens_used, status, error_message, created_at, completed_at')
        .eq('tenant_id', _tid())
        .eq('one_on_one_id', oneOnOneId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    /**
     * Buscar meeting vinculado a uma 1:1
     */
    async getLinkedMeeting(meetingId) {
      if (!meetingId) return null;
      const { data, error } = await _db().from('meetings')
        .select('id, title, date, time, duration_minutes, summary, short_summary, fireflies_url, audio_url, organizer_email')
        .eq('id', meetingId)
        .single();

      if (error) return null;
      return data;
    },

    /**
     * KPIs: total, agendadas, concluidas, acoes pendentes
     */
    async getKPIs() {
      const tid = _tid();
      const { data: ones, error: oErr } = await _db().from('one_on_ones')
        .select('id, status, scheduled_at')
        .eq('tenant_id', tid);

      if (oErr) throw oErr;
      const all = ones || [];

      const byStatus = { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 };
      all.forEach(o => { byStatus[o.status || 'scheduled']++; });

      // Acoes pendentes
      const { data: actions, error: aErr } = await _db().from('one_on_one_actions')
        .select('id, completed')
        .eq('tenant_id', tid)
        .eq('completed', false);

      if (aErr) throw aErr;

      return {
        total: all.length,
        byStatus,
        pendingActions: (actions || []).length
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.OneOnOnesRepo = OneOnOnesRepo;
}
