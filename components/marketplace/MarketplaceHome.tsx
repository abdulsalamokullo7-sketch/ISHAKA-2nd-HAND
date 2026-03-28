"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { fetchAvailableItems } from "@/lib/firebase/items";
import type { Item } from "@/lib/types";
import { CATEGORIES, REGIONS, type RegionId } from "@/lib/constants";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { ItemCard, ItemCardSkeleton } from "./ItemCard";

const CATEGORY_ICONS: Record<string, string> = {
  Electronics: "⚡", Phones: "📱", Laptops: "💻", Clothes: "👕",
  Shoes: "👟", Books: "📚", Furniture: "🪑", Kitchen: "🍳",
  Sports: "⚽", Other: "📦",
};

export function MarketplaceHome() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<RegionId | "all">("all");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "price-low" | "price-high">("newest");
  const [searchFocused, setSearchFocused] = useState(false);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setLoading(false);
      setError("Firebase is not configured. Add NEXT_PUBLIC_FIREBASE_* keys to .env.local.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchAvailableItems();
        if (!cancelled) { setItems(data); setError(null); }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load items.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((item) => {
      if (region !== "all" && item.region !== region) return false;
      if (category !== "all" && item.category !== category) return false;
      if (!term) return true;
      return `${item.name} ${item.description} ${item.location} ${item.category}`.toLowerCase().includes(term);
    });
  }, [items, q, region, category]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "price-low") return arr.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") return arr.sort((a, b) => b.price - a.price);
    return arr.sort((a, b) => (b.createdAt?.toMillis?.() ?? 0) - (a.createdAt?.toMillis?.() ?? 0));
  }, [filtered, sortBy]);

  const featured = useMemo(() => sorted.filter((i) => i.featured), [sorted]);
  const rest = useMemo(() => sorted.filter((i) => !i.featured), [sorted]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) counts[item.category] = (counts[item.category] ?? 0) + 1;
    return counts;
  }, [items]);

  return (
    <div className="pb-24 sm:pb-10">
      {/* Compact mobile hero + search */}
      <section className="hero-mesh border-b border-isha-border/50 px-4 pb-4 pt-4 sm:px-6 sm:pb-8 sm:pt-8">
        <div className="mx-auto max-w-7xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-isha-primary sm:text-xs">
            Ishaka &middot; Online shop
          </p>
          <h1 className="mt-1.5 text-xl font-extrabold leading-tight tracking-tight text-isha-text sm:mt-3 sm:text-3xl md:text-4xl lg:text-5xl">
            Second Hand,{" "}
            <span className="text-isha-primary">First Class</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-isha-text-muted sm:mt-3 sm:text-base">
            Pre-owned electronics, fashion, books & more — priced in UGX.
          </p>

          {/* Search bar */}
          <div className="mt-3 sm:mt-6">
            <div className={`relative rounded-xl border bg-white shadow-sm transition-all ${searchFocused ? "border-isha-primary ring-2 ring-isha-primary/20" : "border-isha-border"}`}>
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M10 18a8 8 0 110-16 8 8 0 010 16z" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search phones, shoes, laptops…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full rounded-xl bg-transparent py-2.5 pl-9 pr-3 text-sm text-isha-text outline-none placeholder:text-gray-400 sm:py-3 sm:pl-11 sm:pr-4 sm:text-base"
              />
            </div>
          </div>

          {/* Horizontal scrolling category pills */}
          <div ref={categoriesRef} className="scrollbar-hide -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:mt-5 sm:flex-wrap sm:px-0">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95 sm:px-4 sm:py-2 sm:text-xs ${
                category === "all"
                  ? "bg-isha-primary text-white shadow"
                  : "bg-white text-gray-600 ring-1 ring-isha-border"
              }`}
            >
              All{items.length > 0 ? ` (${items.length})` : ""}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory((prev) => (prev === c ? "all" : c))}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold transition active:scale-95 sm:px-4 sm:py-2 sm:text-xs ${
                  category === c
                    ? "bg-isha-primary text-white shadow"
                    : "bg-white text-gray-600 ring-1 ring-isha-border"
                }`}
              >
                {CATEGORY_ICONS[c] ?? "📦"} {c}
                {(categoryCounts[c] ?? 0) > 0 && ` (${categoryCounts[c]})`}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="mt-3 flex gap-2 sm:mt-4">
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as RegionId | "all")}
              className="flex-1 rounded-xl border border-isha-border bg-white px-3 py-2 text-xs font-semibold text-isha-text shadow-sm outline-none focus:ring-2 focus:ring-isha-primary/20 sm:flex-none sm:min-w-[140px] sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <option value="all">All areas</option>
              {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="flex-1 rounded-xl border border-isha-border bg-white px-3 py-2 text-xs font-semibold text-isha-text shadow-sm outline-none focus:ring-2 focus:ring-isha-primary/20 sm:flex-none sm:min-w-[140px] sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: low → high</option>
              <option value="price-high">Price: high → low</option>
            </select>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {error && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-900 sm:mt-6 sm:px-4 sm:py-3 sm:text-sm" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:mt-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ItemCardSkeleton key={i} compact />
            ))}
          </div>
        ) : (
          <>
            {/* Featured: horizontal scroll on mobile, grid on desktop */}
            {featured.length > 0 && (
              <section className="mt-5 sm:mt-10">
                <SectionHeader badge="🔥 Hot deals" title="Featured" />
                <div className="scrollbar-hide -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 md:grid-cols-3 lg:grid-cols-4">
                  {featured.map((item) => (
                    <div key={item.id} className="w-[44vw] shrink-0 snap-start sm:w-auto">
                      <ItemCard item={item} compact />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CTA banner — compact on mobile */}
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-gradient-to-r from-isha-primary to-emerald-700 px-4 py-3 text-white shadow-md sm:mt-8 sm:gap-4 sm:rounded-2xl sm:px-6 sm:py-6">
              <div className="flex-1">
                <p className="text-sm font-extrabold sm:text-lg">Got something to sell?</p>
                <p className="mt-0.5 text-[11px] text-white/80 sm:text-sm">
                  Turn unused items into cash.
                </p>
              </div>
              <Link
                href="/sell"
                className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-isha-primary shadow transition active:scale-95 sm:px-6 sm:py-3 sm:text-sm"
              >
                Sell now
              </Link>
            </div>

            {/* All items grid */}
            <section className="mt-5 sm:mt-10">
              <SectionHeader title="All items" count={rest.length} />
              {rest.length === 0 ? (
                <p className="rounded-xl border border-dashed border-isha-border bg-white px-4 py-10 text-center text-sm text-isha-text-muted shadow-sm">
                  {featured.length > 0
                    ? "All matching items are featured above."
                    : items.length === 0
                      ? "No items listed yet. Check back soon!"
                      : "No items match your filters."}
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
                  {rest.map((item) => <ItemCard key={item.id} item={item} compact />)}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ badge, title, count }: {
  badge?: string;
  title: string;
  count?: number;
}) {
  return (
    <div className="mb-3 flex items-center justify-between sm:mb-5">
      <h2 className="flex items-center gap-2 text-base font-extrabold tracking-tight text-isha-text sm:text-xl">
        {badge && <span className="text-sm sm:text-base">{badge}</span>}
        {title}
        {count != null && count > 0 && (
          <span className="text-xs font-semibold text-isha-text-muted sm:text-sm">({count})</span>
        )}
      </h2>
    </div>
  );
}
