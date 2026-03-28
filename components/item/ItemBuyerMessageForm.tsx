"use client";

import { useState } from "react";
import { submitItemBuyerMessage } from "@/lib/firebase/itemBuyerMessages";
import { hasFirebaseConfig } from "@/lib/firebase/env";
import { fieldInput, fieldLabel, fieldTextarea } from "@/lib/ui/field-styles";
import { useToast } from "@/contexts/ToastContext";

type Props = {
  itemId: string;
  itemName: string;
};

export function ItemBuyerMessageForm({ itemId, itemName }: Props) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!hasFirebaseConfig()) {
      toast("Firebase is not configured.", "error");
      return;
    }
    setSending(true);
    try {
      await submitItemBuyerMessage({
        itemId,
        itemName,
        buyerName: name,
        buyerPhone: phone,
        message,
      });
      toast("Message sent to the shop. They will get back to you.", "success");
      setMessage("");
    } catch (err) {
      toast(
        err instanceof Error ? err.message : "Could not send message.",
        "error",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-2xl border border-isha-border bg-white p-4 shadow-sm sm:p-5"
    >
      <p className="text-sm font-bold text-isha-text">
        Message the shop about this item
      </p>
      <p className="mt-1 text-xs text-isha-text-muted">
        Questions, offers, or pickup time — the team reads this in Admin.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className={fieldLabel} htmlFor="buyer-name">
            Your name
          </label>
          <input
            id="buyer-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={fieldInput}
            autoComplete="name"
          />
        </div>
        <div>
          <label className={fieldLabel} htmlFor="buyer-phone">
            Phone / WhatsApp
          </label>
          <input
            id="buyer-phone"
            required
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={fieldInput}
            autoComplete="tel"
            placeholder="e.g. 0703…"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className={fieldLabel} htmlFor="buyer-msg">
          Message
        </label>
        <textarea
          id="buyer-msg"
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={fieldTextarea}
          placeholder="e.g. Is this still available? Can we meet at KIU gate tomorrow?"
        />
      </div>
      <button
        type="submit"
        disabled={sending}
        className="mt-4 w-full rounded-xl bg-isha-blue px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Sending…" : "Send to shop"}
      </button>
    </form>
  );
}
