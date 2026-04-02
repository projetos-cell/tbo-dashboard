@echo off
REM ===================================================
REM TBO OS — Plataforma Operacional da TBO
REM Launcher com Servidor Local + Roadmap de Fases
REM ===================================================
REM
REM ╔══════════════════════════════════════════════════╗
REM ║   CLAUDE CODE: LEIA ESTE BLOCO AO INICIAR       ║
REM ╚══════════════════════════════════════════════════╝
REM
REM Este arquivo contem o roadmap completo do TBO OS.
REM Se a conversa anterior quebrou, o usuario vai pedir:
REM "Analise o .bat para saber os proximos passos"
REM
REM DIRETORIO DO PROJETO: C:\Users\WIN10\Desktop\TBO_OS
REM
REM ===================================================
REM DOCUMENTACAO COMPLETA DAS FASES
REM ===================================================
REM Os arquivos .md com instrucoes detalhadas de cada
REM fase estao em: C:\Users\WIN10\Desktop\TBO_OS\docs\
REM
REM  docs\TBO_OS_Guia.md   — Visao geral e sequencia
REM  docs\TBO_OS_Fase1.md  — Estrutura, UI, Sidebar, Config
REM  docs\TBO_OS_Fase2.md  — Coleta Drive + Notion
REM  docs\TBO_OS_Fase3.md  — Coleta Fireflies (Reunioes)
REM  docs\TBO_OS_Fase4.md  — Mercado + Command Center + Intel Mercado
REM  docs\TBO_OS_Fase5.md  — Conteudo e Redacao + Comercial
REM  docs\TBO_OS_Fase6.md  — Projetos + Reunioes + Financeiro
REM  docs\TBO_OS_Fase7.md  — Busca global, integracao, polimento
REM
REM ===================================================
REM STATUS DAS FASES (atualizado automaticamente)
REM ===================================================
REM
REM FASE 1 — Fundacao, UI, Sidebar, Config ...... [CONCLUIDA]
REM   Arquivos: index.html, styles.css, app.js, config.js
REM   Modulos: modules/configuracoes.js (funcional)
REM   Demais modulos: placeholders
REM   Utils: api.js, storage.js, scraper.js, search.js, formatter.js
REM   Data: context-data.json, market-data.json, sources.json
REM
REM FASE 2 — Coleta Drive + Notion .............. [CONCLUIDA]
REM   context-data.json preenchido com:
REM   - 25 projetos ativos, projetos finalizados (2020-2026)
REM   - 27 clientes/construtoras
REM   - Metodologias: branding, marketing, lancamentos, sexy canvas
REM   - Dados comerciais: 2024/2025/2026 com precos e evolucao
REM   - Equipe, produtos, regras de negocio
REM   Notion databases: Projetos, Regras, Produtos, Demandas, Pessoas
REM   Paginas: Branding, Marketing, Metodo Lancamentos, Sexy Canvas,
REM            Relatorio Comercial, Gamificacao
REM
REM FASE 3 — Coleta Fireflies ................... [CONCLUIDA]
REM   Conta: marco@agenciatbo.com.br (admin, 3222 min)
REM   20 reunioes mais recentes coletadas (09/02 a 13/02/2026)
REM   meetings-data.json: 177KB, 20 reunioes, 656 min, 193 action items
REM   Categorias: producao(2), cliente(3), review(2), daily(2), audio(5), interno(4), estrategia(2)
REM   Projetos: Porto Batel, Portofino, Axis, Emiliano, Alles Blau, Amaran, etc.
REM   Clientes: Construtora Pessoa, GRP, Arcvisual
REM   config.js: secao INTELIGENCIA DE REUNIOES adicionada
REM   app.js: indicador Fireflies verde com contagem
REM   configuracoes.js: secao Fireflies com detalhes e botoes
REM
REM FASE 4 — Mercado + Command Center ........... [CONCLUIDA]
REM   market-data.json — preenchido com indicadores CWB e RM
REM   news-data.json — noticias geradas via Claude API (localStorage)
REM   sources.json — 8 fontes de dados + 4 fontes de noticias configuradas
REM   scraper.js — reescrito com prompts detalhados por fonte (Claude API proxy)
REM   modules/mercado.js — REESCRITO como pagina de noticias:
REM     4 KPIs, news feed com filtros por categoria, tendencias,
REM     consulta IA, fontes de dados, busca de noticias via API
REM   modules/command-center.js — REESCRITO completo:
REM     4 KPIs (projetos, finalizados, reunioes 7d, action items),
REM     alertas estrategicos (estaticos + IA com cache 1h),
REM     briefing da semana (modal), news feed resumido,
REM     layout 2 colunas com sidebar (reunioes, actions, mercado, comercial)
REM
REM FASE 5 — Conteudo e Redacao + Comercial ..... [CONCLUIDA]
REM   modules/conteudo.js — FUNCIONAL com 5 tabs:
REM     LinkedIn, Instagram, Email/Comunicacao, Institucional, TBO Academy
REM     Tom de voz por canal, selecao de projeto/cliente, historico
REM   modules/comercial.js — FUNCIONAL com 4 tabs:
REM     Gerador de Proposta, Prospecao (Sexy Canvas), Cases, Calculadora
REM     KPIs comerciais, contexto de cliente, historico
REM
REM FASE 6 — Projetos + Reunioes + Financeiro ... [CONCLUIDA]
REM   modules/financeiro.js — REESCRITO com dashboard rico:
REM     6 KPIs, funnel comparativo, step charts, analysis cards, quick chips
REM   modules/projetos.js — FUNCIONAL com 4 tabs:
REM     Ativos (filtro+detalhe), Finalizados (por ano), Prep Reuniao, Relatorio
REM   modules/reunioes.js — FUNCIONAL com 4 tabs:
REM     Lista (filtro texto+categoria), Busca Inteligente, Action Items (por pessoa), Analise Relacionamento
REM     Corrigido: formato dual de dados (meetings/reunioes_recentes)
REM
REM FASE 7 — Busca global, integracao, polimento [NAO INICIADA]
REM   Ler docs\TBO_OS_Fase7.md para instrucoes completas
REM
REM ===================================================
REM MELHORIAS JA APLICADAS (FORA DO PLANO ORIGINAL)
REM ===================================================
REM
REM styles.css: +250 linhas de componentes CSS novos
REM   .bar-chart-h, .price-range-track, .price-range-marker,
REM   .step-chart, .step-bar, .quick-chips, .quick-chip,
REM   .trend-grid, .trend-card, .analysis-grid, .analysis-card,
REM   .source-grid, .source-card, .funnel-vis, .funnel-step,
REM   .mini-progress, .context-banner, .comparison-group
REM
REM TBO_OS.bat: Reescrito com servidor local
REM   (Python > py launcher > Node.js npx > fallback direto)
REM
REM ===================================================
REM RESUMO PARA CLAUDE CODE — PROXIMOS PASSOS
REM ===================================================
REM
REM AO RETOMAR, FACA NA SEGUINTE ORDEM:
REM
REM 1. FASE 7 (Polimento):
REM    - Ler docs\TBO_OS_Fase7.md
REM    - Busca global Alt+K (utils\search.js) — ja funcional basico
REM    - Links cruzados entre modulos
REM    - Polimento visual, responsividade, testes
REM    - Review geral de todos os modulos
REM
REM ===================================================
REM ARQUIVOS-CHAVE DO PROJETO
REM ===================================================
REM
REM  index.html          — Pagina principal (SPA)
REM  styles.css          — Design system (~3900 linhas)
REM  app.js              — Roteamento, sidebar, status, init
REM  config.js           — System prompts e configuracoes
REM  modules\
REM    command-center.js  — [PRONTO] Dashboard principal (KPIs, alertas, briefing, news)
REM    conteudo.js        — [PRONTO] Conteudo e Redacao (5 tabs, tom de voz, historico)
REM    comercial.js       — [PRONTO] Comercial e Propostas (4 tabs, KPIs, Sexy Canvas)
REM    projetos.js        — [PRONTO] Gestao de Projetos (ativos, finalizados, prep, relatorio)
REM    mercado.js         — [PRONTO] Intel. de Mercado (noticias, tendencias, consulta IA)
REM    reunioes.js        — [PRONTO] Reunioes e Contexto (lista, busca, actions, analise)
REM    financeiro.js      — [PRONTO] Financeiro (reescrito com dashboard rico)
REM    configuracoes.js   — [PRONTO] Configuracoes
REM  data\
REM    context-data.json  — [PREENCHIDO] Projetos, metodos, equipe
REM    meetings-data.json — [PREENCHIDO] 20 reunioes Fireflies (177KB)
REM    market-data.json   — [PREENCHIDO] Indicadores de mercado
REM    news-data.json     — [GERADO VIA API] Noticias (localStorage)
REM    sources.json       — [PREENCHIDO] 8+4 fontes configuradas
REM  utils\
REM    api.js             — Wrapper Claude API com streaming
REM    scraper.js         — [REESCRITO] Scraper com prompts por fonte
REM    search.js          — [FUNCIONAL] Busca global (projetos, clientes, reunioes, mercado)
REM    storage.js         — Gerenciamento localStorage
REM    formatter.js       — Formatacao (moeda, %, data, markdown)
REM  docs\
REM    TBO_OS_Guia.md     — Guia geral de execucao
REM    TBO_OS_Fase1.md    — Instrucoes Fase 1
REM    TBO_OS_Fase2.md    — Instrucoes Fase 2
REM    TBO_OS_Fase3.md    — Instrucoes Fase 3
REM    TBO_OS_Fase4.md    — Instrucoes Fase 4
REM    TBO_OS_Fase5.md    — Instrucoes Fase 5
REM    TBO_OS_Fase6.md    — Instrucoes Fase 6
REM    TBO_OS_Fase7.md    — Instrucoes Fase 7
REM
REM ===================================================
REM DESIGN SYSTEM
REM ===================================================
REM Tema: Industrial-Editorial escuro
REM Accent: #E85102 (Pantone 1655 C) — laranja TBO
REM Fundo: #0F0F0F, Cards: #1A1A1A, Bordas: #2A2A2A
REM Fonte heading: Playfair Display
REM Fonte body: Source Sans Pro
REM Grid: .grid-2, .grid-3, .grid-4 responsivo
REM Modulos usam: render() -> HTML, init() -> bind events
REM Roteamento: hash-based (#mercado, #financeiro, etc)
REM
REM ===================================================
REM CONEXOES EXTERNAS DISPONIVEIS (MCP TOOLS)
REM ===================================================
REM Fireflies: fireflies_get_transcripts, fireflies_fetch,
REM   fireflies_get_summary, fireflies_search
REM Notion: notion-fetch, notion-search, notion-create-pages,
REM   notion-update-page, notion-get-users
REM Browser: Chrome automation tools
REM
REM ===================================================
REM FIM DO ROADMAP — INICIO DO LAUNCHER
REM ===================================================

title TBO OS — Servidor Local
color 0A

echo.
echo  ======================================================
echo           TBO OS — Plataforma Operacional
echo  ======================================================
echo.
echo  Status das Fases:
echo    [OK] Fase 1 — Fundacao, UI, Config
echo    [OK] Fase 2 — Dados Drive + Notion
echo    [OK] Fase 3 — Fireflies (20 reunioes coletadas)
echo    [OK] Fase 4 — Mercado + Command Center
echo    [OK] Fase 5 — Conteudo + Comercial
echo    [OK] Fase 6 — Projetos + Reunioes + Financeiro
echo    [  ] Fase 7 — Polimento
echo.

set "PORT=3000"
set "DIR=%~dp0"

REM --- Tenta Python 3 ---
where python >nul 2>nul
if %ERRORLEVEL%==0 (
    echo  [OK] Python encontrado. Iniciando servidor na porta %PORT%...
    echo  [--] Acesse: http://localhost:%PORT%
    echo  [--] Pressione Ctrl+C para encerrar.
    echo.
    start "" "http://localhost:%PORT%"
    cd /d "%DIR%"
    python -m http.server %PORT%
    goto :EOF
)

REM --- Tenta Python via py launcher ---
where py >nul 2>nul
if %ERRORLEVEL%==0 (
    echo  [OK] Python (py) encontrado. Iniciando servidor na porta %PORT%...
    echo  [--] Acesse: http://localhost:%PORT%
    echo  [--] Pressione Ctrl+C para encerrar.
    echo.
    start "" "http://localhost:%PORT%"
    cd /d "%DIR%"
    py -m http.server %PORT%
    goto :EOF
)

REM --- Tenta npx (Node.js) com http-server ---
where npx >nul 2>nul
if %ERRORLEVEL%==0 (
    echo  [OK] Node.js encontrado. Iniciando servidor na porta %PORT%...
    echo  [--] Acesse: http://localhost:%PORT%
    echo  [--] Pressione Ctrl+C para encerrar.
    echo.
    cd /d "%DIR%"
    npx -y http-server -p %PORT% -c-1 -o
    goto :EOF
)

REM --- Fallback: abre direto no browser ---
echo  [!!] Nenhum servidor encontrado (Python ou Node.js).
echo  [--] Abrindo diretamente no navegador...
echo  [--] Para live reload, instale Python: https://python.org
echo.
start "" "%DIR%index.html"
