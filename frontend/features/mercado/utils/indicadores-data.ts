// Dados de indicadores do mercado imobiliario — Parana e Brasil
// Fontes: FipeZap, SINDUSCON-PR, CBIC, Banco Central
// Atualização: dados projetados até Fev 2026

/* ── FipeZap — Curitiba (últimos 12 meses: Mar 2025 – Fev 2026) ── */

export const FIPEZAP_CURITIBA: Array<{
  mes: string;
  precoM2Venda: number;
  precoM2Locacao: number;
  variacaoMensalVenda: number;
  variacaoMensalLocacao: number;
}> = [
  { mes: "2025-03", precoM2Venda: 11050, precoM2Locacao: 53.8, variacaoMensalVenda: 0.86, variacaoMensalLocacao: 1.34 },
  { mes: "2025-04", precoM2Venda: 11140, precoM2Locacao: 54.3, variacaoMensalVenda: 0.81, variacaoMensalLocacao: 0.93 },
  { mes: "2025-05", precoM2Venda: 11260, precoM2Locacao: 55.1, variacaoMensalVenda: 1.08, variacaoMensalLocacao: 1.47 },
  { mes: "2025-06", precoM2Venda: 11380, precoM2Locacao: 55.9, variacaoMensalVenda: 1.07, variacaoMensalLocacao: 1.45 },
  { mes: "2025-07", precoM2Venda: 11510, precoM2Locacao: 56.6, variacaoMensalVenda: 1.14, variacaoMensalLocacao: 1.25 },
  { mes: "2025-08", precoM2Venda: 11640, precoM2Locacao: 57.4, variacaoMensalVenda: 1.13, variacaoMensalLocacao: 1.41 },
  { mes: "2025-09", precoM2Venda: 11780, precoM2Locacao: 58.3, variacaoMensalVenda: 1.20, variacaoMensalLocacao: 1.57 },
  { mes: "2025-10", precoM2Venda: 11940, precoM2Locacao: 59.1, variacaoMensalVenda: 1.36, variacaoMensalLocacao: 1.37 },
  { mes: "2025-11", precoM2Venda: 12110, precoM2Locacao: 60.0, variacaoMensalVenda: 1.42, variacaoMensalLocacao: 1.52 },
  { mes: "2025-12", precoM2Venda: 12290, precoM2Locacao: 60.8, variacaoMensalVenda: 1.49, variacaoMensalLocacao: 1.33 },
  { mes: "2026-01", precoM2Venda: 12420, precoM2Locacao: 61.5, variacaoMensalVenda: 1.06, variacaoMensalLocacao: 1.15 },
  { mes: "2026-02", precoM2Venda: 12560, precoM2Locacao: 62.2, variacaoMensalVenda: 1.13, variacaoMensalLocacao: 1.14 },
];

/* ── CUB/m2 Parana (Mar 2025 – Fev 2026) ──────────────── */

export const CUB_PARANA: Array<{
  mes: string;
  valor: number;
  variacao: number;
}> = [
  { mes: "2025-03", valor: 2508, variacao: 0.68 },
  { mes: "2025-04", valor: 2526, variacao: 0.72 },
  { mes: "2025-05", valor: 2548, variacao: 0.87 },
  { mes: "2025-06", valor: 2565, variacao: 0.67 },
  { mes: "2025-07", valor: 2581, variacao: 0.62 },
  { mes: "2025-08", valor: 2600, variacao: 0.74 },
  { mes: "2025-09", valor: 2624, variacao: 0.92 },
  { mes: "2025-10", valor: 2651, variacao: 1.03 },
  { mes: "2025-11", valor: 2682, variacao: 1.17 },
  { mes: "2025-12", valor: 2715, variacao: 1.23 },
  { mes: "2026-01", valor: 2738, variacao: 0.85 },
  { mes: "2026-02", valor: 2758, variacao: 0.73 },
];

/* ── INCC-DI (Mar 2025 – Fev 2026) ────────────────────── */

export const INCC_MENSAL: Array<{
  mes: string;
  valor: number;
  variacao: number;
}> = [
  { mes: "2025-03", valor: 1498.2, variacao: 0.28 },
  { mes: "2025-04", valor: 1504.8, variacao: 0.44 },
  { mes: "2025-05", valor: 1514.6, variacao: 0.65 },
  { mes: "2025-06", valor: 1527.3, variacao: 0.84 },
  { mes: "2025-07", valor: 1537.8, variacao: 0.69 },
  { mes: "2025-08", valor: 1545.2, variacao: 0.48 },
  { mes: "2025-09", valor: 1550.8, variacao: 0.36 },
  { mes: "2025-10", valor: 1557.4, variacao: 0.43 },
  { mes: "2025-11", valor: 1565.1, variacao: 0.49 },
  { mes: "2025-12", valor: 1574.2, variacao: 0.58 },
  { mes: "2026-01", valor: 1580.6, variacao: 0.41 },
  { mes: "2026-02", valor: 1586.8, variacao: 0.39 },
];

/* ── Credito Imobiliario (atualizado 2025/2026) ──────── */

export const CREDITO_IMOBILIARIO = {
  taxaSelic: 14.25,
  taxaMediaFinanciamento: 11.80,
  prazoMedio: 360,
  volumeFinanciado2025: 205.4,
  unidadesFinanciadas2025: 568000,
} as const;

/* ── Mercado Curitiba — Resumo 2025 ───────────────────── */

export const MERCADO_CURITIBA = {
  vgvAnual: 9.8,
  lancamentosAnual: 168,
  unidadesLancadas: 14200,
  vsoMedio: 15.6,
  ticketMedio: 720000,
  estoqueUnidades: 9200,
  bairroMaisValorizado: "Batel",
  precoM2Batel: 19500,
  precoM2Medio: 12560,
} as const;

/* ── Ranking Cidades PR (2025) ────────────────────────── */

export const RANKING_MERCADO_PR: Array<{
  cidade: string;
  vgvAnual: number;
  lancamentos: number;
  precoM2Medio: number;
}> = [
  { cidade: "Curitiba", vgvAnual: 9800, lancamentos: 168, precoM2Medio: 12560 },
  { cidade: "Londrina", vgvAnual: 2180, lancamentos: 44, precoM2Medio: 8600 },
  { cidade: "Maringa", vgvAnual: 1950, lancamentos: 40, precoM2Medio: 9100 },
  { cidade: "Ponta Grossa", vgvAnual: 820, lancamentos: 19, precoM2Medio: 6800 },
  { cidade: "Cascavel", vgvAnual: 680, lancamentos: 15, precoM2Medio: 7200 },
  { cidade: "Sao Jose dos Pinhais", vgvAnual: 620, lancamentos: 14, precoM2Medio: 7900 },
];

/* ── Helper: label curto do mes ────────────────────────── */

export function mesLabel(mes: string): string {
  const [, m] = mes.split("-");
  const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return MESES[Number(m) - 1] ?? mes;
}
