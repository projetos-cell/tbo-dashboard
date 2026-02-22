// TBO OS — People Module: Estado compartilhado e helpers
// Usado por todos os sub-modulos de People (Equipe, Talentos, Vagas, etc.)

const TBO_PEOPLE_SHARED = {
  // ── Team Data — Seed/fallback (quando Supabase indisponivel) ──
  _teamSeed: [
    { id: 'ruy',     nome: 'Ruy Lima',           cargo: 'Diretor Comercial',       area: 'Vendas, Operacao',      bu: 'Vendas',       nivel: 'Senior III', lider: null,    status: 'ativo' },
    { id: 'marco',   nome: 'Marco Andolfato',    cargo: 'Diretor Operacoes',       area: 'Operacao',              bu: '',              nivel: 'Senior III', lider: null,    status: 'ativo' },
    { id: 'carol',   nome: 'Carol',              cargo: 'Coord. Atendimento',      area: 'Pos Vendas, Operacao',  bu: '',              nivel: 'Pleno II',   lider: 'marco', status: 'ativo' },
    { id: 'nelson',  nome: 'Nelson',             cargo: 'PO Branding',             area: 'BU Branding',           bu: 'Branding',      nivel: 'Pleno III',  lider: 'marco', status: 'ativo' },
    { id: 'nath',    nome: 'Nathalia',           cargo: 'PO Digital 3D',           area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Senior I',   lider: 'marco', status: 'ativo' },
    { id: 'rafa',    nome: 'Rafa',               cargo: 'PO Marketing',            area: 'BU Marketing',          bu: 'Marketing',     nivel: 'Pleno II',   lider: 'marco', status: 'ativo' },
    { id: 'gustavo', nome: 'Gustavo',            cargo: 'Comercial',               area: 'Vendas',                bu: 'Vendas',        nivel: 'Pleno I',    lider: 'ruy',   status: 'ativo' },
    { id: 'celso',   nome: 'Celso',              cargo: 'Designer',                area: 'BU Branding',           bu: 'Branding',      nivel: 'Pleno I',    lider: 'nelson', status: 'ativo' },
    { id: 'duda',    nome: 'Duda',               cargo: 'Artista 3D',              area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Jr. III',    lider: 'nath',  status: 'ativo' },
    { id: 'tiago',   nome: 'Tiago M.',           cargo: 'Artista 3D',              area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Pleno I',    lider: 'nath',  status: 'ativo' },
    { id: 'lucca',   nome: 'Lucca',              cargo: 'Analista de Marketing',   area: 'BU Marketing',          bu: 'Marketing',     nivel: 'Jr. III',    lider: 'rafa',  status: 'ativo' },
    { id: 'financaazul', nome: 'Financa Azul',   cargo: 'Financeiro (terc.)',      area: 'Financeiro',            bu: '',              nivel: '',           lider: 'ruy',   status: 'ativo', terceirizado: true }
  ],

  // Estado compartilhado
  _team: [],
  _teamLoaded: false,
  _teamLoadError: null,
  _profileMap: {},
  _teamsCache: null,
  _activeTab: 'visao-geral',
  _culturaSubTab: 'valores',
  _filterBU: '',
  _filterSearch: '',
  _loading: false,
  _page: 0,
  _pageSize: 50,
  _totalCount: 0,
  _sortBy: 'full_name',
  _sortDir: 'asc',
  _filterRole: '',
  _filterStatus: '',
  _filterSquad: '',
  _searchDebounceTimer: null,

  // Dados de competencias / cultura
  _competenciasRadar: [
    { id: 'tecnica',       nome: 'Hab. Tecnica' },
    { id: 'comunicacao',   nome: 'Comunicacao' },
    { id: 'criatividade',  nome: 'Criatividade' },
    { id: 'qualidade',     nome: 'Qualid. Entrega' },
    { id: 'produtividade', nome: 'Produtividade' },
    { id: 'aprendizado',   nome: 'Aprendizado' }
  ],

  _habilidadesPDI: [
    { id: 'h01', nome: 'Gestao Projetos & Rituais' },
    { id: 'h02', nome: 'Habilidades Tecnicas' },
    { id: 'h03', nome: 'Atendimento de Prazo' },
    { id: 'h04', nome: 'Comunicacao & Colaboracao' },
    { id: 'h05', nome: 'Criatividade' },
    { id: 'h06', nome: 'Qualidade de Entrega' },
    { id: 'h07', nome: 'Produtividade' },
    { id: 'h08', nome: 'Aprendizado & Desenvolvimento' },
    { id: 'h09', nome: 'Resolucao de Problemas' },
    { id: 'h10', nome: 'Cultura & Alinhamento' }
  ],

  _valores: [
    { id: 'excelencia',  nome: 'Excelencia Tecnica', emoji: '\u{1F48E}' },
    { id: 'cliente',     nome: 'Cliente Primeiro',    emoji: '\u{1F91D}' },
    { id: 'colaboracao', nome: 'Colaboracao',          emoji: '\u{1F3C6}' },
    { id: 'inovacao',    nome: 'Inovacao',             emoji: '\u{1F680}' },
    { id: 'ownership',   nome: 'Ownership',            emoji: '\u{1F525}' },
    { id: 'superacao',   nome: 'Superacao',            emoji: '\u2B50' }
  ],

  // ── Helpers ──────────────────────────────────────────────────────
  _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  _getStore(key) { try { return JSON.parse(localStorage.getItem('tbo_rh_' + key) || '[]'); } catch { return []; } },
  _setStore(key, data) { localStorage.setItem('tbo_rh_' + key, JSON.stringify(data)); },
  _getPersonName(id) { const p = this._team.find(t => t.id === id); return p ? p.nome : id || '\u2014'; },
  _getPerson(id) { return this._team.find(t => t.id === id); },
  _esc(s) { return typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s) : String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); },

  _getPersonNameByUid(uid) {
    const p = this._team.find(t => t.supabaseId === uid);
    return p ? p.nome : uid || '\u2014';
  },

  _roleLabelMap(role) {
    const labels = {
      'founder': 'Fundador', 'owner': 'Proprietário', 'admin': 'Administrador',
      'project_owner': 'Gestor de Projetos', 'coordinator': 'Coordenador(a)',
      'artist': 'Colaborador', '3d-artist': 'Artista 3D', 'finance': 'Financeiro',
      'member': 'Membro', 'viewer': 'Visualizador', 'guest': 'Convidado'
    };
    return labels[role] || role || 'Membro';
  },
  _roleColorMap(role) {
    const colors = {
      'founder': '#E85102', 'owner': '#E85102', 'admin': '#DC2626',
      'project_owner': '#3B82F6', 'coordinator': '#8B5CF6',
      'artist': '#10B981', '3d-artist': '#10B981', 'finance': '#F59E0B',
      'member': '#64748B', 'viewer': '#94A3B8', 'guest': '#CBD5E1'
    };
    return colors[role] || '#94a3b8';
  },

  _isAdmin() {
    if (typeof TBO_AUTH === 'undefined') return true;
    return TBO_AUTH.canDo('users', 'edit') || TBO_AUTH.getCurrentUser()?.isCoordinator;
  },
  _isDiretoria() {
    if (typeof TBO_AUTH === 'undefined') return true;
    return TBO_AUTH.isAdmin();
  },
  _canSee1on1s() {
    if (typeof TBO_AUTH === 'undefined') return true;
    if (this._isDiretoria()) return true;
    const u = TBO_AUTH.getCurrentUser();
    if (!u) return false;
    return u.role === 'project_owner' || u.role === 'coordinator' || u.isCoordinator;
  },
  _canSeeContracts() {
    if (typeof TBO_AUTH === 'undefined') return true;
    if (this._isDiretoria()) return true;
    const u = TBO_AUTH.getCurrentUser();
    if (!u) return false;
    return u.role === 'financeiro' || u.role === 'finance';
  },
  _currentUserId() {
    if (typeof TBO_AUTH === 'undefined') return 'marco';
    const u = TBO_AUTH.getCurrentUser();
    return u ? u.id : 'marco';
  },

  _pageHeader(title, description, actionsHtml = '') {
    return `
      <div class="rh-page-header" style="display:flex; align-items:center; justify-content:space-between; margin-bottom:24px; padding-bottom:16px; border-bottom:1px solid var(--border-color, #e5e7eb);">
        <div>
          <h2 style="margin:0; font-size:1.5rem; font-weight:700; color:var(--text-primary, #111827);">${title}</h2>
          ${description ? `<p style="margin:4px 0 0; font-size:0.875rem; color:var(--text-secondary, #6b7280);">${description}</p>` : ''}
        </div>
        ${actionsHtml ? `<div style="display:flex; gap:8px; align-items:center;">${actionsHtml}</div>` : ''}
      </div>
    `;
  },

  _getInternalTeam() { return this._team.filter(t => !t.terceirizado); },

  _getBUs() {
    if (this._teamsCache && this._teamsCache.length) {
      return this._teamsCache.filter(t => t.is_active !== false).map(t => t.name).sort();
    }
    const bus = new Set();
    this._getInternalTeam().forEach(t => { if (t.bu) bus.add(t.bu); });
    return [...bus].sort();
  },

  _getAvatarHTML(person, size = 40, fontSize = '0.85rem') {
    const initials = (person.nome || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
    const color = buColors[person.bu] || 'var(--accent-gold)';
    const avatarUrl = person.avatarUrl || this._profileMap[person.id]?.avatarUrl;
    if (avatarUrl) {
      return `<img src="${this._esc(avatarUrl)}" alt="${initials}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div class="rh-avatar" style="width:${size}px;height:${size}px;font-size:${fontSize};background:${color}20;color:${color};display:none;">${initials}</div>`;
    }
    return `<div class="rh-avatar" style="width:${size}px;height:${size}px;font-size:${fontSize};background:${color}20;color:${color};">${initials}</div>`;
  },

  _renderSkeleton() {
    const skeletonCard = `
      <div class="rh-person-card rh-skeleton-card" style="pointer-events:none;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div class="rh-skeleton" style="width:40px;height:40px;border-radius:50%;"></div>
          <div style="flex:1;">
            <div class="rh-skeleton" style="width:70%;height:14px;border-radius:4px;margin-bottom:6px;"></div>
            <div class="rh-skeleton" style="width:50%;height:10px;border-radius:4px;"></div>
          </div>
          <div class="rh-skeleton" style="width:28px;height:24px;border-radius:4px;"></div>
        </div>
        <div style="display:flex;gap:6px;">
          <div class="rh-skeleton" style="width:60px;height:16px;border-radius:10px;"></div>
          <div class="rh-skeleton" style="width:50px;height:16px;border-radius:10px;"></div>
        </div>
      </div>`;
    return Array(8).fill(skeletonCard).join('');
  },

  _renderKPISkeleton() {
    const skeletonKPI = `<div class="kpi-card"><div class="rh-skeleton" style="width:60%;height:12px;border-radius:4px;margin-bottom:8px;"></div><div class="rh-skeleton" style="width:40%;height:24px;border-radius:4px;margin-bottom:4px;"></div><div class="rh-skeleton" style="width:80%;height:10px;border-radius:4px;"></div></div>`;
    return `<div class="grid-4" style="margin-bottom:24px;">${Array(4).fill(skeletonKPI).join('')}</div>`;
  },

  // ── Carregar equipe do Supabase ────────────────────────────────
  async _loadTeamFromSupabase(options = {}) {
    if (this._teamLoaded && !options.force) return;
    this._loading = true;
    this._teamLoadError = null;
    const statusMap = { 'ativo': 'active', 'inativo': 'inactive', 'ferias': 'vacation', 'ausente': 'away', 'onboarding': 'onboarding', 'offboarding': 'offboarding', 'desligado': 'desligado', 'suspenso': 'suspended' };

    if (typeof PeopleRepo !== 'undefined') {
      try {
        const filterStatusDb = this._filterStatus ? (statusMap[this._filterStatus] || this._filterStatus) : null;
        let filterTeamId = null;
        if (this._filterSquad && this._teamsCache) {
          const team = this._teamsCache.find(t => t.name === this._filterSquad);
          if (team) filterTeamId = team.id;
        }
        const { data: profiles, count } = await PeopleRepo.listPaginated({
          page: this._page, pageSize: this._pageSize,
          sortBy: this._sortBy, sortDir: this._sortDir,
          filterStatus: filterStatusDb || undefined,
          filterTeamId: filterTeamId || undefined,
          filterSearch: this._filterSearch || undefined
        });
        this._totalCount = count || profiles.length;
        const seedMap = {};
        this._teamSeed.forEach(s => { seedMap[s.id] = s; });
        let roleMap = {};
        try {
          const userIds = profiles.map(p => p.id);
          if (userIds.length) roleMap = await PeopleRepo.getUserRoles(userIds);
        } catch (e) { /* fallback silencioso */ }
        const managerIds = [...new Set(profiles.filter(p => p.manager_id).map(p => p.manager_id))];
        const managerMap = {};
        profiles.forEach(p => { managerMap[p.id] = p.full_name || p.username || ''; });
        const missingIds = managerIds.filter(id => !managerMap[id]);
        if (missingIds.length) {
          try {
            const db = typeof RepoBase !== 'undefined' ? RepoBase.getDb() : null;
            if (db) {
              const { data: mgrs } = await db.from('profiles').select('id, full_name, username').in('id', missingIds);
              (mgrs || []).forEach(m => { managerMap[m.id] = m.full_name || m.username || ''; });
            }
          } catch (e) { /* fallback silencioso */ }
        }
        this._team = profiles.map(p => {
          const username = p.username || p.email?.split('@')[0] || '';
          const seed = seedMap[username] || {};
          const rbacRole = roleMap[p.id] || {};
          const teamName = p.teams?.name || p.bu || seed.bu || '';
          return {
            id: username, supabaseId: p.id,
            nome: p.full_name || username,
            cargo: p.cargo || seed.cargo || (p.is_coordinator ? 'Coordenador(a)' : p.role || ''),
            area: seed.area || (teamName ? `BU ${teamName}` : ''),
            bu: teamName, nivel: seed.nivel || '', lider: seed.lider || null,
            status: p.status || (p.is_active ? 'active' : 'inactive'),
            avatarUrl: p.avatar_url || null, email: p.email || '',
            rbacRole: rbacRole.name || p.role || 'member',
            rbacLabel: rbacRole.label || this._roleLabelMap(p.role) || 'Membro',
            rbacColor: rbacRole.color || this._roleColorMap(p.role) || '#94a3b8',
            isCoordinator: p.is_coordinator || false,
            dataEntrada: p.start_date || p.created_at || null,
            ultimoLogin: null, terceirizado: seed.terceirizado || false,
            custoMensal: p.salary_pj || null, gestorId: p.manager_id || null,
            gestorNome: p.manager_id ? (managerMap[p.manager_id] || '\u2014') : '\u2014',
            teamId: p.team_id || null, contractType: p.contract_type || null,
            phone: p.phone || null
          };
        });
        this._profileMap = {};
        profiles.forEach(p => {
          const username = p.username || p.email?.split('@')[0] || '';
          this._profileMap[username] = { supabaseId: p.id, avatarUrl: p.avatar_url || null, email: p.email, fullName: p.full_name, lastSignIn: null };
        });
        this._teamLoaded = true;
        this._loading = false;
        console.log(`[People] Equipe carregada via PeopleRepo: ${this._team.length}/${this._totalCount} membros`);
        return;
      } catch (e) {
        console.warn('[People] Erro ao carregar equipe via PeopleRepo:', e.message);
        this._teamLoadError = e.message;
      }
    }
    // Fallback: usar seed data
    console.log('[People] Usando seed data como fallback');
    this._team = [...this._teamSeed];
    this._totalCount = this._team.length;
    this._teamLoaded = true;
    this._loading = false;
  },

  // ── Bind helpers (atalhos para addEventListener por ID) ──
  _bind(id, handler, event = 'click') {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
  },
  _bindToggle(triggerId, targetId, show = true) {
    const trigger = document.getElementById(triggerId);
    const target = document.getElementById(targetId);
    if (trigger && target) {
      trigger.addEventListener('click', () => { target.style.display = show ? (target.style.display === 'none' ? 'block' : 'none') : 'none'; });
    }
  },

  // ── Recarregar equipe server-side (paginacao / sort / filtro) ──
  async _reloadTeamServerSide() {
    this._teamLoaded = false;
    await this._loadTeamFromSupabase({ force: true });
    const tabContent = document.getElementById('rhTabContent');
    if (tabContent) {
      tabContent.innerHTML = TBO_PEOPLE._renderActiveTab();
      TBO_PEOPLE._initActiveTab();
      if (window.lucide) lucide.createIcons();
    }
  }
};
