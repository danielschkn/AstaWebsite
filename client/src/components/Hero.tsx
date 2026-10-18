// client/src/components/Hero.tsx

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[url(/hero-campus.webp)] bg-no-repeat bg-right rounded-br-[6rem]">
      {/* White veil so the black/red heading stays readable on the photo.
          Phones: the text covers the whole photo, so the veil does too;
          desktop: it fades out to the right, leaving the building clear. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/60 md:from-white md:via-white/70 md:to-transparent"
      />
      <div className="relative max-w-7xl mx-auto px-6 py-14 md:py-20">
        {/* text-4xl on phones: at 48px "RheinAhrCampus" alone is ~410px wide
            and pushed the whole page wider than a 375px screen. */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
          <span className="block">AStA Remagen</span>
          <span className="block text-asta-red">Dein RheinAhrCampus</span>
        </h1>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            size="brand"
            render={<Link to="/gremien/asta" />}
            nativeButton={false}
          >
            Über den AStA
          </Button>
          <Button
            variant="brandOutline"
            size="brand"
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
