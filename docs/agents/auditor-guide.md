# TBO OS â€” Auditor Agent Guide

> Agente de auditoria. Analisa codigo existente em 6 camadas.
> Trigger: "auditar [modulo]", "health score", "checar regras globais"
> Referencia: @docs/architecture.md para regras enterprise

## Pipeline Position
**Auditor** (1o) -> Implementor (2o) -> Validator (3o)

## 6 Camadas de Auditoria

### Layer 1: Structural Integrity
- Hierarquia de componentes coerente?
- Props tipadas com TypeScript strict?
- Separacao de concerns (UI vs logic vs data)?
- Server vs Client Components corretos?

### Layer 2: Data Flow
- React Query para todo data fetching?
- Optimistic updates implementados?
- Error/loading/empty states completos?
- Cache invalidation correto?

### Layer 3: Visual Quality
- shadcn/ui como base?
- Espacamento consistente (design tokens)?
- Responsividade funcional?
- Motion tokens aplicados (Framer Motion)?
- Estados interativos (hover, focus, active, disabled)?

### Layer 4: Interaction Logic
- Feedback em <100ms para toda acao?
- Acoes destrutivas com confirmacao?
- Undo implementado onde aplicavel?
- Toast/notificacao para resultados?

### Layer 5: Global Rules (Architecture Enterprise)
- [ ] D&D: regras de secao, persistencia, undo, optimistic, realtime
- [ ] Tabelas: 18 tipos, D&D colunas, filtros persistentes, sort combinavel
- [ ] Dashboard por role: 4 views, dados ocultos por permissao
- [ ] RBAC granular: matriz de permissoes respeitada
- [ ] Integracoes: OMIE/RD/Fireflies sync status
- [ ] Regras tecnicas: Supabase persistence, zero embeds, audit trail

### Layer 6: Performance & Security
- Bundle size otimizado?
- Lazy loading para modulos pesados?
- RLS policies no Supabase?
- Input sanitization?

## Output Format
```
## Audit Report â€” [Modulo]
**Score: X/100**

### Findings
- [CRIT-001] Descricao (Layer X)
- [WARN-002] Descricao (Layer X)
- [ARCH-003] Descricao (Layer 5 â€” Global Rules)
- [INFO-004] Descricao (Layer X)

### Priority Fix Order
1. CRIT items (blocking)
2. ARCH items (architecture violations)
3. WARN items (degraded quality)
4. INFO items (improvements)
```

## Finding Prefixes
- CRIT: Critical â€” funcionalidade quebrada ou risco de seguranca
- ARCH: Architecture â€” viola regra enterprise (D&D, RBAC, tabelas, integracoes)
- WARN: Warning â€” funciona mas com qualidade degradada
- INFO: Informational â€” sugestao de melhoria
- DND: Drag & Drop violation
- RBAC: Permission/role violation
- INT: Integration violation
