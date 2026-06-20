import { motion, AnimatePresence } from 'motion/react';
import { useMemo, useState, useEffect, useRef } from 'react';
import { galleryFiles as localGalleryFiles } from 'virtual:event-gallery';
import { SectionHeader } from './LayoutElements';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryFiles = localGalleryFiles;
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
      preload="none"
      aria-hidden="true"
      className="w-full h-auto object-cover"
    >
      <source src={src} />
    </video>
  );
};

import { createPortal } from 'react-dom';

const Lightbox = ({ items, initialIdx, onClose }: { items: string[], initialIdx: number, onClose: () => void }) => {
  const [idx, setIdx] = useState(initialIdx);

  const next = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx((c) => (c + 1) % items.length); };
  const prev = (e?: React.MouseEvent) => { e?.stopPropagation(); setIdx((c) => (c - 1 + items.length) % items.length); };

  const currentSrc = items[idx];
  const isVideo = VIDEO_EXT.test(currentSrc);

  const lightboxContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white bg-black/50 rounded-full transition-colors">
        <X size={24} />
      </button>
      
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={(e, { offset }) => {
              if (offset.x < -50) next();
              else if (offset.x > 50) prev();
            }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex items-center justify-center w-full h-full p-4 md:p-12 cursor-grab active:cursor-grabbing"
          >
            {isVideo ? (
              <video src={currentSrc} controls autoPlay className="max-w-full max-h-full rounded-xl shadow-2xl" />
            ) : (
              <img src={currentSrc} alt="Gallery Preview" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl pointer-events-none" />
            )}
          </motion.div>
        </AnimatePresence>
        
        <button onClick={prev} className="absolute left-2 md:left-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full z-50 transition-colors">
          <ChevronLeft size={32} />
        </button>
        <button onClick={next} className="absolute right-2 md:right-6 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full z-50 transition-colors">
          <ChevronRight size={32} />
        </button>
      </div>
    </motion.div>
  );

  return createPortal(lightboxContent, document.body);
};

export const GallerySection = () => {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
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
        <p className="font-sans text-xs sm:text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-xl mb-8 -mt-2 relative z-10">
        Real moments from our community events, workshops, and cloud conferences.
      </p>
      </div>
      
      <div className="mt-12 relative z-10 columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4">
        {items.slice(0, showAll ? items.length : 8).map((src, i) => {
          const isVideo = VIDEO_EXT.test(src);
          const isActive = activeIdx === i;

          return (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: (i % 8) * 0.06, duration: 0.45 }}
              className="relative mb-2 sm:mb-4 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 break-inside-avoid gallery-tile cursor-pointer"
              onTouchEnd={(e) => {
                // Prevent ghost click triggering lightbox immediately if they just tapped to hover
                if (!isActive && !isVideo) {
                  e.preventDefault();
                  setActiveIdx(i);
                }
              }}
              onClick={() => {
                setActiveIdx(isActive ? null : i);
                setLightboxIdx(i);
              }}
            >
              {isVideo ? (
                <div className="relative w-full">
                  <AutoPlayVideo src={src} />
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-aws-orange animate-pulse" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-white/80">
                      Live Recap
                    </span>
                  </div>
                </div>
              ) : (
                <div className="relative w-full overflow-hidden">
                  <img
                    src={src}
                    alt={`Event photo ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-auto block object-cover transition-all duration-500 ${
                      isActive ? 'scale-105 brightness-110' : ''
                    }`}
                    data-active={isActive ? 'true' : undefined}
                  />

                  <div
                    className={`gallery-overlay absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none transition-opacity duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div
                    className={`gallery-label absolute bottom-2 left-2 font-mono text-[9px] uppercase tracking-widest flex items-center gap-1.5 transition-all duration-300 ${
                      isActive ? 'text-white/80' : 'text-transparent'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-aws-orange" />
                    View Full
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!showAll && items.length > 8 && (
        <div className="mt-12 flex justify-center relative z-10">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/5 font-mono text-xs uppercase tracking-widest transition-all duration-300 rounded-sm cursor-pointer"
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

      <AnimatePresence>
        {lightboxIdx !== null && (
          <Lightbox items={items} initialIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
        )}
      </AnimatePresence>

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
