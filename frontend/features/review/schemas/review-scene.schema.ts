import { z } from "zod";

export const CreateReviewSceneSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  scene_type: z.enum(["still", "animation", "panorama", "video"]).default("still"),
});

export type CreateReviewSceneInput = z.infer<typeof CreateReviewSceneSchema>;

export const UpdateReviewSceneSchema = CreateReviewSceneSchema.partial().extend({
  sort_order: z.number().optional(),
});

export type UpdateReviewSceneInput = z.infer<typeof UpdateReviewSceneSchema>;
