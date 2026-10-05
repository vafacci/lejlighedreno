import { useState } from "react";
import { copy } from "./data/copy";
import { evidenceImages } from "./data/images";
import { rooms } from "./data/rooms";
import type { LightboxSlide } from "./data/types";
import { ExpenseSection } from "./components/ExpenseSection";
import { Overview } from "./components/Overview";
import { Lightbox } from "./components/Lightbox";
import { ReceiptSection } from "./components/ReceiptSection";
import { RoomSection } from "./components/RoomSection";
import { SiteNav } from "./components/SiteNav";

export function App() {
  const [lightbox, setLightbox] = useState<{ slides: LightboxSlide[]; index: number } | null>(null);

  function openSlides(slides: LightboxSlide[], index: number) {
    setLightbox({ slides, index });
  }

  return (
    <>
      <a className="skip" href="#indhold">
        {copy.skip}
      </a>
      <header className="hero">
        <div className="wrap">
          <h1>{copy.title}</h1>
          <p className="subtitle">{copy.subtitle}</p>
        </div>
      </header>
      <SiteNav />
      <main id="indhold">
        <Overview />
        {rooms.map((room) => (
          <RoomSection key={room.id} room={room} images={evidenceImages} onOpen={openSlides} />
        ))}
        <ExpenseSection />
        <ReceiptSection onOpen={openSlides} />
      </main>
      <footer className="site-footer">
        <div className="wrap">
          <p>{copy.footer}</p>
        </div>
      </footer>
      <Lightbox
        slides={lightbox?.slides ?? null}
        index={lightbox?.index ?? 0}
        onClose={() => setLightbox(null)}
        onIndex={(index) => setLightbox((current) => (current ? { ...current, index } : current))}
      />
    </>
  );
}
