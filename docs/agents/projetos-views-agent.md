# Agente 8 — Projetos Multi-View Quality

## Escopo
Qualidade e consistência das 10 views de projetos.

## Inventário de Views

| View | Rota | Linhas | Status |
|------|------|--------|--------|
| Lista principal | /projetos | 335L | ✅ Funcional |
| Detalhe | /projetos/[id] | 276L | ✅ Funcional |
| Board (Kanban) | /projetos/board | 86L | ✅ Funcional |
| Lista tabular | /projetos/lista | 122L | ✅ Funcional |
| Calendário | /projetos/calendario | 301L | ✅ Funcional |
| Gantt | /projetos/gantt | 13L | ⚠️ Stub (delega) |
| Timeline | /projetos/timeline | 319L | ✅ Funcional |
| Portfolio | /projetos/portfolio | 252L | ✅ Funcional |
| Workload | /projetos/workload | 261L | ✅ Funcional |
| Fluxo 3D | /projetos/fluxo-3d | 375L | ✅ Funcional |
| Templates | /projetos/templates | 184L | ✅ Funcional |
| Decisões | /projetos/decisoes | 137L | ✅ Funcional |
| Arquivos | /projetos/arquivos | 13L | ⚠️ Stub (delega) |
| Configurações | /projetos/configuracoes | 156L | ✅ Funcional |

## Checklist por View

### Consistência Cross-View
```
□ Todas as views compartilham o mesmo data source (useProjects)?
□ Filtros são sincronizados entre views?
□ Mudança de view preserva filtros ativos?
□ Navegação entre views é fluida (sem reload)?
□ Ações rápidas (status, priority) disponíveis em todas views?
□ Search funciona consistentemente?
□ Empty state específico por view?
□ Loading skeleton específico por view?
```

### Board (Kanban)
```
□ D&D entre colunas funcional
□ Optimistic update no D&D
□ Quick-add card por coluna
□ Filtros inline
□ Collapse/expand colunas
□ WIP limits configuráveis
```

### Calendário
```
□ Navegação mês/semana/dia
□ D&D para reagendar
□ Criação por click em data
□ Cores por status/priority
□ Mini-preview no hover
```

### Gantt
```
□ Zoom (dia/semana/mês)
□ Dependencies visuais (setas)
□ Resize de barras (drag)
□ Baselines (comparação)
□ Critical path highlighting
□ Today line
```

### Timeline
```
□ Agrupamento por mês/trimestre
□ Filtros de período
□ Milestones destacados
□ Progress visual
```

### Portfolio
```
□ Cards com KPIs resumidos
□ Filtros por BU/status
□ Comparação entre projetos
□ Health indicators
```

### Workload
```
□ Visualização por pessoa
□ Capacidade vs alocação
□ Alerta de sobrecarga
□ Período configurável
```

## Output
Score de maturidade por view (0-10) + gaps de funcionalidade + sugestões de melhoria.
