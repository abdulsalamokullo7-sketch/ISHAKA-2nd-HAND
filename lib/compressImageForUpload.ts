import { inferImageContentType } from "@/lib/imageUpload";

/** Longest side in pixels (smaller = faster encode + upload, still fine for listings). */
const MAX_EDGE_PX = 1536;
/** JPEG quality (0–1). */
const JPEG_QUALITY = 0.78;
/**
 * Below this size, skip resize/re-encode — avoids long “Uploading” on mid-size phone JPEGs.
 * Large camera blobs still get compressed for the network.
 */
const COMPRESS_ONLY_IF_LARGER_THAN_BYTES = 520 * 1024;

function shouldTryCompress(contentType: string): boolean {
  if (!contentType.startsWith("image/")) return false;
  if (contentType === "image/svg+xml") return false;
  if (contentType === "image/gif") return false;
  return true;
}

/**
 * Resize and re-encode as JPEG when the file is big enough to justify the CPU cost.
 * Silent fallback to the original file if decode or canvas fails (e.g. some HEIC cases).
 */
export async function compressImageFileForUpload(file: File): Promise<File> {
  if (file.size <= COMPRESS_ONLY_IF_LARGER_THAN_BYTES) return file;

  const contentType = inferImageContentType(file);
  if (!shouldTryCompress(contentType)) return file;

  try {
    const bitmap = await createImageBitmap(file);
    try {
      let { width: w, height: h } = bitmap;
      if (w <= 0 || h <= 0) return file;

      // Already web-sized JPEG: decoding was the only cost; skip slow re-encode.
      if (
        w <= MAX_EDGE_PX &&
        h <= MAX_EDGE_PX &&
        contentType === "image/jpeg" &&
        file.size < 1.25 * 1024 * 1024
      ) {
        return file;
      }

      if (w > MAX_EDGE_PX || h > MAX_EDGE_PX) {
        if (w >= h) {
          h = Math.round((h * MAX_EDGE_PX) / w);
          w = MAX_EDGE_PX;
        } else {
          w = Math.round((w * MAX_EDGE_PX) / h);
          h = MAX_EDGE_PX;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) return file;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "low";
      ctx.drawImage(bitmap, 0, 0, w, h);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", JPEG_QUALITY);
      });
      if (!blob || blob.size === 0) return file;
      if (blob.size >= file.size * 0.98) return file;

      const stem =
        file.name.replace(/\.[^.]+$/, "").replace(/[^\w\-]+/g, "_").slice(0, 80) ||
        "photo";
      return new File([blob], `${stem}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
    } finally {
      bitmap.close();
    }
  } catch {
    return file;
  }
}
