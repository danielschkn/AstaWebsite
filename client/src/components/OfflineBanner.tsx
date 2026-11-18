// client/src/components/OfflineBanner.tsx
//
// Slim bar under the header while the phone has no internet, so people know
// they're looking at saved content (the service worker serves stored pages,
// events and photos — see src/sw.ts). Disappears by itself when back online.

import { useSyncExternalStore } from "react";
import { WifiOff } from "lucide-react";

function subscribe(onChange: () => void): () => void {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export default function OfflineBanner() {
  const online = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
  if (online) return null;

  return (
    <div
      role="status"
      className="sticky top-16 md:top-20 z-40 flex items-center justify-center gap-2 bg-gray-800 px-4 py-2 text-center text-sm text-white"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden="true" />
      Offline – du siehst zuletzt gespeicherte Inhalte.
    </div>
  );
}
