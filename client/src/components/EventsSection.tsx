// client/src/components/EventsSection.tsx
//
// Home-page block: the next 3 upcoming events (live, with countdown) — the
// focus of the page — and the 3 most recent Sitzungsprotokolle as a slim
// list in the sidebar (below the events on phones).
// Both used to be hardcoded — now they come from the API.

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Download, FileText } from "lucide-react";
import type { EventDTO, ProtocolDTO } from "../../../shared/types";
import { fetchEvents, fetchProtocols } from "@/lib/api";
import { selectUpcoming } from "@/lib/events";
import { useFavorites } from "@/auth/FavoritesContext";
import EventCard from "@/components/EventCard";
import EventDialog from "@/components/EventDialog";
import EventListItem from "@/components/EventListItem";
import GremiumBadge from "@/components/GremiumBadge";

/** "15. April 2026" — date-only, German, for the protocols sidebar. */
function formatMeetingDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function EventsSection() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [protocols, setProtocols] = useState<ProtocolDTO[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [selected, setSelected] = useState<EventDTO | null>(null);
  const favorites = useFavorites();

  useEffect(() => {
    // Both lists are best-effort — failures shouldn't blank the homepage.
    fetchEvents()
      .then(setEvents)
      .catch(() => setEvents([]));
    fetchProtocols()
      .then(setProtocols)
      .catch(() => setProtocols([]));
  }, []);

  // Tick once a minute so the countdown stays current.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const upcoming = selectUpcoming(events, { limit: 3, now });
  // fetchProtocols returns newest first; take the latest 3.
  const recentProtocols = protocols.slice(0, 3);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-12">
        {/* One outer 4-col grid holds heading, events AND the protocols
            sidebar (lg+). Events are the page's focus: 3 of 4 columns, a
            red icon heading, and a big calendar button on phones. The
            protocols are a slim, plain list next to / below them. */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-0">
          {/* Heading row — spans 3 cols so right edge aligns with card 3 */}
          <div className="lg:col-span-3 flex items-end justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-asta-red text-white"
                aria-hidden="true"
              >
                <CalendarDays className="h-5 w-5" />
              </span>
              <h2 className="text-2xl md:text-3xl font-bold">Bevorstehende Events</h2>
            </div>
            <Link
              to="/eventkalender"
              className="hidden sm:inline text-asta-red hover:text-asta-red-dark font-medium"
            >
              Alle Events anzeigen →
            </Link>
          </div>

          {/* Phones: compact rows (same as the calendar's phone list) plus a
              full-width button to the calendar. */}
          <div className="md:hidden">
            {upcoming.length === 0 ? (
              <p className="text-gray-500">Zur Zeit sind keine Events geplant.</p>
            ) : (
              <ul className="space-y-3">
                {upcoming.map((event) => (
                  <li key={event.id}>
                    <EventListItem event={event} onClick={setSelected} now={now} />
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/eventkalender"
              className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-asta-red px-4 py-3 font-medium text-asta-red hover:bg-asta-red/5"
            >
              <CalendarDays className="h-5 w-5" aria-hidden="true" />
              Zum Eventkalender
            </Link>
          </div>

          {/* md+: 3-up cards. Free slots (fewer than 3 upcoming events) are
              filled by one tile pointing to the calendar instead of blank space. */}
          <div className="hidden md:grid lg:col-span-3 grid-cols-3 gap-6">
            {upcoming.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                now={now}
                onClick={setSelected}
                isFavorite={favorites.isFavorite(event.id)}
                onToggleFavorite={
                  favorites.enabled
                    ? () => favorites.toggle(event.id)
                    : undefined
                }
              />
            ))}
            {upcoming.length < 3 && (
              <Link
                to="/eventkalender"
                className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-asta-red/30 p-6 text-center text-asta-red transition hover:border-asta-red hover:bg-asta-red/5"
                style={{ gridColumn: `span ${3 - upcoming.length}` }}
              >
                <CalendarDays className="h-10 w-10" aria-hidden="true" />
                <span className="font-semibold">
                  {upcoming.length === 0
                    ? "Zur Zeit sind keine Events geplant."
                    : "Mehr Events im Eventkalender"}
                </span>
                <span className="text-sm text-gray-600">
                  Auch vergangene Events und Filter nach Referat & Ort →
                </span>
              </Link>
            )}
          </div>

          {/* Protocols: a slim plain list — available, but not competing
              with the events. One compact row per protocol. */}
          {/* Thin red line separates them from the events: horizontal on
              phones (stacked), vertical on desktop (side by side). */}
          <aside className="mt-8 pt-8 border-t border-asta-red/60 lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-8 lg:col-span-1 self-start">
            <h3 className="flex items-center gap-2 font-bold">
              <FileText className="h-4 w-4 text-asta-red" aria-hidden="true" />
              Neueste Sitzungsprotokolle
            </h3>
            {recentProtocols.length === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Keine Protokolle vorhanden.</p>
            ) : (
              <ul className="mt-2 divide-y divide-gray-100">
                {recentProtocols.map((p) => (
                  <li key={p.id}>
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 py-2.5"
                    >
                      <GremiumBadge gremium={p.gremium} />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium truncate group-hover:text-asta-red">
                          {p.title}
                        </span>
                        <span className="block text-xs text-gray-500">
                          {formatMeetingDate(p.meetingDate)}
                        </span>
                      </span>
                      <Download
                        className="h-4 w-4 shrink-0 text-gray-400 group-hover:text-asta-red"
                        aria-label="PDF herunterladen"
                      />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </div>

      <EventDialog event={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
