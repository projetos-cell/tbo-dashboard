/**
 * TBO OS — Repository: Reports (Relatórios Automatizados)
 *
 * CRUD para report_schedules e report_runs.
 * Tenant isolation via RepoBase._tid().
 * Tasks #17-20: Daily/Weekly/Monthly partner + Weekly client reports.
 */

const ReportsRepo = (() => {
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
    // SCHEDULES
    // ═══════════════════════════════════════════════════════════

    async listSchedules({ type } = {}) {
      let q = _db().from('report_schedules')
        .select('*')
        .eq('tenant_id', _tid())
        .order('type', { ascending: true });

      if (type) q = q.eq('type', type);

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async getSchedule(id) {
      const { data, error } = await _db().from('report_schedules')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();
      if (error) throw error;
      return data;
    },

    async createSchedule(schedule) {
      const { data, error } = await _db().from('report_schedules')
        .insert({
          ...schedule,
          tenant_id: _tid(),
          created_by: _uid()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateSchedule(id, updates) {
      const { data, error } = await _db().from('report_schedules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async deleteSchedule(id) {
      const { error } = await _db().from('report_schedules')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());
      if (error) throw error;
    },

    // ═══════════════════════════════════════════════════════════
    // RUNS
    // ═══════════════════════════════════════════════════════════

    async listRuns({ schedule_id, type, limit = 20, offset = 0 } = {}) {
      let q = _db().from('report_runs')
        .select('*')
        .eq('tenant_id', _tid())
        .order('generated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (schedule_id) q = q.eq('schedule_id', schedule_id);
      if (type) q = q.eq('type', type);

      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },

    async createRun(run) {
      const { data, error } = await _db().from('report_runs')
        .insert({
          ...run,
          tenant_id: _tid()
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async updateRun(id, updates) {
      const { data, error } = await _db().from('report_runs')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();
      if (error) throw error;
      return data;
    },

    async getLatestRunByType(type) {
      const { data, error } = await _db().from('report_runs')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('type', type)
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // SEED DEFAULT SCHEDULES
    // ═══════════════════════════════════════════════════════════

    /**
     * Creates default schedules for the current tenant if none exist.
     * Called on first module load.
     */
    async seedDefaults() {
      const existing = await this.listSchedules();
      if (existing.length > 0) return existing;

      const defaults = [
        {
          type: 'daily',
          name: 'Relatório Diário — Sócios',
          description: 'KPIs do dia, insights, decisões pendentes. Enviado às 8h00 BRT, seg-sex.',
          cron: '0 11 * * 1-5',
          recipients: [],
          enabled: true
        },
        {
          type: 'weekly',
          name: 'Relatório Semanal — Sócios',
          description: 'KPIs semanais, comparativos, conquistas. Enviado sexta-feira 8h00 BRT.',
          cron: '0 11 * * 5',
          recipients: [],
          enabled: true
        },
        {
          type: 'monthly',
          name: 'Relatório Mensal — Sócios',
          description: 'KPIs mensais, projeções, runway. Gerado no último dia útil do mês.',
          cron: '0 11 L * *',
          recipients: [],
          enabled: true
        },
        {
          type: 'client',
          name: 'Relatório Semanal — Clientes',
          description: 'Resumo por cliente com status dos projetos. Enviado segunda-feira 8h00 BRT.',
          cron: '0 11 * * 1',
          recipients: [],
          enabled: true
        }
      ];

      const results = [];
      for (const schedule of defaults) {
        try {
          const created = await this.createSchedule(schedule);
          results.push(created);
        } catch (e) {
          console.warn('[ReportsRepo] Failed to seed default schedule:', schedule.type, e.message);
        }
      }

      return results;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.ReportsRepo = ReportsRepo;
}
