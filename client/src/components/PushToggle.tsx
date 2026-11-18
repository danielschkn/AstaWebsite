// client/src/components/PushToggle.tsx
//
// "Bei neuen Events benachrichtigen" button. Handles every state from
// usePushNotifications (lib/push.ts):
//   - off / on      → toggle (red outline ↔ filled red with a check)
//   - needs-install → iPhone in Safari: hint + link to the install guide
//   - denied        → explains how to unblock in the browser settings
//   - loading, unsupported, unavailable → renders nothing, so no broken
//     button ever appears (e.g. in browsers without push).
//
// `full` = full-width (cards, /app page); default = compact pill.
// PushToggleView is the same button driven by a state you pass in — for
// components that also need the state themselves (AppPromoCard).

import { Link } from "react-router-dom";
import { Bell, BellOff, BellRing, Check, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/lib/push";

interface PushToggleProps {
  full?: boolean;
}

export default function PushToggle({ full }: PushToggleProps) {
  return <PushToggleView push={usePushNotifications()} full={full} />;
}

export function PushToggleView({
  push,
  full,
}: PushToggleProps & { push: ReturnType<typeof usePushNotifications> }) {
  const { state, busy, error, enable, disable } = push;

  if (state === "loading" || state === "unsupported" || state === "unavailable") {
    return null;
  }

  if (state === "needs-install") {
    return (
      <p className="flex items-start gap-2 text-sm text-gray-600">
        <Bell className="h-4 w-4 mt-0.5 shrink-0 text-asta-red" aria-hidden="true" />
        <span>
          Benachrichtigungen gibt es auf dem iPhone in der App.{" "}
          <Link to="/app" className="font-medium text-asta-red hover:underline">
            So installierst du sie
          </Link>
        </span>
      </p>
    );
  }

  if (state === "denied") {
    // Compact spots (top of the calendar) stay quiet — the user chose to
    // block; repeating it on every visit would nag. /app explains it.
    if (!full) return null;
    return (
      <p className="flex items-start gap-2 text-sm text-gray-600">
        <BellOff className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" aria-hidden="true" />
        <span>
          Benachrichtigungen sind blockiert. Du kannst sie in den
          Einstellungen deines Browsers für asta-rac.com wieder erlauben.
        </span>
      </p>
    );
  }

  const on = state === "on";
  const size = full ? "w-full justify-center px-4 py-3" : "px-4 py-2 text-sm";
  const look = on
    ? "border-asta-red bg-asta-red text-white hover:bg-asta-red-dark"
    : "border-asta-red bg-white text-asta-red hover:bg-asta-red/5";

  return (
    <div className={full ? "w-full" : undefined}>
      <button
        type="button"
        onClick={on ? disable : enable}
        disabled={busy}
        aria-pressed={on}
        className={`inline-flex items-center gap-2 rounded-xl border font-medium transition cursor-pointer disabled:opacity-60 disabled:cursor-wait ${size} ${look}`}
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : on ? (
          <BellRing className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Bell className="h-4 w-4" aria-hidden="true" />
        )}
        {on ? "Benachrichtigungen an" : "Bei neuen Events benachrichtigen"}
        {on && !busy && <Check className="h-4 w-4" aria-hidden="true" />}
      </button>
      {on && (
        <p className="mt-1.5 text-xs text-gray-500">Tippen zum Ausschalten.</p>
      )}
      {error && (
        <p className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
