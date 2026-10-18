// client/src/components/gremien/ReferatCard.tsx
//
// One REFERAT, styled per the design concept: a rounded card with the role +
// description on the left, and a portrait "person card" (photo, role, name,
// contact) on the right. Content-only — the page lays these out in a grid.
//
//   subtitle → role / Referat name ("Vorsitz")
//   body     → description
//   caption  → holder's name
//   email    → contact
//
// On phones a long description is cut to ~5 lines with a "Mehr lesen" button
// — otherwise the AStA page is ~12 phone screens tall. Desktop shows it all.

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Mail, Users } from "lucide-react";
import type { PageSectionDTO } from "../../../../shared/types";
import ImageLightbox from "@/components/ImageLightbox";
import RichText from "@/components/RichText";
import ObfuscatedMailLink from "@/components/ObfuscatedMailLink";

interface ReferatCardProps {
  section: PageSectionDTO;
}

export default function ReferatCard({ section }: ReferatCardProps) {
  const [zoom, setZoom] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  // Whether the collapsed text is actually cut off. Short texts (and every
  // text on desktop, where nothing is collapsed) don't get a button.
  const [overflows, setOverflows] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const articleRef = useRef<HTMLElement>(null);
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
    // Collapsing a long text would leave the reader far below this card, so
    // jump back to its top if that is off-screen.
    if (expanded && (articleRef.current?.getBoundingClientRect().top ?? 0) < 0) {
      articleRef.current?.scrollIntoView({ block: "start" });
    }
    setExpanded((e) => !e);
  }

  return (
    <article
      ref={articleRef}
      className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white shadow-sm p-6 md:p-8 grid md:grid-cols-[1fr_260px] gap-6 md:gap-8 items-start"
    >
      {/* Left: role + description */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="grid place-items-center h-8 w-8 rounded-full bg-asta-red text-white shrink-0">
            <Users className="h-4 w-4" />
          </span>
          <h3 className="text-lg font-bold uppercase tracking-wide text-asta-red">
            {section.subtitle}
          </h3>
        </div>
        <div className="relative">
          <div
            ref={textRef}
            id={textId}
            className={
              expanded
                ? undefined
                : "max-h-32 overflow-hidden md:max-h-none md:overflow-visible"
            }
          >
            <RichText
              html={section.body ?? ""}
              className="leading-relaxed max-w-prose"
            />
          </div>
          {/* Fade the last visible line so the cut doesn't look like a bug. */}
          {overflows && !expanded && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white md:hidden"
              aria-hidden="true"
            />
          )}
        </div>
        {(overflows || expanded) && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            aria-controls={textId}
            className="md:hidden mt-3 inline-flex items-center gap-1 py-2 font-medium text-asta-red cursor-pointer"
          >
            {expanded ? "Weniger anzeigen" : "Mehr lesen"}
            <ChevronDown
              className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Right: portrait person card. Phones: a compact row (photo beside
          the name); desktop: the portrait card from the design concept. */}
      <div className="rounded-xl border border-gray-200 p-4 md:p-5 flex items-center gap-4 text-left md:block md:text-center">
        {section.imageUrl ? (
          <button
            type="button"
            onClick={() => setZoom(section.imageUrl)}
            className="block shrink-0 md:mx-auto cursor-pointer"
            aria-label="Foto vergrößern"
          >
            <img
              src={section.imageUrl}
              alt={section.caption ?? section.subtitle ?? "Referat"}
              loading="lazy"
              decoding="async"
              className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover hover:opacity-90 transition-opacity"
            />
          </button>
        ) : (
          <div
            className="w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-full bg-asta-red/10 md:mx-auto"
            aria-hidden
          />
        )}
        <div className="min-w-0">
          {/* The role repeats the card heading, so phones skip it. */}
          {section.subtitle && (
            <p className="hidden md:block text-asta-red font-semibold uppercase text-xs tracking-wide mt-3">
              {section.subtitle}
            </p>
          )}
          {section.caption && (
            <p className="text-lg font-bold leading-tight">{section.caption}</p>
          )}
          {section.email && (
            <ObfuscatedMailLink
              email={section.email}
              ariaLabel={`E-Mail an ${section.caption ?? section.subtitle ?? "Referat"}`}
              className="inline-flex items-center justify-center gap-1 mt-1 md:mt-3 py-1 text-sm text-gray-600 hover:text-asta-red"
            >
              <Mail className="h-4 w-4" />
              E-Mail
            </ObfuscatedMailLink>
          )}
        </div>
      </div>

      <ImageLightbox
        src={zoom}
        alt={section.caption ?? section.subtitle ?? "Referat"}
        onClose={() => setZoom(null)}
      />
    </article>
  );
}
