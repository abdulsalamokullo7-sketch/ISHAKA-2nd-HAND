import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, MEETING_POINTS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${APP_NAME} — Ishaka's trusted second-hand marketplace.`,
};

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Browse or sell",
    desc: "Explore curated second-hand items or submit your own for the shop to review.",
  },
  {
    step: "2",
    title: "Chat on WhatsApp",
    desc: "Tap the WhatsApp button on any listing to talk directly with the seller or shop.",
  },
  {
    step: "3",
    title: "Meet & inspect",
    desc: "Agree on a safe, public meeting point in Ishaka. Check the item before you pay.",
  },
  {
    step: "4",
    title: "Pay & enjoy",
    desc: "Pay in UGX cash on the spot. No hidden fees, no middlemen.",
  },
];

const TRUST = [
  { title: "Curated listings", desc: "Every item is reviewed by the shop team before it goes live." },
  { title: "Clear UGX prices", desc: "No surprises. What you see is what you pay." },
  { title: "Local pickup only", desc: "Meet in person around KIU, BSU, or Ishaka town." },
  { title: "Verified sellers", desc: "Trusted sellers earn a blue badge on their listings." },
  { title: "WhatsApp first", desc: "Chat with the seller before committing to anything." },
  { title: "No platform fees", desc: "Buyers and sellers deal directly — we just connect you." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-bold uppercase tracking-widest text-isha-primary">
        About us
      </p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-isha-text sm:text-4xl">
        {APP_NAME}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-isha-text-muted sm:text-lg">
        We are Ishaka&apos;s local second-hand marketplace — serving students and
        residents around KIU, BSU, and the greater Ishaka town area. Buy quality
        pre-owned items at fair prices, or sell what you no longer need and turn
        it into cash.
      </p>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-isha-text">
          How it works
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {HOW_IT_WORKS.map((s) => (
            <div
              key={s.step}
              className="flex gap-4 rounded-2xl border border-isha-border bg-white p-5 shadow-sm"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-isha-primary text-sm font-extrabold text-white shadow">
                {s.step}
              </span>
              <div>
                <p className="font-bold text-isha-text">{s.title}</p>
                <p className="mt-1 text-sm text-isha-text-muted">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-isha-text">
          Why people trust us
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((t) => (
            <div
              key={t.title}
              className="rounded-2xl border border-isha-border bg-white p-5 shadow-sm"
            >
              <p className="font-bold text-isha-text">{t.title}</p>
              <p className="mt-1 text-sm text-isha-text-muted">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold tracking-tight text-isha-text">
          Safe meeting points
        </h2>
        <p className="mt-2 text-sm text-isha-text-muted">
          Always meet in a busy, public place. Here are popular spots:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MEETING_POINTS.map((p) => (
            <span
              key={p}
              className="rounded-full bg-isha-muted px-4 py-2 text-sm font-semibold text-isha-text"
            >
              {p}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-14 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-2xl bg-isha-primary px-8 py-4 text-sm font-extrabold text-white shadow-lg shadow-green-600/20 transition hover:bg-isha-primary-dark"
        >
          Browse the shop
        </Link>
        <Link
          href="/sell"
          className="inline-flex items-center justify-center rounded-2xl border-2 border-isha-border bg-white px-8 py-4 text-sm font-bold text-isha-text shadow-sm transition hover:bg-isha-muted"
        >
          Sell your item
        </Link>
      </div>
    </div>
  );
}
