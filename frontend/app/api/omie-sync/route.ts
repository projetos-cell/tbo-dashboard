import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * POST /api/omie-sync — Trigger manual sync (or cron)
 * Calls the Supabase Edge Function `omie-sync` via fetch
 */
export async function POST(request: NextRequest) {
  try {
    // Detect Vercel Cron
    const isCron = request.headers.get("x-vercel-cron") !== null;
    let tenantId: string | null = null;

    if (!isCron) {
      // Auth check for manual triggers
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
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

      tenantId = profile.tenant_id;
    }

    // Call Edge Function
    const edgeUrl = new URL(`${SUPABASE_URL}/functions/v1/omie-sync`);
    if (tenantId) edgeUrl.searchParams.set("tenant_id", tenantId);
    edgeUrl.searchParams.set("trigger", isCron ? "cron" : "manual");

    const edgeRes = await fetch(edgeUrl.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await edgeRes.json();
    return NextResponse.json(data, { status: edgeRes.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[omie-sync] POST error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/omie-sync — Get recent sync logs
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
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

    const { data: logs, error } = await (supabase as any)
      .from("omie_sync_log")
      .select("*")
      .eq("tenant_id", profile.tenant_id)
      .order("started_at", { ascending: false })
      .limit(20);

    if (error) throw error;

    return NextResponse.json({ logs: logs ?? [] });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[omie-sync] GET error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
