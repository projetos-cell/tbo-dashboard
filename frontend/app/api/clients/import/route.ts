import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// ── Types ────────────────────────────────────────────────────────────────────────

interface ImportedClient {
  name: string;
  trading_name?: string;
  cnpj?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  segment?: string;
  source: "omie" | "crm" | "merged";
  omie_id?: string;
  rd_id?: string;
  notes?: string;
  sales_owner?: string;
}

interface CrmDeal {
  id: string;
  name: string;
  value: number | null;
  stage: string;
  company: string | null;
  contact: string | null;
  contact_email: string | null;
  owner_name: string | null;
  rd_deal_id: string | null;
}

// ── Normalization helpers ───────────────────────────────────────────────────────

function normCnpj(raw?: string | null): string {
  if (!raw) return "";
  return raw.replace(/[^\d]/g, "");
}

function normEmail(raw?: string | null): string {
  if (!raw) return "";
  return raw.toLowerCase().trim();
}

// ── Classification engine ───────────────────────────────────────────────────────

const CLOSED_WON = "fechado_ganho";
const CLOSED_LOST = "fechado_perdido";
const OPEN_STAGES = ["lead", "qualificacao", "proposta", "negociacao"];

function classifyClient(
  client: ImportedClient,
  projectCount: number,
  projectValue: number,
  hasActiveProject: boolean,
  deals: CrmDeal[],
): "vip" | "ativo" | "prospect" | "lead" | "inativo" {
  if (projectValue > 100000 || projectCount >= 3) return "vip";
  if (hasActiveProject) return "ativo";

  const wonDeals = deals.filter((d) => d.stage === CLOSED_WON);
  const openDeals = deals.filter((d) => OPEN_STAGES.includes(d.stage));

  if (wonDeals.length > 0 && projectCount > 0) return "ativo";
  if (openDeals.length > 0) return "prospect";
  if (client.source === "crm" || client.rd_id) return "lead";
  if (projectCount === 0 && deals.length === 0) return "inativo";

  return "lead";
}

// ── Main import logic ───────────────────────────────────────────────────────────

async function importClients(tenantId: string, db: SupabaseClient) {
  const results = {
    omie_imported: 0,
    crm_imported: 0,
    merged: 0,
    classified: { vip: 0, ativo: 0, prospect: 0, lead: 0, inativo: 0 },
    projects_linked: 0,
    errors: [] as string[],
  };

  // ── 1. Load Omie clients from finance_clients ──

  const { data: omieClients, error: omieErr } = await db
    .from("finance_clients")
    .select("*")
    .eq("tenant_id", tenantId);

  if (omieErr) {
    results.errors.push(`Omie load: ${omieErr.message}`);
  }

  const clientMap = new Map<string, ImportedClient>();
  const emailIndex = new Map<string, string>();

  for (const oc of omieClients ?? []) {
    const key = `omie_${oc.omie_id || oc.id}`;
    const client: ImportedClient = {
      name: oc.name || "Desconhecido",
      cnpj: oc.cnpj || undefined,
      contact_name: oc.contact_name || undefined,
      email: oc.email || undefined,
      phone: oc.phone || undefined,
      source: "omie",
      omie_id: oc.omie_id || undefined,
      notes: oc.notes || undefined,
    };
    clientMap.set(key, client);

    const email = normEmail(oc.email);
    if (email) emailIndex.set(email, key);

    results.omie_imported++;
  }

  // ── 2. Load CRM deals (already in Supabase, migrated from RD Station) ──

  const { data: crmDeals, error: crmErr } = await db
    .from("crm_deals")
    .select("id, name, value, stage, company, contact, contact_email, owner_name, rd_deal_id")
    .eq("tenant_id", tenantId);

  if (crmErr) {
    results.errors.push(`CRM deals load: ${crmErr.message}`);
  }

  const deals = (crmDeals ?? []) as CrmDeal[];

  // Build unique companies from CRM deals
  const companyDeals = new Map<string, CrmDeal[]>();
  for (const deal of deals) {
    const company = deal.company?.toLowerCase().trim();
    if (!company) continue;
    const arr = companyDeals.get(company) ?? [];
    arr.push(deal);
    companyDeals.set(company, arr);
  }

  // Create client entries from CRM deals (by company)
  for (const [companyLower, companyDealList] of companyDeals) {
    const firstDeal = companyDealList[0];
    const email = normEmail(firstDeal.contact_email);

    // Check if already exists by email
    let existingKey: string | undefined;
    if (email) existingKey = emailIndex.get(email);

    if (existingKey) {
      const existing = clientMap.get(existingKey)!;
      existing.source = "merged";
      if (!existing.contact_name && firstDeal.contact) existing.contact_name = firstDeal.contact;
      if (!existing.sales_owner && firstDeal.owner_name) existing.sales_owner = firstDeal.owner_name;
      results.merged++;
    } else {
      const key = `crm_${companyLower}`;
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          name: firstDeal.company ?? "Desconhecido",
          contact_name: firstDeal.contact ?? undefined,
          email: email || undefined,
          source: "crm",
          rd_id: firstDeal.rd_deal_id ?? undefined,
          sales_owner: firstDeal.owner_name ?? undefined,
          segment: "marketing",
        });
        if (email) emailIndex.set(email, key);
        results.crm_imported++;
      }
    }
  }

  // ── 3. Load projects for classification + linking ──

  const { data: projects } = await db
    .from("projects")
    .select("id, name, client, client_company, client_id, status, value")
    .eq("tenant_id", tenantId);

  const ACTIVE_STATUSES = ["briefing", "em_andamento", "revisao", "aprovado"];

  function matchProject(
    clientName: string,
    tradingName?: string,
  ): Array<{ id: string; value: number; isActive: boolean }> {
    const matches: Array<{ id: string; value: number; isActive: boolean }> = [];
    const nameL = clientName.toLowerCase();
    const tradingL = tradingName?.toLowerCase() ?? "";

    for (const p of projects ?? []) {
      const pc = (p.client || "").toLowerCase();
      const pcc = (p.client_company || "").toLowerCase();

      if (
        (pc && (nameL.includes(pc) || pc.includes(nameL))) ||
        (pcc && (nameL.includes(pcc) || pcc.includes(nameL))) ||
        (tradingL &&
          ((pc && (tradingL.includes(pc) || pc.includes(tradingL))) ||
            (pcc && (tradingL.includes(pcc) || pcc.includes(tradingL)))))
      ) {
        matches.push({
          id: p.id,
          value: Number(p.value) || 0,
          isActive: ACTIVE_STATUSES.includes(p.status),
        });
      }
    }
    return matches;
  }

  // ── 4. Build deal-by-company index for classification ──

  function getDealsForClient(client: ImportedClient): CrmDeal[] {
    const name = client.name.toLowerCase().trim();
    return deals.filter((d) => {
      const company = d.company?.toLowerCase().trim();
      return company && (company.includes(name) || name.includes(company));
    });
  }

  // ── 5. Classify and upsert ──

  const upsertBatch: Array<Record<string, unknown>> = [];

  for (const [, client] of clientMap) {
    const matched = matchProject(client.name, client.trading_name);
    const projectCount = matched.length;
    const projectValue = matched.reduce((s, p) => s + p.value, 0);
    const hasActiveProject = matched.some((p) => p.isActive);
    const clientDeals = getDealsForClient(client);

    const status = classifyClient(
      client,
      projectCount,
      projectValue,
      hasActiveProject,
      clientDeals,
    );

    results.classified[status]++;

    upsertBatch.push({
      tenant_id: tenantId,
      name: client.name,
      trading_name: client.trading_name ?? null,
      cnpj: client.cnpj ?? null,
      contact_name: client.contact_name ?? null,
      email: client.email ?? null,
      phone: client.phone ?? null,
      address: client.address ?? null,
      city: client.city ?? null,
      state: client.state ?? null,
      status,
      segment: client.segment ?? null,
      source: client.source,
      omie_id: client.omie_id ?? null,
      rd_id: client.rd_id ?? null,
      notes: client.notes ?? null,
      sales_owner: client.sales_owner ?? null,
      updated_at: new Date().toISOString(),
    });
  }

  // Upsert using find-then-update/insert pattern
  for (const item of upsertBatch) {
    try {
      let existingId: string | null = null;

      if (item.omie_id) {
        const { data } = await db
          .from("clients")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("omie_id", item.omie_id as string)
          .maybeSingle();
        if (data) existingId = data.id;
      }

      if (!existingId && item.rd_id) {
        const { data } = await db
          .from("clients")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("rd_id", item.rd_id as string)
          .maybeSingle();
        if (data) existingId = data.id;
      }

      if (!existingId) {
        const { data } = await db
          .from("clients")
          .select("id")
          .eq("tenant_id", tenantId)
          .eq("name", item.name as string)
          .maybeSingle();
        if (data) existingId = data.id;
      }

      if (existingId) {
        const { id: _, tenant_id: __, ...updates } = item as Record<string, unknown>;
        await db
          .from("clients")
          .update(updates as never)
          .eq("id", existingId);
      } else {
        await db.from("clients").insert(item as never);
      }
    } catch (err) {
      results.errors.push(
        `Client ${item.name}: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  // ── 6. Link projects to clients by name matching ──

  const { data: allClients } = await db
    .from("clients")
    .select("id, name, trading_name")
    .eq("tenant_id", tenantId);

  for (const p of projects ?? []) {
    if (p.client_id) continue;

    const pc = (p.client || "").toLowerCase();
    const pcc = (p.client_company || "").toLowerCase();
    if (!pc && !pcc) continue;

    const match = (allClients ?? []).find((c) => {
      const cName = c.name.toLowerCase();
      const cTrading = (c.trading_name || "").toLowerCase();
      return (
        (pc && (cName.includes(pc) || pc.includes(cName))) ||
        (pcc && (cName.includes(pcc) || pcc.includes(cName))) ||
        (pc && cTrading && (cTrading.includes(pc) || pc.includes(cTrading))) ||
        (pcc && cTrading && (cTrading.includes(pcc) || pcc.includes(cTrading)))
      );
    });

    if (match) {
      const { error } = await db
        .from("projects")
        .update({ client_id: match.id } as never)
        .eq("id", p.id);
      if (!error) results.projects_linked++;
    }
  }

  return results;
}

// ── POST Handler ────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const db = await createClient();

    const { data: { user }, error: authErr } = await db.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id;

    if (!tenantId) {
      return NextResponse.json(
        { error: "tenant_id required" },
        { status: 400 },
      );
    }

    const results = await importClients(tenantId, db);

    return NextResponse.json({
      success: true,
      ...results,
      total_imported:
        results.omie_imported + results.crm_imported + results.merged,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ── GET Handler (status check) ──────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    status: "ready",
    description:
      "POST with { tenant_id } to import clients from Omie + CRM deals (Supabase)",
  });
}
