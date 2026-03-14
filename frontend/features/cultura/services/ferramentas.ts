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
  name: string;
  description: string;
  credentials?: TBOToolCredential[];
  accessNotes?: string;
}

export interface FerramentasData {
  categories: ToolCategory[];
  boasPraticas: string[];
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
