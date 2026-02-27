/**
 * TBO OS — Repository: Recognition Rewards & Redemptions
 *
 * CRUD para catalogo de recompensas e resgates.
 * UI NUNCA chama supabase.from('recognition_*') diretamente.
 * tenant_id e OBRIGATORIO — lanca erro se ausente.
 *
 * Sprint 2.3 — Sistema de Reconhecimentos + Pontuacao
 */

const RecognitionRewardsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  const _REWARD_SELECT = 'id, name, description, points_required, type, value_brl, active, image_url, created_at';
  const _REDEMPTION_SELECT = 'id, user_id, reward_id, points_spent, status, approved_by, approved_at, notes, redeemed_at';

  return {

    // ═══════════════════════════════════════════════════════════
    // REWARDS CATALOG — LIST / CRUD (Admin)
    // ═══════════════════════════════════════════════════════════

    async listRewards({ activeOnly = true } = {}) {
      let query = _db().from('recognition_rewards')
        .select(_REWARD_SELECT)
        .eq('tenant_id', _tid())
        .order('points_required');

      if (activeOnly) query = query.eq('active', true);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async createReward(reward) {
      const { data, error } = await _db().from('recognition_rewards')
        .insert({
          ...reward,
          tenant_id: _tid(),
          created_by: _uid()
        })
        .select(_REWARD_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    async updateReward(id, updates) {
      const { data, error } = await _db().from('recognition_rewards')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_REWARD_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    async deleteReward(id) {
      const { error } = await _db().from('recognition_rewards')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
      return true;
    },

    // ═══════════════════════════════════════════════════════════
    // REDEMPTIONS — LIST / CREATE / APPROVE
    // ═══════════════════════════════════════════════════════════

    async listRedemptions({ userId, status } = {}) {
      let query = _db().from('recognition_redemptions')
        .select(`${_REDEMPTION_SELECT}, recognition_rewards(name, type, value_brl)`)
        .eq('tenant_id', _tid())
        .order('created_at', { ascending: false });

      if (userId) query = query.eq('user_id', userId);
      if (status) query = query.eq('status', status);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },

    async createRedemption(rewardId, pointsSpent) {
      const { data, error } = await _db().from('recognition_redemptions')
        .insert({
          tenant_id: _tid(),
          user_id: _uid(),
          reward_id: rewardId,
          points_spent: pointsSpent,
          status: 'pending'
        })
        .select(_REDEMPTION_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    async approveRedemption(id, approve = true) {
      const updates = {
        status: approve ? 'approved' : 'rejected',
        approved_by: _uid(),
        approved_at: new Date().toISOString()
      };

      const { data, error } = await _db().from('recognition_redemptions')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_REDEMPTION_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    async markDelivered(id) {
      const { data, error } = await _db().from('recognition_redemptions')
        .update({ status: 'delivered' })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select(_REDEMPTION_SELECT)
        .single();

      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // POINTS — calcular saldo de pontos de um usuario
    // ═══════════════════════════════════════════════════════════

    /**
     * Calcula pontos disponiveis do usuario
     * total recebido - total gasto (em redemptions aprovadas/entregues)
     */
    async getPointsBalance(userId) {
      const tid = _tid();
      const uid = userId || _uid();

      // Pontos recebidos (recognitions onde to_user = uid)
      const { data: recs, error: rErr } = await _db().from('recognitions')
        .select('points')
        .eq('tenant_id', tid)
        .eq('to_user', uid);

      if (rErr) throw rErr;

      const earned = (recs || []).reduce((sum, r) => sum + (r.points || 1), 0);

      // Pontos gastos (redemptions aprovadas ou entregues)
      const { data: reds, error: dErr } = await _db().from('recognition_redemptions')
        .select('points_spent')
        .eq('tenant_id', tid)
        .eq('user_id', uid)
        .in('status', ['pending', 'approved', 'delivered']);

      if (dErr) throw dErr;

      const spent = (reds || []).reduce((sum, r) => sum + (r.points_spent || 0), 0);

      return { earned, spent, available: earned - spent };
    },

    // ═══════════════════════════════════════════════════════════
    // KPIs — Dashboard Diretoria
    // ═══════════════════════════════════════════════════════════

    async getDashboardKPIs() {
      const tid = _tid();

      // All recognitions
      const { data: recs, error: rErr } = await _db().from('recognitions')
        .select('id, to_user, from_user, value_name, points, created_at')
        .eq('tenant_id', tid);

      if (rErr) throw rErr;
      const all = recs || [];

      // All redemptions
      const { data: reds, error: dErr } = await _db().from('recognition_redemptions')
        .select('id, points_spent, status, recognition_rewards(value_brl)')
        .eq('tenant_id', tid);

      if (dErr) throw dErr;
      const allReds = reds || [];

      // Top reconhecidos do mes
      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = all.filter(r => new Date(r.created_at) >= firstOfMonth);

      const byPerson = {};
      thisMonth.forEach(r => {
        byPerson[r.to_user] = (byPerson[r.to_user] || 0) + 1;
      });
      const topMonthly = Object.entries(byPerson)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Por BU (via profiles se disponivel)
      const byValue = {};
      all.forEach(r => {
        const v = r.value_name || 'Outro';
        byValue[v] = (byValue[v] || 0) + 1;
      });

      // Custo acumulado de rewards
      const delivered = allReds.filter(r => r.status === 'delivered' || r.status === 'approved');
      const totalCost = delivered.reduce((sum, r) => {
        return sum + (r.recognition_rewards?.value_brl || 0);
      }, 0);

      return {
        totalRecognitions: all.length,
        thisMonth: thisMonth.length,
        topMonthly,
        byValue,
        totalRedemptions: allReds.length,
        pendingRedemptions: allReds.filter(r => r.status === 'pending').length,
        totalRewardsCost: totalCost
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.RecognitionRewardsRepo = RecognitionRewardsRepo;
}
