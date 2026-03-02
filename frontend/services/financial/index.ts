/**
 * Financial services — barrel re-exports.
 *
 * Consumers keep importing from "@/services/financial" unchanged.
 * Internally the monolith is split into:
 *   - queries.ts      — Supabase CRUD (payables, receivables, bank, reconciliation, balance)
 *   - lookups.ts      — Reference data CRUD (categories, cost centers, vendors, clients)
 *   - computations.ts — Pure functions (KPIs, cash flow, DRE, insights, simulations, profiles)
 */

export {
  // Payables
  listPayables,
  getPayable,
  createPayable,
  updatePayable,
  deletePayable,
  // Receivables
  listReceivables,
  createReceivable,
  updateReceivable,
  deleteReceivable,
  // Bank
  listBankTransactions,
  listBankImports,
  // Reconciliation
  listReconciliationRules,
  createReconciliationRule,
  updateReconciliationRule,
  deleteReconciliationRule,
  // Ledger
  listFinTransactions,
  // Monthly Closings
  listMonthlyClosings,
  // Balance Snapshots
  getLatestBalanceSnapshot,
  createBalanceSnapshot,
} from "./queries";

export {
  // Categories
  listCategories,
  // Cost Centers
  listCostCenters,
  createCostCenter,
  updateCostCenter,
  // Vendors
  listVendors,
  createVendor,
  updateVendor,
  // Fin Clients
  listFinClients,
  createFinClient,
  updateFinClient,
} from "./lookups";

export {
  // Basic KPIs
  computeFinancialKPIs,
  // Cash Flow
  computeCashFlow,
  // Inbox Alerts
  computeInboxAlerts,
  // Executive KPIs
  computeExecutiveKPIs,
  getKPIHealthStatus,
  // Intelligent Cash Flow
  computeIntelligentCashFlow,
  // Strategic Analysis
  computeCostCenterAnalysis,
  computeRevenueConcentration,
  computeAverageTicket,
  computeRecurringVsProject,
  // Client Profiles
  computeClientProfiles,
  // Simulation
  computeSimulation,
  // Insights
  computeInsights,
  // DRE
  computeDRE,
} from "./computations";

// Re-export types
export type {
  FinancialKPIs,
  CashFlowDay,
  InboxAlert,
  HealthStatus,
  ExecutiveKPIs,
  CashFlowAlert,
  CostCenterAnalysis,
  ConcentrationItem,
  RecurringVsProject,
  ClientFinancialProfile,
  SimulationParams,
  SimulationResult,
  FinancialInsight,
  DRELine,
} from "./computations";
