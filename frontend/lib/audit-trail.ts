import { createClient } from "@/lib/supabase/client";

export type AuditAction = "create" | "update" | "delete" | "status_change" | "permission_change";

interface AuditEntry {
  userId: string;
  action: AuditAction;
  table: string;
  recordId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

/**
 * Logs a critical change to the audit trail.
 * Used for: RBAC changes, financial data, OKR updates, project status changes.
 * Non-blocking: logs asynchronously, never throws to caller.
 */
export async function logAuditTrail({
  userId,
  action,
  table,
  recordId,
  before = null,
  after = null,
  metadata,
}: AuditEntry): Promise<void> {
  try {
    const supabase = createClient();
    await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      entity_type: table,
      entity_id: recordId,
      from_state: before ? JSON.stringify(before) : null,
      to_state: after ? JSON.stringify(after) : null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      created_at: new Date().toISOString(),
    } as never);
  } catch (error) {
    // Audit logging should never break the main flow
    console.error("[AuditTrail] Failed to log:", error);
  }
}
