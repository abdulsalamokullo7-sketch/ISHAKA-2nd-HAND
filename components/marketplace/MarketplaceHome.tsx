"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { fetchAvailableItems } from "@/lib/firebase/items";
import type { Item } from "@/lib/types";
import { CATEGORIES, REGIONS, type RegionId } from "@/lib/constants";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { ItemCard } from "./ItemCard";

const TRUST_POINTS = [
  { title: "Curated listings", desc: "Checked by our Ishaka shop team" },
  { title: "Prices in UGX", desc: "No surprises — see cost upfront" },
  { title: "Local pickup", desc: "Meet safely around KIU, BSU & town" },
] as const;

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
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10">
      {/* Hero */}
      <section className="hero-mesh relative overflow-hidden rounded-3xl border border-white/60 px-5 py-10 shadow-[0_20px_50px_-20px_rgba(22,163,74,0.25)] ring-1 ring-black/[0.04] sm:px-10 sm:py-14">
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-isha-primary">
            Ishaka &middot; Online shop
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-[1.15] tracking-tight text-isha-text sm:text-4xl md:text-5xl">
            Second-hand,{" "}
            <span className="text-isha-primary">first-class</span> experience
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-isha-text-muted sm:text-lg">
            Shop pre-owned electronics, fashion, books & more — priced clearly in UGX,
            served by a local Ishaka store you can trust.
          </p>

          {/* Search + filters */}
          <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <label className="sr-only" htmlFor="search">Search items</label>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-isha-text-muted" aria-hidden>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.2-5.2M10 18a8 8 0 110-16 8 8 0 010 16z" />
                  </svg>
                </span>
                <input
                  id="search"
                  type="search"
                  placeholder="Search — phone, shoes, desk, laptop…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="w-full rounded-2xl border border-isha-border bg-white py-3.5 pl-12 pr-4 text-isha-text shadow-inner outline-none ring-isha-primary/20 placeholder:text-gray-400 focus:ring-2"
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <FilterSelect
                label="Area"
                value={region}
                onChange={(v) => setRegion(v as RegionId | "all")}
                options={[{ value: "all", label: "All areas" }, ...REGIONS.map((r) => ({ value: r.id, label: r.label }))]}
              />
              <FilterSelect
                label="Sort"
                value={sortBy}
                onChange={(v) => setSortBy(v as typeof sortBy)}
                options={[
                  { value: "newest", label: "Newest first" },
                  { value: "price-low", label: "Price: low → high" },
                  { value: "price-high", label: "Price: high → low" },
                ]}
              />
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                category === "all"
                  ? "bg-isha-primary text-white shadow-md"
                  : "bg-white/90 text-gray-700 ring-1 ring-isha-border hover:bg-white"
              }`}
            >
              All {items.length > 0 && <span className="ml-1 opacity-70">({items.length})</span>}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory((prev) => (prev === c ? "all" : c))}
                className={`rounded-full px-3.5 py-2 text-xs font-bold transition ${
                  category === c
                    ? "bg-isha-primary text-white shadow-md"
                    : "bg-white/90 text-gray-700 ring-1 ring-isha-border hover:bg-white"
                }`}
              >
                <span className="mr-1">{CATEGORY_ICONS[c] ?? "📦"}</span>
                {c}
                {(categoryCounts[c] ?? 0) > 0 && (
                  <span className="ml-1 opacity-70">({categoryCounts[c]})</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="mt-8 grid gap-4 rounded-2xl border border-isha-border bg-white p-5 shadow-sm sm:grid-cols-3 sm:p-6">
        {TRUST_POINTS.map((t) => (
          <div key={t.title} className="flex gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-green-50 text-isha-primary ring-1 ring-green-100" aria-hidden>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </span>
            <div>
              <p className="font-bold text-isha-text">{t.title}</p>
              <p className="mt-0.5 text-sm text-isha-text-muted">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA banner */}
      <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl bg-gradient-to-r from-isha-primary to-emerald-700 px-6 py-8 text-center text-white shadow-lg sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="text-lg font-extrabold sm:text-xl">Got something to sell?</p>
          <p className="mt-1 text-sm text-white/80">
            Turn your unused items into cash. We buy from students and locals in Ishaka.
          </p>
        </div>
        <Link
          href="/sell"
          className="shrink-0 rounded-2xl bg-white px-6 py-3 text-sm font-extrabold text-isha-primary shadow-md transition hover:bg-green-50"
        >
          Sell to us
        </Link>
      </div>

      {error && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-isha-border bg-white shadow-sm">
              <div className="aspect-[4/3] animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-gray-200" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {featured.length > 0 && (
            <section className="mt-14">
              <SectionHeader
                badge="Hot deals"
                title="Featured for you"
                subtitle="Hand-picked value — limited stock, move fast."
              />
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            </section>
          )}

          <section className="mt-14">
            <SectionHeader
              title="New arrivals"
              subtitle="Fresh listings from our shop floor and verified sellers."
              count={rest.length}
            />
            {rest.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-isha-border bg-white px-6 py-14 text-center text-isha-text-muted shadow-sm">
                {featured.length > 0
                  ? "All matching items are featured above."
                  : items.length === 0
                    ? "No items listed yet. Check back soon!"
                    : "No items match your filters. Try another category or search term."}
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((item) => <ItemCard key={item.id} item={item} />)}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function SectionHeader({ badge, title, subtitle, count }: {
  badge?: string;
  title: string;
  subtitle: string;
  count?: number;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {badge && (
          <span className="inline-flex items-center gap-2 rounded-full bg-isha-accent px-3 py-1 text-[11px] font-extrabold uppercase tracking-wide text-isha-text shadow-sm">
            {badge}
          </span>
        )}
        <h2 className={`${badge ? "mt-2" : ""} text-2xl font-extrabold tracking-tight text-isha-text`}>
          {title}
          {count != null && count > 0 && (
            <span className="ml-2 text-base font-semibold text-isha-text-muted">({count})</span>
          )}
        </h2>
        <p className="mt-1 text-sm text-isha-text-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex min-w-[140px] flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl border border-isha-border bg-white px-4 py-3 text-sm font-semibold text-isha-text shadow-sm outline-none focus:ring-2 focus:ring-isha-primary/30"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
