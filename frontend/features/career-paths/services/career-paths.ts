import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ── Row types (tabelas não estão no generated types ainda) ───────────────────

export interface CareerPath {
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

export interface CareerTrack {
  id: string;
  path_id: string;
  name: string;
  track_type: "base" | "gestao" | "tecnica";
  order_index: number;
  created_at: string;
}

export interface CareerLevel {
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

export interface CareerLevelCompetency {
  id: string;
  level_id: string;
  competency_key: string;
  competency_name: string;
  competency_type: "hard" | "soft";
  expected_score: number;
  description: string | null;
  created_at: string;
}

export interface CareerProgression {
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

// ── Composite types ──────────────────────────────────────────────────────────

export type CareerLevelWithCompetencies = CareerLevel & {
  career_level_competencies: CareerLevelCompetency[];
};

export type CareerTrackWithLevels = CareerTrack & {
  career_levels: CareerLevelWithCompetencies[];
};

export type CareerPathWithTracks = CareerPath & {
  career_tracks: CareerTrackWithLevels[];
};

export type CareerPathWithMemberCount = CareerPath & {
  member_count: number;
};

export interface PersonCareerData {
  profile_id: string;
  career_level_id: string | null;
  career_path_id: string | null;
  nivel_atual: string | null;
  level?: CareerLevelWithCompetencies | null;
  path?: CareerPath | null;
}

export interface CreateProgressionData {
  tenant_id: string;
  profile_id: string;
  from_level_id: string | null;
  to_level_id: string;
  promoted_by: string | null;
  notes?: string | null;
}

// ── Service functions ────────────────────────────────────────────────────────

type SB = SupabaseClient<Database>;

/** Busca todos os career paths com contagem de membros */
export async function getCareerPaths(supabase: SB): Promise<CareerPathWithMemberCount[]> {
  const { data: paths, error } = await supabase
    .from("career_paths" as never)
    .select("*")
    .order("order_index");

  if (error) throw error;

  // Busca contagem de membros por path
  const { data: counts } = await supabase
    .from("profiles" as never)
    .select("career_path_id")
    .not("career_path_id", "is", null);

  const countMap = new Map<string, number>();
  (counts ?? []).forEach((p: { career_path_id: string }) => {
    countMap.set(p.career_path_id, (countMap.get(p.career_path_id) ?? 0) + 1);
  });

  return (paths ?? []).map((p: CareerPath) => ({
    ...p,
    member_count: countMap.get(p.id) ?? 0,
  }));
}

/** Busca um career path com trilhas, níveis e competências aninhados */
export async function getCareerPath(
  supabase: SB,
  pathId: string
): Promise<CareerPathWithTracks | null> {
  const { data, error } = await supabase
    .from("career_paths" as never)
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

  // Ordena tracks e levels
  if (data) {
    const d = data as CareerPathWithTracks;
    d.career_tracks.sort((a, b) => a.order_index - b.order_index);
    d.career_tracks.forEach((t) => {
      t.career_levels.sort((a, b) => a.order_index - b.order_index);
      t.career_levels.forEach((l) => {
        l.career_level_competencies.sort((a, b) =>
          a.competency_key.localeCompare(b.competency_key)
        );
      });
    });
  }

  return data as CareerPathWithTracks;
}

/** Busca dados de carreira de uma pessoa */
export async function getPersonCareer(
  supabase: SB,
  profileId: string
): Promise<PersonCareerData | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as any;
  const { data: profile, error } = await sb
    .from("profiles")
    .select("id, career_level_id, career_path_id, nivel_atual")
    .eq("id", profileId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  const result: PersonCareerData = {
    profile_id: profileId,
    career_level_id: (profile?.career_level_id as string | null) ?? null,
    career_path_id: (profile?.career_path_id as string | null) ?? null,
    nivel_atual: (profile?.nivel_atual as string | null) ?? null,
  };

  // Busca detalhes do nível atual se houver FK
  if (result.career_level_id) {
    const { data: level } = await supabase
      .from("career_levels" as never)
      .select("*, career_level_competencies(*)")
      .eq("id", result.career_level_id)
      .single();
    result.level = level as CareerLevelWithCompetencies | null;
  }

  if (result.career_path_id) {
    const { data: path } = await supabase
      .from("career_paths" as never)
      .select("*")
      .eq("id", result.career_path_id)
      .single();
    result.path = path as CareerPath | null;
  }

  return result;
}

/** Busca histórico de progressões de uma pessoa */
export async function getCareerProgressions(
  supabase: SB,
  profileId: string
): Promise<CareerProgression[]> {
  const { data, error } = await supabase
    .from("career_progressions" as never)
    .select("*")
    .eq("profile_id", profileId)
    .order("promoted_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as CareerProgression[];
}

/** Cria uma progressão de carreira e atualiza o perfil */
export async function promotePersonCareer(
  supabase: SB,
  data: CreateProgressionData,
  newLevelId: string,
  pathId: string
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as any;

  const { error: progError } = await sb
    .from("career_progressions")
    .insert([{ ...data, to_level_id: newLevelId }]);

  if (progError) throw progError;

  const { error: profileError } = await sb
    .from("profiles")
    .update({ career_level_id: newLevelId, career_path_id: pathId })
    .eq("id", data.profile_id);

  if (profileError) throw profileError;
}

/** Atualiza o nível de carreira de uma pessoa sem criar histórico (correção manual) */
export async function updatePersonCareerLevel(
  supabase: SB,
  profileId: string,
  levelId: string | null,
  pathId: string | null
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as any;
  const { error } = await sb
    .from("profiles")
    .update({ career_level_id: levelId, career_path_id: pathId })
    .eq("id", profileId);

  if (error) throw error;
}

export interface PathMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  cargo: string | null;
  nivel_atual: string | null;
}

/** Busca todos os perfis de um núcleo */
export async function getPathMembers(
  supabase: SB,
  pathId: string
): Promise<PathMember[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as unknown as any;
  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, avatar_url, cargo, nivel_atual")
    .eq("career_path_id", pathId)
    .eq("is_active", true)
    .order("full_name");

  if (error) throw error;
  return (data ?? []) as PathMember[];
}
