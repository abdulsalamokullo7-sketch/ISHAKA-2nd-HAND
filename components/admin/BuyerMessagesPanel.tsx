"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchItemBuyerMessages } from "@/lib/firebase/itemBuyerMessages";
import type { ItemBuyerMessage } from "@/lib/types";
import { formatUGX } from "@/lib/constants";
import { fetchItemById } from "@/lib/firebase/items";
import { telUrl, whatsappUrl } from "@/lib/constants";

function formatWhen(ts: ItemBuyerMessage["createdAt"]) {
  if (!ts?.toDate) return "—";
  try {
    return ts.toDate().toLocaleString();
  } catch {
    return "—";
  }
}

export function BuyerMessagesPanel() {
  const [rows, setRows] = useState<ItemBuyerMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<Record<string, number | null>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await fetchItemBuyerMessages();
      setRows(data);
      const p: Record<string, number | null> = {};
      const uniqueIds = [...new Set(data.map((m) => m.itemId))];
      await Promise.all(
        uniqueIds.map(async (id) => {
          try {
            const item = await fetchItemById(id);
            p[id] = item?.price ?? null;
          } catch {
            p[id] = null;
          }
        }),
      );
      setPrices(p);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Loading messages…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-isha-border bg-white px-4 py-8 text-center text-sm text-gray-500">
        No buyer messages yet. They appear when someone uses &quot;Message the shop&quot; on an item page.
      </p>
    );
  }

  return (
    <ul className="space-y-5">
      {rows.map((m) => {
        const price = prices[m.itemId];
        const wa = whatsappUrl(
          m.buyerPhone,
          `Hi ${m.buyerName}, regarding your message about "${m.itemName}".`,
        );
        return (
          <li
            key={m.id}
            className="rounded-3xl border border-isha-border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/item/${m.itemId}`}
                  className="font-semibold text-isha-primary hover:underline"
                >
                  {m.itemName}
                </Link>
                {price != null && (
                  <p className="text-sm text-gray-600">{formatUGX(price)}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formatWhen(m.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-isha-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
                >
                  WhatsApp buyer
                </a>
                <a
                  href={telUrl(m.buyerPhone)}
                  className="rounded-xl border border-isha-border px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-isha-muted"
                >
                  Call buyer
                </a>
              </div>
            </div>
            <p className="mt-3 text-sm font-medium text-isha-text">
              {m.buyerName} · {m.buyerPhone}
            </p>
            <p className="mt-2 whitespace-pre-wrap rounded-xl bg-isha-muted/50 px-3 py-2.5 text-sm text-gray-800">
              {m.message}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
