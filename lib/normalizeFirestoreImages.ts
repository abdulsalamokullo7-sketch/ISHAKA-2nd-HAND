/**
 * Firestore `images` may be stored as a string[], a single URL string, or (rarely) a map-like object.
 */
export function normalizeFirestoreImageUrls(raw: unknown): string[] {
  if (raw == null) return [];
  if (typeof raw === "string") {
    const t = raw.trim();
    return t.length > 0 ? [t] : [];
  }
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const x of raw) {
      if (typeof x === "string") {
        const t = x.trim();
        if (t.length > 0) out.push(t);
      }
    }
    return out;
  }
  if (typeof raw === "object") {
    const out: string[] = [];
    for (const v of Object.values(raw as Record<string, unknown>)) {
      if (typeof v === "string") {
        const t = v.trim();
        if (t.length > 0) out.push(t);
      }
    }
    return out;
  }
  return [];
}
