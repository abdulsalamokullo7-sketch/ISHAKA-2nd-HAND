"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { formatFirebaseAuthError } from "@/lib/firebase/authErrors";
import { hasFirebaseConfig } from "@/lib/firebase/env";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  /** Admin session: email/password only. No sign-up in the app — users are created in Firebase Console. */
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setLoading(false);
      return;
    }
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!hasFirebaseConfig()) {
      throw new Error("Firebase is not configured. Add keys to .env.local.");
    }
    const auth = getFirebaseAuth();
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      throw new Error(formatFirebaseAuthError(e));
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!hasFirebaseConfig()) return;
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signOut }),
    [user, loading, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
