import { z } from "zod";

export const userStatsSchema = z.object({
  progressPercent: z.number().min(0).max(100),
  level: z.number().int().min(1),
  levelLabel: z.string(),
  xpCurrent: z.number().int().min(0),
  xpNext: z.number().int().min(1),
  lessonsCompleted: z.number().int().min(0),
  lessonsTotal: z.number().int().min(0),
  certificatesCount: z.number().int().min(0),
});

export type UserStats = z.infer<typeof userStatsSchema>;
