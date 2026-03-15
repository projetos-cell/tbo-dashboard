# Asana Upgrade Log — TBO OS Projetos

Registro de implementações do backlog de paridade com Asana.

---

## Ciclo 1 — 2026-03-14

**Item implementado:** My Tasks View (Fase 1, item 1)

### Descrição
Página `/projetos/minhas-tarefas` que mostra todas as tasks atribuídas ao usuário logado, agrupadas por projeto, com filtros de status/prioridade/prazo.

### Arquivos criados
- `frontend/features/projects/services/my-tasks.ts`
- `frontend/features/projects/hooks/use-my-tasks.ts`
- `frontend/features/projects/components/my-task-row.tsx`
- `frontend/features/projects/components/my-tasks-view.tsx`
- `frontend/app/(auth)/projetos/minhas-tarefas/page.tsx`

### Build
✅ Passou sem erros

### Próximo item
**Ciclo 2 — Subtask Management Avançado:** Na task detail/sheet: criar subtasks inline, checkbox de conclusão, progress bar do parent baseada em subtasks completas, drag-reorder subtasks.

---

## Ciclo 2 — 2026-03-15

**Itens concluídos:** F04, F06, F10

### F04 — Progress bar visual inline na task row
**O que foi feito:** Em `project-task-row.tsx`, o contador de subtarefas (antes apenas texto `X/Y`) foi substituído por uma barra de progresso horizontal (h-1) com cor dinâmica: azul durante andamento, verde quando 100% concluído. Tooltip mostra "X de Y subtarefas concluídas". Layout do título ajustado para flex-col para acomodar a barra abaixo do título.
**Arquivos modificados:** `features/projects/components/tabs/project-task-row.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### F06 — Range de datas `start_date → due_date` + badge overdue na task row
**O que foi feito:** Substituído o componente `TaskDateCell` por `TaskDateRangeCell`. Quando a task tem `start_date` e `due_date`, exibe o range formatado "15 Mar → 28 Mar" com uma barra temporal colorida (azul → âmbar quando >75%, vermelha quando overdue). Quando só `due_date`, exibe o formato antigo. Badge "Atrasada" (chip vermelho com ícone `IconAlertTriangle`) adicionado inline no título da task quando `overdue && !done`. Coluna de data alargada de `w-[120px]` para `w-[160px]`.
**Arquivos modificados:** `features/projects/components/tabs/project-task-row.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### F10 — Badge overdue automático no project-card.tsx (nível projeto)
**O que foi feito:** Em `project-card.tsx`, adicionado cálculo de `projectOverdue`: `due_date_end < hoje && status !== 'finalizado' && !isToday`. Badge "Atrasado" (chip vermelho) exibido no rodapé do card ao lado da data, e a data também fica vermelha. Usa `isPast` e `isToday` do `date-fns`. Cálculo 100% client-side, sem Edge Function.
**Arquivos modificados:** `features/projects/components/project-card.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Observações sobre itens já implementados
- **F07** (Rich text em descrições): Já implementado — `task-detail-description.tsx` usa `TaskDescriptionEditor` com TipTap.
- **F08** (Comentários): Já implementado — `CommentThread` + `useComments` + `comment-item.tsx` já existem e estão conectados ao task detail sheet.
- **T08** (Subtask inline avançado): Já implementado — `task-subtasks-section.tsx` tem D&D + progress bar + inline add + checkbox.

### Próximos sugeridos
- **F01** — Resize de colunas no cabeçalho (arrastar borda do `<th>` para redimensionar)
- **F02** — PropertyEditor na aba Configurações do projeto (integrar editor de status/priority)
- **F03** — Kanban de tarefas com colunas dinâmicas (board interno de tasks do projeto)

---

## Ciclo 3 — 2026-03-15

**Itens concluídos:** F01, F02, F03

### F01 — Resize de colunas no cabeçalho de tarefas
**O que foi feito:** Adicionado redimensionamento de colunas por arrastar na borda direita do cabeçalho. `ColumnConfig` agora usa `defaultWidth` numérico, `minWidth`, e flags `flex`/`resizable`. Colunas Status, Prioridade, Responsável e Prazo são redimensionáveis (min 80px). Coluna Título permanece flex-1. Handler `handleStartResize` captura mousedown/mousemove/mouseup e atualiza `columnWidths` state. Larguras inline via `style` sincronizadas entre header (`project-task-list.tsx`) e cells (`project-task-row.tsx`) via prop `columnWidths`. Cursor muda para `col-resize` durante arrasto.
**Arquivos modificados:** `features/projects/components/tabs/project-task-list.tsx`, `features/projects/components/tabs/project-task-row.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros
**Nota:** Persistência Supabase das larguras pendente — atualmente mantém no state da sessão.

### F02 — PropertyEditor exposto na aba Configurações do projeto
**O que foi feito:** Adicionada aba "Configurações" no topbar do projeto detail (entre Dashboard e Portal). Componente `ProjectSettings` com duas seções: Editor de Status e Editor de Prioridades, cada um abrindo o `PropertyEditor` existente via Sheet. Permite gerenciar os status e prioridades customizados do projeto sem sair da página.
**Arquivos criados:** `features/projects/components/tabs/project-settings.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### F03 — Kanban colunas dinâmicas + aba Board no detalhe do projeto
**O que foi feito:** (1) `TaskBoard` agora usa `usePropertyOptions("status")` para gerar colunas dinamicamente em vez de `BOARD_COLUMNS` hardcoded. Fallback para `TASK_STATUS` enquanto carrega. `useMemo` para colunas e `tasksByStatus`. (2) Adicionada aba "Board" no topbar do projeto detail (com ícone `IconLayoutKanban`). (3) Criado wrapper `ProjectTaskBoard` que carrega tasks do projeto via `useProjectTasks` e renderiza o `TaskBoard`.
**Arquivos criados:** `features/projects/components/tabs/project-task-board.tsx`
**Arquivos modificados:** `features/tasks/components/task-board.tsx`, `features/projects/components/project-topbar.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Observações sobre itens já implementados
- **F05** (D&D em subtarefas): Já implementado — `task-subtasks-section.tsx` já tem DnD com dnd-kit, SortableContext, optimistic update, reorder persistido e error rollback.

### Próximos sugeridos
- **F09** — @Mentions em comentários (picker de membros ao digitar @)
- **V01** — Vista Calendário de Tarefas (grid mensal com tasks por due_date)
- **T01** — Aprovações inline com chips coloridos (pending/approved/changes_requested)
- **P02** — Tags globais (tabela + UI de chip picker + filtro na toolbar)

---

## Ciclo 4 — 2026-03-15

**Itens concluídos:** T01, T02, T03, A07, V01

### T01 — Aprovações inline (chips coloridos)
**O que foi feito:** Adicionado campo `approval_status` (`none|pending|approved|changes_requested`) na tabela `os_tasks`. Constante `TASK_APPROVAL_STATUS` em `constants.ts` com cores: amarelo=pending, verde=approved, vermelho=changes_requested. Badge colorido inline no título da task em `project-task-row.tsx`. Componente `TaskApprovalSelect` no task detail sheet (dropdown para alterar status de aprovação). Ícones contextuais (check para approved, message para changes_requested).
**Arquivos criados:** `features/tasks/components/task-approval-select.tsx`
**Arquivos modificados:** `lib/constants.ts`, `lib/supabase/types.ts`, `features/projects/components/tabs/project-task-row.tsx`, `features/tasks/components/task-detail-fields.tsx`
**Migration:** `20260315_add_task_approval_milestone_effort.sql`
**Build:** ✅ Passou sem erros

### T02 — Milestones (diamante na lista)
**O que foi feito:** Adicionado campo `is_milestone: boolean` na tabela `os_tasks`. Ícone diamante (◇) âmbar exibido inline no título da task em `project-task-row.tsx` quando `is_milestone=true`. Tooltip "Marco". Toggle switch no task detail sheet via componente `TaskMilestoneToggle`.
**Arquivos criados:** `features/tasks/components/task-milestone-toggle.tsx`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/components/tabs/project-task-row.tsx`, `features/tasks/components/task-detail-fields.tsx`
**Migration:** `20260315_add_task_approval_milestone_effort.sql` (mesma)
**Build:** ✅ Passou sem erros

### T03 — Estimativa de esforço (estimated/logged hours)
**O que foi feito:** Adicionados campos `estimated_hours: numeric` e `logged_hours: numeric` na tabela `os_tasks`. Badge inline no título da task em `project-task-row.tsx`: "Xh / Yh" ou "Xh est." com tooltip detalhado. Componente `TaskEffortFields` no task detail sheet com inputs numéricos editáveis inline (estimado / registrado).
**Arquivos criados:** `features/tasks/components/task-effort-fields.tsx`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/components/tabs/project-task-row.tsx`, `features/tasks/components/task-detail-fields.tsx`
**Migration:** `20260315_add_task_approval_milestone_effort.sql` (mesma)
**Build:** ✅ Passou sem erros

### A07 — Status do projeto calculado (health badge)
**O que foi feito:** Constante `PROJECT_HEALTH` com 3 estados: `on_track` (verde), `at_risk` (amarelo, >20% tasks atrasadas), `off_track` (vermelho, >50% atrasadas). Função `computeProjectHealth()` em `constants.ts`. Em `project-card.tsx`, hook `useProjectTaskStats` carrega stats e exibe badge de saúde no card — badge oculto quando `on_track` para evitar ruído visual. Projetos finalizados não carregam stats.
**Arquivos modificados:** `lib/constants.ts`, `features/projects/components/project-card.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### V01 — Vista Calendário de Tarefas
**O que foi feito:** Componente `ProjectCalendar` com grid mensal puro (CSS grid 7 colunas). Tasks plotadas por `due_date` com chip colorido por status (border-left). Navegação mês anterior/próximo/hoje. Dia atual com highlight azul. Máximo 3 tasks visíveis por célula + "+N mais". Click em task abre task detail sheet. Tooltip com título, status e responsável. Aba "Calendário" adicionada no topbar do projeto detail entre Gantt e Arquivos.
**Arquivos criados:** `features/projects/components/tabs/project-calendar.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **F09** — @Mentions em comentários (picker de membros ao digitar @)
- **T04** — Tarefas recorrentes (recurrence field + auto-create next)
- **P02** — Tags globais (tabela + UI de chip picker + filtro na toolbar)
- **V02** — Vista Calendário Global (cross-projeto)
- **R01** — Status update narrativo (aba Updates)

---

## Ciclo 5 — 2026-03-15

**Itens concluídos:** T04, T06, V04, UX03

### T04 — Tarefas recorrentes (recurrence field + auto-create next)
**O que foi feito:** Adicionado campo `recurrence` (`none|daily|weekly|monthly`) na tabela `os_tasks`. Constante `TASK_RECURRENCE` em `constants.ts`. Badge inline na task row mostrando tipo de recorrência (ícone `IconRepeat` + label). Componente `TaskRecurrenceSelect` no task detail sheet (dropdown). Lógica de auto-criação: ao completar uma task com recorrência ativa, `updateTask()` em `tasks.ts` cria automaticamente a próxima instância com `due_date` e `start_date` recalculados.
**Arquivos criados:** `features/tasks/components/task-recurrence-select.tsx`
**Arquivos modificados:** `lib/constants.ts`, `lib/supabase/types.ts`, `features/tasks/services/tasks.ts`, `features/projects/services/project-tasks.ts`, `features/tasks/components/task-detail-fields.tsx`, `features/projects/components/tabs/project-task-row.tsx`
**Migration:** `20260315_add_task_recurrence.sql`
**Build:** ✅ Passou sem erros

### T06 — Promoção subtarefa → task principal
**O que foi feito:** Menu de contexto (3 pontinhos) no hover de cada subtask row (`project-subtask-row.tsx`). Opção "Tornar tarefa principal" com ícone `IconArrowUp`. Ao clicar, seta `parent_id: null` via `useUpdateTask`, invalida caches relevantes (`project-tasks`, `subtasks`, `tasks`) e exibe toast contextual "Subtarefa promovida — '{título}' agora é uma tarefa principal".
**Arquivos modificados:** `features/projects/components/tabs/project-subtask-row.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### V04 — Vista Galeria de Projetos
**O que foi feito:** Novo modo de visualização "Galeria" no hub `/projetos`. Adicionado `gallery` ao tipo `ViewMode` no `ViewToggle` (ícone `IconLayoutGrid`). Componente `ProjectGallery` com grid responsivo (2→5 colunas). Cada card exibe: thumbnail com gradiente gerado a partir do nome + iniciais, status badge, barra de progresso (% de tasks concluídas via `useProjectProgress`), BUs com cores, avatar do owner com tooltip. Hover com shadow + border highlight.
**Arquivos criados:** `features/projects/components/project-gallery.tsx`
**Arquivos modificados:** `components/shared/view-toggle.tsx`, `app/(auth)/projetos/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### UX03 — Empty states inspiradores
**O que foi feito:** Redesign do componente base `EmptyState`: ícone maior em container arredondado (`rounded-2xl bg-muted/60 p-5`), padding aumentado (`py-16`), tipografia refinada, botão CTA com ícone (default `IconPlus`), prop `compact` para contextos inline. Prop `cta.icon` para ícone customizado. Atualizados 3 empty states do módulo de projetos: (1) Hub `/projetos` — "Comece criando seu primeiro projeto" com ícone `IconFolderPlus`, (2) Lista `/projetos/lista` — mensagem dinâmica com ícone `IconFilterOff` quando filtros ativos, (3) Task list no projeto detail — "Adicione a primeira tarefa do projeto" com CTA claro.
**Arquivos modificados:** `components/shared/empty-state.tsx`, `app/(auth)/projetos/page.tsx`, `app/(auth)/projetos/lista/page.tsx`, `features/projects/components/tabs/project-task-list.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Observações
- **F09** (Mentions em comentários): Pendente — requer extensão TipTap `@tiptap/extension-mention`
- **T04** auto-cria próxima instância no `onSuccess` do `updateTask` (server-side no service layer)

### Próximos sugeridos
- **F09** — @Mentions em comentários (picker de membros ao digitar @)
- **P02** — Tags globais (tabela + UI de chip picker + filtro na toolbar)
- **R01** — Status update narrativo (aba Updates no projeto detail)
- **R02** — Dashboard de reporting real (gráficos Recharts no projeto detail)
- **CF01** — Aba Configurações completa do projeto

---

## Ciclo 6 — 2026-03-15

**Itens concluídos:** R01, CF01, V02, R02

### R01 — Status update narrativo (aba Updates)
**O que foi feito:** Nova aba "Updates" no topbar do projeto detail (ícone `IconSpeakerphone`). Componente `ProjectUpdates` com formulário de composição: selector de saúde (chips On track/At Risk/Off track) + textarea para conteúdo. Feed de updates publicados com avatar, data, badge de saúde e botão delete (apenas para autor). Empty state com CTA claro. Service layer + hook com React Query. Migration para tabela `project_status_updates`.
**Arquivos criados:** `features/projects/services/project-status-updates.ts`, `features/projects/hooks/use-project-status-updates.ts`, `features/projects/components/tabs/project-updates.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** `20260315_create_project_status_updates.sql`
**Build:** ✅ Passou sem erros

### CF01 — Aba Configurações completa do projeto
**O que foi feito:** Reescrita completa do `ProjectSettings` com 5 seções: (1) Status — PropertyEditor existente, (2) Prioridades — PropertyEditor existente, (3) Seções — listar/renomear/colorir/deletar seções do projeto com inline editing e color picker, (4) Integrações — Notion URL e Google Drive folder com salvar, (5) Danger zone — pausar e excluir projeto com confirm dialog. Seções usam os hooks `useCreateProjectSection`, `useUpdateProjectSection`, `useDeleteProjectSection` já existentes.
**Arquivos modificados:** `features/projects/components/tabs/project-settings.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### V02 — Vista Calendário Global cross-projeto
**O que foi feito:** Substituído placeholder de `/projetos/calendario` por calendário real. Grid mensal com todas as tasks cross-projeto usando `useTasks()` + `useProjects()`. Filtros por BU e por projeto (selects). Tasks exibidas como chips com border-left colorida por status. Tooltip com nome do projeto, status e responsável. Badge com contagem de tasks por dia. Navegação mês anterior/próximo/hoje.
**Arquivos modificados:** `app/(auth)/projetos/calendario/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### R02 — Dashboard de reporting real (gráficos Recharts)
**O que foi feito:** Componente `ProjectDashboard` substitui a duplicação da Overview na aba Dashboard. Inclui: (1) 4 number tiles (Total, Concluídas com %, Em Andamento, Atrasadas), (2) Donut chart de distribuição por status (Recharts PieChart), (3) Bar chart horizontal de distribuição por prioridade (Recharts BarChart), (4) Line chart de tarefas concluídas por semana — últimas 6 semanas (Recharts LineChart). Cores sincronizadas com constantes `TASK_STATUS` e `TASK_PRIORITY`.
**Arquivos criados:** `features/projects/components/tabs/project-dashboard.tsx`
**Arquivos modificados:** `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Observações
- **P02** (Tags globais): Já implementado em ciclos anteriores — service `task-tags.ts`, hooks `use-task-tags.ts`, componentes `TaskTagPicker` + `TaskTagsDisplay`, schema `schemas/tag.ts`.

### Próximos sugeridos
- **F09** — @Mentions em comentários (picker de membros ao digitar @)
- **R03** — Burn-up chart no Dashboard do projeto
- **V05** — Sidebar Favoritos (estrela no project card)
- **R05** — Vista Portfolio (grid cross-projeto com % e saúde)
- **TM01** — Biblioteca de templates funcional

---

## Ciclo 7 — 2026-03-15

**Itens concluídos:** R03, R07, V05, R05, TM01

### F09 — @Mentions em comentários (já implementado)
**O que foi feito:** Verificação — sistema completo já existia: `@tiptap/extension-mention` instalado, `useMentionProvider` (busca pessoas/projetos/tasks), `mention-suggestion.tsx` (dropdown com keyboard nav e ícones por tipo), `CommentComposer` já passa `mentionProvider` ao `RichTextEditor`, `extractMentionIds` no hook de comments extrai IDs e notifica. Nada a fazer.
**Build:** ✅ Já passava

### R03 — Burn-up chart no Dashboard do projeto
**O que foi feito:** Gráfico de área (Recharts `AreaChart`) com duas linhas acumulativas: "Planejadas" (azul) = tasks criadas até cada semana, "Concluídas" (verde) = tasks completadas até cada semana. Últimas 8 semanas. Legend e tooltip integrados.
**Arquivos modificados:** `features/projects/components/tabs/project-dashboard.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### R07 — Métricas de velocidade
**O que foi feito:** Card "Velocidade" no Dashboard com: média de tasks/semana (últimas 8 semanas), previsão de conclusão ("~N semanas para concluir X restantes"), bar chart (roxo) mostrando tasks concluídas por semana.
**Arquivos modificados:** `features/projects/components/tabs/project-dashboard.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### V05 — Sidebar Favoritos (estrela no project card)
**O que foi feito:** Botão estrela no hover de cada `ProjectCard` (ícones `IconStar`/`IconStarFilled`). Hook `useProjectFavorites` (query) + `useToggleFavorite` (mutation com optimistic update). Seção "Favoritos" no topo da hub `/projetos` quando existirem favoritos — grid de cards com ícone âmbar.
**Arquivos criados:** `features/projects/hooks/use-project-favorites.ts`
**Arquivos modificados:** `features/projects/components/project-card.tsx`, `app/(auth)/projetos/page.tsx`
**Migration:** `20260315_create_user_project_favorites.sql` (tabela `user_project_favorites` com RLS)
**Build:** ✅ Passou sem erros

### R05 — Vista Portfolio
**O que foi feito:** Página `/projetos/portfolio` com tabela cross-projeto. Colunas: Projeto (nome + owner), BU, Status, Saúde (calculada via `computeProjectHealth`), Prazo, Progresso (barra + %). Filtros por BU e Status (Select dropdowns). Cada row é clicável e navega ao projeto. Health badges com cores dinâmicas.
**Arquivos criados:** `app/(auth)/projetos/portfolio/page.tsx`
**Arquivos modificados:** —
**Migration:** —
**Build:** ✅ Passou sem erros

### TM01 — Biblioteca de templates funcional
**O que foi feito:** Substituído placeholder de `/projetos/templates`. Grid de cards dos 4 templates (Lançamento Imobiliário, Branding, Social Media, Audiovisual). Cada card exibe: ícone, nome, categoria (badge), descrição, contagem de seções/tarefas, barra de cores das seções. Click abre Sheet de preview com: todas as seções expandidas, lista de tasks com checkbox visual e badge de prioridade colorido, botão "Usar Template" que redireciona para `/projetos?template=ID`.
**Arquivos modificados:** `app/(auth)/projetos/templates/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **F09** (Mentions) — ✅ Já implementado
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **T07** — Templates de tarefa (salvar task como template)
- **P02** — Tags globais (já implementado em ciclos anteriores)
- **R04** — Relatório de tasks atrasadas
- **CF02** — Atalhos de teclado (kbar)

---

## Ciclo 8 — 2026-03-15

**Itens concluídos:** R04, TM02, TM03, UX06, V06

### R04 — Relatório de tasks atrasadas
**O que foi feito:** Nova aba "Atrasadas" no topbar do projeto detail (ícone `IconAlertTriangle`). Componente `ProjectOverdueReport` com: tabela filtrada de tasks com `due_date < today && !is_completed`. Colunas: Tarefa, Seção, Responsável, Prazo, Dias de Atraso (badge vermelho), Prioridade. Filtros por responsável e prioridade. Ordenação por dias de atraso, prioridade, responsável ou prazo. Botão "Exportar CSV" gera arquivo com BOM UTF-8. Click em row abre task detail sheet. Empty state quando sem atrasadas.
**Arquivos criados:** `features/projects/components/tabs/project-overdue-report.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### TM02 — Salvar projeto como template
**O que foi feito:** Função `saveProjectAsTemplate()` no service de templates — carrega seções e tasks do projeto, monta estrutura `TemplateSection[]` (sem assignees/datas), insere na tabela `project_templates`. Função `getSavedTemplates()` para listar templates salvos. Hook `useSaveProjectAsTemplate()` com toast de sucesso/erro. Hook `useSavedTemplates()` com React Query. Menu item "Salvar como template" no dropdown do topbar do projeto (ícone `IconTemplate`).
**Arquivos criados:** —
**Arquivos modificados:** `features/projects/services/project-templates.ts`, `features/projects/hooks/use-project-templates.ts`, `features/projects/components/project-topbar.tsx`
**Migration:** `20260315_create_project_templates.sql` (tabela `project_templates` com RLS)
**Build:** ✅ Passou sem erros

### TM03 — Duplicar projeto com opções
**O que foi feito:** Menu "Duplicar projeto" agora abre dialog com 4 checkboxes: ☑ Copiar seções, ☑ Copiar tarefas, ☐ Copiar responsáveis, ☐ Copiar datas. Ao confirmar, cria projeto base, depois duplica seções com mapeamento de IDs, e opcionalmente tasks (com section_id remapeado). Assignees e datas são copiados apenas se marcados. Tasks duplicadas sempre iniciam com status "pendente" e `is_completed: false`.
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### UX06 — Toasts contextuais em todas as mutations de tarefas
**O que foi feito:** Adicionado `useToast()` em `useCreateTask`, `useUpdateTask` e `useDeleteTask`. Toasts de sucesso contextuais: "Tarefa criada — '{título}'", "Tarefa movida para {status}", "Tarefa atribuída a {nome}", "Tarefa concluída — '{título}'", "Prioridade atualizada", "Prazo atualizado", "Tarefa excluída". Toasts de erro com mensagem específica + "Tente novamente". Mudanças menores (descrição etc.) não geram toast para evitar ruído.
**Arquivos modificados:** `features/tasks/hooks/use-tasks.ts`
**Migration:** —
**Build:** ✅ Passou sem erros

### V06 — My Tasks melhorado com agrupamento por data
**O que foi feito:** Adicionados chips de agrupamento rápido no header da página `/tarefas`: "Por prazo" (agrupa em Atrasadas/Hoje/Esta semana/Próxima semana/Mais tarde/Sem prazo), "Por seção" (manual), "Por projeto". Cada chip ativa automaticamente o sort e group_by correspondente. Visual: chip ativo com bg primary/10 e text primary. O agrupamento por data já existia em `groupTasksDynamic()` — os chips expõem como acesso direto.
**Arquivos modificados:** `app/(auth)/tarefas/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **T07** — Templates de tarefa (salvar task como template)
- **CF02** — Atalhos de teclado (kbar)
- **CF03** — Personalizar colunas da task list
- **C01** — Task Followers (botão "Seguir" + notificações)

---

## Ciclo 9 — 2026-03-15

**Itens concluídos:** T07, CF03, UX04, UX05, R06

### T07 — Templates de tarefa (salvar task como template, picker)
**O que foi feito:** Criada tabela `task_templates` com RLS. Service `task-templates.ts` com CRUD completo. Hooks `useTaskTemplates`, `useSaveTaskAsTemplate`, `useDeleteTaskTemplate`. Componente `TaskTemplatePicker` (popover com lista de templates salvos, badges de prioridade/subtarefas/horas, delete inline). Botão "Template" no rodapé da task list cria tarefa + subtarefas automaticamente a partir do template selecionado. Empty state orientador quando sem templates.
**Arquivos criados:** `features/tasks/services/task-templates.ts`, `features/tasks/hooks/use-task-templates.ts`, `features/tasks/components/task-template-picker.tsx`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/components/tabs/project-task-list.tsx`
**Migration:** `20260315_create_task_templates.sql`
**Build:** ✅ Passou sem erros

### CF03 — Personalizar colunas da task list (toggle on/off + reorder)
**O que foi feito:** Adicionado botão "Personalizar colunas" (ícone `IconColumns`) no header da task list. Abre Sheet lateral com lista de todas as colunas: toggle on/off via `Switch` (título sempre visível), setas cima/baixo para reordenar. State `hiddenColumns` (Set) e `columnOrder` (array). `visibleColumns` memo filtra e ordena dinamicamente. Header e rows da task list agora usam `visibleColumns` em vez de `COLUMNS` fixo.
**Arquivos modificados:** `features/projects/components/tabs/project-task-list.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### UX04 — Loading skeletons content-aware
**O que foi feito:** (1) Task list skeleton: toolbar com 3 blocos de tamanho real, header de tabela com colunas esqueletizadas (checkbox, título, status, prioridade, responsável, prazo), 8 rows com widths variados simulando dados reais, avatares circulares e badges arredondados. (2) Projeto detail page: skeleton de topbar com ícone + título + descrição + botão, tabs com 7 blocos, conteúdo em grid 3 colunas com cards e blocos laterais.
**Arquivos modificados:** `features/projects/components/tabs/project-task-list.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### UX05 — Animações e transições (Framer Motion)
**O que foi feito:** (1) Tab change: `AnimatePresence` + `motion.div` com fade + slide vertical (duration 0.15s, ease-out) no content area do projeto detail. (2) Task row hover: `motion.div` com `whileHover` que faz lift sutil (y: -1) + box-shadow leve (duration 0.15s). (3) Drag overlay: `scale-[1.02]` + `shadow-xl` para feedback visual durante arraste. Tokens seguem o padrão: fast=0.15s.
**Arquivos modificados:** `app/(auth)/projetos/[id]/page.tsx`, `features/projects/components/tabs/project-task-row.tsx`, `features/projects/components/tabs/project-task-list.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### R06 — Workload por colaborador (heatmap semanal)
**O que foi feito:** Nova página `/projetos/workload` com heatmap semanal. Eixo Y = membros da equipe (via `useTeamMembers`), eixo X = 8 semanas. Cada célula mostra soma de `estimated_hours` das tasks com `due_date` naquela semana para aquele membro. Cores heat: azul claro (≤4h) → azul médio (≤8h) → azul escuro (≤16h) → âmbar (≤24h) → vermelho (>24h). Tooltip com detalhes. Click na célula expande lista de tarefas da semana/membro abaixo do heatmap. Navegação temporal: botões anterior/hoje/próximo para navegar entre blocos de 8 semanas.
**Arquivos criados:** `app/(auth)/projetos/workload/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **CF02** — Atalhos de teclado (kbar)
- **C01** — Task Followers (botão "Seguir" + notificações)
- **V03** — Vista Timeline cross-projeto (Gantt de projetos)
- **A01** — Motor de regras (Rules Engine)

---

## Ciclo 10 — 2026-03-15

**Itens concluídos:** CF02, UX01, CF05, C05, V03

### CF02 — Atalhos de teclado (command palette com kbar)
**O que foi feito:** Criado componente `CommandPalette` com `KBarProvider` + `KBarPortal` + `KBarSearch` + `KBarResults`. Registradas ações: navegação para todas as rotas de `NAV_ITEMS`, ações rápidas (criar projeto), navegação de projetos (Lista, Gantt, Calendário, Portfolio, Workload, Templates, Minhas Tarefas) com shortcuts de teclado (c para criar, g+l para lista, g+g para gantt, etc.). Integrado no `Providers` global para funcionar em toda a aplicação. Ativado via Ctrl+K / Cmd+K.
**Arquivos criados:** `components/shared/command-palette.tsx`
**Arquivos modificados:** `components/providers.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### UX01 — Botão Compartilhar funcional
**O que foi feito:** Botão "Compartilhar" no topbar do projeto agora abre Sheet lateral com: (1) Link do projeto com botão "Copiar" (clipboard API, feedback visual com ícone check), (2) Botão "Imprimir / Salvar como PDF" via `window.print()`. Adicionados estados `shareOpen` e `linkCopied`, handlers `handleCopyLink` e `handlePrint`.
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### CF05 — Configurações globais do módulo projetos
**O que foi feito:** Substituído placeholder de `/projetos/configuracoes` por página funcional com 4 seções em grid: (1) Status — lista os status configurados com chips coloridos + botão "Gerenciar" que abre PropertyEditor, (2) Prioridades — idem com PropertyEditor de priority, (3) Templates — link para `/projetos/templates`, (4) Notificações — informativo sobre notificações automáticas. Cada seção é um card com header + conteúdo.
**Arquivos modificados:** `app/(auth)/projetos/configuracoes/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### C05 — Menções em descrições (TipTap @mention)
**O que foi feito:** Adicionado suporte a `@mentions` no componente base `RichTextEditor` (`components/ui/rich-text-editor.tsx`). Nova prop `mentionProvider?: MentionDataProvider` que, quando presente, configura a extensão `@tiptap/extension-mention` com o `createMentionSuggestion` já existente. Reutiliza toda a infra de mentions já implementada (dropdown, keyboard nav, ícones por tipo). Agora qualquer editor que use o RichTextEditor base pode habilitar mentions passando um provider.
**Arquivos modificados:** `components/ui/rich-text-editor.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### V03 — Vista Timeline cross-projeto
**O que foi feito:** Substituído placeholder de `/projetos/timeline` por Gantt CSS puro de projetos. Exibe janela de 3 meses (mês anterior, atual, próximo) com navegação. Barras horizontais coloridas por status do projeto. Projetos agrupados por BU com header de grupo. Filtro por BU via Select. Cada row mostra: nome do projeto + owner na coluna esquerda (200px), barra temporal posicionada proporcionalmente no grid de semanas. Tooltip com nome, datas e responsável. Click na row navega ao projeto. Week headers com highlight do período atual.
**Arquivos modificados:** `app/(auth)/projetos/timeline/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **C01** — Task Followers (botão "Seguir" + notificações)
- **A01** — Motor de regras (Rules Engine)
- **CF02** — Atalhos de teclado já implementado ✅
- **CF04** — Busca avançada (modal global com filtros combinados)
- **P01** — Campos customizados por projeto

---

## Ciclo 11 — 2026-03-15

**Itens concluídos:** CF04, C01, C02, CL01, P05

### CF04 — Busca avançada (modal global com filtros combinados)
**O que foi feito:** Criado componente `ProjectSearchDialog` com: campo de texto livre (busca por nome, descrição, responsável), filtros combináveis em painel retrátil (status multi-select com chips coloridos, prioridade multi-select, responsável via Select, projeto, BU, range de datas). Resultados com dot de status, badges de status/prioridade, nome do projeto e data. Máximo 50 resultados. Integrado no `Providers` global para funcionar em qualquer página. Ação "Busca avançada de tarefas" registrada no command palette (kbar) — dispara via `CustomEvent`. Badge de contagem de filtros ativos.
**Arquivos criados:** `features/projects/components/project-search-dialog.tsx`
**Arquivos modificados:** `components/providers.tsx`, `components/shared/command-palette.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### C01 — Task Followers (botão Seguir + tabela)
**O que foi feito:** Tabela `task_followers` com RLS. Service `task-followers.ts` com `getTaskFollowers`, `followTask`, `unfollowTask`. Hooks React Query: `useTaskFollowers`, `useFollowTask`, `useUnfollowTask` com toasts contextuais. Componente `TaskFollowButton` com toggle Seguir/Seguindo (ícones `IconBell`/`IconBellOff`), contagem de seguidores, tooltip explicativo. Botão integrado no `TaskDetailHeader` entre status e ações.
**Arquivos criados:** `features/tasks/services/task-followers.ts`, `features/tasks/hooks/use-task-followers.ts`, `features/tasks/components/task-follow-button.tsx`
**Arquivos modificados:** `features/tasks/components/task-detail-header.tsx`, `lib/supabase/types.ts`
**Migration:** `20260315_create_task_followers_and_reactions.sql`
**Build:** ✅ Passou sem erros

### C02 — Reações em comentários (emoji picker)
**O que foi feito:** Tabela `comment_reactions` com constraint unique (comment_id, user_id, emoji) e RLS. Service `comment-reactions.ts` com `getCommentReactions` (agrupamento por emoji) e `toggleReaction` (add/remove). Hook `useCommentReactions` + `useToggleReaction` com optimistic update completo (add, remove, rollback). Componente `CommentReactions` com: reações existentes como chips clicáveis (border azul se é minha reação), botão "+" que abre popover com 8 emojis rápidos (👍 ❤️ 🎉 👀 💯 🚀 🔥 🤔). Integrado após os botões Responder/Like de cada `CommentItem`.
**Arquivos criados:** `features/tasks/services/comment-reactions.ts`, `features/tasks/hooks/use-comment-reactions.ts`, `features/tasks/components/comment-reactions.tsx`
**Arquivos modificados:** `components/shared/comment-item.tsx`, `lib/supabase/types.ts`
**Migration:** `20260315_create_task_followers_and_reactions.sql` (mesma)
**Build:** ✅ Passou sem erros

### CL01 — Portal do cliente real (aba Portal no detail)
**O que foi feito:** Componente `ProjectPortal` substituiu o placeholder na aba Portal. Exibe: header com ícone e descrição, card de progresso geral (barra de progresso + % + badge de saúde computado via `computeProjectHealth`), 4 stat cards (total, concluídas, em andamento, atrasadas), último status update (badge de saúde + conteúdo + data), lista de entregas (tasks em andamento, revisão ou concluídas) com checkbox visual, badge de status e data. Empty state quando sem entregas. Loading skeleton.
**Arquivos criados:** `features/projects/components/tabs/project-portal.tsx`
**Arquivos modificados:** `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### P05 — Campo URL com preview (favicon + título)
**O que foi feito:** Componente `UrlFieldPreview` que renderiza URLs com: favicon via Google Favicons API (`google.com/s2/favicons`), domínio formatado (sem www.), ícone de link externo, borda sutil com hover. Tooltip com URL completa. Clique abre em nova aba. Fallback para URL inválida (exibe texto puro). Pronto para ser utilizado em campos customizados tipo URL e no task detail quando campo URL for implementado.
**Arquivos criados:** `features/tasks/components/url-field-preview.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **A01** — Motor de regras (Rules Engine)
- **A04** — Inbox / Centro de notificações
- **CL02** — Link público do portal
- **P01** — Campos customizados por projeto

---

## Ciclo 12 — 2026-03-15

**Itens concluídos:** CL02, CL03, C03, UX02

### CL02 — Link público do portal do projeto
**O que foi feito:** Rota pública `/portal/projeto/[token]` (Server Component, sem auth). Busca projeto por `portal_token` via `createServiceClient()`. Exibe: header com nome/cliente/datas, card de progresso com barra e badge de saúde, último status update, lista de entregas com ícones por status. Layout limpo e profissional para o cliente. Na Share Sheet do topbar do projeto: seção "Link do Portal do Cliente" com botão para gerar token (`crypto.randomUUID()`) e copiar URL. Se já tem token, mostra URL + copiar.
**Arquivos criados:** `app/(public)/portal/projeto/[token]/page.tsx`, `app/(public)/portal/projeto/[token]/portal-view.tsx`, `app/(public)/portal/projeto/[token]/layout.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`
**Migration:** `20260315_add_project_portal_token.sql`
**Build:** ✅ Passou sem erros

### CL03 — Aprovação pelo cliente no portal público
**O que foi feito:** Campos `requires_client_approval`, `client_approval_status` (check constraint: none/pending/approved/rejected), `client_approval_comment`, `client_approval_at` na tabela `os_tasks`. No portal público: tasks com `requires_client_approval` exibem botão "Aprovar / Rejeitar" que expande formulário inline com textarea de comentário + botões Aprovar (verde) / Rejeitar (vermelho). Após ação, exibe badge colorido com status. API Route `POST /api/portal/approve` valida token, verifica que task pertence ao projeto e requer aprovação, atualiza campos.
**Arquivos criados:** `app/api/portal/approve/route.ts`
**Arquivos modificados:** `app/(public)/portal/projeto/[token]/portal-view.tsx`
**Migration:** `20260315_add_project_portal_token.sql` (mesma)
**Build:** ✅ Passou sem erros

### C03 — Histórico de tarefa com diff visual
**O que foi feito:** Service `task-history.ts` que consulta `audit_log` filtrado por `entity_type=os_tasks` + `entity_id=taskId`. Hook `useTaskHistory` com lazy loading (enabled quando seção está aberta). Componente `TaskHistoryTimeline` com: toggle colapsável "Histórico" com ícone, timeline vertical com dot + iniciais do usuário, timestamps relativos (`formatDistanceToNow` pt-BR), diffs por campo: old value em vermelho com strikethrough, new value em verde, status changes com badges coloridos do `TASK_STATUS`, descriptions mostram "alterada" sem dump de conteúdo, booleans mostram Sim/Não. Labels em português para 15+ campos. Hook `useUpdateTask` atualizado para construir `beforeState` correto para o audit trail. Integrado no task detail sheet após comentários.
**Arquivos criados:** `features/tasks/services/task-history.ts`, `features/tasks/hooks/use-task-history.ts`, `features/tasks/components/task-history-timeline.tsx`
**Arquivos modificados:** `features/tasks/hooks/use-tasks.ts`, `features/tasks/components/task-detail-sheet.tsx` (ou task-detail-fields.tsx)
**Migration:** —
**Build:** ✅ Passou sem erros

### UX02 — Botão Ask AI funcional no projeto
**O que foi feito:** API Route `POST /api/ai/project-chat` que usa `@anthropic-ai/sdk` com model `claude-haiku-4-5-20251001`. System prompt em PT-BR injetado com dados do projeto (total, concluídas, atrasadas, em andamento, 15 tarefas recentes). Componente `ProjectAiSheet` com: Sheet lateral (420px), empty state com ícone sparkles e 3 chips de perguntas sugeridas ("Qual o status geral?", "Quais tasks estão atrasadas?", "Sugestões para acelerar?"), chat com bolhas user (direita) e assistant (esquerda), loading com dots animados, textarea com Enter para enviar / Shift+Enter para newline, auto-scroll e auto-focus. Botão "Ask AI" no topbar agora abre o sheet.
**Arquivos criados:** `app/api/ai/project-chat/route.ts`, `features/projects/components/project-ai-sheet.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`
**Migration:** —
**Dependência:** `@anthropic-ai/sdk` (instalada)
**Build:** ✅ Passou sem erros

### Itens já implementados verificados
- **F09** (Mentions) — ✅ Já implementado (ciclo 7)
- **P02** (Tags) — ✅ Já implementado (ciclos anteriores)

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **A01** — Motor de regras (Rules Engine)
- **A04** — Inbox / Centro de notificações
- **P01** — Campos customizados por projeto
- **A02** — Regra: seção com campos default

---

## Ciclo 13 — 2026-03-15

**Itens concluídos:** AI01, AI02, AI03

### AI01 — Sugestão de subtarefas com IA
**O que foi feito:** Botão "Sugerir subtarefas com IA" (ícone `IconSparkles`) no `TaskSubtasksSection` — abaixo do form de adicionar subtarefa. Ao clicar, chama `/api/ai/suggest-subtasks` (Route Handler com `claude-haiku-4-5-20251001`) passando título e descrição da task. Retorna 3-6 subtarefas sugeridas em JSON array. UI exibe lista de sugestões com checkboxes (todas pré-selecionadas), botão "Criar N selecionadas" para aceitar, botão "Cancelar" para descartar. Criação sequencial via `useCreateTask` com `parent_id`, `priority` herdada do pai, e `project_id`. Toast contextual "N subtarefas criadas com IA". Loading state com spinner. Bloqueado quando task já é subtarefa (profundidade >1).
**Arquivos criados:** `app/api/ai/suggest-subtasks/route.ts`
**Arquivos modificados:** `features/tasks/components/task-subtasks-section.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### AI02 — Resumo do projeto com IA
**O que foi feito:** Substituído placeholder "Resumo do Projeto por IA" na `project-overview.tsx` por card funcional. Botão "Gerar com IA" chama `/api/ai/project-summary` (Route Handler com `claude-haiku-4-5-20251001`) passando nome do projeto + contexto (total, concluídas, atrasadas, em andamento, 15 tasks recentes). Retorna resumo narrativo de 2-3 parágrafos. UI exibe resumo formatado + botão "Usar como Status Update" que dispara `CustomEvent` para pré-preencher o form de status update. Botão muda para "Regenerar" após primeiro uso. Loading state com spinner.
**Arquivos criados:** `app/api/ai/project-summary/route.ts`
**Arquivos modificados:** `features/projects/components/tabs/project-overview.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### AI03 — Smart task creation com IA
**O que foi feito:** No inline new-task input da `project-task-list.tsx`, quando o texto digitado ultrapassa 50 caracteres, aparece chip "Detalhar com IA" (ícone `IconSparkles`, estilo amber). Ao clicar, chama `/api/ai/smart-task` (Route Handler com `claude-haiku-4-5-20251001`) que extrai: título limpo (max 60 chars), 2-5 subtarefas práticas, e estimativa de horas. Cria automaticamente a task pai + subtarefas via `useCreateTask`. `estimated_hours` preenchido se disponível. Toast contextual "Tarefa criada com IA — '{título}'" com descrição "N subtarefas adicionadas". Chip usa `onMouseDown preventDefault` para evitar conflito com `onBlur`. Loading state bloqueia input e botão.
**Arquivos criados:** `app/api/ai/smart-task/route.ts`
**Arquivos modificados:** `features/projects/components/tabs/project-task-list.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Itens já implementados verificados
- **A04** (Inbox / Centro de notificações) — ✅ Já implementado: tabela `notifications`, service `alerts.ts`, hooks `use-alerts.ts` + `use-alert-count.ts`, componente `notification-bell.tsx` com badge, popover, mark-as-read, mark-all-as-read. Integrado no header global.

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **A01** — Motor de regras (Rules Engine)
- **P01** — Campos customizados por projeto
- **A02** — Regra: seção com campos default
- **A03** — Regra: overdue notification (Edge Function)

---

## Ciclo 14 — 2026-03-15

**Itens concluídos:** UX-CM01 (Context Menu universal para tasks)

### UX-CM01 — Context menu com ações rápidas em todas as views de tarefas
**O que foi feito:** Componente compartilhado `TaskContextMenu` que envolve qualquer item de tarefa e oferece menu de contexto (right-click) com ações rápidas sem abrir o detalhe. Ações disponíveis: abrir detalhes, toggle concluída/pendente, alterar status (submenu com todas as opções do `TASK_STATUS` com indicador de cor), alterar prioridade (submenu com todas as opções), alterar responsável (submenu com membros do time via `useTeamMembers`), definir prazo (Hoje, Amanhã, Próxima semana, Remover prazo), copiar título, copiar link, e excluir (com `ConfirmDialog`). Integrado nas 4 views:
- **Lista** (`project-task-row.tsx`) — wraps `motion.div`
- **Board** (`sortable-task-card.tsx`) — wraps card `div`
- **Gantt** (`gantt-task-list.tsx`) — wraps row button (condicional, só quando `task` existe)
- **Calendário** (`project-calendar.tsx`) — wraps `Tooltip` dentro do `CalendarTask`

Todas as mutações usam `useUpdateTask` e `useDeleteTask` com invalidação automática de queries. Feedback visual via toast do shadcn.
**Arquivos criados:** `features/tasks/components/task-context-menu.tsx`
**Arquivos modificados:** `features/projects/components/tabs/project-task-row.tsx`, `features/tasks/components/sortable-task-card.tsx`, `features/projects/components/tabs/gantt-task-list.tsx`, `features/projects/components/tabs/project-calendar.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Próximos sugeridos
- **T05** — Multi-assignee (migrar para `assignee_ids: uuid[]`)
- **A01** — Motor de regras (Rules Engine)
- **P01** — Campos customizados por projeto
- **A02** — Regra: seção com campos default
- **A03** — Regra: overdue notification (Edge Function)

---

## Ciclo 15 — 2026-03-15

**Itens concluídos:** T05, A02, A06, P03, P04

### T05 — Multi-assignee (múltiplos responsáveis por tarefa)
**O que foi feito:** Convertido o sistema de assignee de single-select para multi-select usando a junction table `task_assignees` já existente. Adicionado `getAssigneesByProject()` para query em bulk (evita N+1). Novo hook `useProjectTaskAssignees(projectId)` retorna `Map<taskId, AssigneeRow[]>`. Componente `TaskAssigneePickerMulti` com toggle checkboxes e avatares sobrepostos. Na project task list, cada row exibe avatares `-space-x-1.5` com overflow `+N`.
**Arquivos modificados:** `features/tasks/services/task-assignees.ts`, `features/tasks/hooks/use-task-assignees.ts`, `features/tasks/components/task-assignee-picker.tsx`, `features/projects/components/tabs/project-task-row.tsx`, `features/projects/components/tabs/project-task-list.tsx`
**Migration:** — (usa junction table `task_assignees` existente)
**Build:** ✅

### A02 — Seção com campos default (status, prioridade, responsável)
**O que foi feito:** Seções agora possuem `default_status`, `default_priority`, `default_assignee_id`. Ao mover task via D&D para nova seção, os defaults são aplicados automaticamente (server-side no `moveTaskToSection` e optimistic no `useMoveProjectTask`). Na aba Configurações do projeto, cada seção pode expandir para mostrar 3 selects de defaults. Badge "Defaults" indica seção configurada.
**Arquivos criados:** `supabase/migrations/20260315_add_section_defaults.sql`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/services/project-tasks.ts`, `features/projects/hooks/use-project-tasks.ts`, `features/projects/components/tabs/project-settings.tsx`, `features/projects/components/tabs/project-task-list.tsx`
**Build:** ✅

### A06 — Lembrete por tarefa (reminder_days)
**O que foi feito:** Campo `reminder_days` na `os_tasks` armazena quantos dias antes do prazo enviar lembrete. Componente `TaskReminderSelect` com 7 opções (0-14 dias). Desabilitado quando tarefa não tem prazo. Integrado no `TaskDetailFields` entre Recorrência e Dependências.
**Arquivos criados:** `supabase/migrations/20260315_add_task_reminder_days.sql`, `features/tasks/components/task-reminder-select.tsx`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/tasks/services/tasks.ts`, `features/projects/services/project-tasks.ts`, `features/tasks/components/task-detail-fields.tsx`
**Build:** ✅

### P03 — Campo computado Formula (dias restantes, overdue)
**O que foi feito:** Função `computeFormulas(task)` calcula `daysRemaining` e `isOverdue` a partir de `due_date`. Exibido como Badge colorido (azul, âmbar, vermelho) com ícone de alerta quando atrasada. Renderizado no componente `TaskComputedFields` no detalhe da tarefa.
**Arquivos criados:** `features/tasks/components/task-computed-fields.tsx`
**Arquivos modificados:** `features/tasks/components/task-detail-sheet.tsx`
**Build:** ✅

### P04 — Campo computado Rollup (progresso subtarefas, horas)
**O que foi feito:** Função `computeRollups(subtasks)` agrega `countDone/countTotal`, `progressPct`, `estimatedHours`, `loggedHours`. Progress bar visual com percentual e badge de contagem. Soma de horas com tooltip detalhado. Componente colapsável "Campos computados" mostrado após subtarefas no detalhe da tarefa.
**Arquivos criados:** (mesmo `task-computed-fields.tsx` de P03)
**Arquivos modificados:** `features/tasks/components/task-detail-sheet.tsx`
**Build:** ✅

### Próximos sugeridos
- **A01** — Motor de regras (Rules Engine)
- **P01** — Campos customizados por projeto
- **C04** — Proofing em arquivos

---

## Ciclo 16 — 2026-03-15

**Itens concluídos:** T05 (fix), A03, A05

### T05 fix — Multi-assignee melhorado
**O que foi feito:** (1) `getMyTasks()` agora consulta a junction table `task_assignees` além do campo `assignee_id` — tasks onde o usuário é multi-assignee mas não é o primary agora aparecem em "Minhas Tarefas". (2) Substituído o `TaskMultiAssigneeCell` inline (que só mudava o primary) pelo componente completo `TaskAssigneePicker` direto na task row — agora editar multi-assignees funciona inline na lista, sem precisar abrir o detail sheet. Removido ~130 linhas de código duplicado.
**Arquivos modificados:** `features/tasks/services/my-tasks.ts`, `features/projects/components/tabs/project-task-row.tsx`, `features/projects/components/tabs/project-task-list.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### A03 — Overdue notification + Reminders
**O que foi feito:** Funções `checkAndNotifyOverdueTasks()` e `checkAndNotifyReminders()` no notification-triggers.ts. Executadas uma vez por sessão via hook `useOverdueCheck()` integrado no `Providers` global. Para overdue: busca tasks com `due_date < today` e `!is_completed` atribuídas ao usuário, cria notificação in-app com contagem de dias de atraso — idempotente (não duplica no mesmo dia). Para reminders: busca tasks com `reminder_days > 0` e calcula se `due_date - reminder_days <= today`, cria notificação "Vence em X dias". Trigger types `task_overdue` e `task_reminder` adicionados ao sistema de alertas.
**Arquivos criados:** `hooks/use-overdue-check.ts`
**Arquivos modificados:** `services/notification-triggers.ts`, `services/alerts.ts`, `components/providers.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### A05 — Formulário de intake público
**O que foi feito:** Tabela `intake_forms` com campos configuráveis (fields_json), seção destino, defaults de status/prioridade, token público, flag is_active. Service `intake-forms.ts` com CRUD completo. Hooks React Query com toasts. API Route `POST /api/portal/intake` — valida token, verifica campos obrigatórios, cria task na seção configurada com descrição enriquecida (campos extras formatados em markdown). Rota pública `/intake/[token]` (Server Component + Client Form View) com: header do projeto, campos dinâmicos por tipo (text, textarea, select, date, email, url), validação required, feedback de sucesso com opção de re-enviar, erro inline. UI na aba Configurações do projeto: criar formulário, toggle ativo/inativo, copiar link público, configurar seção destino e status padrão.
**Arquivos criados:** `supabase/migrations/20260315_create_intake_forms.sql`, `features/projects/services/intake-forms.ts`, `features/projects/hooks/use-intake-forms.ts`, `app/api/portal/intake/route.ts`, `app/(public)/intake/[token]/page.tsx`, `app/(public)/intake/[token]/layout.tsx`, `app/(public)/intake/[token]/intake-form-view.tsx`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/components/tabs/project-settings.tsx`
**Migration:** `20260315_create_intake_forms.sql`
**Build:** ✅ Passou sem erros

### Status geral do backlog
**Concluídos:** ~62 de 70 itens (incluindo itens já existentes e bonus UX-CM01)
**Restantes:** A01 (Motor de regras), P01 (Campos customizados), C04 (Proofing em arquivos)

### Próximos sugeridos
- **A01** — Motor de regras (Rules Engine) — tabela + UI na aba Configurações
- **P01** — Campos customizados por projeto — infraestrutura completa de custom fields
- **C04** — Proofing em arquivos — pinos de comentário em imagens

---

## Ciclo 17 — 2026-03-15

**Itens concluídos:** T08, A01, A05 (UI completa), C04

### T08 — Subtask inline avançado (Ciclo 2)
**O que foi feito:** O sistema de subtarefas já possuía todas as funcionalidades do backlog (D&D via dnd-kit, checkbox de conclusão inline, progress bar com contador X/Y, criação com Enter). Melhoria aplicada: input de "Adicionar subtarefa" agora é sempre visível (não requer clique prévio), com placeholder dinâmico ao focar ("Nome da subtarefa... (Enter para criar)"), background sutil ao focar, ícone que muda de `+` para `○` quando ativo. Fluxo de rapid-fire: após criar, input mantém foco para criação contínua.
**Arquivos modificados:** `features/tasks/components/task-subtask-add-form.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### A05 — Formulário de intake (aba dedicada no projeto)
**O que foi feito:** Criada aba "Intake" no topbar do projeto detail (ícone `IconClipboardList`). Componente `ProjectIntake` com: empty state com CTA para criar formulário, card de link público com botão copiar, formulário de configuração (título, descrição, seção destino, status/prioridade padrão), editor de campos drag-and-drop (nome, tipo, obrigatório, excluir), 6 tipos de campo (text, textarea, select, date, email, url), toggle ativo/inativo com badge, botão excluir com confirmação. Backend (service, hooks, migration, API route, rota pública) já existia do ciclo 16 — este ciclo adicionou a UI dedicada.
**Arquivos criados:** `features/projects/components/tabs/project-intake.tsx`
**Arquivos modificados:** `features/projects/components/project-topbar.tsx`, `app/(auth)/projetos/[id]/page.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### A01 — Motor de regras (Rules Engine)
**O que foi feito:** Tabela `project_rules` com campos: name, trigger_type (5 tipos: task_moved_to_section, task_status_changed, task_overdue, task_assigned, task_created), trigger_config, conditions_json, actions_json, is_active. RLS por tenant. Service `project-rules.ts` com CRUD completo + constantes `TRIGGER_TYPES` e `ACTION_TYPES`. Hooks React Query: `useProjectRules`, `useCreateProjectRule`, `useUpdateProjectRule`, `useDeleteProjectRule`. UI na seção "Regras de Automação" da aba Configurações: listar regras com trigger label + actions, toggle ativo/inativo, excluir, criar regra via Select de trigger type. Badge "Inativa" em regras desativadas.
**Arquivos criados:** `supabase/migrations/20260315_create_project_rules.sql`, `features/projects/services/project-rules.ts`, `features/projects/hooks/use-project-rules.ts`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/components/tabs/project-settings.tsx`
**Migration:** `20260315_create_project_rules.sql`
**Build:** ✅ Passou sem erros

### C04 — Proofing em arquivos (pinos de comentário em imagens)
**O que foi feito:** Tabela `file_annotations` com campos: file_id, author_id/name, x_pct/y_pct (coordenadas relativas), content, resolved. RLS por tenant. Service `file-annotations.ts` com CRUD + toggleResolved. Hooks React Query: `useFileAnnotations`, `useCreateFileAnnotation`, `useToggleAnnotationResolved`, `useDeleteFileAnnotation`. Componente `FileProofingViewer` (Dialog fullscreen): imagem com cursor crosshair, click para posicionar pin, pins numerados laranja (ou verde se resolvidos), sidebar com: formulário de novo comentário (Ctrl+Enter para enviar), detalhe do pin selecionado (resolver/reabrir/excluir), lista de todos os pins com timestamp relativo. Toggle "Mostrar resolvidos". Botão "Revisar" nos cards de imagem na aba Arquivos.
**Arquivos criados:** `supabase/migrations/20260315_create_file_annotations.sql`, `features/projects/services/file-annotations.ts`, `features/projects/hooks/use-file-annotations.ts`, `features/projects/components/file-proofing-viewer.tsx`
**Arquivos modificados:** `lib/supabase/types.ts`, `features/projects/components/tabs/project-files.tsx`
**Migration:** `20260315_create_file_annotations.sql`
**Build:** ✅ Passou sem erros

### Status geral do backlog
**Concluídos:** ~66 de 70 itens (incluindo itens já existentes e bonus UX-CM01)
**Restantes:** P01 (Campos customizados por projeto)

### Próximos sugeridos
- **P01** — Campos customizados por projeto — infraestrutura completa de custom fields (tipos adicionais, tabela `project_custom_fields` + `task_field_values`, UI de adicionar campo na task list)

---

## Ciclo 18 — 2026-03-15

**Itens concluídos:** P01, F01

### P01 — Campos customizados por projeto (infraestrutura completa)
**O que foi feito:** Implementação completa de custom fields por projeto usando as tabelas Supabase existentes (`os_custom_fields` + `os_task_field_values`). Service layer `custom-fields.ts` com CRUD completo para definições de campos e valores. Hooks React Query: `useProjectCustomFields`, `useCreateCustomField`, `useDeleteCustomField`, `useTaskFieldValues`, `useUpsertTaskFieldValue`, `buildFieldValuesMap`. Na task list: botão "+" agora cria campos customizados reais no Supabase (tipos suportados: text, number, select, multi_select, date, person, checkbox, url, email). Campos customizados aparecem como colunas adicionais no header com ícone por tipo e botão de remover no hover. Na task row: valores dos campos customizados renderizados inline com formatação por tipo (checkbox como ícone, date formatado pt-BR, url como link clicável com domínio, email como mailto, select como badge, multi_select como badges agrupados, number como tabular-nums). `CustomFieldCell` component com 9 tipos de renderização distintos.
**Arquivos criados:** `features/projects/services/custom-fields.ts`, `features/projects/hooks/use-custom-fields.ts`
**Arquivos modificados:** `features/projects/components/tabs/project-task-list.tsx`, `features/projects/components/tabs/project-task-row.tsx`
**Migration:** — (usa tabelas `os_custom_fields` + `os_task_field_values` já existentes)
**Build:** ✅ Passou sem erros

### F01 — Resize de colunas com persistência no Supabase
**O que foi feito:** O mecanismo de resize já existia em memória (handleStartResize, columnWidths state). Adicionada persistência completa no Supabase: (1) Tabela `user_view_preferences` com RLS por `user_id` — armazena `column_widths` (jsonb), `column_order` (jsonb), `hidden_columns` (jsonb) por projeto. (2) Service functions `getViewPreferences` e `upsertViewPreferences`. (3) Hooks `useViewPreferences` e `useSaveViewPreferences` com React Query. (4) Na task list: carrega preferências salvas ao montar (columnWidths, columnOrder, hiddenColumns), salva widths com debounce de 500ms após resize, salva order e visibility imediatamente ao alterar. Constraint unique (user_id, project_id) garante uma preferência por usuário por projeto.
**Arquivos criados:** `supabase/migrations/20260315_create_user_view_preferences.sql`
**Arquivos modificados:** `features/projects/services/custom-fields.ts` (inclui view preferences), `features/projects/hooks/use-custom-fields.ts` (inclui view preferences hooks), `features/projects/components/tabs/project-task-list.tsx`
**Migration:** `20260315_create_user_view_preferences.sql`
**Build:** ✅ Passou sem erros

### Status geral do backlog
**Concluídos:** ~68 de 70 itens (incluindo itens já existentes e bonus UX-CM01)
**Restantes:** Nenhum item prioritário restante. Os itens remanescentes do backlog original já foram implementados ou declarados como já existentes em ciclos anteriores.

---

## Ciclo 19 — 2026-03-15

**Itens concluídos:** P01 (inline editing fix)

### P01 fix — Custom fields com edição inline na task list
**O que foi feito:** O P01 original implementou exibição de campos customizados na task list, mas apenas como display read-only. O backlog pedia "editar inline nas rows". Implementada edição inline completa: (1) **Checkbox** — toggle direto no click sem popover, (2) **Select** — Popover com lista de opções + "Limpar", (3) **Multi-select** — Popover com checkboxes para cada opção, (4) **Date** — Popover com Calendar picker, (5) **Text/Number/Email/URL** — click transforma em Input inline, Enter confirma, Escape cancela, blur confirma. Novo componente `EditableCustomFieldCell` substitui o antigo `CustomFieldCell` read-only. Callback `onFieldChange` propagado via `SortableTaskRow` → `ProjectTaskRow`. Mutation via `useUpsertTaskFieldValue` com invalidação automática de queries.
**Arquivos modificados:** `features/projects/components/tabs/project-task-row.tsx`, `features/projects/components/tabs/project-task-list.tsx`
**Migration:** —
**Build:** ✅ Passou sem erros

### Status geral do backlog
**Concluídos:** 70 de 70 itens ✅ (incluindo itens já existentes e bonus UX-CM01)
**Backlog completo.**

---
