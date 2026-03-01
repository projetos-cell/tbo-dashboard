# TBO OS â€” Validator Agent Guide

> Agente de validacao. Verifica se implementacoes atendem todos os requisitos.
> Trigger: "validar [modulo]", "checar implementacao", "validator run"
> Referencia: @docs/architecture.md para regras enterprise

## Pipeline Position
Auditor (1o) -> Implementor (2o) -> **Validator** (3o)

## 7 Fases de Validacao

### Phase 1: TypeScript Compliance
- [ ] Zero `any` types
- [ ] Strict mode enabled
- [ ] All props/params typed
- [ ] Return types explicit on exports

### Phase 2: Component Quality
- [ ] 3 states implemented (loading skeleton, error + retry, empty + CTA)
- [ ] shadcn/ui components used (not raw HTML)
- [ ] Responsive (mobile-first)
- [ ] Motion tokens applied (Framer Motion)
- [ ] Interactive states (hover, focus, active, disabled)

### Phase 3: Data Integrity
- [ ] React Query for all data fetching
- [ ] Optimistic updates on mutations
- [ ] Cache invalidation correct
- [ ] Zod validation on all inputs
- [ ] Error boundaries on routes

### Phase 4: Accessibility
- [ ] Keyboard navigable
- [ ] aria-labels on icons/buttons
- [ ] Focus management on modals
- [ ] Color contrast minimum 4.5:1

### Phase 5: Architecture Enterprise
- [ ] D&D: optimistic + rollback + undo + section rules + Supabase persist + realtime
- [ ] Tables: 18 types + column D&D + persistent filters + combinable sort
- [ ] RBAC: frontend RBACGuard + backend RLS + permission matrix match
- [ ] Dashboard: different widgets per role + hidden data (not just disabled)
- [ ] Integrations: sync status + error handling + retry + fallback UI
- [ ] Audit trail: critical changes logged (who, when, what, before/after)
- [ ] Zero embeds/iframes
- [ ] Supabase as single source of truth (no localStorage)

### Phase 6: Performance
- [ ] No unnecessary re-renders (React.memo/useMemo where needed)
- [ ] Lazy loading for heavy modules
- [ ] Images optimized (next/image)
- [ ] Bundle size reasonable

### Phase 7: Security
- [ ] RLS policies on all tables
- [ ] Input sanitization
- [ ] No secrets in client code
- [ ] RBAC enforced server-side

## Validation Output
```
## Validation Report â€” [Modulo]
**Status: PASS | FAIL | PARTIAL**

### Phase Results
| Phase | Status | Issues |
|-------|--------|--------|
| 1. TypeScript | PASS/FAIL | count |
| 2. Components | PASS/FAIL | count |
| 3. Data | PASS/FAIL | count |
| 4. Accessibility | PASS/FAIL | count |
| 5. Architecture | PASS/FAIL | count |
| 6. Performance | PASS/FAIL | count |
| 7. Security | PASS/FAIL | count |

### Blocking Issues (must fix)
- [item]

### Non-Blocking Issues (should fix)
- [item]
```

## Re-Implementation Loop
If Validator finds FAIL items:
1. Validator outputs blocking issues
2. Issues go back to Implementor with specific template reference
3. Implementor fixes
4. Validator re-runs ONLY failed phases
5. Loop until all phases PASS

## Anti-Patterns (Auto-Fail)
- localStorage as source of truth
- useEffect + useState for data fetching
- Frontend-only RBAC without RLS
- D&D without undo capability
- Tables without filter persistence
- Hardcoded role checks instead of RBACGuard
- Embeds/iframes for external content
- Missing audit trail on critical operations
