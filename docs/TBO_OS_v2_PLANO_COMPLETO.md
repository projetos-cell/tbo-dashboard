# TBO OS v2 — Plano Completo de Execucao

> Documento gerado em 2026-02-19 | Versao: v2.0-planning
> Autor: Claude Code (assistido por Marco)

---

## PARTE 1 — DIAGNOSTICO DO ESTADO ATUAL

### 1.1 Arquitetura Atual

| Item | Estado |
|------|--------|
| Framework | Vanilla JS SPA, singletons `TBO_*` |
| Backend | Supabase PostgreSQL (olnndpultyllyhzxuyxh.supabase.co) |
| Deploy | Vercel (tbo-dashboard-main.vercel.app) |
| Routing | Hash-based via `TBO_ROUTER` (utils/router.js) |
| Auth | Supabase + legacy hardcoded (utils/auth.js) |
| RBAC | 5 roles hardcoded em permissions.js |
| Modulos | 36 modulos em modules/ |
| CSS | 10.859 linhas, design system com vars --brand-* |
| Build system | Nenhum (vanilla, sem npm/webpack) |

### 1.2 Modulos Existentes (36)

**Core:** command-center, alerts, configuracoes
**Comercial:** comercial, pipeline, clientes, inteligencia, mercado, conteudo
**Financeiro:** financeiro, receber, pagar, margens, conciliacao, contratos
**Projetos:** projetos, tarefas, entregas, revisoes, decisoes, timesheets, carga-trabalho, capacidade, timeline
**Pessoas:** rh, pessoas-avancado, cultura
**Reunioes:** reunioes, biblioteca
**Academy:** trilha-aprendizagem (basico)
**Admin:** permissoes-config, integracoes, changelog, templates, portal-cliente, placeholder

### 1.3 Integracoes Atuais

| Integracao | Status | Tipo | Arquivo |
|------------|--------|------|---------|
| Supabase (DB) | ATIVO | Backend principal | utils/supabase.js |
| Google Sheets | ATIVO | Pull financeiro | utils/google-sheets.js |
| Fireflies.ai | ATIVO | Pull reunioes | utils/fireflies.js |
| RD Station CRM | ATIVO | Bidirecional | utils/rd-station.js + api/rd-proxy.js |
| Omie | NAO EXISTE | - | - |
| Google Calendar | NAO EXISTE | - | - |
| Google OAuth | PARCIAL | Login apenas | utils/auth.js |
| Magic Link | NAO EXISTE | - | - |

### 1.4 Database (Supabase) — Tabelas Existentes

**Onboarding (9 tabelas + 2 views):**
- colaboradores, convites, onboarding_dias, onboarding_atividades
- onboarding_progresso, onboarding_dias_liberados, onboarding_checkins
- onboarding_notificacoes, colaboradores_status_log
- vw_progresso_onboarding, vw_colaboradores_inativos

**ERP Core (15+ tabelas):**
- profiles, projects, tasks, deliverables, proposals
- decisions, meetings, time_entries, crm_stages, crm_deals
- audit_log, notifications, monthly_closings, company_context, knowledge_items
- contract_attachments, business_config, financial_data, financial_targets
- operating_criteria, document_versions, dynamic_templates, digest_logs

**Storage Buckets:** contract-files, document-versions, onboarding-files

### 1.5 Bugs e Problemas Conhecidos

| # | Problema | Causa Raiz | Severidade |
|---|----------|-----------|-----------|
| 1 | Flash da tela de login ao atualizar | Race condition: 3 code paths escondem overlay async | ALTA |
| 2 | First page nao e /dashboard | Router nao forca dashboard como default | MEDIA |
| 3 | Dois botoes "+" para tarefas | Modulos tarefas.js e projetos.js ambos criam FAB | BAIXA |
| 4 | Filtro de periodo no dashboard | Widget com filtro desnecessario | BAIXA |
| 5 | Mapa nao funciona | Widget "Cities Map" existe mas sem implementacao real | MEDIA |
| 6 | RBAC hardcoded em JS | Roles e permissoes no client-side, nao no Supabase | ALTA |
| 7 | Credenciais expostas | API keys em supabase.js e supabase-client.js | ALTA |
| 8 | Sem multi-tenant | Nenhuma estrutura de empresa/workspace | ALTA |
| 9 | Financeiro depende de Sheets | Dados financeiros vem de planilha Google | ALTA |
| 10 | Usuarios legacy hardcoded | 16 usuarios hardcoded em auth.js | ALTA |

---

## PARTE 2 — PLANO DE EXECUCAO POR FASES

### FASE 1: Fundacao e Bloqueadores (Semanas 1-3)

> Objetivo: Corrigir bugs criticos, auth robusto, multi-tenant base, RBAC no Supabase.

#### 1.1 Fix Auth Flash + Redirect
- Unificar hide do login overlay em um unico code path
- Adicionar CSS `visibility: hidden` no overlay ANTES da hidratacao JS
- Garantir que `checkSession()` roda SYNC antes de qualquer render
- Default route = `#command-center` (dashboard)
- **Arquivos:** utils/auth.js, index.html, app.js

#### 1.2 Multi-tenant Foundation
- Criar tabela `tenants` no Supabase
- Criar tabela `tenant_members` (user <-> tenant com role)
- Adicionar `tenant_id` como FK em TODAS as tabelas de dados
- Seed: TBO (id=1) e TBO Academy (id=2)
- Criar UI de selecao de workspace (antes do dashboard)
- Persistir tenant ativo em sessionStorage
- **Novos arquivos:** modules/workspace-selector.js

#### 1.3 RBAC no Supabase
- Criar tabela `roles` com permissoes por modulo
- Criar tabela `role_permissions` (role + module + actions CRUD)
- Migrar roles hardcoded de permissions.js para Supabase
- RLS policies baseadas em tenant_id + role
- Manter permissions.js como cache client-side (carrega do Supabase)
- **Roles iniciais:** admin, socio, diretor, po, artista, comercial, financeiro

#### 1.4 Reset de Usuarios
- Criar migration que reseta todos exceto marco e ruy
- Adicionar flags: `first_login_completed`, `onboarding_completed`
- Adicionar `module_tours_completed` (JSONB com modulos)
- Manter dados financeiros/projetos intactos
- **Arquivo:** database/migration-v3-reset.sql

#### 1.5 Fixes de UI
- Remover botao "+" duplicado (manter apenas FAB do canto direito)
- Remover filtro de periodo do dashboard
- Corrigir/remover widget de mapa
- Revisar acentuacoes (varredura automatica)
- **Arquivos:** modules/tarefas.js, modules/command-center.js

#### 1.6 Auth Supabase Completo
- Garantir Google OAuth funcional
- Implementar Magic Link (signInWithOtp)
- Remover dropdown de usuarios legacy
- Ajustar redirect post-login para workspace selector
- **Arquivo:** utils/auth.js, index.html

### FASE 2: Integracoes (Semanas 4-6)

> Objetivo: RD Station como fonte de verdade, Omie, Fireflies verificado, Google Calendar.

#### 2.1 Reset Comercial + RD Station Unilateral
- Remover features comerciais que nao dependem do RD
- RD Station como fonte de verdade (apenas pull, sem push)
- Padronizar entidades: leads, contacts, companies, deals
- Criar rotina de sync (webhook preferivel, polling fallback)
- Tabelas: `rd_sync_log`, `rd_leads`, `rd_contacts`, `rd_companies`, `rd_deals`
- Tela de status de sync (ultimo sync, erros, contagem)
- **Arquivos:** utils/rd-station.js, modules/comercial.js, modules/pipeline.js

#### 2.2 Integracao Omie
- Implementar conector Omie REST API
- Edge Function para ingestao e normalizacao
- Tabelas staging: `omie_raw_*` (dados brutos)
- Tabelas normalizadas: `omie_accounts_payable`, `omie_accounts_receivable`, `omie_categories`, `omie_clients`, `omie_vendors`
- Vincular por tenant_id
- Tela de integracoes com status
- **Novos arquivos:** utils/omie.js, supabase/functions/omie-sync/

#### 2.3 Verificar/Corrigir Fireflies
- Validar que utils/fireflies.js esta funcional
- Garantir autenticacao (API key em config.js)
- Ingestao de reunioes/transcricoes/action items
- Persistir no Supabase: `fireflies_meetings`, `fireflies_transcripts`, `fireflies_action_items`
- Vincular por tenant_id e project_id (quando aplicavel)
- Tela "Reunioes / AI Notes" com lista e detalhe
- **Arquivos:** utils/fireflies.js, modules/reunioes.js

#### 2.4 Google Calendar
- Implementar OAuth com scope calendar.readonly
- Persistir tokens por usuario (tabela `user_integrations`)
- Sync de eventos para tabela `calendar_events`
- Vincular com tarefas/projetos
- Widget no dashboard
- **Novos arquivos:** utils/google-calendar.js

### FASE 3: Financeiro (Semanas 7-9)

> Objetivo: Migrar financeiro de Sheets para Supabase, conciliacao bancaria.

#### 3.1 Migracao Sheets -> Supabase
- Criar schema financeiro nativo:
  - `fin_transactions` (lancamentos)
  - `fin_categories` (categorias)
  - `fin_cost_centers` (centros de custo)
  - `fin_invoices` (notas fiscais)
  - `fin_receivables` (contas a receber)
  - `fin_payables` (contas a pagar)
  - `fin_vendors` (fornecedores)
  - `fin_clients` (clientes financeiros)
- Script de importacao dos dados atuais do Sheets
- Validacao cruzada (Sheets vs Supabase)
- Desligar dependencia do Google Sheets gradualmente
- **Arquivos:** utils/google-sheets.js (deprecar), modules/financeiro.js

#### 3.2 Conciliacao Bancaria
- Tabelas: `bank_imports`, `bank_transactions`, `reconciliation_matches`, `reconciliation_rules`, `reconciliation_audit`
- Parser OFX (client-side JS)
- Parser CSV (client-side JS, detectar layout de banco)
- Edge Function para cruzamento automatico (data/valor/descricao)
- UX: upload -> preview -> sugestoes de match -> aprovar/rejeitar -> registrar
- **Novos arquivos:** modules/conciliacao-bancaria.js, utils/ofx-parser.js, utils/csv-parser.js

### FASE 4: Produto (Semanas 10-14)

> Objetivo: Academy, pesquisas de mercado, admin portal, notificacoes, PDF, manual cultura.

#### 4.1 TBO Academy (Subsistema)
- Navegacao propria (rotas #academy/*)
- Tabelas:
  - `academy_courses` (cursos)
  - `academy_lessons` (aulas)
  - `academy_assets` (materiais)
  - `academy_enrollments` (matriculas)
  - `academy_progress` (progresso)
  - `academy_certificates` (certificados — placeholder)
- RBAC: admin_academy, instrutor, aluno
- UI: catalogo, player de aula, progresso, certificados
- **Novos arquivos:** modules/academy-*.js (4-5 modulos)

#### 4.2 Pesquisas de Mercado
- Tabelas:
  - `market_research` (pesquisa)
  - `market_sources` (fontes/links)
  - `market_tags` (tags)
  - `market_research_projects` (relacao com projetos)
- UI: listagem, filtros, salvar fontes, status (rascunho/publicado)
- **Arquivo:** modules/mercado.js (refatorar)

#### 4.3 Admin Portal
- Tela administrativa com tabs:
  - Empresas (tenants)
  - Usuarios (CRUD + role assignment)
  - Roles/Permissoes (matrix editor)
  - Integracoes (status RD/Omie/Fireflies/Google)
  - Auditoria e logs
- **Novo arquivo:** modules/admin-portal.js

#### 4.4 Notificacoes In-App
- Tabela `notifications` (ja existe, expandir)
- Bell icon funcional com:
  - Lista de notificacoes
  - Lidas/nao lidas
  - Gatilhos: tarefa atribuida, prazo, falha sync, comentario, update projeto
- Realtime via Supabase subscriptions
- **Arquivo:** utils/notifications.js + js/notificacoes.js (unificar)

#### 4.5 Relatorio PDF
- Implementar com jsPDF ou html2pdf.js
- Botao "Exportar PDF" no dashboard
- Layout limpo para contador/investidor
- Respeitar RBAC e contexto do tenant
- **Novo arquivo:** utils/pdf-export.js

#### 4.6 Ficha do Colaborador (PJ)
- Tela com: dados, cargo, salario/repasse PJ, historico de alteracoes
- Tabela `collaborator_profiles` (expandir colaboradores)
- Audit trail de alteracoes
- RBAC: artista nao ve salarios de outros
- **Arquivo:** modules/rh.js (expandir)

#### 4.7 Manual de Cultura Digital
- Tabela `culture_pages` (content management basico)
- Navegavel dentro da plataforma (paginas/cards)
- Valores, praticas, rituais, padroes de qualidade
- **Arquivo:** modules/cultura.js (expandir)

#### 4.8 Onboarding Wizard
- Wizard com passos: perfil, empresa, preferencias, conclusao
- Depois: tour por modulo (contextual por role)
- Flags: first_login_completed, onboarding_completed, module_tours_completed
- **Novos arquivos:** modules/onboarding-wizard.js

#### 4.9 Changelog v2
- Tabela `changelog_entries` (data, versao, descricao, autor, tags)
- Banner "Voce esta na v2"
- Historico retroativo
- **Arquivo:** modules/changelog.js (refatorar)

---

## PARTE 3 — SCHEMA SUPABASE COMPLETO

### 3.1 Tabelas Novas — Multi-tenant

```sql
-- ============================================
-- MULTI-TENANT
-- ============================================

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE tenant_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, user_id)
);

-- ============================================
-- RBAC
-- ============================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    module TEXT NOT NULL,
    can_view BOOLEAN DEFAULT false,
    can_create BOOLEAN DEFAULT false,
    can_edit BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    can_export BOOLEAN DEFAULT false,
    UNIQUE(role_id, module)
);
```

### 3.2 Tabelas Novas — Academy

```sql
-- ============================================
-- TBO ACADEMY
-- ============================================

CREATE TABLE academy_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_id UUID REFERENCES auth.users(id),
    category TEXT,
    difficulty TEXT CHECK (difficulty IN ('iniciante', 'intermediario', 'avancado')),
    duration_hours NUMERIC(5,1),
    is_published BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academy_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    content_type TEXT CHECK (content_type IN ('video', 'texto', 'quiz', 'exercicio', 'arquivo')),
    content_url TEXT,
    content_body TEXT,
    duration_min INT,
    order_index INT DEFAULT 0,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academy_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES academy_lessons(id) ON DELETE CASCADE,
    course_id UUID REFERENCES academy_courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size_bytes BIGINT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE academy_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES academy_courses(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    enrolled_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, course_id)
);

CREATE TABLE academy_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    score NUMERIC(5,2),
    time_spent_sec INT DEFAULT 0,
    attempts INT DEFAULT 0,
    UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE academy_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    enrollment_id UUID NOT NULL REFERENCES academy_enrollments(id) ON DELETE CASCADE,
    issued_at TIMESTAMPTZ DEFAULT now(),
    certificate_url TEXT,
    certificate_code TEXT UNIQUE
);
```

### 3.3 Tabelas Novas — Financeiro Nativo

```sql
-- ============================================
-- FINANCEIRO (migracao de Sheets)
-- ============================================

CREATE TABLE fin_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('receita', 'despesa')),
    parent_id UUID REFERENCES fin_categories(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_cost_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    code TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    document TEXT, -- CNPJ/CPF
    email TEXT,
    phone TEXT,
    address JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    document TEXT,
    email TEXT,
    phone TEXT,
    address JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    type TEXT NOT NULL CHECK (type IN ('receita', 'despesa', 'transferencia')),
    category_id UUID REFERENCES fin_categories(id),
    cost_center_id UUID REFERENCES fin_cost_centers(id),
    client_id UUID REFERENCES fin_clients(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    project_id UUID REFERENCES projects(id),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    paid_date DATE,
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
    payment_method TEXT,
    document_number TEXT,
    notes TEXT,
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    omie_id TEXT, -- referencia para Omie se sincronizado
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    transaction_id UUID REFERENCES fin_transactions(id),
    number TEXT,
    series TEXT,
    type TEXT CHECK (type IN ('nfe', 'nfse', 'recibo', 'boleto', 'outro')),
    file_url TEXT,
    issued_at DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_receivables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    client_id UUID REFERENCES fin_clients(id),
    project_id UUID REFERENCES projects(id),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    paid_date DATE,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'parcial', 'pago', 'vencido', 'cancelado')),
    installment_number INT,
    installment_total INT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fin_payables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    vendor_id UUID REFERENCES fin_vendors(id),
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    due_date DATE NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0,
    paid_date DATE,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'parcial', 'pago', 'vencido', 'cancelado')),
    recurrence TEXT CHECK (recurrence IN ('unica', 'mensal', 'trimestral', 'anual')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.4 Tabelas Novas — Conciliacao Bancaria

```sql
-- ============================================
-- CONCILIACAO BANCARIA
-- ============================================

CREATE TABLE bank_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    filename TEXT NOT NULL,
    file_type TEXT CHECK (file_type IN ('ofx', 'csv')),
    bank_name TEXT,
    account_number TEXT,
    period_start DATE,
    period_end DATE,
    total_transactions INT DEFAULT 0,
    total_matched INT DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
    imported_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE bank_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    import_id UUID NOT NULL REFERENCES bank_imports(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    type TEXT CHECK (type IN ('credit', 'debit')),
    fitid TEXT, -- OFX unique transaction ID
    memo TEXT,
    check_number TEXT,
    matched BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reconciliation_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    bank_transaction_id UUID NOT NULL REFERENCES bank_transactions(id),
    fin_transaction_id UUID REFERENCES fin_transactions(id),
    match_type TEXT CHECK (match_type IN ('auto', 'manual', 'rule')),
    confidence NUMERIC(3,2), -- 0.00 a 1.00
    status TEXT DEFAULT 'suggested' CHECK (status IN ('suggested', 'approved', 'rejected')),
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reconciliation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    description_pattern TEXT, -- regex ou LIKE pattern
    amount_min NUMERIC(15,2),
    amount_max NUMERIC(15,2),
    target_category_id UUID REFERENCES fin_categories(id),
    target_cost_center_id UUID REFERENCES fin_cost_centers(id),
    auto_approve BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE reconciliation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    match_id UUID REFERENCES reconciliation_matches(id),
    action TEXT NOT NULL, -- 'approved', 'rejected', 'auto_matched', 'rule_applied'
    performed_by UUID REFERENCES auth.users(id),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 3.5 Tabelas Novas — Integracoes

```sql
-- ============================================
-- INTEGRACOES E SYNC
-- ============================================

CREATE TABLE integration_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider TEXT NOT NULL, -- 'rd_station', 'omie', 'fireflies', 'google_calendar'
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT,
    last_sync_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, provider)
);

CREATE TABLE sync_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    provider TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('pull', 'push', 'bidirectional')),
    entity_type TEXT, -- 'deals', 'contacts', 'meetings', 'transactions'
    records_fetched INT DEFAULT 0,
    records_created INT DEFAULT 0,
    records_updated INT DEFAULT 0,
    records_errors INT DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    status TEXT DEFAULT 'running' CHECK (status IN ('running', 'success', 'partial', 'error')),
    error_details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RD Station (fonte de verdade)
CREATE TABLE rd_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    rd_id TEXT UNIQUE,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    stage TEXT,
    source TEXT,
    tags TEXT[],
    custom_fields JSONB,
    synced_at TIMESTAMPTZ DEFAULT now(),
    raw_data JSONB
);

CREATE TABLE rd_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    rd_id TEXT UNIQUE,
    name TEXT,
    amount NUMERIC(15,2),
    stage TEXT,
    probability INT,
    contact_id UUID REFERENCES rd_leads(id),
    organization TEXT,
    close_date DATE,
    custom_fields JSONB,
    synced_at TIMESTAMPTZ DEFAULT now(),
    raw_data JSONB
);

-- Omie (staging + normalizado)
CREATE TABLE omie_raw_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    entity_type TEXT NOT NULL,
    omie_id TEXT NOT NULL,
    raw_json JSONB NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, entity_type, omie_id)
);

CREATE TABLE omie_accounts_payable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    omie_id TEXT UNIQUE,
    description TEXT,
    vendor_name TEXT,
    vendor_document TEXT,
    amount NUMERIC(15,2),
    due_date DATE,
    paid_date DATE,
    status TEXT,
    category_code TEXT,
    synced_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE omie_accounts_receivable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    omie_id TEXT UNIQUE,
    description TEXT,
    client_name TEXT,
    client_document TEXT,
    amount NUMERIC(15,2),
    due_date DATE,
    received_date DATE,
    status TEXT,
    category_code TEXT,
    synced_at TIMESTAMPTZ DEFAULT now()
);

-- Fireflies
CREATE TABLE fireflies_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    fireflies_id TEXT UNIQUE,
    title TEXT,
    date TIMESTAMPTZ,
    duration_min INT,
    participants TEXT[],
    organizer_email TEXT,
    summary TEXT,
    keywords TEXT[],
    project_id UUID REFERENCES projects(id),
    synced_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE fireflies_action_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id UUID NOT NULL REFERENCES fireflies_meetings(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    assignee TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Google Calendar
CREATE TABLE user_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, provider)
);

CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    google_event_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    location TEXT,
    attendees JSONB,
    project_id UUID REFERENCES projects(id),
    task_id UUID REFERENCES tasks(id),
    is_all_day BOOLEAN DEFAULT false,
    synced_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, google_event_id)
);
```

### 3.6 Tabelas Novas — Pesquisa de Mercado

```sql
-- ============================================
-- PESQUISA DE MERCADO
-- ============================================

CREATE TABLE market_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'em_andamento', 'publicado', 'arquivado')),
    project_id UUID REFERENCES projects(id),
    client_id UUID REFERENCES fin_clients(id),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE market_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES market_research(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT,
    source_type TEXT CHECK (source_type IN ('artigo', 'relatorio', 'noticia', 'dados', 'outro')),
    notes TEXT,
    relevance INT CHECK (relevance BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE market_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    UNIQUE(tenant_id, name)
);

CREATE TABLE market_research_tags (
    research_id UUID NOT NULL REFERENCES market_research(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES market_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (research_id, tag_id)
);
```

### 3.7 Tabelas Novas — Notificacoes, Changelog, Cultura

```sql
-- ============================================
-- NOTIFICACOES (expandir existente)
-- ============================================

-- A tabela notifications ja existe. Adicionar campos:
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS trigger_type TEXT;
-- trigger_type: 'task_assigned', 'deadline', 'sync_failure', 'comment', 'project_update', 'system'
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_type TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS entity_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';

-- ============================================
-- CHANGELOG
-- ============================================

CREATE TABLE changelog_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author TEXT,
    tag TEXT CHECK (tag IN ('feature', 'fix', 'improvement', 'breaking', 'security')),
    module TEXT,
    published_at DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- MANUAL DE CULTURA
-- ============================================

CREATE TABLE culture_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT, -- markdown
    category TEXT CHECK (category IN ('valores', 'praticas', 'rituais', 'padroes', 'geral')),
    order_index INT DEFAULT 0,
    is_published BOOLEAN DEFAULT true,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(tenant_id, slug)
);

-- ============================================
-- FICHA DO COLABORADOR (PJ)
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS cargo TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS salary_pj NUMERIC(15,2); -- repasse PJ
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'pj';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS document TEXT; -- CNPJ
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bank_info JSONB; -- dados bancarios (criptografados)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS emergency_contact JSONB;

CREATE TABLE collaborator_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    field_changed TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ONBOARDING FLAGS (expandir profiles)
-- ============================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS first_login_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_wizard_completed BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS module_tours_completed JSONB DEFAULT '{}';
-- Formato: {"command-center": true, "projetos": true, ...}
```

### 3.8 Adicionar tenant_id em Tabelas Existentes

```sql
-- Adicionar tenant_id em todas as tabelas existentes que nao tem
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE deliverables ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE decisions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE time_entries ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE crm_stages ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE crm_deals ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE monthly_closings ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE knowledge_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE contract_attachments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE business_config ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE financial_data ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE financial_targets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE operating_criteria ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE document_versions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE dynamic_templates ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id);

-- Seed tenants iniciais
INSERT INTO tenants (name, slug) VALUES ('TBO', 'tbo');
INSERT INTO tenants (name, slug) VALUES ('TBO Academy', 'tbo-academy');

-- Seed roles iniciais (para tenant TBO)
INSERT INTO roles (tenant_id, name, slug, is_system) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Admin', 'admin', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Socio', 'socio', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Diretor', 'diretor', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Project Owner', 'po', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Artista', 'artista', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Comercial', 'comercial', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo'), 'Financeiro', 'financeiro', true);

-- Seed roles Academy
INSERT INTO roles (tenant_id, name, slug, is_system) VALUES
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Admin Academy', 'admin_academy', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Instrutor', 'instrutor', true),
    ((SELECT id FROM tenants WHERE slug = 'tbo-academy'), 'Aluno', 'aluno', true);
```

### 3.9 RLS Policies (Resumo)

```sql
-- Todas as tabelas com tenant_id devem ter RLS:
-- Policy padrao: SELECT/INSERT/UPDATE/DELETE WHERE tenant_id = get_current_tenant()

-- Funcao helper para pegar tenant ativo do usuario
CREATE OR REPLACE FUNCTION get_current_tenant()
RETURNS UUID AS $$
    SELECT tenant_id FROM tenant_members
    WHERE user_id = auth.uid()
    AND is_active = true
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Policy generica (aplicar em cada tabela):
-- CREATE POLICY "tenant_isolation" ON <tabela>
--   USING (tenant_id = get_current_tenant())
--   WITH CHECK (tenant_id = get_current_tenant());

-- Permissoes por role sao checadas no client via role_permissions
-- RLS garante isolamento por tenant; RBAC granular e feito no app
```

---

## PARTE 4 — ROTAS E MODULOS COM PROTECAO RBAC

### 4.1 Mapa de Rotas

| Rota (hash) | Modulo | Roles com Acesso |
|-------------|--------|-----------------|
| #workspace | workspace-selector | todos (primeira tela) |
| #command-center | command-center | todos |
| #projetos | projetos | admin, socio, diretor, po, artista |
| #tarefas | tarefas | todos |
| #entregas | entregas | admin, socio, po, artista |
| #revisoes | revisoes | admin, socio, po, artista |
| #timeline | timeline | admin, socio, diretor, po |
| #timesheets | timesheets | todos |
| #carga-trabalho | carga-trabalho | admin, socio, diretor, po |
| #capacidade | capacidade | admin, socio, diretor |
| #comercial | comercial | admin, socio, diretor, comercial |
| #pipeline | pipeline | admin, socio, diretor, comercial |
| #clientes | clientes | admin, socio, diretor, comercial |
| #inteligencia | inteligencia | admin, socio, diretor |
| #mercado | mercado | admin, socio, diretor, comercial |
| #conteudo | conteudo | admin, socio, comercial |
| #financeiro | financeiro | admin, socio, financeiro |
| #receber | receber | admin, socio, financeiro |
| #pagar | pagar | admin, socio, financeiro |
| #margens | margens | admin, socio, diretor, financeiro |
| #conciliacao | conciliacao-bancaria | admin, socio, financeiro |
| #contratos | contratos | admin, socio, diretor, po, comercial, financeiro |
| #rh | rh | admin, socio, diretor |
| #pessoas-avancado | pessoas-avancado | admin, socio, diretor, po |
| #cultura | cultura | todos |
| #reunioes | reunioes | todos |
| #decisoes | decisoes | admin, socio, diretor, po |
| #biblioteca | biblioteca | todos |
| #alerts | alerts | todos |
| #changelog | changelog | todos |
| #configuracoes | configuracoes | admin, socio |
| #integracoes | integracoes | admin, socio |
| #admin-portal | admin-portal | admin, socio |
| #permissoes-config | permissoes-config | admin |
| #portal-cliente | portal-cliente | admin, socio, comercial |
| #academy/cursos | academy-cursos | todos (no tenant Academy) |
| #academy/aulas | academy-aulas | todos (no tenant Academy) |
| #academy/progresso | academy-progresso | todos (no tenant Academy) |
| #academy/admin | academy-admin | admin_academy, instrutor |
| #pesquisas | market-research | admin, socio, diretor, comercial |

### 4.2 Modulos por Role

| Role | Modulos Acessiveis |
|------|-------------------|
| admin/socio | TODOS |
| diretor | Todos exceto: configuracoes, integracoes, admin-portal, permissoes-config |
| po | projetos, tarefas, entregas, revisoes, timeline, carga-trabalho, contratos, pessoas-avancado, decisoes, reunioes, timesheets, cultura, biblioteca, alerts, changelog |
| artista | projetos, tarefas, entregas, revisoes, timesheets, cultura, biblioteca, reunioes, alerts, changelog |
| comercial | comercial, pipeline, clientes, mercado, conteudo, contratos, portal-cliente, reunioes, tarefas, alerts, changelog, pesquisas |
| financeiro | financeiro, receber, pagar, margens, conciliacao, contratos, tarefas, alerts, changelog |

---

## PARTE 5 — CRITERIOS DE ACEITE (QA)

### 5.1 Fase 1 — Fundacao

#### Auth Flash Fix
- [ ] Ao recarregar pagina logado, NAO aparece tela de login em nenhum momento
- [ ] Ao fazer login, transicao suave sem flash
- [ ] Ao fazer logout, tela de login aparece imediatamente
- [ ] Google OAuth redireciona corretamente sem flash
- [ ] Magic Link redireciona corretamente sem flash

#### First Page = Dashboard
- [ ] Primeiro acesso apos login: rota = #command-center
- [ ] Reload da pagina: permanece na rota atual (nao reseta)
- [ ] Se rota nao definida: fallback para #command-center

#### Multi-tenant
- [ ] Tela de selecao de workspace aparece apos login
- [ ] Cards "TBO" e "TBO Academy" visiveis
- [ ] Selecao persiste na sessao
- [ ] Dados filtrados por tenant_id
- [ ] Criar nova empresa via admin funciona
- [ ] Trocar de workspace funciona sem logout

#### RBAC
- [ ] Roles definidas no Supabase (nao hardcoded)
- [ ] Permissoes por modulo + acao (CRUD + export)
- [ ] Artista NAO acessa financeiro
- [ ] Comercial NAO acessa RH
- [ ] Financeiro NAO acessa projetos (exceto contratos)
- [ ] Admin/Socio acessa tudo
- [ ] Sidebar mostra apenas modulos permitidos
- [ ] Navegacao direta via hash bloqueada se sem permissao

#### Reset de Usuarios
- [ ] Marco e Ruy mantidos intactos
- [ ] Demais usuarios resetados (sessoes, flags)
- [ ] Dados financeiros/projetos preservados
- [ ] Flag first_login_completed = false para resetados
- [ ] Onboarding wizard aparece no proximo login

#### UI Fixes
- [ ] Apenas 1 botao "+" para tarefas (canto direito)
- [ ] Dashboard sem filtro de periodo
- [ ] Widget de mapa removido ou funcional
- [ ] Todas acentuacoes corretas em PT-BR

### 5.2 Fase 2 — Integracoes

#### RD Station Unilateral
- [ ] Sync pull funcional (RD -> TBO)
- [ ] Sem push para RD (read-only)
- [ ] Entidades padronizadas: leads, contacts, companies, deals
- [ ] Tela de status: ultimo sync, erros, contagem
- [ ] Log de cada sync no Supabase
- [ ] Dados persistidos por tenant
- [ ] Webhook OU polling funcional
- [ ] Erro de sync nao quebra a aplicacao

#### Omie
- [ ] Conector REST funcional
- [ ] Dados de contas a pagar/receber importados
- [ ] Categorias e clientes/fornecedores sincronizados
- [ ] Dados em staging (raw) + normalizados
- [ ] Vinculados por tenant_id
- [ ] Tela de integracoes mostra status Omie
- [ ] Ultimo sync e erros visiveis

#### Fireflies
- [ ] API autenticada e funcional
- [ ] Reunioes/transcricoes importadas
- [ ] Action items extraidos
- [ ] Persistido no Supabase por tenant
- [ ] Tela "Reunioes / AI Notes" com lista e detalhe
- [ ] Status de sync visivel

#### Google Calendar
- [ ] OAuth funcional (scope calendar.readonly)
- [ ] Tokens persistidos por usuario com seguranca
- [ ] Eventos sincronizados
- [ ] Widget no dashboard funcional
- [ ] Vincular evento com tarefa/projeto funciona

### 5.3 Fase 3 — Financeiro

#### Migracao Sheets -> Supabase
- [ ] Todas categorias migradas
- [ ] Todos lancamentos migrados
- [ ] Centros de custo configurados
- [ ] Validacao cruzada (Sheets vs Supabase) sem divergencia
- [ ] Modulos financeiro/receber/pagar funcionam com dados Supabase
- [ ] Google Sheets pode ser desligado sem perda

#### Conciliacao Bancaria
- [ ] Upload OFX funcional (parse correto)
- [ ] Upload CSV funcional (detecta layout de banco)
- [ ] Preview de transacoes importadas
- [ ] Sugestoes de match automatico (data/valor/descricao)
- [ ] Aprovar match funciona e registra
- [ ] Rejeitar match funciona
- [ ] Regras de conciliacao configuraveis
- [ ] Audit trail completo
- [ ] Edge Function de cruzamento funcional

### 5.4 Fase 4 — Produto

#### Academy
- [ ] Catalogo de cursos funcional
- [ ] Aulas com player (video/texto/quiz)
- [ ] Progresso rastreado por aluno
- [ ] Certificado gerado (placeholder OK)
- [ ] RBAC: admin_academy, instrutor, aluno
- [ ] Navegacao propria (#academy/*)

#### Pesquisas de Mercado
- [ ] Listagem com filtros
- [ ] Criar/editar pesquisa
- [ ] Salvar fontes/links
- [ ] Tags funcionais
- [ ] Vincular com projeto/cliente
- [ ] Status (rascunho/publicado)

#### Admin Portal
- [ ] CRUD empresas/tenants
- [ ] CRUD usuarios com role assignment
- [ ] Matrix editor de permissoes
- [ ] Status de integracoes
- [ ] Logs de auditoria visiveis

#### Notificacoes
- [ ] Bell icon com badge de contagem
- [ ] Lista de notificacoes (lidas/nao lidas)
- [ ] Gatilhos funcionais: tarefa, prazo, sync, comentario, projeto
- [ ] Marcar como lida funciona
- [ ] Realtime (aparece sem reload)

#### PDF Export
- [ ] Botao no dashboard
- [ ] PDF gerado com layout limpo
- [ ] Respeita RBAC (dados filtrados por permissao)
- [ ] Contexto do tenant correto
- [ ] Formatacao adequada para contador/investidor

#### Ficha do Colaborador
- [ ] Dados visiveis por permissao
- [ ] Artista NAO ve salarios de outros
- [ ] Admin/Socio veem tudo
- [ ] Historico de alteracoes (audit)
- [ ] Campos PJ (CNPJ, repasse, contrato)

#### Manual de Cultura
- [ ] Paginas navegaveis
- [ ] CRUD via admin
- [ ] Categorias: valores, praticas, rituais, padroes
- [ ] Persistido no Supabase

#### Onboarding Wizard
- [ ] Wizard com passos: perfil, empresa, preferencias, conclusao
- [ ] Tour por modulo (contextual por role)
- [ ] Flags corretas (first_login, onboarding, tours)
- [ ] Nao repete apos concluido

#### Changelog v2
- [ ] Tabela changelog_entries funcional
- [ ] Historico retroativo visivel
- [ ] Tags (feature/fix/improvement)
- [ ] Banner "v2" no topo
- [ ] Novos itens marcados como "new"

### 5.5 Testes de Regressao (Checklist Final)

| Area | Teste | Status |
|------|-------|--------|
| Auth | Login email/senha funciona | [ ] |
| Auth | Login Google OAuth funciona | [ ] |
| Auth | Magic Link funciona | [ ] |
| Auth | Logout funciona | [ ] |
| Auth | Sessao persiste em reload | [ ] |
| Auth | Token expira corretamente | [ ] |
| Router | Navegacao por hash funciona | [ ] |
| Router | Deep links funcionam | [ ] |
| Router | Bloqueio por RBAC funciona | [ ] |
| Dashboard | Widgets carregam | [ ] |
| Dashboard | Customizacao salva | [ ] |
| Projetos | CRUD funciona | [ ] |
| Tarefas | CRUD funciona | [ ] |
| Tarefas | Kanban drag-drop funciona | [ ] |
| Entregas | Upload funciona | [ ] |
| Comercial | Pipeline funciona | [ ] |
| Financeiro | Dados carregam | [ ] |
| Contratos | CRUD funciona | [ ] |
| RH | Lista de pessoas carrega | [ ] |
| Reunioes | Lista de reunioes carrega | [ ] |
| Sidebar | Navegacao funciona | [ ] |
| Sidebar | Favoritos funcionam | [ ] |
| Sidebar | Collapse funciona | [ ] |
| Search | Busca global funciona | [ ] |
| Toast | Notificacoes aparecem | [ ] |
| Icons | Lucide icons renderizam | [ ] |
| Responsive | Mobile funciona (600px) | [ ] |
| Performance | Pagina carrega < 3s | [ ] |
| Security | XSS sanitizado | [ ] |
| Security | RLS ativo em todas tabelas | [ ] |
| Multi-tenant | Dados isolados por tenant | [ ] |

---

## PARTE 6 — ESTIMATIVA DE ESFORCO

| Fase | Itens | Complexidade | Prioridade |
|------|-------|-------------|-----------|
| Fase 1 | Auth, Multi-tenant, RBAC, Reset, UI fixes | ALTA | CRITICA |
| Fase 2 | RD, Omie, Fireflies, Calendar | ALTA | ALTA |
| Fase 3 | Financeiro, Conciliacao | ALTA | ALTA |
| Fase 4 | Academy, Admin, Notif, PDF, Cultura | MEDIA | MEDIA |

### Dependencias entre Fases

```
Fase 1 (obrigatoria para tudo)
  |
  +---> Fase 2 (integracoes dependem de multi-tenant)
  |       |
  |       +---> Fase 3 (financeiro depende de Omie integrado)
  |
  +---> Fase 4 (produto depende de RBAC e multi-tenant)
```

---

## PARTE 7 — PROXIMOS PASSOS

1. **Aprovar este plano**
2. **Fase 1.1**: Implementar fix do auth flash (quick win)
3. **Fase 1.2**: Criar migration SQL completa para multi-tenant + RBAC
4. **Fase 1.3**: Implementar workspace selector UI
5. **Fase 1.4**: Migrar permissions.js para carregar do Supabase
6. **Fase 1.5**: Implementar auth completo (Magic Link + remover legacy)
7. **Fase 1.6**: UI fixes (botao duplicado, filtro, mapa)
8. Prosseguir para Fase 2...

---

> Este documento sera atualizado conforme a implementacao avanca.
> Cada fase tera seu proprio PR com changelog entry.
