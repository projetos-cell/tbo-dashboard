# Intranet Features — Progresso de Implementação

## Legenda
- ✅ Completo
- 🔶 Parcial (base implementada, melhorias futuras possíveis)
- ⏳ Pendente

---

## 🔴 Alto

| # | Feature | Status | Data | Arquivos principais |
|---|---------|--------|------|---------------------|
| 1 | Diretório de Pessoas (busca por skill/dept, card público) | 🔶 Parcial | pré-existente | `app/(auth)/pessoas/colaboradores/`, `features/people/`, `app/(auth)/usuarios/[slug]/` |
| 2 | Notificações Centralizadas (bell icon, digest, preferências) | 🔶 Parcial | pré-existente | `components/layout/notification-bell.tsx`, `app/(auth)/alerts/`, `features/alerts/` |
| 3 | Onboarding Wizard (checklist D1/D7/D30, setup guiado) | ✅ Completo | pré-existente | `app/(auth)/onboarding/`, `features/onboarding/` |
| 4 | IT Helpdesk / Service Desk (tickets internos, SLA, FAQ) | ✅ Completo | 2026-03-30 | Ver detalhes abaixo |
| 5 | Policies Hub (aceite obrigatório, versioning, audit) | 🔶 Parcial | pré-existente | `app/(auth)/cultura/politicas/`, `features/cultura/services/policies.ts` |
| 6 | Announcements (comunicados com confirmação de leitura) | ⏳ Pendente | — | — |
| 7 | Global Search unificada (pessoas + docs + projetos + posts) | 🔶 Parcial | pré-existente | `components/layout/command-search.tsx`, `hooks/use-global-search.ts` |

## 🟡 Médio

| # | Feature | Status | Data |
|---|---------|--------|------|
| 8  | Formulários & Workflows de aprovação | ⏳ Pendente | — |
| 9  | Document Management | ⏳ Pendente | — |
| 11 | LMS / Learning Management | ⏳ Pendente | — |
| 12 | Surveys & Pulse | 🔶 Parcial | pré-existente |
| 13 | Expense Management | ⏳ Pendente | — |
| 14 | Time-off / Férias | ⏳ Pendente | — |
| 15 | Org Chart interativo | 🔶 Parcial | pré-existente |
| 16 | Employee Self-Service Portal | ⏳ Pendente | — |
| 17 | Quick Actions Hub | ⏳ Pendente | — |
| 18 | Targeted Content | ⏳ Pendente | — |
| 19 | Widget-based Hub | ⏳ Pendente | — |
| 20 | App Marketplace / Integrações | ⏳ Pendente | — |
| 22 | Mobile PWA | ⏳ Pendente | — |

## 🟢 Baixo

| # | Feature | Status | Data |
|---|---------|--------|------|
| 23 | Events & Town Hall | ⏳ Pendente | — |
| 24 | Employee Birthdays & Anniversaries | ⏳ Pendente | — |
| 25 | Internal Job Board | ⏳ Pendente | — |
| 26 | SSO/SAML/SCIM | ⏳ Pendente | — |
| 27 | Idea Box / Innovation Hub | ⏳ Pendente | — |
| 28 | Hub Analytics | ⏳ Pendente | — |
| 29 | Pinned Resources por Dept | ⏳ Pendente | — |

---

## Feature #4 — IT Helpdesk (2026-03-30)

### Arquivos criados
- `supabase/migrations/20260330_create_helpdesk.sql` — tabelas helpdesk_tickets, helpdesk_comments, helpdesk_faqs + RLS
- `frontend/features/helpdesk/services/helpdesk.ts` — service layer (CRUD tickets/comments/faqs, KPIs)
- `frontend/features/helpdesk/hooks/use-helpdesk.ts` — React Query hooks
- `frontend/features/helpdesk/components/ticket-status-badge.tsx` — badges de status e prioridade
- `frontend/features/helpdesk/components/ticket-card.tsx` — card de chamado
- `frontend/features/helpdesk/components/ticket-comments.tsx` — seção de comentários/respostas
- `frontend/features/helpdesk/components/ticket-detail.tsx` — sheet de detalhes + mudança de status
- `frontend/features/helpdesk/components/ticket-form.tsx` — dialog criar chamado (Zod validation)
- `frontend/features/helpdesk/components/faq-section.tsx` — FAQ com busca e agrupamento por categoria
- `frontend/features/helpdesk/components/helpdesk-kpi-cards.tsx` — KPI cards (staff only)
- `frontend/app/(auth)/helpdesk/page.tsx` — página principal
- `frontend/app/(auth)/helpdesk/loading.tsx` — skeleton loading
- `frontend/app/(auth)/helpdesk/error.tsx` — error boundary

### Arquivos modificados
- `frontend/lib/navigation.ts` — adicionado grupo "Intranet" com item IT Helpdesk
- `frontend/lib/icons.ts` — adicionado ícone `headset`
- `frontend/lib/permissions.ts` — adicionado `helpdesk` nos módulos de lider e colaborador

### Funcionalidades
- Qualquer colaborador abre chamados via dialog com validação Zod
- Tabs "Meus chamados" / "Todos os chamados" (staff) / "FAQ"
- Filtros por status (abertos/em andamento/aguardando/resolvidos/fechados) + busca livre
- KPI cards (total, abertos, em andamento, resolvidos hoje) visíveis somente para staff
- Detalhe do chamado com histórico de comentários + resposta inline
- Staff pode mudar status diretamente pelo detail sheet
- FAQ com busca e agrupamento por categoria (seed com 5 exemplos)
- RBAC: RBACGuard no frontend + RLS duplo no Supabase (colaborador vê os próprios, staff vê todos)

### Próximo feature na fila
**Feature #6: Announcements** — comunicados internos com confirmação de leitura e segmentação por BU/role
