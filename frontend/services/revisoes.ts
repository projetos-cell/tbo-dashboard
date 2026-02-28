import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type DeliverableRow = Database["public"]["Tables"]["deliverables"]["Row"];

const FULL_COLS = "*";

/** Deliverables pending review (status = pendente) */
export async function getPendingReviews(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<DeliverableRow[]> {
  const { data, error } = await supabase
    .from("deliverables")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .eq("status", "pendente")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Deliverables currently under review (status = em_revisao) */
export async function getInProgressReviews(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<DeliverableRow[]> {
  const { data, error } = await supabase
    .from("deliverables")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .eq("status", "em_revisao")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Completed reviews (status IN aprovado, rejeitado, entregue) */
export async function getCompletedReviews(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<DeliverableRow[]> {
  const { data, error } = await supabase
    .from("deliverables")
    .select(FULL_COLS)
    .eq("tenant_id", tenantId)
    .in("status", ["aprovado", "rejeitado", "entregue"])
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** KPI counts for the reviews dashboard */
export async function getReviewKpis(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<{ pendentes: number; emRevisao: number; aprovadas: number }> {
  const [pendRes, revRes, aprRes] = await Promise.all([
    supabase
      .from("deliverables")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "pendente"),
    supabase
      .from("deliverables")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "em_revisao"),
    supabase
      .from("deliverables")
      .select("id", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("status", "aprovado"),
  ]);

  if (pendRes.error) throw pendRes.error;
  if (revRes.error) throw revRes.error;
  if (aprRes.error) throw aprRes.error;

  return {
    pendentes: pendRes.count ?? 0,
    emRevisao: revRes.count ?? 0,
    aprovadas: aprRes.count ?? 0,
  };
}
