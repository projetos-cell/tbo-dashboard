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
