import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ connected: false }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id) {
    return NextResponse.json({ connected: false });
  }

  const { data: integration } = await (supabase as any)
    .from("notion_integrations")
    .select("workspace_id, workspace_name, owner_name, connected_at")
    .eq("tenant_id", profile.tenant_id)
    .single();

  if (!integration) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    workspace_name: integration.workspace_name,
    workspace_id: integration.workspace_id,
    owner_name: integration.owner_name,
    connected_at: integration.connected_at,
  });
}
