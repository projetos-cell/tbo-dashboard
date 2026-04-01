/**
 * Shared RD Station CRM API helpers
 * Used by sync-rd and rd-final-migration endpoints
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface RdDeal {
  id: string;
  _id?: string;
  name: string;
  amount_total?: number;
  deal_pipeline_id?: string;
  deal_stage?: { id: string; name: string };
  organization?: { id: string; name: string } | null;
  contacts?: Array<{
    id: string;
    name: string;
    emails?: Array<{ email: string }>;
    phones?: Array<{ phone: string }>;
  }>;
  user?: { id: string; name: string; _id?: string } | null;
  win?: boolean;
  closed_at?: string;
  created_at?: string;
  updated_at?: string;
  prediction_date?: string;
  campaign?: { id: string; name: string } | null;
  deal_source?: { id: string; name: string } | null;
  rating?: number;
  custom_fields?: Record<string, unknown>;
  notes?: string;
}

export interface RdActivity {
  id: string;
  _id?: string;
  text?: string;
  content?: string;
  type?: string;
  done?: boolean;
  date?: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: string; name: string; email?: string; _id?: string } | null;
  deal_id?: string;
  deal?: { id: string; name: string } | null;
  subject?: string;
  notes?: string;
  duration?: number;
}

export interface RdTask {
  id: string;
  _id?: string;
  subject?: string;
  text?: string;
  type?: string;
  done?: boolean;
  date?: string;
  created_at?: string;
  user?: { id: string; name: string; email?: string } | null;
  deal_id?: string;
  deal?: { id: string; name: string } | null;
}

export interface RdNote {
  id: string;
  _id?: string;
  text?: string;
  content?: string;
  created_at?: string;
  updated_at?: string;
  user?: { id: string; name: string; email?: string } | null;
  deal_id?: string;
  deal?: { id: string; name: string } | null;
}

export interface RdPipeline {
  _id?: string;
  id: string;
  name: string;
  stages?: Array<{ id: string; name: string }>;
}

export interface RdContact {
  id: string;
  name: string;
  emails?: Array<{ email: string }>;
  phones?: Array<{ phone: string }>;
  organization?: { id: string; name: string } | null;
  custom_fields?: Record<string, unknown>;
  created_at?: string;
}

export interface RdOrganization {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  custom_fields?: Record<string, unknown>;
  created_at?: string;
}

// ── API Config ───────────────────────────────────────────────────────────────

export const RD_BASE = "https://crm.rdstation.com/api/v1";
const THROTTLE_MS = 600;
const MAX_RETRIES = 5;

// ── Paginated fetcher with retry + rate-limit handling ───────────────────────

export async function rdFetchAll<T>(
  endpoint: string,
  token: string,
  limit = 200,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${RD_BASE}${endpoint}${sep}token=${token}&page=${page}&limit=${limit}`;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0 || page > 1) {
        const delay =
          attempt > 0
            ? Math.min(2000 * Math.pow(2, attempt), 30000)
            : THROTTLE_MS;
        await new Promise((r) => setTimeout(r, delay));
      }

      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        const body = await res.json();
        let items: T[];
        if (Array.isArray(body)) {
          items = body;
        } else {
          const key = Object.keys(body).find((k) => Array.isArray(body[k]));
          items = key ? body[key] : [];
        }

        if (items.length === 0) {
          hasMore = false;
        } else {
          all.push(...items);
          page++;
          if (all.length >= 10000) hasMore = false;
        }
        break;
      }

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.min(3000 * Math.pow(2, attempt), 30000);
        await new Promise((r) => setTimeout(r, waitMs));
        if (attempt === MAX_RETRIES - 1) {
          throw new Error(`Rate limited after ${MAX_RETRIES} retries on ${endpoint}`);
        }
        continue;
      }

      // Non-retryable error
      hasMore = false;
      break;
    }
  }

  return all;
}

// ── Per-deal sub-fetchers ────────────────────────────────────────────────────

export async function rdFetchDealActivities(
  dealId: string,
  token: string,
): Promise<RdActivity[]> {
  try {
    return await rdFetchAll<RdActivity>(`/deals/${dealId}/activities`, token, 200);
  } catch {
    return [];
  }
}

export async function rdFetchDealNotes(
  dealId: string,
  token: string,
): Promise<RdNote[]> {
  try {
    return await rdFetchAll<RdNote>(`/deals/${dealId}/notes`, token, 200);
  } catch {
    return [];
  }
}

export async function rdFetchDealTasks(
  dealId: string,
  token: string,
): Promise<RdTask[]> {
  try {
    return await rdFetchAll<RdTask>(`/deals/${dealId}/tasks`, token, 200);
  } catch {
    return [];
  }
}

// ── Stage mapping ────────────────────────────────────────────────────────────

export const RD_STAGE_MAP: Record<string, string> = {
  prospecção: "lead", prospeccao: "lead", prospecting: "lead",
  "contato inicial": "lead", lead: "lead", leads: "lead",
  "contactado - c/retorno": "qualificacao", "contactado - sem retorno": "qualificacao",
  contactado: "qualificacao", qualificação: "qualificacao", qualificacao: "qualificacao",
  qualification: "qualificacao", qualificados: "qualificacao",
  reunião: "qualificacao", reuniao: "qualificacao", meeting: "qualificacao",
  "sem interesse no momento": "fechado_perdido", "sem interesse": "fechado_perdido",
  proposta: "proposta", proposal: "proposta", "proposta em aberto": "proposta",
  "propostas em aberto": "proposta", apresentação: "proposta", apresentacao: "proposta",
  negociação: "negociacao", negociacao: "negociacao", negotiation: "negociacao",
  fechamento: "negociacao", closing: "negociacao",
  ganho: "fechado_ganho", won: "fechado_ganho", "fechado ganho": "fechado_ganho",
  vendas: "fechado_ganho", venda: "fechado_ganho", vendido: "fechado_ganho",
  vendida: "fechado_ganho", "venda realizada": "fechado_ganho",
  "contrato assinado": "fechado_ganho", "contrato fechado": "fechado_ganho",
  "negócio fechado": "fechado_ganho", "negocio fechado": "fechado_ganho",
  aprovado: "fechado_ganho", converted: "fechado_ganho", closed: "fechado_ganho",
  perdido: "fechado_perdido", perdida: "fechado_perdido", lost: "fechado_perdido",
  "fechado perdido": "fechado_perdido", "propostas perdidas": "fechado_perdido",
  "proposta perdida": "fechado_perdido", descartado: "fechado_perdido",
  cancelado: "fechado_perdido", arquivado: "fechado_perdido",
};

const WON_KW = ["ganho", "won", "venda", "vendas", "vendido", "vendida", "assinado", "aprovado", "converted", "closed"];
const LOST_KW = ["perdido", "perdida", "perdidas", "lost", "descartado", "cancelado", "arquivado"];

export function inferWonLost(name?: string): "won" | "lost" | null {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  if (LOST_KW.some((k) => n.includes(k))) return "lost";
  if (WON_KW.some((k) => n.includes(k))) return "won";
  return null;
}

export function mapStage(rdName: string | undefined, isWon: boolean, isClosed: boolean): string {
  if (isWon) return "fechado_ganho";
  if (isClosed) return "fechado_perdido";
  const inferred = inferWonLost(rdName);
  if (inferred === "won") return "fechado_ganho";
  if (inferred === "lost") return "fechado_perdido";
  if (!rdName) return "lead";
  const n = rdName.toLowerCase().trim();
  return RD_STAGE_MAP[n] ?? "lead";
}

// ── Test connection ──────────────────────────────────────────────────────────

export async function testRdConnection(token: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`${RD_BASE}/deal_pipelines?token=${token}&limit=1`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) return { ok: true };
    if (res.status === 401 || res.status === 403) return { ok: false, error: "Token inválido ou sem permissão" };
    return { ok: false, error: `HTTP ${res.status}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Erro de conexão" };
  }
}
