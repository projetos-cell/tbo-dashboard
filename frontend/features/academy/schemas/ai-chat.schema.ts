import { z } from "zod";

export const aiChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.string().datetime(),
});

export const aiChatRequestSchema = z.object({
  message: z.string().min(1).max(2000),
  context: z.enum(["academy", "pdi", "okr", "general"]).default("academy"),
});

export const aiChatResponseSchema = z.object({
  id: z.string().uuid(),
  message: aiChatMessageSchema,
  suggestions: z.array(z.string()).optional(),
});

export type AIChatMessage = z.infer<typeof aiChatMessageSchema>;
export type AIChatRequest = z.infer<typeof aiChatRequestSchema>;
export type AIChatResponse = z.infer<typeof aiChatResponseSchema>;
