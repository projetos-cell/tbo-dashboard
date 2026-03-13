import type { TaskFilters } from "@/schemas/task";

/**
 * Structured query keys for all task-related entities.
 * Follows TanStack Query key factory pattern.
 *
 * Usage:
 *   useQuery({ queryKey: taskKeys.list({ project_id: '...' }), queryFn: ... })
 *   queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
 */
export const taskKeys = {
  // ─── Tasks ──────────────────────────────────────────
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters?: TaskFilters) => [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,

  // ─── Sub-resources (scoped to a task) ───────────────
  subtasks: (taskId: string) =>
    [...taskKeys.detail(taskId), "subtasks"] as const,
  comments: (taskId: string) =>
    [...taskKeys.detail(taskId), "comments"] as const,
  attachments: (taskId: string) =>
    [...taskKeys.detail(taskId), "attachments"] as const,
  dependencies: (taskId: string) =>
    [...taskKeys.detail(taskId), "dependencies"] as const,
  collaborators: (taskId: string) =>
    [...taskKeys.detail(taskId), "collaborators"] as const,
  customFields: (taskId: string) =>
    [...taskKeys.detail(taskId), "custom-fields"] as const,
  tags: (taskId: string) =>
    [...taskKeys.detail(taskId), "tags"] as const,

  // ─── Likes (polymorphic) ────────────────────────────
  likes: (targetType: string, targetId: string) =>
    ["likes", targetType, targetId] as const,
};

// ─── Tags (org-level) ─────────────────────────────────
export const tagKeys = {
  all: ["tags"] as const,
  list: (tenantId: string) => [...tagKeys.all, tenantId] as const,
};

// ─── Custom Field Definitions (org-level) ─────────────
export const fieldDefinitionKeys = {
  all: ["field-definitions"] as const,
  list: (tenantId: string) =>
    [...fieldDefinitionKeys.all, tenantId] as const,
};

// ─── My Tasks (personal space) ────────────────────────
export const myTasksKeys = {
  all: ["my-tasks"] as const,
  tasks: (userId: string) => [...myTasksKeys.all, "tasks", userId] as const,
  sections: (userId: string) =>
    [...myTasksKeys.all, "sections", userId] as const,
  order: (userId: string) => [...myTasksKeys.all, "order", userId] as const,
  preferences: (userId: string) =>
    [...myTasksKeys.all, "preferences", userId] as const,
};
