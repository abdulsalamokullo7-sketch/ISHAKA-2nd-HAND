"use client";

import { getFirebaseAuth } from "./client";

/**
 * Upload images to Cloudflare R2 via presigned PUT (see /api/storage/presign).
 * Firebase is used only for Auth (ID token). Firestore still stores the returned URLs.
 */
async function uploadOne(basePath: string, file: File): Promise<string> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to upload images.");
  }
  const idToken = await user.getIdToken();
  const ext =
    file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) ||
    "jpg";
  const contentType = file.type || "image/jpeg";
  if (!contentType.startsWith("image/")) {
    throw new Error("Only image files are allowed.");
  }

  const res = await fetch("/api/storage/presign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      basePath,
      contentType,
      extension: ext,
    }),
  });

  const data = (await res.json()) as {
    error?: string;
    uploadUrl?: string;
    publicUrl?: string;
  };
  if (!res.ok) {
    throw new Error(data.error ?? "Could not prepare upload.");
  }

  const put = await fetch(data.uploadUrl!, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": contentType },
  });
  if (!put.ok) {
    throw new Error(`Upload failed (${put.status})`);
  }
  return data.publicUrl!;
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
