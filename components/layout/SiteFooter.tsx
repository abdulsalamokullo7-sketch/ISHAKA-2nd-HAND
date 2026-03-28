import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-isha-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Compact 2-col on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 gap-6 sm:gap-10 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-isha-primary to-emerald-700 text-xs font-extrabold text-white shadow sm:h-10 sm:w-10 sm:rounded-xl sm:text-sm">
                IS
              </span>
              <span className="text-base font-extrabold tracking-tight text-isha-text sm:text-lg">
                {APP_NAME}
              </span>
            </div>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-isha-text-muted sm:mt-3 sm:text-sm">
              Ishaka&apos;s trusted second-hand shop — curated listings, clear UGX prices, safe local pickup.
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-isha-text sm:text-xs">Shop</p>
            <ul className="mt-2 space-y-1.5 text-xs font-medium sm:mt-3 sm:space-y-2.5 sm:text-sm">
              <li><Link href="/" className="text-isha-text-muted transition hover:text-isha-primary">Browse items</Link></li>
              <li><Link href="/favorites" className="text-isha-text-muted transition hover:text-isha-primary">Saved</Link></li>
              <li><Link href="/cart" className="text-isha-text-muted transition hover:text-isha-primary">Cart</Link></li>
              <li><Link href="/sell" className="text-isha-text-muted transition hover:text-isha-primary">Sell to us</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-isha-text sm:text-xs">More</p>
            <ul className="mt-2 space-y-1.5 text-xs font-medium sm:mt-3 sm:space-y-2.5 sm:text-sm">
              <li><Link href="/about" className="text-isha-text-muted transition hover:text-isha-primary">About us</Link></li>
              <li><Link href="/admin" className="text-isha-text-muted transition hover:text-isha-primary">Shop login</Link></li>
            </ul>
          </div>

          {/* Trust — hidden on very small screens to save space */}
          <div className="hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-widest text-isha-text">Trust</p>
            <ul className="mt-3 space-y-2 text-sm text-isha-text-muted">
              <li className="flex items-start gap-2"><span className="mt-0.5 text-isha-primary">&#10003;</span>Meet in public</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 text-isha-primary">&#10003;</span>Inspect before pay</li>
              <li className="flex items-start gap-2"><span className="mt-0.5 text-isha-primary">&#10003;</span>Verified badges</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-isha-border pt-4 text-[10px] text-isha-text-muted sm:mt-10 sm:pt-8 sm:text-xs">
          <span>&copy; {new Date().getFullYear()} {APP_NAME}</span>
          <span>Ishaka Town</span>
        </div>
      </div>
    </footer>
  );
}
