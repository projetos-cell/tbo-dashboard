import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Deleção em massa de todos os dados do RD Station CRM
 * IRREVERSÍVEL — só rodar após migração final confirmada
 *
 * Deleta: deals, contacts, organizations
 * NÃO altera: pipelines, configurações de API, webhooks (para não afetar a plataforma)
 */
export const maxDuration = 300;

const RD_BASE = "https://crm.rdstation.com/api/v1";
const THROTTLE_MS = 600;
const MAX_RETRIES = 5;

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

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      if (attempt > 0 || page > 1) {
        const delay = attempt > 0
          ? Math.min(2000 * Math.pow(2, attempt), 30000)
          : THROTTLE_MS;
        await new Promise((r) => setTimeout(r, delay));
      }

      const res = await fetch(url, { headers: { Accept: "application/json" } });

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
        continue;
      }

      hasMore = false;
      break;
    }
  }

  return all;
}

async function rdDelete(
  endpoint: string,
  token: string,
): Promise<{ ok: boolean; status: number }> {
  const sep = endpoint.includes("?") ? "&" : "?";
  const url = `${RD_BASE}${endpoint}${sep}token=${token}`;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, Math.min(2000 * Math.pow(2, attempt), 30000)));
    }

    // Throttle between deletes
    await new Promise((r) => setTimeout(r, THROTTLE_MS));

    const res = await fetch(url, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });

    if (res.ok || res.status === 204 || res.status === 404) {
      return { ok: true, status: res.status };
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitMs = retryAfter
        ? parseInt(retryAfter, 10) * 1000
        : Math.min(3000 * Math.pow(2, attempt), 30000);
      await new Promise((r) => setTimeout(r, waitMs));
      continue;
    }

    return { ok: false, status: res.status };
  }

  return { ok: false, status: 429 };
}

// ── POST Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const db = await createClient();
    const { data: { user }, error: authErr } = await db.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tenantId = body.tenant_id;
    const confirmDelete = body.confirm === "DELETE_ALL_RD_DATA";

    if (!tenantId) {
      return NextResponse.json({ error: "tenant_id required" }, { status: 400 });
    }

    if (!confirmDelete) {
      return NextResponse.json({
        error: "Confirmação obrigatória. Envie { confirm: 'DELETE_ALL_RD_DATA' } para prosseguir.",
        warning: "ESTA AÇÃO É IRREVERSÍVEL. Todos os dados do RD Station serão deletados permanentemente.",
      }, { status: 400 });
    }

    // Verify migration was completed
    const { data: migrationLog } = await db
      .from("rd_sync_log" as never)
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("trigger_source", "final_migration")
      .eq("status", "success")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!migrationLog || (migrationLog as unknown[]).length === 0) {
      return NextResponse.json({
        error: "Migração final não encontrada. Execute /api/comercial/rd-final-migration antes de deletar.",
      }, { status: 400 });
    }

    // Load RD config
    const { data: rdConfigRaw } = await db
      .from("rd_config" as never)
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();

    const rdConfig = rdConfigRaw as { api_token: string } | null;
    if (!rdConfig?.api_token) {
      return NextResponse.json({ error: "RD Station token não encontrado" }, { status: 400 });
    }

    const token = rdConfig.api_token;
    const results = {
      deals_deleted: 0,
      contacts_deleted: 0,
      organizations_deleted: 0,
      errors: [] as string[],
    };

    // ── 1. Delete all deals ─────────────────────────────────────────────────

    const deals = await rdFetchAll<{ id: string; _id?: string; name: string }>("/deals", token);

    for (const deal of deals) {
      const dealId = deal._id ?? deal.id;
      const { ok } = await rdDelete(`/deals/${dealId}`, token);
      if (ok) {
        results.deals_deleted++;
      } else {
        results.errors.push(`Deal ${deal.name} (${dealId}): delete failed`);
      }
    }

    // ── 2. Delete all contacts ──────────────────────────────────────────────

    const contacts = await rdFetchAll<{ id: string; _id?: string; name: string }>("/contacts", token);

    for (const contact of contacts) {
      const contactId = contact._id ?? contact.id;
      const { ok } = await rdDelete(`/contacts/${contactId}`, token);
      if (ok) {
        results.contacts_deleted++;
      } else {
        results.errors.push(`Contact ${contact.name} (${contactId}): delete failed`);
      }
    }

    // ── 3. Delete all organizations ─────────────────────────────────────────

    const orgs = await rdFetchAll<{ id: string; _id?: string; name: string }>("/organizations", token);

    for (const org of orgs) {
      const orgId = org._id ?? org.id;
      const { ok } = await rdDelete(`/organizations/${orgId}`, token);
      if (ok) {
        results.organizations_deleted++;
      } else {
        results.errors.push(`Org ${org.name} (${orgId}): delete failed`);
      }
    }

    // ── 4. Disable RD config in Supabase ────────────────────────────────────

    await db.from("rd_config" as never).update({
      enabled: false,
      updated_at: new Date().toISOString(),
    } as never).eq("tenant_id", tenantId);

    // ── 5. Log purge ────────────────────────────────────────────────────────

    await db.from("rd_sync_log" as never).insert({
      tenant_id: tenantId,
      status: results.errors.length > 0 ? "error" : "success",
      triggered_by: user.id,
      trigger_source: "rd_purge",
      deals_synced: results.deals_deleted,
      contacts_synced: results.contacts_deleted,
      organizations_synced: results.organizations_deleted,
      errors: results.errors,
      finished_at: new Date().toISOString(),
    } as never);

    return NextResponse.json({
      success: true,
      ...results,
      message: `Purge completo. ${results.deals_deleted} deals, ${results.contacts_deleted} contatos, ${results.organizations_deleted} orgs deletados do RD Station.`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
