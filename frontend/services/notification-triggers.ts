import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type NotificationInsert = Database["public"]["Tables"]["notifications"]["Insert"];

// ─── Trigger types ───
export type NotificationTrigger =
  | "mention"
  | "thread_reply"
  | "task_assigned"
  | "task_updated"
  | "task_overdue";

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
    .from("thread_subscriptions" as never)
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
    .from("thread_subscriptions" as never)
    .select("user_id" as never)
    .eq("entity_type" as never, entityType as never)
    .eq("entity_id" as never, entityId as never)
    .eq("is_muted" as never, false as never);

  return ((data ?? []) as unknown as Array<{ user_id: string }>).map((s) => s.user_id);
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
      title: `${actorName} mencionou você em "${taskTitle}"`,
      body: preview,
      action_url: `/tarefas?task=${taskId}`,
      read: false,
    } as NotificationInsert);
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
      title: `${actorName} comentou em "${taskTitle}"`,
      body: preview,
      action_url: `/tarefas?task=${taskId}`,
      read: false,
    } as NotificationInsert);
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
    read: false,
  } as NotificationInsert);
}

// ─── E) Overdue task notifications ───

/**
 * Checks for overdue tasks assigned to the given user and creates
 * task_overdue notifications for any that don't already have one today.
 * Called client-side on page load (once per session).
 */
export async function checkAndNotifyOverdueTasks(
  supabase: SupabaseClient<Database>,
  params: {
    tenantId: string;
    userId: string;
  }
): Promise<number> {
  const { tenantId, userId } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // Get overdue tasks assigned to this user
  const { data: overdueTasks, error: taskError } = await supabase
    .from("os_tasks")
    .select("id,title,due_date,assignee_id")
    .eq("assignee_id", userId)
    .eq("is_completed", false)
    .lt("due_date", todayStr.split("T")[0])
    .is("parent_id", null);

  if (taskError || !overdueTasks || overdueTasks.length === 0) return 0;

  // Check which tasks already have overdue notifications today
  const { data: existingNotifs } = await supabase
    .from("notifications")
    .select("entity_id")
    .eq("user_id", userId)
    .eq("trigger_type", "task_overdue")
    .gte("created_at", todayStr);

  const alreadyNotified = new Set(
    (existingNotifs ?? []).map((n) => n.entity_id)
  );

  let created = 0;
  for (const task of overdueTasks) {
    if (alreadyNotified.has(task.id)) continue;

    const daysOverdue = Math.floor(
      (Date.now() - new Date(task.due_date!).getTime()) / (1000 * 60 * 60 * 24)
    );

    await insertNotification(supabase, {
      user_id: userId,
      tenant_id: tenantId,
      trigger_type: "task_overdue",
      type: "task",
      entity_type: "task",
      entity_id: task.id,
      title: `Tarefa atrasada: "${task.title}"`,
      body: `${daysOverdue} dia${daysOverdue !== 1 ? "s" : ""} de atraso`,
      action_url: `/tarefas?task=${task.id}`,
      read: false,
    } as NotificationInsert);
    created++;
  }

  return created;
}

// ─── F) Reminder notifications ───

/**
 * Checks for tasks with reminder_days set and creates reminder notifications
 * when due_date - reminder_days <= today.
 */
export async function checkAndNotifyReminders(
  supabase: SupabaseClient<Database>,
  params: {
    tenantId: string;
    userId: string;
  }
): Promise<number> {
  const { tenantId, userId } = params;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // Get tasks with reminders assigned to this user
  const { data: tasks, error } = await supabase
    .from("os_tasks")
    .select("id,title,due_date,reminder_days")
    .eq("assignee_id", userId)
    .eq("is_completed", false)
    .not("reminder_days", "is", null)
    .gt("reminder_days", 0)
    .is("parent_id", null);

  if (error || !tasks || tasks.length === 0) return 0;

  // Check which tasks already have reminder notifications today
  const { data: existingNotifs } = await supabase
    .from("notifications")
    .select("entity_id")
    .eq("user_id", userId)
    .eq("trigger_type", "task_reminder" as never)
    .gte("created_at", todayStr);

  const alreadyNotified = new Set(
    (existingNotifs ?? []).map((n) => n.entity_id)
  );

  let created = 0;
  for (const task of tasks) {
    if (!task.due_date || alreadyNotified.has(task.id)) continue;

    const reminderDays = (task as Record<string, unknown>).reminder_days as number;
    const dueDate = new Date(task.due_date);
    const reminderDate = new Date(dueDate);
    reminderDate.setDate(reminderDate.getDate() - reminderDays);
    reminderDate.setHours(0, 0, 0, 0);

    if (today >= reminderDate && today < dueDate) {
      const daysUntilDue = Math.ceil(
        (dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      await insertNotification(supabase, {
        user_id: userId,
        tenant_id: tenantId,
        trigger_type: "task_reminder" as never,
        type: "task",
        entity_type: "task",
        entity_id: task.id,
        title: `Lembrete: "${task.title}"`,
        body: `Vence em ${daysUntilDue} dia${daysUntilDue !== 1 ? "s" : ""}`,
        action_url: `/tarefas?task=${task.id}`,
        read: false,
      } as NotificationInsert);
      created++;
    }
  }

  return created;
}
