"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CATEGORIES,
  CONDITIONS,
  REGIONS,
  formatUGX,
  type Category,
  type Condition,
  type RegionId,
} from "@/lib/constants";
import type { Item } from "@/lib/types";
import {
  createItem,
  deleteItem,
  fetchItems,
  updateItem,
  type ItemInput,
} from "@/lib/firebase/items";
import { uploadMany } from "@/lib/firebase/storageUpload";
import {
  btnPrimary,
  btnSecondary,
  cardElevated,
  fieldInput,
  fieldLabel,
  fieldSelect,
  fieldTextarea,
} from "@/lib/ui/field-styles";
import { ProductPhotosField } from "@/components/ui/ProductPhotosField";
import { SingleImageCapture } from "@/components/ui/SingleImageCapture";

export function InventoryPanel() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    price: string;
    description: string;
    category: Category;
    condition: Condition;
    region: RegionId;
    location: string;
    phone: string;
    verified: boolean;
    featured: boolean;
  }>({
    name: "",
    price: "",
    description: "",
    category: CATEGORIES[0]!,
    condition: CONDITIONS[0]!,
    region: "kiu" as RegionId,
    location: "",
    phone: "",
    verified: false,
    featured: false,
  });
  const [files, setFiles] = useState<File[]>([]);
  const [studentIdFile, setStudentIdFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function fillFromItem(item: Item | null) {
    if (!item) {
      setEditing(null);
      setForm({
        name: "",
        price: "",
        description: "",
        category: CATEGORIES[0]!,
        condition: CONDITIONS[0]!,
        region: "kiu",
        location: "",
        phone: "",
        verified: false,
        featured: false,
      });
      setFiles([]);
      setStudentIdFile(null);
      return;
    }
    setEditing(item);
    setForm({
      name: item.name,
      price: String(item.price),
      description: item.description,
      category: (CATEGORIES.includes(item.category as Category)
        ? item.category
        : CATEGORIES[0]) as Category,
      condition: (CONDITIONS.includes(item.condition as Condition)
        ? item.condition
        : CONDITIONS[0]) as Condition,
      region: item.region,
      location: item.location,
      phone: item.phone ?? "",
      verified: Boolean(item.verified),
      featured: Boolean(item.featured),
    });
    setFiles([]);
    setStudentIdFile(null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(form.price.replace(/[^\d]/g, ""));
    if (!form.name.trim() || !form.location.trim() || !form.phone.trim()) {
      return;
    }
    if (!Number.isFinite(price) || price <= 0) return;
    setBusy(true);
    try {
      const base: ItemInput = {
        name: form.name.trim(),
        price,
        description: form.description.trim(),
        category: form.category,
        condition: form.condition,
        region: form.region,
        location: form.location.trim(),
        images: editing ? editing.images : [],
        phone: form.phone.trim(),
        verified: form.verified,
        featured: form.featured,
        studentIdImage: editing?.studentIdImage ?? null,
        status: editing?.status ?? "available",
      };
      let id: string;
      if (editing) {
        id = editing.id;
        await updateItem(id, base);
      } else {
        id = await createItem({ ...base, images: [] });
      }
      if (files.length) {
        const urls = await uploadMany(`items/${id}`, files);
        const merged = editing ? [...editing.images, ...urls] : urls;
        await updateItem(id, { images: merged });
      }
      if (studentIdFile) {
        const sid = await uploadMany(`items/${id}/student-id`, [studentIdFile]);
        await updateItem(id, { studentIdImage: sid[0] ?? null });
      }
      fillFromItem(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this item permanently?")) return;
    setBusy(true);
    try {
      await deleteItem(id);
      if (editing?.id === id) fillFromItem(null);
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function onMarkSold(id: string, sold: boolean) {
    setBusy(true);
    try {
      await updateItem(id, { status: sold ? "sold" : "available" });
      await load();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className={`p-6 sm:p-8 ${cardElevated}`}
      >
        <h2 className="text-xl font-extrabold tracking-tight text-isha-text">
          {editing ? "Edit item" : "Add new item"}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={fieldLabel}>Name</label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>
              Price (UGX)
            </label>
            <input
              required
              inputMode="numeric"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: e.target.value }))
              }
              className={fieldInput}
            />
          </div>
          <div>
            <label className={fieldLabel}>Phone</label>
            <input
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 0703268522 or +256703268522 (WhatsApp / call)"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              className={fieldInput}
            />
            <p className="mt-1.5 text-xs text-isha-text-muted">
              Shown on the public item page for WhatsApp and phone calls — use your
              shop number or the seller&apos;s number for this item.
            </p>
          </div>
          <div>
            <label className={fieldLabel}>
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  category: e.target.value as (typeof CATEGORIES)[number],
                }))
              }
              className={fieldSelect}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>
              Condition
            </label>
            <select
              value={form.condition}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  condition: e.target.value as (typeof CONDITIONS)[number],
                }))
              }
              className={fieldSelect}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={fieldLabel}>Region</label>
            <select
              value={form.region}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  region: e.target.value as RegionId,
                }))
              }
              className={fieldSelect}
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel}>
              Location (Ishaka)
            </label>
            <input
              required
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              className={fieldInput}
              placeholder="e.g. Hostel block, KIU campus"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={fieldLabel}>
              Description
            </label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={fieldTextarea}
            />
          </div>
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.verified}
                onChange={(e) =>
                  setForm((f) => ({ ...f, verified: e.target.checked }))
                }
              />
              Ishaka verified seller
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, featured: e.target.checked }))
                }
              />
              Hot deal (featured)
            </label>
          </div>
          <div className="sm:col-span-2">
            <ProductPhotosField
              label="Product photos"
              files={files}
              onFilesChange={setFiles}
              idPrefix="inv-photos"
              maxFiles={12}
              hint={
                editing && editing.images.length > 0
                  ? "Existing photos are kept. New shots are added after you save."
                  : "Take several angles: overall, labels, wear or damage."
              }
            />
          </div>
          <div className="sm:col-span-2">
            <SingleImageCapture
              id="inv-student-id"
              label="Optional student ID (image)"
              file={studentIdFile}
              onFileChange={setStudentIdFile}
            />
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className={`${btnPrimary} disabled:opacity-60`}
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Publish item"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => fillFromItem(null)}
              className={btnSecondary}
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-isha-text">
          Inventory
        </h2>
        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading…</p>
        ) : items.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">No items yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-isha-border bg-white p-4 shadow-md ring-1 ring-black/[0.03] sm:flex-row sm:items-center"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-isha-muted">
                  {item.images[0] ? (
                    <Image
                      src={item.images[0]}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      No img
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-isha-text">{item.name}</p>
                  <p className="text-sm text-isha-primary">
                    {formatUGX(item.price)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.status === "sold" ? "Sold" : "Available"} ·{" "}
                    {item.category}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillFromItem(item)}
                    className="rounded-xl border border-isha-border px-3 py-1.5 text-sm font-medium hover:bg-isha-muted"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onMarkSold(item.id, item.status !== "sold")}
                    className="rounded-xl border border-isha-border px-3 py-1.5 text-sm font-medium hover:bg-isha-muted"
                  >
                    {item.status === "sold" ? "Mark available" : "Mark sold"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
