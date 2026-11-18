// server/push/payload.ts
//
// What a "new event" notification says. The shape matches PushPayload in
// client/src/sw.ts, which turns it into the visible notification.

export interface PushPayload {
  title: string;
  body?: string;
  /** Page the notification opens on tap. */
  url?: string;
  /** Same tag replaces an older notification instead of stacking. */
  tag?: string;
}

// The server runs in UTC (Render) — show German local time.
const dateFormat = new Intl.DateTimeFormat("de-DE", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Berlin",
});
const timeFormat = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Berlin",
});

/** "Neues Event: Oktoberfest" / "Do., 22.10. · 20:00 Uhr · BaRACke" */
export function buildNewEventPayload(event: {
  id: string;
  title: string;
  place: string;
  startsAt: Date;
}): PushPayload {
  return {
    title: `Neues Event: ${event.title}`,
    body: `${dateFormat.format(event.startsAt)} · ${timeFormat.format(event.startsAt)} Uhr · ${event.place}`,
    url: `/eventkalender?event=${encodeURIComponent(event.id)}`,
    tag: `event-${event.id}`,
  };
}
