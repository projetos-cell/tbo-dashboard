import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import {
  FERRAMENTAS_CATEGORIAS,
  FERRAMENTAS_BOAS_PRATICAS,
  type TBOToolCredential,
} from "@/features/cultura/data/cultura-notion-seed";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ToolCategory {
  id: string;
  emoji: string;
  name: string;
  tools: Tool[];
}

export interface Tool {
  id?: string;
  name: string;
  description: string;
  category_id?: string;
  credentials?: TBOToolCredential[];
  accessNotes?: string;
}

export interface FerramentasData {
  categories: ToolCategory[];
  boasPraticas: string[];
}

export interface ToolInsert {
  name: string;
  description: string;
  category_id: string;
  credentials?: TBOToolCredential[];
  accessNotes?: string;
}

// ─── Queries ─────────────────────────────────────────────────────────────────

/**
 * Fetches tool categories from Supabase `tool_categories` table.
 * Falls back to static seed data if the table does not exist yet.
 */
export async function getFerramentasData(
  supabase: SupabaseClient<Database>
): Promise<FerramentasData> {
  const { data, error } = await supabase
    .from("tool_categories" as never)
    .select("*")
    .order("order_index", { ascending: true });

  // If table doesn't exist or query errors — return static seed
  if (error || !data || (data as unknown[]).length === 0) {
    return {
      categories: FERRAMENTAS_CATEGORIAS as ToolCategory[],
      boasPraticas: FERRAMENTAS_BOAS_PRATICAS,
    };
  }

  return {
    categories: data as unknown as ToolCategory[],
    boasPraticas: FERRAMENTAS_BOAS_PRATICAS,
  };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function createTool(
  supabase: SupabaseClient<Database>,
  data: ToolInsert
): Promise<void> {
  const { error } = await supabase
    .from("tools" as never)
    .insert(data as never);

  if (error) throw error;
}

export async function updateTool(
  supabase: SupabaseClient<Database>,
  id: string,
  data: Partial<ToolInsert>
): Promise<void> {
  const { error } = await supabase
    .from("tools" as never)
    .update(data as never)
    .eq("id", id as never);

  if (error) throw error;
}

export async function deleteTool(
  supabase: SupabaseClient<Database>,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from("tools" as never)
    .delete()
    .eq("id", id as never);

  if (error) throw error;
}
