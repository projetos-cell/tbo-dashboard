# Financeiro Module

## Overview

Financial management module for TBO OS Dashboard. Integrates with **Omie ERP** for automatic sync of accounts payable (contas a pagar) and accounts receivable (contas a receber).

## Architecture

```
financeiro/
├── layout.tsx              # Module sidebar (Transações + Estratégico)
├── page.tsx                # Operational view — transactions table, filters, sync
├── founder/
│   └── page.tsx            # Strategic KPIs — diretoria only (RBAC-protected)
└── README.md

services/finance.ts         # Supabase query functions + types
hooks/use-finance.ts        # React Query hooks + Realtime subscriptions
app/api/finance/
├── sync-omie/route.ts      # POST — full Omie sync (categories + CP + CR)
└── status/route.ts         # GET — module status summary
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `finance_transactions` | All financial movements (receita/despesa/transferencia) |
| `finance_categories` | Transaction categories synced from Omie |
| `finance_cost_centers` | Cost centers synced from Omie |
| `finance_snapshots_daily` | Daily cash flow snapshots for charts |

Migration: `supabase/migrations/082_financeiro_reset.sql`

All tables use RLS with `is_finance_admin(tenant_id)` — requires role `founder`, `owner`, or `diretoria`.

## Omie Integration

- **Server-side only** — API keys never reach the client
- Credentials: `integration_configs` table (per-tenant) or env vars (`OMIE_APP_KEY`, `OMIE_APP_SECRET`)
- Sync endpoint: `POST /api/finance/sync-omie`
- Syncs: categories (`ListarCategorias`), contas a pagar (`ListarContasPagar`), contas a receber (`ListarContasReceber`)
- Logs results to `omie_sync_log` table

## Access Control

| Route | Minimum Role |
|-------|-------------|
| `/financeiro` | Any authenticated user with finance admin role |
| `/financeiro/founder` | `diretoria` (redirects otherwise) |

## UI Constraints

- **No shadcn/ui** — all components use Tailwind CSS directly
- lucide-react for icons
- Intl.NumberFormat for BRL currency formatting

## Hooks

| Hook | Purpose |
|------|---------|
| `useFinanceTransactions(filters)` | Paginated transactions + Realtime |
| `useFinanceCategories()` | Active categories |
| `useFinanceCostCenters()` | Active cost centers |
| `useFinanceSnapshots(days)` | Daily snapshots for charts |
| `useFinanceStatus()` | Module status summary |
| `useFounderKPIs()` | Aggregated KPIs for founder view |
| `useTriggerFinanceSync()` | Mutation to trigger Omie sync |
