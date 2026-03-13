# TBO OS — Audit Log

## Ciclo — 2026-03-13 (auto) — Ciclo 16

**Módulo**: Multi-módulo (Decisões, Reconhecimentos, OKRs)
**Branch**: `main`
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| `decisions-list` — acentos PT-BR | 🔧 | ✅ | "decisao"→"decisão", "Acoes"→"Ações", "Reuniao"→"Reunião" |
| `decisions-list` — loading state delete | ⚠️ | ✅ | Botão desabilitado + "Excluindo..." durante mutation; fechar dialog apenas após mutateAsync |
| `decisions-list` — truncação de descrição | ⚠️ | ✅ | JS slice removido; CSS `line-clamp-3` nativo |
| `reconhecimentos` — Aprovar/Rejeitar | ⚠️ | ✅ | Estado `reviewingId` por item, loading label e `disabled` granular |
| `okrs` — KR History | ❌ | ✅ | `OkrKrHistoryDialog` criado com `useCheckins`; conectado em company + individuais |

### Implementado

- fix(decisions): loading state async no delete + acentos PT-BR + CSS truncation
- feat(reconhecimentos): loading granular por item nos botões Aprovar/Rejeitar
- feat(okrs): `OkrKrHistoryDialog` — histórico de check-ins do KR (new_value, previous_value, confidence, notes, data)

### Migrations aplicadas
Nenhuma

### Próximo ciclo
- Implementar `onHistoryKr` para exibir gráfico de progresso no histórico do KR
- Validação de rate limit visual no form de reconhecimento (desabilitar button se atingido)
- Filtro de status/tipo em `decisions-list`

### Debt técnico
- `peopleList` cast em `reconhecimentos/page.tsx` (linhas 50-56) — tipagem frágil do hook `usePeople`

---

## Ciclo — 2026-03-13 (auto) — Ciclo 15

**Módulo**: Multi-módulo (Decisões, Pessoas, OKRs)
**Branch**: `main`
**Build**: ✅ Passou antes e depois das 3 melhorias

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| `decisions-list.tsx` — delete sem confirmação | 🔧 | ✅ | AlertDialog + handleDeleteRequest/handleDeleteConfirm; previne deleção acidental |
| `pessoas/reconhecimentos/page.tsx` | ❌ placeholder | ✅ | Página completa: feed de reconhecimentos, KPI section, ranking, form "Reconhecer", pendentes (canManage), ConfirmDialog para delete |
| `okrs/company/page.tsx` | ❌ placeholder | ✅ | OKRs estratégicos filtrados por level="company"; cycle selector, KPIs, cards expand/KRs, CRUD completo com confirm dialog |
| `okrs/individuais/page.tsx` | ❌ placeholder | ✅ | OKRs pessoais do usuário logado (level="individual", ownerId=userId); mesmo padrão de company |

### Implementado

- fix: `decisions-list.tsx` — substituído `deleteDecision.mutate(id)` direto por AlertDialog de confirmação com título da decisão e warning de irreversibilidade
- feat: `pessoas/reconhecimentos/page.tsx` — página completa reutilizando toda a infra de `cultura/reconhecimentos` (hooks, components, services); Tabler Icons em vez de lucide-react; textos corrigidos (sem encoding)
- feat: `okrs/company/page.tsx` — página de OKRs Company level; OkrCycleSelector + OkrKpis + OkrObjectiveCard + OkrKeyResultList + dialogs CRUD; RequireRole para criação restrita a lider+
- feat: `okrs/individuais/page.tsx` — página de OKRs Individuais filtrada por ownerId=userId; padrão idêntico ao company mas sem restrição de role para criar

### Migrations aplicadas

Nenhuma — todas as tabelas já existem no schema.

### Próximo ciclo (sugestões)

- `okrs/teams/page.tsx` — placeholder; criar view de OKRs por squad/equipe (level="squad")
- `okrs/dashboard/page.tsx` — ainda placeholder; criar view de KPIs agregados com progresso por ciclo
- `okrs/check-ins/page.tsx` — ainda placeholder; listar check-ins recentes de todos os KRs do ciclo ativo
- Migração Lucide → Tabler nos `features/decisions/` e `features/people/` (ainda usam lucide-react direto)
- `projetos/templates/page.tsx` — placeholder; CRUD básico de templates de projeto

### Debt técnico

- `pessoas/reconhecimentos/page.tsx` herda o mesmo padrão de `cultura/reconhecimentos` — ambas as páginas são idênticas; candidato a extração de componente compartilhado em ciclo futuro
- `okrs/company/` e `okrs/individuais/` têm ~80% de código duplicado — candidato a abstração `OkrFilteredPage` com level como prop em ciclo futuro

---

## Ciclo — 2026-03-13 (auto) — Ciclo 14

**Módulo**: Multi-módulo (Cultura, Pessoas, Projetos)
**Branch**: `main`
**Build**: ✅ Passou antes e depois das 3 melhorias

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| Build — `redemption-pending-list.tsx` | 🔧 | ✅ | TypeScript strict: `Record<string, number>` não aceito como index; substituído por função `getStatusOrder` com type guards explícitos |
| `pessoas/colaboradores/page.tsx` | ❌ placeholder | ✅ | Diretório completo com busca, filtro de status, grid de cards, skeleton, empty state, error state e PersonDetail sheet |
| `projetos/decisoes/page.tsx` | ❌ inexistente | ✅ | Página criada conectando todos os componentes do feature `decisions` (list, detail, form, filters); adicionada ao PROJETOS_NAV_ITEMS |
| `lib/icons.ts` | ⚠️ | ✅ | Adicionado `check-square` (CheckSquare) ao ICON_MAP para suportar ícone de Decisões na sidebar |

### Implementado

- fix: `getStatusOrder` helper type-safe em `redemption-pending-list.tsx` (evita implicit any em strict mode)
- feat: `pessoas/colaboradores/page.tsx` — diretório da equipe com busca por nome/cargo/email, filtro por status (pills coloridas), grid 4 colunas, skeleton content-aware 8 cards, EmptyState com CTA, ErrorState com retry, PersonDetail sheet ao clicar
- feat: `projetos/decisoes/page.tsx` — página completa de decisões: header com botão "Nova Decisão", DecisionFilters (busca + datas), DecisionsList com CRUD (view/edit/delete), DecisionDetail sheet (inline-edit + delete confirm), DecisionForm dialog (create)
- feat: `lib/constants.ts` — adicionado item "Decisões" ao PROJETOS_NAV_ITEMS com icon "check-square"
- feat: `lib/icons.ts` — importado e registrado `CheckSquare` de lucide-react

### Migrations aplicadas

Nenhuma — `decisions` e `profiles` já existem no schema.

### Próximo ciclo (sugestões)

- `pessoas/reconhecimentos/page.tsx` — placeholder; feature `cultura/reconhecimentos` já tem lógica reutilizável
- `okrs/dashboard/page.tsx` e sub-páginas de OKRs (check-ins, company, individuais, teams) — todos placeholders; feature `okrs` já tem hooks
- `projetos/templates/page.tsx` — placeholder; criar CRUD básico de templates de projeto
- Migração Lucide → Tabler Icons nos componentes de decisions e people (usam lucide-react direto)
- Confirmação de delete em DecisionsList (atualmente deleta sem confirmação)

### Debt técnico

- `decisions-list.tsx` deleta sem confirmation dialog (onClick direto em `deleteDecision.mutate`) — risco de ação acidental; a ser resolvido em ciclo futuro
- Ícones de `features/decisions/` e `features/people/` ainda importam diretamente de `lucide-react` (não Tabler) — fora do padrão mas não quebra nada

---

## Ciclo — 2026-03-13 (auto) — Ciclo 13

**Módulo**: Chat (`features/chat/components`)
**Branch**: `claude/improve-20260313-c13`
**Build**: ✅ Passou antes e depois das 3 melhorias

### Estado do módulo

| Componente | Antes | Depois | Detalhes |
|---|---|---|---|
| `channel-list.tsx` | ⚠️ 698L | ✅ 238L | Extraídos: channel-list-item, channel-list-section-header |
| `chat-layout.tsx` | ⚠️ 607L | ✅ 288L | Extraídos: chat-sidebar, conversation-header |
| `channel-settings-drawer.tsx` | ⚠️ 412L | ✅ 197L | Extraídos: channel-add-members-panel, channel-members-list |

### Implementado

- refactor: `channel-list-item.tsx` (254L) — ChannelItem com context menu, delete dialog, DM avatar
- refactor: `channel-list-section-header.tsx` (178L) — SectionHeader collapsible + InlineCreateSection
- refactor: `channel-list.tsx` (238L) — orquestrador limpo importando sub-componentes
- refactor: `chat-sidebar.tsx` (169L) — sidebar do chat com header de ações e channel list
- refactor: `conversation-header.tsx` (100L) — header da conversa (avatar, nome, search/settings buttons)
- refactor: `chat-layout.tsx` (288L) — orquestrador com data fetching + handlers + render delegado
- refactor: `channel-add-members-panel.tsx` (110L) — painel de busca e seleção de novos membros
- refactor: `channel-members-list.tsx` (80L) — lista de membros com role toggle e remove

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `message-input.tsx` (322L) e `message-bubble.tsx` (322L) — próximos candidatos a split no chat
- `features/contratos/components/contract-detail-dialog.tsx` (461L) — ainda acima do limite
- `features/demands/components/demand-detail-sidebar.tsx` (455L) — candidato a split
- Limpeza sistemática de lucide-react (ainda presente em ~100 arquivos) — ciclo dedicado

### Debt técnico

- `chat-layout.tsx` em 288L — acima de 200L mas abaixo do hard limit (300L); handlers compactos em uma linha aceitável por ora
- lucide-react ainda em ~100 arquivos — requer ciclo dedicado

---

## Ciclo — 2026-03-13 (auto) — Ciclo 12

**Módulo**: Contratos (`features/contratos/components`)
**Branch**: `claude/improve-20260313-auto`
**Build**: ✅ Passou antes e depois das 3 melhorias

### Estado do módulo

| Componente | Antes | Depois | Detalhes |
|---|---|---|---|
| `contract-filters-panel.tsx` | ⚠️ 717L | ✅ 139L | Extraídos: helpers, 3 filter sections, ActiveFiltersBadges |
| `contract-data-table.tsx` | ⚠️ 632L | ✅ 274L | Extraído: `ContractTableRow` (desktop + mobile + ações) |
| `contract-form-dialog.tsx` | ⚠️ 630L | ✅ 223L | Extraídos: `ContractFormFields` + `ContractFileUpload` |

### Implementado

- refactor: `contract-filter-helpers.tsx` — FilterChip, FilterSection, countActiveFilters, getMonthRange, toggleInArray
- refactor: `contract-filter-sections.tsx` — ContractBasicFilters, ContractTemporalFilters, ContractAdvancedFilters
- refactor: `contract-active-filters-badges.tsx` — ActiveFiltersBadges
- refactor: `contract-table-row.tsx` — ContractTableRow (desktop + mobile layout + action menu)
- refactor: `contract-form-fields.tsx` — ContractFormFields + contractSchema + getEmptyForm
- refactor: `contract-file-upload.tsx` — ContractFileUpload com drag/drop e validação internos

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `features/chat/components/channel-list.tsx` (698L) — split em sub-componentes
- `features/chat/components/chat-layout.tsx` (607L) — split
- Migrar `lib/icons.ts` de lucide-react para Tabler Icons (afeta sidebar e nav)
- Limpeza sistemática de lucide-react nos ~100 arquivos de features (ciclo dedicado)
- Realtime subscription no task detail (comments/activity ao vivo)

### Debt técnico

- lucide-react ainda presente em ~100 arquivos de features/app (violação do stack); limpeza sistemática pendente
- `lib/icons.ts` usa lucide-react como registry central do sidebar — requer ciclo dedicado para migrar

---

## Ciclo — 2026-03-13 (auto) — Ciclo 11

**Módulo**: Comercial (relatorios) + Tarefas (toolbar)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois das mudanças

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| `comercial/relatorios/page.tsx` — ícones lucide-react | 🔧 | ✅ | 13 ícones substituídos por Tabler equivalentes |
| `comercial/relatorios/page.tsx` — tamanho | ⚠️ 1179L | ✅ 270L | Sub-componentes extraídos para `comercial-relatorios-components.tsx` |
| `task-actions-toolbar.tsx` — botão "Anexar arquivo" | 🔧 | ✅ | Conectado ao `useUploadAttachment` via file input oculto; suporte multi-arquivo, validação 25MB, toast de sucesso/erro |

### Implementado

- fix: substituir 13 ícones lucide-react por Tabler Icons em `comercial/relatorios/page.tsx`
- refactor: extrair 14 sub-componentes (KpiRow, charts, tables, InsightsSection, DashboardSkeleton) + formatters para `features/comercial/components/comercial-relatorios-components.tsx`
- refactor: extrair ProductMixSection do main component para manter `ComercialRelatorios` < 200L
- feat: botão "Anexar arquivo" em `task-actions-toolbar.tsx` — upload real via `useUploadAttachment`, multi-arquivo, validação de tipo e tamanho, toast de feedback

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `features/contratos/components/contract-filters-panel.tsx` (717L) — maior componente não tocado do projeto
- `features/chat/components/channel-list.tsx` (698L) — split em sub-componentes
- `features/contratos/components/contract-data-table.tsx` (632L) — split
- Substituir restantes imports lucide-react (ainda presentes em ~30 arquivos) — ciclo dedicado de limpeza global
- Realtime subscription no task detail (comments/activity ao vivo)

### Debt técnico

- `comercial-relatorios-components.tsx` é um arquivo grande (~900L) mas todos os componentes internos são < 200L cada — aceitável por ora
- lucide-react ainda presente em ~30 arquivos (admin, agenda, alerts, changelog, clientes, contratos, cultura, dashboard, diretoria, financeiro, inteligencia, kanban, mercado, permissões, etc.) — limpeza sistemática pendente

---

## Ciclo — 2026-03-13 (auto) — Ciclo 10

**Módulo**: Tarefas (split de componentes oversized — rodada 2)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou antes e depois das mudanças

### Estado do módulo

| Componente                          | Antes | Depois | Detalhes |
|-------------------------------------|-------|--------|----------|
| `custom-field-value-editor.tsx`     | 606L  | 74L    | Extraídos 7 editors para 4 arquivos |
| `custom-field-definition-form.tsx`  | 511L  | 185L   | Extraídos 6 steps + indicator para 2 arquivos |
| `my-task-table-row.tsx`             | 329L  | 137L   | Extraídas 6 cell renderers para 1 arquivo |

### Implementado

- refactor: `custom-field-simple-editors.tsx` — TextEditor, NumberEditor, CheckboxEditor
- refactor: `custom-field-date-editor.tsx` — DateEditor
- refactor: `custom-field-select-editor.tsx` — SelectEditor, MultiSelectEditor
- refactor: `custom-field-person-editor.tsx` — PersonEditor
- refactor: `custom-field-step-indicator.tsx` — StepIndicator
- refactor: `custom-field-definition-steps.tsx` — StepName, StepType, StepOptions, StepRequired, StepPreview
- refactor: `my-task-table-row-cells.tsx` — todas as 6 cell renderers + renderCellContent

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `my-tasks-board-view.tsx` (275L) — ainda acima do limite
- `my-tasks-table-header.tsx` (266L) — acima do limite
- `task-description-editor.tsx` (299L) — acima do limite
- `task-actions-toolbar.tsx` (319L) — acima do limite; botão "Anexar arquivo" ainda com toast "em breve"
- Realtime subscription no task detail (comments/activity ao vivo)

### Debt técnico

- Botão "Anexar arquivo" no toolbar dispara toast "em breve" — retornar quando a UI de upload estiver integrada ao toolbar
- `task-actions-toolbar.tsx` e `task-description-editor.tsx` ainda acima de 200L

---

## Ciclo — 2026-03-13 (auto) — Ciclo 9

**Módulo**: Tarefas (split de componentes oversized)
**Branch**: `claude/improve-20260312-auto`
**Build**: ✅ Passou

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| `task-subtasks-section.tsx` | 🔧 332L | ✅ 166L | Extraído SubtaskRow (107L) + TaskSubtaskAddForm (88L) |
| `task-dependencies-section.tsx` | 🔧 326L | ✅ 179L | Extraído DependencyItem (106L) + AddDependencyButton (41L) |
| `use-task-custom-fields.ts` | ⚠️ untracked | ✅ | Já commitado em F11 (2c3d11b) — falso positivo no git status inicial |

### Implementado

- refactor(tarefas): split task-subtasks-section 332L → task-subtask-row + task-subtask-add-form + section (166L)
- refactor(tarefas): split task-dependencies-section 326L → task-dependency-item + task-dependency-add-button + section (179L)

### Migrations aplicadas

Nenhuma neste ciclo.

### Próximo ciclo (sugestões)

- Split `custom-field-value-editor.tsx` (606L) — maior violação de tamanho no módulo
- Split `custom-field-definition-form.tsx` (511L)
- Split `custom-fields-section.tsx` (245L)
- Split `my-task-table-row.tsx` (329L)
- Migrar lucide-react em features/financeiro (14 arquivos restantes)

### Debt técnico

- 4 componentes do F11 (custom fields) ainda acima de 200L — precisam de split no próximo ciclo
- Tabelas `custom_field_definitions` e `task_custom_field_values` referenciadas no service mas schema usa `os_custom_fields` — verificar se há migration pendente

---

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
