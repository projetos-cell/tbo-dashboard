---
name: qa-pipeline-executor
description: |
  Executes the complete QA audit pipeline for the TBO OS Next.js codebase.
  Use when the user mentions "run QA", "audit codebase", "quality check",
  "health score", "execute fixes", "qa pipeline", or "automated qa".
  Runs a 6-layer audit → prioritized fix implementation → 7-phase validation.
  Generates qa-report.md with health score tracking.
---

# QA Pipeline Executor — TBO OS

## Mission
Maintain and improve the TBO OS codebase health score through systematic,
automated quality audits and fix implementation. Target: 85+ health score.

## Current State Reference
- Read `docs/qa-report.md` for current health score and sprint plan
- Check execution log at `.antigravity/qa-execution-log.json` for history

## Execution Steps

### Phase 1 — Audit (6 Layers)
Scan all source files across the 7 module groups:

1. **TypeScript Compliance** — strict mode, no `any` types, proper interfaces
2. **Component Quality** — proper error boundaries, loading states, empty states
3. **Data Integrity** — Supabase queries with RLS, proper error handling
4. **Accessibility** — ARIA labels, keyboard navigation, contrast ratios
5. **Architecture** — module boundaries, import paths, dependency direction
6. **Performance & Security** — bundle size, auth checks, input validation

Module groups to scan:
- `src/modules/access-control/`
- `src/modules/cultura/`
- `src/modules/okrs/`
- `src/modules/oneone/`
- `src/modules/reconhecimentos/`
- `src/modules/projetos/`
- `src/modules/shared/`

### Phase 2 — Prioritize
Read the sprint plan from `docs/qa-report.md` and identify the current block:

1. **Bloco 1 — Desbloqueio** (+8-12 pts): Critical fixes that unblock other work
2. **Bloco 2 — Arquitetura** (+8-10 pts): Structural improvements
3. **Bloco 3 — Enterprise** (+8-10 pts): Production-readiness fixes

Execute the next uncompleted block in order.

### Phase 3 — Implement Fixes
Apply fixes following these rules:

- **Systemic fixes first** (affect multiple files) → then module-specific
- Use existing shared components: `RBACGuard`, `ErrorState`, `EmptyState`
- Run `npx tsc --noEmit` after each group of changes
- Run `npm run lint` to verify no new warnings
- Never modify `.env.local`, `.env`, or files containing secrets
- Preserve all existing functionality — fixes must not break features

### Phase 4 — Validate (7 Phases)
After implementing fixes:

1. TypeScript compilation check (`npx tsc --noEmit`)
2. Lint check (`npm run lint`)
3. Verify resolved findings no longer appear
4. Verify no new findings introduced
5. Verify shared component usage is correct
6. Update health score calculation
7. Generate diff summary

### Phase 5 — Report
Update `docs/qa-report.md` with:

- Health score delta (before → after)
- Files modified (count + list)
- Findings resolved (count + details)
- New findings discovered (if any)
- Next recommended block
- Mark completed items with ✅

Also append to `.antigravity/qa-execution-log.json`:
```json
{
  "timestamp": "<ISO-8601>",
  "score_before": <number>,
  "score_after": <number>,
  "files_modified": <number>,
  "findings_resolved": <number>,
  "block_executed": "<block name>",
  "next_block": "<block name>"
}
```

## Constraints

- Maximum 30 files modified per execution (prevents scope creep)
- Always create a new git branch: `qa-auto-YYYY-MM-DD-HHmm`
- Commit with conventional format: `chore(qa): <description of block>`
- If health score would decrease, STOP and report the issue
- If TypeScript compilation fails after fixes, revert the failing changes

## Decision Tree

- If score is below 60 → execute Bloco 1 (Desbloqueio)
- If score is 60-74 → execute Bloco 2 (Arquitetura)
- If score is 75-84 → execute Bloco 3 (Enterprise)
- If score is 85+ → run audit only, report findings, skip fixes
