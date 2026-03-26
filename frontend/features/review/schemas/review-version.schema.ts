import { z } from "zod";
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
} from "@/features/review/constants";

const ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

export function validateVersionFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `Arquivo excede o limite de ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Tipo de arquivo não permitido. Envie JPG, PNG, WebP, TIFF, AVIF, MP4, WebM ou MOV.";
  }
  return null;
}

export const VersionFileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size <= MAX_FILE_SIZE, {
      message: `Arquivo excede o limite de ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    })
    .refine((f) => ALLOWED_TYPES.includes(f.type), {
      message: "Tipo de arquivo não permitido.",
    }),
});

export type VersionFileInput = z.infer<typeof VersionFileSchema>;
