"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocFromCache,
  getDocFromServer,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { normalizeFirestoreImageUrls } from "@/lib/normalizeFirestoreImages";
import { getFirebaseDb } from "./client";
import type { Item, ItemStatus } from "@/lib/types";
import type { Category, Condition, RegionId } from "@/lib/constants";

/** Firestore rejects `undefined` field values — strip before write. */
function omitUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

function browserOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine;
}

function mapItem(id: string, data: DocumentData): Item {
  return {
    id,
    name: String(data.name ?? ""),
    price: Number(data.price ?? 0),
    description: String(data.description ?? ""),
    category: String(data.category ?? ""),
    condition: String(data.condition ?? ""),
    images: normalizeFirestoreImageUrls(data.images),
    location: String(data.location ?? ""),
    region: (data.region as RegionId) ?? "town",
    status: (data.status as ItemStatus) ?? "available",
    createdAt: data.createdAt ?? null,
    verified: Boolean(data.verified),
    phone: data.phone ? String(data.phone) : undefined,
    studentIdImage: data.studentIdImage ?? null,
    featured: Boolean(data.featured),
  };
}

export async function fetchItems(): Promise<Item[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, "items"), orderBy("createdAt", "desc"));

  async function fromLocalCacheFirst() {
    try {
      return (await getDocsFromCache(q)).docs.map((d) =>
        mapItem(d.id, d.data()),
      );
    } catch {
      return (await getDocs(q)).docs.map((d) => mapItem(d.id, d.data()));
    }
  }

  // Offline: never call getDocsFromServer (it always fails / never uses IndexedDB cache).
  if (browserOffline()) {
    return fromLocalCacheFirst();
  }

  // Online: prefer server so we don't show stale `images: []` right after publishing.
  try {
    return (await getDocsFromServer(q)).docs.map((d) =>
      mapItem(d.id, d.data()),
    );
  } catch {
    try {
      return (await getDocsFromCache(q)).docs.map((d) =>
        mapItem(d.id, d.data()),
      );
    } catch {
      return (await getDocs(q)).docs.map((d) => mapItem(d.id, d.data()));
    }
  }
}

export async function fetchAvailableItems(): Promise<Item[]> {
  const all = await fetchItems();
  return all.filter((i) => i.status === "available");
}

export async function fetchItemById(id: string): Promise<Item | null> {
  const db = getFirebaseDb();
  const ref = doc(db, "items", id);

  async function fromLocalCacheFirst() {
    try {
      const s = await getDocFromCache(ref);
      if (!s.exists()) return null;
      return mapItem(s.id, s.data());
    } catch {
      const s = await getDoc(ref);
      if (!s.exists()) return null;
      return mapItem(s.id, s.data());
    }
  }

  if (browserOffline()) {
    return fromLocalCacheFirst();
  }

  try {
    const s = await getDocFromServer(ref);
    if (!s.exists()) return null;
    return mapItem(s.id, s.data());
  } catch {
    try {
      const s = await getDocFromCache(ref);
      if (!s.exists()) return null;
      return mapItem(s.id, s.data());
    } catch {
      const s = await getDoc(ref);
      if (!s.exists()) return null;
      return mapItem(s.id, s.data());
    }
  }
}

export type ItemInput = {
  name: string;
  price: number;
  description: string;
  category: Category | string;
  condition: Condition | string;
  images: string[];
  location: string;
  region: RegionId;
  status?: ItemStatus;
  verified?: boolean;
  phone?: string;
  studentIdImage?: string | null;
  featured?: boolean;
};

export async function createItem(input: ItemInput): Promise<string> {
  const db = getFirebaseDb();
  const payload = omitUndefined({
    ...input,
    status: input.status ?? "available",
    createdAt: serverTimestamp(),
  }) as DocumentData;
  const ref = await addDoc(collection(db, "items"), payload);
  return ref.id;
}

export async function updateItem(id: string, patch: Partial<ItemInput>): Promise<void> {
  const db = getFirebaseDb();
  const cleaned = omitUndefined(patch as Record<string, unknown>) as DocumentData;
  if (Object.keys(cleaned).length === 0) return;
  await updateDoc(doc(db, "items", id), cleaned);
}

export async function deleteItem(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "items", id));
}
