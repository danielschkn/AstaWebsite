// client/src/pages/Home.tsx

import Hero from "../components/Hero";
import EventsSection from "../components/EventsSection";
import AppPromoCard from "../components/AppPromoCard";

export default function Home() {
  return (
    <>
      <Hero />
      <EventsSection />
      {/* Phones only: install the app / turn on notifications. */}
      <AppPromoCard />
    </>
  );
}
