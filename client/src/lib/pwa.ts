// client/src/lib/pwa.ts
//
// Helpers around installing the website as an app (PWA = "progressive web
// app"):
//
//   - isStandalone(): are we already running as the installed app (opened
//     from the home-screen icon, no browser bar)?
//   - isIos(): iPhone/iPad. Apple has no install button — people add the
//     app via Teilen → "Zum Home-Bildschirm", so we show instructions.
//   - Install prompt: Chrome/Edge/Samsung Internet on Android fire a
//     `beforeinstallprompt` event once, early — often before React has
//     rendered. initPwa() (called in main.tsx) catches and keeps it, so an
//     "Installieren" button can open the browser's install dialog later.
//     useInstallPrompt() lets components react when it becomes available.

import { useSyncExternalStore } from "react";

/** Chromium's install-prompt event (not in the standard DOM typings). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let justInstalled = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

/** Start listening for the browser's install events. Call once at startup. */
export function initPwa(): void {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Don't show Chrome's own mini-banner; we offer our own button instead.
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    justInstalled = true;
    notify();
  });
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Running as the installed app (or just installed in this session)? */
export function isStandalone(): boolean {
  if (justInstalled) return true;
  const displayStandalone =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(display-mode: standalone)").matches;
  // iOS Safari's own flag for home-screen apps.
  const iosStandalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return displayStandalone || iosStandalone;
}

/** iPhone or iPad (iPadOS reports itself as a Mac with a touch screen). */
export function isIos(): boolean {
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

/** Opens the browser's install dialog. Resolves true if the user accepted. */
export async function promptInstall(): Promise<boolean> {
  const prompt = deferredPrompt;
  if (!prompt) return false;
  // The event can only be used once.
  deferredPrompt = null;
  notify();
  await prompt.prompt();
  const { outcome } = await prompt.userChoice;
  return outcome === "accepted";
}

/** React view of the install state; re-renders when it changes. */
export function useInstallPrompt() {
  const canPrompt = useSyncExternalStore(
    subscribe,
    () => deferredPrompt !== null,
    () => false,
  );
  const standalone = useSyncExternalStore(subscribe, isStandalone, () => false);
  return { canPrompt, standalone, ios: isIos(), promptInstall };
}
