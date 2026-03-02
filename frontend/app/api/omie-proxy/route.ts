import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { proxyOmieRequest } from "@/lib/omie-client";

// ── Whitelist de endpoints Omie permitidos ──
const ALLOWED_OMIE_ENDPOINTS = [
  "financas/contapagar/",
  "financas/contareceber/",
  "geral/clientes/",
  "geral/categorias/",
  "financas/mf/",
  "financas/contacorrente/",
  "financas/pesquisartitulos/",
];

export async function POST(req: NextRequest) {
  // ── Auth: validate Supabase session ──
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Token de autenticacao ausente ou invalido" },
      { status: 401 }
    );
  }

  // ── Validate endpoint ──
  const { searchParams } = new URL(req.url);
  const endpoint = searchParams.get("endpoint");

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;

  if (!ALLOWED_OMIE_ENDPOINTS.some((e) => cleanEndpoint.startsWith(e))) {
    return NextResponse.json({ error: "Endpoint nao permitido" }, { status: 400 });
  }

  // ── Proxy request to Omie ──
  try {
    const body = await req.json();
    const { status, data } = await proxyOmieRequest(cleanEndpoint, body);
    return NextResponse.json(data, { status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Omie proxy request failed", message },
      { status: 502 }
    );
  }
}
