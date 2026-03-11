import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

// ─── Trigger types ───
export type NotificationTrigger =
  | "mention"
  | "thread_reply"
  | "task_assigned"
  | "task_updated";

// ─── Helpers ───

async function insertNotification(
  supabase: SupabaseClient<Database>,
  notification: NotificationInsert
): Promise<void> {
  await supabase.from("notifications").insert(notification as never);
}

async function ensureSubscription(
  supabase: SupabaseClient<Database>,
  tenantId: string,
  entityType: string,
  entityId: string,
  userId: string
): Promise<void> {
  await supabase
    .from("thread_subscriptions")
    .upsert(
      {
        tenant_id: tenantId,
        entity_type: entityType,
        entity_id: entityId,
        user_id: userId,
      } as never,
      { onConflict: "entity_type,entity_id,user_id" }
    );
}

async function getSubscribers(
  supabase: SupabaseClient<Database>,
  entityType: string,
  entityId: string
): Promise<string[]> {
  const { data } = await supabase
    .from("thread_subscriptions")
    .select("user_id")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .eq("is_muted", false);

  return data?.map((s) => s.user_id) ?? [];
}

// ─── A) Comment notifications ───

/**
 * Called after creating a comment on a task.
 * 1. Auto-subscribes the commenter to the task thread
 * 2. Creates mention notifications for @mentioned users
 * 3. Creates thread_reply notifications for all other subscribers
 */
export async function notifyOnComment(
  supabase: SupabaseClient<Database>,
  params: {
    tenantId: string;
    actorId: string;
    actorName: string;
    taskId: string;
    taskTitle: string;
    commentId: string;
    commentContent: string;
    mentionedUserIds: string[];
  }
): Promise<void> {
  const {
    tenantId,
    actorId,
    actorName,
    taskId,
    taskTitle,
    commentId,
    commentContent,
    mentionedUserIds,
  } = params;

  const preview =
    commentContent.length > 120
      ? commentContent.slice(0, 120) + "..."
      : commentContent;

  // 1. Auto-subscribe the commenter
  await ensureSubscription(supabase, tenantId, "task", taskId, actorId);

  // 2. Mention notifications
  const mentionSet = new Set(mentionedUserIds);
  for (const userId of mentionSet) {
    if (userId === actorId) continue; // never notify self
    await insertNotification(supabase, {
      user_id: userId,
      tenant_id: tenantId,
      actor_id: actorId,
      trigger_type: "mention",
      type: "task",
      entity_type: "task",
      entity_id: taskId,
      comment_id: commentId,
      title: `${actorName} mencionou você em "${taskTitle}"`,
      body: preview,
      action_url: `/tarefas?task=${taskId}`,
      read: false,
    });
    // Also subscribe mentioned users
    await ensureSubscription(supabase, tenantId, "task", taskId, userId);
  }

  // 3. Thread reply notifications for all subscribers (except actor & already-mentioned)
  const subscribers = await getSubscribers(supabase, "task", taskId);
  for (const userId of subscribers) {
    if (userId === actorId) continue;
    if (mentionSet.has(userId)) continue; // already notified via mention
    await insertNotification(supabase, {
      user_id: userId,
      tenant_id: tenantId,
      actor_id: actorId,
      trigger_type: "thread_reply",
      type: "task",
      entity_type: "task",
      entity_id: taskId,
      comment_id: commentId,
      title: `${actorName} comentou em "${taskTitle}"`,
      body: preview,
      action_url: `/tarefas?task=${taskId}`,
      read: false,
    });
  }
}

// ─── B) Task assignment notification ───

/**
 * Called when assignee_id changes on a task.
 * Creates a task_assigned notification for the new assignee.
 */
export async function notifyTaskAssigned(
  supabase: SupabaseClient<Database>,
  params: {
    tenantId: string;
    actorId: string;
    actorName: string;
    taskId: string;
    taskTitle: string;
    newAssigneeId: string;
  }
): Promise<void> {
  const { tenantId, actorId, actorName, taskId, taskTitle, newAssigneeId } =
    params;

  if (newAssigneeId === actorId) return; // don't notify self-assignment

  await insertNotification(supabase, {
    user_id: newAssigneeId,
    tenant_id: tenantId,
    actor_id: actorId,
    trigger_type: "task_assigned",
    type: "task",
    entity_type: "task",
    entity_id: taskId,
    title: `${actorName} atribuiu você como responsável em "${taskTitle}"`,
    body: null,
    action_url: `/tarefas?task=${taskId}`,
    read: false,
  });
}

// ─── C) Chat mention notification ───

const MENTION_REGEX = /<@([a-f0-9-]+)>/g;

/** Extract unique user IDs from mention patterns in message content */
export function extractMentionIds(content: string): string[] {
  const ids = new Set<string>();
  let match: RegExpExecArray | null;
  MENTION_REGEX.lastIndex = 0;
  while ((match = MENTION_REGEX.exec(content)) !== null) {
    ids.add(match[1]);
  }
  return Array.from(ids);
}

/**
 * Called after sending a chat message that contains @mentions.
 * Creates a mention notification for each mentioned user (excluding self).
 */
export async function notifyOnChatMention(
  supabase: SupabaseClient<Database>,
  params: {
    tenantId: string;
    senderId: string;
    senderName: string;
    channelId: string;
    channelName: string;
    messageContent: string;
    mentionedUserIds: string[];
  }
): Promise<void> {
  const {
    tenantId,
    senderId,
    senderName,
    channelId,
    channelName,
    messageContent,
    mentionedUserIds,
  } = params;

  const preview =
    messageContent.length > 120
      ? messageContent.slice(0, 120) + "..."
      : messageContent;

  for (const userId of new Set(mentionedUserIds)) {
    if (userId === senderId) continue; // A.9: never notify self
    await insertNotification(supabase, {
      user_id: userId,
      tenant_id: tenantId,
      actor_id: senderId,
      trigger_type: "mention",
      type: "chat",
      entity_type: "chat_channel",
      entity_id: channelId,
      title: `${senderName} mencionou você em #${channelName}`,
      body: preview,
      action_url: `/chat?channel=${channelId}`,
      read: false,
    });
  }
}

// ─── D) Task updated notification ───

const TRACKED_FIELDS = [
  "status",
  "due_date",
  "priority",
  "title",
  "description",
  "section_id",
] as const;

const FIELD_LABELS: Record<string, string> = {
  status: "status",
  due_date: "prazo",
  priority: "prioridade",
  title: "título",
  description: "descrição",
  section_id: "coluna",
};

/**
 * Called when a task is updated.
 * Creates a task_updated notification for the current assignee (if not the actor).
 */
export async function notifyTaskUpdated(
  supabase: SupabaseClient<Database>,
  params: {
    tenantId: string;
    actorId: string;
    actorName: string;
    taskId: string;
    taskTitle: string;
    assigneeId: string | null;
    changedFields: Record<string, unknown>;
  }
): Promise<void> {
  const {
    tenantId,
    actorId,
    actorName,
    taskId,
    taskTitle,
    assigneeId,
    changedFields,
  } = params;

  if (!assigneeId || assigneeId === actorId) return;

  // Determine which tracked fields actually changed
  const relevantChanges = TRACKED_FIELDS.filter(
    (f) => f in changedFields
  );
  if (relevantChanges.length === 0) return;

  const changedLabels = relevantChanges
    .map((f) => FIELD_LABELS[f] ?? f)
    .join(", ");

  await insertNotification(supabase, {
    user_id: assigneeId,
    tenant_id: tenantId,
    actor_id: actorId,
    trigger_type: "task_updated",
    type: "task",
    entity_type: "task",
    entity_id: taskId,
    title: `${actorName} atualizou "${taskTitle}"`,
    body: `Campos alterados: ${changedLabels}`,
    action_url: `/tarefas?task=${taskId}`,
    meta: { changed_fields: relevantChanges, changes: changedFields },
    read: false,
  });
}
