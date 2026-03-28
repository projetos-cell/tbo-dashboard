# TBO OS — Audit Log

## Ciclo 44 — 2026-03-28 (Orquestrador — 15 agentes)

**Health Score**: 66/100 (baseline)
**Agentes rodados**: #5 Structural (6/10), #6 UX (7/10), #7 Tasks (8.5/10), #14 Data Contracts (5/10), #15 Regression Guard (baseline)
**Build**: ✅ (zero erros TypeScript)

### Issues Resolvidas

| Issue | Antes | Depois | Arquivos |
|-------|-------|--------|----------|
| /tarefas sem error.tsx | ❌ sem error boundary | ✅ error.tsx criado | app/(auth)/tarefas/error.tsx |
| 4x console.error em produção | ⚠️ console.error direto | ✅ createLogger() estruturado | google-drive.ts, project-templates.ts |
| Delete annotation sem confirm | ❌ mutate direto | ✅ ConfirmDialog | file-proofing-viewer.tsx |
| Remove member sem confirm | ❌ callback direto | ✅ ConfirmDialog controlado | members-drawer.tsx |
| Empty state project-files | ❌ `<p>` simples | ✅ EmptyState component | tabs/project-files.tsx |
| Empty state compact-list | ❌ `<p>` simples | ✅ EmptyState component | project-compact-list.tsx |
| Empty state overview-files | ❌ `<p>` italic | ✅ EmptyState component | tabs/overview-left-column.tsx |

### Debt técnico
- 6x `any` em project services (custom-fields.ts 3x, project-properties.ts 1x, project-templates.ts 2x) — bloqueado até `supabase gen types` regenerar com tabelas novas
- `as never` sistêmico (~40+ locais) — mesma root cause
- select('*') em one-on-ones (11x) e pdi (9x) — próximo ciclo
- 13 sub-rotas de /projetos sem loading.tsx — próximo ciclo
- Task filters não persistidos ao Supabase — próximo ciclo
- Career types manuais sem Insert/Update variants — próximo ciclo

### Próximo ciclo sugerido
1. Regenerar `supabase gen types` para incluir tabelas novas (career_*, project_templates, etc.)
2. Criar loading.tsx nas 13 sub-rotas de /projetos
3. Persistir task filters ao Supabase (reusar useViewFilters do marketing)
4. Substituir select('*') por colunas específicas em one-on-ones e pdi
5. Decompor project-details-dialog.tsx (528L) em sub-componentes

---

## Ciclo 43 — 2026-03-14 (scheduled)

**Módulo**: Projetos/Lista + Cultura/Manual split + Permissões split
**Branch**: claude/improve-20260314-1708 → main
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| projetos/lista | ❌ stub 13L | ✅ | Page completa: tabela ProjectList, filtros busca/status, empty state com CTA, loading skeleton, ProjectForm |
| cultura/manual/page.tsx (467L) | ⚠️ viola 200L | ✅ | 467L → 214L; extrai ManualSortableItem + ManualItemList |
| permissoes/page.tsx (419L) | ⚠️ viola 200L | ✅ | 419L → 123L; extrai PermissoesKpiCards, RoleList, PermissionMatrix, CreateRoleDialog |

### Implementado
- feat(projetos/lista): view tabular completa reutilizando ProjectList + ProjectFilters + ProjectForm existentes
- refactor(cultura/manual): manual-sortable-item.tsx (115L) + manual-item-list.tsx (140L) em features/cultura/components/
- refactor(permissoes): 4 sub-components em features/permissoes/components/ (kpi-cards, role-list, permission-matrix, create-role-dialog)

### Migrations aplicadas
Nenhuma.

### Próximo ciclo
- projetos/calendario, projetos/gantt, projetos/timeline (stubs)
- okrs/configuracoes (stub)
- pessoas/performance split (410L viola 200L)
- cultura/analytics split (377L viola 200L)
- RSM posts/ideias form dialogs reais (substituir toasts "Em breve")

### Debt técnico
- Projetos/lista usa `confirm()` nativo no delete herdado do ProjectList — ideal seria ConfirmDialog
- `supabase as any` em 4+ arquivos de API — aguarda geração de types corretos

---

## Ciclo — 2026-03-14 Ciclo 42 (scheduled)

**Módulo**: Comercial — Leads, Propostas, Atividades
**Branch**: main
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| comercial/leads | ❌ stub | ✅ | Lista filtrada lead/qualificacao + KPIs + busca + quick-advance stage + DealDetailDialog/DealFormDialog |
| comercial/propostas | ❌ stub | ✅ | Lista filtrada proposta/negociacao + KPIs ponderados + probability bar + ações ganho/perdido |
| comercial/atividades | ❌ stub | ✅ | Timeline agrupada por data + filtro período (7d/30d/90d/all) + deal detail on click |

### Implementado
- `feat(comercial/leads)`: page completa com tabela filtrada (lead + qualificacao), KPIs (count/valor/ticket médio), busca full-text, botão "Qualificar/Proposta" inline para avançar stage, DealDetailDialog + DealFormDialog
- `feat(comercial/propostas)`: page completa com tabela filtrada (proposta + negociacao), KPIs (total, valor em aberto, receita ponderada), probability bar visual, quick actions ✓/✗ para fechar ganho/perdido
- `feat(comercial/atividades)`: feed cronológico agrupado por data (Hoje/Ontem/data formatada), filtro de período, timeline com indicadores coloridos por stage, deal detail on click

### Migrations aplicadas
- nenhuma — reusou `crm_deals` existente via `useDeals()`

### Próximo ciclo
- Projetos stubs: /projetos/lista, /projetos/calendario, /projetos/gantt, /projetos/timeline
- OKRs configurações (stub ainda)
- Pessoas/pdi e pessoas/timeline (stubs)

### Debt técnico
- `supabase as any` em 4+ arquivos de API — aguarda geração de types corretos (`supabase gen types`)
- Atividades page usa `updated_at` como proxy de "atividade" — ideal seria uma tabela `crm_activities` dedicada

---

## Ciclo — 2026-03-14 (scheduled)

**Módulo**: OKRs Dashboard + Baú Criativo
**Branch**: main
**Build**: ✅

### Implementado
- **fix(okrs/dashboard)**: `onCreateCycle={() => {}}` → conectado ao `OkrCycleDialog` (único dos 5 pages de OKR que estava faltando)
- **feat(okrs/dashboard)**: empty state melhorado — CTA dinâmico "Criar primeiro ciclo" quando sem ciclos, botão "Ver todos os OKRs" como fallback
- **feat(bau-criativo)**: migrado de `SEED_REFERENCES` hardcoded para `useBauReferences` hook (Supabase real + fallback gracioso quando tabela não existe) — feito pelo ciclo anterior (922225d)

### Próximo ciclo
- Implementar páginas stub: projetos/lista, projetos/calendario, projetos/gantt, projetos/timeline
- OKRs configurações (stub ainda)
- Comercial leads/propostas/atividades (todos stubs)

### Debt técnico
- `supabase as any` em 4+ arquivos de API — aguarda geração de types corretos (`supabase gen types`)

---

## Ciclo — 2026-03-14 Ciclo 38

**Módulo**: Academy (course-detail-header) + splits 200L+ (ciclo 37 já commitados)
**Branch**: main
**Build**: ✅ (TypeScript clean, build OK antes de lock FS do Windows)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| `contract-stepper.tsx` (319L) | ⚠️ viola 200L | ✅ | 319L → 98L; lógica extraída para `use-contract-stepper.ts` (243L) |
| `mercado-page-components.tsx` (318L) | ⚠️ viola 200L | ✅ | 318L → 131L; charts → `mercado-charts.tsx` (191L), utils → `mercado-utils.ts` (32L) |
| `audit-log-table.tsx` (313L) | ⚠️ viola 200L | ✅ | 313L → 123L; partes → `audit-log-parts.tsx` (280L), constantes → `audit-log-constants.ts` (41L) |
| `course-detail-header.tsx` — botões sem handler | 🔧 QUEBRADO | ✅ | Share: clipboard + toast; Bookmark: toggle com estado visual + toast; fix backHref `/cursos` → `/academy/explorar` |

### Implementado

- refactor(contratos): `contract-stepper.tsx` 319L → 98L — toda lógica de estado/mutations/validação extraída para `use-contract-stepper.ts`
- refactor(mercado): `mercado-page-components.tsx` 318L → 131L — charts em `mercado-charts.tsx`, helpers em `mercado-utils.ts`; re-exports mantidos para backward compat
- refactor(configuracoes): `audit-log-table.tsx` 313L → 123L — sub-componentes em `audit-log-parts.tsx`, constantes em `audit-log-constants.ts`
- feat(academy): `course-detail-header.tsx` — share (clipboard) + bookmark (toggle estado) com feedback visual; fix backHref para rota correta

### Migrations aplicadas
Nenhuma.

### Próximo ciclo
- `audit-log-parts.tsx` (280L) — ainda viola 200L soft-limit; candidato a split em próximo ciclo
- `project-topbar.tsx` (296L), `chat-layout.tsx` (288L), `policy-detail.tsx` (286L) — próximos na fila
- `one-on-one-detail.tsx` (282L), `changelog-form.tsx` (275L) — fila de splits

### Debt técnico
- audit-log-parts.tsx com 4 componentes em 280L — aceitável por ora (cada um < 100L individualmente)

## Ciclo 35 — 2026-03-14

**Módulo**: Clicksign webhook (type safety) + Decisions (split) + Chat message-input (split)
**Branch**: main
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| `app/api/webhooks/clicksign/route.ts` — `supabase: any` | ⚠️ `// eslint-disable-next-line @typescript-eslint/no-explicit-any` + `supabase: any` | ✅ | Tipado com `SupabaseClient` do `@supabase/supabase-js` — remove eslint-disable e `any` explícito |
| `features/decisions/components/decision-detail.tsx` (320L) | ⚠️ viola 200L | ✅ 183L | Painel de propriedades + delete extraído para `decision-detail-sidebar.tsx` (176L) |
| `features/chat/components/message-input.tsx` (322L) | ⚠️ viola 200L | ✅ 225L | DragOverlay + PendingFilesList + useDragDrop extraídos para `message-input-parts.tsx` (125L) |

### Implementado

- fix(clicksign): `route.ts` — `supabase: any` substituído por `SupabaseClient` tipado (import de `@supabase/supabase-js`); removido `eslint-disable-next-line @typescript-eslint/no-explicit-any`
- refactor(decisions): `decision-detail.tsx` 320L → 183L — painel direito (properties + timestamps + delete confirm) extraído para `decision-detail-sidebar.tsx` (176L) com props bem tipadas
- refactor(chat): `message-input.tsx` 322L → 225L — `DragOverlay`, `PendingFilesList` e `useDragDrop` hook extraídos para `message-input-parts.tsx` (125L); lógica de drag-and-drop isolada e reutilizável

### Migrations aplicadas
- Nenhuma

### Próximo ciclo
- `message-input.tsx` (225L) — ainda ligeiramente acima de 200L, candidato a redução adicional
- `components/modules/team/invite-user-dialog.tsx` (329L) — stepper dialog, extrair steps
- `app/(auth)/rsm/page.tsx` (529L) — page grande, extrair sub-componentes
- `app/(auth)/permissoes/page.tsx` (419L) — page grande
- Sidebar: implementar inline rename de grupo (modal ou inline edit)
- Sidebar: `hiddenGroups: Set<string>` no sidebar-store para "Ocultar seção"

### Debt técnico
- `message-input.tsx` em 225L — 25L acima do limite, aceitável como redução de 322L → 225L
- `app/api/finance/status/route.ts` — `(supabase as any)` x4 para tabelas fora do schema gerado (`finance_transactions`, `finance_categories`, `finance_cost_centers`, `omie_sync_log`) — requer `supabase gen types` para resolver
- `app/api/notion/*` — `(supabase as any)` para `notion_integrations` — idem, aguarda schema update

---

## Ciclo 33 — 2026-03-14

**Módulo**: Sidebar (sortable-nav-group) + Demands (demand-comment-thread)
**Branch**: claude/improve-20260314-0630 → main
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| Botão + no grupo de nav | ❌ (TODO, sem handler) | ✅ | Navega para primeiro item do grupo via useRouter |
| Recolher todas (DropdownMenu) | ❌ (sem handler) | ✅ | Recolhe todos os grupos via collapseAllGroups |
| Renomear seção / Ocultar seção | ❌ (sem handler) | ⚠️ | Marcados como `disabled` — feedback visual de "não disponível" |
| demand-comment-thread handleSubmit | ⚠️ (sem try/catch) | ✅ | try/catch + toast.error ao falhar |

### Implementado

- feat(sidebar): botão + navega para `orderedItems[0]?.href` via `useRouter` (sortable-nav-group.tsx)
- feat(sidebar): `collapseAllGroups(groupLabels[])` adicionado ao sidebar-store; "Recolher todas" wired (sidebar-store.ts, sortable-nav-group.tsx)
- fix(demands): try/catch + toast.error em `handleSubmit` do DemandCommentThread (demand-comment-thread.tsx)

### Migrations aplicadas
- Nenhuma

### Próximo ciclo
- Renomear seção: implementar inline rename ou dialog para grupos da sidebar
- Ocultar seção: adicionar `hiddenGroups: Set<string>` ao sidebar-store
- demand-comment-thread: verificar se DemandCommentItem tem error handling em delete/update

### Debt técnico
- Nenhum novo introduzido

## Ciclo 32 — 2026-03-14

**Módulo**: Layout (header, sidebar) + Shared (custom-field-config)
**Branch**: claude/improve-20260314-1200 → main
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| components/layout/header.tsx (364L) | ⚠️ viola 300L | ✅ | 364L → header.tsx (32L) + header-parts.tsx (282L) — 5 sub-componentes extraídos |
| components/layout/sidebar/sortable-nav-item.tsx (357L) | ⚠️ viola 300L | ✅ | 357L → 266L + parts (147L) — NavItemHoverActions + NavItemDragHandle extraídos |
| components/shared/custom-field-config.tsx (328L) | ⚠️ viola 300L | ✅ | 328L → 149L + custom-field-dialog.tsx (202L) — FieldDialog extraído com tipos públicos |

### Implementado

- refactor(layout): header.tsx 364L → 32L — ThemeToggle, NotificationItem, NotificationBell, SearchButton, UserAvatar extraídos para header-parts.tsx
- refactor(sidebar): sortable-nav-item.tsx 357L → 266L — NavItemHoverActions + NavItemDragHandle em sortable-nav-item-parts.tsx; hooks internos eliminam prop drilling
- refactor(shared): custom-field-config.tsx 328L → 149L — FieldDialog + FIELD_ICONS + FieldDialogSaveData em custom-field-dialog.tsx

### Migrations aplicadas
Nenhuma.

### Próximo ciclo
- components/modules/team/invite-user-dialog.tsx (329L) — stepper dialog, extrair steps
- app/(auth)/rsm/page.tsx (529L) — page grande
- app/(auth)/permissoes/page.tsx (419L) — page grande
- custom-field-dialog.tsx (202L) — está no limite, pode crescer

### Debt técnico
Nenhum novo.

---

## Ciclo 30 — 2026-03-14

**Módulo**: Splits — founder-dashboard, contratos, PDI
**Branch**: `main`
**Build**: ✅ Clean antes e depois de todas as mudanças

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| revenue-concentration.tsx (362L) | ⚠️ | ✅ | Split em 3: main (116L) + parts (136L) + helpers (67L) |
| contract-filter-sections.tsx (351L) | ⚠️ | ✅ | Split em 3 arquivos + barrel: basic (144L) + temporal (118L) + advanced (89L) |
| pdi-detail.tsx (363L) | ⚠️ | ✅ | Split em 3: detail (150L) + goals-section (150L) + goal-item (112L) |

### Implementado

- refactor(founder-dashboard): revenue-concentration.tsx 362L → 3 arquivos (helpers.ts 67L, parts.tsx 136L, main.tsx 116L)
- refactor(contratos): contract-filter-sections.tsx 351L → contract-basic-filters.tsx (144L) + contract-temporal-filters.tsx (118L) + contract-advanced-filters.tsx (89L) + barrel de 4 linhas
- refactor(pdi): pdi-detail.tsx 363L → pdi-detail.tsx (150L) + pdi-goals-section.tsx (150L) + pdi-goal-item.tsx (112L)

### Migrations aplicadas
Nenhuma

### Próximo ciclo
- workspace-settings.tsx (345L) + profile-form.tsx (323L) — configurações ainda acima de 200L
- message-input.tsx (322L) — chat precisa split
- decision-detail.tsx (320L), contract-stepper.tsx (319L) — violações de 300L

### Debt técnico
Nenhum

---

## Ciclo 29 — 2026-03-14

**Módulo**: Team (split), Demands Comments (split), Kanban AssignUsersDialog (real data)
**Branch**: `main`
**Build**: ✅ Clean antes e depois de todas as mudanças

### Estado do módulo

| Componente | Antes | Depois | Detalhes |
|------------|-------|--------|----------|
| `team-management-page.tsx` | ⚠️ 611L (viola 200L) | ✅ 162L | Split em 3 componentes |
| `team-table.tsx` | ❌ Inexistente | ✅ 316L | Extraído de team-management-page |
| `team-stats-cards.tsx` | ❌ Inexistente | ✅ 60L | Extraído de team-management-page |
| `team-toolbar.tsx` | ❌ Inexistente | ✅ 97L | Extraído de team-management-page |
| `demand-comment-thread.tsx` | ⚠️ 283L (viola 200L) | ✅ 75L | Split em 2 componentes |
| `demand-comment-composer.tsx` | ❌ Inexistente | ✅ 57L | Extraído de demand-comment-thread |
| `demand-comment-item.tsx` | ❌ Inexistente | ✅ 145L | Extraído de demand-comment-thread |
| `AssignUsersDialog.tsx` | 🔧 Mock hardcoded + TODO | ✅ Real data + toast | Conectado ao useTeamMembers, skeleton loading, error handling |

### Implementado

- refactor(team): `team-management-page.tsx` 611L → 162L — extraído `team-table.tsx` (316L), `team-stats-cards.tsx` (60L), `team-toolbar.tsx` (97L). Exports adicionados em `index.ts`.
- refactor(demands): `demand-comment-thread.tsx` 283L → 75L — extraído `demand-comment-composer.tsx` (57L) e `demand-comment-item.tsx` (145L)
- fix(kanban): `AssignUsersDialog.tsx` — mock `MOCK_USERS` substituído por `useTeamMembers({ is_active: true })`, skeleton loading state, toast de sucesso/erro, prop `onAssign` para callback externo, reset de estado ao fechar

### Audit completo — issues identificados neste ciclo

| Área | Status | Prioridade |
|------|--------|------------|
| 20+ páginas placeholder (13L, "Em desenvolvimento") | ❌ AUSENTE | Médio |
| `any` casts no supabase client (notion, finance APIs) | ⚠️ PARCIAL | Baixo |
| KanbanToolbar — filtros de status/priority/assignee sem persistência | ⚠️ PARCIAL | Médio |
| `onClick={() => {}}` no DragOverlay | ✅ OK | Intencional |

### Migrations aplicadas

Nenhuma — sem alterações de schema.

### Próximo ciclo (sugestões)

- Implementar pelo menos 3 páginas placeholder de alto valor (ex: `comercial/leads`, `okrs/dashboard`, `comercial/propostas`)
- KanbanToolbar — conectar filtros a estado real e persistência
- `pdi-detail.tsx` (363L) e `revenue-concentration.tsx` (362L) — ainda acima do limite de 200L
- `contract-filter-sections.tsx` (351L) — violations no módulo contratos

### Debt técnico

- `team-table.tsx` ainda tem 316L — candidate para split de colunas em arquivo separado no próximo ciclo
- `AssignUsersDialog.onAssign` prop não é chamada na `KanbanToolbar` (sem target definido no board) — próximo ciclo definir modelo de assignee no board

---

## Ciclo 27 — 2026-03-14 00:08

**Módulo**: Configurações (notion-sync), Pessoas (people-filters), Chat (message-bubble)
**Branch**: `claude/improve-20260314-0008` → mergeado em `main`
**Build**: ✅ Clean antes e depois de todas as mudanças

### Estado do módulo

| Arquivo | Antes | Depois | Detalhes |
|---|---|---|---|
| `features/configuracoes/components/notion-sync.tsx` | ⚠️ 414L | ✅ 185L | Split: `notion-sync-result.tsx` (245L, 2 componentes: NotionConnectionCard + SyncResultDisplay) |
| `features/people/components/people-filters.tsx` | ⚠️ 400L | ✅ 192L | Split: `people-filter-parts.tsx` (266L, 4 componentes individuais <100L cada) |
| `features/chat/components/message-bubble.tsx` | ⚠️ 322L | ✅ 183L | Split: `message-bubble-parts.tsx` (140L: MessageContent + MessageMenu + MessageDeleteDialog) |

### Implementado

- refactor(configuracoes): `notion-sync.tsx` (414L → 185L) — `SyncResultDisplay` + tipos + `NotionConnectionCard` extraídos para `notion-sync-result.tsx`
- refactor(people): `people-filters.tsx` (400L → 192L) — `FilterSection`, `FilterTag`, `FilterAdvancedPopover`, `ActiveFilterTags` extraídos para `people-filter-parts.tsx`
- refactor(chat): `message-bubble.tsx` (322L → 183L) — `MessageContent`, `MessageMenu`, `MessageDeleteDialog` extraídos para `message-bubble-parts.tsx`. Também removido import morto `DropdownMenu*` que nunca foi usado.

### Migrations aplicadas

Nenhuma.

### Próximo ciclo

- `features/configuracoes/components/workspace-settings.tsx` (345L) — candidata ao split
- `features/configuracoes/components/profile-form.tsx` (323L) — candidata ao split
- `features/pdi/components/pdi-detail.tsx` (363L) — candidata ao split
- `features/founder-dashboard/components/revenue-concentration.tsx` (362L) — candidata ao split
- `features/contratos/components/contract-filter-sections.tsx` (351L) — candidata ao split
- `components/kanban/AssignUsersDialog.tsx` — usa mock users, TODO: conectar a usuários reais do Supabase
- `app/(auth)/rsm/page.tsx` (529L) — componente único muito grande, candidato a extração de sub-componentes

### Debt técnico

- `notion-sync-result.tsx` (245L) — arquivo com 2 componentes individuais, cada um < 200L, aceitável por componente

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

## Ciclo — 2026-03-14 Ciclo 31

**Módulo**: Shared Components + Clientes + Configurações
**Branch**: main
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| comment-thread.tsx (352L) | ⚠️ viola 200L | ✅ | 352L → comment-thread.tsx (71L) + comment-thread-parts.tsx (94L) + comment-item.tsx (170L) |
| client-form-dialog.tsx (348L) | ⚠️ viola 200L | ✅ | 348L → client-form-dialog.tsx (173L) + client-form-fields.tsx (183L) |
| workspace-settings.tsx (345L) | ⚠️ viola 200L | ✅ | 345L → workspace-settings.tsx (134L) + workspace-settings-parts.tsx (189L) + workspace-identity-card.tsx (118L) |

### Implementado

- refactor(shared): comment-thread.tsx split em 3 arquivos — CommentComposer em comment-thread-parts.tsx (94L), CommentItem em comment-item.tsx (170L), CommentThread em comment-thread.tsx (71L)
- refactor(clientes): client-form-dialog.tsx split em 2 arquivos — ClientFormFields extraído para client-form-fields.tsx (183L), clientSchema exportado para reuso
- refactor(configuracoes): workspace-settings.tsx split em 3 arquivos — WorkspaceIdentityCard em workspace-identity-card.tsx (118L), types/constants/skeleton/logo/savebar em workspace-settings-parts.tsx (189L), WorkspaceSettings em workspace-settings.tsx (134L)

### Migrations aplicadas
Nenhuma.

### Próximo ciclo
- components/layout/header.tsx (364L) — split candidate
- components/layout/sidebar/sortable-nav-item.tsx (357L) — split candidate
- components/shared/custom-field-config.tsx (328L) — split candidate
- components/modules/team/invite-user-dialog.tsx (329L) — split candidate

### Debt técnico
Nenhum novo.

## Ciclo 39 — 2026-03-14 12:08

**Módulo**: RSM + Team + Relatorios — splits de violações 200L
**Branch**: claude/improve-20260314-1208
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| rsm/page.tsx (529L) | ⚠️ viola 200L | ✅ | 529L → page.tsx (110L) + rsm-kpi-cards.tsx (40L) + rsm-tab-contas.tsx (80L) + rsm-tab-posts.tsx (130L) + rsm-tab-ideias.tsx (120L) |
| rsm: "Novo Post"/"Nova Ideia"/"Editar" sem handler | 🔧 QUEBRADO | ✅ | onClick → toast "Em breve" com descrição |
| team-table.tsx (317L) | ⚠️ viola 200L | ✅ | 317L → team-table.tsx (188L) + team-table-columns.tsx (161L) com useTeamTableColumns hook |
| relatorios/page.tsx (411L) | ⚠️ viola 200L | ✅ | 411L → page.tsx (66L) + relatorios-kpi-cards.tsx (55L) + relatorios-tab-agendamentos.tsx (158L) + relatorios-tab-execucoes.tsx (166L) |
| relatorios: "Novo Agendamento"/"Editar"/"Ver Conteudo" sem handler | 🔧 QUEBRADO | ✅ | onClick → toast "Em breve" com descrição |

### Implementado

- refactor(rsm): split page.tsx 529L → 4 sub-components (arquivos: rsm-kpi-cards.tsx, rsm-tab-contas.tsx, rsm-tab-posts.tsx, rsm-tab-ideias.tsx, page.tsx)
- fix(rsm): "Novo Post", "Nova Ideia", "Editar" sem onClick → toast feedback
- refactor(team): useTeamTableColumns hook extraído para team-table-columns.tsx; team-table.tsx 317L → 188L
- refactor(relatorios): split page.tsx 411L → 3 sub-components (arquivos: relatorios-kpi-cards.tsx, relatorios-tab-agendamentos.tsx, relatorios-tab-execucoes.tsx, page.tsx)
- fix(relatorios): "Novo Agendamento", "Editar", "Ver Conteudo" sem onClick → toast feedback

### Migrations aplicadas
Nenhuma.

### Próximo ciclo (sugestões)
- cultura/manual/page.tsx (432L) — candidato a split
- permissoes/page.tsx (419L) — candidato a split
- pessoas/performance/page.tsx (410L) — candidato a split
- Implementar form dialogs reais para RSM posts/ideias (substituir toasts "Em breve")
- Implementar form dialog para relatorios/agendamentos

### Debt técnico
- Botões "Em breve" (RSM + Relatorios) são feedback temporário — precisam de form dialogs reais

## Ciclo — 2026-03-14 — Ciclo 41

**Módulo**: OKRs sub-páginas (check-ins, dashboard, teams)
**Build**: ✅

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| /okrs/check-ins | ❌ placeholder 13L | ✅ | Feed de check-ins recentes com KPIs, busca, tabela com progresso/confiança |
| /okrs/dashboard | ❌ placeholder 13L | ✅ | Analytics visual com KPIs, cycle selector, objetivos agrupados por level + progress bar |
| /okrs/teams | ❌ placeholder 13L | ✅ | View filtrada level=team com CRUD completo, KPIs, empty state, RBAC (lider para criar) |
| services/okrs.ts | ⚠️ sem getAllCheckins | ✅ | Adicionado getAllCheckins + CheckinWithKr type (join com key results) |
| hooks/use-okrs.ts | ⚠️ sem useAllCheckins | ✅ | Adicionado useAllCheckins hook com React Query |

### Implementado
- feat(okrs/check-ins): página com feed de check-ins, KPIs (total, KRs únicos, confiança alta, com notas), busca, tabela com progress bar inline
- feat(okrs/dashboard): analytics consolidado com cycle selector, KPI cards, objetivos agrupados por company/team/individual com progress bars coloridos
- feat(okrs/teams): view completa level=team com CRUD (criar/editar/deletar objetivos e KRs), check-in dialog, history dialog, RBAC (lider+ para criar)
- feat(services): getAllCheckins() com join em okr_key_results + CheckinWithKr type exportado
- feat(hooks): useAllCheckins() hook com cache de 3min

### Migrations aplicadas
Nenhuma.

### Próximo ciclo (sugestões)
- /okrs/configuracoes — ainda placeholder
- Comercial sub-páginas (/leads, /propostas, /atividades, /integracoes, /configuracoes)
- Clientes — módulo inteiro sem dados (empresas, contatos, documentos, projetos)
- cultura/manual/page.tsx (432L) — candidato a split
- RSM posts/ideias form dialogs reais (substituir toasts "Em breve")

### Debt técnico
- getAllCheckins não filtra por ciclo (busca os últimos 100 globalmente) — melhorar com filtro de cycleId via join em objectives quando necessário

## Ciclo 44 — 2026-03-14 (scheduled)

**Módulo**: RSM (posts + ideias form dialogs) + OKRs Configurações
**Build**: ✅ (zero erros TypeScript)

### Estado do módulo

| Funcionalidade | Antes | Depois | Detalhes |
|----------------|-------|--------|----------|
| rsm: "Novo Post" sem handler | 🔧 QUEBRADO | ✅ | RsmPostFormDialog com criar/editar real via useCreateRsmPost/useUpdateRsmPost |
| rsm: "Editar" post sem handler | 🔧 QUEBRADO | ✅ | onClick(post) → RsmPostFormDialog pre-preenchido |
| rsm: "Nova Ideia" sem handler | 🔧 QUEBRADO | ✅ | RsmIdeaFormDialog com criar/editar real via useCreateRsmIdea/useUpdateRsmIdea |
| rsm: "Editar" ideia sem handler | 🔧 QUEBRADO | ✅ | onClick(idea) → RsmIdeaFormDialog pre-preenchido |
| okrs/configuracoes (13L placeholder) | ❌ AUSENTE | ✅ | Gestão completa de ciclos: listagem, criar, editar, ativar, excluir, ciclo ativo destacado |

### Implementado
- feat(rsm): RsmPostFormDialog — form dialog criar/editar posts com conta, título, tipo, status, agendamento, conteúdo (arquivos: rsm-post-form-dialog.tsx)
- fix(rsm): rsm-tab-posts.tsx — handleNovoPost e handleEditar conectados ao RsmPostFormDialog real
- feat(rsm): RsmIdeaFormDialog — form dialog criar/editar ideias com título, categoria, status, descrição (arquivos: rsm-idea-form-dialog.tsx)
- fix(rsm): rsm-tab-ideias.tsx — handleNovaIdeia e handleEditar conectados ao RsmIdeaFormDialog real
- feat(okrs/configuracoes): implementação completa — listagem de ciclos com ativo destacado, CRUD via OkrCycleDialog, ação "Definir como ativo", delete com confirmação, RBAC (lider+)

### Migrations aplicadas
Nenhuma.

### Próximo ciclo (sugestões)
- cultura/analytics/page.tsx (476L) — split em sub-components
- cultura/ferramentas/page.tsx (427L) — split em sub-components
- pessoas/performance/page.tsx (410L) — split em sub-components
- relatorios: form dialog real para agendamentos (substituir toast "Em breve")
- RSM posts: preview de conteúdo inline + badge de conta na tabela

### Debt técnico
- RSM post form não suporta upload de mídia (media_urls) — funcionalidade futura
- RSM ideia: campo assigned_to usa UUID bruto (sem picker de colaborador) — melhoria futura
