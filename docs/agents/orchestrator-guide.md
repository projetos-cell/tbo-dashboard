# TBO OS — Orchestrator Guide

## Visão Geral

O Orquestrador é o agente central de melhoria contínua do TBO OS.
Ele coordena 8 sub-agentes especializados que auditam diferentes dimensões
da plataforma, prioriza issues por impacto, executa correções e valida resultados.

## Pipeline

```
Discovery → Análise (8 sub-agentes) → Priorização → Execução → Validação → Log
```

## Sub-agentes

| # | Nome | Foco | Peso no Score |
|---|------|------|---------------|
| 1 | Structural | Arquitetura, tamanho de componentes, tipos | 20% |
| 2 | Functional | Completude de features, stubs, CRUD | 25% |
| 3 | UX Craft | Loading/empty/error states, motion, a11y | 15% |
| 4 | Security | RBAC, RLS, input validation, audit trail | 15% |
| 5 | Data Integrity | React Query, Supabase, types, migrations | 10% |
| 6 | Integrations | OMIE, CRM, Fireflies, sync health | 10% |
| 7 | DX | Developer experience, consistência, docs | 3% |
| 8 | Performance | Server Components, bundle, queries, cache | 2% |

## Regras de Operação

1. **Máximo 5 issues por ciclo** — foco > volume
2. **Build DEVE passar** após cada ciclo
3. **Score DEVE subir** (ou manter) — nunca regredir
4. **Audit log obrigatório** — todo ciclo registrado
5. **Sub-agentes rodam em paralelo** quando possível
6. **Backward compatibility** — nunca quebrar o que funciona

## Triggers

- "melhorar TBO OS" / "ciclo de melhoria" / "orquestrador"
- "health check" / "health score" / "score"
- "auditoria ERP" / "auditar [módulo]"
- "próximo ciclo" / "pipeline QA"
- "debt" / "roadmap"

## Referências

- Skill completa: `.claude/skills/tbo-os-orchestrator.md`
- Regras globais: `CLAUDE.md`
- Rules por domínio: `.claude/rules/`
- Audit log: `.claude/audit-log.md`
