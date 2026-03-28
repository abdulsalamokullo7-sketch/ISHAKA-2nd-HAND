"use client";

import { useCart } from "@/contexts/CartContext";

type Props = {
  itemId: string;
  className?: string;
  size?: "sm" | "md";
};

export function AddToCartButton({ itemId, className = "", size = "md" }: Props) {
  const { has, add, remove } = useCart();
  const inCart = has(itemId);
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (inCart) remove(itemId);
        else add(itemId);
      }}
      className={`inline-flex ${dim} items-center justify-center rounded-full border bg-white/95 text-isha-primary shadow-md ring-1 ring-black/5 transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-isha-primary ${inCart ? "border-isha-primary bg-green-50" : "border-isha-border"} ${className}`}
      aria-pressed={inCart}
      aria-label={inCart ? "Remove from cart" : "Add to cart"}
      title={inCart ? "Remove from cart" : "Add to cart"}
    >
      <svg
        className={icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        {inCart ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218a1.5 1.5 0 001.464-1.175l.728-3.65A1.5 1.5 0 0017.128 9H6.872a1.5 1.5 0 00-1.464 1.175l-.728 3.65A1.5 1.5 0 006.872 15H19.5m-9 0v-3.75c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V15m-6 0H6.75m9 0h2.25"
          />
        )}
      </svg>
    </button>
  );
}
