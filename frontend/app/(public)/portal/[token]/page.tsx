import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { PortalRsmDashboard } from "./dashboard";

interface Props {
  params: Promise<{ token: string }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PortalPage({ params }: Props) {
  const { token } = await params;

  const supabase = createServiceClient();

  // 1. Validate token + get access record
  const { data: access } = await supabase
    .from("client_portal_access")
    .select("*")
    .eq("access_token", token)
    .eq("is_active", true)
    .single();

  if (!access) notFound();

  // 2. Update last_login
  await supabase
    .from("client_portal_access")
    .update({ last_login: new Date().toISOString() } as never)
    .eq("id", access.id);

  // 3. Fetch RSM accounts for this client
  const { data: accounts } = await supabase
    .from("rsm_accounts")
    .select("*")
    .eq("tenant_id", access.tenant_id)
    .eq("client_id", access.client_id!)
    .eq("is_active", true)
    .order("platform");

  if (!accounts || accounts.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-[#4a5f7a]">
          Nenhuma conta de rede social vinculada.
        </p>
      </div>
    );
  }

  // 4. Fetch metrics for all accounts
  const accountIds = accounts.map((a) => a.id);
  const { data: metrics = [] } = await supabase
    .from("rsm_metrics")
    .select("*")
    .in("account_id", accountIds)
    .order("date", { ascending: true });

  // 5. Fetch published posts
  const { data: posts = [] } = await supabase
    .from("rsm_posts")
    .select("*")
    .in("account_id", accountIds)
    .eq("status", "published")
    .order("published_date", { ascending: false })
    .limit(10);

  return (
    <PortalRsmDashboard
      clientName={access.client_name}
      accounts={accounts}
      metrics={metrics}
      posts={posts}
    />
  );
}
