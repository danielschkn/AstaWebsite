// client/src/pages/AppInstall.test.tsx
//
// The /app install guide: shows both platforms, puts the visitor's own
// device first, and explains notifications.

import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AppInstall from "./AppInstall";

const IPHONE_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";

function renderPage() {
  render(
    <MemoryRouter>
      <AppInstall />
    </MemoryRouter>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("AppInstall", () => {
  it("shows the install guide for both platforms and the notification section", () => {
    renderPage();
    expect(
      screen.getByRole("heading", { level: 1, name: "AStA Remagen als App" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /iPhone & iPad/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Android/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Benachrichtigungen" })).toBeInTheDocument();
  });

  it("lists the visitor's own device first and marks it", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue(IPHONE_UA);
    renderPage();
    const platformHeadings = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(platformHeadings[0]).toMatch(/iPhone & iPad.*Dein Gerät/);
    expect(platformHeadings[1]).toBe("Android");
  });
});
