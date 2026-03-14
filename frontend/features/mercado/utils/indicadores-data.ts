// Dados de indicadores do mercado imobiliario — Parana e Brasil
// Fontes: FipeZap, SINDUSCON-PR, CBIC, Banco Central

/* ── FipeZap — Curitiba (ultimos 12 meses) ──────────── */

export const FIPEZAP_CURITIBA: Array<{
  mes: string;
  precoM2Venda: number;
  precoM2Locacao: number;
  variacaoMensalVenda: number;
  variacaoMensalLocacao: number;
}> = [
  { mes: "2024-01", precoM2Venda: 9280, precoM2Locacao: 42.1, variacaoMensalVenda: 0.62, variacaoMensalLocacao: 0.95 },
  { mes: "2024-02", precoM2Venda: 9350, precoM2Locacao: 42.8, variacaoMensalVenda: 0.75, variacaoMensalLocacao: 1.66 },
  { mes: "2024-03", precoM2Venda: 9440, precoM2Locacao: 43.5, variacaoMensalVenda: 0.96, variacaoMensalLocacao: 1.64 },
  { mes: "2024-04", precoM2Venda: 9510, precoM2Locacao: 44.0, variacaoMensalVenda: 0.74, variacaoMensalLocacao: 1.15 },
  { mes: "2024-05", precoM2Venda: 9620, precoM2Locacao: 44.8, variacaoMensalVenda: 1.16, variacaoMensalLocacao: 1.82 },
  { mes: "2024-06", precoM2Venda: 9710, precoM2Locacao: 45.6, variacaoMensalVenda: 0.94, variacaoMensalLocacao: 1.79 },
  { mes: "2024-07", precoM2Venda: 9830, precoM2Locacao: 46.3, variacaoMensalVenda: 1.24, variacaoMensalLocacao: 1.54 },
  { mes: "2024-08", precoM2Venda: 9950, precoM2Locacao: 47.1, variacaoMensalVenda: 1.22, variacaoMensalLocacao: 1.73 },
  { mes: "2024-09", precoM2Venda: 10080, precoM2Locacao: 48.0, variacaoMensalVenda: 1.31, variacaoMensalLocacao: 1.91 },
  { mes: "2024-10", precoM2Venda: 10260, precoM2Locacao: 49.2, variacaoMensalVenda: 1.79, variacaoMensalLocacao: 2.50 },
  { mes: "2024-11", precoM2Venda: 10510, precoM2Locacao: 50.8, variacaoMensalVenda: 2.44, variacaoMensalLocacao: 3.25 },
  { mes: "2024-12", precoM2Venda: 10780, precoM2Locacao: 52.1, variacaoMensalVenda: 2.57, variacaoMensalLocacao: 2.56 },
];

/* ── CUB/m2 Parana (ultimos 12 meses) ──────────────── */

export const CUB_PARANA: Array<{
  mes: string;
  valor: number;
  variacao: number;
}> = [
  { mes: "2024-01", valor: 2218, variacao: 0.32 },
  { mes: "2024-02", valor: 2225, variacao: 0.32 },
  { mes: "2024-03", valor: 2241, variacao: 0.72 },
  { mes: "2024-04", valor: 2258, variacao: 0.76 },
  { mes: "2024-05", valor: 2290, variacao: 1.42 },
  { mes: "2024-06", valor: 2305, variacao: 0.66 },
  { mes: "2024-07", valor: 2318, variacao: 0.56 },
  { mes: "2024-08", valor: 2334, variacao: 0.69 },
  { mes: "2024-09", valor: 2358, variacao: 1.03 },
  { mes: "2024-10", valor: 2385, variacao: 1.15 },
  { mes: "2024-11", valor: 2420, variacao: 1.47 },
  { mes: "2024-12", valor: 2462, variacao: 1.74 },
];

/* ── INCC-DI (ultimos 12 meses) ────────────────────── */

export const INCC_MENSAL: Array<{
  mes: string;
  valor: number;
  variacao: number;
}> = [
  { mes: "2024-01", valor: 1412.3, variacao: 0.25 },
  { mes: "2024-02", valor: 1415.8, variacao: 0.25 },
  { mes: "2024-03", valor: 1419.1, variacao: 0.23 },
  { mes: "2024-04", valor: 1424.5, variacao: 0.38 },
  { mes: "2024-05", valor: 1433.2, variacao: 0.61 },
  { mes: "2024-06", valor: 1444.8, variacao: 0.81 },
  { mes: "2024-07", valor: 1454.1, variacao: 0.64 },
  { mes: "2024-08", valor: 1460.5, variacao: 0.44 },
  { mes: "2024-09", valor: 1465.2, variacao: 0.32 },
  { mes: "2024-10", valor: 1470.8, variacao: 0.38 },
  { mes: "2024-11", valor: 1477.4, variacao: 0.45 },
  { mes: "2024-12", valor: 1485.1, variacao: 0.52 },
];

/* ── Credito Imobiliario ───────────────────────────── */

export const CREDITO_IMOBILIARIO = {
  taxaSelic: 10.75,
  taxaMediaFinanciamento: 10.49,
  prazoMedio: 360,
  volumeFinanciado2024: 187.6,
  unidadesFinanciadas2024: 542000,
} as const;

/* ── Mercado Curitiba — Resumo ─────────────────────── */

export const MERCADO_CURITIBA = {
  vgvAnual: 8.2,
  lancamentosAnual: 142,
  unidadesLancadas: 12800,
  vsoMedio: 14.2,
  ticketMedio: 640000,
  estoqueUnidades: 8500,
  bairroMaisValorizado: "Batel",
  precoM2Batel: 16800,
  precoM2Medio: 10200,
} as const;

/* ── Ranking Cidades PR ────────────────────────────── */

export const RANKING_MERCADO_PR: Array<{
  cidade: string;
  vgvAnual: number;
  lancamentos: number;
  precoM2Medio: number;
}> = [
  { cidade: "Curitiba", vgvAnual: 8200, lancamentos: 142, precoM2Medio: 10200 },
  { cidade: "Londrina", vgvAnual: 1850, lancamentos: 38, precoM2Medio: 7400 },
  { cidade: "Maringa", vgvAnual: 1620, lancamentos: 34, precoM2Medio: 7800 },
  { cidade: "Ponta Grossa", vgvAnual: 680, lancamentos: 16, precoM2Medio: 5900 },
  { cidade: "Cascavel", vgvAnual: 540, lancamentos: 12, precoM2Medio: 6100 },
  { cidade: "Sao Jose dos Pinhais", vgvAnual: 490, lancamentos: 11, precoM2Medio: 6800 },
];

/* ── Helper: label curto do mes ────────────────────── */

export function mesLabel(mes: string): string {
  const [, m] = mes.split("-");
  const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return MESES[Number(m) - 1] ?? mes;
}
