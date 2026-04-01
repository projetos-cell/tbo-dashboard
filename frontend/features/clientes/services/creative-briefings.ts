import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export interface CreativeBriefingRow {
  id: string;
  tenant_id: string;
  slug: string;
  client_name: string;
  project_slug: string | null;
  project_name: string | null;
  project_id: string | null;
  status: "rascunho" | "enviado" | "em_analise" | "aprovado";
  form_data: Record<string, unknown>;
  is_active: boolean;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCreativeBriefings(
  supabase: SupabaseClient<Database>,
  filters?: { status?: string; search?: string },
): Promise<CreativeBriefingRow[]> {
  let query = (supabase
    .from("creative_briefings" as never)
    .select("*" as never) as unknown as {
    neq: (col: string, val: string) => unknown;
    eq: (col: string, val: string) => unknown;
    ilike: (col: string, val: string) => unknown;
    order: (col: string, opts: { ascending: boolean }) => unknown;
  });

  // Excluir rascunhos por padrão (só mostrar enviados+)
  if (filters?.status) {
    query = query.eq("status", filters.status) as typeof query;
  } else {
    query = query.neq("status", "rascunho") as typeof query;
  }

  if (filters?.search) {
    query = query.ilike("client_name", `%${filters.search}%`) as typeof query;
  }

  query = query.order("created_at", { ascending: false }) as typeof query;

  const { data, error } = (await query) as unknown as {
    data: CreativeBriefingRow[] | null;
    error: { message: string } | null;
  };
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCreativeBriefingById(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<CreativeBriefingRow | null> {
  const { data, error } = (await (supabase
    .from("creative_briefings" as never)
    .select("*" as never)
    .eq("id" as never, id as never)
    .single())) as unknown as {
    data: CreativeBriefingRow | null;
    error: { message: string } | null;
  };
  if (error) throw new Error(error.message);
  return data;
}

export async function updateBriefingStatus(
  supabase: SupabaseClient<Database>,
  id: string,
  status: CreativeBriefingRow["status"],
): Promise<void> {
  const { error } = (await (supabase
    .from("creative_briefings" as never)
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq("id" as never, id as never))) as unknown as {
    error: { message: string } | null;
  };
  if (error) throw new Error(error.message);
}
