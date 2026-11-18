// client/src/sw.ts
//
// Service worker = a small script the browser runs in the background, even
// while the site is closed. It turns the website into an app:
//
//   1. Offline start — the app's code is stored on the phone at install
//      ("precache"), so asta-rac.com opens without internet.
//   2. Offline data — public data (events, pages, protocols, Ersti-Info) and
//      photos are stored as they're viewed, and shown when offline.
//   3. Push notifications — shows "Neues Event" messages from our server,
//      even when the app is closed; a tap opens the event.
//   4. Updates — a new version waits until the user taps "Aktualisieren"
//      (components/PwaUpdatePrompt.tsx).
//
// Built by vite-plugin-pwa (strategy "injectManifest", see vite.config.ts):
// `self.__WB_MANIFEST` is replaced at build time with the list of build
// files to precache. Type-checked via tsconfig.sw.json (worker types).

import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

declare const self: ServiceWorkerGlobalScope;

const DAY = 24 * 60 * 60;

// ─── 1. App shell: opens offline ───────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Every page address (/eventkalender, /gremien/asta, …) is the same React
// app, so page loads are answered with the stored index.html. API calls and
// SAML keep going to the network.
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//, /^\/saml\//],
  }),
);

// ─── 2. Public data: fresh when online, stored copy when offline ───────
// Only public, read-only endpoints. Never login, account (/api/me…) or
// admin data — those must always come live from the server.
const PUBLIC_API = /^\/api\/(events|protocols|pages\/[^/]+|ersti)$/;

registerRoute(
  ({ url, request, sameOrigin }) =>
    sameOrigin && request.method === "GET" && PUBLIC_API.test(url.pathname),
  new NetworkFirst({
    cacheName: "api-public",
    // Slow mobile network: after 5 s show the stored copy instead.
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 14 * DAY }),
    ],
  }),
);

// ─── 3. Photos: stored as they're viewed ───────────────────────────────
// Our own images (hero photos, logos) may be replaced under the same name,
// so show the stored copy at once but refresh it in the background.
registerRoute(
  ({ request, sameOrigin }) => sameOrigin && request.destination === "image",
  new StaleWhileRevalidate({
    cacheName: "images-site",
    plugins: [new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 30 * DAY })],
  }),
);

// Uploaded posters/photos live in our storage bucket (another domain) and
// get a new address whenever they're replaced — safe to reuse as stored.
registerRoute(
  ({ request, sameOrigin }) => !sameOrigin && request.destination === "image",
  new CacheFirst({
    cacheName: "images-uploads",
    plugins: [
      // Status 0 = image from another domain whose status the browser hides.
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * DAY,
        purgeOnQuotaError: true,
      }),
    ],
  }),
);

// ─── 4. Push notifications ─────────────────────────────────────────────
// Shape sent by the server (server/push/payload.ts).
interface PushPayload {
  title: string;
  body?: string;
  /** Page to open on tap, e.g. "/eventkalender?event=<id>". */
  url?: string;
  /** Same tag = replaces an older notification instead of stacking. */
  tag?: string;
}

self.addEventListener("push", (event) => {
  let data: PushPayload = { title: "AStA Remagen" };
  if (event.data) {
    try {
      data = { ...data, ...(event.data.json() as Partial<PushPayload>) };
    } catch {
      data.body = event.data.text();
    }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/pwa-192x192.png",
      // Small single-colour symbol for Android's status bar.
      badge: "/pwa-badge-96.png",
      tag: data.tag,
      lang: "de",
      data: { url: data.url ?? "/" },
    }),
  );
});

// Tap on a notification → bring the open app to the front and show the
// event there, or open the app if it's closed.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(
    (event.notification.data as { url?: string } | null)?.url ?? "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });
      const open = windows.find(
        (w) => new URL(w.url).origin === self.location.origin,
      );
      if (open) {
        try {
          await open.focus();
          await open.navigate(target);
          return;
        } catch {
          // Window not controlled by us yet — fall through to a new one.
        }
      }
      await self.clients.openWindow(target);
    })(),
  );
});

// ─── 5. Updates ────────────────────────────────────────────────────────
// "Aktualisieren" in PwaUpdatePrompt sends SKIP_WAITING → the new version
// takes over and the page reloads.
self.addEventListener("message", (event) => {
  if ((event.data as { type?: string } | null)?.type === "SKIP_WAITING") {
    void self.skipWaiting();
  }
});

// Take control of open pages right after the first install, so offline
// storage starts working without a reload.
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
