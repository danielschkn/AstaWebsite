// client/src/components/PushToggle.test.tsx
//
// The notification button for each state (driven directly, since jsdom has
// no push support).

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PushToggleView } from "./PushToggle";
import type { PushState } from "@/lib/push";

function renderWith(state: PushState, full = false) {
  const push = { state, busy: false, error: null, enable: vi.fn(), disable: vi.fn() };
  render(
    <MemoryRouter>
      <PushToggleView push={push} full={full} />
    </MemoryRouter>,
  );
  return push;
}

describe("PushToggleView", () => {
  it("turns notifications on when off", async () => {
    const push = renderWith("off");
    const button = screen.getByRole("button", { name: "Bei neuen Events benachrichtigen" });
    expect(button).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(button);
    expect(push.enable).toHaveBeenCalled();
  });

  it("shows the active state and turns them off on tap", async () => {
    const push = renderWith("on");
    await userEvent.click(screen.getByRole("button", { name: /Benachrichtigungen an/ }));
    expect(push.disable).toHaveBeenCalled();
  });

  it("points iPhone users without the app to the install guide", () => {
    renderWith("needs-install");
    expect(screen.getByRole("link", { name: "So installierst du sie" })).toHaveAttribute(
      "href",
      "/app",
    );
  });

  it("explains a block only in the full variant", () => {
    const { unmount } = render(
      <MemoryRouter>
        <PushToggleView
          push={{ state: "denied", busy: false, error: null, enable: vi.fn(), disable: vi.fn() }}
        />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/blockiert/)).not.toBeInTheDocument();
    unmount();

    renderWith("denied", true);
    expect(screen.getByText(/blockiert/)).toBeInTheDocument();
  });

  it("renders nothing where push isn't available", () => {
    const { container } = render(
      <MemoryRouter>
        <PushToggleView
          push={{ state: "unsupported", busy: false, error: null, enable: vi.fn(), disable: vi.fn() }}
        />
      </MemoryRouter>,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
