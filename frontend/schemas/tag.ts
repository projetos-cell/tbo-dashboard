import { z } from "zod";

// ────────────────────────────────────────────────────
// Row schema
// ────────────────────────────────────────────────────

export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  color: z.string().nullable(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string(),
});
export type Tag = z.infer<typeof TagSchema>;

// ────────────────────────────────────────────────────
// Create schema
// ────────────────────────────────────────────────────

export const CreateTagSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(50),
  color: z.string().optional(),
});
export type CreateTagInput = z.infer<typeof CreateTagSchema>;

// ────────────────────────────────────────────────────
// Task-Tag junction
// ────────────────────────────────────────────────────

export const TaskTagSchema = z.object({
  task_id: z.string().uuid(),
  tag_id: z.string().uuid(),
});
export type TaskTag = z.infer<typeof TaskTagSchema>;
