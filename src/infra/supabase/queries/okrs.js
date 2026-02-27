/**
 * TBO OS — Repository: OKRs
 *
 * Queries centralizadas para okr_objectives, okr_key_results, okr_checkins.
 * UI NUNCA chama supabase.from('okr_*') diretamente.
 * tenant_id e OBRIGATORIO — lanca erro se ausente.
 *
 * Sprint 2.1 — Sistema de OKRs Nativo
 */

const OkrsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  // Select fields
  const _OBJ_SELECT = 'id, tenant_id, title, description, owner_id, period, level, bu, parent_id, status, progress, created_at, updated_at';
  const _KR_SELECT  = 'id, tenant_id, objective_id, title, metric_type, start_value, target_value, current_value, unit, owner_id, confidence, status, created_at, updated_at';
  const _CI_SELECT  = 'id, tenant_id, key_result_id, previous_value, new_value, confidence, notes, author_id, created_at';

  return {

    // ═══════════════════════════════════════════════════════════
    // OBJECTIVES — LIST / GET / TREE / CRUD
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista objetivos com filtros opcionais
     */
    async listObjectives({ period, level, bu, ownerId, status = 'active' } = {}) {
      let query = _db().from('okr_objectives')
        .select(_OBJ_SELECT)
        .eq('tenant_id', _tid())
        .order('level')
        .order('title');

      if (period) query = query.eq('period', period);
      if (level) query = query.eq('level', level);
      if (bu) query = query.eq('bu', bu);
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Busca um objetivo por ID com seus KRs
     */
    async getObjectiveById(id) {
      const { data, error } = await _db().from('okr_objectives')
        .select(`${_OBJ_SELECT}, okr_key_results(${_KR_SELECT})`)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Arvore completa: todos objectives + KRs para um periodo
     * Retorna flat list — UI monta a hierarquia via parent_id
     */
    async getTree(period) {
      const tid = _tid();
      let query = _db().from('okr_objectives')
        .select(`${_OBJ_SELECT}, okr_key_results(${_KR_SELECT})`)
        .eq('tenant_id', tid)
        .neq('status', 'archived')
        .order('level')
        .order('title');

      if (period) query = query.eq('period', period);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Cria novo objetivo
     */
    async createObjective({ title, description, owner_id, period, level, bu, parent_id, status }) {
      const tid = _tid();
      const payload = {
        tenant_id: tid,
        title,
        description: description || null,
        owner_id: owner_id || _uid(),
        period,
        level: level || 'personal',
        bu: bu || null,
        parent_id: parent_id || null,
        status: status || 'active'
      };

      const { data, error } = await _db().from('okr_objectives')
        .insert(payload)
        .select(_OBJ_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza objetivo (partial update)
     */
    async updateObjective(id, updates) {
      const { data, error } = await _db().from('okr_objectives')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_OBJ_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Arquiva objetivo (soft delete)
     */
    async deleteObjective(id) {
      return this.updateObjective(id, { status: 'archived' });
    },


    // ═══════════════════════════════════════════════════════════
    // KEY RESULTS — LIST / CRUD
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista KRs de um objetivo
     */
    async listKeyResults(objectiveId) {
      const { data, error } = await _db().from('okr_key_results')
        .select(_KR_SELECT)
        .eq('objective_id', objectiveId)
        .eq('tenant_id', _tid())
        .order('created_at');

      if (error) throw error;
      return data || [];
    },

    /**
     * Lista todos KRs do tenant (para check-ins do usuario)
     */
    async listAllKeyResults({ period, ownerId, confidence } = {}) {
      const tid = _tid();
      let query = _db().from('okr_key_results')
        .select(`${_KR_SELECT}, okr_objectives!inner(id, title, period, level, bu, status)`)
        .eq('tenant_id', tid)
        .eq('status', 'active');

      if (period) query = query.eq('okr_objectives.period', period);
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (confidence) query = query.eq('confidence', confidence);

      query = query.order('created_at');

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    /**
     * Cria Key Result
     */
    async createKeyResult({ objective_id, title, metric_type, start_value, target_value, current_value, unit, owner_id }) {
      const tid = _tid();
      const payload = {
        tenant_id: tid,
        objective_id,
        title,
        metric_type: metric_type || 'number',
        start_value: start_value || 0,
        target_value,
        current_value: current_value || 0,
        unit: unit || null,
        owner_id: owner_id || _uid()
      };

      const { data, error } = await _db().from('okr_key_results')
        .insert(payload)
        .select(_KR_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza Key Result
     */
    async updateKeyResult(id, updates) {
      const { data, error } = await _db().from('okr_key_results')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_KR_SELECT)
        .single();

      if (error) throw error;
      return data;
    },


    // ═══════════════════════════════════════════════════════════
    // CHECK-INS — CREATE / LIST / AUTO-SCORE
    // ═══════════════════════════════════════════════════════════

    /**
     * Cria check-in e auto-atualiza KR + Objective progress
     */
    async createCheckin({ key_result_id, new_value, confidence, notes }) {
      const tid = _tid();
      const uid = _uid();

      // 1. Buscar KR atual para previous_value
      const { data: kr, error: krErr } = await _db().from('okr_key_results')
        .select('id, current_value, objective_id, target_value, start_value, owner_id, title')
        .eq('id', key_result_id)
        .eq('tenant_id', tid)
        .single();

      if (krErr) throw krErr;

      // 2. Inserir check-in
      const { data: checkin, error: ciErr } = await _db().from('okr_checkins')
        .insert({
          tenant_id: tid,
          key_result_id,
          previous_value: kr.current_value,
          new_value,
          confidence: confidence || 'on_track',
          notes: notes || null,
          author_id: uid
        })
        .select(_CI_SELECT)
        .single();

      if (ciErr) throw ciErr;

      // 3. Atualizar KR current_value + confidence
      await _db().from('okr_key_results')
        .update({ current_value: new_value, confidence: confidence || 'on_track' })
        .eq('id', key_result_id)
        .eq('tenant_id', tid);

      // 4. Recalcular objective progress (media dos KRs)
      await this._recalcObjectiveProgress(kr.objective_id);

      // 5. Enviar alerta se at_risk ou behind (Sprint 2.1.6)
      if (confidence === 'at_risk' || confidence === 'behind') {
        const updatedKr = { ...kr, current_value: new_value, owner_id: kr.owner_id };
        // Buscar objective para o titulo
        try {
          const { data: obj } = await _db().from('okr_objectives')
            .select('id, title, owner_id')
            .eq('id', kr.objective_id)
            .eq('tenant_id', tid)
            .single();
          await this._sendRiskAlert(updatedKr, obj, confidence);
        } catch (e) { console.warn('[OkrsRepo] Erro buscando obj para alerta:', e.message); }
      }

      return checkin;
    },

    /**
     * Lista check-ins de um KR (mais recente primeiro)
     */
    async listCheckins(keyResultId, { limit = 20 } = {}) {
      const { data, error } = await _db().from('okr_checkins')
        .select(_CI_SELECT)
        .eq('key_result_id', keyResultId)
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },


    // ═══════════════════════════════════════════════════════════
    // DASHBOARD KPIs
    // ═══════════════════════════════════════════════════════════

    /**
     * KPIs consolidados para o dashboard
     */
    async getDashboardKPIs(period) {
      const tid = _tid();
      const objectives = await this.listObjectives({ period, status: null });
      const activeObjs = objectives.filter(o => o.status === 'active');

      // Buscar todos KRs do periodo
      let krQuery = _db().from('okr_key_results')
        .select('id, objective_id, current_value, target_value, start_value, confidence, status')
        .eq('tenant_id', tid)
        .eq('status', 'active');

      if (period) {
        const objIds = activeObjs.map(o => o.id);
        if (objIds.length > 0) {
          krQuery = krQuery.in('objective_id', objIds);
        } else {
          return { totalObjectives: 0, avgProgress: 0, atRiskCount: 0, behindCount: 0, onTrackCount: 0, totalKRs: 0 };
        }
      }

      const { data: krs, error: krErr } = await krQuery;
      if (krErr) throw krErr;

      const activeKRs = krs || [];
      const atRisk = activeKRs.filter(k => k.confidence === 'at_risk').length;
      const behind = activeKRs.filter(k => k.confidence === 'behind').length;
      const onTrack = activeKRs.filter(k => k.confidence === 'on_track').length;

      // Progresso medio dos objectives ativos
      const avgProgress = activeObjs.length > 0
        ? activeObjs.reduce((sum, o) => sum + Number(o.progress || 0), 0) / activeObjs.length
        : 0;

      return {
        totalObjectives: activeObjs.length,
        avgProgress: Math.round(avgProgress * 100) / 100,
        atRiskCount: atRisk,
        behindCount: behind,
        onTrackCount: onTrack,
        totalKRs: activeKRs.length
      };
    },


    // ═══════════════════════════════════════════════════════════
    // ALERTS — OKR at_risk / behind notifications (2.1.6)
    // ═══════════════════════════════════════════════════════════

    /**
     * Envia notificação inbox quando KR muda para at_risk ou behind
     */
    async _sendRiskAlert(kr, objective, confidence) {
      try {
        if (confidence === 'on_track') return;
        if (typeof InboxRepo === 'undefined') return;

        const tid = _tid();
        const levelLabel = { at_risk: 'Em Risco', behind: 'Atrasado' };

        const range = Number(kr.target_value) - Number(kr.start_value || 0);
        const current = Number(kr.current_value || 0) - Number(kr.start_value || 0);
        const pct = range > 0 ? Math.round((current / range) * 100) : 0;

        const title = `OKR ${levelLabel[confidence]}: ${kr.title}`;
        const body = `Key Result "${kr.title}" do objetivo "${objective?.title || ''}" está ${levelLabel[confidence].toLowerCase()} (${pct}% progresso).`;

        const recipients = new Set();
        if (kr.owner_id) recipients.add(kr.owner_id);
        if (objective?.owner_id && objective.owner_id !== kr.owner_id) recipients.add(objective.owner_id);

        for (const userId of recipients) {
          await InboxRepo.create({
            tenant_id: tid,
            user_id: userId,
            type: 'okr_alert',
            title,
            body,
            metadata: {
              key_result_id: kr.id,
              objective_id: objective?.id,
              confidence,
              progress_pct: pct
            }
          });
        }
      } catch (e) {
        console.warn('[OkrsRepo] Erro ao enviar alerta OKR:', e.message);
      }
    },

    // ═══════════════════════════════════════════════════════════
    // INTERNALS
    // ═══════════════════════════════════════════════════════════

    /**
     * Recalcula progress do objective baseado na media dos KRs
     */
    async _recalcObjectiveProgress(objectiveId) {
      try {
        const tid = _tid();
        const { data: krs } = await _db().from('okr_key_results')
          .select('current_value, target_value, start_value')
          .eq('objective_id', objectiveId)
          .eq('tenant_id', tid)
          .eq('status', 'active');

        if (!krs || krs.length === 0) return;

        const progressSum = krs.reduce((sum, kr) => {
          const range = Number(kr.target_value) - Number(kr.start_value || 0);
          if (range <= 0) return sum;
          const current = Number(kr.current_value || 0) - Number(kr.start_value || 0);
          const pct = Math.min(100, Math.max(0, (current / range) * 100));
          return sum + pct;
        }, 0);

        const avgProgress = Math.round((progressSum / krs.length) * 100) / 100;

        await _db().from('okr_objectives')
          .update({ progress: avgProgress })
          .eq('id', objectiveId)
          .eq('tenant_id', tid);
      } catch (e) {
        console.warn('[OkrsRepo] Erro ao recalcular progress:', e.message);
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.OkrsRepo = OkrsRepo;
}
