import Image from "next/image";
import Link from "next/link";
import type { Item } from "@/lib/types";
import { formatUGX, REGIONS } from "@/lib/constants";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";

function regionLabel(region: string) {
  return REGIONS.find((r) => r.id === region)?.label ?? region;
}

export function ItemCard({ item }: { item: Item }) {
  const img = item.images[0];
  const hot = item.featured;

  return (
    <Link
      href={`/item/${item.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-isha-border/90 bg-isha-card shadow-md ring-1 ring-black/[0.03] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-isha-primary/15"
    >
      {item.verified && (
        <span className="absolute right-2 top-2 z-10 rounded-full bg-isha-blue/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md ring-1 ring-white/30">
          Verified
        </span>
      )}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-b from-isha-muted to-gray-100">
        {img ? (
          <Image
            src={img}
            alt={item.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-medium text-gray-400">
            Photo coming soon
          </div>
        )}
        {hot && (
          <span className="absolute left-2 top-2 rounded-full bg-isha-accent px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-isha-text shadow-md ring-1 ring-black/5">
            Hot deal
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
        <span className="absolute bottom-2 right-2 z-10">
          <FavoriteButton itemId={item.id} size="sm" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-bold leading-snug text-isha-text group-hover:text-isha-primary sm:text-base">
          {item.name}
        </h3>
        <p className="text-xl font-extrabold tracking-tight text-isha-primary sm:text-2xl">
          {formatUGX(item.price)}
        </p>
        <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
          <span className="rounded-lg bg-isha-muted px-2 py-0.5 text-[11px] font-semibold text-gray-700">
            {item.condition}
          </span>
          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-900 ring-1 ring-emerald-100">
            {item.category}
          </span>
        </div>
        <div className="flex items-start justify-between gap-2 border-t border-isha-border/80 pt-3 text-[11px] text-isha-text-muted">
          <span className="font-medium text-gray-600">{regionLabel(item.region)}</span>
          <span className="line-clamp-1 max-w-[55%] text-right text-gray-500">
            {item.location}
          </span>
        </div>
        <span className="text-xs font-semibold text-isha-primary opacity-0 transition group-hover:opacity-100">
          View details →
        </span>
      </div>
    </Link>
  );
}
