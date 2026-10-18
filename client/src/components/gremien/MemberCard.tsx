// client/src/components/gremien/MemberCard.tsx
//
// Renders one MEMBER section: an individual person's portrait card.
//   subtitle → role / function ("Präsident")
//   caption  → person's name ("Patrick Maas")
//
// Compact vertical card (same photo size as ReferatCard): circular photo
// on top, name + role centered underneath. The photo opens full-screen on
// click. Meant to sit in a centered flex-wrap row.

import { useState } from "react";
import type { PageSectionDTO } from "../../../../shared/types";
import ImageLightbox from "@/components/ImageLightbox";

interface MemberCardProps {
  section: PageSectionDTO;
  /**
   * Hide the subtitle line. Fachschaft members store their faculty in the
   * subtitle (for grouping), which would be redundant under a faculty heading.
   */
  hideSubtitle?: boolean;
  /** Smaller card for tighter layouts (e.g. inside an alternating band). */
  compact?: boolean;
}

export default function MemberCard({
  section,
  hideSubtitle,
  compact,
}: MemberCardProps) {
  const [zoom, setZoom] = useState<string | null>(null);

  // Fluid sizes: fill the available width but never grow past the old fixed
  // size. Fixed widths overflowed narrow screens (3 × w-44 > a phone).
  const cardWidth = compact ? "max-w-44" : "max-w-48";
  const photoWidth = compact ? "max-w-36" : "max-w-40";

  return (
    <article
      className={`flex flex-col items-center text-center w-full ${cardWidth}`}
    >
      {section.imageUrl && (
        <button
          type="button"
          onClick={() => setZoom(section.imageUrl)}
          className={`cursor-pointer w-full ${photoWidth}`}
          aria-label="Foto vergrößern"
        >
          <img
            src={section.imageUrl}
            alt={section.caption ?? section.subtitle ?? "Mitglied"}
            loading="lazy"
            decoding="async"
            className="w-full aspect-square rounded-full object-cover hover:opacity-90 transition-opacity"
          />
        </button>
      )}
      {section.caption && <p className="font-semibold mt-3">{section.caption}</p>}
      {section.subtitle && !hideSubtitle && (
        <p className="text-sm text-gray-600">{section.subtitle}</p>
      )}

      <ImageLightbox
        src={zoom}
        alt={section.caption ?? section.subtitle ?? "Mitglied"}
        onClose={() => setZoom(null)}
      />
    </article>
  );
}
