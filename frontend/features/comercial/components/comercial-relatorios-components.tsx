// ── Barrel — re-exports for backward compatibility ────────────────────────────
// Arquivo dividido em sub-módulos temáticos para manter arquivos abaixo de 300L.
// Importar diretamente dos sub-arquivos quando possível.

export { fmtCompact, fmtPct, currencyFormatter } from "./comercial-chart-utils";

export { KpiRow, InsightsSection, DashboardSkeleton } from "./comercial-kpi-insights";

export {
  MonthlyRevenueChart,
  StageDonut,
  BUDonutChart,
  AvgPriceByBUChart,
} from "./comercial-revenue-charts";

export {
  TopClientsChart,
  TopOwnersChart,
  ClientRankingTable,
  OwnersTable,
  PipelineByOwnerChart,
} from "./comercial-client-charts";

export { TopProductsChart, ProductRankingTable } from "./comercial-product-charts";
