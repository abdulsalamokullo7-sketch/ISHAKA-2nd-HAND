"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";

const NAV_LINKS: readonly { href: string; label: string; icon: (p: { className?: string }) => React.JSX.Element; badge?: boolean }[] = [
  { href: "/", label: "Shop", icon: ShopIcon },
  { href: "/favorites", label: "Saved", icon: HeartIcon, badge: true },
  { href: "/sell", label: "Sell to us", icon: TagIcon },
  { href: "/about", label: "About", icon: InfoIcon },
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
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
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

      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-isha-text transition hover:bg-isha-muted md:hidden"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        <span className="sr-only">{open ? "Close" : "Menu"}</span>
        <div className="flex w-5 flex-col gap-[5px]">
          <span className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`} />
          <span className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`h-[2px] w-full rounded-full bg-current transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`} />
        </div>
        {!open && ready && count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-isha-primary text-[9px] font-extrabold text-white ring-2 ring-white">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden" onClick={close} aria-hidden />
      )}

      {/* Mobile drawer */}
      <nav
        className={`fixed right-0 top-0 z-50 flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile menu"
      >
        <div className="flex items-center justify-between border-b border-isha-border px-5 py-4">
          <span className="text-sm font-extrabold tracking-tight text-isha-text">Menu</span>
          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-isha-text hover:bg-isha-muted"
            aria-label="Close menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition ${
                  active
                    ? "bg-isha-primary/10 text-isha-primary"
                    : "text-isha-text hover:bg-isha-muted"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {link.label}
                {link.badge && ready && count > 0 && <FavBadge count={count} />}
              </Link>
            );
          })}
          <div className="my-3 border-t border-isha-border" />
          <Link
            href="/admin"
            onClick={close}
            className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[15px] font-semibold transition ${
              pathname.startsWith("/admin")
                ? "bg-isha-primary/10 text-isha-primary"
                : "text-isha-text hover:bg-isha-muted"
            }`}
          >
            <LockIcon className="h-5 w-5 shrink-0" />
            Admin dashboard
          </Link>
        </div>
        <div className="border-t border-isha-border px-5 py-4 text-center text-[11px] text-isha-text-muted">
          Ishaka Second-Hand Market
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

function ShopIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
    </svg>
  );
}

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
