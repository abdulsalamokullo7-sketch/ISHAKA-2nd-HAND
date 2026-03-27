/** Shared form field classes — use across shop, sell, and admin. */

export const fieldLabel = "text-sm font-bold text-isha-text";

export const fieldInput =
  "mt-2 w-full rounded-2xl border border-isha-border bg-isha-page px-4 py-3 text-isha-text outline-none transition focus:border-isha-primary focus:bg-white focus:ring-2 focus:ring-isha-primary/25";

export const fieldSelect = `${fieldInput} appearance-none`;

export const fieldTextarea = `${fieldInput} min-h-[120px] resize-y align-top`;

export const cardElevated =
  "rounded-3xl border border-isha-border bg-white shadow-[0_20px_50px_-20px_rgba(0,0,0,0.12)] ring-1 ring-black/[0.03]";

const btnPrimaryBase =
  "inline-flex items-center justify-center rounded-2xl bg-isha-primary text-sm font-extrabold text-white shadow-lg shadow-green-600/20 transition hover:bg-isha-primary-dark disabled:opacity-60";

export const btnPrimary = `${btnPrimaryBase} px-5 py-3`;

/** Full-width primary CTA (forms). */
export const btnPrimaryFull = `${btnPrimaryBase} w-full px-6 py-4`;

export const btnSecondary =
  "inline-flex items-center justify-center rounded-2xl border-2 border-isha-border bg-white px-5 py-3 text-sm font-bold text-isha-text shadow-sm transition hover:bg-isha-muted disabled:opacity-60";
