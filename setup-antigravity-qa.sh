#!/bin/bash
# ============================================================
# TBO OS — Antigravity QA Automation Setup
# ============================================================
# Run this script from the ROOT of the TBO OS project.
# It creates the .antigravity/ structure with skills and workflows.
#
# Usage:
#   cd /path/to/tbo-os
#   bash setup-antigravity-qa.sh
# ============================================================

set -e

echo "🚀 Setting up Antigravity QA Automation for TBO OS..."
echo ""

# ---- Detect project root ----
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found."
  echo "   Run this script from the TBO OS project root."
  exit 1
fi

PROJECT_NAME=$(node -e "console.log(require('./package.json').name || 'unknown')" 2>/dev/null || echo "unknown")
echo "📁 Project detected: $PROJECT_NAME"
echo ""

# ---- Create directory structure ----
echo "📂 Creating .antigravity/ structure..."

mkdir -p .antigravity/skills/qa-pipeline-executor/scripts
mkdir -p .antigravity/workflows
mkdir -p .antigravity/rules

echo "   ✅ .antigravity/skills/qa-pipeline-executor/"
echo "   ✅ .antigravity/workflows/"
echo "   ✅ .antigravity/rules/"
echo ""

# ---- Copy SKILL.md ----
cat > .antigravity/skills/qa-pipeline-executor/SKILL.md << 'SKILL_EOF'
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
SKILL_EOF

echo "📝 SKILL.md written"

# ---- Copy qa-scheduled workflow ----
cat > .antigravity/workflows/qa-scheduled.md << 'WORKFLOW1_EOF'
---
description: |
  Scheduled QA execution workflow. Runs full audit pipeline, implements
  prioritized fixes, commits results, and updates the QA report.
  Trigger manually with /qa-scheduled or configure with external scheduler.
---

1. **Load Current State**
   - Read `docs/qa-report.md` to get current health score and sprint plan
   - Read `.antigravity/qa-execution-log.json` for execution history
   - Note the current git branch and ensure working tree is clean

2. **Create QA Branch**
   - Create and checkout new branch: `qa-auto-YYYY-MM-DD-HHmm`
   - Base from `main` or `develop` (whichever is the default)
   // turbo

3. **Execute QA Pipeline**
   - Invoke the `qa-pipeline-executor` skill
   - Let the skill determine which block to execute based on current score
   - Monitor for any errors during execution

4. **Run Validation Suite**
   - Execute `npx tsc --noEmit` — must pass with zero errors
   - Execute `npm run lint` — no new warnings allowed
   - If either fails, revert changes and report the failure
   // turbo

5. **Commit and Push**
   - Stage all modified files
   - Commit: `chore(qa): automated fixes from [block name] — score X→Y`
   - Push branch to remote
   // turbo

6. **Generate Summary Report**
   - Update `docs/qa-report.md` with execution results
   - Log execution to `.antigravity/qa-execution-log.json`
   - Display summary: score delta, files changed, findings resolved
   - Recommend next action (continue fixing, review PR, or pause)
WORKFLOW1_EOF

echo "📝 qa-scheduled.md written"

# ---- Copy qa-status workflow ----
cat > .antigravity/workflows/qa-status.md << 'WORKFLOW2_EOF'
---
description: |
  Check the status of QA executions and review current health score.
  Shows execution history, score trend, and pending fixes.
  Trigger with /qa-status.
---

1. **Read Execution History**
   - Parse `.antigravity/qa-execution-log.json`
   - Display last 5 executions with: timestamp, score delta, block executed
   - Highlight any failed or reverted executions

2. **Show Current Health Score**
   - Read `docs/qa-report.md` for latest score
   - Calculate trend: improving, stable, or declining
   - Show score breakdown by audit layer

3. **List Pending Fixes**
   - Parse `docs/qa-report.md` for unchecked items (no ✅)
   - Group by block (Desbloqueio / Arquitetura / Enterprise)
   - Group by severity (CRIT → ARCH → WARN → INFO)
   - Show count per group

4. **Estimate Completion**
   - Based on average fixes per execution from history
   - Estimate remaining executions to reach 85+ score
   - Recommend next execution timing

5. **Display Summary**
   - Format as a concise dashboard view
   - Include: current score, target (85+), gap, estimated runs remaining
   - Flag any blockers or recurring issues
WORKFLOW2_EOF

echo "📝 qa-status.md written"

# ---- Initialize execution log ----
echo "[]" > .antigravity/qa-execution-log.json
echo "📝 qa-execution-log.json initialized"

# ---- Create .gitignore entry (if not already ignored) ----
if [ -f ".gitignore" ]; then
  if ! grep -q "qa-execution-log.json" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo "# Antigravity QA execution logs (local state)" >> .gitignore
    echo ".antigravity/qa-execution-log.json" >> .gitignore
    echo "📝 Added qa-execution-log.json to .gitignore"
  fi
fi

echo ""
echo "============================================================"
echo "✅ Setup complete!"
echo ""
echo "Directory structure created:"
echo ""
echo "  .antigravity/"
echo "  ├── skills/"
echo "  │   └── qa-pipeline-executor/"
echo "  │       └── SKILL.md"
echo "  ├── workflows/"
echo "  │   ├── qa-scheduled.md"
echo "  │   └── qa-status.md"
echo "  ├── rules/"
echo "  └── qa-execution-log.json"
echo ""
echo "Next steps in Antigravity:"
echo "  1. Open this workspace in Antigravity (+ Open Workspace)"
echo "  2. Type: /qa-status   → check current state"
echo "  3. Type: /qa-scheduled → run first QA execution"
echo "  4. Review the generated branch and PR"
echo "============================================================"
