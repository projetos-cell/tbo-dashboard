import { z } from "zod";

// ────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────

export const LikeTargetEnum = z.enum(["task", "comment"]);
export type LikeTarget = z.infer<typeof LikeTargetEnum>;

// ────────────────────────────────────────────────────
// Row schema
// ────────────────────────────────────────────────────

export const LikeSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  target_type: LikeTargetEnum,
  target_id: z.string().uuid(),
  created_at: z.string(),
});
export type Like = z.infer<typeof LikeSchema>;
