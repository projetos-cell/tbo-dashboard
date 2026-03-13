import { z } from "zod";

// ────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────

export const DependencyTypeEnum = z.enum([
  "finish_to_start",
  "start_to_start",
  "finish_to_finish",
  "start_to_finish",
]);
export type DependencyType = z.infer<typeof DependencyTypeEnum>;

// ────────────────────────────────────────────────────
// Row schema
// ────────────────────────────────────────────────────

export const TaskDependencySchema = z.object({
  id: z.string().uuid(),
  predecessor_id: z.string().uuid(),
  successor_id: z.string().uuid(),
  dependency_type: DependencyTypeEnum.default("finish_to_start"),
  created_at: z.string(),
});
export type TaskDependency = z.infer<typeof TaskDependencySchema>;

// ────────────────────────────────────────────────────
// Create schema
// ────────────────────────────────────────────────────

export const CreateDependencySchema = z.object({
  predecessor_id: z.string().uuid(),
  successor_id: z.string().uuid(),
  dependency_type: DependencyTypeEnum.optional(),
});
export type CreateDependencyInput = z.infer<typeof CreateDependencySchema>;
