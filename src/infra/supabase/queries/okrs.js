/**
 * TBO OS — Repository: OKRs v2
 *
 * Full CRUD for cycles, objectives, key results, check-ins.
 * Weighted progress calculation, auto-status, cycle-based queries.
 * tenant_id OBRIGATORIO — lanca erro se ausente.
 *
 * OKRs v2.0 — Cycles + Enterprise
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

  // ── Schema detection (v1 = migration 056, v2 = migration 062) ──
  // v2 adds: okr_cycles table, objectives.{cycle_id, sort_order, status_override, archived_at},
  //          key_results.{weight, cadence, status_override, sort_order, archived_at}
  let _schemaVersion = null; // null = not checked, 1 = v1, 2 = v2

  async function _detectSchema() {
    if (_schemaVersion !== null) return _schemaVersion;
    try {
      const { error } = await _db().from('okr_cycles').select('id').limit(1);
      _schemaVersion = error ? 1 : 2;
    } catch (e) {
      _schemaVersion = 1;
    }
    console.log('[OkrsRepo] Schema version:', _schemaVersion);
    return _schemaVersion;
  }

  // Select fields — adapt to schema version
  const _CYCLE_SELECT = 'id, tenant_id, name, start_date, end_date, is_active, created_at, updated_at';
  const _CI_SELECT  = 'id, tenant_id, key_result_id, previous_value, new_value, confidence, notes, author_id, created_at';

  function _objSelect() {
    if (_schemaVersion === 2) return 'id, tenant_id, cycle_id, title, description, owner_id, period, level, bu, parent_id, status, progress, sort_order, status_override, archived_at, created_at, updated_at';
    return 'id, tenant_id, title, description, owner_id, period, level, bu, parent_id, status, progress, created_at, updated_at';
  }

  function _krSelect() {
    if (_schemaVersion === 2) return 'id, tenant_id, objective_id, title, metric_type, start_value, target_value, current_value, unit, owner_id, confidence, status, weight, cadence, status_override, sort_order, archived_at, created_at, updated_at';
    return 'id, tenant_id, objective_id, title, metric_type, start_value, target_value, current_value, unit, owner_id, confidence, status, created_at, updated_at';
  }

  return {

    // ═══════════════════════════════════════════════════════════
    // CYCLES — LIST / CREATE / UPDATE / DELETE
    // ═══════════════════════════════════════════════════════════

    async listCycles() {
      await _detectSchema();
      if (_schemaVersion === 1) return []; // no cycles table in v1

      const { data, error } = await _db().from('okr_cycles')
        .select(_CYCLE_SELECT)
        .eq('tenant_id', _tid())
        .order('start_date', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    async getCycleById(id) {
      if (_schemaVersion === 1) return null;
      const { data, error } = await _db().from('okr_cycles')
        .select(_CYCLE_SELECT)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    async getActiveCycle() {
      if (_schemaVersion === 1) return null;
      const { data, error } = await _db().from('okr_cycles')
        .select(_CYCLE_SELECT)
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async createCycle({ name, start_date, end_date, is_active }) {
      if (_schemaVersion === 1) throw new Error('Execute a migration 062 para habilitar ciclos.');
      const tid = _tid();

      if (is_active) {
        await _db().from('okr_cycles')
          .update({ is_active: false })
          .eq('tenant_id', tid)
          .eq('is_active', true);
      }

      const { data, error } = await _db().from('okr_cycles')
        .insert({ tenant_id: tid, name, start_date, end_date, is_active: is_active || false })
        .select(_CYCLE_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    async updateCycle(id, updates) {
      if (_schemaVersion === 1) throw new Error('Execute a migration 062 para habilitar ciclos.');
      const tid = _tid();

      if (updates.is_active) {
        await _db().from('okr_cycles')
          .update({ is_active: false })
          .eq('tenant_id', tid)
          .eq('is_active', true)
          .neq('id', id);
      }

      const { data, error } = await _db().from('okr_cycles')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tid)
        .select(_CYCLE_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    async deleteCycle(id) {
      if (_schemaVersion === 1) throw new Error('Execute a migration 062 para habilitar ciclos.');
      const { error } = await _db().from('okr_cycles')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
    },


    // ═══════════════════════════════════════════════════════════
    // OBJECTIVES — LIST / GET / TREE / CRUD
    // ═══════════════════════════════════════════════════════════

    async listObjectives({ period, cycleId, level, bu, ownerId, status = 'active' } = {}) {
      await _detectSchema();
      let query = _db().from('okr_objectives')
        .select(_objSelect())
        .eq('tenant_id', _tid());

      if (_schemaVersion === 2) {
        query = query.is('archived_at', null).order('sort_order').order('created_at');
      } else {
        query = query.order('created_at');
      }

      if (cycleId && _schemaVersion === 2) query = query.eq('cycle_id', cycleId);
      if (period) query = query.eq('period', period);
      if (level) query = query.eq('level', level);
      if (bu) query = query.eq('bu', bu);
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async getObjectiveById(id) {
      await _detectSchema();
      const { data, error } = await _db().from('okr_objectives')
        .select(`${_objSelect()}, okr_key_results(${_krSelect()})`)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Full tree: objectives + KRs for a cycle (or period fallback)
     */
    async getTree({ cycleId, period } = {}) {
      await _detectSchema();
      const tid = _tid();
      let query = _db().from('okr_objectives')
        .select(`${_objSelect()}, okr_key_results(${_krSelect()})`)
        .eq('tenant_id', tid)
        .neq('status', 'archived');

      if (_schemaVersion === 2) {
        query = query.is('archived_at', null).order('sort_order').order('created_at');
        if (cycleId) query = query.eq('cycle_id', cycleId);
        else if (period) query = query.eq('period', period);
      } else {
        query = query.order('created_at');
        if (period) query = query.eq('period', period);
        // v1 has no cycle_id — ignore cycleId filter, load all
      }

      const { data, error } = await query;
      if (error) throw error;

      // Filter out archived KRs (v2 only)
      return (data || []).map(obj => ({
        ...obj,
        okr_key_results: (obj.okr_key_results || [])
          .filter(kr => _schemaVersion === 1 || !kr.archived_at)
          .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      }));
    },

    async createObjective({ title, description, owner_id, period, cycle_id, level, bu, parent_id, status, sort_order }) {
      await _detectSchema();
      const tid = _tid();
      const payload = {
        tenant_id: tid,
        title,
        description: description || null,
        owner_id: owner_id || _uid(),
        period: period || null,
        level: level || (_schemaVersion === 1 ? 'personal' : 'individual'),
        bu: bu || null,
        parent_id: parent_id || null,
        status: status || 'active'
      };

      if (_schemaVersion === 2) {
        payload.cycle_id = cycle_id || null;
        payload.sort_order = sort_order || 0;
      }

      const { data, error } = await _db().from('okr_objectives')
        .insert(payload)
        .select(_objSelect())
        .single();

      if (error) throw error;
      return data;
    },

    async updateObjective(id, updates) {
      await _detectSchema();
      // Strip v2 fields when on v1
      if (_schemaVersion === 1) {
        delete updates.cycle_id;
        delete updates.sort_order;
        delete updates.status_override;
        delete updates.archived_at;
      }

      const { data, error } = await _db().from('okr_objectives')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_objSelect())
        .single();

      if (error) throw error;
      return data;
    },

    async archiveObjective(id) {
      if (_schemaVersion === 2) {
        return this.updateObjective(id, { archived_at: new Date().toISOString(), status: 'archived' });
      }
      return this.updateObjective(id, { status: 'archived' });
    },

    async deleteObjective(id) {
      return this.archiveObjective(id);
    },

    async duplicateObjective(id) {
      const original = await this.getObjectiveById(id);
      if (!original) throw new Error('Objetivo nao encontrado');

      const newObj = await this.createObjective({
        title: original.title + ' (copia)',
        description: original.description,
        owner_id: original.owner_id,
        period: original.period,
        cycle_id: original.cycle_id,
        level: original.level,
        bu: original.bu,
        parent_id: original.parent_id
      });

      // Duplicate KRs
      const krs = original.okr_key_results || [];
      for (const kr of krs) {
        if (kr.archived_at) continue;
        await this.createKeyResult({
          objective_id: newObj.id,
          title: kr.title,
          metric_type: kr.metric_type,
          start_value: kr.start_value,
          target_value: kr.target_value,
          unit: kr.unit,
          owner_id: kr.owner_id,
          weight: kr.weight,
          cadence: kr.cadence
        });
      }

      return newObj;
    },

    async reorderObjectives(orderedIds) {
      if (_schemaVersion === 1) return; // no sort_order in v1
      const tid = _tid();
      const promises = orderedIds.map((id, index) =>
        _db().from('okr_objectives')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('tenant_id', tid)
      );
      await Promise.all(promises);
    },


    // ═══════════════════════════════════════════════════════════
    // KEY RESULTS — LIST / CRUD
    // ═══════════════════════════════════════════════════════════

    async listKeyResults(objectiveId) {
      await _detectSchema();
      let query = _db().from('okr_key_results')
        .select(_krSelect())
        .eq('objective_id', objectiveId)
        .eq('tenant_id', _tid());

      if (_schemaVersion === 2) {
        query = query.is('archived_at', null).order('sort_order').order('created_at');
      } else {
        query = query.order('created_at');
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async listAllKeyResults({ period, cycleId, ownerId, confidence } = {}) {
      await _detectSchema();
      const tid = _tid();

      const objJoinFields = _schemaVersion === 2
        ? 'id, title, period, cycle_id, level, bu, status'
        : 'id, title, period, level, bu, status';

      let query = _db().from('okr_key_results')
        .select(`${_krSelect()}, okr_objectives!inner(${objJoinFields})`)
        .eq('tenant_id', tid)
        .eq('status', 'active');

      if (_schemaVersion === 2) {
        query = query.is('archived_at', null);
        if (cycleId) query = query.eq('okr_objectives.cycle_id', cycleId);
      }

      if (period) query = query.eq('okr_objectives.period', period);
      if (ownerId) query = query.eq('owner_id', ownerId);
      if (confidence) query = query.eq('confidence', confidence);

      if (_schemaVersion === 2) query = query.order('sort_order').order('created_at');
      else query = query.order('created_at');

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async createKeyResult({ objective_id, title, metric_type, start_value, target_value, current_value, unit, owner_id, weight, cadence, sort_order }) {
      await _detectSchema();
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

      if (_schemaVersion === 2) {
        payload.weight = weight || null;
        payload.cadence = cadence || 'weekly';
        payload.sort_order = sort_order || 0;
      }

      const { data, error } = await _db().from('okr_key_results')
        .insert(payload)
        .select(_krSelect())
        .single();

      if (error) throw error;
      return data;
    },

    async updateKeyResult(id, updates) {
      await _detectSchema();
      if (_schemaVersion === 1) {
        delete updates.weight;
        delete updates.cadence;
        delete updates.sort_order;
        delete updates.status_override;
        delete updates.archived_at;
      }

      const { data, error } = await _db().from('okr_key_results')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_krSelect())
        .single();

      if (error) throw error;
      return data;
    },

    async archiveKeyResult(id) {
      if (_schemaVersion === 2) {
        return this.updateKeyResult(id, { archived_at: new Date().toISOString(), status: 'cancelled' });
      }
      return this.updateKeyResult(id, { status: 'cancelled' });
    },

    async reorderKeyResults(objectiveId, orderedIds) {
      if (_schemaVersion === 1) return;
      const tid = _tid();
      const promises = orderedIds.map((id, index) =>
        _db().from('okr_key_results')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('tenant_id', tid)
      );
      await Promise.all(promises);
    },


    // ═══════════════════════════════════════════════════════════
    // CHECK-INS — CREATE / LIST
    // ═══════════════════════════════════════════════════════════

    async createCheckin({ key_result_id, new_value, confidence, notes }) {
      const tid = _tid();
      const uid = _uid();

      // 1. Get current KR
      const { data: kr, error: krErr } = await _db().from('okr_key_results')
        .select('id, current_value, objective_id, target_value, start_value, owner_id, title')
        .eq('id', key_result_id)
        .eq('tenant_id', tid)
        .single();

      if (krErr) throw krErr;

      // 2. Insert check-in
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

      // 3. Update KR current_value + confidence
      await _db().from('okr_key_results')
        .update({ current_value: new_value, confidence: confidence || 'on_track' })
        .eq('id', key_result_id)
        .eq('tenant_id', tid);

      // 4. Recalculate objective progress
      await this._recalcObjectiveProgress(kr.objective_id);

      // 5. Send risk alert if needed
      if (confidence === 'at_risk' || confidence === 'behind') {
        try {
          const { data: obj } = await _db().from('okr_objectives')
            .select('id, title, owner_id')
            .eq('id', kr.objective_id)
            .eq('tenant_id', tid)
            .single();
          await this._sendRiskAlert({ ...kr, current_value: new_value }, obj, confidence);
        } catch (e) { console.warn('[OkrsRepo] Erro alerta:', e.message); }
      }

      return checkin;
    },

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

    async listRecentCheckins({ cycleId, limit = 50 } = {}) {
      await _detectSchema();
      const tid = _tid();

      const objJoinFields = _schemaVersion === 2
        ? 'id, title, cycle_id'
        : 'id, title';

      let query = _db().from('okr_checkins')
        .select(`${_CI_SELECT}, okr_key_results!inner(id, title, objective_id, okr_objectives!inner(${objJoinFields}))`)
        .eq('tenant_id', tid)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cycleId && _schemaVersion === 2) {
        query = query.eq('okr_key_results.okr_objectives.cycle_id', cycleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },


    // ═══════════════════════════════════════════════════════════
    // PROGRESS & STATUS CALCULATION
    // ═══════════════════════════════════════════════════════════

    /**
     * Calculate KR progress (0-100)
     */
    calcKRProgress(kr) {
      const type = kr.metric_type || 'number';
      const target = Number(kr.target_value || 0);
      const start = Number(kr.start_value || 0);
      const current = Number(kr.current_value || 0);

      if (type === 'boolean' || type === 'binary') {
        return current >= 1 ? 100 : 0;
      }

      const range = target - start;
      if (range <= 0) return current >= target ? 100 : 0;
      return Math.min(100, Math.max(0, ((current - start) / range) * 100));
    },

    /**
     * Calculate objective progress from KRs (weighted or simple average)
     */
    calcObjectiveProgress(krs) {
      const activeKRs = (krs || []).filter(kr => kr.status === 'active' && !kr.archived_at);
      if (activeKRs.length === 0) return 0;

      const hasWeights = activeKRs.some(kr => kr.weight && Number(kr.weight) > 0);

      if (hasWeights) {
        let totalWeight = 0;
        let weightedSum = 0;
        activeKRs.forEach(kr => {
          const w = Number(kr.weight) || 1;
          totalWeight += w;
          weightedSum += w * this.calcKRProgress(kr);
        });
        return totalWeight > 0 ? weightedSum / totalWeight : 0;
      }

      const sum = activeKRs.reduce((acc, kr) => acc + this.calcKRProgress(kr), 0);
      return sum / activeKRs.length;
    },

    /**
     * Calculate cycle progress from objectives
     */
    calcCycleProgress(objectives) {
      const activeObjs = (objectives || []).filter(o => o.status === 'active' && !o.archived_at);
      if (activeObjs.length === 0) return 0;

      const sum = activeObjs.reduce((acc, obj) => {
        const krs = obj.okr_key_results || [];
        return acc + this.calcObjectiveProgress(krs);
      }, 0);

      return sum / activeObjs.length;
    },

    /**
     * Auto-determine status based on progress vs. cycle elapsed time
     * Returns: on_track | attention | at_risk
     */
    calcAutoStatus(progress, cycle) {
      if (!cycle || !cycle.start_date || !cycle.end_date) return 'on_track';

      const now = new Date();
      const start = new Date(cycle.start_date);
      const end = new Date(cycle.end_date);
      const totalDays = (end - start) / (1000 * 60 * 60 * 24);
      const elapsed = Math.max(0, (now - start) / (1000 * 60 * 60 * 24));
      const pctElapsed = totalDays > 0 ? (elapsed / totalDays) * 100 : 0;

      // Expected progress = time elapsed %
      // at_risk if progress < 50% of expected
      // attention if progress < 75% of expected
      const expected = pctElapsed;
      if (progress < expected * 0.5) return 'at_risk';
      if (progress < expected * 0.75) return 'attention';
      return 'on_track';
    },

    /**
     * Get effective status (override takes priority)
     */
    getEffectiveStatus(item, cycle) {
      if (item.status_override) return item.status_override;
      const progress = typeof item._progress === 'number'
        ? item._progress
        : Number(item.progress || 0);
      return this.calcAutoStatus(progress, cycle);
    },


    // ═══════════════════════════════════════════════════════════
    // DASHBOARD KPIs
    // ═══════════════════════════════════════════════════════════

    async getDashboardKPIs({ cycleId, period } = {}) {
      const objectives = await this.getTree({ cycleId, period });
      const activeObjs = objectives.filter(o => o.status === 'active' && (_schemaVersion === 1 || !o.archived_at));

      let totalKRs = 0, atRisk = 0, behind = 0, onTrack = 0, attention = 0;
      let pendingCheckins = 0;

      activeObjs.forEach(obj => {
        const krs = (obj.okr_key_results || []).filter(k => k.status === 'active' && (_schemaVersion === 1 || !k.archived_at));
        totalKRs += krs.length;
        krs.forEach(kr => {
          if (kr.confidence === 'at_risk' || (kr.status_override && kr.status_override === 'at_risk')) atRisk++;
          else if (kr.confidence === 'behind') behind++;
          else if (kr.confidence === 'on_track') onTrack++;
          // Count as pending if no check-in in the cadence period
          pendingCheckins++;
        });
      });

      const cycleProgress = this.calcCycleProgress(activeObjs);

      return {
        totalObjectives: activeObjs.length,
        totalKRs,
        cycleProgress: Math.round(cycleProgress * 100) / 100,
        avgProgress: Math.round(cycleProgress * 100) / 100,
        atRiskCount: atRisk + behind,
        attentionCount: attention,
        onTrackCount: onTrack,
        behindCount: behind,
        pendingCheckins
      };
    },


    // ═══════════════════════════════════════════════════════════
    // INTERNALS
    // ═══════════════════════════════════════════════════════════

    async _recalcObjectiveProgress(objectiveId) {
      try {
        const tid = _tid();
        const selectFields = _schemaVersion === 2
          ? 'current_value, target_value, start_value, metric_type, weight, status, archived_at'
          : 'current_value, target_value, start_value, metric_type, status';

        let query = _db().from('okr_key_results')
          .select(selectFields)
          .eq('objective_id', objectiveId)
          .eq('tenant_id', tid)
          .eq('status', 'active');

        if (_schemaVersion === 2) query = query.is('archived_at', null);

        const { data: krs } = await query;

        if (!krs || krs.length === 0) return;

        const avgProgress = this.calcObjectiveProgress(krs);

        await _db().from('okr_objectives')
          .update({ progress: Math.round(avgProgress * 100) / 100 })
          .eq('id', objectiveId)
          .eq('tenant_id', tid);
      } catch (e) {
        console.warn('[OkrsRepo] Erro recalc progress:', e.message);
      }
    },

    async _sendRiskAlert(kr, objective, confidence) {
      try {
        if (confidence === 'on_track') return;
        if (typeof InboxRepo === 'undefined') return;

        const tid = _tid();
        const levelLabel = { at_risk: 'Em Risco', behind: 'Atrasado' };
        const pct = Math.round(this.calcKRProgress(kr));

        const title = `OKR ${levelLabel[confidence]}: ${kr.title}`;
        const body = `Key Result "${kr.title}" do objetivo "${objective?.title || ''}" esta ${levelLabel[confidence].toLowerCase()} (${pct}% progresso).`;

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
            metadata: { key_result_id: kr.id, objective_id: objective?.id, confidence, progress_pct: pct }
          });
        }
      } catch (e) {
        console.warn('[OkrsRepo] Erro alerta OKR:', e.message);
      }
    }
  };
})();

if (typeof window !== 'undefined') {
  window.OkrsRepo = OkrsRepo;
}
