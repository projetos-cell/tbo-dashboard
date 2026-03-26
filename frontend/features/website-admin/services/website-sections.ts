import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type { WebsiteSection, WebsiteSectionUpsert } from "../types";

type Client = SupabaseClient<Database>;

export async function getWebsiteSections(
  supabase: Client,
  page?: string,
): Promise<WebsiteSection[]> {
  let query = (supabase as SupabaseClient)
    .from("website_sections")
    .select("*")
    .order("sort_order", { ascending: true });

  if (page) {
    query = query.eq("page", page);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as WebsiteSection[];
}

export async function upsertWebsiteSection(
  supabase: Client,
  section: WebsiteSectionUpsert,
): Promise<WebsiteSection> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_sections")
    .upsert(section as never, {
      onConflict: "tenant_id,page,section_key",
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as WebsiteSection;
}

export async function updateWebsiteSection(
  supabase: Client,
  id: string,
  updates: Partial<WebsiteSection>,
): Promise<WebsiteSection> {
  const { data, error } = await (supabase as SupabaseClient)
    .from("website_sections")
    .update(updates as never)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as WebsiteSection;
}

export async function deleteWebsiteSection(
  supabase: Client,
  id: string,
): Promise<void> {
  const { error } = await (supabase as SupabaseClient)
    .from("website_sections")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/** Seed default sections for a page if none exist */
export async function seedDefaultSections(
  supabase: Client,
  tenantId: string,
  page: string,
): Promise<WebsiteSection[]> {
  const defaults: Record<string, { key: string; title: string; order: number }[]> = {
    home: [
      { key: "hero", title: "Hero Banner", order: 0 },
      { key: "about_preview", title: "Sobre (Preview)", order: 1 },
      { key: "services_preview", title: "Serviços (Preview)", order: 2 },
      { key: "projects_featured", title: "Projetos em Destaque", order: 3 },
      { key: "testimonials", title: "Depoimentos", order: 4 },
      { key: "cta", title: "Call to Action", order: 5 },
    ],
    about: [
      { key: "hero", title: "Hero", order: 0 },
      { key: "story", title: "Nossa História", order: 1 },
      { key: "team", title: "Time", order: 2 },
      { key: "values", title: "Valores", order: 3 },
    ],
    services: [
      { key: "hero", title: "Hero", order: 0 },
      { key: "services_list", title: "Lista de Serviços", order: 1 },
      { key: "process", title: "Nosso Processo", order: 2 },
      { key: "cta", title: "Call to Action", order: 3 },
    ],
    contact: [
      { key: "hero", title: "Hero", order: 0 },
      { key: "form_intro", title: "Introdução do Formulário", order: 1 },
      { key: "locations", title: "Localização", order: 2 },
    ],
  };

  const pageSections = defaults[page] ?? [];
  const toInsert = pageSections.map((s) => ({
    tenant_id: tenantId,
    page,
    section_key: s.key,
    title: s.title,
    content: {},
    sort_order: s.order,
    is_visible: true,
  }));

  if (toInsert.length === 0) return [];

  const { data, error } = await (supabase as SupabaseClient)
    .from("website_sections")
    .upsert(toInsert as never[], { onConflict: "tenant_id,page,section_key" })
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as WebsiteSection[];
}
