/**
 * TBO OS — Repository: People (Profiles + Teams)
 *
 * Queries centralizadas para profiles/pessoas e teams.
 * UI NUNCA chama supabase.from('profiles') diretamente.
 * tenant_id é OBRIGATÓRIO — lança erro se ausente.
 *
 * PRD People v1.0 — Estendido com paginação, KPIs, teams, gestores.
 */

const PeopleRepo = (() => {
  function _db() { return RepoBase.getDb(); }
  function _tid() { return RepoBase.requireTenantId(); }
  function _uid() {
    if (typeof TBO_AUTH !== 'undefined') {
      const u = TBO_AUTH.getCurrentUser();
      return u?.supabaseId || u?.id || null;
    }
    return null;
  }

  // Campos completos para listagens
  const _PROFILE_SELECT = 'id, username, full_name, email, role, avatar_url, is_active, status, department, cargo, bu, is_coordinator, salary_pj, contract_type, start_date, phone, manager_id, team_id, birth_date, address_city, address_state, nivel_atual, proximo_nivel, media_avaliacao, created_at, teams(id, name, color, icon)';

  // Campos resumidos para buscas rápidas
  const _PROFILE_BRIEF = 'id, full_name, email, avatar_url, role, bu, cargo, status, team_id';

  return {

    // ═══════════════════════════════════════════════════════════
    // PROFILES — LIST / GET / SEARCH
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista todos os membros do tenant (simples, sem paginação)
     */
    async list({ role, is_active = true, limit = 100 } = {}) {
      let query = _db().from('profiles')
        .select(_PROFILE_SELECT)
        .eq('tenant_id', _tid())
        .order('full_name');

      if (is_active !== null) query = query.eq('is_active', is_active);
      if (role) query = query.eq('role', role);
      if (limit) query = query.limit(limit);

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    /**
     * Lista paginada com filtros avançados e contagem total.
     * Substitui a query direta em TBO_RH._loadTeamFromSupabase().
     */
    async listPaginated({
      page = 0, pageSize = 50,
      sortBy = 'full_name', sortDir = 'asc',
      filterStatus, filterTeamId, filterRole, filterSearch
    } = {}) {
      const tid = _tid();
      let query = _db().from('profiles')
        .select(_PROFILE_SELECT, { count: 'exact' })
        .eq('tenant_id', tid);

      // Filtros server-side
      if (filterStatus === 'active') query = query.eq('status', 'active');
      else if (filterStatus === 'inactive') query = query.eq('status', 'inactive');
      else if (filterStatus === 'vacation') query = query.eq('status', 'vacation');
      else if (filterStatus === 'away') query = query.eq('status', 'away');
      else if (filterStatus === 'all') { /* sem filtro de status */ }
      else query = query.eq('is_active', true); // default: só ativos

      if (filterTeamId) query = query.eq('team_id', filterTeamId);
      if (filterRole) query = query.eq('role', filterRole);

      if (filterSearch) {
        const safe = filterSearch.replace(/[%(),.]/g, '');
        query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%`);
      }

      // Ordenação e paginação
      query = query.order(sortBy, { ascending: sortDir === 'asc' })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data: data || [], count: count || 0 };
    },

    /**
     * Busca perfil completo por ID
     */
    async getById(id) {
      const { data, error } = await _db().from('profiles')
        .select('*, teams(id, name, color, icon)')
        .eq('id', id)
        .eq('tenant_id', _tid())
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza perfil
     */
    async update(id, updates) {
      const { data, error } = await _db().from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Busca por nome ou email
     */
    async search(query, limit = 20) {
      const { data, error } = await _db().from('profiles')
        .select(_PROFILE_BRIEF)
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // PROFILES — KPIs & ANALYTICS
    // ═══════════════════════════════════════════════════════════

    /**
     * KPIs agregados do time para o dashboard.
     * Retorna: total, por status, custo total, custo por equipe, novos 30d.
     */
    async getDashboardKPIs() {
      const tid = _tid();

      // Buscar todos os profiles com campos necessários
      const { data: profiles, error } = await _db().from('profiles')
        .select('id, status, is_active, salary_pj, team_id, start_date, teams(id, name, color)')
        .eq('tenant_id', tid);

      if (error) throw error;
      const all = profiles || [];

      // Contagens por status
      const byStatus = { active: 0, inactive: 0, vacation: 0, away: 0, onboarding: 0, suspended: 0 };
      all.forEach(p => { byStatus[p.status || (p.is_active ? 'active' : 'inactive')]++; });

      // Custo mensal total (apenas ativos)
      const activeProfiles = all.filter(p => p.status === 'active' || (p.is_active && !p.status));
      const custoTotal = activeProfiles.reduce((sum, p) => sum + (parseFloat(p.salary_pj) || 0), 0);

      // Custo por equipe
      const custoEquipe = {};
      activeProfiles.forEach(p => {
        if (p.teams) {
          const key = p.teams.name || 'Sem equipe';
          if (!custoEquipe[key]) custoEquipe[key] = { name: key, color: p.teams.color || '#64748B', custo: 0, count: 0 };
          custoEquipe[key].custo += parseFloat(p.salary_pj) || 0;
          custoEquipe[key].count++;
        }
      });

      // Novos nos últimos 30 dias
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const novos30d = all.filter(p => p.start_date && new Date(p.start_date) >= thirtyDaysAgo).length;

      return {
        total: all.length,
        byStatus,
        custoMensalTotal: custoTotal,
        custoEquipe: Object.values(custoEquipe),
        novos30d
      };
    },

    /**
     * Contagem de projetos ativos por pessoa.
     * Usa project_memberships JOIN projects.
     */
    async getActiveProjectCounts(userIds = []) {
      const tid = _tid();

      const { data, error } = await _db().from('project_memberships')
        .select('user_id, project_id')
        .eq('tenant_id', tid)
        .in('user_id', userIds);

      if (error) throw error;

      // Agrupar por user_id
      const counts = {};
      (data || []).forEach(pm => {
        counts[pm.user_id] = (counts[pm.user_id] || 0) + 1;
      });
      return counts;
    },

    /**
     * Lista direct reports de um gestor
     */
    async getDirectReports(managerId) {
      const { data, error } = await _db().from('profiles')
        .select(_PROFILE_BRIEF)
        .eq('tenant_id', _tid())
        .eq('manager_id', managerId)
        .eq('is_active', true)
        .order('full_name');

      if (error) throw error;
      return data || [];
    },

    /**
     * Cadeia de gestão (manager → manager do manager)
     */
    async getManagerChain(userId) {
      const chain = [];
      let currentId = userId;
      const visited = new Set();

      while (currentId && !visited.has(currentId) && chain.length < 5) {
        visited.add(currentId);
        const { data } = await _db().from('profiles')
          .select('id, full_name, email, avatar_url, role, cargo, manager_id')
          .eq('id', currentId)
          .eq('tenant_id', _tid())
          .single();

        if (!data || !data.manager_id) break;
        chain.push(data);
        currentId = data.manager_id;
      }

      return chain;
    },

    /**
     * Bulk update de status
     */
    async bulkUpdateStatus(userIds, newStatus) {
      const tid = _tid();
      const { data, error } = await _db().from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('tenant_id', tid)
        .in('id', userIds)
        .select('id, status');

      if (error) throw error;
      return data;
    },

    // ═══════════════════════════════════════════════════════════
    // PROFILES — RBAC / PERMISSÕES
    // ═══════════════════════════════════════════════════════════

    /**
     * Retorna permissões do usuário via RPC
     * SEGURANÇA: valida que userId pertence ao tenant antes de chamar RPC
     */
    async getPermissions(userId) {
      const tid = _tid();

      const { data: profile, error: profileError } = await _db().from('profiles')
        .select('id')
        .eq('id', userId)
        .eq('tenant_id', tid)
        .single();

      if (profileError || !profile) {
        throw new Error(`[PeopleRepo] Usuário ${userId} não pertence ao tenant ou não existe`);
      }

      const { data, error } = await _db().rpc('get_user_permissions', { p_user_id: userId });
      if (error) throw error;
      return data;
    },

    /**
     * Retorna role RBAC completo de um usuário (via tenant_members → roles)
     */
    async getUserRole(userId) {
      const tid = _tid();

      const { data, error } = await _db().from('tenant_members')
        .select('role_id, roles(id, name, slug, label, color)')
        .eq('tenant_id', tid)
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data?.roles || null;
    },

    /**
     * Retorna roles RBAC de múltiplos usuários
     */
    async getUserRoles(userIds) {
      const tid = _tid();

      const { data, error } = await _db().from('tenant_members')
        .select('user_id, roles(name, label, color)')
        .eq('tenant_id', tid)
        .in('user_id', userIds);

      if (error) throw error;

      const map = {};
      (data || []).forEach(m => {
        map[m.user_id] = m.roles || {};
      });
      return map;
    },

    // ═══════════════════════════════════════════════════════════
    // TEAMS — CRUD
    // ═══════════════════════════════════════════════════════════

    /**
     * Lista teams do tenant
     */
    async listTeams() {
      const { data, error } = await _db().from('teams')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    },

    /**
     * Cria novo team
     */
    async createTeam(team) {
      const { data, error } = await _db().from('teams')
        .insert({
          ...team,
          tenant_id: _tid(),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Atualiza team
     */
    async updateTeam(id, updates) {
      const { data, error } = await _db().from('teams')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('tenant_id', _tid())
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    /**
     * Retorna contagem de membros por team
     */
    async getTeamMemberCounts() {
      const tid = _tid();
      const { data, error } = await _db().from('profiles')
        .select('team_id')
        .eq('tenant_id', tid)
        .eq('is_active', true)
        .not('team_id', 'is', null);

      if (error) throw error;

      const counts = {};
      (data || []).forEach(p => {
        counts[p.team_id] = (counts[p.team_id] || 0) + 1;
      });
      return counts;
    },

    // ═══════════════════════════════════════════════════════════
    // HISTÓRICO (collaborator_history)
    // ═══════════════════════════════════════════════════════════

    /**
     * Retorna histórico de mudanças de um colaborador
     */
    async getHistory(userId, { field, limit = 50 } = {}) {
      let query = _db().from('collaborator_history')
        .select('*')
        .eq('tenant_id', _tid())
        .eq('user_id', userId)
        .order('changed_at', { ascending: false })
        .limit(limit);

      if (field) query = query.eq('field_changed', field);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  };
})();

if (typeof window !== 'undefined') {
  window.PeopleRepo = PeopleRepo;
}
