/** Infer image/* MIME when the browser leaves `File.type` empty (common on some phones). */
export function inferImageContentType(file: File): string {
  const t = (file.type || "").toLowerCase().trim();
  if (t.startsWith("image/")) return t;
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const byExt: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    heic: "image/heic",
    heif: "image/heif",
    avif: "image/avif",
    tif: "image/tiff",
    tiff: "image/tiff",
  };
  return byExt[ext] ?? "image/jpeg";
}

/** Safe file extension for object keys (matches API presign/upload). */
export function imageExtensionForUpload(file: File, contentType: string): string {
  const fromName = file.name
    .split(".")
    .pop()
    ?.replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, 5);
  if (fromName && fromName.length > 0) {
    if (fromName === "jpeg") return "jpg";
    return fromName;
  }
  const fromCt: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
    "image/bmp": "bmp",
    "image/heic": "heic",
    "image/heif": "heif",
    "image/avif": "avif",
    "image/tiff": "tiff",
    "image/svg+xml": "svg",
  };
  return fromCt[contentType] ?? "jpg";
}

/**
 * Bodies larger than ~4MB often fail on Vercel serverless; use direct R2 PUT for those.
 * Keep a margin under the typical ~4.5MB platform cap (multipart adds overhead).
 */
export const FORM_UPLOAD_SAFE_MAX_BYTES = 3 * 1024 * 1024;
