import { z } from "zod";

export const profileStepSchema = z.object({
  fullName: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  cargo: z
    .string()
    .min(2, "Cargo deve ter pelo menos 2 caracteres")
    .max(80, "Cargo muito longo"),
  department: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[\d\s()+-]{8,20}$/.test(v),
      "Formato de telefone invalido",
    ),
});

export type ProfileStepValues = z.infer<typeof profileStepSchema>;

export const preferencesStepSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  notificationsEnabled: z.boolean(),
});

export type PreferencesStepValues = z.infer<typeof preferencesStepSchema>;
