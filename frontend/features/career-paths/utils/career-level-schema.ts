import { z } from "zod";

export const careerLevelSchema = z.object({
  pathId: z.string().min(1, "Selecione o núcleo"),
  levelId: z.string().min(1, "Selecione o nível"),
  notes: z.string().optional(),
});

export type CareerLevelFormValues = z.infer<typeof careerLevelSchema>;
