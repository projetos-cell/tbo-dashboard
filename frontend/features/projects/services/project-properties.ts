import { createClient } from "@/lib/supabase/client";

export type PropertyType = "status" | "priority";
export type PropertyCategory = "todo" | "in_progress" | "done";

export interface PropertyOption {
  id: string;
  tenant_id: string;
  property: PropertyType;
  key: string;
  label: string;
  color: string;
  bg: string;
  category: PropertyCategory | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyOptionInput {
  property: PropertyType;
  key: string;
  label: string;
  color: string;
  bg: string;
  category?: PropertyCategory | null;
  sort_order: number;
}

export interface UpdatePropertyOptionInput {
  label?: string;
  color?: string;
  bg?: string;
  category?: PropertyCategory | null;
  sort_order?: number;
}

// Table not in generated types yet — use schema-less RPC approach
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function table(): any {
  return createClient().from("project_property_options" as never);
}

export async function getPropertyOptions(
  tenantId: string,
  property: PropertyType
): Promise<PropertyOption[]> {
  const { data, error } = await table()
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("property", property)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as PropertyOption[];
}

export async function createPropertyOption(
  tenantId: string,
  input: CreatePropertyOptionInput
): Promise<PropertyOption> {
  const { data, error } = await table()
    .insert({ tenant_id: tenantId, ...input })
    .select()
    .single();

  if (error) throw error;
  return data as PropertyOption;
}

export async function updatePropertyOption(
  id: string,
  updates: UpdatePropertyOptionInput
): Promise<PropertyOption> {
  const { data, error } = await table()
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as PropertyOption;
}

export async function deletePropertyOption(id: string): Promise<void> {
  const { error } = await table()
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function reorderPropertyOptions(
  items: { id: string; sort_order: number }[]
): Promise<void> {
  const promises = items.map(({ id, sort_order }) =>
    table()
      .update({ sort_order })
      .eq("id", id)
  );
  const results = await Promise.all(promises);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const failed = results.find((r: any) => r.error);
  if (failed?.error) throw failed.error;
}
