import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  WebsiteProject,
  WebsiteProjectInsert,
  WebsiteProjectUpdate,
} from "../types";

type Client = SupabaseClient<Database>;

export async function getWebsiteProjects(
  supabase: Client,
): Promise<WebsiteProject[]> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_projects")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WebsiteProject[];
}

export async function getWebsiteProject(
  supabase: Client,
  id: string,
): Promise<WebsiteProject> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as WebsiteProject;
}

export async function createWebsiteProject(
  supabase: Client,
  project: WebsiteProjectInsert,
): Promise<WebsiteProject> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_projects")
    .insert(project as never)
    .select("*")
    .single();
  if (error) throw error;
  return data as WebsiteProject;
}

export async function updateWebsiteProject(
  supabase: Client,
  id: string,
  updates: WebsiteProjectUpdate,
): Promise<WebsiteProject> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_projects")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as WebsiteProject;
}

export async function deleteWebsiteProject(
  supabase: Client,
  id: string,
): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("website_projects")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

export async function reorderWebsiteProjects(
  supabase: Client,
  items: { id: string; sort_order: number }[],
): Promise<void> {
  // Batch update sort orders
  for (const item of items) {
    const { error } = await (supabase as SupabaseClient)
      .from("website_projects")
      .update({ sort_order: item.sort_order } as never)
      .eq("id", item.id);
    if (error) throw error;
  }
}

export async function uploadWebsiteImage(
  supabase: Client,
  tenantId: string,
  file: File,
  folder: string = "website",
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${tenantId}/${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("marketing-assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("marketing-assets").getPublicUrl(path);
  return data.publicUrl;
}
