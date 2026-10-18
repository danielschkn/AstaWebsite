// client/src/components/Band.tsx
//
// A full-width page section ("band") with an inner max-width container.
// Alternating `alt` backgrounds (white / light grey) give the long pages a
// rhythm instead of one flat column. Carries the scroll anchor id so the
// mega-menu hash links land on the right block.

import type { ReactNode } from "react";

interface BandProps {
  id?: string;
  /** Light-grey background instead of white (for alternating bands). */
  alt?: boolean;
  /** Brand-red background with white text — a strong break between bands. */
  red?: boolean;
  children: ReactNode;
}

export default function Band({ id, alt, red, children }: BandProps) {
  const bg = red ? "bg-asta-red text-white" : alt ? "bg-gray-50" : "bg-white";
  return (
    <section id={id} className={`scroll-mt-20 py-12 md:py-16 ${bg}`}>
      <div className="max-w-7xl mx-auto px-6">{children}</div>
    </section>
  );
}
