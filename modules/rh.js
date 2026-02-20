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
  _esc(s) { return typeof TBO_FORMATTER !== 'undefined' ? TBO_FORMATTER.escapeHtml(s) : s; },

  _isAdmin() {
    if (typeof TBO_AUTH === 'undefined') return true;
    // RBAC: usa canDo para verificar permissao de gestao de usuarios
    return TBO_AUTH.canDo('users', 'edit') || TBO_AUTH.getCurrentUser()?.isCoordinator;
  },
  _currentUserId() {
    if (typeof TBO_AUTH === 'undefined') return 'marco';
    const u = TBO_AUTH.getCurrentUser();
    return u ? u.id : 'marco';
  },

  _getInternalTeam() { return this._team.filter(t => !t.terceirizado); },

  _getBUs() {
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

    if (typeof TBO_SUPABASE !== 'undefined') {
      try {
        const client = TBO_SUPABASE.getClient();
        const tenantId = TBO_SUPABASE.getCurrentTenantId();
        if (client && tenantId) {
          // Montar query com filtros
          let query = client
            .from('profiles')
            .select('id, username, full_name, email, role, bu, is_coordinator, is_active, tenant_id, avatar_url, created_at, last_sign_in_at', { count: 'exact' })
            .eq('tenant_id', tenantId);

          // Filtros server-side
          if (this._filterStatus === 'ativo') query = query.eq('is_active', true);
          else if (this._filterStatus === 'inativo' || this._filterStatus === 'suspenso' || this._filterStatus === 'removido') query = query.eq('is_active', false);

          if (this._filterSquad) query = query.eq('bu', this._filterSquad);
          if (this._filterSearch) {
            // Busca por nome OU email — sanitizar contra caracteres especiais do PostgREST
            const safeSearch = this._filterSearch.replace(/[%(),.]/g, '');
            query = query.or(`full_name.ilike.%${safeSearch}%,email.ilike.%${safeSearch}%`);
          }

          // Ordenacao e paginacao
          query = query.order(this._sortBy, { ascending: this._sortDir === 'asc' })
            .range(this._page * this._pageSize, (this._page + 1) * this._pageSize - 1);

          const { data: profiles, error, count } = await query;

          if (!error && profiles) {
            this._totalCount = count || profiles.length;

            // Mapear profiles do Supabase para formato _team
            const seedMap = {};
            this._teamSeed.forEach(s => { seedMap[s.id] = s; });

            // Carregar roles RBAC dos tenant_members
            let roleMap = {};
            try {
              const { data: members } = await client
                .from('tenant_members')
                .select('user_id, role_id, roles(name, label, color)')
                .eq('tenant_id', tenantId);
              if (members) {
                members.forEach(m => { roleMap[m.user_id] = m.roles || {}; });
              }
            } catch (e) { /* fallback silencioso */ }

            this._team = profiles.map(p => {
              const username = p.username || p.email?.split('@')[0] || '';
              const seed = seedMap[username] || {};
              const rbacRole = roleMap[p.id] || {};
              return {
                id: username,
                supabaseId: p.id,
                nome: p.full_name || username,
                cargo: seed.cargo || (p.is_coordinator ? 'Coordenador(a)' : p.role || ''),
                area: seed.area || (p.bu ? `BU ${p.bu}` : ''),
                bu: p.bu || seed.bu || '',
                nivel: seed.nivel || '',
                lider: seed.lider || null,
                status: p.is_active ? 'ativo' : 'inativo',
                avatarUrl: p.avatar_url || null,
                email: p.email || '',
                rbacRole: rbacRole.name || p.role || 'artist',
                rbacLabel: rbacRole.label || p.role || 'Artista',
                rbacColor: rbacRole.color || '#94a3b8',
                isCoordinator: p.is_coordinator || false,
                dataEntrada: p.created_at || null,
                ultimoLogin: p.last_sign_in_at || null,
                terceirizado: seed.terceirizado || false
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
                lastSignIn: p.last_sign_in_at
              };
            });

            this._teamLoaded = true;
            this._loading = false;
            console.log(`[RH] Equipe carregada do Supabase: ${this._team.length}/${this._totalCount} membros`);
            return;
          }
        }
      } catch (e) {
        console.warn('[RH] Erro ao carregar equipe do Supabase:', e.message);
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
    // v2.3: Garantir _team preenchido antes do seed data (que referencia _team)
    if (!this._team.length) this._team = [...this._teamSeed];

    this._ensureSeedData();

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

        <div class="tab-bar" id="rhMainTabs" style="margin-bottom:20px;">
          <button class="tab ${tab === 'visao-geral' ? 'active' : ''}" data-tab="visao-geral">Visao Geral</button>
          <button class="tab ${tab === 'performance' ? 'active' : ''}" data-tab="performance">Performance & PDI</button>
          <button class="tab ${tab === 'cultura' ? 'active' : ''}" data-tab="cultura">Cultura & Reconhecimento</button>
          <button class="tab ${tab === 'one-on-ones' ? 'active' : ''}" data-tab="one-on-ones">1:1s & Rituais</button>
          <button class="tab ${tab === 'analytics' ? 'active' : ''}" data-tab="analytics">Analytics</button>
        </div>

        <div id="rhTabContent">
          ${this._renderActiveTab()}
        </div>
      </div>
    `;
  },

  _renderActiveTab() {
    switch (this._activeTab) {
      case 'visao-geral':  return this._renderVisaoGeral();
      case 'performance':  return this._renderPerformance();
      case 'cultura':      return this._renderCultura();
      case 'one-on-ones':  return this._render1on1s();
      case 'analytics':    return this._renderAnalytics();
      default:             return this._renderVisaoGeral();
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

    return `
      <div class="grid-4" style="margin-bottom:24px;">
        <div class="kpi-card"><div class="kpi-label">Total Pessoas</div><div class="kpi-value">${this._totalCount || team.length}</div><div class="kpi-sub">${coordinators} coordenadores</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Ativos</div><div class="kpi-value">${team.filter(t => t.status === 'ativo').length}</div><div class="kpi-sub">em operacao</div></div>
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">BUs</div><div class="kpi-value">${bus.length}</div><div class="kpi-sub">${bus.join(', ')}</div></div>
        <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Performance</div><div class="kpi-value">${mediaGeral}</div><div class="kpi-sub">escala 1-5</div></div>
      </div>

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
              <option value="inativo" ${this._filterStatus === 'inativo' ? 'selected' : ''}>Inativo</option>
              <option value="onboarding" ${this._filterStatus === 'onboarding' ? 'selected' : ''}>Onboarding</option>
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
    // Construir arvore hierarquica baseada no campo 'lider'
    const roots = team.filter(t => !t.lider);
    const getChildren = (parentId) => team.filter(t => t.lider === parentId);
    const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };

    const renderNode = (person, level = 0) => {
      const children = getChildren(person.id);
      const color = buColors[person.bu] || 'var(--accent-gold)';
      const review = this._getStore('avaliacoes_people').find(r => r.pessoaId === person.id);
      const score = review ? review.mediaGeral.toFixed(1) : '';
      const isLeader = children.length > 0;

      return `
        <div class="rh-org-node" data-person="${person.id}" style="cursor:pointer;">
          <div class="rh-org-card" style="border-left:3px solid ${color};">
            <div style="display:flex;align-items:center;gap:10px;">
              ${this._getAvatarHTML(person, 36, '0.8rem')}
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:0.82rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._esc(person.nome)}</div>
                <div style="font-size:0.68rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${this._esc(person.cargo)}</div>
              </div>
              ${score ? `<div style="font-size:0.72rem;font-weight:700;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${score}</div>` : ''}
            </div>
            ${person.bu ? `<span class="tag" style="font-size:0.58rem;margin-top:6px;background:${color}15;color:${color};">${person.bu}</span>` : ''}
          </div>
          ${children.length ? `
            <div class="rh-org-children">
              ${children.map(c => renderNode(c, level + 1)).join('')}
            </div>
          ` : ''}
        </div>`;
    };

    return `
      <div class="card" style="padding:24px;overflow-x:auto;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:20px;">
          <i data-lucide="git-branch" style="width:18px;height:18px;color:var(--accent-gold);"></i>
          <h3 style="font-size:0.95rem;margin:0;">Organograma TBO</h3>
          <span style="font-size:0.72rem;color:var(--text-muted);margin-left:auto;">${team.length} pessoas</span>
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
      'onboarding': { label: 'Onboarding', color: 'var(--color-info)',    icon: 'compass' },
      'convidado':  { label: 'Convidado',  color: 'var(--color-purple, #8b5cf6)', icon: 'mail' },
      'ferias':     { label: 'Ferias',     color: 'var(--color-warning)', icon: 'sun' },
      'suspenso':   { label: 'Suspenso',   color: 'var(--color-warning)', icon: 'pause-circle' },
      'inativo':    { label: 'Inativo',    color: 'var(--text-muted)',    icon: 'x-circle' },
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
                <th class="rh-sort-header" data-sort="created_at" style="min-width:85px;cursor:pointer;">
                  <div style="display:flex;align-items:center;gap:4px;">Entrada ${sortIcon('created_at')}</div>
                </th>
                <th style="min-width:95px;">Lider</th>
                <th style="min-width:75px;text-align:center;">Status</th>
                <th class="rh-sort-header" data-sort="last_sign_in_at" style="min-width:85px;cursor:pointer;">
                  <div style="display:flex;align-items:center;gap:4px;">Ultimo Login ${sortIcon('last_sign_in_at')}</div>
                </th>
                ${isAdmin ? '<th style="width:40px;text-align:center;"></th>' : ''}
              </tr>
            </thead>
            <tbody>
              ${sortedGroups.map(([groupName, members]) => {
                const color = buColors[groupName] || 'var(--accent-gold)';
                const colSpan = isAdmin ? 9 : 8;
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
                    const liderNome = p.lider ? this._getPersonName(p.lider) : '\u2014';
                    const ultimoLogin = p.ultimoLogin ? new Date(p.ultimoLogin).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '\u2014';
                    return `
                    <tr class="rh-bu-row rh-person-row" data-person="${p.id}" data-group="${groupName}" data-bu="${p.bu || ''}" style="cursor:pointer;">
                      <td>
                        <div style="display:flex;align-items:center;gap:10px;">
                          ${this._getAvatarHTML(p, 32, '0.72rem')}
                          <div style="min-width:0;">
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
                      <td style="font-size:0.75rem;color:var(--text-secondary);">${new Date(dataEntrada).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</td>
                      <td style="font-size:0.75rem;">${liderNome !== '\u2014' ? `<span style="color:var(--text-secondary);">${this._esc(liderNome)}</span>` : '<span style="color:var(--text-muted);">\u2014</span>'}</td>
                      <td style="text-align:center;">
                        <span class="tag" style="font-size:0.62rem;background:${st.color}18;color:${st.color};">
                          ${st.label}
                        </span>
                      </td>
                      <td style="font-size:0.72rem;color:var(--text-muted);">${ultimoLogin}</td>
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
        <div class="rh-person-card" data-person="${person.id}" data-bu="${person.bu || ''}">
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

    // Metas simuladas (baseadas no PDI/gaps)
    const metas = [];
    if (review) {
      (review.gaps || []).forEach((g, i) => {
        const progress = Math.floor(Math.random() * 60) + 20;
        metas.push({ id: i, nome: `Desenvolver ${g}`, progresso: progress, prazo: '2026-06-30' });
      });
      if (!metas.length) {
        metas.push({ id: 0, nome: 'Manter excelencia nas entregas', progresso: 85, prazo: '2026-06-30' });
      }
    }

    // Projetos recentes simulados (baseado na BU)
    const projetos = [
      { nome: `Projeto ${person.bu || 'Geral'} Q1`, status: 'em_andamento', cor: 'var(--color-info)' },
      { nome: `Campanha ${person.area || 'Interna'}`, status: 'concluido', cor: 'var(--color-success)' }
    ];

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

        <!-- Layout 2 colunas estilo Asana -->
        <div style="display:grid;grid-template-columns:1fr;gap:16px;margin-top:16px;">

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

          <!-- Meus Projetos Recentes -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="folder" style="width:16px;height:16px;color:var(--color-info);"></i> Projetos Recentes
            </div>
            ${projetos.map(pj => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px;background:var(--bg-elevated);border-radius:6px;margin-bottom:6px;">
                <div style="width:8px;height:8px;border-radius:50%;background:${pj.cor};flex-shrink:0;"></div>
                <div style="flex:1;font-size:0.8rem;font-weight:500;">${pj.nome}</div>
                <span class="tag" style="font-size:0.6rem;background:${pj.cor}20;color:${pj.cor};">${pj.status === 'concluido' ? 'Concluido' : 'Em andamento'}</span>
              </div>
            `).join('')}
          </div>

          <!-- Minhas Metas -->
          <div class="rh-profile-section">
            <div style="font-weight:700;font-size:0.88rem;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
              <i data-lucide="target" style="width:16px;height:16px;color:var(--accent-gold);"></i> Metas
            </div>
            ${metas.map(m => `
              <div style="margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;font-size:0.78rem;margin-bottom:4px;">
                  <span>${m.nome}</span>
                  <span style="font-weight:600;color:${m.progresso >= 75 ? 'var(--color-success)' : m.progresso >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${m.progresso}%</span>
                </div>
                <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${m.progresso}%;background:${m.progresso >= 75 ? 'var(--color-success)' : m.progresso >= 40 ? 'var(--accent-gold)' : 'var(--color-danger)'};border-radius:3px;transition:width 0.3s;"></div>
                </div>
              </div>
            `).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Sem metas definidas</div>'}
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
      <div class="form-group" style="max-width:400px;margin-bottom:16px;"><label class="form-label">Colaborador(a)</label><select class="form-input" id="avalTarget"><option value="">Selecione...</option>${targets.map(t => `<option value="${t.id}">${t.nome} \u2014 ${t.cargo}</option>`).join('')}</select></div>
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
  _renderCultura() {
    const elogios = this._getStore('elogios');
    const feedbacks = this._getStore('feedbacks');
    const userId = this._currentUserId();
    const isAdmin = this._isAdmin();

    // Valor ranking
    const valorCount = {};
    elogios.forEach(e => { valorCount[e.valor] = (valorCount[e.valor] || 0) + 1; });
    const personCount = {};
    elogios.forEach(e => { personCount[e.para] = (personCount[e.para] || 0) + 1; });
    const topPeople = Object.entries(personCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Culture score per person (elogios + feedbacks positivos)
    const cultureScores = {};
    elogios.forEach(e => { cultureScores[e.para] = (cultureScores[e.para] || 0) + 2; });
    feedbacks.filter(f => f.tipo === 'positivo').forEach(f => { cultureScores[f.para] = (cultureScores[f.para] || 0) + 1; });

    let filteredFb = feedbacks;
    if (!isAdmin) filteredFb = feedbacks.filter(f => f.de === userId || f.para === userId || f.visibilidade === 'publico');

    return `
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;">Valores Mais Reconhecidos</h4>
          ${this._valores.map(v => {
            const count = valorCount[v.id] || 0;
            const max = Math.max(...Object.values(valorCount), 1);
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="font-size:1.1rem;">${v.emoji}</span><span style="font-size:0.78rem;width:100px;">${v.nome}</span><div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(count / max) * 100}%;background:var(--accent-gold);border-radius:3px;"></div></div><span style="font-size:0.72rem;color:var(--text-muted);width:20px;text-align:right;">${count}</span></div>`;
          }).join('')}
        </div>
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;">Mais Reconhecidos</h4>
          ${topPeople.map(([id, count], i) => {
            const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}'];
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;"><span style="font-size:1.1rem;width:24px;text-align:center;">${medals[i] || (i + 1) + '.'}</span><span style="font-size:0.85rem;flex:1;font-weight:${i === 0 ? 700 : 400};">${this._getPersonName(id)}</span><span style="font-size:0.78rem;color:var(--accent-gold);font-weight:600;">${count}</span></div>`;
          }).join('') || '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum elogio ainda</div>'}
        </div>
      </div>

      <!-- Feed de Elogios -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Mural de Elogios</h3><button class="btn btn-primary btn-sm" id="rhNewElogio">+ Elogiar</button></div>
        <div id="rhElogioForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Para</label><select class="form-input" id="elPara">${this._team.filter(t => !t.terceirizado).map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select></div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Valor TBO</label><select class="form-input" id="elValor">${this._valores.map(v => `<option value="${v.id}">${v.emoji} ${v.nome}</option>`).join('')}</select></div>
          </div>
          <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Mensagem</label><textarea class="form-input" id="elTexto" rows="2" placeholder="Por que esta pessoa merece reconhecimento?"></textarea></div>
          <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="elSave">Publicar</button><button class="btn btn-secondary btn-sm" id="elCancel">Cancelar</button></div>
        </div>
        <div id="rhElogioList" style="max-height:400px;overflow-y:auto;">
          ${this._renderElogioItems(elogios)}
        </div>
      </div>

      <!-- Feedbacks -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Feedbacks</h3><button class="btn btn-primary btn-sm" id="rhNewFeedback">+ Feedback</button></div>
        <div id="rhFeedbackForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Para</label><select class="form-input" id="fbPara">${this._team.filter(t => !t.terceirizado).map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select></div>
            <div class="form-group" style="margin-bottom:0;"><label class="form-label">Tipo</label><select class="form-input" id="fbTipo"><option value="positivo">Positivo</option><option value="construtivo">Construtivo</option></select></div>
          </div>
          <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Mensagem</label><textarea class="form-input" id="fbTexto" rows="2" placeholder="Descreva o feedback..."></textarea></div>
          <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="fbSave">Enviar</button><button class="btn btn-secondary btn-sm" id="fbCancel">Cancelar</button></div>
        </div>
        <div id="rhFeedbackList" style="max-height:400px;overflow-y:auto;">
          ${this._renderFeedbackItems(filteredFb)}
        </div>
      </div>
    `;
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
  _render1on1s() {
    const items = this._getStore('1on1s');
    const isAdmin = this._isAdmin();
    const userId = this._currentUserId();
    const filtered = isAdmin ? items : items.filter(o => o.lider === userId || o.colaborador === userId);
    const concluidas = filtered.filter(o => o.status === 'concluida').length;
    const agendadas = filtered.filter(o => o.status === 'agendada').length;
    const allActions = filtered.flatMap(o => o.items || []);
    const pendingActions = allActions.filter(i => !i.concluido);

    // Rituais da empresa (do manual de cultura)
    const rituais = [
      { nome: 'Daily Socios', freq: 'Diaria', desc: 'Alinhamento rapido entre fundadores' },
      { nome: '1:1 Mensal', freq: 'Mensal', desc: 'PDI + feedback bidirecional' },
      { nome: 'Review Semanal', freq: 'Semanal', desc: 'Revisao de entregas por BU' },
      { nome: 'Retrospectiva', freq: 'Mensal', desc: 'O que foi bem, o que melhorar' },
      { nome: 'All Hands', freq: 'Trimestral', desc: 'Resultados + visao da empresa' }
    ];

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Total 1:1s</div><div class="kpi-value">${filtered.length}</div></div>
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">Agendadas</div><div class="kpi-value">${agendadas}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Concluidas</div><div class="kpi-value">${concluidas}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Acoes Pendentes</div><div class="kpi-value">${pendingActions.length}</div></div>
      </div>

      ${pendingActions.length ? `<div class="card" style="margin-bottom:16px;"><div class="card-header"><h3 class="card-title">Acoes Pendentes</h3></div><div style="max-height:200px;overflow-y:auto;">
        ${pendingActions.map(a => `<div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
          <input type="checkbox" class="rh-action-check" data-id="${a.id}" style="width:16px;height:16px;accent-color:var(--accent-gold);">
          <div style="flex:1;font-size:0.82rem;">${a.texto}</div>
          <span style="font-size:0.72rem;color:var(--text-muted);">${this._getPersonName(a.responsavel)}</span>
          <span style="font-size:0.68rem;color:${a.prazo && new Date(a.prazo) < new Date() ? 'var(--color-danger)' : 'var(--text-muted)'};">${a.prazo ? new Date(a.prazo + 'T12:00').toLocaleDateString('pt-BR') : ''}</span>
          <button class="btn btn-ghost btn-sm rh-action-delete" data-id="${a.id}" title="Excluir acao" style="color:var(--color-danger);padding:2px 6px;"><i data-lucide="trash-2" style="width:12px;height:12px;"></i></button>
        </div>`).join('')}
      </div></div>` : ''}

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card">
          <div class="card-header"><h3 class="card-title">Proximas 1:1s</h3><button class="btn btn-primary btn-sm" id="rhNew1on1">+ Nova</button></div>
          <div id="rh1on1Form" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Lider</label><select class="form-input" id="ooLider">${this._team.filter(t => !t.lider || t.cargo.includes('Coord') || t.cargo.includes('PO') || t.cargo.includes('Lider') || t.cargo.includes('Diretor')).map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select></div>
              <div class="form-group" style="margin-bottom:0;"><label class="form-label">Colaborador</label><select class="form-input" id="ooColab">${this._team.filter(t => t.lider && !t.terceirizado).map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select></div>
            </div>
            <div class="form-group" style="margin-bottom:12px;"><label class="form-label">Data</label><input type="datetime-local" class="form-input" id="ooData"></div>
            <div style="display:flex;gap:8px;"><button class="btn btn-primary btn-sm" id="ooSave">Agendar</button><button class="btn btn-secondary btn-sm" id="ooCancel">Cancelar</button></div>
          </div>
          ${filtered.filter(o => o.status === 'agendada').sort((a, b) => new Date(a.data) - new Date(b.data)).map(o => `<div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;"><div><div style="font-size:0.85rem;font-weight:600;">${this._getPersonName(o.lider)} \u2194 ${this._getPersonName(o.colaborador)}</div><div style="font-size:0.72rem;color:var(--text-muted);">${new Date(o.data).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div></div><span class="tag" style="font-size:0.65rem;background:var(--color-info-dim);color:var(--color-info);">Agendada</span></div>`).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma agendada</div>'}
        </div>
        <div class="card">
          <div class="card-header"><h3 class="card-title">Historico</h3></div>
          ${filtered.filter(o => o.status === 'concluida').sort((a, b) => new Date(b.data) - new Date(a.data)).map(o => `<div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><div style="font-size:0.85rem;font-weight:600;">${this._getPersonName(o.lider)} \u2194 ${this._getPersonName(o.colaborador)}</div><span style="font-size:0.72rem;color:var(--text-muted);">${new Date(o.data).toLocaleDateString('pt-BR')}</span></div>${(o.items || []).length ? `<div style="font-size:0.72rem;color:var(--text-muted);">${o.items.length} items \u2022 ${o.items.filter(i => i.concluido).length} ok</div>` : ''}</div>`).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma no historico</div>'}
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

  // ══════════════════════════════════════════════════════════════════
  // TAB 5: ANALYTICS
  // ══════════════════════════════════════════════════════════════════
  _renderAnalytics() {
    const reviews = this._getStore('avaliacoes_people');
    const pulse = this._getStore('pulse');
    const elogios = this._getStore('elogios');
    const team = this._getInternalTeam();

    // Pulse chart (bar chart per week)
    const pulseAvgs = pulse.map(p => {
      const vals = Object.values(p.respostas);
      return { data: p.data, avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0 };
    }).reverse();

    // BU performance
    const buPerf = {};
    reviews.forEach(r => {
      const p = this._getPerson(r.pessoaId);
      if (p && p.bu) {
        if (!buPerf[p.bu]) buPerf[p.bu] = [];
        buPerf[p.bu].push(r.mediaGeral);
      }
    });

    // Turnover risk (low perf + low pulse = higher risk)
    const riskData = team.filter(t => t.lider).map(t => {
      const rev = reviews.find(r => r.pessoaId === t.id);
      const lastPulse = pulse[0]?.respostas[t.id];
      const perf = rev ? rev.mediaGeral : 3;
      const mood = lastPulse || 3;
      const risk = perf < 2.5 && mood <= 3 ? 'alto' : perf < 3 && mood <= 3 ? 'medio' : 'baixo';
      return { person: t, perf, mood, risk };
    });

    return `
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <!-- Pulse Survey -->
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Pulse Survey (Humor do Time)</h4>
          <div style="display:flex;align-items:flex-end;gap:8px;height:100px;">
            ${pulseAvgs.map(p => {
              const pct = (p.avg / 5) * 100;
              const color = p.avg >= 4 ? 'var(--color-success)' : p.avg >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)';
              return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;"><div style="width:100%;background:${color};border-radius:4px 4px 0 0;height:${pct}%;min-height:4px;"></div><div style="font-size:0.6rem;color:var(--text-muted);margin-top:4px;">${new Date(p.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</div><div style="font-size:0.68rem;font-weight:600;">${p.avg}</div></div>`;
            }).join('')}
          </div>
        </div>

        <!-- BU Performance -->
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Performance por BU</h4>
          ${Object.entries(buPerf).sort((a, b) => { const avgA = a[1].reduce((s, v) => s + v, 0) / a[1].length; const avgB = b[1].reduce((s, v) => s + v, 0) / b[1].length; return avgB - avgA; }).map(([bu, scores]) => {
            const avg = (scores.reduce((s, v) => s + v, 0) / scores.length).toFixed(1);
            const color = avg >= 4 ? 'var(--color-success)' : avg >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)';
            return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;"><span style="font-size:0.82rem;width:80px;font-weight:600;">${bu}</span><div style="flex:1;height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;"><div style="height:100%;width:${(avg / 5) * 100}%;background:${color};border-radius:4px;"></div></div><span style="font-size:0.85rem;font-weight:700;color:${color};">${avg}</span><span style="font-size:0.68rem;color:var(--text-muted);">(${scores.length}p)</span></div>`;
          }).join('')}
        </div>
      </div>

      <!-- Turnover Risk -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Risco de Turnover</h3></div>
        <table class="data-table"><thead><tr><th>Pessoa</th><th>BU</th><th style="text-align:center;">Performance</th><th style="text-align:center;">Humor</th><th style="text-align:center;">Risco</th></tr></thead>
        <tbody>${riskData.filter(d => d.risk !== 'baixo').map(d => `<tr>
          <td><strong style="font-size:0.85rem;">${d.person.nome}</strong></td>
          <td style="font-size:0.78rem;color:var(--text-muted);">${d.person.bu || 'Geral'}</td>
          <td style="text-align:center;font-weight:600;color:${d.perf >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${d.perf.toFixed(1)}</td>
          <td style="text-align:center;">${d.mood}/5</td>
          <td style="text-align:center;"><span class="tag" style="font-size:0.65rem;background:${d.risk === 'alto' ? 'var(--color-danger-dim)' : 'var(--color-warning-dim)'};color:${d.risk === 'alto' ? 'var(--color-danger)' : 'var(--color-warning)'};">${d.risk}</span></td>
        </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;font-size:0.78rem;color:var(--text-muted);">Nenhum risco identificado</td></tr>'}</tbody></table>
      </div>

      <!-- Culture Score -->
      <div class="card">
        <div class="card-header"><h3 class="card-title">Engajamento Cultural</h3></div>
        <div style="padding:16px;">
          <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">Baseado em elogios recebidos, feedbacks positivos e participacao em rituais</div>
          <div class="grid-4" style="gap:8px;">
            ${team.filter(t => t.lider).sort((a, b) => {
              const scoreA = (elogios.filter(e => e.para === a.id).length * 2) + reviews.filter(r => r.pessoaId === a.id).reduce((s, r) => s + r.mediaGeral, 0);
              const scoreB = (elogios.filter(e => e.para === b.id).length * 2) + reviews.filter(r => r.pessoaId === b.id).reduce((s, r) => s + r.mediaGeral, 0);
              return scoreB - scoreA;
            }).slice(0, 8).map(t => {
              const eCount = elogios.filter(e => e.para === t.id).length;
              return `<div style="text-align:center;padding:12px;background:var(--bg-elevated);border-radius:8px;"><div style="font-weight:600;font-size:0.82rem;">${t.nome}</div><div style="font-size:0.68rem;color:var(--text-muted);margin-bottom:4px;">${t.bu || 'Geral'}</div><div style="font-size:1.2rem;font-weight:800;color:var(--accent-gold);">${eCount}</div><div style="font-size:0.6rem;color:var(--text-muted);">elogios</div></div>`;
            }).join('')}
          </div>
        </div>
      </div>
    `;
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
      .rh-drawer { position: fixed; top: 0; right: 0; width: 460px; max-width: 92vw; height: 100vh; background: var(--bg-primary); border-left: 1px solid var(--border-subtle); box-shadow: -4px 0 20px rgba(0,0,0,0.18); z-index: 1000; overflow-y: auto; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
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
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // INIT (Event Bindings)
  // ══════════════════════════════════════════════════════════════════
  init() {
    // Main tab switching — otimizado: so re-renderiza conteudo da tab, nao o modulo inteiro
    document.querySelectorAll('#rhMainTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        // Salvar filtros antes de trocar
        const filterBuEl = document.querySelector('.rh-filter-bu');
        const filterSearchEl = document.querySelector('.rh-filter-search');
        if (filterBuEl) this._filterBU = filterBuEl.value;
        if (filterSearchEl) this._filterSearch = filterSearchEl.value;

        this._activeTab = tab.dataset.tab;

        // Atualizar visual da tab bar sem re-renderizar
        document.querySelectorAll('#rhMainTabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Re-renderizar apenas o conteudo da tab
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = this._renderActiveTab();
          this._initActiveTab();
        }
        if (typeof TBO_UX !== 'undefined') TBO_UX.updateBreadcrumb('rh', tab.textContent.trim());
      });
    });

    // Inicializar bindings da tab ativa
    this._initActiveTab();
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

      // Cards
      document.querySelectorAll('.rh-person-card').forEach(card => {
        const matchBu = !bu || card.dataset.bu === bu;
        const matchSearch = !search || card.textContent.toLowerCase().includes(search);
        card.style.display = (matchBu && matchSearch) ? '' : 'none';
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
        row.style.display = (matchBu && matchSearch) ? '' : 'none';
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
    this._bind('ooSave', () => {
      const oo = { id: this._genId(), lider: document.getElementById('ooLider')?.value, colaborador: document.getElementById('ooColab')?.value, data: document.getElementById('ooData')?.value || new Date().toISOString(), status: 'agendada', items: [] };
      const items = this._getStore('1on1s'); items.push(oo); this._setStore('1on1s', items);
      TBO_TOAST.success('1:1 agendada!');
      // Re-renderizar apenas a tab ao inves do modulo inteiro
      const tabContent = document.getElementById('rhTabContent');
      if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
    });

    // Action checkboxes
    this._bindActionChecks();

    // Lucide icons
    if (window.lucide) lucide.createIcons();
  },

  // ── Carregar dados do onboarding (tabela colaboradores) ──
  async _loadOnboardingData(personId) {
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

  // ── Abrir drawer com backdrop (fechar com click fora, Escape) ──
  _openPersonDrawer(personId) {
    const drawer = document.getElementById('rhPersonDrawer');
    if (!drawer) return;

    // Criar backdrop se nao existir
    let backdrop = document.getElementById('rhDrawerBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'rhDrawerBackdrop';
      backdrop.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:999;opacity:0;transition:opacity 0.2s ease;';
      drawer.parentElement.appendChild(backdrop);
    }

    drawer.innerHTML = this._renderPersonDrawer(personId);
    drawer.style.display = 'block';
    backdrop.style.display = 'block';
    requestAnimationFrame(() => { backdrop.style.opacity = '1'; drawer.classList.add('rh-drawer-open'); });
    if (window.lucide) lucide.createIcons();

    // Carregar tarefas da pessoa e dados do onboarding (async)
    this._loadPersonTasks(personId);
    this._loadOnboardingData(personId);

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
    // Organograma: click no node abre drawer
    document.querySelectorAll('.rh-org-node > .rh-org-card').forEach(card => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const node = card.closest('.rh-org-node');
        if (node) this._openPersonDrawer(node.dataset.person);
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
      chk.addEventListener('change', () => {
        const items = this._getStore('1on1s');
        items.forEach(o => { (o.items || []).forEach(a => { if (a.id === chk.dataset.id) a.concluido = chk.checked; }); });
        this._setStore('1on1s', items);
        TBO_TOAST.success('Acao atualizada!');
      });
    });

    // v2.5.1: Delete de acoes pendentes
    document.querySelectorAll('.rh-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const actionId = btn.dataset.id;
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

  _submitAvaliacao(cycleId) {
    const targetId = document.getElementById('avalTarget')?.value;
    if (!targetId) { TBO_TOAST.warning('Selecione um colaborador'); return; }
    const scores = this._competenciasRadar.map(c => {
      const active = document.querySelector(`.aval-score-btn[data-comp="${c.id}"].active`);
      return { comp: c.id, nota: active ? parseFloat(active.dataset.score) : 3 };
    });
    if (!scores.some(s => document.querySelector(`.aval-score-btn[data-comp="${s.comp}"].active`))) { TBO_TOAST.warning('Avalie pelo menos uma competencia'); return; }
    const parecer = document.getElementById('avalParecer')?.value || '';
    const reviews = this._getStore('avaliacoes_people');
    let review = reviews.find(r => r.pessoaId === targetId && r.cicloId === cycleId);
    if (review) { review.gestorScores = scores; if (parecer) review.parecer = parecer; }
    else {
      const def = this._competenciasRadar.map(c => ({ comp: c.id, nota: 3 }));
      review = { id: this._genId(), cicloId, pessoaId: targetId, autoScores: def.map(s => ({ ...s })), gestorScores: scores, paresScores: def.map(s => ({ ...s })), destaques: [], gaps: [], parecer };
      reviews.push(review);
    }
    const avg = (arr) => arr.length ? +(arr.reduce((s, x) => s + x.nota, 0) / arr.length).toFixed(2) : 0;
    review.autoMedia = avg(review.autoScores); review.gestorMedia = avg(review.gestorScores); review.paresMedia = avg(review.paresScores);
    review.mediaGeral = +((review.autoMedia * 0.2 + review.gestorMedia * 0.5 + review.paresMedia * 0.3)).toFixed(2);
    this._setStore('avaliacoes_people', reviews);
    TBO_TOAST.success('Avaliacao submetida!', `${this._getPersonName(targetId)} — ${review.mediaGeral.toFixed(1)}`);
    // Re-renderizar apenas a tab ao inves do modulo inteiro
    const tabContent = document.getElementById('rhTabContent');
    if (tabContent) { tabContent.innerHTML = this._renderActiveTab(); this._initActiveTab(); }
  }
};
