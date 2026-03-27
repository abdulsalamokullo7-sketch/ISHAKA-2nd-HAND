export const APP_NAME = "Ishaka Second-Hand Market";

export const REGIONS = [
  { id: "kiu", label: "KIU Ishaka" },
  { id: "bsu", label: "BSU Ishaka" },
  { id: "town", label: "Ishaka Town" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export const CATEGORIES = [
  "Electronics",
  "Phones",
  "Laptops",
  "Clothes",
  "Shoes",
  "Books",
  "Furniture",
  "Kitchen",
  "Sports",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CONDITIONS = ["New", "Like New", "Good", "Fair", "Used"] as const;

export type Condition = (typeof CONDITIONS)[number];

export const MEETING_POINTS = [
  "KIU Main Gate",
  "KIU Hostel Area",
  "BSU Main Gate",
  "Ishaka Town Centre",
  "Taxi Park (Ishaka)",
  "Shell / Total area (Ishaka)",
] as const;

export const MEETING_PREFERENCES = [
  { id: "meet", label: "Meet in person" },
  { id: "shop_drop", label: "Drop at shop" },
  { id: "negotiation", label: "Call to negotiate" },
] as const;

export function formatUGX(amount: number): string {
  try {
    return new Intl.NumberFormat("en-UG", {
      style: "currency",
      currency: "UGX",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `UGX ${amount.toLocaleString("en-UG")}`;
  }
}

export function whatsappUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  let n = digits;
  if (n.startsWith("0")) n = `256${n.slice(1)}`;
  if (!n.startsWith("256")) n = `256${n}`;
  const text = encodeURIComponent(message);
  return `https://wa.me/${n}?text=${text}`;
}

export function telUrl(phone: string): string {
  let d = phone.replace(/\D/g, "");
  if (d.startsWith("0")) d = `256${d.slice(1)}`;
  else if (!d.startsWith("256")) d = `256${d}`;
  return `tel:+${d}`;
}
