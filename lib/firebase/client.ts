"use client";

import { getFirebaseApp } from "./config";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(getFirebaseApp());
}
