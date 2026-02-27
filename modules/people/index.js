// TBO OS — People Module Shell (v4.0 — Lazy-loaded architecture)
// Coordena tabs lazy-loaded: Equipe, Talentos, Vagas, Contratos, Performance, Cultura, 1:1s, Analytics
// Carrega apenas o shell + tab ativa; outras tabs sao carregadas sob demanda.

const TBO_PEOPLE = {
  // Referencia ao estado compartilhado
  get S() { return TBO_PEOPLE_SHARED; },

  // Tab handlers registrados por cada sub-modulo
  _tabs: {},
  _tabScripts: {
    'visao-geral':    'modules/people/tab-equipe.js',
    'banco-talentos': 'modules/people/tab-talentos.js',
    'vagas':          'modules/people/tab-vagas.js',
    'contratos':      'modules/people/tab-contratos.js',
    'performance':    'modules/people/tab-performance.js',
    'cultura':        'modules/people/tab-cultura.js',
    'one-on-ones':    'modules/people/tab-one-on-ones.js',
    'analytics':      'modules/people/tab-analytics.js'
  },
  _tabLoading: {},
  _cacheBust: '2026022701',

  // ── Registrar sub-modulo de tab ──
  registerTab(tabId, handler) {
    this._tabs[tabId] = handler;
    console.log(`[People] Tab registrada: ${tabId}`);
  },

  // ── Carregar sub-modulo sob demanda ──
  async _ensureTab(tabId) {
    // Ja registrado? Pronto
    if (this._tabs[tabId]) return this._tabs[tabId];

    // Script existe para esta tab?
    const script = this._tabScripts[tabId];
    if (!script) {
      console.warn(`[People] Tab "${tabId}" nao tem script mapeado`);
      return null;
    }

    // Carregar via module loader
    if (typeof TBO_MODULE_LOADER !== 'undefined') {
      try {
        await TBO_MODULE_LOADER.load(script, { cacheBust: this._cacheBust });
      } catch (e) {
        console.error(`[People] Erro ao carregar tab "${tabId}":`, e);
        if (typeof TBO_TOAST !== 'undefined') TBO_TOAST.error('Erro', `Falha ao carregar aba: ${tabId}`);
        return null;
      }
    } else {
      // Fallback: injetar script manualmente
      await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = `${script}?v=${this._cacheBust}`;
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }

    return this._tabs[tabId] || null;
  },

  // ── RENDER (entry point chamado pelo router) ──
  render() {
    const S = this.S;

    // Deep link: ler tab da URL
    const hash = (window.location.hash || '').replace('#', '');
    if (hash.startsWith('rh/')) {
      const parts = hash.split('/');
      const tabFromUrl = parts[1];
      const validTabs = ['visao-geral', 'performance', 'cultura', 'one-on-ones', 'analytics', 'banco-talentos', 'vagas', 'contratos'];
      if (validTabs.includes(tabFromUrl)) {
        S._activeTab = tabFromUrl;
      }
      if (tabFromUrl === 'cultura' && parts[2]) {
        const validCulturaSubs = ['valores', 'reconhecimentos', 'rituais', 'feedbacks', 'historico', 'onboarding'];
        if (validCulturaSubs.includes(parts[2])) {
          S._culturaSubTab = parts[2];
        }
      }
    }

    // Garantir _team preenchido antes do seed data
    if (!S._team.length) S._team = [...S._teamSeed];
    this._ensureSeedData();

    // Carregar cache de teams
    if (!S._teamsCache && typeof PeopleRepo !== 'undefined') {
      PeopleRepo.listTeams().then(teams => {
        S._teamsCache = teams;
        const filterBu = document.querySelector('.rh-filter-bu');
        if (filterBu && teams.length) {
          const current = filterBu.value;
          const options = teams.filter(t => t.is_active !== false).map(t => t.name).sort();
          filterBu.innerHTML = '<option value="">Todas BUs</option>' +
            options.map(name => `<option value="${name}" ${current === name ? 'selected' : ''}>${name}</option>`).join('');
        }
      }).catch(() => {});
    }

    // Carregar equipe do Supabase async
    if (!S._teamLoaded) {
      S._loadTeamFromSupabase().then(() => {
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = this._renderActiveTab();
          this._initActiveTab();
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    return `
      <div class="rh-module">
        <style>${this._getScopedCSS()}</style>
        <div id="rhTabContent">
          ${this._renderActiveTab()}
        </div>
      </div>
    `;
  },

  // ── Renderizar tab ativa ──
  _renderActiveTab() {
    const S = this.S;
    // Guards de permissao
    if (S._activeTab === 'one-on-ones' && !S._canSee1on1s()) S._activeTab = 'visao-geral';
    if (S._activeTab === 'analytics' && !S._isDiretoria()) S._activeTab = 'visao-geral';
    if (S._activeTab === 'contratos' && !S._canSeeContracts()) S._activeTab = 'visao-geral';

    const tab = this._tabs[S._activeTab];
    if (tab && tab.render) {
      return tab.render();
    }

    // Tab nao carregada ainda — skeleton + trigger lazy load
    this._lazyLoadTab(S._activeTab);
    return `
      <div id="rhTabLoading" style="padding:40px;text-align:center;">
        ${S._renderKPISkeleton()}
        ${S._renderSkeleton()}
      </div>
    `;
  },

  // ── Lazy load e renderizar tab ──
  async _lazyLoadTab(tabId) {
    if (this._tabLoading[tabId]) return;
    this._tabLoading[tabId] = true;
    const tab = await this._ensureTab(tabId);
    this._tabLoading[tabId] = false;
    if (tab) {
      const tabContent = document.getElementById('rhTabContent');
      if (tabContent) {
        tabContent.innerHTML = tab.render();
        if (tab.init) tab.init();
        if (window.lucide) lucide.createIcons();
      }
    }
  },

  // ── Init tab ativa ──
  _initActiveTab() {
    const S = this.S;
    const tab = this._tabs[S._activeTab];
    if (tab && tab.init) {
      tab.init();
    }
  },

  // ── INIT (chamado pelo router apos render) ──
  async init() {
    const S = this.S;

    // Event Delegation: listeners persistentes que sobrevivem a re-renders
    const moduleRoot = document.querySelector('.rh-module') || document.getElementById('moduleContainer');
    if (moduleRoot && !moduleRoot.__peopleDelegated) {
      moduleRoot.__peopleDelegated = true;
      moduleRoot.addEventListener('click', (e) => {
        const btn = e.target.closest('#rhBtnNovaVaga');
        if (btn) { e.preventDefault(); e.stopPropagation(); this._delegateAction('vagas', '_openVagaModal', null); return; }
        const btn2 = e.target.closest('#rhBtnNovoContrato');
        if (btn2) { e.preventDefault(); e.stopPropagation(); this._delegateAction('contratos', '_openContratoModal', null); return; }
      });
    }

    // Hashchange handler para navegacao entre tabs via sidebar
    this._hashChangeHandler = () => {
      const hash = (window.location.hash || '').replace('#', '');
      if (!hash.startsWith('rh')) return;
      const parts = hash.split('/');
      const validTabs = ['visao-geral', 'performance', 'cultura', 'one-on-ones', 'analytics', 'banco-talentos', 'vagas', 'contratos'];
      const tabFromUrl = parts[1] || 'visao-geral';
      if (!validTabs.includes(tabFromUrl)) return;

      if (tabFromUrl !== S._activeTab) {
        const filterBuEl = document.querySelector('.rh-filter-bu');
        const filterSearchEl = document.querySelector('.rh-filter-search');
        if (filterBuEl) S._filterBU = filterBuEl.value;
        if (filterSearchEl) S._filterSearch = filterSearchEl.value;

        S._activeTab = tabFromUrl;
        this._switchTab(tabFromUrl);

        if (typeof TBO_SIDEBAR_RENDERER !== 'undefined') {
          TBO_SIDEBAR_RENDERER.setActive(hash);
        }
      }

      if (tabFromUrl === 'cultura' && parts[2]) {
        const validCulturaSubs = ['valores', 'reconhecimentos', 'rituais', 'feedbacks', 'historico', 'onboarding'];
        if (validCulturaSubs.includes(parts[2]) && parts[2] !== S._culturaSubTab) {
          S._culturaSubTab = parts[2];
          // Re-renderizar conteudo da subtab diretamente
          const culturaTab = this._tabs['cultura'];
          if (culturaTab) {
            const content = document.getElementById('rhCulturaContent');
            if (content) {
              content.innerHTML = culturaTab._renderCulturaSubTab(parts[2]);
              if (window.lucide) lucide.createIcons({ root: content });
              if (culturaTab._bindCulturaContent) culturaTab._bindCulturaContent();
              if (parts[2] === 'onboarding' && culturaTab._loadOnboardingData) culturaTab._loadOnboardingData();
            }
          }
        }
      }
    };
    window.addEventListener('hashchange', this._hashChangeHandler);

    // Carregar e inicializar tab ativa
    const tab = await this._ensureTab(S._activeTab);
    if (tab) {
      // Se ainda mostra skeleton, substituir
      const loading = document.getElementById('rhTabLoading');
      if (loading) {
        const tabContent = document.getElementById('rhTabContent');
        if (tabContent) {
          tabContent.innerHTML = tab.render();
        }
      }
      if (tab.init) tab.init();
    }

    // Hover Card
    if (typeof TBO_HOVER_CARD !== 'undefined') {
      const rhModule = document.querySelector('.rh-module');
      if (rhModule) TBO_HOVER_CARD.bind(rhModule);
    }

    if (window.lucide) lucide.createIcons();
  },

  // ── Trocar tab com lazy load ──
  async _switchTab(tabId) {
    const tab = await this._ensureTab(tabId);
    const tabContent = document.getElementById('rhTabContent');
    if (!tabContent) return;

    if (tab && tab.render) {
      tabContent.innerHTML = tab.render();
      if (tab.init) tab.init();
    } else {
      tabContent.innerHTML = `
        <div style="padding:40px;text-align:center;">
          ${this.S._renderKPISkeleton()}
          ${this.S._renderSkeleton()}
        </div>
      `;
    }
    if (window.lucide) lucide.createIcons();
  },

  // ── Delegar acao para tab (carregando-a se necessario) ──
  async _delegateAction(tabId, method, ...args) {
    const tab = await this._ensureTab(tabId);
    if (tab && typeof tab[method] === 'function') {
      tab[method](...args);
    }
  },

  // ── Destroy (cleanup ao sair do modulo) ──
  destroy() {
    if (this._hashChangeHandler) {
      window.removeEventListener('hashchange', this._hashChangeHandler);
      this._hashChangeHandler = null;
    }
    const moduleRoot = document.querySelector('.rh-module');
    if (moduleRoot) moduleRoot.__peopleDelegated = false;

    // Destruir tabs ativas
    Object.values(this._tabs).forEach(tab => {
      if (tab && tab.destroy) tab.destroy();
    });
  },

  // ── Seed data (chamado 1x) ──
  _ensureSeedData() {
    const S = this.S;
    if (S._getStore('people_seeded_v3').length) return;
    ['ciclos','avaliacoes_people','feedbacks','elogios','1on1s','people_seeded','people_seeded_v2','pulse'].forEach(k => localStorage.removeItem('tbo_rh_' + k));

    const cycleId = 'ciclo_2025s2';
    const cycle2Id = 'ciclo_2026s1';
    S._setStore('ciclos', [
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

    const comps = S._competenciasRadar;
    const reviews = S._team.filter(t => t.lider && !t.terceirizado).map(t => {
      const p = profiles[t.id];
      if (!p) return null;
      const autoScores = comps.map((c, i) => ({ comp: c.id, nota: p.auto[i] }));
      const gestorScores = comps.map((c, i) => ({ comp: c.id, nota: p.gest[i] }));
      const paresScores = comps.map((c, i) => ({ comp: c.id, nota: p.par[i] }));
      const autoMedia = +(autoScores.reduce((s, x) => s + x.nota, 0) / 6).toFixed(2);
      const gestorMedia = +(gestorScores.reduce((s, x) => s + x.nota, 0) / 6).toFixed(2);
      const paresMedia = +(paresScores.reduce((s, x) => s + x.nota, 0) / 6).toFixed(2);
      const mediaGeral = +((autoMedia * 0.2 + gestorMedia * 0.5 + paresMedia * 0.3)).toFixed(2);
      return { id: S._genId(), cicloId: cycle2Id, pessoaId: t.id, autoScores, gestorScores, paresScores, autoMedia, gestorMedia, paresMedia, mediaGeral, destaques: p.dest, gaps: p.gaps, parecer: p.parecer };
    }).filter(Boolean);
    S._setStore('avaliacoes_people', reviews);

    S._setStore('feedbacks', [
      { id: S._genId(), de: 'marco', para: 'nath', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Excelente gestao da BU Digital 3D. Time entregando com qualidade e dentro do prazo.', data: '2026-02-10T10:00:00Z' },
      { id: S._genId(), de: 'marco', para: 'nelson', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa ser mais permeavel aos feedbacks em reuniao interna.', data: '2026-02-08T14:00:00Z' },
      { id: S._genId(), de: 'nath', para: 'dann', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Renders do projeto ficaram incriveis. Qualidade tecnica de referencia.', data: '2026-02-05T09:00:00Z' },
      { id: S._genId(), de: 'marco', para: 'rafa', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Campanha de ativacao com ROAS excelente. Parabens!', data: '2026-02-01T11:00:00Z' },
      { id: S._genId(), de: 'nelson', para: 'celso', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Identidade visual do projeto ficou elegante.', data: '2026-01-28T16:00:00Z' },
      { id: S._genId(), de: 'marco', para: 'carol', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa melhorar organizacao de pastas no Drive.', data: '2026-01-25T13:00:00Z' },
      { id: S._genId(), de: 'dann', para: 'tiago', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Boa consistencia nas entregas de renders tecnicos.', data: '2026-01-20T10:00:00Z' },
      { id: S._genId(), de: 'ruy', para: 'gustavo', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa estruturar melhor a prospeccao ativa.', data: '2026-01-18T09:00:00Z' },
      { id: S._genId(), de: 'nath', para: 'duda', tipo: 'positivo', visibilidade: 'publico', mensagem: 'Evolucao visivel nas ultimas entregas!', data: '2026-01-15T11:00:00Z' },
      { id: S._genId(), de: 'rafa', para: 'lucca', tipo: 'construtivo', visibilidade: 'privado', mensagem: 'Precisa planejar melhor as campanhas com antecedencia.', data: '2026-01-12T10:00:00Z' }
    ]);

    S._setStore('elogios', [
      { id: S._genId(), de: 'marco', para: 'dann',   valor: 'excelencia',  mensagem: 'Qualidade dos renders e referencia para o mercado. Parabens!', curtidas: 7, data: '2026-02-12T10:00:00Z' },
      { id: S._genId(), de: 'ruy',   para: 'nath',   valor: 'ownership',   mensagem: 'Assumiu a coordenacao de toda a BU Digital 3D com maestria.', curtidas: 8, data: '2026-02-09T14:00:00Z' },
      { id: S._genId(), de: 'nath',  para: 'carol',  valor: 'colaboracao', mensagem: 'Sempre disponivel para ajudar qualquer pessoa do time.', curtidas: 5, data: '2026-02-05T11:00:00Z' },
      { id: S._genId(), de: 'rafa',  para: 'nelson', valor: 'inovacao',    mensagem: 'Conceito de branding surpreendeu o cliente na primeira apresentacao.', curtidas: 4, data: '2026-01-30T09:00:00Z' },
      { id: S._genId(), de: 'marco', para: 'rafa',   valor: 'superacao',   mensagem: 'ROAS de campanha acima da media do mercado!', curtidas: 6, data: '2026-01-22T15:00:00Z' },
      { id: S._genId(), de: 'dann',  para: 'tiago',  valor: 'excelencia',  mensagem: 'Evolucao tecnica impressionante no ultimo trimestre.', curtidas: 3, data: '2026-01-18T10:00:00Z' },
      { id: S._genId(), de: 'nelson', para: 'erick', valor: 'inovacao',    mensagem: 'Proposta criativa surpreendeu. Pensamento fora da caixa!', curtidas: 3, data: '2026-01-15T14:00:00Z' },
      { id: S._genId(), de: 'nath',  para: 'duda',   valor: 'superacao',   mensagem: 'Do zero ao render em 3 meses. Dedicacao exemplar!', curtidas: 5, data: '2026-01-10T11:00:00Z' }
    ]);

    S._setStore('1on1s', [
      { id: S._genId(), lider: 'marco', colaborador: 'nath', data: '2026-02-14T10:00:00Z', status: 'concluida', items: [
        { id: S._genId(), texto: 'Definir processo de QA para entregas 3D', responsavel: 'nath', prazo: '2026-02-28', concluido: false },
        { id: S._genId(), texto: 'Preparar PDI de Duda e Mariane', responsavel: 'nath', prazo: '2026-03-01', concluido: false }
      ]},
      { id: S._genId(), lider: 'marco', colaborador: 'nelson', data: '2026-02-07T14:00:00Z', status: 'concluida', items: [
        { id: S._genId(), texto: 'Garantir atualizacao dos arquivos no Drive', responsavel: 'nelson', prazo: '2026-02-15', concluido: true },
        { id: S._genId(), texto: 'Reduzir revisoes com checklist interno', responsavel: 'nelson', prazo: '2026-02-28', concluido: false }
      ]},
      { id: S._genId(), lider: 'marco', colaborador: 'rafa', data: '2026-02-06T10:00:00Z', status: 'concluida', items: [
        { id: S._genId(), texto: 'Relatorio de performance das campanhas Q1', responsavel: 'rafa', prazo: '2026-02-20', concluido: false }
      ]},
      { id: S._genId(), lider: 'marco', colaborador: 'carol', data: '2026-02-05T11:00:00Z', status: 'concluida', items: [
        { id: S._genId(), texto: 'Reorganizar pastas do Drive', responsavel: 'carol', prazo: '2026-02-20', concluido: true },
        { id: S._genId(), texto: 'Criar template de briefing para novos projetos', responsavel: 'carol', prazo: '2026-02-28', concluido: false }
      ]},
      { id: S._genId(), lider: 'dann', colaborador: 'tiago', data: '2026-02-10T14:00:00Z', status: 'concluida', items: [
        { id: S._genId(), texto: 'Estudar iluminacao avancada no V-Ray', responsavel: 'tiago', prazo: '2026-02-25', concluido: false }
      ]},
      { id: S._genId(), lider: 'dann', colaborador: 'duda', data: '2026-02-10T16:00:00Z', status: 'concluida', items: [
        { id: S._genId(), texto: 'Completar modulo basico de modelagem 3ds Max', responsavel: 'duda', prazo: '2026-02-28', concluido: false }
      ]},
      { id: S._genId(), lider: 'marco', colaborador: 'nath', data: '2026-02-28T10:00:00Z', status: 'agendada', items: [] },
      { id: S._genId(), lider: 'marco', colaborador: 'nelson', data: '2026-02-27T14:00:00Z', status: 'agendada', items: [] },
      { id: S._genId(), lider: 'ruy', colaborador: 'gustavo', data: '2026-02-25T09:00:00Z', status: 'agendada', items: [] },
      { id: S._genId(), lider: 'dann', colaborador: 'mari', data: '2026-02-24T14:00:00Z', status: 'agendada', items: [] },
      { id: S._genId(), lider: 'rafa', colaborador: 'lucca', data: '2026-02-26T11:00:00Z', status: 'agendada', items: [] }
    ]);

    S._setStore('pulse', [
      { data: '2026-02-14', respostas: { nath: 5, dann: 4, carol: 4, nelson: 3, rafa: 4, gustavo: 3, celso: 4, erick: 3, duda: 4, tiago: 4, mari: 3, lucca: 4 } },
      { data: '2026-02-07', respostas: { nath: 5, dann: 5, carol: 3, nelson: 4, rafa: 3, gustavo: 4, celso: 4, erick: 4, duda: 3, tiago: 4, mari: 4, lucca: 3 } },
      { data: '2026-01-31', respostas: { nath: 4, dann: 4, carol: 4, nelson: 3, rafa: 4, gustavo: 3, celso: 3, erick: 3, duda: 4, tiago: 3, mari: 3, lucca: 4 } },
      { data: '2026-01-24', respostas: { nath: 4, dann: 5, carol: 3, nelson: 4, rafa: 3, gustavo: 3, celso: 4, erick: 3, duda: 3, tiago: 4, mari: 3, lucca: 3 } }
    ]);

    S._setStore('people_seeded_v3', [true]);
  },

  // ── Scoped CSS ──
  _getScopedCSS() {
    return `
      .rh-people-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
      .rh-person-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); padding: 16px; cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
      .rh-person-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(232,81,2,0.1); }
      .rh-avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.85rem; flex-shrink: 0; }
      .rh-drawer { position: fixed; top: 0; right: 0; width: 460px; max-width: 92vw; height: 100vh; background: var(--bg-card, var(--bg-primary)); border-left: 1px solid var(--border-subtle); box-shadow: -4px 0 20px rgba(0,0,0,0.18); z-index: 1100; overflow-y: auto; transform: translateX(100%); transition: transform 0.25s cubic-bezier(0.4,0,0.2,1); }
      .rh-drawer.rh-drawer-open { transform: translateX(0); }
      .rh-drawer-content { padding: 24px; }
      .rh-profile-section { background: var(--bg-elevated); border-radius: var(--radius-md, 8px); padding: 16px; }
      .rh-colleague-chip:hover { background: var(--bg-tertiary) !important; }
      .rh-org-tree { display: flex; flex-direction: column; gap: 0; padding-left: 0; }
      .rh-org-node { position: relative; }
      .rh-org-card { background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 10px 14px; margin: 3px 0; transition: border-color 0.2s, box-shadow 0.2s; }
      .rh-org-card:hover { border-color: var(--accent-gold); box-shadow: 0 2px 8px rgba(232,81,2,0.08); }
      .rh-org-children { margin-left: 32px; padding-left: 16px; border-left: 2px solid var(--border-subtle); }
      .rh-org-collapsed { display: none; }
      .rh-org-connector { display: none; }
      .rh-org-toggle { opacity: 0.7; transition: opacity 0.15s; }
      .rh-org-toggle:hover { opacity: 1; }
      .rh-bu-table { width: 100%; border-collapse: collapse; }
      .rh-bu-table thead th { position: sticky; top: 0; background: var(--bg-elevated); z-index: 2; font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.3px; padding: 10px 12px; border-bottom: 2px solid var(--border-subtle); }
      .rh-bu-table tbody td { padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); font-size: 0.8rem; }
      .rh-bu-group-header td { font-weight: 700; }
      .rh-bu-row { transition: background 0.15s; }
      .rh-bu-row:hover { background: var(--bg-elevated); }
      .rh-person-row { cursor: pointer; }
      .rh-tabela-card { border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); }
      .rh-sort-header { user-select: none; }
      .rh-sort-header:hover { background: var(--bg-tertiary) !important; }
      .rh-sort-header div { display: inline-flex; align-items: center; gap: 3px; }
      .rh-context-menu { background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); box-shadow: 0 8px 24px rgba(0,0,0,0.18); overflow: hidden; min-width: 200px; }
      .rh-ctx-item { display: flex; align-items: center; gap: 8px; width: 100%; padding: 8px 14px; border: none; background: none; cursor: pointer; font-size: 0.78rem; color: var(--text-primary); transition: background 0.12s; text-align: left; }
      .rh-ctx-item:hover { background: var(--bg-elevated); }
      .rh-ctx-danger { color: var(--color-danger); }
      .rh-ctx-danger:hover { background: var(--color-danger)08; }
      .rh-pagination { border: 1px solid var(--border-subtle); border-radius: var(--radius-md, 8px); }
      .rh-page-btn:disabled { opacity: 0.3; pointer-events: none; }
      .subtab-content { display: none; }
      .subtab-content.active { display: block; }
      .rh-skeleton { background: linear-gradient(90deg, var(--bg-tertiary) 25%, var(--bg-elevated) 50%, var(--bg-tertiary) 75%); background-size: 200% 100%; animation: rh-shimmer 1.5s ease-in-out infinite; }
      @keyframes rh-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .rh-skeleton-card { opacity: 0.7; }
      .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 1200; display: flex; align-items: center; justify-content: center; }
      .modal { background: var(--bg-primary); border-radius: var(--radius-md, 12px); padding: 24px; max-height: 90vh; overflow-y: auto; box-shadow: 0 12px 40px rgba(0,0,0,0.25); }
      .rh-vincula-talent-item:hover { background: var(--bg-elevated); }
    `;
  }
};

// ── TBO_RH Compatibility Adapter ──
// Mantém a API publica TBO_RH para compatibilidade com modulos que referenciam TBO_RH._team, etc.
const TBO_RH = new Proxy({}, {
  get(target, prop) {
    // Propriedades do estado compartilhado
    if (typeof TBO_PEOPLE_SHARED !== 'undefined' && prop in TBO_PEOPLE_SHARED) {
      const val = TBO_PEOPLE_SHARED[prop];
      return typeof val === 'function' ? val.bind(TBO_PEOPLE_SHARED) : val;
    }
    // Metodos do shell
    if (typeof TBO_PEOPLE !== 'undefined' && prop in TBO_PEOPLE) {
      const val = TBO_PEOPLE[prop];
      return typeof val === 'function' ? val.bind(TBO_PEOPLE) : val;
    }
    return undefined;
  },
  set(target, prop, value) {
    if (typeof TBO_PEOPLE_SHARED !== 'undefined' && prop in TBO_PEOPLE_SHARED) {
      TBO_PEOPLE_SHARED[prop] = value;
      return true;
    }
    target[prop] = value;
    return true;
  }
});
