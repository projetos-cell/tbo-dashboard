# Agente 5 — Projetos Structural

## Escopo
Saúde estrutural do código em `frontend/features/projects/` e `frontend/features/tasks/`.

## Métricas Monitoradas
- Componentes > 200 linhas (split candidates)
- Uso de `any` (4 ocorrências conhecidas em services/)
- `console.log`/`console.error` em produção (2 em google-drive.ts)
- Imports circulares entre projects ↔ tasks
- Hooks > 300 linhas (use-projects.ts 337L, use-my-tasks.ts 409L, use-task-mutations.ts 334L)
- Services > 400 linhas (project-templates.ts 400L)
- Duplicação de lógica entre compact-list e task-list

## Arquivos Críticos (>300L)
| Arquivo | Linhas | Ação |
|---------|--------|------|
| project-details-dialog.tsx | 528 | Avaliar split form/actions |
| property-editor.tsx | 499 | Avaliar split por tipo de propriedade |
| project-dashboard.tsx | 462 | Avaliar split por widget |
| project-intake.tsx | 427 | Avaliar split form/preview |
| use-my-tasks.ts | 409 | Avaliar split queries/mutations |
| project-templates.ts | 400 | Avaliar split templates/builder |
| project-board.tsx | 373 | Avaliar split board/column |
| gantt-task-list.tsx | 370 | Avaliar split list/row |
| project-tasks-toolbar.tsx | 367 | Avaliar split filters/actions |
| d3d-stage-card.tsx | 360 | Avaliar split card/gates |
| task-context-menu.tsx | 351 | Avaliar split por grupo de ações |
| task-history-timeline.tsx | 346 | Avaliar split timeline/entry |
| use-task-mutations.ts | 334 | Avaliar split por entity |

## Checklist por Ciclo
```
□ Grep `any` em features/projects/ e features/tasks/
□ Grep `console.` em features/projects/ e features/tasks/
□ Find arquivos > 200 linhas → avaliar necessidade de split
□ Verificar barrel exports (index.ts) consistentes
□ Verificar naming: kebab-case arquivos, camelCase funções
□ Verificar imports: sem circulares, sem deep imports
```

## Output
Lista priorizada de refactors com: arquivo, linhas, tipo de split, esforço (S/M/L).
