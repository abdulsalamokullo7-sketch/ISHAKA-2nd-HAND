import Link from "next/link";
import { CartHeaderLink } from "@/components/cart/CartHeaderLink";
import {
  APP_BRAND_MARKET,
  APP_BRAND_SECOND_HAND,
  APP_NAME,
} from "@/lib/constants";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-isha-border/80 bg-white/95 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2 sm:gap-3"
          aria-label={`${APP_NAME} home`}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-isha-primary to-emerald-700 text-sm font-extrabold text-white shadow-md ring-1 ring-black/5 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-base"
            aria-hidden
          >
            IS
          </span>
          <span className="flex flex-col leading-[1.1] sm:flex-row sm:items-baseline sm:gap-2 sm:leading-tight">
            <span className="text-sm font-extrabold tracking-wide text-isha-text sm:text-lg">
              {APP_BRAND_MARKET}
            </span>
            <span className="text-xs font-extrabold tracking-tight text-isha-primary sm:text-base">
              {APP_BRAND_SECOND_HAND}
            </span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <CartHeaderLink />
          <SiteHeaderNav />
        </div>
      </div>
    </header>
  );
}
