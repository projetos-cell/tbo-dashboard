# Agente 11 — Pessoas Performance & Scoring

## Escopo
Qualidade e completude do subsistema de avaliação de performance
(17 arquivos, 2.8k linhas).

## Features Auditadas

### Skill Scoring
```
Serviço: performance.ts (424L)
Hook: use-performance.ts (184L)
Form: skill-score-form.tsx (221L)

□ Rubric de avaliação por skill definida?
□ Scoring 1-5 com descritores?
□ Multi-avaliador (self + manager + peer)?
□ Histórico de scores por período?
□ Radar chart funcional (skill-radar.tsx)?
□ Comparison view (período anterior)?
```

### Culture Metrics
```
Componentes: culture-breakdown.tsx (169L), culture-compute-dialog.tsx (129L),
             culture-metric-card.tsx (79L)

□ Métricas de cultura definidas?
□ Cálculo transparente (dialog explica fórmula)?
□ Breakdown visual por dimensão?
□ Input de dados funcional?
□ Trend ao longo do tempo?
```

### Impact Metrics
```
Componentes: impact-breakdown.tsx (171L), impact-compute-dialog.tsx (138L),
             impact-metric-card.tsx (83L)

□ Métricas de impacto definidas?
□ Cálculo transparente?
□ Breakdown visual?
□ Relação com OKRs/projetos?
□ Evidências anexáveis?
```

### Performance Table
```
Componente: performance-table.tsx (212L)

□ Sortable por score?
□ Filtros por área/nível/período?
□ Inline score entry?
□ Export para CSV/PDF?
□ Bulk scoring?
```

### Individual Scorecard
```
Componente: score-individual-sheet.tsx (256L)

□ Score composto (skills + culture + impact)?
□ Radar chart com todas dimensões?
□ Histórico de evolução?
□ Comparação com média da equipe?
□ Recomendações automáticas (PDI)?
□ Print/export individual?
```

### Integration Points
```
□ Score de performance alimenta:
  - PDI (sugestão de goals)?
  - Career Path (critério de promoção)?
  - 1-on-1 (pauta sugerida)?
  - People KPIs (nudges)?
  - Dashboard founder (overview)?
```

## Output
Feature completeness matrix + scoring accuracy assessment + integration gaps.
