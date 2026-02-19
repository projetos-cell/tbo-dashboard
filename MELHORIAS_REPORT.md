# TBO OS — Relatorio de Autoanalise & Melhorias

**Data**: 18-19/02/2026
**Versao**: TBO OS v2.x (pos-onboarding)
**Autor**: Claude Code (autoanalise automatica)

---

## PARTE -1: Backlog — Melhorias Aplicadas (19/02/2026)

### Backlog — UX, Features & Performance

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| B29 | **Dark mode nas paginas standalone** — CSS vars dark mode via `prefers-color-scheme: dark` + `[data-theme="dark"]` nas 3 paginas standalone (onboarding, convite, novo-colaborador). Cores de fundo, texto, bordas e sombras adaptam automaticamente. | `pages/onboarding.html`, `pages/convite.html`, `pages/novo-colaborador.html` | MEDIO |
| B30 | **Animacoes de transicao** — Cards de dia com slide-in escalonado (50ms delay cada), detalhe de dia com expand animation, barra de progresso com grow animation, unlock pulse ao desbloquear dia. | `pages/onboarding.html` (CSS) | BAIXO |
| B31 | **Confetti na conclusao** — Engine de confetti canvas puro (120 pecas, 8 cores TBO, gravidade, fade out). Sem dependencias externas. Dispara ao concluir o onboarding. | `js/onboarding.js` | BAIXO |
| B34 | **Timeline cronologica no admin** — Painel lateral agora inclui timeline visual vertical com eventos de liberacao/conclusao de dias e atividades, com icones coloridos e timestamps. | `js/admin-onboarding.js` | MEDIO |
| B37 | **Metricas de tempo por atividade** — Registra `tempo_gasto_seg` no `onboarding_progresso` ao concluir atividade (diferenca entre abertura e fechamento do modal). | `js/onboarding.js` | MEDIO |
| B38 | **Feedback do colaborador (1-5 estrelas)** — Rating com estrelas clicaveis no modal de atividade. Labels descritivos (Ruim→Excelente). Salva `feedback_rating` no progresso. | `js/onboarding.js` | MEDIO |
| B44 | **CSS @media print** — Estilos de impressao ocultam sidebar, header, filtros, acoes. Tabela otimizada para papel A4. Botao "Imprimir" no header do admin. | `js/admin-onboarding.js` | BAIXO |
| B14 | **Exportar relatorio CSV** — Botao CSV no admin gera arquivo com BOM UTF-8, separador `;`, todos os campos relevantes. Download automatico com data no nome. | `js/admin-onboarding.js` | MEDIO |
| B15 | **Grafico de distribuicao de progresso** — Grafico de barras horizontais CSS puro nos KPIs mostrando distribuicao de colaboradores por faixa de progresso (0-25%, 26-50%, 51-75%, 76-99%). | `js/admin-onboarding.js` | MEDIO |
| B46 | **Cache localStorage** — Dias e atividades (dados que raramente mudam) sao cacheados localmente com TTL de 10 minutos. Progresso e dias liberados sempre buscam do servidor. | `js/onboarding.js` | MEDIO |
| B48 | **Backup/snapshot do progresso** — Antes de cada conclusao de atividade, salva snapshot do estado atual no localStorage (ultimos 10 snapshots) para recovery em caso de falha. | `js/onboarding.js` | MEDIO |

---

## PARTE 0: Sprint 1/2/3 — Melhorias Aplicadas (19/02/2026)

### Sprint 1 — Seguranca & Infraestrutura

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| S1.1 | **Credenciais centralizadas em config.js** — Removido hardcode de URL/anonKey de `utils/supabase.js` e `js/supabase-client.js`. Agora usam `ONBOARDING_CONFIG` do config.js (gitignored). Paginas standalone agora carregam `config.js`. | `config.js`, `utils/supabase.js`, `js/supabase-client.js`, `pages/*.html`, `config.example.js` | CRITICO |
| S1.2 | **Guard antes do router** — `TBO_ONBOARDING_GUARD.verificar()` movido para ANTES de `TBO_ROUTER.initFromHash()` no app.js. Colaboradores em onboarding agora sao redirecionados antes de qualquer modulo carregar. | `app.js` | CRITICO |
| S1.3 | **Validacao de token + Rate limiting** — Token do convite agora validado como hex 64 chars (`/^[a-f0-9]{64}$/`) antes de qualquer query. Rate limiting local bloqueia apos 10 tentativas em 15 minutos. | `js/convite.js` | ALTO |
| S1.4 | **CSP + Security headers** — Content-Security-Policy, X-Content-Type-Options, X-Frame-Options, Referrer-Policy e Permissions-Policy adicionados ao `vercel.json`. Previne XSS via scripts externos e clickjacking. | `vercel.json` | CRITICO |
| S1.5 | **RLS policies SQL** — Script SQL completo com Row Level Security para 7 tabelas do onboarding. Usuarios so acessam seus proprios dados; admins/gestores veem todos. | `sql/rls-onboarding.sql` (NOVO) | CRITICO |

### Sprint 2 — Features & UX

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| S2.1 | **Realtime UPDATE/DELETE** — `onboarding.js` agora escuta UPDATE em `onboarding_dias_liberados` e todas as mudancas em `onboarding_progresso` do colaborador. Admin-onboarding ja tinha `event: '*'`. | `js/onboarding.js` | ALTO |
| S2.2 | **Timeout e Retry** — Novas funcoes `queryWithTimeout(fn, 15s)` e `queryWithRetry(fn, 3, 1s)` com backoff exponencial no `TBO_ONBOARDING_DB`. | `js/supabase-client.js` | MEDIO |
| S2.3 | **Error boundary global** — `TBO_APP._safeInit(name, fn)` captura erros de inicializacao de qualquer modulo e exibe toast em vez de quebrar a pagina. 10 enhancement modules refatorados para usar o pattern. | `app.js` | ALTO |
| S2.4 | **Mobile responsiveness** — CSS responsivo em todas as 3 paginas standalone: onboarding (cards empilhados, modal fullwidth, botoes 100%), convite (input 16px, padding reduzido), novo-colaborador (grid coluna unica). | `pages/onboarding.html`, `pages/convite.html`, `pages/novo-colaborador.html` | MEDIO |
| S2.5 | **Loading skeleton** — Tabela do admin-onboarding agora mostra skeleton animado (pulse) em vez de spinner generico durante carregamento. | `js/admin-onboarding.js` | BAIXO |

### Sprint 3 — Qualidade de Codigo

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| S3.1 | **Memory leak fix em notificacoes** — `document.addEventListener('click')` agora usa handler nomeado (`_documentClickHandler`) com `removeEventListener` no re-render e no `destroy()`. Container DOM tambem limpo no destroy. | `js/notificacoes.js` | ALTO |
| S3.2 | **Constantes para magic strings** — `ONB_TABLES`, `ONB_STATUS`, `ONB_TIPO` centralizados em `supabase-client.js` para evitar strings duplicadas. | `js/supabase-client.js` | MEDIO |
| S3.3 | **Validacao centralizada** — `ONB_VALIDATORS` com metodos `email()`, `nome()`, `senha()`, `telefone()`, `data()`, `required()` que retornam mensagem de erro ou null. | `js/supabase-client.js` | MEDIO |
| S3.4 | **Accessibility (a11y)** — Modais com `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Focus management ao abrir. Fechar com Escape (com cleanup do handler). Botoes com `aria-label`. | `js/onboarding.js`, `js/admin-onboarding.js` | MEDIO |
| S3.5 | **Destroy completo no admin-onboarding** — `destroy()` agora limpa: canal Realtime, debounce pendente, painel lateral, modal de checkin, dados em memoria. | `js/admin-onboarding.js` | ALTO |

---

## PARTE 1: Melhorias Ja Aplicadas (Sessao 18/02/2026)

### Seguranca (Criticas)

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| 1 | **Sanitizacao XSS em admin-onboarding.js** — Todos os dados do banco (nome, email, cargo, titulo atividade) agora passam por `_escapeHtml()` antes de inserir via innerHTML | `js/admin-onboarding.js` | CRITICO |
| 2 | **Sanitizacao XSS em convite.js** — Campos do colaborador escapados em value attributes e na mensagem de sucesso | `js/convite.js` | CRITICO |
| 3 | **Sanitizacao XSS em onboarding.js** — Titulos de dias, atividades, descricoes e nomes escapados em todas as 6 funcoes de render | `js/onboarding.js` | CRITICO |
| 4 | **Sanitizacao XSS em notificacoes.js** — Mensagens de notificacao escapadas antes de renderizar no dropdown | `js/notificacoes.js` | CRITICO |
| 5 | **Sanitizacao XSS em novo-colaborador.js** — Dados de confirmacao (nome, email, cargo, link) escapados | `js/novo-colaborador.js` | CRITICO |
| 6 | **Sanitizacao XSS em onboarding-guard.js** — Nome do colaborador escapado na pagina de espera | `js/onboarding-guard.js` | CRITICO |
| 7 | **Helper `_escapeHtml()` centralizado** — Funcao global de sanitizacao adicionada em supabase-client.js, disponivel para todos os modulos de onboarding | `js/supabase-client.js` | CRITICO |
| 8 | **Validacao de tipo de arquivo no upload** — Avatar agora verifica `file.type.startsWith('image/')` alem do tamanho | `js/convite.js` | ALTO |

### Bugs Corrigidos

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| 9 | **Memory leak no Supabase Client standalone** — `getClient()` no fallback criava novo client a cada chamada; agora usa singleton `_fallbackClient` com auth config adequada | `js/supabase-client.js` | ALTO |
| 10 | **Linkagem auth_user_id ausente** — Ao criar conta via convite, o `auth_user_id` do Supabase Auth nao era salvo na tabela `colaboradores`; corrigido para linkar automaticamente | `js/convite.js` | CRITICO |

### UX & Robustez

| # | Melhoria | Arquivo(s) | Impacto |
|---|----------|-----------|---------|
| 11 | **`prompt()` bloqueante substituido por modal** — Check-in no admin-onboarding agora usa modal async ao inves de `prompt()` nativo que trava o browser | `js/admin-onboarding.js` | MEDIO |
| 12 | **Debounce no Realtime** — Updates do Realtime no admin-onboarding agora tem debounce de 500ms para evitar re-renders excessivos com multiplos eventos simultaneos | `js/admin-onboarding.js` | MEDIO |
| 13 | **`alert()` substituido por `TBO_TOAST`** — Todas as 4 chamadas de `alert()` no onboarding.js agora usam TBO_TOAST com fallback para alert em paginas standalone | `js/onboarding.js` | BAIXO |
| 14 | **Prevencao de double-click** — Botao "Marcar como concluida" agora desabilita e mostra "Salvando..." para evitar submissoes duplicadas | `js/onboarding.js` | MEDIO |
| 15 | **Indicador de forca de senha** — Campo de senha no convite agora mostra feedback visual da forca (Muito fraca/Fraca/Razoavel/Boa/Forte/Excelente) | `js/convite.js` | BAIXO |
| 16 | **Botao copiar link do convite** — Confirmacao de cadastro agora tem botao "Copiar link" com clipboard API e feedback visual | `js/novo-colaborador.js` | BAIXO |
| 17 | **admin-onboarding na sidebar** — Modulo adicionado ao role founder, project_owner e a secao PESSOAS na sidebar | `utils/permissions.js` | MEDIO |

---

## PARTE 2: 50 Proximas Melhorias (Backlog Priorizado)

### Prioridade CRITICA (Seguranca & Estabilidade)

| # | Melhoria | Tipo | Arquivo(s) Afetado(s) | Estimativa |
|---|----------|------|----------------------|------------|
| 1 | **Mover credenciais Supabase para env vars** — URL e anonKey estao hardcoded em `utils/supabase.js` e `js/supabase-client.js`. Devem usar variaveis de ambiente da Vercel via `config.js` | Seguranca | `utils/supabase.js`, `js/supabase-client.js` | P |
| 2 | **RLS policy para colaboradores.auth_user_id** — Garantir que um usuario so pode atualizar seu proprio `auth_user_id`, nao o de outros | Seguranca | `database/schema.sql` | P |
| 3 | **Rate limiting no aceite de convite** — Nao ha protecao contra brute force no endpoint de convites. Adicionar tentativa maxima por IP/token | Seguranca | `js/convite.js`, Edge Function | M |
| 4 | **Validar token como UUID no frontend** — O token da URL e passado diretamente ao Supabase sem validar formato. Adicionar regex `/^[a-f0-9]{64}$/` | Seguranca | `js/convite.js` | P |
| 5 | **Sanitizacao em TODOS os modulos existentes** — Os 36 modulos em `modules/` tambem usam innerHTML com dados do banco sem escapar (mesma vulnerabilidade que corrigimos no onboarding) | Seguranca | `modules/*.js` | G |
| 6 | **CSP headers na Vercel** — Adicionar Content-Security-Policy no `vercel.json` para prevenir injeccao de scripts externos | Seguranca | `vercel.json` | P |
| 7 | **Deploy das Edge Functions** — As 4 edge functions criadas (`fn_liberar_dia_1`, `fn_verificar_inatividade`, etc.) ainda nao foram deployed via `supabase functions deploy` | Infra | `supabase/functions/` | M |
| 8 | **Configurar pg_cron jobs** — Os 3 cron jobs (liberar dia 1, verificar inatividade, email dia anterior) ainda nao foram agendados no Supabase | Infra | SQL no Supabase | P |

### Prioridade ALTA (Funcionalidade & UX)

| # | Melhoria | Tipo | Arquivo(s) Afetado(s) | Estimativa |
|---|----------|------|----------------------|------------|
| 9 | **Email real nos convites** — O convite so gera link, nao envia email. Integrar Resend ou Supabase Edge Function para envio automatico | Feature | Edge Function nova | G |
| 10 | **Refresh token para convites expirados** — Adicionar botao "Solicitar novo convite" na pagina de convite expirado, em vez de apenas mostrar erro | Feature | `js/convite.js` | M |
| 11 | **Quiz engine real** — O tipo "quiz" mostra apenas placeholder. Implementar engine com perguntas, alternativas, score, e re-tentativa | Feature | `js/onboarding.js` | G |
| 12 | **Upload de video no onboarding** — Atividades tipo "video" mostram placeholder. Integrar com Supabase Storage ou YouTube embeds | Feature | `js/onboarding.js`, Storage | M |
| 13 | **Formulario dinamico no onboarding** — Atividades tipo "formulario" usam textarea generico. Criar schema de campos dinamicos no banco | Feature | `js/onboarding.js`, DB | G |
| 14 | **Exportar relatorio de onboarding (CSV/PDF)** — Admin nao tem como exportar dados de progresso para compartilhar com a diretoria | Feature | `js/admin-onboarding.js` | M |
| 15 | **Grafico de progresso no painel admin** — Adicionar grafico de barras/linha mostrando evolucao do onboarding ao longo dos dias | Feature | `js/admin-onboarding.js` | M |
| 16 | **Notificacao push via Web Push API** — Alem das notificacoes in-app, enviar push notifications para o browser quando o colaborador recebe novo dia | Feature | `js/notificacoes.js`, SW | G |
| 17 | **Responsividade mobile das paginas standalone** — `pages/convite.html` e `pages/onboarding.html` nao tem meta viewport otimizado e layout mobile | UX | `pages/*.html`, CSS | M |
| 18 | **Loading skeleton no admin-onboarding** — A tabela mostra spinner generico. Usar skeleton loading (ja tem no design system) para UX melhor | UX | `js/admin-onboarding.js` | P |

### Prioridade MEDIA (Qualidade de Codigo)

| # | Melhoria | Tipo | Arquivo(s) Afetado(s) | Estimativa |
|---|----------|------|----------------------|------------|
| 19 | **Consolidar client helpers** — `TBO_ONBOARDING_DB` e `TBO_SUPABASE` fazem coisas semelhantes. Unificar getSession/getClient num unico namespace | Refactor | `js/supabase-client.js`, `utils/supabase.js` | M |
| 20 | **Error boundary global para modulos** — Quando um modulo falha no init(), capturar e mostrar mensagem amigavel em vez de pagina em branco | Robustez | `app.js`, `utils/router.js` | M |
| 21 | **Testes E2E para fluxo de onboarding** — Nao existem testes automatizados. Criar suite basica com Playwright/Cypress para o fluxo convite->onboarding->conclusao | Qualidade | Novo: `tests/` | G |
| 22 | **Linter/Formatter (ESLint + Prettier)** — O codebase nao tem linting configurado. Padronizar identacao, aspas, ponto-e-virgula | Qualidade | `package.json`, `.eslintrc.js` | M |
| 23 | **TypeScript (ou JSDoc types)** — Adicionar tipagem gradual via JSDoc comments para autocomplete e deteccao de bugs | Qualidade | `js/*.js`, `modules/*.js` | G |
| 24 | **Separar CSS do onboarding em arquivo proprio** — As ~350 linhas de CSS foram adicionadas ao final do `styles.css` (87k linhas). Criar `styles/onboarding.css` | Organizacao | `styles.css`, novo CSS | P |
| 25 | **Documentar API do TBO_ONBOARDING_DB** — O wrapper nao tem JSDoc. Documentar metodos publicos para outros devs | Docs | `js/supabase-client.js` | P |
| 26 | **Remover dados legados duplicados** — `sql/create-tables.sql` e `supabase-schema.sql` coexistem com `database/schema.sql`. Documentar qual usar | Organizacao | README | P |
| 27 | **Padronizar nomes de funcoes** — Alguns metodos usam camelCase (`_carregarDados`), outros usam snake_case misturado. Padronizar | Qualidade | `js/*.js` | M |
| 28 | **Accessibility (a11y) nas paginas de onboarding** — Faltam aria-labels, roles, focus management nos modals e cards de dia | A11y | `js/onboarding.js`, `js/convite.js` | M |

### Prioridade BAIXA (Enhancements & Nice-to-have)

| # | Melhoria | Tipo | Arquivo(s) Afetado(s) | Estimativa |
|---|----------|------|----------------------|------------|
| 29 | **Dark mode nas paginas standalone** — `pages/convite.html` e `pages/onboarding.html` nao herdam o tema dark do sistema principal | UX | `pages/*.html`, CSS | P |
| 30 | **Animacoes de transicao entre dias** — Ao desbloquear novo dia, animar a transicao do card de locked para available | UX | `js/onboarding.js`, CSS | P |
| 31 | **Confetti na conclusao** — A celebracao final usa emoji. Adicionar animacao de confetti (canvas ou library leve) | UX | `js/onboarding.js` | P |
| 32 | **Gamificacao (badges/conquistas)** — Ao completar marcos (primeiro dia, metade, conclusao), conceder badges visuais | Feature | Nova tabela + JS | G |
| 33 | **Buddy dashboard** — O buddy nao tem visao dedicada do mentorado. Criar painel simplificado mostrando progresso e atividades pendentes | Feature | Novo modulo | G |
| 34 | **Timeline do onboarding** — Visualizacao cronologica de todas as acoes do colaborador durante o onboarding | Feature | `js/admin-onboarding.js` | M |
| 35 | **Drag & drop para reordenar atividades** — Admin poder reordenar atividades de um dia via drag & drop | Feature | Admin panel + DB | G |
| 36 | **Editor de conteudo de atividades** — Admin criar/editar atividades diretamente no painel, sem SQL | Feature | Admin panel + CRUD | G |
| 37 | **Metricas de tempo por atividade** — Registrar quanto tempo o colaborador leva em cada atividade para analytics | Feature | `js/onboarding.js`, DB | M |
| 38 | **Feedback do colaborador por atividade** — Permitir que o colaborador de nota (1-5 estrelas) e comentario apos cada atividade | Feature | `js/onboarding.js`, DB | M |
| 39 | **Multi-idioma (i18n)** — O sistema usa portugues hardcoded. Preparar estrutura para traducao (json de strings) | Feature | Todos os JS | G |
| 40 | **PWA para pagina de onboarding** — Permitir que o colaborador acesse o onboarding como app mobile via manifest + service worker | Feature | `pages/onboarding.html`, SW | M |
| 41 | **Onboarding progress widget no Command Center** — Mostrar mini-card de progresso de onboarding no dashboard principal para admins | Feature | `modules/command-center.js` | M |
| 42 | **Webhook para Slack/Teams** — Notificar canal do time quando colaborador conclui onboarding ou fica inativo | Feature | Edge Function nova | M |
| 43 | **Template de onboarding customizavel** — Permitir criar templates diferentes de onboarding (por departamento, cargo, etc.) | Feature | DB + Admin panel | G |
| 44 | **Impressao do progresso** — CSS @media print para imprimir relatorio de progresso do admin-onboarding | UX | CSS | P |
| 45 | **Lazy loading de modulos** — Os modulos carregam todos ao iniciar. Usar dynamic import() para carregar sob demanda | Performance | `app.js`, modulos | G |
| 46 | **Cache de dados do onboarding no localStorage** — Dias e atividades raramente mudam. Cachear para carregamento instantaneo com revalidacao em background | Performance | `js/onboarding.js` | M |
| 47 | **Metricas de conclusao no onboarding (analytics)** — Registrar funil: convite enviado -> aceito -> dia 1 -> conclusao, com taxas de conversao | Analytics | DB + Dashboard | G |
| 48 | **Backup automatico do progresso** — Antes de marcar atividade como concluida, salvar snapshot do progresso atual para recovery | Robustez | `js/onboarding.js` | P |
| 49 | **Health check endpoint** — Endpoint `/api/health` que valida conexao Supabase, tabelas existem, views estao ok | Infra | `api/health.js`, `vercel.json` | M |
| 50 | **Documentacao de arquitetura (ADR)** — Registrar decisoes de arquitetura (por que Supabase, por que vanilla JS, etc.) em Architecture Decision Records | Docs | Novos MD files | M |

---

## Legenda

| Simbolo | Significado |
|---------|-------------|
| **P** | Pequeno (< 2h de trabalho) |
| **M** | Medio (2-8h de trabalho) |
| **G** | Grande (> 1 dia de trabalho) |

---

## Recomendacao de Execucao

### Sprint 1 (Imediato - Esta semana)
Items 1-8 (seguranca e infra critica)

### Sprint 2 (Proxima semana)
Items 9-18 (funcionalidade e UX alta prioridade)

### Sprint 3 (Semana seguinte)
Items 19-28 (qualidade de codigo)

### Backlog (Conforme capacidade)
Items 29-50 (enhancements e nice-to-have)
