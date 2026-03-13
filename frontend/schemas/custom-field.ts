import { z } from "zod";

// ────────────────────────────────────────────────────
// Enums
// ────────────────────────────────────────────────────

export const FieldTypeEnum = z.enum([
  "text",
  "number",
  "select",
  "multi_select",
  "date",
  "person",
  "checkbox",
]);
export type FieldType = z.infer<typeof FieldTypeEnum>;

// ────────────────────────────────────────────────────
// Option (for select / multi_select)
// ────────────────────────────────────────────────────

export const FieldOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  color: z.string().optional(),
});
export type FieldOption = z.infer<typeof FieldOptionSchema>;

// ────────────────────────────────────────────────────
// Definition schema
// ────────────────────────────────────────────────────

export const CustomFieldDefinitionSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  name: z.string().min(1).max(100),
  field_type: FieldTypeEnum,
  options: z.array(FieldOptionSchema).default([]),
  is_required: z.boolean().default(false),
  created_by: z.string().uuid(),
  created_at: z.string(),
});
export type CustomFieldDefinition = z.infer<typeof CustomFieldDefinitionSchema>;

// ────────────────────────────────────────────────────
// Create definition
// ────────────────────────────────────────────────────

export const CreateFieldDefinitionSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  field_type: FieldTypeEnum,
  options: z.array(FieldOptionSchema).optional(),
  is_required: z.boolean().optional(),
});
export type CreateFieldDefinitionInput = z.infer<
  typeof CreateFieldDefinitionSchema
>;

// ────────────────────────────────────────────────────
// Value schema (task_custom_field_values)
// ────────────────────────────────────────────────────

export const TaskCustomFieldValueSchema = z.object({
  task_id: z.string().uuid(),
  field_id: z.string().uuid(),
  value: z.unknown(),
});
export type TaskCustomFieldValue = z.infer<typeof TaskCustomFieldValueSchema>;
