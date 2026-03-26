import { z } from "zod";

// ── Project schema ──────────────────────────────────────────
export const websiteProjectSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(200),
  slug: z
    .string()
    .min(1, "Slug obrigatório")
    .max(200)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug deve conter apenas letras minúsculas, números e hífens",
    ),
  client_name: z.string().max(200).nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  year: z.coerce.number().int().min(2000).max(2099).nullable().optional(),
  category: z.string().default("branding"),
  cover_url: z.string().url().nullable().optional(),
  gallery: z.array(z.string().url()).default([]),
  description: z.string().default(""),
  highlights: z.array(z.string()).default([]),
  services: z.array(z.string()).default([]),
  testimonial_text: z.string().max(1000).nullable().optional(),
  testimonial_author: z.string().max(200).nullable().optional(),
  status: z.enum(["rascunho", "publicado", "arquivado"]).default("rascunho"),
  sort_order: z.coerce.number().int().default(0),
  seo_title: z.string().max(70).nullable().optional(),
  seo_description: z.string().max(160).nullable().optional(),
  published_at: z.string().nullable().optional(),
});

export type WebsiteProjectFormValues = z.infer<typeof websiteProjectSchema>;

// ── Section schema ──────────────────────────────────────────
export const websiteSectionSchema = z.object({
  title: z.string().max(200).nullable().optional(),
  subtitle: z.string().max(500).nullable().optional(),
  content: z.record(z.string(), z.unknown()).default({}),
  media_url: z.string().url().nullable().optional(),
  cta_label: z.string().max(100).nullable().optional(),
  cta_url: z.string().max(500).nullable().optional(),
  is_visible: z.boolean().default(true),
});

export type WebsiteSectionFormValues = z.infer<typeof websiteSectionSchema>;

// ── Settings schema ─────────────────────────────────────────
export const websiteSettingsSchema = z.object({
  site_title: z.string().min(1).max(100),
  site_description: z.string().max(300).nullable().optional(),
  logo_url: z.string().url().nullable().optional(),
  favicon_url: z.string().url().nullable().optional(),
  social_links: z
    .object({
      instagram: z.string().max(300).optional(),
      linkedin: z.string().max(300).optional(),
      youtube: z.string().max(300).optional(),
      behance: z.string().max(300).optional(),
      vimeo: z.string().max(300).optional(),
    })
    .default({}),
  contact_email: z.string().email().nullable().optional(),
  contact_phone: z.string().max(30).nullable().optional(),
  contact_address: z.string().max(500).nullable().optional(),
  analytics_id: z.string().max(50).nullable().optional(),
});

export type WebsiteSettingsFormValues = z.infer<typeof websiteSettingsSchema>;

/** Generate URL-friendly slug from name */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 200);
}
