import { z } from "zod";

export const CreateReviewProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  client_name: z.string().optional(),
  project_id: z.string().nullable().optional(),
  description: z.string().optional(),
});

export type CreateReviewProjectInput = z.infer<typeof CreateReviewProjectSchema>;

export const UpdateReviewProjectSchema = CreateReviewProjectSchema.partial().extend({
  workflow_stage: z
    .enum([
      "clay_approval",
      "internal_preview",
      "client_review",
      "revisions",
      "final_approval",
      "delivered",
    ])
    .optional(),
  status: z
    .enum(["draft", "active", "paused", "completed", "archived"])
    .optional(),
});

export type UpdateReviewProjectInput = z.infer<typeof UpdateReviewProjectSchema>;
