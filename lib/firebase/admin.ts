import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function loadServiceAccountJson(): string {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ?.trim()
    .replace(/^\uFEFF/, "");
  if (inline) return inline;

  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64?.trim();
  if (b64) {
    try {
      return Buffer.from(b64, "base64").toString("utf8").trim().replace(/^\uFEFF/, "");
    } catch {
      /* fall through */
    }
  }

  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE?.trim();
  if (filePath) {
    const absolute = resolve(process.cwd(), filePath);
    return readFileSync(absolute, "utf8").trim().replace(/^\uFEFF/, "");
  }

  throw new Error(
    "Firebase Admin is not configured. On Vercel: add env FIREBASE_SERVICE_ACCOUNT_KEY (entire service-account JSON as one line) or FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 (base64 of that JSON). " +
      "Get the JSON from Firebase Console → Project settings → Service accounts → Generate new private key. " +
      "Locally you can use FIREBASE_SERVICE_ACCOUNT_KEY_FILE=./firebase-admin-service-account.json in .env.local. " +
      "Do not use NEXT_PUBLIC_* for this — server-only.",
  );
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;
  const raw = loadServiceAccountJson();
  const credential = cert(JSON.parse(raw) as Record<string, unknown>);
  return initializeApp({ credential });
}

/** Verify a Firebase Auth ID token (email user or anonymous). Used by API routes. */
export async function verifyFirebaseIdToken(idToken: string) {
  const auth = getAuth(getAdminApp());
  return auth.verifyIdToken(idToken);
}
