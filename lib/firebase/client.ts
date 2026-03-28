"use client";

import { getFirebaseApp } from "./config";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";

let firestoreDb: Firestore | null = null;

/**
 * Firestore with IndexedDB persistence when possible — reads work offline after
 * the data was loaded online once. Writes queue until connection returns.
 */
export function getFirebaseDb(): Firestore {
  if (firestoreDb) return firestoreDb;
  const app = getFirebaseApp();
  try {
    firestoreDb = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
  } catch {
    // Already initialized, or persistence unavailable (e.g. some private modes).
    firestoreDb = getFirestore(app);
  }
  return firestoreDb;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}
