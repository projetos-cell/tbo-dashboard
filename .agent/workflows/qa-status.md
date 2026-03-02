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
