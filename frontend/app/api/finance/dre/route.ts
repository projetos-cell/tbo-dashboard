import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { computeAndUpsertDRE, getDRESnapshot } from "@/features/financeiro/services/finance-accounting";

/**
 * GET /api/finance/dre?month=YYYY-MM
 * Returns DRE snapshot for the given month (from cache).
 *
 * POST /api/finance/dre?month=YYYY-MM
 * Computes and upserts DRE for the given month (server-side calculation).
 * Restricted to admin+ roles.
 */

function getCurrentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function isValidMonth(m: string): boolean {
  return /^\d{4}-(?:0[1-9]|1[0-2])$/.test(m);
}

async function getAuthContext(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  return profile ?? null;
}

const ALLOWED_ROLES = ["admin"] as const;
type AllowedRole = (typeof ALLOWED_ROLES)[number];

function hasAccess(role: string): role is AllowedRole {
  return (ALLOWED_ROLES as readonly string[]).includes(role);
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getAuthContext(supabase);

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasAccess(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const month = req.nextUrl.searchParams.get("month") ?? getCurrentMonth();
    if (!isValidMonth(month)) {
      return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 });
    }

    const snapshot = await getDRESnapshot(supabase, month);
    if (!snapshot) {
      return NextResponse.json({ data: null, month }, { status: 200 });
    }

    return NextResponse.json({ data: snapshot, month }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const profile = await getAuthContext(supabase);

    if (!profile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasAccess(profile.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const month = req.nextUrl.searchParams.get("month") ?? getCurrentMonth();
    if (!isValidMonth(month)) {
      return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 });
    }

    // Prevent computing future months
    const now = getCurrentMonth();
    if (month > now) {
      return NextResponse.json({ error: "Cannot compute DRE for future months." }, { status: 400 });
    }

    const snapshot = await computeAndUpsertDRE(supabase, month);
    return NextResponse.json({ data: snapshot, month }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
