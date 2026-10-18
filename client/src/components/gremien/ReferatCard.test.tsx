// client/src/components/gremien/ReferatCard.test.tsx
//
// The phone "Mehr lesen" toggle: only shown when the collapsed text is
// actually cut off, and it flips between collapsed and expanded.

import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PageSectionDTO } from "../../../../shared/types";
import ReferatCard from "./ReferatCard";

const section = {
  id: "ref",
  kind: "REFERAT",
  subtitle: "Vorsitz",
  body: "<p>Ein langer Text über den Vorsitz.</p>",
  caption: "Max Muster",
  imageUrl: null,
  email: null,
} as unknown as PageSectionDTO;

/**
 * jsdom has no layout engine: no ResizeObserver and every element is 0px
 * tall. Fake both so the text "overflows" (500px of content in a 128px box).
 */
function fakeOverflowingText() {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      cb: () => void;
      constructor(cb: () => void) {
        this.cb = cb;
      }
      observe() {
        this.cb();
      }
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(500);
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(128);
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ReferatCard", () => {
  it("shows no toggle when the text fits", () => {
    render(<ReferatCard section={section} />);
    expect(screen.queryByRole("button", { name: /Mehr lesen/ })).not.toBeInTheDocument();
  });

  it("toggles a cut-off text between 'Mehr lesen' and 'Weniger anzeigen'", async () => {
    fakeOverflowingText();
    render(<ReferatCard section={section} />);

    const more = screen.getByRole("button", { name: /Mehr lesen/ });
    expect(more).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(more);
    const less = screen.getByRole("button", { name: /Weniger anzeigen/ });
    expect(less).toHaveAttribute("aria-expanded", "true");

    await userEvent.click(less);
    expect(screen.getByRole("button", { name: /Mehr lesen/ })).toBeInTheDocument();
  });
});
