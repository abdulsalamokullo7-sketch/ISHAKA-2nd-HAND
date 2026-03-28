"use client";

import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "./client";
import type { ItemBuyerMessage } from "@/lib/types";
import { ensureUploadAuth } from "./anonymous";

function mapMessage(id: string, data: DocumentData): ItemBuyerMessage {
  return {
    id,
    itemId: String(data.itemId ?? ""),
    itemName: String(data.itemName ?? ""),
    buyerName: String(data.buyerName ?? ""),
    buyerPhone: String(data.buyerPhone ?? ""),
    message: String(data.message ?? ""),
    createdAt: data.createdAt ?? null,
  };
}

export async function submitItemBuyerMessage(input: {
  itemId: string;
  itemName: string;
  buyerName: string;
  buyerPhone: string;
  message: string;
}): Promise<void> {
  await ensureUploadAuth();
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  if (!auth.currentUser) {
    throw new Error(
      "Could not start a browser session. Enable Anonymous sign-in in Firebase Console → Authentication → Sign-in method.",
    );
  }
  const db = getFirebaseDb();
  const msg = input.message.trim();
  const name = input.buyerName.trim();
  const phone = input.buyerPhone.trim();
  if (msg.length < 3) throw new Error("Message is too short.");
  if (name.length < 2) throw new Error("Please enter your name.");
  if (phone.length < 9) throw new Error("Please enter a valid phone number.");

  await addDoc(collection(db, "itemBuyerMessages"), {
    itemId: input.itemId,
    itemName: input.itemName.trim().slice(0, 500),
    buyerName: name.slice(0, 200),
    buyerPhone: phone.slice(0, 40),
    message: msg.slice(0, 4000),
    createdAt: serverTimestamp(),
  });
}

export async function fetchItemBuyerMessages(): Promise<ItemBuyerMessage[]> {
  const db = getFirebaseDb();
  const q = query(
    collection(db, "itemBuyerMessages"),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapMessage(d.id, d.data()));
}
