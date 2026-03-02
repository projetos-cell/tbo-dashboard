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
