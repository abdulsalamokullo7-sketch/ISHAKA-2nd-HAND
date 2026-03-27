"use client";

import { useFavorites } from "@/contexts/FavoritesContext";

type Props = {
  itemId: string;
  className?: string;
  size?: "sm" | "md";
};

export function FavoriteButton({ itemId, className = "", size = "md" }: Props) {
  const { has, toggle } = useFavorites();
  const active = has(itemId);
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(itemId);
      }}
      className={`inline-flex ${dim} items-center justify-center rounded-full border bg-white/95 text-rose-500 shadow-md ring-1 ring-black/5 transition hover:scale-105 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-isha-primary ${active ? "border-rose-200 bg-rose-50" : "border-isha-border"} ${className}`}
      aria-pressed={active}
      aria-label={active ? "Remove from saved" : "Save item"}
      title={active ? "Remove from saved" : "Save for later"}
    >
      <svg
        className={icon}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
