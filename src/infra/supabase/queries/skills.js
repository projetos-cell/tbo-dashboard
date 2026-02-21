/**
 * TBO OS — Repository: Skills (Competências & Certificações)
 *
 * CRUD para habilidades, niveis de proficiencia e certificacoes.
 * UI NUNCA chama supabase.from('person_skills') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 */

const SkillsRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }

  const _SELECT = 'id, person_id, skill_name, category, proficiency_level, verified_by, verified_at, certification_name, certification_expiry, created_at';

  return {

    /**
     * Lista todas as skills do tenant
     */
    async list({ personId, category, limit = 200 } = {}) {
      const tid = _tid();
      let query = _db().from('person_skills')
        .select(_SELECT, { count: 'exact' })
        .eq('tenant_id', tid)
        .order('skill_name');

      if (personId) query = query.eq('person_id', personId);
      if (category) query = query.eq('category', category);
      if (limit) query = query.limit(limit);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Skills de uma pessoa
     */
    async getForPerson(personId) {
      const { data, error } = await _db().from('person_skills')
        .select(_SELECT)
        .eq('tenant_id', _tid())
        .eq('person_id', personId)
        .order('proficiency_level', { ascending: false });

      if (error) throw error;
      return data || [];
    },

    /**
     * Cria nova skill
     */
    async create(skill) {
      const { data, error } = await _db().from('person_skills')
        .insert({
          ...skill,
          tenant_id: _tid(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza skill
     */
    async update(id, updates) {
      const { data, error } = await _db().from('person_skills')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Remove skill
     */
    async remove(id) {
      const { error } = await _db().from('person_skills')
        .delete()
        .eq('id', id)
        .eq('tenant_id', _tid());

      if (error) throw error;
      return true;
    },

    /**
     * Bulk create skills para uma pessoa
     */
    async bulkCreate(personId, skills) {
      const tid = _tid();
      const rows = skills.map(s => ({
        tenant_id: tid,
        person_id: personId,
        skill_name: s.skill_name || s.name,
        category: s.category || null,
        proficiency_level: s.proficiency_level || s.level || 1,
        certification_name: s.certification_name || null,
        certification_expiry: s.certification_expiry || null,
        created_at: new Date().toISOString()
      }));

      const { data, error } = await _db().from('person_skills')
        .insert(rows)
        .select();

      if (error) throw error;
      return data || [];
    },

    /**
     * KPIs: distribuicao de skills, top skills, certificacoes
     */
    async getKPIs() {
      const tid = _tid();
      const { data, error } = await _db().from('person_skills')
        .select('id, person_id, skill_name, category, proficiency_level, certification_name, certification_expiry')
        .eq('tenant_id', tid);

      if (error) throw error;
      const all = data || [];

      // Por skill
      const bySkill = {};
      all.forEach(s => {
        bySkill[s.skill_name] = (bySkill[s.skill_name] || 0) + 1;
      });
      const topSkills = Object.entries(bySkill).sort((a, b) => b[1] - a[1]).slice(0, 10);

      // Por categoria
      const byCategory = {};
      all.forEach(s => {
        const cat = s.category || 'Sem categoria';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
      });

      // Nivel medio
      const avgLevel = all.length > 0
        ? +(all.reduce((sum, s) => sum + (s.proficiency_level || 1), 0) / all.length).toFixed(1)
        : 0;

      // Certificacoes proximas de expirar
      const now = new Date();
      const expiringCerts = all.filter(s =>
        s.certification_name && s.certification_expiry &&
        new Date(s.certification_expiry) <= new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) &&
        new Date(s.certification_expiry) >= now
      );

      return {
        total: all.length,
        uniqueSkills: Object.keys(bySkill).length,
        topSkills,
        byCategory,
        avgLevel,
        expiringCerts: expiringCerts.length,
        peopleWithSkills: new Set(all.map(s => s.person_id)).size
      };
    },

    /**
     * Skills agrupadas por BU (precisa de join com people)
     * Retorna { buName: [{ skill, count, avgLevel }] }
     */
    async getByBU(teamData) {
      const skills = await this.list();
      if (!teamData || !skills.data.length) return {};

      const byBU = {};
      skills.data.forEach(s => {
        const person = teamData.find(t => t.supabaseId === s.person_id || t.id === s.person_id);
        const bu = person?.bu || 'Sem BU';
        if (!byBU[bu]) byBU[bu] = {};
        if (!byBU[bu][s.skill_name]) byBU[bu][s.skill_name] = { count: 0, totalLevel: 0 };
        byBU[bu][s.skill_name].count++;
        byBU[bu][s.skill_name].totalLevel += s.proficiency_level || 1;
      });

      // Calcular medias
      Object.keys(byBU).forEach(bu => {
        byBU[bu] = Object.entries(byBU[bu]).map(([skill, data]) => ({
          skill,
          count: data.count,
          avgLevel: +(data.totalLevel / data.count).toFixed(1)
        })).sort((a, b) => b.count - a.count);
      });

      return byBU;
    }
  };
})();

if (typeof window !== 'undefined') {
  window.SkillsRepo = SkillsRepo;
}
