import type { KpiTooltipContent } from "@/features/founder-dashboard/components/kpi-card";

export const TOOLTIP_RECEITA: KpiTooltipContent = {
  description: "Soma de todas as receitas recebidas (baixadas) no mês atual.",
  formula: undefined,
  enters: "Títulos baixados no período (status pago).",
  notEnters: "Faturado sem recebimento, propostas em aberto.",
  source: "Omie — Contas a Receber (baixados)",
};

export const TOOLTIP_MARGEM: KpiTooltipContent = {
  description: "Lucro real após custos diretos de projetos/produção.",
  formula: "Receita Realizada - Custos Diretos Pagos",
  enters: "Despesas de projetos e produção (pagos).",
  notEnters: "Custo fixo (folha, softwares, infra).",
  source: "Omie — AP + classificação de custos",
};

export const TOOLTIP_RUNWAY: KpiTooltipContent = {
  description:
    "Quantos meses a empresa sobrevive com o caixa atual, sem novas receitas.",
  formula: "Caixa Atual / Burn Rate",
  enters: undefined,
  notEnters: undefined,
  source: "Caixa Real (manual) / Burn Rate (Omie)",
};

export const TOOLTIP_CAIXA: KpiTooltipContent = {
  description: "Saldo consolidado de todas as contas bancárias hoje.",
  formula: undefined,
  enters: "Contas bancárias cadastradas no Omie.",
  notEnters: undefined,
  source: "Caixa Real (entrada manual) · Omie (fallback automático)",
};

export const TOOLTIP_BURN: KpiTooltipContent = {
  description: "Média mensal de gastos totais nos últimos 3 meses.",
  formula: "Média de despesas pagas (últimos 3 meses)",
  enters: undefined,
  notEnters: undefined,
  source: "Omie — Contas a Pagar (baixadas)",
};

export const TOOLTIP_BREAKEVEN: KpiTooltipContent = {
  description:
    "Receita mínima mensal para cobrir todos os custos (fixos + variáveis).",
  formula: "Custos Fixos + Custos Variáveis médios",
  enters: "Folha, softwares, infra, custos variáveis.",
  notEnters: undefined,
  source: "Omie — AP + centros de custo",
};

export const TOOLTIP_CAIXA_PREVISTO: KpiTooltipContent = {
  description: "Projeção de caixa para os próximos 30 dias.",
  formula: "Caixa Atual + A Receber(30d) - A Pagar(30d)",
  enters: undefined,
  notEnters: undefined,
  source: "Caixa Real (manual) + AR/AP Omie (30d)",
};

export const TOOLTIP_PMR: KpiTooltipContent = {
  description:
    "Prazo Médio de Recebimento — quantos dias, em média, os clientes levam para pagar após o vencimento.",
  formula: "Média(paid_date - due_date) nos últimos 180 dias",
  enters: "Títulos a receber baixados (últimos 6 meses).",
  notEnters: "Títulos em aberto ou cancelados.",
  source: "Omie — Contas a Receber (baixadas)",
};

export const TOOLTIP_PMP: KpiTooltipContent = {
  description:
    "Prazo Médio de Pagamento — quantos dias, em média, a empresa leva para pagar seus fornecedores após o vencimento.",
  formula: "Média(paid_date - due_date) nos últimos 180 dias",
  enters: "Títulos a pagar baixados (últimos 6 meses).",
  notEnters: "Títulos em aberto ou cancelados.",
  source: "Omie — Contas a Pagar (baixadas)",
};

export const TOOLTIP_INADIMPLENCIA: KpiTooltipContent = {
  description:
    "Percentual de títulos a receber vencidos (atrasados) sobre o total de títulos pendentes.",
  formula: "Σ(AR atrasados) / Σ(AR pendentes) × 100",
  enters: "Títulos a receber com status 'atrasado'.",
  notEnters: "Títulos pagos, cancelados ou futuros.",
  source: "Omie — Contas a Receber (pendentes)",
};
