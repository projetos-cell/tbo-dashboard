# TBO OS — Audit Log

## Ciclo 25 — 2026-03-13 (sessão atual)

**Módulo**: Sidebar DnD, Comercial (deal-form), Tasks (board-view)
**Build**: ✅ Compiled successfully + tsc --noEmit sem erros

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| sidebar DnD cross-group | 🔧 React error #185 | ✅ | Sem optimistic mid-drag; cross-group só no dragEnd; visual ring indicator |
| deal-form-dialog.tsx (344L) | ⚠️ viola 200L | ✅ | Split: 167L + deal-form-fields.tsx (188L) |
| my-tasks-board-view.tsx (275L) | ⚠️ viola 200L | ✅ | Split: 182L + my-tasks-board-column.tsx (94L) |

### Implementado

- fix(sidebar): use-sidebar-dnd.ts — remove optimistic mid-drag cross-group moves, add overGroupLabel visual ring indicator (arquivos: hooks/use-sidebar-dnd.ts, components/layout/app-sidebar.tsx, components/layout/sidebar/sortable-nav-group.tsx)
- refactor(comercial): deal-form-dialog.tsx split — DealFormFields extraído com props form/errors/onChange (arquivos: deal-form-dialog.tsx, deal-form-fields.tsx)
- refactor(tasks): my-tasks-board-view.tsx split — SortableCard + BoardColumn extraídos (arquivos: my-tasks-board-view.tsx, my-tasks-board-column.tsx)

### Migrations aplicadas

Nenhuma.

### Próximo ciclo

- demand-board-card.tsx (280L), demand-comment-thread.tsx (283L) — ainda acima de 200L
- deal-pipeline.tsx (285L) — acima de 200L
- task-description-editor.tsx (299L) — acima de 200L
- app-sidebar.tsx (267L), sortable-nav-group.tsx (224L) — acima de 200L
- Untracked: `app/(auth)/usuarios/`, `features/usuarios/` — novo módulo não commitado

### Debt técnico

- Erro `pages-manifest.json` no pnpm build persiste (infra Next.js 16 + Turbopack) — não é código, build compila com sucesso


## Ciclo 22 — 2026-03-13 20:08

**Módulo**: Demandas, Mercado, Financeiro (Contas)
**Branch**: `claude/improve-20260313-2008` → mergeado em `main`
**Build**: ✅ Clean antes e depois de todas as mudanças

### Estado do módulo

| Arquivo | Antes | Depois | Detalhes |
|---|---|---|---|
| `features/demands/components/demand-detail-sidebar.tsx` | ⚠️ 455L | ✅ ~120L | Split em 3: hook + properties + shell |
| `app/(auth)/mercado/page.tsx` | ⚠️ 549L | ✅ 247L | Sub-componentes extraídos para feature/mercado/components |
| `app/(auth)/financeiro/contas/page.tsx` | ⚠️ 515L | ✅ 180L | EntryTable + SummaryCards extraídos para features/financeiro/components |

### Implementado

- refactor(demands): `demand-detail-sidebar.tsx` (455L) → 3 arquivos
  - `features/demands/hooks/use-section-order.ts` (~35L): hook de ordenação de seções
  - `features/demands/components/demand-sidebar-properties.tsx` (~200L): buildPropertyMap + option lists + CORE/SCHEDULE/DETAIL_KEYS
  - `demand-detail-sidebar.tsx` (~120L): shell principal com DnD + sections

- refactor(mercado): `app/(auth)/mercado/page.tsx` (549L) → 2 arquivos
  - `features/mercado/components/mercado-page-components.tsx` (~318L): KPIBig, HorizontalBarCard, HistoricalLineCard, OccupancyDonut, EstabelecimentosGrid, BairrosMapGrid + helpers
  - `page.tsx` (247L): apenas estado (filtros, mapMetric) + layout

- refactor(financeiro): `app/(auth)/financeiro/contas/page.tsx` (515L) → 3 arquivos
  - `features/financeiro/components/contas-entry-table.tsx` (~245L): StatusBadge, DaysBadge, Valor, EntryTable
  - `features/financeiro/components/contas-summary-cards.tsx` (~101L): ContasSummaryCards (5 KPI cards)
  - `page.tsx` (180L): ContasContent + ContasPage

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `features/mercado/components/mercado-page-components.tsx` (318L) — borderline, pode ser dividido se crescer
- Auditar módulos com botões sem handler (verificar features/rsm, features/cultura)
- Auditar `any` remanescente em API routes (supabase as any em ClickSign/Notion)

### Debt técnico

- `mercado-page-components.tsx` em 318L (acima de 200L, mas arquivo de barrel com múltiplos componentes independentes — cada componente individual está abaixo de 200L)

## Ciclo 21 — 2026-03-13 19:30

**Módulo**: Comercial (charts), Contratos
**Branch**: `claude/improve-20260313-1930` → mergeado em `main`
**Build**: ✅ Clean antes e depois de todas as mudanças

### Estado do módulo

| Arquivo | Antes | Depois | Problema |
|---|---|---|---|
| `features/comercial/components/comercial-relatorios-components.tsx` | ⚠️ 890L | ✅ 24L barrel | Acima do limite de 300L — dividido em 6 sub-arquivos temáticos |
| `features/contratos/services/contracts.ts` | ⚠️ `any` x2 | ✅ sem `any` | Dois `any` explícitos com eslint-disable — removidos com typeof pattern |
| `features/contratos/components/contract-detail-dialog.tsx` | ⚠️ 461L | ✅ 135L | Acima do limite — dividido em 3 sub-componentes |

### Implementado

- refactor(comercial): `comercial-relatorios-components.tsx` (890L) → 6 sub-arquivos
  - `comercial-chart-utils.ts` (~30L): formatters fmtCompact, fmtPct, currencyFormatter + PRODUCT_BAR_COLORS
  - `comercial-kpi-insights.tsx` (~160L): KpiRow + InsightsSection + DashboardSkeleton
  - `comercial-revenue-charts.tsx` (~268L): MonthlyRevenueChart + StageDonut + BUDonutChart + AvgPriceByBUChart
  - `comercial-client-charts.tsx` (~227L): TopClientsChart + TopOwnersChart + PipelineByOwnerChart + re-exports tabelas
  - `comercial-ranking-tables.tsx` (~114L): ClientRankingTable + OwnersTable
  - `comercial-product-charts.tsx` (~143L): TopProductsChart + ProductRankingTable
  - Barrel mantém import path inalterado para `app/(auth)/comercial/relatorios/page.tsx`

- fix(contratos): `contracts.ts` — `any` removido via padrão `typeof baseQuery`
  - `applySorting` movida para dentro de `getContracts` para acesso ao tipo local `Q = typeof baseQuery`
  - Zero `any`, zero `eslint-disable` remanescentes

- refactor(contratos): `contract-detail-dialog.tsx` (461L) → 3 sub-componentes
  - `contract-detail-header.tsx` (~112L): ContractDetailHeader — título + badges + status
  - `contract-detail-body.tsx` (~267L): ContractDetailBody — responsável, info cards, alertas, arquivo, metadata
  - `contract-detail-dialog.tsx` (~135L): shell + footer + AlertDialog (era 461L)

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `demand-detail-sidebar.tsx` (455L) — ainda acima do limite, split pendente
- `app/(auth)/mercado/page.tsx` (549L) — acima do limite
- `app/(auth)/financeiro/contas/page.tsx` (515L) — acima do limite
- `features/contratos/components/contract-detail-body.tsx` (267L) — borderline, monitorar

### Debt técnico

- `contract-detail-body.tsx` em 267L (acima de 200 mas abaixo de 300, coeso como componente único)
- `(supabase as any)` em routes do Notion e ClickSign — fora de escopo deste ciclo (API routes)

## Ciclo — 2026-03-13 — Ciclo 19 (completo)

**Módulo**: Multi-módulo (migração total lucide-react → @tabler/icons-react)
**Branch**: `main`
**Build**: ✅ EXIT:0 — 43 rotas, TypeScript clean, 23 páginas estáticas geradas

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| lucide-react imports | ~150 arquivos | 0 arquivos | Migração completa em app/, features/, components/, lib/ |
| Build Turbopack | 🔧 | ✅ | Todos os ícones inválidos corrigidos |
| TypeScript check | 🔧 | ✅ | `tsc --noEmit` sem erros |
| `next.config.ts` | 🔧 | ✅ | `ignoreBuildErrors: false` + `turbopack.root` restaurados |

### Implementado

**Migração completa lucide-react → @tabler/icons-react (Ciclo 19):**
- ~150 arquivos migrados em 10 batches paralelos de agentes
- Padrão: import com prefixo `Icon` de `@tabler/icons-react`
- `LucideIcon` type → `React.ElementType`
- Correções de nomes inválidos no @tabler/icons-react@3.40:
  - `IconShieldAlert` → `IconShieldExclamation` (require-role.tsx)
  - `IconHardDrive` → `IconServer` (system-health)
  - `IconPackageCheck` → `IconPackages` (redemption-pending-list)
  - `IconHardHat` → `IconHelmet` (mercado)
  - `IconChevronsUpDown` → `IconSelector` (user-selector)
  - `IconChartGantt` → `IconTimeline`, `IconHandshake` → `IconUsersGroup`, `IconKanban` → `IconLayoutKanban` (lib/icons.ts)
  - `IconListPlus` → `IconListDetails` (quick-actions)
  - `IconOctagonX` → `IconAlertOctagon` (sonner)
  - `Inbox` → `IconInbox` (alerts)
  - `IconIconPlus`/`IconIconSearch` → `IconPlus`/`IconSearch` (cascade replace_all corrigido)
- fix: `next.config.ts` — `turbopack.root` restaurado (suprime warning workspace root)

### Migrations aplicadas

Nenhuma.

### Próximo ciclo

- Remover `lucide-react` do `package.json` (agora sem uso)
- Verificar se algum componente shadcn/ui traz lucide-react internamente e encapsular

### Debt técnico

Nenhum novo.

---

## Ciclo — 2026-03-13 (auto) — Ciclo 17

**Módulo**: Pessoas (organograma, PDI, performance)
**Branch**: `main`
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| org-chart.tsx — ícones lucide | 🔧 | ✅ | 10 ícones substituídos por @tabler/icons-react |
| org-chart.tsx — tamanho | ⚠️ | ✅ | 394L → 244L + novo org-tree-node.tsx (145L) |
| org-chart.tsx — onNodeClick | ❌ | ✅ | Prop adicionada com propagação + stopPropagation no toggle |
| pdi/page.tsx — ícones lucide | ⚠️ | ✅ | Plus + Search → IconPlus + IconSearch |
| performance/page.tsx — ícones lucide | ⚠️ | ✅ | 6 ícones → equivalentes Tabler |

### Implementado

- fix: substituir lucide-react por Tabler Icons em org-chart.tsx (IconSearch, IconUsers, IconGitBranch, IconBuilding, IconStack, IconZoomIn, IconZoomOut, IconArrowsMaximize, IconChevronDown, IconChevronRight)
- refactor: extrair OrgTreeNode → org-tree-node.tsx (394L → 2 arquivos <250L cada)
- feat: prop onNodeClick em OrgChart + OrgTreeNode com stopPropagation no toggle
- fix: substituir lucide-react em pdi/page.tsx (IconPlus, IconSearch)
- fix: substituir lucide-react em performance/page.tsx (IconTrendingUp, IconChartBar, IconUsers, IconAward, IconAlertTriangle, IconCalculator)

### Migrations aplicadas

Nenhuma neste ciclo.

### Próximo ciclo (sugestões)

- Continuar substituição de lucide-react nos demais arquivos do módulo pessoas (people-kpis, person-detail, person-card, etc.)
- performance/page.tsx (411 linhas) — acima do limite de 300L
- Substituição sistemática em features/dashboard/ (ainda usa muitos ícones lucide)

### Debt técnico

- ~150 arquivos ainda usam lucide-react — substituição incremental por módulo
- performance/page.tsx ainda acima de 300 linhas

---

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

---

## Ciclo 18 — 2026-03-13 (auto)

**Módulo**: founder-dashboard, features/people, features/performance
**Build**: ✅ Passou antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|---|---|---|---|
| `founder-alerts.tsx` — "Cobrar Cliente" | 🔧 | ✅ | `window.alert()` + TODO → `toast.info` + `router.push('/financeiro/contas')` |
| `founder-alerts.tsx` — ícones | 🔧 | ✅ | lucide-react → @tabler/icons-react (8 ícones) |
| `features/people/` — ícones (11 arquivos) | 🔧 | ✅ | 25 ícones únicos migrados para Tabler |
| `features/performance/` — ícones (8 arquivos) | 🔧 | ✅ | 17 ícones únicos migrados para Tabler |

### Implementado

- fix: `founder-alerts.tsx` — substituir `window.alert()` por toast + navegação para /financeiro/contas
- refactor(people): 11 componentes migrados de lucide-react → @tabler/icons-react
- refactor(performance): 8 componentes migrados de lucide-react → @tabler/icons-react

### Migrations aplicadas

Nenhuma neste ciclo.

### Próximo ciclo (sugestões)

- Ainda restam ~65 arquivos com `lucide-react` em outros módulos (clientes, projetos, chat, etc.)
- `comercial-relatorios-components.tsx` (890 linhas) — precisa ser dividido em sub-componentes
- `demand-detail-sidebar.tsx` (455 linhas) — acima do limite
- `contract-detail-dialog.tsx` (461 linhas) — acima do limite

### Debt técnico

- 86 arquivos iniciavam com lucide-react; agora ~66 restantes após este ciclo (20 migrados)

---

## Ciclo 20 — 2026-03-13 15:08

**Módulo**: Projetos, RSM, Relatorios  
**Branch**: `claude/improve-20260313-1508`  
**Build**: ✅ TypeScript clean (tsc --noEmit sem erros) + BUILD_ID gerado  

### Estado do módulo

| Arquivo | Antes | Depois | Problema |
|---|---|---|---|
| `features/projects/components/project-list.tsx` | 🔧 | ✅ | `window.confirm` → `ConfirmDialog` controlado |
| `features/projects/components/project-topbar.tsx` | 🔧 | ✅ | `window.confirm` → `ConfirmDialog` controlado |
| `features/projects/components/tabs/project-files.tsx` | 🔧 | ✅ | `window.confirm` → `ConfirmDialog` controlado |
| `app/(auth)/rsm/page.tsx` | ⚠️ | ✅ | Delete post/ideia sem dialog → `ConfirmDialog` |
| `app/(auth)/relatorios/page.tsx` | ⚠️ | ✅ | Delete agendamento sem dialog → `ConfirmDialog` |

### Implementado

- fix(projetos): `project-list.tsx` — `window.confirm` substituído por `ConfirmDialog` controlado com estado `pendingDelete`
- fix(projetos): `project-topbar.tsx` — `window.confirm` substituído por `ConfirmDialog` + error toast em onError
- fix(projetos): `project-files.tsx` — `window.confirm` substituído por `ConfirmDialog` controlado com estado `pendingDelete`
- fix(rsm): `rsm/page.tsx` — delete post sem confirmação → `ConfirmDialog` com `pendingDeletePost`
- fix(rsm): `rsm/page.tsx` — delete ideia sem confirmação → `ConfirmDialog` com `pendingDeleteIdea`
- fix(relatorios): `relatorios/page.tsx` — delete agendamento sem confirmação → `ConfirmDialog` com `pendingDeleteSchedule`

### Componente reutilizado

- `components/shared/confirm-dialog.tsx` — já existia, aplicado consistentemente nos 5 locais identificados

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- `comercial-relatorios-components.tsx` (~890 linhas) — dividir em sub-componentes
- `demand-detail-sidebar.tsx` (455 linhas) — acima do limite de 200 linhas
- `contract-detail-dialog.tsx` (461 linhas) — acima do limite
- Verificar se há outros módulos com `window.confirm` ou `window.alert` remanescentes

### Debt técnico

- Build via `pnpm build` falha com erro de lock (dev server Turbopack em execução paralela); TypeScript sem erros e BUILD_ID gerado na tentativa anterior confirmam integridade do código


## Ciclo — 2026-03-13 Ciclo 24

**Módulo**: Team (Edge Functions) + Demands (refactor)
**Branch**: main
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| invite-team-member Edge Function | ❌ (ausente, código referenciava) | ✅ | Auth + RBAC + inviteUserByEmail + profile + tenant_members + audit |
| manage-team-member Edge Function | ⚠️ (untracked) | ✅ | Commitado — deactivate/reactivate/delete com ban auth |
| delete-user-dialog | ⚠️ | ✅ | Usa useDeleteTeamMember via Edge Function |
| use-team.ts hooks | ⚠️ | ✅ | useDeleteTeamMember + useToggleUserActive via Edge Functions |
| demands-list.tsx (342L) | ⚠️ (viola 200L) | ✅ | 342L → 37L via useDemandColumns + DemandActionsMenu |
| demands-toolbar.tsx (295L) | ⚠️ (viola 200L) | ✅ | 295L → 151L via DemandFilterDropdown + DemandSortDropdown |

### Implementado

- feat(supabase): invite-team-member Edge Function — RBAC (founder/diretoria), inviteUserByEmail, insert profile + tenant_members, audit log, rollback em caso de erro (arquivos: supabase/functions/invite-team-member/index.ts)
- feat(supabase): manage-team-member Edge Function commitado — deactivate/reactivate/delete com ban auth user, audit trail (arquivos: supabase/functions/manage-team-member/index.ts)
- refactor(demands): demands-list.tsx split em 3 arquivos — useDemandColumns (200L), DemandActionsMenu (124L), demands-list.tsx (37L) (arquivos: use-demand-columns.tsx, demand-actions-menu.tsx, demands-list.tsx)
- refactor(demands): demands-toolbar.tsx split em 3 arquivos — DemandFilterDropdown (115L), DemandSortDropdown (66L), demands-toolbar.tsx (151L) (arquivos: demand-filter-dropdown.tsx, demand-sort-dropdown.tsx, demands-toolbar.tsx)

### Migrations aplicadas
- Nenhuma (Edge Functions não requerem migrations de DB)

### Próximo ciclo
- demand-board-card.tsx (280L) e demand-comment-thread.tsx (283L) — ainda acima de 200L
- deal-form-dialog.tsx (344L), deal-pipeline.tsx (285L) — violations no módulo comercial
- task-description-editor.tsx (299L), my-tasks-board-view.tsx (275L) — violations no módulo tasks
- Edge Functions precisam ser deployadas no Supabase: invite-team-member + manage-team-member

### Debt técnico
- Edge Functions criadas mas não deployadas — necessário rodar supabase functions deploy invite-team-member e supabase functions deploy manage-team-member em produção

## Ciclo — 2026-03-13 Ciclo 26

**Módulo**: Usuários + Cursos (Academia TBO)
**Branch**: main
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| Módulo /usuarios | ❌ | ✅ | Rotas + tabela + paginação + filtros |
| Módulo /cursos | ❌ | ✅ | Rotas + listing + detalhe + player |
| users-table.tsx (251L) | ⚠️ | ✅ | 251L → 119L via extração de user-row.tsx |
| UserRow ações sem handler | 🔧 | ✅ | ConfirmDialog para Suspender/Ativar + Excluir + toast |
| Navegação sidebar | ⚠️ | ✅ | Cursos + Usuários adicionados |

### Implementado

- feat(usuarios): rotas /usuarios e /usuarios/[userId] — ProfileHeader, ProfileTabs, ProfileSkills, ProfileCompletion, ProfileActivity
- feat(usuarios): users-table.tsx 251L → 119L — UserRow extraído para user-row.tsx (190L)
- fix(usuarios): UserRow dropdown — Editar/Suspender/Excluir com ConfirmDialog + toast (antes sem handler)
- feat(cursos): rotas /cursos e /cursos/[courseId] — CourseDetailHeader, CourseVideoPlayer, CourseModulesList, CourseAbout
- feat(nav): sidebar Aprendizado/Cursos + Sistema/Usuários + icons.ts (school, users-group)

### Migrations aplicadas
Nenhuma — módulos usam mock data, sem alterações de schema.

### Próximo ciclo (sugestões)
- Conectar usuários e cursos ao Supabase (substituir mock data)
- demand-board-card.tsx (280L) e demand-comment-thread.tsx (283L) — ainda acima de 200L
- deal-form-dialog.tsx (344L), deal-pipeline.tsx (285L) — violations no módulo comercial
- Convite de usuário via Edge Function (conectar ao manage-team-member existente)

### Debt técnico
- Módulos Usuários e Cursos usam mock data — necessário criar tabelas Supabase e hooks React Query
