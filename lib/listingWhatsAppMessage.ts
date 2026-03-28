import { APP_NAME, formatUGX, REGIONS } from "@/lib/constants";
import type { Item } from "@/lib/types";

const DESC_MAX = 400;

/**
 * Prefilled WhatsApp text for buyers — name, price, category, condition, location, short description, listing id/link.
 */
export function buildListingWhatsAppText(
  item: Item,
  options?: {
    /** Full URL to the item page (optional). */
    listingPageUrl?: string;
    /** Override the opening line (e.g. cart context). */
    introLine?: string;
  },
): string {
  const regionLabel =
    REGIONS.find((r) => r.id === item.region)?.label ?? String(item.region);
  const intro =
    options?.introLine ??
    `Hi! I'm interested in this product on ${APP_NAME}.`;

  const lines: string[] = [
    intro,
    "",
    `*Item:* ${item.name}`,
    `*Price:* ${formatUGX(item.price)}`,
    `*Category:* ${item.category}`,
    `*Condition:* ${item.condition}`,
    `*Area:* ${regionLabel}`,
    `*Pickup / location:* ${item.location}`,
  ];

  const desc = item.description?.trim();
  if (desc) {
    lines.push(
      `*Description:* ${
        desc.length > DESC_MAX
          ? `${desc.slice(0, DESC_MAX - 3)}...`
          : desc
      }`,
    );
  }

  lines.push("", `*Listing ID:* ${item.id}`);

  if (options?.listingPageUrl) {
    lines.push(`*Link:* ${options.listingPageUrl}`);
  }

  lines.push("", "Is it still available? I'd like more details.");

  return lines.join("\n");
}
