import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ComplexityRule {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  delivery_type: string | null;
  multiplier: number;
  conditions: Record<string, unknown> | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ComplexityRuleInsert {
  tenant_id: string;
  name: string;
  description?: string | null;
  delivery_type?: string | null;
  multiplier: number;
  conditions?: Record<string, unknown> | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface ComplexityRuleUpdate {
  name?: string;
  description?: string | null;
  delivery_type?: string | null;
  multiplier?: number;
  conditions?: Record<string, unknown> | null;
  sort_order?: number;
  is_active?: boolean;
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getComplexityRules(
  supabase: SupabaseClient<Database>,
): Promise<ComplexityRule[]> {
  const { data, error } = await supabase
    .from("pricing_complexity_rules" as never)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as ComplexityRule[];
}

export async function createComplexityRule(
  supabase: SupabaseClient<Database>,
  input: ComplexityRuleInsert,
): Promise<ComplexityRule> {
  const { data, error } = await supabase
    .from("pricing_complexity_rules" as never)
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ComplexityRule;
}

export async function updateComplexityRule(
  supabase: SupabaseClient<Database>,
  id: string,
  updates: ComplexityRuleUpdate,
): Promise<ComplexityRule> {
  const { data, error } = await supabase
    .from("pricing_complexity_rules" as never)
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as ComplexityRule;
}

export async function deleteComplexityRule(
  supabase: SupabaseClient<Database>,
  id: string,
): Promise<void> {
  const { error } = await supabase
    .from("pricing_complexity_rules" as never)
    .delete()
    .eq("id", id);
  if (error) throw error;
}

/**
 * Returns the combined multiplier for a given serviceType, considering all active rules.
 * Rules are combined multiplicatively (e.g., 1.2 * 1.15 = 1.38).
 * If no rules match, returns 1.0 (no adjustment).
 */
export function applyComplexityRules(
  rules: ComplexityRule[],
  serviceType: string,
): number {
  const activeRules = rules.filter((r) => r.is_active);

  const matchingRules = activeRules.filter((rule) => {
    // Match by delivery_type if specified
    if (rule.delivery_type && rule.delivery_type !== serviceType) return false;

    // Match by conditions JSONB if present
    if (rule.conditions) {
      const cond = rule.conditions as Record<string, unknown>;
      if (cond.service_types && Array.isArray(cond.service_types)) {
        return (cond.service_types as string[]).includes(serviceType);
      }
    }

    // If no delivery_type and no conditions, rule is global (applies to all)
    if (!rule.delivery_type && !rule.conditions) return true;

    return !!rule.delivery_type;
  });

  if (matchingRules.length === 0) return 1.0;

  // Multiplicative combination
  return matchingRules.reduce((acc, rule) => acc * rule.multiplier, 1.0);
}
