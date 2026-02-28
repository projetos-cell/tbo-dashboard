import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const redirectBase = `${origin}/configuracoes?tab=integracoes`;

  if (error || !code) {
    return NextResponse.redirect(
      `${redirectBase}&notion=${encodeURIComponent(error ?? "cancelled")}`
    );
  }

  const clientId = (process.env.NEXT_PUBLIC_NOTION_CLIENT_ID ?? "").trim();
  const clientSecret = (process.env.NOTION_CLIENT_SECRET ?? "").trim();
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/notion/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${redirectBase}&notion=config_error`);
  }

  // Exchange code → access_token
  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(`${clientId}:${clientSecret}`).toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const err = await tokenRes.text();
    console.error("[notion/callback] token exchange failed:", err);
    return NextResponse.redirect(`${redirectBase}&notion=token_error`);
  }

  const tokenData = await tokenRes.json();

  // Get current user + tenant
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return NextResponse.redirect(`${redirectBase}&notion=no_tenant`);
  }

  // Upsert integration
  const { error: upsertError } = await (supabase as any)
    .from("notion_integrations")
    .upsert(
      {
        tenant_id: profile.tenant_id,
        access_token: tokenData.access_token,
        workspace_id: tokenData.workspace_id ?? null,
        workspace_name: tokenData.workspace_name ?? null,
        owner_name:
          tokenData.owner?.user?.name ??
          tokenData.owner?.user?.person?.email ??
          null,
        connected_at: new Date().toISOString(),
        connected_by: user.id,
      },
      { onConflict: "tenant_id" }
    );

  if (upsertError) {
    console.error("[notion/callback] upsert error:", upsertError);
    return NextResponse.redirect(`${redirectBase}&notion=save_error`);
  }

  return NextResponse.redirect(`${redirectBase}&notion=connected`);
}
