import { z } from "zod";

export const blogPostSchema = z.object({
  title: z.string().min(1, "Titulo obrigatorio").max(200),
  slug: z
    .string()
    .min(1, "Slug obrigatorio")
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug deve conter apenas letras minusculas, numeros e hifens"),
  excerpt: z.string().max(500).nullable().optional(),
  body: z.string().default(""),
  cover_url: z.string().url().nullable().optional(),
  status: z.enum(["rascunho", "revisao", "publicado", "arquivado"]).default("rascunho"),
  author_id: z.string().uuid().nullable().optional(),
  published_at: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
});

export type BlogPostFormValues = z.infer<typeof blogPostSchema>;

/** Generate URL-friendly slug from title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "") // remove special chars
    .trim()
    .replace(/\s+/g, "-") // spaces to hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .slice(0, 200);
}
