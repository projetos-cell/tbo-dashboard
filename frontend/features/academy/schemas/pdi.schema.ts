import { z } from "zod";

export const pdiSkillSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(["hard", "soft"]),
  currentLevel: z.number().min(0).max(100),
  targetLevel: z.number().min(0).max(100),
  timeframe: z.string(),
});

export const pdiActionSchema = z.object({
  id: z.string().uuid(),
  action: z.string().min(1),
  status: z.enum(["pending", "in_progress", "done"]),
  deadline: z.string().datetime(),
  completed: z.boolean(),
});

export const pdiSchema = z.object({
  skills: z.array(pdiSkillSchema),
  actions: z.array(pdiActionSchema),
});

export type PDISkill = z.infer<typeof pdiSkillSchema>;
export type PDIAction = z.infer<typeof pdiActionSchema>;
export type PDI = z.infer<typeof pdiSchema>;
