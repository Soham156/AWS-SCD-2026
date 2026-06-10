import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { galleryFiles as localGalleryFiles } from 'virtual:event-gallery';
import { SectionHeader } from './LayoutElements';

const supabaseGalleryUrl = "https://ufuiebrurfmamjtzvyqy.supabase.co/storage/v1/object/public/event-gallary/";

const supabaseFiles = [
  "0.MOV", "1.jpg", "2.jpeg", "3.jpeg", "4.jpeg",
  "5.JPG", "6.JPG", "7.jpg", "8.jpg", "9.jpeg",
  "10.jpeg", "11.jpeg", "12.jpeg", "13.jpeg"
];

const galleryFiles = supabaseFiles.map(file => `${supabaseGalleryUrl}${file}`);

/* ─── helpers ─────────────────────────────────────────────────── */

const VIDEO_EXT = /\.(mp4|mov|webm|ogg)$/i;

/** Fisher-Yates shuffle – returns a new array */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ─── component ───────────────────────────────────────────────── */

export const GallerySection = () => {
  /**
   * activeIdx: tracks which tile is "tapped" on mobile.
   * On desktop, CSS hover handles the overlay via @media(hover:hover).
   * On touch screens, we toggle activeIdx on tap since :hover is unreliable.
   */
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  const items = useMemo(() => {
    const videos = galleryFiles.filter((f) => VIDEO_EXT.test(f));
    const images = shuffle(galleryFiles.filter((f) => !VIDEO_EXT.test(f)));
    return [...videos, ...images];
  }, []);

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <SectionHeader
        title="Event Gallery"
        subtitle="Real moments from our community events, workshops, and cloud conferences."
        sysId="07.GLY"
      />

      {/*
        Pinterest-style masonry via CSS columns.
        `column-width` drives how many columns fit — browser auto-adjusts count.
      */}
      <div
        className="mt-12 relative z-10"
        style={{ columnCount: 'auto', columnWidth: '200px', columnGap: '10px' }}
      >
        {items.map((src, i) => {
          const isVideo = VIDEO_EXT.test(src);
          const isActive = activeIdx === i;

          return (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.45 }}
              className="relative mb-[10px] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 break-inside-avoid gallery-tile"
              /**
               * Touch tap toggles the active state (mobile workaround for :hover).
               * Click also toggles so desktop users can pin the overlay too.
               */
              onTouchEnd={(e) => {
                e.preventDefault(); // prevent ghost click
                setActiveIdx(isActive ? null : i);
              }}
              onClick={() => setActiveIdx(isActive ? null : i)}
            >
              {isVideo ? (
                /* ── Video tile ── */
                <div className="relative w-full">
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="w-full h-auto object-cover"
                  >
                    <source src={src} />
                  </video>
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/80">
                      Live Recap
                    </span>
                  </div>
                </div>
              ) : (
                /* ── Image tile ── */
                <div className="relative w-full overflow-hidden">
                  <img
                    src={src}
                    alt={`Event photo ${i + 1}`}
                    loading="lazy"
                    className={`w-full h-auto block object-cover transition-all duration-500 ${
                      isActive ? 'scale-105 brightness-110' : ''
                    }`}
                    /**
                     * data-active drives the CSS @media(hover:hover) rule below
                     * without needing JS on desktop.
                     */
                    data-active={isActive ? 'true' : undefined}
                  />

                  {/* Gradient overlay */}
                  <div
                    className={`gallery-overlay absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Label */}
                  <div
                    className={`gallery-label absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all duration-300 ${
                      isActive ? 'text-white/80' : 'text-transparent'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-aws-orange" />
                    Event Archive
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {galleryFiles.length === 0 && (
        <p className="text-center text-white/30 font-mono text-sm mt-16">
          No media found in <code>/event-galary/</code>
        </p>
      )}

      {/*
        Desktop hover styles using @media(hover:hover) — only applies to
        devices with a real pointing device (mouse/trackpad).
        Touch screens (hover:none) rely purely on the isActive JS state above.
      */}
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .gallery-tile:hover img {
            transform: scale(1.05);
            filter: brightness(1.1);
          }
          .gallery-tile:hover .gallery-overlay {
            opacity: 1;
          }
          .gallery-tile:hover .gallery-label {
            color: rgba(255,255,255,0.8);
          }
        }
      `}</style>
    </section>
  );
};
