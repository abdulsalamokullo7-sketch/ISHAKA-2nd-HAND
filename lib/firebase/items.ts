"use client";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseDb } from "./client";
import type { Item, ItemStatus } from "@/lib/types";
import type { Category, Condition, RegionId } from "@/lib/constants";

function mapItem(id: string, data: DocumentData): Item {
  return {
    id,
    name: String(data.name ?? ""),
    price: Number(data.price ?? 0),
    description: String(data.description ?? ""),
    category: String(data.category ?? ""),
    condition: String(data.condition ?? ""),
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
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
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapItem(d.id, d.data()));
}

export async function fetchAvailableItems(): Promise<Item[]> {
  const all = await fetchItems();
  return all.filter((i) => i.status === "available");
}

export async function fetchItemById(id: string): Promise<Item | null> {
  const db = getFirebaseDb();
  const ref = doc(db, "items", id);
  const s = await getDoc(ref);
  if (!s.exists()) return null;
  return mapItem(s.id, s.data());
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
  const ref = await addDoc(collection(db, "items"), {
    ...input,
    status: input.status ?? "available",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateItem(id: string, patch: Partial<ItemInput>): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "items", id), {
    ...patch,
  });
}

export async function deleteItem(id: string): Promise<void> {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, "items", id));
}
