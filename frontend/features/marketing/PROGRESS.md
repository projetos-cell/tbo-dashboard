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

- [ ] #26 — Conteúdo: modal criar/editar item (título, tipo, status, canal, data agendada, autor, campanha, tags)
- [ ] #27 — Conteúdo: filtro combinado tipo + status + canal com chips de filtro ativo
- [ ] #28 — Conteúdo: inline status update (clicar no badge → dropdown de status)
- [ ] #29 — Calendário: visão mensal real (grid 7×5 com items posicionados por data)
- [ ] #30 — Calendário: drag-and-drop de conteúdos entre dias para reagendar
- [ ] #31 — Calendário: mini-card de conteúdo no dia com cor por canal
- [ ] #32 — Briefs: listagem com status e KPIs (total, aprovados, em revisão)
- [ ] #33 — Briefs: modal criar/editar brief (título, objetivo, público, mensagens, entregáveis, prazo)
- [ ] #34 — Briefs: fluxo aprovação (draft→aprovado) com campo de feedback
- [ ] #35 — Assets: grid de cards de arquivos com thumbnail (imagem) / ícone (outros tipos)
- [ ] #36 — Assets: upload de arquivo com drag-drop zone e progresso de upload para Supabase Storage
- [ ] #37 — Assets: filtro por tipo (imagem/vídeo/doc/outros) e tags
- [ ] #38 — Assets: modal de detalhe com preview, metadados e botão download/copy URL
- [ ] #39 — Aprovações: lista de conteúdos pendentes com ação aprovar/rejeitar + campo de feedback
- [ ] #40 — Aprovações: histórico de aprovações com timeline de status

## Módulo 4: Redes Sociais (`/marketing/redes-sociais`)

- [ ] #41 — Contas: grid de cards por plataforma (Instagram, Facebook, LinkedIn, etc.) com métricas básicas
- [ ] #42 — Contas: adicionar/editar conta com campos plataforma, handle, nome, avatar
- [ ] #43 — Contas: toggle ativo/inativo com optimistic update
- [ ] #44 — Agendamento: lista de posts agendados com filtro por plataforma e status
- [ ] #45 — Agendamento: modal criar post (conteúdo, plataforma/conta, mídia URLs, agendamento)
- [ ] #46 — Agendamento: calendário de posts agendados (visão semanal)
- [ ] #47 — Performance: KPIs por plataforma (seguidores, alcance, engajamento, taxa engajamento)
- [ ] #48 — Performance: gráfico de engajamento por período (seletor 7d/30d/90d)
- [ ] #49 — Performance: tabela comparativa entre plataformas
- [ ] #50 — Relatórios Social: exportar relatório de performance (PDF/CSV placeholder)

## Módulo 5: Analytics (`/marketing/analytics`)

- [ ] #51 — Dashboard Analytics: KPI cards consolidados (leads, oportunidades, receita, CAC, ROI)
- [ ] #52 — Dashboard Analytics: seletor de período (mês atual / últimos 30d / trimestre / custom)
- [ ] #53 — Funil: visualização de funil de conversão com estágios e taxas
- [ ] #54 — Funil: comparativo período atual vs anterior para cada estágio
- [ ] #55 — Funil: tabela detalhada de estágios com valores monetários
- [ ] #56 — Atribuição: tabela de canais com leads, oportunidades, receita, custo, ROI
- [ ] #57 — Atribuição: gráfico de barras de ROI por canal
- [ ] #58 — Atribuição: filtro por período e canal
- [ ] #59 — Relatórios: listagem de relatórios gerados com tipo, período, autor
- [ ] #60 — Relatórios: modal criar relatório (nome, tipo, período) com geração async

## Módulo 6: RSM — Relatório Semanal de Mídias

- [ ] #61 — RSM: página principal com seletor de conta e período
- [ ] #62 — RSM: integração do RsmAccountDashboard na rota `/marketing/rsm`
- [ ] #63 — RSM: RSM Posts Diagnostics — tabela de posts com métricas e diagnóstico
- [ ] #64 — RSM: RSM Recommended Actions — lista de recomendações geradas por análise
- [ ] #65 — RSM: exportar RSM como PDF (botão + placeholder)

## Módulo 7: Integrações e Cross-módulo

- [ ] #66 — Vincular conteúdo a campanha (select de campanha no form de conteúdo com dados reais)
- [ ] #67 — Vincular peça de campanha a content item (relação bidirecional)
- [ ] #68 — Notificações in-app para aprovações pendentes (badge no nav + toast)
- [ ] #69 — Busca global dentro do módulo marketing (campanhas + conteúdos + posts)
- [ ] #70 — Favoritar campanhas (star icon + filtro "favoritos")

## Módulo 8: UX / Componentes Transversais

- [ ] #71 — Skeleton content-aware para cards de campanha (reflete layout real)
- [ ] #72 — Empty state com CTA em todas as listagens sem dados
- [ ] #73 — Error boundary com retry em cada sub-rota do marketing
- [ ] #74 — Toasts de sucesso/erro padronizados em todas as mutations (criar/editar/deletar)
- [ ] #75 — Confirmação de exclusão via AlertDialog em todos os deletes
- [ ] #76 — Modo compacto/expandido nas tabelas (toggle density)
- [ ] #77 — Persistência de filtros ativos por rota (salvo em Supabase por view_id)
- [ ] #78 — Breadcrumb dinâmico no layout do marketing
- [ ] #79 — Ações em lote: selecionar múltiplas campanhas → deletar/arquivar/alterar status
- [ ] #80 — Paginação server-side nas listagens (campanhas, conteúdos, envios)

## Módulo 9: Dados e Migrations

- [ ] #81 — Migration: tabela `marketing_campaigns` com RLS
- [ ] #82 — Migration: tabela `campaign_briefings` com RLS
- [ ] #83 — Migration: tabela `campaign_pieces` com RLS
- [ ] #84 — Migration: tabela `campaign_budgets` com RLS
- [ ] #85 — Migration: tabela `email_templates` com RLS
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
