// client/src/components/PwaUpdatePrompt.tsx
//
// Registers the service worker (src/sw.ts) and shows two small notices at
// the bottom of the screen:
//   - "Neue Version verfügbar" + "Aktualisieren" when a deploy is live —
//     we don't switch versions mid-use (a half-filled form would be lost).
//   - "Jetzt auch offline nutzbar" once, after the first install.
//
// Mounted in main.tsx (not in Layout) because `virtual:pwa-register/react`
// only exists in Vite builds, not in the unit tests.

import { useEffect, useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, WifiOff, X } from "lucide-react";

/** How often an open app checks for a new version. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // Installed apps can stay open for days — check for updates hourly.
      if (registration) {
        setInterval(() => void registration.update(), UPDATE_CHECK_MS);
      }
    },
  });
  const [updating, setUpdating] = useState(false);

  // The "offline ready" notice hides itself after a few seconds.
  useEffect(() => {
    if (!offlineReady) return;
    const id = setTimeout(() => setOfflineReady(false), 5000);
    return () => clearTimeout(id);
  }, [offlineReady, setOfflineReady]);

  if (!needRefresh && !offlineReady) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto flex max-w-md items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-xl md:inset-x-auto md:right-6"
    >
      {needRefresh ? (
        <>
          <RefreshCw className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm">Neue Version verfügbar.</span>
          <button
            type="button"
            disabled={updating}
            onClick={() => {
              setUpdating(true);
              void updateServiceWorker(true);
            }}
            className="rounded-lg bg-asta-red px-3 py-1.5 text-sm font-medium hover:bg-asta-red-dark cursor-pointer disabled:opacity-60"
          >
            {updating ? "Lädt…" : "Aktualisieren"}
          </button>
          <button
            type="button"
            onClick={() => setNeedRefresh(false)}
            aria-label="Später"
            className="rounded p-1 text-white/70 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <WifiOff className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="flex-1 text-sm">
            Die Seite ist jetzt auch offline nutzbar.
          </span>
        </>
      )}
    </div>
  );
}
