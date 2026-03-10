import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

// ---------------------------------------------------------------------------
// Person Snapshot — aggregated micro-metrics for card display
// ---------------------------------------------------------------------------

export interface PersonSnapshot {
  /** ISO date of last 1:1, or null if never */
  last_1on1_at: string | null;
  /** PDI status: "Em dia" | "Atrasado" | null (no PDI) */
  pdi_status: string | null;
  /** PDI last_updated_at, for staleness check */
  pdi_last_updated_at: string | null;
  /** Performance score (media_avaliacao from profiles) */
  performance_score: number | null;
  /** Count of active (non-completed) person_tasks */
  active_tasks_count: number;
}

export type PeopleSnapshotMap = Record<string, PersonSnapshot>;

// ---------------------------------------------------------------------------
// Derived display values (pure functions — no DB access)
// ---------------------------------------------------------------------------

export type OneOnOneStatus = "Nunca" | "Pendente" | `${number}d`;

export function derive1on1Status(last1on1At: string | null): OneOnOneStatus {
  if (!last1on1At) return "Nunca";
  const diffMs = Date.now() - new Date(last1on1At).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return "Pendente";
  return `${diffDays}d` as `${number}d`;
}

export type PdiStatusDisplay = "Sem" | "Em dia" | "Atrasado" | "Desatualizado";

export function derivePdiStatus(
  pdiStatus: string | null,
  pdiLastUpdatedAt: string | null
): PdiStatusDisplay {
  if (!pdiStatus) return "Sem";
  // Check staleness: null or > 90 days since last update
  if (!pdiLastUpdatedAt) return "Desatualizado";
  const diffMs = Date.now() - new Date(pdiLastUpdatedAt).getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays > 90) return "Desatualizado";
  if (pdiStatus === "Atrasado") return "Atrasado";
  return "Em dia";
}

export function isOverloaded(activeTasksCount: number): boolean {
  return activeTasksCount >= 8;
}

export function isAtRisk(
  performanceScore: number | null,
  pdiStatus: string | null
): boolean {
  return (
    (performanceScore !== null && performanceScore < 60) ||
    pdiStatus === "Atrasado"
  );
}

// ---------------------------------------------------------------------------
// Priority score — Fase 4 (Fila de Atenção)
// +100 at_risk, +50 1:1>30d, +40 PDI atrasado, +30 PDI desatualizado, +20 overloaded
// ---------------------------------------------------------------------------

export function computePriorityScore(snapshot: PersonSnapshot): number {
  let score = 0;

  if (isAtRisk(snapshot.performance_score, snapshot.pdi_status)) score += 100;

  const oneOnOneStatus = derive1on1Status(snapshot.last_1on1_at);
  if (oneOnOneStatus === "Pendente" || oneOnOneStatus === "Nunca") score += 50;

  const pdiStatus = derivePdiStatus(snapshot.pdi_status, snapshot.pdi_last_updated_at);
  if (pdiStatus === "Atrasado") score += 40;
  if (pdiStatus === "Desatualizado") score += 30;

  if (isOverloaded(snapshot.active_tasks_count)) score += 20;

  return score;
}

// ---------------------------------------------------------------------------
// Fetch snapshot data for a batch of person IDs (avoids N+1)
// 3 parallel queries: one_on_ones (max scheduled_at), pdis, person_tasks count
// ---------------------------------------------------------------------------

export async function getPeopleSnapshots(
  supabase: SupabaseClient<Database>,
  personIds: string[]
): Promise<PeopleSnapshotMap> {
  if (personIds.length === 0) return {};

  const [oneOnOnesRes, pdisRes, tasksRes] = await Promise.all([
    // 1. Last 1:1 per person — get all one_on_ones for these people, we'll reduce client-side
    supabase
      .from("one_on_ones" as never)
      .select("collaborator_id,scheduled_at" as never)
      .in("collaborator_id" as never, personIds as never)
      .order("scheduled_at" as never, { ascending: false } as never),

    // 2. PDIs — latest per person (ordered by last_updated_at desc)
    supabase
      .from("pdis" as never)
      .select("person_id,status,last_updated_at" as never)
      .in("person_id" as never, personIds as never)
      .order("last_updated_at" as never, { ascending: false } as never),

    // 3. Active person_tasks count per person
    supabase
      .from("person_tasks" as never)
      .select("person_id,status" as never)
      .in("person_id" as never, personIds as never)
      .neq("status" as never, "done" as never),
  ]);

  // Build lookup maps from raw results
  const last1on1Map = new Map<string, string>();
  if (oneOnOnesRes.data) {
    for (const row of oneOnOnesRes.data as Array<{
      collaborator_id: string;
      scheduled_at: string;
    }>) {
      // Already ordered desc — first occurrence per person is the latest
      if (!last1on1Map.has(row.collaborator_id)) {
        last1on1Map.set(row.collaborator_id, row.scheduled_at);
      }
    }
  }

  const pdiMap = new Map<string, { status: string; last_updated_at: string | null }>();
  if (pdisRes.data) {
    for (const row of pdisRes.data as Array<{
      person_id: string;
      status: string;
      last_updated_at: string | null;
    }>) {
      // First occurrence per person is the latest PDI
      if (!pdiMap.has(row.person_id)) {
        pdiMap.set(row.person_id, {
          status: row.status,
          last_updated_at: row.last_updated_at,
        });
      }
    }
  }

  const taskCountMap = new Map<string, number>();
  if (tasksRes.data) {
    for (const row of tasksRes.data as Array<{ person_id: string }>) {
      taskCountMap.set(row.person_id, (taskCountMap.get(row.person_id) ?? 0) + 1);
    }
  }

  // Assemble snapshot per person
  const result: PeopleSnapshotMap = {};
  for (const pid of personIds) {
    const pdi = pdiMap.get(pid);
    result[pid] = {
      last_1on1_at: last1on1Map.get(pid) ?? null,
      pdi_status: pdi?.status ?? null,
      pdi_last_updated_at: pdi?.last_updated_at ?? null,
      performance_score: null, // filled from profile.media_avaliacao in the hook
      active_tasks_count: taskCountMap.get(pid) ?? 0,
    };
  }

  return result;
}
