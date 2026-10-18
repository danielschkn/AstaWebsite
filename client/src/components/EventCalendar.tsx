// client/src/components/EventCalendar.tsx
//
// A common month calendar: Monday-first weekday headers, a day number on
// each cell, weekend columns shaded, and event posters (2:3, filling the
// cell) on their day. Clicking a poster calls onSelect. Navigation is
// limited to one month back / forward from the current month.
//
// Phones (< md): the 7 columns are only ~47px wide, too small for posters.
// There the cells show red dots instead, and the month's events are listed
// under the grid. Tapping a day narrows that list to the day.

import { useRef, useState } from "react";
import type { EventDTO } from "../../../shared/types";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Local-time day key, e.g. "2026-5-30" (year-monthIndex-day). */
function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "11. September" — day + month name, for labels. */
function formatDayMonth(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "long" });
}

/** "Fr., 11.09. · 18:30 Uhr" — compact date for the phone list. */
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

interface EventCalendarProps {
  events: EventDTO[];
  onSelect: (event: EventDTO) => void;
}

export default function EventCalendar({ events, onSelect }: EventCalendarProps) {
  const today = new Date();
  // Allowed range: one month back .. one month forward from the current month.
  const [offset, setOffset] = useState(0);
  // Phone list filter: the tapped day, or null = the whole month.
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const listRef = useRef<HTMLElement>(null);

  const view = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = view.getFullYear();
  const month = view.getMonth();

  // Monday-first index of the 1st (0 = Monday … 6 = Sunday).
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  // Group events by day for quick lookup.
  const eventsByDay = new Map<string, EventDTO[]>();
  for (const e of events) {
    const key = dayKey(new Date(e.startsAt));
    const arr = eventsByDay.get(key);
    if (arr) arr.push(e);
    else eventsByDay.set(key, [e]);
  }

  const cells = Array.from({ length: totalCells }, (_, i) => {
    const date = new Date(year, month, i - firstWeekday + 1);
    return { date, inMonth: date.getMonth() === month };
  });

  const monthLabel = view.toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });

  // Events for the phone list: the selected day, or the whole month.
  const listEvents = events
    .filter((e) => {
      const d = new Date(e.startsAt);
      return selectedDay
        ? dayKey(d) === dayKey(selectedDay)
        : d.getFullYear() === year && d.getMonth() === month;
    })
    .sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    );
  const listTitle = selectedDay
    ? `Events am ${formatDayMonth(selectedDay)}`
    : `Events im ${view.toLocaleDateString("de-DE", { month: "long" })}`;

  function changeMonth(next: number) {
    setOffset(Math.max(-1, Math.min(1, next)));
    setSelectedDay(null);
  }

  function selectDay(date: Date) {
    // Tapping the selected day again goes back to the whole month.
    setSelectedDay((cur) =>
      cur && dayKey(cur) === dayKey(date) ? null : date,
    );
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  const navBtn =
    "px-3 py-1 rounded border border-gray-300 text-sm font-medium hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer";

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className={navBtn}
          disabled={offset <= -1}
          onClick={() => changeMonth(offset - 1)}
          aria-label="Vorheriger Monat"
        >
          ←
        </button>
        <h2 className="text-xl font-bold capitalize">{monthLabel}</h2>
        <button
          type="button"
          className={navBtn}
          disabled={offset >= 1}
          onClick={() => changeMonth(offset + 1)}
          aria-label="Nächster Monat"
        >
          →
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-600">
        {WEEKDAYS.map((w, i) => (
          <div key={w} className={i >= 5 ? "text-asta-red" : undefined}>
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 border-l border-t border-gray-200 mt-1">
        {cells.map(({ date, inMonth }, i) => {
          const weekend = i % 7 >= 5;
          const dayEvents = inMonth ? eventsByDay.get(dayKey(date)) ?? [] : [];
          const isToday = dayKey(date) === dayKey(today);
          const isSelected =
            selectedDay !== null && dayKey(date) === dayKey(selectedDay);
          return (
            <div
              key={i}
              className={`relative min-h-12 md:min-h-32 border-r border-b border-gray-200 p-1 ${
                weekend ? "bg-orange-50" : ""
              } ${!inMonth ? "bg-gray-50" : ""} ${
                isSelected ? "ring-2 ring-inset ring-asta-red" : ""
              }`}
            >
              <div
                className={`text-xs font-medium ${
                  !inMonth ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <span
                  className={
                    isToday
                      ? "inline-flex items-center justify-center h-5 w-5 rounded-full bg-asta-red text-white"
                      : undefined
                  }
                >
                  {date.getDate()}
                </span>
              </div>

              {/* Phone: red dots; the whole cell is the tap target. */}
              {dayEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => selectDay(date)}
                  aria-label={`${dayEvents.length} ${
                    dayEvents.length === 1 ? "Event" : "Events"
                  } am ${formatDayMonth(date)}`}
                  aria-pressed={isSelected}
                  className="md:hidden absolute inset-0 flex items-end justify-center gap-0.5 pb-1.5 cursor-pointer"
                >
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="h-1.5 w-1.5 rounded-full bg-asta-red"
                      aria-hidden="true"
                    />
                  ))}
                </button>
              )}

              {/* Desktop: posters. */}
              <div className="hidden md:block mt-1 space-y-1">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelect(e)}
                    title={e.title}
                    className="block w-full cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    {e.imageUrl ? (
                      <img
                        src={e.imageUrl}
                        alt={e.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full aspect-[4/5] object-cover rounded"
                      />
                    ) : (
                      <div className="w-full aspect-[4/5] rounded bg-asta-red text-white text-[10px] leading-tight font-semibold p-1 flex items-center justify-center text-center">
                        {e.title}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phone: the month's (or the tapped day's) events as a list. */}
      <section ref={listRef} className="md:hidden mt-6 scroll-mt-20">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h3 className="text-lg font-bold">{listTitle}</h3>
          {selectedDay && (
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="shrink-0 text-sm font-medium text-asta-red cursor-pointer"
            >
              Ganzer Monat
            </button>
          )}
        </div>
        {listEvents.length === 0 ? (
          <p className="text-gray-500">Keine Events in diesem Monat.</p>
        ) : (
          <ul className="space-y-3">
            {listEvents.map((e) => (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onSelect(e)}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white p-2 text-left cursor-pointer hover:shadow-sm"
                >
                  {/* Light-red placeholder box; the poster sits on top. A
                      poster that fails to load is hidden so the placeholder
                      shows instead of a broken-image icon. alt="" — the
                      title is right next to it as text. */}
                  <span className="h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-asta-red/10">
                    {e.imageUrl && (
                      <img
                        src={e.imageUrl}
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
                      {formatListDate(e.startsAt)}
                    </span>
                    <span className="block font-semibold truncate">
                      {e.title}
                    </span>
                    <span className="block text-sm text-gray-600 truncate">
                      {e.place}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
