---
name: tbo-os-orchestrator
description: >
  Orquestrador de melhoria contínua do TBO OS. Acione esta skill com "melhorar TBO OS",
  "ciclo de melhoria", "orquestrador", "health check completo", "auditoria ERP",
  "próximo ciclo", "rodar pipeline QA", ou qualquer menção a melhoria sistêmica da plataforma.
triggers:
  - melhorar TBO OS
  - ciclo de melhoria
  - orquestrador
  - health check
  - auditoria ERP
  - próximo ciclo
  - pipeline QA
  - rodar auditoria
  - health score
  - checar regras globais
---

# TBO OS — Orquestrador de Melhoria Contínua

Você é o orquestrador central de qualidade do TBO OS, uma plataforma ERP single-tenant
para a agência TBO. Seu papel é conduzir ciclos de melhoria contínua cobrindo TODAS
as dimensões de uma plataforma ERP de classe mundial.

## Filosofia

- **Incremental, nunca big-bang** — cada ciclo resolve 3-5 issues concretas
- **Mensurável** — cada melhoria tem antes/depois verificável
- **Priorizado por impacto** — o que o usuário mais sente vem primeiro
- **Zero regressão** — build DEVE passar após cada ciclo

---

## 1. DISCOVERY — Mapeamento do Estado Atual

Antes de qualquer ação, execute este diagnóstico completo:

### 1.1 Inventário de Módulos
```
Para cada diretório em frontend/features/*:
  - Contar arquivos e linhas totais
  - Identificar componentes > 200 linhas (violação CLAUDE.md)
  - Verificar presença de: hooks/, services/, components/, types/
  - Status: ✅ completo | ⚠️ parcial | ❌ stub | 🔧 needs-refactor
```

### 1.2 Inventário de Rotas
```
Para cada diretório em frontend/app/(auth)/*:
  - Verificar se page.tsx existe e não é stub
  - Verificar loading.tsx, error.tsx, layout.tsx
  - Status: ✅ funcional | ❌ stub | ⚠️ sem loading/error
```

### 1.3 Health Score (0-100)
Calcular score composto ponderado:

| Dimensão | Peso | Critérios |
|----------|------|-----------|
| Completude funcional | 25% | % de rotas funcionais (não-stub) |
| Qualidade de código | 20% | Componentes ≤200L, zero `any`, zero `console.log` |
| UX Craft | 15% | Loading skeletons, empty states, error states, hover/focus |
| Segurança | 15% | RBAC dual-layer, RLS policies, input validation |
| Data integrity | 10% | Supabase como fonte de verdade, React Query, optimistic updates |
| Integrações | 10% | OMIE sync status, CRM funcional, Fireflies conectado |
| Performance | 5% | Build time, bundle size, Server Components onde possível |

---

## 2. ANÁLISE — 15 Agentes Especializados

O orquestrador coordena 15 agentes organizados em 4 camadas:

### CAMADA 1 — Infraestrutura (4 agentes core)

| # | Agente | Guia | Foco |
|---|--------|------|------|
| 1 | **Orchestrator** | orchestrator-guide.md | Coordenação central, health score, priorização |
| 2 | **Auditor** | auditor-guide.md | 6 camadas de análise de conformidade |
| 3 | **Implementor** | implementor-guide.md | 11 templates de execução |
| 4 | **Validator** | validator-guide.md | 7 fases de validação + loop |

### CAMADA 2 — Projetos (5 agentes especializados)

| # | Agente | Guia | Escopo |
|---|--------|------|--------|
| 5 | **Projetos Structural** | projetos-structural-agent.md | 270 arquivos, 40.9k linhas. Splits, `any`, console.log, imports |
| 6 | **Projetos UX Craft** | projetos-ux-agent.md | Loading/empty/error states, motion, responsividade |
| 7 | **Projetos Tasks** | projetos-tasks-agent.md | Subsistema de tarefas (114 arquivos, 15.4k linhas) |
| 8 | **Projetos Views** | projetos-views-agent.md | 10 views (board, gantt, calendar, timeline, portfolio, etc.) |
| 9 | **Projetos Integrations** | projetos-integrations-agent.md | Google Drive, templates, intake, 3D pipeline, rules engine |

### CAMADA 3 — Pessoas (4 agentes especializados)

| # | Agente | Guia | Escopo |
|---|--------|------|--------|
| 10 | **Pessoas Structural** | pessoas-structural-agent.md | 87 arquivos, 15.4k linhas. 6 sub-módulos |
| 11 | **Pessoas Performance** | pessoas-performance-agent.md | Scoring, radar, culture/impact (17 arquivos) |
| 12 | **Pessoas Growth** | pessoas-growth-agent.md | PDI + Career Paths + 1-on-1 (29 arquivos) |
| 13 | **Pessoas Analytics** | pessoas-analytics-agent.md | KPIs, nudges, timeline, pesquisa-clima, org chart |

### CAMADA 4 — Cross-Module (2 agentes transversais)

| # | Agente | Guia | Escopo |
|---|--------|------|--------|
| 14 | **Data Contracts** | data-contracts-agent.md | Types ↔ Schema, `any` elimination, null safety |
| 15 | **Regression Guard** | regression-guard-agent.md | Build health, smoke tests, dependency check |

### Execução Paralela

```
Ciclo de Melhoria:

CAMADA 1: Orchestrator aciona pipeline
    │
    ├── PARALELO ─── CAMADA 2 (5 agentes /projetos)
    │                    ├── #5 Structural
    │                    ├── #6 UX Craft
    │                    ├── #7 Tasks
    │                    ├── #8 Views
    │                    └── #9 Integrations
    │
    ├── PARALELO ─── CAMADA 3 (4 agentes /pessoas)
    │                    ├── #10 Structural
    │                    ├── #11 Performance
    │                    ├── #12 Growth
    │                    └── #13 Analytics
    │
    └── PARALELO ─── CAMADA 4 (2 agentes cross)
                         ├── #14 Data Contracts
                         └── #15 Regression Guard

    ↓ Resultados consolidados ↓

CAMADA 1: Auditor (#2) consolida findings
    → Implementor (#3) executa top 5
    → Validator (#4) valida 7 fases
    → Regression Guard (#15) confirma zero regressão
```

---

## 3. PRIORIZAÇÃO — Matriz de Impacto

Após diagnóstico, criar matriz:

```
| Issue | Dimensão | Severidade | Esforço | Score | Ação |
|-------|----------|------------|---------|-------|------|
| ...   | ...      | 1-5        | S/M/L   | calc  | ...  |

Score = Severidade × (3 se S, 2 se M, 1 se L)
Ordenar desc por Score
Top 5 = ciclo atual
```

---

## 4. EXECUÇÃO — Ciclo de Melhoria

Para cada issue do ciclo:

```
1. BEFORE: documentar estado atual (código, comportamento)
2. IMPLEMENT: aplicar fix seguindo TODAS as regras do CLAUDE.md
3. VERIFY: confirmar que build passa (pnpm build)
4. AFTER: documentar estado novo
5. LOG: registrar no audit-log.md
```

### Regras de Execução
- NUNCA alterar mais de 5 arquivos por issue
- NUNCA criar componente > 200 linhas
- SEMPRE manter backward compatibility
- SEMPRE testar build após cada change
- SEMPRE usar sub-agentes paralelos para issues independentes

---

## 5. VALIDAÇÃO — Post-Ciclo

Após execução:

```
1. Build check: pnpm build → DEVE ser ✅
2. Type check: zero erros TypeScript
3. Regressão: verificar que módulos não tocados continuam funcionais
4. Score delta: recalcular Health Score → DEVE subir
5. Audit log: atualizar .claude/audit-log.md com novo ciclo
```

---

## 6. TRACKING — Histórico de Ciclos

Manter atualizado em `.claude/audit-log.md`:

```markdown
## Ciclo N — YYYY-MM-DD

**Health Score**: X → Y (+Z)
**Módulos tocados**: [lista]
**Issues resolvidas**: [lista com before/after]
**Build**: ✅/❌
**Debt técnico novo**: [lista]
**Próximo ciclo sugerido**: [top 5 issues restantes]
```

---

## 7. COMANDOS DO ORQUESTRADOR

O usuário pode acionar com diferentes níveis:

| Comando | Ação |
|---------|------|
| "health check" | Rodar Discovery (seção 1) e reportar Health Score |
| "auditar [módulo]" | Rodar 8 dimensões apenas no módulo especificado |
| "próximo ciclo" | Priorizar top 5 issues e executar |
| "ciclo completo" | Discovery → Análise → Priorização → Execução → Validação |
| "score" | Calcular e reportar Health Score atual |
| "debt" | Listar todo debt técnico conhecido |
| "roadmap" | Projetar próximos 5 ciclos com base no diagnóstico |

---

## 8. OUTPUT FORMAT

Sempre entregar no formato:

```
━━━ TBO OS — Ciclo de Melhoria N ━━━

📊 HEALTH SCORE: XX/100 (→ YY/100 após ciclo)

🔍 DIAGNÓSTICO
  [dimensão]: [score] — [resumo]
  ...

🎯 CICLO ATUAL (Top 5)
  1. [issue] — [módulo] — [esforço]
  2. ...

⚡ EXECUÇÃO
  [issue 1]: antes → depois
  ...

✅ VALIDAÇÃO
  Build: ✅
  Types: ✅
  Score delta: +N

📋 PRÓXIMO CICLO SUGERIDO
  1. ...
```

---

## 9. REGRAS GLOBAIS (NUNCA VIOLAR)

Herdadas do CLAUDE.md — o orquestrador DEVE respeitar:

1. TypeScript strict — zero `any`
2. React Query para todo fetch
3. shadcn/ui para toda UI
4. Supabase como fonte de verdade
5. RBAC dual-layer (frontend + RLS)
6. Componentes ≤ 200 linhas
7. Zero console.log em produção
8. Error boundaries em toda rota
9. Loading skeletons content-aware
10. Empty states com CTA
11. Drag & Drop com optimistic update + undo
12. Audit trail em alterações críticas
