"use client";

import { useState } from "react";
import {
  CONDITIONS,
  MEETING_PREFERENCES,
  REGIONS,
  type RegionId,
} from "@/lib/constants";
import { submitSellRequestWithFiles } from "@/lib/firebase/sellRequests";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import {
  btnPrimaryFull,
  cardElevated,
  fieldInput,
  fieldLabel,
  fieldSelect,
  fieldTextarea,
} from "@/lib/ui/field-styles";
import { ProductPhotosField } from "@/components/ui/ProductPhotosField";
import { useToast } from "@/contexts/ToastContext";

export function SellToUsForm() {
  const { toast } = useToast();
  const [itemName, setItemName] = useState("");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [condition, setCondition] = useState<string>("Used");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [region, setRegion] = useState<RegionId>("kiu");
  const [meetingPreference, setMeetingPreference] = useState<string>(
    MEETING_PREFERENCES[0]!.id,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [uploadLine, setUploadLine] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasFirebaseConfig()) {
      setStatus("error");
      setMessage("Firebase is not configured. Add keys to .env.local.");
      return;
    }
    const price = Number(expectedPrice.replace(/[^\d]/g, ""));
    if (!itemName.trim() || !phone.trim() || !description.trim()) {
      setMessage("Please fill in name, phone, and description.");
      setStatus("error");
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      setMessage("Enter a valid expected price in UGX.");
      setStatus("error");
      return;
    }
    const fullLocation = `${REGIONS.find((r) => r.id === region)?.label ?? region} — ${location.trim()}`;
    setStatus("sending");
    setMessage(null);
    setUploadLine("Saving your request…");
    try {
      await submitSellRequestWithFiles(
        {
          itemName: itemName.trim(),
          expectedPrice: price,
          condition,
          phone: phone.trim(),
          description: description.trim(),
          location: fullLocation,
          meetingPreference,
        },
        files,
        {
          onUploadProgress: ({ completed, total, label }) => {
            if (total === 0) return;
            setUploadLine(
              completed === 0
                ? `Uploading ${total} photo${total === 1 ? "" : "s"}…`
                : `Uploaded ${completed}/${total} — ${label}`,
            );
          },
        },
      );
      setStatus("done");
      setUploadLine(null);
      setItemName("");
      setExpectedPrice("");
      setPhone("");
      setDescription("");
      setLocation("");
      setFiles([]);
      const photoNote =
        files.length > 0
          ? ` ${files.length} photo${files.length === 1 ? "" : "s"} uploaded.`
          : "";
      setMessage(
        `Thanks! The shop will review your item and contact you on WhatsApp or call.${photoNote}`,
      );
      toast(`Submitted successfully.${photoNote}`, "success");
    } catch (err) {
      setStatus("error");
      setUploadLine(null);
      const errMsg =
        err instanceof Error ? err.message : "Something went wrong. Try again.";
      setMessage(errMsg);
      toast(errMsg, "error");
    }
  }

  return (
    <form onSubmit={onSubmit} className={`mx-auto max-w-xl space-y-6 p-6 sm:p-8 ${cardElevated}`}>
      <div>
        <label className={fieldLabel} htmlFor="name">
          Item name
        </label>
        <input
          id="name"
          required
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          className={fieldInput}
          placeholder="e.g. Samsung phone, office chair"
        />
      </div>
      <div>
        <label className={fieldLabel} htmlFor="price">
          Expected price (UGX)
        </label>
        <input
          id="price"
          inputMode="numeric"
          required
          value={expectedPrice}
          onChange={(e) => setExpectedPrice(e.target.value)}
          className={fieldInput}
          placeholder="e.g. 150000"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={fieldLabel} htmlFor="cond">
            Condition
          </label>
          <select
            id="cond"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
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
          <label className={fieldLabel} htmlFor="reg">
            Area
          </label>
          <select
            id="reg"
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionId)}
            className={fieldSelect}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className={fieldLabel} htmlFor="loc">
          Preferred location in Ishaka
        </label>
        <input
          id="loc"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={fieldInput}
          placeholder="e.g. KIU hostel block, near taxi park"
        />
      </div>
      <div>
        <label className={fieldLabel} htmlFor="meet">
          Meeting preference
        </label>
        <select
          id="meet"
          value={meetingPreference}
          onChange={(e) => setMeetingPreference(e.target.value)}
          className={fieldSelect}
        >
          {MEETING_PREFERENCES.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={fieldLabel} htmlFor="phone">
          Phone number (WhatsApp preferred)
        </label>
        <input
          id="phone"
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className={fieldInput}
          placeholder="e.g. 07XXXXXXXX"
        />
      </div>
      <div>
        <label className={fieldLabel} htmlFor="desc">
          Description
        </label>
        <textarea
          id="desc"
          required
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={fieldTextarea}
          placeholder="Defects, accessories, reason for selling…"
        />
      </div>
      <ProductPhotosField
        label="Photos of your item"
        files={files}
        onFilesChange={setFiles}
        idPrefix="sell-photos"
        maxFiles={8}
        hint="Use good light and show any scratches or damage — we price fairly from what we see. Large photos are resized automatically before upload (same as our shop tools), so sending is faster on slow internet."
      />
      {status === "sending" && uploadLine && (
        <p
          className="rounded-xl bg-isha-primary/10 px-3 py-2 text-sm font-semibold text-isha-primary ring-1 ring-isha-primary/20"
          role="status"
          aria-live="polite"
        >
          {uploadLine}
        </p>
      )}
      {message && (
        <p
          className={`rounded-xl px-3 py-2 text-sm font-medium ${
            status === "error"
              ? "bg-red-50 text-red-800 ring-1 ring-red-100"
              : "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-100"
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className={btnPrimaryFull}
      >
        {status === "sending"
          ? uploadLine ?? "Working…"
          : "Submit to shop"}
      </button>
    </form>
  );
}
