"use client";

import { compressImageFileForUpload } from "@/lib/compressImageForUpload";
import {
  FORM_UPLOAD_SAFE_MAX_BYTES,
  inferImageContentType,
  imageExtensionForUpload,
} from "@/lib/imageUpload";
import { getFirebaseAuth } from "./client";

async function getIdToken(): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to upload images.");
  return user.getIdToken();
}

async function uploadViaFormPost(
  basePath: string,
  file: File,
  contentType: string,
): Promise<string> {
  const idToken = await getIdToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("basePath", basePath);

  let res: Response;
  try {
    res = await fetch("/api/storage/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${idToken}` },
      body: formData,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error during upload.";
    throw new Error(
      `${msg} If this persists, check that the site is online and you are not offline.`,
    );
  }

  let data: { error?: string; publicUrl?: string };
  try {
    data = (await res.json()) as { error?: string; publicUrl?: string };
  } catch {
    throw new Error(`Upload failed (${res.status}: invalid response).`);
  }

  if (!res.ok) {
    const err = new Error(data.error ?? `Upload failed (${res.status}).`);
    (err as Error & { status?: number }).status = res.status;
    throw err;
  }
  if (!data.publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.");
  }
  return data.publicUrl;
}

async function uploadViaPresignedPut(
  basePath: string,
  file: File,
  contentType: string,
): Promise<string> {
  const idToken = await getIdToken();
  const extension = imageExtensionForUpload(file, contentType);

  let presignRes: Response;
  try {
    presignRes = await fetch("/api/storage/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        basePath,
        contentType,
        extension,
      }),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error.";
    throw new Error(
      `${msg} Could not start upload. If you are on a strict network, try Wi‑Fi.`,
    );
  }

  let presign: { error?: string; uploadUrl?: string; publicUrl?: string };
  try {
    presign = (await presignRes.json()) as {
      error?: string;
      uploadUrl?: string;
      publicUrl?: string;
    };
  } catch {
    throw new Error(`Upload setup failed (${presignRes.status}).`);
  }
  if (!presignRes.ok || !presign.uploadUrl || !presign.publicUrl) {
    throw new Error(
      presign.error ??
        "Could not get upload URL. Check R2 env vars and Firebase sign-in.",
    );
  }

  let putRes: Response;
  try {
    putRes = await fetch(presign.uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": contentType },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Network error";
    throw new Error(
      `${msg} Direct upload to storage failed. In Cloudflare R2 → your bucket → CORS, allow PUT from your site origin (see r2/cors.json in the repo).`,
    );
  }

  if (!putRes.ok) {
    throw new Error(
      `Storage rejected the file (${putRes.status}). Check R2 CORS and bucket permissions.`,
    );
  }
  return presign.publicUrl;
}

/**
 * Upload images to Cloudflare R2.
 * Every file is passed through {@link compressImageFileForUpload} first (same for admin inventory and sell-to-us).
 * - Small files: same-origin POST (works even if R2 CORS is not set).
 * - Large files (or POST 413): presigned PUT straight to R2 (needs CORS on the bucket).
 */
async function uploadOne(basePath: string, file: File): Promise<string> {
  const prepared = await compressImageFileForUpload(file);
  const contentType = inferImageContentType(prepared);
  if (!contentType.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const useFormFirst = prepared.size <= FORM_UPLOAD_SAFE_MAX_BYTES;

  if (useFormFirst) {
    try {
      return await uploadViaFormPost(basePath, prepared, contentType);
    } catch (e) {
      const status = (e as Error & { status?: number }).status;
      const msg = e instanceof Error ? e.message : "";
      const tooLarge =
        status === 413 || /too large|413|payload|body/i.test(msg);
      if (!tooLarge) throw e;
    }
  }

  return uploadViaPresignedPut(basePath, prepared, contentType);
}

export type UploadProgressPayload = {
  /** How many files have finished uploading (0 before first file starts). */
  completed: number;
  total: number;
  /** Current file name or short phase label. */
  label: string;
};

/** Uploads to R2; each image is resized/compressed in the browser when beneficial (shared by admin + public sell form). */
export async function uploadMany(
  basePath: string,
  files: File[],
  opts?: { onProgress?: (p: UploadProgressPayload) => void },
): Promise<string[]> {
  const urls: string[] = [];
  const total = files.length;
  if (total > 0) {
    opts?.onProgress?.({ completed: 0, total, label: "Starting…" });
  }
  for (let i = 0; i < total; i++) {
    const f = files[i]!;
    const label = f.name?.trim() || `Photo ${i + 1}`;
    opts?.onProgress?.({ completed: i, total, label });
    urls.push(await uploadOne(basePath, f));
    opts?.onProgress?.({ completed: i + 1, total, label });
  }
  return urls;
}
