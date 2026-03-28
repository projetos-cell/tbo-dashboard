/**
 * Type extensions for career_* tables not yet in generated types.
 * Run `supabase gen types` to eventually replace this file.
 */

// ── Career table row types ──────────────────────────────────────────────────

export interface CareerPathRow {
  id: string;
  tenant_id: string;
  name: string;
  nucleo: string;
  icon: string | null;
  description: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface CareerTrackRow {
  id: string;
  path_id: string;
  name: string;
  track_type: "base" | "gestao" | "tecnica";
  order_index: number;
  created_at: string;
}

export interface CareerLevelRow {
  id: string;
  track_id: string;
  name: string;
  slug: string;
  description: string | null;
  order_index: number;
  is_transition_point: boolean;
  created_at: string;
  updated_at: string;
}

export interface CareerLevelCompetencyRow {
  id: string;
  level_id: string;
  competency_key: string;
  competency_name: string;
  competency_type: "hard" | "soft";
  expected_score: number;
  description: string | null;
  created_at: string;
}

export interface CareerProgressionRow {
  id: string;
  tenant_id: string;
  profile_id: string;
  from_level_id: string | null;
  to_level_id: string;
  promoted_by: string | null;
  notes: string | null;
  promoted_at: string;
  created_at: string;
}

// ── Profile career fields (added via migration) ─────────────────────────────

export interface ProfileCareerFields {
  career_level_id: string | null;
  career_path_id: string | null;
}
