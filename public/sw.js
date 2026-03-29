/**
 * Offline-friendly SW: HTML/RSC network-first with cache fallback; all other
 * same-origin GET (/_next/*, etc.) stale-while-revalidate.
 * Bump CACHE_NAME after logic changes.
 */
const CACHE_NAME = "ishaka-offline-v3";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("ishaka-offline") && k !== CACHE_NAME)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function sameOrigin(url) {
  return url.origin === self.location.origin;
}

async function networkFirstDocument(request, cache) {
  try {
    const fresh = await fetch(request);
    if (fresh.ok) await cache.put(request, fresh.clone());
    return fresh;
  } catch {
    const hit = await cache.match(request);
    if (hit) return hit;
    const home = await cache.match(new Request(self.location.origin + "/"));
    if (home) return home;
    return new Response(
      "You are offline. Open this app online once, then browse — pages and listings are saved for next time.",
      {
        status: 503,
        statusText: "Offline",
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      },
    );
  }
}

async function staleWhileRevalidate(request, cache) {
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => null);
  return cached || (await network) || cached;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") {
    event.respondWith(fetch(req));
    return;
  }

  const url = new URL(req.url);
  if (!sameOrigin(url)) {
    event.respondWith(fetch(req));
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(req));
    return;
  }

  const accept = req.headers.get("accept") || "";
  const isNavigationLike =
    req.mode === "navigate" ||
    accept.includes("text/html") ||
    url.searchParams.has("_rsc");

  if (isNavigationLike) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        return networkFirstDocument(req, cache);
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      return staleWhileRevalidate(req, cache);
    })(),
  );
});
