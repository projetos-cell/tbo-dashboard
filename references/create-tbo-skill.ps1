$base = "C:\Users\marco\Desktop\tbo-dashboard-main\tbo-dashboard-main\.claude\skills\tbo-os-roadmap"
$refs = "$base\references"

# Criar pastas
New-Item -ItemType Directory -Force -Path $refs | Out-Null

# === SKILL.md ===
@'
---
name: tbo-os-roadmap
description: "TBO OS 2026 product roadmap — 4 phases, 15 sprints, 16 weeks. Use this skill whenever working on TBO OS platform development, sprint planning, task breakdown, implementation of any TBO OS module (Access Control, Cultura, OKRs, 1:1s, Reconhecimentos, Projetos, Reportei, Rituais, Chat), checking dependencies between sprints, estimating effort, or when the user references any sprint ID (1.1, 2.1, 3.2, 4.x, etc.). Also trigger when the user mentions: TBO OS, roadmap TBO, sprint planning, workspace diretoria, módulo cultura, sistema OKRs, Fireflies integration, PDI, reconhecimentos, quadro de projetos, Reportei, rituais, or chat TBO."
---

# TBO OS — Roadmap 2026

**4 Fases | 15 Sprints | ~16 Semanas**
Priorizado por: dependências técnicas → impacto operacional → complexidade

**Stack base:** Supabase (PostgreSQL + RLS) + Next.js 14 (App Router + Edge Functions) + React Query + TypeScript + shadcn/ui

## Como usar esta skill

1. **Consultar sprint específico** → Leia o reference file da fase correspondente (`references/fase-N.md`)
2. **Planejar próxima sprint** → Verifique dependências no mapa abaixo antes de iniciar
3. **Implementar tarefa** → Leia o detalhamento técnico da sprint no reference file e siga a sequência de execução
4. **Estimar esforço** → Consulte a tabela de esforço abaixo
5. **Avaliar riscos** → Consulte `references/riscos.md`

## Visão geral das fases

| Fase | Tema | Sprints | Semanas | Horas Est. | Prioridade |
|------|------|---------|---------|------------|------------|
| 1 | Infraestrutura & Governança | 1.1, 1.2 | 1-3 | 15-20h | Crítica |
| 2 | Gestão de Pessoas & Performance | 2.1, 2.2, 2.3 | 4-7 | 50-70h | Alta |
| 3 | Experiência & Integrações | 3.1, 3.2, 3.3 | 8-11 | 40-55h | Média-Alta |
| 4 | Comunicação Interna (Chat TBO) | 4.1, 4.2, 4.3 | 12-16 | 60-80h | Média |
| **TOTAL** | | **15 sprints** | **16 sem** | **165-225h** | |

> Estimativas assumem 1 dev full-stack + Claude Code como acelerador. Sprints 3.1 e 3.2 podem rodar em paralelo.

## Índice de sprints

| Sprint | Nome | Reference file |
|--------|------|----------------|
| 1.1 | Access Control & Workspace Diretoria | `references/fase-1.md` |
| 1.2 | Correção Módulo de Cultura | `references/fase-1.md` |
| 2.1 | Sistema de OKRs Nativo | `references/fase-2.md` |
| 2.2 | 1:1 Integrado com Fireflies + PDI | `references/fase-2.md` |
| 2.3 | Sistema de Reconhecimentos + Pontuação | `references/fase-2.md` |
| 3.1 | Quadro de Projetos: UX Redesign | `references/fase-3.md` |
| 3.2 | Reportei API + Independência de Dados | `references/fase-3.md` |
| 3.3 | 1:1s & Rituais Expandidos | `references/fase-3.md` |
| 4.1 | Infraestrutura de Chat | `references/fase-4.md` |
| 4.2 | Rich Media & Anexos | `references/fase-4.md` |
| 4.3 | Grupos, DMs & Tópicos | `references/fase-4.md` |

## Mapa de dependências

```
1.1 Access Control ──────┬──→ 2.1 OKRs Nativo
(pré-requisito global)   ├──→ 2.2 1:1 + Fireflies ──→ 2.3 Reconhecimentos
                         ├──→ 3.3 Rituais Expandidos (via 2.2)
                         └──→ 4.x Chat TBO

1.2 Correção Cultura ────── (independente)
3.1 Projetos UX ─────────── (independente)
3.2 Reportei + Supabase ─── (independente)
```

**Regras de sequenciamento:**
- Nunca iniciar sprint da Fase 2+ sem 1.1 estável
- Sprint 2.3 requer 2.2 (usa Fireflies parser)
- Sprint 3.3 requer 2.2 (usa infraestrutura de 1:1)
- Sprints independentes (1.2, 3.1, 3.2) podem rodar em paralelo com qualquer fase

## Lógica de fases

- **Fase 1** resolve permissões e corrige bases quebradas (pré-requisito para tudo)
- **Fase 2** constrói o sistema de gestão de pessoas (OKRs + 1:1 + PDI + reconhecimentos são interdependentes)
- **Fase 3** melhora UX e integra dados externos
- **Fase 4** é o chat — módulo mais complexo e independente dos demais

## Instruções para o agente

Ao receber uma tarefa relacionada ao TBO OS:

1. **Identifique qual sprint** a tarefa pertence (pelo ID ou contexto)
2. **Leia o reference file** da fase correspondente para obter detalhamento técnico completo
3. **Verifique dependências** no mapa acima — se a sprint depende de outra não concluída, alerte o usuário
4. **Siga a sequência de execução** documentada em cada sprint (dia a dia)
5. **Valide contra critérios de aceitação** ao finalizar cada tarefa
6. **Consulte `references/riscos.md`** se encontrar bloqueios técnicos

Ao gerar código ou implementar:
- Use a stack técnica definida (Supabase + Next.js 14 + React Query + TypeScript + shadcn/ui)
- Implemente RLS policies no Supabase para qualquer dado sensível
- Siga o padrão de proxy API via Vercel Edge Functions (credenciais em env vars, nunca no frontend)
- Teste permissões por role: founder, PO, colaborador
'@ | Set-Content -Path "$base\SKILL.md" -Encoding UTF8

# === references/fase-1.md ===
@'
# Fase 1 — Infraestrutura & Governança

**Semanas 1-3 | 2 Sprints | Prioridade: Crítica**

Resolver problemas de base que bloqueiam avanços. Sem esta fase, qualquer módulo novo herdaria problemas de permissão e navegação.

---

## Sprint 1.1 — Access Control & Workspace Diretoria

### Contexto
Criar segregação de dados e acesso baseado em papéis. Implementar workspace isolado para decisões estratégicas (Diretoria) acessível apenas por founders, mover Analytics de Pessoas para esse contexto, implementar auditoria.

### Stack Técnico
Supabase (PostgreSQL + RLS) + Next.js 14 (App Router + Edge Functions) + React Query + TypeScript

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 1.1.1 | Workspace Diretoria: acesso restrito a founders | Implementar RLS policy no Supabase que filtra `workspace_id = 'diretoria'` por `user_role IN ('founder')`. Frontend oculta menu e rotas #diretoria-* para non-founders. Middleware server-side nas Edge Functions. | Alto | ● |
| 1.1.2 | Migrar módulo 'Analytics de Pessoas' para Diretoria | Mover rota #people-analytics para #diretoria-analytics. Atualizar sidebar mapping, breadcrumbs, permissões. Dados permanecem nas mesmas tabelas Supabase, apenas UI/acesso muda. | Médio | ● |
| 1.1.3 | Audit log de acessos sensíveis | Criar tabela `audit_log` (user_id, action, resource, timestamp) com trigger automático. Visível apenas para founders. Append-only (não pode ser deletado). | Baixo | ● |

### Sequência de Execução

**Dia 1 — Backend (Segurança primeiro)**
1. Migration RLS + tabela workspaces
2. Migration audit_logs + trigger
3. Atualizar session/JWT para incluir user_role

**Dia 2 — Frontend (Navegação + Acesso)**
1. Criar layout `/diretoria` com middleware check
2. Mover componentes de Analytics
3. Atualizar sidebar navigation
4. Criar página /diretoria/audit

**Dia 3 — Testes + Hardening**
1. Testar fluxo: founder acessa → works; non-founder acessa → 403
2. Testar audit log automático
3. Testar permissões de DELETE (deve falhar)

### Critérios de Aceitação

- [ ] RLS policy bloqueia non-founders em nível de banco de dados
- [ ] Middleware redireciona antes de servir componentes React
- [ ] Analytics funciona em `/diretoria-analytics` com dados históricos intactos
- [ ] Audit log registra acessos automaticamente
- [ ] Founder consegue visualizar audit log, non-founder não
- [ ] Logs são append-only
- [ ] Sem erros no console; sem queries N+1

### Próximo Nível (Sprint 1.2)

Após 1.1 estável:
- Workspace Executivo (viewable by Ruy + Marco)
- Workspace Geral (accessible by all)
- Permission inheritance (roles por workspace)
- Data filters (cada workspace filtra dados por workspace_id)

---

## Sprint 1.2 — Correção Módulo de Cultura

### Contexto
O módulo cultura (#cultura-*) tem rotas quebradas, navegação incorreta, e conteúdo faltando. Esta sprint resolve problemas de base do módulo antes de expandi-lo.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 1.2.1 | Audit de rotas e caminhos quebrados | Mapear todas as rotas do módulo cultura. Identificar links mortos, redirecionamentos incorretos, páginas que retornam 404 ou conteúdo vazio. Documentar em checklist. | Médio | ● |
| 1.2.2 | Correção de navegação e breadcrumbs | Corrigir hash routing no app.js para rotas do módulo cultura. Garantir que sidebar highlights, breadcrumbs, e back navigation funcionem corretamente. | Médio | ● |
| 1.2.3 | Validação de conteúdo carregado | Verificar se todo conteúdo do módulo cultura (valores, manual, políticas) carrega corretamente do Supabase. Corrigir queries com joins quebrados. Fallback para conteúdo estático se necessário. | Médio | ● |
| 1.2.4 | Testes de navegação end-to-end | Testar cada página do módulo cultura como founder, PO, e colaborador. Validar permissões de visualização/edição por role. Documentar bugs remanescentes. | Baixo | ● |

### Critérios de Aceitação

- [ ] Todas as rotas #cultura-* retornam 200 ou redirect válido
- [ ] Breadcrumbs corretos em cada página
- [ ] Conteúdo carrega do Supabase sem N+1 queries
- [ ] Permissões de role funcionam (founder edita, colaborador lê)
- [ ] Sidebar highlight ativo para página atual
- [ ] Sem 404s ou erros console
'@ | Set-Content -Path "$refs\fase-1.md" -Encoding UTF8

# === references/fase-2.md ===
@'
# Fase 2 — Gestão de Pessoas & Performance

**Semanas 4-7 | 3 Sprints | Prioridade: Alta**

Construir o ecossistema completo de gestão de performance: OKRs, 1:1s integrados com Fireflies, PDI, e sistema de reconhecimento. Estes módulos são **interdependentes** e formam o 'ciclo de performance' da TBO.

---

## Sprint 2.1 — Sistema de OKRs Nativo

### Contexto
Remover embed Notion da página OKRs. Construir sistema nativo com:
- Hierarchy: Company → BU → Pessoa
- Check-ins semanais
- Scoring automático
- Alert quando em risco

### Referências de Mercado
Lattice (hierarchy + check-ins), Weekdone (scoring automático), Gtmhub (OKR analytics), 15Five (OKR + 1:1 integrado), Perdoo (alignment tree)

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 2.1.1 | Remover embed Notion da página OKRs | Eliminar iframe Notion da rota #okrs-2026. Substituir por container vazio que receberá o novo módulo. Manter dados históricos acessíveis via link Notion externo durante transição. | Baixo | ● |
| 2.1.2 | Schema Supabase: OKR tables | Criar: `okr_objectives` (id, title, owner_id, period, level [company/bu/personal], parent_id, status, bu), `okr_key_results` (objective_id, title, metric_type, target_value, current_value, unit, owner_id), `okr_checkins` (key_result_id, value, notes, author_id, confidence_level). RLS por tenant + role. | Alto | ● |
| 2.1.3 | UI: Alignment Tree View | Visão hierárquica tipo Perdoo: Empresa → BU → Pessoa. Expandir/colapsar objetivos. Progress bar composta calculada pela média ponderada dos KRs. Filtros por período (Q1-Q4), BU, e owner. | Alto | ● |
| 2.1.4 | UI: Check-in Flow | Modal de check-in semanal: atualizar current_value de cada KR, adicionar nota de contexto, definir confidence level (on track / at risk / behind). Histórico de check-ins visível em timeline lateral. | Médio | ● |
| 2.1.5 | UI: Dashboard de OKRs | Vista consolidada: % geral da empresa, top 3 OKRs em risco, próximos check-ins pendentes, gráfico de evolução temporal. Widget para Command Center. | Médio | ● |
| 2.1.6 | Scoring automático + alertas | Calcular % de progresso automaticamente (current/target). Alertar quando KR está < 25% na metade do quarter. Notificação para owner + líder. Flag automático 'at_risk' quando progresso < expected_by_date. | Médio | ● |

### Critérios de Aceitação

- [ ] OKR tree renderiza corretamente com 3+ níveis hierárquicos
- [ ] Check-in semanal funciona sem erros
- [ ] Scoring automático atualiza em < 1s
- [ ] Alertas de risco disparam corretamente
- [ ] Dados históricos acessíveis via Notion durante transição
- [ ] Dashboard carrega em < 2s com 100+ OKRs

---

## Sprint 2.2 — 1:1 Integrado com Fireflies + PDI

### Contexto
Fluxo end-to-end:
1. Agendar 1:1
2. Reunião gravada no Fireflies
3. Transcrição processada
4. Ações extraídas e distribuídas
5. Ações vinculadas ao PDI individual
6. Tracking de progresso

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 2.2.1 | Schema: 1:1 meetings + actions | Tabelas: `one_on_one_meetings` (id, leader_id, member_id, scheduled_at, fireflies_meeting_id, status, type [po_liderado, socio_po]), `one_on_one_actions` (meeting_id, assignee_id, description, due_date, status, pdi_link_id). FK para pdi_goals. | Alto | ● |
| 2.2.2 | Agendamento de 1:1 com tipo de ritual | UI para agendar 1:1 no módulo 'Rituais'. Tipos: PO + Liderado, Sócios + POs. Criar evento Google Calendar via API. Adicionar link Fireflies para gravação automática. | Alto | ● |
| 2.2.3 | Webhook Fireflies: captura de transcrição | Endpoint `/api/webhooks/fireflies` que recebe callback quando gravação finaliza. Extrair: transcript_id, meeting_id, summary, action_items. Match automático com one_on_one_meetings via participantes ou meeting_id. | Alto | ● |
| 2.2.4 | Processamento de ações com IA | Usar Claude API (ou GPT) para extrair action items da transcrição Fireflies. Classificar cada ação: assignee (líder ou liderado), deadline sugerido, categoria (feedback, desenvolvimento, operacional). Salvar em one_on_one_actions. | Alto | ● |
| 2.2.5 | Distribuição automática de ações | Após processamento, notificar líder e liderado das suas ações. Cada ação aparece no dashboard pessoal do assignee. Status tracking: pendente → em andamento → concluída. | Médio | ● |
| 2.2.6 | Vínculo ações ↔ PDI | Permitir linkar uma ação de 1:1 a uma meta do PDI (trilha-aprendizagem.js). Quando ação é concluída, atualiza progresso do PDI automaticamente. Visão consolidada: PDI mostra ações originadas de 1:1s. | Médio | ● |

### Critérios de Aceitação

- [ ] Agendar 1:1 cria evento Google Calendar + Fireflies link
- [ ] Webhook Fireflies recebe transcrição corretamente
- [ ] Claude API extrai 3+ ações por transcrição (com accuracy > 80%)
- [ ] Ações distribuídas automaticamente aos assignees
- [ ] PDI atualiza quando ação vinculada é concluída
- [ ] Nenhuma ação perdida no pipeline

### Risco Alto
Fireflies API instável ou limitada. **Mitigação:** testar endpoints antes. Implementar retry + fallback (upload manual de transcrição). Cache de transcrições no Supabase.

---

## Sprint 2.3 — Sistema de Reconhecimentos + Pontuação

### Contexto
Detectar elogios no Fireflies automaticamente. Criar feed de reconhecimentos. Sistema de pontuação com recompensas (vouchers, ingressos).

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 2.3.1 | Schema: reconhecimentos + pontuação | Tabelas: `recognitions` (id, from_user_id, to_user_id, message, source [manual, fireflies, chat], value_tag, points, created_at), `recognition_rewards` (id, name, description, points_required, type [voucher, experience], active), `recognition_redemptions` (user_id, reward_id, redeemed_at, status). | Médio | ● |
| 2.3.2 | Detecção de elogios no Fireflies | No webhook de transcrição (2.2.3), parser que detecta menções de elogio (patterns: 'parabéns', 'excelente trabalho', 'mandou bem', etc.). Cada elogio detectado cria recognition automático com source='fireflies'. Review manual opcional antes de publicar. | Alto | ● |
| 2.3.3 | Página de reconhecimentos | Feed tipo LinkedIn: cards com quem elogiou, quem recebeu, mensagem, e tag de valor TBO associado. Filtros por período, pessoa, e valor. Contador de pontos por pessoa. | Médio | ● |
| 2.3.4 | Sistema de pontuação e recompensas | Regras: cada reconhecimento genuíno = X pontos (configurável). Tiers de recompensa: 20 reconhecimentos = R$200 voucher restaurante OU ingresso Cinemark. Admin configura rewards disponíveis, pontos necessários, budget trimestral. | Médio | ● |
| 2.3.5 | Dashboard de reconhecimentos (Diretoria) | Visão executiva: top reconhecidos do mês, distribuição por BU, custo acumulado de rewards, tendências. Dentro do workspace Diretoria (acesso founders). | Baixo | ● |

### Critérios de Aceitação

- [ ] Parser de elogios identifica > 80% de menções genuínas
- [ ] Feed carrega em < 1s
- [ ] Pontuação calcula automaticamente sem erros
- [ ] Admin consegue criar/editar rewards
- [ ] Redemptions registram corretamente
- [ ] Dashboard Diretoria reflete pontuação em tempo real
'@ | Set-Content -Path "$refs\fase-2.md" -Encoding UTF8

# === references/fase-3.md ===
@'
# Fase 3 — Experiência & Integrações

**Semanas 8-11 | 3 Sprints | Prioridade: Média-Alta**

Melhorar UX, integrar dados externos (Reportei), expandir rituais.

---

## Sprint 3.1 — Quadro de Projetos: UX Redesign

### Contexto
Pain points atuais: cards muito densos, drag-and-drop não fluido, filtros pouco visíveis. Redesenhar com componentes modernos (shadcn/ui) e melhorar interação.

### Benchmark
Asana boards, Linear, Monday

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 3.1.1 | Audit de UX atual do quadro | Mapear pain points: cards densos, drag-and-drop não fluido, filtros pouco visíveis. Documentar screenshots e feedback. | Baixo | ● |
| 3.1.2 | Implementar componentes shadcn/ui | Migrar cards para shadcn Card + Badge + Avatar + Tooltip. Substituir dropdowns customizados por shadcn Select/Combobox. Implementar shadcn Sheet para painel lateral de detalhes. | Alto | ● |
| 3.1.3 | Kanban com drag-and-drop nativo | Usar @hello-pangea/dnd ou HTML5 Drag API. Colunas: status do projeto. Cards: thumbnail, nome, cliente, deadline, avatar responsável, progresso. | Alto | ● |
| 3.1.4 | Filtros e vistas alternativas | Barra de filtros shadcn (chips removíveis): por BU, status, responsável, cliente, deadline. Toggle entre Kanban / Lista / Timeline (Gantt simplificado). Salvar filtros favoritos. | Médio | ● |

### Critérios de Aceitação

- [ ] Kanban carrega em < 1.5s
- [ ] Drag-and-drop funciona sem lag (60fps)
- [ ] Filtros salvos por usuário
- [ ] Toggle entre vistas sem perder scroll position
- [ ] Mobile responsive (sidebar collapsa)
- [ ] Sem quebra de dados ao mover cards entre status

---

## Sprint 3.2 — Reportei API + Independência de Dados

### Contexto
Usar Reportei como fonte de ingestão de dados (social media metrics), mas armazenar tudo no Supabase. Se descontinuar Reportei no futuro, dados históricos e dashboards continuam funcionando.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 3.2.1 | Schema: social_media_metrics | Tabelas: `sm_accounts` (id, client_id, platform, account_handle, reportei_account_id), `sm_metrics_daily` (account_id, date, followers, reach, impressions, engagement_rate, clicks, ...), `sm_posts` (account_id, post_id, published_at, type, caption, metrics_json). Indexar por date + account. | Alto | ● |
| 3.2.2 | Proxy API Reportei no Vercel | Criar `/api/reportei` proxy (padrão dos proxies existentes: auth + rate limit). Endpoints: GET /accounts, GET /reports/{id}, GET /metrics. Credenciais em env vars Vercel, nunca no frontend. | Médio | ● |
| 3.2.3 | ETL: Reportei → Supabase | Cron job (Vercel Cron ou Supabase pg_cron) que roda diariamente: puxa métricas do Reportei via API, transforma para schema normalizado, insere no Supabase com upsert (evita duplicatas). Log de execução. | Alto | ● |
| 3.2.4 | Dashboard RSM com dados Supabase | Refatorar modules/rsm.js para ler de sm_metrics_daily em vez de chamar Reportei diretamente. Gráficos de evolução, comparativo entre clientes, ranking de performance. Fallback para Reportei API se dados Supabase incompletos. | Alto | ● |

### Critérios de Aceitação

- [ ] ETL roda diariamente sem erros
- [ ] Dashboard RSM carrega dados Supabase em < 1s
- [ ] Histórico de dados preservado (100% de integridade)
- [ ] Cron job loga execução (sucesso/falha)
- [ ] Fallback a Reportei funciona se Supabase estiver out
- [ ] Nenhuma métrica perdida durante transição

### Risco Médio
Reportei API descontinuada ou alterada. **Mitigação:** ETL salva tudo no Supabase. Se Reportei cair, dashboard continua com dados históricos. Avaliar Meta API direta como plan B.

---

## Sprint 3.3 — 1:1s & Rituais Expandidos

### Contexto
Expandir módulo de rituais para incluir múltiplos tipos de reuniões recorrentes. Criar calendário consolidado e histórico de rituais por par.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 3.3.1 | Tipos de ritual configuráveis | Expandir módulo de rituais: 1:1 PO + Liderado (semanal), 1:1 Sócios + POs (quinzenal), Daily standup, Weekly review, Monthly retrospective. Cada tipo tem template de pauta, duração, participantes padrão. | Médio | ● |
| 3.3.2 | Calendário de rituais recorrentes | Criar eventos recorrentes no Google Calendar via API com link Fireflies. Sidebar mostra próximos rituais agendados com countdown. Alertas de rituais pendentes (não realizados na semana). | Médio | ● |
| 3.3.3 | Histórico consolidado de rituais | Timeline de todas as 1:1s de um par (PO + liderado), com transcrição Fireflies, ações geradas, status das ações. Permite ver evolução da relação de mentoria ao longo do tempo. | Médio | ● |

### Critérios de Aceitação

- [ ] Criar tipo de ritual personalizado funciona
- [ ] Google Calendar sincroniza automaticamente com TBO OS
- [ ] Sidebar mostra próximos 5 rituais com countdown
- [ ] Histórico de 1:1s carrega em < 1s
- [ ] Transcrições Fireflies visíveis no histórico
- [ ] Ações originadas de rituais aparecem no PDI
'@ | Set-Content -Path "$refs\fase-3.md" -Encoding UTF8

# === references/fase-4.md ===
@'
# Fase 4 — Comunicação Interna (Chat TBO)

**Semanas 12-16 | 3 Sprints | Prioridade: Média**

Módulo mais complexo do roadmap. O chat.js existente (139KB) já tem base de mensagens em tempo real via Supabase Realtime. Esta fase evolui para um chat completo estilo Slack/Discord com todas as funcionalidades.

---

## Sprint 4.1 — Infraestrutura de Chat

### Contexto
Expandir schema de chat. Implementar engine core: envio, edição, threading, presença.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 4.1.1 | Schema expandido de chat | Tabelas: `chat_channels` (id, name, type [public, private, dm, group], topic, created_by), `chat_members` (channel_id, user_id, role, last_read_at), `chat_messages` (id, channel_id, author_id, content, reply_to_id, edited_at, deleted_at, attachments_json), `chat_reactions` (message_id, user_id, emoji). Supabase Realtime subscription por channel. | Alto | ● |
| 4.1.2 | Engine de mensagens core | Envio com Ctrl+Enter (configurável). Edição e deleção de mensagens próprias (soft delete). Threading via reply_to_id. Indicador de typing (Supabase Presence). Scroll infinito com paginação de mensagens. | Alto | ● |
| 4.1.3 | Menções (@user, @channel) | Parser de menções no input: ao digitar @, autocomplete com lista de membros do canal. Menções geram notificação push (inbox + badge). Highlight visual da menção no corpo da mensagem. | Médio | ● |

### Critérios de Aceitação

- [ ] Enviar mensagem em < 200ms
- [ ] Editar/deletar funciona sem lag
- [ ] Typing indicator aparece em < 500ms
- [ ] Threading renderiza corretamente
- [ ] Menções geram notificação push
- [ ] Scroll infinito em canais com 1000+ mensagens

### Risco Médio
Performance do chat com muitos usuários. **Mitigação:** Supabase Realtime tem limites de conexão. Implementar message batching, lazy loading de canais, cleanup de subscriptions. Monitorar no System Health.

---

## Sprint 4.2 — Rich Media & Anexos

### Contexto
Suportar upload de arquivos, GIFs, áudio. Reações com emojis.

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 4.2.1 | Upload de anexos | Supabase Storage bucket 'chat-attachments' com RLS por channel membership. Upload de imagens, PDFs, documentos. Preview inline para imagens. Download link para outros tipos. Limite: 25MB por arquivo. | Alto | ● |
| 4.2.2 | Emojis e reações | Emoji picker (emoji-mart ou similar). Reações em mensagens (clicar + adicionar emoji). Contador de reações agrupado. Shortcodes :emoji_name: no input. | Médio | ● |
| 4.2.3 | GIFs (Giphy/Tenor) | Integrar Giphy API ou Tenor API. Botão GIF no composer abre picker com busca. Preview antes de enviar. Renderizar GIF inline na mensagem. | Médio | ● |
| 4.2.4 | Gravação de áudio | MediaRecorder API do browser para gravar áudio. Upload para Supabase Storage. Player inline na mensagem com waveform visual. Limite: 5 min por áudio. | Alto | ● |

### Critérios de Aceitação

- [ ] Upload < 25MB em < 5s
- [ ] Preview imagem carrega em < 1s
- [ ] Emoji picker abre em < 300ms
- [ ] GIFs renderizam sem lag
- [ ] Gravação de áudio funciona em Chrome/Safari/Firefox
- [ ] Waveform visual renderiza corretamente

---

## Sprint 4.3 — Grupos, DMs & Tópicos

### Contexto
Completar funcionalidades de canais: mensagens privadas, grupos customizados, threads (tópicos).

### Tarefas

| ID | Tarefa | Detalhamento Técnico | Esforço | Risco |
|----|--------|----------------------|---------|-------|
| 4.3.1 | Mensagens particulares (DMs) | Criar canal type='dm' automaticamente quando usuário inicia conversa privada. Sidebar separada: Canais \| DMs. Lista de DMs com avatar, nome, última mensagem, badge de unread. | Médio | ● |
| 4.3.2 | Grupos customizados | Criar canal type='group' com nome, descrição, membros selecionados. Admin do grupo pode adicionar/remover membros. Notificações configuráveis por grupo (all, mentions, none). | Médio | ● |
| 4.3.3 | Tópicos (threads) | Clicar em mensagem → abrir thread lateral (estilo Slack). Mensagens na thread vinculadas via parent_message_id. Indicador '3 replies' na mensagem original. Thread não polui o canal principal. | Alto | ● |
| 4.3.4 | Busca global de mensagens | Full-text search no Supabase (tsvector). Buscar por conteúdo, autor, canal, e data. Resultados com highlight do termo e link para a mensagem no contexto. | Médio | ● |

### Critérios de Aceitação

- [ ] DM com qualquer usuário abre em < 500ms
- [ ] Criar grupo customizado funciona
- [ ] Adicionar/remover membros em tempo real
- [ ] Thread lateral não causa lag no canal principal
- [ ] Busca global retorna resultados em < 1s (mesmo com 10k+ mensagens)
- [ ] Highlight de termo visível nos resultados
'@ | Set-Content -Path "$refs\fase-4.md" -Encoding UTF8

# === references/riscos.md ===
@'
# Riscos Principais & Mitigações

## Matriz de Riscos

| Risco | Probabilidade | Impacto | Sprints afetadas | Mitigação |
|-------|:------------:|:-------:|:----------------:|-----------|
| Fireflies API instável ou limitada | Alto | Alto | 2.2, 2.3, 3.3 | Testar endpoints antes do sprint 2.2. Implementar retry + fallback (upload manual de transcrição). Cache de transcrições no Supabase. |
| Reportei API descontinuada ou alterada | Médio | Médio | 3.2 | ETL salva tudo no Supabase. Se Reportei cair, dashboard continua com dados históricos. Avaliar Meta API direta como plan B. |
| Performance do chat com muitos usuários | Médio | Alto | 4.1, 4.2, 4.3 | Supabase Realtime tem limites de conexão. Implementar message batching, lazy loading de canais, cleanup de subscriptions. Monitorar no System Health. |
| Complexidade do parsing de elogios (Fireflies) | Médio | Baixo | 2.3 | Começar com regras simples (keywords). Evoluir para classificação com LLM. Sempre ter review humano antes de publicar reconhecimento automático. |
| Adoção do time (resistência a novo sistema) | Baixo | Alto | Todas | OKRs e reconhecimentos geram valor visível imediatamente. Chat interno só faz sentido se WhatsApp for migrado gradualmente. Treinamento por BU. |

## Planos de contingência por fase

### Fase 1
- **Se RLS do Supabase causar performance issues:** Implementar caching layer com React Query (staleTime: 5min) para reduzir queries diretas ao banco.
- **Se módulo cultura tiver mais problemas que o mapeado:** Delimitar escopo a "navegável sem erros" e deixar melhorias cosméticas para sprint futura.

### Fase 2
- **Se Fireflies webhook não funcionar:** Implementar polling como alternativa (cron a cada 15min busca novas transcrições). Upload manual como fallback final.
- **Se extração de ações por IA tiver accuracy baixa:** Manter fluxo semi-automático (IA sugere, humano confirma) em vez de automação total.

### Fase 3
- **Se Reportei API mudar:** Priorizar Meta Graph API direta como fonte alternativa. Schema do Supabase é agnóstico à fonte.
- **Se Google Calendar API tiver rate limits:** Implementar batch operations e sync incremental (apenas mudanças desde último sync).

### Fase 4
- **Se Supabase Realtime atingir limite de conexões:** Implementar connection pooling e unsubscribe de canais inativos. Considerar upgrade do plano Supabase.
- **Se performance degradar com muitas mensagens:** Implementar virtual scrolling e message windowing. Arquivar mensagens > 90 dias para tabela separada.

## Próximos passos imediatos

1. **Semana 1:** Kickoff com time dev. Validar ambiente e dependências (Fireflies webhook, Google Calendar API, Supabase setup).
2. **Sprint 1.1:** Executar com Claude Code usando Agent Skills (10 skills sequenciais, 3 dias, commits após cada skill).
3. **Sprint 1.2 (paralelo):** Audit do módulo cultura enquanto 1.1 roda.
4. **Review & Retrospective:** Ajustar estimativas e dependências baseado em learnings de Fase 1.
5. **Fase 2:** Iniciar assim que 1.1 estiver estável.
'@ | Set-Content -Path "$refs\riscos.md" -Encoding UTF8

# Confirmação
Write-Host ""
Write-Host "=== TBO OS Roadmap Skill criada com sucesso ===" -ForegroundColor Green
Write-Host ""
Write-Host "Estrutura:" -ForegroundColor Cyan
Get-ChildItem -Path $base -Recurse | ForEach-Object {
    $indent = "  " * ($_.FullName.Replace($base, "").Split("\").Length - 1)
    Write-Host "$indent$($_.Name)"
}
Write-Host ""
Write-Host "Caminho: $base" -ForegroundColor Yellow
