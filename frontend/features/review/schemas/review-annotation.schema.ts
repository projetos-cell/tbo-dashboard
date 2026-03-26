import { z } from "zod";

export const CreateAnnotationSchema = z.object({
  content: z.string().min(1, "Comentário é obrigatório"),
  x_pct: z.number().min(0).max(100).nullable().optional(),
  y_pct: z.number().min(0).max(100).nullable().optional(),
});

export type CreateAnnotationInput = z.infer<typeof CreateAnnotationSchema>;

export const ReplyAnnotationSchema = z.object({
  content: z.string().min(1, "Resposta é obrigatória"),
});

export type ReplyAnnotationInput = z.infer<typeof ReplyAnnotationSchema>;
