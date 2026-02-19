# TBO OS — Backlog de 100 Melhorias (Tickets Priorizados)

**Data:** 2026-02-19
**Baseado em:** Auditoria v2.2 (docs/AUDIT_v2.2.md)
**Roadmap:** v2.1 (estabilidade) → v2.2 (performance) → v3.0 (escala)

---

## FASE v2.1 — ESTABILIDADE E SEGURANCA (Prioridade Maxima)

### Sprint 1: Seguranca Critica (Tickets 1-15)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 1 | Remover credenciais hardcoded de app.js | Security | ALTO | P | — |
| 2 | Adicionar RLS em projects | RLS | ALTO | P | — |
| 3 | Adicionar RLS em tasks | RLS | ALTO | P | — |
| 4 | Adicionar RLS em crm_deals | RLS | ALTO | P | — |
| 5 | Adicionar RLS em deliverables | RLS | ALTO | P | — |
| 6 | Adicionar RLS em proposals | RLS | ALTO | P | — |
| 7 | Adicionar RLS em notifications | RLS | ALTO | P | — |
| 8 | Adicionar RLS em profiles | RLS | ALTO | P | — |
| 9 | Adicionar RLS em document_versions | RLS | ALTO | P | — |
| 10 | Adicionar RLS em contract_attachments | RLS | ALTO | P | — |
| 11 | Proteger /api/omie-proxy com auth + rate limit | Security | ALTO | P | — |
| 12 | Proteger /api/rd-proxy com auth + rate limit | Security | ALTO | P | — |
| 13 | Remover legacy login mode (default deny) | Security | ALTO | M | — |
| 14 | Adicionar filtro tenant_id em queries JS (app.js) | RLS | ALTO | P | 2-10 |
| 15 | Adicionar filtro tenant_id em queries JS (digest-engine) | RLS | ALTO | P | 2-10 |

---

#### TICKET 1: Remover credenciais hardcoded de app.js

**Contexto:** app.js linhas 43-51 contem Fireflies API key e Omie app_key/secret em texto plano, seeded no localStorage de todo usuario.

**Escopo:**
- Remover linhas 43-51 de app.js
- Mover credenciais para Vercel Environment Variables
- Criar endpoint `/api/config` que retorna keys via server-side (com auth check)
- Atualizar TBO_OMIE, TBO_FIREFLIES para buscar keys do endpoint

**Criterios de aceite:**
- [ ] Nenhuma credencial visivel em arquivos JS do repositorio
- [ ] `grep -r "e46b7c6c\|5716751616576\|21f5e10c" .` retorna 0 resultados
- [ ] Integracoes continuam funcionando com keys via env vars
- [ ] Preview deploy no Vercel funciona

**Impacto:** ALTO | **Esforco:** P | **Area:** Security | **Versao:** v2.1

---

#### TICKET 2-10: Adicionar RLS nas tabelas core

**Contexto:** 14 tabelas nao tem Row Level Security. Qualquer usuario autenticado pode ler/escrever dados de qualquer tenant.

**Escopo (por tabela):**
```sql
ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{table}_select" ON {table}
  FOR SELECT USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "{table}_insert" ON {table}
  FOR INSERT WITH CHECK (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "{table}_update" ON {table}
  FOR UPDATE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );

CREATE POLICY "{table}_delete" ON {table}
  FOR DELETE USING (
    tenant_id IN (SELECT tenant_id FROM tenant_members WHERE user_id = auth.uid())
  );
```

**Criterios de aceite:**
- [ ] `SELECT * FROM pg_tables WHERE rowsecurity = false AND tablename IN (...)` retorna 0
- [ ] Query de usuario tenant A retorna 0 linhas de tenant B
- [ ] INSERT sem tenant_id valido falha
- [ ] Testes via Supabase Dashboard (SQL Editor) com tokens de usuarios diferentes

**Impacto:** ALTO | **Esforco:** P (por tabela) | **Area:** RLS | **Versao:** v2.1

---

#### TICKET 11: Proteger /api/omie-proxy

**Contexto:** Proxy aceita qualquer request sem autenticacao, CORS wildcard.

**Escopo:**
- Validar header `Authorization: Bearer <supabase_token>`
- Verificar token via Supabase auth.getUser()
- Restringir CORS origin para dominio da app
- Adicionar rate limit (100 req/min por IP)
- Validar endpoint parameter (whitelist de endpoints permitidos)
- Logar requests em sync_logs

**Criterios de aceite:**
- [ ] Request sem token retorna 401
- [ ] Request de origin externo retorna 403
- [ ] 101o request em 1 minuto retorna 429
- [ ] Endpoint nao-whitelisted retorna 400
- [ ] Requests logados em sync_logs

**Impacto:** ALTO | **Esforco:** P | **Area:** Security | **Versao:** v2.1

---

#### TICKET 12: Proteger /api/rd-proxy

**Contexto:** Identico ao omie-proxy — sem auth, sem rate limit.

**Escopo:** Mesmo que ticket 11, aplicado a rd-proxy.js.

**Criterios de aceite:** Mesmos que ticket 11.

**Impacto:** ALTO | **Esforco:** P | **Area:** Security | **Versao:** v2.1

---

#### TICKET 13: Remover legacy login mode

**Contexto:** auth.js:195 faz fallback silencioso para login legado quando Supabase falha. Usuarios hardcoded em auth.js:39-55 com passwords via TBO_CRYPTO.

**Escopo:**
- Remover `_users` object de auth.js
- Remover `login()` method (legacy path)
- Remover `skipSupabase` parameter
- Manter apenas loginWithEmail, loginWithGoogle, loginWithMagicLink
- Adicionar log de falha de auth em audit_log
- Mostrar mensagem clara quando Supabase offline

**Criterios de aceite:**
- [ ] `grep -r "_users\|skipSupabase\|TBO_CRYPTO.getDefaultUserHashes" utils/auth.js` retorna 0
- [ ] Login com Supabase offline mostra "Servico temporariamente indisponivel"
- [ ] Nenhum caminho permite login sem Supabase
- [ ] Tentativas de login logadas em audit_log

**Impacto:** ALTO | **Esforco:** M | **Area:** Security | **Versao:** v2.1

---

#### TICKET 14-15: Filtro tenant_id em queries JS

**Contexto:** Queries em app.js e digest-engine.js nao filtram por tenant_id.

**Escopo:**
- Criar helper `getCurrentTenantId()` em utils/supabase.js
- Atualizar todas as queries .from() para incluir .eq('tenant_id', tenantId)
- Arquivos: app.js (3 queries), digest-engine.js (4 queries), storage.js, configuracoes.js

**Criterios de aceite:**
- [ ] `grep -rn "\.from(" app.js utils/ modules/ | grep -v "tenant_id"` — verificar que nao ha queries sem filtro
- [ ] Query de badge counts (app.js:312-315) filtrado por tenant
- [ ] Digest engine respeita tenant do usuario logado

**Impacto:** ALTO | **Esforco:** P | **Area:** RLS | **Versao:** v2.1

---

### Sprint 2: RBAC Server-Side (Tickets 16-30)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 16 | Criar tabela audit_logs no Supabase | Security | ALTO | P | — |
| 17 | Mover user-role mapping para Supabase (remover hardcode) | RBAC | ALTO | M | — |
| 18 | Adicionar verificacao de permissao dentro de cada modulo | RBAC | ALTO | G | 17 |
| 19 | Criar middleware de permissao no router (server-aware) | RBAC | ALTO | M | 17 |
| 20 | Implementar default deny no TBO_PERMISSIONS | RBAC | ALTO | P | 17 |
| 21 | Adicionar RLS em audit_log | RLS | MEDIO | P | 16 |
| 22 | Adicionar RLS em decisions | RLS | MEDIO | P | — |
| 23 | Adicionar RLS em meetings | RLS | MEDIO | P | — |
| 24 | Adicionar RLS em time_entries | RLS | MEDIO | P | — |
| 25 | Adicionar RLS em knowledge_items | RLS | BAIXO | P | — |
| 26 | Restringir canSeeAllProjects() a founders only | RBAC | MEDIO | P | 17 |
| 27 | Implementar filtro por BU para coordinators | RBAC | MEDIO | M | 26 |
| 28 | Migrar session de sessionStorage para httpOnly cookie | Security | MEDIO | M | — |
| 29 | Criar getSessionContext() — 1 chamada para tenant+role+perms | RBAC | ALTO | M | 17 |
| 30 | Implementar token rotation e session invalidation | Security | MEDIO | M | 28 |

---

#### TICKET 16: Criar tabela audit_logs

**Contexto:** Nao existe audit trail para acoes criticas (login, CRUD, permissoes).

**Escopo:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL, -- 'login', 'create', 'update', 'delete', 'access_denied'
  resource_type TEXT, -- 'project', 'task', 'deal', 'financial'
  resource_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_members tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND r.name = 'founder'
    )
  );

CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (true); -- Todos podem gerar logs
```

**Criterios de aceite:**
- [ ] Tabela criada com RLS
- [ ] Apenas founders veem logs
- [ ] Login (sucesso e falha) gera entry
- [ ] Acesso negado a modulo gera entry
- [ ] CRUD em recursos criticos gera entry

**Impacto:** ALTO | **Esforco:** P | **Area:** Security | **Versao:** v2.1

---

#### TICKET 17: Mover user-role mapping para Supabase

**Contexto:** 15 usuarios hardcoded em permissions.js:68-92 e auth.js:39-55.

**Escopo:**
- Remover `_userRoles` de permissions.js
- Remover `_users` de auth.js
- Usar tabela `tenant_members` + `roles` como fonte de verdade
- Criar funcao `TBO_PERMISSIONS.loadFromDB()` que busca roles do Supabase
- Cachear resultado por 5 minutos
- Fallback: se DB indisponivel, mostrar erro (NAO fallback para hardcode)

**Criterios de aceite:**
- [ ] Zero usuarios hardcoded em qualquer arquivo JS
- [ ] Novo usuario adicionado via Supabase Dashboard aparece no sistema
- [ ] Remocao de role no DB bloqueia acesso imediatamente
- [ ] Cache expira a cada 5 minutos

**Impacto:** ALTO | **Esforco:** M | **Area:** RBAC | **Versao:** v2.1

---

#### TICKET 18: Verificacao de permissao dentro de cada modulo

**Contexto:** 39/43 modulos nao verificam permissao internamente.

**Escopo:**
- Criar mixin `TBO_MODULE_GUARD.check(moduleName)`
- Adicionar no `init()` de cada modulo:
```javascript
init() {
  if (!TBO_AUTH.canAccess('financeiro')) {
    TBO_ROUTER.navigate('command-center');
    TBO_TOAST.warning('Acesso negado', 'Sem permissao para este modulo.');
    return;
  }
  // ... resto do init
}
```
- Aplicar em todos os 43 modulos

**Criterios de aceite:**
- [ ] Artista tentando acessar modulo financeiro via DevTools ve "Acesso negado"
- [ ] `grep -l "canAccess\|MODULE_GUARD" modules/*.js | wc -l` retorna 43
- [ ] Nenhum modulo renderiza conteudo sem check

**Impacto:** ALTO | **Esforco:** G | **Area:** RBAC | **Versao:** v2.1

---

#### TICKET 29: Criar getSessionContext()

**Contexto:** Hoje o login faz multiplas queries separadas para montar contexto.

**Escopo:**
- Criar RPC function `get_session_context()` no Supabase:
```sql
CREATE FUNCTION get_session_context()
RETURNS JSON AS $$
  SELECT json_build_object(
    'user_id', auth.uid(),
    'tenant_id', tm.tenant_id,
    'role', r.name,
    'permissions', (SELECT json_agg(...) FROM role_permissions WHERE role_id = r.id),
    'profile', (SELECT row_to_json(p) FROM profiles p WHERE p.id = auth.uid()),
    'dashboard_summary', json_build_object(
      'tasks_pending', (SELECT count(*) FROM tasks WHERE assigned_to = auth.uid() AND status = 'pendente' AND tenant_id = tm.tenant_id),
      'notifications_unread', (SELECT count(*) FROM notifications WHERE user_id = auth.uid() AND read = false AND tenant_id = tm.tenant_id),
      'deals_active', (SELECT count(*) FROM crm_deals WHERE stage = 'negociacao' AND tenant_id = tm.tenant_id)
    )
  )
  FROM tenant_members tm
  JOIN roles r ON r.id = tm.role_id
  WHERE tm.user_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

**Criterios de aceite:**
- [ ] 1 unica chamada RPC retorna todo o contexto
- [ ] Tempo de resposta < 200ms
- [ ] Usado no boot do app (substituir multiplas queries)

**Impacto:** ALTO | **Esforco:** M | **Area:** RBAC + Performance | **Versao:** v2.1

---

### Sprint 3: CI/CD Base (Tickets 31-40)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 31 | Criar package.json e instalar deps locais | CI/CD | ALTO | P | — |
| 32 | Configurar ESLint com regras de seguranca | CI/CD | ALTO | M | 31 |
| 33 | Configurar Prettier | CI/CD | BAIXO | P | 31 |
| 34 | Criar GitHub Actions: lint + build | CI/CD | ALTO | M | 31,32 |
| 35 | Criar GitHub Actions: security scan (npm audit) | CI/CD | ALTO | P | 31 |
| 36 | Criar GitHub Actions: RLS audit automatizado | CI/CD | ALTO | M | — |
| 37 | Criar GitHub Actions: dead-code scan | CI/CD | MEDIO | M | 31 |
| 38 | Adicionar SRI (Subresource Integrity) nos CDN scripts | Security | MEDIO | P | — |
| 39 | Configurar branch protection rules no GitHub | CI/CD | ALTO | P | 34 |
| 40 | Criar smoke test pos-deploy (Vercel Preview) | CI/CD | MEDIO | M | 34 |

---

#### TICKET 31: Criar package.json

**Contexto:** Projeto nao tem package.json. Deps via CDN sem versionamento.

**Escopo:**
```json
{
  "name": "tbo-os",
  "version": "2.2.0",
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "audit": "npm audit --production",
    "test": "echo 'No tests yet' && exit 0"
  },
  "devDependencies": {
    "eslint": "^9.0.0",
    "eslint-plugin-security": "^2.0.0",
    "prettier": "^3.0.0"
  }
}
```

**Criterios de aceite:**
- [ ] `npm install` completa sem erros
- [ ] `npm run lint` executa (pode ter warnings iniciais)
- [ ] .gitignore inclui node_modules/

**Impacto:** ALTO | **Esforco:** P | **Area:** CI/CD | **Versao:** v2.1

---

#### TICKET 34: GitHub Actions — lint + build

**Contexto:** Zero CI. Deploy direto para producao.

**Escopo:**
```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --production

  rls-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check RLS coverage
        run: node scripts/rls-audit.js
```

**Criterios de aceite:**
- [ ] PR sem lint pass nao pode ser merged
- [ ] Workflow roda em < 3 minutos
- [ ] Branch protection ativado no main

**Impacto:** ALTO | **Esforco:** M | **Area:** CI/CD | **Versao:** v2.1

---

#### TICKET 36: RLS Audit automatizado

**Contexto:** Sem forma automatica de verificar se novas tabelas tem RLS.

**Escopo:**
- Criar script `scripts/rls-audit.js`
- Conectar ao Supabase via service_role key (em CI secret)
- Query: `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false`
- Falhar CI se tabelas sem RLS encontradas (exceto whitelist)

**Criterios de aceite:**
- [ ] Script lista tabelas sem RLS
- [ ] CI falha se tabela nova sem RLS detectada
- [ ] Whitelist configuravel para tabelas intencionalmente sem RLS

**Impacto:** ALTO | **Esforco:** M | **Area:** CI/CD + RLS | **Versao:** v2.1

---

### Sprint 4: Cleanup v2.1 (Tickets 41-50)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 41 | Remover js/onboarding.js (dead code, 39.9 KB) | Cleanup | BAIXO | P | — |
| 42 | Remover js/novo-colaborador.js (dead code, 15 KB) | Cleanup | BAIXO | P | — |
| 43 | Remover js/convite.js (dead code, 16.1 KB) | Cleanup | BAIXO | P | — |
| 44 | Consolidar formatDate() em TBO_FORMATTER unico | Cleanup | MEDIO | P | — |
| 45 | Consolidar formatCurrency() em TBO_FORMATTER unico | Cleanup | MEDIO | P | — |
| 46 | Consolidar escapeHtml() em funcao global unica | Cleanup | MEDIO | P | — |
| 47 | Executar migration-v4-financeiro.sql no Supabase | Security | ALTO | P | — |
| 48 | Executar migration-v5-academy.sql no Supabase | Security | MEDIO | P | — |
| 49 | Auditar e remover console.log em producao | Cleanup | BAIXO | M | 32 |
| 50 | Adicionar XSS sanitizacao nos 26 modulos faltantes | Security | ALTO | G | 46 |

---

## FASE v2.2 — PERFORMANCE E PRODUTO (Tickets 51-75)

### Sprint 5: Performance Pos-Login (Tickets 51-60)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 51 | Implementar skeleton loading no shell da app | UX | ALTO | M | — |
| 52 | Lazy load de modulos pesados (>50KB) | Performance | ALTO | G | — |
| 53 | Minificar e concatenar JS (Vite/esbuild) | Performance | ALTO | G | 31 |
| 54 | Minificar e otimizar styles.css (267 KB) | Performance | MEDIO | M | — |
| 55 | Adicionar async/defer nos script tags | Performance | MEDIO | P | — |
| 56 | Implementar code splitting por rota | Performance | ALTO | G | 53 |
| 57 | Adicionar SRI hashes nos CDN scripts | Security | MEDIO | P | — |
| 58 | Cache de assets com versioning (hash no filename) | Performance | MEDIO | M | 53 |
| 59 | Eliminar flash de login definitivamente | UX | ALTO | M | 29 |
| 60 | Medir e reportar Time to Dashboard < 1s | Performance | ALTO | P | 51,52 |

---

#### TICKET 51: Skeleton loading

**Contexto:** App mostra tela branca ate todos 72 scripts parsearem.

**Escopo:**
- Renderizar shell da sidebar + header inline no HTML (sem JS)
- Adicionar skeleton placeholders para area de conteudo
- Skeleton desaparece quando modulo renderiza
- CSS inline no head (critical CSS)

**Criterios de aceite:**
- [ ] Skeleton visivel em < 500ms
- [ ] Sidebar e header renderizam antes de qualquer JS module
- [ ] Time to skeleton < 1s em 3G

**Impacto:** ALTO | **Esforco:** M | **Area:** UX | **Versao:** v2.2

---

#### TICKET 53: Build com Vite/esbuild

**Contexto:** 2.7 MB JS nao-minificado, 72 requests separados.

**Escopo:**
- Configurar Vite ou esbuild como bundler
- Entry point: app.js (importa dependencias)
- Output: main.js (minificado + tree-shaked)
- Code split: modulos pesados como chunks separados
- Target: ~1 MB initial load (60% reducao)
- Manter compatibilidade com Vercel deploy

**Criterios de aceite:**
- [ ] `npm run build` gera bundle otimizado
- [ ] Payload inicial < 1.2 MB
- [ ] Todas funcionalidades funcionam pos-bundle
- [ ] Source maps gerados para debug

**Impacto:** ALTO | **Esforco:** G | **Area:** Performance | **Versao:** v2.2

---

### Sprint 6: Observabilidade (Tickets 61-70)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 61 | Criar painel de status das integracoes | Observability | ALTO | M | — |
| 62 | Implementar health check endpoint /api/health | Observability | ALTO | P | — |
| 63 | Dashboard de sync_logs por integracao | Observability | MEDIO | M | — |
| 64 | Alertas de falha de sync (toast + email) | Observability | ALTO | M | 61 |
| 65 | Monitor de Edge Function errors | Observability | MEDIO | M | — |
| 66 | Health page por tenant (uptime, latencia, erros) | Observability | MEDIO | M | 62 |
| 67 | Deploy Edge Functions (4 de onboarding) | Integrations | ALTO | M | — |
| 68 | Deploy Edge Functions (daily-digest) | Integrations | MEDIO | M | — |
| 69 | Deploy Edge Functions (weekly-financial-report) | Integrations | MEDIO | M | — |
| 70 | Configurar pg_cron para syncs automaticos | Integrations | ALTO | M | 67 |

---

#### TICKET 61: Painel de status das integracoes

**Contexto:** Nao existe visibilidade sobre saude das integracoes.

**Escopo:**
- Criar modulo `integracoes-status` ou adicionar tab em `integracoes`
- Mostrar por integracao: status (ok/warning/error), ultimo sync, proxima sync, erros recentes
- Dados de sync_logs table
- Botao de retry manual
- Auto-refresh a cada 30s

**Criterios de aceite:**
- [ ] Status de cada integracao visivel em 1 tela
- [ ] Erro de sync mostra detalhes + botao retry
- [ ] Historico de syncs ultimas 24h
- [ ] Alertas visuais para erros nao-resolvidos

**Impacto:** ALTO | **Esforco:** M | **Area:** Observability | **Versao:** v2.2

---

### Sprint 7: Produto (Tickets 71-75)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 71 | Implementar retry automatico com backoff em integracoes | Integrations | MEDIO | M | — |
| 72 | Adicionar rate limiting consistente em todas integracoes | Integrations | MEDIO | P | — |
| 73 | Webhook receivers para Omie (real-time push) | Integrations | MEDIO | G | 67 |
| 74 | Webhook receivers para RD Station (deal updates) | Integrations | MEDIO | G | 67 |
| 75 | Encriptar tokens de integracao at-rest no Supabase | Security | ALTO | M | — |

---

## FASE v3.0 — ESCALA E GOVERNANCA AVANCADA (Tickets 76-100)

### Sprint 8: Governanca (Tickets 76-85)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 76 | Implementar ABAC (Attribute-Based Access Control) | RBAC | ALTO | G | 17 |
| 77 | Permissoes granulares por recurso (can_view/create/edit/delete) | RBAC | ALTO | G | 76 |
| 78 | UI de gestao de usuarios e roles (admin portal) | UX | ALTO | G | 76 |
| 79 | Convite de novos usuarios via email (self-service) | UX | MEDIO | M | 78 |
| 80 | Multi-workspace switching sem relogin | UX | MEDIO | M | — |
| 81 | Audit dashboard (visualizar audit_logs) | Observability | MEDIO | M | 16 |
| 82 | Export de audit_logs (CSV/PDF) | Compliance | MEDIO | M | 81 |
| 83 | Data retention policy (auto-cleanup de logs antigos) | Compliance | BAIXO | M | 16 |
| 84 | GDPR compliance (export/delete de dados pessoais) | Compliance | MEDIO | G | — |
| 85 | Two-factor authentication (2FA) via Supabase | Security | MEDIO | M | — |

---

#### TICKET 76: ABAC (Attribute-Based Access Control)

**Contexto:** RBAC atual e por role fixo. Nao suporta permissoes por projeto, BU, ou recurso especifico.

**Escopo:**
- Extender role_permissions para suportar atributos: `project_id`, `bu`, `resource_type`
- Criar RPC `check_permission(user_id, action, resource_type, resource_id)`
- Usar em RLS policies para filtro granular
- UI para configurar permissoes por recurso

**Criterios de aceite:**
- [ ] PO de BU "Branding" so ve projetos de Branding
- [ ] Artista ve apenas tarefas atribuidas a ele
- [ ] Financeiro ve dados financeiros de todos os projetos do tenant
- [ ] Founder ve tudo

**Impacto:** ALTO | **Esforco:** G | **Area:** RBAC | **Versao:** v3.0

---

### Sprint 9: Escala (Tickets 86-95)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 86 | Implementar E2E tests com Playwright | CI/CD | ALTO | G | 34 |
| 87 | Cobertura de testes > 60% em utils/ | CI/CD | ALTO | G | 31 |
| 88 | Smoke tests automaticos pos-deploy | CI/CD | ALTO | M | 86 |
| 89 | Implementar feature flags (por tenant) | UX | MEDIO | M | — |
| 90 | CDN proprio para assets estaticos | Performance | MEDIO | M | 53 |
| 91 | Service Worker para offline-first | Performance | MEDIO | G | 53 |
| 92 | PWA manifest e install prompt | UX | BAIXO | P | — |
| 93 | Internacionalizacao (i18n) base | UX | BAIXO | G | — |
| 94 | API versioning para Edge Functions | Integrations | MEDIO | M | 67 |
| 95 | Supabase Realtime subscriptions para updates live | Performance | ALTO | G | — |

---

### Sprint 10: Polish (Tickets 96-100)

| # | Titulo | Area | Impacto | Esforco | Deps |
|---|--------|------|---------|---------|------|
| 96 | Documentacao tecnica da arquitetura | Cleanup | MEDIO | M | — |
| 97 | Runbook de incidentes (playbook por cenario) | Observability | MEDIO | M | — |
| 98 | Security checklist para novas tabelas/modulos | Security | MEDIO | P | — |
| 99 | Onboarding de novos devs (setup guide) | Cleanup | BAIXO | M | — |
| 100 | Load testing com k6 (baseline de performance) | Performance | MEDIO | M | 53 |

---

## ROADMAP VISUAL

```
v2.1 (Estabilidade — 4-6 semanas)
├── Sprint 1: Seguranca Critica ......... Tickets 1-15   [BLOCKERS]
├── Sprint 2: RBAC Server-Side .......... Tickets 16-30
├── Sprint 3: CI/CD Base ................ Tickets 31-40
└── Sprint 4: Cleanup v2.1 .............. Tickets 41-50

v2.2 (Performance — 4-6 semanas)
├── Sprint 5: Performance Pos-Login ..... Tickets 51-60
├── Sprint 6: Observabilidade ........... Tickets 61-70
└── Sprint 7: Produto ................... Tickets 71-75

v3.0 (Escala — 6-8 semanas)
├── Sprint 8: Governanca ................ Tickets 76-85
├── Sprint 9: Escala .................... Tickets 86-95
└── Sprint 10: Polish ................... Tickets 96-100
```

---

## METRICAS DE ACEITE POR FASE

### v2.1 — Estabilidade
- [ ] 0 tabelas sem RLS (exceto whitelist documentada)
- [ ] 0 credenciais hardcoded no codigo
- [ ] 0 endpoints sem autenticacao
- [ ] 100% modulos com permission check interno
- [ ] CI/CD bloqueando merge sem lint + security pass
- [ ] audit_logs registrando login, CRUD, access_denied

### v2.2 — Performance
- [ ] Time to skeleton < 1s
- [ ] Time to essential data < 3s
- [ ] Payload inicial < 1.2 MB
- [ ] Dashboard de integracoes funcional
- [ ] Edge Functions deployadas
- [ ] pg_cron ativo

### v3.0 — Escala
- [ ] ABAC implementado e testado
- [ ] > 60% cobertura de testes
- [ ] E2E tests em CI
- [ ] Feature flags por tenant
- [ ] Audit dashboard funcional
- [ ] Load test baseline documentado

---

*Gerado em 2026-02-19. Atualizar conforme sprints avancem.*
