"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { APP_NAME } from "@/lib/constants";
import {
  btnPrimaryFull,
  cardElevated,
  fieldInput,
  fieldLabel,
} from "@/lib/ui/field-styles";

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/admin");
    }
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
      router.replace("/admin");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed. Check credentials.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (!hasFirebaseConfig()) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add NEXT_PUBLIC_FIREBASE_* variables to .env.local first.
        </p>
        <Link href="/" className="mt-4 inline-block font-bold text-isha-primary hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[65vh] max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <p className="text-center text-xs font-bold uppercase tracking-widest text-isha-primary">
        {APP_NAME}
      </p>
      <h1 className="mt-2 text-center text-3xl font-extrabold tracking-tight text-isha-text">
        Store login
      </h1>
      <p className="mt-2 text-center text-sm text-isha-text-muted">
        Business owner only. There is no sign-up on this site — add the shop
        email in Firebase Console → Authentication → Users, then sign in here.
      </p>

      <form onSubmit={onSubmit} className={`mt-10 space-y-5 p-6 sm:p-8 ${cardElevated}`}>
        <div>
          <label htmlFor="email" className={fieldLabel}>
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldInput}
          />
        </div>
        <div>
          <label htmlFor="password" className={fieldLabel}>
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldInput}
          />
        </div>
        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800 ring-1 ring-red-100" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className={btnPrimaryFull}
        >
          {busy ? "Signing in…" : "Sign in to dashboard"}
        </button>
      </form>
      <Link
        href="/"
        className="mt-8 text-center text-sm font-bold text-isha-primary hover:underline"
      >
        ← Back to shop
      </Link>
    </div>
  );
}
