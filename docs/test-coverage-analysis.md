# Analise de Cobertura de Testes - TBO OS

**Data:** 2026-03-18
**Status atual:** 7 arquivos de teste unitario, 2 E2E | 243 test cases passando

---

## Panorama Atual

### O que existe

| Categoria | Arquivos | Cases | Modulo |
|-----------|----------|-------|--------|
| Unit - Finance KPIs | 1 | 18 | financeiro |
| Unit - Finance Cashflow | 1 | 29 | financeiro |
| Unit - Finance Aging | 1 | 14 | financeiro |
| Unit - Finance Schemas | 1 | 28 | financeiro |
| Unit - OMIE Sync Helpers | 1 | 26 | financeiro |
| Unit - OMIE Lookups | 1 | 114 | sync-omie API |
| Unit - OMIE Shared | 1 | 14 | sync-omie API |
| E2E - Navigation | 1 | 28 | global |
| E2E - Smoke | 1 | 4 | login |
| **Total** | **9** | **243** | |

### Gap quantitativo

- **1.187 arquivos fonte** no projeto
- **29 feature modules** — apenas **1** (financeiro) possui testes unitarios
- **0 testes de componentes React** (nenhum React Testing Library)
- **0 testes de hooks customizados** (43 hooks sem teste)
- **0 testes de servicos** (exceto financeiro)
- **0 testes de RBAC/permissions** (sistema critico sem cobertura)
- **0 testes de integracoes** (ClickSign, RD Station, Fireflies)

---

## Areas Prioritarias para Melhorar Cobertura

### P0 — Critico (seguranca e integridade de dados)

#### 1. Auth & RBAC (`features/auth/`, `lib/permissions.ts`, `components/shared/rbac-guard.tsx`)
**Por que:** Sistema de permissoes dual-layer e o alicerce de seguranca. Um bug aqui expoe dados financeiros ou administrativos para roles sem acesso.

**O que testar:**
- `lib/permissions.ts` — hierarquia de roles (founder > diretoria > lider > colaborador), `isSuperAdmin()`, `getModulesForRole()`
- `features/auth/services/auth.ts` — `fetchUserRole()`, resolucao de tenant, super-admin override
- `RBACGuard` component — renderiza/oculta conteudo por role, comportamento com roles invalidos
- Matriz de permissao: cada combinacao role × modulo

**Estimativa:** ~60-80 test cases

#### 2. API Routes de Sync (`app/api/finance/sync-omie/`, `app/api/comercial/sync-rd/`)
**Por que:** Sync com ERPs externos e a ponte entre dados financeiros reais e o dashboard. Falhas silenciosas = dados errados = decisoes erradas.

**O que testar:**
- `route.ts` — orquestracao completa, tratamento de timeout, retry logic
- `_sync-entities.ts` — sync de vendors, clients, accounts com edge cases (duplicatas, dados parciais)
- `_sync-transactions.ts` — contas a pagar/receber, reconciliacao
- RD Station sync — mapeamento de stages, tratamento de leads sem dados obrigatorios

**Estimativa:** ~40-60 test cases

#### 3. Supabase Middleware (`lib/supabase/middleware.ts`)
**Por que:** Controla autenticacao em todas as rotas. Falha aqui = acesso nao-autenticado.

**O que testar:**
- Redirecionamento para login quando nao autenticado
- Refresh de sessao
- Protecao de rotas publicas vs autenticadas

**Estimativa:** ~15-20 test cases

---

### P1 — Alto impacto (funcionalidades core do produto)

#### 4. Projects & Tasks (`features/projects/`, `features/tasks/`)
**Por que:** 175 arquivos combinados — e o core do produto. Logica de custom fields, status transitions e hierarquia de tarefas precisa de cobertura.

**O que testar:**
- Services de CRUD (create/update/delete projetos e tarefas)
- Custom fields — validacao dos 18 tipos de propriedade
- Status transitions (regras de secao ao mover via D&D)
- Hooks: `use-projects.ts`, `use-tasks.ts` — queries, mutations, optimistic updates
- Schemas Zod de validacao de inputs

**Estimativa:** ~80-120 test cases

#### 5. Chat System (`features/chat/`)
**Por que:** 85 arquivos, sistema real-time complexo. Bugs aqui afetam comunicacao interna.

**O que testar:**
- Services: envio/recepcao de mensagens, threads, reactions
- Hooks: `use-chat.ts`, real-time subscriptions
- Store Zustand: state mutations, selectors
- Formatacao de mensagens, sanitizacao de HTML

**Estimativa:** ~50-70 test cases

#### 6. Contratos & ClickSign (`features/contratos/`, `services/clicksign/`)
**Por que:** Integracao juridica critica. Erro aqui = contrato nao enviado/assinado.

**O que testar:**
- `services/clicksign/` — client, documents, envelopes, signers, webhooks
- Webhook handler — processamento de eventos de assinatura
- Estado do contrato (draft → sent → signed → cancelled)
- Error handling e retry logic

**Estimativa:** ~40-50 test cases

---

### P2 — Medio impacto (qualidade e confiabilidade)

#### 7. Hooks Compartilhados (`hooks/`)
**Por que:** 43 hooks usados em multiplos modulos. Bug em hook compartilhado cascata para todo o app.

**O que testar (prioridade):**
- `use-undo-stack.ts` — push, pop, undo/redo, limite de stack
- `use-data-table.ts` — sorting, filtering, pagination state
- `use-debounce.tsx` — timing correto
- `use-roles.ts` / `use-permissions.ts` — resolucao de roles
- `use-kanban.ts` — drag handlers, reordering logic

**Estimativa:** ~40-50 test cases

#### 8. Comercial/Pipeline (`features/comercial/`)
**Por que:** 31 arquivos, pipeline de vendas com integracao RD Station.

**O que testar:**
- Services de pipeline (deal stages, conversoes)
- Mapeamento RD Station → modelo interno
- Calculos de metricas (conversion rate, deal velocity)
- Schemas de validacao

**Estimativa:** ~30-40 test cases

#### 9. OKRs (`features/okrs/`)
**Por que:** Modulo estrategico. Calculos de progresso, alinhamento e check-ins precisam estar corretos.

**O que testar:**
- Calculo de progresso de key results
- Alinhamento OKR (company → team → individual)
- Ciclos e periodos
- Check-in validation

**Estimativa:** ~25-35 test cases

#### 10. People & Performance (`features/people/`, `features/performance/`)
**Por que:** Dados de colaboradores, avaliacoes, PDI — sensivel e complexo.

**O que testar:**
- Services de people (org chart, team hierarchy)
- Performance scoring e calculos
- PDI milestones e progresso
- 1:1 tracking

**Estimativa:** ~30-40 test cases

---

### P3 — Infraestrutura de testes (melhorias estruturais)

#### 11. Configurar Coverage Report
```ts
// vitest.config.ts
coverage: {
  provider: 'v8',
  reporter: ['text', 'html', 'lcov'],
  exclude: ['node_modules/', '**/*.d.ts', '**/*.config.*'],
  thresholds: {
    statements: 30, // comecar baixo, subir gradualmente
    branches: 25,
    functions: 30,
    lines: 30,
  }
}
```

#### 12. Adicionar React Testing Library
```bash
pnpm add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```
Update `vitest.config.ts`:
```ts
environment: 'jsdom', // para testes de componentes
```

#### 13. Criar Test Factories
Usar `@faker-js/faker` (ja instalado) para criar factories de dados:
```ts
// __tests__/factories/user.factory.ts
export const createUser = (overrides?: Partial<User>): User => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  role: 'colaborador',
  ...overrides,
})
```

#### 14. Adicionar Testes no CI
- Adicionar `pnpm test` no pre-push hook (`.husky/pre-push`)
- Configurar coverage threshold no CI para bloquear PRs abaixo do minimo

---

## Roadmap Sugerido

| Sprint | Foco | Test Cases Estimados |
|--------|------|---------------------|
| 1 | P0: Auth/RBAC + Coverage Config + React Testing Library setup | ~80 |
| 2 | P0: API Sync Routes + Middleware | ~60 |
| 3 | P1: Projects & Tasks (services + schemas) | ~80 |
| 4 | P1: Chat + Contratos/ClickSign | ~80 |
| 5 | P2: Hooks + Comercial + OKRs | ~80 |
| 6 | P2: People/Performance + Test Factories | ~50 |

**Meta:** sair de 243 para ~650+ test cases, cobrindo todos os modulos criticos.

---

## Resumo Executivo

O codebase tem **boa cobertura do modulo financeiro** (o unico testado), mas **96% dos feature modules estao sem nenhum teste**. Os gaps mais criticos estao em:

1. **Auth/RBAC** — zero testes para o sistema de permissoes que protege todo o app
2. **Integracoes externas** — OMIE sync route, ClickSign, RD Station sem testes de integracao
3. **Componentes React** — nenhum teste de componente em todo o projeto
4. **Hooks compartilhados** — 43 hooks sem cobertura

A recomendacao e comecar pela infraestrutura (coverage config + React Testing Library) e pelos modulos P0 (auth/RBAC), onde o risco de regressao e maior.
