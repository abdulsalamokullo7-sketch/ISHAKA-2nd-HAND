"use client";

import {
  addDoc,
  collection,
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
import type { SellRequest, SellRequestStatus } from "@/lib/types";
import { ensureUploadAuth } from "./anonymous";
import { uploadMany, type UploadProgressPayload } from "./storageUpload";

function mapReq(id: string, data: DocumentData): SellRequest {
  return {
    id,
    itemName: String(data.itemName ?? ""),
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    expectedPrice: Number(data.expectedPrice ?? 0),
    condition: String(data.condition ?? ""),
    phone: String(data.phone ?? ""),
    description: String(data.description ?? ""),
    location: String(data.location ?? ""),
    meetingPreference: String(data.meetingPreference ?? ""),
    status: (data.status as SellRequestStatus) ?? "pending",
    createdAt: data.createdAt ?? null,
    adminNote: data.adminNote ? String(data.adminNote) : undefined,
    negotiatedPrice:
      data.negotiatedPrice != null ? Number(data.negotiatedPrice) : null,
  };
}

export async function fetchSellRequests(): Promise<SellRequest[]> {
  const db = getFirebaseDb();
  const q = query(collection(db, "sellRequests"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapReq(d.id, d.data()));
}

export async function fetchSellRequestById(id: string): Promise<SellRequest | null> {
  const db = getFirebaseDb();
  const s = await getDoc(doc(db, "sellRequests", id));
  if (!s.exists()) return null;
  return mapReq(s.id, s.data());
}

export type SellRequestInput = {
  itemName: string;
  images: string[];
  expectedPrice: number;
  condition: string;
  phone: string;
  description: string;
  location: string;
  meetingPreference: string;
};

export async function createSellRequest(input: SellRequestInput): Promise<string> {
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, "sellRequests"), {
    ...input,
    status: "pending" as SellRequestStatus,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Create a pending request, upload images to Storage, then attach URLs. */
export async function submitSellRequestWithFiles(
  fields: Omit<SellRequestInput, "images">,
  files: File[],
  opts?: { onUploadProgress?: (p: UploadProgressPayload) => void },
): Promise<string> {
  await ensureUploadAuth();
  const db = getFirebaseDb();
  const ref = await addDoc(collection(db, "sellRequests"), {
    ...fields,
    images: [] as string[],
    status: "pending" as SellRequestStatus,
    createdAt: serverTimestamp(),
  });
  if (files.length > 0) {
    const urls = await uploadMany(`sell-requests/${ref.id}`, files, {
      onProgress: opts?.onUploadProgress,
    });
    await updateDoc(ref, { images: urls });
  }
  return ref.id;
}

export type { UploadProgressPayload };

export async function updateSellRequest(
  id: string,
  patch: Partial<{
    status: SellRequestStatus;
    adminNote: string;
    negotiatedPrice: number | null;
  }>,
): Promise<void> {
  const db = getFirebaseDb();
  await updateDoc(doc(db, "sellRequests", id), patch);
}
