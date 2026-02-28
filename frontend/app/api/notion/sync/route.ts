import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const EDGE_FN_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL + "/functions/v1/notion-sync";

export async function GET(request: NextRequest) {
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

  // Read stored access_token (never exposed to client)
  const { data: integration } = await (supabase as any)
    .from("notion_integrations")
    .select("access_token")
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (!integration?.access_token) {
    return NextResponse.json(
      { error: "Notion not connected. Connect via Configuracoes > Integracoes." },
      { status: 400 }
    );
  }

  // Forward query params (mode, limit) to Edge Function
  const params = request.nextUrl.searchParams.toString();
  const url = params ? `${EDGE_FN_URL}?${params}` : EDGE_FN_URL;

  const edgeRes = await fetch(url, {
    method: "GET",
    headers: {
      "x-notion-token": integration.access_token,
      "Content-Type": "application/json",
    },
  });

  const data = await edgeRes.json();

  return NextResponse.json(data, { status: edgeRes.status });
}
