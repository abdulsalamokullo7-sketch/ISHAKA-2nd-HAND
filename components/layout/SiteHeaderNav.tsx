"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
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
          {link.badge && ready && count > 0 && (
            <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-isha-primary px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Link>
      ))}
      <Link
        href="/admin"
        className="ml-2 rounded-full border border-isha-border bg-white px-4 py-2 text-sm font-semibold text-isha-text shadow-sm transition hover:border-isha-primary/30 hover:bg-green-50/80"
      >
        Admin
      </Link>
    </nav>
  );
}
