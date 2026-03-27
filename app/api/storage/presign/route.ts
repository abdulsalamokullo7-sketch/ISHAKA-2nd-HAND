import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyFirebaseIdToken } from "@/lib/firebase/admin";
import { buildPublicUrl, createPresignedPutUrl } from "@/lib/r2/server";

export const runtime = "nodejs";

/**
 * Allowed object key prefixes (matches client upload paths).
 * items/{id} | items/{id}/student-id | sell-requests/{id}
 */
const ALLOWED_BASE = /^(items\/[a-zA-Z0-9_-]+(\/student-id)?|sell-requests\/[a-zA-Z0-9_-]+)$/;

function sanitizeExtension(ext: unknown): string {
  const e = String(ext ?? "jpg")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5);
  if (!e) return "jpg";
  if (e === "jpeg") return "jpg";
  return e;
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing or invalid Authorization" }, { status: 401 });
    }
    const idToken = authHeader.slice(7);
    await verifyFirebaseIdToken(idToken);

    const body = (await req.json()) as {
      basePath?: string;
      contentType?: string;
      extension?: string;
    };
    const basePath = body.basePath?.trim();
    if (!basePath || !ALLOWED_BASE.test(basePath)) {
      return NextResponse.json({ error: "Invalid basePath" }, { status: 400 });
    }

    const contentType = body.contentType?.trim() || "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json({ error: "Only image uploads are allowed" }, { status: 400 });
    }

    const ext = sanitizeExtension(body.extension);
    const key = `${basePath}/${Date.now()}-${randomBytes(8).toString("hex")}.${ext}`;

    const uploadUrl = await createPresignedPutUrl(key, contentType);
    const publicUrl = buildPublicUrl(key);

    return NextResponse.json({ uploadUrl, publicUrl, key });
  } catch (e) {
    console.error("[presign]", e);
    const message = e instanceof Error ? e.message : "Presign failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
