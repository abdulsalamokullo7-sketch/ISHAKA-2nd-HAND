"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
        if (!cancelled) {
          setItem(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load item.");
          setItem(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (item === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-gray-100" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-12 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="h-32 animate-pulse rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800 shadow-sm">
          {error ?? "Item not found."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-isha-primary hover:underline"
        >
          ← Back to shop
        </Link>
      </div>
    );
  }

  if (item.status === "sold") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-900 shadow-sm">
          This item has been sold.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-isha-primary hover:underline"
        >
          ← Continue shopping
        </Link>
      </div>
    );
  }

  const phone =
    item.phone ?? process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? "";
  const waMessage = `Hi, I saw "${item.name}" on ${APP_NAME}. Is it still available?`;
  const hasPhone = phone.length > 0;
  const wa = hasPhone ? whatsappUrl(phone, waMessage) : "#";
  const call = hasPhone ? telUrl(phone) : "#";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <nav className="text-sm font-medium text-isha-text-muted" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-isha-primary">
              Shop
            </Link>
          </li>
          <li aria-hidden className="text-gray-300">
            /
          </li>
          <li>
            <span className="text-isha-text">{item.category}</span>
          </li>
          <li aria-hidden className="text-gray-300">
            /
          </li>
          <li className="line-clamp-1 max-w-[12rem] font-semibold text-isha-text sm:max-w-md">
            {item.name}
          </li>
        </ol>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
        <div className="space-y-4">
          <div
            className={`relative aspect-square w-full overflow-hidden rounded-3xl bg-gradient-to-b from-isha-muted to-gray-100 shadow-[0_25px_50px_-20px_rgba(0,0,0,0.15)] ring-1 ring-black/[0.06] ${item.images[photo] ? "cursor-zoom-in" : ""}`}
            role={item.images[photo] ? "button" : undefined}
            aria-label={
              item.images[photo]
                ? "Enlarge product photo"
                : undefined
            }
            tabIndex={item.images[photo] ? 0 : undefined}
            onClick={() => item.images[photo] && setLightboxOpen(true)}
            onKeyDown={(e) => {
              if (
                item.images[photo] &&
                (e.key === "Enter" || e.key === " ")
              ) {
                e.preventDefault();
                setLightboxOpen(true);
              }
            }}
          >
            {item.images[photo] ? (
              <Image
                src={item.images[photo]!}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-isha-text-muted">
                No photo
              </div>
            )}
            {item.featured && (
              <span className="absolute left-4 top-4 rounded-full bg-isha-accent px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-isha-text shadow-lg ring-1 ring-black/10">
                Hot deal — Ishaka
              </span>
            )}
            {item.images[photo] && (
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">
                Tap to zoom
              </span>
            )}
          </div>
          {item.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {item.images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setPhoto(i)}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl ring-2 transition ${
                    photo === i
                      ? "ring-isha-primary shadow-md"
                      : "ring-transparent hover:ring-gray-200"
                  }`}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-24">
          <div className="flex flex-wrap items-center gap-2">
            {item.verified && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-isha-blue/10 px-3 py-1 text-xs font-bold text-isha-blue ring-1 ring-isha-blue/25">
                <span className="h-1.5 w-1.5 rounded-full bg-isha-blue" />
                Ishaka verified seller
              </span>
            )}
            <span className="rounded-full bg-isha-muted px-3 py-1 text-xs font-bold text-gray-800">
              {item.condition}
            </span>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-900 ring-1 ring-emerald-100">
              {item.category}
            </span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-isha-text sm:text-4xl">
              {item.name}
            </h1>
            <div className="flex shrink-0 items-center gap-2">
              <ShareButton title={item.name} text={`Check out "${item.name}" on ${APP_NAME}`} />
              <FavoriteButton itemId={item.id} />
            </div>
          </div>

          <p className="text-4xl font-extrabold tracking-tight text-isha-primary sm:text-5xl">
            {formatUGX(item.price)}
          </p>

          <div className="rounded-2xl border border-isha-border bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Pickup area
            </p>
            <p className="mt-1 font-bold text-isha-text">
              {regionLabel(item.region)}
            </p>
            <p className="mt-1 text-sm text-isha-text-muted">{item.location}</p>
          </div>

          <div className="grid gap-3 rounded-2xl border border-dashed border-isha-border bg-white/80 p-4 sm:grid-cols-3">
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase text-gray-500">
                Quality
              </p>
              <p className="mt-0.5 text-sm font-semibold text-isha-text">
                {item.condition} item
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase text-gray-500">
                Category
              </p>
              <p className="mt-0.5 text-sm font-semibold text-isha-text">
                {item.category}
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-[11px] font-bold uppercase text-gray-500">
                Listing
              </p>
              <p className="mt-0.5 text-sm font-semibold text-isha-text">
                {APP_NAME}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-isha-muted/60 p-5">
            <p className="text-sm font-semibold text-isha-text">Description</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-isha-text-muted">
              {item.description}
            </p>
          </div>

          <p className="text-xs leading-relaxed text-isha-text-muted">
            Phone is kept on file for serious buyers. Meet in busy public
            places in Ishaka — {MEETING_POINTS[0]} is a popular choice.
          </p>

          {!hasPhone && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Add a phone on this listing in Admin, or set{" "}
              <code className="rounded bg-white px-1">NEXT_PUBLIC_BUSINESS_PHONE</code>{" "}
              as your shop default.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!hasPhone}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-isha-primary px-6 py-4 text-center text-sm font-extrabold text-white shadow-lg shadow-green-600/25 transition hover:bg-isha-primary-dark ${
                !hasPhone ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.123 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Buy on WhatsApp
            </a>
            <a
              href={call}
              aria-disabled={!hasPhone}
              className={`inline-flex flex-1 items-center justify-center rounded-2xl border-2 border-isha-border bg-white px-6 py-4 text-sm font-extrabold text-isha-text shadow-sm transition hover:bg-isha-muted ${
                !hasPhone ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Call now
            </a>
          </div>

          <details className="group rounded-2xl border border-isha-border bg-white p-5 shadow-sm open:ring-2 open:ring-isha-blue/20">
            <summary className="cursor-pointer list-none font-bold text-isha-blue">
              <span className="flex items-center justify-between gap-2">
                Suggest a meeting point
                <span className="text-xs font-normal text-gray-400 group-open:rotate-180">
                  ▼
                </span>
              </span>
            </summary>
            <p className="mt-3 text-sm text-isha-text-muted">
              Agree a safe, public spot before you travel:
            </p>
            <ul className="mt-3 space-y-2 text-sm font-medium text-isha-text">
              {MEETING_POINTS.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 rounded-xl bg-isha-muted/50 px-3 py-2"
                >
                  <span className="text-isha-primary">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </details>

          <Link
            href="/"
            className="text-center text-sm font-bold text-isha-primary hover:underline"
          >
            ← Back to all items
          </Link>
        </div>
      </div>

      <ImageLightbox
        src={item.images[photo] ?? null}
        alt={item.name}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}
