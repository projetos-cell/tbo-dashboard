/**
 * TBO OS — Repository: Performance (Ciclos + Avaliacoes)
 *
 * CRUD para ciclos de avaliacao e reviews individuais (360).
 * UI NUNCA chama supabase.from('performance_*') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const PerformanceRepo = (() => {
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

    // ════════════════════════════════════════
    // CICLOS
    // ════════════════════════════════════════

    /**
     * Lista ciclos de performance
     */
    async listCycles({ status, limit = 20 } = {}) {
      const tid = _tid();
      let query = _db().from('performance_cycles')
        .select('*', { count: 'exact' })
        .eq('tenant_id', tid)
        .order('start_date', { ascending: false });

      if (status) query = query.eq('status', status);
      if (limit) query = query.limit(limit);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Busca ciclo ativo
     */
    async getActiveCycle() {
      const { data, error } = await _db().from('performance_cycles')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('status', 'active')
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    /**
     * Busca ciclo por ID
     */
    async getCycleById(id) {
      const { data, error } = await _db().from('performance_cycles')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria novo ciclo
     */
    async createCycle(cycle) {
      const uid = _uid();
      const { data, error } = await _db().from('performance_cycles')
        .insert({
          ...cycle,
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
     * Atualiza ciclo
     */
    async updateCycle(id, updates) {
      const { data, error } = await _db().from('performance_cycles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // ════════════════════════════════════════
    // REVIEWS (AVALIACOES)
    // ════════════════════════════════════════

    /**
     * Lista reviews de um ciclo
     */
    async listReviews(cycleId) {
      const { data, error } = await _db().from('performance_reviews')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('cycle_id', cycleId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Reviews de uma pessoa num ciclo
     */
    async getReviewsForUser(cycleId, userId) {
      const { data, error } = await _db().from('performance_reviews')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('cycle_id', cycleId)
        .eq('target_user', userId);

      if (error) throw error;
      return data || [];
    },

    /**
     * Review especifica (avaliador + avaliado + tipo)
     */
    async getReview(cycleId, targetUser, reviewer, reviewType) {
      const { data, error } = await _db().from('performance_reviews')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('cycle_id', cycleId)
        .eq('target_user', targetUser)
        .eq('reviewer', reviewer)
        .eq('review_type', reviewType)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    /**
     * Cria ou atualiza review (upsert)
     */
    async submitReview(review) {
      const tid = _tid();
      const uid = _uid();

      // Verificar se ja existe
      const existing = await this.getReview(review.cycle_id, review.target_user, uid, review.review_type);

      if (existing) {
        // Atualizar
        const { data, error } = await _db().from('performance_reviews')
          .update({
            scores: review.scores,
            average: review.average,
            highlights: review.highlights || [],
            gaps: review.gaps || [],
            comment: review.comment || '',
            status: 'submitted',
            submitted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .eq('tenant_id', tid)
          .select()
          .single();

        if (error) throw error;
        return data;
      }

      // Criar novo
      const { data, error } = await _db().from('performance_reviews')
        .insert({
          ...review,
          tenant_id: tid,
          reviewer: uid,
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Calcula media ponderada de um avaliado num ciclo
     * Pesos: auto=20%, gestor=50%, pares=30%
     */
    async calculateAverage(cycleId, targetUser) {
      const reviews = await this.getReviewsForUser(cycleId, targetUser);
      if (!reviews.length) return null;

      const weights = { self: 0.2, manager: 0.5, peer: 0.3 };
      let totalWeight = 0;
      let weightedSum = 0;

      reviews.forEach(r => {
        if (r.average && r.status === 'submitted') {
          const w = weights[r.review_type] || 0.1;
          weightedSum += r.average * w;
          totalWeight += w;
        }
      });

      return totalWeight > 0 ? +(weightedSum / totalWeight).toFixed(2) : null;
    },

    /**
     * KPIs do ciclo ativo
     */
    async getKPIs() {
      const tid = _tid();
      const cycle = await this.getActiveCycle();
      if (!cycle) return { cycle: null, total: 0, submitted: 0, pending: 0, averages: {} };

      const reviews = await this.listReviews(cycle.id);
      const submitted = reviews.filter(r => r.status === 'submitted').length;
      const pending = reviews.filter(r => r.status === 'draft').length;

      // Medias por avaliado
      const byTarget = {};
      reviews.filter(r => r.status === 'submitted').forEach(r => {
        if (!byTarget[r.target_user]) byTarget[r.target_user] = [];
        byTarget[r.target_user].push(r);
      });

      const averages = {};
      Object.entries(byTarget).forEach(([userId, revs]) => {
        const weights = { self: 0.2, manager: 0.5, peer: 0.3 };
        let totalW = 0, wSum = 0;
        revs.forEach(r => {
          if (r.average) {
            const w = weights[r.review_type] || 0.1;
            wSum += r.average * w;
            totalW += w;
          }
        });
        averages[userId] = totalW > 0 ? +(wSum / totalW).toFixed(2) : null;
      });

      return {
        cycle,
        total: reviews.length,
        submitted,
        pending,
        averages
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.PerformanceRepo = PerformanceRepo;
}
