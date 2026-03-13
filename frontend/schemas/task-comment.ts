import { z } from "zod";

// ────────────────────────────────────────────────────
// Row schema
// ────────────────────────────────────────────────────

export const TaskCommentSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  author_id: z.string().uuid(),
  content: z.record(z.string(), z.unknown()), // JSONB (rich text / TipTap)
  parent_comment_id: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type TaskComment = z.infer<typeof TaskCommentSchema>;

// ────────────────────────────────────────────────────
// Create schema
// ────────────────────────────────────────────────────

export const CreateCommentSchema = z.object({
  task_id: z.string().uuid(),
  content: z.record(z.string(), z.unknown()),
  parent_comment_id: z.string().uuid().optional(),
});
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;

// ────────────────────────────────────────────────────
// Update schema
// ────────────────────────────────────────────────────

export const UpdateCommentSchema = z.object({
  content: z.record(z.string(), z.unknown()),
});
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
