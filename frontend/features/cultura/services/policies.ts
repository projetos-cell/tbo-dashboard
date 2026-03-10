import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type PolicyRow = Database["public"]["Tables"]["policies"]["Row"];
type PolicyInsert = Database["public"]["Tables"]["policies"]["Insert"];
type PolicyUpdate = Database["public"]["Tables"]["policies"]["Update"];
type RevisionRow = Database["public"]["Tables"]["policy_revisions"]["Row"];

const POLICY_COLS =
  "id,tenant_id,title,slug,category,summary,content_md,image_url,status,version,effective_date,review_cycle_days,next_review_at,owner_user_id,created_by,updated_by,created_at,updated_at";

const REVISION_COLS =
  "id,policy_id,version,change_note,content_md,updated_by,updated_at";

export interface PolicyFilters {
  status?: string;
  category?: string;
  search?: string;
  sort?: "recent" | "az" | "next_review" | "status";
}

// ─── Slug helper ─────────────────────────────────────────────────────
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ─── List policies ───────────────────────────────────────────────────
export async function getPolicies(
  supabase: SupabaseClient<Database>,
  filters?: PolicyFilters
): Promise<PolicyRow[]> {
  let query = supabase
    .from("policies")
    .select(POLICY_COLS);

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.category) query = query.eq("category", filters.category);
  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`
    );
  }

  // Sorting
  switch (filters?.sort) {
    case "az":
      query = query.order("title", { ascending: true });
      break;
    case "next_review":
      query = query.order("next_review_at", { ascending: true, nullsFirst: false });
      break;
    case "status":
      query = query.order("status", { ascending: true }).order("updated_at", { ascending: false });
      break;
    default:
      query = query.order("updated_at", { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// ─── Get by slug ─────────────────────────────────────────────────────
export async function getPolicy(
  supabase: SupabaseClient<Database>,
  slug: string
): Promise<PolicyRow | null> {
  const { data, error } = await supabase
    .from("policies")
    .select(POLICY_COLS)
    .eq("slug", slug)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// ─── Get by ID ───────────────────────────────────────────────────────
export async function getPolicyById(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<PolicyRow | null> {
  const { data, error } = await supabase
    .from("policies")
    .select(POLICY_COLS)
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

// ─── Create ──────────────────────────────────────────────────────────
export async function createPolicy(
  supabase: SupabaseClient<Database>,
  data: Omit<PolicyInsert, "slug"> & { slug?: string }
): Promise<PolicyRow> {
  const slug = data.slug || generateSlug(data.title);

  const payload: PolicyInsert = {
    ...data,
    slug,
    version: 1,
    status: data.status || "draft",
  };

  // Compute next_review_at if review_cycle_days provided
  if (payload.review_cycle_days) {
    const base = payload.effective_date
      ? new Date(payload.effective_date)
      : new Date();
    base.setDate(base.getDate() + payload.review_cycle_days);
    payload.next_review_at = base.toISOString();
  }

  const { data: created, error } = await supabase
    .from("policies")
    .insert(payload as never)
    .select(POLICY_COLS)
    .single();

  if (error) throw error;
  return created;
}

// ─── Update (with revision snapshot) ─────────────────────────────────
export async function updatePolicy(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: PolicyUpdate,
  editedBy?: string,
  changeNote?: string
): Promise<PolicyRow> {
  // Get current for version snapshot
  const { data: current } = await supabase
    .from("policies")
    .select("version,content_md")
    .eq("id", id)
    .single();

  const currentVersion = (current as { version: number } | null)?.version ?? 0;
  const newVersion = currentVersion + 1;

  // Save revision snapshot
  if (current && editedBy) {
    await supabase.from("policy_revisions").insert({
      policy_id: id,
      version: currentVersion,
      content_md: (current as { content_md: string | null }).content_md,
      change_note: changeNote || null,
      updated_by: editedBy,
    } as never);
  }

  // Recompute next_review_at if relevant fields changed
  const updatePayload: PolicyUpdate = {
    ...updates,
    version: newVersion,
    updated_by: editedBy,
  };

  if (updates.review_cycle_days !== undefined) {
    const effectiveDate = updates.effective_date
      ? new Date(updates.effective_date)
      : new Date();
    if (updates.review_cycle_days) {
      effectiveDate.setDate(effectiveDate.getDate() + updates.review_cycle_days);
      updatePayload.next_review_at = effectiveDate.toISOString();
    } else {
      updatePayload.next_review_at = null;
    }
  }

  const { data, error } = await supabase
    .from("policies")
    .update(updatePayload as never)
    .eq("id", id)
    .select(POLICY_COLS)
    .single();

  if (error) throw error;
  return data;
}

// ─── Archive ─────────────────────────────────────────────────────────
export async function archivePolicy(
  supabase: SupabaseClient<Database>,
  id: string,
  userId?: string
): Promise<PolicyRow> {
  return updatePolicy(supabase, id, { status: "archived" }, userId, "Politica arquivada");
}

// ─── Delete (hard delete — drafts only) ──────────────────────────────
export async function deletePolicy(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("policies")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// ─── Duplicate ───────────────────────────────────────────────────────
export async function duplicatePolicy(
  supabase: SupabaseClient<Database>,
  id: string,
  tenantId: string,
  userId: string
): Promise<PolicyRow> {
  const original = await getPolicyById(supabase, id);
  if (!original) throw new Error("Politica nao encontrada");

  return createPolicy(supabase, {
    tenant_id: tenantId,
    title: `Copia — ${original.title}`,
    category: original.category,
    summary: original.summary,
    content_md: original.content_md,
    image_url: original.image_url,
    status: "draft",
    review_cycle_days: original.review_cycle_days,
    created_by: userId,
    updated_by: userId,
  });
}

// ─── Revisions ───────────────────────────────────────────────────────
export async function getPolicyRevisions(
  supabase: SupabaseClient<Database>,
  policyId: string
): Promise<RevisionRow[]> {
  const { data, error } = await supabase
    .from("policy_revisions")
    .select(REVISION_COLS)
    .eq("policy_id", policyId)
    .order("version", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
