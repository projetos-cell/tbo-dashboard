import { NextRequest, NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { generateContractRevenue } from "@/features/financeiro/services/contract-revenue";

export const maxDuration = 60;

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getNextMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ── GET: Vercel Cron (daily at 6 AM UTC) ─────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return runGeneration("cron");
}

// ── POST: manual trigger from UI ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const month = (body as { month?: string }).month;
  return runGeneration("manual", month);
}

// ── Core logic ───────────────────────────────────────────────────────────────

async function runGeneration(source: "cron" | "manual", specificMonth?: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  const supabase = createServiceClient(supabaseUrl, serviceRoleKey);

  // Get all tenants that have active client contracts
  const { data: tenantRows } = await supabase
    .from("contracts")
    .select("tenant_id")
    .eq("status", "active")
    .eq("category", "cliente")
    .gt("monthly_value", 0);

  const tenantIds = [
    ...new Set(
      ((tenantRows ?? []) as Array<{ tenant_id: string }>).map((r) => r.tenant_id)
    ),
  ];

  if (tenantIds.length === 0) {
    return NextResponse.json({ message: "No active contracts with monthly value", results: [] });
  }

  const months = specificMonth ? [specificMonth] : [getCurrentMonth(), getNextMonth()];
  const results: Array<{
    tenantId: string;
    month: string;
    created: number;
    skipped: number;
    errors: string[];
  }> = [];

  for (const tid of tenantIds) {
    for (const month of months) {
      const result = await generateContractRevenue(supabase, tid, "system", month);
      results.push({ tenantId: tid, month, ...result });
    }
  }

  const totalCreated = results.reduce((s, r) => s + r.created, 0);
  const totalSkipped = results.reduce((s, r) => s + r.skipped, 0);

  return NextResponse.json({
    source,
    months,
    totalCreated,
    totalSkipped,
    results,
  });
}
