import { z } from "zod";

export const rewardItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  pointsCost: z.number().int().min(0),
  imageUrl: z.string().url().optional(),
  available: z.boolean(),
});

export const milestoneSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  pointsRequired: z.number().int().min(0),
  reached: z.boolean(),
});

export const rewardsSchema = z.object({
  pointsBalance: z.number().int().min(0),
  wishlist: z.array(rewardItemSchema),
  milestones: z.array(milestoneSchema),
});

export type RewardItem = z.infer<typeof rewardItemSchema>;
export type Milestone = z.infer<typeof milestoneSchema>;
export type Rewards = z.infer<typeof rewardsSchema>;
