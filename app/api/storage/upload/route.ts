import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { buildPublicUrl, uploadObjectToR2 } from "@/lib/r2/server";

export const runtime = "nodejs";

/**
 * Same path rules as /api/storage/presign — only these prefixes are allowed.
 */
const ALLOWED_BASE =
  /^(items\/[a-zA-Z0-9_-]+(\/student-id)?|sell-requests\/[a-zA-Z0-9_-]+)$/;

/** ~4 MiB — keeps under typical Vercel Hobby request limits; raise if you self-host. */
const MAX_BYTES = 4 * 1024 * 1024;

function sanitizeExtension(name: string): string {
  const e =
    name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) || "jpg";
  if (!e || e === "jpeg") return "jpg";
  return e;
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

    const contentType = file.type || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are allowed" },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error: `Image too large (max ${Math.floor(MAX_BYTES / (1024 * 1024))} MB per file on this deployment).`,
        },
        { status: 413 },
      );
    }

    const ext = sanitizeExtension(file.name);
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
