# Agente 13 — Pessoas Analytics & Insights

## Escopo
Qualidade dos sistemas analíticos: KPIs, Nudges, Timeline, Pesquisa de Clima,
Org Chart, Automations.

## KPIs (people-kpis-v2.tsx 184L)
```
□ Total de colaboradores (ativos, onboarding, at_risk)
□ Pending 1-on-1 count
□ PDI health (em dia vs atrasado)
□ Performance average
□ Turnover rate
□ Hiring pipeline
□ Engagement score (de pesquisa clima)

Verificar:
□ Dados são real-time (React Query)?
□ KPIs são clicáveis (drill-down)?
□ Comparação com período anterior?
□ Sparklines/trend indicators?
□ Loading skeleton específico?
```

## Nudges (people-nudges.tsx 173L)
```
□ "N pessoas sem 1-on-1 há X dias"
□ "N PDIs atrasados"
□ "N performance reviews pendentes"
□ "N onboardings em andamento"
□ Nudges acionáveis (click → ação)?
□ Dismiss/snooze funcional?
□ Priorização por criticidade?
□ Personalização por role (founder vs líder)?
```

## Timeline (people-timeline.tsx 235L)
```
□ Eventos: onboarding, promoção, saída, PDI, 1-on-1, award
□ Filtro por tipo de evento
□ Filtro por período
□ Agrupamento por mês
□ Visual tipo feed (ícone + texto + data)
□ Click → detalhe do evento
□ Empty state quando sem eventos no período
```

## Pesquisa de Clima (3 arquivos, 1.39k linhas)
```
constants.ts (621L): 8 seções, 48 questões (Likert + NPS + multi-select)
analysis.ts (478L): compute, report, trend, segmentação
historical-data.ts (291L): 4 edições históricas

□ Formulário de resposta funcional?
□ Análise automática pós-coleta?
□ Dashboard de resultados?
□ Segmentação por departamento/nível?
□ Trend analysis (comparação edições)?
□ NPS calculation correto?
□ Anonimização de respostas?
□ Export de relatório?
□ Rota /pessoas/clima existe?
```

## Org Chart (org-chart.tsx 246L + org-tree-node.tsx 129L)
```
□ Renderização recursiva da árvore ✅
□ Search por nome/cargo ✅
□ Zoom in/out ✅
□ Expand/collapse nodes ✅
□ Click → person detail?
□ Drag to reorganize?
□ Print/export?
□ Departamento highlighting?
```

## Automations (people-automations.ts 385L)
```
□ Auto-create 1-on-1 quando onboarding?
□ Auto-create PDI quando avaliação baixa?
□ Auto-nudge quando 1-on-1 atrasado?
□ Auto-alert quando performance cai?
□ Configurável por admin?
□ Log de execução?
□ Enable/disable individual?
```

## People Snapshot (people-snapshot.ts 175L)
```
□ PDI health score calculado corretamente?
□ 1-on-1 frequency score?
□ Performance score?
□ Priority score (composição)?
□ Snapshot atualizado real-time?
```

## Output
Analytics completeness matrix + scoring accuracy + data freshness assessment.
