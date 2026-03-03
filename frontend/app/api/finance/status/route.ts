import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/finance/status
 * Returns finance module status: transaction counts, last sync, etc.
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: "No tenant" }, { status: 400 });
    }

    const tenantId = profile.tenant_id;

    // Fetch stats in parallel
    const [txRes, catRes, ccRes, syncRes] = await Promise.all([
      (supabase as any)
        .from("finance_transactions")
        .select("type, status", { count: "exact" })
        .eq("tenant_id", tenantId),
      (supabase as any)
        .from("finance_categories")
        .select("id", { count: "exact" })
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
      (supabase as any)
        .from("finance_cost_centers")
        .select("id", { count: "exact" })
        .eq("tenant_id", tenantId)
        .eq("is_active", true),
      (supabase as any)
        .from("omie_sync_log")
        .select("finished_at, status, records_synced")
        .eq("tenant_id", tenantId)
        .eq("entity", "finance_full")
        .order("finished_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    const transactions = (txRes.data ?? []) as Array<{
      type: string;
      status: string;
    }>;

    const receitas = transactions.filter((t) => t.type === "receita").length;
    const despesas = transactions.filter((t) => t.type === "despesa").length;
    const pending = transactions.filter((t) => t.status === "pendente").length;
    const paid = transactions.filter((t) => t.status === "pago").length;
    const overdue = transactions.filter((t) => t.status === "atrasado").length;

    return NextResponse.json({
      totalTransactions: txRes.count ?? 0,
      totalReceitas: receitas,
      totalDespesas: despesas,
      pendingCount: pending,
      paidCount: paid,
      overdueCount: overdue,
      lastSyncAt: syncRes.data?.finished_at ?? null,
      lastSyncStatus: syncRes.data?.status ?? null,
      lastSyncRecords: syncRes.data?.records_synced ?? 0,
      categoriesCount: catRes.count ?? 0,
      costCentersCount: ccRes.count ?? 0,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[finance/status] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
