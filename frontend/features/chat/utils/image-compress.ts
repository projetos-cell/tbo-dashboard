/**
 * Feature #41 — Client-side image compression before upload.
 * Uses Canvas API to resize and compress images.
 * Non-image files are returned unchanged.
 */

const COMPRESSIBLE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface CompressOptions {
  /** Max width/height in pixels (maintains aspect ratio). Default: 1920 */
  maxDimension?: number;
  /** JPEG/WebP quality 0-1. Default: 0.82 */
  quality?: number;
  /** Only compress if original > this size in bytes. Default: 512KB */
  minSizeToCompress?: number;
}

/**
 * Compress an image File using the Canvas API.
 * Returns a new File with reduced dimensions/quality, or the original if:
 * - Not a compressible image type (gif, svg, etc.)
 * - Already small enough
 * - Canvas API unavailable (SSR/test)
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const {
    maxDimension = 1920,
    quality = 0.82,
    minSizeToCompress = 512 * 1024, // 512 KB
  } = options;

  // Skip if not a compressible type
  if (!COMPRESSIBLE_TYPES.includes(file.type)) return file;
  // Skip if already small
  if (file.size < minSizeToCompress) return file;
  // Skip if no canvas (SSR)
  if (typeof window === "undefined" || !window.document?.createElement) return file;

  return new Promise<File>((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      const { width, height } = img;
      let targetW = width;
      let targetH = height;

      // Scale down if needed
      if (width > maxDimension || height > maxDimension) {
        const ratio = Math.min(maxDimension / width, maxDimension / height);
        targetW = Math.round(width * ratio);
        targetH = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Use jpeg for jpeg originals, webp otherwise (better compression)
      const outputType = file.type === "image/jpeg" ? "image/jpeg" : "image/webp";

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          // Only use compressed version if it's actually smaller
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }
          const ext = outputType === "image/jpeg" ? ".jpg" : ".webp";
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(new File([blob], `${baseName}${ext}`, { type: outputType }));
        },
        outputType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback to original on error
    };

    img.src = url;
  });
}

/**
 * Compress multiple files — images are compressed, others pass through.
 */
export async function compressFiles(
  files: File[],
  options?: CompressOptions,
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImage(f, options)));
}

/**
 * Format compression savings for display.
 */
export function formatSavings(originalSize: number, compressedSize: number): string {
  const saved = originalSize - compressedSize;
  const pct = Math.round((saved / originalSize) * 100);
  const savedKb = (saved / 1024).toFixed(0);
  return `${pct}% (${savedKb} KB poupados)`;
}
