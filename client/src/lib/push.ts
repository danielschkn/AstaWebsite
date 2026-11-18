// client/src/lib/push.ts
//
// Push notifications ("Neues Event: …") from the browser's side:
//
//   1. The server has a key pair (VAPID). Its public key tells the
//      browser "only this server may send me pushes".
//   2. subscribePush() asks for permission, lets the browser create a
//      subscription (a private delivery address at Google/Apple/Mozilla's
//      push service) and sends it to our server, which stores it.
//   3. When an editor creates an event, the server sends a message to
//      every stored address; the service worker (src/sw.ts) shows it.
//
// No account needed: a subscription is anonymous — it contains no name or
// e-mail, only the delivery address.

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "./api";
import { isIos, isStandalone } from "./pwa";

/**
 * What the notification button should show:
 *   unsupported   — this browser can't do push → hide the button
 *   needs-install — iPhone in Safari: push only works in the installed app
 *   unavailable   — server has no push keys / app not ready → hide
 *   denied        — the user blocked notifications in the browser
 *   off / on      — normal toggle states
 */
export type PushState =
  | "loading"
  | "unsupported"
  | "needs-install"
  | "unavailable"
  | "denied"
  | "off"
  | "on";

export function pushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Server's public VAPID key, or null if push isn't set up on the server. */
async function fetchPublicKey(): Promise<string | null> {
  try {
    const res = await apiFetch("/api/push/public-key");
    if (!res.ok) return null;
    const body = (await res.json()) as { publicKey?: string };
    return body.publicKey ?? null;
  } catch {
    return null;
  }
}

/**
 * The browser API wants the key as raw bytes; the server sends it in
 * "URL-safe base64" text. This converts one into the other.
 */
export function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normal = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normal);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

/**
 * The service worker registration, waiting up to 4 s for it to start. In
 * the dev server there is none (no service worker in dev) → null.
 */
async function getRegistration(): Promise<ServiceWorkerRegistration | null> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000));
  return Promise.race([navigator.serviceWorker.ready, timeout]);
}

export async function detectPushState(): Promise<PushState> {
  if (!pushSupported()) {
    // iPhones support push only for apps added to the home screen.
    return isIos() && !isStandalone() ? "needs-install" : "unsupported";
  }
  const [registration, key] = await Promise.all([getRegistration(), fetchPublicKey()]);
  if (!registration || !key) return "unavailable";
  if (Notification.permission === "denied") return "denied";
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? "on" : "off";
}

/** Ask for permission, subscribe, and register the subscription with our server. */
export async function subscribePush(): Promise<PushState> {
  const permission = await Notification.requestPermission();
  if (permission === "denied") return "denied";
  if (permission !== "granted") return "off"; // dialog dismissed

  const [registration, key] = await Promise.all([getRegistration(), fetchPublicKey()]);
  if (!registration || !key) {
    throw new Error("Benachrichtigungen sind gerade nicht verfügbar.");
  }

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      // Required by browsers: every push must show a visible notification.
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key),
    }));

  const res = await apiFetch("/api/push/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!res.ok) {
    // Don't leave a subscription the server doesn't know about.
    await subscription.unsubscribe();
    throw new Error("Anmeldung für Benachrichtigungen fehlgeschlagen.");
  }
  return "on";
}

/** Stop notifications: tell the server, then drop the browser subscription. */
export async function unsubscribePush(): Promise<PushState> {
  const registration = await getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  if (subscription) {
    // Best effort — even if the server call fails, the browser side is
    // removed and the server drops the dead address on its next send.
    await apiFetch("/api/push/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    }).catch(() => undefined);
    await subscription.unsubscribe();
  }
  return "off";
}

/** React state + actions for a notification toggle (see PushToggle). */
export function usePushNotifications() {
  const [state, setState] = useState<PushState>("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    detectPushState()
      .then((s) => {
        if (active) setState(s);
      })
      .catch(() => {
        if (active) setState("unavailable");
      });
    return () => {
      active = false;
    };
  }, []);

  const run = useCallback(async (action: () => Promise<PushState>) => {
    setBusy(true);
    setError(null);
    try {
      setState(await action());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Etwas ist schiefgelaufen.");
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    state,
    busy,
    error,
    enable: () => run(subscribePush),
    disable: () => run(unsubscribePush),
  };
}
