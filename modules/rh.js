// TBO OS — Module: Pessoas (People Management v2.2)
// 5 tabs: Visao Geral, Performance & PDI, Cultura & Reconhecimento, 1:1s & Rituais, Analytics
const TBO_RH = {

  // ── Team Data (real — Estrutura de Cargos TBO, Notion 2026-02) ──
  _team: [
    { id: 'ruy',     nome: 'Ruy Lima',           cargo: 'Diretor Comercial',       area: 'Vendas, Operacao',      bu: 'Vendas',       nivel: 'Senior III', lider: null,    status: 'ativo' },
    { id: 'marco',   nome: 'Marco Andolfato',    cargo: 'Diretor Operacoes',       area: 'Operacao',              bu: '',              nivel: 'Senior III', lider: null,    status: 'ativo' },
    { id: 'carol',   nome: 'Carol',              cargo: 'Coord. Atendimento',      area: 'Pos Vendas, Operacao',  bu: '',              nivel: 'Pleno II',   lider: 'marco', status: 'ativo' },
    { id: 'nelson',  nome: 'Nelson',             cargo: 'PO Branding',             area: 'BU Branding',           bu: 'Branding',      nivel: 'Pleno III',  lider: 'marco', status: 'ativo' },
    { id: 'nath',    nome: 'Nathalia',           cargo: 'PO Digital 3D',           area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Senior I',   lider: 'marco', status: 'ativo' },
    { id: 'rafa',    nome: 'Rafa',               cargo: 'PO Marketing',            area: 'BU Marketing',          bu: 'Marketing',     nivel: 'Pleno II',   lider: 'marco', status: 'ativo' },
    { id: 'gustavo', nome: 'Gustavo',            cargo: 'Comercial',               area: 'Vendas',                bu: 'Vendas',        nivel: 'Pleno I',    lider: 'ruy',   status: 'ativo' },
    { id: 'celso',   nome: 'Celso',              cargo: 'Designer',                area: 'BU Branding',           bu: 'Branding',      nivel: 'Pleno I',    lider: 'nelson', status: 'ativo' },
    { id: 'erick',   nome: 'Erick',              cargo: 'Designer',                area: 'BU Branding',           bu: 'Branding',      nivel: 'Jr. III',    lider: 'nelson', status: 'ativo' },
    { id: 'dann',    nome: 'Danniel',            cargo: 'Lider Tecnico 3D',        area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Senior I',   lider: 'nath',  status: 'ativo' },
    { id: 'duda',    nome: 'Duda',               cargo: 'Artista 3D',              area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Jr. III',    lider: 'dann',  status: 'ativo' },
    { id: 'tiago',   nome: 'Tiago M.',           cargo: 'Artista 3D',              area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Pleno I',    lider: 'dann',  status: 'ativo' },
    { id: 'mari',    nome: 'Mariane',            cargo: 'Artista 3D',              area: 'BU Digital 3D',         bu: 'Digital 3D',    nivel: 'Jr. II',     lider: 'dann',  status: 'ativo' },
    { id: 'lucca',   nome: 'Lucca',              cargo: 'Analista de Marketing',   area: 'BU Marketing',          bu: 'Marketing',     nivel: 'Jr. III',    lider: 'rafa',  status: 'ativo' },
    { id: 'financaazul', nome: 'Financa Azul',   cargo: 'Financeiro (terc.)',      area: 'Financeiro',            bu: '',              nivel: '',           lider: 'ruy',   status: 'ativo', terceirizado: true }
  ],

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
    const u = TBO_AUTH.getCurrentUser();
    return u && (u.role === 'founder' || u.isCoordinator);
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
    this._ensureSeedData();
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
  // TAB 1: VISAO GERAL
  // ══════════════════════════════════════════════════════════════════
  _renderVisaoGeral() {
    const team = this._getInternalTeam();
    const reviews = this._getStore('avaliacoes_people');
    const medias = reviews.map(r => r.mediaGeral).filter(Boolean);
    const mediaGeral = medias.length ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(1) : '—';

    return `
      <div class="grid-4" style="margin-bottom:24px;">
        <div class="kpi-card"><div class="kpi-label">Total Pessoas</div><div class="kpi-value">${team.length}</div><div class="kpi-sub">colaboradores internos</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Ativos</div><div class="kpi-value">${team.filter(t => t.status === 'ativo').length}</div><div class="kpi-sub">em operacao</div></div>
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">BUs</div><div class="kpi-value">${this._getBUs().length}</div><div class="kpi-sub">${this._getBUs().join(', ')}</div></div>
        <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Performance</div><div class="kpi-value">${mediaGeral}</div><div class="kpi-sub">escala 1-5</div></div>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom:16px;padding:12px 16px;">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <span style="font-size:0.78rem;font-weight:600;color:var(--text-muted);">Filtrar:</span>
          <select class="form-input rh-filter-bu" style="width:auto;min-width:140px;padding:6px 10px;font-size:0.78rem;">
            <option value="">Todas BUs</option>
            ${this._getBUs().map(bu => `<option value="${bu}">${bu}</option>`).join('')}
          </select>
          <input type="text" class="form-input rh-filter-search" placeholder="Buscar por nome..." style="width:auto;min-width:200px;padding:6px 10px;font-size:0.78rem;">
        </div>
      </div>

      <!-- Grid de membros -->
      <div class="rh-people-grid" id="rhPeopleGrid">
        ${this._renderPeopleCards(team, reviews)}
      </div>

      <!-- Drawer de detalhe -->
      <div id="rhPersonDrawer" class="rh-drawer" style="display:none;"></div>
    `;
  },

  _renderPeopleCards(team, reviews) {
    return team.map(person => {
      const review = reviews.find(r => r.pessoaId === person.id);
      const score = review ? review.mediaGeral.toFixed(1) : '—';
      const scoreColor = review ? (review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)') : 'var(--text-muted)';
      const initials = person.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
      const buLabel = person.bu || 'Geral';
      const buColors = { 'Branding': '#8b5cf6', 'Digital 3D': '#3a7bd5', 'Marketing': '#f59e0b', 'Vendas': '#2ecc71' };
      const buColor = buColors[person.bu] || 'var(--text-muted)';

      return `
        <div class="rh-person-card" data-person="${person.id}" data-bu="${person.bu || ''}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div class="rh-avatar" style="background:${buColor}20;color:${buColor};">${initials}</div>
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
            <span class="tag" style="font-size:0.62rem;">${this._esc(person.nivel)}</span>
            ${person.lider ? `<span style="font-size:0.62rem;color:var(--text-muted);">lider: ${this._getPersonName(person.lider)}</span>` : '<span class="tag" style="font-size:0.62rem;background:var(--accent-gold)20;color:var(--accent-gold);">Diretor</span>'}
          </div>
        </div>`;
    }).join('');
  },

  _renderPersonDrawer(personId) {
    const person = this._getPerson(personId);
    if (!person) return '';
    const reviews = this._getStore('avaliacoes_people');
    const review = reviews.find(r => r.pessoaId === personId);
    const feedbacks = this._getStore('feedbacks').filter(f => f.para === personId || f.de === personId);
    const elogios = this._getStore('elogios').filter(e => e.para === personId);
    const oneOnOnes = this._getStore('1on1s').filter(o => o.lider === personId || o.colaborador === personId);
    const initials = person.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    return `
      <div class="rh-drawer-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
          <h3 style="margin:0;font-size:1.1rem;">Perfil</h3>
          <button class="btn btn-secondary btn-sm" id="rhCloseDrawer"><i data-lucide="x" style="width:14px;height:14px;"></i></button>
        </div>

        <!-- Header -->
        <div style="text-align:center;margin-bottom:20px;">
          <div class="rh-avatar" style="width:64px;height:64px;font-size:1.4rem;margin:0 auto 10px;background:var(--accent-gold)20;color:var(--accent-gold);">${initials}</div>
          <div style="font-weight:700;font-size:1.1rem;">${this._esc(person.nome)}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);">${this._esc(person.cargo)} \u2022 ${this._esc(person.area)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">${this._esc(person.nivel)}${person.lider ? ' \u2022 Lider: ' + this._getPersonName(person.lider) : ''}</div>
        </div>

        ${review ? `
        <!-- Performance -->
        <div style="background:var(--bg-elevated);border-radius:var(--radius-md, 8px);padding:16px;margin-bottom:16px;">
          <div style="font-weight:600;font-size:0.82rem;margin-bottom:12px;">Performance</div>
          <div style="display:flex;justify-content:center;margin-bottom:12px;">
            <div style="font-size:2.4rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
          </div>
          <div style="display:flex;gap:16px;justify-content:center;font-size:0.72rem;color:var(--text-muted);">
            <span>Auto: ${review.autoMedia.toFixed(1)}</span>
            <span>Gestor: ${review.gestorMedia.toFixed(1)}</span>
            <span>Pares: ${review.paresMedia.toFixed(1)}</span>
          </div>
          ${this._renderMiniRadar(review)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:16px;">
          ${(review.destaques || []).map(d => `<span class="tag" style="font-size:0.65rem;background:var(--color-success-dim);color:var(--color-success);">${d}</span>`).join('')}
          ${(review.gaps || []).map(g => `<span class="tag" style="font-size:0.65rem;background:var(--color-warning-dim);color:var(--color-warning);">${g}</span>`).join('')}
        </div>
        ` : ''}

        <!-- Elogios recebidos -->
        <div style="background:var(--bg-elevated);border-radius:var(--radius-md, 8px);padding:16px;margin-bottom:16px;">
          <div style="font-weight:600;font-size:0.82rem;margin-bottom:8px;">Elogios (${elogios.length})</div>
          ${elogios.slice(0, 3).map(e => {
            const v = this._valores.find(v2 => v2.id === e.valor);
            return `<div style="font-size:0.75rem;padding:6px 0;border-bottom:1px solid var(--border-subtle);">${v ? v.emoji : ''} <strong>${this._getPersonName(e.de)}</strong>: ${this._esc(e.mensagem).slice(0, 60)}...</div>`;
          }).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Nenhum elogio</div>'}
        </div>

        <!-- 1:1s -->
        <div style="background:var(--bg-elevated);border-radius:var(--radius-md, 8px);padding:16px;margin-bottom:16px;">
          <div style="font-weight:600;font-size:0.82rem;margin-bottom:8px;">1:1s (${oneOnOnes.length})</div>
          ${oneOnOnes.slice(0, 3).map(o => `
            <div style="font-size:0.75rem;padding:6px 0;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;">
              <span>${this._getPersonName(o.lider)} \u2194 ${this._getPersonName(o.colaborador)}</span>
              <span class="tag" style="font-size:0.6rem;background:${o.status === 'agendada' ? 'var(--color-info-dim)' : 'var(--color-success-dim)'};color:${o.status === 'agendada' ? 'var(--color-info)' : 'var(--color-success)'};">${o.status}</span>
            </div>
          `).join('') || '<div style="font-size:0.72rem;color:var(--text-muted);">Nenhuma 1:1</div>'}
        </div>

        <!-- Tarefas da Pessoa (Supabase) -->
        <div style="background:var(--bg-elevated);border-radius:var(--radius-md, 8px);padding:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <div style="font-weight:600;font-size:0.82rem;">Tarefas</div>
            <button class="btn btn-primary btn-sm" id="rhNewPersonTask" style="font-size:0.68rem;padding:4px 10px;">+ Nova</button>
          </div>
          <div id="rhPersonTaskForm" style="display:none;margin-bottom:12px;padding:12px;background:var(--bg-primary);border-radius:var(--radius-md, 8px);border:1px solid var(--border-subtle);">
            <input type="text" class="form-input" id="ptTitle" placeholder="Titulo da tarefa..." style="font-size:0.78rem;padding:6px 10px;margin-bottom:8px;">
            <div style="display:flex;gap:8px;margin-bottom:8px;">
              <select class="form-input" id="ptPriority" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="baixa">Baixa</option>
              </select>
              <select class="form-input" id="ptCategory" style="font-size:0.72rem;padding:4px 8px;flex:1;">
                <option value="general">Geral</option>
                <option value="pdi">PDI</option>
                <option value="onboarding">Onboarding</option>
                <option value="1on1_action">Acao 1:1</option>
              </select>
              <input type="date" class="form-input" id="ptDueDate" style="font-size:0.72rem;padding:4px 8px;flex:1;">
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary btn-sm" id="ptSave" style="font-size:0.68rem;padding:4px 12px;">Salvar</button>
              <button class="btn btn-secondary btn-sm" id="ptCancel" style="font-size:0.68rem;padding:4px 12px;">Cancelar</button>
            </div>
          </div>
          <div id="rhPersonTaskList" data-person="${personId}">
            <div style="text-align:center;padding:12px;font-size:0.72rem;color:var(--text-muted);">
              <i data-lucide="loader" style="width:16px;height:16px;animation:spin 1s linear infinite;"></i> Carregando tarefas...
            </div>
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
    const initials = person.nome.split(' ').map(n => n[0]).join('').slice(0, 2);

    return `
      <button class="btn btn-secondary btn-sm" id="rhBackToList" style="margin-bottom:12px;"><i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar</button>
      <div class="grid-3" style="gap:16px;margin-bottom:20px;align-items:start;">
        <div class="card" style="padding:20px;text-align:center;">
          <div class="rh-avatar" style="width:56px;height:56px;font-size:1.2rem;margin:0 auto 12px;background:var(--accent-gold)20;color:var(--accent-gold);">${initials}</div>
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
      .rh-people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
      .rh-person-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 16px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
      .rh-person-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(232,81,2,0.1); }
      .rh-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
      .rh-drawer { position: fixed; top: 0; right: 0; width: 400px; max-width: 90vw; height: 100vh; background: var(--bg-primary); border-left: 1px solid var(--border-subtle); box-shadow: -4px 0 16px rgba(0,0,0,0.15); z-index: 1000; overflow-y: auto; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
      .rh-drawer.rh-drawer-open { transform: translateX(0); }
      .rh-drawer-content { padding: 24px; }
      .subtab-content { display: none; }
      .subtab-content.active { display: block; }
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

    // Visao Geral: people card clicks (open drawer com backdrop)
    document.querySelectorAll('.rh-person-card').forEach(card => {
      card.addEventListener('click', () => {
        this._openPersonDrawer(card.dataset.person);
      });
    });

    // Visao Geral: restaurar filtros preservados e bind events
    const filterBu = document.querySelector('.rh-filter-bu');
    const filterSearch = document.querySelector('.rh-filter-search');
    if (filterBu && this._filterBU) filterBu.value = this._filterBU;
    if (filterSearch && this._filterSearch) filterSearch.value = this._filterSearch;
    const applyFilters = () => {
      const bu = filterBu ? filterBu.value : '';
      const search = filterSearch ? filterSearch.value.toLowerCase() : '';
      this._filterBU = bu;
      this._filterSearch = search;
      document.querySelectorAll('.rh-person-card').forEach(card => {
        const matchBu = !bu || card.dataset.bu === bu;
        const matchSearch = !search || card.textContent.toLowerCase().includes(search);
        card.style.display = (matchBu && matchSearch) ? '' : 'none';
      });
    };
    if (filterBu) filterBu.addEventListener('change', applyFilters);
    if (filterSearch) filterSearch.addEventListener('input', applyFilters);
    // Aplicar filtros restaurados
    if (this._filterBU || this._filterSearch) applyFilters();

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

    // Carregar tarefas da pessoa (async — Supabase ou localStorage)
    this._loadPersonTasks(personId);

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
