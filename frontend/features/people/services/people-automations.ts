import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { getPeopleSnapshots, type PersonSnapshot } from "@/features/people/services/people-snapshot";
import { logPeopleEvent, hasRecentEvent } from "@/features/people/services/people-events";
import { createLogger } from "@/lib/logger";

const log = createLogger("people-automations");

// ---------------------------------------------------------------------------
// Fase 6 — AUTOMACAO LEVE (Deterministica)
// Server-side automations that transform risk into concrete actions.
// Runs on module access (not cron). Never duplicates tasks.
// ---------------------------------------------------------------------------

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/** Categories used to identify auto-generated tasks (dedup key) */
export type AutoTrigger =
  | "auto_1on1"
  | "auto_pdi"
  | "auto_critical_score"
  | "auto_overload";

// ---------------------------------------------------------------------------
// Trigger thresholds (Fase 6 spec — stricter than nudges)
// ---------------------------------------------------------------------------

const THRESHOLDS = {
  /** 1:1 overdue: > 45 days */
  oneOnOneDays: 45,
  /** PDI stale: > 120 days */
  pdiDays: 120,
  /** Critical score: < 45 */
  criticalScore: 45,
  /** Overload: >= 10 active tasks */
  overloadTasks: 10,
} as const;

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface AutomationAction {
  trigger: AutoTrigger;
  personId: string;
  personName: string;
  taskTitle: string;
}

export interface AutomationResult {
  enabled: boolean;
  tasksCreated: AutomationAction[];
  alertsLogged: AutomationAction[];
  skippedDuplicates: number;
}

// ---------------------------------------------------------------------------
// Settings check — reads tenants.settings JSONB
// ---------------------------------------------------------------------------

export async function isAutomationEnabled(
  supabase: SupabaseClient<Database>,
  tenantId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
    .single();

  if (error || !data) return true;

  const settings = data.settings as Record<string, unknown> | null;
  if (!settings) return true;

  // Explicit false turns it off; anything else = enabled
  return settings.people_automations_enabled !== false;
}

export async function setAutomationEnabled(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  enabled: boolean
): Promise<void> {
  // Read current settings, merge, write back
  const { data } = await supabase
    .from("tenants")
    .select("settings")
    .eq("id", tenantId)
    .single();

  const current = (data?.settings as Record<string, unknown>) ?? {};
  const merged = { ...current, people_automations_enabled: enabled };

  await supabase
    .from("tenants")
    .update({ settings: merged as never, updated_at: new Date().toISOString() } as never)
    .eq("id", tenantId);
}

// ---------------------------------------------------------------------------
// Deduplication — fetch existing open auto-generated tasks
// ---------------------------------------------------------------------------

async function getExistingAutoTasks(
  supabase: SupabaseClient<Database>,
  personIds: string[]
): Promise<Map<string, Set<string>>> {
  if (personIds.length === 0) return new Map();

  const { data, error } = await supabase
    .from("person_tasks" as never)
    .select("person_id,category" as never)
    .in("person_id" as never, personIds as never)
    .in("category" as never, [
      "auto_1on1",
      "auto_pdi",
      "auto_critical_score",
      "auto_overload",
    ] as never)
    .neq("status" as never, "done" as never);

  if (error) {
    log.warn("Failed to fetch existing auto-tasks", { error: error.message });
    return new Map();
  }

  // Map<personId, Set<category>>
  const map = new Map<string, Set<string>>();
  for (const row of (data ?? []) as Array<{ person_id: string; category: string }>) {
    if (!map.has(row.person_id)) map.set(row.person_id, new Set());
    map.get(row.person_id)!.add(row.category);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Create a person_task (auto-generated)
// ---------------------------------------------------------------------------

async function createAutoTask(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  personId: string,
  assignedBy: string | null,
  trigger: AutoTrigger,
  title: string,
  description: string
): Promise<boolean> {
  const { error } = await supabase.from("person_tasks").insert({
    tenant_id: tenantId,
    person_id: personId,
    title,
    description,
    category: trigger,
    priority: "high",
    status: "pending",
    assigned_by: assignedBy,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as never);

  if (error) {
    log.warn("Failed to create auto task", { trigger, error: error.message });
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Log alert to audit_log (for Score < 45 — no task, just alert)
// ---------------------------------------------------------------------------

async function logAutomationAlert(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  actorId: string,
  personId: string,
  personName: string,
  trigger: AutoTrigger,
  detail: string
): Promise<void> {
  try {
    await supabase.from("audit_log").insert({
      action: "create",
      entity_type: "people_automation",
      entity_id: personId,
      entity_name: personName,
      user_id: actorId,
      from_state: null,
      to_state: JSON.stringify({ trigger, detail }),
      metadata: JSON.stringify({ auto_generated: true, trigger }),
      created_at: new Date().toISOString(),
      tenant_id: tenantId,
    } as never);
  } catch (err) {
    log.warn("Failed to log automation alert", { err: String(err) });
  }
}

// ---------------------------------------------------------------------------
// Main runner — evaluates all 4 triggers for all active people
// ---------------------------------------------------------------------------

export async function runPeopleAutomations(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  actorId: string
): Promise<AutomationResult> {
  // 1. Check if enabled
  const enabled = await isAutomationEnabled(supabase, tenantId);
  if (!enabled) {
    return { enabled: false, tasksCreated: [], alertsLogged: [], skippedDuplicates: 0 };
  }

  // 2. Fetch all active profiles
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,full_name,manager_id,media_avaliacao,status")
    .in("status", ["active", "onboarding"])
    .limit(1000);

  if (profilesError || !profiles?.length) {
    return { enabled: true, tasksCreated: [], alertsLogged: [], skippedDuplicates: 0 };
  }

  const typedProfiles = profiles as Array<{
    id: string;
    full_name: string | null;
    manager_id: string | null;
    media_avaliacao: number | null;
    status: string | null;
  }>;

  const personIds = typedProfiles.map((p) => p.id);

  // 3. Fetch snapshots (1:1, PDI, tasks) — single batch
  const snapshots = await getPeopleSnapshots(supabase, personIds);

  // Merge performance_score from profiles
  for (const p of typedProfiles) {
    if (snapshots[p.id]) {
      snapshots[p.id].performance_score = p.media_avaliacao;
    }
  }

  // 4. Fetch existing auto-tasks for dedup
  const existingTasks = await getExistingAutoTasks(supabase, personIds);

  // 5. Evaluate triggers
  const now = Date.now();
  const tasksCreated: AutomationAction[] = [];
  const alertsLogged: AutomationAction[] = [];
  let skippedDuplicates = 0;

  for (const profile of typedProfiles) {
    const snapshot = snapshots[profile.id];
    if (!snapshot) continue;

    const name = profile.full_name ?? "Sem nome";
    const managerId = profile.manager_id;
    const existing = existingTasks.get(profile.id);

    // ── Trigger 1: 1:1 > 45 days ───────────────────────────────────────
    if (snapshot.last_1on1_at) {
      const diffDays = (now - new Date(snapshot.last_1on1_at).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > THRESHOLDS.oneOnOneDays) {
        if (existing?.has("auto_1on1")) {
          skippedDuplicates++;
        } else {
          const title = `Realizar 1:1 com ${name}`;
          const desc = `Gerado automaticamente: último 1:1 há ${Math.floor(diffDays)} dias (limite: ${THRESHOLDS.oneOnOneDays}d).`;
          const ok = await createAutoTask(supabase, tenantId, profile.id, managerId, "auto_1on1", title, desc);
          if (ok) {
            tasksCreated.push({ trigger: "auto_1on1", personId: profile.id, personName: name, taskTitle: title });
            logPeopleEvent(supabase, tenantId, profile.id, actorId, "auto_task_created", "warning", { trigger: "auto_1on1", summary: title });
          }
        }
      }
    } else {
      // Never had a 1:1 — also triggers
      if (existing?.has("auto_1on1")) {
        skippedDuplicates++;
      } else {
        const title = `Realizar 1:1 com ${name}`;
        const desc = `Gerado automaticamente: nenhum 1:1 registrado.`;
        const ok = await createAutoTask(supabase, tenantId, profile.id, managerId, "auto_1on1", title, desc);
        if (ok) {
          tasksCreated.push({ trigger: "auto_1on1", personId: profile.id, personName: name, taskTitle: title });
          logPeopleEvent(supabase, tenantId, profile.id, actorId, "auto_task_created", "warning", { trigger: "auto_1on1", summary: title });
        }
      }
    }

    // ── Trigger 2: PDI > 120 days ──────────────────────────────────────
    if (snapshot.pdi_last_updated_at) {
      const diffDays = (now - new Date(snapshot.pdi_last_updated_at).getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > THRESHOLDS.pdiDays) {
        if (existing?.has("auto_pdi")) {
          skippedDuplicates++;
        } else {
          const title = `Atualizar PDI de ${name}`;
          const desc = `Gerado automaticamente: PDI sem atualização há ${Math.floor(diffDays)} dias (limite: ${THRESHOLDS.pdiDays}d).`;
          const ok = await createAutoTask(supabase, tenantId, profile.id, managerId, "auto_pdi", title, desc);
          if (ok) {
            tasksCreated.push({ trigger: "auto_pdi", personId: profile.id, personName: name, taskTitle: title });
            logPeopleEvent(supabase, tenantId, profile.id, actorId, "auto_task_created", "warning", { trigger: "auto_pdi", summary: title });
          }
        }
      }
    }

    // ── Trigger 3: Score < 45 — alert only (no task) ───────────────────
    if (
      snapshot.performance_score !== null &&
      snapshot.performance_score < THRESHOLDS.criticalScore
    ) {
      // Always log (alerts are idempotent info records, not tasks)
      const title = `Alerta: ${name} com score ${snapshot.performance_score}`;
      await logAutomationAlert(
        supabase,
        tenantId,
        actorId,
        profile.id,
        name,
        "auto_critical_score",
        `Score ${snapshot.performance_score} < ${THRESHOLDS.criticalScore}`
      );
      alertsLogged.push({ trigger: "auto_critical_score", personId: profile.id, personName: name, taskTitle: title });
      logPeopleEvent(supabase, tenantId, profile.id, actorId, "performance_changed", "critical", {
        summary: `Score ${snapshot.performance_score} abaixo do limite (${THRESHOLDS.criticalScore})`,
        new_value: snapshot.performance_score,
      });
    }

    // ── Trigger 4: Overload >= 10 tasks ────────────────────────────────
    if (snapshot.active_tasks_count >= THRESHOLDS.overloadTasks) {
      if (existing?.has("auto_overload")) {
        skippedDuplicates++;
      } else {
        const title = `Revisar carga de ${name}`;
        const desc = `Gerado automaticamente: ${snapshot.active_tasks_count} tarefas ativas (limite: ${THRESHOLDS.overloadTasks}).`;
        const ok = await createAutoTask(supabase, tenantId, profile.id, managerId, "auto_overload", title, desc);
        if (ok) {
          tasksCreated.push({ trigger: "auto_overload", personId: profile.id, personName: name, taskTitle: title });
          logPeopleEvent(supabase, tenantId, profile.id, actorId, "auto_task_created", "warning", { trigger: "auto_overload", summary: title });
          // Overload-specific event (deduped — max 1 per 24h)
          const recentOverload = await hasRecentEvent(supabase, profile.id, "overload_detected", 24);
          if (!recentOverload) {
            logPeopleEvent(supabase, tenantId, profile.id, actorId, "overload_detected", "warning", {
              summary: `${snapshot.active_tasks_count} tarefas ativas (limite: ${THRESHOLDS.overloadTasks})`,
              new_value: snapshot.active_tasks_count,
            });
          }
        }
      }
    }
  }

  // 6. Log a summary audit entry if any actions were taken
  if (tasksCreated.length > 0 || alertsLogged.length > 0) {
    try {
      await supabase.from("audit_log").insert({
        action: "create",
        entity_type: "people_automation_run",
        entity_id: tenantId,
        entity_name: "Automação Pessoas",
        user_id: actorId,
        from_state: null,
        to_state: JSON.stringify({
          tasks_created: tasksCreated.length,
          alerts_logged: alertsLogged.length,
          skipped_duplicates: skippedDuplicates,
        }),
        metadata: JSON.stringify({
          tasks: tasksCreated.map((t) => ({ trigger: t.trigger, person: t.personName })),
          alerts: alertsLogged.map((a) => ({ trigger: a.trigger, person: a.personName })),
        }),
        created_at: new Date().toISOString(),
        tenant_id: tenantId,
      } as never);
    } catch {
      // Non-blocking
    }
  }

  return { enabled: true, tasksCreated, alertsLogged, skippedDuplicates };
}
