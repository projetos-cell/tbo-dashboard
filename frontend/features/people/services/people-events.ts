import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { createLogger } from "@/lib/logger";

const log = createLogger("people-events");

// ---------------------------------------------------------------------------
// Fase 7 — TIMELINE VIVA (People Events)
// Append-only event log for organizational changes per person.
// Non-blocking: never throws to caller — logs warning on failure.
// ---------------------------------------------------------------------------

// people_events table is not in generated types yet — define locally
interface EventRow {
  id: string;
  tenant_id: string;
  person_id: string;
  event_type: string;
  severity: string;
  metadata: unknown;
  created_by: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PeopleEventType =
  | "auto_task_created"
  | "one_on_one_completed"
  | "pdi_updated"
  | "performance_changed"
  | "status_changed"
  | "recognition_received"
  | "overload_detected";

export type EventSeverity = "info" | "warning" | "critical";

export interface PeopleEventMetadata {
  /** Human-readable summary of the event */
  summary?: string;
  /** Trigger that generated this event (for automation-generated events) */
  trigger?: string;
  /** Old value (for change events) */
  old_value?: string | number | null;
  /** New value (for change events) */
  new_value?: string | number | null;
  /** Extra context */
  [key: string]: unknown;
}

export interface PeopleEventsFilter {
  personId?: string;
  eventType?: PeopleEventType;
  severity?: EventSeverity;
}

// ---------------------------------------------------------------------------
// Emit — non-blocking insert (fire-and-forget)
// ---------------------------------------------------------------------------

export async function logPeopleEvent(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  personId: string,
  createdBy: string,
  eventType: PeopleEventType,
  severity: EventSeverity,
  metadata?: PeopleEventMetadata
): Promise<void> {
  try {
    await supabase.from("people_events" as never).insert({
      tenant_id: tenantId,
      person_id: personId,
      event_type: eventType,
      severity,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_by: createdBy,
      created_at: new Date().toISOString(),
    } as never);
  } catch (err) {
    log.warn("Failed to log event", { err: String(err) });
  }
}

// ---------------------------------------------------------------------------
// Dedup — check if a recent event of same type exists for same person
// ---------------------------------------------------------------------------

export async function hasRecentEvent(
  supabase: SupabaseClient<Database>,
  personId: string,
  eventType: PeopleEventType,
  withinHours = 24
): Promise<boolean> {
  try {
    const since = new Date(Date.now() - withinHours * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("people_events" as never)
      .select("id" as never)
      .eq("person_id" as never, personId as never)
      .eq("event_type" as never, eventType as never)
      .gte("created_at" as never, since as never)
      .limit(1);

    if (error) {
      log.warn("Dedup check failed", { error: error.message });
      return false;
    }

    return (data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Fetch — per-person timeline
// ---------------------------------------------------------------------------

export async function getPersonEvents(
  supabase: SupabaseClient<Database>,
  personId: string,
  limit = 50
): Promise<EventRow[]> {
  const { data, error } = await supabase
    .from("people_events" as never)
    .select("*" as never)
    .eq("person_id" as never, personId as never)
    .order("created_at" as never, { ascending: false } as never)
    .limit(limit);

  if (error) {
    log.warn("Failed to fetch person events", { personId, error: error.message });
    return [];
  }

  return (data ?? []) as unknown as EventRow[];
}

// ---------------------------------------------------------------------------
// Fetch — global timeline with filters
// ---------------------------------------------------------------------------

export async function getAllPeopleEvents(
  supabase: SupabaseClient<Database>,
  filters?: PeopleEventsFilter,
  limit = 100
): Promise<EventRow[]> {
  let query = supabase
    .from("people_events" as never)
    .select("*" as never);

  if (filters?.personId) {
    query = query.eq("person_id" as never, filters.personId as never);
  }
  if (filters?.eventType) {
    query = query.eq("event_type" as never, filters.eventType as never);
  }
  if (filters?.severity) {
    query = query.eq("severity" as never, filters.severity as never);
  }

  query = query
    .order("created_at" as never, { ascending: false } as never)
    .limit(limit);

  const { data, error } = await query;

  if (error) {
    log.warn("Failed to fetch all events", { error: error.message });
    return [];
  }

  return (data ?? []) as unknown as EventRow[];
}
