"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { fetchItemById } from "@/lib/firebase/items";
import type { Item } from "@/lib/types";
import { formatUGX, whatsappUrl, telUrl, APP_NAME } from "@/lib/constants";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { buildListingWhatsAppText } from "@/lib/listingWhatsAppMessage";
import { useCart } from "@/contexts/CartContext";

export default function CartPage() {
  const { ids, ready, remove, clear } = useCart();
  const [byId, setById] = useState<Record<string, Item | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [siteOrigin, setSiteOrigin] = useState("");

  useEffect(() => {
    setSiteOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!hasFirebaseConfig()) {
      setLoading(false);
      setError("Firebase is not configured.");
      return;
    }
    if (!ready || ids.length === 0) {
      setLoading(false);
      setById({});
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const next: Record<string, Item | null> = {};
        await Promise.all(
          ids.map(async (id) => {
            const one = await fetchItemById(id);
            next[id] =
              one && one.status === "available" ? one : null;
          }),
        );
        if (!cancelled) {
          setById(next);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load cart.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ids, ready]);

  const lines = useMemo(() => {
    return ids.map((id) => ({ id, item: byId[id] }));
  }, [ids, byId]);

  const total = useMemo(() => {
    let t = 0;
    for (const { item } of lines) {
      if (item) t += item.price;
    }
    return t;
  }, [lines]);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 sm:px-6 sm:pb-10 sm:pt-10">
      <p className="text-[10px] font-bold uppercase tracking-widest text-isha-primary sm:text-xs">
        {APP_NAME}
      </p>
      <h1 className="mt-1 text-xl font-extrabold tracking-tight text-isha-text sm:mt-2 sm:text-3xl">
        Cart
      </h1>
      <p className="mt-1 text-xs text-isha-text-muted sm:text-sm">
        Saved on this device. Contact each seller to buy — meet in person and pay safely.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex text-xs font-bold text-isha-primary sm:text-sm"
      >
        ← Continue shopping
      </Link>

      {error && (
        <p
          className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900 sm:px-4 sm:py-3 sm:text-sm"
          role="alert"
        >
          {error}
        </p>
      )}

      {!ready || loading ? (
        <ul className="mt-6 space-y-3">
          {Array.from({ length: Math.max(1, ids.length) }).map((_, i) => (
            <li
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100"
            />
          ))}
        </ul>
      ) : ids.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-isha-border bg-white px-4 py-10 text-center text-sm text-isha-text-muted">
          Your cart is empty. Tap the cart icon on a product to add it.
        </p>
      ) : (
        <>
          <ul className="mt-6 space-y-3">
            {lines.map(({ id, item }) => (
              <li
                key={id}
                className="flex gap-3 rounded-2xl border border-isha-border bg-white p-3 shadow-sm sm:p-4"
              >
                <Link
                  href={`/item/${id}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-isha-muted sm:h-24 sm:w-24"
                >
                  {item?.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-gray-400">
                      No photo
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  {item ? (
                    <>
                      <Link
                        href={`/item/${id}`}
                        className="font-bold text-isha-text hover:text-isha-primary"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm font-extrabold text-isha-primary">
                        {formatUGX(item.price)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.phone && (
                          <>
                            <a
                              href={whatsappUrl(
                                item.phone,
                                buildListingWhatsAppText(item, {
                                  introLine: `Hi! I'm interested in this item from my ${APP_NAME} cart.`,
                                  listingPageUrl: siteOrigin
                                    ? `${siteOrigin}/item/${item.id}`
                                    : undefined,
                                }),
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg bg-isha-primary px-3 py-1.5 text-xs font-bold text-white"
                            >
                              WhatsApp
                            </a>
                            <a
                              href={telUrl(item.phone)}
                              className="rounded-lg border border-isha-border px-3 py-1.5 text-xs font-bold text-isha-text"
                            >
                              Call
                            </a>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => remove(id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-amber-800">
                      This listing is no longer available.{" "}
                      <button
                        type="button"
                        onClick={() => remove(id)}
                        className="font-bold underline"
                      >
                        Remove from cart
                      </button>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {total > 0 && (
            <div className="mt-6 rounded-2xl border border-isha-border bg-isha-muted/40 px-4 py-3 sm:px-5">
              <p className="text-sm text-isha-text-muted">Combined ask price</p>
              <p className="text-xl font-extrabold text-isha-text">
                {formatUGX(total)}
              </p>
              <p className="mt-1 text-xs text-isha-text-muted">
                Final price is agreed with each seller.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={() => clear()}
            className="mt-4 text-sm font-semibold text-red-700 underline"
          >
            Clear cart
          </button>
        </>
      )}
    </div>
  );
}
