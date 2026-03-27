"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { InventoryPanel } from "@/components/admin/InventoryPanel";
import { SellRequestsPanel } from "@/components/admin/SellRequestsPanel";
import { APP_NAME } from "@/lib/constants";

type Tab = "inventory" | "requests";

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: "inventory", label: "Inventory", icon: "📦" },
  { id: "requests", label: "Sell requests", icon: "📩" },
];

export default function AdminPage() {
  const { user, signOut } = useAuth();
  const [tab, setTab] = useState<Tab>("inventory");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-isha-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-isha-primary">
            Dashboard
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-isha-text sm:text-3xl">
            Store control
          </h1>
          <p className="mt-1 text-sm text-isha-text-muted">
            {APP_NAME} &mdash; signed in as{" "}
            <span className="font-medium text-isha-text">{user?.email}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-full border border-isha-border px-4 py-2 text-sm font-medium transition hover:bg-isha-muted"
          >
            View site
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full bg-isha-muted px-4 py-2 text-sm font-medium transition hover:bg-gray-200"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-isha-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === t.id
                ? "border-isha-primary text-isha-primary"
                : "border-transparent text-gray-500 hover:text-isha-text"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="mt-8">
        {tab === "inventory" ? <InventoryPanel /> : <SellRequestsPanel />}
      </div>
    </div>
  );
}
