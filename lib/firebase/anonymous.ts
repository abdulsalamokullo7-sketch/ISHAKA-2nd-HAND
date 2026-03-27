"use client";

import { signInAnonymously } from "firebase/auth";
import { getFirebaseAuth } from "./client";
import { hasFirebaseConfig } from "./env";

let anonymousPromise: Promise<void> | null = null;

/** Ensures a Firebase session for Storage uploads (anonymous if nobody is signed in). */
export function ensureUploadAuth(): Promise<void> {
  if (!hasFirebaseConfig()) {
    return Promise.reject(new Error("Firebase is not configured."));
  }
  const auth = getFirebaseAuth();
  if (auth.currentUser) {
    return Promise.resolve();
  }
  if (!anonymousPromise) {
    anonymousPromise = signInAnonymously(auth).then(() => undefined);
  }
  return anonymousPromise;
}
