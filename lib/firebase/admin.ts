import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function loadServiceAccountJson(): string {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
    ?.trim()
    .replace(/^\uFEFF/, "");
  if (inline) return inline;
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_FILE?.trim();
  if (filePath) {
    const absolute = resolve(process.cwd(), filePath);
    return readFileSync(absolute, "utf8").trim().replace(/^\uFEFF/, "");
  }
  throw new Error(
    "Set FIREBASE_SERVICE_ACCOUNT_KEY (one-line JSON) or FIREBASE_SERVICE_ACCOUNT_KEY_FILE (path to .json). Server-only.",
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
