// server/push/schemas.ts
//
// Validation for POST /api/push/subscribe and /api/push/unsubscribe.
//
// Security: our server later sends HTTP requests to the stored `endpoint`.
// If anyone could store any URL, they could make our server call arbitrary
// addresses (incl. internal ones) — so only HTTPS addresses at the real
// browser push services are accepted.

import { z } from "zod";

/** Push services of Chrome/Edge/Samsung (Google), Firefox, Safari, Windows. */
const EXACT_HOSTS = new Set([
  "fcm.googleapis.com",
  "updates.push.services.mozilla.com",
  "web.push.apple.com",
]);
const HOST_SUFFIXES = [".push.apple.com", ".notify.windows.com"];

export function isAllowedPushEndpoint(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;
  const host = url.hostname.toLowerCase();
  return EXACT_HOSTS.has(host) || HOST_SUFFIXES.some((s) => host.endsWith(s));
}

/** Length in bytes of a URL-safe base64 string ("" if it isn't one). */
function base64UrlBytes(value: string): number {
  if (!/^[A-Za-z0-9_-]+={0,2}$/.test(value)) return -1;
  return Buffer.from(value, "base64url").length;
}

const endpoint = z
  .string()
  .max(1000, "endpoint too long")
  .refine(isAllowedPushEndpoint, "endpoint must be a known browser push service");

/** Shape of `PushSubscription.toJSON()` from the browser. */
export const PushSubscribeInput = z.object({
  endpoint,
  keys: z.object({
    // Browser's public key (65 bytes) and auth secret (16 bytes) — checked
    // here so a malformed subscription can't break a whole send run.
    p256dh: z.string().refine((v) => base64UrlBytes(v) === 65, "invalid p256dh key"),
    auth: z.string().refine((v) => base64UrlBytes(v) === 16, "invalid auth secret"),
  }),
});

export const PushUnsubscribeInput = z.object({ endpoint });
