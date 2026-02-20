// TBO OS — Market Intelligence Scraper (via Claude API proxy)
// Direct browser scraping is blocked by CORS in static HTML apps.
// This module uses Claude API as intelligence proxy, with detailed
// per-source prompts to generate the most accurate market data possible.
const TBO_SCRAPER = {
  sources: [],
  _lastUpdate: {},
  _results: {},

  async init() {
    try {
      const response = await fetch('data/sources.json');
      if (response.ok) {
        const data = await response.json();
        this.sources = [...(data.dados_mercado || []), ...(data.noticias || [])];
      }
    } catch (e) {
      console.warn('Falha ao carregar fontes:', e);
    }
  },

  getActiveSources(type = 'all') {
    if (type === 'all') return this.sources.filter(s => s.ativo);
    return this.sources.filter(s => s.ativo && (s.tipo === type || !s.tipo));
  },

  // ── Per-Source Intelligence Prompts ──

  _getSourcePrompt(source) {
    const prompts = {
      'Brain Inteligência Estratégica': `Você é um analista que acompanha de perto os relatórios da Brain Inteligência Estratégica (brain.srv.br).

A Brain é a principal fonte de dados do mercado imobiliário brasileiro, especializada em pesquisas quantitativas.

Com base no que a Brain tipicamente publica e nos dados mais recentes do mercado, forneça:

1. **INDICADORES CURITIBA (últimos 6 meses)**:
   - Número de empreendimentos lançados
   - Unidades lançadas
   - VGV total dos lançamentos
   - Preço médio por m²
   - Perfil dos produtos (% luxo, médio, econômico)
   - Taxa de vendas sobre oferta
   - Estoque disponível

2. **INDICADORES REGIÃO METROPOLITANA**:
   - Mesmos indicadores acima para RMC
   - Comparativo com mesmo período do ano anterior

3. **TENDÊNCIAS DO COMPRADOR**:
   - Mudanças no perfil de demanda
   - Faixas de preço mais buscadas
   - Tipologias em alta

4. **COMPARATIVO TEMPORAL**:
   - Variação vs mesmo período do ano anterior
   - Tendência (crescimento, estabilidade, retração)

Inclua dados quantitativos sempre que possível. Cite "Brain Inteligência Estratégica" como fonte.
Responda em português brasileiro, formato estruturado.`,

      'Cúpola': `Você é um analista que acompanha de perto o conteúdo da Cúpola (cupola.com.br).

A Cúpola é referência em marketing imobiliário no Brasil, publicando artigos, cases e dados sobre o setor.

Com base no conteúdo típico da Cúpola, forneça:

1. **TENDÊNCIAS DE MARKETING IMOBILIÁRIO**:
   - Principais tendências de comunicação e vendas no setor
   - Mudanças no comportamento de compra digital
   - Novas metodologias de lançamento

2. **CASES E BENCHMARKS**:
   - Tipos de campanha com melhor performance
   - Canais digitais mais efetivos (Meta Ads, Google, programática)
   - Métricas de referência (CPL, taxa de conversão, ROAS)

3. **DADOS DE MERCADO**:
   - Panorama geral do mercado imobiliário
   - Volume de lançamentos e vendas
   - Perspectivas para os próximos meses

4. **INSIGHTS PARA STUDIOS DE VISUALIZAÇÃO**:
   - Papel do visual 3D na jornada de compra
   - Tendências em tours virtuais e plataformas interativas
   - Como o archviz impacta conversão

Cite "Cúpola" como fonte. Formato estruturado em português brasileiro.`,

      'DataStore': `Você é um analista que acompanha o Mundo DataStore (mundodatastore.com.br).

O DataStore é especializado em dados e rankings do mercado imobiliário brasileiro.

Com base no conteúdo típico do DataStore, forneça:

1. **RANKINGS DE INCORPORADORAS**:
   - Top incorporadoras por VGV (nacional e Curitiba/PR)
   - Incorporadoras mais ativas em lançamentos
   - Movimentações relevantes (fusões, novos entrantes)

2. **DADOS DE LANÇAMENTOS**:
   - Volume de lançamentos por região
   - VGV total e médio por empreendimento
   - Comparativo com anos anteriores

3. **ANÁLISE DE CURITIBA/PR**:
   - Dados específicos de Curitiba se disponíveis
   - Posição de Curitiba no ranking nacional
   - Incorporadoras atuantes na região

4. **TENDÊNCIAS QUANTITATIVAS**:
   - Evolução do mercado nos últimos trimestres
   - Projeções para os próximos meses

Cite "DataStore" como fonte. Formato estruturado em português brasileiro.`,

      'ABRAINC': `Você é um analista que acompanha os indicadores da ABRAINC (abrainc.org.br).

A ABRAINC (Associação Brasileira de Incorporadoras Imobiliárias) é a principal entidade representativa das incorporadoras.

Com base nos indicadores típicos da ABRAINC, forneça:

1. **INDICADORES NACIONAIS**:
   - Vendas líquidas (unidades e valor)
   - Lançamentos (unidades e VGV)
   - Distratos (volume e taxa)
   - Entregas realizadas

2. **ÍNDICE DE CONFIANÇA**:
   - Índice de confiança do setor imobiliário
   - Expectativas dos incorporadores
   - Intenção de lançamento

3. **FINANCIAMENTO HABITACIONAL**:
   - Volume de crédito imobiliário
   - Taxa Selic e impacto no setor
   - SBPE e FGTS — volumes e tendências

4. **PERSPECTIVAS**:
   - Projeção de lançamentos
   - Expectativa de vendas
   - Principais desafios do setor

Cite "ABRAINC" como fonte. Formato estruturado em português brasileiro.`,

      'CBIC': `Você é um analista que acompanha os dados da CBIC (cbic.org.br).

A CBIC (Câmara Brasileira da Indústria da Construção) é a principal entidade da construção civil.

Com base nos dados típicos da CBIC, forneça:

1. **PIB DA CONSTRUÇÃO CIVIL**:
   - Crescimento/retração do PIB setorial
   - Comparativo com PIB geral
   - Emprego no setor (geração/perda de vagas)

2. **CUSTOS DE CONSTRUÇÃO**:
   - CUB (Custo Unitário Básico) nacional e PR
   - INCC (Índice Nacional de Custo da Construção)
   - Evolução do custo de materiais e mão de obra

3. **INDICADORES ECONÔMICOS DO SETOR**:
   - Investimentos em construção
   - Financiamento e crédito
   - Licenças e alvarás

4. **TENDÊNCIAS DE CUSTO**:
   - Projeção de custos para os próximos meses
   - Impacto nos preços de venda dos imóveis
   - Pressão de margem para incorporadoras

Cite "CBIC" como fonte. Formato estruturado em português brasileiro.`,

      'SECOVI-PR': `Você é um analista que acompanha os dados do SECOVI-PR (secovipr.com.br).

O SECOVI-PR é o sindicato patronal do mercado imobiliário do Paraná.

Com base nos dados típicos do SECOVI-PR, forneça:

1. **MERCADO DE CURITIBA**:
   - Lançamentos recentes em Curitiba
   - Volume de vendas (unidades e valor)
   - Preço médio por m² por região
   - Bairros mais aquecidos

2. **REGIÃO METROPOLITANA**:
   - Dados de lançamentos na RMC
   - Cidades com mais atividade
   - Comparativo com Curitiba

3. **ESTOQUE E VELOCIDADE DE VENDAS**:
   - Estoque disponível
   - Velocidade de vendas (VSO)
   - Tempo médio para venda

4. **INDICADORES REGIONAIS**:
   - Índice de aluguel
   - Vacância comercial
   - Tendências do mercado paranaense

Cite "SECOVI-PR" como fonte. Formato estruturado em português brasileiro.`,

      'ADEMI-PR': `Você é um analista que acompanha a ADEMI-PR (Associação dos Dirigentes de Empresas do Mercado Imobiliário do Paraná).

Com base nos dados típicos da ADEMI-PR, forneça:

1. **INCORPORADORAS DO PR**:
   - Incorporadoras mais ativas no Paraná
   - Novos entrantes e expansões
   - Eventos e premiações do setor

2. **DADOS REGIONAIS**:
   - Lançamentos por incorporadora
   - Perfil dos empreendimentos (padrão, segmento)
   - Bairros e regiões com mais atividade

3. **PERSPECTIVAS LOCAIS**:
   - Tendências para o mercado paranaense
   - Demanda por tipologias
   - Impacto de políticas públicas locais

Cite "ADEMI-PR" como fonte. Formato estruturado em português brasileiro.`,

      'Sinduscon-PR': `Você é um analista que acompanha o Sinduscon-PR (Sindicato da Indústria da Construção Civil do Paraná).

Com base nos dados típicos do Sinduscon-PR, forneça:

1. **CUB-PR (Custo Unitário Básico do Paraná)**:
   - Valor atual do CUB-PR
   - Variação mensal e acumulada no ano
   - Comparativo com CUB nacional

2. **CUSTOS DE CONSTRUÇÃO NO PR**:
   - Custo de materiais
   - Custo de mão de obra
   - Pressões inflacionárias

3. **EMPREGO NA CONSTRUÇÃO CIVIL DO PR**:
   - Dados de emprego formal
   - Geração/perda de vagas
   - Perspectivas

Cite "Sinduscon-PR" como fonte. Formato estruturado em português brasileiro.`
    };

    // Match by partial name
    for (const [key, prompt] of Object.entries(prompts)) {
      if (source.nome.includes(key) || key.includes(source.nome)) {
        return prompt;
      }
    }

    // Generic fallback
    return `Você é um analista de mercado imobiliário.
Gere uma análise atualizada baseada no que a fonte "${source.nome}" (${source.url}) tipicamente publica.
Foco: ${source.foco || 'mercado imobiliário, especialmente Curitiba/PR'}.
Dados esperados: ${source.dados_esperados || 'indicadores quantitativos e tendências qualitativas'}.
Inclua dados quantitativos quando possível. Responda em formato estruturado, português brasileiro.`;
  },

  // ── Core Intelligence Methods ──

  async generateMarketIntelligence(topic = 'mercado imobiliário Curitiba') {
    if (!TBO_API.isConfigured()) {
      throw new Error('API key necessária para gerar inteligência de mercado.');
    }

    const market = TBO_STORAGE.get('market');

    const systemPrompt = `Você é um analista sênior de mercado imobiliário especializado em Curitiba/PR, com acesso profundo a dados de múltiplas fontes do setor.

DADOS INTERNOS DISPONÍVEIS:
${JSON.stringify(market.indicadores_curitiba || {}, null, 2)}

DADOS DA REGIÃO METROPOLITANA:
${JSON.stringify(market.indicadores_rm_curitiba || {}, null, 2)}

PREÇOS DE CONCORRÊNCIA:
${JSON.stringify(market.concorrentes_precos_mercado || {}, null, 2)}

TENDÊNCIAS IDENTIFICADAS:
${JSON.stringify(market.tendencias || [], null, 2)}

FONTES DE REFERÊNCIA QUE VOCÊ MONITORA:
1. Brain Inteligência Estratégica (brain.srv.br) — pesquisas quantitativas do setor
2. Cúpola (cupola.com.br) — marketing imobiliário e tendências
3. DataStore (mundodatastore.com.br) — rankings e dados de lançamentos
4. ABRAINC (abrainc.org.br) — indicadores nacionais
5. CBIC (cbic.org.br) — construção civil e custos
6. SECOVI-PR (secovipr.com.br) — mercado do Paraná
7. ADEMI-PR — incorporadoras do PR
8. Sinduscon-PR — custos de construção no PR

REGRAS:
- SEMPRE cite a fonte ao apresentar dados
- Diferencie dados de Curitiba/RMC de dados nacionais
- Priorize dados quantitativos (números, percentuais, valores)
- Cruze informações de múltiplas fontes para validar tendências
- Contextualize com a realidade da TBO (studio de archviz)
- Responda em português brasileiro`;

    const response = await TBO_API.call(systemPrompt, topic, { maxTokens: 3000 });
    return response.text;
  },

  async generateNewsFeed() {
    // Tentar buscar noticias reais via proxy primeiro
    try {
      const proxyUrl = `${window.location.origin}/api/news-proxy?limit=20`;
      const resp = await fetch(proxyUrl, { signal: AbortSignal.timeout(10000) });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.news?.length > 0) {
          console.log(`[TBO_SCRAPER] ${data.news.length} noticias reais carregadas via proxy`);
          return data.news.map(n => ({
            titulo: n.title, fonte: n.source, data: n.date,
            resumo: n.summary || '', categoria: n.category,
            regional: n.region === 'curitiba', relevancia_tbo: 'media',
            url: n.url || '#'
          }));
        }
      }
    } catch (e) {
      console.warn('[TBO_SCRAPER] Proxy indisponivel, tentando IA:', e.message);
    }

    // Fallback: gerar via IA
    if (!TBO_API.isConfigured()) {
      throw new Error('API key necessária e proxy indisponível.');
    }

    const market = TBO_STORAGE.get('market');

    const systemPrompt = `Você é um curador de notícias do setor imobiliário brasileiro, especialista em Curitiba/PR.
Gere um feed de notícias REALISTA baseado em tendências reais do mercado imobiliário.

CONTEXTO ATUAL: ${JSON.stringify(market.indicadores_curitiba || {}, null, 2)}

Retorne JSON array: [{"titulo":"...","fonte":"Valor Econômico|InfoMoney|SECOVI-PR|Brain|etc","data":"2026-02-XX","resumo":"2-3 frases","categoria":"lancamentos|indicadores|incorporadoras|tendencias","regional":true/false,"relevancia_tbo":"alta|media|baixa","url":"#"}]

Gere 12 noticias variadas. Responda APENAS com JSON, sem markdown.`;

    const response = await TBO_API.call(systemPrompt, 'Gere o feed de notícias atualizado para hoje.', { maxTokens: 3500, temperature: 0.7 });

    try {
      let jsonText = response.text;
      const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) jsonText = jsonMatch[1];
      const parsed = JSON.parse(jsonText.trim());
      return parsed.noticias || parsed;
    } catch (e) {
      console.error('Falha ao parsear feed de notícias:', e);
      return [];
    }
  },

  // Update market data using Claude API with detailed per-source prompts
  async updateMarketData(progressCallback) {
    const sources = this.getActiveSources('dados');
    const results = {};

    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      if (progressCallback) {
        progressCallback(`Analisando ${source.nome}... (${i + 1}/${sources.length})`);
      }

      try {
        const sourcePrompt = this._getSourcePrompt(source);
        const analysis = await TBO_API.call(
          sourcePrompt,
          `Forneça a análise mais recente de ${source.nome} sobre o mercado imobiliário. Foco: ${source.foco || 'mercado imobiliário Curitiba/PR'}. Use dados dos últimos 6 meses.`,
          { maxTokens: 1500, temperature: 0.4 }
        );
        results[source.nome] = {
          analise: analysis.text,
          fonte: source.url,
          foco: source.foco,
          prioridade: source.prioridade || 99,
          atualizado: new Date().toISOString()
        };
      } catch (e) {
        results[source.nome] = { erro: e.message, fonte: source.url };
      }

      // Rate limiting — 1.5s between calls
      await new Promise(r => setTimeout(r, 1500));
    }

    // Store results
    this._results = results;
    this._lastUpdate = new Date().toISOString();

    if (progressCallback) progressCallback('Atualização concluída!');
    return results;
  },

  // Get cached results
  getResults() {
    return this._results;
  },

  getLastUpdate() {
    return this._lastUpdate;
  }
};
