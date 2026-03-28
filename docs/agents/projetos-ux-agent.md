# Agente 6 — Projetos UX Craft

## Escopo
Qualidade de experiência do usuário em todas as views de /projetos e /tarefas.

## Dimensões Auditadas

### Loading States
```
□ Cada rota em app/(auth)/projetos/ tem loading.tsx?
□ Skeletons refletem layout real (não spinner genérico)?
□ Skeleton de tabela = linhas com cells do mesmo tamanho?
□ Skeleton de board = colunas com cards?
□ Skeleton de calendar = grid com blocos?
□ Skeleton de gantt = barras horizontais?
□ loading.tsx em projetos/ ✅ (40L) — verificar sub-rotas
```

### Empty States
```
□ Lista vazia de projetos → CTA "Criar primeiro projeto"?
□ Board sem cards → CTA contextual?
□ Calendar sem eventos → ilustração + CTA?
□ Gantt sem tarefas → orientação visual?
□ Timeline vazia → CTA?
□ Task list vazia → "Adicionar tarefa" inline?
□ Filtro sem resultados → "Limpar filtros" CTA?
```

### Error States
```
□ Cada rota tem error.tsx? ✅ (confirmado)
□ Mensagem útil (não stack trace)?
□ Botão retry presente?
□ Sugestão de próximo passo?
```

### Interatividade
```
□ Hover state em todos cards/rows (project-card, task-row)?
□ Focus ring styled (não browser default)?
□ Active/pressed state em botões?
□ Disabled state quando aplicável?
□ Feedback < 100ms em ações (create, update, delete)?
□ Toast 3-5s auto-dismiss?
□ Confirm dialog em ações destrutivas?
```

### Motion
```
□ Fade-in em transições loading → content?
□ Spring em drag & drop?
□ Stagger em listas (0.05s delay)?
□ Scale + fade em modais/drawers?
□ Motion tokens consistentes (fast/normal/slow)?
```

### Responsividade
```
□ Projetos page funciona em mobile?
□ Task detail sheet adaptável?
□ Board scrollável horizontal em mobile?
□ Filtros colapsáveis em mobile?
```

## Output
Audit UX com score por sub-dimensão (0-10) e lista de gaps específicos por rota.
