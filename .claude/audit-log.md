# TBO OS — Audit Log

## Ciclo — 2026-03-13 (auto) — Ciclo 8

**Módulo**: Comercial + Contratos + Cultura (icon migration)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou — 1 erro corrigido (IconPen → IconPencil, não existe em @tabler v3.40.0)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| `features/comercial/` lucide-react | 🔧 | ✅ | 7 arquivos migrados para Tabler Icons |
| `features/contratos/` lucide-react | 🔧 | ✅ | 15 arquivos migrados (incluindo contract-stepper/) |
| `features/cultura/` lucide-react | 🔧 | ✅ | 13 arquivos migrados |

### Implementado

- refactor(icons): migrar lucide → Tabler em features/comercial/ (7 arquivos)
- refactor(icons): migrar lucide → Tabler em features/contratos/ (15 arquivos)
- refactor(icons): migrar lucide → Tabler em features/cultura/ (13 arquivos)
- fix: IconPen não existe em @tabler/icons-react@3.40.0 → substituído por IconPencil

### Migrations aplicadas

Nenhuma neste ciclo.

### Próximo ciclo (sugestões)

- Migrar módulos com mais lucide restante: financeiro (14), people (11), performance (8)
- Split `task-subtasks-section.tsx` (332L) e `task-dependencies-section.tsx` (326L)
- Split `my-task-table-row.tsx` (329L)

### Debt técnico

- 81 arquivos ainda usam lucide-react em features/ (dashboard 8, financeiro 14, people 11, performance 8, founder-dashboard 8, projects 7, clientes 5)

---

## Ciclo — 2026-03-13 (auto) — Ciclo 7

**Módulo**: Demands + Tarefas
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| `features/demands/` lucide-react | 🔧 | ✅ | 10 arquivos migrados para Tabler Icons |
| `demand-property-row.tsx` tipo LucideIcon | 🔧 | ✅ | Substituído por `React.ComponentType<{...}>` |
| `demands-board.tsx` tamanho | 🔧 | ✅ | 563→229L (-59%); card/column extraídos |
| `demand-board-card.tsx` (novo) | ❌ | ✅ | DemandCard + DraggableDemandCard + DroppableColumn + normalize |
| `task-tag-picker.tsx` tamanho | ⚠️ | ✅ | 338→120L (-64%); views extraídas |
| `task-tag-picker-views.tsx` (novo) | ❌ | ✅ | TAG_COLORS + SearchView + CreateView |

### Implementado

- refactor(demands): migrar lucide → Tabler Icons em 10 arquivos do módulo
- refactor(demands): split demands-board.tsx 563L → orchestrator + demand-board-card.tsx
- refactor(tarefas): split task-tag-picker.tsx 338L → picker + task-tag-picker-views.tsx

### Migrations aplicadas

Nenhuma neste ciclo — sem alterações de schema.

### Próximo ciclo (sugestões)

- Split `task-subtasks-section.tsx` (332L) e `task-dependencies-section.tsx` (326L)
- Split `my-task-table-row.tsx` (329L) e `task-actions-toolbar.tsx` (319L)
- Migrar módulos com mais lucide: `features/comercial/`, `features/contratos/`, `features/cultura/`
- Investigar e implementar sub-páginas OKRs em desenvolvimento (check-ins, dashboard, teams)

### Debt técnico

- `demand-board-card.tsx`: 280L (ligeiramente acima do limite); contém 3 componentes coesos e normalize
- `task-tag-picker-views.tsx`: 206L (ligeiramente acima); contém 3 exports distintos (TAG_COLORS, SearchView, CreateView)

---

## Ciclo — 2026-03-13 (auto) — Ciclo 6

**Módulo**: OKRs + Tarefas
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade                               | Antes | Depois | Detalhes |
|----------------------------------------------|-------|--------|----------|
| `app/(auth)/okrs/page.tsx` tamanho           | 🔧    | ✅     | 786 → 250 linhas (-68%); viola regra <300L |
| `okrs/page.tsx` lucide-react                 | 🔧    | ✅     | 16 icons lucide substituídos por Tabler |
| KeyResultItem + OkrKeyResultList inline      | ⚠️    | ✅     | Extraídos para `okr-key-result-item.tsx` |
| `OkrObjectiveCard` sem actions               | ⚠️    | ✅     | Substituído por versão completa (edit/delete/comments) |
| `my-tasks-list-view.tsx` tamanho             | 🔧    | ✅     | 358 → 167 linhas (-53%); viola regra <200L |
| Render modes inline no list view            | ⚠️    | ✅     | Extraídos para `my-tasks-table-body.tsx` |
| `features/okrs/components` lucide-react     | 🔧    | ✅     | 6 arquivos migrados para Tabler Icons |
| Módulo OKRs 100% free de lucide             | ❌    | ✅     | page + 8 componentes todos em Tabler |

### Implementado

- refactor(okrs): extrair componentes + migrar lucide → Tabler na page (arquivos: okrs/page.tsx, okr-objective-card.tsx, okr-key-result-item.tsx)
- refactor(tarefas): split my-tasks-list-view 358→167L (arquivos: my-tasks-list-view.tsx, my-tasks-table-body.tsx)
- refactor(okrs): migrar lucide → Tabler em todos os componentes do módulo (6 arquivos)

### Migrations aplicadas

Nenhuma neste ciclo — sem alterações de schema.

### Próximo ciclo (sugestões)

- Migrar módulo `features/tasks` components restantes com mais de 200 linhas: `task-tag-picker.tsx` (338L), `task-subtasks-section.tsx` (332L), `task-dependencies-section.tsx` (326L)
- Migrar `features/people` de lucide → Tabler (11 arquivos — maior módulo ainda em lucide)
- Migrar `features/demands` de lucide → Tabler (10 arquivos)
- Implementar sub-páginas de OKRs que estão "Em desenvolvimento": check-ins, dashboard, teams, individuais

### Debt técnico

- `my-tasks-table-body.tsx` tem 241 linhas (ligeiramente acima do limite). Contém 5 sub-componentes coesos; split futuro se necessário

---

## Ciclo — 2026-03-13 (auto) — Ciclo 3

**Módulo**: Tarefas (`features/tasks`)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| Calendar View | ❌ | ✅ | Grid mensal com tarefas por due_date, task pills com cor de status, badge "+N", navegação mês, botão "Hoje" |
| Toolbar — icons | ⚠️ | ✅ | Lucide → Tabler Icons (ArrowsUpDown, Filter, LayoutRows, Check, ArrowUp, ArrowDown) |
| Toolbar — tamanho | ⚠️ | ✅ | 389 linhas → 201 linhas (FilterPanel extraído para arquivo próprio) |
| FilterPanel | ⚠️ | ✅ | Extraído para `my-tasks-filter-panel.tsx` (167 linhas), exporta SORT_OPTIONS e GROUP_OPTIONS |
| TableRow — icons | ⚠️ | ✅ | Lucide → Tabler Icons (Check, Circle, GripVertical) |
| Page — icons | ⚠️ | ✅ | Lucide → Tabler Icons (Plus, CheckSquare, Kanban, List, CalendarDays) |

### Implementado

- feat: `my-tasks-calendar-view.tsx` — grid mensal com TaskPill por due_date, navegação, hoje, badge overflow (arquivos: app/(auth)/tarefas/page.tsx, features/tasks/components/my-tasks-calendar-view.tsx)
- refactor: `my-tasks-toolbar.tsx` — Tabler Icons + FilterPanel extraído (arquivos: my-tasks-toolbar.tsx, my-tasks-filter-panel.tsx)
- fix: `my-task-table-row.tsx` — Tabler Icons (arquivo: my-task-table-row.tsx)

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- Ainda há 16 arquivos com `lucide-react` no módulo de tarefas — completar a migração
- `my-tasks-list-view.tsx` (358 linhas) e `my-tasks-board-view.tsx` (275 linhas) acima do limite
- Realtime subscription no task detail (comments/activity ao vivo)
- Calendar View: suporte a click em dia para criar tarefa com due_date pré-preenchido

### Debt técnico

- `my-tasks-toolbar.tsx` em 201 linhas (1 acima do limite — pragmaticamente aceito)
- Migração de Lucide → Tabler incompleta no módulo (16 arquivos restantes)

---

## Ciclo — 2026-03-12 (auto) — Ciclo 2

**Módulo**: Tarefas (`features/tasks`)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade                       | Antes | Depois | Detalhes |
|--------------------------------------|-------|--------|----------|
| Build (cache corrompido)             | 🔧    | ✅     | `tsconfig.tsbuildinfo` corrompido causava falso "module not found"; resolvido limpando cache |
| `task-detail-fields.tsx` — ícones    | 🔧    | ✅     | Substituídos 4 ícones lucide-react por Tabler equivalentes |
| `my-tasks-list-view.tsx` — tamanho  | ⚠️    | ✅     | 648 → 358 linhas (-45%) via 2 extrações |
| Lógica sort/filter/group             | ⚠️    | ✅     | Movida para `lib/my-tasks-utils.ts` (testável, reutilizável) |
| Lógica DnD/sections                  | ⚠️    | ✅     | Movida para `hooks/use-section-dnd.ts` |
| Colaboradores de tarefa              | ❌    | ✅     | picker + lista + hook com optimistic update |

### Implementado

- fix: resolver build com tsconfig.tsbuildinfo corrompido
- fix: substituir lucide-react por Tabler Icons em task-detail-fields.tsx
- refactor: extrair compareTasks/applyFilters/groupTasksDynamic → my-tasks-utils.ts
- refactor: extrair DnD + sections CRUD + undo → use-section-dnd.ts
- feat: TaskCollaboratorsList + TaskCollaboratorPicker + useTaskCollaborators + task-collaborators service

### Migrations aplicadas

Nenhuma neste ciclo — `task_collaborators` já existia no schema.

### Próximo ciclo (sugestões)

- `task-detail.tsx` (744 linhas) está **orphaned** — nenhum import encontrado. Candidato a remoção após confirmação do usuário
- Dividir `my-tasks-toolbar.tsx` (389 linhas) — ainda acima do limite
- Dividir `my-task-table-row.tsx` (325 linhas)
- Calendar View — ainda placeholder "em breve"
- Realtime subscription no task detail (comments/activity ao vivo)

### Debt técnico

- `task-detail.tsx` é dead code (nenhum componente o importa); não deletado sem confirmação explícita
- `my-tasks-toolbar.tsx` e `my-task-table-row.tsx` ainda acima de 200 linhas

---

## Ciclo — 2026-03-12 (auto) — Ciclo 1

**Módulo**: Tarefas (`features/tasks`)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois das mudanças

### Estado do módulo

| Funcionalidade              | Antes  | Depois | Detalhes |
|-----------------------------|--------|--------|----------|
| Botão "Copiar link"         | 🔧     | ✅     | Copia `origin + pathname + ?task=ID`, exibe toast |
| Botão "Mais opções"         | 🔧     | ✅     | DropdownMenu com "Copiar link" e "Excluir tarefa" |
| Botões ThumbsUp/Paperclip   | 🔧     | removido | Removidos da barra (não tinham caso de uso real no header) |
| Adicionar subtarefa         | 🔧     | ✅     | Input inline com Enter/Escape/blur, autofocus |
| Excluir subtarefa           | ❌     | ✅     | Botão X no hover de cada subtarefa |
| Error toast — delete tarefa | ❌     | ✅     | Toast destructive + rollback de estado |
| Error toast — criar subtarefa | ❌   | ✅     | Toast destructive on error |

### Implementado

- feat: copy link handler com clipboard API + toast (task-detail.tsx)
- feat: more menu com DropdownMenu shadcn (task-detail.tsx)
- feat: inline subtask create com estado temporário e autoFocus (task-detail.tsx)
- feat: subtask delete com hover button + error handling (task-detail.tsx)
- feat: error toasts em todas as operações destrutivas (task-detail.tsx)

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- Dividir `task-detail.tsx` (agora ~680 linhas) em sub-componentes
- Dividir `my-tasks-list-view.tsx` (648 linhas) — maior componente do módulo
- Implementar Calendar View (atualmente placeholder "em breve")
- Realtime subscription para task detail (comments, activity em tempo real)

### Debt técnico

- `task-detail.tsx` ainda acima de 200 linhas (escopo maior, será ciclo futuro)
- Botões Curtir (ThumbsUp) e Anexar (Paperclip) foram removidos do header —
  recurso ainda sem serviço implementado; retornar quando likes/attachments tiverem backend
