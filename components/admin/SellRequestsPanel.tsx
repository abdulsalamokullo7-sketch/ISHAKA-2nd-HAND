"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  fetchSellRequests,
  updateSellRequest,
} from "@/lib/firebase/sellRequests";
import type { SellRequest } from "@/lib/types";
import { APP_NAME, formatUGX, telUrl, whatsappUrl } from "@/lib/constants";

export function SellRequestsPanel() {
  const [rows, setRows] = useState<SellRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});
  const [negotiated, setNegotiated] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const data = await fetchSellRequests();
      setRows(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(
    id: string,
    status: "pending" | "approved" | "rejected",
  ) {
    setBusy(id);
    try {
      const raw = negotiated[id]?.trim();
      const negotiatedPrice =
        raw && raw.length > 0
          ? Number(raw.replace(/[^\d]/g, ""))
          : null;
      await updateSellRequest(id, {
        status,
        adminNote: note[id]?.trim() || undefined,
        negotiatedPrice:
          negotiatedPrice != null && Number.isFinite(negotiatedPrice)
            ? negotiatedPrice
            : null,
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-500">Loading requests…</p>;
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-isha-border bg-white px-4 py-8 text-center text-sm text-gray-500">
        No sell requests yet.
      </p>
    );
  }

  return (
    <ul className="space-y-6">
      {rows.map((r) => {
        const wa = whatsappUrl(
          r.phone,
          `Hi, I am from ${APP_NAME} about your "${r.itemName}" offer.`,
        );
        return (
          <li
            key={r.id}
            className="rounded-3xl border border-isha-border bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-isha-text">{r.itemName}</p>
                <p className="text-sm text-gray-600">
                  Expected {formatUGX(r.expectedPrice)} · {r.condition}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Status:{" "}
                  <span className="font-medium text-isha-text">{r.status}</span>
                </p>
              </div>
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-isha-blue/10 px-3 py-1 text-xs font-semibold text-isha-blue hover:bg-isha-blue/20"
              >
                WhatsApp seller
              </a>
            </div>
            <p className="mt-3 text-sm text-gray-700">{r.description}</p>
            <p className="mt-2 text-xs text-gray-500">
              {r.location} · {r.meetingPreference}
            </p>
            <p className="text-xs text-gray-500">Phone: {r.phone}</p>
            {r.images.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {r.images.map((src) => (
                  <div
                    key={src}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-isha-muted"
                  >
                    <Image
                      src={src}
                      alt=""
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-gray-600">
                  Negotiated price (UGX)
                </label>
                <input
                  value={negotiated[r.id] ?? ""}
                  onChange={(e) =>
                    setNegotiated((m) => ({ ...m, [r.id]: e.target.value }))
                  }
                  placeholder="Optional"
                  className="mt-1 w-full rounded-xl border border-isha-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-isha-primary/40"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-gray-600">
                  Internal note
                </label>
                <textarea
                  value={note[r.id] ?? r.adminNote ?? ""}
                  onChange={(e) =>
                    setNote((m) => ({ ...m, [r.id]: e.target.value }))
                  }
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-isha-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-isha-primary/40"
                  placeholder="Contact log, inspection notes…"
                />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => setStatus(r.id, "approved")}
                className="rounded-xl bg-isha-primary px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => setStatus(r.id, "rejected")}
                className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
              >
                Reject
              </button>
              <button
                type="button"
                disabled={busy === r.id}
                onClick={() => setStatus(r.id, "pending")}
                className="rounded-xl border border-isha-border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-isha-muted disabled:opacity-60"
              >
                Mark pending
              </button>
              <a
                href={telUrl(r.phone)}
                className="rounded-xl border border-isha-border px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-isha-muted"
              >
                Call seller
              </a>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
