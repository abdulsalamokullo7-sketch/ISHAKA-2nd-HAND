"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";

const TABS: readonly {
  href: string;
  label: string;
  icon: (p: { active?: boolean }) => React.JSX.Element;
  badge?: "cart" | "saved";
}[] = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/cart", label: "Cart", icon: CartIcon, badge: "cart" },
  { href: "/favorites", label: "Saved", icon: HeartIcon, badge: "saved" },
  { href: "/sell", label: "Sell", icon: PlusIcon },
  { href: "/about", label: "About", icon: InfoIcon },
  { href: "/admin", label: "Admin", icon: LockIcon },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { count: favCount, ready: favReady } = useFavorites();
  const { count: cartCount, ready: cartReady } = useCart();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-isha-border/80 bg-white/95 backdrop-blur-lg md:hidden"
      aria-label="Main navigation"
    >
      <div className="flex items-stretch justify-around pb-[env(safe-area-inset-bottom,4px)]">
        {TABS.map((tab) => {
          const active = isActive(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10px] font-semibold transition active:opacity-70 ${
                active ? "text-isha-primary" : "text-gray-400"
              }`}
            >
              {active && (
                <span className="absolute inset-x-3 top-0 h-[2.5px] rounded-full bg-isha-primary" />
              )}
              <Icon active={active} />
              <span>{tab.label}</span>
              {tab.badge === "cart" &&
                cartReady &&
                cartCount > 0 && (
                  <span className="absolute right-[calc(50%-14px)] top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-isha-primary text-[8px] font-extrabold text-white ring-1 ring-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              {tab.badge === "saved" &&
                favReady &&
                favCount > 0 && (
                  <span className="absolute right-[calc(50%-14px)] top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-extrabold text-white ring-1 ring-white">
                    {favCount > 9 ? "9+" : favCount}
                  </span>
                )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return active ? (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 01-.53 1.28H18v7.44a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75V16.5h-3v4.75a.75.75 0 01-.75.75h-3a.75.75 0 01-.75-.75v-7.44H3.31a.75.75 0 01-.53-1.28l8.69-8.69z" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function CartIcon({ active }: { active?: boolean }) {
  return active ? (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M2.25 2.25a.75.75 0 000 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 001.305 6.823c.256.565.83.998 1.511.998h8.77a.75.75 0 000-1.5H8.972a1.75 1.75 0 01-1.317-.57l.055-.09.063-.092.019-.028 8.482-1.03a1.75 1.75 0 001.702-1.19l2.505-7.5a.75.75 0 00-.702-1.012H5.082l-.97-3.636A.75.75 0 003.375 3H2.25zM4.094 8.25h12.156l-2.18 6.54a.25.25 0 01-.242.18H8.972a.75.75 0 00-.648.372L7.5 15.75H6.375a1.875 1.875 0 01-1.756-2.448l1.092-4.068zM9.75 18a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zm4.5 0a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218a1.5 1.5 0 001.464-1.175l.728-3.65A1.5 1.5 0 0017.128 9H6.872a1.5 1.5 0 00-1.464 1.175l-.728 3.65A1.5 1.5 0 006.872 15H19.5m-9 0v-3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V15m-6 0H6.75m9 0h2.25" />
    </svg>
  );
}

function HeartIcon({ active }: { active?: boolean }) {
  return active ? (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function PlusIcon({ active }: { active?: boolean }) {
  return active ? (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 9a.75.75 0 00-1.5 0v2.25H9a.75.75 0 000 1.5h2.25V15a.75.75 0 001.5 0v-2.25H15a.75.75 0 000-1.5h-2.25V9z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function InfoIcon({ active }: { active?: boolean }) {
  return active ? (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
    </svg>
  );
}

function LockIcon({ active }: { active?: boolean }) {
  return active ? (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
    </svg>
  );
}
