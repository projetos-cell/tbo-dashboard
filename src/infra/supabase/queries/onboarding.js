/**
 * TBO OS — Repository: Onboarding/Offboarding Templates & Automação
 *
 * Gerencia templates de checklist e automação de onboarding/offboarding.
 * Cria person_tasks automaticamente ao mudar status de uma pessoa.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const OnboardingRepo = (() => {
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
    // TEMPLATES
    // ════════════════════════════════════════

    /**
     * Lista templates por tipo
     */
    async listTemplates(type = 'onboarding') {
      const { data, error } = await _db().from('onboarding_templates')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('type', type)
        .order('created_at');

      if (error) throw error;
      return data || [];
    },

    /**
     * Busca template default
     */
    async getDefaultTemplate(type = 'onboarding') {
      const { data, error } = await _db().from('onboarding_templates')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('type', type)
        .eq('is_default', true)
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    /**
     * Busca template por ID
     */
    async getTemplateById(id) {
      const { data, error } = await _db().from('onboarding_templates')
        .select('*')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Cria template
     */
    async createTemplate(template) {
      const { data, error } = await _db().from('onboarding_templates')
        .insert({
          ...template,
          tenant_id: _tid(),
          created_by: _uid(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza template
     */
    async updateTemplate(id, updates) {
      const { data, error } = await _db().from('onboarding_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    // ════════════════════════════════════════
    // AUTOMAÇÃO: Criar tasks a partir do template
    // ════════════════════════════════════════

    /**
     * Cria tasks de onboarding/offboarding automaticamente para uma pessoa.
     * @param {string} personId - UUID da pessoa (supabase user id ou person id)
     * @param {string} type - 'onboarding' ou 'offboarding'
     * @param {string} [templateId] - Template especifico (default: usa template padrão)
     * @returns {Object} { created: number, tasks: Array }
     */
    async triggerAutomation(personId, type = 'onboarding', templateId = null) {
      const tid = _tid();
      const uid = _uid();

      // Buscar template
      let template;
      if (templateId) {
        template = await this.getTemplateById(templateId);
      } else {
        template = await this.getDefaultTemplate(type);
      }

      if (!template || !template.steps || template.steps.length === 0) {
        console.warn(`[OnboardingRepo] Nenhum template ${type} encontrado para tenant`);
        return { created: 0, tasks: [] };
      }

      const steps = typeof template.steps === 'string' ? JSON.parse(template.steps) : template.steps;

      // Verificar se já existem tasks deste tipo para esta pessoa
      const { data: existing } = await _db().from('person_tasks')
        .select('id')
        .eq('tenant_id', tid)
        .eq('person_id', personId)
        .eq('category', type)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`[OnboardingRepo] Tasks de ${type} já existem para pessoa ${personId}`);
        return { created: 0, tasks: [], alreadyExists: true };
      }

      // Criar tasks
      const tasks = steps.map((step, idx) => ({
        tenant_id: tid,
        person_id: personId,
        title: step.title,
        description: step.description || '',
        category: type,
        status: 'pending',
        priority: 'medium',
        order_index: step.order || idx + 1,
        metadata: JSON.stringify({
          template_id: template.id,
          step_order: step.order || idx + 1,
          default_role: step.default_role || null,
          step_category: step.category || null,
          depends_on: step.depends_on || null
        }),
        created_by: uid,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await _db().from('person_tasks')
        .insert(tasks)
        .select();

      if (error) throw error;

      console.log(`[OnboardingRepo] ${(data || []).length} tasks de ${type} criadas para pessoa ${personId}`);

      return { created: (data || []).length, tasks: data || [] };
    },

    /**
     * Busca progresso de onboarding/offboarding de uma pessoa
     */
    async getProgress(personId, type = 'onboarding') {
      const { data, error } = await _db().from('person_tasks')
        .select('id, title, status, completed_at, category, order_index, metadata')
        .eq('tenant_id', _tid())
        .eq('person_id', personId)
        .eq('category', type)
        .order('order_index');

      if (error) throw error;
      const tasks = data || [];
      const total = tasks.length;
      const completed = tasks.filter(t => t.status === 'completed').length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return { tasks, total, completed, percentage: pct };
    },

    /**
     * Marca task de onboarding como completa
     */
    async completeTask(taskId) {
      const { data, error } = await _db().from('person_tasks')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          completed_by: _uid()
        })
        .eq('id', taskId)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Reabre task de onboarding
     */
    async reopenTask(taskId) {
      const { data, error } = await _db().from('person_tasks')
        .update({
          status: 'pending',
          completed_at: null,
          completed_by: null
        })
        .eq('id', taskId)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Verifica se onboarding esta completo e muda status da pessoa automaticamente
     * @returns {boolean} true se mudou o status
     */
    async checkAndAutoComplete(personId, type = 'onboarding') {
      const progress = await this.getProgress(personId, type);

      if (progress.total === 0 || progress.percentage < 100) return false;

      // Auto-completar: mudar status da pessoa
      try {
        const newStatus = type === 'onboarding' ? 'active' : 'desligado';
        const updateFields = { status: newStatus };

        if (type === 'offboarding') {
          updateFields.exit_date = new Date().toISOString().split('T')[0];
        }

        // Tentar via PeopleRepo se disponivel
        if (typeof PeopleRepo !== 'undefined') {
          await PeopleRepo.update(personId, updateFields);
        } else {
          // Fallback direto
          await _db().from('colaboradores')
            .update(updateFields)
            .eq('supabase_uid', personId)
            .eq('tenant_id', _tid());
        }

        console.log(`[OnboardingRepo] Status auto-alterado para '${newStatus}' — pessoa ${personId}`);

        if (typeof TBO_TOAST !== 'undefined') {
          const msg = type === 'onboarding'
            ? 'Onboarding concluido! Status alterado para Ativo.'
            : 'Offboarding concluido! Status alterado para Desligado.';
          TBO_TOAST.success('Automação', msg);
        }

        return true;
      } catch (e) {
        console.warn('[OnboardingRepo] Auto-complete falhou:', e.message);
        return false;
      }
    },

    /**
     * Salva entrevista de saida
     */
    async saveExitInterview(personId, interview) {
      const interviewData = {
        motivo: interview.motivo || '',
        satisfacao: interview.satisfacao || 0,
        feedback: interview.feedback || '',
        recomendaria: interview.recomendaria || false,
        data: new Date().toISOString(),
        entrevistador: _uid()
      };

      // Salvar no profile/colaborador
      const tables = ['colaboradores', 'profiles'];
      for (const table of tables) {
        try {
          await _db().from(table)
            .update({ exit_interview: interviewData })
            .eq('supabase_uid', personId)
            .eq('tenant_id', _tid());
        } catch { /* ignora se tabela não existe */ }
      }

      return interviewData;
    },

    /**
     * KPIs de onboarding/offboarding
     */
    async getKPIs() {
      const tid = _tid();
      const { data, error } = await _db().from('person_tasks')
        .select('id, person_id, status, category, created_at, completed_at')
        .eq('tenant_id', tid)
        .in('category', ['onboarding', 'offboarding']);

      if (error) throw error;
      const all = data || [];

      const onb = all.filter(t => t.category === 'onboarding');
      const off = all.filter(t => t.category === 'offboarding');

      // Pessoas em onboarding
      const onbPeople = new Set(onb.map(t => t.person_id));
      const offPeople = new Set(off.map(t => t.person_id));

      // Progresso medio
      const getAvgProgress = (tasks) => {
        const byPerson = {};
        tasks.forEach(t => {
          if (!byPerson[t.person_id]) byPerson[t.person_id] = { total: 0, done: 0 };
          byPerson[t.person_id].total++;
          if (t.status === 'completed') byPerson[t.person_id].done++;
        });
        const progresses = Object.values(byPerson).map(p => p.total > 0 ? (p.done / p.total) * 100 : 0);
        return progresses.length > 0 ? Math.round(progresses.reduce((s, v) => s + v, 0) / progresses.length) : 0;
      };

      // Tempo medio de onboarding (dias entre primeira e ultima task completada)
      const getAvgDays = (tasks) => {
        const byPerson = {};
        tasks.filter(t => t.completed_at).forEach(t => {
          if (!byPerson[t.person_id]) byPerson[t.person_id] = [];
          byPerson[t.person_id].push(new Date(t.completed_at));
        });
        const durations = Object.values(byPerson)
          .filter(dates => dates.length >= 2)
          .map(dates => {
            const min = Math.min(...dates);
            const max = Math.max(...dates);
            return (max - min) / (1000 * 60 * 60 * 24);
          });
        return durations.length > 0 ? Math.round(durations.reduce((s, v) => s + v, 0) / durations.length) : 0;
      };

      return {
        onboarding: {
          activePeople: onbPeople.size,
          totalTasks: onb.length,
          completedTasks: onb.filter(t => t.status === 'completed').length,
          avgProgress: getAvgProgress(onb),
          avgDays: getAvgDays(onb)
        },
        offboarding: {
          activePeople: offPeople.size,
          totalTasks: off.length,
          completedTasks: off.filter(t => t.status === 'completed').length,
          avgProgress: getAvgProgress(off),
          avgDays: getAvgDays(off)
        }
      };
    }
  };
})();

if (typeof window !== 'undefined') {
  window.OnboardingRepo = OnboardingRepo;
}
