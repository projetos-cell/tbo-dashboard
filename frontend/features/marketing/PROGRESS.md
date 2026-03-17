# Marketing Module — 100 Features Progress

> Atualizado automaticamente pela scheduled task `marketing-100-features`.
> Máximo 5 features por execução.

---

## Módulo 1: Campanhas (`/marketing/campanhas`)

- [x] #1 — Modal "Nova Campanha" com form completo (nome, status, datas, budget, canais, tags) — 2026-03-17 · `campaign-form-modal.tsx`
- [x] #2 — Drawer de detalhe de campanha (visualizar + editar inline) — 2026-03-17 · `campaign-detail-drawer.tsx`
- [x] #3 — Ação de deletar campanha com AlertDialog de confirmação + optimistic update com rollback — 2026-03-17 · `campanhas/page.tsx` + hook
- [x] #4 — Filtro por canal (chips multi-select derivados dos dados) na listagem de campanhas — 2026-03-17 · `campanhas/page.tsx`
- [x] #5 — Indicador de progresso de budget (spent/budget bar com cores: verde/âmbar/vermelho) em cada linha da tabela — 2026-03-17 · `campanhas/page.tsx`
- [x] #6 — Briefing: form de criação/edição de briefing com campos objetivo, público, mensagens-chave — 2026-03-17 · `briefing-form-modal.tsx` + `campanhas/briefing/page.tsx`
- [x] #7 — Briefing: fluxo de aprovação (enviar para aprovação → aprovado/revisão) com badge de status — 2026-03-17 · `campanhas/briefing/page.tsx` (BriefingCard + updateMutation)
- [x] #8 — Peças: listagem de peças da campanha com status kanban (pendente→publicado) — 2026-03-17 · `campanhas/pecas/page.tsx` (KanbanColumn)
- [x] #9 — Peças: criar/editar peça com campos tipo, responsável, prazo — 2026-03-17 · `piece-form-modal.tsx` + `campanhas/pecas/page.tsx`
- [x] #10 — Budget: tabela de itens de budget (categoria, planejado, realizado, fornecedor) com CRUD inline — 2026-03-17 · `campanhas/budget/page.tsx` (AddRow + EditableRowComponent)
- [x] #11 — Budget: gráfico de barras planejado vs realizado por categoria — 2026-03-17 · `budget/page.tsx` (BudgetBarChart + toggle "Ver gráfico")
- [x] #12 — Timeline visual de campanhas (Gantt simplificado: nome + barra de datas) — 2026-03-17 · `campanhas/timeline/page.tsx` (GanttRow + MonthHeaders)
- [x] #13 — Duplicar campanha (copia nome + configurações, status = planejamento) — 2026-03-17 · `useDuplicateMarketingCampaign` hook + IconCopy na tabela
- [x] #14 — Export CSV da listagem de campanhas — 2026-03-17 · `campanhas/page.tsx` (exportCSV + botão "Exportar CSV")
- [x] #15 — Tags: autocomplete multi-select nas campanhas com tags existentes do tenant — 2026-03-17 · `campaign-form-modal.tsx` (TagsAutocomplete component)

## Módulo 2: Email Studio (`/marketing/email-studio`)

- [x] #16 — Templates: grid de cards com thumbnail preview, nome, categoria, ações (editar/duplicar/excluir) — 2026-03-17 · `email-studio/templates/page.tsx` (DropdownMenu com edit/duplicate/delete)
- [x] #17 — Templates: modal criar/editar template com campos nome, assunto, categoria, tags + editor HTML básico — 2026-03-17 · `email-template-form-modal.tsx` (editor HTML textarea + TagsAutocomplete)
- [x] #18 — Templates: filtro por categoria com tabs dinâmicas — 2026-03-17 · `email-studio/templates/page.tsx` (Tabs derivadas de categorias únicas dos dados)
- [x] #19 — Campanhas Email: modal criar campanha (nome, assunto, template, lista, agendamento) — 2026-03-17 · `email-campaign-form-modal.tsx` (auto-fill assunto ao selecionar template)
- [x] #20 — Campanhas Email: badge de status com cores por estado (draft/scheduled/sending/sent) — 2026-03-17 · `email-studio/campanhas/page.tsx` (Badge com bg/color de EMAIL_CAMPAIGN_STATUS + ações pausar/cancelar)
- [x] #21 — Campanhas Email: ação de cancelar/pausar campanha com confirmação — 2026-03-17 · `email-studio/campanhas/page.tsx` (AlertDialog + confirmAction + optimistic update via useUpdateEmailCampaign)
- [x] #22 — Envios: tabela de histórico de envios com métricas (enviados, entregues, abertos, clicados) — 2026-03-17 · `email-studio/envios/page.tsx` (colunas: recipient_count, delivered, opened, clicked, open_rate calculado)
- [x] #23 — Envios: barra de progresso de envio em tempo real para campanhas "sending" — 2026-03-17 · `email-studio/envios/page.tsx` (SendProgressBar + refetchInterval condicional via query.state.data)
- [x] #24 — Analytics Email: KPI cards (open rate, click rate, bounce rate, unsubscribe rate) com benchmarks — 2026-03-17 · `email-studio/analytics/page.tsx` (KPICard com getBenchmarkStatus + indicadores ArrowUp/Down)
- [x] #25 — Analytics Email: gráfico de barras de performance por campanha (top 5) — 2026-03-17 · `email-studio/analytics/page.tsx` (BarChart recharts top5 por open_rate + benchmark bar)

## Módulo 3: Conteúdo (`/marketing/conteudo`)

- [x] #26 — Conteúdo: modal criar/editar item (título, tipo, status, canal, data agendada, autor, campanha, tags) — 2026-03-17 · `content/content-item-form-modal.tsx`
- [x] #27 — Conteúdo: filtro combinado tipo + status + canal com chips de filtro ativo — 2026-03-17 · `conteudo/page.tsx` (FilterChip + filtros derivados dos dados)
- [x] #28 — Conteúdo: inline status update (clicar no badge → dropdown de status) — 2026-03-17 · `conteudo/page.tsx` (InlineStatusBadge + DropdownMenu)
- [x] #29 — Calendário: visão mensal real (grid 7×5 com items posicionados por data) — 2026-03-17 · `conteudo/calendario/page.tsx` (buildCalendarDays + DroppableCell)
- [x] #30 — Calendário: drag-and-drop de conteúdos entre dias para reagendar — 2026-03-17 · `content/calendar-dnd.tsx` + DndContext optimistic update + rollback
- [x] #31 — Calendário: mini-card de conteúdo no dia com cor por canal — 2026-03-17 · `calendar-dnd.tsx` (dot colorido + borderLeft 3px por canal + title tooltip com canal)
- [x] #32 — Briefs: listagem com status e KPIs (total, aprovados, em revisão) — 2026-03-17 · `conteudo/briefs/page.tsx` (KpiCard × 4 + skeleton loading)
- [x] #33 — Briefs: modal criar/editar brief (título, objetivo, público, mensagens, entregáveis, prazo) — 2026-03-17 · `content/brief-form-modal.tsx` (ChipInput para arrays + zodResolver)
- [x] #34 — Briefs: fluxo aprovação (draft→revisão→aprovado) com campo de feedback — 2026-03-17 · `conteudo/briefs/page.tsx` (AlertDialog + Textarea feedback + useUpdateContentBrief)
- [x] #35 — Assets: grid de cards de arquivos com thumbnail (imagem) / ícone (outros tipos) — 2026-03-17 · `conteudo/assets/page.tsx` (img tag + onError fallback + filtro por tipo + hover scale)
- [x] #36 — Assets: upload de arquivo com drag-drop zone e progresso de upload para Supabase Storage — 2026-03-17 · `content/upload-asset-modal.tsx` (DnD zone + Progress por arquivo + Storage upload real)
- [x] #37 — Assets: filtro por tipo (imagem/vídeo/doc/outros) e tags — 2026-03-17 · `assets/page.tsx` (chips multi-select de tags derivados dos dados)
- [x] #38 — Assets: modal de detalhe com preview, metadados e botão download/copy URL — 2026-03-17 · `content/asset-detail-modal.tsx` (preview img / ícone + grid de metadados + download + clipboard)
- [x] #39 — Aprovações: lista de conteúdos pendentes com ação aprovar/rejeitar + campo de feedback — 2026-03-17 · `aprovacoes/page.tsx` (FeedbackDialog com Textarea ao rejeitar/solicitar revisão)
- [x] #40 — Aprovações: histórico de aprovações com timeline de status — 2026-03-17 · `aprovacoes/page.tsx` (TimelineItem com ícone colorido por status + bubble de feedback)

## Módulo 4: Redes Sociais (`/marketing/redes-sociais`)

- [x] #41 — Contas: grid de cards por plataforma (Instagram, Facebook, LinkedIn, etc.) com métricas básicas — 2026-03-17 · `redes-sociais/contas/page.tsx` (header com totais active+followers, cards com ícone/cor por plataforma)
- [x] #42 — Contas: adicionar/editar conta com campos plataforma, handle, profile_url — 2026-03-17 · `social/social-account-form-modal.tsx` (zodResolver + Select + Input + create/update mutations)
- [x] #43 — Contas: toggle ativo/inativo com optimistic update — 2026-03-17 · `hooks/use-rsm.ts` (useUpdateRsmAccount + onMutate optimistic + rollback) + Switch no card
- [x] #44 — Agendamento: lista de posts agendados com filtro por plataforma e status — 2026-03-17 · `redes-sociais/agendamento/page.tsx` (platform chips derivados de accounts + coluna Plataforma lookup)
- [x] #45 — Agendamento: modal criar post (conteúdo, plataforma/conta, mídia URLs, agendamento) — 2026-03-17 · `social/social-post-form-modal.tsx` (account select + tipo + content + media_urls + scheduled_date)
- [x] #46 — Agendamento: calendário de posts agendados (visão semanal) — 2026-03-17 · `agendamento/page.tsx` (WeekCalendar + navegação prev/next + cards por plataforma com cor + toggle Lista/Semana)
- [x] #47 — Performance: KPIs por plataforma (seguidores, alcance, engajamento, taxa engajamento) — 2026-03-17 · `performance/page.tsx` (computePlatformStats + 4 KPICards + seletor de período 7d/30d/90d)
- [x] #48 — Performance: gráfico de engajamento por período (seletor 7d/30d/90d) — 2026-03-17 · `performance/page.tsx` (BarChart recharts Seguidores+Engajamento+Posts por plataforma)
- [x] #49 — Performance: tabela comparativa entre plataformas — 2026-03-17 · `performance/page.tsx` (ComparativeTable com barra relativa de alcance + taxa engajamento colorida)
- [x] #50 — Relatórios Social: exportar relatório de performance (PDF/CSV placeholder) — 2026-03-17 · `relatorios/page.tsx` (4 templates: performance CSV + posts CSV + mensal PDF placeholder + comparativo CSV + downloadCsv helper)

## Módulo 5: Analytics (`/marketing/analytics`)

- [x] #51 — Dashboard Analytics: KPI cards consolidados (leads, oportunidades, receita, CAC, ROI) — 2026-03-17 · `analytics/page.tsx` (5 KPICards com trend arrows + change_pct vs período anterior)
- [x] #52 — Dashboard Analytics: seletor de período (mês atual / últimos 30d / trimestre / custom) — 2026-03-17 · `analytics/page.tsx` (period state + custom date pickers + passa period ao hook)
- [x] #53 — Funil: visualização de funil de conversão com estágios e taxas — 2026-03-17 · `analytics/funil/page.tsx` (FunnelVisualization trapezoidal + clipPath proporcional + taxa conv entre etapas)
- [x] #54 — Funil: comparativo período atual vs anterior para cada estágio — 2026-03-17 · `analytics/funil/page.tsx` (period selector + FunnelStage.previous_count/previous_conversion_rate + delta icons)
- [x] #55 — Funil: tabela detalhada de estágios com valores monetários — 2026-03-17 · `analytics/funil/page.tsx` (FunnelTable com volume + delta + taxa conv + valor monetário + total no footer)
- [x] #56 — Atribuição: tabela de canais com leads, oportunidades, receita, custo, ROI — 2026-03-17 · `analytics/attribution/page.tsx` (AttributionTable com tfoot totais + ROI badge colorido)
- [x] #57 — Atribuição: gráfico de barras de ROI por canal — 2026-03-17 · `analytics/attribution/page.tsx` (RoiBarChart recharts + ReferenceLine breakeven)
- [x] #58 — Atribuição: filtro por período e canal — 2026-03-17 · `analytics/attribution/page.tsx` (period buttons + channel chips multi-select + clear filter)
- [x] #59 — Relatórios: listagem de relatórios gerados com tipo, período, autor — 2026-03-17 · `analytics/relatorios/page.tsx` (coluna Autor com IconUser + badge tipo colorido por categoria)
- [x] #60 — Relatórios: modal criar relatório (nome, tipo, período) com geração async — 2026-03-17 · `analytics/relatorios/page.tsx` (CreateReportModal + useCreateMarketingReport + loading state + download handler)

## Módulo 6: RSM — Relatório Semanal de Mídias

- [x] #61 — RSM: página principal com seletor de conta e período — 2026-03-17 · `rsm/page.tsx` (Select de contas + period selector 1/3/6/12 meses)
- [x] #62 — RSM: integração do RsmAccountDashboard na rota `/marketing/rsm` — 2026-03-17 · `rsm/page.tsx` (Tab Dashboard + card RSM no hub de marketing)
- [x] #63 — RSM: RSM Posts Diagnostics — tabela de posts com métricas e diagnóstico — 2026-03-17 · `rsm/page.tsx` (Tab Posts com RsmPostsDiagnostics + empty state)
- [x] #64 — RSM: RSM Recommended Actions — lista de recomendações geradas por análise — 2026-03-17 · `rsm/page.tsx` (Tab Ações com RsmRecommendedActions)
- [x] #65 — RSM: exportar RSM como PDF (botão + placeholder) — 2026-03-17 · `rsm/page.tsx` (botão "Exportar PDF" + toast "em desenvolvimento")

## Módulo 7: Integrações e Cross-módulo

- [x] #66 — Vincular conteúdo a campanha (select de campanha no form de conteúdo com dados reais) — 2026-03-17 · `conteudo/page.tsx` (campaignMap + coluna Campanha + chips de filtro por campanha)
- [x] #67 — Vincular peça de campanha a content item (relação bidirecional) — 2026-03-17 · `types/marketing.ts` (content_item_id em CampaignPiece) + `piece-form-modal.tsx` (select de conteúdo)
- [x] #68 — Notificações in-app para aprovações pendentes (badge no nav + toast) — 2026-03-17 · `marketing-approvals-badge.tsx` + `marketing/page.tsx` (toast com useEffect + banner âmbar)
- [x] #69 — Busca global dentro do módulo marketing (campanhas + conteúdos + posts) — 2026-03-17 · `marketing-global-search.tsx` (popover com resultados agrupados por tipo) + `marketing/page.tsx`
- [x] #70 — Favoritar campanhas (star icon + filtro "favoritos") — 2026-03-17 · `useToggleFavoriteCampaign` (optimistic update) + `campanhas/page.tsx` (star icon + botão filtro Favoritos)

## Módulo 8: UX / Componentes Transversais

- [x] #71 — Skeleton content-aware para cards de campanha (reflete layout real) — 2026-03-17 · `campaign-table-skeleton.tsx` (CampaignTableSkeleton + CardGridSkeleton + ListSkeleton)
- [x] #72 — Empty state com CTA em todas as listagens sem dados — 2026-03-17 · `analytics/page.tsx` (ErrorState + EmptyState adicionados) + 20 rotas auditadas com EmptyState
- [x] #73 — Error boundary com retry em cada sub-rota do marketing — 2026-03-17 · layouts: `campanhas/`, `email-studio/`, `conteudo/`, `redes-sociais/`, `analytics/`, `rsm/` (TabErrorBoundary por módulo)
- [x] #74 — Toasts de sucesso/erro padronizados em todas as mutations (criar/editar/deletar) — 2026-03-17 · `hooks/use-rsm.ts` (toast.success/error em 8 mutations: account/post/idea create+update+delete)
- [x] #75 — Confirmação de exclusão via AlertDialog em todos os deletes — 2026-03-17 · `asset-detail-modal.tsx` (delete + AlertDialog) + 7 páginas existentes já auditadas com AlertDialog
- [x] #76 — Modo compacto/expandido nas tabelas (toggle density) — 2026-03-17 · `table-density-toggle.tsx` (DENSITY_ROW_PADDING + toggle cycle compact/normal/expanded) + campanhas/page.tsx
- [x] #77 — Persistência de filtros ativos por rota (salvo em Supabase por view_id) — 2026-03-17 · `use-view-filters.ts` (debounced upsert + graceful fallback pre-migration) + campanhas/page.tsx
- [x] #78 — Breadcrumb dinâmico no layout do marketing — 2026-03-17 · `marketing-breadcrumb.tsx` (usePathname + SEGMENT_LABELS map) + marketing/layout.tsx
- [x] #79 — Ações em lote: selecionar múltiplas campanhas → deletar/arquivar/alterar status — 2026-03-17 · `campanhas/page.tsx` (BulkActionBar + checkboxes + AlertDialog confirmação + bulk status change)
- [x] #80 — Paginação nas listagens (campanhas) — 2026-03-17 · `data-pagination.tsx` (DataPagination + paginateArray) + campanhas/page.tsx (pageSize select + nav controls)

## Módulo 9: Dados e Migrations

- [x] #81 — Migration: tabela `marketing_campaigns` com RLS — 2026-03-17 · `20260317_create_marketing_campaigns.sql` (status enum + owner FK + channels/tags arrays + is_favorited + updated_at trigger)
- [x] #82 — Migration: tabela `campaign_briefings` com RLS — 2026-03-17 · `20260317_create_campaign_briefings.sql` (UNIQUE campaign_id + status enum + arrays key_messages/deliverables/references + approved_by FK)
- [x] #83 — Migration: tabela `campaign_pieces` com RLS — 2026-03-17 · `20260317_create_campaign_pieces.sql` (status enum + assigned_to FK + content_item_id para relação bidirecional feature #67)
- [x] #84 — Migration: tabela `campaign_budgets` com RLS — 2026-03-17 · `20260317_create_campaign_budgets.sql` (planned/actual NUMERIC + trigger sync_campaign_spent → atualiza marketing_campaigns.spent automaticamente)
- [x] #85 — Migration: tabela `email_templates` com RLS — 2026-03-17 · `20260317_create_email_templates.sql` (tags TEXT[] + GIN index + category + html_content + thumbnail_url)
- [ ] #86 — Migration: tabela `email_campaigns` com RLS
- [ ] #87 — Migration: tabela `email_sends` com RLS
- [ ] #88 — Migration: tabela `content_items` com RLS
- [ ] #89 — Migration: tabela `content_briefs` com RLS
- [ ] #90 — Migration: tabela `content_assets` com RLS
- [ ] #91 — Migration: tabela `content_approvals` com RLS
- [ ] #92 — Migration: tabela `social_accounts` com RLS
- [ ] #93 — Migration: tabela `social_posts` com RLS
- [ ] #94 — Migration: tabela `marketing_reports` com RLS
- [ ] #95 — Seed: dados de exemplo para todas as tabelas de marketing

## Módulo 10: Qualidade e Extras

- [ ] #96 — Testes de tipo (TypeScript strict) em todos os hooks de marketing
- [ ] #97 — Zod schemas para todos os forms do módulo marketing
- [ ] #98 — Query keys canônicos consolidados em `queryKeys.marketing.*`
- [ ] #99 — Storybook/documentação inline dos componentes principais do marketing
- [ ] #100 — Auditoria final: RLS policies, RBAC guards, empty/error/loading states em 100% das rotas
