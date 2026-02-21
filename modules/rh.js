// TBO OS — Module: Pessoas / Equipe (People Ops v3.0)
// Diretorio de equipe com Supabase como fonte unica de verdade
// Features: tabela paginada, organograma, perfil Asana-style, acoes admin, RBAC
// v3.0: Rewrite completo — Supabase-first, server-side pagination, RLS-aware
const TBO_RH = {

  // ── Team Data — Seed/fallback (quando Supabase indisponivel) ──
  // v2.3: Fonte de verdade e Supabase profiles table. Este array e fallback.
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

  // _team e populado por _loadTeamFromSupabase() ou fallback para _teamSeed
  _team: [],
  _teamLoaded: false,
  _teamLoadError: null,
  // Mapa supabaseId -> dados extras (avatar_url, etc)
  _profileMap: {},
  // Cache de teams do PeopleRepo para filtros e resolucao de nomes
  _teamsCache: null,

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

  _activeTab: 'visao-geral',
  _filterBU: '',
  _filterSearch: '',
  _loading: false,

  // ── Helpers ──────────────────────────────────────────────────────
  _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  _getStore(key) { try { return JSON.parse(localStorage.getItem('tbo_rh_' + key) || '[]'); } catch { return []; } },
  _setStore(key, data) { localStorage.setItem('tbo_rh_' + key, JSON.stringify(data)); },
  _getPersonName(id) { const p = this._team.find(t => t.id === id); return p ? p.nome : id || '\u2014'; },
  _getPerson(id) { return this._team.find(t => t.id === id); },
  _esc(s) { return typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s) : String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); },

  // Mapeamento de roles legados → labels amigáveis em PT-BR
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
    // RBAC: usa canDo para verificar permissao de gestao de usuarios
    return TBO_AUTH.canDo('users', 'edit') || TBO_AUTH.getCurrentUser()?.isCoordinator;
  },

  // Diretoria: founder, owner, admin (co-CEOs + admins)
  _isDiretoria() {
    if (typeof TBO_AUTH === 'undefined') return true;
    return TBO_AUTH.isAdmin(); // founder || owner || admin
  },

  // PO, Coordenador ou Diretoria — pode ver 1:1s & Rituais
  _canSee1on1s() {
    if (typeof TBO_AUTH === 'undefined') return true;
    if (this._isDiretoria()) return true;
    const u = TBO_AUTH.getCurrentUser();
    if (!u) return false;
    return u.role === 'project_owner' || u.role === 'coordinator' || u.isCoordinator;
  },

  // Admin, Diretoria ou Financeiro — pode ver Contratos
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

  // Helper: gera page header funcional (titulo + descricao + acoes)
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
    // Preferir _teamsCache (fonte de verdade) quando disponível
    if (this._teamsCache && this._teamsCache.length) {
      return this._teamsCache.filter(t => t.is_active !== false).map(t => t.name).sort();
    }
    const bus = new Set();
    this._getInternalTeam().forEach(t => { if (t.bu) bus.add(t.bu); });
    return [...bus].sort();
  },

  // ── Carregar equipe do Supabase ────────────────────────────────
  // v3.0: Supabase como fonte unica. Inclui role RBAC, status, ultimo login.
  // Paginacao server-side. Fallback para _teamSeed se offline/erro.
  _page: 0,
  _pageSize: 50,
  _totalCount: 0,
  _sortBy: 'full_name',
  _sortDir: 'asc',
  _filterRole: '',
  _filterStatus: '',
  _filterSquad: '',

  async _loadTeamFromSupabase(options = {}) {
    if (this._teamLoaded && !options.force) return;
    this._loading = true;
    this._teamLoadError = null;

    // Mapear status do filtro local para status do DB
    const statusMap = { 'ativo': 'active', 'inativo': 'inactive', 'ferias': 'vacation', 'ausente': 'away', 'onboarding': 'onboarding', 'offboarding': 'offboarding', 'desligado': 'desligado', 'suspenso': 'suspended' };

    // Tentar PeopleRepo primeiro (v3.0), fallback para query direta
    if (typeof PeopleRepo !== 'undefined') {
      try {
        const filterStatusDb = this._filterStatus ? (statusMap[this._filterStatus] || this._filterStatus) : null;

        // Resolver BU name → team_id para filtro server-side
        let filterTeamId = null;
        if (this._filterSquad && this._teamsCache) {
          const team = this._teamsCache.find(t => t.name === this._filterSquad);
          if (team) filterTeamId = team.id;
        }

        const { data: profiles, count } = await PeopleRepo.listPaginated({
          page: this._page,
          pageSize: this._pageSize,
          sortBy: this._sortBy,
          sortDir: this._sortDir,
          filterStatus: filterStatusDb || undefined,
          filterTeamId: filterTeamId || undefined,
          filterSearch: this._filterSearch || undefined
        });

        this._totalCount = count || profiles.length;

        // Mapear profiles do Supabase para formato _team
        const seedMap = {};
        this._teamSeed.forEach(s => { seedMap[s.id] = s; });

        // Carregar roles RBAC via PeopleRepo
        let roleMap = {};
        try {
          const userIds = profiles.map(p => p.id);
          if (userIds.length) roleMap = await PeopleRepo.getUserRoles(userIds);
        } catch (e) { /* fallback silencioso */ }

        // Construir mapa de gestores (manager_id -> nome) para exibicao
        const managerIds = [...new Set(profiles.filter(p => p.manager_id).map(p => p.manager_id))];
        const managerMap = {};
        // Resolver nomes dos gestores a partir dos proprios profiles carregados
        profiles.forEach(p => { managerMap[p.id] = p.full_name || p.username || ''; });
        // Buscar nomes de gestores que nao estao na pagina atual
        const missingIds = managerIds.filter(id => !managerMap[id]);
        if (missingIds.length) {
          try {
            const db = typeof RepoBase !== 'undefined' ? RepoBase.getDb() : null;
            if (db) {
              const { data: mgrs } = await db.from('profiles')
                .select('id, full_name, username')
                .in('id', missingIds);
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
            id: username,
            supabaseId: p.id,
            nome: p.full_name || username,
            cargo: p.cargo || seed.cargo || (p.is_coordinator ? 'Coordenador(a)' : p.role || ''),
            area: seed.area || (teamName ? `BU ${teamName}` : ''),
            bu: teamName,
            nivel: seed.nivel || '',
            lider: seed.lider || null,
            status: p.status || (p.is_active ? 'active' : 'inactive'),
            avatarUrl: p.avatar_url || null,
            email: p.email || '',
            rbacRole: rbacRole.name || p.role || 'member',
            rbacLabel: rbacRole.label || this._roleLabelMap(p.role) || 'Membro',
            rbacColor: rbacRole.color || this._roleColorMap(p.role) || '#94a3b8',
            isCoordinator: p.is_coordinator || false,
            dataEntrada: p.start_date || p.created_at || null,
            ultimoLogin: null, // last_sign_in_at não existe em profiles
            terceirizado: seed.terceirizado || false,
            custoMensal: p.salary_pj || null,
            gestorId: p.manager_id || null,
            gestorNome: p.manager_id ? (managerMap[p.manager_id] || '\u2014') : '\u2014',
            teamId: p.team_id || null,
            contractType: p.contract_type || null,
            phone: p.phone || null
          };
        });

        // Construir profileMap para acesso rapido por username
        this._profileMap = {};
        profiles.forEach(p => {
          const username = p.username || p.email?.split('@')[0] || '';
          this._profileMap[username] = {
            supabaseId: p.id,
            avatarUrl: p.avatar_url || null,
            email: p.email,
            fullName: p.full_name,
            lastSignIn: null
          };
        });

        this._teamLoaded = true;
        this._loading = false;
        console.log(`[RH] Equipe carregada via PeopleRepo: ${this._team.length}/${this._totalCount} membros`);
        return;
      } catch (e) {
        console.warn('[RH] Erro ao carregar equipe via PeopleRepo:', e.message);
        this._teamLoadError = e.message;
      }
    }

    // Fallback: usar seed data
    console.log('[RH] Usando seed data como fallback');
    this._team = [...this._teamSeed];
    this._totalCount = this._team.length;
    this._teamLoaded = true;
    this._loading = false;
  },

  // ── Avatar helper ──────────────────────────────────────────────
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

  // ── Loading skeleton ───────────────────────────────────────────
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

  // ── Seed Data ───────────────────────────────────────────────────
  _ensureSeedData() {
    if (this._getStore('people_seeded_v3').length) return;
    ['ciclos','avaliacoes_people','feedbacks','elogios','1on1s','people_seeded','people_seeded_v2','pulse'].forEach(k => localStorage.removeItem('tbo_rh_' + k));

    const cycleId = 'ciclo_2025s2';
    const cycle2Id = 'ciclo_2026s1';
    this._setStore('ciclos', [
      { id: cycle2Id, nome: 'Avaliacao Semestral 2026.1', tipo: 'PDI 360', inicio: '2026-01-15', fim: '2026-06-30', status: 'em_andamento',
        fases: [
          { id: 'auto', nome: 'Autoavaliacao', inicio: '2026-01-15', fim: '2026-02-07', progresso: 100 },
          { id: 'gestor', nome: 'Avaliacao do Gestor', inicio: '2026-02-08', fim: '2026-02-28', progresso: 60 },
          { id: 'pares', nome: 'Avaliacao de Pares', inicio: '2026-02-15', fim: '2026-03-15', progresso: 30 },
          { id: 'calibracao', nome: 'Calibracao & Devolutiva', inicio: '2026-03-15', fim: '2026-03-31', progresso: 0 }
        ]},
      { id: cycleId, nome: 'Avaliacao Semestral 2025.2', tipo: 'PDI 360', inicio: '2025-07-01', fim: '2025-12-31', status: 'finalizado',
        fases: [
          { id: 'auto', nome: 'Autoavaliacao', inicio: '2025-07-01', fim: '2025-07-15', progresso: 100 },
          { id: 'gestor', nome: 'Avaliacao do Gestor', inicio: '2025-07-15', fim: '2025-07-31', progresso: 100 },
          { id: 'pares', nome: 'Avaliacao de Pares', inicio: '2025-08-01', fim: '2025-08-15', progresso: 100 },
          { id: 'calibracao', nome: 'Calibracao & Devolutiva', inicio: '2025-08-15', fim: '2025-08-31', progresso: 100 }
        ]}
    ]);

    // Avaliacoes individuais realistas
    const profiles = {
      carol:   { auto: [3.5,4.0,3.5,3.0,2.5,3.0], gest: [3.0,3.5,3.5,3.0,2.5,3.0], par: [3.5,3.5,3.0,3.0,3.0,3.0], dest: ['Organizacao','Atendimento'], gaps: ['Proatividade','Ferramentas IA'], parecer: 'Carol tem sido pilar na coordenacao de atendimento. Precisa explorar mais ferramentas de IA.' },
      nelson:  { auto: [4.0,3.5,4.5,4.0,3.5,3.0], gest: [4.0,3.0,4.5,4.0,3.0,3.0], par: [3.5,3.5,4.0,3.5,3.0,3.5], dest: ['Criatividade','Branding'], gaps: ['Mercado Imobiliario','Feedbacks'], parecer: 'Nelson entrega identidades de marca com qualidade. Precisa ser mais permeavel aos feedbacks.' },
      nath:    { auto: [4.5,4.0,4.0,4.0,4.5,4.0], gest: [4.5,4.0,4.0,4.5,4.0,4.0], par: [4.0,3.5,3.5,4.0,4.0,4.0], dest: ['Lideranca','Gestao Projetos'], gaps: ['Delegacao'], parecer: 'Nathalia e referencia na gestao da BU Digital 3D. Ponto de atencao: delegar mais.' },
      rafa:    { auto: [3.5,3.5,3.5,3.0,3.0,3.5], gest: [3.5,3.0,3.5,3.0,3.0,3.0], par: [3.0,3.0,3.0,3.0,3.0,3.0], dest: ['Estrategia','Performance'], gaps: ['Planejamento','Documentacao'], parecer: 'Rafa tem mostrado evolucao na gestao de campanhas.' },
      gustavo: { auto: [3.0,4.0,3.0,3.0,2.5,3.0], gest: [3.0,3.5,2.5,3.0,2.5,3.0], par: [3.0,3.5,2.5,3.0,2.5,2.5], dest: ['Comunicacao','Relacionamento'], gaps: ['Gestao de Tempo','Prospeccao'], parecer: 'Gustavo tem bom relacionamento com clientes. Precisa estruturar a prospeccao.' },
      celso:   { auto: [4.0,3.0,4.0,3.5,3.5,3.0], gest: [3.5,3.0,3.5,3.5,3.0,3.0], par: [3.5,3.0,3.5,3.0,3.0,3.0], dest: ['Habilidade Tecnica','Design'], gaps: ['Comunicacao com Cliente','Prazos'], parecer: 'Celso tem dominio solido de ferramentas de design.' },
      erick:   { auto: [3.5,3.0,3.5,3.0,2.5,3.5], gest: [3.0,2.5,3.5,3.0,2.5,3.0], par: [3.0,2.5,3.0,2.5,2.5,3.0], dest: ['Criatividade','Aprendizado'], gaps: ['Habilidade Tecnica','Autonomia'], parecer: 'Erick tem potencial criativo. Precisa ampliar repertorio tecnico.' },
      dann:    { auto: [4.5,3.5,4.0,4.5,4.5,4.0], gest: [4.5,3.5,4.0,4.5,4.0,3.5], par: [4.0,3.5,3.5,4.0,4.0,4.0], dest: ['Tecnica 3D','Lideranca Tecnica'], gaps: ['Mentoria Equipe','Documentacao'], parecer: 'Danniel e a referencia tecnica da BU Digital 3D.' },
      duda:    { auto: [3.0,2.5,3.0,2.5,2.5,3.5], gest: [2.5,2.5,2.5,2.5,2.5,3.0], par: [3.0,2.5,2.5,2.5,2.5,3.0], dest: ['Aprendizado','Dedicacao'], gaps: ['Qualidade de Entrega','Autonomia'], parecer: 'Duda esta em evolucao. Foco: melhorar qualidade de entrega.' },
      tiago:   { auto: [3.5,3.0,3.0,3.5,3.0,3.0], gest: [3.5,3.0,3.0,3.5,3.0,3.0], par: [3.0,3.0,3.0,3.0,3.0,3.0], dest: ['Render Tecnico','Consistencia'], gaps: ['Criatividade','Proatividade'], parecer: 'Tiago entrega com consistencia e bom nivel tecnico.' },
      mari:    { auto: [2.5,2.5,2.5,2.0,2.0,3.0], gest: [2.5,2.0,2.5,2.0,2.0,3.0], par: [2.5,2.5,2.0,2.0,2.0,2.5], dest: ['Cultura','Vontade de Crescer'], gaps: ['Habilidade Tecnica','Qualidade'], parecer: 'Mariane esta no inicio da jornada. Tem otimo alinhamento cultural.' },
      lucca:   { auto: [3.0,3.5,3.0,3.0,3.0,3.5], gest: [2.5,3.0,2.5,2.5,2.5,3.0], par: [3.0,3.0,2.5,2.5,2.5,3.0], dest: ['Aprendizado','Marketing Digital'], gaps: ['Planejamento','Autonomia'], parecer: 'Lucca tem buscado aprendizado ativo em marketing digital.' }
    };

    const comps = this._competenciasRadar;
    const reviews = this._team.filter(t => t.lider && !t.terceirizado).map(t => {
      const p = profiles[t.id];
      if (!p) return null;
      const autoScores = comps.map((c, i) => ({ comp: c.id, nota: p.auto[i] }));
      const gestorScores = comps.map((c, i) => ({ comp: c.id, nota: p.gest[i] }));
      const paresScores = comps.map((c, i) => ({ comp: c.id, nota: p.par[i] }));
      const autoMedia = +(autoScores.reduce((s, x) => s + x.nota, 0) / 6).toFixed(2);
      const gestorMedia = +(gestorScores.reduce((s, x) => s + x.nota, 0) / 6).toFixed(2);
      const paresMedia = +(paresScores.reduce((s, x) => s + x.nota, 0) / 6).toFixed(2);
      const mediaGeral = +((autoMedia * 0.2 + gestorMedia * 0.5 + paresMedia * 0.3)).toFixed(2);
      return { id: this._genId(), cicloId: cycle2Id, pessoaId: t.id, autoScores, gestorScores, paresScores, autoMedia, gestorMedia, paresMedia, mediaGeral, destaques: p.dest, gaps: p.gaps, parecer: p.parecer };
    }).filter(Boolean);
    this._setStore('avaliacoes_people', reviews);

    // Feedbacks
    this._setStore('feedbacks', [
      { id: this._genId(), de: 'marco', para: 'nath', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Excelente gestao da BU Digital 3D. Time entregando com qualidade e dentro do prazo.', data: '2026-02-10T10:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'nelson', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa ser mais permeavel aos feedbacks em reuniao interna.', data: '2026-02-08T14:00:00Z' },
      { id: this._genId(), de: 'nath', para: 'dann', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Renders do projeto ficaram incriveis. Qualidade tecnica de referencia.', data: '2026-02-05T09:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'rafa', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Campanha de ativacao com ROAS excelente. Parabens!', data: '2026-02-01T11:00:00Z' },
      { id: this._genId(), de: 'nelson', para: 'celso', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Identidade visual do projeto ficou elegante.', data: '2026-01-28T16:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'carol', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa melhorar organizacao de pastas no Drive.', data: '2026-01-25T13:00:00Z' },
      { id: this._genId(), de: 'dann', para: 'tiago', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Boa consistencia nas entregas de renders tecnicos.', data: '2026-01-20T10:00:00Z' },
      { id: this._genId(), de: 'ruy', para: 'gustavo', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa estruturar melhor a prospeccao ativa.', data: '2026-01-18T09:00:00Z' },
      { id: this._genId(), de: 'nath', para: 'duda', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Evolucao visivel nas ultimas entregas!', data: '2026-01-15T11:00:00Z' },
      { id: this._genId(), de: 'rafa', para: 'lucca', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa planejar melhor as campanhas com antecedencia.', data: '2026-01-12T10:00:00Z' }
    ]);

    // Elogios
    this._setStore('elogios', [
      { id: this._genId(), de: 'marco', para: 'dann',   valor: 'excelencia',  mensagem: 'Qualidade dos renders e referencia para o mercado. Parabens!', curtidas: 7, data: '2026-02-12T10:00:00Z' },
      { id: this._genId(), de: 'ruy',   para: 'nath',   valor: 'ownership',   mensagem: 'Assumiu a coordenacao de toda a BU Digital 3D com maestria.', curtidas: 8, data: '2026-02-09T14:00:00Z' },
      { id: this._genId(), de: 'nath',  para: 'carol',  valor: 'colaboracao', mensagem: 'Sempre disponivel para ajudar qualquer pessoa do time.', curtidas: 5, data: '2026-02-05T11:00:00Z' },
      { id: this._genId(), de: 'rafa',  para: 'nelson', valor: 'inovacao',    mensagem: 'Conceito de branding surpreendeu o cliente na primeira apresentacao.', curtidas: 4, data: '2026-01-30T09:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'rafa',   valor: 'superacao',   mensagem: 'ROAS de campanha acima da media do mercado!', curtidas: 6, data: '2026-01-22T15:00:00Z' },
      { id: this._genId(), de: 'dann',  para: 'tiago',  valor: 'excelencia',  mensagem: 'Evolucao tecnica impressionante no ultimo trimestre.', curtidas: 3, data: '2026-01-18T10:00:00Z' },
      { id: this._genId(), de: 'nelson', para: 'erick', valor: 'inovacao',    mensagem: 'Proposta criativa surpreendeu. Pensamento fora da caixa!', curtidas: 3, data: '2026-01-15T14:00:00Z' },
      { id: this._genId(), de: 'nath',  para: 'duda',   valor: 'superacao',   mensagem: 'Do zero ao render em 3 meses. Dedicacao exemplar!', curtidas: 5, data: '2026-01-10T11:00:00Z' }
    ]);

    // 1:1s
    this._setStore('1on1s', [
      { id: this._genId(), lider: 'marco', colaborador: 'nath', data: '2026-02-14T10:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Definir processo de QA para entregas 3D', responsavel: 'nath', prazo: '2026-02-28', concluido: false },
          { id: this._genId(), texto: 'Preparar PDI de Duda e Mariane', responsavel: 'nath', prazo: '2026-03-01', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'nelson', data: '2026-02-07T14:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Garantir atualizacao dos arquivos no Drive', responsavel: 'nelson', prazo: '2026-02-15', concluido: true },
          { id: this._genId(), texto: 'Reduzir revisoes com checklist interno', responsavel: 'nelson', prazo: '2026-02-28', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'rafa', data: '2026-02-06T10:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Relatorio de performance das campanhas Q1', responsavel: 'rafa', prazo: '2026-02-20', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'carol', data: '2026-02-05T11:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Reorganizar pastas do Drive', responsavel: 'carol', prazo: '2026-02-20', concluido: true },
          { id: this._genId(), texto: 'Criar template de briefing para novos projetos', responsavel: 'carol', prazo: '2026-02-28', concluido: false }
        ]},
      { id: this._genId(), lider: 'dann', colaborador: 'tiago', data: '2026-02-10T14:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Estudar iluminacao avancada no V-Ray', responsavel: 'tiago', prazo: '2026-02-25', concluido: false }
        ]},
      { id: this._genId(), lider: 'dann', colaborador: 'duda', data: '2026-02-10T16:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Completar modulo basico de modelagem 3ds Max', responsavel: 'duda', prazo: '2026-02-28', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'nath', data: '2026-02-28T10:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'marco', colaborador: 'nelson', data: '2026-02-27T14:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'ruy', colaborador: 'gustavo', data: '2026-02-25T09:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'dann', colaborador: 'mari', data: '2026-02-24T14:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'rafa', colaborador: 'lucca', data: '2026-02-26T11:00:00Z', status: 'agendada', items: [] }
    ]);

    // Pulse survey seed
    this._setStore('pulse', [
      { data: '2026-02-14', respostas: { nath: 5, dann: 4, carol: 4, nelson: 3, rafa: 4, gustavo: 3, celso: 4, erick: 3, duda: 4, tiago: 4, mari: 3, lucca: 4 } },
      { data: '2026-02-07', respostas: { nath: 5, dann: 5, carol: 3, nelson: 4, rafa: 3, gustavo: 4, celso: 4, erick: 4, duda: 3, tiago: 4, mari: 4, lucca: 3 } },
      { data: '2026-01-31', respostas: { nath: 4, dann: 4, carol: 4, nelson: 3, rafa: 4, gustavo: 3, celso: 3, erick: 3, duda: 4, tiago: 3, mari: 3, lucca: 4 } },
      { data: '2026-01-24', respostas: { nath: 4, dann: 5, carol: 3, nelson: 4, rafa: 3, gustavo: 3, celso: 4, erick: 3, duda: 3, tiago: 4, mari: 3, lucca: 3 } }
    ]);

    this._setStore('people_seeded_v3', [true]);
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER (main entry point)
  // ══════════════════════════════════════════════════════════════════
  render() {
    // Deep link: ler tab da URL (ex: #rh/performance → _activeTab = 'performance')
    // Suporta subtabs: #rh/cultura/rituais → _activeTab = 'cultura', _culturaSubTab = 'rituais'
    const hash = (window.location.hash || '').replace('#', '');
    if (hash.startsWith('rh/')) {
      const parts = hash.split('/');
      const tabFromUrl = parts[1];
      const validTabs = ['visao-geral', 'performance', 'cultura', 'one-on-ones', 'analytics', 'banco-talentos', 'vagas', 'contratos'];
      if (validTabs.includes(tabFromUrl)) {
        this._activeTab = tabFromUrl;
      }
      // Subtab de cultura (ex: rh/cultura/rituais)
      if (tabFromUrl === 'cultura' && parts[2]) {
        const validCulturaSubs = ['valores', 'reconhecimentos', 'rituais', 'feedbacks', 'historico', 'onboarding'];
        if (validCulturaSubs.includes(parts[2])) {
          this._culturaSubTab = parts[2];
        }
      }
    }

    // v2.3: Garantir _team preenchido antes do seed data (que referencia _team)
    if (!this._team.length) this._team = [...this._teamSeed];

    this._ensureSeedData();

    // Carregar cache de teams (para filtros e resolucao de nomes)
    if (!this._teamsCache && typeof PeopleRepo !== 'undefined') {
      PeopleRepo.listTeams().then(teams => {
        this._teamsCache = teams;
        // Atualizar dropdown de BU se já renderizado
        const filterBu = document.querySelector('.rh-filter-bu');
        if (filterBu && teams.length) {
          const current = filterBu.value;
          const options = teams.filter(t => t.is_active !== false).map(t => t.name).sort();
          filterBu.innerHTML = '<option value="">Todas BUs</option>' +
            options.map(name => `<option value="${name}" ${current === name ? 'selected' : ''}>${name}</option>`).join('');
        }
      }).catch(() => {});
    }

    // v2.3: Se equipe nao foi carregada do Supabase ainda, iniciar loading assíncrono
    if (!this._teamLoaded) {
      this._loadTeamFromSupabase().then(() => {
        // Re-renderizar conteudo da tab quando dados do Supabase chegarem
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = this._renderActiveTab();
          this._initActiveTab();
        }
      });
    }

    const tab = this._activeTab;

    return `
      <div class="rh-module">
        <style>${this._getScopedCSS()}</style>
        <div id="rhTabContent">
          ${this._renderActiveTab()}
        </div>
      </div>
    `;
  },

  _renderActiveTab() {
    // Guard: impedir acesso a tabs restritas via estado direto
    if (this._activeTab === 'one-on-ones' && !this._canSee1on1s()) {
      this._activeTab = 'visao-geral';
    }
    if (this._activeTab === 'analytics' && !this._isDiretoria()) {
      this._activeTab = 'visao-geral';
    }
    if (this._activeTab === 'contratos' && !this._canSeeContracts()) {
      this._activeTab = 'visao-geral';
    }

    switch (this._activeTab) {
      case 'visao-geral':     return this._renderVisaoGeral();
      case 'banco-talentos':  return this._renderBancoTalentos();
      case 'vagas':           return this._renderVagas();
      case 'contratos':       return this._renderContratos();
      case 'performance':     return this._renderPerformance();
      case 'cultura':         return this._renderCultura();
      case 'one-on-ones':     return this._render1on1s();
      case 'analytics':       return this._renderAnalytics();
      default:                return this._renderVisaoGeral();
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 1: VISAO GERAL (Redesign v3 — Organograma + Tabela BU)
  // ══════════════════════════════════════════════════════════════════

  // Sub-view da visao geral: 'cards' (default), 'organograma', 'tabela'
  _visaoGeralView: 'tabela',
  _searchDebounceTimer: null,

  _renderVisaoGeral() {
    const team = this._getInternalTeam();
    const reviews = this._getStore('avaliacoes_people');
    const medias = reviews.map(r => r.mediaGeral).filter(Boolean);
    const mediaGeral = medias.length ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(1) : '\u2014';
    const bus = this._getBUs();
    const v = this._visaoGeralView;

    // Extrair roles RBAC unicos para filtro
    const rbacRoles = [...new Set(team.map(t => t.rbacRole).filter(Boolean))].sort();
    // Extrair status unicos
    const statuses = [...new Set(team.map(t => t.status || 'ativo'))].sort();
    // Lideres
    const leaders = team.filter(t => team.some(m => m.lider === t.id));

    // Contadores para KPIs
    const onboarding = team.filter(t => t.status === 'onboarding').length;
    const coordinators = team.filter(t => t.isCoordinator).length;

    // Paginacao info
    const totalPages = Math.ceil(this._totalCount / this._pageSize) || 1;

    // KPIs: container com skeleton, carregamento async
    const ativos = team.filter(t => t.status === 'ativo' || t.status === 'active').length;
    const ferias = team.filter(t => t.status === 'ferias' || t.status === 'vacation').length;
    const ausentes = team.filter(t => t.status === 'away' || t.status === 'ausente').length;
    const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v).toLocaleString('pt-BR', {minimumFractionDigits:0})}` };

    return `
      ${this._pageHeader('Equipe', 'Visão geral da equipe, estrutura e indicadores')}

      <div id="rhKPIContainer" class="grid-4" style="margin-bottom:24px;">
        <div class="kpi-card"><div class="kpi-label">Total Pessoas</div><div class="kpi-value">${this._totalCount || team.length}</div><div class="kpi-sub">${coordinators} coordenadores</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Ativos</div><div class="kpi-value">${ativos}</div><div class="kpi-sub">${ferias ? ferias + ' ferias' : ''}${ferias && ausentes ? ' · ' : ''}${ausentes ? ausentes + ' ausentes' : ''}${!ferias && !ausentes ? 'em operacao' : ''}</div></div>
        ${this._isAdmin() ? `<div class="kpi-card kpi-card--blue"><div class="kpi-label">Custo Mensal</div><div class="kpi-value" id="rhKPICusto"><span class="rh-skeleton" style="width:80px;height:20px;display:inline-block;border-radius:4px;"></span></div><div class="kpi-sub" id="rhKPICustoSub">carregando...</div></div>` : `<div class="kpi-card kpi-card--blue"><div class="kpi-label">BUs</div><div class="kpi-value">${bus.length}</div><div class="kpi-sub">${bus.join(', ')}</div></div>`}
        <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Performance</div><div class="kpi-value">${mediaGeral}</div><div class="kpi-sub">escala 1-5</div></div>
      </div>

      <!-- Widget Aniversariantes do Mês (P2) -->
      <div id="rhBirthdayWidget"></div>

      <!-- Toolbar: view switcher + filtros avancados -->
      <div class="card" style="margin-bottom:16px;padding:10px 16px;">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;justify-content:space-between;">
          <div style="display:flex;gap:4px;align-items:center;">
            <button class="btn btn-sm rh-view-btn ${v === 'organograma' ? 'btn-primary' : 'btn-secondary'}" data-view="organograma" title="Organograma">
              <i data-lucide="git-branch" style="width:14px;height:14px;"></i>
            </button>
            <button class="btn btn-sm rh-view-btn ${v === 'tabela' ? 'btn-primary' : 'btn-secondary'}" data-view="tabela" title="Tabela por BU">
              <i data-lucide="table-2" style="width:14px;height:14px;"></i>
            </button>
            <button class="btn btn-sm rh-view-btn ${v === 'cards' ? 'btn-primary' : 'btn-secondary'}" data-view="cards" title="Cards">
              <i data-lucide="layout-grid" style="width:14px;height:14px;"></i>
            </button>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <div style="position:relative;">
              <i data-lucide="search" style="width:13px;height:13px;position:absolute;left:8px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none;"></i>
              <input type="text" class="form-input rh-filter-search" placeholder="Buscar por nome ou email..." style="width:auto;min-width:200px;padding:5px 10px 5px 28px;font-size:0.76rem;">
            </div>
            <select class="form-input rh-filter-bu" style="width:auto;min-width:120px;padding:5px 10px;font-size:0.76rem;">
              <option value="">Todas BUs</option>
              ${bus.map(bu => `<option value="${bu}" ${this._filterSquad === bu ? 'selected' : ''}>${bu}</option>`).join('')}
            </select>
            <select class="form-input rh-filter-role" style="width:auto;min-width:110px;padding:5px 10px;font-size:0.76rem;">
              <option value="">Todos Roles</option>
              ${rbacRoles.map(r => `<option value="${r}" ${this._filterRole === r ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
            <select class="form-input rh-filter-status" style="width:auto;min-width:100px;padding:5px 10px;font-size:0.76rem;">
              <option value="">Todos Status</option>
              <option value="ativo" ${this._filterStatus === 'ativo' ? 'selected' : ''}>Ativo</option>
              <option value="ferias" ${this._filterStatus === 'ferias' ? 'selected' : ''}>Ferias</option>
              <option value="ausente" ${this._filterStatus === 'ausente' ? 'selected' : ''}>Ausente</option>
              <option value="inativo" ${this._filterStatus === 'inativo' ? 'selected' : ''}>Inativo</option>
              <option value="onboarding" ${this._filterStatus === 'onboarding' ? 'selected' : ''}>Onboarding</option>
              <option value="suspenso" ${this._filterStatus === 'suspenso' ? 'selected' : ''}>Suspenso</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Conteudo da view ativa -->
      <div id="rhVisaoGeralContent">
        ${this._renderVisaoGeralContent(team, reviews)}
      </div>

      <!-- Paginacao (so na view tabela) -->
      ${v === 'tabela' && this._totalCount > this._pageSize ? `
      <div class="card rh-pagination" style="margin-top:12px;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:0.75rem;color:var(--text-muted);">
          Mostrando ${this._page * this._pageSize + 1}–${Math.min((this._page + 1) * this._pageSize, this._totalCount)} de ${this._totalCount}
        </span>
        <div style="display:flex;gap:4px;">
          <button class="btn btn-sm btn-secondary rh-page-btn" data-page="prev" ${this._page === 0 ? 'disabled' : ''}>
            <i data-lucide="chevron-left" style="width:14px;height:14px;"></i>
          </button>
          <span style="font-size:0.78rem;padding:4px 10px;font-weight:600;">${this._page + 1} / ${totalPages}</span>
          <button class="btn btn-sm btn-secondary rh-page-btn" data-page="next" ${this._page >= totalPages - 1 ? 'disabled' : ''}>
            <i data-lucide="chevron-right" style="width:14px;height:14px;"></i>
          </button>
        </div>
      </div>` : ''}

      <!-- Drawer de detalhe (Perfil Asana-style) -->
      <div id="rhPersonDrawer" class="rh-drawer" style="display:none;"></div>

      <!-- Context menu (acoes por usuario) -->
      <div id="rhContextMenu" class="rh-context-menu" style="display:none;"></div>

      <!-- Context menu (acoes por 1:1) -->
      <div id="rh1on1ContextMenu" class="rh-context-menu" style="display:none;"></div>

      <!-- Bulk actions bar (multi-selecao 1:1) -->
      <div id="rh1on1BulkBar" style="display:none;position:fixed;bottom:0;left:50%;transform:translateX(-50%);background:var(--bg-primary);border:1px solid var(--border-subtle);border-bottom:none;border-radius:12px 12px 0 0;padding:10px 20px;align-items:center;gap:12px;z-index:100;box-shadow:0 -4px 16px rgba(0,0,0,0.12);">
        <span id="rh1on1BulkCount" style="font-size:0.8rem;font-weight:600;">0 selecionados</span>
        <button class="btn btn-sm" id="rh1on1BulkDelete" style="color:var(--color-danger);border:1px solid var(--color-danger);"><i data-lucide="trash-2" style="width:12px;height:12px;vertical-align:-2px;"></i> Excluir selecionados</button>
        <button class="btn btn-sm" id="rh1on1BulkSelectAll">Selecionar todos</button>
        <button class="btn btn-sm" id="rh1on1BulkCancel">Cancelar</button>
      </div>
    `;
  },

  _renderVisaoGeralContent(team, reviews) {
    switch (this._visaoGeralView) {
      case 'organograma': return this._renderOrganograma(team);
      case 'tabela':      return this._renderTabelaBU(team, reviews);
      case 'cards':       return this._renderPeopleCards(team, reviews);
      default:            return this._renderTabelaBU(team, reviews);
    }
  },

  // ── Organograma (Org Chart) ──────────────────────────────────────
  _renderOrganograma(team) {
    // P2: Construir árvore hierárquica usando gestorId (manager_id UUID) com fallback para lider (slug)
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
    const statusDot = { 'active': '#10B981', 'inactive': '#6B7280', 'vacation': '#F59E0B', 'away': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626' };

    // Identificar raízes: quem não tem gestor (nem gestorId nem lider)
    const roots = team.filter(t => !t.gestorId && !t.lider);

    // getChildren: prioriza gestorId (UUID match via supabaseId), fallback para lider (slug match via id)
    const getChildren = (person) => {
      return team.filter(t => {
        if (t.gestorId && person.supabaseId) return t.gestorId === person.supabaseId;
        if (t.lider) return t.lider === person.id;
        return false;
      });
    };

    const renderNode = (person, level = 0) => {
      const children = getChildren(person);
      const color = buColors[person.bu] || 'var(--accent-gold)';
      const review = this._getStore('avaliacoes_people').find(r => r.pessoaId === person.id);
      const score = review ? review.mediaGeral.toFixed(1) : '';
      const dotColor = statusDot[person.status] || statusDot['active'];
      const isExpanded = level < 2; // Expandir primeiros 2 níveis

      return `
        <div class="rh-org-node" style="cursor:pointer;">
          <div class="rh-org-card" data-person="${person.id}" style="border-left:3px solid ${color};position:relative;">
            <div style="position:absolute;top:8px;right:8px;width:8px;height:8px;border-radius:50%;background:${dotColor};" title="${person.status || 'active'}"></div>
            <div style="display:flex;align-items:center;gap:10px;">
              ${this._getAvatarHTML(person, 36, '0.8rem')}
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" data-person-id="${person.supabaseId || ''}">${this._esc(person.nome)}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._esc(person.cargo)}</div>
              </div>
              ${score ? `<div style="font-size:0.72rem;font-weight:700;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${score}</div>` : ''}
            </div>
            <div style="display:flex;gap:4px;align-items:center;margin-top:6px;">
              ${person.bu ? `<span class="tag" style="font-size:0.58rem;background:${color}15;color:${color};">${person.bu}</span>` : ''}
              ${children.length ? `<span style="font-size:0.58rem;color:var(--text-muted);margin-left:auto;">${children.length} report${children.length > 1 ? 's' : ''}</span>` : ''}
            </div>
          </div>
          ${children.length ? `
            <div class="rh-org-children ${isExpanded ? '' : 'rh-org-collapsed'}" data-parent="${person.id}">
              ${children.length ? `<div class="rh-org-connector"></div>` : ''}
              ${children.map(c => renderNode(c, level + 1)).join('')}
            </div>
            ${!isExpanded ? `<button class="btn btn-ghost btn-sm rh-org-toggle" data-toggle="${person.id}" style="font-size:0.65rem;padding:2px 8px;margin-top:4px;color:var(--text-muted);">
              <i data-lucide="chevron-down" style="width:12px;height:12px;"></i> ${children.length} reports
            </button>` : ''}
          ` : ''}
        </div>`;
    };

    // Totais para legenda
    const totalReports = team.filter(t => t.gestorId || t.lider).length;
    const maxDepth = (nodes, depth = 0) => {
      let max = depth;
      nodes.forEach(n => { const ch = getChildren(n); if (ch.length) max = Math.max(max, maxDepth(ch, depth + 1)); });
      return max;
    };
    const treeDepth = maxDepth(roots);

    return `
      <div class="card" style="padding:24px;overflow-x:auto;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <i data-lucide="git-branch" style="width:18px;height:18px;color:var(--accent-gold);"></i>
          <h3 style="font-size:0.95rem;margin:0;">Organograma TBO</h3>
          <div style="display:flex;gap:12px;margin-left:auto;align-items:center;">
            <span style="font-size:0.68rem;color:var(--text-muted);">${team.length} pessoas · ${treeDepth + 1} níveis</span>
            <div style="display:flex;gap:8px;font-size:0.62rem;">
              ${Object.entries(statusDot).slice(0, 4).map(([k, c]) => `<span style="display:flex;align-items:center;gap:3px;"><span style="width:6px;height:6px;border-radius:50%;background:${c};"></span>${k === 'active' ? 'Ativo' : k === 'vacation' ? 'Férias' : k === 'away' ? 'Ausente' : 'Inativo'}</span>`).join('')}
            </div>
          </div>
        </div>
        <div class="rh-org-tree">
          ${roots.map(r => renderNode(r)).join('')}
        </div>
      </div>`;
  },

  // ── Tabela por BU (estilo Notion) ─────────────────────────────────
  _renderTabelaBU(team, reviews) {
    const bus = this._getBUs();
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
    const statusConfig = {
      'ativo':      { label: 'Ativo',      color: 'var(--color-success)', icon: 'check-circle' },
      'active':     { label: 'Ativo',      color: 'var(--color-success)', icon: 'check-circle' },
      'onboarding': { label: 'Onboarding', color: 'var(--color-info)',    icon: 'compass' },
      'convidado':  { label: 'Convidado',  color: 'var(--color-purple, #8b5cf6)', icon: 'mail' },
      'ferias':     { label: 'Ferias',     color: 'var(--color-warning)', icon: 'sun' },
      'vacation':   { label: 'Ferias',     color: 'var(--color-warning)', icon: 'sun' },
      'ausente':    { label: 'Ausente',    color: 'var(--color-warning)', icon: 'moon' },
      'away':       { label: 'Ausente',    color: 'var(--color-warning)', icon: 'moon' },
      'suspenso':   { label: 'Suspenso',   color: 'var(--color-warning)', icon: 'pause-circle' },
      'suspended':  { label: 'Suspenso',   color: 'var(--color-warning)', icon: 'pause-circle' },
      'inativo':    { label: 'Inativo',    color: 'var(--text-muted)',    icon: 'x-circle' },
      'inactive':   { label: 'Inativo',    color: 'var(--text-muted)',    icon: 'x-circle' },
      'removido':   { label: 'Removido',   color: 'var(--color-danger)',  icon: 'user-x' }
    };

    // Sortable header helper
    const sortIcon = (col) => {
      if (this._sortBy === col) return `<i data-lucide="${this._sortDir === 'asc' ? 'chevron-up' : 'chevron-down'}" style="width:12px;height:12px;opacity:0.7;"></i>`;
      return `<i data-lucide="chevrons-up-down" style="width:11px;height:11px;opacity:0.3;"></i>`;
    };

    // Agrupar por BU (+ grupo "Diretoria" para quem nao tem BU)
    const groups = {};
    team.forEach(p => {
      const g = p.bu || 'Diretoria';
      if (!groups[g]) groups[g] = [];
      groups[g].push(p);
    });

    // Ordenar: Diretoria primeiro, depois BUs
    const sortedGroups = Object.entries(groups).sort((a, b) => {
      if (a[0] === 'Diretoria') return -1;
      if (b[0] === 'Diretoria') return 1;
      return a[0].localeCompare(b[0]);
    });

    const isAdmin = this._isAdmin();

    return `
      <div class="card rh-tabela-card" style="overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="data-table rh-bu-table" style="min-width:950px;">
            <thead>
              <tr>
                <th class="rh-sort-header" data-sort="full_name" style="min-width:200px;cursor:pointer;">
                  <div style="display:flex;align-items:center;gap:4px;">Colaborador(a) ${sortIcon('full_name')}</div>
                </th>
                <th style="min-width:130px;">Cargo</th>
                <th style="min-width:100px;">Papel RBAC</th>
                <th style="min-width:90px;">Squad/BU</th>
                ${isAdmin ? '<th style="min-width:95px;">Custo Mensal</th>' : ''}
                <th style="min-width:60px;text-align:center;">Projetos</th>
                <th class="rh-sort-header" data-sort="created_at" style="min-width:85px;cursor:pointer;">
                  <div style="display:flex;align-items:center;gap:4px;">Entrada ${sortIcon('created_at')}</div>
                </th>
                <th style="min-width:95px;">Gestor</th>
                <th style="min-width:75px;text-align:center;">Status</th>
                <th class="rh-sort-header" data-sort="updated_at" style="min-width:85px;cursor:pointer;">
                  <div style="display:flex;align-items:center;gap:4px;">Atividade ${sortIcon('updated_at')}</div>
                </th>
                ${isAdmin ? '<th style="width:40px;text-align:center;"></th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${sortedGroups.map(([groupName, members]) => {
                const color = buColors[groupName] || 'var(--accent-gold)';
                const colSpan = isAdmin ? 11 : 9;
                return `
                  <tr class="rh-bu-group-header" data-group="${groupName}">
                    <td colspan="${colSpan}" style="background:${color}08;padding:8px 16px;cursor:pointer;">
                      <div style="display:flex;align-items:center;gap:8px;">
                        <i data-lucide="chevron-down" class="rh-group-chevron" style="width:14px;height:14px;color:${color};transition:transform 0.2s;"></i>
                        <span style="font-weight:700;font-size:0.85rem;color:${color};">${groupName}</span>
                        <span style="font-size:0.72rem;color:var(--text-muted);">${members.length} pessoas</span>
                      </div>
                    </td>
                  </tr>
                  ${members.map(p => {
                    const dataEntrada = p.dataEntrada || p.dataInicio || (p.id === 'marco' || p.id === 'ruy' ? '2021-03-01' : '2024-06-01');
                    const st = statusConfig[p.status] || statusConfig['ativo'];
                    const rbacColor = p.rbacColor || '#94a3b8';
                    const gestorNome = p.gestorNome || (p.lider ? this._getPersonName(p.lider) : '\u2014');
                    const custoFmt = p.custoMensal ? (typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.currency(p.custoMensal) : `R$ ${Number(p.custoMensal).toLocaleString('pt-BR', {minimumFractionDigits:0})}`) : '\u2014';
                    return `
                    <tr class="rh-bu-row rh-person-row" data-person="${p.id}" data-group="${groupName}" data-bu="${p.bu || ''}" data-status="${p.status || 'active'}" style="cursor:pointer;">
                      <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                          ${this._getAvatarHTML(p, 32, '0.72rem')}
                          <div style="min-width:0;" data-person-id="${p.supabaseId || p.id}">
                            <div style="font-weight:600;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._esc(p.nome)}</div>
                            ${p.email ? `<div style="font-size:0.66rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._esc(p.email)}</div>` : ''}
                          </div>
                        </div>
                      </td>
                      <td style="font-size:0.78rem;">${this._esc(p.cargo)}</td>
                      <td>
                        <span class="tag" style="font-size:0.65rem;background:${rbacColor}18;color:${rbacColor};border:1px solid ${rbacColor}30;">
                          ${this._esc(p.rbacLabel || p.rbacRole || 'artist')}
                        </span>
                      </td>
                      <td style="font-size:0.78rem;">${this._esc(p.bu || 'Geral')}</td>
                      ${isAdmin ? `<td style="font-size:0.75rem;font-weight:500;color:var(--text-secondary);">${custoFmt}</td>` : ''}
                      <td style="text-align:center;font-size:0.75rem;" data-user-projects="${p.supabaseId || p.id}"><span class="rh-skeleton" style="width:20px;height:14px;display:inline-block;border-radius:3px;"></span></td>
                      <td style="font-size:0.75rem;color:var(--text-secondary);">${new Date(dataEntrada).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</td>
                      <td style="font-size:0.75rem;">${gestorNome !== '\u2014' ? `<span style="color:var(--text-secondary);" data-person-id="${p.gestorId || ''}">${this._esc(gestorNome)}</span>` : '<span style="color:var(--text-muted);">\u2014</span>'}</td>
                      <td style="text-align:center;">
                        <span class="tag" style="font-size:0.62rem;background:${st.color}18;color:${st.color};">
                          ${st.label}
                        </span>
                      </td>
                      <td style="font-size:0.72rem;color:var(--text-muted);">${p.dataEntrada ? new Date(p.dataEntrada).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '\u2014'}</td>
                      ${isAdmin ? `
                      <td style="text-align:center;">
                        <button class="btn btn-ghost btn-sm rh-action-menu-btn" data-person="${p.id}" data-name="${this._esc(p.nome)}" style="padding:2px 6px;" title="Acoes" onclick="event.stopPropagation();">
                          <i data-lucide="more-horizontal" style="width:14px;height:14px;"></i>
                        </button>
                      </td>` : ''}
                    </tr>`;
                  }).join('')}
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>`;
  },

  // ── Context menu (acoes por usuario) ───────────────────────────────
  _renderContextMenu(personId, personName, x, y) {
    const isOwner = this._isAdmin();
    const person = this._getPerson(personId);
    const isSelf = personId === this._currentUserId();

    const items = [
      { icon: 'user', label: 'Ver perfil', action: 'view_profile', always: true },
      { icon: 'shield', label: 'Alterar role RBAC', action: 'change_role', admin: true },
      { icon: 'briefcase', label: 'Alterar cargo', action: 'change_cargo', admin: true },
      { icon: 'users', label: 'Mover de squad', action: 'change_squad', admin: true },
      { icon: 'mail', label: 'Reenviar convite', action: 'resend_invite', admin: true, condition: person?.status === 'convidado' },
      { divider: true },
      { icon: 'pause-circle', label: 'Suspender', action: 'suspend', admin: true, danger: false, condition: person?.status === 'ativo' },
      { icon: 'play-circle', label: 'Reativar', action: 'reactivate', admin: true, condition: person?.status === 'suspenso' || person?.status === 'inativo' },
      { icon: 'user-x', label: 'Remover do time', action: 'remove', admin: true, danger: true, condition: !isSelf }
    ];

    const menu = document.getElementById('rhContextMenu');
    if (!menu) return;

    const filteredItems = items.filter(item => {
      if (item.divider) return true;
      if (item.condition === false) return false;
      if (item.admin && !isOwner) return false;
      return true;
    });

    menu.innerHTML = `
      <div class="rh-ctx-header" style="padding:8px 12px;border-bottom:1px solid var(--border-subtle);font-size:0.72rem;color:var(--text-muted);font-weight:600;">
        ${this._esc(personName)}
      </div>
      ${filteredItems.map(item => {
        if (item.divider) return '<div style="height:1px;background:var(--border-subtle);margin:4px 0;"></div>';
        return `
          <button class="rh-ctx-item ${item.danger ? 'rh-ctx-danger' : ''}" data-action="${item.action}" data-person="${personId}">
            <i data-lucide="${item.icon}" style="width:14px;height:14px;"></i>
            <span>${item.label}</span>
          </button>`;
      }).join('')}
    `;

    // Posicionar menu (viewport-aware)
    const menuW = 200, menuH = filteredItems.length * 36 + 40;
    const vw = window.innerWidth, vh = window.innerHeight;
    const posX = x + menuW > vw ? x - menuW : x;
    const posY = y + menuH > vh ? Math.max(8, y - menuH) : y;

    menu.style.cssText = `display:block;position:fixed;top:${posY}px;left:${posX}px;z-index:1100;min-width:${menuW}px;`;
    if (window.lucide) lucide.createIcons();

    // Fechar ao clicar fora
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 10);
  },

  // ── Handler de acoes do context menu ──────────────────────────────
  async _handleContextAction(action, personId) {
    const person = this._getPerson(personId);
    if (!person) return;

    switch (action) {
      case 'view_profile':
        TBO_ROUTER.navigate(`people/${personId}/overview`);
        break;

      case 'change_role':
        // TODO: Modal para selecionar novo role RBAC (carregado de roles table)
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Em desenvolvimento', 'Alterar role RBAC sera implementado com o Admin Portal completo.');
        break;

      case 'change_cargo':
        const newCargo = prompt(`Novo cargo para ${person.nome}:`, person.cargo);
        if (newCargo && newCargo !== person.cargo) {
          // Atualizar no Supabase se disponivel
          if (typeof TBO_SUPABASE !== 'undefined') {
            try {
              const client = TBO_SUPABASE.getClient();
              if (client && person.supabaseId) {
                await client.from('profiles').update({ role: newCargo }).eq('id', person.supabaseId);
                person.cargo = newCargo;
                if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Cargo atualizado!');
                this._refreshVisaoGeral();
                return;
              }
            } catch (e) { console.warn('[RH] Erro ao atualizar cargo:', e.message); }
          }
          person.cargo = newCargo;
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Cargo atualizado (local)');
          this._refreshVisaoGeral();
        }
        break;

      case 'change_squad':
        const bus = this._getBUs();
        const newBU = prompt(`Mover ${person.nome} para qual squad/BU?\nOpcoes: ${bus.join(', ')}`, person.bu);
        if (newBU !== null && newBU !== person.bu) {
          if (typeof TBO_SUPABASE !== 'undefined') {
            try {
              const client = TBO_SUPABASE.getClient();
              if (client && person.supabaseId) {
                await client.from('profiles').update({ bu: newBU }).eq('id', person.supabaseId);
                person.bu = newBU;
                if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Squad atualizado!');
                this._refreshVisaoGeral();
                return;
              }
            } catch (e) { console.warn('[RH] Erro ao atualizar squad:', e.message); }
          }
          person.bu = newBU;
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Squad atualizado (local)');
          this._refreshVisaoGeral();
        }
        break;

      case 'suspend':
        if (confirm(`Suspender ${person.nome}? O usuario perdera acesso ao sistema.`)) {
          if (typeof TBO_SUPABASE !== 'undefined') {
            try {
              const client = TBO_SUPABASE.getClient();
              if (client && person.supabaseId) {
                await client.from('profiles').update({ is_active: false }).eq('id', person.supabaseId);
              }
            } catch (e) { console.warn('[RH] Erro ao suspender:', e.message); }
          }
          person.status = 'suspenso';
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Usuario suspenso');
          this._refreshVisaoGeral();
        }
        break;

      case 'reactivate':
        if (typeof TBO_SUPABASE !== 'undefined') {
          try {
            const client = TBO_SUPABASE.getClient();
            if (client && person.supabaseId) {
              await client.from('profiles').update({ is_active: true }).eq('id', person.supabaseId);
            }
          } catch (e) { console.warn('[RH] Erro ao reativar:', e.message); }
        }
        person.status = 'ativo';
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Usuario reativado!');
        this._refreshVisaoGeral();
        break;

      case 'remove':
        if (confirm(`ATENCAO: Remover ${person.nome} do time? Esta acao pode ser revertida apenas pelo admin.`)) {
          if (typeof TBO_SUPABASE !== 'undefined') {
            try {
              const client = TBO_SUPABASE.getClient();
              if (client && person.supabaseId) {
                await client.from('profiles').update({ is_active: false }).eq('id', person.supabaseId);
              }
            } catch (e) { console.warn('[RH] Erro ao remover:', e.message); }
          }
          person.status = 'removido';
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Usuario removido do time');
          this._refreshVisaoGeral();
        }
        break;

      case 'resend_invite':
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.info('Em desenvolvimento', 'Reenvio de convite sera implementado com o sistema de onboarding.');
        break;
    }
  },

  // ── Refresh helper (re-renderiza conteudo da visao geral) ──────────
  _refreshVisaoGeral() {
    const content = document.getElementById('rhVisaoGeralContent');
    if (content) {
      const team = this._getInternalTeam();
      const reviews = this._getStore('avaliacoes_people');
      content.innerHTML = this._renderVisaoGeralContent(team, reviews);
      this._bindVisaoGeralContent();
      if (window.lucide) lucide.createIcons();
    }
  },

  // ── Server-side reload (para sort/filter/pagination) ──────────────
  async _reloadTeamServerSide() {
    this._teamLoaded = false;
    await this._loadTeamFromSupabase({ force: true });
    // Re-renderizar toda a visao geral (com novos dados e paginacao)
    const tabContent = document.getElementById('rhTabContent');
    if (tabContent) {
      tabContent.innerHTML = this._renderVisaoGeral();
      this._initActiveTab();
    }
  },

  // ── KPIs async (custo mensal, projetos ativos) ──────────────────────
  async _loadDashboardKPIs() {
    if (!this._isAdmin() || typeof PeopleRepo === 'undefined') return;
    try {
      const kpis = await PeopleRepo.getDashboardKPIs();
      const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v).toLocaleString('pt-BR', {minimumFractionDigits:0})}` };

      // Atualizar KPI Custo Mensal
      const custoEl = document.getElementById('rhKPICusto');
      const custoSubEl = document.getElementById('rhKPICustoSub');
      if (custoEl) custoEl.textContent = fmt.currency(kpis.custoMensalTotal);
      if (custoSubEl) {
        const equipes = kpis.custoEquipe.sort((a, b) => b.custo - a.custo).slice(0, 3);
        custoSubEl.textContent = equipes.map(e => `${e.name}: ${fmt.currency(e.custo)}`).join(' · ');
      }
    } catch (e) {
      console.warn('[RH] Erro ao carregar KPIs:', e.message);
      const custoEl = document.getElementById('rhKPICusto');
      if (custoEl) custoEl.textContent = '\u2014';
    }
  },

  // ── Projetos ativos por pessoa (async, preenche placeholders na tabela) ──
  async _loadProjectCounts() {
    if (typeof PeopleRepo === 'undefined') return;
    try {
      const userIds = this._team.map(p => p.supabaseId).filter(Boolean);
      if (!userIds.length) return;
      const counts = await PeopleRepo.getActiveProjectCounts(userIds);
      // Preencher placeholders na tabela
      document.querySelectorAll('[data-user-projects]').forEach(td => {
        const uid = td.dataset.userProjects;
        const count = counts[uid] || 0;
        td.innerHTML = count > 0
          ? `<span style="font-weight:600;color:var(--brand-primary);">${count}</span>`
          : '<span style="color:var(--text-muted);">0</span>';
      });
    } catch (e) {
      console.warn('[RH] Erro ao carregar contagem de projetos:', e.message);
      document.querySelectorAll('[data-user-projects]').forEach(td => {
        td.innerHTML = '<span style="color:var(--text-muted);">—</span>';
      });
    }
  },

  // ── Widget Aniversariantes do Mês (P2) ─────────────────────────────
  async _loadBirthdayWidget() {
    const container = document.getElementById('rhBirthdayWidget');
    if (!container) return;

    try {
      // Buscar todas as pessoas com birth_date do tenant
      const team = this._team;
      const now = new Date();
      const currentMonth = now.getMonth(); // 0-based
      const currentDay = now.getDate();

      // Filtrar aniversariantes do mês (usar birth_date dos dados carregados ou buscar)
      let birthdays = [];

      if (typeof PeopleRepo !== 'undefined') {
        // Buscar todos os profiles com birth_date
        const { data: profiles } = await PeopleRepo.listPaginated({ pageSize: 100, filterStatus: 'active' });
        birthdays = (profiles || [])
          .filter(p => p.birth_date)
          .map(p => {
            const bd = new Date(p.birth_date + 'T12:00:00');
            return { ...p, birthMonth: bd.getMonth(), birthDay: bd.getDate() };
          })
          .filter(p => p.birthMonth === currentMonth)
          .sort((a, b) => a.birthDay - b.birthDay);
      }

      if (!birthdays.length) {
        container.innerHTML = ''; // Sem aniversariantes, não mostrar widget
        return;
      }

      const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
      const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

      container.innerHTML = `
        <div class="card" style="margin-bottom:16px;padding:16px 20px;background:linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(59,130,246,0.04) 100%);border:1px solid rgba(245,158,11,0.15);">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <span style="font-size:1.2rem;">🎂</span>
            <h3 style="font-size:0.88rem;margin:0;font-weight:700;">Aniversariantes de ${monthNames[currentMonth]}</h3>
            <span class="tag" style="font-size:0.65rem;background:var(--accent-gold)15;color:var(--accent-gold);">${birthdays.length}</span>
          </div>
          <div style="display:flex;gap:12px;overflow-x:auto;padding:4px 0;">
            ${birthdays.map(p => {
              const teamName = p.teams?.name || p.bu || '';
              const color = buColors[teamName] || 'var(--accent-gold)';
              const initials = (p.full_name || '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
              const isToday = p.birthDay === currentDay;
              const isPast = p.birthDay < currentDay;

              return `
                <div style="flex-shrink:0;text-align:center;padding:10px 14px;background:${isToday ? 'var(--accent-gold)10' : 'var(--bg-elevated)'};border:1px solid ${isToday ? 'var(--accent-gold)30' : 'var(--border-subtle)'};border-radius:10px;min-width:80px;cursor:pointer;transition:border-color 0.15s;${isPast ? 'opacity:0.6;' : ''}" data-person-id="${p.id}">
                  ${p.avatar_url
                    ? `<img src="${this._esc(p.avatar_url)}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;margin-bottom:6px;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
                      + `<div style="width:36px;height:36px;border-radius:50%;background:${color}20;color:${color};display:none;align-items:center;justify-content:center;font-weight:700;font-size:0.7rem;margin:0 auto 6px;">${initials}</div>`
                    : `<div style="width:36px;height:36px;border-radius:50%;background:${color}20;color:${color};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.7rem;margin:0 auto 6px;">${initials}</div>`
                  }
                  <div style="font-size:0.72rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:80px;">${this._esc((p.full_name || '').split(' ')[0])}</div>
                  <div style="font-size:0.85rem;font-weight:800;color:${isToday ? 'var(--accent-gold)' : 'var(--text-secondary)'};">${p.birthDay}/${String(currentMonth + 1).padStart(2, '0')}</div>
                  ${isToday ? '<div style="font-size:0.58rem;color:var(--accent-gold);font-weight:700;margin-top:2px;">HOJE! 🎉</div>' : ''}
                </div>`;
            }).join('')}
          </div>
        </div>`;

      // Bind hover card nos aniversariantes
      if (typeof TBO_HOVER_CARD !== 'undefined') TBO_HOVER_CARD.bind(container);
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.warn('[RH] Erro ao carregar aniversariantes:', e.message);
      container.innerHTML = '';
    }
  },

  // ── Cards Grid (view original) ────────────────────────────────────
  _renderPeopleCards(team, reviews) {
    const cards = team.map(person => {
      const review = reviews.find(r => r.pessoaId === person.id);
      const score = review ? review.mediaGeral.toFixed(1) : '\u2014';
      const scoreColor = review ? (review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)') : 'var(--text-muted)';
      const buLabel = person.bu || 'Geral';
      const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
      const buColor = buColors[person.bu] || 'var(--text-muted)';

      return `
        <div class="rh-person-card" data-person="${person.id}" data-bu="${person.bu || ''}" data-status="${person.status || 'active'}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            ${this._getAvatarHTML(person, 40, '0.85rem')}
            <div style="flex:1;min-width:0;">
              <div style="font-weight:700;font-size:0.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._esc(person.nome)}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);">${this._esc(person.cargo)}</div>
            </div>
            <div style="text-align:center;">
              <div style="font-size:1.2rem;font-weight:800;color:${scoreColor};">${score}</div>
              <div style="font-size:0.6rem;color:var(--text-muted);">score</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
            <span class="tag" style="font-size:0.62rem;background:${buColor}15;color:${buColor};">${buLabel}</span>
            ${person.nivel ? `<span class="tag" style="font-size:0.62rem;">${this._esc(person.nivel)}</span>` : ''}
            ${person.lider ? `<span style="font-size:0.62rem;color:var(--text-muted);">lider: ${this._getPersonName(person.lider)}</span>` : '<span class="tag" style="font-size:0.62rem;background:var(--accent-gold)20;color:var(--accent-gold);">Diretor</span>'}
          </div>
        </div>`;
    }).join('');

    return `<div class="rh-people-grid" id="rhPeopleGrid">${cards}</div>`;
  },

  _renderPersonDrawer(personId) {
    const person = this._getPerson(personId);
    if (!person) return '';
    const reviews = this._getStore('avaliacoes_people');
    const review = reviews.find(r => r.pessoaId === personId);
    const feedbacks = this._getStore('feedbacks').filter(f => f.para === personId || f.de === personId);
    const elogios = this._getStore('elogios').filter(e => e.para === personId);
    const oneOnOnes = this._getStore('1on1s').filter(o => o.lider === personId || o.colaborador === personId);
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
    const buColor = buColors[person.bu] || 'var(--accent-gold)';

    // Colaboradores frequentes: quem esta na mesma BU ou compartilha 1:1s
    const colleagues = this._getInternalTeam().filter(t => t.id !== person.id && (t.bu === person.bu || t.lider === person.id || person.lider === t.id)).slice(0, 6);

    // Metas reais do PDI (person_tasks category='pdi') — carregadas async
    // Placeholder: sera preenchido por _loadPersonPDI()
    const metas = this._personPDICache?.[personId] || [];

    // Projetos reais — carregados async via _loadPersonProjects()
    const projetos = this._personProjectsCache?.[personId] || [];

    // Skills da pessoa — carregadas async via _loadPersonSkills()
    const skills = this._personSkillsCache?.[personId] || [];

    return `
      <div class="rh-drawer-content rh-profile-asana">
        <!-- Header Asana-style com banner -->
        <div class="rh-profile-header" style="background:linear-gradient(135deg, ${buColor}15 0%, ${buColor}05 100%);margin:-24px -24px 0;padding:20px 24px 16px;border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div style="display:flex;align-items:center;gap:16px;">
              ${this._getAvatarHTML(person, 72, '1.5rem')}
              <div>
                <div style="font-weight:800;font-size:1.15rem;margin-bottom:2px;">${this._esc(person.nome)}</div>
                <div style="font-size:0.82rem;color:var(--text-muted);">${this._esc(person.cargo)}</div>
                <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                  ${person.bu ? `<span class="tag" style="font-size:0.65rem;background:${buColor}15;color:${buColor};">${person.bu}</span>` : ''}
                  ${person.nivel ? `<span class="tag" style="font-size:0.65rem;">${this._esc(person.nivel)}</span>` : ''}
                  <span class="tag" style="font-size:0.65rem;background:var(--color-success)20;color:var(--color-success);">${person.status || 'ativo'}</span>
                </div>
              </div>
            </div>
            <div style="display:flex;gap:6px;flex-shrink:0;">
              ${this._isAdmin() ? `<button class="btn btn-secondary btn-sm" id="rhEditPerson" data-person="${personId}" title="Editar pessoa" style="font-size:0.68rem;padding:3px 10px;">
                <i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar
              </button>` : ''}
              <button class="btn btn-primary btn-sm" id="rhOpenFullProfile" data-person="${personId}" title="Ver perfil completo" style="font-size:0.68rem;padding:3px 10px;">
                <i data-lucide="external-link" style="width:12px;height:12px;"></i> Perfil
              </button>
              <button class="btn btn-secondary btn-sm" id="rhCloseDrawer"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
            </div>
          </div>
          ${person.email ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:8px;margin-left:88px;"><i data-lucide="mail" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px;"></i>${this._esc(person.email)}</div>` : ''}
          ${person.lider ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;margin-left:88px;"><i data-lucide="user" style="width:12px;height:12px;vertical-align:-2px;margin-right:4px;"></i>Reporta a: <strong>${this._getPersonName(person.lider)}</strong></div>` : ''}
        </div>

        <!-- Dados do Onboarding (carrega async do Supabase) -->
        <div id="rhOnboardingData" style="margin-top:16px;"></div>

        <!-- Formulario de edicao (hidden por default) -->
        <div id="rhEditPersonForm" style="display:none;margin-top:16px;padding:20px;background:var(--bg-elevated);border-radius:12px;border:1px solid var(--border-subtle);">
          <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:6px;"><i data-lucide="pencil" style="width:16px;height:16px;color:var(--accent-gold);"></i> Editar Dados</h4>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Nome Completo</label><input type="text" class="form-input" id="editFullName" value="${this._esc(person.nome || '')}" style="font-size:0.8rem;padding:8px 12px;"></div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Cargo</label><input type="text" class="form-input" id="editCargo" value="${this._esc(person.cargo || '')}" style="font-size:0.8rem;padding:8px 12px;"></div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">BU / Equipe</label>
              <select class="form-input" id="editBU" style="font-size:0.8rem;padding:8px 12px;">
                <option value="">Sem equipe</option>
                ${(this._teamsCache || []).filter(t => t.is_active !== false).map(t => `<option value="${t.id}" ${t.name === person.bu ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Status</label>
              <select class="form-input" id="editStatus" style="font-size:0.8rem;padding:8px 12px;">
                <option value="active" ${person.status === 'active' ? 'selected' : ''}>Ativo</option>
                <option value="inactive" ${person.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                <option value="vacation" ${person.status === 'vacation' ? 'selected' : ''}>Ferias</option>
                <option value="away" ${person.status === 'away' ? 'selected' : ''}>Ausente</option>
                <option value="onboarding" ${person.status === 'onboarding' ? 'selected' : ''}>Onboarding</option>
                <option value="offboarding" ${person.status === 'offboarding' ? 'selected' : ''}>Offboarding</option>
                <option value="suspended" ${person.status === 'suspended' ? 'selected' : ''}>Suspenso</option>
                <option value="desligado" ${person.status === 'desligado' ? 'selected' : ''}>Desligado</option>
              </select>
            </div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Salario PJ (R$)</label><input type="number" class="form-input" id="editSalary" value="${person.custoMensal || ''}" step="0.01" min="0" style="font-size:0.8rem;padding:8px 12px;"></div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Telefone</label><input type="text" class="form-input" id="editPhone" value="${this._esc(person.phone || '')}" style="font-size:0.8rem;padding:8px 12px;"></div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Gestor</label>
              <select class="form-input" id="editManager" style="font-size:0.8rem;padding:8px 12px;">
                <option value="">Sem gestor</option>
                ${this._getInternalTeam().filter(t => t.id !== person.id).map(t => `<option value="${t.supabaseId}" ${t.supabaseId === person.gestorId ? 'selected' : ''}>${t.nome}</option>`).join('')}
              </select>
            </div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Tipo de Contrato</label>
              <select class="form-input" id="editContractType" style="font-size:0.8rem;padding:8px 12px;">
                <option value="">Nao definido</option>
                <option value="pj" ${person.contractType === 'pj' ? 'selected' : ''}>PJ</option>
                <option value="clt" ${person.contractType === 'clt' ? 'selected' : ''}>CLT</option>
                <option value="freelancer" ${person.contractType === 'freelancer' ? 'selected' : ''}>Freelancer</option>
                <option value="estagio" ${person.contractType === 'estagio' ? 'selected' : ''}>Estagio</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:16px;">
            <button class="btn btn-primary btn-sm" id="rhSavePersonEdit" data-supabase-id="${person.supabaseId}" style="font-size:0.78rem;padding:6px 16px;"><i data-lucide="check" style="width:14px;height:14px;"></i> Salvar</button>
            <button class="btn btn-secondary btn-sm" id="rhCancelPersonEdit" style="font-size:0.78rem;padding:6px 16px;">Cancelar</button>
          </div>
        </div>

        <!-- Layout 2 colunas estilo Asana -->
        <div id="rhDrawerReadOnly" style="display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px;">

          <!-- Minhas Tarefas -->
          <div class="rh-profile-section">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
              <div style="font-weight:700;font-size:0.88rem;display:flex;align-items:center;gap:6px;">
                <i data-lucide="check-circle" style="width:16px;height:16px;color:var(--color-success);"></i> Tarefas
              </div>
              <button class="btn btn-primary btn-sm" id="rhNewPersonTask" style="font-size:0.66rem;padding:3px 10px;">+ Nova</button>
            </div>
            <div id="rhPersonTaskForm" style="display:none;margin-bottom:12px;padding:12px;background:var(--bg-primary);border-radius:var(--radius-md, 8px);border:1px solid var(--border-subtle);">
              <input type="text" class="form-input" id="ptTitle" placeholder="Titulo da tarefa..." style="font-size:0.78rem;padding:6px 10px;margin-bottom:8px;">
              <div style="display:flex;gap:8px;margin-bottom:8px;">
                <select class="form-input" id="ptPriority" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                  <option value="media">Media</option><option value="alta">Alta</option><option value="baixa">Baixa</option>
                </select>
                <select class="form-input" id="ptCategory" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                  <option value="general">Geral</option><option value="pdi">PDI</option><option value="onboarding">Onboarding</option><option value="1on1_action">Acao 1:1</option>
                </select>
                <input type="date" class="form-input" id="ptDueDate" style="font-size:0.72rem;padding:4px 8px;flex:1;">
              </div>
              <div style="display:flex;gap:8px;">
                <button class="btn btn-primary btn-sm" id="ptSave" style="font-size:0.66rem;padding:3px 10px;">Salvar</button>
                <button class="btn btn-secondary btn-sm" id="ptCancel" style="font-size:0.66rem;padding:3px 10px;">Cancelar</button>
              </div>
            </div>
            <div id="rhPersonTaskList" data-person="${personId}">
              <div style="text-align:center;padding:12px;font-size:0.72rem;color:var(--text-muted);">
                <i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Carregando...
              </div>
            </div>
          </div>

          <!-- Meus Projetos Recentes (carregado async) -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="folder" style="width:16px;height:16px;color:var(--color-info);"></i> Projetos Recentes
            </div>
            <div id="rhDrawerProjects" data-person="${personId}">
              <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando projetos...</div>
            </div>
          </div>

          <!-- Skills & Competências (carregado async) -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="zap" style="width:16px;height:16px;color:var(--color-purple, #8b5cf6);"></i> Competências
            </div>
            <div id="rhDrawerSkills" data-person="${personId}">
              <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando skills...</div>
            </div>
          </div>

          <!-- Metas / PDI (carregado async) -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="target" style="width:16px;height:16px;color:var(--accent-gold);"></i> Metas & PDI
            </div>
            <div id="rhDrawerMetas" data-person="${personId}">
              <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando metas...</div>
            </div>
          </div>

          <!-- Historico de Compensacao (carregado async) -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="trending-up" style="width:16px;height:16px;color:var(--color-success);"></i> Histórico
            </div>
            <div id="rhDrawerHistory" data-person="${personId}">
              <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;vertical-align:-2px;"></i> Carregando histórico...</div>
            </div>
          </div>

          ${review ? `
          <!-- Performance (compacto) -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--color-purple, #8b5cf6);"></i> Performance
            </div>
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:10px;">
              <div style="font-size:2rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
              <div style="flex:1;">
                ${['Auto|autoMedia|var(--color-info)', 'Gestor|gestorMedia|var(--accent-gold)', 'Pares|paresMedia|var(--color-purple, #8b5cf6)'].map(s => {
                  const [l, k, c] = s.split('|');
                  return `<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;"><span style="font-size:0.68rem;width:40px;color:var(--text-muted);">${l}</span><div style="flex:1;height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;"><div style="height:100%;width:${(review[k] / 5) * 100}%;background:${c};border-radius:2px;"></div></div><span style="font-size:0.68rem;font-weight:600;">${review[k].toFixed(1)}</span></div>`;
                }).join('')}
              </div>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${(review.destaques || []).map(d => `<span class="tag" style="font-size:0.6rem;background:var(--color-success-dim);color:var(--color-success);">${d}</span>`).join('')}
              ${(review.gaps || []).map(g => `<span class="tag" style="font-size:0.6rem;background:var(--color-warning-dim);color:var(--color-warning);">${g}</span>`).join('')}
            </div>
          </div>
          ` : ''}

          <!-- Colaboradores Frequentes -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="users" style="width:16px;height:16px;color:var(--text-muted);"></i> Colaboradores Frequentes
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px;">
              ${colleagues.map(c => `
                <div class="rh-colleague-chip rh-person-row" data-person="${c.id}" style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--bg-elevated);border-radius:20px;cursor:pointer;transition:background 0.15s;">
                  ${this._getAvatarHTML(c, 24, '0.6rem')}
                  <span style="font-size:0.72rem;font-weight:500;">${this._esc(c.nome.split(' ')[0])}</span>
                </div>
              `).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Nenhum</div>'}
            </div>
          </div>

          <!-- Academy / Elogios -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="award" style="width:16px;height:16px;color:var(--accent-gold);"></i> Reconhecimentos & Academy
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
              ${elogios.slice(0, 4).map(e => {
                const v = this._valores.find(v2 => v2.id === e.valor);
                return `<div style="display:flex;align-items:center;gap:4px;padding:4px 10px;background:var(--bg-elevated);border-radius:6px;font-size:0.72rem;">${v ? v.emoji : '\u2B50'} ${v ? v.nome : ''}</div>`;
              }).join('') || '<span style="font-size:0.72rem;color:var(--text-muted);">Nenhum reconhecimento</span>'}
            </div>
            ${review && review.destaques ? `
            <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">Habilidades desenvolvidas:</div>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">
              ${review.destaques.map(d => `<span class="tag" style="font-size:0.62rem;">${d}</span>`).join('')}
            </div>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  _renderMiniRadar(review) {
    const size = 140, cx = size / 2, cy = size / 2, r = 50;
    const comps = this._competenciasRadar;
    const n = comps.length;
    const angleStep = (2 * Math.PI) / n;
    const getPoint = (i, val) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const dist = (val / 5) * r;
      return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };
    let grid = '';
    for (let level = 1; level <= 5; level++) {
      const pts = [];
      for (let i = 0; i < n; i++) pts.push(getPoint(i, level));
      grid += `<polygon points="${pts.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--border-subtle)" stroke-width="0.5"/>`;
    }
    const gestorPts = comps.map((c, i) => getPoint(i, review.gestorScores.find(s => s.comp === c.id)?.nota || 0));
    return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:140px;margin:8px auto 0;display:block;">
      ${grid}
      <polygon points="${gestorPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(232,81,2,0.15)" stroke="var(--accent-gold)" stroke-width="1.5"/>
    </svg>`;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 2: PERFORMANCE & PDI
  // ══════════════════════════════════════════════════════════════════
  _renderPerformance() {
    const ciclos = this._getStore('ciclos');
    const reviews = this._getStore('avaliacoes_people');
    const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];

    return `
      ${this._pageHeader('Performance & PDI', 'Ciclos de avaliação, ranking e planos de desenvolvimento')}
      <div class="tab-bar tab-bar--sub" id="rhPerfSubtabs" style="margin-bottom:16px;">
        <button class="tab tab--sub active" data-subtab="perf-ciclo">Ciclo</button>
        <button class="tab tab--sub" data-subtab="perf-ranking">Ranking</button>
        <button class="tab tab--sub" data-subtab="perf-9box">9-Box</button>
        <button class="tab tab--sub" data-subtab="perf-avaliar">Avaliar</button>
      </div>
      <div class="subtab-content active" id="subtab-perf-ciclo">${this._renderCiclo(activeCycle, reviews)}</div>
      <div class="subtab-content" id="subtab-perf-ranking">${this._renderRanking(activeCycle, reviews)}</div>
      <div class="subtab-content" id="subtab-perf-9box">${this._renderNineBox(reviews)}</div>
      <div class="subtab-content" id="subtab-perf-avaliar">${this._renderAvaliarForm(activeCycle, reviews)}</div>
      <div id="rhDetailOverlay" style="display:none;"></div>
    `;
  },

  _renderCiclo(cycle, reviews) {
    if (!cycle) return '<div class="empty-state"><div class="empty-state-text">Nenhum ciclo de avaliacao</div></div>';
    const respondidos = reviews.filter(r => r.cicloId === cycle.id).length;
    const total = this._team.filter(t => t.lider && !t.terceirizado).length;
    const medias = reviews.filter(r => r.cicloId === cycle.id).map(r => r.mediaGeral);
    const mediaGeral = medias.length ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(2) : '0';
    const progresso = cycle.fases ? Math.round(cycle.fases.reduce((s, f) => s + f.progresso, 0) / cycle.fases.length) : 0;
    const statusColor = cycle.status === 'em_andamento' ? 'var(--color-info)' : 'var(--color-success)';

    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div>
            <h3 class="card-title" style="margin-bottom:4px;">${cycle.nome}</h3>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag" style="font-size:0.68rem;background:var(--color-info-dim);color:var(--color-info);">${cycle.tipo}</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">${new Date(cycle.inicio).toLocaleDateString('pt-BR')} \u2014 ${new Date(cycle.fim).toLocaleDateString('pt-BR')}</span>
              <span class="tag" style="font-size:0.68rem;background:${statusColor}20;color:${statusColor};">${cycle.status === 'em_andamento' ? 'Em andamento' : 'Finalizado'}</span>
            </div>
          </div>
        </div>
      </div>
      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">Participantes</div><div class="kpi-value">${total}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Avaliados</div><div class="kpi-value">${respondidos}</div></div>
        <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Geral</div><div class="kpi-value">${mediaGeral}</div></div>
        <div class="kpi-card"><div class="kpi-label">Progresso</div><div class="kpi-value">${progresso}%</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Fases do Ciclo</h3></div>
        <div style="padding:16px;">
          ${(cycle.fases || []).map(f => {
            const pColor = f.progresso >= 100 ? 'var(--color-success)' : f.progresso > 0 ? 'var(--color-info)' : 'var(--text-muted)';
            return `<div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
              <div style="width:180px;font-weight:600;font-size:0.82rem;">${f.nome}</div>
              <div style="flex:1;"><div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${f.progresso}%;background:${pColor};border-radius:4px;"></div></div></div>
              <div style="width:50px;text-align:right;font-size:0.82rem;font-weight:600;color:${pColor};">${f.progresso}%</div>
              <div style="width:160px;font-size:0.68rem;color:var(--text-muted);text-align:right;">${new Date(f.inicio).toLocaleDateString('pt-BR')} \u2014 ${new Date(f.fim).toLocaleDateString('pt-BR')}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  _renderRanking(cycle, reviews) {
    if (!cycle) return '<div class="empty-state"><div class="empty-state-text">Nenhum ciclo ativo</div></div>';
    const isAdmin = this._isAdmin();
    const userId = this._currentUserId();
    let cycleReviews = reviews.filter(r => r.cicloId === cycle.id);
    if (!isAdmin) cycleReviews = cycleReviews.filter(r => r.pessoaId === userId);
    cycleReviews.sort((a, b) => b.mediaGeral - a.mediaGeral);
    if (!cycleReviews.length) return '<div class="empty-state"><div class="empty-state-text">Sem avaliacoes disponiveis</div></div>';

    return `<div class="card">
      <div class="card-header"><h3 class="card-title">Ranking \u2014 ${cycle.nome}</h3></div>
      <table class="data-table"><thead><tr><th>#</th><th>Colaborador(a)</th><th>Destaques</th><th style="text-align:center;">Nota</th><th></th></tr></thead>
      <tbody>${cycleReviews.map((r, i) => {
        const p = this._getPerson(r.pessoaId);
        if (!p) return '';
        const mc = ['var(--accent-gold)', 'var(--text-secondary)', '#cd7f32'];
        return `<tr>
          <td style="font-weight:700;color:${i < 3 ? mc[i] : 'var(--text-muted)'};">${i + 1}</td>
          <td><div style="font-weight:600;font-size:0.85rem;">${p.nome}</div><div style="font-size:0.72rem;color:var(--text-muted);">${p.cargo}</div></td>
          <td>${(r.destaques || []).map(d => `<span class="tag" style="font-size:0.65rem;">${d}</span>`).join(' ')}</td>
          <td style="text-align:center;"><span style="font-size:1.1rem;font-weight:700;color:${r.mediaGeral >= 4 ? 'var(--color-success)' : r.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${r.mediaGeral.toFixed(1)}</span></td>
          <td><button class="btn btn-sm btn-secondary rh-view-person" data-person="${r.pessoaId}" data-cycle="${cycle.id}">Ver</button></td>
        </tr>`;
      }).join('')}</tbody></table></div>`;
  },

  _renderPersonDetail(personId, cycleId) {
    const reviews = this._getStore('avaliacoes_people');
    const review = reviews.find(r => r.pessoaId === personId && r.cicloId === cycleId);
    const person = this._getPerson(personId);
    if (!review || !person) return '<div class="empty-state"><div class="empty-state-text">Avaliacao nao encontrada</div></div>';
    const radarSvg = this._renderRadarSVG(review);

    return `
      <button class="btn btn-secondary btn-sm" id="rhBackToList" style="margin-bottom:12px;"><i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar</button>
      <div class="grid-3" style="gap:16px;margin-bottom:20px;align-items:start;">
        <div class="card" style="padding:20px;text-align:center;">
          <div style="display:flex;justify-content:center;margin-bottom:12px;">${this._getAvatarHTML(person, 56, '1.2rem')}</div>
          <div style="font-weight:700;">${this._esc(person.nome)}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">${this._esc(person.cargo)}</div>
          <div style="font-size:2rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;">Notas por Fonte</h4>
          ${['Auto|autoMedia|var(--color-info)', 'Gestor|gestorMedia|var(--accent-gold)', 'Pares|paresMedia|var(--color-purple)'].map(s => { const [l, k, c] = s.split('|'); return `<div style="margin-bottom:12px;"><div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;"><span>${l}</span><strong>${review[k].toFixed(1)}</strong></div><div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(review[k] / 5) * 100}%;background:${c};border-radius:3px;"></div></div></div>`; }).join('')}
        </div>
        <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:12px;">Radar</h4>${radarSvg}</div>
      </div>
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:10px;color:var(--color-success);">Destaques</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">${(review.destaques || []).map(d => `<span class="tag" style="background:var(--color-success-dim);color:var(--color-success);">${d}</span>`).join('')}</div></div>
        <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:10px;color:var(--color-warning);">Gaps</h4><div style="display:flex;flex-wrap:wrap;gap:6px;">${(review.gaps || []).map(g => `<span class="tag" style="background:var(--color-warning-dim);color:var(--color-warning);">${g}</span>`).join('')}</div></div>
      </div>
      <div class="card" style="padding:20px;"><h4 style="font-size:0.85rem;margin-bottom:8px;">Parecer do Gestor</h4><p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0;">${this._esc(review.parecer)}</p></div>
    `;
  },

  _renderRadarSVG(review) {
    const size = 200, cx = 100, cy = 100, r = 70;
    const comps = this._competenciasRadar;
    const n = comps.length;
    const step = (2 * Math.PI) / n;
    const pt = (i, v) => { const a = -Math.PI / 2 + i * step; return { x: cx + (v / 5) * r * Math.cos(a), y: cy + (v / 5) * r * Math.sin(a) }; };
    let grid = '', axes = '';
    for (let l = 1; l <= 5; l++) { const ps = []; for (let i = 0; i < n; i++) ps.push(pt(i, l)); grid += `<polygon points="${ps.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--border-subtle)" stroke-width="0.5"/>`; }
    for (let i = 0; i < n; i++) { const p = pt(i, 5.5); const p2 = pt(i, 5); axes += `<line x1="${cx}" y1="${cy}" x2="${p2.x}" y2="${p2.y}" stroke="var(--border-subtle)" stroke-width="0.5"/><text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-muted)" font-size="7">${comps[i].nome}</text>`; }
    const gPts = comps.map((c, i) => pt(i, review.gestorScores.find(s => s.comp === c.id)?.nota || 0));
    const aPts = comps.map((c, i) => pt(i, review.autoScores.find(s => s.comp === c.id)?.nota || 0));
    return `<svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:220px;margin:0 auto;display:block;">${grid}${axes}<polygon points="${aPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(58,123,213,0.15)" stroke="var(--color-info)" stroke-width="1.5"/><polygon points="${gPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(232,81,2,0.15)" stroke="var(--accent-gold)" stroke-width="1.5"/>${gPts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="var(--accent-gold)"/>`).join('')}</svg>
    <div style="display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:0.68rem;"><span><span style="display:inline-block;width:10px;height:3px;background:var(--accent-gold);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Gestor</span><span><span style="display:inline-block;width:10px;height:3px;background:var(--color-info);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Auto</span></div>`;
  },

  _renderNineBox(reviews) {
    if (!this._isAdmin()) return '<div class="empty-state"><div class="empty-state-text">Acesso restrito a gestores</div></div>';
    const ciclos = this._getStore('ciclos');
    const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];
    if (!activeCycle) return '<div class="empty-state"><div class="empty-state-text">Nenhum ciclo ativo</div></div>';
    const cr = reviews.filter(r => r.cicloId === activeCycle.id);
    const data = cr.map(r => {
      const p = this._getPerson(r.pessoaId);
      const potComps = ['criatividade', 'aprendizado', 'produtividade'];
      const potScores = r.gestorScores.filter(s => potComps.includes(s.comp));
      const pot = potScores.length ? +(potScores.reduce((a, b) => a + b.nota, 0) / potScores.length).toFixed(1) : r.gestorMedia;
      return { person: p, desemp: r.gestorMedia, potencial: pot };
    });
    const cls = (v) => v >= 4 ? 'high' : v >= 3 ? 'med' : 'low';
    const boxes = {
      'high-low': { label: 'Enigma', color: 'var(--color-warning)', people: [] }, 'high-med': { label: 'Forte Desemp.', color: 'var(--color-info)', people: [] }, 'high-high': { label: 'Estrela', color: 'var(--color-success)', people: [] },
      'med-low': { label: 'Questionavel', color: 'var(--color-danger)', people: [] }, 'med-med': { label: 'Mantenedor', color: 'var(--text-secondary)', people: [] }, 'med-high': { label: 'Futuro Lider', color: 'var(--color-purple)', people: [] },
      'low-low': { label: 'Insuficiente', color: 'var(--color-danger)', people: [] }, 'low-med': { label: 'Eficaz', color: 'var(--color-warning)', people: [] }, 'low-high': { label: 'Especialista', color: 'var(--color-info)', people: [] }
    };
    data.forEach(d => { const k = `${cls(d.potencial)}-${cls(d.desemp)}`; if (boxes[k]) boxes[k].people.push(d.person); });
    const rows = ['high', 'med', 'low'], cols = ['low', 'med', 'high'];
    const potL = { high: 'Alto', med: 'Medio', low: 'Baixo' }, desL = { low: 'Baixo', med: 'Medio', high: 'Alto' };
    return `<div class="card"><div class="card-header"><h3 class="card-title">Matriz 9-Box \u2014 ${activeCycle.nome}</h3></div><div style="padding:16px;">
      <div style="display:flex;margin-bottom:8px;"><div style="width:60px;"></div>${cols.map(c => `<div style="flex:1;text-align:center;font-size:0.72rem;font-weight:600;color:var(--text-muted);">${desL[c]}</div>`).join('')}</div>
      <div style="font-size:0.68rem;color:var(--text-muted);text-align:center;margin-bottom:4px;">\u2192 Desempenho</div>
      ${rows.map(row => `<div style="display:flex;margin-bottom:2px;"><div style="width:60px;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:600;color:var(--text-muted);writing-mode:vertical-rl;transform:rotate(180deg);">Pot. ${potL[row]}</div>
        ${cols.map(col => { const b = boxes[`${row}-${col}`]; return `<div style="flex:1;min-height:80px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);margin:1px;padding:8px;background:${b.color}10;"><div style="font-size:0.65rem;font-weight:600;color:${b.color};margin-bottom:4px;">${b.label}</div>${b.people.map(p => `<div style="font-size:0.72rem;">${p ? p.nome : ''}</div>`).join('')}${!b.people.length ? '<div style="font-size:0.65rem;color:var(--text-muted);">\u2014</div>' : ''}</div>`; }).join('')}
      </div>`).join('')}
    </div></div>`;
  },

  _renderAvaliarForm(cycle, reviews) {
    if (!cycle || cycle.status === 'finalizado') return '<div class="empty-state"><div class="empty-state-text">Ciclo finalizado.</div></div>';
    const targets = this._isAdmin() ? this._team.filter(t => t.lider && !t.terceirizado) : this._team.filter(t => t.lider && !t.terceirizado && t.lider === this._currentUserId());
    return `<div class="card"><div class="card-header"><h3 class="card-title">Formulario de Avaliacao</h3></div><div style="padding:16px;">
      <div class="form-group" style="max-width:400px;margin-bottom:16px;"><label class="form-label">Colaborador(a)</label><select class="form-input" id="avalTarget"><option value="">Selecione...</option>${targets.map(t => `<option value="${t.supabaseId || t.id}" data-username="${t.id}">${t.nome} \u2014 ${t.cargo}</option>`).join('')}</select></div>
      <div id="avalFormFields" style="display:none;">
        <div style="font-size:0.82rem;font-weight:600;margin-bottom:12px;">Notas por Competencia (1 a 5)</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:16px;">
          ${this._competenciasRadar.map(c => `<div style="display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-elevated);border-radius:8px;"><span style="font-size:0.82rem;flex:1;font-weight:500;">${c.nome}</span><div style="display:flex;gap:3px;">${[1,2,3,4,5].map(n => `<button class="aval-score-btn" data-comp="${c.id}" data-score="${n}" style="width:30px;height:30px;border:1px solid var(--border-default);border-radius:4px;background:var(--bg-primary);font-size:0.75rem;cursor:pointer;">${n}</button>`).join('')}</div></div>`).join('')}
        </div>
        <div class="form-group" style="margin-bottom:16px;"><label class="form-label">Parecer</label><textarea class="form-input" id="avalParecer" rows="3" placeholder="Parecer descritivo..."></textarea></div>
        <button class="btn btn-primary" id="avalSubmit">Submeter</button>
      </div>
    </div></div>`;
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 3: CULTURA & RECONHECIMENTO
  // ══════════════════════════════════════════════════════════════════
  // Sub-view ativa na tab Cultura (para deep link via sidebar)
  _culturaSubTab: 'valores',

  // Cache de dados Supabase para Cultura (evita re-fetch durante subtab switch)
  _culturaElogiosCache: null,
  _culturaFeedbacksCache: null,

  _renderCultura() {
    const elogios = this._culturaElogiosCache || this._getStore('elogios');
    const feedbacks = this._culturaFeedbacksCache || this._getStore('feedbacks');
    const userId = this._currentUserId();
    const isAdmin = this._isAdmin();
    const sub = this._culturaSubTab || 'valores';

    // Carregar dados do Supabase async (atualiza cache e re-renderiza)
    this._loadCulturaFromSupabase();

    return `
      ${this._pageHeader('Cultura & Reconhecimento', 'Valores, reconhecimentos, rituais e feedbacks')}
      <div class="tab-bar tab-bar--sub" id="rhCulturaSubtabs" style="margin-bottom:16px;">
        <button class="tab tab--sub ${sub === 'valores' ? 'active' : ''}" data-cultura-tab="valores"><i data-lucide="gem" style="width:14px;height:14px;"></i> Valores TBO</button>
        <button class="tab tab--sub ${sub === 'reconhecimentos' ? 'active' : ''}" data-cultura-tab="reconhecimentos"><i data-lucide="award" style="width:14px;height:14px;"></i> Reconhecimentos</button>
        <button class="tab tab--sub ${sub === 'rituais' ? 'active' : ''}" data-cultura-tab="rituais"><i data-lucide="repeat" style="width:14px;height:14px;"></i> Rituais</button>
        <button class="tab tab--sub ${sub === 'feedbacks' ? 'active' : ''}" data-cultura-tab="feedbacks"><i data-lucide="message-square" style="width:14px;height:14px;"></i> Feedbacks</button>
        <button class="tab tab--sub ${sub === 'historico' ? 'active' : ''}" data-cultura-tab="historico"><i data-lucide="clock" style="width:14px;height:14px;"></i> Historico</button>
        <button class="tab tab--sub ${sub === 'onboarding' ? 'active' : ''}" data-cultura-tab="onboarding"><i data-lucide="book-open" style="width:14px;height:14px;"></i> Onboarding</button>
      </div>
      <div id="rhCulturaContent">
        ${this._renderCulturaSubTab(sub, elogios, feedbacks, userId, isAdmin)}
      </div>
    `;
  },

  /**
   * Carrega elogios e feedbacks do Supabase e atualiza cache.
   * Re-renderiza conteudo Cultura quando dados chegam.
   */
  async _loadCulturaFromSupabase() {
    try {
      // Carregar elogios do Supabase
      if (typeof RecognitionsRepo !== 'undefined') {
        const { data: recs } = await RecognitionsRepo.list({ limit: 200 });
        // Mapear para formato compativel com render existente
        this._culturaElogiosCache = (recs || []).map(r => ({
          id: r.id,
          de: this._findUsernameBySupabaseId(r.from_user) || r.from_user,
          para: this._findUsernameBySupabaseId(r.to_user) || r.to_user,
          valor: r.value_id,
          mensagem: r.message,
          curtidas: r.likes || 0,
          data: r.created_at,
          _supabase: true
        }));
      }

      // Carregar feedbacks do Supabase
      if (typeof FeedbacksRepo !== 'undefined') {
        const { data: fbs } = await FeedbacksRepo.list({ limit: 200 });
        this._culturaFeedbacksCache = (fbs || []).map(f => ({
          id: f.id,
          de: this._findUsernameBySupabaseId(f.from_user) || f.from_user,
          para: this._findUsernameBySupabaseId(f.to_user) || f.to_user,
          tipo: f.type,
          visibilidade: f.visibility === 'public' ? 'publico' : 'privado',
          mensagem: f.message,
          data: f.created_at,
          _supabase: true
        }));
      }

      // Re-renderizar conteudo se estiver na tab cultura
      if (this._activeTab === 'cultura') {
        const content = document.getElementById('rhCulturaContent');
        if (content) {
          const sub = this._culturaSubTab || 'valores';
          content.innerHTML = this._renderCulturaSubTab(sub);
          if (window.lucide) lucide.createIcons({ root: content });
          this._bindCulturaContent();
          if (sub === 'onboarding') this._loadOnboardingData();
        }
      }
    } catch (e) {
      console.warn('[RH] Erro ao carregar dados de Cultura do Supabase:', e.message);
      // Fallback silencioso — usa localStorage
    }
  },

  /**
   * Helper: encontra username a partir de supabaseId
   */
  _findUsernameBySupabaseId(supabaseId) {
    const person = this._team.find(t => t.supabaseId === supabaseId);
    return person ? person.id : null;
  },

  /**
   * Helper: encontra supabaseId a partir de username
   */
  _findSupabaseIdByUsername(username) {
    const person = this._team.find(t => t.id === username);
    return person ? person.supabaseId : null;
  },

  _renderCulturaSubTab(sub, elogios, feedbacks, userId, isAdmin) {
    // Carregar dados: preferir cache Supabase, fallback localStorage
    if (!elogios) elogios = this._culturaElogiosCache || this._getStore('elogios');
    if (!feedbacks) feedbacks = this._culturaFeedbacksCache || this._getStore('feedbacks');
    if (!userId) userId = this._currentUserId();
    if (isAdmin === undefined) isAdmin = this._isAdmin();

    switch (sub) {
      case 'valores': return this._renderCulturaValores(elogios);
      case 'reconhecimentos': return this._renderCulturaReconhecimentos(elogios);
      case 'rituais': return this._renderCulturaRituais();
      case 'feedbacks': return this._renderCulturaFeedbacks(feedbacks, userId, isAdmin);
      case 'historico': return this._renderCulturaHistorico(elogios, feedbacks);
      case 'onboarding': return this._renderCulturaOnboarding(userId);
      default: return this._renderCulturaValores(elogios);
    }
  },

  // ── Sub: Valores TBO ──
  _renderCulturaValores(elogios) {
    const valorCount = {};
    elogios.forEach(e => { valorCount[e.valor] = (valorCount[e.valor] || 0) + 1; });
    const totalElogios = elogios.length;

    return `
      <div class="card" style="padding:20px;margin-bottom:16px;">
        <h3 style="font-size:1rem;margin-bottom:16px;">Nossos Valores</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;">
          ${this._valores.map(v => {
            const count = valorCount[v.id] || 0;
            const pct = totalElogios ? Math.round((count / totalElogios) * 100) : 0;
            return `<div style="background:var(--bg-elevated);border-radius:12px;padding:16px;text-align:center;border:1px solid var(--border-subtle);">
              <div style="font-size:2.2rem;margin-bottom:8px;">${v.emoji}</div>
              <div style="font-weight:700;font-size:0.9rem;margin-bottom:4px;">${v.nome}</div>
              <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">${count} reconhecimento${count !== 1 ? 's' : ''}</div>
              <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:var(--accent-gold);border-radius:2px;transition:width 0.5s;"></div>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>
      <div class="card" style="padding:20px;">
        <h4 style="font-size:0.9rem;margin-bottom:12px;">O que cada valor significa</h4>
        <div style="display:grid;gap:12px;">
          ${[
            { v: this._valores[0], desc: 'Buscamos a melhor qualidade em cada entrega. Detalhes importam.' },
            { v: this._valores[1], desc: 'O sucesso do cliente e o nosso sucesso. Entendemos antes de executar.' },
            { v: this._valores[2], desc: 'Trabalhamos juntos, compartilhamos conhecimento e celebramos conquistas.' },
            { v: this._valores[3], desc: 'Experimentamos, erramos rapido e melhoramos. Status quo e nosso inimigo.' },
            { v: this._valores[4], desc: 'Cada um e dono do seu trabalho. Assumimos responsabilidades com orgulho.' },
            { v: this._valores[5], desc: 'Vamos alem do esperado. Entregamos mais do que foi pedido.' }
          ].map(({ v, desc }) => `<div style="display:flex;gap:12px;align-items:flex-start;padding:12px;background:var(--bg-elevated);border-radius:8px;">
            <span style="font-size:1.4rem;">${v.emoji}</span>
            <div><div style="font-weight:600;font-size:0.85rem;margin-bottom:2px;">${v.nome}</div><div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${desc}</div></div>
          </div>`).join('')}
        </div>
      </div>
    `;
  },

  // ── Sub: Reconhecimentos (mural de elogios) ──
  _renderCulturaReconhecimentos(elogios) {
    const personCount = {};
    elogios.forEach(e => { personCount[e.para] = (personCount[e.para] || 0) + 1; });
    const topPeople = Object.entries(personCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    return `
      <div class="card" style="padding:16px;margin-bottom:16px;">
        <h4 style="font-size:0.85rem;margin-bottom:10px;">Mais Reconhecidos</h4>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          ${topPeople.map(([id, count], i) => {
            const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
            const p = this._getPerson(id);
            const avatar = this._profileMap[p?.supabaseId]?.avatar_url;
            return `<div style="text-align:center;min-width:80px;">
              <div style="width:48px;height:48px;border-radius:50%;background:var(--bg-tertiary);margin:0 auto 6px;display:flex;align-items:center;justify-content:center;font-size:1.2rem;overflow:hidden;">
                ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;">` : medals[i] || (i + 1)}
              </div>
              <div style="font-size:0.78rem;font-weight:600;">${this._getPersonName(id)}</div>
              <div style="font-size:0.68rem;color:var(--accent-gold);">${count} elogio${count !== 1 ? 's' : ''}</div>
            </div>`;
          }).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum elogio ainda</div>'}
        </div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Mural de Elogios</h3><button class="btn btn-primary btn-sm" id="rhNewElogio">+ Elogiar</button></div>
        <div id="rhElogioForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Para</label><select class="form-input" id="elPara">${this._team.filter(t => !t.terceirizado).map(t => `<option value="${t.supabaseId || t.id}" data-username="${t.id}">${t.nome}</option>`).join('')}</select></div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Valor TBO</label><select class="form-input" id="elValor">${this._valores.map(v => `<option value="${v.id}">${v.emoji} ${v.nome}</option>`).join('')}</select></div>
          </div>
          <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Mensagem</label><textarea class="form-input" id="elTexto" rows="2" placeholder="Por que esta pessoa merece reconhecimento?"></textarea></div>
          <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="elSave">Publicar</button><button class="btn btn-secondary btn-sm" id="elCancel">Cancelar</button></div>
        </div>
        <div id="rhElogioList" style="max-height:500px;overflow-y:auto;">
          ${this._renderElogioItems(elogios)}
        </div>
      </div>
    `;
  },

  // ── Sub: Rituais ──
  _renderCulturaRituais() {
    const rituais = [
      { nome: 'Daily Socios', freq: 'Diaria', desc: 'Alinhamento rapido entre fundadores sobre prioridades do dia.', icon: 'sun', color: '#F59E0B' },
      { nome: '1:1 Mensal', freq: 'Mensal', desc: 'Conversa individual de PDI e feedback bidirecional entre gestor e liderado.', icon: 'users', color: '#3B82F6' },
      { nome: 'Review Semanal', freq: 'Semanal', desc: 'Revisao de entregas por BU com alinhamento de qualidade e prazos.', icon: 'check-circle', color: '#10B981' },
      { nome: 'Retrospectiva', freq: 'Mensal', desc: 'O que foi bem, o que melhorar e acoes concretas para o proximo ciclo.', icon: 'refresh-ccw', color: '#8B5CF6' },
      { nome: 'All Hands', freq: 'Trimestral', desc: 'Reuniao geral: resultados do trimestre, visao e proximos passos.', icon: 'megaphone', color: '#EC4899' },
      { nome: 'Celebracao de Entregas', freq: 'Semanal', desc: 'Reconhecimento publico das melhores entregas da semana.', icon: 'party-popper', color: '#F59E0B' },
      { nome: 'Cafe com a Diretoria', freq: 'Mensal', desc: 'Conversa informal entre qualquer membro e os co-CEOs, sem pauta fixa.', icon: 'coffee', color: '#92400E' }
    ];

    return `
      <div class="card" style="padding:20px;">
        <h3 style="font-size:1rem;margin-bottom:16px;">Rituais da TBO</h3>
        <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:20px;line-height:1.5;">
          Rituais sao a espinha dorsal da nossa cultura. Eles garantem alinhamento, feedback continuo e celebracao de conquistas.
        </p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;">
          ${rituais.map(r => `<div style="padding:16px;background:var(--bg-elevated);border-radius:12px;border-left:4px solid ${r.color};">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <div style="width:36px;height:36px;border-radius:8px;background:${r.color}15;display:flex;align-items:center;justify-content:center;">
                <i data-lucide="${r.icon}" style="width:18px;height:18px;color:${r.color};"></i>
              </div>
              <div>
                <div style="font-weight:700;font-size:0.88rem;">${r.nome}</div>
                <span class="tag" style="font-size:0.62rem;background:${r.color}20;color:${r.color};">${r.freq}</span>
              </div>
            </div>
            <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${r.desc}</div>
          </div>`).join('')}
        </div>
      </div>
    `;
  },

  // ── Sub: Feedbacks ──
  _renderCulturaFeedbacks(feedbacks, userId, isAdmin) {
    let filteredFb = feedbacks;
    if (!isAdmin) filteredFb = feedbacks.filter(f => f.de === userId || f.para === userId || f.visibilidade === 'publico');

    const positivos = filteredFb.filter(f => f.tipo === 'positivo').length;
    const construtivos = filteredFb.filter(f => f.tipo === 'construtivo').length;

    return `
      <div class="grid-3" style="gap:12px;margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Total Feedbacks</div><div class="kpi-value">${filteredFb.length}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Positivos</div><div class="kpi-value">${positivos}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Construtivos</div><div class="kpi-value">${construtivos}</div></div>
      </div>
      <div class="card">
        <div class="card-header"><h3 class="card-title">Feedbacks</h3><button class="btn btn-primary btn-sm" id="rhNewFeedback">+ Feedback</button></div>
        <div id="rhFeedbackForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Para</label><select class="form-input" id="fbPara">${this._team.filter(t => !t.terceirizado).map(t => `<option value="${t.supabaseId || t.id}" data-username="${t.id}">${t.nome}</option>`).join('')}</select></div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Tipo</label><select class="form-input" id="fbTipo"><option value="positivo">Positivo</option><option value="construtivo">Construtivo</option></select></div>
          </div>
          <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Mensagem</label><textarea class="form-input" id="fbTexto" rows="2" placeholder="Descreva o feedback..."></textarea></div>
          <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="fbSave">Enviar</button><button class="btn btn-secondary btn-sm" id="fbCancel">Cancelar</button></div>
        </div>
        <div id="rhFeedbackList" style="max-height:500px;overflow-y:auto;">
          ${this._renderFeedbackItems(filteredFb)}
        </div>
      </div>
    `;
  },

  // ── Sub: Historico Cultural ──
  _renderCulturaHistorico(elogios, feedbacks) {
    // Unificar elogios e feedbacks em timeline
    const events = [];
    elogios.forEach(e => {
      const v = this._valores.find(v2 => v2.id === e.valor);
      events.push({
        type: 'elogio',
        date: new Date(e.data),
        emoji: v?.emoji || '\u2B50',
        title: `${this._getPersonName(e.de)} reconheceu ${this._getPersonName(e.para)}`,
        detail: `${v?.nome || 'Valor'}: ${this._esc(e.mensagem)}`,
        color: '#F59E0B'
      });
    });
    feedbacks.forEach(f => {
      events.push({
        type: 'feedback',
        date: new Date(f.data),
        emoji: f.tipo === 'positivo' ? '\u{1F44D}' : '\u{1F4AC}',
        title: `Feedback ${f.tipo} de ${this._getPersonName(f.de)} para ${this._getPersonName(f.para)}`,
        detail: this._esc(f.mensagem),
        color: f.tipo === 'positivo' ? '#10B981' : '#F59E0B'
      });
    });
    events.sort((a, b) => b.date - a.date);

    // Agrupar por mes
    const byMonth = {};
    events.forEach(ev => {
      const key = ev.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      if (!byMonth[key]) byMonth[key] = [];
      byMonth[key].push(ev);
    });

    return `
      <div class="card" style="padding:20px;">
        <h3 style="font-size:1rem;margin-bottom:16px;">Timeline Cultural</h3>
        ${Object.entries(byMonth).length ? Object.entries(byMonth).map(([month, items]) => `
          <div style="margin-bottom:20px;">
            <div style="font-size:0.78rem;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:12px;letter-spacing:0.5px;">${month}</div>
            ${items.map(ev => `<div style="display:flex;gap:12px;margin-bottom:12px;padding-left:8px;border-left:3px solid ${ev.color};">
              <div style="font-size:1.2rem;flex-shrink:0;margin-top:2px;">${ev.emoji}</div>
              <div style="flex:1;">
                <div style="font-size:0.82rem;font-weight:600;">${ev.title}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);line-height:1.5;margin-top:2px;">${ev.detail}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">${ev.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>`).join('')}
          </div>
        `).join('') : '<div style="font-size:0.82rem;color:var(--text-muted);padding:20px;text-align:center;">Nenhum evento cultural registrado ainda.</div>'}
      </div>
    `;
  },

  // ── Sub: Onboarding Cultural (dinamico via OnboardingRepo) ──
  _renderCulturaOnboarding(userId) {
    // Container placeholder — dados carregados async
    return `
      <div id="rhOnboardingContainer">
        <div class="card" style="padding:20px;margin-bottom:16px;">
          <h3 style="font-size:1rem;margin-bottom:8px;">Bem-vindo(a) a Cultura TBO</h3>
          <p style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;margin-bottom:16px;">
            A TBO e movida por pessoas que se importam com qualidade, colaboracao e inovacao.
            Este guia te ajuda a entender e viver nossa cultura desde o primeiro dia.
          </p>
          <div id="rhOnboardingProgress" style="margin-bottom:8px;">
            <div style="font-size:0.72rem;color:var(--text-muted);">Carregando etapas...</div>
          </div>
        </div>
        <div id="rhOnboardingSteps" class="card" style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h4 style="font-size:0.9rem;">Jornada de Onboarding</h4>
            ${this._isAdmin() ? '<button id="rhOnboardingManage" class="btn-secondary" style="font-size:0.72rem;padding:4px 10px;"><i data-lucide="settings" style="width:12px;height:12px;"></i> Gerenciar Templates</button>' : ''}
          </div>
          <div id="rhOnboardingStepsList" style="display:grid;gap:12px;">
            <div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:20px;">
              <i data-lucide="loader" style="width:20px;height:20px;animation:spin 1s linear infinite;"></i>
              <div style="margin-top:8px;">Carregando etapas de onboarding...</div>
            </div>
          </div>
        </div>

        <!-- Offboarding Section (admin only) -->
        ${this._isAdmin() ? `
        <div class="card" style="padding:20px;margin-top:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h4 style="font-size:0.9rem;"><i data-lucide="user-minus" style="width:16px;height:16px;"></i> Offboarding Ativo</h4>
          </div>
          <div id="rhOffboardingList" style="display:grid;gap:12px;">
            <div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:10px;">Carregando...</div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
  },

  // ── Carregar dados de onboarding async apos render ──
  async _loadOnboardingData() {
    if (typeof OnboardingRepo === 'undefined') {
      const container = document.getElementById('rhOnboardingStepsList');
      if (container) container.innerHTML = '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:20px;">OnboardingRepo nao disponivel</div>';
      return;
    }

    try {
      // Buscar pessoas em onboarding
      const onboardingPeople = this._team.filter(p => p.status === 'onboarding');
      const offboardingPeople = this._team.filter(p => p.status === 'offboarding');

      // Se nao ha ninguem em onboarding, mostrar template de preview
      if (!onboardingPeople.length) {
        await this._renderOnboardingTemplate();
      } else {
        // Mostrar progresso real de cada pessoa em onboarding
        await this._renderOnboardingActive(onboardingPeople);
      }

      // Offboarding (admin)
      if (this._isAdmin() && offboardingPeople.length) {
        await this._renderOffboardingActive(offboardingPeople);
      } else {
        const offList = document.getElementById('rhOffboardingList');
        if (offList) offList.innerHTML = '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:10px;">Nenhum offboarding ativo</div>';
      }

      // Progresso geral
      await this._renderOnboardingKPIs();

      // Bind: Gerenciar Templates
      this._bind('rhOnboardingManage', () => this._openOnboardingTemplateEditor());

    } catch (e) {
      console.warn('[RH Onboarding] Erro ao carregar:', e.message);
    }

    if (window.lucide) lucide.createIcons();
  },

  // ── Renderizar template de preview (quando ninguem esta em onboarding) ──
  async _renderOnboardingTemplate() {
    const stepsList = document.getElementById('rhOnboardingStepsList');
    if (!stepsList) return;

    let template = null;
    try {
      template = await OnboardingRepo.getDefaultTemplate('onboarding');
    } catch { /* sem template */ }

    if (!template || !template.steps?.length) {
      // Fallback: steps culturais estaticos
      const fallbackSteps = [
        { title: 'Conheca os Valores', description: 'Leia e entenda os 6 valores que guiam tudo na TBO.', order: 1 },
        { title: 'Mural de Reconhecimento', description: 'Veja como reconhecemos colegas. Voce tambem pode elogiar desde o dia 1!', order: 2 },
        { title: 'Participe dos Rituais', description: 'Dailys, reviews e retrospectivas — sua presenca faz a diferenca.', order: 3 },
        { title: 'Primeira 1:1 com seu Gestor', description: 'Conversa para alinhar expectativas, PDI e crescimento.', order: 4 },
        { title: 'De seu Primeiro Feedback', description: 'Cultura de feedback comeca no dia 1.', order: 5 },
        { title: 'Celebre uma Conquista', description: 'Quando terminar seu primeiro projeto, celebrate!', order: 6 }
      ];
      template = { steps: fallbackSteps, name: 'Onboarding Padrao' };
    }

    const steps = (template.steps || []).sort((a, b) => (a.order || 0) - (b.order || 0));

    // Progress
    const progEl = document.getElementById('rhOnboardingProgress');
    if (progEl) {
      progEl.innerHTML = `
        <div style="font-size:0.78rem;color:var(--text-secondary);margin-bottom:8px;">
          <i data-lucide="info" style="width:14px;height:14px;vertical-align:-2px;"></i>
          Nenhuma pessoa em onboarding no momento. Preview do template "${this._esc(template.name)}":
        </div>
      `;
    }

    stepsList.innerHTML = steps.map((s, i) => `
      <div style="display:flex;gap:14px;align-items:flex-start;padding:14px;background:var(--bg-elevated);border-radius:10px;border:1px solid var(--border-subtle);opacity:0.7;">
        <div style="width:36px;height:36px;border-radius:50%;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-size:0.85rem;font-weight:700;color:var(--text-muted);">${i + 1}</span>
        </div>
        <div style="flex:1;">
          <div style="font-weight:700;font-size:0.85rem;margin-bottom:2px;">${this._esc(s.title)}</div>
          <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${this._esc(s.description || '')}</div>
          ${s.default_role ? `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">Responsavel: ${this._esc(s.default_role)}</div>` : ''}
        </div>
      </div>
    `).join('');
  },

  // ── Renderizar onboarding ativo (pessoas em onboarding com progresso real) ──
  async _renderOnboardingActive(people) {
    const stepsList = document.getElementById('rhOnboardingStepsList');
    if (!stepsList) return;

    let html = '';
    for (const person of people) {
      const uid = person.supabaseId || person.id;
      let progress = { tasks: [], total: 0, completed: 0, percentage: 0 };

      try {
        progress = await OnboardingRepo.getProgress(uid, 'onboarding');
      } catch { /* sem dados */ }

      // Se nao tem tasks, disparar automacao
      if (!progress.tasks.length) {
        try {
          await OnboardingRepo.triggerAutomation(uid, 'onboarding');
          progress = await OnboardingRepo.getProgress(uid, 'onboarding');
        } catch (e) {
          console.warn(`[RH Onboarding] Falha ao disparar automacao para ${person.nome}:`, e.message);
        }
      }

      const pct = progress.percentage || 0;
      const tasks = progress.tasks || [];

      html += `
        <div class="card" style="padding:16px;margin-bottom:12px;border-left:4px solid ${pct === 100 ? 'var(--color-success)' : 'var(--accent-gold)'};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div>
              <div style="font-weight:700;font-size:0.9rem;">${this._esc(person.nome)}</div>
              <div style="font-size:0.72rem;color:var(--text-secondary);">${this._esc(person.cargo || '')} — ${this._esc(person.bu || '')}</div>
            </div>
            <span style="font-size:0.78rem;font-weight:700;color:${pct === 100 ? 'var(--color-success)' : 'var(--accent-gold)'};">${pct}%</span>
          </div>
          <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;margin-bottom:12px;">
            <div style="height:100%;width:${pct}%;background:${pct === 100 ? 'var(--color-success)' : 'var(--accent-gold)'};border-radius:3px;transition:width 0.5s;"></div>
          </div>
          <div style="display:grid;gap:8px;">
            ${tasks.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(t => `
              <div style="display:flex;gap:10px;align-items:center;padding:8px;background:${t.completed ? 'var(--color-success-dim)' : 'var(--bg-elevated)'};border-radius:8px;cursor:pointer;"
                   onclick="TBO_RH._toggleOnboardingTask('${t.id}', ${!t.completed}, '${uid}')">
                <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${t.completed ? 'var(--color-success)' : 'var(--border-muted)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${t.completed ? 'var(--color-success)' : 'transparent'};">
                  ${t.completed ? '<i data-lucide="check" style="width:12px;height:12px;color:white;"></i>' : ''}
                </div>
                <div style="flex:1;">
                  <div style="font-size:0.82rem;font-weight:500;${t.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">${this._esc(t.text || t.title || '')}</div>
                  ${t.due_date ? `<div style="font-size:0.68rem;color:var(--text-muted);">Prazo: ${new Date(t.due_date).toLocaleDateString('pt-BR')}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
          ${pct === 100 ? `<div style="margin-top:12px;padding:10px;background:var(--color-success-dim);border-radius:8px;text-align:center;">
            <i data-lucide="check-circle-2" style="width:16px;height:16px;color:var(--color-success);vertical-align:-3px;"></i>
            <span style="font-size:0.82rem;font-weight:600;color:var(--color-success);margin-left:6px;">Onboarding completo!</span>
            <button class="btn-primary" style="font-size:0.72rem;padding:4px 12px;margin-left:12px;" onclick="TBO_RH._activatePerson('${uid}')">Ativar Pessoa</button>
          </div>` : ''}
        </div>
      `;
    }

    stepsList.innerHTML = html || '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:20px;">Nenhuma pessoa em onboarding</div>';
  },

  // ── Renderizar offboarding ativo ──
  async _renderOffboardingActive(people) {
    const container = document.getElementById('rhOffboardingList');
    if (!container) return;

    let html = '';
    for (const person of people) {
      const uid = person.supabaseId || person.id;
      let progress = { tasks: [], total: 0, completed: 0, percentage: 0 };

      try {
        progress = await OnboardingRepo.getProgress(uid, 'offboarding');
      } catch { /* sem dados */ }

      // Se nao tem tasks, disparar automacao
      if (!progress.tasks.length) {
        try {
          await OnboardingRepo.triggerAutomation(uid, 'offboarding');
          progress = await OnboardingRepo.getProgress(uid, 'offboarding');
        } catch (e) {
          console.warn(`[RH Offboarding] Falha ao disparar automacao para ${person.nome}:`, e.message);
        }
      }

      const pct = progress.percentage || 0;
      const tasks = progress.tasks || [];

      html += `
        <div style="padding:14px;background:var(--bg-elevated);border-radius:10px;border-left:4px solid ${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div>
              <div style="font-weight:700;font-size:0.85rem;">${this._esc(person.nome)}</div>
              <div style="font-size:0.68rem;color:var(--text-secondary);">${this._esc(person.cargo || '')}</div>
            </div>
            <span style="font-size:0.75rem;font-weight:700;color:${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};">${pct}%</span>
          </div>
          <div style="height:4px;background:var(--bg-tertiary);border-radius:2px;overflow:hidden;margin-bottom:10px;">
            <div style="height:100%;width:${pct}%;background:${pct === 100 ? 'var(--color-success)' : 'var(--color-danger)'};border-radius:2px;"></div>
          </div>
          <div style="display:grid;gap:6px;">
            ${tasks.map(t => `
              <div style="display:flex;gap:8px;align-items:center;padding:6px;cursor:pointer;" onclick="TBO_RH._toggleOnboardingTask('${t.id}', ${!t.completed}, '${uid}', 'offboarding')">
                <div style="width:16px;height:16px;border-radius:50%;border:2px solid ${t.completed ? 'var(--color-success)' : 'var(--border-muted)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;background:${t.completed ? 'var(--color-success)' : 'transparent'};">
                  ${t.completed ? '<i data-lucide="check" style="width:10px;height:10px;color:white;"></i>' : ''}
                </div>
                <span style="font-size:0.78rem;${t.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">${this._esc(t.text || t.title || '')}</span>
              </div>
            `).join('')}
          </div>
          ${pct === 100 ? `
            <div style="margin-top:10px;display:flex;gap:8px;">
              <button class="btn-secondary" style="font-size:0.72rem;padding:4px 10px;" onclick="TBO_RH._openExitInterview('${uid}')">
                <i data-lucide="clipboard-list" style="width:12px;height:12px;"></i> Entrevista de Saida
              </button>
              <button class="btn-primary" style="font-size:0.72rem;padding:4px 10px;background:var(--color-danger);" onclick="TBO_RH._finishOffboarding('${uid}')">
                <i data-lucide="user-x" style="width:12px;height:12px;"></i> Finalizar Desligamento
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    container.innerHTML = html || '<div style="font-size:0.82rem;color:var(--text-muted);text-align:center;padding:10px;">Nenhum offboarding ativo</div>';
  },

  // ── KPIs de Onboarding/Offboarding ──
  async _renderOnboardingKPIs() {
    const progEl = document.getElementById('rhOnboardingProgress');
    if (!progEl) return;

    try {
      const onbPeople = this._team.filter(p => p.status === 'onboarding');
      const offPeople = this._team.filter(p => p.status === 'offboarding');

      if (!onbPeople.length && !offPeople.length) return; // preview mode, nao mostrar KPIs

      const kpis = [];
      if (onbPeople.length) kpis.push(`<span style="color:var(--accent-gold);font-weight:700;">${onbPeople.length}</span> em onboarding`);
      if (offPeople.length) kpis.push(`<span style="color:var(--color-danger);font-weight:700;">${offPeople.length}</span> em offboarding`);

      progEl.innerHTML = `
        <div style="display:flex;gap:16px;font-size:0.82rem;color:var(--text-secondary);">
          ${kpis.join(' | ')}
        </div>
      `;
    } catch { /* silencioso */ }
  },

  // ── Toggle task de onboarding/offboarding ──
  async _toggleOnboardingTask(taskId, completed, personId, type = 'onboarding') {
    if (typeof OnboardingRepo === 'undefined') return;
    try {
      if (completed) {
        await OnboardingRepo.completeTask(taskId);
      } else {
        await OnboardingRepo.reopenTask(taskId);
      }

      // Verificar auto-complete
      await OnboardingRepo.checkAndAutoComplete(personId, type);

      // Re-renderizar
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success(completed ? 'Etapa concluida!' : 'Etapa reaberta');
      await this._loadOnboardingData();
    } catch (e) {
      console.warn('[RH Onboarding] Erro ao toggle task:', e.message);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao atualizar etapa');
    }
  },

  // ── Ativar pessoa (conclusao do onboarding) ──
  async _activatePerson(personId) {
    try {
      if (typeof PeopleRepo !== 'undefined') {
        await PeopleRepo.update(personId, { status: 'ativo' });
      }
      // Atualizar cache local
      const person = this._team.find(p => p.supabaseId === personId || p.id === personId);
      if (person) person.status = 'ativo';

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Pessoa ativada com sucesso!');
      await this._loadOnboardingData();
    } catch (e) {
      console.warn('[RH Onboarding] Erro ao ativar pessoa:', e.message);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao ativar pessoa');
    }
  },

  // ── Finalizar offboarding (mudar status para desligado) ──
  async _finishOffboarding(personId) {
    try {
      if (typeof PeopleRepo !== 'undefined') {
        await PeopleRepo.update(personId, {
          status: 'desligado',
          exit_date: new Date().toISOString().split('T')[0]
        });
      }
      const person = this._team.find(p => p.supabaseId === personId || p.id === personId);
      if (person) person.status = 'desligado';

      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Desligamento finalizado');
      await this._loadOnboardingData();
    } catch (e) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao finalizar offboarding');
    }
  },

  // ── Entrevista de Saida modal ──
  _openExitInterview(personId) {
    const person = this._team.find(p => p.supabaseId === personId || p.id === personId);
    const name = person?.nome || 'Colaborador';

    const overlay = document.createElement('div');
    overlay.id = 'rhExitInterviewOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:var(--bg-primary);border-radius:12px;padding:24px;max-width:520px;width:95%;max-height:80vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="font-size:1rem;">Entrevista de Saida — ${this._esc(name)}</h3>
          <button onclick="document.getElementById('rhExitInterviewOverlay')?.remove()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">✕</button>
        </div>

        <div style="display:grid;gap:16px;">
          <div>
            <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Motivo da Saida</label>
            <select id="exitMotivo" class="input" style="width:100%;">
              <option value="">Selecione...</option>
              <option value="voluntario_mercado">Voluntario — Proposta de mercado</option>
              <option value="voluntario_pessoal">Voluntario — Motivos pessoais</option>
              <option value="voluntario_insatisfacao">Voluntario — Insatisfacao</option>
              <option value="involuntario_performance">Involuntario — Performance</option>
              <option value="involuntario_reestruturacao">Involuntario — Reestruturacao</option>
              <option value="contrato_encerrado">Encerramento de contrato</option>
              <option value="outro">Outro</option>
            </select>
          </div>
          <div>
            <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Satisfacao Geral (1-5)</label>
            <div id="exitSatisfacao" style="display:flex;gap:8px;">
              ${[1, 2, 3, 4, 5].map(n => `<button class="btn-secondary exitSatBtn" data-val="${n}" style="width:36px;height:36px;font-size:0.9rem;" onclick="document.querySelectorAll('.exitSatBtn').forEach(b=>b.style.background='');this.style.background='var(--accent-gold)';this.style.color='white';">${n}</button>`).join('')}
            </div>
          </div>
          <div>
            <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Feedback / Comentarios</label>
            <textarea id="exitFeedback" class="input" rows="4" placeholder="O que poderiamos ter feito melhor?" style="width:100%;resize:vertical;"></textarea>
          </div>
          <div style="display:flex;gap:8px;align-items:center;">
            <input type="checkbox" id="exitRecomendaria">
            <label for="exitRecomendaria" style="font-size:0.82rem;">Recomendaria a TBO como lugar para trabalhar?</label>
          </div>
        </div>

        <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:20px;">
          <button class="btn-secondary" onclick="document.getElementById('rhExitInterviewOverlay')?.remove()">Cancelar</button>
          <button class="btn-primary" onclick="TBO_RH._saveExitInterview('${personId}')">Salvar Entrevista</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  async _saveExitInterview(personId) {
    const motivo = document.getElementById('exitMotivo')?.value;
    const satisfacaoBtn = document.querySelector('.exitSatBtn[style*="accent-gold"]');
    const satisfacao = satisfacaoBtn ? parseInt(satisfacaoBtn.dataset.val) : null;
    const feedback = document.getElementById('exitFeedback')?.value || '';
    const recomendaria = document.getElementById('exitRecomendaria')?.checked || false;

    if (!motivo) {
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Selecione o motivo da saida');
      return;
    }

    try {
      if (typeof OnboardingRepo !== 'undefined') {
        await OnboardingRepo.saveExitInterview(personId, {
          motivo,
          satisfacao,
          feedback,
          recomendaria,
          data: new Date().toISOString()
        });
      }
      document.getElementById('rhExitInterviewOverlay')?.remove();
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Entrevista de saida salva!');
    } catch (e) {
      console.warn('[RH] Erro ao salvar entrevista:', e.message);
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao salvar entrevista');
    }
  },

  // ── Editor de Templates de Onboarding ──
  async _openOnboardingTemplateEditor() {
    if (typeof OnboardingRepo === 'undefined') return;

    let templates = [];
    try {
      templates = await OnboardingRepo.listTemplates();
    } catch { /* sem templates */ }

    const overlay = document.createElement('div');
    overlay.id = 'rhTemplateEditorOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = `
      <div style="background:var(--bg-primary);border-radius:12px;padding:24px;max-width:700px;width:95%;max-height:85vh;overflow-y:auto;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="font-size:1rem;"><i data-lucide="layout-template" style="width:18px;height:18px;vertical-align:-3px;"></i> Templates de Onboarding/Offboarding</h3>
          <button onclick="document.getElementById('rhTemplateEditorOverlay')?.remove()" style="background:none;border:none;cursor:pointer;font-size:1.2rem;">✕</button>
        </div>
        <div style="display:grid;gap:16px;">
          ${templates.map(t => `
            <div class="card" style="padding:16px;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div>
                  <span style="font-weight:700;font-size:0.9rem;">${this._esc(t.name)}</span>
                  <span class="tag" style="font-size:0.6rem;margin-left:8px;background:${t.type === 'onboarding' ? 'var(--accent-gold)20' : 'var(--color-danger)20'};color:${t.type === 'onboarding' ? 'var(--accent-gold)' : 'var(--color-danger)'};">${t.type}</span>
                  ${t.is_default ? '<span class="tag" style="font-size:0.6rem;margin-left:4px;">Padrao</span>' : ''}
                </div>
                <span style="font-size:0.72rem;color:var(--text-muted);">${(t.steps || []).length} etapas</span>
              </div>
              <div style="display:grid;gap:4px;">
                ${(t.steps || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((s, i) => `
                  <div style="font-size:0.78rem;color:var(--text-secondary);padding:4px 0;border-bottom:1px solid var(--border-subtle);">
                    ${i + 1}. ${this._esc(s.title)} ${s.default_role ? `<span style="color:var(--text-muted);font-size:0.68rem;">(${this._esc(s.default_role)})</span>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
          ${!templates.length ? '<div style="text-align:center;color:var(--text-muted);padding:20px;">Nenhum template encontrado. Execute a migration 027 para criar os templates padrao.</div>' : ''}
        </div>
        <div style="margin-top:16px;text-align:right;">
          <button class="btn-secondary" onclick="document.getElementById('rhTemplateEditorOverlay')?.remove()">Fechar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons();
  },

  // Bind interacoes da subtab ativa de Cultura (elogios, feedbacks)
  _bindCulturaContent() {
    // Elogios CRUD — bind apenas se os elementos existem na subtab ativa
    this._bindToggle('rhNewElogio', 'rhElogioForm');
    this._bindToggle('elCancel', 'rhElogioForm', false);
    this._bind('elSave', async () => {
      const paraValue = document.getElementById('elPara')?.value;
      const valorId = document.getElementById('elValor')?.value;
      const mensagem = document.getElementById('elTexto')?.value;
      if (!mensagem) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Escreva uma mensagem'); return; }

      // Resolver valor TBO
      const valorObj = this._valores.find(v => v.id === valorId);

      // Tentar salvar no Supabase
      if (typeof RecognitionsRepo !== 'undefined') {
        try {
          await RecognitionsRepo.create({
            to_user: paraValue,
            value_id: valorId,
            value_name: valorObj?.nome || '',
            value_emoji: valorObj?.emoji || '',
            message: mensagem
          });
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Elogio publicado!');
          // Recarregar dados e re-renderizar
          this._culturaElogiosCache = null;
          await this._loadCulturaFromSupabase();
          const form = document.getElementById('rhElogioForm');
          if (form) form.style.display = 'none';
          const txt = document.getElementById('elTexto');
          if (txt) txt.value = '';
          return;
        } catch (e) {
          console.warn('[RH] Erro ao salvar elogio no Supabase:', e.message);
        }
      }

      // Fallback: localStorage
      const paraUsername = document.getElementById('elPara')?.selectedOptions?.[0]?.dataset?.username || paraValue;
      const el = { id: this._genId(), de: this._currentUserId(), para: paraUsername, valor: valorId, mensagem, curtidas: 0, data: new Date().toISOString() };
      const items = this._getStore('elogios'); items.push(el); this._setStore('elogios', items);
      const list = document.getElementById('rhElogioList');
      if (list) list.innerHTML = this._renderElogioItems(items);
      const form = document.getElementById('rhElogioForm');
      if (form) form.style.display = 'none';
      const txt = document.getElementById('elTexto');
      if (txt) txt.value = '';
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Elogio publicado!');
      this._bindCurtirElogios();
    });
    this._bindCurtirElogios();

    // Feedbacks CRUD
    this._bindToggle('rhNewFeedback', 'rhFeedbackForm');
    this._bindToggle('fbCancel', 'rhFeedbackForm', false);
    this._bind('fbSave', async () => {
      const paraValue = document.getElementById('fbPara')?.value;
      const tipo = document.getElementById('fbTipo')?.value;
      const mensagem = document.getElementById('fbTexto')?.value;
      if (!mensagem) { if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.warning('Preencha a mensagem'); return; }

      // Tentar salvar no Supabase
      if (typeof FeedbacksRepo !== 'undefined') {
        try {
          await FeedbacksRepo.create({
            to_user: paraValue,
            type: tipo,
            visibility: 'public',
            message: mensagem
          });
          if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Feedback enviado!');
          this._culturaFeedbacksCache = null;
          await this._loadCulturaFromSupabase();
          const form = document.getElementById('rhFeedbackForm');
          if (form) form.style.display = 'none';
          const txt = document.getElementById('fbTexto');
          if (txt) txt.value = '';
          return;
        } catch (e) {
          console.warn('[RH] Erro ao salvar feedback no Supabase:', e.message);
        }
      }

      // Fallback: localStorage
      const paraUsername = document.getElementById('fbPara')?.selectedOptions?.[0]?.dataset?.username || paraValue;
      const fb = { id: this._genId(), de: this._currentUserId(), para: paraUsername, tipo, visibilidade: 'publico', mensagem, data: new Date().toISOString() };
      const items = this._getStore('feedbacks'); items.push(fb); this._setStore('feedbacks', items);
      const list = document.getElementById('rhFeedbackList');
      if (list) list.innerHTML = this._renderFeedbackItems(items);
      const form = document.getElementById('rhFeedbackForm');
      if (form) form.style.display = 'none';
      const txt = document.getElementById('fbTexto');
      if (txt) txt.value = '';
      if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Feedback enviado!');
    });
  },

  _renderElogioItems(elogios) {
    if (!elogios.length) return '<div class="empty-state" style="padding:24px;"><div class="empty-state-text">Nenhum elogio no mural</div></div>';
    return elogios.sort((a, b) => new Date(b.data) - new Date(a.data)).map(e => {
      const v = this._valores.find(v2 => v2.id === e.valor) || this._valores[0];
      return `<div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;"><span style="font-size:1.6rem;">${v.emoji}</span><div><div style="font-size:0.82rem;"><strong>${this._getPersonName(e.de)}</strong> elogiou <strong>${this._getPersonName(e.para)}</strong></div><div style="font-size:0.68rem;color:var(--text-muted);">${v.nome} \u2022 ${new Date(e.data).toLocaleDateString('pt-BR')}</div></div></div>
        <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;padding-left:40px;">${this._esc(e.mensagem)}</div>
        <div style="padding-left:40px;margin-top:4px;"><button class="btn btn-sm btn-ghost rh-curtir" data-id="${e.id}" style="font-size:0.72rem;">\u2764\uFE0F ${e.curtidas || 0}</button></div>
      </div>`;
    }).join('');
  },

  _renderFeedbackItems(feedbacks, filter) {
    const userId = this._currentUserId();
    let items = [...feedbacks];
    if (filter === 'recebidos') items = items.filter(f => f.para === userId);
    else if (filter === 'enviados') items = items.filter(f => f.de === userId);
    if (!items.length) return '<div class="empty-state" style="padding:24px;"><div class="empty-state-text">Nenhum feedback</div></div>';
    return items.sort((a, b) => new Date(b.data) - new Date(a.data)).map(f => {
      const tipo = f.tipo === 'positivo';
      return `<div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:12px;">
        <div style="width:4px;min-height:36px;border-radius:2px;background:${tipo ? 'var(--color-success)' : 'var(--color-warning)'};flex-shrink:0;"></div>
        <div style="flex:1;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><div><strong style="font-size:0.82rem;">${this._getPersonName(f.de)}</strong> <span style="color:var(--text-muted);">\u2192</span> <strong style="font-size:0.82rem;">${this._getPersonName(f.para)}</strong></div><span class="tag" style="font-size:0.65rem;background:${tipo ? 'var(--color-success-dim)' : 'var(--color-warning-dim)'};color:${tipo ? 'var(--color-success)' : 'var(--color-warning)'};">${f.tipo}</span></div>
        <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;">${this._esc(f.mensagem)}</div>
        <div style="font-size:0.68rem;color:var(--text-muted);margin-top:2px;">${new Date(f.data).toLocaleDateString('pt-BR')}</div></div>
      </div>`;
    }).join('');
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 4: 1:1s & RITUAIS
  // ══════════════════════════════════════════════════════════════════
  // Cache de 1:1s do Supabase
  _oneOnOnesCache: null,
  _oneOnOneActionsCache: null,

  _render1on1s() {
    // Usar cache Supabase ou fallback localStorage
    const fromSupabase = this._oneOnOnesCache !== null;
    const items = fromSupabase ? this._oneOnOnesCache : this._getStore('1on1s');
    const isAdmin = this._isAdmin();
    const userId = this._currentUserId();

    // Filtrar por participante (admin ve tudo)
    let filtered;
    if (fromSupabase) {
      filtered = isAdmin ? items : items.filter(o => o.leader_id === userId || o.collaborator_id === userId);
    } else {
      filtered = isAdmin ? items : items.filter(o => o.lider === userId || o.colaborador === userId);
    }

    // Contagens
    const concluidas = filtered.filter(o => (o.status === 'concluida' || o.status === 'completed')).length;
    const agendadas = filtered.filter(o => (o.status === 'agendada' || o.status === 'scheduled')).length;

    // Acoes pendentes
    let pendingActions = [];
    if (fromSupabase) {
      pendingActions = this._oneOnOneActionsCache || [];
    } else {
      const allActions = filtered.flatMap(o => o.items || []);
      pendingActions = allActions.filter(i => !i.concluido);
    }

    // Helper para nome pela id (Supabase usa UUID, localStorage usa username)
    const getName = (id) => {
      if (fromSupabase) {
        const p = this._team.find(t => t.supabaseId === id);
        return p ? p.nome : this._getPersonName(id);
      }
      return this._getPersonName(id);
    };

    // Helper para data
    const getDate = (o) => fromSupabase ? (o.scheduled_at || o.created_at) : o.data;
    const getLeader = (o) => fromSupabase ? o.leader_id : o.lider;
    const getCollab = (o) => fromSupabase ? o.collaborator_id : o.colaborador;
    const getActionText = (a) => fromSupabase ? a.text : a.texto;
    const getActionAssignee = (a) => fromSupabase ? a.assignee_id : a.responsavel;
    const getActionDue = (a) => fromSupabase ? a.due_date : a.prazo;

    // Carregar dados do Supabase async
    if (!fromSupabase) this._load1on1sFromSupabase();

    const rituais = [
      { nome: 'Daily Socios', freq: 'Diaria', desc: 'Alinhamento rapido entre fundadores' },
      { nome: '1:1 Mensal', freq: 'Mensal', desc: 'PDI + feedback bidirecional' },
      { nome: 'Review Semanal', freq: 'Semanal', desc: 'Revisao de entregas por BU' },
      { nome: 'Retrospectiva', freq: 'Mensal', desc: 'O que foi bem, o que melhorar' },
      { nome: 'All Hands', freq: 'Trimestral', desc: 'Resultados + visao da empresa' }
    ];

    return `
      ${this._pageHeader('1:1s & Rituais', 'Reuniões individuais, ações e rituais da equipe')}
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Total 1:1s</div><div class="kpi-value">${filtered.length}</div></div>
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">Agendadas</div><div class="kpi-value">${agendadas}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Concluidas</div><div class="kpi-value">${concluidas}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Acoes Pendentes</div><div class="kpi-value">${pendingActions.length}</div></div>
      </div>

      ${pendingActions.length ? `<div class="card" style="margin-bottom:16px;"><div class="card-header"><h3 class="card-title">Acoes Pendentes</h3></div><div style="max-height:200px;overflow-y:auto;">
        ${pendingActions.map(a => `<div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
          <input type="checkbox" class="rh-action-check" data-id="${a.id}" ${(fromSupabase ? a.completed : a.concluido) ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent-gold);">
          <div style="flex:1;font-size:0.82rem;">${getActionText(a)}</div>
          <span style="font-size:0.72rem;color:var(--text-muted);">${getName(getActionAssignee(a))}</span>
          <span style="font-size:0.68rem;color:${getActionDue(a) && new Date(getActionDue(a)) < new Date() ? 'var(--color-danger)' : 'var(--text-muted)'};">${getActionDue(a) ? new Date(getActionDue(a) + (getActionDue(a).includes('T') ? '' : 'T12:00')).toLocaleDateString('pt-BR') : ''}</span>
          <button class="btn btn-ghost btn-sm rh-action-delete" data-id="${a.id}" title="Excluir acao" style="color:var(--color-danger);padding:2px 6px;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
        </div>`).join('')}
      </div></div>` : ''}

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Proximas 1:1s</h3><button class="btn btn-primary btn-sm" id="rhNew1on1">+ Nova</button></div>
          <div id="rh1on1Form" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Lider</label><select class="form-input" id="ooLider">${this._team.filter(t => !t.lider || t.cargo.includes('Coord') || t.cargo.includes('PO') || t.cargo.includes('Lider') || t.cargo.includes('Diretor')).map(t => `<option value="${t.supabaseId || t.id}">${t.nome}</option>`).join('')}</select></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Colaborador</label><select class="form-input" id="ooColab">${this._team.filter(t => !t.terceirizado).map(t => `<option value="${t.supabaseId || t.id}">${t.nome}</option>`).join('')}</select></div>
            </div>
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Data</label><input type="datetime-local" class="form-input" id="ooData"></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Recorrência</label><select class="form-input" id="ooRecurrence"><option value="daily">Diária — seg a sex (padrão)</option><option value="weekly">Semanal</option><option value="biweekly">Quinzenal</option><option value="monthly">Mensal</option><option value="">Única vez</option></select></div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
              <button class="btn btn-primary btn-sm" id="ooSave"><i data-lucide="calendar-plus" style="width:12px;height:12px;vertical-align:-2px;"></i> Agendar + Google Calendar</button>
              <button class="btn btn-secondary btn-sm" id="ooCancel">Cancelar</button>
              <span id="oo1on1Status" style="font-size:0.68rem;color:var(--text-muted);margin-left:auto;"></span>
            </div>
          </div>
          ${filtered.filter(o => (o.status === 'agendada' || o.status === 'scheduled')).sort((a, b) => new Date(getDate(a)) - new Date(getDate(b))).map(o => `<div class="rh-1on1-row" data-id="${o.id}" style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background=''"><input type="checkbox" class="rh-1on1-select" data-id="${o.id}" style="width:16px;height:16px;accent-color:var(--accent-gold);cursor:pointer;flex-shrink:0;" onclick="event.stopPropagation();"><div style="flex:1;"><div style="font-size:0.85rem;font-weight:600;">${getName(getLeader(o))} ↔ ${getName(getCollab(o))}</div><div style="font-size:0.72rem;color:var(--text-muted);">${new Date(getDate(o)).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}${o.recurrence ? ` · <i data-lucide="repeat" style="width:10px;height:10px;vertical-align:-1px;"></i> ${o.recurrence === 'daily' ? 'Diária' : o.recurrence === 'monthly' ? 'Mensal' : o.recurrence === 'biweekly' ? 'Quinzenal' : 'Semanal'}` : ''}${o.google_event_id ? ' · <i data-lucide="calendar" style="width:10px;height:10px;vertical-align:-1px;color:var(--color-info);"></i>' : ''}${!o.google_event_id && o.status === 'scheduled' ? ' · <i data-lucide="calendar-x" style="width:10px;height:10px;vertical-align:-1px;color:var(--color-danger);"></i>' : ''}</div></div><span class="tag" style="font-size:0.65rem;background:var(--color-info)20;color:var(--color-info);">Agendada</span></div>`).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma agendada</div>'}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Historico</h3></div>
          ${filtered.filter(o => (o.status !== 'agendada' && o.status !== 'scheduled')).sort((a, b) => new Date(getDate(b)) - new Date(getDate(a))).slice(0, 15).map(o => {
            const statusMap = { completed: { label: 'Concluída', bg: 'var(--color-success)20', color: 'var(--color-success)' }, concluida: { label: 'Concluída', bg: 'var(--color-success)20', color: 'var(--color-success)' }, cancelled: { label: 'Cancelada', bg: 'var(--bg-tertiary)', color: 'var(--text-muted)' }, no_show: { label: 'No-show', bg: 'var(--color-danger)20', color: 'var(--color-danger)' } };
            const st = statusMap[o.status] || statusMap.completed;
            return `<div class="rh-1on1-row" data-id="${o.id}" style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background 0.15s;" onmouseover="this.style.background='var(--bg-elevated)'" onmouseout="this.style.background=''"><div style="display:flex;align-items:center;gap:10px;"><input type="checkbox" class="rh-1on1-select" data-id="${o.id}" style="width:16px;height:16px;accent-color:var(--accent-gold);cursor:pointer;flex-shrink:0;" onclick="event.stopPropagation();"><div style="flex:1;"><div style="display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.85rem;font-weight:600;">${getName(getLeader(o))} ↔ ${getName(getCollab(o))}</div><div style="font-size:0.72rem;color:var(--text-muted);">${new Date(getDate(o)).toLocaleDateString('pt-BR')}</div></div><span class="tag" style="font-size:0.65rem;background:${st.bg};color:${st.color};">${st.label}</span></div>${o.notes ? `<div style="font-size:0.72rem;color:var(--text-secondary);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:300px;">${this._esc((o.notes || '').slice(0, 80))}${(o.notes || '').length > 80 ? '...' : ''}</div>` : ''}</div></div></div>`;
          }).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma no historico</div>'}
        </div>
      </div>

      <!-- Rituais -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Rituais da Empresa</h3></div>
        <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;">
          ${rituais.map(r => `<div style="padding:12px;background:var(--bg-elevated);border-radius:8px;"><div style="font-weight:600;font-size:0.85rem;margin-bottom:4px;">${r.nome}</div><div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:4px;">${r.desc}</div><span class="tag" style="font-size:0.62rem;">${r.freq}</span></div>`).join('')}
        </div>
      </div>
    `;
  },

  /**
   * Carrega 1:1s e acoes do Supabase
   */
  async _load1on1sFromSupabase() {
    try {
      if (typeof OneOnOnesRepo === 'undefined') return;
      const { data: ones } = await OneOnOnesRepo.list({ limit: 100 });
      this._oneOnOnesCache = ones || [];

      // Carregar acoes pendentes
      const actions = await OneOnOnesRepo.listPendingActions();
      this._oneOnOneActionsCache = actions || [];

      // Re-renderizar se estiver na tab 1on1
      if (this._activeTab === 'one-on-ones') {
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = this._renderActiveTab();
          this._initActiveTab();
        }
      }
    } catch (e) {
      console.warn('[RH] Erro ao carregar 1:1s do Supabase:', e.message);
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB 5: ANALYTICS
  // ══════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════
  // TAB 5: ANALYTICS (P3 — Dados reais Supabase + Chart.js)
  // ══════════════════════════════════════════════════════════════════

  _renderAnalytics() {
    const team = this._getInternalTeam();
    const fmt = typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER : { currency: v => `R$ ${Number(v || 0).toLocaleString('pt-BR', {minimumFractionDigits:0})}` };

    // Dados locais para render imediato
    const activeMembers = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));
    const totalSalary = activeMembers.reduce((sum, t) => sum + (parseFloat(t.custoMensal) || 0), 0);

    // Agrupar por BU
    const buGroups = {};
    activeMembers.forEach(t => {
      const bu = t.bu || 'Sem BU';
      if (!buGroups[bu]) buGroups[bu] = { count: 0, custo: 0, color: this._buColor(bu) };
      buGroups[bu].count++;
      buGroups[bu].custo += parseFloat(t.custoMensal) || 0;
    });

    // Agrupar por status
    const statusGroups = {};
    const statusColors = { 'active': '#10B981', 'ativo': '#10B981', 'inactive': '#6B7280', 'inativo': '#6B7280', 'vacation': '#F59E0B', 'ferias': '#F59E0B', 'away': '#8B5CF6', 'ausente': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626', 'suspenso': '#DC2626' };
    team.forEach(t => {
      const s = t.status || 'ativo';
      if (!statusGroups[s]) statusGroups[s] = 0;
      statusGroups[s]++;
    });

    // Custo medio por pessoa
    const custoMedio = activeMembers.length ? totalSalary / activeMembers.length : 0;

    return `
      ${this._pageHeader('Analytics', 'Indicadores avançados, distribuição de custos e métricas de pessoas')}
      <!-- KPIs Analytics -->
      <div class="grid-4" style="gap:12px;margin-bottom:20px;">
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Headcount Total</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${team.length}</div>
          <div style="font-size:0.72rem;color:var(--color-success);">${activeMembers.length} ativos</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Mensal Total</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--brand-primary);margin:4px 0;" id="rhAnalyticsCusto">${fmt.currency(totalSalary)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">PJ ativos</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Custo Medio / Pessoa</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${fmt.currency(custoMedio)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">media mensal</div>
        </div>
        <div class="card" style="padding:16px;text-align:center;">
          <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">BUs Ativas</div>
          <div style="font-size:1.8rem;font-weight:800;color:var(--text-primary);margin:4px 0;">${Object.keys(buGroups).length}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">equipes</div>
        </div>
      </div>

      <!-- Graficos Row 1: Custo por BU + Distribuicao por Status -->
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="bar-chart-3" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Custo Mensal por Equipe
          </h4>
          <div style="height:280px;position:relative;">
            <canvas id="rhChartCustoBU"></canvas>
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="pie-chart" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Distribuicao por Status
          </h4>
          <div style="height:280px;position:relative;">
            <canvas id="rhChartStatus"></canvas>
          </div>
        </div>
      </div>

      <!-- Graficos Row 2: Headcount por BU + Tabela Custo Detalhado -->
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="users" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Headcount por BU
          </h4>
          <div style="height:280px;position:relative;">
            <canvas id="rhChartHeadcount"></canvas>
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="table" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Breakdown por Equipe
          </h4>
          <table class="data-table" style="font-size:0.8rem;">
            <thead><tr>
              <th>Equipe</th>
              <th style="text-align:center;">Pessoas</th>
              <th style="text-align:right;">Custo Mensal</th>
              <th style="text-align:right;">% do Total</th>
            </tr></thead>
            <tbody>
              ${Object.entries(buGroups).sort((a, b) => b[1].custo - a[1].custo).map(([bu, data]) => {
                const pct = totalSalary ? ((data.custo / totalSalary) * 100).toFixed(1) : '0.0';
                return `<tr>
                  <td><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${data.color};margin-right:6px;"></span><strong>${this._esc(bu)}</strong></td>
                  <td style="text-align:center;">${data.count}</td>
                  <td style="text-align:right;font-weight:600;">${fmt.currency(data.custo)}</td>
                  <td style="text-align:right;color:var(--text-muted);">${pct}%</td>
                </tr>`;
              }).join('')}
              <tr style="border-top:2px solid var(--border-subtle);font-weight:700;">
                <td>Total</td>
                <td style="text-align:center;">${activeMembers.length}</td>
                <td style="text-align:right;color:var(--brand-primary);">${fmt.currency(totalSalary)}</td>
                <td style="text-align:right;">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Row 3: Top salarios + Performance por BU -->
      <div class="grid-2" style="gap:16px;">
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="trending-up" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Top Investimentos (Maiores Valores)
          </h4>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${[...activeMembers].filter(t => parseFloat(t.custoMensal) > 0).sort((a, b) => (parseFloat(b.custoMensal) || 0) - (parseFloat(a.custoMensal) || 0)).slice(0, 8).map((t, i) => {
              const salary = parseFloat(t.custoMensal) || 0;
              const maxSalary = parseFloat([...activeMembers].sort((a, b) => (parseFloat(b.custoMensal) || 0) - (parseFloat(a.custoMensal) || 0))[0]?.custoMensal) || 1;
              const pct = (salary / maxSalary) * 100;
              const buColor = this._buColor(t.bu);
              return `<div style="display:flex;align-items:center;gap:10px;">
                <span style="width:18px;font-size:0.7rem;color:var(--text-muted);text-align:right;">${i + 1}.</span>
                <span style="width:120px;font-size:0.8rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" data-person-id="${t.supabaseId || ''}">${this._esc(t.nome)}</span>
                <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${pct}%;background:${buColor};border-radius:3px;transition:width 0.6s ease;"></div>
                </div>
                <span style="font-size:0.78rem;font-weight:700;min-width:70px;text-align:right;">${fmt.currency(salary)}</span>
              </div>`;
            }).join('')}
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="award" style="width:16px;height:16px;color:var(--brand-primary);"></i>
            Performance por BU
          </h4>
          ${(() => {
            const reviews = this._getStore('avaliacoes_people');
            const buPerf = {};
            reviews.forEach(r => {
              const p = this._getPerson(r.pessoaId);
              if (p && p.bu) {
                if (!buPerf[p.bu]) buPerf[p.bu] = [];
                buPerf[p.bu].push(r.mediaGeral);
              }
            });
            if (!Object.keys(buPerf).length) {
              return '<div style="text-align:center;color:var(--text-muted);padding:40px 0;font-size:0.82rem;">Sem dados de avaliacao ainda</div>';
            }
            return Object.entries(buPerf).sort((a, b) => {
              const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length;
              const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length;
              return avgB - avgA;
            }).map(([bu, scores]) => {
              const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1);
              const color = avg >= 4 ? '#10B981' : avg >= 3 ? '#F59E0B' : '#EF4444';
              return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <span style="font-size:0.82rem;width:80px;font-weight:600;">${this._esc(bu)}</span>
                <div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                  <div style="height:100%;width:${(avg / 5) * 100}%;background:${color};border-radius:4px;transition:width 0.6s ease;"></div>
                </div>
                <span style="font-size:0.85rem;font-weight:700;color:${color};">${avg}</span>
                <span style="font-size:0.68rem;color:var(--text-muted);">(${scores.length}p)</span>
              </div>`;
            }).join('');
          })()}
        </div>
      </div>

      <!-- Row 4: Metricas avancadas (Fase E) -->
      <div class="grid-3" style="gap:16px;margin-top:16px;margin-bottom:16px;">
        <!-- Turnover -->
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="user-minus" style="width:14px;height:14px;color:var(--color-danger);"></i> Turnover
          </h4>
          ${(() => {
            const inativos = team.filter(t => t.status === 'inactive' || t.status === 'inativo' || t.status === 'desligado').length;
            const taxa = team.length ? ((inativos / team.length) * 100).toFixed(1) : '0.0';
            return '<div style="text-align:center;"><div style="font-size:2rem;font-weight:800;color:' + (parseFloat(taxa) > 15 ? 'var(--color-danger)' : parseFloat(taxa) > 8 ? 'var(--accent-gold)' : 'var(--color-success)') + ';">' + taxa + '%</div><div style="font-size:0.72rem;color:var(--text-muted);">' + inativos + ' inativos / ' + team.length + ' total</div></div>';
          })()}
        </div>

        <!-- Diversidade por Cidade -->
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="map-pin" style="width:14px;height:14px;color:var(--color-info);"></i> Diversidade Regional
          </h4>
          ${(() => {
            const byCidade = {};
            activeMembers.forEach(t => {
              const c = t.cidade || t.city || 'Não informado';
              byCidade[c] = (byCidade[c] || 0) + 1;
            });
            return Object.entries(byCidade).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([c, n]) =>
              '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;"><span>' + c + '</span><strong>' + n + '</strong></div>'
            ).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>';
          })()}
        </div>

        <!-- Tipo de Contrato -->
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.82rem;margin-bottom:12px;display:flex;align-items:center;gap:6px;">
            <i data-lucide="file-text" style="width:14px;height:14px;color:var(--accent-gold);"></i> Tipo de Contrato
          </h4>
          ${(() => {
            const byTipo = {};
            activeMembers.forEach(t => {
              const tipo = t.tipoContrato || t.tipo_contrato || 'PJ';
              byTipo[tipo] = (byTipo[tipo] || 0) + 1;
            });
            return Object.entries(byTipo).sort((a, b) => b[1] - a[1]).map(([tipo, n]) =>
              '<div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;"><span>' + tipo.toUpperCase() + '</span><strong>' + n + '</strong></div>'
            ).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>';
          })()}
        </div>
      </div>

      <!-- Row 5: 1:1 Compliance + Recognition Index + Headcount Evolution -->
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="calendar-check" style="width:16px;height:16px;color:var(--color-success);"></i>
            1:1 Compliance
          </h4>
          <div id="rhAnalytics1on1Compliance">
            <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;"></i> Carregando...</div>
          </div>
        </div>
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
            <i data-lucide="trophy" style="width:16px;height:16px;color:var(--accent-gold);"></i>
            Índice de Reconhecimento
          </h4>
          <div id="rhAnalyticsRecognition">
            <div style="font-size:0.72rem;color:var(--text-muted);"><i data-lucide="loader" style="width:12px;height:12px;animation:spin 1s linear infinite;"></i> Carregando...</div>
          </div>
        </div>
      </div>

      <!-- Row 6: Headcount Evolution (Chart) -->
      <div class="card" style="padding:20px;margin-bottom:16px;">
        <h4 style="font-size:0.85rem;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
          <i data-lucide="line-chart" style="width:16px;height:16px;color:var(--brand-primary);"></i>
          Evolução do Headcount
        </h4>
        <div style="height:250px;position:relative;">
          <canvas id="rhChartHeadcountEvolution"></canvas>
        </div>
      </div>
    `;
  },

  // Helper: cor por BU
  _buColor(bu) {
    const colors = { 'Branding': '#8B5CF6', 'Digital 3D': '#3A7BD5', 'Marketing': '#F59E0B', 'Vendas': '#2ECC71', 'Operacao': '#E85102', 'Operação': '#E85102', 'Pós Vendas': '#EC4899' };
    return colors[bu] || '#64748B';
  },

  // Inicializar graficos Chart.js na tab Analytics
  async _initAnalytics() {
    if (typeof Chart === 'undefined') {
      console.warn('[RH] Chart.js nao carregado');
      return;
    }

    const team = this._getInternalTeam();
    const activeMembers = team.filter(t => t.status === 'ativo' || t.status === 'active' || (!t.status && t.id));

    // Configuracao global do Chart.js para dark mode
    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-primary').trim() || '#E2E8F0';
    const mutedColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || '#64748B';
    const gridColor = 'rgba(148, 163, 184, 0.1)';

    // ── Grafico 1: Custo Mensal por BU (bar chart horizontal) ──
    const buGroups = {};
    activeMembers.forEach(t => {
      const bu = t.bu || 'Sem BU';
      if (!buGroups[bu]) buGroups[bu] = { count: 0, custo: 0, color: this._buColor(bu) };
      buGroups[bu].count++;
      buGroups[bu].custo += parseFloat(t.custoMensal) || 0;
    });

    const buEntries = Object.entries(buGroups).sort((a, b) => b[1].custo - a[1].custo);
    const custoBUCanvas = document.getElementById('rhChartCustoBU');
    if (custoBUCanvas) {
      new Chart(custoBUCanvas, {
        type: 'bar',
        data: {
          labels: buEntries.map(([bu]) => bu),
          datasets: [{
            label: 'Custo Mensal (R$)',
            data: buEntries.map(([, d]) => d.custo),
            backgroundColor: buEntries.map(([, d]) => d.color + 'CC'),
            borderColor: buEntries.map(([, d]) => d.color),
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.7
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `R$ ${ctx.parsed.x.toLocaleString('pt-BR', {minimumFractionDigits:0})}`
              }
            }
          },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: mutedColor, font: { size: 11 }, callback: v => `R$ ${(v/1000).toFixed(0)}k` } },
            y: { grid: { display: false }, ticks: { color: textColor, font: { size: 12, weight: '600' } } }
          }
        }
      });
    }

    // ── Grafico 2: Distribuicao por Status (doughnut) ──
    const statusGroups = {};
    const statusLabels = { 'active': 'Ativo', 'ativo': 'Ativo', 'inactive': 'Inativo', 'inativo': 'Inativo', 'vacation': 'Ferias', 'ferias': 'Ferias', 'away': 'Ausente', 'ausente': 'Ausente', 'onboarding': 'Onboarding', 'offboarding': 'Offboarding', 'desligado': 'Desligado', 'suspended': 'Suspenso', 'suspenso': 'Suspenso' };
    const statusColors = { 'active': '#10B981', 'ativo': '#10B981', 'inactive': '#6B7280', 'inativo': '#6B7280', 'vacation': '#F59E0B', 'ferias': '#F59E0B', 'away': '#8B5CF6', 'ausente': '#8B5CF6', 'onboarding': '#3B82F6', 'offboarding': '#F97316', 'desligado': '#9CA3AF', 'suspended': '#DC2626', 'suspenso': '#DC2626' };
    team.forEach(t => {
      const s = t.status || 'ativo';
      if (!statusGroups[s]) statusGroups[s] = 0;
      statusGroups[s]++;
    });

    const statusCanvas = document.getElementById('rhChartStatus');
    if (statusCanvas) {
      const sEntries = Object.entries(statusGroups).sort((a, b) => b[1] - a[1]);
      new Chart(statusCanvas, {
        type: 'doughnut',
        data: {
          labels: sEntries.map(([s]) => statusLabels[s] || s),
          datasets: [{
            data: sEntries.map(([, c]) => c),
            backgroundColor: sEntries.map(([s]) => (statusColors[s] || '#64748B') + 'CC'),
            borderColor: sEntries.map(([s]) => statusColors[s] || '#64748B'),
            borderWidth: 2,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '60%',
          plugins: {
            legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 16, usePointStyle: true, pointStyle: 'circle' } },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.label}: ${ctx.parsed} (${((ctx.parsed / team.length) * 100).toFixed(0)}%)`
              }
            }
          }
        }
      });
    }

    // ── Grafico 3: Headcount por BU (bar chart vertical) ──
    const headcountCanvas = document.getElementById('rhChartHeadcount');
    if (headcountCanvas) {
      new Chart(headcountCanvas, {
        type: 'bar',
        data: {
          labels: buEntries.map(([bu]) => bu),
          datasets: [{
            label: 'Pessoas',
            data: buEntries.map(([, d]) => d.count),
            backgroundColor: buEntries.map(([, d]) => d.color + '99'),
            borderColor: buEntries.map(([, d]) => d.color),
            borderWidth: 1,
            borderRadius: 6,
            barPercentage: 0.6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: ctx => `${ctx.parsed.y} pessoa${ctx.parsed.y !== 1 ? 's' : ''}`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: textColor, font: { size: 11, weight: '600' } } },
            y: { grid: { color: gridColor }, ticks: { color: mutedColor, font: { size: 11 }, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    }

    // ── Grafico 4: Headcount Evolution (line chart) — Fase E ──
    const hcEvoCanvas = document.getElementById('rhChartHeadcountEvolution');
    if (hcEvoCanvas) {
      // Calcular headcount mensal baseado em start_date
      const months = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(d);
      }
      const hcData = months.map(m => {
        const endOfMonth = new Date(m.getFullYear(), m.getMonth() + 1, 0);
        return team.filter(t => {
          const start = t.inicio || t.start_date;
          if (!start) return true;
          return new Date(start) <= endOfMonth;
        }).length;
      });

      new Chart(hcEvoCanvas, {
        type: 'line',
        data: {
          labels: months.map(m => m.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })),
          datasets: [{
            label: 'Headcount',
            data: hcData,
            borderColor: '#3A7BD5',
            backgroundColor: 'rgba(58, 123, 213, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: mutedColor, font: { size: 10 } } },
            y: { grid: { color: gridColor }, ticks: { color: mutedColor, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    }

    // ── Analytics async: 1:1 Compliance + Recognition Index ──
    this._loadAnalytics1on1Compliance();
    this._loadAnalyticsRecognition();

    // Bind hover cards nos nomes
    if (typeof TBO_HOVER_CARD !== 'undefined') {
      const container = document.getElementById('rhTabContent');
      if (container) TBO_HOVER_CARD.bind(container);
    }
  },

  // ── Analytics: 1:1 Compliance (async) ──
  async _loadAnalytics1on1Compliance() {
    const container = document.getElementById('rhAnalytics1on1Compliance');
    if (!container) return;
    try {
      if (typeof OneOnOnesRepo === 'undefined') { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>'; return; }
      const kpis = await OneOnOnesRepo.getKPIs();
      const total = kpis.total || 0;
      const completed = kpis.byStatus?.completed || 0;
      const scheduled = kpis.byStatus?.scheduled || 0;
      const noShow = kpis.byStatus?.no_show || 0;
      const compliance = total > 0 ? Math.round(((completed) / total) * 100) : 0;

      container.innerHTML = `
        <div style="text-align:center;margin-bottom:12px;">
          <div style="font-size:2.2rem;font-weight:800;color:${compliance >= 75 ? 'var(--color-success)' : compliance >= 50 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${compliance}%</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">taxa de conclusão</div>
        </div>
        <div style="display:flex;gap:12px;justify-content:center;">
          <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--color-success);">${completed}</div><div style="font-size:0.62rem;color:var(--text-muted);">Concluídas</div></div>
          <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--color-info);">${scheduled}</div><div style="font-size:0.62rem;color:var(--text-muted);">Agendadas</div></div>
          <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--color-danger);">${noShow}</div><div style="font-size:0.62rem;color:var(--text-muted);">No-show</div></div>
          <div style="text-align:center;"><div style="font-size:1rem;font-weight:700;color:var(--accent-gold);">${kpis.pendingActions || 0}</div><div style="font-size:0.62rem;color:var(--text-muted);">Ações pend.</div></div>
        </div>
      `;
    } catch (e) { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>'; }
  },

  // ── Analytics: Recognition Index (async) ──
  async _loadAnalyticsRecognition() {
    const container = document.getElementById('rhAnalyticsRecognition');
    if (!container) return;
    try {
      if (typeof RecognitionsRepo === 'undefined') { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>'; return; }
      const kpis = await RecognitionsRepo.getKPIs();
      const getName = (uid) => { const p = this._team.find(t => t.supabaseId === uid); return p ? p.nome.split(' ')[0] : uid?.slice(0, 8) || '?'; };

      container.innerHTML = `
        <div style="display:flex;gap:16px;margin-bottom:12px;">
          <div style="text-align:center;flex:1;"><div style="font-size:1.5rem;font-weight:800;color:var(--accent-gold);">${kpis.total}</div><div style="font-size:0.62rem;color:var(--text-muted);">Total</div></div>
          <div style="text-align:center;flex:1;"><div style="font-size:1.5rem;font-weight:800;color:var(--color-success);">${kpis.thisMonth}</div><div style="font-size:0.62rem;color:var(--text-muted);">Este mês</div></div>
        </div>
        ${kpis.topPeople && kpis.topPeople.length ? `
          <div style="font-size:0.72rem;font-weight:600;margin-bottom:6px;color:var(--text-muted);">Top Reconhecidos:</div>
          ${kpis.topPeople.slice(0, 5).map(([uid, count], i) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
              <span style="font-size:0.68rem;color:var(--text-muted);width:14px;">${i + 1}.</span>
              <span style="font-size:0.78rem;font-weight:500;flex:1;">${this._esc(getName(uid))}</span>
              <span style="font-size:0.72rem;font-weight:700;color:var(--accent-gold);">${count}</span>
            </div>
          `).join('')}
        ` : '<div style="font-size:0.72rem;color:var(--text-muted);">Sem reconhecimentos</div>'}
        ${kpis.byValue && Object.keys(kpis.byValue).length ? `
          <div style="font-size:0.72rem;font-weight:600;margin-top:10px;margin-bottom:6px;color:var(--text-muted);">Por Valor:</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${Object.entries(kpis.byValue).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([v, n]) => `<span class="tag" style="font-size:0.6rem;">${this._esc(v)} (${n})</span>`).join('')}
          </div>
        ` : ''}
      `;
    } catch (e) { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>'; }
  },

  // ══════════════════════════════════════════════════════════════════
  // SCOPED CSS
  // ══════════════════════════════════════════════════════════════════
  // ══════════════════════════════════════════════════════════════════
  // TAB: BANCO DE TALENTOS
  // ══════════════════════════════════════════════════════════════════

  _talentsData: [],
  _talentsCount: 0,
  _talentsLoading: false,
  _talentsFilter: { status: '', specialty: '', seniority: '', search: '' },

  _renderBancoTalentos() {
    const f = this._talentsFilter;
    return `
      ${this._pageHeader('Banco de Talentos', 'Candidatos, freelancers e parceiros externos')}
      <div class="rh-talentos-section">
        <!-- KPIs -->
        <div id="rhTalentosKPIs" class="grid-4" style="margin-bottom:20px;">
          ${this._renderTalentosKPIs()}
        </div>

        <!-- Toolbar -->
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
          <input type="text" class="form-input rh-talentos-search" placeholder="Buscar talentos..." value="${f.search}" style="flex:1; min-width:200px;">
          <select class="form-input rh-talentos-filter-specialty" style="width:160px;">
            <option value="">Todas Especialidades</option>
            <option value="Branding" ${f.specialty==='Branding'?'selected':''}>Branding</option>
            <option value="Digital 3D" ${f.specialty==='Digital 3D'?'selected':''}>Digital 3D</option>
            <option value="Marketing" ${f.specialty==='Marketing'?'selected':''}>Marketing</option>
            <option value="Vendas" ${f.specialty==='Vendas'?'selected':''}>Vendas</option>
            <option value="Design" ${f.specialty==='Design'?'selected':''}>Design</option>
            <option value="Desenvolvimento" ${f.specialty==='Desenvolvimento'?'selected':''}>Desenvolvimento</option>
            <option value="Audiovisual" ${f.specialty==='Audiovisual'?'selected':''}>Audiovisual</option>
            <option value="Outro" ${f.specialty==='Outro'?'selected':''}>Outro</option>
          </select>
          <select class="form-input rh-talentos-filter-seniority" style="width:130px;">
            <option value="">Senioridade</option>
            <option value="Jr" ${f.seniority==='Jr'?'selected':''}>Jr</option>
            <option value="Pleno" ${f.seniority==='Pleno'?'selected':''}>Pleno</option>
            <option value="Senior" ${f.seniority==='Senior'?'selected':''}>Senior</option>
            <option value="Especialista" ${f.seniority==='Especialista'?'selected':''}>Especialista</option>
          </select>
          <select class="form-input rh-talentos-filter-status" style="width:140px;">
            <option value="">Todos Status</option>
            <option value="available" ${f.status==='available'?'selected':''}>Disponivel</option>
            <option value="contacted" ${f.status==='contacted'?'selected':''}>Contatado</option>
            <option value="in_process" ${f.status==='in_process'?'selected':''}>Em Processo</option>
            <option value="hired" ${f.status==='hired'?'selected':''}>Contratado</option>
            <option value="archived" ${f.status==='archived'?'selected':''}>Arquivado</option>
          </select>
          <button class="btn btn-primary" id="rhBtnNovoTalento" style="white-space:nowrap;">
            <i data-lucide="user-plus" style="width:16px;height:16px;"></i> Novo Talento
          </button>
        </div>

        <!-- Tabela -->
        <div id="rhTalentosTable" class="rh-tabela-card" style="overflow-x:auto;">
          ${this._renderTalentosTable()}
        </div>
      </div>

      <!-- Modal Talento -->
      <div id="rhTalentoModal" class="modal-overlay" style="display:none;">
        <div class="modal" style="max-width:600px;">
          <div id="rhTalentoModalContent"></div>
        </div>
      </div>
    `;
  },

  _renderTalentosKPIs() {
    const all = this._talentsData || [];
    const avail = all.filter(t => t.status === 'available').length;
    const inProc = all.filter(t => t.status === 'in_process' || t.status === 'contacted').length;
    const hired = all.filter(t => t.status === 'hired').length;
    return `
      <div class="kpi-card"><div class="kpi-label">Total Cadastrados</div><div class="kpi-value">${all.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Disponiveis</div><div class="kpi-value" style="color:var(--color-success)">${avail}</div></div>
      <div class="kpi-card"><div class="kpi-label">Em Processo</div><div class="kpi-value" style="color:var(--accent-gold)">${inProc}</div></div>
      <div class="kpi-card"><div class="kpi-label">Contratados</div><div class="kpi-value" style="color:var(--color-info)">${hired}</div></div>
    `;
  },

  _talentStatusLabel(s) {
    const map = { available:'Disponivel', contacted:'Contatado', in_process:'Em Processo', hired:'Contratado', archived:'Arquivado' };
    return map[s] || s || 'Disponivel';
  },
  _talentStatusColor(s) {
    const map = { available:'#2ECC71', contacted:'#3B82F6', in_process:'#F59E0B', hired:'#8B5CF6', archived:'#94A3B8' };
    return map[s] || '#94A3B8';
  },

  _renderTalentosTable() {
    if (this._talentsLoading) {
      return '<div style="padding:40px;text-align:center;"><div class="rh-skeleton" style="height:200px;border-radius:8px;"></div></div>';
    }
    const talents = this._talentsData || [];
    if (!talents.length) {
      return `<div class="empty-state" style="padding:60px 20px;text-align:center;">
        <i data-lucide="user-plus" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
        <h3 style="color:var(--text-muted);margin:0 0 4px;">Nenhum talento cadastrado</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Clique em "Novo Talento" para adicionar ao banco.</p>
      </div>`;
    }
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    return `
      <table class="rh-bu-table">
        <thead><tr>
          <th>Nome</th><th>Email</th><th>Especialidade</th><th>Senioridade</th><th>Cidade/UF</th><th>Status</th><th style="width:80px;">Acoes</th>
        </tr></thead>
        <tbody>
          ${talents.map(t => `
            <tr class="rh-bu-row">
              <td style="font-weight:600;">${esc(t.full_name)}</td>
              <td>${esc(t.email)}</td>
              <td>${esc(t.specialty)}</td>
              <td>${esc(t.seniority)}</td>
              <td>${esc(t.city)}${t.state ? '/' + esc(t.state) : ''}</td>
              <td><span class="tag" style="background:${this._talentStatusColor(t.status)}20;color:${this._talentStatusColor(t.status)};font-size:0.7rem;">${this._talentStatusLabel(t.status)}</span></td>
              <td>
                <div style="display:flex;gap:4px;">
                  <button class="btn btn-sm rh-talent-edit" data-id="${t.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                  <button class="btn btn-sm rh-talent-archive" data-id="${t.id}" title="Arquivar"><i data-lucide="archive" style="width:14px;height:14px;"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  _renderTalentoModalContent(talent) {
    const t = talent || {};
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="margin:0;">${t.id ? 'Editar Talento' : 'Novo Talento'}</h3>
        <button class="btn btn-sm" id="rhTalentoModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <form id="rhTalentoForm">
        <input type="hidden" id="rhTalentoId" value="${t.id || ''}">
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Nome *</label><input class="form-input" id="rhTalentoNome" value="${esc(t.full_name)}" required></div>
          <div><label class="form-label">Email</label><input class="form-input" id="rhTalentoEmail" type="email" value="${esc(t.email)}"></div>
        </div>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Telefone</label><input class="form-input" id="rhTalentoPhone" value="${esc(t.phone)}"></div>
          <div><label class="form-label">Fonte</label>
            <select class="form-input" id="rhTalentoSource">
              <option value="">Selecionar...</option>
              <option value="indicacao" ${t.source==='indicacao'?'selected':''}>Indicacao</option>
              <option value="linkedin" ${t.source==='linkedin'?'selected':''}>LinkedIn</option>
              <option value="site" ${t.source==='site'?'selected':''}>Site</option>
              <option value="portfolio" ${t.source==='portfolio'?'selected':''}>Portfolio</option>
              <option value="outro" ${t.source==='outro'?'selected':''}>Outro</option>
            </select>
          </div>
        </div>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Especialidade</label>
            <select class="form-input" id="rhTalentoSpecialty">
              <option value="">Selecionar...</option>
              <option value="Branding" ${t.specialty==='Branding'?'selected':''}>Branding</option>
              <option value="Digital 3D" ${t.specialty==='Digital 3D'?'selected':''}>Digital 3D</option>
              <option value="Marketing" ${t.specialty==='Marketing'?'selected':''}>Marketing</option>
              <option value="Vendas" ${t.specialty==='Vendas'?'selected':''}>Vendas</option>
              <option value="Design" ${t.specialty==='Design'?'selected':''}>Design</option>
              <option value="Desenvolvimento" ${t.specialty==='Desenvolvimento'?'selected':''}>Desenvolvimento</option>
              <option value="Audiovisual" ${t.specialty==='Audiovisual'?'selected':''}>Audiovisual</option>
              <option value="Outro" ${t.specialty==='Outro'?'selected':''}>Outro</option>
            </select>
          </div>
          <div><label class="form-label">Senioridade</label>
            <select class="form-input" id="rhTalentoSeniority">
              <option value="">Selecionar...</option>
              <option value="Jr" ${t.seniority==='Jr'?'selected':''}>Jr</option>
              <option value="Pleno" ${t.seniority==='Pleno'?'selected':''}>Pleno</option>
              <option value="Senior" ${t.seniority==='Senior'?'selected':''}>Senior</option>
              <option value="Especialista" ${t.seniority==='Especialista'?'selected':''}>Especialista</option>
            </select>
          </div>
        </div>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Cidade</label><input class="form-input" id="rhTalentoCity" value="${esc(t.city)}"></div>
          <div><label class="form-label">Estado</label><input class="form-input" id="rhTalentoState" value="${esc(t.state)}"></div>
        </div>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Portfolio URL</label><input class="form-input" id="rhTalentoPortfolio" type="url" value="${esc(t.portfolio_url)}"></div>
          <div><label class="form-label">LinkedIn URL</label><input class="form-input" id="rhTalentoLinkedin" type="url" value="${esc(t.linkedin_url)}"></div>
        </div>
        <div style="margin-bottom:12px;">
          <label class="form-label">Tags (separadas por virgula)</label>
          <input class="form-input" id="rhTalentoTags" value="${(t.tags || []).join(', ')}">
        </div>
        <div style="margin-bottom:16px;">
          <label class="form-label">Observacoes</label>
          <textarea class="form-input" id="rhTalentoNotes" rows="3">${esc(t.notes)}</textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" id="rhTalentoCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    `;
  },

  async _loadTalentos() {
    if (typeof TalentsRepo === 'undefined') return;
    this._talentsLoading = true;
    const tableEl = document.getElementById('rhTalentosTable');
    if (tableEl) tableEl.innerHTML = this._renderTalentosTable();

    try {
      const f = this._talentsFilter;
      const opts = {};
      if (f.status) opts.status = f.status;
      if (f.specialty) opts.specialty = f.specialty;
      if (f.seniority) opts.seniority = f.seniority;
      if (f.search) opts.search = f.search;

      const result = await TalentsRepo.list(opts);
      this._talentsData = result.data;
      this._talentsCount = result.count;
    } catch (err) {
      console.error('[RH] Erro ao carregar talentos:', err);
      TBO_TOAST.error('Erro ao carregar banco de talentos');
      this._talentsData = [];
    }
    this._talentsLoading = false;

    if (tableEl) {
      tableEl.innerHTML = this._renderTalentosTable();
      if (window.lucide) lucide.createIcons({ root: tableEl });
      this._bindTalentosActions();
    }
    const kpis = document.getElementById('rhTalentosKPIs');
    if (kpis) { kpis.innerHTML = this._renderTalentosKPIs(); }
  },

  _bindTalentosActions() {
    document.querySelectorAll('.rh-talent-edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (typeof TalentsRepo === 'undefined') return;
        try {
          const talent = await TalentsRepo.getById(btn.dataset.id);
          this._openTalentoModal(talent);
        } catch (e) { TBO_TOAST.error('Erro ao carregar talento'); }
      });
    });
    document.querySelectorAll('.rh-talent-archive').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (typeof TalentsRepo === 'undefined') return;
        if (!confirm('Arquivar este talento?')) return;
        try {
          await TalentsRepo.archive(btn.dataset.id);
          TBO_TOAST.success('Talento arquivado');
          this._loadTalentos();
        } catch (e) { TBO_TOAST.error('Erro ao arquivar talento'); }
      });
    });
  },

  _openTalentoModal(talent) {
    const modal = document.getElementById('rhTalentoModal');
    const content = document.getElementById('rhTalentoModalContent');
    if (!modal || !content) return;
    content.innerHTML = this._renderTalentoModalContent(talent);
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons({ root: modal });

    // Bind modal events
    document.getElementById('rhTalentoModalClose')?.addEventListener('click', () => { modal.style.display = 'none'; });
    document.getElementById('rhTalentoCancel')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('rhTalentoForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('rhTalentoId')?.value;
      const tagsRaw = document.getElementById('rhTalentoTags')?.value || '';
      const tags = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);

      const payload = {
        full_name: document.getElementById('rhTalentoNome')?.value?.trim(),
        email: document.getElementById('rhTalentoEmail')?.value?.trim() || null,
        phone: document.getElementById('rhTalentoPhone')?.value?.trim() || null,
        specialty: document.getElementById('rhTalentoSpecialty')?.value || null,
        seniority: document.getElementById('rhTalentoSeniority')?.value || null,
        city: document.getElementById('rhTalentoCity')?.value?.trim() || null,
        state: document.getElementById('rhTalentoState')?.value?.trim() || null,
        portfolio_url: document.getElementById('rhTalentoPortfolio')?.value?.trim() || null,
        linkedin_url: document.getElementById('rhTalentoLinkedin')?.value?.trim() || null,
        source: document.getElementById('rhTalentoSource')?.value || null,
        tags: tags.length ? tags : null,
        notes: document.getElementById('rhTalentoNotes')?.value?.trim() || null,
      };

      if (!payload.full_name) { TBO_TOAST.warning('Nome e obrigatorio'); return; }

      try {
        if (id) { await TalentsRepo.update(id, payload); TBO_TOAST.success('Talento atualizado!'); }
        else { await TalentsRepo.create(payload); TBO_TOAST.success('Talento cadastrado!'); }
        modal.style.display = 'none';
        this._loadTalentos();
      } catch (err) {
        console.error('[RH] Erro ao salvar talento:', err);
        TBO_TOAST.error('Erro ao salvar talento');
      }
    });
  },

  _initBancoTalentos() {
    // Botao novo talento
    document.getElementById('rhBtnNovoTalento')?.addEventListener('click', () => {
      this._openTalentoModal(null);
    });

    // Filtros
    let searchTimer = null;
    const searchInput = document.querySelector('.rh-talentos-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          this._talentsFilter.search = searchInput.value.trim();
          this._loadTalentos();
        }, 300);
      });
    }

    document.querySelector('.rh-talentos-filter-specialty')?.addEventListener('change', (e) => {
      this._talentsFilter.specialty = e.target.value;
      this._loadTalentos();
    });
    document.querySelector('.rh-talentos-filter-seniority')?.addEventListener('change', (e) => {
      this._talentsFilter.seniority = e.target.value;
      this._loadTalentos();
    });
    document.querySelector('.rh-talentos-filter-status')?.addEventListener('change', (e) => {
      this._talentsFilter.status = e.target.value;
      this._loadTalentos();
    });

    // Carregar dados iniciais se estiver na tab
    if (this._activeTab === 'banco-talentos') {
      this._loadTalentos();
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB: VAGAS
  // ══════════════════════════════════════════════════════════════════

  _vagasData: [],
  _vagasCount: 0,
  _vagasLoading: false,
  _vagasFilter: { status: '', area: '', priority: '', search: '' },
  _vagaDetalheId: null,

  _renderVagas() {
    // Se estiver mostrando detalhe de uma vaga, renderizar detalhe
    if (this._vagaDetalheId) {
      return this._pageHeader('Detalhe da Vaga', 'Pipeline de candidatos e informações da vaga') + this._renderVagaDetalhe();
    }

    const f = this._vagasFilter;
    return `
      ${this._pageHeader('Vagas', 'Gestão de vagas abertas e processo seletivo')}
      <div class="rh-vagas-section">
        <!-- KPIs -->
        <div id="rhVagasKPIs" class="grid-4" style="margin-bottom:20px;">
          ${this._renderVagasKPIs()}
        </div>

        <!-- Toolbar -->
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
          <input type="text" class="form-input rh-vagas-search" placeholder="Buscar vagas..." value="${f.search}" style="flex:1; min-width:200px;">
          <select class="form-input rh-vagas-filter-area" style="width:160px;">
            <option value="">Todas Areas</option>
            <option value="Branding" ${f.area==='Branding'?'selected':''}>Branding</option>
            <option value="Digital 3D" ${f.area==='Digital 3D'?'selected':''}>Digital 3D</option>
            <option value="Marketing" ${f.area==='Marketing'?'selected':''}>Marketing</option>
            <option value="Vendas" ${f.area==='Vendas'?'selected':''}>Vendas</option>
            <option value="Operacao" ${f.area==='Operacao'?'selected':''}>Operacao</option>
          </select>
          <select class="form-input rh-vagas-filter-status" style="width:140px;">
            <option value="">Todos Status</option>
            <option value="draft" ${f.status==='draft'?'selected':''}>Rascunho</option>
            <option value="open" ${f.status==='open'?'selected':''}>Aberta</option>
            <option value="in_progress" ${f.status==='in_progress'?'selected':''}>Em Andamento</option>
            <option value="paused" ${f.status==='paused'?'selected':''}>Pausada</option>
            <option value="closed" ${f.status==='closed'?'selected':''}>Fechada</option>
            <option value="filled" ${f.status==='filled'?'selected':''}>Preenchida</option>
          </select>
          <select class="form-input rh-vagas-filter-priority" style="width:130px;">
            <option value="">Prioridade</option>
            <option value="urgent" ${f.priority==='urgent'?'selected':''}>Urgente</option>
            <option value="high" ${f.priority==='high'?'selected':''}>Alta</option>
            <option value="medium" ${f.priority==='medium'?'selected':''}>Media</option>
            <option value="low" ${f.priority==='low'?'selected':''}>Baixa</option>
          </select>
          <button class="btn btn-primary" id="rhBtnNovaVaga" style="white-space:nowrap;">
            <i data-lucide="briefcase" style="width:16px;height:16px;"></i> Nova Vaga
          </button>
        </div>

        <!-- Tabela -->
        <div id="rhVagasTable" class="rh-tabela-card" style="overflow-x:auto;">
          ${this._renderVagasTable()}
        </div>
      </div>

      <!-- Modal Vaga -->
      <div id="rhVagaModal" class="modal-overlay" style="display:none;">
        <div class="modal" style="max-width:600px;">
          <div id="rhVagaModalContent"></div>
        </div>
      </div>
    `;
  },

  _renderVagasKPIs() {
    const all = this._vagasData || [];
    const open = all.filter(v => v.status === 'open').length;
    const inProg = all.filter(v => v.status === 'in_progress').length;
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const closedMonth = all.filter(v => v.closed_at && new Date(v.closed_at) >= firstOfMonth).length;
    return `
      <div class="kpi-card"><div class="kpi-label">Total Vagas</div><div class="kpi-value">${all.length}</div></div>
      <div class="kpi-card"><div class="kpi-label">Abertas</div><div class="kpi-value" style="color:var(--color-success)">${open}</div></div>
      <div class="kpi-card"><div class="kpi-label">Em Andamento</div><div class="kpi-value" style="color:var(--accent-gold)">${inProg}</div></div>
      <div class="kpi-card"><div class="kpi-label">Fechadas (mes)</div><div class="kpi-value" style="color:var(--text-muted)">${closedMonth}</div></div>
    `;
  },

  _vagaStatusLabel(s) {
    const map = { draft:'Rascunho', open:'Aberta', in_progress:'Em Andamento', paused:'Pausada', closed:'Fechada', filled:'Preenchida' };
    return map[s] || s || 'Aberta';
  },
  _vagaStatusColor(s) {
    const map = { draft:'#94A3B8', open:'#2ECC71', in_progress:'#F59E0B', paused:'#6B7280', closed:'#EF4444', filled:'#8B5CF6' };
    return map[s] || '#94A3B8';
  },
  _vagaPriorityLabel(p) {
    const map = { low:'Baixa', medium:'Media', high:'Alta', urgent:'Urgente' };
    return map[p] || p || 'Media';
  },
  _vagaPriorityColor(p) {
    const map = { low:'#94A3B8', medium:'#3B82F6', high:'#F59E0B', urgent:'#EF4444' };
    return map[p] || '#94A3B8';
  },

  _renderVagasTable() {
    if (this._vagasLoading) {
      return '<div style="padding:40px;text-align:center;"><div class="rh-skeleton" style="height:200px;border-radius:8px;"></div></div>';
    }
    const vagas = this._vagasData || [];
    if (!vagas.length) {
      return `<div class="empty-state" style="padding:60px 20px;text-align:center;">
        <i data-lucide="briefcase" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
        <h3 style="color:var(--text-muted);margin:0 0 4px;">Nenhuma vaga cadastrada</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Clique em "Nova Vaga" para criar uma vaga.</p>
      </div>`;
    }
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
    return `
      <table class="rh-bu-table">
        <thead><tr>
          <th>Titulo</th><th>Area</th><th>Status</th><th>Prioridade</th><th>Abertura</th><th style="width:80px;">Acoes</th>
        </tr></thead>
        <tbody>
          ${vagas.map(v => `
            <tr class="rh-bu-row rh-person-row rh-vaga-row" data-id="${v.id}" style="cursor:pointer;">
              <td style="font-weight:600;">${esc(v.title)}</td>
              <td>${esc(v.area)}</td>
              <td><span class="tag" style="background:${this._vagaStatusColor(v.status)}20;color:${this._vagaStatusColor(v.status)};font-size:0.7rem;">${this._vagaStatusLabel(v.status)}</span></td>
              <td><span class="tag" style="background:${this._vagaPriorityColor(v.priority)}20;color:${this._vagaPriorityColor(v.priority)};font-size:0.7rem;">${this._vagaPriorityLabel(v.priority)}</span></td>
              <td style="font-size:0.78rem;">${formatDate(v.opened_at)}</td>
              <td>
                <div style="display:flex;gap:4px;">
                  <button class="btn btn-sm rh-vaga-edit" data-id="${v.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
                  <button class="btn btn-sm rh-vaga-close" data-id="${v.id}" title="Fechar vaga" ${v.status==='closed'||v.status==='filled'?'disabled':''}><i data-lucide="x-circle" style="width:14px;height:14px;"></i></button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  _renderVagaDetalhe() {
    const vaga = this._vagasData.find(v => v.id === this._vagaDetalheId);
    if (!vaga) {
      this._vagaDetalheId = null;
      return this._renderVagas();
    }
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';

    return `
      <div class="rh-vaga-detalhe">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:12px;">
            <button class="btn btn-secondary btn-sm" id="rhVagaVoltarLista"><i data-lucide="arrow-left" style="width:16px;height:16px;"></i> Voltar</button>
            <h2 style="margin:0;">${esc(vaga.title)}</h2>
            <span class="tag" style="background:${this._vagaStatusColor(vaga.status)}20;color:${this._vagaStatusColor(vaga.status)};">${this._vagaStatusLabel(vaga.status)}</span>
          </div>
          <button class="btn btn-primary btn-sm" id="rhVagaVincularTalento"><i data-lucide="link" style="width:14px;height:14px;"></i> Vincular Talento</button>
        </div>

        <div class="grid-2" style="gap:20px;margin-bottom:24px;">
          <div class="card" style="padding:16px;">
            <h4 style="margin:0 0 8px;font-size:0.85rem;color:var(--text-muted);">Informacoes</h4>
            <p style="margin:4px 0;font-size:0.85rem;"><strong>Area:</strong> ${esc(vaga.area) || '-'}</p>
            <p style="margin:4px 0;font-size:0.85rem;"><strong>Prioridade:</strong> ${this._vagaPriorityLabel(vaga.priority)}</p>
            <p style="margin:4px 0;font-size:0.85rem;"><strong>Abertura:</strong> ${formatDate(vaga.opened_at)}</p>
            ${vaga.closed_at ? `<p style="margin:4px 0;font-size:0.85rem;"><strong>Fechamento:</strong> ${formatDate(vaga.closed_at)}</p>` : ''}
          </div>
          <div class="card" style="padding:16px;">
            <h4 style="margin:0 0 8px;font-size:0.85rem;color:var(--text-muted);">Descricao</h4>
            <p style="font-size:0.85rem;white-space:pre-wrap;">${esc(vaga.description) || 'Sem descricao'}</p>
            ${vaga.requirements ? `<h4 style="margin:12px 0 8px;font-size:0.85rem;color:var(--text-muted);">Requisitos</h4><p style="font-size:0.85rem;white-space:pre-wrap;">${esc(vaga.requirements)}</p>` : ''}
          </div>
        </div>

        <!-- Pipeline de candidatos -->
        <h3 style="margin:0 0 12px;">Candidatos Vinculados</h3>
        <div id="rhVagaCandidatos">
          <div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.85rem;">Carregando candidatos...</div>
        </div>
      </div>

      <!-- Modal Vincular Talento -->
      <div id="rhVinculaTalentoModal" class="modal-overlay" style="display:none;">
        <div class="modal" style="max-width:500px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <h3 style="margin:0;">Vincular Talento</h3>
            <button class="btn btn-sm" id="rhVinculaTalentoClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
          </div>
          <input type="text" class="form-input" id="rhVinculaTalentoBusca" placeholder="Buscar por nome ou email..." style="margin-bottom:12px;">
          <div id="rhVinculaTalentoResults" style="max-height:300px;overflow-y:auto;"></div>
        </div>
      </div>
    `;
  },

  _stageLabel(s) {
    const map = { applied:'Inscrito', screening:'Triagem', interview:'Entrevista', offer:'Proposta', hired:'Contratado', rejected:'Rejeitado' };
    return map[s] || s || 'Inscrito';
  },
  _stageColor(s) {
    const map = { applied:'#94A3B8', screening:'#3B82F6', interview:'#F59E0B', offer:'#8B5CF6', hired:'#2ECC71', rejected:'#EF4444' };
    return map[s] || '#94A3B8';
  },

  async _loadVagaCandidatos() {
    if (typeof TalentsRepo === 'undefined' || !this._vagaDetalheId) return;
    const container = document.getElementById('rhVagaCandidatos');
    if (!container) return;

    try {
      const candidates = await TalentsRepo.getByVacancy(this._vagaDetalheId);
      if (!candidates.length) {
        container.innerHTML = `<div class="empty-state" style="padding:30px;text-align:center;">
          <i data-lucide="users" style="width:36px;height:36px;color:var(--text-muted);margin-bottom:8px;"></i>
          <p style="color:var(--text-muted);font-size:0.85rem;">Nenhum candidato vinculado a esta vaga.</p>
        </div>`;
        if (window.lucide) lucide.createIcons({ root: container });
        return;
      }

      const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
      const stages = ['applied','screening','interview','offer','hired','rejected'];

      container.innerHTML = `
        <table class="rh-bu-table">
          <thead><tr><th>Nome</th><th>Especialidade</th><th>Etapa</th><th style="width:120px;">Acoes</th></tr></thead>
          <tbody>
            ${candidates.map(c => {
              const t = c.talents || {};
              return `
                <tr class="rh-bu-row">
                  <td style="font-weight:600;">${esc(t.full_name)}</td>
                  <td>${esc(t.specialty)}</td>
                  <td>
                    <select class="form-input rh-candidate-stage" data-talent="${c.talent_id}" style="font-size:0.78rem;padding:4px 8px;">
                      ${stages.map(s => `<option value="${s}" ${c.stage===s?'selected':''}>${this._stageLabel(s)}</option>`).join('')}
                    </select>
                  </td>
                  <td>
                    <button class="btn btn-sm rh-candidate-unlink" data-talent="${c.talent_id}" title="Desvincular"><i data-lucide="unlink" style="width:14px;height:14px;"></i></button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `;
      if (window.lucide) lucide.createIcons({ root: container });

      // Bind stage change
      container.querySelectorAll('.rh-candidate-stage').forEach(sel => {
        sel.addEventListener('change', async () => {
          try {
            await TalentsRepo.updateCandidateStage(sel.dataset.talent, this._vagaDetalheId, sel.value);
            TBO_TOAST.success('Etapa atualizada');
          } catch (e) { TBO_TOAST.error('Erro ao atualizar etapa'); }
        });
      });

      // Bind unlink
      container.querySelectorAll('.rh-candidate-unlink').forEach(btn => {
        btn.addEventListener('click', async () => {
          if (!confirm('Desvincular este candidato da vaga?')) return;
          try {
            await TalentsRepo.unlinkFromVacancy(btn.dataset.talent, this._vagaDetalheId);
            TBO_TOAST.success('Candidato desvinculado');
            this._loadVagaCandidatos();
          } catch (e) { TBO_TOAST.error('Erro ao desvincular'); }
        });
      });
    } catch (err) {
      console.error('[RH] Erro ao carregar candidatos:', err);
      container.innerHTML = '<p style="color:var(--color-danger);padding:12px;">Erro ao carregar candidatos.</p>';
    }
  },

  _renderVagaModalContent(vaga) {
    const v = vaga || {};
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="margin:0;">${v.id ? 'Editar Vaga' : 'Nova Vaga'}</h3>
        <button class="btn btn-sm" id="rhVagaModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <form id="rhVagaForm">
        <input type="hidden" id="rhVagaId" value="${v.id || ''}">
        <div style="margin-bottom:12px;">
          <label class="form-label">Titulo *</label>
          <input class="form-input" id="rhVagaTitulo" value="${esc(v.title)}" required>
        </div>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Area</label>
            <select class="form-input" id="rhVagaArea">
              <option value="">Selecionar...</option>
              <option value="Branding" ${v.area==='Branding'?'selected':''}>Branding</option>
              <option value="Digital 3D" ${v.area==='Digital 3D'?'selected':''}>Digital 3D</option>
              <option value="Marketing" ${v.area==='Marketing'?'selected':''}>Marketing</option>
              <option value="Vendas" ${v.area==='Vendas'?'selected':''}>Vendas</option>
              <option value="Operacao" ${v.area==='Operacao'?'selected':''}>Operacao</option>
            </select>
          </div>
          <div><label class="form-label">Prioridade</label>
            <select class="form-input" id="rhVagaPrioridade">
              <option value="low" ${v.priority==='low'?'selected':''}>Baixa</option>
              <option value="medium" ${v.priority==='medium'||!v.priority?'selected':''}>Media</option>
              <option value="high" ${v.priority==='high'?'selected':''}>Alta</option>
              <option value="urgent" ${v.priority==='urgent'?'selected':''}>Urgente</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:12px;">
          <label class="form-label">Descricao</label>
          <textarea class="form-input" id="rhVagaDescricao" rows="3">${esc(v.description)}</textarea>
        </div>
        <div style="margin-bottom:12px;">
          <label class="form-label">Requisitos</label>
          <textarea class="form-input" id="rhVagaRequisitos" rows="3">${esc(v.requirements)}</textarea>
        </div>
        <div style="margin-bottom:16px;">
          <label class="form-label">Notas</label>
          <textarea class="form-input" id="rhVagaNotas" rows="2">${esc(v.notes)}</textarea>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" id="rhVagaCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary">Salvar</button>
        </div>
      </form>
    `;
  },

  async _loadVagas() {
    if (typeof VacanciesRepo === 'undefined') return;
    this._vagasLoading = true;
    const tableEl = document.getElementById('rhVagasTable');
    if (tableEl) tableEl.innerHTML = this._renderVagasTable();

    try {
      const f = this._vagasFilter;
      const opts = {};
      if (f.status) opts.status = f.status;
      if (f.area) opts.area = f.area;
      if (f.priority) opts.priority = f.priority;
      if (f.search) opts.search = f.search;

      const result = await VacanciesRepo.list(opts);
      this._vagasData = result.data;
      this._vagasCount = result.count;
    } catch (err) {
      console.error('[RH] Erro ao carregar vagas:', err);
      TBO_TOAST.error('Erro ao carregar vagas');
      this._vagasData = [];
    }
    this._vagasLoading = false;

    if (tableEl) {
      tableEl.innerHTML = this._renderVagasTable();
      if (window.lucide) lucide.createIcons({ root: tableEl });
      this._bindVagasActions();
    }
    const kpis = document.getElementById('rhVagasKPIs');
    if (kpis) { kpis.innerHTML = this._renderVagasKPIs(); }
  },

  _bindVagasActions() {
    // Clicar na linha abre detalhe
    document.querySelectorAll('.rh-vaga-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('button')) return; // nao abrir se clicou em acao
        this._vagaDetalheId = row.dataset.id;
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = this._renderActiveTab();
          this._initActiveTab();
          if (window.lucide) lucide.createIcons();
        }
      });
    });

    document.querySelectorAll('.rh-vaga-edit').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const vaga = this._vagasData.find(v => v.id === btn.dataset.id);
        if (vaga) this._openVagaModal(vaga);
      });
    });

    document.querySelectorAll('.rh-vaga-close').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Fechar esta vaga?')) return;
        try {
          await VacanciesRepo.close(btn.dataset.id);
          TBO_TOAST.success('Vaga fechada');
          this._loadVagas();
        } catch (e) { TBO_TOAST.error('Erro ao fechar vaga'); }
      });
    });
  },

  _openVagaModal(vaga) {
    const modal = document.getElementById('rhVagaModal');
    const content = document.getElementById('rhVagaModalContent');
    if (!modal || !content) return;
    content.innerHTML = this._renderVagaModalContent(vaga);
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons({ root: modal });

    document.getElementById('rhVagaModalClose')?.addEventListener('click', () => { modal.style.display = 'none'; });
    document.getElementById('rhVagaCancel')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('rhVagaForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('rhVagaId')?.value;

      const payload = {
        title: document.getElementById('rhVagaTitulo')?.value?.trim(),
        area: document.getElementById('rhVagaArea')?.value || null,
        priority: document.getElementById('rhVagaPrioridade')?.value || 'medium',
        description: document.getElementById('rhVagaDescricao')?.value?.trim() || null,
        requirements: document.getElementById('rhVagaRequisitos')?.value?.trim() || null,
        notes: document.getElementById('rhVagaNotas')?.value?.trim() || null,
      };

      if (!payload.title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }

      try {
        if (id) { await VacanciesRepo.update(id, payload); TBO_TOAST.success('Vaga atualizada!'); }
        else { await VacanciesRepo.create(payload); TBO_TOAST.success('Vaga criada!'); }
        modal.style.display = 'none';
        this._loadVagas();
      } catch (err) {
        console.error('[RH] Erro ao salvar vaga:', err);
        TBO_TOAST.error('Erro ao salvar vaga');
      }
    });
  },

  _initVagas() {
    // Botao nova vaga
    document.getElementById('rhBtnNovaVaga')?.addEventListener('click', () => {
      this._openVagaModal(null);
    });

    // Voltar da view detalhe
    document.getElementById('rhVagaVoltarLista')?.addEventListener('click', () => {
      this._vagaDetalheId = null;
      const tabContent = document.getElementById('rhTabContent');
      if (tabContent) {
        tabContent.innerHTML = this._renderActiveTab();
        this._initActiveTab();
        if (window.lucide) lucide.createIcons();
      }
    });

    // Vincular talento (na view detalhe)
    document.getElementById('rhVagaVincularTalento')?.addEventListener('click', () => {
      const modal = document.getElementById('rhVinculaTalentoModal');
      if (modal) {
        modal.style.display = 'flex';
        if (window.lucide) lucide.createIcons({ root: modal });
      }
    });
    document.getElementById('rhVinculaTalentoClose')?.addEventListener('click', () => {
      const modal = document.getElementById('rhVinculaTalentoModal');
      if (modal) modal.style.display = 'none';
    });

    // Busca de talentos para vincular
    let vinculaTimer = null;
    document.getElementById('rhVinculaTalentoBusca')?.addEventListener('input', (e) => {
      clearTimeout(vinculaTimer);
      vinculaTimer = setTimeout(async () => {
        const query = e.target.value.trim();
        const results = document.getElementById('rhVinculaTalentoResults');
        if (!results || !query || query.length < 2) { if (results) results.innerHTML = ''; return; }

        try {
          const talents = await TalentsRepo.search(query);
          const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
          if (!talents.length) {
            results.innerHTML = '<p style="padding:12px;color:var(--text-muted);text-align:center;">Nenhum talento encontrado.</p>';
            return;
          }
          results.innerHTML = talents.map(t => `
            <div class="rh-vincula-talent-item" data-id="${t.id}" style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--border-subtle);cursor:pointer;transition:background 0.15s;">
              <div>
                <div style="font-weight:600;font-size:0.85rem;">${esc(t.full_name)}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${esc(t.specialty)} · ${esc(t.seniority)}</div>
              </div>
              <button class="btn btn-sm btn-primary rh-vincula-btn" data-id="${t.id}">Vincular</button>
            </div>
          `).join('');

          results.querySelectorAll('.rh-vincula-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
              try {
                await TalentsRepo.linkToVacancy(btn.dataset.id, this._vagaDetalheId);
                TBO_TOAST.success('Talento vinculado a vaga!');
                document.getElementById('rhVinculaTalentoModal').style.display = 'none';
                this._loadVagaCandidatos();
              } catch (e) {
                if (e.message?.includes('duplicate')) TBO_TOAST.warning('Talento ja vinculado');
                else TBO_TOAST.error('Erro ao vincular talento');
              }
            });
          });
        } catch (e) { results.innerHTML = '<p style="padding:12px;color:var(--color-danger);">Erro na busca.</p>'; }
      }, 300);
    });

    // Filtros
    let searchTimer = null;
    const searchInput = document.querySelector('.rh-vagas-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          this._vagasFilter.search = searchInput.value.trim();
          this._loadVagas();
        }, 300);
      });
    }

    document.querySelector('.rh-vagas-filter-area')?.addEventListener('change', (e) => {
      this._vagasFilter.area = e.target.value;
      this._loadVagas();
    });
    document.querySelector('.rh-vagas-filter-status')?.addEventListener('change', (e) => {
      this._vagasFilter.status = e.target.value;
      this._loadVagas();
    });
    document.querySelector('.rh-vagas-filter-priority')?.addEventListener('change', (e) => {
      this._vagasFilter.priority = e.target.value;
      this._loadVagas();
    });

    // Carregar dados iniciais se estiver na tab
    if (this._activeTab === 'vagas') {
      this._loadVagas();
      // Se estiver mostrando detalhe, carregar candidatos tambem
      if (this._vagaDetalheId) {
        this._loadVagaCandidatos();
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // TAB: CONTRATOS (RESTRITA: Admin/Diretoria/Financeiro)
  // ══════════════════════════════════════════════════════════════════

  _contratosData: [],
  _contratosCount: 0,
  _contratosLoading: false,
  _contratosFilter: { status: '', type: '', search: '' },

  _renderContratos() {
    if (!this._canSeeContracts()) {
      return '<div class="empty-state" style="padding:60px;text-align:center;"><p style="color:var(--text-muted);">Acesso restrito.</p></div>';
    }

    const f = this._contratosFilter;
    return `
      ${this._pageHeader('Contratos', 'Gestão de contratos PJ, NDA, aditivos e freelancers')}
      <div class="rh-contratos-section">
        <!-- KPIs -->
        <div id="rhContratosKPIs" class="grid-4" style="margin-bottom:20px;">
          ${this._renderContratosKPIs()}
        </div>

        <!-- Toolbar -->
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap;">
          <input type="text" class="form-input rh-contratos-search" placeholder="Buscar contratos..." value="${f.search}" style="flex:1; min-width:200px;">
          <select class="form-input rh-contratos-filter-type" style="width:140px;">
            <option value="">Todos Tipos</option>
            <option value="pj" ${f.type==='pj'?'selected':''}>PJ</option>
            <option value="clt" ${f.type==='clt'?'selected':''}>CLT</option>
            <option value="nda" ${f.type==='nda'?'selected':''}>NDA</option>
            <option value="aditivo" ${f.type==='aditivo'?'selected':''}>Aditivo</option>
            <option value="freelancer" ${f.type==='freelancer'?'selected':''}>Freelancer</option>
            <option value="outro" ${f.type==='outro'?'selected':''}>Outro</option>
          </select>
          <select class="form-input rh-contratos-filter-status" style="width:140px;">
            <option value="">Todos Status</option>
            <option value="draft" ${f.status==='draft'?'selected':''}>Rascunho</option>
            <option value="active" ${f.status==='active'?'selected':''}>Ativo</option>
            <option value="expired" ${f.status==='expired'?'selected':''}>Expirado</option>
            <option value="cancelled" ${f.status==='cancelled'?'selected':''}>Cancelado</option>
            <option value="renewed" ${f.status==='renewed'?'selected':''}>Renovado</option>
          </select>
          <button class="btn btn-primary" id="rhBtnNovoContrato" style="white-space:nowrap;">
            <i data-lucide="file-plus" style="width:16px;height:16px;"></i> Novo Contrato
          </button>
        </div>

        <!-- Tabela -->
        <div id="rhContratosTable" class="rh-tabela-card" style="overflow-x:auto;">
          ${this._renderContratosTable()}
        </div>
      </div>

      <!-- Modal Contrato -->
      <div id="rhContratoModal" class="modal-overlay" style="display:none;">
        <div class="modal" style="max-width:600px;">
          <div id="rhContratoModalContent"></div>
        </div>
      </div>
    `;
  },

  _renderContratosKPIs() {
    const all = this._contratosData || [];
    const ativos = all.filter(c => c.status === 'active').length;
    const custoTotal = all.filter(c => c.status === 'active').reduce((s, c) => s + (parseFloat(c.monthly_value) || 0), 0);
    const now = new Date();
    const in30d = new Date(); in30d.setDate(in30d.getDate() + 30);
    const vencendo = all.filter(c => c.status === 'active' && c.end_date && new Date(c.end_date) >= now && new Date(c.end_date) <= in30d).length;
    const fmt = (v) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
    return `
      <div class="kpi-card"><div class="kpi-label">Total Ativos</div><div class="kpi-value">${ativos}</div></div>
      <div class="kpi-card"><div class="kpi-label">Custo Mensal Total</div><div class="kpi-value" style="font-size:1.1rem;">${fmt(custoTotal)}</div></div>
      <div class="kpi-card"><div class="kpi-label">Vencendo 30d</div><div class="kpi-value" style="color:${vencendo > 0 ? 'var(--color-danger)' : 'var(--text-muted)'}">${vencendo}</div></div>
      <div class="kpi-card"><div class="kpi-label">Total Cadastrados</div><div class="kpi-value">${all.length}</div></div>
    `;
  },

  _contratoTypeLabel(t) {
    const map = { pj:'PJ', nda:'NDA', aditivo:'Aditivo', freelancer:'Freelancer', clt:'CLT', outro:'Outro' };
    return map[t] || t || 'PJ';
  },
  _contratoTypeColor(t) {
    const map = { pj:'#3B82F6', nda:'#8B5CF6', aditivo:'#F59E0B', freelancer:'#2ECC71', clt:'#EC4899', outro:'#94A3B8' };
    return map[t] || '#94A3B8';
  },
  _contratoStatusLabel(s) {
    const map = { draft:'Rascunho', active:'Ativo', expired:'Expirado', cancelled:'Cancelado', renewed:'Renovado' };
    return map[s] || s || 'Ativo';
  },
  _contratoStatusColor(s) {
    const map = { draft:'#94A3B8', active:'#2ECC71', expired:'#EF4444', cancelled:'#6B7280', renewed:'#3B82F6' };
    return map[s] || '#94A3B8';
  },

  _renderContratosTable() {
    if (this._contratosLoading) {
      return '<div style="padding:40px;text-align:center;"><div class="rh-skeleton" style="height:200px;border-radius:8px;"></div></div>';
    }
    const contratos = this._contratosData || [];
    if (!contratos.length) {
      return `<div class="empty-state" style="padding:60px 20px;text-align:center;">
        <i data-lucide="file-text" style="width:48px;height:48px;color:var(--text-muted);margin-bottom:12px;"></i>
        <h3 style="color:var(--text-muted);margin:0 0 4px;">Nenhum contrato cadastrado</h3>
        <p style="color:var(--text-muted);font-size:0.85rem;">Clique em "Novo Contrato" para adicionar.</p>
      </div>`;
    }
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    const formatDate = (d) => d ? new Date(d).toLocaleDateString('pt-BR') : '-';
    const fmt = (v) => v ? parseFloat(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) : '-';

    return `
      <table class="rh-bu-table">
        <thead><tr>
          <th>Pessoa</th><th>Tipo</th><th>Titulo</th><th>Inicio</th><th>Fim</th><th>Status</th><th>Valor/mes</th><th>PDF</th><th style="width:60px;">Acoes</th>
        </tr></thead>
        <tbody>
          ${contratos.map(c => `
            <tr class="rh-bu-row">
              <td style="font-weight:600;">${esc(c.person_name) || '-'}</td>
              <td><span class="tag" style="background:${this._contratoTypeColor(c.type)}20;color:${this._contratoTypeColor(c.type)};font-size:0.7rem;">${this._contratoTypeLabel(c.type)}</span></td>
              <td>${esc(c.title)}</td>
              <td style="font-size:0.78rem;">${formatDate(c.start_date)}</td>
              <td style="font-size:0.78rem;">${formatDate(c.end_date)}</td>
              <td><span class="tag" style="background:${this._contratoStatusColor(c.status)}20;color:${this._contratoStatusColor(c.status)};font-size:0.7rem;">${this._contratoStatusLabel(c.status)}</span></td>
              <td style="font-weight:600;font-size:0.85rem;">${fmt(c.monthly_value)}</td>
              <td>${c.file_url ? `<a href="${esc(c.file_url)}" target="_blank" title="${esc(c.file_name)}"><i data-lucide="download" style="width:16px;height:16px;color:var(--accent-gold);"></i></a>` : '<span style="color:var(--text-muted);font-size:0.75rem;">-</span>'}</td>
              <td>
                <button class="btn btn-sm rh-contrato-edit" data-id="${c.id}" title="Editar"><i data-lucide="pencil" style="width:14px;height:14px;"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  _renderContratoModalContent(contract) {
    const c = contract || {};
    const esc = (s) => typeof TBO_SANITIZE !== 'undefined' ? TBO_SANITIZE.html(s||'') : (s||'').replace(/</g,'&lt;');
    // Lista de pessoas do time para select
    const team = this._getInternalTeam();
    const personOptions = team.map(p => {
      const name = p.nome || p.full_name || '';
      const id = p.supabaseId || p.id || '';
      return `<option value="${id}" ${c.person_id === id ? 'selected' : ''}>${esc(name)}</option>`;
    }).join('');

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <h3 style="margin:0;">${c.id ? 'Editar Contrato' : 'Novo Contrato'}</h3>
        <button class="btn btn-sm" id="rhContratoModalClose"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
      </div>
      <form id="rhContratoForm">
        <input type="hidden" id="rhContratoId" value="${c.id || ''}">
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Pessoa</label>
            <select class="form-input" id="rhContratoPessoa">
              <option value="">Selecionar ou digitar abaixo...</option>
              ${personOptions}
            </select>
          </div>
          <div><label class="form-label">Nome (se nao listado)</label>
            <input class="form-input" id="rhContratoPessoaNome" value="${esc(c.person_name)}" placeholder="Nome manual">
          </div>
        </div>
        <div class="grid-2" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Tipo *</label>
            <select class="form-input" id="rhContratoTipo" required>
              <option value="pj" ${c.type==='pj'||!c.type?'selected':''}>PJ</option>
              <option value="clt" ${c.type==='clt'?'selected':''}>CLT</option>
              <option value="nda" ${c.type==='nda'?'selected':''}>NDA</option>
              <option value="aditivo" ${c.type==='aditivo'?'selected':''}>Aditivo</option>
              <option value="freelancer" ${c.type==='freelancer'?'selected':''}>Freelancer</option>
              <option value="outro" ${c.type==='outro'?'selected':''}>Outro</option>
            </select>
          </div>
          <div><label class="form-label">Status</label>
            <select class="form-input" id="rhContratoStatus">
              <option value="draft" ${c.status==='draft'?'selected':''}>Rascunho</option>
              <option value="active" ${c.status==='active'||!c.status?'selected':''}>Ativo</option>
              <option value="expired" ${c.status==='expired'?'selected':''}>Expirado</option>
              <option value="cancelled" ${c.status==='cancelled'?'selected':''}>Cancelado</option>
              <option value="renewed" ${c.status==='renewed'?'selected':''}>Renovado</option>
            </select>
          </div>
        </div>
        <div style="margin-bottom:12px;">
          <label class="form-label">Titulo *</label>
          <input class="form-input" id="rhContratoTitulo" value="${esc(c.title)}" required>
        </div>
        <div style="margin-bottom:12px;">
          <label class="form-label">Descricao</label>
          <textarea class="form-input" id="rhContratoDescricao" rows="2">${esc(c.description)}</textarea>
        </div>
        <div class="grid-3" style="gap:12px;margin-bottom:12px;">
          <div><label class="form-label">Data Inicio</label><input class="form-input" id="rhContratoInicio" type="date" value="${c.start_date || ''}"></div>
          <div><label class="form-label">Data Fim</label><input class="form-input" id="rhContratoFim" type="date" value="${c.end_date || ''}"></div>
          <div><label class="form-label">Valor Mensal (R$)</label><input class="form-input" id="rhContratoValor" type="number" step="0.01" min="0" value="${c.monthly_value || ''}"></div>
        </div>
        <div style="margin-bottom:16px;">
          <label class="form-label">Arquivo PDF</label>
          <input type="file" class="form-input" id="rhContratoFile" accept=".pdf,.doc,.docx">
          ${c.file_name ? `<p style="font-size:0.78rem;color:var(--text-muted);margin-top:4px;">Atual: ${esc(c.file_name)}</p>` : ''}
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button type="button" class="btn btn-secondary" id="rhContratoCancel">Cancelar</button>
          <button type="submit" class="btn btn-primary" id="rhContratoSubmit">Salvar</button>
        </div>
      </form>
    `;
  },

  async _loadContratos() {
    if (typeof ContractsRepo === 'undefined') return;
    this._contratosLoading = true;
    const tableEl = document.getElementById('rhContratosTable');
    if (tableEl) tableEl.innerHTML = this._renderContratosTable();

    try {
      const f = this._contratosFilter;
      const opts = {};
      if (f.status) opts.status = f.status;
      if (f.type) opts.type = f.type;
      if (f.search) opts.search = f.search;

      const result = await ContractsRepo.list(opts);
      this._contratosData = result.data;
      this._contratosCount = result.count;
    } catch (err) {
      console.error('[RH] Erro ao carregar contratos:', err);
      TBO_TOAST.error('Erro ao carregar contratos');
      this._contratosData = [];
    }
    this._contratosLoading = false;

    if (tableEl) {
      tableEl.innerHTML = this._renderContratosTable();
      if (window.lucide) lucide.createIcons({ root: tableEl });
      this._bindContratosActions();
    }
    const kpis = document.getElementById('rhContratosKPIs');
    if (kpis) { kpis.innerHTML = this._renderContratosKPIs(); }
  },

  _bindContratosActions() {
    document.querySelectorAll('.rh-contrato-edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (typeof ContractsRepo === 'undefined') return;
        try {
          const contract = await ContractsRepo.getById(btn.dataset.id);
          this._openContratoModal(contract);
        } catch (e) { TBO_TOAST.error('Erro ao carregar contrato'); }
      });
    });
  },

  _openContratoModal(contract) {
    const modal = document.getElementById('rhContratoModal');
    const content = document.getElementById('rhContratoModalContent');
    if (!modal || !content) return;
    content.innerHTML = this._renderContratoModalContent(contract);
    modal.style.display = 'flex';
    if (window.lucide) lucide.createIcons({ root: modal });

    document.getElementById('rhContratoModalClose')?.addEventListener('click', () => { modal.style.display = 'none'; });
    document.getElementById('rhContratoCancel')?.addEventListener('click', () => { modal.style.display = 'none'; });
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    document.getElementById('rhContratoForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('rhContratoId')?.value;
      const personId = document.getElementById('rhContratoPessoa')?.value || null;
      const personName = document.getElementById('rhContratoPessoaNome')?.value?.trim() || null;
      const fileInput = document.getElementById('rhContratoFile');

      // Resolver person_name: se selecionou pessoa, pegar nome do time
      let resolvedName = personName;
      if (personId) {
        const person = this._getInternalTeam().find(p => (p.supabaseId || p.id) === personId);
        resolvedName = person?.nome || person?.full_name || personName;
      }

      const payload = {
        person_id: personId,
        person_name: resolvedName,
        type: document.getElementById('rhContratoTipo')?.value || 'pj',
        title: document.getElementById('rhContratoTitulo')?.value?.trim(),
        description: document.getElementById('rhContratoDescricao')?.value?.trim() || null,
        start_date: document.getElementById('rhContratoInicio')?.value || null,
        end_date: document.getElementById('rhContratoFim')?.value || null,
        status: document.getElementById('rhContratoStatus')?.value || 'active',
        monthly_value: parseFloat(document.getElementById('rhContratoValor')?.value) || null,
      };

      if (!payload.title) { TBO_TOAST.warning('Titulo e obrigatorio'); return; }

      const submitBtn = document.getElementById('rhContratoSubmit');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Salvando...'; }

      try {
        let saved;
        if (id) { saved = await ContractsRepo.update(id, payload); }
        else { saved = await ContractsRepo.create(payload); }

        // Upload de arquivo se selecionado
        if (fileInput?.files?.length > 0 && saved?.id) {
          try {
            await ContractsRepo.uploadFile(saved.id, fileInput.files[0]);
          } catch (upErr) {
            console.error('[RH] Erro no upload:', upErr);
            TBO_TOAST.warning('Contrato salvo, mas erro no upload do arquivo');
          }
        }

        TBO_TOAST.success(id ? 'Contrato atualizado!' : 'Contrato criado!');
        modal.style.display = 'none';
        this._loadContratos();
      } catch (err) {
        console.error('[RH] Erro ao salvar contrato:', err);
        TBO_TOAST.error('Erro ao salvar contrato');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Salvar'; }
      }
    });
  },

  _initContratos() {
    // Botao novo contrato
    document.getElementById('rhBtnNovoContrato')?.addEventListener('click', () => {
      this._openContratoModal(null);
    });

    // Filtros
    let searchTimer = null;
    const searchInput = document.querySelector('.rh-contratos-search');
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          this._contratosFilter.search = searchInput.value.trim();
          this._loadContratos();
        }, 300);
      });
    }

    document.querySelector('.rh-contratos-filter-type')?.addEventListener('change', (e) => {
      this._contratosFilter.type = e.target.value;
      this._loadContratos();
    });
    document.querySelector('.rh-contratos-filter-status')?.addEventListener('change', (e) => {
      this._contratosFilter.status = e.target.value;
      this._loadContratos();
    });

    // Carregar dados iniciais se estiver na tab
    if (this._activeTab === 'contratos' && this._canSeeContracts()) {
      this._loadContratos();
    }
  },

  // ══════════════════════════════════════════════════════════════════
  // SCOPED CSS
  // ══════════════════════════════════════════════════════════════════

  _getScopedCSS() {
    return `
      /* ── Cards grid ── */
      .rh-people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
      .rh-person-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 16px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
      .rh-person-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(232,81,2,0.1); }
      .rh-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }

      /* ── Drawer (perfil Asana-style) ── */
      .rh-drawer { position: fixed; top: 0; right: 0; width: 460px; max-width: 92vw; height: 100vh; background: var(--bg-card, var(--bg-primary)); border-left: 1px solid var(--border-subtle); box-shadow: -4px 0 20px rgba(0,0,0,0.18); z-index: 1100; overflow-y: auto; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
      .rh-drawer.rh-drawer-open { transform: translateX(0); }
      .rh-drawer-content { padding: 24px; }
      .rh-profile-section { background: var(--bg-elevated); border-radius: var(--radius-md, 8px); padding: 16px; }
      .rh-colleague-chip:hover { background: var(--bg-tertiary) !important; }

      /* ── Organograma (org chart tree) ── */
      .rh-org-tree { display: flex; flex-direction: column; gap: 0; padding-left: 0; }
      .rh-org-node { position: relative; }
      .rh-org-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px; margin: 3px 0; transition: border-color 0.2s, box-shadow 0.2s; }
      .rh-org-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(232,81,2,0.08); }
      .rh-org-children { margin-left: 32px; padding-left: 16px; border-left: 2px solid var(--border-subtle); }
      .rh-org-collapsed { display: none; }
      .rh-org-connector { display: none; }
      .rh-org-toggle { opacity: 0.7; transition: opacity 0.15s; }
      .rh-org-toggle:hover { opacity: 1; }

      /* ── Tabela por BU (estilo Notion) ── */
      .rh-bu-table { width: 100%; border-collapse: collapse; }
      .rh-bu-table thead th { position: sticky; top: 0; background: var(--bg-elevated); z-index: 2; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; padding: 10px 12px; border-bottom: 2px solid var(--border-subtle); }
      .rh-bu-table tbody td { padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem; }
      .rh-bu-group-header td { font-weight: 700; }
      .rh-bu-row { transition: background 0.15s; }
      .rh-bu-row:hover { background: var(--bg-elevated); }
      .rh-person-row { cursor: pointer; }
      .rh-tabela-card { border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); }

      /* ── Sort headers ── */
      .rh-sort-header { user-select: none; }
      .rh-sort-header:hover { background: var(--bg-tertiary) !important; }
      .rh-sort-header div { display: inline-flex; align-items: center; gap: 3px; }

      /* ── Context menu (acoes por usuario) ── */
      .rh-context-menu { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); overflow: hidden; min-width: 200px; }
      .rh-ctx-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 14px; border: none; background: none; cursor: pointer; font-size: 0.78rem; color: var(--text-primary); transition: background 0.12s; text-align: left; }
      .rh-ctx-item:hover { background: var(--bg-elevated); }
      .rh-ctx-danger { color: var(--color-danger); }
      .rh-ctx-danger:hover { background: var(--color-danger)08; }

      /* ── Pagination ── */
      .rh-pagination { border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); }
      .rh-page-btn:disabled { opacity: 0.3; pointer-events: none; }

      /* ── Subtabs ── */
      .subtab-content { display: none; }
      .subtab-content.active { display: block; }

      /* ── Skeleton loading ── */
      .rh-skeleton { background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%); background-size: 200% 100%; animation: rh-shimmer 1.5s ease-in-out infinite; }
      @keyframes rh-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .rh-skeleton-card { opacity: 0.7; }

      /* ── Modal overlay (Banco de Talentos, Vagas, Contratos) ── */
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1200; display: flex; align-items: center; justify-content: center; }
      .modal { background: var(--bg-primary); border-radius: var(--radius-md, 12px); padding: 24px; max-height: 90vh; overflow-y: auto; box-shadow: 0 12px 40px rgba(0,0,0,0.25); }
      .rh-vincula-talent-item:hover { background: var(--bg-elevated); }
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // INIT (Event Bindings)
  // ══════════════════════════════════════════════════════════════════
  init() {
    // Navegacao via sidebar (hashchange) — sem tab bar horizontal
    this._hashChangeHandler = () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (!hash.startsWith('rh')) return;

      const parts = hash.split('/');
      const validTabs = ['visao-geral', 'performance', 'cultura', 'one-on-ones', 'analytics', 'banco-talentos', 'vagas', 'contratos'];
      const tabFromUrl = parts[1] || 'visao-geral';

      if (!validTabs.includes(tabFromUrl)) return;

      // Se mudou a view principal, re-renderizar conteudo
      if (tabFromUrl !== this._activeTab) {
        // Salvar filtros antes de trocar
        const filterBuEl = document.querySelector('.rh-filter-bu');
        const filterSearchEl = document.querySelector('.rh-filter-search');
        if (filterBuEl) this._filterBU = filterBuEl.value;
        if (filterSearchEl) this._filterSearch = filterSearchEl.value;

        this._activeTab = tabFromUrl;

        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = this._renderActiveTab();
          this._initActiveTab();
        }

        if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
          TBO_SIDEBAR_RENDERER.setActive(hash);
        }
      }

      // Deep link de cultura (rh/cultura/rituais), trocar subtab
      if (tabFromUrl === 'cultura' && parts[2]) {
        const validCulturaSubs = ['valores', 'reconhecimentos', 'rituais', 'feedbacks', 'historico', 'onboarding'];
        if (validCulturaSubs.includes(parts[2]) && parts[2] !== this._culturaSubTab) {
          this._culturaSubTab = parts[2];
          const subTabBtn = document.querySelector(`#rhCulturaSubtabs .tab--sub[data-cultura-tab="${parts[2]}"]`);
          if (subTabBtn) subTabBtn.click();
        }
      }
    };
    window.addEventListener('hashchange', this._hashChangeHandler);

    // Inicializar bindings da tab ativa
    this._initActiveTab();
  },

  // Cleanup: remover listener ao sair do modulo
  destroy() {
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
      this._hashChangeHandler = null;
    }
  },

  // ── Init bindings para a tab ativa (chamado no init e ao trocar tab) ──
  _initActiveTab() {
    // Performance subtab switching
    document.querySelectorAll('#rhPerfSubtabs .tab--sub').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#rhPerfSubtabs .tab--sub').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#rhPerfSubtabs ~ .subtab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(`subtab-${tab.dataset.subtab}`);
        if (target) target.classList.add('active');
      });
    });

    // Cultura subtab switching
    document.querySelectorAll('#rhCulturaSubtabs .tab--sub').forEach(tab => {
      tab.addEventListener('click', () => {
        const subTab = tab.dataset.culturaTab;
        this._culturaSubTab = subTab;
        // Atualizar visual das subtabs
        document.querySelectorAll('#rhCulturaSubtabs .tab--sub').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        // Re-renderizar conteudo da subtab
        const content = document.getElementById('rhCulturaContent');
        if (content) {
          content.innerHTML = this._renderCulturaSubTab(subTab);
          if (window.lucide) lucide.createIcons({ root: content });
          this._bindCulturaContent();
          // Carregar dados async de onboarding se subtab onboarding
          if (subTab === 'onboarding') this._loadOnboardingData();
        }
        // Atualizar hash para deep link do sidebar
        const newHash = `rh/cultura/${subTab}`;
        history.replaceState(null, '', '#' + newHash);
        if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
          TBO_SIDEBAR_RENDERER.setActive(newHash);
        }
      });
    });
    // Bind interacoes da tab Cultura (elogios, feedbacks)
    this._bindCulturaContent();

    // ── Banco de Talentos / Vagas / Contratos ──
    this._initBancoTalentos();
    this._initVagas();
    this._initContratos();

    // ── Visao Geral: View Switcher (organograma / tabela / cards) ──
    document.querySelectorAll('.rh-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._visaoGeralView = btn.dataset.view;
        // Atualizar visual dos botoes
        document.querySelectorAll('.rh-view-btn').forEach(b => { b.classList.remove('btn-primary'); b.classList.add('btn-secondary'); });
        btn.classList.remove('btn-secondary'); btn.classList.add('btn-primary');
        // Re-renderizar apenas o conteudo da view
        const content = document.getElementById('rhVisaoGeralContent');
        if (content) {
          const team = this._getInternalTeam();
          const reviews = this._getStore('avaliacoes_people');
          content.innerHTML = this._renderVisaoGeralContent(team, reviews);
          this._bindVisaoGeralContent();
        }
        if (window.lucide) lucide.createIcons();
      });
    });

    // Bind do conteudo da visao geral (cards/tabela/organograma)
    this._bindVisaoGeralContent();

    // ── Filtros avancados ──
    const filterBu = document.querySelector('.rh-filter-bu');
    const filterSearch = document.querySelector('.rh-filter-search');
    const filterRole = document.querySelector('.rh-filter-role');
    const filterStatus = document.querySelector('.rh-filter-status');

    // Restaurar valores de filtros preservados
    if (filterBu && this._filterSquad) filterBu.value = this._filterSquad;
    if (filterSearch && this._filterSearch) filterSearch.value = this._filterSearch;
    if (filterRole && this._filterRole) filterRole.value = this._filterRole;
    if (filterStatus && this._filterStatus) filterStatus.value = this._filterStatus;

    // Filtro local/client-side (rapido, para organograma e cards)
    const applyClientFilters = () => {
      const bu = filterBu ? filterBu.value : '';
      const search = filterSearch ? filterSearch.value.toLowerCase() : '';
      const role = filterRole ? filterRole.value : '';
      const status = filterStatus ? filterStatus.value : '';

      // Mapa de status filtro local → status do DB
      const statusLocalMap = { 'ativo': 'active', 'inativo': 'inactive', 'ferias': 'vacation', 'ausente': 'away', 'onboarding': 'onboarding', 'offboarding': 'offboarding', 'desligado': 'desligado', 'suspenso': 'suspended' };
      const statusDb = status ? statusLocalMap[status] || status : '';

      // Cards
      document.querySelectorAll('.rh-person-card').forEach(card => {
        const matchBu = !bu || card.dataset.bu === bu;
        const matchSearch = !search || card.textContent.toLowerCase().includes(search);
        const matchStatus = !statusDb || card.dataset.status === statusDb;
        card.style.display = (matchBu && matchSearch && matchStatus) ? '' : 'none';
      });
      // Organograma nodes
      document.querySelectorAll('.rh-org-node').forEach(node => {
        const matchSearch = !search || node.textContent.toLowerCase().includes(search);
        node.style.display = matchSearch ? '' : 'none';
      });
      // Tabela rows (client-side filtering for responsiveness)
      document.querySelectorAll('.rh-bu-row').forEach(row => {
        const matchBu = !bu || row.dataset.bu === bu || row.dataset.group === bu;
        const matchSearch = !search || row.textContent.toLowerCase().includes(search);
        const matchStatus = !statusDb || row.dataset.status === statusDb;
        row.style.display = (matchBu && matchSearch && matchStatus) ? '' : 'none';
      });
    };

    // Filtros server-side (para busca/paginacao — debounced)
    const applyServerFilters = () => {
      this._filterSquad = filterBu ? filterBu.value : '';
      this._filterRole = filterRole ? filterRole.value : '';
      this._filterStatus = filterStatus ? filterStatus.value : '';
      this._filterSearch = filterSearch ? filterSearch.value.trim() : '';
      this._page = 0; // Reset paginacao ao filtrar
      this._reloadTeamServerSide();
    };

    // Bind filter events
    if (filterBu) filterBu.addEventListener('change', () => { applyClientFilters(); applyServerFilters(); });
    if (filterRole) filterRole.addEventListener('change', applyServerFilters);
    if (filterStatus) filterStatus.addEventListener('change', applyServerFilters);
    if (filterSearch) {
      // Debounce busca: client-side imediato, server-side apos 400ms
      filterSearch.addEventListener('input', () => {
        applyClientFilters();
        clearTimeout(this._searchDebounceTimer);
        this._searchDebounceTimer = setTimeout(applyServerFilters, 400);
      });
    }

    // Aplicar filtros restaurados imediatamente
    if (this._filterSquad || this._filterSearch) applyClientFilters();

    // ── Sort headers (click to sort) ──
    document.querySelectorAll('.rh-sort-header').forEach(th => {
      th.addEventListener('click', () => {
        const col = th.dataset.sort;
        if (this._sortBy === col) {
          this._sortDir = this._sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          this._sortBy = col;
          this._sortDir = 'asc';
        }
        this._page = 0;
        this._reloadTeamServerSide();
      });
    });

    // ── Paginacao ──
    document.querySelectorAll('.rh-page-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.page === 'prev' && this._page > 0) {
          this._page--;
        } else if (btn.dataset.page === 'next') {
          const totalPages = Math.ceil(this._totalCount / this._pageSize);
          if (this._page < totalPages - 1) this._page++;
        }
        this._reloadTeamServerSide();
      });
    });

    // Person detail (ranking)
    this._bindPersonDetailClicks();

    // Avaliar form
    const avalTarget = document.getElementById('avalTarget');
    if (avalTarget) {
      avalTarget.addEventListener('change', () => {
        const fields = document.getElementById('avalFormFields');
        if (fields) fields.style.display = avalTarget.value ? 'block' : 'none';
      });
    }
    document.querySelectorAll('.aval-score-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll(`.aval-score-btn[data-comp="${btn.dataset.comp}"]`).forEach(b => { b.classList.remove('active'); b.style.background = 'var(--bg-primary)'; b.style.color = ''; });
        btn.classList.add('active'); btn.style.background = 'var(--accent-gold)'; btn.style.color = '#fff';
      });
    });
    this._bind('avalSubmit', () => {
      const ciclos = this._getStore('ciclos');
      const cycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];
      if (cycle) this._submitAvaliacao(cycle.id);
    });

    // Elogios CRUD
    this._bindToggle('rhNewElogio', 'rhElogioForm');
    this._bindToggle('elCancel', 'rhElogioForm', false);
    this._bind('elSave', () => {
      const el = { id: this._genId(), de: this._currentUserId(), para: document.getElementById('elPara')?.value, valor: document.getElementById('elValor')?.value, mensagem: document.getElementById('elTexto')?.value, curtidas: 0, data: new Date().toISOString() };
      if (!el.mensagem) { TBO_TOAST.warning('Escreva uma mensagem'); return; }
      const items = this._getStore('elogios'); items.push(el); this._setStore('elogios', items);
      document.getElementById('rhElogioList').innerHTML = this._renderElogioItems(items);
      document.getElementById('rhElogioForm').style.display = 'none';
      document.getElementById('elTexto').value = '';
      TBO_TOAST.success('Elogio publicado!');
      this._bindCurtirElogios();
    });
    this._bindCurtirElogios();

    // Feedbacks CRUD
    this._bindToggle('rhNewFeedback', 'rhFeedbackForm');
    this._bindToggle('fbCancel', 'rhFeedbackForm', false);
    this._bind('fbSave', () => {
      const fb = { id: this._genId(), de: this._currentUserId(), para: document.getElementById('fbPara')?.value, tipo: document.getElementById('fbTipo')?.value, visibilidade: 'publico', mensagem: document.getElementById('fbTexto')?.value, data: new Date().toISOString() };
      if (!fb.mensagem) { TBO_TOAST.warning('Preencha a mensagem'); return; }
      const items = this._getStore('feedbacks'); items.push(fb); this._setStore('feedbacks', items);
      document.getElementById('rhFeedbackList').innerHTML = this._renderFeedbackItems(items);
      document.getElementById('rhFeedbackForm').style.display = 'none';
      document.getElementById('fbTexto').value = '';
      TBO_TOAST.success('Feedback enviado!');
    });

    // 1:1 CRUD
    this._bindToggle('rhNew1on1', 'rh1on1Form');
    this._bindToggle('ooCancel', 'rh1on1Form', false);
    this._bind('ooSave', async () => {
      const leaderId = document.getElementById('ooLider')?.value;
      const collabId = document.getElementById('ooColab')?.value;
      const dataValue = document.getElementById('ooData')?.value || new Date().toISOString();
      const recurrence = document.getElementById('ooRecurrence')?.value || '';
      const statusEl = document.getElementById('oo1on1Status');

      const leaderPerson = this._team.find(t => (t.supabaseId || t.id) === leaderId);
      const collabPerson = this._team.find(t => (t.supabaseId || t.id) === collabId);

      if (statusEl) statusEl.textContent = 'Salvando...';

      // Tentar salvar no Supabase
      if (typeof OneOnOnesRepo !== 'undefined') {
        try {
          // Calcular datas recorrentes
          const dates = [dataValue];
          if (recurrence) {
            if (recurrence === 'daily') {
              // Diária: seg a sex, gerar ~20 dias úteis (≈1 mês)
              let current = new Date(dataValue);
              let count = 0;
              while (count < 19) {
                current = new Date(current.getTime() + 24 * 60 * 60 * 1000);
                const day = current.getDay(); // 0=dom, 6=sáb
                if (day !== 0 && day !== 6) {
                  dates.push(current.toISOString());
                  count++;
                }
              }
            } else {
              const intervalDays = recurrence === 'weekly' ? 7 : recurrence === 'biweekly' ? 14 : 30;
              for (let i = 1; i <= 5; i++) {
                const d = new Date(new Date(dataValue).getTime() + i * intervalDays * 24 * 60 * 60 * 1000);
                dates.push(d.toISOString());
              }
            }
          }

          let createdCount = 0;
          for (const dt of dates) {
            if (statusEl) statusEl.textContent = `Criando ${createdCount + 1}/${dates.length}...`;

            const oneOnOne = await OneOnOnesRepo.create({
              leader_id: leaderId,
              collaborator_id: collabId,
              scheduled_at: dt,
              status: 'scheduled',
              recurrence: recurrence || null
            });

            // Criar evento no Google Calendar automaticamente
            if (typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
              try {
                if (statusEl) statusEl.textContent = `Google Calendar ${createdCount + 1}/${dates.length}...`;
                const gcalResult = await TBO_GOOGLE_CALENDAR.create1on1Event({
                  leaderName: leaderPerson?.nome || 'Líder',
                  leaderEmail: leaderPerson?.email || '',
                  collaboratorName: collabPerson?.nome || 'Colaborador',
                  collaboratorEmail: collabPerson?.email || '',
                  scheduledAt: dt,
                  durationMinutes: 30
                });

                // Salvar google_event_id na 1:1
                if (gcalResult?.id && oneOnOne?.id) {
                  await OneOnOnesRepo.update(oneOnOne.id, { google_event_id: gcalResult.id });
                }
              } catch (gcalErr) {
                console.warn('[RH] Google Calendar falhou (continuando):', gcalErr.message);
                if (gcalErr.message?.includes('403') || gcalErr.message?.includes('insufficient')) {
                  TBO_TOAST.warning('Google Calendar', 'Permissão insuficiente. Faça logout e login via Google para atualizar permissões.');
                } else {
                  TBO_TOAST.warning('Google Calendar', gcalErr.message || 'Falha ao criar evento. Verifique login Google OAuth.');
                }
                if (statusEl) statusEl.textContent = `⚠ Calendar falhou — ${createdCount + 1}/${dates.length}`;
              }
            }
            createdCount++;
          }

          const recLabel = { daily: 'Diária (seg-sex)', weekly: 'Semanal', biweekly: 'Quinzenal', monthly: 'Mensal' };
          TBO_TOAST.success(`${createdCount} 1:1(s) agendada(s)!`, recurrence ? `Recorrência ${recLabel[recurrence] || recurrence}` : '');
          if (statusEl) statusEl.textContent = '';
          this._oneOnOnesCache = null;
          this._oneOnOneActionsCache = null;
          await this._load1on1sFromSupabase();
          return;
        } catch (e) {
          console.warn('[RH] Erro ao salvar 1:1 no Supabase:', e.message);
          if (statusEl) statusEl.textContent = 'Erro!';
        }
      }

      // Fallback: localStorage
      const oo = { id: this._genId(), lider: leaderId, colaborador: collabId, data: dataValue, status: 'agendada', items: [] };
      const items = this._getStore('1on1s'); items.push(oo); this._setStore('1on1s', items);
      TBO_TOAST.success('1:1 agendada!');
      const tabContent = document.getElementById('rhTabContent');
      if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
    });

    // 1:1 detail panel (click to expand) + context menu (right-click)
    document.querySelectorAll('.rh-1on1-row').forEach(row => {
      row.addEventListener('click', async () => {
        const id = row.dataset.id;
        if (!id) return;
        await this._open1on1Detail(id);
      });
      row.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const id = row.dataset.id;
        if (!id) return;
        this._show1on1ContextMenu(id, e.clientX, e.clientY);
      });
    });

    // v3.0: Multi-selecao de 1:1s (checkboxes + bulk bar)
    this._bind1on1BulkActions();

    // Action checkboxes
    this._bindActionChecks();

    // Hover Card — bind em elementos com data-person-id
    if (typeof TBO_HOVER_CARD !== 'undefined') {
      const rhModule = document.querySelector('.rh-module');
      if (rhModule) TBO_HOVER_CARD.bind(rhModule);
    }

    // Carregar KPIs, projetos e aniversariantes async (nao bloqueia render)
    this._loadDashboardKPIs();
    this._loadProjectCounts();
    this._loadBirthdayWidget();

    // Inicializar graficos da tab Analytics (P3)
    if (this._activeTab === 'analytics') {
      this._initAnalytics();
    }

    // Lucide icons
    if (window.lucide) lucide.createIcons();
  },

  // ── Drawer: Carregar dados do onboarding da pessoa (tabela colaboradores) ──
  async _loadDrawerOnboardingData(personId) {
    const container = document.getElementById('rhOnboardingData');
    if (!container) return;

    if (typeof TBO_SUPABASE === 'undefined') return;
    try {
      const client = TBO_SUPABASE.getClient();
      const person = this._getPerson(personId);
      if (!client || !person) return;

      // Buscar por email no colaboradores
      const email = person.email;
      if (!email) return;

      const { data, error } = await client
        .from('colaboradores')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error || !data) return;

      // Renderizar dados do onboarding
      const fields = [];
      if (data.telefone) fields.push({ icon: 'phone', label: 'Telefone', value: data.telefone });
      if (data.tipo_contrato) fields.push({ icon: 'file-text', label: 'Contrato', value: data.tipo_contrato });
      if (data.data_inicio) fields.push({ icon: 'calendar', label: 'Inicio', value: new Date(data.data_inicio).toLocaleDateString('pt-BR') });
      if (data.tipo_onboarding) fields.push({ icon: 'compass', label: 'Onboarding', value: data.tipo_onboarding });
      if (data.quiz_score_final) fields.push({ icon: 'award', label: 'Quiz Score', value: `${data.quiz_score_final}%` });

      if (fields.length) {
        container.innerHTML = `
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="clipboard-list" style="width:16px;height:16px;color:var(--color-info);"></i> Dados do Onboarding
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
              ${fields.map(f => `
                <div style="display:flex;align-items:center;gap:6px;padding:6px 8px;background:var(--bg-primary);border-radius:6px;">
                  <i data-lucide="${f.icon}" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
                  <div>
                    <div style="font-size:0.62rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.3px;">${f.label}</div>
                    <div style="font-size:0.78rem;font-weight:500;">${this._esc(f.value)}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>`;
        if (window.lucide) lucide.createIcons();
      }
    } catch (e) {
      console.warn('[RH] Erro ao carregar dados onboarding:', e.message);
    }
  },

  // ── 1:1 Detail Panel (Fase C) — abre modal com notas + acoes ──
  async _open1on1Detail(oneOnOneId) {
    if (typeof OneOnOnesRepo === 'undefined') return;

    try {
      const data = await OneOnOnesRepo.getById(oneOnOneId);
      if (!data) { TBO_TOAST.warning('1:1 não encontrada'); return; }

      const leaderName = this._getPersonNameByUid(data.leader_id);
      const collabName = this._getPersonNameByUid(data.collaborator_id);
      const actions = data.one_on_one_actions || [];
      const statusColors = { scheduled: 'var(--color-info)', completed: 'var(--color-success)', cancelled: 'var(--text-muted)', no_show: 'var(--color-danger)' };
      const statusLabels = { scheduled: 'Agendada', completed: 'Concluída', cancelled: 'Cancelada', no_show: 'No-show' };

      // Modal overlay
      const overlay = document.createElement('div');
      overlay.id = 'rh1on1DetailOverlay';
      overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:9999;display:flex;justify-content:center;align-items:center;';
      overlay.innerHTML = `
        <div style="background:var(--bg-card, #ffffff);border-radius:16px;width:560px;max-width:calc(100vw - 48px);max-height:80vh;overflow-y:auto;box-shadow:0 25px 50px rgba(0,0,0,0.25);padding:24px;position:relative;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <h3 style="font-size:1rem;font-weight:700;margin-bottom:2px;">1:1 ${this._esc(leaderName)} ↔ ${this._esc(collabName)}</h3>
              <div style="font-size:0.75rem;color:var(--text-muted);">${data.scheduled_at ? new Date(data.scheduled_at).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                ${data.google_event_id ? ' · <i data-lucide="calendar" style="width:10px;height:10px;vertical-align:-1px;color:var(--color-info);"></i> Google Calendar' : ''}
                ${data.recurrence ? ` · <i data-lucide="repeat" style="width:10px;height:10px;vertical-align:-1px;"></i> ${data.recurrence === 'daily' ? 'Diária' : data.recurrence === 'monthly' ? 'Mensal' : data.recurrence === 'biweekly' ? 'Quinzenal' : 'Semanal'}` : ''}
              </div>
            </div>
            <div style="display:flex;gap:6px;align-items:center;">
              <span class="tag" style="font-size:0.65rem;background:${statusColors[data.status] || 'var(--text-muted)'}20;color:${statusColors[data.status] || 'var(--text-muted)'};">${statusLabels[data.status] || data.status}</span>
              <button id="rh1on1Close" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:4px;"><i data-lucide="x" style="width:18px;height:18px;"></i></button>
            </div>
          </div>

          <!-- Status buttons -->
          <div style="display:flex;gap:6px;margin-bottom:16px;align-items:center;">
            ${data.status === 'scheduled' ? `
              <button class="btn btn-sm btn-primary" id="rh1on1Complete"><i data-lucide="check" style="width:12px;height:12px;"></i> Marcar Concluída</button>
              <button class="btn btn-sm btn-secondary" id="rh1on1Cancel">Cancelar</button>
            ` : ''}
            <button class="btn btn-sm" style="margin-left:auto;color:var(--color-danger);border:1px solid var(--color-danger);" id="rh1on1Delete"><i data-lucide="trash-2" style="width:12px;height:12px;"></i> Excluir</button>
          </div>

          <!-- Notas -->
          <div style="margin-bottom:16px;">
            <label style="font-weight:600;font-size:0.82rem;display:block;margin-bottom:6px;"><i data-lucide="file-text" style="width:14px;height:14px;vertical-align:-2px;color:var(--accent-gold);"></i> Notas da Reunião</label>
            <textarea id="rh1on1Notes" class="form-input" rows="4" placeholder="Escreva notas sobre a reunião..." style="font-size:0.8rem;resize:vertical;">${this._esc(data.notes || '')}</textarea>
            <button class="btn btn-sm btn-secondary" id="rh1on1SaveNotes" style="margin-top:6px;font-size:0.68rem;">Salvar Notas</button>
          </div>

          <!-- Ações -->
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <label style="font-weight:600;font-size:0.82rem;"><i data-lucide="check-square" style="width:14px;height:14px;vertical-align:-2px;color:var(--color-info);"></i> Ações (${actions.length})</label>
              <button class="btn btn-sm btn-secondary" id="rh1on1AddAction" style="font-size:0.66rem;padding:2px 8px;"><i data-lucide="plus" style="width:10px;height:10px;"></i> Ação</button>
            </div>
            <div id="rh1on1ActionForm" style="display:none;margin-bottom:8px;padding:8px;background:var(--bg-elevated);border-radius:8px;">
              <input type="text" class="form-input" id="rh1on1ActionText" placeholder="Descreva a ação..." style="font-size:0.78rem;margin-bottom:6px;">
              <div style="display:flex;gap:6px;">
                <input type="date" class="form-input" id="rh1on1ActionDue" style="font-size:0.72rem;flex:1;">
                <button class="btn btn-primary btn-sm" id="rh1on1ActionSave" style="font-size:0.66rem;">Criar</button>
              </div>
            </div>
            <div id="rh1on1ActionList">
              ${actions.length ? actions.map(a => `
                <div style="display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid var(--border-subtle);">
                  <input type="checkbox" class="rh1on1-action-toggle" data-id="${a.id}" ${a.completed ? 'checked' : ''} style="width:16px;height:16px;accent-color:var(--accent-gold);">
                  <div style="flex:1;">
                    <div style="font-size:0.78rem;${a.completed ? 'text-decoration:line-through;opacity:0.6;' : ''}">${this._esc(a.text)}</div>
                    ${a.due_date ? `<div style="font-size:0.65rem;color:${new Date(a.due_date) < new Date() && !a.completed ? 'var(--color-danger)' : 'var(--text-muted)'};">Prazo: ${new Date(a.due_date + 'T12:00').toLocaleDateString('pt-BR')}</div>` : ''}
                  </div>
                  <button class="rh1on1-action-delete" data-id="${a.id}" style="background:none;border:none;cursor:pointer;color:var(--color-danger);padding:2px;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
                </div>
              `).join('') : '<div style="font-size:0.72rem;color:var(--text-muted);padding:8px;">Nenhuma ação registrada</div>'}
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      if (window.lucide) lucide.createIcons({ root: overlay });

      // Binds
      overlay.querySelector('#rh1on1Close')?.addEventListener('click', () => overlay.remove());
      overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

      // Salvar notas
      overlay.querySelector('#rh1on1SaveNotes')?.addEventListener('click', async () => {
        const notes = overlay.querySelector('#rh1on1Notes')?.value || '';
        try {
          await OneOnOnesRepo.update(oneOnOneId, { notes });
          TBO_TOAST.success('Notas salvas!');
        } catch (e) { TBO_TOAST.error('Erro ao salvar notas'); }
      });

      // Marcar concluida
      overlay.querySelector('#rh1on1Complete')?.addEventListener('click', async () => {
        const notes = overlay.querySelector('#rh1on1Notes')?.value || '';
        try {
          await OneOnOnesRepo.complete(oneOnOneId, notes);
          TBO_TOAST.success('1:1 concluída!');
          overlay.remove();
          this._oneOnOnesCache = null;
          await this._load1on1sFromSupabase();
        } catch (e) { TBO_TOAST.error('Erro ao concluir'); }
      });

      // Cancelar 1:1
      overlay.querySelector('#rh1on1Cancel')?.addEventListener('click', async () => {
        try {
          await OneOnOnesRepo.cancel(oneOnOneId);
          // Deletar evento do Google Calendar
          if (data.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
            try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
          }
          TBO_TOAST.info('1:1 cancelada');
          overlay.remove();
          this._oneOnOnesCache = null;
          await this._load1on1sFromSupabase();
        } catch (e) { TBO_TOAST.error('Erro ao cancelar'); }
      });

      // Excluir 1:1 (hard delete)
      overlay.querySelector('#rh1on1Delete')?.addEventListener('click', async () => {
        if (!confirm('Excluir esta 1:1 permanentemente? Esta ação não pode ser desfeita.')) return;
        try {
          // Deletar evento do Google Calendar primeiro
          if (data.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
            try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
          }
          // Deletar do banco
          await OneOnOnesRepo.remove(oneOnOneId);
          TBO_TOAST.success('1:1 excluída');
          overlay.remove();
          this._oneOnOnesCache = null;
          await this._load1on1sFromSupabase();
        } catch (e) {
          console.error('[RH] Erro ao excluir 1:1:', e);
          TBO_TOAST.error('Erro ao excluir 1:1');
        }
      });

      // Toggle acoes
      overlay.querySelectorAll('.rh1on1-action-toggle').forEach(chk => {
        chk.addEventListener('change', async () => {
          try {
            await OneOnOnesRepo.toggleAction(chk.dataset.id, chk.checked);
          } catch (e) { TBO_TOAST.error('Erro ao atualizar ação'); }
        });
      });

      // Delete acoes
      overlay.querySelectorAll('.rh1on1-action-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            await OneOnOnesRepo.removeAction(btn.dataset.id);
            btn.closest('div[style*="border-bottom"]')?.remove();
          } catch (err) { TBO_TOAST.error('Erro ao remover ação'); }
        });
      });

      // Adicionar acao
      overlay.querySelector('#rh1on1AddAction')?.addEventListener('click', () => {
        const form = overlay.querySelector('#rh1on1ActionForm');
        if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
      });
      overlay.querySelector('#rh1on1ActionSave')?.addEventListener('click', async () => {
        const text = overlay.querySelector('#rh1on1ActionText')?.value;
        const dueDate = overlay.querySelector('#rh1on1ActionDue')?.value;
        if (!text) return;
        try {
          const action = await OneOnOnesRepo.createAction(oneOnOneId, {
            text,
            assignee_id: data.collaborator_id,
            due_date: dueDate || null,
            completed: false
          });
          TBO_TOAST.success('Ação criada!');
          // Reload detail
          overlay.remove();
          await this._open1on1Detail(oneOnOneId);
        } catch (e) { TBO_TOAST.error('Erro ao criar ação'); }
      });
    } catch (e) {
      console.error('[RH] Erro ao abrir detalhe 1:1:', e);
      TBO_TOAST.error('Erro ao carregar detalhe da 1:1');
    }
  },

  // Helper: buscar nome de pessoa por supabase uid
  _getPersonNameByUid(uid) {
    if (!uid) return 'Desconhecido';
    const person = this._team.find(t => t.supabaseId === uid || t.id === uid);
    return person ? person.nome : uid.slice(0, 8);
  },

  // ── Multi-seleção e delete em massa de 1:1s ─────────────────────────
  _bind1on1BulkActions() {
    // Checkbox change → atualizar bulk bar
    document.querySelectorAll('.rh-1on1-select').forEach(cb => {
      cb.addEventListener('change', () => this._update1on1BulkBar());
    });

    // Selecionar todos
    document.getElementById('rh1on1BulkSelectAll')?.addEventListener('click', () => {
      document.querySelectorAll('.rh-1on1-select').forEach(cb => { cb.checked = true; });
      this._update1on1BulkBar();
    });

    // Cancelar seleção
    document.getElementById('rh1on1BulkCancel')?.addEventListener('click', () => {
      document.querySelectorAll('.rh-1on1-select').forEach(cb => { cb.checked = false; });
      this._update1on1BulkBar();
    });

    // Excluir selecionados em massa
    document.getElementById('rh1on1BulkDelete')?.addEventListener('click', async () => {
      const selected = [...document.querySelectorAll('.rh-1on1-select:checked')].map(cb => cb.dataset.id);
      if (selected.length === 0) return;
      if (!confirm(`Excluir ${selected.length} reunião(ões) permanentemente? Esta ação não pode ser desfeita.`)) return;

      let errors = 0;
      for (const id of selected) {
        try {
          const data = await OneOnOnesRepo.getById(id);
          if (data?.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
            try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
          }
          await OneOnOnesRepo.remove(id);
        } catch { errors++; }
      }

      const ok = selected.length - errors;
      if (ok > 0) TBO_TOAST.success(`${ok} reunião(ões) excluída(s)`);
      if (errors > 0) TBO_TOAST.warning(`${errors} erro(s) ao excluir`);
      this._oneOnOnesCache = null;
      await this._load1on1sFromSupabase();
    });
  },

  _update1on1BulkBar() {
    const selected = document.querySelectorAll('.rh-1on1-select:checked');
    const bar = document.getElementById('rh1on1BulkBar');
    const countEl = document.getElementById('rh1on1BulkCount');
    if (!bar) return;

    if (selected.length > 0) {
      bar.style.display = 'flex';
      countEl.textContent = `${selected.length} selecionado${selected.length > 1 ? 's' : ''}`;
      if (window.lucide) lucide.createIcons({ root: bar });
    } else {
      bar.style.display = 'none';
    }
  },

  // ── Context Menu: 1:1 (botão direito) ─────────────────────────────
  _show1on1ContextMenu(oneOnOneId, x, y) {
    const items = this._oneOnOnesCache || [];
    const oneOnOne = items.find(o => o.id === oneOnOneId);
    if (!oneOnOne) return;

    const isScheduled = oneOnOne.status === 'scheduled' || oneOnOne.status === 'agendada';
    const hasGcalEvent = !!oneOnOne.google_event_id;

    const menuItems = [
      { icon: 'eye', label: 'Ver detalhes', action: 'view_detail' },
      { icon: 'check-circle', label: 'Marcar concluída', action: 'complete', condition: isScheduled },
      { icon: 'calendar-clock', label: 'Reagendar', action: 'reschedule', condition: isScheduled },
      { icon: 'external-link', label: 'Abrir no Google Calendar', action: 'open_gcal', condition: hasGcalEvent },
      { divider: true },
      { icon: 'x-circle', label: 'Cancelar', action: 'cancel', condition: isScheduled },
      { icon: 'trash-2', label: 'Excluir', action: 'delete', danger: true }
    ];

    const filtered = menuItems.filter(item => {
      if (item.divider) return true;
      return item.condition !== false;
    });

    // Remover dividers consecutivos ou no final
    const clean = filtered.filter((item, idx, arr) => {
      if (!item.divider) return true;
      if (idx === arr.length - 1) return false;
      if (idx === 0) return false;
      if (arr[idx - 1]?.divider) return false;
      return true;
    });

    // v3.0: Backdrop transparente para capturar cliques fora do menu
    let backdrop = document.getElementById('rh1on1ContextBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'rh1on1ContextBackdrop';
      document.body.appendChild(backdrop);
    }
    backdrop.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent;display:block;';

    let menu = document.getElementById('rh1on1ContextMenu');
    if (!menu) {
      menu = document.createElement('div');
      menu.id = 'rh1on1ContextMenu';
      menu.className = 'rh-context-menu';
      document.body.appendChild(menu);
    }

    const leaderName = this._getPersonNameByUid(oneOnOne.leader_id);
    const collabName = this._getPersonNameByUid(oneOnOne.collaborator_id);

    menu.innerHTML = `
      <div style="padding:8px 14px;border-bottom:1px solid var(--border-subtle);font-size:0.72rem;color:var(--text-muted);font-weight:600;">
        1:1 ${this._esc(leaderName)} ↔ ${this._esc(collabName)}
      </div>
      ${clean.map(item => {
        if (item.divider) return '<div style="height:1px;background:var(--border-subtle);margin:4px 0;"></div>';
        return `<button class="rh-ctx-item${item.danger ? ' rh-ctx-danger' : ''}" data-action="${item.action}" data-1on1="${oneOnOneId}" style="display:flex;align-items:center;gap:10px;width:100%;padding:8px 14px;border:none;background:none;cursor:pointer;font-size:0.8rem;color:${item.danger ? 'var(--color-danger)' : 'var(--text-primary)'};text-align:left;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background=''">
          <i data-lucide="${item.icon}" style="width:14px;height:14px;flex-shrink:0;"></i>
          <span>${item.label}</span>
        </button>`;
      }).join('')}
    `;

    // Posicionamento viewport-aware (z-index alto para ficar acima de tudo)
    const menuW = 240, menuH = clean.length * 38 + 44;
    const vw = window.innerWidth, vh = window.innerHeight;
    const posX = x + menuW > vw ? x - menuW : x;
    const posY = y + menuH > vh ? Math.max(8, y - menuH) : y;

    menu.style.cssText = `display:block;position:fixed;top:${posY}px;left:${posX}px;z-index:9999;min-width:${menuW}px;`;
    if (window.lucide) lucide.createIcons({ root: menu });

    // Funcao centralizada para fechar menu + backdrop + remover listeners
    const closeMenu = () => {
      menu.style.display = 'none';
      backdrop.style.display = 'none';
      document.removeEventListener('keydown', escHandler);
    };

    // Bind acoes do menu
    menu.querySelectorAll('.rh-ctx-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeMenu();
        this._handle1on1ContextAction(btn.dataset.action, btn.dataset['1on1']);
      });
    });

    // Fechar ao clicar no backdrop (fora do menu)
    backdrop.onclick = () => closeMenu();
    backdrop.oncontextmenu = (e) => { e.preventDefault(); closeMenu(); };

    // Fechar com ESC
    const escHandler = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', escHandler);
  },

  async _handle1on1ContextAction(action, oneOnOneId) {
    switch (action) {
      case 'view_detail':
        await this._open1on1Detail(oneOnOneId);
        break;

      case 'complete': {
        try {
          await OneOnOnesRepo.complete(oneOnOneId);
          TBO_TOAST.success('1:1 concluída!');
          this._oneOnOnesCache = null;
          await this._load1on1sFromSupabase();
        } catch (e) { TBO_TOAST.error('Erro ao concluir'); }
        break;
      }

      case 'reschedule': {
        // Fase 1: abrir detail para editar (modal de data pode vir depois)
        await this._open1on1Detail(oneOnOneId);
        break;
      }

      case 'open_gcal': {
        const items = this._oneOnOnesCache || [];
        const o = items.find(i => i.id === oneOnOneId);
        if (o?.google_event_id) {
          window.open(`https://calendar.google.com/calendar/event?eid=${btoa(o.google_event_id + ' ' + (o.collaborator_id || ''))}`, '_blank');
        }
        break;
      }

      case 'cancel': {
        if (!confirm('Cancelar esta 1:1?')) return;
        try {
          const data = await OneOnOnesRepo.getById(oneOnOneId);
          await OneOnOnesRepo.cancel(oneOnOneId);
          if (data?.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
            try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
          }
          TBO_TOAST.info('1:1 cancelada');
          this._oneOnOnesCache = null;
          await this._load1on1sFromSupabase();
        } catch (e) { TBO_TOAST.error('Erro ao cancelar'); }
        break;
      }

      case 'delete': {
        if (!confirm('Excluir esta 1:1 permanentemente? Esta ação não pode ser desfeita.')) return;
        try {
          const data = await OneOnOnesRepo.getById(oneOnOneId);
          if (data?.google_event_id && typeof TBO_GOOGLE_CALENDAR !== 'undefined') {
            try { await TBO_GOOGLE_CALENDAR.deleteEvent(data.google_event_id); } catch { /* ignore */ }
          }
          await OneOnOnesRepo.remove(oneOnOneId);
          TBO_TOAST.success('1:1 excluída');
          this._oneOnOnesCache = null;
          await this._load1on1sFromSupabase();
        } catch (e) { TBO_TOAST.error('Erro ao excluir'); }
        break;
      }
    }
  },

  // ── Drawer: Carregar projetos reais da pessoa (Fase B + Notion) ──
  async _loadDrawerProjects(personId) {
    const container = document.getElementById('rhDrawerProjects');
    if (!container) return;
    try {
      const person = this._getPerson(personId);
      if (!person) { container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem dados</div>'; return; }

      let projects = [];

      // 1. Tentar buscar projetos do Notion (fonte primaria — BD Projetos TBO)
      if (typeof NotionIntegration !== 'undefined') {
        try {
          const notionProjects = NotionIntegration.getProjectsByBU(person.bu || person.area || '');
          if (notionProjects.length) {
            projects = notionProjects.slice(0, 6).map(p => ({
              nome: p.nome,
              cliente: p.construtora,
              status: p.status || 'Em Andamento',
              cor: p.status === 'Concluído' ? 'var(--color-success)' : p.status === 'Parado' ? 'var(--color-warning)' : 'var(--color-info)',
              url: p.url,
              _source: 'notion'
            }));
          }
        } catch { /* fallback abaixo */ }
      }

      // 2. Fallback: buscar via ProjectsRepo (Supabase)
      if (!projects.length && typeof ProjectsRepo !== 'undefined') {
        try {
          const { data } = await ProjectsRepo.list({ limit: 50 });
          projects = (data || []).filter(p =>
            (p.members || []).some(m => m.user_id === person.supabaseId) ||
            p.team === person.bu
          ).slice(0, 6).map(p => ({
            nome: p.name || p.title,
            cliente: p.client || '',
            status: p.status || 'em_andamento',
            cor: p.status === 'concluido' || p.status === 'completed' ? 'var(--color-success)' : 'var(--color-info)',
            _source: 'supabase'
          }));
        } catch { /* fallback abaixo */ }
      }

      // 3. Tambem buscar demandas da pessoa no Notion
      let demandas = [];
      if (typeof NotionIntegration !== 'undefined') {
        try {
          demandas = NotionIntegration.getDemandasByPerson(person.nome || person.email || '').slice(0, 4);
        } catch { /* sem demandas */ }
      }

      if (!projects.length && !demandas.length) {
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Nenhum projeto vinculado</div>';
        return;
      }

      let html = '';

      // Projetos
      if (projects.length) {
        html += projects.map(pj => `
          <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-elevated);border-radius:6px;margin-bottom:6px;${pj.url ? 'cursor:pointer;' : ''}" ${pj.url ? `onclick="window.open('${pj.url}','_blank')"` : ''}>
            <div style="width:8px;height:8px;border-radius:50%;background:${pj.cor};flex-shrink:0;"></div>
            <div style="flex:1;">
              <div style="font-size:0.8rem;font-weight:500;">${this._esc(pj.nome)}</div>
              ${pj.cliente ? `<div style="font-size:0.65rem;color:var(--text-muted);">${this._esc(pj.cliente)}</div>` : ''}
            </div>
            <span class="tag" style="font-size:0.6rem;background:${pj.cor}20;color:${pj.cor};">${this._esc(pj.status)}</span>
          </div>
        `).join('');
      }

      // Demandas ativas
      if (demandas.length) {
        html += `<div style="font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-top:10px;margin-bottom:6px;">Demandas Ativas</div>`;
        html += demandas.map(d => {
          const statusColor = d.status === 'Desenvolvimento' ? 'var(--color-info)' : d.status === 'Revisão Interna' ? 'var(--color-warning)' : 'var(--text-muted)';
          return `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--bg-elevated);border-radius:6px;margin-bottom:4px;${d.url ? 'cursor:pointer;' : ''}" ${d.url ? `onclick="window.open('${d.url}','_blank')"` : ''}>
              <i data-lucide="file-text" style="width:12px;height:12px;color:var(--text-muted);flex-shrink:0;"></i>
              <div style="flex:1;font-size:0.75rem;">${this._esc(d.demanda)}</div>
              <span style="font-size:0.58rem;color:${statusColor};">${this._esc(d.status)}</span>
            </div>
          `;
        }).join('');
      }

      container.innerHTML = html;
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.warn('[RH] Erro ao carregar projetos:', e.message);
      container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
    }
  },

  // ── Drawer: Carregar skills da pessoa (Fase G) ──
  async _loadDrawerSkills(personId) {
    const container = document.getElementById('rhDrawerSkills');
    if (!container) return;
    try {
      const person = this._getPerson(personId);
      const uid = person?.supabaseId || personId;

      let skills = [];
      if (typeof SkillsRepo !== 'undefined') {
        try { skills = await SkillsRepo.getForPerson(uid); } catch { /* sem skills */ }
      }

      if (!skills.length) {
        container.innerHTML = `
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">Nenhuma competência registrada</div>
          ${this._isAdmin() ? `<button class="btn btn-secondary btn-sm rh-add-skill" data-person="${personId}" style="font-size:0.66rem;padding:2px 8px;"><i data-lucide="plus" style="width:10px;height:10px;"></i> Adicionar</button>` : ''}
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      const levelLabels = ['', 'Básico', 'Intermediário', 'Avançado', 'Expert', 'Master'];
      const levelColors = ['', 'var(--text-muted)', 'var(--color-info)', 'var(--accent-gold)', 'var(--color-success)', 'var(--color-purple, #8b5cf6)'];

      container.innerHTML = `
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
          ${skills.map(s => `
            <span class="tag" style="font-size:0.62rem;background:${levelColors[s.proficiency_level] || 'var(--text-muted)'}15;color:${levelColors[s.proficiency_level] || 'var(--text-muted)'};">
              ${this._esc(s.skill_name)} · ${levelLabels[s.proficiency_level] || 'Nv' + s.proficiency_level}
              ${s.certification_name ? ' 📜' : ''}
            </span>
          `).join('')}
        </div>
        ${this._isAdmin() ? `<button class="btn btn-secondary btn-sm rh-add-skill" data-person="${personId}" style="font-size:0.66rem;padding:2px 8px;"><i data-lucide="plus" style="width:10px;height:10px;"></i> Adicionar</button>` : ''}
      `;
      if (window.lucide) lucide.createIcons();
    } catch (e) {
      console.warn('[RH] Erro ao carregar skills:', e.message);
      container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
    }
  },

  // ── Drawer: Carregar metas/PDI reais (Fase D) ──
  async _loadDrawerMetas(personId) {
    const container = document.getElementById('rhDrawerMetas');
    if (!container) return;
    try {
      const person = this._getPerson(personId);
      const uid = person?.supabaseId || personId;

      // Buscar person_tasks com category='pdi'
      let metas = [];
      if (typeof RepoBase !== 'undefined') {
        try {
          const db = RepoBase.getDb();
          const tid = RepoBase.requireTenantId();
          const { data } = await db.from('person_tasks')
            .select('id, title, status, description, category, due_date, completed_at')
            .eq('tenant_id', tid)
            .eq('person_id', uid)
            .eq('category', 'pdi')
            .order('created_at', { ascending: false });

          metas = (data || []).map(t => {
            const progresso = t.status === 'completed' ? 100 : t.status === 'in_progress' ? 50 : 10;
            return { id: t.id, nome: t.title, progresso, prazo: t.due_date || '', status: t.status };
          });
        } catch { /* sem metas */ }
      }

      // Fallback: metas dos gaps da review
      if (!metas.length) {
        const reviews = this._getStore('avaliacoes_people');
        const review = reviews.find(r => r.pessoaId === personId);
        if (review && review.gaps) {
          metas = review.gaps.map((g, i) => ({
            id: `gap-${i}`, nome: `Desenvolver ${g}`, progresso: 20, prazo: '2026-06-30', status: 'pending'
          }));
        }
      }

      if (!metas.length) {
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem metas / PDI definidos</div>';
        return;
      }

      container.innerHTML = metas.map(m => `
        <div style="margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
            <span>${this._esc(m.nome)}</span>
            <span style="font-weight:600;color:${m.progresso >= 75 ? 'var(--color-success)' : m.progresso >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${m.progresso}%</span>
          </div>
          <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${m.progresso}%;background:${m.progresso >= 75 ? 'var(--color-success)' : m.progresso >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};border-radius:3px;transition:width 0.3s;"></div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      console.warn('[RH] Erro ao carregar metas:', e.message);
      container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
    }
  },

  // ── Drawer: Carregar historico de compensacao/promocoes (Fase H) ──
  async _loadDrawerHistory(personId) {
    const container = document.getElementById('rhDrawerHistory');
    if (!container) return;
    try {
      const person = this._getPerson(personId);
      const uid = person?.supabaseId || personId;

      let history = [];
      if (typeof PeopleRepo !== 'undefined') {
        try { history = await PeopleRepo.getHistory(uid); } catch { /* sem historico */ }
      }

      if (!history || !history.length) {
        // Mostrar info basica
        const startDate = person?.inicio || person?.start_date;
        const salary = person?.custoMensal;
        if (startDate || salary) {
          container.innerHTML = `
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              ${startDate ? `<div style="font-size:0.72rem;"><span style="color:var(--text-muted);">Inicio:</span> <strong>${new Date(startDate + 'T12:00').toLocaleDateString('pt-BR')}</strong></div>` : ''}
              ${salary ? `<div style="font-size:0.72rem;"><span style="color:var(--text-muted);">Remuneracao:</span> <strong>R$ ${Number(salary).toLocaleString('pt-BR')}</strong></div>` : ''}
            </div>
          `;
        } else {
          container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem historico registrado</div>';
        }
        return;
      }

      // Renderizar timeline
      const importantFields = ['salary_pj', 'nivel_atual', 'cargo', 'bu', 'status'];
      const relevant = history.filter(h => importantFields.includes(h.field_changed)).slice(0, 10);

      if (!relevant.length) {
        container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Sem alteracoes significativas</div>';
        return;
      }

      const fieldLabels = { salary_pj: '💰 Remuneração', nivel_atual: '📈 Nível', cargo: '💼 Cargo', bu: '🏢 Equipe', status: '🔄 Status' };

      container.innerHTML = `
        <div style="border-left:2px solid var(--border-subtle);padding-left:12px;">
          ${relevant.map(h => `
            <div style="margin-bottom:10px;position:relative;">
              <div style="position:absolute;left:-17px;top:2px;width:8px;height:8px;border-radius:50%;background:var(--accent-gold);border:2px solid var(--bg-primary);"></div>
              <div style="font-size:0.68rem;color:var(--text-muted);">${h.changed_at ? new Date(h.changed_at).toLocaleDateString('pt-BR') : ''}</div>
              <div style="font-size:0.76rem;font-weight:500;">${fieldLabels[h.field_changed] || h.field_changed}</div>
              <div style="font-size:0.7rem;color:var(--text-secondary);">
                ${h.old_value ? `<span style="text-decoration:line-through;opacity:0.6;">${this._esc(String(h.old_value).slice(0, 30))}</span> → ` : ''}
                <strong>${this._esc(String(h.new_value).slice(0, 30))}</strong>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    } catch (e) {
      console.warn('[RH] Erro ao carregar historico:', e.message);
      container.innerHTML = '<div style="font-size:0.72rem;color:var(--text-muted);">Erro ao carregar</div>';
    }
  },

  // ── Abrir drawer com backdrop (fechar com click fora, Escape) ──
  _openPersonDrawer(personId) {
    const drawer = document.getElementById('rhPersonDrawer');
    if (!drawer) return;

    // Criar backdrop se nao existir
    let backdrop = document.getElementById('rhDrawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'rhDrawerBackdrop';
      backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:1099;opacity:0;transition:opacity 0.2s ease;';
      drawer.parentElement.appendChild(backdrop);
    }

    drawer.innerHTML = this._renderPersonDrawer(personId);
    drawer.style.display = 'block';
    backdrop.style.display = 'block';
    requestAnimationFrame(() => { backdrop.style.opacity = '1'; drawer.classList.add('rh-drawer-open'); });
    if (window.lucide) lucide.createIcons();

    // Carregar tarefas da pessoa e dados do onboarding (async)
    this._loadPersonTasks(personId);
    this._loadDrawerOnboardingData(personId);
    this._loadDrawerProjects(personId);
    this._loadDrawerSkills(personId);
    this._loadDrawerMetas(personId);
    this._loadDrawerHistory(personId);

    // Abrir perfil completo
    this._bind('rhOpenFullProfile', () => {
      this._closePersonDrawer();
      TBO_ROUTER.navigate(`people/${personId}/overview`);
    });
    // Fechar pelo X
    this._bind('rhCloseDrawer', () => this._closePersonDrawer());
    // Fechar pelo backdrop
    backdrop.addEventListener('click', () => this._closePersonDrawer());
    // Fechar por Escape
    this._drawerEscHandler = (e) => { if (e.key === 'Escape') this._closePersonDrawer(); };
    document.addEventListener('keydown', this._drawerEscHandler);

    // ── Edicao de pessoa ──
    this._bind('rhEditPerson', () => {
      const editForm = document.getElementById('rhEditPersonForm');
      const readOnly = document.getElementById('rhDrawerReadOnly');
      if (editForm && readOnly) {
        const isEditing = editForm.style.display !== 'none';
        editForm.style.display = isEditing ? 'none' : 'block';
        readOnly.style.display = isEditing ? 'grid' : 'none';
        // Atualizar botao
        const btn = document.getElementById('rhEditPerson');
        if (btn) btn.innerHTML = isEditing
          ? '<i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar'
          : '<i data-lucide="x" style="width:12px;height:12px;"></i> Cancelar';
        if (window.lucide) lucide.createIcons();
      }
    });
    this._bind('rhCancelPersonEdit', () => {
      const editForm = document.getElementById('rhEditPersonForm');
      const readOnly = document.getElementById('rhDrawerReadOnly');
      if (editForm) editForm.style.display = 'none';
      if (readOnly) readOnly.style.display = 'grid';
      const btn = document.getElementById('rhEditPerson');
      if (btn) { btn.innerHTML = '<i data-lucide="pencil" style="width:12px;height:12px;"></i> Editar'; if (window.lucide) lucide.createIcons(); }
    });
    this._bind('rhSavePersonEdit', async () => {
      const saveBtn = document.getElementById('rhSavePersonEdit');
      const supabaseId = saveBtn?.dataset.supabaseId;
      if (!supabaseId || typeof PeopleRepo === 'undefined') {
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', 'Repositorio nao disponivel');
        return;
      }
      // Coletar valores do formulario
      const updates = {};
      const fullName = document.getElementById('editFullName')?.value?.trim();
      const cargo = document.getElementById('editCargo')?.value?.trim();
      const teamId = document.getElementById('editBU')?.value || null;
      const status = document.getElementById('editStatus')?.value || 'active';
      const salary = document.getElementById('editSalary')?.value;
      const phone = document.getElementById('editPhone')?.value?.trim() || null;
      const managerId = document.getElementById('editManager')?.value || null;
      const contractType = document.getElementById('editContractType')?.value || null;

      if (fullName) updates.full_name = fullName;
      if (cargo !== undefined) updates.cargo = cargo;
      updates.team_id = teamId;
      updates.status = status;
      updates.is_active = (status === 'active' || status === 'vacation' || status === 'away' || status === 'onboarding');
      if (salary !== '' && salary !== undefined) updates.salary_pj = parseFloat(salary) || 0;
      updates.phone = phone;
      updates.manager_id = managerId;
      if (contractType !== undefined) updates.contract_type = contractType;

      // Salvar via PeopleRepo
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i data-lucide="loader" style="width:14px;height:14px;animation:spin 1s linear infinite;"></i> Salvando...';
      if (window.lucide) lucide.createIcons();
      try {
        await PeopleRepo.update(supabaseId, updates);

        // Auto-trigger onboarding/offboarding se status mudou
        if (typeof OnboardingRepo !== 'undefined') {
          if (status === 'onboarding') {
            try {
              await OnboardingRepo.triggerAutomation(supabaseId, 'onboarding');
              console.log(`[RH] Onboarding automatico disparado para ${fullName || supabaseId}`);
            } catch (e) { console.warn('[RH] Erro ao disparar onboarding:', e.message); }
          } else if (status === 'offboarding') {
            try {
              await OnboardingRepo.triggerAutomation(supabaseId, 'offboarding');
              console.log(`[RH] Offboarding automatico disparado para ${fullName || supabaseId}`);
            } catch (e) { console.warn('[RH] Erro ao disparar offboarding:', e.message); }
          }
        }

        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.success('Perfil atualizado!', fullName || '');
        // Recarregar equipe e reabrir drawer
        this._teamLoaded = false;
        await this._loadTeamFromSupabase({ force: true });
        // Re-renderizar lista e drawer
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
        // Reabrir drawer com dados atualizados
        this._openPersonDrawer(personId);
      } catch (err) {
        console.error('[RH] Erro ao atualizar perfil:', err);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro ao salvar', err.message || 'Tente novamente');
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i data-lucide="check" style="width:14px;height:14px;"></i> Salvar';
        if (window.lucide) lucide.createIcons();
      }
    });
  },

  _closePersonDrawer() {
    const drawer = document.getElementById('rhPersonDrawer');
    const backdrop = document.getElementById('rhDrawerBackdrop');
    if (drawer) { drawer.classList.remove('rh-drawer-open'); setTimeout(() => { drawer.style.display = 'none'; drawer.innerHTML = ''; }, 200); }
    if (backdrop) { backdrop.style.opacity = '0'; setTimeout(() => { backdrop.style.display = 'none'; }, 200); }
    if (this._drawerEscHandler) { document.removeEventListener('keydown', this._drawerEscHandler); this._drawerEscHandler = null; }
  },

  // ── Person Tasks (Supabase) ─────────────────────────────────
  async _loadPersonTasks(personId) {
    const list = document.getElementById('rhPersonTaskList');
    if (!list) return;

    // Tentar Supabase primeiro
    if (typeof TBO_SUPABASE !== 'undefined') {
      try {
        const client = TBO_SUPABASE.getClient();
        const tenantId = TBO_SUPABASE.getCurrentTenantId();
        if (client && tenantId) {
          const { data, error } = await client.from('person_tasks')
            .select('*')
            .eq('tenant_id', tenantId)
            .eq('person_id', personId)
            .neq('status', 'cancelada')
            .order('created_at', { ascending: false });
          if (!error && data) {
            this._personTasks = data;
            list.innerHTML = this._renderPersonTaskItems(data, personId);
            this._bindPersonTaskActions(personId);
            return;
          }
        }
      } catch (e) { console.warn('[RH] Supabase person_tasks nao disponivel, usando localStorage', e.message); }
    }

    // Fallback: localStorage
    const tasks = this._getStore('person_tasks_' + personId);
    this._personTasks = tasks;
    list.innerHTML = this._renderPersonTaskItems(tasks, personId);
    this._bindPersonTaskActions(personId);
  },

  _renderPersonTaskItems(tasks, personId) {
    const pending = tasks.filter(t => t.status !== 'concluida');
    const done = tasks.filter(t => t.status === 'concluida');
    if (!tasks.length) return '<div style="font-size:0.72rem;color:var(--text-muted);padding:8px 0;">Nenhuma tarefa ainda</div>';

    const priorityColors = { alta: 'var(--color-danger)', media: 'var(--accent-gold)', baixa: 'var(--color-info)' };
    const categoryLabels = { pdi: 'PDI', onboarding: 'Onboard', '1on1_action': '1:1', general: 'Geral' };

    const renderTask = (t) => `
      <div class="rh-person-task-item" style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--border-subtle);">
        <input type="checkbox" class="rh-task-check" data-task-id="${t.id}" data-person="${personId}" ${t.status === 'concluida' ? 'checked' : ''} style="margin-top:2px;cursor:pointer;">
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.75rem;${t.status === 'concluida' ? 'text-decoration:line-through;color:var(--text-muted);' : ''}">${this._esc(t.title)}</div>
          <div style="display:flex;gap:4px;margin-top:3px;">
            <span class="tag" style="font-size:0.55rem;background:${priorityColors[t.priority] || 'var(--text-muted)'}20;color:${priorityColors[t.priority] || 'var(--text-muted)'};">${t.priority || 'media'}</span>
            <span class="tag" style="font-size:0.55rem;">${categoryLabels[t.category] || 'Geral'}</span>
            ${t.due_date ? `<span style="font-size:0.55rem;color:var(--text-muted);">${t.due_date}</span>` : ''}
          </div>
        </div>
      </div>`;

    let html = pending.map(renderTask).join('');
    if (done.length) {
      html += `<div style="font-size:0.68rem;color:var(--text-muted);margin-top:8px;margin-bottom:4px;">Concluidas (${done.length})</div>`;
      html += done.slice(0, 3).map(renderTask).join('');
    }
    return html;
  },

  _bindPersonTaskActions(personId) {
    // Botao nova tarefa
    this._bindToggle('rhNewPersonTask', 'rhPersonTaskForm');
    this._bindToggle('ptCancel', 'rhPersonTaskForm', false);

    // Salvar tarefa
    this._bind('ptSave', async () => {
      const title = document.getElementById('ptTitle')?.value?.trim();
      if (!title) { TBO_TOAST.warning('Digite o titulo da tarefa'); return; }

      const task = {
        id: this._genId(),
        person_id: personId,
        title,
        priority: document.getElementById('ptPriority')?.value || 'media',
        category: document.getElementById('ptCategory')?.value || 'general',
        due_date: document.getElementById('ptDueDate')?.value || null,
        status: 'pendente',
        created_at: new Date().toISOString()
      };

      // Tentar Supabase
      if (typeof TBO_SUPABASE !== 'undefined') {
        try {
          const client = TBO_SUPABASE.getClient();
          const tenantId = TBO_SUPABASE.getCurrentTenantId();
          if (client && tenantId) {
            const session = await TBO_SUPABASE.getSession();
            const { error } = await client.from('person_tasks').insert({
              ...task, tenant_id: tenantId, assigned_by: session?.user?.id || null
            });
            if (!error) {
              TBO_TOAST.success('Tarefa criada!');
              await this._loadPersonTasks(personId);
              document.getElementById('rhPersonTaskForm').style.display = 'none';
              document.getElementById('ptTitle').value = '';
              return;
            }
          }
        } catch (e) { console.warn('[RH] Fallback localStorage para person_tasks', e.message); }
      }

      // Fallback: localStorage
      const tasks = this._getStore('person_tasks_' + personId);
      tasks.unshift(task);
      this._setStore('person_tasks_' + personId, tasks);
      TBO_TOAST.success('Tarefa criada!');
      await this._loadPersonTasks(personId);
      document.getElementById('rhPersonTaskForm').style.display = 'none';
      document.getElementById('ptTitle').value = '';
    });

    // Toggle status das tarefas
    document.querySelectorAll('.rh-task-check').forEach(chk => {
      chk.addEventListener('change', async () => {
        const taskId = chk.dataset.taskId;
        const pid = chk.dataset.person;
        const newStatus = chk.checked ? 'concluida' : 'pendente';

        if (typeof TBO_SUPABASE !== 'undefined') {
          try {
            const client = TBO_SUPABASE.getClient();
            if (client) {
              await client.from('person_tasks').update({ status: newStatus }).eq('id', taskId);
              await this._loadPersonTasks(pid);
              return;
            }
          } catch (e) { /* fallback */ }
        }

        const tasks = this._getStore('person_tasks_' + pid);
        const t = tasks.find(x => x.id === taskId);
        if (t) { t.status = newStatus; this._setStore('person_tasks_' + pid, tasks); }
        await this._loadPersonTasks(pid);
      });
    });

    if (window.lucide) lucide.createIcons();
  },

  // ── Bind para conteudo da visao geral (cards/tabela/organograma) ──
  _bindVisaoGeralContent() {
    // Cards: click abre drawer
    document.querySelectorAll('.rh-person-card').forEach(card => {
      card.addEventListener('click', () => this._openPersonDrawer(card.dataset.person));
    });
    // Tabela: click na row abre drawer
    document.querySelectorAll('.rh-person-row').forEach(row => {
      row.addEventListener('click', () => this._openPersonDrawer(row.dataset.person));
    });
    // Organograma: click no card abre drawer
    document.querySelectorAll('.rh-org-card[data-person]').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openPersonDrawer(card.dataset.person);
      });
    });
    // Organograma: toggle expand/collapse de reports
    document.querySelectorAll('.rh-org-toggle').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const parentId = btn.dataset.toggle;
        const children = document.querySelector(`.rh-org-children[data-parent="${parentId}"]`);
        if (children) {
          children.classList.toggle('rh-org-collapsed');
          const icon = btn.querySelector('[data-lucide]');
          if (icon) icon.style.transform = children.classList.contains('rh-org-collapsed') ? '' : 'rotate(180deg)';
        }
      });
    });
    // Tabela BU: toggle de grupo (colapsar/expandir)
    document.querySelectorAll('.rh-bu-group-header').forEach(header => {
      header.addEventListener('click', () => {
        const group = header.dataset.group;
        const rows = document.querySelectorAll(`.rh-bu-row[data-group="${group}"]`);
        const chevron = header.querySelector('.rh-group-chevron');
        const isHidden = rows[0]?.style.display === 'none';
        rows.forEach(r => r.style.display = isHidden ? '' : 'none');
        if (chevron) chevron.style.transform = isHidden ? '' : 'rotate(-90deg)';
      });
    });
    // Action menu (⋯) — abre context menu por usuario
    document.querySelectorAll('.rh-action-menu-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = btn.getBoundingClientRect();
        this._renderContextMenu(btn.dataset.person, btn.dataset.name, rect.right - 200, rect.bottom + 4);
      });
    });
    // Context menu items
    document.querySelectorAll('.rh-ctx-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = document.getElementById('rhContextMenu');
        if (menu) menu.style.display = 'none';
        this._handleContextAction(item.dataset.action, item.dataset.person);
      });
    });
    // Colleague chips no drawer -> abrir perfil
    document.querySelectorAll('.rh-colleague-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        this._openPersonDrawer(chip.dataset.person);
      });
    });
  },

  // ── Bind helpers ──────────────────────────────────────────────
  _bind(id, fn) { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); },

  _bindToggle(btnId, formId, show = true) {
    const btn = document.getElementById(btnId);
    const form = document.getElementById(formId);
    if (btn && form) btn.addEventListener('click', () => { form.style.display = show ? (form.style.display === 'none' ? 'block' : 'none') : 'none'; });
  },

  _bindPersonDetailClicks() {
    document.querySelectorAll('.rh-view-person').forEach(btn => {
      btn.addEventListener('click', () => {
        const personId = btn.dataset.person;
        const cycleId = btn.dataset.cycle;
        if (!this._isAdmin() && personId !== this._currentUserId()) { TBO_TOAST.warning('Acesso restrito.'); return; }
        const overlay = document.getElementById('rhDetailOverlay');
        if (overlay) {
          document.querySelectorAll('#rhPerfSubtabs, #rhPerfSubtabs ~ .subtab-content').forEach(el => el.style.display = 'none');
          overlay.style.display = 'block';
          overlay.innerHTML = this._renderPersonDetail(personId, cycleId);
          if (window.lucide) lucide.createIcons();
          this._bind('rhBackToList', () => {
            overlay.style.display = 'none'; overlay.innerHTML = '';
            document.querySelectorAll('#rhPerfSubtabs').forEach(el => el.style.display = '');
            document.querySelectorAll('#rhPerfSubtabs ~ .subtab-content.active').forEach(el => el.style.display = 'block');
          });
        }
      });
    });
  },

  _bindCurtirElogios() {
    document.querySelectorAll('.rh-curtir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const items = this._getStore('elogios');
        const item = items.find(el => el.id === btn.dataset.id);
        if (item) { item.curtidas = (item.curtidas || 0) + 1; this._setStore('elogios', items); }
        const list = document.getElementById('rhElogioList');
        if (list) { list.innerHTML = this._renderElogioItems(items); this._bindCurtirElogios(); }
      });
    });
  },

  _bindActionChecks() {
    document.querySelectorAll('.rh-action-check').forEach(chk => {
      chk.addEventListener('change', async () => {
        const actionId = chk.dataset.id;
        // Tentar Supabase primeiro
        if (typeof OneOnOnesRepo !== 'undefined' && this._oneOnOnesCache !== null) {
          try {
            await OneOnOnesRepo.toggleAction(actionId, chk.checked);
            TBO_TOAST.success('Acao atualizada!');
            return;
          } catch (e) { console.warn('[RH] Erro toggle action Supabase:', e.message); }
        }
        // Fallback localStorage
        const items = this._getStore('1on1s');
        items.forEach(o => { (o.items || []).forEach(a => { if (a.id === actionId) a.concluido = chk.checked; }); });
        this._setStore('1on1s', items);
        TBO_TOAST.success('Acao atualizada!');
      });
    });

    // Delete de acoes pendentes
    document.querySelectorAll('.rh-action-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const actionId = btn.dataset.id;
        // Tentar Supabase primeiro
        if (typeof OneOnOnesRepo !== 'undefined' && this._oneOnOnesCache !== null) {
          try {
            await OneOnOnesRepo.removeAction(actionId);
            TBO_TOAST.success('Acao removida');
            this._oneOnOneActionsCache = null;
            await this._load1on1sFromSupabase();
            return;
          } catch (e) { console.warn('[RH] Erro delete action Supabase:', e.message); }
        }
        // Fallback localStorage
        const items = this._getStore('1on1s');
        items.forEach(o => {
          if (o.items) o.items = o.items.filter(a => a.id !== actionId);
        });
        this._setStore('1on1s', items);
        TBO_TOAST.success('Acao removida');
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
        if (window.lucide) lucide.createIcons();
      });
    });
  },

  async _submitAvaliacao(cycleId) {
    const targetId = document.getElementById('avalTarget')?.value;
    const targetUsername = document.getElementById('avalTarget')?.selectedOptions?.[0]?.dataset?.username;
    if (!targetId) { TBO_TOAST.warning('Selecione um colaborador'); return; }
    const scores = this._competenciasRadar.map(c => {
      const active = document.querySelector(`.aval-score-btn[data-comp="${c.id}"].active`);
      return { comp: c.id, nota: active ? parseFloat(active.dataset.score) : 3 };
    });
    if (!scores.some(s => document.querySelector(`.aval-score-btn[data-comp="${s.comp}"].active`))) { TBO_TOAST.warning('Avalie pelo menos uma competencia'); return; }
    const parecer = document.getElementById('avalParecer')?.value || '';
    const avg = (arr) => arr.length ? +(arr.reduce((s, x) => s + x.nota, 0) / arr.length).toFixed(2) : 0;
    const gestorAvg = avg(scores);

    // Tentar salvar no Supabase
    if (typeof PerformanceRepo !== 'undefined') {
      try {
        // Buscar ciclo ativo
        const cycle = await PerformanceRepo.getActiveCycle();
        if (cycle) {
          await PerformanceRepo.submitReview({
            cycle_id: cycle.id,
            target_user: targetId,
            review_type: 'manager',
            scores: scores,
            average: gestorAvg,
            highlights: [],
            gaps: [],
            comment: parecer
          });
          const personName = targetUsername ? this._getPersonName(targetUsername) : targetId;
          TBO_TOAST.success('Avaliacao submetida!', `${personName} — ${gestorAvg.toFixed(1)}`);
          const tabContent = document.getElementById('rhTabContent');
          if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
          return;
        }
      } catch (e) {
        console.warn('[RH] Erro ao salvar avaliacao no Supabase:', e.message);
      }
    }

    // Fallback: localStorage
    const localTargetId = targetUsername || targetId;
    const reviews = this._getStore('avaliacoes_people');
    let review = reviews.find(r => r.pessoaId === localTargetId && r.cicloId === cycleId);
    if (review) { review.gestorScores = scores; if (parecer) review.parecer = parecer; }
    else {
      const def = this._competenciasRadar.map(c => ({ comp: c.id, nota: 3 }));
      review = { id: this._genId(), cicloId: cycleId, pessoaId: localTargetId, autoScores: def.map(s => ({ ...s })), gestorScores: scores, paresScores: def.map(s => ({ ...s })), destaques: [], gaps: [], parecer };
      reviews.push(review);
    }
    review.autoMedia = avg(review.autoScores); review.gestorMedia = avg(review.gestorScores); review.paresMedia = avg(review.paresScores);
    review.mediaGeral = +((review.autoMedia * 0.2 + review.gestorMedia * 0.5 + review.paresMedia * 0.3)).toFixed(2);
    this._setStore('avaliacoes_people', reviews);
    TBO_TOAST.success('Avaliacao submetida!', `${this._getPersonName(localTargetId)} — ${review.mediaGeral.toFixed(1)}`);
    const tabContent = document.getElementById('rhTabContent');
    if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
  }
};
