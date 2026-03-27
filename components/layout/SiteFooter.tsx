import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-isha-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-isha-primary to-emerald-700 text-sm font-extrabold text-white shadow">
                IS
              </span>
              <span className="text-lg font-extrabold tracking-tight text-isha-text">
                {APP_NAME}
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-isha-text-muted">
              Ishaka&apos;s trusted second-hand shop — curated listings, clear
              UGX prices, and safe local pickup around KIU, BSU & town.
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-isha-text">
              Shop
            </p>
            <ul className="mt-3 space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/" className="text-isha-text-muted transition hover:text-isha-primary">
                  Browse all items
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="text-isha-text-muted transition hover:text-isha-primary">
                  Saved items
                </Link>
              </li>
              <li>
                <Link href="/sell" className="text-isha-text-muted transition hover:text-isha-primary">
                  Sell to our shop
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-isha-text">
              Company
            </p>
            <ul className="mt-3 space-y-2.5 text-sm font-medium">
              <li>
                <Link href="/about" className="text-isha-text-muted transition hover:text-isha-primary">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-isha-text-muted transition hover:text-isha-primary">
                  Shop owner login
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-isha-text">
              Trust & safety
            </p>
            <ul className="mt-3 space-y-2.5 text-sm text-isha-text-muted">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-isha-primary">&#10003;</span>
                Meet in public places
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-isha-primary">&#10003;</span>
                Inspect before you pay
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-isha-primary">&#10003;</span>
                Verified seller badges
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-isha-border pt-8 text-xs text-isha-text-muted sm:flex-row sm:items-center sm:justify-between">
          <span>
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </span>
          <span>KIU &middot; BSU &middot; Ishaka Town</span>
        </div>
      </div>
    </footer>
  );
}
