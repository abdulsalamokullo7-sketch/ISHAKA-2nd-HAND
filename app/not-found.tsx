import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-7xl font-extrabold text-isha-primary/20">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-isha-text">
        Page not found
      </h1>
      <p className="mt-2 max-w-sm text-isha-text-muted">
        That link doesn&apos;t exist on {APP_NAME}. Maybe the item was removed, or
        the URL is wrong.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="rounded-2xl bg-isha-primary px-8 py-3 text-sm font-extrabold text-white shadow-lg shadow-green-600/20 transition hover:bg-isha-primary-dark"
        >
          Browse the shop
        </Link>
        <Link
          href="/sell"
          className="rounded-2xl border-2 border-isha-border bg-white px-8 py-3 text-sm font-bold text-isha-text shadow-sm transition hover:bg-isha-muted"
        >
          Sell to us
        </Link>
      </div>
    </div>
  );
}
