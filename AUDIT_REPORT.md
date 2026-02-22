# TBO OS — Audit Report (2026-02-22)

> Auditoria completa executada por 3 agentes em paralelo + 2 agentes de implementacao.
> **~1200 linhas adicionadas/modificadas** em 12 arquivos + 3 novos.
> Atualizado apos Onda 2 de implementacao.

---

## Sumario de Alteracoes

### Onda 1 — Auditoria + Fundacao (3 agentes)
| Arquivo | Agente | Tipo | Linhas |
|---------|--------|------|--------|
| `index.html` | 1 + 3 | Acessibilidade + Login | +50 |
| `styles.css` | 1 | CSS fixes (21 correções) | +267 |
| `modules/command-center.js` | 3 | Dashboard inteligente | +96 |
| `modules/onboarding-wizard.js` | 3 | BU no wizard | +23 |
| `utils/auth.js` | 3 | Magic Link → Esqueci senha | +17/-16 |
| `src/infra/supabase/queries/demands.js` | 2 | Filtros avancados no repo | +119 |
| `src/system/sidebar/SidebarService.js` | 3 | RBAC sidebar mapeamento | +11/-4 |
| `supabase/functions/.../index.ts` | 2 | Sync novos campos Notion | +22 |
| `supabase/migrations/040_...sql` | 2 | **NOVO** — schema demands | 60 |

### Onda 2 — Implementacao (2 agentes)
| Arquivo | Agente | Tipo | Linhas |
|---------|--------|------|--------|
| `modules/projetos-notion.js` | Filtros | **Reescrita completa** — UI de filtros avancados | ~636 |
| `app.js` | RBAC | Guard no router para usuarios sem role | +13 |
| `utils/permissions.js` | RBAC | `_roles` por secao + `_restrictedModules` | +66 |
| `src/system/sidebar/SidebarService.js` | RBAC | `allowed_roles` refinados | +23 |

### Novos Arquivos Criados
| Arquivo | Descricao |
|---------|-----------|
| `supabase/migrations/040_enhance_demands_schema.sql` | Schema demands com indices |
| `AUDIT_REPORT.md` | Este relatorio |
| `PERMISSIONS.md` | Mapa completo de permissoes por modulo × role |

---

## AGENTE 1 — UI/UX Audit & Improvements

### 1.1 Mapa de Modulos (40+ modulos ativos)

**Inicio:** dashboard, alerts, inbox, chat
**Execucao:** projetos, projetos-notion, project-system, tarefas, reunioes, agenda, biblioteca, database-notion
**Producao:** entregas, revisoes, portal-cliente
**Pessoas:** rh (people), cultura, trilha-aprendizagem, pessoas-avancado, admin-onboarding
**Financeiro:** financeiro, pagar, receber, margens, conciliacao, conciliacao-bancaria
**Comercial:** pipeline, comercial, clientes, inteligencia, inteligencia-imobiliaria, mercado
**Sistema:** admin-portal, permissoes-config, integracoes, configuracoes, changelog, system-health
**Outros:** conteudo, decisoes, templates, rsm, relatorios
**Parametrizados:** projeto/:id (project-workspace), people/:id (people-profile), page/:id (page-editor), notion-embed/:id

### 1.2 Correções Implementadas (21 fixes no CSS)

| # | Fix | Impacto |
|---|-----|---------|
| 1 | `:active` states em `.btn-secondary`, `.btn-danger`, `.btn-ghost` | Feedback visual em clique |
| 2 | Cards clicaveis (`onclick`, `role="button"`) com transition + scale | UX consistente |
| 3 | `:focus-visible` em `.btn`, `.nav-item`, `.tab-btn`, `.search-filter-chip` | **Acessibilidade** |
| 4 | Transitions em `.tag`, `.badge`, `.status-pill` | Consistencia visual |
| 5 | `.header-action-btn` hover/active com `scale(0.92)` | Feedback de interacao |
| 6 | `.nav-item` transition smoothness | Sidebar mais fluida |
| 7 | `.modal-overlay` e `.modal` open/close transitions | UX de modais |
| 8 | `.kpi-card` hover effect (`border-color` + `box-shadow`) | Dashboard interativo |
| 9 | `.tab-btn:active` scale | Feedback de abas |
| 10 | Utility classes `.empty-state`, `.empty-state-icon`, `.empty-state-title` | Padrao reusavel |
| 11 | `.module-loading-inline` | Loading state padronizado |
| 12 | `.form-select:hover`, `.form-input:hover` border | Feedback em formularios |
| 13 | `.status-dot[data-status="connected"]` pulse animation | Indicador visual de conexao |
| 14 | Links com `text-decoration: underline` no hover | Affordance melhorada |
| 15 | `.sidebar-search-input:focus-visible` ring | Acessibilidade sidebar |
| 16 | `@media (prefers-reduced-motion: reduce)` | **Acessibilidade** — respeita preferencia do OS |
| 17 | Mobile sidebar backdrop com `cursor: pointer` | UX mobile |
| 18 | `[disabled]`, `[aria-disabled]` estados consistentes | Elementos desabilitados |
| 19 | Utility classes de cor (`.text-color-success`, `.bg-danger-dim`, etc.) | Reduce inline styles |
| 20 | `.inbox-header-badge` extraido de inline styles | CSS organizado |
| 21 | `.sidebar-resize-handle:focus-visible` | Acessibilidade |

### 1.3 Correções de Acessibilidade no HTML (index.html)

| Elemento | Antes | Depois |
|----------|-------|--------|
| `<aside id="sidebar">` | `role="complementary"` | `role="navigation"` + `aria-label="Navegacao principal"` |
| `#sidebarCreateBtn` | sem ARIA | `aria-expanded="false"` + `aria-haspopup="true"` + `aria-label` |
| `#sidebarCreateDropdown` | sem role | `role="menu"` + `aria-label="Opcoes de criacao"` |
| Opcoes do dropdown | sem role | `role="menuitem"` |
| Icones decorativos Lucide | inconsistente | `aria-hidden="true"` em todos |
| `#sidebarSearchInput` | sem label | `aria-label="Buscar modulos e paginas"` |
| `#sidebarSearchClear` | sem label | `aria-label="Limpar busca"` |
| `#sidebarToggle` | basico | `aria-expanded="true"` + `aria-label="Recolher barra lateral"` |
| `#mobileMenuBtn` | sem ARIA | `aria-expanded="false"` + `aria-label="Abrir menu"` |
| `.status-indicators` | sem role | `role="status"` + `aria-label="Status dos servicos"` |
| `#refreshBtn`, `#inboxBtn`, `#searchBtn` | sem labels | `aria-label` descritivo em cada |
| `#searchOverlay` | sem semantica | `role="dialog"` + `aria-modal="true"` + `aria-label` |
| Search filter chips | sem role | `role="tablist"` / `role="tab"` + `aria-selected` |
| `#toastContainer` | sem role | `role="log"` + `aria-live="assertive"` |
| SVGs decorativos | inconsistente | `aria-hidden="true"` |
| Login: Magic Link | botao generico | `<a>` link discreto "Esqueci minha senha" |

### 1.4 Responsividade

**Encontrado:**
- Media query em `@media (max-width: 768px)` para sidebar mobile
- Grid responsivo com `.grid-2`, `.grid-3`, `.grid-4` que colapsam
- Header esconde elementos em telas pequenas

**Problemas identificados (precisam decisao do time):**
- [ ] Alguns modulos usam `style="display:flex"` hardcoded sem breakpoints
- [ ] KPI cards nao tem breakpoint para stack vertical em mobile (<480px)
- [ ] Modal de busca nao tem ajuste para mobile (pode ser cortado)
- [ ] Tabelas dentro de modulos financeiros nao tem scroll horizontal

### 1.5 Loading/Empty/Error States

**Padrao existente:**
- `Skeleton.js` disponivel em `src/ui/components/skeleton/` para loading
- `#moduleLoading` com spinner generico no `index.html`
- `#moduleEmpty` com mensagem "Selecione um modulo"

**Problemas:**
- [ ] Nem todos os modulos usam Skeleton — maioria usa texto "Carregando..."
- [ ] Empty states inconsistentes (alguns usam emoji, outros texto simples)
- [ ] Error states raramente mostram acao de recuperacao (ex: "Tentar novamente")
- [x] **CORRIGIDO:** Criadas classes `.empty-state`, `.module-loading-inline` como padrao reusavel

### 1.6 Keyboard Shortcuts

**Encontrado em `app.js._setupShortcuts()`:**
- `Alt+1..8` → Navega para modulos
- `Alt+B` → Toggle sidebar
- `Alt+R` → Refresh dados
- `Alt+S` → Abrir busca
- `Esc` → Fechar modais/busca
- `/` → Focus na busca da sidebar

**Status:** Funcionando. Nenhum conflito detectado com atalhos do browser.

---

## AGENTE 2 — Demandas ↔ Projetos (Notion Integration + Filtros)

### 2.1 Estado Anterior

- Tabela `demands` existia (migration 028) com campos basicos: title, status, due_date, responsible, bus, priority, media_type, info, formalization_url
- `DemandsRepo` tinha apenas `list()` e `getById()` basicos
- Edge function sincronizava campos principais mas faltavam: milestones, feito, subitem_ids, item_principal_id, responsavel_json
- Modulo `projetos-notion.js` tinha filtros basicos (status + busca texto)

### 2.2 Migration 040 — Schema Enhancement

**Novo arquivo:** `supabase/migrations/040_enhance_demands_schema.sql`

Colunas adicionadas:
| Coluna | Tipo | Descricao |
|--------|------|-----------|
| `milestones` | TEXT | Rich text do Notion "Milestones" |
| `feito` | BOOLEAN | Checkbox "Feito" |
| `subitem_ids` | TEXT[] | IDs de paginas Notion "Subitem" relation |
| `item_principal_id` | TEXT | ID da pagina Notion "item principal" |
| `responsavel_json` | JSONB | Objeto completo {name, email, avatar_url} |

Indices criados:
- `idx_demands_bus_gin` — GIN index em `bus` (suporta operador `@>`)
- `idx_demands_feito` — Partial index em `feito`
- `idx_demands_priority` — Partial index em `priority`
- `idx_demands_responsible` — Partial index em `responsible`

### 2.3 Edge Function — Novos Campos no Sync

**Arquivo:** `supabase/functions/notion-sync-projects-demands/index.ts`

Adicionados:
- `getCheckbox(page, prop)` — extrai campo checkbox do Notion
- `getPeopleJson(page, prop)` — extrai objeto completo de pessoa (nome, email, avatar)
- Mapeamento de `Milestones`, `Feito`, `Subitem`, `item principal`, `responsavel_json` no upsert

### 2.4 DemandsRepo — Novos Metodos de Filtro

**Arquivo:** `src/infra/supabase/queries/demands.js`

3 novos metodos:

**`listFiltered(filters)`** — Filtros avancados:
- `status` — filtro exato
- `responsible` — busca parcial (ilike)
- `priority` — filtro exato
- `bu` — usa operador `@>` (contains) no array
- `busArray` — multiplas BUs com logica OR (client-side)
- `prazoFrom` / `prazoTo` — range de datas
- `feito` — checkbox true/false
- `projectId` — filtro por projeto vinculado
- `search` — busca no titulo (ilike)
- `parentOnly` — apenas demandas pai (sem subitens)
- Join com `projects(id, name, status, bus, construtora)` incluido

**`listAllWithProjects()`** — Lista completa com join para agrupamento por projeto

**`getFilterOptions()`** — Retorna valores unicos para popular dropdowns:
- statuses, responsaveis, priorities, bus (sets unicos)

### 2.5 UI de Filtros Avancados — IMPLEMENTADO (Onda 2)

**Arquivo:** `modules/projetos-notion.js` — **Reescrita completa (~636 linhas)**

O modulo foi completamente reescrito com sistema de filtros avancados:

**State Management:**
- `_state.advancedFilters` com 10 campos: status, responsible, priority, bu, prazoFrom, prazoTo, feito, projectId, search, tipoMidia
- `_state.filterOptions` populado dinamicamente via `DemandsRepo.getFilterOptions()`
- `_state.showAdvancedFilters` — toggle de painel avancado
- `_state.groupByProject` — toggle de agrupamento
- `_state.userBU` / `_state.showAllBUs` — logica de visibilidade BU
- `_state.collapsedGroups` — controle de collapse por projeto

**Barra de Filtros (2 niveis):**
- **Nivel 1 (sempre visivel):** Busca por texto (debounce 300ms), Status, BU, Responsavel, botao "Filtros Avancados", toggle "Ver todas BUs" (so para admins)
- **Nivel 2 (colapsavel):** Prioridade, Tipo Midia, Prazo De/Ate, Feito (checkbox), Projeto Vinculado, botao "Limpar Filtros"

**Funcionalidades:**
- [x] `_bindFilterEvents(isSuperUser)` — Todos os event handlers com debounce na busca
- [x] `_saveFilters()` / `_restoreFilters()` — Persistencia em `sessionStorage`
- [x] `_loadFilterOptions()` — Popula dropdowns dinamicamente do banco
- [x] `_renderActiveFilterTags()` — Pills clicaveis com "×" para remover filtro individual
- [x] `_buildFilterPayload()` — Monta objeto de filtros com logica de BU automatica
- [x] `_applyFilters()` — Chama `DemandsRepo.listFiltered()` + filtro client-side tipoMidia
- [x] `_renderGroupedDemands()` — Agrupa demandas por projeto com headers colapsaveis
- [x] `_renderDemandRows(demands)` — Grid com status badges, prazo colorido, priority pills, feito checkmark

**Logica de BU:**
- Colaboradores/Artistas: BU filtrada automaticamente pelo profile, sem toggle
- Gestores (coordinator, project_owner): BU default do profile + toggle "Ver todas BUs"
- Admins (founder, admin): Ver tudo por default + toggle para filtrar por BU
- Super admin check: usa `TBO_PERMISSIONS.isSuperAdmin()` ou role in ['founder', 'admin', 'owner', 'coordinator']

**Todas as pendencias da Onda 1 foram resolvidas:**
- [x] UI de filtros no modulo
- [x] Logica de BU por usuario
- [x] Toggle "Ver todas as BUs"
- [x] Agrupamento por projeto com collapse/expand
- [x] Persistencia de filtros em sessionStorage

---

## AGENTE 3 — Auth, Permissoes & Dashboard Inteligente

### 3.1 Login — Simplificado

**Arquivo:** `index.html` (login overlay)
- Google OAuth → mantido como estava
- Email + Senha → mantido como estava
- **Magic Link → renomeado para "Esqueci minha senha"** (link `<a>` discreto abaixo do botao Entrar)

**Arquivo:** `utils/auth.js` (event handler)
- Texto do botao: "Enviar Magic Link" → "Enviando..." → "Esqueci minha senha"
- Mensagem de erro: "Informe o email para receber o Magic Link" → "Informe seu email acima para recuperar a senha"
- Toast de sucesso: "Magic Link enviado" → "Link enviado! Verifique seu e-mail para redefinir sua senha"
- Adicionado `e.preventDefault()` no click handler (era `<a>`)

**Arquivo:** `styles.css` (novo estilo)
- `.login-forgot-link` com font-size: 0.78rem, cor muted, hover com brand-primary

### 3.2 Dashboard Inteligente — Adaptado por Role

**Arquivo:** `modules/command-center.js`

**Tela "Aguardando Ativacao"** (`_renderPendingActivation(user)`)
- Exibida quando `user.role` e falsy/undefined
- Icone de relogio amarelo, titulo, instrucoes claras
- Botao "Sair e tentar novamente"
- Lista de proximos passos (avisar admin, aguardar configuracao, relogin)

**Quick Actions por Role** (`_renderQuickActions()`)
- **Admin/Owner:** Projetos, Financeiro, Equipe, Pipeline, Inbox, Admin
- **Finance:** Financeiro, A Pagar, A Receber, DRE, Pipeline
- **Manager/Coordinator:** Projetos, Tarefas, Agenda, Entregas, Equipe
- **Colaborador/Artist:** Minhas Tarefas, Projetos, Agenda, Entregas

Quick Actions inseridas em **todos os 4 layouts** de dashboard (full, projects, financial, individual).

### 3.3 Sidebar — RBAC Melhorado (Onda 1 + Onda 2)

**Arquivo:** `src/system/sidebar/SidebarService.js`

Onda 1:
- Expandido `roleMap` com mapeamentos adicionais:
  - `artist` → `3d-artist`
  - `project_owner` → `po`
  - `coordinator` → `pm`
  - `finance` → `financeiro`
  - `comercial` → `comercial`
- Super admins (`TBO_PERMISSIONS.isSuperAdmin()`) sempre recebem role `owner`

Onda 2:
- `allowed_roles` refinados nos `DEFAULT_ITEMS` para workspace comercial e filhos
- Integrado com `utils/permissions.js` para validacao cruzada

### 3.6 Guard no Router — IMPLEMENTADO (Onda 2)

**Arquivo:** `app.js` — metodo `_listenHashWithAuth()`

Guard de 13 linhas que impede usuarios sem role de navegar para qualquer modulo exceto `dashboard` e `configuracoes`:

```
Logica:
1. Obtem usuario atual via TBO_AUTH.getCurrentUser()
2. Se usuario existe mas nao tem role:
   a. Extrai target do hash (ex: "financeiro" de "#/financeiro")
   b. Se target != "dashboard" e != "configuracoes":
      - Exibe toast de aviso "Aguardando ativacao"
      - Redireciona para #dashboard
      - Return (interrompe navegacao)
```

Isso complementa a tela "Aguardando Ativacao" do command-center.js, garantindo que:
- Acesso direto por URL hash e bloqueado
- Apenas dashboard (com tela de espera) e configuracoes sao acessiveis
- Toast informa o motivo do bloqueio

### 3.7 Permissions.js — RBAC por Secao (Onda 2)

**Arquivo:** `utils/permissions.js`

Adicionado sistema de `_roles` por secao na sidebar classica (complementa o SidebarService.js Notion v2):

| Secao | `_roles` permitidos |
|-------|---------------------|
| `financeiro-section` | `founder`, `finance` |
| `comercial` | `founder`, `project_owner`, `comercial` |
| `admin` | `founder` |
| *(demais secoes)* | Sem restricao (visivel para todos) |

Adicionado `_restrictedModules` para controle granular dentro de secoes:
- `pessoas-avancado` → `['founder', 'admin', 'coordinator']`
- `decisoes` → `['founder', 'admin', 'coordinator']`

Metodo `getSectionsForUser()` reescrito:
1. Filtra secoes por `_roles` (se definido)
2. Coordinators: bypass parcial (veem tudo exceto admin e financeiro)
3. Super admins: bypass total
4. Dentro de cada secao, filtra modulos por `_restrictedModules`

### 3.4 Onboarding Wizard — BU Adicionada

**Arquivo:** `modules/onboarding-wizard.js`

- **Step 0 (Perfil):** Adicionado campo "BU Principal" com options: Branding, Digital 3D, Audiovisual, Marketing, Vendas, Financeiro, Geral
- **Step 3 (Resumo):** Mostra BU selecionada
- **Init:** Coleta valor do select `#owBU`
- **Submit:** Envia `bu` para Supabase profile via `upsert`
- **shouldShow():** Agora verifica `user.onboarding_wizard_completed` e `user.first_login_completed` do profile Supabase antes do fallback localStorage

### 3.5 Pendencias da Onda 1 — TODAS RESOLVIDAS na Onda 2

- [x] **PERMISSIONS.md** — Criado com mapa completo de 40+ modulos × roles × regras de BU
- [x] **Modulos sensiveis ocultos na sidebar** — Implementado via `_roles` em `permissions.js` + `allowed_roles` em `SidebarService.js`
- [x] **Redirect para "Aguardando Ativacao"** — Guard implementado no router (`app.js`) bloqueando navegacao por hash

---

## Problemas Remanescentes

### ~~Prioridade ALTA~~ — TODOS RESOLVIDOS na Onda 2
1. ~~**UI de filtros avancados no modulo projetos-notion**~~ → [x] Reescrita completa com 10 filtros
2. ~~**Guard de permissao no router**~~ → [x] Implementado em `app.js`
3. ~~**BU padrao por usuario**~~ → [x] Auto-detecta BU do profile, toggle "Ver todas BUs"

### ~~Prioridade MEDIA~~ — PARCIALMENTE RESOLVIDO
4. ~~**PERMISSIONS.md**~~ → [x] Criado com mapa completo
5. **Skeleton loading** — Padronizar uso em todos os modulos (hoje apenas alguns usam)
6. **Empty states** — Padronizar usando as novas classes `.empty-state` em todos os modulos
7. **Modulos financeiros no mobile** — Tabelas sem scroll horizontal
8. **KPI cards em mobile** — Sem breakpoint para stack vertical em <480px

### Prioridade BAIXA
9. **Inline styles em modulos** — Muitos modulos usam `style="..."` em vez de classes CSS
10. **Error states com acao** — Adicionar botao "Tentar novamente" em falhas de carregamento

---

## Proximos Passos

### Infraestrutura (requer Supabase CLI / acesso ao projeto)
1. **Rodar migration 040** no Supabase: `supabase db push`
2. **Deploy da edge function** atualizada: `supabase functions deploy notion-sync-projects-demands`
3. **Executar sync Notion** para popular novos campos

### Testes
4. **Testar login flow** completo (Google OAuth, email/senha, esqueci senha)
5. **Testar dashboard** para cada role (admin, gestor, colaborador, sem role)
6. **Revisar sidebar_items** no Supabase (tabela `sidebar_items.allowed_roles`)

### Melhorias Futuras (Onda 3)
7. Padronizar Skeleton loading em todos os modulos
8. Padronizar empty states com `.empty-state`
9. Scroll horizontal em tabelas financeiras (mobile)
10. KPI cards stack vertical em <480px
11. Remover inline styles dos modulos

---

*Relatorio gerado em 2026-02-22, atualizado apos Onda 2 por Claude Code.*
