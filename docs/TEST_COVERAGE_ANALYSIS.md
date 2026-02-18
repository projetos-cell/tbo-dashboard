# Test Coverage Analysis - TBO Dashboard

## Current State

**Test coverage: 0%.** The codebase has no automated tests, no test framework, no `package.json`, and no CI/CD pipeline. All 34 source files (~32,500 lines of JavaScript) are completely untested.

---

## Priority Matrix

The recommendations below are ranked by **business impact x bug likelihood**. Financial calculations and state machine logic are highest priority because errors there have direct monetary or operational consequences.

---

## Priority 1 (Critical) -- Financial & KPI Calculations

These functions perform monetary math that drives business decisions. A single bug here could cause incorrect reporting to stakeholders.

### `modules/inteligencia.js` -- Business Intelligence KPIs

| Function / Line | Issue | Recommended Test |
|-----------------|-------|------------------|
| `_computeAll()` L97 -- Avg projects/client | `counts.reduce() / counts.length` with no empty-array guard | Test with 0 clients |
| `_computeAll()` L108 -- Avg repeat factor | Same empty-array divide-by-zero pattern | Test with 0 repeat clients |
| `_computeAll()` L113 -- LTV calculation | `currentTicket * avgRepeatFactor * (1 / (churnRate/100))` -- approaches infinity as churn approaches 0 | Test with churnRate=0, churnRate=0.01, churnRate=100 |
| `_computeAll()` L121-122 -- CAC & LTV:CAC | Divides by `newClientsPerYear` (defaults to 1, not 0, but still inaccurate); LTV:CAC divides by CAC with no zero guard | Test with 0 new clients, 0 marketing spend |
| `_computeAll()` L152 -- Proposal growth % | `(proposals25 - proposals24) / proposals24 * 100` -- no guard if proposals24=0 | Test with zero 2024 proposals |
| `_computeAll()` L205-207 -- Runway | Complex burn-rate / saldo logic | Test with negative saldo, zero burn rate |

### `modules/financeiro.js` -- Financial Module

| Function / Line | Issue | Recommended Test |
|-----------------|-------|------------------|
| `render()` L372 -- Staff cost % | `(p.salario / (total_anual / 12)) * 100` -- divide-by-zero if `total_anual=0` | Test with zero annual personnel cost |
| `render()` L47-50 -- Annual totals | `Object.values(recMensal).reduce()` on potentially empty object | Test with empty revenue/expense objects |
| `render()` L216 -- Accounts receivable | Hard-coded to 5 month names; ignores other months | Test with months outside the hard-coded list |

### `utils/workload.js` -- Cost & Capacity Engine

| Function / Line | Issue | Recommended Test |
|-----------------|-------|------------------|
| `getUserHourlyRate()` L477-501 | `(salario * 1.7) / (weeklyHours * 4.33)` -- magic numbers, divide-by-zero if weeklyHours=0 | Test with 0 weekly hours, missing salary data |
| `getProjectCostMetrics()` L518-548 | `varianceCost / plannedCost` -- no guard when plannedCost=0 | Test with zero planned cost |
| `getWeeklyUtilization()` L423-460 | `tracked / capacityMinutes` -- returns 0% when capacity=0 instead of flagging error; dual owner-matching (ID then name substring) | Test with 0 capacity, name collisions |
| `getForecast()` L554-607 | 8-week forecast with past/future split; `totalCapacity` can be 0 | Test with empty team, no task estimates, zero capacity |

### `modules/comercial.js` -- Sales Pipeline

| Function / Line | Issue | Recommended Test |
|-----------------|-------|------------------|
| `render()` L1094-1095 -- CSV import parsing | `parseFloat(val.replace(/[^\d.,\-]/g, '').replace(',', '.'))` -- fragile regex for international number formats | Test with `"1.000,00"`, `"$1,000.00"`, `"-500"`, `""` |
| `_initCrm()` L439 -- Auto-seed deal value | Hard-coded `bus.length * 25000` | Test with 0 BUs, many BUs |

---

## Priority 2 (High) -- ERP State Machine & Business Rules

State transitions govern the entire project lifecycle. Invalid transitions or missed validations break operational workflows.

### `utils/erp-core.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `canTransition()` L117-123 | Every valid and invalid transition for all 5 state machines (project, proposal, deliverable, task, meeting) |
| `transition()` L147-194 | Entity with `status` vs `state` field (L152); terminal state cleanup of `next_action`; pre-transition validation triggers |
| `_preTransitionValidation()` L196-215 | Project entering `producao` without `next_action`; project entering `entrega` without `owner`; proposal going to `enviada` without `client` or with `value <= 0` |
| `calculateHealthScore()` L298-385 | All 13 penalty branches independently; combined score bounds (never < 0); date math for overdue penalties; DST edge cases in day calculation |
| `generateAlerts()` L403-505 | Empty project/deal lists; external `TBO_WORKLOAD` integration failure (silent catch); alert sort ordering |
| `validateNextAction()` L233-249 | Active states list (7 states) vs health score active states (4 states) -- inconsistency |

**Pure functions ideal for unit tests (no mocking needed):**
- `canTransition()`, `getValidTransitions()`, `getStateLabel()`, `getStateColor()`
- `getHealthColor()`, `getHealthEmoji()`, `calculateProjectMargin()`

---

## Priority 3 (High) -- Authentication & Permissions

All auth is client-side. While testing won't fix the architectural limitation, it can catch regressions.

### `utils/auth.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `login()` L43-69 | Valid credentials; invalid user ID; wrong password; session structure correctness |
| `checkSession()` L190-211 | Missing `dashboardVariant`; missing `roleLabel`; corrupted sessionStorage JSON |
| `canAccess()` L79-83 | Module in user's list; module not in list; no active session |
| `canSeeAllProjects()` L109-113 | Founder role; coordinator flag; regular user |

### `utils/permissions.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `getModulesForUser()` L135-153 | Founder gets all modules; artist gets restricted set; unknown user ID |
| `canAccess()` L165-168 | Module access per role; placeholder module access |
| `getSectionsForUser()` L170-178 | Section filtering matches module permissions |

---

## Priority 4 (Medium) -- Data Formatting & Utilities

Pure functions with well-defined inputs/outputs. Easy to test, high confidence gain.

### `utils/formatter.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `currency()` L4-7 | `null`, `NaN`, `0`, negative values, large numbers |
| `relativeTime()` L31-49 | Boundary values at each of the 7 branches (60s, 60min, 24h, 7d, 30d, 365d); future dates |
| `slugify()` L65-70 | Accented characters, special chars, leading/trailing dashes, empty string |
| `markdownToHtml()` L73-87 | Nested formatting (`**_bold italic_**`); orphaned list items; code blocks |
| `duration()` L90-96 | `0` minutes, `59`, `60`, `61`, float values |
| `fileSize()` L99-106 | `0` bytes, `1024`, very large numbers |

### `utils/search.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `search()` L4-62 | Empty query; special regex characters (`.`, `*`, `+`, `[`); mixed meeting formats |
| `_score()` L64-73 | `.match()` returns null (not array) -- potential bug at L71 |
| `getProjectList()` L76-95 | Filter by `'all'`, `'ativos'`, `'finalizados'`; empty context |

### `utils/router.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `navigate()` L27-119 | Unregistered module; permission denied (recursive call, potential infinite loop at L48); XSS in error rendering (L111) |
| `initFromHash()` L132-138 | Malformed hash; alias resolution; empty hash |

### `utils/storage.js`

| Function / Line | What to Test |
|-----------------|--------------|
| `getFullContext()` L177-235 | Missing nested keys (`dados_comerciais`, `fluxo_caixa`, `receita_mensal`); empty arrays |
| `addCrmDeal()` L299-329 | ID collision risk (`Date.now().toString(36)` called rapidly) |
| `getErpSummary()` L509-535 | Empty entity stores; null status values |

### `utils/workload.js` -- Date Utilities

| Function / Line | What to Test |
|-----------------|--------------|
| `getWeekStart()` L33-40 | Sunday edge case (day=0 maps to -6); DST transitions |
| `getWeekEnd()` L42-46 | Leap year boundaries |
| `formatHoursMinutes()` L58-65 | `0`, negative, `null` |
| `startTimer()` L82-133 | Concurrent timer check; finalized project guard; missing userId |
| `stopTimer()` L135-177 | Timer < 1 minute; no running timer; invalid `started_at` |

---

## Priority 5 (Lower) -- UI Modules

These are mostly rendering functions that return HTML strings. They have lower testability without a DOM, but snapshot/integration tests would still catch regressions.

### Modules that would benefit from integration tests:

| Module | Lines | Why |
|--------|-------|-----|
| `command-center.js` | 1,762 | 4 role-specific dashboard variants; KPI aggregation |
| `projetos.js` | 2,614 | Largest module; health scoring, filtering, team assignment |
| `comercial.js` | 1,727 | CRM pipeline, deal management, CSV import/export |
| `rh.js` | 1,167 | Team evaluations, competency radar, skill development |

---

## Recommended Testing Setup

Since the project has no `package.json` or build system, the following bootstrap is needed:

```bash
# 1. Initialize npm
npm init -y

# 2. Install Vitest (lightweight, no config needed for ES modules)
npm install -D vitest jsdom

# 3. Add test script to package.json
# "scripts": { "test": "vitest run", "test:watch": "vitest" }
```

**Why Vitest over Jest:** The codebase uses vanilla JS with object-literal modules (no CommonJS/ESM imports). Vitest handles this with minimal config and has built-in `jsdom` support for DOM-dependent code.

**Module adaptation pattern:** Since modules attach to `globalThis` (e.g., `const TBO_ERP = {...}`), tests can load them via `<script>` in jsdom or use a thin adapter:

```js
// test/helpers/load-module.js
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

export function loadModule(filePath) {
  const code = readFileSync(filePath, 'utf-8');
  const dom = new JSDOM('', { runScripts: 'dangerously' });
  dom.window.eval(code);
  return dom.window;
}
```

---

## Suggested Test File Structure

```
tests/
  unit/
    utils/
      formatter.test.js      # Pure functions, easiest starting point
      erp-core.test.js        # State machines, health scoring
      permissions.test.js     # RBAC rules
      auth.test.js            # Login, session management
      search.test.js          # Search scoring, filtering
      workload.test.js        # Timer, capacity, cost calculations
      storage.test.js         # Data loading, context building
      router.test.js          # Navigation, hash parsing
    modules/
      inteligencia.test.js    # KPI calculations
      financeiro.test.js      # Financial calculations
      comercial.test.js       # Pipeline KPIs, CSV parsing
  helpers/
    load-module.js            # JSDOM-based module loader
    fixtures.js               # Shared test data
```

---

## Summary of Bugs Found During Analysis

These are not hypothetical -- they are concrete issues in the current code:

1. **`inteligencia.js:97`** -- `counts.reduce() / counts.length` crashes with empty array (divide by zero, returns `NaN`)
2. **`inteligencia.js:108`** -- Same pattern, `allProjectCounts` empty array
3. **`inteligencia.js:152`** -- `proposals24 = 0` causes divide-by-zero in growth calculation
4. **`financeiro.js:372`** -- Staff cost % crashes if `total_anual = 0`
5. **`workload.js:532`** -- `varianceCost / plannedCost` with no zero guard
6. **`search.js:71`** -- `.match()` returns `null`, not empty array; `matches.length` would throw
7. **`router.js:42-48`** -- Permission denied triggers recursive `navigate()` with no depth limit
