# Agente 12 — Pessoas Growth (PDI + Career + 1-on-1)

## Escopo
Qualidade e integração dos 3 subsistemas de crescimento pessoal:
PDI (11 arquivos), Career Paths (11 arquivos), 1-on-1 (7 arquivos).

## PDI — Plano de Desenvolvimento Individual

### CRUD
```
Serviço: pdi.ts (352L)
Hook: use-pdi.ts (343L)

□ Create PDI com título, descrição, período ✅
□ Read PDI detail com goals ✅
□ Update PDI status/descrição ✅
□ Delete PDI com confirmação ✅
□ Goals CRUD completo (pdi-goal-form.tsx 231L) ✅
□ Goals reordering (D&D) ✅
□ Actions dentro de goals?
□ Progress tracking (% conclusão)?
□ Deadline alerts?
```

### Qualidade UX
```
□ Empty state quando sem PDIs → CTA "Criar PDI"?
□ Goal completion visual (progress bar)?
□ Overdue highlighting?
□ Filter por status (em andamento/concluído/atrasado)?
□ Timeline de evolução?
```

## Career Paths — Trilhas de Carreira

### Estrutura
```
Serviço: career-paths.ts (258L)
Hook: use-career-paths.ts (199L)
6 núcleos: Branding, Creative, Front-End, Back-End, Product, Operations

□ Grid de paths funcional (career-path-grid.tsx 84L) ✅
□ Ladder visualization (career-ladder.tsx 255L) ✅
□ Level detail (career-level-detail.tsx 104L) ✅
□ Set level dialog (set-career-level-dialog.tsx 359L) ✅
□ Scorecard (career-scorecard.tsx 161L) ✅
□ Person career section (person-career-section.tsx 187L) ✅
```

### Gaps Potenciais
```
□ Critérios de promoção definidos por nível?
□ Self-assessment vs manager assessment?
□ Histórico de progressão (timeline)?
□ Competency gap analysis (comparar score atual vs requerido)?
□ Integração com Performance scores?
□ Integração com PDI (goals sugeridos para próximo nível)?
```

## 1-on-1 — Reuniões Individuais

### CRUD
```
Serviço: one-on-ones.ts (245L)
Hook: use-one-on-ones.ts (268L)

□ Create 1-on-1 (one-on-one-form.tsx 207L) ✅
□ Schedule/reschedule ✅
□ Complete com notas ✅
□ Action items ✅
□ Delete com confirmação ✅
```

### Qualidade
```
□ Pauta sugerida baseada em:
  - Performance score recente?
  - PDI progress?
  - Career path next level?
  - Projetos em andamento?
□ Frequência tracking (nudge quando atrasado)?
□ Notes editor rich text?
□ Action items com follow-up?
□ Feedback bidirecional?
□ Integração com Fireflies (transcrição)?
```

## Cross-System Integration
```
Performance Score → PDI Goals Sugeridos → Career Level Assessment
         ↓                    ↓                       ↓
    1-on-1 Pauta      1-on-1 Follow-up         Promoção
         ↓                    ↓                       ↓
    People KPIs          Nudges              Timeline Event

□ Esses fluxos estão implementados?
□ Dados fluem entre módulos?
□ KPIs refletem saúde integrada?
```

## Output
Integration completeness map + feature gaps por subsistema + sugestões de fluxos cross-system.
