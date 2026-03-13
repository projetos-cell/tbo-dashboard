import { z } from "zod";

// ────────────────────────────────────────────────────
// Row schema
// ────────────────────────────────────────────────────

export const TaskAttachmentSchema = z.object({
  id: z.string().uuid(),
  task_id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  file_name: z.string().min(1),
  file_url: z.string().url(),
  file_size: z.number().nullable(),
  mime_type: z.string().nullable(),
  created_at: z.string(),
});
export type TaskAttachment = z.infer<typeof TaskAttachmentSchema>;

// ────────────────────────────────────────────────────
// Create schema
// ────────────────────────────────────────────────────

export const CreateAttachmentSchema = z.object({
  task_id: z.string().uuid(),
  file_name: z.string().min(1),
  file_url: z.string().url(),
  file_size: z.number().optional(),
  mime_type: z.string().optional(),
});
export type CreateAttachmentInput = z.infer<typeof CreateAttachmentSchema>;
