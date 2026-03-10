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
  source: "omie" | "rdstation" | "merged";
  omie_id?: string;
  rd_id?: string;
  notes?: string;
  sales_owner?: string;
}

interface RdContact {
  id: string;
  name: string;
  title?: string;
  emails?: Array<{ email: string }>;
  phones?: Array<{ phone: string }>;
  organization?: { id: string; name: string } | null;
  deal_ids?: string[];
  custom_fields?: Record<string, unknown>;
}

interface RdOrganization {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  custom_fields?: Record<string, unknown>;
}

interface RdDeal {
  id: string;
  name: string;
  amount_total?: number;
  deal_stage?: { id: string; name: string };
  organization?: { id: string; name: string } | null;
  contacts?: Array<{ id: string; name: string }>;
  win?: boolean;
  closed_at?: string;
  created_at?: string;
}

// ── RD Station API helpers ──────────────────────────────────────────────────────

const RD_BASE = "https://crm.rdstation.com/api/v1";

async function rdFetchAll<T>(
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
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      if (res.status === 429) {
        // rate limit — wait and retry
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      break;
    }

    const body = await res.json();

    // RD returns { contacts: [...] } or { deals: [...] } or { organizations: [...] }
    // or sometimes an array directly
    let items: T[];
    if (Array.isArray(body)) {
      items = body;
    } else {
      // Extract the first array property
      const key = Object.keys(body).find((k) => Array.isArray(body[k]));
      items = key ? body[key] : [];
    }

    if (items.length === 0) {
      hasMore = false;
    } else {
      all.push(...items);
      page++;
      // safety cap
      if (all.length >= 5000) break;
    }
  }

  return all;
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

function normName(raw?: string | null): string {
  if (!raw) return "";
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^|\s)\S/g, (l) => l.toUpperCase());
}

// ── Classification engine ───────────────────────────────────────────────────────

function classifyClient(
  client: ImportedClient,
  projectCount: number,
  projectValue: number,
  hasActiveProject: boolean,
  rdDeals: RdDeal[],
): "vip" | "ativo" | "prospect" | "lead" | "inativo" {
  // VIP: high-value client (>R$100k in projects or 3+ projects)
  if (projectValue > 100000 || projectCount >= 3) return "vip";

  // Ativo: has active projects
  if (hasActiveProject) return "ativo";

  // Check RD Station deals
  const openDeals = rdDeals.filter(
    (d) =>
      d.deal_stage?.name &&
      !["fechado_perdido", "lost", "perdido"].some((s) =>
        d.deal_stage!.name.toLowerCase().includes(s),
      ) &&
      !d.closed_at,
  );
  const wonDeals = rdDeals.filter((d) => d.win);

  // Ativo: has won deals in RD
  if (wonDeals.length > 0 && projectCount > 0) return "ativo";

  // Prospect: has open deals in RD
  if (openDeals.length > 0) return "prospect";

  // Lead: from RD but no deals, or new contact
  if (client.source === "rdstation" || client.rd_id) return "lead";

  // Inativo: from Omie but no projects and no RD activity
  if (projectCount === 0 && rdDeals.length === 0) return "inativo";

  return "lead";
}

// ── Main import logic ───────────────────────────────────────────────────────────

async function importClients(tenantId: string, db: SupabaseClient) {
  const results = {
    omie_imported: 0,
    rd_imported: 0,
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

  // Build client map keyed by normalized CNPJ and email
  const clientMap = new Map<string, ImportedClient>();
  const cnpjIndex = new Map<string, string>(); // cnpj → mapKey
  const emailIndex = new Map<string, string>(); // email → mapKey

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

    const cnpj = normCnpj(oc.cnpj);
    if (cnpj) cnpjIndex.set(cnpj, key);

    const email = normEmail(oc.email);
    if (email) emailIndex.set(email, key);

    results.omie_imported++;
  }

  // ── 2. Load RD Station contacts + organizations + deals ──

  const { data: rdConfig } = await db
    .from("rd_config")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("enabled", true)
    .maybeSingle();

  let rdContacts: RdContact[] = [];
  let rdOrganizations: RdOrganization[] = [];
  let rdDeals: RdDeal[] = [];

  if (rdConfig?.api_token) {
    const token = rdConfig.api_token;

    try {
      [rdContacts, rdOrganizations, rdDeals] = await Promise.all([
        rdFetchAll<RdContact>("/contacts", token),
        rdFetchAll<RdOrganization>("/organizations", token),
        rdFetchAll<RdDeal>("/deals", token),
      ]);
    } catch (err) {
      results.errors.push(
        `RD Station fetch: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }

    // Build org map
    const orgMap = new Map<string, RdOrganization>();
    for (const org of rdOrganizations) {
      orgMap.set(org.id, org);
    }

    // Build deal-by-org and deal-by-contact indexes
    const dealsByOrg = new Map<string, RdDeal[]>();
    const dealsByContact = new Map<string, RdDeal[]>();
    for (const deal of rdDeals) {
      if (deal.organization?.id) {
        const arr = dealsByOrg.get(deal.organization.id) ?? [];
        arr.push(deal);
        dealsByOrg.set(deal.organization.id, arr);
      }
      for (const c of deal.contacts ?? []) {
        const arr = dealsByContact.get(c.id) ?? [];
        arr.push(deal);
        dealsByContact.set(c.id, arr);
      }
    }

    // Process RD contacts — merge or create
    for (const rc of rdContacts) {
      const rcEmail = normEmail(rc.emails?.[0]?.email);
      const org = rc.organization ? orgMap.get(rc.organization.id) : null;

      // Try to match existing client by email
      let existingKey: string | undefined;
      if (rcEmail) existingKey = emailIndex.get(rcEmail);

      if (existingKey) {
        // Merge RD data into existing Omie client
        const existing = clientMap.get(existingKey)!;
        existing.rd_id = rc.id;
        existing.source = "merged";
        if (!existing.contact_name && rc.name) existing.contact_name = rc.name;
        if (!existing.sales_owner && rc.title) existing.sales_owner = rc.title;
        if (org) {
          if (!existing.address && org.address) existing.address = org.address;
          if (!existing.city && org.city) existing.city = org.city;
          if (!existing.state && org.state) existing.state = org.state;
        }
        results.merged++;
      } else {
        // New client from RD
        const key = `rd_${rc.id}`;
        const client: ImportedClient = {
          name: org?.name || rc.name || "Desconhecido",
          trading_name: org?.name && rc.name !== org.name ? org.name : undefined,
          contact_name: rc.name || undefined,
          email: rcEmail || undefined,
          phone: rc.phones?.[0]?.phone || undefined,
          address: org?.address || undefined,
          city: org?.city || undefined,
          state: org?.state || undefined,
          source: "rdstation",
          rd_id: rc.id,
          segment: "marketing", // leads from RD are typically marketing-sourced
        };
        clientMap.set(key, client);

        if (rcEmail) emailIndex.set(rcEmail, key);

        results.rd_imported++;
      }
    }

    // Also import organizations that have no contacts (companies only)
    for (const org of rdOrganizations) {
      const orgDeals = dealsByOrg.get(org.id) ?? [];
      // Check if already imported via a contact
      const alreadyImported = Array.from(clientMap.values()).some(
        (c) => c.name === org.name || c.trading_name === org.name,
      );
      if (!alreadyImported && orgDeals.length > 0) {
        const key = `rd_org_${org.id}`;
        clientMap.set(key, {
          name: org.name,
          address: org.address || undefined,
          city: org.city || undefined,
          state: org.state || undefined,
          source: "rdstation",
          rd_id: `org_${org.id}`,
          segment: "marketing",
        });
        results.rd_imported++;
      }
    }
  }

  // ── 3. Load projects for classification + linking ──

  const { data: projects } = await db
    .from("projects")
    .select("id, name, client, client_company, client_id, status, value")
    .eq("tenant_id", tenantId);

  const ACTIVE_STATUSES = [
    "briefing",
    "em_andamento",
    "producao",
    "revisao",
    "aprovado",
  ];

  // Build project-by-client-name index (fuzzy match)
  function matchProject(
    clientName: string,
    tradingName?: string,
  ): Array<{
    id: string;
    value: number;
    isActive: boolean;
  }> {
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

  // ── 4. Classify and upsert ──

  // Build deal index by rd_id for classification
  const dealsByRdId = new Map<string, RdDeal[]>();
  for (const deal of rdDeals) {
    for (const c of deal.contacts ?? []) {
      const arr = dealsByRdId.get(c.id) ?? [];
      arr.push(deal);
      dealsByRdId.set(c.id, arr);
    }
    if (deal.organization?.id) {
      const orgKey = `org_${deal.organization.id}`;
      const arr = dealsByRdId.get(orgKey) ?? [];
      arr.push(deal);
      dealsByRdId.set(orgKey, arr);
    }
  }

  const upsertBatch: Array<Record<string, unknown>> = [];

  for (const [, client] of clientMap) {
    const matched = matchProject(client.name, client.trading_name);
    const projectCount = matched.length;
    const projectValue = matched.reduce((s, p) => s + p.value, 0);
    const hasActiveProject = matched.some((p) => p.isActive);
    const clientDeals = client.rd_id
      ? dealsByRdId.get(client.rd_id) ?? []
      : [];

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
  // (partial unique indexes don't work with PostgREST upsert)
  for (const item of upsertBatch) {
    try {
      let existingId: string | null = null;

      // Try to find existing client by omie_id or rd_id
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

      // Fallback: match by name + tenant
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
        // Update existing
        const { id: _, tenant_id: __, ...updates } = item as Record<string, unknown>;
        await db
          .from("clients")
          .update(updates as never)
          .eq("id", existingId);
      } else {
        // Insert new
        await db.from("clients").insert(item as never);
      }
    } catch (err) {
      results.errors.push(
        `Client ${item.name}: ${err instanceof Error ? err.message : "unknown"}`,
      );
    }
  }

  // ── 5. Link projects to clients by name matching ──

  const { data: allClients } = await db
    .from("clients")
    .select("id, name, trading_name")
    .eq("tenant_id", tenantId);

  for (const p of projects ?? []) {
    if (p.client_id) continue; // already linked

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
        (pcc &&
          cTrading &&
          (cTrading.includes(pcc) || pcc.includes(cTrading)))
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

    // Verify authenticated user
    const { data: { user }, error: authErr } = await db.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    // Extract tenant from body
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
        results.omie_imported + results.rd_imported + results.merged,
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
      "POST with { tenant_id } to import clients from Omie + RD Station",
  });
}
