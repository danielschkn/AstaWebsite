// client/src/components/EventCalendar.test.tsx
//
// The month grid: weekday headers, an event poster on its day, and the
// ±1-month navigation bounds.

import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EventDTO } from "../../../shared/types";
import EventCalendar from "./EventCalendar";

const today = new Date();

const event: EventDTO = {
  id: "cal",
  title: "Kalender Event",
  description: "desc",
  imageUrl: "/cal.jpg",
  price: null,
  place: "Campus",
  categories: [],
  registrationEmail: null,
  startsAt: new Date(today.getFullYear(), today.getMonth(), 15, 18, 0).toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("EventCalendar", () => {
  it("renders weekday headers and the event poster on its day", () => {
    render(<EventCalendar events={[event]} onSelect={vi.fn()} />);
    expect(screen.getByText("Mo")).toBeInTheDocument();
    expect(screen.getByText("So")).toBeInTheDocument();
    expect(screen.getByAltText("Kalender Event")).toBeInTheDocument();
  });

  it("calls onSelect when a poster is clicked", async () => {
    const onSelect = vi.fn();
    render(<EventCalendar events={[event]} onSelect={onSelect} />);
    await userEvent.click(screen.getByRole("button", { name: "Kalender Event" }));
    expect(onSelect).toHaveBeenCalledWith(event);
  });

  it("falls back to the title tile when a poster fails to load", () => {
    render(<EventCalendar events={[event]} onSelect={vi.fn()} />);
    fireEvent.error(screen.getByAltText("Kalender Event"));
    expect(screen.queryByAltText("Kalender Event")).not.toBeInTheDocument();
    // The title now shows as text inside the poster button.
    expect(
      screen.getByRole("button", { name: "Kalender Event" }),
    ).toHaveTextContent("Kalender Event");
  });

  it("lists the month's events (phone list) and narrows to a tapped day", async () => {
    const second: EventDTO = {
      ...event,
      id: "cal2",
      title: "Zweites Event",
      startsAt: new Date(today.getFullYear(), today.getMonth(), 20, 18, 0).toISOString(),
    };
    const monthName = today.toLocaleDateString("de-DE", { month: "long" });
    render(<EventCalendar events={[event, second]} onSelect={vi.fn()} />);

    // Whole month by default.
    expect(screen.getByRole("heading", { name: `Events im ${monthName}` })).toBeInTheDocument();
    expect(screen.getByText("Zweites Event")).toBeInTheDocument();

    // Tap the 15th → only that day's event remains.
    await userEvent.click(
      screen.getByRole("button", { name: `1 Event am 15. ${monthName}` }),
    );
    expect(screen.getByRole("heading", { name: `Events am 15. ${monthName}` })).toBeInTheDocument();
    expect(screen.queryByText("Zweites Event")).not.toBeInTheDocument();

    // "Ganzer Monat" resets the filter.
    await userEvent.click(screen.getByRole("button", { name: "Ganzer Monat" }));
    expect(screen.getByText("Zweites Event")).toBeInTheDocument();
  });

  it("limits navigation to one month back and forward", async () => {
    render(<EventCalendar events={[]} onSelect={vi.fn()} />);
    const prev = screen.getByRole("button", { name: "Vorheriger Monat" });
    const next = screen.getByRole("button", { name: "Nächster Monat" });

    // Both enabled at the current month.
    expect(prev).toBeEnabled();
    expect(next).toBeEnabled();

    // One step back → prev hits its bound and disables.
    await userEvent.click(prev);
    expect(prev).toBeDisabled();

    // Back to current, then two steps forward → next disables at +1.
    await userEvent.click(next);
    await userEvent.click(next);
    expect(next).toBeDisabled();
  });
});
