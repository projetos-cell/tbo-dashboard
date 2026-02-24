# TBO OS v2.2 — Auditoria Completa do Estado Atual

**Data:** 2026-02-19
**Versao:** v2.2.0
**Auditor:** Claude Staff Engineer
**Escopo:** Seguranca, RBAC, RLS, Integracoes, CI/CD, Dead Code, Performance

---

## RESUMO EXECUTIVO

| Area | Score | Status |
|------|-------|--------|
| Seguranca (credenciais) | 15/100 | CRITICO |
| RBAC (controle acesso) | 55/100 | MEDIO |
| RLS (banco de dados) | 45/100 | CRITICO |
| Integracoes | 35/100 | CRITICO |
| CI/CD | 5/100 | CRITICO |
| Performance | 25/100 | ALTO |
| Qualidade de codigo | 40/100 | MEDIO |
| Observabilidade | 10/100 | CRITICO |

**Nota geral: 29/100 — Sistema funcional mas NAO production-grade.**

---

## 1. INVENTARIO DO SISTEMA

### 1.1 Modulos (43 registrados no router)

| Secao | Modulos | Maiores |
|-------|---------|---------|
| Command Center | command-center, timeline, alerts | command-center.js (122 KB) |
| Receita | pipeline, comercial, clientes, portal-cliente, contratos | comercial.js (91 KB) |
| Projetos | projetos, entregas, tarefas, revisoes | projetos.js (144 KB) |
| Conteudo & Intel | inteligencia, conteudo, mercado, reunioes, decisoes | trilha-aprendizagem.js (86 KB) |
| Pessoas | rh, cultura, trilha, pessoas-avancado, carga, timesheets, capacidade, admin-onboarding | rh.js (88 KB) |
| Financeiro | financeiro, pagar, receber, margens, conciliacao | financeiro.js (59 KB) |
| Sistema | configuracoes, templates, permissoes-config, integracoes, changelog | configuracoes.js (79 KB) |

**Total JS:** ~2.7 MB nao-minificado, 72 scripts carregados sequencialmente.

### 1.2 Utilitarios (42 arquivos em utils/)

Categorias: auth, supabase, router, permissions, formatters, parsers (OFX/CSV), integracoes (omie, fireflies, rd-station, google-calendar), engines (digest, workflow, realtime), UI (toast, design-system, ux).

### 1.3 Edge Functions (7 em supabase/functions/)

| Funcao | Status | Proposito |
|--------|--------|-----------|
| daily-digest | NAO DEPLOYADA | Resumo diario |
| document-preview | NAO DEPLOYADA | Preview de documentos |
| weekly-financial-report | NAO DEPLOYADA | Relatorio financeiro |
| fn_conclusao_onboarding | NAO DEPLOYADA | Trigger conclusao |
| fn_email_dia_anterior | NAO DEPLOYADA | Email pre-evento |
| fn_liberar_dia_1 | NAO DEPLOYADA | Liberar dia 1 |
| fn_verificar_inatividade | NAO DEPLOYADA | Check inatividade |

### 1.4 API Proxies (2 em api/)

- `/api/omie-proxy.js` — Proxy para Omie ERP (SEM autenticacao, SEM rate limit)
- `/api/rd-proxy.js` — Proxy para RD Station (SEM autenticacao, SEM rate limit)

---

## 2. TABELAS SUPABASE (40+ tabelas)

### 2.1 Com RLS implementado (29 tabelas)

**Onboarding (9):** colaboradores, convites, onboarding_dias, onboarding_atividades, onboarding_progresso, onboarding_dias_liberados, onboarding_checkins, onboarding_notificacoes, colaboradores_status_log

**Multi-Tenant (9):** tenants, roles, role_permissions, tenant_members, changelog_entries, integration_configs, sync_logs, culture_pages, collaborator_history

**Financeiro (12):** fin_categories, fin_cost_centers, fin_vendors, fin_clients, fin_invoices, fin_transactions, fin_receivables, fin_payables, bank_imports, bank_transactions, reconciliation_rules, reconciliation_audit

### 2.2 SEM RLS (14 tabelas) — CRITICO

| Tabela | Impacto | Risco |
|--------|---------|-------|
| **projects** | Projetos visiveis entre tenants | CRITICO |
| **tasks** | Tarefas visiveis entre tenants | CRITICO |
| **crm_deals** | Pipeline de vendas exposto | CRITICO |
| **deliverables** | Entregas visiveis entre tenants | ALTO |
| **proposals** | Propostas comerciais expostas | ALTO |
| **notifications** | Notificacoes de outros usuarios | ALTO |
| **profiles** | Perfis de usuario entre tenants | ALTO |
| **audit_log** | Log de auditoria sem isolamento | MEDIO |
| **decisions** | Decisoes sem tenant_id | MEDIO |
| **meetings** | Reunioes sem isolamento | MEDIO |
| **time_entries** | Timesheets expostos | MEDIO |
| **document_versions** | Historico de documentos | ALTO |
| **contract_attachments** | Contratos visiveis | ALTO |
| **knowledge_items** | Base de conhecimento | BAIXO |

### 2.3 Queries JS sem filtro de tenant

```
app.js:313-315          → tasks, notifications, crm_deals (SEM tenant_id)
utils/digest-engine.js  → tasks, projects, crm_deals, notifications (SEM tenant_id)
utils/storage.js        → crm_deals (SEM tenant_id)
modules/configuracoes.js → profiles (SEM tenant_id)
```

### 2.4 Migrations pendentes

- `migration-v4-financeiro.sql` — NAO EXECUTADA (12 tabelas financeiras)
- `migration-v5-academy.sql` — NAO EXECUTADA (8 tabelas academy)

---

## 3. RBAC — ONDE E APLICADO HOJE

### 3.1 Tres camadas (TODAS client-side)

| Camada | Arquivo | Como funciona | Bypassa? |
|--------|---------|---------------|----------|
| **Sidebar** | app.js:372 | Esconde botoes de nav por role | Sim (DevTools) |
| **Router** | router.js:43 | Bloqueia navigate() sem permissao | Sim (DevTools) |
| **Hash listener** | app.js:1083 | Bloqueia URL manual | Sim (DevTools) |

### 3.2 Roles definidos (hardcoded em permissions.js)

| Role | Modulos | Financeiro | Admin |
|------|---------|-----------|-------|
| founder | TODOS (~40) | Sim | Sim |
| project_owner | 14 + shared | Nao | Sim (permissoes) |
| artist | 8 + shared | Nao | Nao |
| comercial | 13 + shared | Nao | Nao |
| finance | 14 + shared | Sim | Nao |

### 3.3 Usuarios hardcoded (permissions.js:68-92)

15 usuarios com roles fixos no codigo. Qualquer mudanca exige deploy.

### 3.4 O que falta (CRITICO)

- **Zero verificacao server-side** — Nenhum modulo verifica permissao no backend
- **Zero verificacao dentro dos modulos** — Apenas 4/43 modulos tem check interno
- **Legacy mode ativo** — auth.js:195 faz fallback silencioso para login legado
- **Coordenadores veem tudo** — `canSeeAllProjects()` nao filtra por BU
- **Session em sessionStorage** — Vulneravel a XSS (user pode editar role)

---

## 4. INTEGRACOES

### 4.1 Status das integracoes

| Integracao | Auth | Cache | Rate Limit | Tenant Isolation | Erros | Status |
|-----------|------|-------|------------|-----------------|-------|--------|
| Omie ERP | App Key + Secret | 15min | 600ms delay | Parcial (localStorage) | Console only | Ativo |
| RD Station | API Token | 10min | 500ms + retry | NAO | 429 handling | Ativo |
| Fireflies | API Key | 10min | NAO | NAO | Console only | Ativo |
| Google Calendar | OAuth2 | 5min | NAO | NAO | 401 handling | Ativo |
| Slack | Webhook URL | N/A | N/A | N/A | N/A | Demo |

### 4.2 Problemas criticos

1. **Credenciais hardcoded em app.js (linhas 43-51)** — Fireflies API key + Omie app_key/secret visivel no codigo-fonte
2. **API proxies sem protecao** — `/api/omie-proxy` e `/api/rd-proxy` aceitam qualquer request sem auth
3. **CORS wildcard** — `Access-Control-Allow-Origin: *` nos proxies
4. **Credenciais em localStorage** — Acessivel via JavaScript (XSS attack vector)
5. **Zero webhooks implementados** — Tudo e client-pull, sem real-time
6. **Edge Functions nao deployadas** — 7 funcoes preparadas, nenhuma ativa

---

## 5. CI/CD — ESTADO ATUAL

### ZERO INFRAESTRUTURA

- Sem GitHub Actions
- Sem ESLint/Prettier
- Sem TypeScript
- Sem package.json (CDN-only)
- Sem testes automatizados (0% cobertura)
- Sem security scanning (SAST/SCA)
- Sem minificacao/bundling
- Sem code splitting
- Deploy: git push → Vercel auto-deploy → producao (sem gates)

### Performance do deploy atual

```
72 scripts carregados sequencialmente
2.7 MB JS nao-minificado
267 KB CSS em arquivo unico
~80+ HTTP requests no load
Estimativa 3G: 15-20s ate interativo
```

---

## 6. DEAD CODE IDENTIFICADO

### Safe delete (71 KB)

| Arquivo | Tamanho | Razao |
|---------|---------|-------|
| js/onboarding.js | 39.9 KB | NAO importado no index.html |
| js/novo-colaborador.js | 15.0 KB | NAO importado no index.html |
| js/convite.js | 16.1 KB | NAO importado no index.html |

### Needs confirm (180+ KB em untracked)

| Arquivo | Tamanho | Status |
|---------|---------|--------|
| utils/digest-engine.js | 39 KB | Untracked, nao importado |
| utils/document-versions.js | 19 KB | Untracked, nao importado |
| utils/dynamic-templates.js | 23 KB | Untracked, nao importado |
| utils/realtime-engine.js | 12 KB | Untracked, nao importado |
| utils/ui-components.js | 19 KB | Untracked, nao importado |
| utils/workflow-engine.js | 15 KB | Untracked, nao importado |

### Duplicatas de funcoes

- `formatDate()` — 3+ implementacoes
- `formatCurrency()` — 2 implementacoes
- `escapeHtml()` — 3 implementacoes (js/supabase-client.js, utils/formatter.js, utils/toast.js)

---

## 7. TOP 10 RISCOS — PRIORIDADE

| # | Risco | Severidade | Esforco Fix | Area |
|---|-------|-----------|-------------|------|
| 1 | **Credenciais hardcoded em app.js** (Fireflies, Omie) | CRITICO | P | Security |
| 2 | **14 tabelas sem RLS** (projects, tasks, crm_deals...) | CRITICO | M | RLS |
| 3 | **API proxies sem autenticacao** (/api/omie-proxy, /api/rd-proxy) | CRITICO | P | Security |
| 4 | **Queries JS sem filtro tenant_id** (50+ queries) | CRITICO | M | RLS |
| 5 | **Zero CI/CD** (deploy direto para producao) | CRITICO | M | CI/CD |
| 6 | **RBAC somente client-side** (zero server-side) | ALTO | G | RBAC |
| 7 | **Legacy mode silencioso** (fallback sem log) | ALTO | P | Security |
| 8 | **XSS em 26/43 modulos** (sem sanitizacao) | ALTO | M | Security |
| 9 | **Session em sessionStorage** (editavel via DevTools) | MEDIO | M | Security |
| 10 | **2.7 MB sem minificacao** (72 scripts sequenciais) | MEDIO | G | Performance |

---

## 8. POSITIVOS

- Arquitetura de routing solida (aliases, deep linking, lifecycle)
- 5 roles bem definidos com separacao clara
- Modulo financeiro com RLS excelente (12 tabelas protegidas)
- Onboarding com 30+ RLS policies
- Supabase triggers para automacao (5 triggers ativos)
- Offline sync queue funcional
- XSS protection no sistema de onboarding
- Dual auth (Supabase + legacy) para resiliencia
- .gitignore correto (config.js excluido)

---

*Documento gerado em 2026-02-19. Proximo passo: Entregavel 2 (Backlog de 100 melhorias).*
