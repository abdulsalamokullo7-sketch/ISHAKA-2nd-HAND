"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";

const NAV_LINKS: readonly { href: string; label: string; badge?: boolean }[] = [
  { href: "/", label: "Shop" },
  { href: "/favorites", label: "Saved", badge: true },
  { href: "/sell", label: "Sell to us" },
  { href: "/about", label: "About" },
];

export function SiteHeaderNav() {
  const { count, ready } = useFavorites();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  useEffect(() => { close(); }, [pathname, close]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, close]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive(link.href)
                ? "bg-isha-primary/10 text-isha-primary"
                : "text-isha-text hover:bg-isha-muted"
            }`}
          >
            {link.label}
            {link.badge && ready && count > 0 && <FavBadge count={count} />}
          </Link>
        ))}
        <Link
          href="/admin"
          className="ml-2 rounded-full border border-isha-border bg-white px-4 py-2 text-sm font-semibold text-isha-text shadow-sm transition hover:border-isha-primary/30 hover:bg-green-50/80"
        >
          Admin
        </Link>
      </nav>

      {/* Mobile: favorites shortcut + hamburger */}
      <div className="flex items-center gap-1 md:hidden">
        <Link
          href="/favorites"
          className="relative flex h-9 w-9 items-center justify-center rounded-xl text-isha-text transition active:scale-95"
          aria-label="Saved items"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {ready && count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-isha-primary text-[9px] font-extrabold text-white ring-2 ring-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-isha-text transition active:scale-95"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <div className="flex w-[18px] flex-col gap-[4px]">
            <span className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
            <span className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in" onClick={close} aria-hidden />
      )}

      {/* Mobile drawer */}
      <nav
        className={`fixed right-0 top-0 z-50 flex h-full w-[280px] max-w-[80vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile menu"
      >
        <div className="flex items-center justify-between border-b border-isha-border px-4 py-3">
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-isha-primary to-emerald-700 text-xs font-extrabold text-white">IS</span>
            <span className="text-sm font-extrabold text-isha-text">Menu</span>
          </span>
          <button type="button" onClick={close} className="flex h-8 w-8 items-center justify-center rounded-lg text-isha-text active:bg-isha-muted" aria-label="Close">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-semibold transition active:scale-[0.98] ${
                  active ? "bg-isha-primary/10 text-isha-primary" : "text-isha-text active:bg-isha-muted"
                }`}
              >
                {link.label}
                {link.badge && ready && count > 0 && <FavBadge count={count} />}
              </Link>
            );
          })}
          <div className="my-2 border-t border-isha-border" />
          <Link
            href="/admin"
            onClick={close}
            className={`flex items-center rounded-2xl px-4 py-3 text-[15px] font-semibold transition active:scale-[0.98] ${
              pathname.startsWith("/admin") ? "bg-isha-primary/10 text-isha-primary" : "text-isha-text active:bg-isha-muted"
            }`}
          >
            Admin dashboard
          </Link>
        </div>
      </nav>
    </>
  );
}

function FavBadge({ count }: { count: number }) {
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-isha-primary px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
      {count > 99 ? "99+" : count}
    </span>
  );
}
