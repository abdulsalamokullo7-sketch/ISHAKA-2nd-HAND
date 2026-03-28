"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { fetchItemById } from "@/lib/firebase/items";
import type { Item } from "@/lib/types";
import {
  APP_NAME,
  formatUGX,
  MEETING_POINTS,
  REGIONS,
  whatsappUrl,
  telUrl,
} from "@/lib/constants";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { ImageLightbox } from "@/components/ui/ImageLightbox";
import { ShareButton } from "@/components/ui/ShareButton";

function regionLabel(region: string) {
  return REGIONS.find((r) => r.id === region)?.label ?? region;
}

export function ItemDetail({ id }: { id: string }) {
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setItem(null);
      setError("Firebase is not configured.");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchItemById(id);
        if (!cancelled) { setItem(data); setError(null); }
      } catch (e) {
        if (!cancelled) { setError(e instanceof Error ? e.message : "Failed to load item."); setItem(null); }
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setPhoto(idx);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [item]);

  if (item === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-4 aspect-square animate-pulse rounded-2xl bg-gray-100 sm:mt-8 sm:aspect-[4/3]" />
        <div className="mt-4 space-y-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-gray-200" />
          <div className="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {error ?? "Item not found."}
        </p>
        <Link href="/" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-isha-primary">
          ← Back to shop
        </Link>
      </div>
    );
  }

  if (item.status === "sold") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          This item has been sold.
        </p>
        <Link href="/" className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-isha-primary">
          ← Continue shopping
        </Link>
      </div>
    );
  }

  const phone = item.phone ?? process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "";
  const waMessage = `Hi, I saw "${item.name}" on ${APP_NAME}. Is it still available?`;
  const hasPhone = phone.length > 0;
  const wa = hasPhone ? whatsappUrl(phone, waMessage) : "#";
  const call = hasPhone ? telUrl(phone) : "#";

  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pb-28 pt-3 sm:px-6 sm:pb-10 sm:pt-8">
        {/* Breadcrumb — hidden on mobile for cleanliness */}
        <nav className="hidden text-sm font-medium text-isha-text-muted sm:block" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/" className="hover:text-isha-primary">Shop</Link></li>
            <li aria-hidden className="text-gray-300">/</li>
            <li><span className="text-isha-text">{item.category}</span></li>
            <li aria-hidden className="text-gray-300">/</li>
            <li className="line-clamp-1 max-w-md font-semibold text-isha-text">{item.name}</li>
          </ol>
        </nav>

        {/* Mobile back button */}
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-isha-primary sm:hidden">
          ← Back
        </Link>

        <div className="mt-3 grid gap-6 sm:mt-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:items-start">
          {/* Image gallery — swipeable on mobile */}
          <div className="space-y-2 sm:space-y-4">
            {/* Swipeable gallery on mobile, static on desktop */}
            <div className="relative -mx-4 sm:mx-0">
              <div
                ref={galleryRef}
                className="scrollbar-hide flex snap-x overflow-x-auto sm:block sm:overflow-visible"
              >
                {(item.images.length > 0 ? item.images : [null]).map((src, i) => (
                  <div
                    key={src ?? "empty"}
                    className={`relative aspect-square w-full shrink-0 snap-start overflow-hidden bg-isha-muted sm:rounded-2xl sm:shadow-lg sm:ring-1 sm:ring-black/5 ${src ? "cursor-zoom-in" : ""} ${i > 0 ? "sm:hidden" : ""}`}
                    role={src ? "button" : undefined}
                    aria-label={src ? "Enlarge photo" : undefined}
                    tabIndex={src ? 0 : undefined}
                    onClick={() => { if (src) { setPhoto(i); setLightboxOpen(true); } }}
                    onKeyDown={(e) => { if (src && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setPhoto(i); setLightboxOpen(true); } }}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt={`${item.name} photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 55vw"
                        priority={i === 0}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">No photo</div>
                    )}
                    {i === 0 && item.featured && (
                      <span className="absolute left-3 top-3 rounded-lg bg-isha-accent px-2.5 py-1 text-[10px] font-extrabold uppercase text-isha-text shadow sm:left-4 sm:top-4 sm:text-[11px]">
                        Hot deal
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {/* Dot indicators on mobile */}
              {item.images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
                  {item.images.map((_, i) => (
                    <span key={i} className={`h-1.5 rounded-full transition-all ${photo === i ? "w-4 bg-white shadow" : "w-1.5 bg-white/50"}`} />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop thumbnails */}
            {item.images.length > 1 && (
              <div className="hidden gap-2 sm:flex">
                {item.images.map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => { setPhoto(i); setLightboxOpen(true); }}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl ring-2 transition lg:h-20 lg:w-20 ${
                      photo === i ? "ring-isha-primary shadow-md" : "ring-transparent hover:ring-gray-200"
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="80px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4 sm:gap-6 lg:sticky lg:top-24">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {item.verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-isha-blue/10 px-2 py-0.5 text-[10px] font-bold text-isha-blue ring-1 ring-isha-blue/25 sm:px-3 sm:py-1 sm:text-xs">
                  <span className="h-1 w-1 rounded-full bg-isha-blue sm:h-1.5 sm:w-1.5" />
                  Verified
                </span>
              )}
              <span className="rounded-full bg-isha-muted px-2 py-0.5 text-[10px] font-bold text-gray-700 sm:px-3 sm:py-1 sm:text-xs">
                {item.condition}
              </span>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-100 sm:px-3 sm:py-1 sm:text-xs">
                {item.category}
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-isha-text sm:text-3xl lg:text-4xl">
                {item.name}
              </h1>
              <div className="flex shrink-0 items-center gap-1.5">
                <ShareButton title={item.name} text={`Check out "${item.name}" on ${APP_NAME}`} />
                <FavoriteButton itemId={item.id} />
              </div>
            </div>

            <p className="text-2xl font-extrabold tracking-tight text-isha-primary sm:text-4xl lg:text-5xl">
              {formatUGX(item.price)}
            </p>

            {/* Location */}
            <div className="flex items-center gap-2 rounded-xl bg-isha-muted/60 px-3 py-2.5 sm:rounded-2xl sm:px-5 sm:py-4">
              <svg className="h-4 w-4 shrink-0 text-isha-primary sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-bold text-isha-text sm:text-base">{regionLabel(item.region)}</p>
                <p className="truncate text-xs text-isha-text-muted">{item.location}</p>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 sm:text-sm">Description</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-isha-text-muted sm:mt-2">
                {item.description}
              </p>
            </div>

            {/* Desktop CTA buttons */}
            <div className="hidden gap-3 sm:flex sm:flex-wrap">
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                aria-disabled={!hasPhone}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-isha-primary px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-green-600/25 transition hover:bg-isha-primary-dark ${!hasPhone ? "pointer-events-none opacity-50" : ""}`}
              >
                <WhatsAppIcon />
                Buy on WhatsApp
              </a>
              <a
                href={call}
                aria-disabled={!hasPhone}
                className={`inline-flex flex-1 items-center justify-center rounded-2xl border-2 border-isha-border bg-white px-6 py-4 text-sm font-extrabold text-isha-text shadow-sm transition hover:bg-isha-muted ${!hasPhone ? "pointer-events-none opacity-50" : ""}`}
              >
                Call now
              </a>
            </div>

            {!hasPhone && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:px-4 sm:py-3 sm:text-sm">
                Add a phone on this listing in Admin, or set <code className="rounded bg-white px-1 text-[10px]">NEXT_PUBLIC_BUSINESS_PHONE</code> as your shop default.
              </p>
            )}

            <details className="group rounded-xl border border-isha-border bg-white p-3 shadow-sm open:ring-2 open:ring-isha-blue/20 sm:rounded-2xl sm:p-5">
              <summary className="cursor-pointer list-none text-sm font-bold text-isha-blue">
                <span className="flex items-center justify-between gap-2">
                  Meeting points
                  <span className="text-[10px] font-normal text-gray-400 transition group-open:rotate-180">▼</span>
                </span>
              </summary>
              <ul className="mt-2 space-y-1.5 text-sm sm:mt-3 sm:space-y-2">
                {MEETING_POINTS.map((p) => (
                  <li key={p} className="flex items-center gap-2 rounded-lg bg-isha-muted/50 px-2.5 py-1.5 text-xs font-medium text-isha-text sm:rounded-xl sm:px-3 sm:py-2 sm:text-sm">
                    <span className="text-isha-primary">✓</span> {p}
                  </li>
                ))}
              </ul>
            </details>

            <Link href="/" className="hidden text-center text-sm font-bold text-isha-primary hover:underline sm:block">
              ← Back to all items
            </Link>
          </div>
        </div>
      </div>

      {/* Sticky bottom buy bar — mobile only */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-isha-border bg-white/95 px-4 py-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-lg sm:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-isha-text">{item.name}</p>
            <p className="text-base font-extrabold text-isha-primary">{formatUGX(item.price)}</p>
          </div>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!hasPhone}
            className={`flex items-center gap-1.5 rounded-xl bg-isha-primary px-4 py-2.5 text-xs font-extrabold text-white shadow-md transition active:scale-95 ${!hasPhone ? "pointer-events-none opacity-50" : ""}`}
          >
            <WhatsAppIcon className="h-4 w-4" />
            Buy
          </a>
          <a
            href={call}
            aria-disabled={!hasPhone}
            className={`flex items-center justify-center rounded-xl border border-isha-border bg-white px-3 py-2.5 text-xs font-extrabold text-isha-text transition active:scale-95 ${!hasPhone ? "pointer-events-none opacity-50" : ""}`}
          >
            Call
          </a>
        </div>
      </div>

      <ImageLightbox
        src={item.images[photo] ?? null}
        alt={item.name}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
}

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
