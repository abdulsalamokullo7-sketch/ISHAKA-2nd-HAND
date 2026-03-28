"use client";

import { getFirebaseAuth } from "./client";

/**
 * Upload images to Cloudflare R2 via same-origin POST /api/storage/upload.
 * (Direct presigned PUT to R2 often fails with "Failed to fetch" until R2 CORS is configured.)
 */
async function uploadOne(basePath: string, file: File): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to upload images.");
  }
  const idToken = await user.getIdToken();
  const contentType = file.type || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("basePath", basePath);

  let res: Response;
  try {
    res = await fetch("/api/storage/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
      body: formData,
    });
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Network error during upload.";
    throw new Error(
      `${msg} If this persists, check that the dev server is running and you are not offline.`,
    );
  }

  let data: { error?: string; publicUrl?: string };
  try {
    data = (await res.json()) as { error?: string; publicUrl?: string };
  } catch {
    throw new Error(`Upload failed (${res.status}: invalid response).`);
  }

  if (!res.ok) {
    throw new Error(data.error ?? `Upload failed (${res.status}).`);
  }
  if (!data.publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.");
  }
  return data.publicUrl;
}

export async function uploadMany(
  basePath: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (const f of files) {
    urls.push(await uploadOne(basePath, f));
  }
  return urls;
}
