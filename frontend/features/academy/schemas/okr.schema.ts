import { z } from "zod";

export const keyResultSchema = z.object({
  id: z.string().uuid(),
  description: z.string().min(1),
  currentValue: z.number().min(0),
  targetValue: z.number().min(1),
  unit: z.string(),
});

export const okrSchema = z.object({
  id: z.string().uuid(),
  objective: z.string().min(1),
  ownerName: z.string(),
  deadline: z.string().datetime(),
  keyResults: z.array(keyResultSchema),
});

export type KeyResult = z.infer<typeof keyResultSchema>;
export type OKR = z.infer<typeof okrSchema>;
