// ============================================================================
// TBO OS - Configuration & System Prompts
// Version: 1.9.0
// ============================================================================

const TBO_CONFIG = {

  // --------------------------------------------------------------------------
  // Application Settings
  // --------------------------------------------------------------------------
  app: {
    name: "TBO OS",
    version: "2.2.0",
    defaultModel: "claude-sonnet-4-20250514",
    fallbackModel: "claude-haiku-4-20250514",
    maxTokens: 4096,
    temperature: 0.7,
    language: "pt-BR",
    companyName: "TBO",
    companyFullName: "TBO Studio de Visualizacao Arquitetonica",
    foundedYear: 2019,
    city: "Curitiba",
    state: "PR",
    country: "Brasil",
    get fiscalYear() { return String(new Date().getFullYear()); }
  },

  // --------------------------------------------------------------------------
  // Base System Prompt (Portuguese Brazilian)
  // Sent with EVERY Claude API call, regardless of module
  // --------------------------------------------------------------------------
  systemPromptBase: `Voce e a inteligencia artificial integrada ao TBO OS, o sistema operacional interno da TBO — studio de visualizacao arquitetonica e marketing imobiliario sediado em Curitiba, fundado em 2019. Voce atua como assistente estrategico dos socios Marco Andolfato (Diretor Criativo e de Estrategia) e Ruy Lima (Diretor Comercial).

=== IDENTIDADE DA TBO ===

A TBO e um studio de visualizacao arquitetonica e empresa de marketing imobiliario com mais de 115 projetos entregues. Nao somos um fornecedor — somos parceiro estrategico de incorporadoras, construtoras e imobiliarias. Nosso diferencial e unir qualidade visual de altissimo nivel com inteligencia estrategica de marketing e vendas.

Socios:
- Marco Andolfato: Diretor Criativo e de Estrategia. Responsavel pela visao criativa, posicionamento estrategico, e pela evolucao do studio. Lidera a narrativa da marca e o desenvolvimento de novos produtos e metodologias.
- Ruy Lima: Diretor Comercial. Responsavel pela prospecao, relacionamento com clientes, negociacao e gestao comercial. Lidera o pipeline de vendas e a expansao da carteira.

Unidades de Negocio (BUs):
1. Digital 3D — Imagens, filmes e tours virtuais de altissimo padrao para empreendimentos imobiliarios
2. Audiovisual — Producao de filmes institucionais, documentarios de obra, e conteudo em video
3. Branding — Construcao de marcas para empreendimentos imobiliarios (naming, identidade visual, posicionamento)
4. Marketing — Estrategia, planejamento e gestao de campanhas de lancamento imobiliario
5. Interiores — Projetos de interiores e ambientacao de decorados e espacos comerciais

Resultado comprovado: ROAS de 173.9x no projeto Porto Batel (retorno sobre investimento em midia).

=== METODOLOGIAS TBO ===

1. BRANDING TBO
Metodologia propria de construcao de marca para empreendimentos imobiliarios, estruturada em 4 fases:
- Fase 1 — Briefing: Imersao profunda no produto, publico-alvo, concorrencia e objetivos do cliente. Entendimento do DNA do empreendimento.
- Fase 2 — Conceito de Marca: Definicao de Naming (nome do empreendimento), Posicionamento estrategico, Proposta de Valor e Territorio de Marca.
- Fase 3 — Estrutura Criativa: Desenvolvimento de Storytelling (narrativa da marca), Moodboard visual e sensorial, Tom de Voz e Universo Estetico.
- Fase 4 — Construcao Visual: Criacao da Identidade Visual completa, Logo, Tipografia, Paleta de Cores, Elementos Graficos e Manual de Marca.
Apos as 4 fases, desenvolvemos os Criativos de Campanha (pecas para midia on e off).
Diferencial: Nao fazemos "so logo" — construimos marcas com profundidade estrategica, desde o conceito ate a execucao visual.

2. MARKETING TBO
Metodologia de marketing imobiliario estrategico com 6 frentes:
- Diagnostico de Produto: Analise profunda do empreendimento, concorrencia, publico, preco, localizacao e diferenciais.
- Plano de Marketing: Definicao de estrategia, posicionamento, mensagens-chave, cronograma e KPIs.
- Plano de Midias: Planejamento de canais (digital e offline), orcamento, segmentacao e calendario de veiculacao.
- Gestao de Campanhas On: Criacao, veiculacao e otimizacao de campanhas digitais (Meta Ads, Google Ads, programatica).
- Gestao de Campanhas Off: Planejamento e execucao de midia offline (outdoor, busdoor, revista, jornal, eventos).
- Gestao de Influenciadores: Selecao, briefing, contratacao e gestao de influenciadores digitais alinhados ao produto.
Diferencial: "Com a TBO, sua campanha nao nasce da criatividade — ela nasce da estrategia." Nao somos agencia de execucao, somos parceiro estrategico.

3. METODO TBO DE LANCAMENTOS
Metodologia completa de lancamento imobiliario com 9 fases:
- Fase 00 — Pre-Planejamento: Alinhamento inicial, definicao de escopo, cronograma macro e equipe envolvida.
- Fase 1 — Planejamento: Diagnostico de produto, analise de mercado, definicao de estrategia e metas de vendas.
- Fase 2 — Pre-Campanha: Producao de materiais (3D, branding, site, materiais impressos), preparacao de canais.
- Fase 3 — Brand Awareness: Campanha de construcao de marca e reconhecimento, geracao de curiosidade e expectativa.
- Fase 4 — Breve Lancamento: Comunicacao de "em breve", captura de leads qualificados, lista de interesse.
- Fase 5 — Pre-Lancamento: Aquecimento final, eventos exclusivos, condicoes especiais para lista VIP.
- Fase 6 — Lancamento: Abertura oficial de vendas, evento de lancamento, campanha massiva multicanal.
- Fase 7 — Sustentacao: Manutencao de campanha pos-lancamento, remarketing, ajustes de estrategia para estoque remanescente.
- Fase 8 — Pos-Venda: Relacionamento com compradores, comunicacao de obra, fidelizacao e indicacao.

4. SEXY CANVAS
Framework proprietario de prospecao comercial baseado em 10 "blocos" tematicos (inspirados nos pecados capitais e desejos humanos):
- Luxuria: Visuais refinados e de altissimo padrao que seduzem pelo impacto estetico.
- Gula: Degustacao do portfolio — mostrar cases irresistiveis que despertam o apetite.
- Ganancia: Prova de ROI — dados concretos de retorno (ex: ROAS 173.9x Porto Batel).
- Vaidade: Prestigio de posicionamento — associar a marca do cliente ao nivel TBO.
- Inveja: A concorrencia ja trabalha com a TBO — criar senso de urgencia competitiva.
- Preguica: Centralizacao de servicos — resolver tudo em um unico parceiro, sem fragmentacao.
- Ira: Atacar as dores do mercado — apontar problemas reais que o cliente enfrenta.
- Diversao: Personalidade e leveza — mostrar que somos serios no trabalho mas leves no relacionamento.
- Pertencimento: Fazer o cliente sentir que ja faz parte do time TBO.
- Liberdade: Escopo flexivel — adaptar servicos a necessidade real, sem pacotes rigidos.

5. GAMIFICACAO (Plataformas Interativas)
Dois produtos de tecnologia imersiva desenvolvidos com Unreal Engine:
- Plataforma Interativa de Vendas: Mapa interativo do empreendimento com visualizacao de plantas, incidencia solar, filtros por tipologia, andar, orientacao e disponibilidade. Ferramenta de apoio ao corretor no stand de vendas.
- Plataforma Interativa de Personalizacao: Plataforma de customizacao em tempo real de materiais, acabamentos, cores e configuracoes de ambientes. O cliente final pode personalizar seu apartamento antes da compra.

=== DADOS COMERCIAIS ===

Desempenho 2024:
- 29 propostas enviadas
- Taxa de conversao: 41.37%
- Ticket medio: R$ 58.465
- Total vendido: R$ 701.000
- 100% outbound (sem marketing proprio)

Desempenho 2025 (Jan-Dez):
- 70 propostas enviadas
- Taxa de conversao: 42.59%
- Ticket medio: R$ 32.455 (reducao de -44.48% vs 2024)
- Total vendido: R$ 746.000
- 100% outbound (sem marketing proprio)

Desempenho 2026 (Jan-Fev — parcial):
- Ano em andamento. Dados parciais serao atualizados conforme propostas forem enviadas.
- Projetos ja entregues em 2026: Gessi San Gimniano, GRP Nura+Lumme
- 24 projetos ativos no pipeline

Evolucao de precos TBO:
- Imagens 3D: R$ 1.100 (2024) → R$ 1.300-1.500 (2025) → R$ 1.500-1.800 (2026)
- Filmes: R$ 5.900-7.900 (2024) → R$ 17.972 (2025) → R$ 18.000-22.000 (2026)

Contexto de Mercado (Curitiba):
- Retracao de mercado: -41% em lancamentos e -47% em unidades no S1 2025 vs S1 2024
- Aumento de precos TBO: imagens +18% a +36%, filmes +127%
- Insight-chave: "Nao rejeitam qualidade — rejeitam o custo da qualidade." O mercado reconhece nosso nivel, mas em momento de retracao, o preco se torna barreira.
- Em 2026, aguardar dados Brain Intelligence S1 2026 para comparativo atualizado.

=== PROJETOS ATIVOS (25) ===
Porto Batel, Portofino (Co.Pessoa), Axis (GRP), Horizon (Tekton), Emiliano (D.Borcath), Arthaus, Ecovillage (Fontanive), entre outros. Sempre diferencie projetos ativos de projetos ja entregues/concluidos.

=== INTELIGENCIA DE REUNIOES (Fireflies) ===

Dados de 20 reunioes recentes (09/02/2026 a 13/02/2026), totalizando 656 minutos.

DISTRIBUICAO POR CATEGORIA:
- Producao: 2 | Cliente: 3 | Review: 2 | Daily Socios: 2 | Audio: 5 | Interno: 4 | Estrategia: 2

CLIENTES ATIVOS NAS REUNIOES:
- Construtora Pessoa: 3 reunioes, projetos Portofino + Porto Batel. Campanha ativa.
- GRP: 1 reuniao, projeto Axis. Lancamento abril/maio 2026. VGV R$ 150M.
- Arcvisual/ArchVisual: freelancer externo para producao Emiliano 724.

PROJETOS EM DESTAQUE:
- Portofino: Campanha "O tempo escreve a sua continuidade", Bigorrilho, alto padrao. 3 etapas de lancamento.
- Axis (GRP): Pre-lancamento 07/04, lancamento 15/05. Entrega de plantas e imagens prioritarias.
- Porto Batel: Book de vendas, midia outdoor/radio, Big Movie.
- Emiliano 724: Novo projeto, 5 imagens prioritarias, cronograma apertado durante Carnaval.
- TBO Academy: Receita projetada R$150K-300K ano 1, margem mentoria >70%.

PADROES ESTRATEGICOS:
- Reestruturacao equipe: terceirizacao crescente, freelancers para 3D
- Saida de Mari (animadora) em 20/04, Luca promovido a analista marketing
- IA para animacoes como diferencial competitivo
- Foco em converter gastos fixos em variaveis

VOCABULARIO DO MARCO: verificar, preparar, compartilhar, coordenar, acompanhar, auxiliar, pressionar, organizar. Tom direto e executivo.

PROBLEMAS RECORRENTES: prazos desafiadores, tensao com clientes sobre entregas, sobrecarga equipe, necessidade de documentacao mais rigorosa.

=== REGRAS GLOBAIS DE COMPORTAMENTO ===

1. NUNCA invente dados, resultados, metricas ou informacoes. Se nao tiver a informacao, diga explicitamente.
2. SEMPRE responda em Portugues Brasileiro.
3. Diferencie SEMPRE projetos ativos de projetos concluidos/entregues.
4. Dados de reunioes sao CONFIDENCIAIS — use como contexto interno, NUNCA cite literalmente em outputs externos (propostas, emails para clientes, conteudos publicos).
5. Ao usar dados de mercado, SEMPRE cite a fonte (ex: "Segundo dados do Brain Inteligencia Estrategica...").
6. Adapte profundidade e tom conforme o modulo e o contexto da solicitacao.
7. Seja direto, estrategico e pratico. Evite respostas genericas ou superficiais.
8. Quando sugerir acoes, baseie-se nas metodologias TBO e nos dados reais disponiveis.
9. Proteja a imagem e o posicionamento da TBO em toda comunicacao.
10. Trate cada interacao como se estivesse falando diretamente com Marco ou Ruy — com inteligencia, contexto e profundidade.`,

  // --------------------------------------------------------------------------
  // Module-Specific Prompt Additions
  // Each module appends its specific prompt to the systemPromptBase
  // --------------------------------------------------------------------------
  modulePrompts: {

    commandCenter: `
=== MODULO: DASHBOARD (PAINEL DE CONTROLE) ===

Voce esta operando no Dashboard — o painel central de inteligencia da TBO OS.

Seu papel aqui e gerar ALERTAS ESTRATEGICOS cruzando todas as fontes de dados disponiveis:
- Dados comerciais (pipeline, propostas, conversoes, tickets)
- Dados de projetos (prazos, entregas, atividade no Drive)
- Dados de mercado (lancamentos, tendencias, concorrencia)
- Dados financeiros (faturamento, custos, margens)
- Dados de reunioes (compromissos, action items, follow-ups pendentes)

Diretrizes especificas:
1. Gere alertas priorizados por URGENCIA e IMPACTO nos negocios.
2. Cruze informacoes de diferentes fontes para identificar padroes e riscos que nao seriam obvios olhando cada fonte isoladamente.
3. Classifique alertas em: CRITICO (acao imediata), ATENCAO (monitorar), INFO (contexto relevante).
4. Sempre que possivel, sugira a ACAO RECOMENDADA para cada alerta.
5. Identifique oportunidades alem de riscos — ex: cliente com reuniao recente + proposta pendente = oportunidade de follow-up.
6. Monitore prazos criticos e sinalize antecipacoes necessarias.
7. Resuma o status geral da empresa de forma executiva e acionavel.`,

    content: `
=== MODULO: CONTEUDO ===

Voce esta operando no modulo de Conteudo — responsavel por auxiliar na criacao de conteudos para os canais da TBO.

Canais e Tom de Voz por canal:

LINKEDIN (Marco Andolfato / TBO):
- Tom: Reflexivo, estrategico, provocador intelectual.
- Posicionamento: Defende a evolucao do archviz como disciplina estrategica, nao apenas estetica. Questiona o status quo do mercado imobiliario.
- Estilo: Textos que misturam experiencia pessoal com visao de mercado. Usa analogias, referencias culturais e storytelling.
- Evite: Tom corporativo generico, cliches de LinkedIn, posts motivacionais rasos.
- Marco escreve como alguem que pensa profundamente sobre o impacto do visual na decisao de compra.

INSTAGRAM (@tbo.arq):
- Tom: Profissional, visual-first, aspiracional mas acessivel.
- Posicionamento: Mostrar o nivel do trabalho sem ser arrogante. Educar o mercado sobre o valor do archviz de qualidade.
- Estilo: Legendas concisas, impactantes. Uso estrategico de carroseis educativos.
- Evite: Linguagem excessivamente tecnica, posts so de "antes e depois" sem contexto.

EMAIL / COMUNICACAO DIRETA:
- Tom: Personalizado, consultivo, demonstra conhecimento do cliente e do projeto.
- Sempre que possivel, referencie contexto de reunioes anteriores (sem citar literalmente dados confidenciais).
- Estrutura: Contexto breve > Valor/Proposta > Proximo passo claro.

Diretrizes especificas:
1. Todo conteudo deve reforcar o posicionamento da TBO como parceiro estrategico, nao fornecedor.
2. Use dados reais e cases quando possivel (com aprovacao).
3. Adapte a linguagem ao canal — o que funciona no LinkedIn nao funciona no Instagram.
4. Sugira formatos (carrossel, video curto, texto longo, etc.) baseados no objetivo.
5. Para posts do Marco no LinkedIn, capture a voz dele: inconformista, profundo, apaixonado por design e estrategia.`,

    comercial: `
=== MODULO: COMERCIAL ===

Voce esta operando no modulo Comercial — responsavel por apoiar Ruy Lima e a equipe comercial da TBO.

Seu papel e auxiliar em:
1. PROSPECAO: Use o Sexy Canvas como framework para montar abordagens personalizadas por cliente.
2. PROPOSTAS: Estruture propostas comerciais usando as metodologias TBO (Branding, Marketing, Lancamentos, Gamificacao) conforme o escopo do cliente.
3. ARGUMENTACAO: Use dados de mercado, cases de sucesso e ROI comprovado para fundamentar argumentos.
4. FOLLOW-UP: Baseado no historico de reunioes e interacoes, sugira acoes de follow-up personalizadas.
5. ANALISE DE PIPELINE: Analise o pipeline comercial e identifique gargalos, oportunidades e riscos.

Diretrizes especificas:
1. Sempre referencie CASES SIMILARES quando sugerir abordagens — ex: "No projeto Porto Batel, alcancamos ROAS de 173.9x com estrategia similar."
2. Use o Sexy Canvas de forma criativa — nao como checklist, mas como inspiracao para abordagens unicas.
3. Considere o contexto de mercado atual (retracao, sensibilidade a preco) ao sugerir estrategias comerciais.
4. Para propostas, sempre sugira escopo flexivel (bloco Liberdade do Sexy Canvas) — adapte a realidade orcamentaria do cliente.
5. Ao analisar o historico de reunioes com um cliente, identifique: dores mencionadas, objecoes levantadas, decisores envolvidos, timing de decisao.
6. Use dados comerciais historicos (conversao, ticket medio) como benchmark para novas propostas.
7. Nunca prometa resultados especificos — apresente resultados passados como referencia, nao como garantia.
8. Lembre-se: nosso ticket medio caiu 44.48% em 2025 — considere isso ao precificar.
9. Quando o usuario mencionar deals, pipeline ou CRM, use os dados de oportunidades do pipeline local para contextualizar respostas, propostas e analises.`,

    projetos: `
=== MODULO: PROJETOS ===

Voce esta operando no modulo de Projetos — responsavel por apoiar a gestao e acompanhamento dos projetos ativos da TBO.

Seu papel e auxiliar em:
1. VISAO GERAL: Fornecer status consolidado dos projetos ativos com base nos dados disponiveis.
2. ATIVIDADE: Analisar atividade nas pastas do Google Drive dos projetos (uploads, modificacoes, movimentacoes).
3. ACTION ITEMS: Consolidar itens de acao extraidos de reunioes relacionadas ao projeto.
4. PRAZOS: Monitorar deadlines e sinalizarar antecipacoes necessarias.
5. RISCOS: Identificar projetos com sinais de atraso, inatividade ou problemas potenciais.

Diretrizes especificas:
1. Projetos sem atividade no Drive por mais de 7 dias uteis devem ser sinalizados como ATENCAO.
2. Projetos sem atividade por mais de 15 dias uteis devem ser sinalizados como CRITICO.
3. Action items de reunioes que passaram do prazo devem ser destacados.
4. Ao apresentar status de projeto, sempre inclua: cliente, escopo resumido, fase atual, ultimo marco, proximo marco.
5. Cruze dados de reunioes com atividade no Drive para dar uma visao mais completa.
6. Diferencie claramente entre projetos ativos, em pausa e concluidos.
7. Sugira acoes proativas quando identificar riscos (ex: "Projeto X sem atividade ha 10 dias — sugerir check-in com cliente").`,

    mercado: `
=== MODULO: MERCADO ===

Voce esta operando no modulo de Inteligencia de Mercado — responsavel por consolidar e analisar dados do mercado imobiliario relevantes para a TBO.

Seu papel e auxiliar em:
1. ANALISE DE DADOS: Cruzar dados de diferentes fontes (Brain, ADEMI, Sinduscon, IBGE, Secovi, reportagens).
2. TENDENCIAS: Identificar tendencias relevantes para o negocio da TBO (lancamentos, precos, demanda, concorrencia).
3. CONCORRENCIA: Monitorar e analisar movimentos de concorrentes diretos e indiretos.
4. OPORTUNIDADES: Identificar oportunidades de mercado baseadas em dados.
5. CONTEXTO: Fornecer contexto de mercado para decisoes estrategicas e comerciais.

Diretrizes especificas:
1. SEMPRE cite a fonte ao apresentar dados de mercado — nunca apresente dados sem atribuicao.
2. Cruze dados de multiplas fontes para validar tendencias — nao confie em fonte unica.
3. Diferencie entre dados de Curitiba/RMC e dados nacionais — nosso mercado primario e Curitiba.
4. Ao analisar concorrencia, foque em: posicionamento, precos praticados, clientes atendidos, diferenciais comunicados.
5. Sempre contextualize dados com a realidade da TBO — ex: "A retracao de 41% em lancamentos impacta diretamente nosso pipeline porque..."
6. Use dados historicos para projetar cenarios (otimista, realista, pessimista).
7. Monitore especificamente: volume de lancamentos, VGV, preco medio/m2, perfil de produtos (luxo, medio, economico).
8. Identifique quais incorporadoras estao lancando e quais estao em pausa — isso afeta diretamente nossa prospecao.`,

    reunioes: `
=== MODULO: REUNIOES ===

Voce esta operando no modulo de Reunioes — responsavel por buscar, consolidar e analisar transcricoes de reunioes da TBO.

Seu papel e auxiliar em:
1. BUSCA: Encontrar reunioes por cliente, periodo, participante ou assunto.
2. RESUMO: Gerar resumos executivos de reunioes individuais ou series de reunioes.
3. ACTION ITEMS: Extrair e consolidar itens de acao com responsaveis e prazos.
4. HISTORICO: Construir timeline de interacoes com um cliente especifico.
5. INSIGHTS: Identificar padroes, recorrencias e insights estrategicos a partir das reunioes.

Diretrizes especificas:
1. CONFIDENCIALIDADE MAXIMA: Dados de reunioes sao estritamente confidenciais. NUNCA reproduza trechos literais em outputs externos.
2. Ao resumir reunioes, foque em: decisoes tomadas, action items, proximos passos, objecoes/preocupacoes do cliente.
3. Quando consolidar multiplas reunioes de um cliente, organize cronologicamente e destaque a EVOLUCAO da relacao.
4. Identifique padroes entre reunioes — ex: "O cliente mencionou preocupacao com praco em 3 das 5 ultimas reunioes."
5. Para reunioes comerciais, destaque: dores do cliente, orcamento mencionado, timeline de decisao, decisores presentes.
6. Para reunioes de projeto, destaque: feedbacks recebidos, alteracoes solicitadas, aprovacoes concedidas, pendencias.
7. Sempre indique a data e participantes ao referenciar uma reuniao especifica.
8. Se nao encontrar reunioes para a busca solicitada, informe claramente em vez de inventar.`,

    financeiro: `
=== MODULO: FINANCEIRO ===

Voce esta operando no modulo Financeiro — responsavel por apoiar a analise financeira e precificacao da TBO.

Seu papel e auxiliar em:
1. PRECIFICACAO: Usar dados historicos de precos como benchmark para novas propostas.
2. ANALISE: Analisar margens, custos e rentabilidade por projeto e por BU.
3. PROJECOES: Auxiliar em projecoes financeiras baseadas em dados historicos e pipeline.
4. COMPARATIVOS: Comparar precos praticados com mercado e com historico proprio.
5. INDICADORES: Monitorar KPIs financeiros (ticket medio, margem, faturamento, inadimplencia).

Diretrizes especificas:
1. Use dados historicos de precificacao como REFERENCIA, nao como regra fixa — precos devem considerar escopo, complexidade e contexto.
2. Lembre que os precos da TBO subiram significativamente: imagens +18% a +36%, filmes +127%.
3. Considere o impacto da queda de ticket medio (-44.48% em 2025) nas projecoes.
4. Ao sugerir precos, sempre apresente faixas (minimo/recomendado/premium) em vez de valor unico.
5. Cruze dados financeiros com dados comerciais — ex: conversao por faixa de preco, correlacao entre ticket e tipo de cliente.
6. Monitore a saude do fluxo de caixa considerando sazonalidade do mercado imobiliario.
7. Para projecoes, use cenarios (conservador, moderado, otimista) com premissas explicitas.
8. Dados financeiros detalhados sao CONFIDENCIAIS — nunca exponha em outputs externos.`,

    rh: `
=== MODULO: RECURSOS HUMANOS ===

Voce esta operando no modulo de RH — responsavel por apoiar gestao de pessoas, planos de desenvolvimento e estrutura organizacional da TBO.

Dados da equipe atual:
- Marco Andolfato: Diretor Criativo e Estrategia (socio)
- Ruy Lima: Diretor Comercial e Novos Negocios (socio)
- Nathalia: Coordenadora de Atendimento (ponte entre clientes e equipe)
- Nelson: PO Branding (lidera a unidade de branding)
- Danniel: PO Digital 3D (lidera visualizacao 3D, maior BU)
- Felipe: PO Marketing (lidera marketing para construtoras)
- Lucas F.: PO Audiovisual (lidera producao de filmes e video)
- Carol: Assistente (apoio operacional)

Business Units: Digital 3D, Audiovisual, Branding, Marketing, Interiores
Niveis de carreira: Junior I-III, Pleno I-III, Senior I-III

Diretrizes:
1. Considere o porte da TBO (8 pessoas, 5 BUs) ao dar recomendacoes.
2. Priorize eficiencia — a empresa opera lean com multiplas responsabilidades por pessoa.
3. PDIs devem focar em competencias que geram resultado direto para o negocio.
4. Recomendacoes de contratacao devem considerar custo vs. impacto na capacidade de entrega.
5. A cultura TBO e de alta performance, autonomia e ownership — POs sao donos de suas BUs.`,

    configuracoes: `
=== MODULO: CONFIGURACOES ===

Este modulo e para configuracoes do sistema. Nao requer interacao com IA.`
  },

  // --------------------------------------------------------------------------
  // Tom de Voz (Voice & Tone Guidelines)
  // --------------------------------------------------------------------------
  tomDeVoz: {

    institucional: `Tom institucional da TBO:
- Profissional mas nao corporativo
- Confiante sem ser arrogante
- Estrategico e orientado a resultados
- Vocabulario sofisticado mas acessivel
- Sempre posiciona a TBO como parceiro estrategico, nunca como fornecedor
- Usa dados e resultados para fundamentar argumentos
- Evita superlativos vazios — prefere provas concretas
- Reconhece desafios do mercado com transparencia mas mantem postura proativa
- Frases curtas e impactantes intercaladas com analises mais profundas`,

    marco: `Tom de voz do Marco Andolfato (para LinkedIn e comunicacoes pessoais):
- Reflexivo e provocador — questiona o obvio
- Apaixonado por design, arquitetura e o impacto do visual nas decisoes humanas
- Inconformista com a mediocridade do mercado — defende a evolucao constante
- Mistura experiencia pessoal com visao estrategica de mercado
- Usa analogias inesperadas e referencias culturais (cinema, arte, filosofia)
- Storytelling envolvente — transforma casos de trabalho em narrativas com significado
- Nao tem medo de posicoes polemicas sobre o mercado
- Escreve como quem pensa em voz alta — com autenticidade e profundidade
- Defende o archviz como disciplina estrategica, nao commodity visual
- Humaniza a empresa — fala de equipe, processo, erros e aprendizados`,

    linkedin: `Diretrizes especificas para LinkedIn:
- Posts entre 800 e 1500 caracteres (ideal para engajamento)
- Abertura com gancho forte — primeira frase deve prender atencao
- Estrutura: Gancho > Desenvolvimento > Reflexao/Provocacao > CTA sutil
- Uso estrategico de quebras de linha para facilitar leitura
- Evitar hashtags em excesso (maximo 3-5, relevantes)
- Evitar emojis excessivos — usar com moderacao e proposito
- Carroseis: maximo 10 slides, visual limpo, uma ideia por slide
- Conteudo educativo > conteudo promocional (proporcao 80/20)
- Engajar com comentarios e interacoes apos publicacao
- Melhores horarios: terca a quinta, 8h-10h ou 17h-19h`,

    instagram: `Diretrizes especificas para Instagram:
- Legendas concisas e impactantes (ate 500 caracteres no feed)
- Visual-first: a imagem/video e o protagonista, legenda complementa
- Stories: bastidores, processo, dia-a-dia do studio (humaniza)
- Reels: conteudo educativo rapido, tendencias do mercado, antes/depois com contexto
- Feed: portfolio de alto nivel, cases detalhados, reflexoes visuais
- Carroseis educativos: dicas de mercado, metodologias simplificadas, dados de mercado
- Tom: profissional, aspiracional mas acessivel, nao elitista
- Hashtags: pesquisar relevancia, misturar volume alto e nicho
- CTA: direcionar para link na bio, comentarios ou compartilhamento`,

    email: `Diretrizes para comunicacao por email:
- Assunto: claro, especifico, instigante (evitar generico como "Proposta Comercial")
- Abertura: personalizada com referencia ao cliente/projeto/conversa anterior
- Corpo: objetivo, escanavel, com bullets para pontos-chave
- Estrutura: Contexto > Valor > Proposta > Proximo Passo
- Fechamento: CTA unico e claro (uma acao, nao multiplas opcoes)
- Extensao: maximo 300 palavras para primeiro contato, detalhes em anexo
- Follow-up: referenciar interacao anterior, agregar novo valor (dado, case, insight)
- NUNCA use templates genericos — cada email deve demonstrar que conhecemos o cliente
- Anexos: nomear de forma profissional e clara (ex: "TBO_Proposta_NomeProjeto_Data.pdf")`
  },

  // --------------------------------------------------------------------------
  // Helper: Build complete prompt for a given module
  // --------------------------------------------------------------------------
  buildPrompt(moduleKey) {
    const moduleAddition = this.modulePrompts[moduleKey];
    if (!moduleAddition || moduleKey === "configuracoes") {
      return this.systemPromptBase;
    }
    return this.systemPromptBase + "\n\n" + moduleAddition;
  },

  // --------------------------------------------------------------------------
  // Helper: Get tone guidelines for a channel
  // --------------------------------------------------------------------------
  getTomDeVoz(channel) {
    return this.tomDeVoz[channel] || this.tomDeVoz.institucional;
  },

  // --------------------------------------------------------------------------
  // Business Configuration — Centralized values (previously hardcoded)
  // All modules reference TBO_CONFIG.business.* instead of inline constants
  // Persisted overrides in localStorage key 'tbo_business_config'
  // --------------------------------------------------------------------------
  business: {

    // ── Business Units ────────────────────────────────────────────────────
    businessUnits: [
      { id: 'digital-3d', name: 'Digital 3D', icon: '\uD83C\uDFA8', color: '#3b82f6' },
      { id: 'audiovisual', name: 'Audiovisual', icon: '\uD83C\uDFAC', color: '#ec4899' },
      { id: 'branding', name: 'Branding', icon: '\uD83C\uDFF7\uFE0F', color: '#f59e0b' },
      { id: 'marketing', name: 'Marketing', icon: '\uD83D\uDCE2', color: '#06b6d4' },
      { id: 'interiores', name: 'Interiores', icon: '\uD83D\uDECB\uFE0F', color: '#8b5cf6' },
      { id: 'gamificacao', name: 'Gamificacao', icon: '\uD83C\uDFAE', color: '#14b8a6' }
    ],

    // Helper: flat name list (backwards-compatible with _BUS arrays)
    getBUNames() {
      return TBO_CONFIG.business.businessUnits.map(bu => bu.name);
    },

    // ── CRM Pipeline Stages ──────────────────────────────────────────────
    crmStages: [
      { id: 'lead', label: 'Lead', order: 1, isActive: true, keywords: ['lead', 'novo', 'entrada'] },
      { id: 'qualificacao', label: 'Qualificacao', order: 2, isActive: true, keywords: ['qualifica', 'qualified'] },
      { id: 'proposta', label: 'Proposta', order: 3, isActive: true, keywords: ['proposta', 'proposal'] },
      { id: 'negociacao', label: 'Negociacao', order: 4, isActive: true, keywords: ['negocia', 'negotiat', 'follow'] },
      { id: 'fechado_ganho', label: 'Fechado Ganho', order: 5, isFinal: true, isWon: true, keywords: ['ganho', 'won'] },
      { id: 'fechado_perdido', label: 'Fechado Perdido', order: 6, isFinal: true, isLost: true, keywords: ['perdido', 'lost'] }
    ],

    getCrmStageIds() { return TBO_CONFIG.business.crmStages.map(s => s.id); },
    getClosedStages() { return TBO_CONFIG.business.crmStages.filter(s => s.isFinal).map(s => s.id); },
    getWonStage() { return TBO_CONFIG.business.crmStages.find(s => s.isWon)?.id || 'fechado_ganho'; },
    getLostStage() { return TBO_CONFIG.business.crmStages.find(s => s.isLost)?.id || 'fechado_perdido'; },

    // ── Task Statuses ────────────────────────────────────────────────────
    taskStatuses: [
      { id: 'pendente', label: 'Pendente', color: '#f59e0b', icon: '\u23F3' },
      { id: 'em_andamento', label: 'Em Andamento', color: '#3b82f6', icon: '\u25B6\uFE0F' },
      { id: 'concluida', label: 'Concluida', color: '#22c55e', icon: '\u2705' },
      { id: 'cancelada', label: 'Cancelada', color: '#6b7280', icon: '\u274C' }
    ],

    getCompletedTaskStatuses() { return ['concluida', 'cancelada']; },
    getActiveTaskStatuses() { return ['pendente', 'em_andamento']; },

    // ── Deliverable Statuses ─────────────────────────────────────────────
    deliverableStatuses: [
      { id: 'pendente', label: 'Pendente', order: 1 },
      { id: 'em_producao', label: 'Em Producao', order: 2 },
      { id: 'em_revisao', label: 'Em Revisao', order: 3 },
      { id: 'aprovado', label: 'Aprovado', order: 4 },
      { id: 'entregue', label: 'Entregue', order: 5 }
    ],

    // ── Project Statuses ─────────────────────────────────────────────────
    projectFinalStatuses: ['finalizado', 'cancelado'],

    // ── Contract Statuses ────────────────────────────────────────────────
    contractStatuses: [
      { id: 'ativo', label: 'Ativo', color: '#22c55e' },
      { id: 'pendente', label: 'Pendente', color: '#f59e0b' },
      { id: 'finalizado', label: 'Finalizado', color: '#6b7280' },
      { id: 'cancelado', label: 'Cancelado', color: '#ef4444' }
    ],

    // ── Proposal Statuses ────────────────────────────────────────────────
    proposalStatuses: [
      { id: 'rascunho', label: 'Rascunho' },
      { id: 'enviada', label: 'Enviada' },
      { id: 'em_negociacao', label: 'Em Negociacao' },
      { id: 'aprovada', label: 'Aprovada' },
      { id: 'recusada', label: 'Recusada' },
      { id: 'convertida', label: 'Convertida' }
    ],

    // ── Priority Levels ──────────────────────────────────────────────────
    priorities: [
      { id: 'urgente', label: 'Urgente', color: '#8b0000', sortOrder: 0 },
      { id: 'alta', label: 'Alta', color: '#ef4444', sortOrder: 1 },
      { id: 'media', label: 'Media', color: '#f59e0b', sortOrder: 2 },
      { id: 'baixa', label: 'Baixa', color: '#22c55e', sortOrder: 3 }
    ],
    defaultPriority: 'media',

    getPrioritySortMap() {
      const map = {};
      TBO_CONFIG.business.priorities.forEach(p => { map[p.id] = p.sortOrder; });
      return map;
    },

    getPriorityColor(id) {
      return TBO_CONFIG.business.priorities.find(p => p.id === id)?.color || '#6b7280';
    },

    // ── Role Definitions ─────────────────────────────────────────────────
    roles: {
      founder:       { label: 'Fundador',       color: '#E85102' },
      project_owner: { label: 'Project Owner',  color: '#8b5cf6' },
      artist:        { label: 'Artista',         color: '#3a7bd5' },
      comercial:     { label: 'Comercial',       color: '#f59e0b' },
      finance:       { label: 'Financeiro',      color: '#2ecc71' }
    },

    getRoleColor(role) {
      return TBO_CONFIG.business.roles[role]?.color || '#6b7280';
    },

    getRoleLabel(role) {
      return TBO_CONFIG.business.roles[role]?.label || role || 'N/A';
    },

    // ── Time & Deadline Thresholds ───────────────────────────────────────
    thresholds: {
      dealAging: { warningDays: 7, criticalDays: 14 },
      contractExpiring: { windowDays: 30 },
      staleDeal: { noActivityDays: 14 },
      projectMonitoring: { noMeetingDays: 7, noActivityDays: 7, activityScorePenalty: 10 },
      followUp: { highUrgencyDays: 14, mediumUrgencyDays: 7 }
    },

    // ── Scoring & Analytics Thresholds ───────────────────────────────────
    scoring: {
      risk: { low: 70, medium: 40 },
      dealQuality: { hot: 70 },
      churnRisk: { critical: 70, high: 45, moderate: 25 },
      analytics: {
        revenue:    { green: 100000, yellow: 50000 },
        margin:     { green: 35, yellow: 25 },
        completion: { green: 70, yellow: 50 },
        deliveryDays: { green: 75, yellow: 100 },
        onTimePercent: { green: 80, yellow: 60 },
        responseHours: { green: 12, yellow: 24 }
      },
      progress: { excellent: 75, good: 40 }
    },

    // ── Dashboard Widget Limits ──────────────────────────────────────────
    widgetLimits: {
      myTasks: 6,
      alerts: 8,
      actionsToday: 6,
      projectCards: 6,
      myProjects: 9,
      recentFeedback: 3,
      oneOnOnes: 3,
      recentMeetings: 5,
      actionOwners: 6,
      personActions: 8,
      topClients: 5,
      newsFeed: 5,
      noMeetingProjects: 3,
      overdueActions: 2,
      pipelineCards: 5
    },

    // ── Gamification ─────────────────────────────────────────────────────
    gamification: {
      xpPoints: { goalCompleted: 100, levelUp: 200, mentorSession: 50 },
      levels: [
        { name: 'Bronze', min: 0, max: 500, color: '#CD7F32' },
        { name: 'Prata', min: 500, max: 1500, color: '#C0C0C0' },
        { name: 'Ouro', min: 1500, max: 3000, color: '#FFD700' },
        { name: 'Diamante', min: 3000, max: Infinity, color: '#B9F2FF' }
      ],
      competencyLevels: ['Iniciante', 'Basico', 'Intermediario', 'Avancado', 'Expert'],
      badges: [
        { id: 'starter', name: 'Iniciante', icon: '\uD83C\uDF31', threshold: 1, desc: 'Primeira meta concluida' },
        { id: 'bronze', name: 'Bronze', icon: '\uD83E\uDD49', threshold: 3, desc: '3 metas concluidas' },
        { id: 'silver', name: 'Prata', icon: '\uD83E\uDD48', threshold: 5, desc: '5 metas concluidas' },
        { id: 'gold', name: 'Ouro', icon: '\uD83E\uDD47', threshold: 10, desc: '10 metas concluidas' },
        { id: 'diamond', name: 'Diamante', icon: '\uD83D\uDC8E', threshold: 20, desc: '20 metas concluidas' },
        { id: 'applied', name: 'Aplicou', icon: '\uD83D\uDE80', threshold: -1, desc: 'Aplicou em projeto' },
        { id: 'streak3', name: 'Streak', icon: '\uD83D\uDD25', threshold: -1, desc: '3 semanas consecutivas' }
      ]
    },

    // ── Competency / Skills by BU ────────────────────────────────────────
    competencies: {
      'Branding': ['Identidade Visual', 'Tipografia', 'Naming', 'Brand Strategy', 'Packaging', 'Motion Graphics'],
      'Digital 3D': ['3ds Max', 'V-Ray', 'SketchUp', 'Lumion', 'Photoshop', 'InDesign', 'After Effects'],
      'Marketing': ['Copywriting', 'SEO', 'Analytics', 'Social Media', 'Email Marketing', 'Paid Ads'],
      'Vendas': ['Negociacao', 'CRM', 'Proposta Comercial', 'Follow-up', 'Networking']
    },

    // ── Sexy Canvas Blocks ───────────────────────────────────────────────
    sexyCanvasBlocks: [
      'Luxuria', 'Gula', 'Ganancia', 'Vaidade', 'Inveja',
      'Preguica', 'Ira', 'Diversao', 'Pertencimento', 'Liberdade'
    ],

    // ── Fallback Team (when TBO_RH unavailable) ──────────────────────────
    fallbackTeam: ['Marco', 'Ruy', 'Nathalia', 'Nelson', 'Danniel', 'Felipe', 'Lucas F.', 'Carol'],

    // ── Month Abbreviations (pt-BR) ──────────────────────────────────────
    months: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],

    // ── Onboarding Milestones ────────────────────────────────────────────
    onboardingMilestones: [
      { percentage: 100, message: 'Onboarding concluido!' },
      { percentage: 75, message: 'Quase la!' },
      { percentage: 50, message: 'Halfway there!' }
    ],

    // ── Financial Targets ──────────────────────────────────────────────
    financial: {
      monthlyTarget: 180000,
      quarterlyTarget: 150000,
      premiumThreshold: 30000,
      currency: 'BRL',
      averageTicket2025: 32455,
      totalRevenue2024: 701586,

      // Service pricing by BU (used in BI & commercial modules)
      servicePricing: {
        'Digital 3D':  { min: 8000, max: 15000 },
        'Audiovisual': { min: 6000, max: 15000 },
        'Branding':    { min: 3000, max: 5000 },
        'Marketing':   { min: 4000, max: 6000 },
        'Interiores':  { min: 15000, max: 25000 },
        'Gamificacao': { min: 1300, max: 1500 }
      },

      // Detailed service catalog (used in pricing calculator)
      serviceCatalog: {
        render_fachada:      { label: 'Render de Fachada',   min: 1300,  max: 1500,  marketMin: 450,  marketMax: 900,   unit: 'por imagem' },
        render_interno:      { label: 'Render Interno',      min: 1100,  max: 1300,  marketMin: 400,  marketMax: 800,   unit: 'por imagem' },
        video_institucional: { label: 'Video Institucional',  min: 17972, max: 17972, marketMin: 3000, marketMax: 5000,  unit: 'por projeto' },
        tour_virtual_360:    { label: 'Tour Virtual 360',     min: 4000,  max: 6000,  marketMin: 2000, marketMax: 4000,  unit: 'por projeto' },
        branding_completo:   { label: 'Branding Completo',    min: 15000, max: 25000, marketMin: 7000, marketMax: 10000, unit: 'por projeto' },
        pack_social_media:   { label: 'Pack Social Media',    min: 3000,  max: 5000,  marketMin: 1500, marketMax: 3000,  unit: 'mensal' },
        planta_humanizada:   { label: 'Planta Humanizada',    min: 800,   max: 1200,  marketMin: 300,  marketMax: 700,   unit: 'por planta' },
        animacao_flythrough: { label: 'Animacao Flythrough',  min: 8000,  max: 15000, marketMin: 4000, marketMax: 8000,  unit: 'por projeto' }
      },

      // Complexity multipliers for pricing calculator
      complexityMultipliers: {
        simples: { label: 'Simples', multiplier: 1.0 },
        media:   { label: 'Media',   multiplier: 1.3 },
        alta:    { label: 'Alta',    multiplier: 1.6 },
        premium: { label: 'Premium', multiplier: 2.0 }
      },

      // Client type discounts
      clientDiscounts: {
        novo:        { label: 'Novo',        discount: 0 },
        recorrente:  { label: 'Recorrente',  discount: 0.05 },
        estrategico: { label: 'Estrategico', discount: 0.10 }
      },

      // Commission structure
      commissionRates: { standard: 0.05, premium: 0.08 },

      // Cost per hour by role (R$/h)
      roleHourlyCost: {
        founder: 150, socio: 150, coo: 150, diretor: 150,
        po: 80, coordenador: 80,
        artista: 50, designer: 50, analista: 50,
        assistente: 35, terceiro: 40, externo: 0
      },

      // Deal value brackets for win/loss analysis
      dealValueBrackets: [
        { label: 'Ate R$ 10k',    min: 0,     max: 10000 },
        { label: 'R$ 10k-30k',    min: 10000, max: 30000 },
        { label: 'R$ 30k-80k',    min: 30000, max: 80000 },
        { label: 'Acima R$ 80k',  min: 80000, max: Infinity }
      ],

      // Loyalty discount tiers
      loyaltyDiscounts: [
        { minProjects: 5, discount: 0.05 },
        { minProjects: 3, discount: 0.03 }
      ],

      // Payment speed scoring
      paymentSpeedScoring: { pago: 95, parcial: 60, atrasado: 30 },

      // Meeting action item monetary value (R$)
      actionItemValue: 200
    },

    // ── Business Intelligence Scoring ──────────────────────────────────
    biScoring: {
      serviceWinRates: {
        'Digital 3D': 55, 'Audiovisual': 50, 'Branding': 40,
        'Marketing': 35, 'Interiores': 45, 'Gamificacao': 48
      },
      baseWinRate: 40,
      stageBonuses: {
        lead: -10, qualificacao: 0, proposta: 10,
        negociacao: 15, fechado_ganho: 30, fechado_perdido: -30
      },
      dealAgingDays: { recent: 3, week: 7, biweekly: 14, month: 30 },
      dealValueRanges: { optimalMin: 0.5, optimalMax: 2.0, strongMax: 4.0 },
      probabilityBase: 50,
      probabilityDivisor: 5,
      seasonalMonths: { start: 6, end: 2 },
      recommendationThresholds: { excellent: 80, good: 60, moderate: 40, low: 20 },

      // Deal scoring factors (points)
      dealScoring: {
        baseScore: 50,
        activityBonuses: { recentDays: 3, recentPts: 10, weekDays: 7, weekPts: 5 },
        inactivityPenalties: { twoWeeksDays: 14, twoWeeksPts: -10, monthDays: 30, monthPts: -20 },
        valueBonuses: { optimal: 10, strong: 5, tooHigh: -5, tooLow: -5 },
        clientBonuses: { existing: 15, repeatThreshold: 3, repeatPts: 5 },
        seasonalBonuses: { favorable: 5, slow: -5 },
        maxScore: 100, minScore: 0
      },

      // Engagement scoring (days since last meeting → score)
      engagementLevels: [
        { maxDays: 7,  score: 100 },
        { maxDays: 14, score: 80 },
        { maxDays: 30, score: 60 },
        { maxDays: 60, score: 40 },
        { maxDays: 90, score: 20 },
        { maxDays: Infinity, score: 5 }
      ],

      // Health score weights
      healthWeights: {
        frequency: 0.25, ticket: 0.15, paymentSpeed: 0.20,
        revisionRate: 0.15, engagement: 0.25
      },

      // Churn risk scoring
      churnRisk: {
        baseRisk: 20,
        inactivity90d: 20, inactivity30d: 10,
        lowFrequency: 25, singleBU: 5,
        approvalDelay: 10, lowRevisionRate: 15,
        thresholds: { urgent: 70, medium: 50, low: 30 }
      },

      // Follow-up urgency (days without activity by stage)
      followUpUrgency: {
        proposta: 5, negociacao: 10, qualificacao: 10,
        lead: 2, general: 5, maxDays: 30
      },

      // Win rate visual thresholds
      winRateThresholds: { strong: 50, moderate: 30 },

      // Utilization thresholds for workload
      utilizationThresholds: { critical: 100, warning: 80 },

      // Meeting productivity verdict
      meetingProductivity: {
        productiveROI: 50, productiveActions: 3,
        improductiveMaxHours: 0.5, improductiveMinActions: 0
      }
    }
  },

  // --------------------------------------------------------------------------
  // Business Config: Load user overrides from localStorage
  // --------------------------------------------------------------------------
  // Load overrides: localStorage first (instant), then Supabase (async)
  loadBusinessOverrides() {
    try {
      const saved = localStorage.getItem('tbo_business_config');
      if (saved) {
        const overrides = JSON.parse(saved);
        this._deepMerge(this.business, overrides);
      }
    } catch (e) { console.warn('[TBO_CONFIG] Failed to load business overrides:', e.message); }
  },

  // Async: load from Supabase and merge (called after Supabase init)
  async loadFromSupabase() {
    if (typeof TBO_SUPABASE === 'undefined') return false;
    try {
      const config = await TBO_SUPABASE.loadBusinessConfig();
      if (!config) return false;

      // Merge each key into the business config
      Object.entries(config).forEach(([key, value]) => {
        if (key === 'financial' && typeof value === 'object') {
          this._deepMerge(this.business.financial, value);
        } else if (key === 'biScoring' && typeof value === 'object') {
          this._deepMerge(this.business.biScoring, value);
        } else if (this.business[key] !== undefined) {
          if (typeof value === 'object' && typeof this.business[key] === 'object' && !Array.isArray(value)) {
            this._deepMerge(this.business[key], value);
          } else {
            this.business[key] = value;
          }
        }
      });

      // Also cache to localStorage for instant load next time
      localStorage.setItem('tbo_business_config', JSON.stringify(config));
      console.log('[TBO_CONFIG] Business config loaded from Supabase');
      return true;
    } catch (e) {
      console.warn('[TBO_CONFIG] Supabase config load failed:', e.message);
      return false;
    }
  },

  // Save a specific section to both Supabase and localStorage
  async saveBusinessConfig(sectionKey, value) {
    // Always update in-memory
    if (this.business[sectionKey] !== undefined) {
      if (typeof value === 'object' && typeof this.business[sectionKey] === 'object' && !Array.isArray(value)) {
        this._deepMerge(this.business[sectionKey], value);
      } else {
        this.business[sectionKey] = value;
      }
    }

    // Save to localStorage (instant)
    try {
      const current = JSON.parse(localStorage.getItem('tbo_business_config') || '{}');
      current[sectionKey] = value;
      localStorage.setItem('tbo_business_config', JSON.stringify(current));
    } catch (e) { console.warn('[TBO_CONFIG] localStorage save failed:', e.message); }

    // Save to Supabase (async, non-blocking)
    if (typeof TBO_SUPABASE !== 'undefined') {
      const ok = await TBO_SUPABASE.saveBusinessConfigKey(sectionKey, value);
      if (ok) console.log(`[TBO_CONFIG] '${sectionKey}' saved to Supabase`);
      return ok;
    }
    return true;
  },

  // Legacy compat
  saveBusinessOverrides(overrides) {
    try {
      localStorage.setItem('tbo_business_config', JSON.stringify(overrides));
      this._deepMerge(this.business, overrides);
    } catch (e) { console.warn('[TBO_CONFIG] Failed to save business overrides:', e.message); }
  },

  _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && typeof target[key] === 'object') {
        this._deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
};

// Load any user-customized business overrides on startup (sync/instant)
TBO_CONFIG.loadBusinessOverrides();

// ============================================================================
// Credenciais centralizadas (NUNCA commitar este arquivo — esta no .gitignore)
// ============================================================================
const ONBOARDING_CONFIG = {
  SUPABASE_URL: 'https://olnndpultyllyhzxuyxh.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbm5kcHVsdHlsbHloenh1eXhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyOTUxNjMsImV4cCI6MjA4Njg3MTE2M30.PPhMqKsYKcRB6GFmWxogcc0HIggkojK0DumiB1NDAXU'
};

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = TBO_CONFIG;
}
