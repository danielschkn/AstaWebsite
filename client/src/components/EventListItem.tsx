// client/src/components/EventListItem.tsx
//
// Compact event row for phones: a small poster on the left, date · time,
// title and place on the right. Used by the calendar's phone list and the
// home page's "Bevorstehende Events" on phones — far shorter than a full
// EventCard. Pass `now` to also show the live countdown badge.

import type { EventDTO } from "../../../shared/types";
import { formatCountdown } from "@/lib/events";

/** "Fr., 11.09. · 18:30 Uhr" — compact date for the row. */
function formatListDate(iso: string): string {
  const d = new Date(iso);
  const day = d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
  });
  const time = d.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${day} · ${time} Uhr`;
}

interface EventListItemProps {
  event: EventDTO;
  onClick: (event: EventDTO) => void;
  /** Current time in ms. When given, a countdown badge is shown. */
  now?: number;
}

export default function EventListItem({
  event,
  onClick,
  now,
}: EventListItemProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(event)}
      className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 text-left cursor-pointer hover:shadow-sm"
    >
      {/* Light-red placeholder box; the poster sits on top. A poster that
          fails to load is hidden so the placeholder shows instead of a
          broken-image icon. alt="" — the title is right next to it. */}
      <span className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-asta-red/10">
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={(ev) => (ev.currentTarget.style.visibility = "hidden")}
            className="h-full w-full object-cover"
          />
        )}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-asta-red">
          {formatListDate(event.startsAt)}
        </span>
        <span className="block font-semibold truncate">{event.title}</span>
        <span className="block text-sm text-gray-600 truncate">
          {event.place}
        </span>
        {now !== undefined && new Date(event.startsAt).getTime() > now && (
          <span className="mt-1 inline-block rounded-full bg-asta-red/10 px-2 py-0.5 text-xs font-semibold text-asta-red">
            {formatCountdown(new Date(event.startsAt).getTime() - now)}
          </span>
        )}
      </span>
    </button>
  );
}
