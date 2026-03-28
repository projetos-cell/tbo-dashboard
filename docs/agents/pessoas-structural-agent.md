# Agente 10 — Pessoas Structural

## Escopo
Saúde estrutural do código em `frontend/features/people/`, `career-paths/`,
`one-on-ones/`, `pdi/`, `performance/`, `pesquisa-clima/`.

## Métricas Monitoradas
- Componentes > 200 linhas
- Uso de `any` (0 detectado — manter)
- `console.warn` em people.ts:206 (aceitável)
- Consistência de padrões entre 6 sub-módulos
- Hooks > 300 linhas
- Services > 400 linhas

## Arquivos Críticos (>300L)
| Arquivo | Módulo | Linhas | Ação |
|---------|--------|--------|------|
| pesquisa-clima/constants.ts | Clima | 621 | Dados puros — OK |
| pesquisa-clima/analysis.ts | Clima | 478 | Lógica pura — OK |
| people.ts (service) | People | 460 | Avaliar split list/detail/kpi |
| performance.ts (service) | Performance | 424 | Avaliar split scoring/queries |
| 1on1/page.tsx | Pessoas | 392 | Avaliar split list/detail/form |
| people-automations.ts | People | 385 | Lógica complexa — justificado |
| set-career-level-dialog.tsx | Career | 359 | Avaliar split dialog/form/confirm |
| pdi.ts (service) | PDI | 352 | Avaliar split goals/actions |
| use-pdi.ts (hook) | PDI | 343 | Avaliar split queries/mutations |
| performance-constants.ts | Performance | 334 | Dados puros — OK |
| one-on-one-detail.tsx | 1on1 | 322 | Avaliar split detail/actions/notes |
| use-people.ts (hook) | People | 303 | Avaliar split queries/filters |
| task-subtasks-section.tsx | Tasks | 300 | Avaliar split list/form |
| pesquisa-clima/historical | Clima | 291 | Dados puros — OK |

## Regra de Decisão para Split
```
SE arquivo > 300L E contém UI:
  → Avaliar split (podem ser sub-componentes lógicos)
SE arquivo > 300L E é dados puros (constants, historical):
  → OK — não precisa split
SE arquivo > 300L E é service:
  → Avaliar split por entidade (goals, actions, etc.)
SE arquivo > 300L E é hook:
  → Avaliar split queries vs mutations
```

## Consistência Cross-Módulo
```
□ Todos os 6 sub-módulos têm: components/, hooks/, services/?
□ Naming de hooks: use-[entity].ts (consistente)?
□ Naming de services: [entity].ts (consistente)?
□ Barrel exports (index.ts) em cada módulo?
□ Types definidos e exportados?
```

## Output
Lista priorizada de refactors + score de consistência (0-10) por sub-módulo.
