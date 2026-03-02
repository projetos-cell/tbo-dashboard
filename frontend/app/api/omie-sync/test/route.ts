import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOmieCredentials, testConnection } from "@/lib/omie-client";

// GET /api/omie-sync/test — lightweight connection test
export async function GET() {
  // ── Auth ──
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  // ── Credentials ──
  const creds = getOmieCredentials();
  if (!creds) {
    return NextResponse.json(
      { ok: false, error: "Credenciais Omie nao configuradas (OMIE_APP_KEY / OMIE_APP_SECRET)" },
      { status: 400 }
    );
  }

  try {
    const result = await testConnection(creds);
    return NextResponse.json({ ok: true, total: result.total });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Falha ao conectar com Omie" },
      { status: 502 }
    );
  }
}
