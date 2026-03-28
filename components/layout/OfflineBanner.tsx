"use client";

import { useSyncExternalStore } from "react";

function subscribe(cb: () => void) {
  window.addEventListener("online", cb);
  window.addEventListener("offline", cb);
  return () => {
    window.removeEventListener("online", cb);
    window.removeEventListener("offline", cb);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" && navigator.onLine;
}

/** SSR / hydration: assume online to avoid layout flash */
function getServerSnapshot() {
  return true;
}

export function OfflineBanner() {
  const online = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (online) return null;

  return (
    <div
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-semibold text-amber-950 sm:text-sm"
      role="status"
      aria-live="polite"
    >
      You&apos;re offline — cart &amp; saved items work on this device. Listings you
      opened before may still show; reconnect to refresh prices and photos.
    </div>
  );
}
