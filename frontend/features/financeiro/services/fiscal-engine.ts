/**
 * fiscal-engine.ts
 * Motor fiscal: cálculo de impostos, CRUD de NF-e, relatório fiscal mensal.
 * Item 06 — Motor fiscal do módulo financeiro.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Types ────────────────────────────────────────────────────────────────────

export type NotaFiscalStatus =
  | "rascunho"
  | "processando"
  | "autorizada"
  | "cancelada"
  | "rejeitada";

export type NotaFiscalTipo = "nfse" | "nfe" | "nfce";

export type RegimeTributario =
  | "simples_nacional"
  | "lucro_presumido"
  | "lucro_real"
  | "mei";

export interface TaxConfig {
  id: string;
  tenant_id: string;
  cnpj: string | null;
  razao_social: string | null;
  codigo_municipio: string | null;
  codigo_cnae: string | null;
  regime_tributario: RegimeTributario;
  optante_simples: boolean;
  incentivador_cultural: boolean;
  aliquota_iss: number;
  aliquota_pis: number;
  aliquota_cofins: number;
  aliquota_ir: number;
  aliquota_csll: number;
  created_at: string;
  updated_at: string;
}

export interface TomadorEndereco {
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface NotaFiscal {
  id: string;
  tenant_id: string;
  transaction_id: string | null;
  numero: string | null;
  serie: string | null;
  tipo: NotaFiscalTipo;
  status: NotaFiscalStatus;
  // Emitente
  prestador_cnpj: string | null;
  prestador_razao: string | null;
  prestador_im: string | null;
  // Tomador
  tomador_cnpj: string | null;
  tomador_cpf: string | null;
  tomador_razao: string | null;
  tomador_email: string | null;
  tomador_endereco: TomadorEndereco | null;
  // Valores
  valor_servicos: number;
  valor_deducoes: number;
  valor_desconto_incondicionado: number;
  valor_desconto_condicionado: number;
  valor_base_calculo: number;
  // Impostos
  aliquota_iss: number;
  valor_iss: number;
  iss_retido: boolean;
  aliquota_pis: number;
  valor_pis: number;
  aliquota_cofins: number;
  valor_cofins: number;
  aliquota_ir: number;
  valor_ir: number;
  aliquota_csll: number;
  valor_csll: number;
  valor_total_impostos: number;
  valor_liquido: number;
  // Serviço
  discriminacao: string | null;
  codigo_municipio: string | null;
  codigo_cnae: string | null;
  codigo_tributacao_municipio: string | null;
  natureza_operacao: number;
  regime_especial_tributacao: number | null;
  // Datas
  data_emissao: string | null;
  data_competencia: string | null;
  data_cancelamento: string | null;
  motivo_cancelamento: string | null;
  // Externas
  chave_acesso: string | null;
  protocolo: string | null;
  numero_rps: string | null;
  serie_rps: string | null;
  xml_url: string | null;
  pdf_url: string | null;
  // Auditoria
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TaxCalculationInput {
  valor_servicos: number;
  valor_deducoes?: number;
  valor_desconto_incondicionado?: number;
  iss_retido?: boolean;
  config: Pick<
    TaxConfig,
    | "aliquota_iss"
    | "aliquota_pis"
    | "aliquota_cofins"
    | "aliquota_ir"
    | "aliquota_csll"
    | "optante_simples"
    | "regime_tributario"
  >;
}

export interface TaxCalculationResult {
  valor_base_calculo: number;
  aliquota_iss: number;
  valor_iss: number;
  aliquota_pis: number;
  valor_pis: number;
  aliquota_cofins: number;
  valor_cofins: number;
  aliquota_ir: number;
  valor_ir: number;
  aliquota_csll: number;
  valor_csll: number;
  valor_total_impostos: number;
  valor_liquido: number;
}

export interface FiscalSummary {
  total_nfs: number;
  total_autorizadas: number;
  total_canceladas: number;
  valor_servicos_total: number;
  valor_iss_total: number;
  valor_pis_total: number;
  valor_cofins_total: number;
  valor_ir_total: number;
  valor_csll_total: number;
  valor_total_impostos: number;
  valor_liquido_total: number;
}

export interface FiscalMonthlyReport {
  competencia: string;
  summary: FiscalSummary;
  notas: NotaFiscal[];
}

export interface NotaFiscalCreateInput {
  transaction_id?: string;
  tipo?: NotaFiscalTipo;
  prestador_cnpj?: string;
  prestador_razao?: string;
  prestador_im?: string;
  tomador_cnpj?: string;
  tomador_cpf?: string;
  tomador_razao?: string;
  tomador_email?: string;
  tomador_endereco?: TomadorEndereco;
  valor_servicos: number;
  valor_deducoes?: number;
  valor_desconto_incondicionado?: number;
  valor_desconto_condicionado?: number;
  iss_retido?: boolean;
  discriminacao?: string;
  codigo_municipio?: string;
  codigo_cnae?: string;
  codigo_tributacao_municipio?: string;
  natureza_operacao?: number;
  regime_especial_tributacao?: number;
  data_emissao?: string;
  data_competencia?: string;
  numero_rps?: string;
  serie_rps?: string;
}

export interface NotaFiscalFilters {
  status?: NotaFiscalStatus;
  tipo?: NotaFiscalTipo;
  competencia?: string;     // YYYY-MM
  dateFrom?: string;
  dateTo?: string;
  search?: string;          // tomador_razao / numero
  page?: number;
  pageSize?: number;
}

// ── Tax calculation engine ────────────────────────────────────────────────────

/**
 * Calcula todos os impostos sobre serviços para uma NF-e.
 * Simples Nacional: ISS apenas (PIS/COFINS incluídos no DAS).
 * Lucro Presumido / Real: ISS + PIS + COFINS + IR + CSLL.
 */
export function calcularImpostos(input: TaxCalculationInput): TaxCalculationResult {
  const {
    valor_servicos,
    valor_deducoes = 0,
    valor_desconto_incondicionado = 0,
    iss_retido = false,
    config,
  } = input;

  const round2 = (n: number) => Math.round(n * 100) / 100;

  const base = round2(
    Math.max(0, valor_servicos - valor_deducoes - valor_desconto_incondicionado)
  );

  // ISS — todos os regimes
  const aliquota_iss = config.aliquota_iss / 100;
  const valor_iss = iss_retido ? round2(base * aliquota_iss) : 0;

  // Simples Nacional: PIS/COFINS/IR/CSLL já incluídos no DAS
  const isSimples =
    config.optante_simples || config.regime_tributario === "simples_nacional";

  const aliquota_pis = isSimples ? 0 : config.aliquota_pis / 100;
  const valor_pis = round2(base * aliquota_pis);

  const aliquota_cofins = isSimples ? 0 : config.aliquota_cofins / 100;
  const valor_cofins = round2(base * aliquota_cofins);

  const aliquota_ir = isSimples ? 0 : config.aliquota_ir / 100;
  const valor_ir = round2(base * aliquota_ir);

  const aliquota_csll = isSimples ? 0 : config.aliquota_csll / 100;
  const valor_csll = round2(base * aliquota_csll);

  const valor_total_impostos = round2(
    valor_iss + valor_pis + valor_cofins + valor_ir + valor_csll
  );
  const valor_liquido = round2(valor_servicos - valor_total_impostos);

  return {
    valor_base_calculo: base,
    aliquota_iss: config.aliquota_iss,
    valor_iss,
    aliquota_pis: config.aliquota_pis,
    valor_pis,
    aliquota_cofins: config.aliquota_cofins,
    valor_cofins,
    aliquota_ir: config.aliquota_ir,
    valor_ir,
    aliquota_csll: config.aliquota_csll,
    valor_csll,
    valor_total_impostos,
    valor_liquido,
  };
}

// ── Supabase helpers ─────────────────────────────────────────────────────────

type Sb = SupabaseClient<Database>;

/** Busca ou cria configuração fiscal do tenant */
export async function getTaxConfig(sb: Sb): Promise<TaxConfig | null> {
  const { data, error } = await sb
    .from("finance_tax_config" as never)
    .select("*")
    .maybeSingle();

  if (error) throw error;
  return data as TaxConfig | null;
}

/** Upsert configuração fiscal */
export async function upsertTaxConfig(
  sb: Sb,
  tenantId: string,
  payload: Partial<Omit<TaxConfig, "id" | "tenant_id" | "created_at" | "updated_at">>
): Promise<TaxConfig> {
  const { data, error } = await sb
    .from("finance_tax_config" as never)
    .upsert({ ...payload, tenant_id: tenantId } as never, {
      onConflict: "tenant_id",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as TaxConfig;
}

/** Lista notas fiscais com filtros e paginação */
export async function listNotasFiscais(
  sb: Sb,
  filters: NotaFiscalFilters = {}
): Promise<{ data: NotaFiscal[]; count: number }> {
  const {
    status,
    tipo,
    competencia,
    dateFrom,
    dateTo,
    search,
    page = 1,
    pageSize = 50,
  } = filters;

  let query = sb
    .from("finance_notas_fiscais" as never)
    .select("*", { count: "exact" })
    .order("data_emissao", { ascending: false })
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status" as never, status);
  if (tipo) query = query.eq("tipo" as never, tipo);
  if (competencia) query = query.eq("data_competencia" as never, competencia);
  if (dateFrom) query = query.gte("data_emissao" as never, dateFrom);
  if (dateTo) query = query.lte("data_emissao" as never, dateTo);
  if (search) {
    query = query.or(
      `tomador_razao.ilike.%${search}%,numero.ilike.%${search}%,tomador_cnpj.ilike.%${search}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { data: (data ?? []) as NotaFiscal[], count: count ?? 0 };
}

/** Cria rascunho de NF-e com impostos calculados automaticamente */
export async function createNotaFiscal(
  sb: Sb,
  tenantId: string,
  userId: string,
  input: NotaFiscalCreateInput
): Promise<NotaFiscal> {
  const config = await getTaxConfig(sb);

  const defaultConfig: TaxCalculationInput["config"] = config ?? {
    aliquota_iss: 5,
    aliquota_pis: 0.65,
    aliquota_cofins: 3,
    aliquota_ir: 1.5,
    aliquota_csll: 1,
    optante_simples: true,
    regime_tributario: "simples_nacional",
  };

  const taxes = calcularImpostos({
    valor_servicos: input.valor_servicos,
    valor_deducoes: input.valor_deducoes,
    valor_desconto_incondicionado: input.valor_desconto_incondicionado,
    iss_retido: input.iss_retido,
    config: defaultConfig,
  });

  const payload = {
    tenant_id: tenantId,
    transaction_id: input.transaction_id ?? null,
    tipo: input.tipo ?? "nfse",
    status: "rascunho" as const,
    prestador_cnpj: input.prestador_cnpj ?? config?.cnpj ?? null,
    prestador_razao: input.prestador_razao ?? config?.razao_social ?? null,
    prestador_im: input.prestador_im ?? null,
    tomador_cnpj: input.tomador_cnpj ?? null,
    tomador_cpf: input.tomador_cpf ?? null,
    tomador_razao: input.tomador_razao ?? null,
    tomador_email: input.tomador_email ?? null,
    tomador_endereco: input.tomador_endereco ?? null,
    valor_servicos: input.valor_servicos,
    valor_deducoes: input.valor_deducoes ?? 0,
    valor_desconto_incondicionado: input.valor_desconto_incondicionado ?? 0,
    valor_desconto_condicionado: input.valor_desconto_condicionado ?? 0,
    iss_retido: input.iss_retido ?? false,
    discriminacao: input.discriminacao ?? null,
    codigo_municipio: input.codigo_municipio ?? config?.codigo_municipio ?? null,
    codigo_cnae: input.codigo_cnae ?? config?.codigo_cnae ?? null,
    codigo_tributacao_municipio: input.codigo_tributacao_municipio ?? null,
    natureza_operacao: input.natureza_operacao ?? 1,
    regime_especial_tributacao: input.regime_especial_tributacao ?? null,
    data_emissao: input.data_emissao ?? new Date().toISOString().slice(0, 10),
    data_competencia:
      input.data_competencia ??
      new Date().toISOString().slice(0, 7),
    numero_rps: input.numero_rps ?? null,
    serie_rps: input.serie_rps ?? null,
    created_by: userId,
    ...taxes,
  };

  const { data, error } = await sb
    .from("finance_notas_fiscais" as never)
    .insert(payload as never)
    .select("*")
    .single();

  if (error) throw error;
  return data as NotaFiscal;
}

/** Atualiza uma NF-e (recalcula impostos se valor_servicos mudar) */
export async function updateNotaFiscal(
  sb: Sb,
  id: string,
  userId: string,
  patch: Partial<NotaFiscalCreateInput> & { status?: NotaFiscalStatus }
): Promise<NotaFiscal> {
  const { data: current, error: fetchErr } = await sb
    .from("finance_notas_fiscais" as never)
    .select("*")
    .eq("id" as never, id)
    .single();

  if (fetchErr) throw fetchErr;
  const nf = current as NotaFiscal;

  let taxUpdate: Partial<TaxCalculationResult> = {};
  if (patch.valor_servicos !== undefined) {
    const config = await getTaxConfig(sb);
    const defaultConfig: TaxCalculationInput["config"] = config ?? {
      aliquota_iss: 5,
      aliquota_pis: 0.65,
      aliquota_cofins: 3,
      aliquota_ir: 1.5,
      aliquota_csll: 1,
      optante_simples: true,
      regime_tributario: "simples_nacional",
    };
    taxUpdate = calcularImpostos({
      valor_servicos: patch.valor_servicos,
      valor_deducoes: patch.valor_deducoes ?? nf.valor_deducoes,
      valor_desconto_incondicionado:
        patch.valor_desconto_incondicionado ?? nf.valor_desconto_incondicionado,
      iss_retido: patch.iss_retido ?? nf.iss_retido,
      config: defaultConfig,
    });
  }

  const { data, error } = await sb
    .from("finance_notas_fiscais" as never)
    .update({ ...patch, ...taxUpdate, updated_by: userId } as never)
    .eq("id" as never, id)
    .select("*")
    .single();

  if (error) throw error;
  return data as NotaFiscal;
}

/** Relatório fiscal mensal (summary + lista de NF-e) */
export async function getFiscalMonthlyReport(
  sb: Sb,
  competencia: string
): Promise<FiscalMonthlyReport> {
  const { data, error } = await sb
    .from("finance_notas_fiscais" as never)
    .select("*")
    .eq("data_competencia" as never, competencia)
    .neq("status" as never, "cancelada")
    .order("data_emissao", { ascending: false });

  if (error) throw error;
  const notas = (data ?? []) as NotaFiscal[];

  const summary: FiscalSummary = notas.reduce<FiscalSummary>(
    (acc, nf) => ({
      total_nfs: acc.total_nfs + 1,
      total_autorizadas:
        acc.total_autorizadas + (nf.status === "autorizada" ? 1 : 0),
      total_canceladas:
        acc.total_canceladas + (nf.status === "cancelada" ? 1 : 0),
      valor_servicos_total: acc.valor_servicos_total + nf.valor_servicos,
      valor_iss_total: acc.valor_iss_total + nf.valor_iss,
      valor_pis_total: acc.valor_pis_total + nf.valor_pis,
      valor_cofins_total: acc.valor_cofins_total + nf.valor_cofins,
      valor_ir_total: acc.valor_ir_total + nf.valor_ir,
      valor_csll_total: acc.valor_csll_total + nf.valor_csll,
      valor_total_impostos: acc.valor_total_impostos + nf.valor_total_impostos,
      valor_liquido_total: acc.valor_liquido_total + nf.valor_liquido,
    }),
    {
      total_nfs: 0,
      total_autorizadas: 0,
      total_canceladas: 0,
      valor_servicos_total: 0,
      valor_iss_total: 0,
      valor_pis_total: 0,
      valor_cofins_total: 0,
      valor_ir_total: 0,
      valor_csll_total: 0,
      valor_total_impostos: 0,
      valor_liquido_total: 0,
    }
  );

  return { competencia, summary, notas };
}

/** Cancela uma NF-e */
export async function cancelarNF(
  sb: Sb,
  id: string,
  userId: string,
  motivo: string
): Promise<NotaFiscal> {
  const { data, error } = await sb
    .from("finance_notas_fiscais" as never)
    .update({
      status: "cancelada",
      motivo_cancelamento: motivo,
      data_cancelamento: new Date().toISOString(),
      updated_by: userId,
    } as never)
    .eq("id" as never, id)
    .select("*")
    .single();

  if (error) throw error;
  return data as NotaFiscal;
}
