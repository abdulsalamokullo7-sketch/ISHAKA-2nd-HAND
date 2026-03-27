import type { Metadata } from "next";
import Link from "next/link";
import { SellToUsForm } from "@/components/sell/SellToUsForm";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Sell to us",
  description: `Offer your item to the ${APP_NAME} shop in Ishaka.`,
};

const STEPS = [
  { icon: "📸", title: "Snap photos", desc: "Take clear pictures of your item from multiple angles." },
  { icon: "📝", title: "Fill the form", desc: "Tell us what it is, your price, and how to reach you." },
  { icon: "📞", title: "We contact you", desc: "Our team reviews and calls or WhatsApps you to negotiate." },
  { icon: "💰", title: "Get paid", desc: "Meet at a safe spot in Ishaka, hand over the item, get cash." },
];

export default function SellPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-isha-primary">
          Sell to the shop
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-isha-text sm:text-4xl">
          Turn your item into cash
        </h1>
        <p className="mt-3 text-base leading-relaxed text-isha-text-muted">
          Tell us what you are selling. We serve KIU Ishaka, BSU, and
          Ishaka town — we will contact you to inspect, negotiate, and collect.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex text-sm font-bold text-isha-primary hover:underline"
        >
          &larr; Back to shop
        </Link>
      </div>

      {/* How it works */}
      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <div key={i} className="flex gap-3 rounded-2xl border border-isha-border bg-white p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-isha-muted text-lg">
              {s.icon}
            </span>
            <div>
              <p className="text-sm font-bold text-isha-text">{s.title}</p>
              <p className="mt-0.5 text-xs text-isha-text-muted">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <SellToUsForm />
    </div>
  );
}
