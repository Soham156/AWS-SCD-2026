import { motion } from 'motion/react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { galleryFiles as localGalleryFiles } from 'virtual:event-gallery';
import { SectionHeader } from './LayoutElements';

const galleryFiles = localGalleryFiles;
const mov0='https://photos.google.com/u/7/share/AF1QipPoXXkDai6EM782Hs2z_DwIp6FQr_2HIqBXvpE8oVdMpvqA8UohbV87eG8QVpWZlQ/photo/AF1QipOoKNiZsEUnXRFLHESLLrbiHA5twX4Eq3-cAvdA?key=eHVBVGlRd05WeHdWdWZsblhpX3FXaEttSGhWcXFB'
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

const AutoPlayVideo = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(e => console.warn("AutoPlayVideo play failed:", e));
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0 }
    );
    if (videoRef.current) {
      observer.observe(videoRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      loop
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
      className="w-full h-auto object-cover"
    >
      <source src={src} />
    </video>
  );
};

export const GallerySection = () => {
  /**
   * activeIdx: tracks which tile is "tapped" on mobile.
   * On desktop, CSS hover handles the overlay via @media(hover:hover).
   * On touch screens, we toggle activeIdx on tap since :hover is unreliable.
   */
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    const videos = galleryFiles.filter((f) => VIDEO_EXT.test(f));
    const images = shuffle(galleryFiles.filter((f) => !VIDEO_EXT.test(f)));
    return [...videos, ...images];
  }, []);

  return (
    <section id="gallery" className="relative mt-0 py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-transparent backdrop-blur-[8px] pt-10 sm:pt-12 lg:pt-16 pb- -mt-10 sm:-mt-12 lg:-mt-16 mb-0">
        <SectionHeader
          title="Event Gallery"
          subtitle=""
          sysId="08.GLY"
        />
        <p className="font-sans  text-xs sm:text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-xl mb-8 -mt-2 relative z-10">
        Real moments from our community events, workshops, and cloud conferences.
      </p>
      </div>
      

      <div
        className="mt-12 relative z-10"
        style={{ columnCount: 'auto', columnWidth: '280px', columnGap: '10px' }}
      >
        {items.slice(0, showAll ? items.length : 4).map((src, i) => {
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
                  <AutoPlayVideo src={src} />
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
                    decoding="async"
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

      {!showAll && items.length > 4 && (
        <div className="mt-12 flex justify-center relative z-10">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/5 font-mono text-xs uppercase tracking-widest transition-all duration-300 rounded-sm"
          >
            See More
          </button>
        </div>
      )}

      {galleryFiles.length === 0 && (
        <p className="text-center text-white/30 font-mono text-sm mt-16">
          No media found in <code>/event-gallary/</code>
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
