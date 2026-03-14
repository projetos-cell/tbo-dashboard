## Ciclo 37 — 2026-03-14

**Módulos**: Courses, PDI, Cultura (valores/pilares/documentos)
**Build**: ✅ TypeScript zero erros

### Estado dos módulos

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| Courses — Share/Bookmark handlers | ❌ botões sem handler | ✅ | Share → clipboard copy + toast; Bookmark → toggle visual com estado |
| Courses — Video play handler | ❌ botão sem handler | ✅ | Click mostra estado "Conteúdo em breve" + toast informativo |
| PDI goals — D&D reordering | ❌ sort_order no DB mas sem UI | ✅ | dnd-kit vertical, Ctrl+Z undo, persist Supabase |
| Cultura valores — 345L de código espelhado | ⚠️ duplicação | ✅ | Thin wrapper (20L) usando CulturaItemsPage shared |
| Cultura pilares — 345L de código espelhado | ⚠️ duplicação | ✅ | Thin wrapper (20L) usando CulturaItemsPage shared |
| Cultura documentos — 351L de código espelhado | ⚠️ duplicação | ✅ | Thin wrapper (20L) usando CulturaItemsPage shared |

### Implementado

- feat(courses): Share → clipboard copy + toast; Bookmark → toggle com visual feedback (arquivos: course-detail-header.tsx)
- feat(courses): play button → estado "em breve" com mensagem e badge (arquivos: course-video-player.tsx)
- feat(pdi): D&D sorting de goals com Ctrl+Z undo e persist Supabase (arquivos: pdi-goals-section.tsx, services/pdi.ts, hooks/use-pdi.ts)
- refactor(cultura): extraído CulturaItemsPage shared component — valores/pilares/documentos agora são thin wrappers (arquivos: features/cultura/components/cultura-items-page.tsx, app/(auth)/cultura/valores/page.tsx, pilares/page.tsx, documentos/page.tsx)

### Migrations aplicadas

Nenhuma — sort_order já existia na tabela pdi_goals.

### Próximo ciclo

- Courses: conectar ao backend (criar tabelas courses, user_progress, enrollments)
- Academy: implementar UI components (hooks já existem)
- PDI: Gantt/timeline view para goals

### Debt técnico

- course-detail-header.tsx: Bookmark usa estado local (não persiste no DB). Quando houver tabela de bookmarks, migrar para mutation.

## Ciclo 34 — 2026-03-14 07:08

**Módulo**: Tasks (my-tasks-board-view, task-board, my-tasks-table-header)
**Branch**: claude/improve-20260314-0708 → main
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| my-tasks-board-view — loading state | ❌ (sections carregavam sem feedback) | ✅ | Skeleton 3 colunas durante isLoading |
| my-tasks-board-view — empty state | ❌ (board vazio sem orientação) | ✅ | Empty state com ícone + CTA "Criar primeira seção" |
| my-tasks-board-view — onError no moveTask | 🔧 (sem feedback em falhas de drag) | ✅ | onError com toast destructive |
| task-board — onError no drag | 🔧 (optimistic update sem rollback no path normal) | ✅ | onError com rollback de localTasks + toast destructive |
| my-tasks-table-header (266L) | ⚠️ viola 200L | ✅ | 266L → 90L; SortableHead → my-tasks-sortable-head.tsx (179L) |
| task-board (213L→228L) | ⚠️ viola 200L | ✅ | SortableTaskCard → sortable-task-card.tsx (30L); task-board → 197L |

### Implementado

- feat(tasks): my-tasks-board-view — loading skeleton (3 colunas), empty state com CTA, onError no moveTask.mutate (arquivos: my-tasks-board-view.tsx)
- fix(tasks): task-board — onError com rollback de optimistic update + toast destructive no drag normal (arquivos: task-board.tsx)
- refactor(tasks): my-tasks-table-header split — SortableHead extraído para my-tasks-sortable-head.tsx; 266L → 90L (arquivos: my-tasks-table-header.tsx, my-tasks-sortable-head.tsx)
- refactor(tasks): task-board split — SortableTaskCard extraído para sortable-task-card.tsx; 228L → 197L (arquivos: task-board.tsx, sortable-task-card.tsx)

### Migrations aplicadas
- Nenhuma

### Próximo ciclo
- my-tasks-board-view.tsx (221L) — levemente acima de 200L; candidato a extrair BoardLoadingSkeleton e BoardEmptyState como sub-componentes
- my-tasks-table-body.tsx (241L) — viola 200L, candidato a split
- custom-field-definition-steps.tsx (264L) — viola 200L, candidato a split

### Debt técnico
- my-tasks-board-view.tsx (221L) — loading state e empty state adicionados inline; se crescer mais, extrair em componentes separados

## Ciclo — 2026-03-13 Ciclo 23

**Módulo**: Projetos + Tasks + Comercial (cross-module)
**Branch**: main
**Build**: ✅ (TypeScript zero erros)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| project-topbar dropdown | 🔧 (div custom, sem handlers) | ✅ | shadcn DropdownMenu + Duplicar/Pausar/Configurações reais |
| project-topbar StatusDropdown | 🔧 (div custom) | ✅ | shadcn DropdownMenu com indicadores de cor |
| task-actions-toolbar.tsx (381L) | ⚠️ (viola 200L) | ✅ | 381L → 188L via hook + componente isolado |
| rd-pipeline-kanban.tsx (353L) | ⚠️ (viola 200L) | ✅ | 353L → 160L via hook usePipelineDnd |

### Implementado

- fix(projetos): project-topbar — shadcn DropdownMenu em menu de ações e StatusDropdown; handleDuplicate real (useCreateProject), handlePause (useUpdateProject), Configurações navega para /projetos/configuracoes (arquivos: project-topbar.tsx)
- refactor(tasks): task-actions-toolbar split — extraído useTaskActions hook (handlers + state + keyboard shortcuts) e TaskDeleteDialog componente isolado; 381L → 188L (arquivos: task-actions-toolbar.tsx, use-task-actions.ts, task-delete-dialog.tsx)
- refactor(comercial): rd-pipeline-kanban split — extraído usePipelineDnd hook (D&D state, undo stack, sensors, handlers); 353L → 160L (arquivos: rd-pipeline-kanban.tsx, use-pipeline-dnd.ts)

### Migrations aplicadas
- Nenhuma

### Próximo ciclo
- demands-list.tsx (342L), demands-toolbar.tsx (295L), demand-board-card.tsx (280L), demand-comment-thread.tsx (283L) — todos acima de 200L no módulo demands
- deal-form-dialog.tsx (344L), deal-pipeline.tsx (285L) — violations no módulo comercial
- task-description-editor.tsx (299L), my-tasks-board-view.tsx (275L) — violations no módulo tasks

### Debt técnico
- Ação "Pausar projeto" usa status "parado" pois não há status "arquivado" no PROJECT_STATUS — comportamento comunicado via toast

## Ciclo — 2026-03-13 Ciclo 4

**Módulo**: Tarefas
**Branch**: claude/improve-20260312-auto
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| task-detail-header botões | 🔧 (Lucide + sem handler) | ✅ | Tabler Icons + copy link funcional + delete com AlertDialog |
| Ícones Lucide (13 arquivos restantes) | ⚠️ | ✅ | 100% migrados para Tabler Icons no módulo |
| Subtarefas no TaskDetailSheet | ❌ (ausente) | ✅ | TaskSubtasksSection com progress bar, toggle, add e delete |

### Implementado

- fix: task-detail-header — Tabler Icons + handlers reais (copy link com toast, delete com AlertDialog de confirmação, passagem de onClose para fechar sheet após delete) (arquivos: task-detail-header.tsx, task-detail-sheet.tsx)
- refactor: migração Lucide → Tabler Icons em lote nos 13 componentes restantes: task-status-toggle, task-card, task-compact-list, task-filters, task-list, quick-add-task, task-assignee-picker, task-row-context-menu, my-task-row, my-tasks-board-view, my-tasks-column-config, my-tasks-section-row, my-tasks-table-header, inline-date-picker
- feat: TaskSubtasksSection — componente dedicado para subtarefas no TaskDetailSheet com: progress bar (completed/total), toggle de conclusão, add inline (Enter para criar, Esc para cancelar), delete com hover reveal (arquivos: task-subtasks-section.tsx, task-detail-sheet.tsx)

### Migrations aplicadas
- Nenhuma (módulo já tem migrations adequadas em 001_task_entities.sql)

### Próximo ciclo
- `task-detail.tsx` (arquivo obsoleto, não importado em lugar nenhum) — pode ser removido com segurança
- Seção de comentários não está no TaskDetailSheet (o CommentThread está no antigo task-detail.tsx mas não foi portado)
- O botão "Likes" no header ainda usa toast de placeholder — implementar hook real de likes
- Botão "Anexar" no header ainda usa toast de placeholder — implementar upload de anexos

### Debt técnico
- `task-detail.tsx` é um arquivo orphaned com 400+ linhas ainda usando Lucide — mantido por segurança mas deveria ser deletado no próximo ciclo
- Ícone `IconSelector` usado para `ChevronsUpDown` em task-assignee-picker (equivalente semântico, funciona)

## Ciclo — 2026-03-13 Ciclo 5

**Módulo**: Tarefas
**Branch**: claude/improve-20260312-auto
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| Lucide Icons no CommentThread | 🔧 (Send, MoreHorizontal, Pencil, Trash2, Reply) | ✅ | Migrado para Tabler Icons (IconSend, IconDots, IconPencil, IconTrash, IconCornerDownRight) |
| CommentThread no TaskDetailSheet | ⚠️ (componente existia mas não integrado) | ✅ | Seção "Comentários" adicionada ao TaskPanel após subtarefas |
| task-detail.tsx orphaned | 🔧 (744 linhas sem imports) | ✅ | Arquivo deletado — debt técnico eliminado |

### Implementado

- refactor(tarefas): CommentThread — 5 ícones Lucide → Tabler Icons (arquivos: comment-thread.tsx)
- feat(tarefas): seção de Comentários integrada ao TaskDetailSheet via CommentThread existente (arquivos: task-detail-sheet.tsx)
- chore(tarefas): task-detail.tsx orphaned removido — 744 linhas de debt eliminadas

### Migrations aplicadas
- Nenhuma (project_comments já existe, use-comments hook já implementado)

### Próximo ciclo
- Botão "Curtir" no header ainda usa toast placeholder — implementar hook real de likes/reactions na tabela os_tasks ou tabela de reactions
- Botão "Anexar" no header ainda usa toast placeholder — implementar upload de arquivos (Supabase Storage)
- CommentThread usa Lucide no submenu de edição (dropdown manual com div/button) — considerar migrar para shadcn DropdownMenu para consistência

### Debt técnico
- CommentThread.CommentItem usa `showMenu` com div custom ao invés de shadcn DropdownMenu — funcional mas fora do padrão do design system

## Ciclo 28 — 2026-03-14 01:20

**Módulo**: Comercial (deal-pipeline), Tarefas (task-description-editor), Demands (demand-board-card)
**Branch**: claude/improve-20260314-0108 → main
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| deal-pipeline.tsx (285L) | ⚠️ viola 200L + erro drag silencioso | ✅ | 285L → 145L via useDealPipelineDnd hook; toast de erro adicionado no catch |
| task-description-editor.tsx (299L) | ⚠️ viola 200L + prompt() bug | ✅ | 299L → 190L; helpers → lib/tiptap-helpers.ts; hook use-task-description-editor.ts; BubbleBtn extraído; prompt() → input inline |
| demand-board-card.tsx (280L) | ⚠️ viola 200L | ✅ | 280L → 103L; DemandCard extraído para demand-card.tsx (193L) |

### Implementado

- refactor(comercial): deal-pipeline split — useDealPipelineDnd hook (D&D state + undo + sensors + handlers); fix erro silencioso no drag com toast destructive (arquivos: deal-pipeline.tsx, use-deal-pipeline-dnd.ts)
- refactor(tarefas): task-description-editor split — lib/tiptap-helpers.ts (isJsonDoc, getInitialContent, renderToHTML, isEmptyDescription); use-task-description-editor.ts hook; bubble-btn.tsx componente; fix prompt() → input inline com confirm/cancel (arquivos: task-description-editor.tsx, use-task-description-editor.ts, lib/tiptap-helpers.ts, bubble-btn.tsx)
- refactor(demands): demand-board-card split — DemandCard extraído para demand-card.tsx; re-export mantido para compatibilidade (arquivos: demand-board-card.tsx, demand-card.tsx)

### Migrations aplicadas
- Nenhuma

### Próximo ciclo
- deal-form-dialog.tsx: erros de campo não renderizados visualmente (setErrors() sem display)
- my-tasks-board-view.tsx: sem loading skeleton e sem empty state
- demand-comment-thread.tsx: sem error handling em mutations (useCreateDemandComment etc.)
- demands-toolbar.tsx: PRIORITY_ORDER constante local (candidata a lib/constants.ts)

### Debt técnico
- demand-card.tsx (193L) está próximo do limite — se crescer, dividir DemandCardDropdown em componente separado

## Ciclo — 2026-03-14 Ciclo 36

**Módulo**: Shared Components — splits de violações 200L
**Branch**: main
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| invite-user-dialog.tsx (329L) | ⚠️ viola 200L | ✅ | 329L → invite-user-dialog.tsx (116L) + invite-steps.tsx (76L) + invite-step-content.tsx (145L) |
| profile-form.tsx (323L) | ⚠️ viola 200L | ✅ | 323L → profile-form.tsx (184L) + profile-form-parts.tsx (173L) |
| header-parts.tsx (326L) | ⚠️ viola 200L | ✅ | 326L → header-parts.tsx (181L) + notification-bell.tsx (135L) |

### Implementado

- refactor(team): invite-user-dialog.tsx split em 3 — InviteStepIndicator/InviteStepFooter em invite-steps.tsx (76L), InviteStepInfo/Role/Confirm em invite-step-content.tsx (145L), dialog orchestrator em invite-user-dialog.tsx (116L)
- refactor(configuracoes): profile-form.tsx split em 2 — ProfileFormSkeleton/ProfileAvatarCard/ProfileSaveBar em profile-form-parts.tsx (173L), ProfileForm principal em profile-form.tsx (184L)
- refactor(layout): header-parts.tsx split em 2 — NotificationItem/NotificationBell em notification-bell.tsx (135L), ThemeToggle/SearchButton/UserAvatar em header-parts.tsx (181L) com re-export de compatibilidade

### Migrations aplicadas
Nenhuma.

### Próximo ciclo (sugestões)
- components/modules/academy/AIChatPanel.tsx (320L) — candidato a split
- features/contratos/components/contract-stepper/contract-stepper.tsx (319L) — candidato a split
- features/mercado/components/mercado-page-components.tsx (318L) — candidato a split
- components/modules/team/team-table.tsx (317L) — candidato a split

### Debt técnico
Nenhum novo.
