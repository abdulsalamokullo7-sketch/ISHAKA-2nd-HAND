"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { hasFirebaseConfig } from "@/lib/firebase/env";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const isLogin = path === "/admin/login";

  useEffect(() => {
    if (!hasFirebaseConfig()) return;
    if (isLogin) return;
    if (!loading && !user) {
      router.replace("/admin/login");
    }
  }, [isLogin, loading, user, router]);

  if (!hasFirebaseConfig()) {
    if (isLogin) {
      return <>{children}</>;
    }
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
          Configure Firebase in .env.local to use the admin dashboard.
        </p>
      </div>
    );
  }

  if (isLogin) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="h-40 animate-pulse rounded-2xl bg-isha-muted" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
