// client/src/components/Hero.tsx
//
// Home-page welcome banner: the RheinAhrCampus photo full-width, so visitors
// instantly recognise the campus. A light bottom shade plus the text's drop
// shadow keep the heading readable without hiding the photo. "Dein
// RheinAhrCampus" sits on a red label (brand colour with strong contrast on
// the photo). The photo is the LCP image, so it loads eagerly with high
// priority.
//
// The big rounded bottom-right corner is the home hero's signature from the
// design concept (smaller on phones so it doesn't eat the buttons' corner).

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    // Phones: a shorter banner (22rem) — object-cover trims sky and pavement
    // and keeps the building in view.
    <section className="relative overflow-hidden h-[22rem] md:h-[34rem] rounded-br-[3rem] md:rounded-br-[6rem]">
      <img
        src="/home-hero.webp"
        alt=""
        aria-hidden="true"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Light shade (much softer than the earlier dark fade): a touch more
          at the bottom where the text sits. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/15 to-transparent"
      />

      <div className="relative h-full max-w-7xl mx-auto px-6 pb-10 md:pb-16 flex flex-col justify-end text-white">
        <p className="text-sm md:text-base font-medium text-white/90 drop-shadow">
          Hochschule Koblenz · RheinAhrCampus Remagen
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl md:text-6xl font-bold leading-tight drop-shadow-lg">
          <span className="block">AStA Remagen</span>
          {/* Smaller than the title on phones so the red label stays on one
              line (at 36px it wrapped into a heavy two-line block). */}
          <span className="mt-2 inline-block bg-asta-red px-3 py-0.5 rounded-lg text-2xl sm:text-4xl md:text-5xl">
            Dein RheinAhrCampus
          </span>
        </h1>

        <div className="mt-6 md:mt-8 flex flex-wrap gap-3 md:gap-4">
          <Button
            size="brand"
            render={<Link to="/gremien/asta" />}
            nativeButton={false}
          >
            Über den AStA
          </Button>
          <Button
            variant="outline"
            size="brand"
            className="bg-white/10 text-white border-white/80 backdrop-blur-sm hover:bg-white hover:text-asta-red"
            render={<Link to="/kontakt" />}
            nativeButton={false}
          >
            Mitmachen
          </Button>
        </div>
      </div>
    </section>
  );
}
