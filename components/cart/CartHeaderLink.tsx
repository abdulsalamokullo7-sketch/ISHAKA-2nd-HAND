"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

export function CartHeaderLink() {
  const { count, ready } = useCart();
  const pathname = usePathname();
  const active = pathname === "/cart";

  return (
    <Link
      href="/cart"
      className={`relative inline-flex items-center justify-center rounded-full border px-3 py-2 text-sm font-semibold transition sm:px-3.5 ${
        active
          ? "border-isha-primary bg-isha-primary/10 text-isha-primary"
          : "border-isha-border bg-white text-isha-text hover:bg-isha-muted"
      }`}
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218a1.5 1.5 0 001.464-1.175l.728-3.65A1.5 1.5 0 0017.128 9H6.872a1.5 1.5 0 00-1.464 1.175l-.728 3.65A1.5 1.5 0 006.872 15H19.5m-9 0v-3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V15m-6 0H6.75m9 0h2.25"
        />
      </svg>
      {ready && count > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-isha-primary px-1 text-[10px] font-extrabold text-white ring-2 ring-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
