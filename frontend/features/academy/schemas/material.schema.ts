import { z } from "zod";

export const materialSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(["template", "guide", "coming_soon"]),
  format: z.enum(["PDF", "DOCX", "XLSX", "FIGMA", "NOTION", "ZIP"]),
  downloadUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  createdAt: z.string().datetime(),
});

export type Material = z.infer<typeof materialSchema>;
