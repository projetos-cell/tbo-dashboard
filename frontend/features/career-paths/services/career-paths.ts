import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import type {
  CareerPathRow,
  CareerTrackRow,
  CareerLevelRow,
  CareerLevelCompetencyRow,
  CareerProgressionRow,
  ProfileCareerFields,
} from "@/lib/supabase/types-career";

// ── Re-exports ──────────────────────────────────────────────────────────────

export type CareerPath = CareerPathRow;
export type CareerTrack = CareerTrackRow;
export type CareerLevel = CareerLevelRow;
export type CareerLevelCompetency = CareerLevelCompetencyRow;
export type CareerProgression = CareerProgressionRow;

// ── Composite types ─────────────────────────────────────────────────────────

export type CareerLevelWithCompetencies = CareerLevelRow & {
  career_level_competencies: CareerLevelCompetencyRow[];
};

export type CareerTrackWithLevels = CareerTrackRow & {
  career_levels: CareerLevelWithCompetencies[];
};

export type CareerPathWithTracks = CareerPathRow & {
  career_tracks: CareerTrackWithLevels[];
};

export type CareerPathWithMemberCount = CareerPathRow & {
  member_count: number;
};

export interface PersonCareerData {
  profile_id: string;
  career_level_id: string | null;
  career_path_id: string | null;
  nivel_atual: string | null;
  level?: CareerLevelWithCompetencies | null;
  path?: CareerPathRow | null;
}

export interface CreateProgressionData {
  tenant_id: string;
  profile_id: string;
  from_level_id: string | null;
  to_level_id: string;
  promoted_by: string | null;
  notes?: string | null;
}

export interface PathMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cargo: string | null;
  nivel_atual: string | null;
}

// ── Typed query helper ──────────────────────────────────────────────────────
// Career tables aren't in generated types yet. This helper gives us typed
// results without `as never` / `any` scattered across every function.

type SB = SupabaseClient<Database>;

function careerQuery<T>(supabase: SB, table: string) {
  return supabase.from(table as keyof Database["public"]["Tables"]) as unknown as ReturnType<
    SupabaseClient<{ public: { Tables: Record<string, { Row: T; Insert: Partial<T>; Update: Partial<T>; Relationships: [] }> } }>["from"]
  >;
}

type ProfileWithCareer = Database["public"]["Tables"]["profiles"]["Row"] & ProfileCareerFields;

// ── Service functions ───────────────────────────────────────────────────────

/** Busca todos os career paths com contagem de membros (parallel queries) */
export async function getCareerPaths(supabase: SB): Promise<CareerPathWithMemberCount[]> {
  const [pathsResult, countsResult] = await Promise.all([
    careerQuery<CareerPathRow>(supabase, "career_paths")
      .select("*")
      .order("order_index"),
    supabase
      .from("profiles")
      .select("career_path_id")
      .not("career_path_id" as string, "is", null),
  ]);

  if (pathsResult.error) throw pathsResult.error;

  const countMap = new Map<string, number>();
  ((countsResult.data ?? []) as unknown as ProfileCareerFields[]).forEach((p) => {
    if (p.career_path_id) {
      countMap.set(p.career_path_id, (countMap.get(p.career_path_id) ?? 0) + 1);
    }
  });

  return ((pathsResult.data ?? []) as CareerPathRow[]).map((p) => ({
    ...p,
    member_count: countMap.get(p.id) ?? 0,
  }));
}

/** Busca um career path com trilhas, níveis e competências aninhados */
export async function getCareerPath(
  supabase: SB,
  pathId: string
): Promise<CareerPathWithTracks | null> {
  const { data, error } = await careerQuery<CareerPathRow>(supabase, "career_paths")
    .select(`
      *,
      career_tracks (
        *,
        career_levels (
          *,
          career_level_competencies (*)
        )
      )
    `)
    .eq("id", pathId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  const d = data as unknown as CareerPathWithTracks;
  d.career_tracks.sort((a, b) => a.order_index - b.order_index);
  d.career_tracks.forEach((t) => {
    t.career_levels.sort((a, b) => a.order_index - b.order_index);
    t.career_levels.forEach((l) => {
      l.career_level_competencies.sort((a, b) =>
        a.competency_key.localeCompare(b.competency_key)
      );
    });
  });

  return d;
}

/** Busca dados de carreira de uma pessoa (parallel sub-queries) */
export async function getPersonCareer(
  supabase: SB,
  profileId: string
): Promise<PersonCareerData | null> {
  const { data: rawProfile, error } = await supabase
    .from("profiles")
    .select("id, career_level_id, career_path_id, nivel_atual" as string)
    .eq("id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  const profile = rawProfile as unknown as ProfileWithCareer;

  const result: PersonCareerData = {
    profile_id: profileId,
    career_level_id: profile.career_level_id ?? null,
    career_path_id: profile.career_path_id ?? null,
    nivel_atual: profile.nivel_atual ?? null,
  };

  // Busca level e path em paralelo
  const [levelResult, pathResult] = await Promise.all([
    result.career_level_id
      ? careerQuery<CareerLevelRow>(supabase, "career_levels")
          .select("*, career_level_competencies(*)")
          .eq("id", result.career_level_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
    result.career_path_id
      ? careerQuery<CareerPathRow>(supabase, "career_paths")
          .select("*")
          .eq("id", result.career_path_id)
          .single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  result.level = (levelResult.data as unknown as CareerLevelWithCompetencies) ?? null;
  result.path = (pathResult.data as unknown as CareerPathRow) ?? null;

  return result;
}

/** Busca histórico de progressões de uma pessoa */
export async function getCareerProgressions(
  supabase: SB,
  profileId: string
): Promise<CareerProgressionRow[]> {
  const { data, error } = await careerQuery<CareerProgressionRow>(supabase, "career_progressions")
    .select("*")
    .eq("profile_id", profileId)
    .order("promoted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CareerProgressionRow[];
}

/** Promove via RPC transacional (insert progression + update profile atomicamente) */
export async function promotePersonCareer(
  supabase: SB,
  data: CreateProgressionData,
  newLevelId: string,
  pathId: string
): Promise<string> {
  // RPC não está nos generated types ainda — cast necessário até rodar gen types
  const rpc = supabase.rpc as (fn: string, params: Record<string, unknown>) => ReturnType<typeof supabase.rpc>;
  const { data: progressionId, error } = await rpc("promote_career", {
    p_tenant_id: data.tenant_id,
    p_profile_id: data.profile_id,
    p_from_level_id: data.from_level_id,
    p_to_level_id: newLevelId,
    p_path_id: pathId,
    p_promoted_by: data.promoted_by,
    p_notes: data.notes ?? null,
  });

  if (error) throw error;
  return progressionId as string;
}

/** Atualiza o nível de carreira de uma pessoa sem criar histórico (correção manual) */
export async function updatePersonCareerLevel(
  supabase: SB,
  profileId: string,
  levelId: string | null,
  pathId: string | null
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ career_level_id: levelId, career_path_id: pathId } as Record<string, unknown>)
    .eq("id", profileId);

  if (error) throw error;
}

/** Busca todos os perfis de um núcleo */
export async function getPathMembers(
  supabase: SB,
  pathId: string
): Promise<PathMember[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, cargo, nivel_atual")
    .eq("career_path_id" as string, pathId)
    .eq("is_active", true)
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as unknown as PathMember[];
}
