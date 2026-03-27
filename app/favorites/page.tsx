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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="text-xs font-bold uppercase tracking-widest text-isha-primary">
        {APP_NAME}
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-isha-text sm:text-4xl">
        Saved items
      </h1>
      <p className="mt-2 max-w-2xl text-isha-text-muted">
        Items you have hearted for later. Saved only on this device.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex text-sm font-bold text-isha-primary hover:underline"
      >
        ← Continue shopping
      </Link>

      {error && (
        <p
          className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </p>
      )}

      {!ready || loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-80 animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"
            />
          ))}
        </div>
      ) : ids.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-isha-border bg-white px-6 py-14 text-center text-isha-text-muted shadow-sm">
          Nothing saved yet. Tap the heart on any product to add it here.
        </p>
      ) : saved.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8 text-center text-amber-900">
          Some saved items are no longer available. Clear your list from each
          card or browse{" "}
          <Link href="/" className="font-bold underline">
            the shop
          </Link>
          .
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
