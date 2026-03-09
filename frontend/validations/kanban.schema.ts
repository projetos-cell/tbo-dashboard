import { z } from "zod";

export const kanbanStatusSchema = z.enum(["backlog", "todo", "in-progress", "done", "canceled"]);

export const kanbanPrioritySchema = z.enum(["low", "medium", "high"]);

export const kanbanTaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  status: kanbanStatusSchema,
  label: z.string().optional(),
  priority: kanbanPrioritySchema,
  assignee: z
    .object({
      name: z.string(),
      avatarUrl: z.string().url().optional(),
    })
    .optional(),
});

// Tipos inferidos dos schemas — fonte única de verdade
export type KanbanStatus = z.infer<typeof kanbanStatusSchema>;
export type KanbanPriority = z.infer<typeof kanbanPrioritySchema>;
export type KanbanTask = z.infer<typeof kanbanTaskSchema>;
