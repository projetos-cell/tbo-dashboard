# Cultura — Melhoria Contínua 2026-03-13

## Diagnóstico

**12 páginas analisadas** (page.tsx, rituais, reconhecimentos, recompensas, pilares, valores, políticas, políticas/[slug], documentos, manual, analytics, layout)

**Problemas encontrados: 5** (P0: 2, P2: 3)

| Página | Problema | Prioridade |
|--------|----------|-----------|
| `manual/page.tsx` | Delete nunca acionado — handler existe, zero trigger na lista | P0 |
| `recognition-kpi-section.tsx` | avgPerPerson sem `.toFixed(1)` — exibe floats crú | P0 |
| `reconhecimentos/page.tsx` | Tab Pendentes com 0 itens usa div simples em vez de EmptyState | P2 |
| `documentos/page.tsx` | Sem DnD (todos os módulos CRUD devem ter reordenação) | P2 |
| `manual/page.tsx` | Sem DnD (capítulos ordenados, DnD essencial) | P2 |

## Implementado nesta rodada

1. **recognition-kpi-section.tsx** — avgPerPerson: `?? 0` → `.toFixed(1)` (evita `1.3333...`)
2. **reconhecimentos/page.tsx** — tab Pendentes vazia: div simples → EmptyState com ícone/CTA
3. **manual/page.tsx** — DELETE RESTAURADO + DnD + edit/delete via dropdown na lista
   - Adicionado SortableManualItem: grip handle + dropdown (Visualizar/Editar/Excluir)
   - useReorderCulturaItems("manual") + DndContext + SortableContext + undo Ctrl+Z
4. **documentos/page.tsx** — DnD adicionado (padrão consistente com pilares/valores)
   - SortableCard wrapper + useReorderCulturaItems("documento") + undo Ctrl+Z

## Próximas prioridades

1. [P2] Cast frágil de peopleList em reconhecimentos/page.tsx (linhas 68-73)
2. [P2] recompensas-meus-resgates.tsx — cast desnecessário `(r as Record<string, unknown>).notes`
3. [P3] analytics/page.tsx — sem back button para /cultura
4. [P3] Pre-existing: fix ícones errados em comercial/error, diretoria, inteligencia, sonner

## Build status: ✅ (type-check limpo para módulo Cultura; erros pre-existentes em outros módulos)
