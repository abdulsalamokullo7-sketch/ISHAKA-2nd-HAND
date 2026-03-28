import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { inferImageContentType, imageExtensionForUpload } from "@/lib/imageUpload";
import { buildPublicUrl, uploadObjectToR2 } from "@/lib/r2/server";

export const runtime = "nodejs";
/** Large uploads should use presigned PUT (see storageUpload.ts); allow generous POST for self‑hosted. */
export const maxDuration = 120;

/**
 * Same path rules as /api/storage/presign — only these prefixes are allowed.
 */
const ALLOWED_BASE =
  /^(items\/[a-zA-Z0-9_-]+(\/student-id)?|sell-requests\/[a-zA-Z0-9_-]+)$/;

function maxUploadBytes(): number | null {
  const raw = process.env.R2_UPLOAD_MAX_BYTES?.trim();
  if (raw === "" || raw === undefined) return 100 * 1024 * 1024; // 100 MB default (local / VPS)
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null; // no cap (not recommended on shared hosting)
  return Math.floor(n);
}

/**
 * Multipart upload to R2 from the Next.js server (same-origin for the browser).
 * Avoids "Failed to fetch" from missing R2 CORS on direct presigned PUTs.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization" },
        { status: 401 },
      );
    }
    const idToken = authHeader.slice(7);
    await verifyFirebaseIdToken(idToken);

    const formData = await req.formData();
    const file = formData.get("file");
    const basePathRaw = formData.get("basePath");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const basePath = typeof basePathRaw === "string" ? basePathRaw.trim() : "";
    if (!basePath || !ALLOWED_BASE.test(basePath)) {
      return NextResponse.json({ error: "Invalid basePath" }, { status: 400 });
    }

    const contentType = inferImageContentType(file);
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 },
      );
    }

    const cap = maxUploadBytes();
    if (cap !== null && file.size > cap) {
      return NextResponse.json(
        {
          error: `Image too large for this upload path (${Math.round(cap / (1024 * 1024))} MB server cap). Try a smaller file, or the app will use direct storage upload for large photos if R2 CORS is configured.`,
        },
        { status: 413 },
      );
    }

    const ext = imageExtensionForUpload(file, contentType);
    const key = `${basePath}/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await uploadObjectToR2(key, buffer, contentType);

    return NextResponse.json({ publicUrl: buildPublicUrl(key), key });
  } catch (e) {
    console.error("[storage/upload]", e);
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
