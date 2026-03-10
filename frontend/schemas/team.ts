import { z } from "zod";

// ────────────────────────────────────────────────────
// Role enum — matches lib/permissions.ts RoleSlug
// ────────────────────────────────────────────────────

const RoleEnum = z.enum(["founder", "diretoria", "lider", "colaborador"]);

// ────────────────────────────────────────────────────
// Base schemas
// ────────────────────────────────────────────────────

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email("E-mail inválido"),
  full_name: z
    .string()
    .min(2, "Nome precisa ter ao menos 2 caracteres")
    .max(100),
  avatar_url: z.string().url().nullable().optional(),
  role: RoleEnum,
  department: z.string().max(50).nullable().optional(),
  is_active: z.boolean().default(true),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

// ────────────────────────────────────────────────────
// Mutation schemas (forms)
// ────────────────────────────────────────────────────

export const InviteUserSchema = z.object({
  email: z.string().email("E-mail inválido"),
  full_name: z
    .string()
    .min(2, "Nome precisa ter ao menos 2 caracteres")
    .max(100),
  role: RoleEnum,
  department: z.string().max(50).optional(),
});

export type InviteUserInput = z.infer<typeof InviteUserSchema>;

export const UpdateUserSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2).max(100).optional(),
  role: RoleEnum.optional(),
  department: z.string().max(50).nullable().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const ChangeRoleSchema = z.object({
  id: z.string().uuid(),
  role: RoleEnum,
});

export type ChangeRoleInput = z.infer<typeof ChangeRoleSchema>;

// ────────────────────────────────────────────────────
// Filter schema
// ────────────────────────────────────────────────────

export const TeamFiltersSchema = z.object({
  search: z.string().optional(),
  role: RoleEnum.optional(),
  is_active: z.boolean().optional(),
});

export type TeamFilters = z.infer<typeof TeamFiltersSchema>;
