# TBO OS — Relatorio de 200+ Melhorias

**Data**: 2026-02-20
**Versao**: v2.1.0
**Analise**: 4 agentes paralelos, 94 arquivos JS, ~65K linhas
**Total**: 265 itens identificados

---

## Resumo por Prioridade

| Prioridade | Qtd | Descricao |
|------------|-----|-----------|
| **P0 - Critico** | 28 | Bugs de seguranca, XSS, data loss, falhas de tenant isolation |
| **P1 - Importante** | 79 | Performance, UX quebrada, validacao, error handling |
| **P2 - Desejavel** | 104 | Code quality, acessibilidade, mobile, duplicacao |
| **P3 - Baixa** | 54 | Polish, refinamentos cosmeticos, edge cases |

## Resumo por Categoria

| Categoria | Qtd |
|-----------|-----|
| Security/XSS | 52 |
| Performance | 44 |
| UX | 49 |
| Code Quality | 36 |
| Data/Persistence | 22 |
| Accessibility | 20 |
| Features | 24 |
| Mobile | 10 |
| Architecture | 8 |

## Resumo por Esforco

| Tamanho | Qtd | Tempo |
|---------|-----|-------|
| S (Small) | 102 | < 30 min cada |
| M (Medium) | 116 | 1-4 horas |
| L (Large) | 32 | 1-2 dias |
| XL (Extra Large) | 15 | 3+ dias |

---

## P0 — CRITICOS (28 itens)

### Security & XSS

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 1 | rh.js | PostgREST filter injection em `_loadTeamFromSupabase()` — `_filterSearch` interpolado direto em `.or()` sem sanitizar chars especiais (%, parenteses) | M |
| 2 | projetos.js | `onclick` handler injeta `p.id` direto em inline JS string em `_renderProjectCard()` — XSS se IDs tiverem aspas | S |
| 3 | projetos.js | `onchange` em `_renderTasks()` constroi inline JS com task ID sem sanitizar | S |
| 4 | projetos.js | `.replace(/'/g, "\\\\'")` insuficiente em `_renderTasks()` — backslash sequences podem quebrar o string literal | M |
| 5 | mercado.js | render injeta `n.url`, `n.source`, `n.summary`, `n.title` de RSS/AI direto em innerHTML sem escaping — conteudo externo nao confiavel | M |
| 6 | mercado.js | `e.message` em catch injetado raw em innerHTML | S |
| 7 | inteligencia-imobiliaria.js | render() injeta `n.titulo`, `n.resumo`, `n.fonte`, `n.insight_tbo`, `n.tags` direto em innerHTML sem escaping | M |
| 8 | inteligencia-imobiliaria.js | `_curadoriaPrompt` renderizado raw dentro de `<pre>` tag | S |
| 9 | auth.js | `_renderUserMenu` injeta `user.avatarUrl` em `src=` sem validar URL (deve comecar com `https://`) | S |
| 10 | auth.js | `_renderUserMenu` e `_renderSidebarUser` injetam `user.name` e `user.roleLabel` em innerHTML sem escaping | S |
| 11 | comercial.js | `_renderDealCard` chama `_escapeHtml(deal.name)` global — se funcao nao carregada, deal names renderizam sem sanitizar | S |

### Data Integrity & Tenant Isolation

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 12 | pessoas-avancado.js | Dados HR criticos (pulse surveys, succession plans, benefits TCO) armazenados APENAS em localStorage — risco de data loss | L |
| 13 | chat.js | `_loadAllUsers()` query ALL profiles SEM `tenant_id` filter — expoe usuarios cross-tenant | S |
| 14 | admin-portal.js | `_loadData()` query tabela `tenants` sem filtro — SELECT * expoe dados de todos workspaces | S |
| 15 | clientes.js | CRM data (interactions, contacts) em localStorage (`tbo_clients_custom`) sem Supabase | L |
| 16 | supabase.js | `loadIntegrationKeys()` armazena API keys em localStorage como plaintext — qualquer XSS expoe todas as credenciais | L |

### Auth & Permissions

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 17 | permissions.js | Lista `_superAdmins` hardcoded no JS client-side — visivel no DevTools | M |
| 18 | admin-portal.js | Sem check de role em render() — qualquer usuario pode ver o admin portal se souber a rota | S |
| 19 | configuracoes.js | API keys exibidas em password fields mas valores reais presentes no DOM via `TBO_API.getApiKeyFor()` | M |
| 20 | people-profile.js | `_isAdmin()` retorna `true` se TBO_AUTH undefined — fails open em vez de closed | S |
| 21 | permissoes-config.js | `_saveEdit()` atualiza profiles diretamente sem verificacao RLS | M |

### Performance & Architecture

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 22 | index.html | 60+ `<script defer>` tags carregam JS individuais — overhead massivo de HTTP requests | XL |
| 23 | error-monitor | TBO_ERROR_MONITOR captura erros mas nunca mostra feedback ao usuario — modulo com erro fica branco sem recovery | M |
| 24 | cross-module | _esc() helper duplicado em 10+ modulos — deve consolidar em utility unico | M |

### Fake Data in Production

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 25 | people-profile.js | `_renderProjects()` usa dados HARDCODED fake em vez de Supabase real | L |
| 26 | people-profile.js | `_renderDevelopment()` usa `Math.random()` para barras de PDI — dados falsos a cada render | L |
| 27 | people-profile.js | `_renderActivity()` gera timeline SIMULADA com datas fake — rotulado "Audit log from Supabase" mas nunca carrega dados reais | L |
| 28 | clientes.js | `_buildClientList()` usa string matching O(n*m) sem tenant isolation | M |

---

## P1 — IMPORTANTES (79 itens)

### Security & Validation

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 29 | projetos.js | Nomes de projetos finalizados sem `_escapeHtml()` na tab Finalizados | S |
| 30 | projetos.js | Service tag names sem `_escapeHtml()` nos `<span>` do card | S |
| 31 | contratos.js | Nome do contrato sem escaping em 4 locais (tabela, detalhe, expiring, header) | S |
| 32 | contratos.js | `c.notes` renderizado raw em `<p>` tag sem escaping — stored XSS | S |
| 33 | pipeline.js | Deal name sem escaping em kanban e tabela (2 locais) | S |
| 34 | financeiro.js | Inline onfocus/onblur handlers em template literals — violar CSP | M |
| 35 | rh.js | `_handleContextAction` usa prompt() sem sanitizar input nem validar length | S |
| 36 | mercado.js | `ic.contexto` de TBO_STORAGE renderizado sem escape no context-banner-text | S |
| 37 | mercado.js | `n.url` injetado em href sem validar URL — potential javascript: protocol | S |
| 38 | pessoas-avancado.js | `_submitPulse` usa `_currentUserId()` sem validacao — pulse pode ser enviado para qualquer user | M |
| 39 | pessoas-avancado.js | `_renderChurn` exibe `r.signals` e `person.name` sem escaping | M |
| 40 | onboarding-wizard.js | CNPJ aceita texto livre sem mask ou validacao de formato | S |
| 41 | onboarding-wizard.js | `_saveCurrentStep` le form values sem nenhuma validacao — nome vazio, CNPJ invalido passam | M |
| 42 | admin-onboarding.js | Fallback _escapeHtml usa funcao identidade `(s) => s` se global nao carregada | S |
| 43 | cultura.js | `_savePage()` pega tenantId de localStorage em vez de `TBO_SUPABASE.getCurrentTenantId()` | S |
| 44 | cultura.js | Content sections renderizam `d.conteudo.manifesto`, `d.missao.texto` sem XSS sanitization | M |
| 45 | inteligencia-imobiliaria.js | Usa CORS proxy publico `api.allorigins.win` — terceiro pode interceptar/modificar response | M |

### Performance

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 46 | projetos.js | `TBO_ERP.calculateHealthScore()` chamado 3x por projeto por render — deve computar 1x e cachear | M |
| 47 | projetos.js | Sort por health/tasks chama funcoes caras no comparator — pre-computar Map | M |
| 48 | tarefas.js | `_refreshLists()` destroi DOM inteiro e rebinda todos eventos a cada filtro | L |
| 49 | tarefas.js | `new Date()` criado dentro do sort comparator de overdue — garbage collection desnecessario | S |
| 50 | rh.js | `_ensureSeedData()` 120+ linhas de dados hardcoded escritos no localStorage — lazy load de JSON | L |
| 51 | contratos.js | `_getContracts()` faz JSON.parse do localStorage em cada chamada sem cache | S |
| 52 | comercial.js | `_autoSeedPipeline(context)` roda a cada render — wasted CPU | S |
| 53 | inteligencia-imobiliaria.js | Filter click re-renderiza modulo inteiro via innerHTML | M |
| 54 | storage.js | `_warmErpCache()` faz SELECT * em 7 tabelas sem LIMIT — vai degradar com crescimento | M |
| 55 | workload.js | `getWeeklyUtilization()` itera task list 2x — unificar em single pass | S |
| 56 | command-center.js | `_renderWidgetContent()` chama generateAlerts() e getActionsToday() sem memoization | M |
| 57 | inteligencia.js | `_computeAll()` 230 linhas recomputando 40+ metricas a cada render sem cache | M |
| 58 | admin-portal.js | `_setupSubModule` chama .setup() em TODOS sub-modulos mesmo tabs inativas | S |

### UX

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 59 | tarefas.js | Status options hardcoded em `_openTaskDetail()` em vez de TBO_ERP.stateMachines | M |
| 60 | tarefas.js | Priority options hardcoded em vez de TBO_CONFIG.business.priorities | S |
| 61 | tarefas.js | Cria DOM elements (drawer + backdrop) mas nunca remove do DOM — acumula orphan nodes | S |
| 62 | financeiro.js | Division by zero se `fc.meta_vendas_mensal` e monthlyTarget forem 0 — NaN na progress bar | S |
| 63 | comercial.js | Kanban sem limite de deals por coluna — 50+ deals torna inutilizavel | M |
| 64 | rh.js | Tabela com min-width:950px — scroll horizontal sem indicador em tablets | S |
| 65 | project-workspace.js | `_loadProject()` sincrono bloqueia render em projetos grandes | M |
| 66 | timesheets.js | `_refresh()` destroi DOM inteiro — scroll position perdida, modals fecham | M |
| 67 | command-center.js | Drag-and-drop declarado (draggable=true) mas sem handlers implementados | L |
| 68 | chat.js | Sem edicao/delecao de mensagens — usuarios nao podem corrigir typos | L |
| 69 | configuracoes.js | Settings armazenados apenas em localStorage — sem sync entre devices | L |
| 70 | permissoes-config.js | Sem confirmacao antes de mudar role de usuario | M |

### Reliability

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 71 | auth.js | Auto-provisioning hardcoda tenant_id UUID como fallback — novo usuario vai para tenant errado | M |
| 72 | auth.js | `loginWithGoogle()` nunca reseta estado do botao se popup bloqueado | S |
| 73 | permissions.js | `loadPermissionsMatrix()` 3 queries sem timeout — se RPC nao existe, `canDo()` fallback silencioso | M |
| 74 | supabase.js | `processSyncQueue()` sem retry logic — erro transiente descarta operacao | M |
| 75 | scraper.js | AI response parsed com regex — JSON malformado retorna `[]` silenciosamente | S |
| 76 | academy-catalogo.js | `_enroll` chama `client.auth.getUser()` sem null-check do client | S |
| 77 | academy-catalogo.js | `_enroll` nao inclui `tenant_id` no insert — missing multi-tenant isolation | M |
| 78 | onboarding-wizard.js | `_complete` faz upsert com undefined values — pode sobrescrever valores existentes | M |
| 79 | storage.js | `_saveToLocalStorage` engole quota errors silenciosamente | M |
| 80 | timesheets.js | `_showStartTimerModal()` usa setTimeout 100ms para bind — race condition em devices lentos | S |

### Data

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 81 | trilha-aprendizagem.js | PDI data apenas em localStorage — sem sync com Supabase, perda ao limpar cache | L |
| 82 | comercial.js | CRM deals em localStorage via TBO_STORAGE — sem Supabase persistence | XL |
| 83 | clientes.js | Sem Supabase persistence para CRM fields — sales_owner, relationship_status, interactions | XL |
| 84 | workload.js | Magic numbers `salary * 1.7 / (hours * 4.33)` com R$50/h fallback — deve ser config | M |
| 85 | news-proxy.js | Rate limiter em memoria reseta em cada cold start — efetivamente nao funcional | M |
| 86 | inteligencia.js | LTV divide por `churnRate/100` com fallback 0.15 arbitrario — LTV misleading | M |
| 87 | comercial.js | `_autoSeedPipeline` hardcoda owner='Ruy' — deve usar current user | S |
| 88 | admin-onboarding.js | 2 queries sequenciais em `_carregarDados()` — poderiam ser view unica | M |

### Accessibility

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 89 | tarefas.js | Task table falta role="grid" e aria-selected — screen readers nao navegam | M |
| 90 | financeiro.js | Checkboxes sem `<label>` ou aria-label — screen readers nao identificam | S |
| 91 | contratos.js | Modal sem focus trap — Tab move focus para background | M |
| 92 | app.js | Sidebar usa role="menubar" incorretamente — deve ser role="navigation" | M |

### Architecture

| # | Modulo | Descricao | Esforco |
|---|--------|-----------|---------|
| 93 | vercel.json | CSP inclui `'unsafe-inline'` para script-src e style-src — nega protecao XSS | L |
| 94 | index.html | Sem garantia de ordem de carregamento CDN vs app scripts — se CDN lento, singletons undefined | M |
| 95 | auth.js | Session expiration removida em v2.1 — depende apenas de autoRefreshToken sem validacao periodica | M |
| 96 | cross-module | Event listeners adicionados em init() mas nunca removidos em destroy() — memory leak | M |
| 97 | dark-mode | Sem `prefers-color-scheme: dark` auto-detection no first load | M |
| 98 | scraper.js | updateMarketData() faz N chamadas Claude sequenciais sem cache diario — custo API | M |
| 99 | cross-module | Sem module lifecycle destroy() para limpar listeners — leaks cross-route | L |
| 100 | trilha-aprendizagem.js | Monolito 1600+ linhas — deve split em sub-modulos | XL |
| 101 | news-proxy.js | CORS fallback retorna `ALLOWED_ORIGINS[0]` se origin nao match — qualquer request sem Origin recebe header | S |
| 102 | scraper.js | Dados de mercado injetados em system prompt do Claude — prompt injection se dados contaminados | M |
| 103 | chat.js | `_getTenantId()` le de sessionStorage como fallback — pode ser spoofed | M |
| 104 | cultura.js | `culture_pages` query sem `tenant_id` filter — cross-tenant exposure | S |
| 105 | permissions.js | `_defaultUserRoles` hardcoda fallback por username — user 'marco' ganha founder | M |
| 106 | cross-module | Sem PWA/Service Worker — app nao funciona offline apesar de ter localStorage caches | L |
| 107 | cross-module | Sem offline indicator bar quando conexao cai — writes falham silenciosamente | M |

---

## P2 — DESEJAVEIS (104 itens)

### Code Quality (36)
- `_getTeamMembers()` duplicado em projetos/tarefas/comercial — extrair para utility
- `_fmt()` e `_formatDate()` duplicados em contratos/pipeline — mover para TBO_FORMATTER
- `_esc()` com 3-5 implementacoes diferentes (createElement, regex, conditional)
- RSS parsing duplicado entre mercado.js e inteligencia-imobiliaria.js
- News deduplication duplicada entre mercado.js e inteligencia-imobiliaria.js
- `_refresh()` pattern (innerHTML + init) duplicado em 7+ modulos
- `_autoSeedPipeline()` 100+ linhas de seeding que roda a cada render
- `_genId()` com Date.now() nao garante uniqueness em chamadas rapidas — usar crypto.randomUUID()
- rh.js `_esc()` fallback retorna string raw — derrota o proposito
- Inline styles excessivos em trilha-aprendizagem.js (30+ por card)
- `_renderMemberCard` 115 linhas de template com 5 niveis de ternario
- Dead code em configuracoes.js — 5 `_renderIntegrationCard_*` identicos
- Console.log/warn/debug excessivos — 45+ calls com dados sensiveis em producao
- `_toSupabaseRow()` hardcoda nullable fields em Set — drift risk
- `_fromSupabaseRow()` usa if-chains manuais por entity type
- news-proxy `_extractSourceFromUrl()` mapa finito de hostnames
- app.js `_escHtml()` triplica implementacao de escape
- app.js module registration 45 linhas de typeof ternaries
- app.js `_bindSidebar()` 94 linhas monoliticas
- admin-portal `_esc()` com 3-way fallback inconsistente
- pipeline.js `_refresh()` mesmo anti-pattern de full re-render
- inteligencia.js `_computeAll()` 230 linhas monoliticas
- configuracoes.js `_getStyles()` CSS inline string — deve ser externo
- styles.css breakpoints inconsistentes (768/700/900/1024/1100/1200)
- Sem unit tests para logica de negocio (churn scoring, XP, deal filtering)
- `_rerender()` pattern deveria ser mixin shared
- Capacity config em localStorage sem Supabase sync
- inteligencia-imobiliaria nome conflita com TBO_INTELIGENCIA
- command-center `_esc()` mais uma duplicata
- financeiro `_renderExpenseBar()` util deveria ser shared
- Multiple localStorage keys sem registry central
- Escape key handlers adicionados mas nao removidos em permissoes-config
- `getCurrentTenantId()` tenta localStorage + sessionStorage — source-of-truth fragmentado
- project-workspace inline styles em `_getStyles()` re-injetado a cada render
- admin-onboarding print styles inline no render()
- comercial.js sanitizacao inconsistente `_escapeHtml` + `TBO_FORMATTER.truncate`

### UX (24)
- projetos.js grid-6 KPIs cramped em telas < 1200px
- tarefas.js board cards sem keyboard drag alternative
- tarefas.js context menu height estimation nao conta dividers
- tarefas.js setTimeout duplo em `_closeTaskDetail()` — stale ESC handlers
- financeiro.js `<input type="number">` sem step="1" — permite centavos fracionarios
- financeiro.js AI scenario chips com data-query strings 100+ chars em attributes
- comercial.js `relativeTime` nunca auto-refresh — "2 minutos" fica por horas
- contratos.js services field aceita comma-separated text — deveria ser tag input
- contratos.js ticketMedio NaN se todos valores = 0
- pipeline.js "+N mais" sem click handler — dead end
- pipeline.js toast mostra stage ID raw em vez de label traduzido
- auth.js `_showLoginError` some apos 4s fixos — deveria persistir ate proximo attempt
- dark-mode toggle animation cria overlay z-99999 que interfere com modals
- Loading skeletons inconsistentes — maioria dos modulos sem loading state
- Form validation sem highlight visual nos campos invalidos
- Toast stacking — 5+ toasts simultaneos obscurecem UI
- onboarding-wizard Skip pula sem salvar dados preenchidos
- onboarding-wizard progress bar labels wrap mal em mobile
- academy-catalogo `_rerender` pode causar loop infinito de re-render
- academy-catalogo sem pagination — 100+ cursos renderizam todos
- carga-trabalho sem auto-refresh — dados ficam stale
- Tab switching usa display:none sem animacao
- Scroll horizontal sem affordance visual em tabelas
- Weekly grid table sem scroll shadow indicators

### Accessibility (14)
- projetos.js kanban sem ARIA role="region" e aria-label
- tarefas.js board drag-and-drop mouse-only
- rh.js organograma sem keyboard focusable e ARIA tree role
- project-workspace tabs sem role="tab" e aria-selected
- pipeline.js modal sem aria-modal="true" e role="dialog"
- academy-catalogo cards clicaveis sem role="button" e tabindex
- trilha-aprendizagem tab bar sem ARIA tab pattern
- pessoas-avancado pulse mood selector emojis sem ARIA labels
- carga-trabalho barras de cor sem alternativa textual — daltonicos
- timesheets botao delete usa "x" sem aria-label
- configuracoes toggle switches sem labels visibles
- comercial kanban cards sem aria-grabbed
- index.html emoji Unicode sem alt text
- prefers-reduced-motion cobre apenas subset de animacoes

### Mobile (10)
- projetos.js kanban sem touch scroll indicators
- tarefas.js board columns min-width:260px overflow em mobile
- contratos.js tabela overflow horizontal sem affordance
- financeiro.js quarterly chart hardcoded 160px — muito pequeno em touch
- comercial.js funnel labels ilegíveis em mobile
- pipeline.js kanban columns sem responsive breakpoint
- onboarding-wizard steps inline wrap mal em mobile
- timesheets weekly grid sem scroll hint
- clientes.js sem pagination — todos cards de uma vez
- capacidade.js sem visual indicator para overrides ativos

### Features (20)
- contratos.js sem contract versioning ou audit log
- pipeline.js sem form validation alem de empty name
- rh.js sem bulk actions (select multiple para mudar BU/role)
- comercial.js sem won/lost split view ou win/loss analysis
- financeiro.js cash flow sem undo/redo
- academy-catalogo sem course detail view
- academy-catalogo `_progressPct` sempre 0%
- pessoas-avancado sociograma e flat list — falta graph visualization
- pessoas-avancado `_renderFerias` e `_renderFeedbackPDP` possivelmente stubs
- onboarding-wizard contextual tour mencionado no header mas nao implementado
- chat.js sem message threading (replies)
- chat.js sem read receipts alem de last_read_at
- chat.js sem offline message queue
- configuracoes sem password change ou 2FA management
- configuracoes sem avatar upload — depende apenas do Google SSO
- cultura.js sem markdown support no editor
- cultura.js sem page versioning
- inteligencia.js sem drill-down de KPIs para modulo relevante
- command-center sem widget minimize/collapse
- clientes.js sem CSV export
- permissoes-config sem audit log de mudancas de role
- workload data export (CSV/PDF)

---

## P3 — BAIXA PRIORIDADE (54 itens)

(Listagem resumida — refinamentos cosmeticos, edge cases, polish)

- rh.js context menu width hardcoded 200px
- tarefas.js sub-subtasks nao renderizam em hierarquia
- tarefas.js draggedId closure race condition teorica
- projetos.js `_renderTimesheetTab` raw string slicing para datas
- pipeline.js total > 5 hardcoded inconsistente com config limit
- contratos.js seeded contracts sem periodo (startDate/endDate vazios)
- inteligencia-imobiliaria seeds com datas hardcoded 2026-02-20
- mercado.js _categorizeByTitle sem shared logic com inteligencia-imobiliaria
- auth.js sem rate limit client-side em tentativas de login
- auth.js login form sem aria-describedby para erros
- permissions.js `getModulesForUser()` 50+ linhas complex branching sem tests
- permissions.js roles duplicam listas de modulos — usar composicao
- storage.js `_loadExternalAPIs()` bloqueia evento ate timeout de 10s
- supabase.js `uploadFile()` upsert:false pode falhar em re-upload
- news-proxy.js parseRSSItems regex fragil para edge cases XML
- news-proxy.js cache 15min — considerar 1 hora para noticias nao-urgentes
- workload.js timer cross-midnight nao split em 2 entries
- workload.js `checkForgottenTimers()` sem check periodico proativo
- workload.js capacity config deveria sync com Supabase
- carga-trabalho tab switching sem animacao
- timesheets scroll horizontal sem visual indicator
- index.html duplicate preconnect tags
- index.html sem PWA manifest
- index.html CDN versions pinned — schedule quarterly update
- styles.css 10K+ linhas em arquivo unico — split em core/modules/dark-mode
- vercel.json sem cache para assets estaticos (imagens, fontes, SVGs)
- CSP sem report-uri para monitorar violacoes
- financeiro.js label "Receita proj:" ambigua (mix realized + projected)
- projetos.js triple typeof check pattern — usar optional chaining
- projetos.js sem keyboard shortcut Alt+T para timer
- comercial.js seed ID collision risk (apenas 2 chars random)
- academy-catalogo `_esc()` createElement per call — ineficiente
- pessoas-avancado churn scoring weights arbitrarios sem calibracao
- pessoas-avancado sociogram O(n^2) nao escala para 50+ membros
- rh.js FOUC ao substituir seed data por dados Supabase
- configuracoes Notion integration "Em breve" placeholder
- mercado.js sem bookmark/save para artigos importantes
- inteligencia-imobiliaria sem sentiment analysis automatizada
- cultura sem search no conteudo
- command-center quotes motivacionais hardcoded — carregar de Supabase
- chat sem virtual scrolling para 500+ messages
- chat sem offline message queue
- configuracoes sem locale selector (hardcoded PT-BR)
- scraper.js 8 prompts hardcoded 200+ linhas — externalizar para JSON
- toast stacking sem deduplication
- console noise — 45+ calls com dados sensiveis
- console log wrapper com log levels (debug/info/warn/error)
- data export para workload/timesheets
- realtime updates para timesheets/carga-trabalho
- cross-module no code splitting ou lazy loading
- i18n preparation (string extraction, pt-BR.json)
- form fields sem highlight visual de validacao
- inteligencia.js "Dados 2025/2026" hardcoded — usar fiscal year dinamico
- inteligencia.js inadimplencia usa dados de fevereiro fixo

---

## Plano de Execucao Recomendado

### Sprint Imediato (1-2 dias) — 30 fixes P0/P1 size S
Corrigir todos os XSS de escaping ausente, tenant_id filters, fails-open auth checks.

### Sprint 2 (1 semana) — 20 fixes P1 size M
Performance (cache health score, pre-compute sorts), reliability (retry logic, error boundaries), validation.

### Sprint 3 (2 semanas) — P0/P1 size L/XL
Migrar localStorage data critica para Supabase (clientes, comercial, pulse surveys, PDI).
People-profile com dados reais. Bundle JS com Vite/esbuild.

### Sprint 4+ — P2/P3 progressivo
Acessibilidade, mobile, code dedup, features faltantes.

---

*Gerado automaticamente por analise de codebase com 4 agentes paralelos.*
*265 itens identificados em 94 arquivos JS (~65K linhas).*
