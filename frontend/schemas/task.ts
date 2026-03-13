import { z } from "zod";

// ────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────

export const TaskStatusEnum = z.enum([
  "pendente",
  "em_progresso",
  "em_revisao",
  "concluida",
  "cancelada",
  "bloqueada",
]);
export type TaskStatus = z.infer<typeof TaskStatusEnum>;

export const TaskPriorityEnum = z.enum(["baixa", "media", "alta", "urgente"]);
export type TaskPriority = z.infer<typeof TaskPriorityEnum>;

// ────────────────────────────────────────────────────
// Row schema (matches os_tasks table)
// ────────────────────────────────────────────────────

export const TaskSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  project_id: z.string().uuid().nullable(),
  section_id: z.string().uuid().nullable(),
  parent_id: z.string().uuid().nullable(),
  title: z.string().min(1).max(500),
  description: z.string().nullable(),
  status: z.string().default("pendente"),
  priority: z.string().nullable(),
  assignee_id: z.string().uuid().nullable(),
  assignee_name: z.string().nullable(),
  start_date: z.string().nullable(),
  due_date: z.string().nullable(),
  completed_at: z.string().nullable(),
  is_completed: z.boolean().nullable().default(false),
  order_index: z.number().int().default(0),
  legacy_demand_id: z.string().nullable(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});
export type Task = z.infer<typeof TaskSchema>;

// ────────────────────────────────────────────────────
// Create schema (forms / mutations)
// ────────────────────────────────────────────────────

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Título obrigatório").max(500),
  description: z.string().optional(),
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  assignee_id: z.string().uuid().optional(),
  assignee_name: z.string().optional(),
  project_id: z.string().uuid().optional(),
  section_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
});
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;

// ────────────────────────────────────────────────────
// Update schema
// ────────────────────────────────────────────────────

export const UpdateTaskSchema = z
  .object({
    title: z.string().min(1).max(500).optional(),
    description: z.string().nullable().optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.nullable().optional(),
    assignee_id: z.string().uuid().nullable().optional(),
    assignee_name: z.string().nullable().optional(),
    project_id: z.string().uuid().nullable().optional(),
    section_id: z.string().uuid().nullable().optional(),
    start_date: z.string().nullable().optional(),
    due_date: z.string().nullable().optional(),
    is_completed: z.boolean().optional(),
    order_index: z.number().int().optional(),
  })
  .refine(
    (data) => {
      if (data.start_date && data.due_date) {
        return new Date(data.start_date) <= new Date(data.due_date);
      }
      return true;
    },
    { message: "Data de início deve ser anterior à data de conclusão" }
  );
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;

// ────────────────────────────────────────────────────
// Filter schema (query params)
// ────────────────────────────────────────────────────

export const TaskFiltersSchema = z.object({
  status: TaskStatusEnum.optional(),
  priority: TaskPriorityEnum.optional(),
  assignee_name: z.string().optional(),
  assignee_id: z.string().uuid().optional(),
  project_id: z.string().uuid().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  search: z.string().optional(),
});
export type TaskFilters = z.infer<typeof TaskFiltersSchema>;
