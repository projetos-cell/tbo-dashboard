// TBO OS — Module: Recursos Humanos (People Module)
// Complete people management: Avaliacao, Feedbacks, Elogios, 1:1s
const TBO_RH = {

  // ── Team Data (real — Estrutura de Cargos TBO, Notion 2026-02) ──
  _team: [
    // Diretoria
    { id: 'ruy',     nome: 'Ruy Lima',           cargo: 'Diretor Comercial',       area: 'Vendas, Operacao',      nivel: 'Senior III', lider: null },
    { id: 'marco',   nome: 'Marco Andolfato',    cargo: 'Diretor Operacoes',       area: 'Operacao',              nivel: 'Senior III', lider: null },
    // Coordenacao / POs — report Marco
    { id: 'carol',   nome: 'Carol',              cargo: 'Coord. Atendimento',      area: 'Pos Vendas, Operacao',  nivel: 'Pleno II',   lider: 'marco' },
    { id: 'nelson',  nome: 'Nelson',             cargo: 'PO Branding',             area: 'BU Branding',           nivel: 'Pleno III',  lider: 'marco' },
    { id: 'nath',    nome: 'Nathalia',           cargo: 'PO Digital 3D',           area: 'BU Digital 3D',         nivel: 'Senior I',   lider: 'marco' },
    { id: 'rafa',    nome: 'Rafa',               cargo: 'PO Marketing',            area: 'BU Marketing',          nivel: 'Pleno II',   lider: 'marco' },
    // Report Ruy
    { id: 'gustavo', nome: 'Gustavo',            cargo: 'Comercial',               area: 'Vendas',                nivel: 'Pleno I',    lider: 'ruy' },
    // Time Branding — report Nelson
    { id: 'celso',   nome: 'Celso',              cargo: 'Designer',                area: 'BU Branding',           nivel: 'Pleno I',    lider: 'nelson' },
    { id: 'erick',   nome: 'Erick',              cargo: 'Designer',                area: 'BU Branding',           nivel: 'Jr. III',    lider: 'nelson' },
    // Time Digital 3D — report Nath
    { id: 'dann',    nome: 'Danniel',            cargo: 'Lider Tecnico 3D',        area: 'BU Digital 3D',         nivel: 'Senior I',   lider: 'nath' },
    { id: 'duda',    nome: 'Duda',               cargo: 'Artista 3D',              area: 'BU Digital 3D',         nivel: 'Jr. III',    lider: 'dann' },
    { id: 'tiago',   nome: 'Tiago M.',           cargo: 'Artista 3D',              area: 'BU Digital 3D',         nivel: 'Pleno I',    lider: 'dann' },
    { id: 'mari',    nome: 'Mariane',            cargo: 'Artista 3D',              area: 'BU Digital 3D',         nivel: 'Jr. II',     lider: 'dann' },
    // Time Marketing — report Rafa
    { id: 'lucca',   nome: 'Lucca',              cargo: 'Analista de Marketing',   area: 'BU Marketing',          nivel: 'Jr. III',    lider: 'rafa' },
    // Terceirizados (nao participam de avaliacao)
    { id: 'financaazul', nome: 'Financa Azul',   cargo: 'Financeiro (terc.)',      area: 'Financeiro',            nivel: '',           lider: 'ruy', terceirizado: true }
  ],

  // 6 habilidades reais TBO para radar (selecionadas das 10 do PDI: H2,H4,H5,H6,H7,H8)
  _competenciasRadar: [
    { id: 'tecnica',       nome: 'Hab. Tecnica' },      // H2
    { id: 'comunicacao',   nome: 'Comunicacao' },        // H4
    { id: 'criatividade',  nome: 'Criatividade' },       // H5
    { id: 'qualidade',     nome: 'Qualid. Entrega' },    // H6
    { id: 'produtividade', nome: 'Produtividade' },      // H7
    { id: 'aprendizado',   nome: 'Aprendizado' }         // H8
  ],

  // Todas as 10 habilidades do PDI TBO (para exibicao detalhada)
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
    { id: 'excelencia', nome: 'Excelencia Tecnica', emoji: '\u{1F48E}' },
    { id: 'cliente', nome: 'Cliente Primeiro', emoji: '\u{1F91D}' },
    { id: 'colaboracao', nome: 'Colaboracao', emoji: '\u{1F3C6}' },
    { id: 'inovacao', nome: 'Inovacao', emoji: '\u{1F680}' },
    { id: 'ownership', nome: 'Ownership', emoji: '\u{1F525}' },
    { id: 'superacao', nome: 'Superacao', emoji: '\u2B50' }
  ],

  _currentView: 'main', // 'main' | 'individual-detail'
  _selectedPerson: null,

  _genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); },
  _getStore(key) { try { return JSON.parse(localStorage.getItem('tbo_rh_' + key) || '[]'); } catch { return []; } },
  _setStore(key, data) { localStorage.setItem('tbo_rh_' + key, JSON.stringify(data)); },
  _getPersonName(id) { const p = this._team.find(t => t.id === id); return p ? p.nome : id || '\u2014'; },
  _getPerson(id) { return this._team.find(t => t.id === id); },

  // ── Permission helpers ────────────────────────────────────────────
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

  // ── Seed Data (baseado em dados reais do Notion — Fev 2026) ──────
  _ensureSeedData() {
    if (this._getStore('people_seeded_v2').length) return;
    // Clear old seed if exists
    ['ciclos','avaliacoes_people','feedbacks','elogios','1on1s','people_seeded'].forEach(k => localStorage.removeItem('tbo_rh_' + k));

    // ── Ciclo de Avaliacao Semestral (formato real TBO: PDI semestral) ──
    const cycleId = 'ciclo_2025s2';
    const cycle = {
      id: cycleId, nome: 'Avaliacao Semestral 2025.2', tipo: 'PDI 360',
      inicio: '2025-07-01', fim: '2025-12-31', status: 'finalizado',
      fases: [
        { id: 'auto', nome: 'Autoavaliacao (10 Habilidades)', inicio: '2025-07-01', fim: '2025-07-15', progresso: 100 },
        { id: 'gestor', nome: 'Avaliacao do Gestor', inicio: '2025-07-15', fim: '2025-07-31', progresso: 100 },
        { id: 'pares', nome: 'Avaliacao de Pares', inicio: '2025-08-01', fim: '2025-08-15', progresso: 100 },
        { id: 'calibracao', nome: 'Calibracao & Devolutiva', inicio: '2025-08-15', fim: '2025-08-31', progresso: 100 }
      ]
    };
    const cycle2Id = 'ciclo_2026s1';
    const cycle2 = {
      id: cycle2Id, nome: 'Avaliacao Semestral 2026.1', tipo: 'PDI 360',
      inicio: '2026-01-15', fim: '2026-06-30', status: 'em_andamento',
      fases: [
        { id: 'auto', nome: 'Autoavaliacao (10 Habilidades)', inicio: '2026-01-15', fim: '2026-02-07', progresso: 100 },
        { id: 'gestor', nome: 'Avaliacao do Gestor', inicio: '2026-02-08', fim: '2026-02-28', progresso: 60 },
        { id: 'pares', nome: 'Avaliacao de Pares', inicio: '2026-02-15', fim: '2026-03-15', progresso: 30 },
        { id: 'calibracao', nome: 'Calibracao & Devolutiva', inicio: '2026-03-15', fim: '2026-03-31', progresso: 0 }
      ]
    };
    this._setStore('ciclos', [cycle2, cycle]);

    // ── Avaliacoes individuais (dados realistas baseados no PDI do Notion) ──
    // Nota: escala TBO no PDI e 10-100% em incrementos. Aqui convertemos para 1-5.
    // Ex: 60% = 3.0, 80% = 4.0, 50% = 2.5, 40% = 2.0, 100% = 5.0
    // Apenas colaboradores internos (sem terceirizados, sem diretores)
    const reviewable = this._team.filter(t => t.lider && !t.terceirizado);

    // Perfis de score realistas por pessoa (baseado em observacoes do Notion)
    const profiles = {
      // POs e Coord — mais experientes
      carol:   { auto: [3.5,4.0,3.5,3.0,2.5,3.0], gest: [3.0,3.5,3.5,3.0,2.5,3.0], par: [3.5,3.5,3.0,3.0,3.0,3.0], dest: ['Organizacao','Atendimento'], gaps: ['Proatividade','Ferramentas IA'], parecer: 'Carol tem sido pilar na coordenacao de atendimento. Precisa explorar mais ferramentas de IA para otimizar processos e ganhar autonomia.' },
      nelson:  { auto: [4.0,3.5,4.5,4.0,3.5,3.0], gest: [4.0,3.0,4.5,4.0,3.0,3.0], par: [3.5,3.5,4.0,3.5,3.0,3.5], dest: ['Criatividade','Branding'], gaps: ['Mercado Imobiliario','Revisoes Internas','Feedbacks'], parecer: 'Nelson tem entregado identidades de marca com qualidade. Precisa ser mais permeavel aos feedbacks em reuniao interna e aprender mais sobre mercado imobiliario.' },
      nath:    { auto: [4.5,4.0,4.0,4.0,4.5,4.0], gest: [4.5,4.0,4.0,4.5,4.0,4.0], par: [4.0,3.5,3.5,4.0,4.0,4.0], dest: ['Lideranca','Gestao Projetos'], gaps: ['Delegacao'], parecer: 'Nathalia e referencia na gestao da BU Digital 3D. Equipe tem crescido sob sua lideranca. Ponto de atencao: delegar mais e evitar centralizar demais.' },
      rafa:    { auto: [3.5,3.5,3.5,3.0,3.0,3.5], gest: [3.5,3.0,3.5,3.0,3.0,3.0], par: [3.0,3.0,3.0,3.0,3.0,3.0], dest: ['Estrategia','Performance'], gaps: ['Planejamento','Documentacao'], parecer: 'Rafa tem mostrado evolucao na gestao de campanhas. Precisa melhorar planejamento antecipado e documentacao de processos do marketing.' },
      gustavo: { auto: [3.0,4.0,3.0,3.0,2.5,3.0], gest: [3.0,3.5,2.5,3.0,2.5,3.0], par: [3.0,3.5,2.5,3.0,2.5,2.5], dest: ['Comunicacao','Relacionamento'], gaps: ['Gestao de Tempo','Prospecção'], parecer: 'Gustavo tem bom relacionamento com clientes. Precisa estruturar melhor a prospecção ativa e gestao de tempo nas atividades comerciais.' },
      // Time Branding
      celso:   { auto: [4.0,3.0,4.0,3.5,3.5,3.0], gest: [3.5,3.0,3.5,3.5,3.0,3.0], par: [3.5,3.0,3.5,3.0,3.0,3.0], dest: ['Habilidade Tecnica','Design'], gaps: ['Comunicacao com Cliente','Prazos'], parecer: 'Celso tem dominio solido de ferramentas de design. Precisa melhorar comunicacao direta com clientes e consistencia nos prazos.' },
      erick:   { auto: [3.5,3.0,3.5,3.0,2.5,3.5], gest: [3.0,2.5,3.5,3.0,2.5,3.0], par: [3.0,2.5,3.0,2.5,2.5,3.0], dest: ['Criatividade','Aprendizado'], gaps: ['Habilidade Tecnica','Autonomia'], parecer: 'Erick tem potencial criativo. Precisa extrapolar ferramentas ordinarias e desenvolver autonomia. Foco no proximo semestre: ampliar repertorio tecnico.' },
      // Time 3D
      dann:    { auto: [4.5,3.5,4.0,4.5,4.5,4.0], gest: [4.5,3.5,4.0,4.5,4.0,3.5], par: [4.0,3.5,3.5,4.0,4.0,4.0], dest: ['Tecnica 3D','Lideranca Tecnica'], gaps: ['Mentoria Equipe','Documentacao'], parecer: 'Danniel e a referencia tecnica da BU Digital 3D. O que separa ele do nivel maximo e passar os conhecimentos da mentoria para a equipe com impacto significativo nos resultados.' },
      duda:    { auto: [3.0,2.5,3.0,2.5,2.5,3.5], gest: [2.5,2.5,2.5,2.5,2.5,3.0], par: [3.0,2.5,2.5,2.5,2.5,3.0], dest: ['Aprendizado','Dedicacao'], gaps: ['Qualidade de Entrega','Autonomia','Prazos'], parecer: 'Duda esta em evolucao. Demonstra dedicacao e vontade de aprender. Foco: melhorar qualidade de entrega e reduzir necessidade de supervisao.' },
      tiago:   { auto: [3.5,3.0,3.0,3.5,3.0,3.0], gest: [3.5,3.0,3.0,3.5,3.0,3.0], par: [3.0,3.0,3.0,3.0,3.0,3.0], dest: ['Render Tecnico','Consistencia'], gaps: ['Criatividade','Proatividade'], parecer: 'Tiago entrega com consistencia e bom nivel tecnico. Precisa desenvolver mais criatividade e proatividade para resolver problemas antes de escalar.' },
      mari:    { auto: [2.5,2.5,2.5,2.0,2.0,3.0], gest: [2.5,2.0,2.5,2.0,2.0,3.0], par: [2.5,2.5,2.0,2.0,2.0,2.5], dest: ['Cultura','Vontade de Crescer'], gaps: ['Habilidade Tecnica','Qualidade','Prazo'], parecer: 'Mariane esta no inicio da jornada. Tem otimo alinhamento cultural. Precisa investir forte em habilidades tecnicas e acompanhamento proximo do lider tecnico.' },
      // Time Marketing
      lucca:   { auto: [3.0,3.5,3.0,3.0,3.0,3.5], gest: [2.5,3.0,2.5,2.5,2.5,3.0], par: [3.0,3.0,2.5,2.5,2.5,3.0], dest: ['Aprendizado','Marketing Digital'], gaps: ['Planejamento','Autonomia'], parecer: 'Lucca tem buscado aprendizado ativo em marketing digital. Precisa desenvolver mais planejamento e independencia na execucao de campanhas.' }
    };

    const reviews = reviewable.map(t => {
      const p = profiles[t.id];
      if (!p) return null;
      const comps = this._competenciasRadar;
      const autoScores = comps.map((c, i) => ({ comp: c.id, nota: p.auto[i] }));
      const gestorScores = comps.map((c, i) => ({ comp: c.id, nota: p.gest[i] }));
      const paresScores = comps.map((c, i) => ({ comp: c.id, nota: p.par[i] }));
      const autoMedia = +(autoScores.reduce((s, x) => s + x.nota, 0) / autoScores.length).toFixed(2);
      const gestorMedia = +(gestorScores.reduce((s, x) => s + x.nota, 0) / gestorScores.length).toFixed(2);
      const paresMedia = +(paresScores.reduce((s, x) => s + x.nota, 0) / paresScores.length).toFixed(2);
      const mediaGeral = +((autoMedia * 0.2 + gestorMedia * 0.5 + paresMedia * 0.3)).toFixed(2);
      return {
        id: this._genId(), cicloId: cycle2Id, pessoaId: t.id,
        autoScores, gestorScores, paresScores,
        autoMedia, gestorMedia, paresMedia, mediaGeral,
        destaques: p.dest, gaps: p.gaps, parecer: p.parecer
      };
    }).filter(Boolean);
    this._setStore('avaliacoes_people', reviews);

    // ── Feedbacks (baseados em contexto real — projetos TBO, feedbacks Notion 1:1 Out/2025)
    const fbSeed = [
      { id: this._genId(), de: 'marco', para: 'nath', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Excelente gestao da BU Digital 3D. Time esta entregando com qualidade e dentro do prazo nos ultimos 3 projetos.', data: '2026-02-10T10:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'nelson', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa ser mais permeavel aos feedbacks em reuniao interna. Tambem aprender mais sobre o mercado imobiliario para criar brandings mais assertivos.', data: '2026-02-08T14:00:00Z' },
      { id: this._genId(), de: 'nath', para: 'dann', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Renders do projeto ficaram incriveis. Qualidade tecnica de referencia. Proximo passo: passar esses conhecimentos para Duda, Tiago e Mari.', data: '2026-02-05T09:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'rafa', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Campanha de ativacao com ROAS excelente. Parabens pelo resultado!', data: '2026-02-01T11:00:00Z' },
      { id: this._genId(), de: 'nelson', para: 'celso', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Identidade visual do projeto ficou elegante. Bom dominio das ferramentas.', data: '2026-01-28T16:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'carol', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa melhorar organizacao de pastas no Drive e garantir atualizacao dos arquivos. Vamos alinhar processo.', data: '2026-01-25T13:00:00Z' },
      { id: this._genId(), de: 'dann', para: 'tiago', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Boa consistencia nas entregas. Renders tecnicos com nivel crescente de qualidade.', data: '2026-01-20T10:00:00Z' },
      { id: this._genId(), de: 'ruy', para: 'gustavo', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa estruturar melhor a prospeccao ativa. Usar o Sexy Canvas que definimos como ferramenta padrao.', data: '2026-01-18T09:00:00Z' },
      { id: this._genId(), de: 'nath', para: 'duda', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Evolucao visivel nas ultimas entregas. Continue investindo nos estudos tecnicos!', data: '2026-01-15T11:00:00Z' },
      { id: this._genId(), de: 'rafa', para: 'lucca', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa planejar melhor as campanhas com antecedencia. Agendar conteudos com pelo menos 1 semana de antecedencia.', data: '2026-01-12T10:00:00Z' },
      { id: this._genId(), de: 'nelson', para: 'erick', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Conceito criativo surpreendeu. Tem potencial! Foco agora em ampliar repertorio tecnico de ferramentas.', data: '2026-01-10T14:00:00Z' },
      { id: this._genId(), de: 'dann', para: 'mari', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Mariane, foco em dominar as ferramentas basicas do 3ds Max. Vou montar um plano de estudos pra proximas semanas.', data: '2026-01-08T10:00:00Z' }
    ];
    this._setStore('feedbacks', fbSeed);

    // ── Elogios (baseados em valores TBO reais)
    const elSeed = [
      { id: this._genId(), de: 'marco', para: 'dann',   valor: 'excelencia',  mensagem: 'Qualidade dos renders e referencia para o mercado de visualizacao arquitetonica. Parabens pelo nivel tecnico!', curtidas: 7, data: '2026-02-12T10:00:00Z' },
      { id: this._genId(), de: 'ruy',   para: 'nath',   valor: 'ownership',   mensagem: 'Assumiu a coordenacao de toda a BU Digital 3D com maestria. Time organizado e entregando resultados.', curtidas: 8, data: '2026-02-09T14:00:00Z' },
      { id: this._genId(), de: 'nath',  para: 'carol',  valor: 'colaboracao', mensagem: 'Sempre disponivel para ajudar qualquer pessoa do time. Ponte fundamental entre atendimento e producao.', curtidas: 5, data: '2026-02-05T11:00:00Z' },
      { id: this._genId(), de: 'rafa',  para: 'nelson', valor: 'inovacao',    mensagem: 'Conceito de branding surpreendeu o cliente na primeira apresentacao. Identidade forte e conceitual.', curtidas: 4, data: '2026-01-30T09:00:00Z' },
      { id: this._genId(), de: 'marco', para: 'rafa',   valor: 'superacao',   mensagem: 'ROAS de campanha acima da media do mercado. Resultado historico para a BU Marketing!', curtidas: 6, data: '2026-01-22T15:00:00Z' },
      { id: this._genId(), de: 'dann',  para: 'tiago',  valor: 'excelencia',  mensagem: 'Evolucao tecnica impressionante no ultimo trimestre. Entregando com consistencia e qualidade.', curtidas: 3, data: '2026-01-18T10:00:00Z' },
      { id: this._genId(), de: 'nelson', para: 'erick', valor: 'inovacao',    mensagem: 'Proposta criativa pro novo cliente surpreendeu. Pensamento fora da caixa que agrega muito.', curtidas: 3, data: '2026-01-15T14:00:00Z' },
      { id: this._genId(), de: 'nath',  para: 'duda',   valor: 'superacao',   mensagem: 'Do zero ao render em 3 meses. Dedicacao e vontade de aprender sao exemplares!', curtidas: 5, data: '2026-01-10T11:00:00Z' }
    ];
    this._setStore('elogios', elSeed);

    // ── 1:1s (baseado no formato real TBO: mensal + formato PDI Notion)
    // Formato TBO: 4 quadrantes — auto-feedback, feedback p/ lider, lider p/ colab, feedback p/ empresa
    const ooSeed = [
      // 1:1s concluidas (Marco como lider dos POs)
      { id: this._genId(), lider: 'marco', colaborador: 'nath', data: '2026-02-14T10:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Definir processo de QA para entregas 3D antes de envio ao cliente', responsavel: 'nath', prazo: '2026-02-28', concluido: false },
          { id: this._genId(), texto: 'Preparar PDI atualizado de Duda e Mariane para proximo trimestre', responsavel: 'nath', prazo: '2026-03-01', concluido: false },
          { id: this._genId(), texto: 'Revisar pipeline de projetos Q2 com Carol', responsavel: 'marco', prazo: '2026-03-01', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'nelson', data: '2026-02-07T14:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Garantir atualizacao dos arquivos dentro do Drive', responsavel: 'nelson', prazo: '2026-02-15', concluido: true },
          { id: this._genId(), texto: 'Reduzir quantidade de revisoes com checklist interno', responsavel: 'nelson', prazo: '2026-02-28', concluido: false },
          { id: this._genId(), texto: 'Explorar mais ferramentas de IA para design', responsavel: 'nelson', prazo: '2026-03-15', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'rafa', data: '2026-02-06T10:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Preparar relatorio de performance das campanhas Q1', responsavel: 'rafa', prazo: '2026-02-20', concluido: false },
          { id: this._genId(), texto: 'Documentar processo padrao de lancamento de campanha', responsavel: 'rafa', prazo: '2026-03-01', concluido: false }
        ]},
      { id: this._genId(), lider: 'marco', colaborador: 'carol', data: '2026-02-05T11:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Reorganizar pastas do Drive com novo padrao de nomenclatura', responsavel: 'carol', prazo: '2026-02-20', concluido: true },
          { id: this._genId(), texto: 'Criar template padrao de briefing para novos projetos', responsavel: 'carol', prazo: '2026-02-28', concluido: false }
        ]},
      // 1:1s do Dann com time 3D
      { id: this._genId(), lider: 'dann', colaborador: 'tiago', data: '2026-02-10T14:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Estudar tutoriais de iluminacao avancada no V-Ray', responsavel: 'tiago', prazo: '2026-02-25', concluido: false },
          { id: this._genId(), texto: 'Propor 1 solucao criativa no proximo projeto sem pedir ajuda', responsavel: 'tiago', prazo: '2026-03-01', concluido: false }
        ]},
      { id: this._genId(), lider: 'dann', colaborador: 'duda', data: '2026-02-10T16:00:00Z', status: 'concluida',
        items: [
          { id: this._genId(), texto: 'Completar modulo basico de modelagem 3ds Max', responsavel: 'duda', prazo: '2026-02-28', concluido: false },
          { id: this._genId(), texto: 'Entregar proximo render com menos de 2 revisoes', responsavel: 'duda', prazo: '2026-03-15', concluido: false }
        ]},
      // Proximas agendadas
      { id: this._genId(), lider: 'marco', colaborador: 'nath', data: '2026-02-28T10:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'marco', colaborador: 'nelson', data: '2026-02-27T14:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'ruy', colaborador: 'gustavo', data: '2026-02-25T09:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'dann', colaborador: 'mari', data: '2026-02-24T14:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'rafa', colaborador: 'lucca', data: '2026-02-26T11:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'nelson', colaborador: 'celso', data: '2026-02-26T14:00:00Z', status: 'agendada', items: [] },
      { id: this._genId(), lider: 'nelson', colaborador: 'erick', data: '2026-02-26T16:00:00Z', status: 'agendada', items: [] }
    ];
    this._setStore('1on1s', ooSeed);

    this._setStore('people_seeded_v2', [true]);
  },

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  render() {
    this._ensureSeedData();
    this._currentView = 'main';
    this._selectedPerson = null;

    const feedbacks = this._getStore('feedbacks');
    const elogios = this._getStore('elogios');
    const oneOnOnes = this._getStore('1on1s');
    const reviews = this._getStore('avaliacoes_people');
    const ciclos = this._getStore('ciclos');
    const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];

    const totalActions = oneOnOnes.reduce((s, o) => s + (o.items || []).filter(i => !i.concluido).length, 0);

    return `
      <div class="rh-module">
        <div class="grid-4" style="margin-bottom:24px;">
          <div class="kpi-card"><div class="kpi-label">Equipe</div><div class="kpi-value">${this._team.filter(t => !t.terceirizado).length}</div><div class="kpi-sub">colaboradores internos</div></div>
          <div class="kpi-card"><div class="kpi-label">Feedbacks</div><div class="kpi-value">${feedbacks.length}</div><div class="kpi-sub">registrados</div></div>
          <div class="kpi-card"><div class="kpi-label">Elogios</div><div class="kpi-value">${elogios.length}</div><div class="kpi-sub">no mural</div></div>
          <div class="kpi-card"><div class="kpi-label">1:1s</div><div class="kpi-value">${oneOnOnes.length}</div><div class="kpi-sub">${totalActions} acoes pendentes</div></div>
        </div>

        <!-- Main Tabs -->
        <div class="tab-bar" id="rhMainTabs" style="margin-bottom:20px;">
          <button class="tab active" data-tab="rh-avaliacao">Avaliacao</button>
          <button class="tab" data-tab="rh-feedbacks">Feedbacks</button>
          <button class="tab" data-tab="rh-elogios">Elogios</button>
          <button class="tab" data-tab="rh-1on1">1:1s</button>
        </div>

        <!-- ═══ Tab: Avaliacao ═══ -->
        <div class="tab-content active" id="tab-rh-avaliacao">
          <!-- Subtabs -->
          <div class="tab-bar tab-bar--sub" id="rhAvalSubtabs" style="margin-bottom:16px;">
            <button class="tab tab--sub active" data-subtab="aval-ciclo">Ciclo</button>
            <button class="tab tab--sub" data-subtab="aval-individual">Individual</button>
            <button class="tab tab--sub" data-subtab="aval-9box">9-Box</button>
          </div>

          <!-- Subtab: Ciclo -->
          <div class="subtab-content active" id="subtab-aval-ciclo">
            ${this._renderCiclo(activeCycle, reviews)}
          </div>

          <!-- Subtab: Individual -->
          <div class="subtab-content" id="subtab-aval-individual">
            ${this._renderIndividualList(activeCycle, reviews)}
          </div>

          <!-- Subtab: 9-Box -->
          <div class="subtab-content" id="subtab-aval-9box">
            ${this._renderNineBox(reviews)}
          </div>
        </div>

        <!-- ═══ Tab: Feedbacks ═══ -->
        <div class="tab-content" id="tab-rh-feedbacks">
          ${this._renderFeedbacks(feedbacks)}
        </div>

        <!-- ═══ Tab: Elogios ═══ -->
        <div class="tab-content" id="tab-rh-elogios">
          ${this._renderElogios(elogios)}
        </div>

        <!-- ═══ Tab: 1:1s ═══ -->
        <div class="tab-content" id="tab-rh-1on1">
          ${this._render1on1s(oneOnOnes)}
        </div>

        <!-- Detail overlay (hidden by default) -->
        <div id="rhDetailOverlay" style="display:none;"></div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // AVALIACAO > CICLO
  // ══════════════════════════════════════════════════════════════════
  _renderCiclo(cycle, reviews) {
    if (!cycle) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Nenhum ciclo de avaliacao</div></div>';
    const respondidos = reviews.filter(r => r.cicloId === cycle.id).length;
    const participantes = this._team.filter(t => t.lider && !t.terceirizado).length;
    const medias = reviews.filter(r => r.cicloId === cycle.id).map(r => r.mediaGeral);
    const mediaGeral = medias.length ? (medias.reduce((a, b) => a + b, 0) / medias.length).toFixed(2) : '0';
    const progresso = cycle.fases ? Math.round(cycle.fases.reduce((s, f) => s + f.progresso, 0) / cycle.fases.length) : 0;

    const statusColor = cycle.status === 'em_andamento' ? 'var(--color-info)' : 'var(--color-success)';
    const statusLabel = cycle.status === 'em_andamento' ? 'Em andamento' : 'Finalizado';

    return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div>
            <h3 class="card-title" style="margin-bottom:4px;">${cycle.nome}</h3>
            <div style="display:flex;gap:8px;align-items:center;">
              <span class="tag" style="font-size:0.68rem;background:var(--color-info-dim);color:var(--color-info);">${cycle.tipo}</span>
              <span style="font-size:0.72rem;color:var(--text-muted);">${new Date(cycle.inicio).toLocaleDateString('pt-BR')} \u2014 ${new Date(cycle.fim).toLocaleDateString('pt-BR')}</span>
              <span class="tag" style="font-size:0.68rem;background:${statusColor}20;color:${statusColor};">${statusLabel}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-4" style="margin-bottom:20px;">
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">Participantes</div><div class="kpi-value">${participantes}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Respondidos</div><div class="kpi-value">${respondidos}</div></div>
        <div class="kpi-card kpi-card--gold"><div class="kpi-label">Media Geral</div><div class="kpi-value">${mediaGeral}</div></div>
        <div class="kpi-card"><div class="kpi-label">Progresso</div><div class="kpi-value">${progresso}%</div></div>
      </div>

      <div class="card">
        <div class="card-header"><h3 class="card-title">Fases do Ciclo</h3></div>
        <div style="padding:16px;">
          ${(cycle.fases || []).map(f => {
            const pColor = f.progresso >= 100 ? 'var(--color-success)' : f.progresso > 0 ? 'var(--color-info)' : 'var(--text-muted)';
            return `
              <div style="display:flex;align-items:center;gap:16px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
                <div style="width:200px;font-weight:600;font-size:0.85rem;">${f.nome}</div>
                <div style="flex:1;">
                  <div style="height:8px;background:var(--bg-tertiary);border-radius:4px;overflow:hidden;">
                    <div style="height:100%;width:${f.progresso}%;background:${pColor};border-radius:4px;transition:width 0.3s;"></div>
                  </div>
                </div>
                <div style="width:50px;text-align:right;font-size:0.82rem;font-weight:600;color:${pColor};">${f.progresso}%</div>
                <div style="width:180px;font-size:0.72rem;color:var(--text-muted);text-align:right;">${new Date(f.inicio).toLocaleDateString('pt-BR')} \u2014 ${new Date(f.fim).toLocaleDateString('pt-BR')}</div>
              </div>`;
          }).join('')}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // AVALIACAO > INDIVIDUAL (Lista/Ranking)
  // ══════════════════════════════════════════════════════════════════
  _renderIndividualList(cycle, reviews) {
    if (!cycle) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Nenhum ciclo ativo</div></div>';
    const isAdmin = this._isAdmin();
    const userId = this._currentUserId();

    let cycleReviews = reviews.filter(r => r.cicloId === cycle.id);
    // RBAC: non-admin only sees own
    if (!isAdmin) {
      cycleReviews = cycleReviews.filter(r => r.pessoaId === userId);
    }
    cycleReviews.sort((a, b) => b.mediaGeral - a.mediaGeral);

    if (!cycleReviews.length) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Sem avaliacoes disponiveis</div></div>';

    return `
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Ranking de Desempenho \u2014 ${cycle.nome}</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>#</th><th>Colaborador(a)</th><th>Destaques</th><th style="text-align:center;">Nota Geral</th><th></th></tr></thead>
          <tbody>
            ${cycleReviews.map((r, i) => {
              const p = this._getPerson(r.pessoaId);
              if (!p) return '';
              const medalColors = ['var(--accent-gold)', 'var(--text-secondary)', '#cd7f32'];
              const medalColor = i < 3 ? medalColors[i] : 'var(--text-muted)';
              return `
                <tr>
                  <td style="font-weight:700;color:${medalColor};font-size:0.9rem;">${i + 1}</td>
                  <td>
                    <div style="font-weight:600;font-size:0.85rem;">${p.nome}</div>
                    <div style="font-size:0.72rem;color:var(--text-muted);">${p.cargo}</div>
                  </td>
                  <td>${(r.destaques || []).map(d => `<span class="tag" style="font-size:0.65rem;margin-right:4px;">${d}</span>`).join('')}</td>
                  <td style="text-align:center;">
                    <span style="font-size:1.1rem;font-weight:700;color:${r.mediaGeral >= 4 ? 'var(--color-success)' : r.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${r.mediaGeral.toFixed(1)}</span>
                  </td>
                  <td><button class="btn btn-sm btn-secondary rh-view-person" data-person="${r.pessoaId}" data-cycle="${cycle.id}">Ver detalhe</button></td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // AVALIACAO > INDIVIDUAL DETALHE
  // ══════════════════════════════════════════════════════════════════
  _renderPersonDetail(personId, cycleId) {
    const reviews = this._getStore('avaliacoes_people');
    const review = reviews.find(r => r.pessoaId === personId && r.cicloId === cycleId);
    const person = this._getPerson(personId);
    if (!review || !person) return '<div class="empty-state"><div class="empty-state-text">Avaliacao nao encontrada</div></div>';

    // Radar SVG
    const radarSvg = this._renderRadarSVG(review);

    return `
      <div style="margin-bottom:16px;">
        <button class="btn btn-secondary btn-sm" id="rhBackToList" style="margin-bottom:12px;">
          <i data-lucide="arrow-left" style="width:14px;height:14px;"></i> Voltar ao ranking
        </button>
      </div>

      <div class="grid-3" style="gap:16px;margin-bottom:20px;align-items:start;">
        <!-- Person Card -->
        <div class="card" style="padding:20px;text-align:center;">
          <div style="width:56px;height:56px;border-radius:50%;background:var(--accent-gold);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:700;margin:0 auto 12px;">
            ${person.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div style="font-weight:700;font-size:1rem;">${person.nome}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-bottom:12px;">${person.cargo} \u2022 ${person.area}</div>
          <div style="font-size:2rem;font-weight:800;color:${review.mediaGeral >= 4 ? 'var(--color-success)' : review.mediaGeral >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${review.mediaGeral.toFixed(1)}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">Nota Geral</div>
        </div>

        <!-- Scores Breakdown -->
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:16px;">Notas por Fonte</h4>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;"><span>Autoavaliacao</span><strong>${review.autoMedia.toFixed(1)}</strong></div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(review.autoMedia / 5) * 100}%;background:var(--color-info);border-radius:3px;"></div></div>
          </div>
          <div style="margin-bottom:12px;">
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;"><span>Gestor</span><strong>${review.gestorMedia.toFixed(1)}</strong></div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(review.gestorMedia / 5) * 100}%;background:var(--accent-gold);border-radius:3px;"></div></div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:4px;"><span>Pares</span><strong>${review.paresMedia.toFixed(1)}</strong></div>
            <div style="height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;"><div style="height:100%;width:${(review.paresMedia / 5) * 100}%;background:var(--color-purple);border-radius:3px;"></div></div>
          </div>
        </div>

        <!-- Radar Chart -->
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:12px;">Radar de Competencias</h4>
          ${radarSvg}
        </div>
      </div>

      <!-- Competencias detalhadas -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header"><h3 class="card-title">Competencias Detalhadas</h3></div>
        <div style="padding:16px;">
          ${this._competenciasRadar.map(c => {
            const auto = review.autoScores.find(s => s.comp === c.id)?.nota || 0;
            const gestor = review.gestorScores.find(s => s.comp === c.id)?.nota || 0;
            const pares = review.paresScores.find(s => s.comp === c.id)?.nota || 0;
            const media = +((auto * 0.2 + gestor * 0.5 + pares * 0.3)).toFixed(1);
            return `
              <div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border-subtle);">
                <div style="width:120px;font-weight:600;font-size:0.82rem;">${c.nome}</div>
                <div style="flex:1;display:flex;gap:16px;font-size:0.75rem;color:var(--text-muted);">
                  <span>Auto: ${auto.toFixed(1)}</span>
                  <span>Gestor: ${gestor.toFixed(1)}</span>
                  <span>Pares: ${pares.toFixed(1)}</span>
                </div>
                <div style="font-size:0.9rem;font-weight:700;color:${media >= 4 ? 'var(--color-success)' : media >= 3 ? 'var(--accent-gold)' : 'var(--color-danger)'};">${media}</div>
              </div>`;
          }).join('')}
        </div>
      </div>

      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <!-- Destaques -->
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;color:var(--color-success);">Destaques</h4>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${(review.destaques || []).map(d => `<span class="tag" style="background:var(--color-success-dim);color:var(--color-success);font-size:0.75rem;">${d}</span>`).join('')}
          </div>
        </div>
        <!-- Gaps -->
        <div class="card" style="padding:20px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;color:var(--color-warning);">Gaps de Desenvolvimento</h4>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${(review.gaps || []).map(g => `<span class="tag" style="background:var(--color-warning-dim);color:var(--color-warning);font-size:0.75rem;">${g}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Parecer -->
      <div class="card" style="padding:20px;">
        <h4 style="font-size:0.85rem;margin-bottom:8px;">Parecer do Gestor</h4>
        <p style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;margin:0;">${review.parecer}</p>
      </div>
    `;
  },

  // ── Radar Chart SVG ───────────────────────────────────────────────
  _renderRadarSVG(review) {
    const size = 200, cx = size / 2, cy = size / 2, r = 70;
    const comps = this._competenciasRadar;
    const n = comps.length;
    const angleStep = (2 * Math.PI) / n;

    const getPoint = (i, val) => {
      const angle = -Math.PI / 2 + i * angleStep;
      const dist = (val / 5) * r;
      return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
    };

    // Grid circles
    let gridLines = '';
    for (let level = 1; level <= 5; level++) {
      const points = [];
      for (let i = 0; i < n; i++) points.push(getPoint(i, level));
      gridLines += `<polygon points="${points.map(p => `${p.x},${p.y}`).join(' ')}" fill="none" stroke="var(--border-subtle)" stroke-width="0.5"/>`;
    }

    // Axis lines + labels
    let axes = '';
    for (let i = 0; i < n; i++) {
      const p = getPoint(i, 5.5);
      const p2 = getPoint(i, 5);
      axes += `<line x1="${cx}" y1="${cy}" x2="${p2.x}" y2="${p2.y}" stroke="var(--border-subtle)" stroke-width="0.5"/>`;
      axes += `<text x="${p.x}" y="${p.y}" text-anchor="middle" dominant-baseline="middle" fill="var(--text-muted)" font-size="8">${comps[i].nome}</text>`;
    }

    // Data polygon (gestor scores as primary)
    const gestorPts = comps.map((c, i) => {
      const nota = review.gestorScores.find(s => s.comp === c.id)?.nota || 0;
      return getPoint(i, nota);
    });
    const autoPts = comps.map((c, i) => {
      const nota = review.autoScores.find(s => s.comp === c.id)?.nota || 0;
      return getPoint(i, nota);
    });

    return `
      <svg viewBox="0 0 ${size} ${size}" width="100%" style="max-width:220px;margin:0 auto;display:block;">
        ${gridLines}
        ${axes}
        <polygon points="${autoPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(58,123,213,0.15)" stroke="var(--color-info)" stroke-width="1.5"/>
        <polygon points="${gestorPts.map(p => `${p.x},${p.y}`).join(' ')}" fill="rgba(232,81,2,0.15)" stroke="var(--accent-gold)" stroke-width="1.5"/>
        ${gestorPts.map(p => `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="var(--accent-gold)"/>`).join('')}
      </svg>
      <div style="display:flex;justify-content:center;gap:16px;margin-top:8px;font-size:0.68rem;">
        <span><span style="display:inline-block;width:10px;height:3px;background:var(--accent-gold);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Gestor</span>
        <span><span style="display:inline-block;width:10px;height:3px;background:var(--color-info);border-radius:2px;vertical-align:middle;margin-right:4px;"></span>Auto</span>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // AVALIACAO > 9-BOX
  // ══════════════════════════════════════════════════════════════════
  _renderNineBox(reviews) {
    if (!this._isAdmin()) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Acesso restrito a gestores</div></div>';
    const ciclos = this._getStore('ciclos');
    const activeCycle = ciclos.find(c => c.status === 'em_andamento') || ciclos[0];
    if (!activeCycle) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Nenhum ciclo ativo</div></div>';

    const cycleReviews = reviews.filter(r => r.cicloId === activeCycle.id);

    // Desempenho = gestorMedia, Potencial = media de inovacao+autonomia+cultura (scores do gestor)
    const peopleData = cycleReviews.map(r => {
      const person = this._getPerson(r.pessoaId);
      const desemp = r.gestorMedia;
      const potentialComps = ['inovacao', 'autonomia', 'cultura'];
      const potScores = r.gestorScores.filter(s => potentialComps.includes(s.comp));
      const potencial = potScores.length ? +(potScores.reduce((a, b) => a + b.nota, 0) / potScores.length).toFixed(1) : desemp;
      return { person, desemp, potencial };
    });

    // Classify: Low <3, Med 3-4, High >4
    const classify = (val) => val >= 4 ? 'high' : val >= 3 ? 'med' : 'low';

    const boxes = {
      'high-low': { label: 'Enigma', color: 'var(--color-warning)', people: [] },
      'high-med': { label: 'Forte Desempenho', color: 'var(--color-info)', people: [] },
      'high-high': { label: 'Estrela', color: 'var(--color-success)', people: [] },
      'med-low': { label: 'Questionavel', color: 'var(--color-danger)', people: [] },
      'med-med': { label: 'Mantenedor', color: 'var(--text-secondary)', people: [] },
      'med-high': { label: 'Futuro Lider', color: 'var(--color-purple)', people: [] },
      'low-low': { label: 'Insuficiente', color: 'var(--color-danger)', people: [] },
      'low-med': { label: 'Eficaz', color: 'var(--color-warning)', people: [] },
      'low-high': { label: 'Especialista', color: 'var(--color-info)', people: [] }
    };

    peopleData.forEach(d => {
      const key = `${classify(d.potencial)}-${classify(d.desemp)}`;
      if (boxes[key]) boxes[key].people.push(d.person);
    });

    // Render 3x3 grid (Y: potencial top-to-bottom high→low, X: desempenho left-to-right low→high)
    const rows = ['high', 'med', 'low'];
    const cols = ['low', 'med', 'high'];
    const potLabels = { high: 'Alto', med: 'Medio', low: 'Baixo' };
    const desLabels = { low: 'Baixo', med: 'Medio', high: 'Alto' };

    return `
      <div class="card">
        <div class="card-header"><h3 class="card-title">Matriz 9-Box \u2014 ${activeCycle.nome}</h3></div>
        <div style="padding:16px;">
          <div style="display:flex;align-items:center;margin-bottom:8px;">
            <div style="width:60px;"></div>
            ${cols.map(c => `<div style="flex:1;text-align:center;font-size:0.72rem;font-weight:600;color:var(--text-muted);">${desLabels[c]}</div>`).join('')}
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);text-align:center;margin-bottom:4px;">\u2192 Desempenho</div>

          ${rows.map(row => `
            <div style="display:flex;align-items:stretch;margin-bottom:2px;">
              <div style="width:60px;display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:600;color:var(--text-muted);writing-mode:vertical-rl;transform:rotate(180deg);">Potencial ${potLabels[row]}</div>
              ${cols.map(col => {
                const key = `${row}-${col}`;
                const box = boxes[key];
                return `
                  <div class="nine-box-cell" style="flex:1;min-height:90px;border:1px solid var(--border-subtle);border-radius:var(--radius-sm);margin:1px;padding:8px;background:${box.color}10;">
                    <div style="font-size:0.68rem;font-weight:600;color:${box.color};margin-bottom:6px;">${box.label}</div>
                    ${box.people.map(p => `<div style="font-size:0.75rem;padding:2px 0;">${p ? p.nome : ''}</div>`).join('')}
                    ${!box.people.length ? '<div style="font-size:0.68rem;color:var(--text-muted);">\u2014</div>' : ''}
                  </div>`;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // FEEDBACKS TAB
  // ══════════════════════════════════════════════════════════════════
  _renderFeedbacks(feedbacks) {
    const isAdmin = this._isAdmin();
    const userId = this._currentUserId();

    let filtered = feedbacks;
    if (!isAdmin) {
      filtered = feedbacks.filter(f => f.de === userId || f.para === userId || f.visibilidade === 'publico');
    }

    const publicos = filtered.filter(f => f.visibilidade === 'publico').length;
    const positivos = filtered.filter(f => f.tipo === 'positivo').length;
    const construtivos = filtered.filter(f => f.tipo === 'construtivo').length;

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Total</div><div class="kpi-value">${filtered.length}</div></div>
        <div class="kpi-card"><div class="kpi-label">Publicos</div><div class="kpi-value">${publicos}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Positivos</div><div class="kpi-value">${positivos}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Construtivos</div><div class="kpi-value">${construtivos}</div></div>
      </div>

      <div class="card">
        <div class="card-header">
          <div style="display:flex;gap:8px;" id="rhFbFilters">
            <button class="tab tab--sub active" data-fbfilter="todos">Todos</button>
            <button class="tab tab--sub" data-fbfilter="recebidos">Recebidos</button>
            <button class="tab tab--sub" data-fbfilter="enviados">Enviados</button>
            <button class="tab tab--sub" data-fbfilter="publicos">Publicos</button>
          </div>
          <button class="btn btn-primary btn-sm" id="rhNewFeedback">+ Feedback</button>
        </div>
        <!-- New feedback form -->
        <div id="rhFeedbackForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">De</label>
              <select class="form-input" id="fbDe">${this._team.map(t => `<option value="${t.id}" ${t.id === userId ? 'selected' : ''}>${t.nome}</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Para</label>
              <select class="form-input" id="fbPara">${this._team.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select>
            </div>
          </div>
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Tipo</label>
              <select class="form-input" id="fbTipo"><option value="positivo">Positivo</option><option value="construtivo">Construtivo</option></select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Visibilidade</label>
              <select class="form-input" id="fbVisib"><option value="publico">Publico</option><option value="privado">Privado</option></select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label">Mensagem</label>
            <textarea class="form-input" id="fbTexto" rows="3" placeholder="Descreva o feedback..."></textarea>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" id="fbSave">Enviar</button>
            <button class="btn btn-secondary btn-sm" id="fbCancel">Cancelar</button>
          </div>
        </div>
        <div id="rhFeedbackList" style="max-height:500px;overflow-y:auto;">
          ${this._renderFeedbackItems(filtered)}
        </div>
      </div>
    `;
  },

  _renderFeedbackItems(feedbacks, filter) {
    const userId = this._currentUserId();
    let items = [...feedbacks];
    if (filter === 'recebidos') items = items.filter(f => f.para === userId);
    else if (filter === 'enviados') items = items.filter(f => f.de === userId);
    else if (filter === 'publicos') items = items.filter(f => f.visibilidade === 'publico');

    if (!items.length) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Nenhum feedback encontrado</div></div>';

    return items.sort((a, b) => new Date(b.data) - new Date(a.data)).map(f => {
      const tipo = f.tipo === 'positivo';
      const visIcon = f.visibilidade === 'publico' ? '\u{1F310}' : '\u{1F512}';
      return `
        <div style="padding:14px 16px;border-bottom:1px solid var(--border-subtle);display:flex;gap:12px;align-items:flex-start;">
          <div style="width:4px;min-height:40px;border-radius:2px;background:${tipo ? 'var(--color-success)' : 'var(--color-warning)'};flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
              <div><strong style="font-size:0.82rem;">${this._getPersonName(f.de)}</strong> <span style="color:var(--text-muted);font-size:0.75rem;">\u2192</span> <strong style="font-size:0.82rem;">${this._getPersonName(f.para)}</strong></div>
              <div style="display:flex;gap:6px;align-items:center;">
                <span style="font-size:0.7rem;">${visIcon}</span>
                <span class="tag" style="font-size:0.65rem;background:${tipo ? 'var(--color-success-dim)' : 'var(--color-warning-dim)'};color:${tipo ? 'var(--color-success)' : 'var(--color-warning)'};">${f.tipo}</span>
              </div>
            </div>
            <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.5;">${f.mensagem}</div>
            <div style="font-size:0.68rem;color:var(--text-muted);margin-top:4px;">${new Date(f.data).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>`;
    }).join('');
  },

  // ══════════════════════════════════════════════════════════════════
  // ELOGIOS TAB
  // ══════════════════════════════════════════════════════════════════
  _renderElogios(elogios) {
    // Valores mais reconhecidos
    const valorCount = {};
    elogios.forEach(e => { valorCount[e.valor] = (valorCount[e.valor] || 0) + 1; });
    // Pessoas mais reconhecidas
    const personCount = {};
    elogios.forEach(e => { personCount[e.para] = (personCount[e.para] || 0) + 1; });
    const topPeople = Object.entries(personCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const userId = this._currentUserId();

    return `
      <div class="grid-2" style="gap:16px;margin-bottom:16px;">
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;">Valores Mais Reconhecidos</h4>
          ${this._valores.map(v => {
            const count = valorCount[v.id] || 0;
            const max = Math.max(...Object.values(valorCount), 1);
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:1.1rem;">${v.emoji}</span>
              <span style="font-size:0.78rem;width:100px;">${v.nome}</span>
              <div style="flex:1;height:6px;background:var(--bg-tertiary);border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${(count / max) * 100}%;background:var(--accent-gold);border-radius:3px;"></div>
              </div>
              <span style="font-size:0.72rem;color:var(--text-muted);width:20px;text-align:right;">${count}</span>
            </div>`;
          }).join('')}
        </div>
        <div class="card" style="padding:16px;">
          <h4 style="font-size:0.85rem;margin-bottom:10px;">Mais Reconhecidos</h4>
          ${topPeople.map(([id, count], i) => {
            const medals = ['\u{1F947}', '\u{1F948}', '\u{1F949}', '', ''];
            return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
              <span style="font-size:1.1rem;width:24px;text-align:center;">${medals[i] || `${i + 1}.`}</span>
              <span style="font-size:0.85rem;flex:1;font-weight:${i === 0 ? '700' : '400'};">${this._getPersonName(id)}</span>
              <span style="font-size:0.78rem;color:var(--accent-gold);font-weight:600;">${count} elogios</span>
            </div>`;
          }).join('')}
          ${!topPeople.length ? '<div style="font-size:0.78rem;color:var(--text-muted);">Nenhum elogio ainda</div>' : ''}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Feed de Elogios</h3>
          <button class="btn btn-primary btn-sm" id="rhNewElogio">+ Elogiar</button>
        </div>
        <div id="rhElogioForm" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div class="grid-2" style="gap:12px;margin-bottom:12px;">
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">De</label>
              <select class="form-input" id="elDe">${this._team.map(t => `<option value="${t.id}" ${t.id === userId ? 'selected' : ''}>${t.nome}</option>`).join('')}</select>
            </div>
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">Para</label>
              <select class="form-input" id="elPara">${this._team.map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label">Valor TBO</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap;" id="elValores">
              ${this._valores.map(v => `<button class="quick-chip" data-valor="${v.id}" style="font-size:0.78rem;">${v.emoji} ${v.nome}</button>`).join('')}
            </div>
            <input type="hidden" id="elValor" value="excelencia">
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label">Mensagem</label>
            <textarea class="form-input" id="elTexto" rows="2" placeholder="Por que esta pessoa merece reconhecimento?"></textarea>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" id="elSave">Publicar</button>
            <button class="btn btn-secondary btn-sm" id="elCancel">Cancelar</button>
          </div>
        </div>
        <div id="rhElogioList" style="max-height:500px;overflow-y:auto;">
          ${this._renderElogioItems(elogios)}
        </div>
      </div>
    `;
  },

  _renderElogioItems(elogios) {
    if (!elogios.length) return '<div class="empty-state" style="padding:32px;"><div class="empty-state-text">Nenhum elogio no mural</div></div>';
    return elogios.sort((a, b) => new Date(b.data) - new Date(a.data)).map(e => {
      const valor = this._valores.find(v => v.id === e.valor) || this._valores[0];
      return `
        <div style="padding:16px;border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="font-size:1.8rem;">${valor.emoji}</span>
            <div>
              <div style="font-size:0.82rem;"><strong>${this._getPersonName(e.de)}</strong> elogiou <strong>${this._getPersonName(e.para)}</strong></div>
              <div style="font-size:0.7rem;color:var(--text-muted);">${valor.nome} \u2022 ${new Date(e.data).toLocaleDateString('pt-BR')}</div>
            </div>
          </div>
          <div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.6;padding-left:42px;">${e.mensagem}</div>
          <div style="padding-left:42px;margin-top:6px;">
            <button class="btn btn-sm btn-ghost rh-curtir" data-id="${e.id}" style="font-size:0.72rem;">\u2764\uFE0F ${e.curtidas || 0}</button>
          </div>
        </div>`;
    }).join('');
  },

  // ══════════════════════════════════════════════════════════════════
  // 1:1s TAB
  // ══════════════════════════════════════════════════════════════════
  _render1on1s(oneOnOnes) {
    const isAdmin = this._isAdmin();
    const userId = this._currentUserId();

    let items = oneOnOnes;
    if (!isAdmin) {
      items = oneOnOnes.filter(o => o.lider === userId || o.colaborador === userId);
    }

    const concluidas = items.filter(o => o.status === 'concluida').length;
    const agendadas = items.filter(o => o.status === 'agendada').length;
    const allActions = items.flatMap(o => o.items || []);
    const pendingActions = allActions.filter(i => !i.concluido);

    return `
      <div class="grid-4" style="margin-bottom:16px;">
        <div class="kpi-card"><div class="kpi-label">Total</div><div class="kpi-value">${items.length}</div></div>
        <div class="kpi-card kpi-card--blue"><div class="kpi-label">Agendadas</div><div class="kpi-value">${agendadas}</div></div>
        <div class="kpi-card kpi-card--success"><div class="kpi-label">Concluidas</div><div class="kpi-value">${concluidas}</div></div>
        <div class="kpi-card kpi-card--warning"><div class="kpi-label">Acoes Pendentes</div><div class="kpi-value">${pendingActions.length}</div></div>
      </div>

      <!-- Acoes pendentes -->
      ${pendingActions.length ? `
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header"><h3 class="card-title">Acoes Pendentes</h3></div>
          <div style="max-height:200px;overflow-y:auto;">
            ${pendingActions.map(a => `
              <div style="padding:10px 16px;border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:10px;">
                <input type="checkbox" class="rh-action-check" data-id="${a.id}" style="width:16px;height:16px;accent-color:var(--accent-gold);">
                <div style="flex:1;font-size:0.82rem;">${a.texto}</div>
                <span style="font-size:0.72rem;color:var(--text-muted);">${this._getPersonName(a.responsavel)}</span>
                <span style="font-size:0.68rem;color:${a.prazo && new Date(a.prazo) < new Date() ? 'var(--color-danger)' : 'var(--text-muted)'};">${a.prazo ? new Date(a.prazo + 'T12:00').toLocaleDateString('pt-BR') : ''}</span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Proximas / Historico -->
      <div class="grid-2" style="gap:16px;">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Proximas Reunioes</h3>
            <button class="btn btn-primary btn-sm" id="rhNew1on1">+ Nova 1:1</button>
          </div>
          <div id="rh1on1Form" style="display:none;padding:16px;border-bottom:1px solid var(--border-subtle);">
            <div class="grid-2" style="gap:12px;margin-bottom:12px;">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Lider</label>
                <select class="form-input" id="ooLider">${this._team.filter(t => !t.lider || t.cargo.startsWith('Coord') || t.cargo.startsWith('PO') || t.cargo.startsWith('Lider')).map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Colaborador</label>
                <select class="form-input" id="ooColab">${this._team.filter(t => t.lider && !t.terceirizado).map(t => `<option value="${t.id}">${t.nome}</option>`).join('')}</select>
              </div>
            </div>
            <div class="form-group" style="margin-bottom:12px;">
              <label class="form-label">Data</label>
              <input type="datetime-local" class="form-input" id="ooData">
            </div>
            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary btn-sm" id="ooSave">Agendar</button>
              <button class="btn btn-secondary btn-sm" id="ooCancel">Cancelar</button>
            </div>
          </div>
          ${items.filter(o => o.status === 'agendada').sort((a, b) => new Date(a.data) - new Date(b.data)).map(o => `
            <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:0.85rem;font-weight:600;">${this._getPersonName(o.lider)} \u2194 ${this._getPersonName(o.colaborador)}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);">${new Date(o.data).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              <span class="tag" style="font-size:0.65rem;background:var(--color-info-dim);color:var(--color-info);">Agendada</span>
            </div>
          `).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma reuniao agendada</div>'}
        </div>

        <div class="card">
          <div class="card-header"><h3 class="card-title">Historico</h3></div>
          ${items.filter(o => o.status === 'concluida').sort((a, b) => new Date(b.data) - new Date(a.data)).map(o => `
            <div style="padding:12px 16px;border-bottom:1px solid var(--border-subtle);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="font-size:0.85rem;font-weight:600;">${this._getPersonName(o.lider)} \u2194 ${this._getPersonName(o.colaborador)}</div>
                <span style="font-size:0.72rem;color:var(--text-muted);">${new Date(o.data).toLocaleDateString('pt-BR')}</span>
              </div>
              ${(o.items || []).length ? `<div style="font-size:0.72rem;color:var(--text-muted);">${o.items.length} action items \u2022 ${o.items.filter(i => i.concluido).length} concluidos</div>` : ''}
            </div>
          `).join('') || '<div style="padding:16px;font-size:0.78rem;color:var(--text-muted);">Nenhuma reuniao no historico</div>'}
        </div>
      </div>
    `;
  },

  // ══════════════════════════════════════════════════════════════════
  // INIT (Event Bindings)
  // ══════════════════════════════════════════════════════════════════
  init() {
    // ── Main Tab switching ──
    document.querySelectorAll('#rhMainTabs .tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#rhMainTabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.rh-module > .tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(`tab-${tab.dataset.tab}`);
        if (target) target.classList.add('active');
        if (typeof TBO_UX !== 'undefined') TBO_UX.updateBreadcrumb('rh', tab.textContent.trim());
      });
    });

    // ── Avaliacao subtab switching ──
    document.querySelectorAll('#rhAvalSubtabs .tab--sub').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('#rhAvalSubtabs .tab--sub').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#tab-rh-avaliacao .subtab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(`subtab-${tab.dataset.subtab}`);
        if (target) target.classList.add('active');
      });
    });

    // ── View person detail ──
    this._bindPersonDetailClicks();

    // ── Feedback filter ──
    document.querySelectorAll('#rhFbFilters .tab--sub').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#rhFbFilters .tab--sub').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.fbfilter;
        const feedbacks = this._getStore('feedbacks');
        const isAdmin = this._isAdmin();
        const userId = this._currentUserId();
        let filtered = feedbacks;
        if (!isAdmin) filtered = feedbacks.filter(f => f.de === userId || f.para === userId || f.visibilidade === 'publico');
        document.getElementById('rhFeedbackList').innerHTML = this._renderFeedbackItems(filtered, filter);
      });
    });

    // ── Feedback CRUD ──
    this._bindToggle('rhNewFeedback', 'rhFeedbackForm');
    this._bindToggle('fbCancel', 'rhFeedbackForm', false);
    this._bind('fbSave', () => {
      const fb = {
        id: this._genId(),
        de: document.getElementById('fbDe')?.value,
        para: document.getElementById('fbPara')?.value,
        tipo: document.getElementById('fbTipo')?.value,
        visibilidade: document.getElementById('fbVisib')?.value,
        mensagem: document.getElementById('fbTexto')?.value,
        data: new Date().toISOString()
      };
      if (!fb.mensagem) { TBO_TOAST.warning('Preencha a mensagem'); return; }
      const items = this._getStore('feedbacks');
      items.push(fb);
      this._setStore('feedbacks', items);
      const isAdmin = this._isAdmin();
      const userId = this._currentUserId();
      let filtered = items;
      if (!isAdmin) filtered = items.filter(f => f.de === userId || f.para === userId || f.visibilidade === 'publico');
      document.getElementById('rhFeedbackList').innerHTML = this._renderFeedbackItems(filtered);
      document.getElementById('rhFeedbackForm').style.display = 'none';
      document.getElementById('fbTexto').value = '';
      TBO_TOAST.success('Feedback enviado!');
    });

    // ── Elogios CRUD ──
    this._bindToggle('rhNewElogio', 'rhElogioForm');
    this._bindToggle('elCancel', 'rhElogioForm', false);
    document.querySelectorAll('#elValores .quick-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#elValores .quick-chip').forEach(c => c.style.outline = 'none');
        chip.style.outline = '2px solid var(--accent-gold)';
        document.getElementById('elValor').value = chip.dataset.valor;
      });
    });
    this._bind('elSave', () => {
      const el = {
        id: this._genId(),
        de: document.getElementById('elDe')?.value,
        para: document.getElementById('elPara')?.value,
        valor: document.getElementById('elValor')?.value,
        mensagem: document.getElementById('elTexto')?.value,
        curtidas: 0,
        data: new Date().toISOString()
      };
      if (!el.mensagem) { TBO_TOAST.warning('Escreva uma mensagem'); return; }
      const items = this._getStore('elogios');
      items.push(el);
      this._setStore('elogios', items);
      document.getElementById('rhElogioList').innerHTML = this._renderElogioItems(items);
      document.getElementById('rhElogioForm').style.display = 'none';
      document.getElementById('elTexto').value = '';
      TBO_TOAST.success('Elogio publicado!');
    });
    this._bindCurtirElogios();

    // ── 1:1 CRUD ──
    this._bindToggle('rhNew1on1', 'rh1on1Form');
    this._bindToggle('ooCancel', 'rh1on1Form', false);
    this._bind('ooSave', () => {
      const oo = {
        id: this._genId(),
        lider: document.getElementById('ooLider')?.value,
        colaborador: document.getElementById('ooColab')?.value,
        data: document.getElementById('ooData')?.value || new Date().toISOString(),
        status: 'agendada',
        items: []
      };
      const items = this._getStore('1on1s');
      items.push(oo);
      this._setStore('1on1s', items);
      TBO_TOAST.success('1:1 agendada!');
      TBO_ROUTER.navigate('rh');
    });

    // ── Action item checkboxes ──
    this._bindActionChecks();
  },

  // ── Bind helpers ──────────────────────────────────────────────────
  _bind(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
  },

  _bindToggle(btnId, formId, show = true) {
    const btn = document.getElementById(btnId);
    const form = document.getElementById(formId);
    if (btn && form) {
      btn.addEventListener('click', () => {
        form.style.display = show ? (form.style.display === 'none' ? 'block' : 'none') : 'none';
      });
    }
  },

  _bindPersonDetailClicks() {
    document.querySelectorAll('.rh-view-person').forEach(btn => {
      btn.addEventListener('click', () => {
        const personId = btn.dataset.person;
        const cycleId = btn.dataset.cycle;
        // RBAC check
        if (!this._isAdmin() && personId !== this._currentUserId()) {
          TBO_TOAST.warning('Voce so pode ver sua propria avaliacao.');
          return;
        }
        const overlay = document.getElementById('rhDetailOverlay');
        const mainContent = document.querySelector('.rh-module');
        // Hide main tabs+content, show detail
        document.querySelectorAll('.rh-module > .tab-bar, .rh-module > .tab-content, .rh-module > .grid-4').forEach(el => el.style.display = 'none');
        overlay.style.display = 'block';
        overlay.innerHTML = this._renderPersonDetail(personId, cycleId);
        if (window.lucide) lucide.createIcons();
        // Bind back button
        this._bind('rhBackToList', () => {
          overlay.style.display = 'none';
          overlay.innerHTML = '';
          document.querySelectorAll('.rh-module > .tab-bar, .rh-module > .tab-content, .rh-module > .grid-4').forEach(el => el.style.display = '');
          // Re-hide non-active tabs
          document.querySelectorAll('.rh-module > .tab-content:not(.active)').forEach(el => el.style.display = 'none');
          // Re-show active
          document.querySelectorAll('.rh-module > .tab-content.active').forEach(el => el.style.display = '');
        });
      });
    });
  },

  _bindCurtirElogios() {
    document.querySelectorAll('.rh-curtir').forEach(btn => {
      btn.addEventListener('click', () => {
        const items = this._getStore('elogios');
        const item = items.find(e => e.id === btn.dataset.id);
        if (item) { item.curtidas = (item.curtidas || 0) + 1; this._setStore('elogios', items); }
        document.getElementById('rhElogioList').innerHTML = this._renderElogioItems(items);
        this._bindCurtirElogios();
      });
    });
  },

  _bindActionChecks() {
    document.querySelectorAll('.rh-action-check').forEach(chk => {
      chk.addEventListener('change', () => {
        const items = this._getStore('1on1s');
        items.forEach(o => {
          (o.items || []).forEach(a => {
            if (a.id === chk.dataset.id) a.concluido = chk.checked;
          });
        });
        this._setStore('1on1s', items);
        TBO_TOAST.success('Acao atualizada!');
      });
    });
  }
};
