"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fetchAvailableItems } from "@/lib/firebase/items";
import type { Item } from "@/lib/types";
import { ItemCard } from "@/components/marketplace/ItemCard";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { useFavorites } from "@/contexts/FavoritesContext";
import { APP_NAME } from "@/lib/constants";

export default function FavoritesPage() {
  const { ids, ready } = useFavorites();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setLoading(false);
      setError("Firebase is not configured.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAvailableItems();
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saved = useMemo(() => {
    const set = new Set(ids);
    return items.filter((i) => set.has(i.id));
  }, [items, ids]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-isha-primary sm:text-xs">
        {APP_NAME}
      </p>
      <h1 className="mt-1 text-xl font-extrabold tracking-tight text-isha-text sm:mt-2 sm:text-3xl lg:text-4xl">
        Saved items
      </h1>
      <p className="mt-1 text-xs text-isha-text-muted sm:mt-2 sm:text-base">
        Hearted items, saved on this device.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex text-xs font-bold text-isha-primary sm:mt-4 sm:text-sm"
      >
        ← Continue shopping
      </Link>

      {error && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:mt-8 sm:px-4 sm:py-3 sm:text-sm" role="alert">
          {error}
        </p>
      )}

      {!ready || loading ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
          ))}
        </div>
      ) : ids.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-isha-border bg-white px-4 py-10 text-center text-sm text-isha-text-muted shadow-sm sm:mt-10 sm:rounded-2xl sm:px-6 sm:py-14">
          Nothing saved yet. Tap the heart on any product to add it here.
        </p>
      ) : saved.length === 0 ? (
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900 sm:mt-10 sm:px-6 sm:py-8">
          Some saved items are no longer available.{" "}
          <Link href="/" className="font-bold underline">Browse the shop</Link>.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
          {saved.map((item) => (
            <ItemCard key={item.id} item={item} compact />
          ))}
        </div>
      )}
    </div>
  );
}
