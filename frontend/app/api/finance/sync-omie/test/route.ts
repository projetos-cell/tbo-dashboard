import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OMIE_BASE_URL = "https://app.omie.com.br/api/v1";

/**
 * GET /api/finance/sync-omie/test — Test Omie connection
 * Validates credentials by calling ListarCategorias with page size 1
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

    // Fetch Omie credentials from integration_configs
    const { data: config } = await (supabase as never as { from: (t: string) => { select: (s: string) => { eq: (c: string, v: unknown) => { eq: (c: string, v: unknown) => { eq: (c: string, v: unknown) => { maybeSingle: () => Promise<{ data: { settings: { app_key?: string; app_secret?: string } } | null }> } } } } } })
      .from("integration_configs")
      .select("settings")
      .eq("tenant_id", profile.tenant_id)
      .eq("provider", "omie")
      .eq("is_active", true)
      .maybeSingle();

    if (!config?.settings?.app_key || !config?.settings?.app_secret) {
      return NextResponse.json(
        { ok: false, error: "Credenciais Omie nao configuradas" },
        { status: 400 }
      );
    }

    // Quick Omie API call to validate connection
    const res = await fetch(`${OMIE_BASE_URL}/geral/categorias/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        call: "ListarCategorias",
        app_key: config.settings.app_key,
        app_secret: config.settings.app_secret,
        param: [{ pagina: 1, registros_por_pagina: 1 }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `Omie retornou HTTP ${res.status}`, detail: text.slice(0, 200) },
        { status: 502 }
      );
    }

    const data = await res.json();

    // Check for Omie error response
    if (data.faultstring) {
      return NextResponse.json(
        { ok: false, error: data.faultstring },
        { status: 400 }
      );
    }

    const total = data.total_de_registros || data.nTotRegistros || 0;

    return NextResponse.json({
      ok: true,
      message: `Conexao OK — ${total} categorias encontradas`,
      total,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    console.error("[finance/sync-omie/test] Error:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
