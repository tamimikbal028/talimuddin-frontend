const CACHE_PREFIX = "talimuddin-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v4`;
const appPath = (path) => new URL(path, self.registration.scope).pathname;
const APP_SHELL = [
  appPath(""),
  appPath("manifest.webmanifest"),
  appPath("icons/talimuddin-mosque-192.png"),
  appPath("icons/talimuddin-mosque-512.png"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cachedPage = await caches.match(appPath(""));
        if (!cachedPage) {
          throw new Error("The app shell is not available offline.");
        }
        return cachedPage;
      }),
    );
    return;
  }

  if (["script", "style", "image", "font"].includes(request.destination)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const networkResponse = fetch(request)
          .then(async (response) => {
            if (response.ok) {
              await cache.put(request, response.clone());
            }
            return response;
          })
          .catch((error) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            throw error;
          });

        return cachedResponse || networkResponse;
      }),
    );
  }
});
