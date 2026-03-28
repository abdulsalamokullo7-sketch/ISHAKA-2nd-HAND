import Link from "next/link";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-isha-border/80 bg-white/95 shadow-sm backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6 sm:py-3">
        <Link href="/" className="group flex shrink-0 items-center gap-2 sm:gap-3">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-isha-primary to-emerald-700 text-sm font-extrabold text-white shadow-md ring-1 ring-black/5 sm:h-11 sm:w-11 sm:rounded-2xl sm:text-base"
            aria-hidden
          >
            IS
          </span>
          <span className="hidden text-base font-extrabold tracking-tight text-isha-text sm:block sm:text-lg">
            Ishaka Market
          </span>
        </Link>
        <SiteHeaderNav />
      </div>
    </header>
  );
}
