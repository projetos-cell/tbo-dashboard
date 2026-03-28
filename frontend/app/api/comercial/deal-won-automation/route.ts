import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { executeDealWonAutomation } from "@/features/comercial/services/deal-won-automation";
import type { Database } from "@/lib/supabase/types";

/**
 * POST /api/comercial/deal-won-automation
 *
 * Triggers the deal-won automation pipeline for a given deal.
 * Creates: project + D3D pipeline (if applicable) + kickoff meeting (optional).
 *
 * Body:
 * {
 *   dealId: string;
 *   kickoff?: { date: string; time: string; durationMinutes?: number; participants?: string[]; agenda?: string; }
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { dealId, kickoff } = body as {
      dealId: string;
      kickoff?: {
        date: string;
        time: string;
        durationMinutes?: number;
        participants?: string[];
        agenda?: string;
      };
    };

    if (!dealId) {
      return NextResponse.json({ error: "dealId é obrigatório" }, { status: 400 });
    }

    // Fetch the deal
    const { data: deal, error: dealError } = await supabase
      .from("crm_deals")
      .select("*")
      .eq("id", dealId)
      .single();

    if (dealError || !deal) {
      return NextResponse.json({ error: "Deal não encontrado" }, { status: 404 });
    }

    // Get tenant
    const { data: profile } = await supabase
      .from("profiles")
      .select("tenant_id")
      .eq("id", user.id)
      .single();

    if (!profile?.tenant_id) {
      return NextResponse.json({ error: "Tenant não encontrado" }, { status: 400 });
    }

    const result = await executeDealWonAutomation(
      supabase as unknown as import("@supabase/supabase-js").SupabaseClient<Database>,
      {
        deal: deal as Database["public"]["Tables"]["crm_deals"]["Row"],
        tenantId: profile.tenant_id,
        userId: user.id,
        kickoff,
      },
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
