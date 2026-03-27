import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { SiteHeaderNav } from "./SiteHeaderNav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-isha-border/80 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex min-w-0 items-center gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-isha-primary to-emerald-700 text-lg font-extrabold text-white shadow-md ring-1 ring-black/5 transition group-hover:shadow-lg"
            aria-hidden
          >
            IS
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-extrabold tracking-tight text-isha-text sm:text-xl">
              {APP_NAME}
            </span>
            <span className="block truncate text-[11px] font-medium uppercase tracking-wider text-isha-text-muted sm:text-xs">
              Premium second-hand · Ishaka
            </span>
          </span>
        </Link>
        <SiteHeaderNav />
      </div>
    </header>
  );
}
