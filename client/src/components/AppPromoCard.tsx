// client/src/components/AppPromoCard.tsx
//
// Home-page card (phones only) that points people to the app:
//   - In the browser: "AStA als App" → one-tap install on Android
//     (browser dialog), or a link to the step-by-step guide (/app) on
//     iPhone and other browsers.
//   - In the installed app: offers event notifications instead, while
//     they're still off.
// Hidden for 30 days after "×", so it never nags. Sits below the events,
// which stay the page's focus.

import { useState } from "react";
import { Link } from "react-router-dom";
import { Download, X } from "lucide-react";
import { useInstallPrompt } from "@/lib/pwa";
import { usePushNotifications } from "@/lib/push";
import { PushToggleView } from "@/components/PushToggle";

const DISMISS_KEY = "asta-app-promo-dismissed";
const DISMISS_FOR_MS = 30 * 24 * 60 * 60 * 1000;

function wasDismissedRecently(): boolean {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return at > 0 && Date.now() - at < DISMISS_FOR_MS;
  } catch {
    return false; // storage blocked (private mode) → just show the card
  }
}

export default function AppPromoCard() {
  const { canPrompt, standalone, promptInstall } = useInstallPrompt();
  const push = usePushNotifications();
  const [dismissed, setDismissed] = useState(wasDismissedRecently);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // storage blocked — the card stays hidden for this visit only
    }
  }

  if (dismissed) return null;
  // Installed app: only worth a card while notifications are still off.
  if (standalone && push.state !== "off") return null;

  return (
    <section className="md:hidden max-w-7xl mx-auto px-6 pb-10">
      <div className="relative rounded-2xl border border-asta-red/20 bg-asta-red/5 p-4">
        <button
          type="button"
          onClick={dismiss}
          aria-label="Hinweis ausblenden"
          className="absolute right-2 top-2 rounded p-1.5 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3 pr-6">
          <img
            src="/pwa-192x192.png"
            alt=""
            aria-hidden="true"
            className="h-12 w-12 shrink-0 rounded-xl shadow-sm"
          />
          <div>
            <h2 className="font-bold">
              {standalone ? "Kein Event mehr verpassen" : "AStA Remagen als App"}
            </h2>
            <p className="text-sm text-gray-600">
              {standalone
                ? "Wir melden uns, sobald ein neues Event eingetragen ist."
                : "Kostenlos, ohne App Store – startet vom Home-Bildschirm und funktioniert offline."}
            </p>
          </div>
        </div>

        <div className="mt-3">
          {standalone ? (
            <PushToggleView push={push} full />
          ) : canPrompt ? (
            <button
              type="button"
              onClick={() => void promptInstall()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-asta-red px-4 py-3 font-medium text-white hover:bg-asta-red-dark cursor-pointer"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              App installieren
            </button>
          ) : (
            <Link
              to="/app"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-asta-red bg-white px-4 py-3 font-medium text-asta-red hover:bg-asta-red/5"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              So installierst du die App
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
