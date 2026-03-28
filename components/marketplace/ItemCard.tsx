import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/lib/types";
import { formatUGX } from "@/lib/constants";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

export function ItemCard({ item, compact }: { item: Item; compact?: boolean }) {
  const img = item.images[0];

  return (
    <Link
      href={`/item/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-isha-border/70 bg-white shadow-sm transition-all duration-200 active:scale-[0.98] hover:shadow-md sm:hover:-translate-y-0.5"
    >
      <div className={`relative w-full overflow-hidden bg-isha-muted ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        {img ? (
          <Image
            src={img}
            alt={item.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            No photo
          </div>
        )}
        {item.featured && (
          <span className="absolute left-1.5 top-1.5 rounded-md bg-isha-accent px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-isha-text shadow-sm sm:left-2 sm:top-2 sm:rounded-lg sm:px-2 sm:py-1 sm:text-[10px]">
            Hot
          </span>
        )}
        {item.verified && (
          <span className="absolute right-1.5 top-1.5 rounded-md bg-isha-blue/90 px-1.5 py-0.5 text-[9px] font-bold text-white sm:right-2 sm:top-2 sm:rounded-lg sm:px-2 sm:text-[10px]">
            Verified
          </span>
        )}
        <span className="absolute bottom-1.5 right-1.5 z-10 sm:bottom-2 sm:right-2">
          <FavoriteButton itemId={item.id} size="sm" />
        </span>
      </div>
      <div className={`flex flex-1 flex-col gap-1 ${compact ? "p-2.5" : "p-3 sm:p-4"}`}>
        <h3 className={`line-clamp-2 font-bold leading-tight text-isha-text ${compact ? "text-xs" : "text-sm sm:text-[15px]"}`}>
          {item.name}
        </h3>
        <p className={`font-extrabold tracking-tight text-isha-primary ${compact ? "text-sm" : "text-base sm:text-lg"}`}>
          {formatUGX(item.price)}
        </p>
        <div className="mt-auto flex flex-wrap gap-1 pt-1">
          <span className={`rounded-md bg-isha-muted font-semibold text-gray-600 ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px] sm:text-[11px]"}`}>
            {item.condition}
          </span>
          <span className={`rounded-md bg-emerald-50 font-semibold text-emerald-800 ring-1 ring-emerald-100 ${compact ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px] sm:text-[11px]"}`}>
            {item.category}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function ItemCardSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-isha-border bg-white shadow-sm">
      <div className={`animate-pulse bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 ${compact ? "aspect-square" : "aspect-[4/3]"}`} />
      <div className={`space-y-2 ${compact ? "p-2.5" : "p-3 sm:p-4"}`}>
        <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="h-2.5 w-full animate-pulse rounded bg-gray-100" />
      </div>
    </div>
  );
}
