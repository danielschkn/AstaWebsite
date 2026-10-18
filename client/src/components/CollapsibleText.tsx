// client/src/components/CollapsibleText.tsx
//
// Rich text that is cut to a few lines on phones with a "Mehr lesen" button
// (desktop always shows everything). Used for the long Gremien texts —
// Referate, the AStA / StuPa / Fachschaften intros and MIT / WiSo — so a
// single description no longer fills several phone screens.
//
// The button only appears when the text really is cut off, so short texts
// look exactly as before. The cut is faded with a CSS mask, which works on
// any band background (white or grey).

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import RichText from "@/components/RichText";

interface CollapsibleTextProps {
  /** Sanitized HTML from the server (see RichText). */
  html: string;
  /** Extra classes for the RichText (e.g. "leading-relaxed max-w-prose"). */
  className?: string;
  /**
   * Height while collapsed on phones, as a full Tailwind class (so Tailwind
   * can see it). Default "max-h-32" ≈ 5 lines.
   */
  collapsedHeight?: string;
}

export default function CollapsibleText({
  html,
  className,
  collapsedHeight = "max-h-32",
}: CollapsibleTextProps) {
  const [expanded, setExpanded] = useState(false);
  // Whether the collapsed text is actually cut off. Short texts (and every
  // text on desktop, where nothing is collapsed) don't get a button.
  const [overflows, setOverflows] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const textId = useId();

  // Re-measure whenever the text box changes size (screen rotation, resize,
  // expand/collapse). ResizeObserver also fires once right after observe().
  useEffect(() => {
    const el = textRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() =>
      setOverflows(el.scrollHeight > el.clientHeight + 1),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  function toggle() {
    // Collapsing a long text would leave the reader far below it, so jump
    // back to its top if that is off-screen.
    if (expanded && (wrapperRef.current?.getBoundingClientRect().top ?? 0) < 0) {
      wrapperRef.current?.scrollIntoView({ block: "start" });
    }
    setExpanded((e) => !e);
  }

  const collapsed = `${collapsedHeight} overflow-hidden md:max-h-none md:overflow-visible`;
  // Fade the last visible lines so the cut doesn't look like a bug.
  const fade =
    "[mask-image:linear-gradient(to_bottom,#000_55%,transparent)] md:[mask-image:none]";

  return (
    <div ref={wrapperRef} className="scroll-mt-28">
      <div
        ref={textRef}
        id={textId}
        className={
          expanded ? undefined : `${collapsed} ${overflows ? fade : ""}`
        }
      >
        <RichText html={html} className={className} />
      </div>
      {(overflows || expanded) && (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={expanded}
          aria-controls={textId}
          className="md:hidden mt-2 inline-flex items-center gap-1 py-2 font-medium text-asta-red cursor-pointer"
        >
          {expanded ? "Weniger anzeigen" : "Mehr lesen"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}
