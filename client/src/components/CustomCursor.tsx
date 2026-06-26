import { useEffect, useRef, useState } from 'react';

/**
 * Custom drill cursor — desktop / real-mouse only.
 *
 * ✦ Upright (0°) while moving normally
 * ✦ Tilts to 30° when over any clickable element
 * ✦ Native cursor is hidden via index.css when CustomCursor is active
 *
 * NOTE: We intentionally do NOT use getComputedStyle to detect "pointer"
 * cursor, because our global CSS sets cursor:none !important on everything,
 * so computed cursor is always "none". Instead we inspect the DOM directly.
 */
export const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkVisibility = () => {
      const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
      const isLite = localStorage.getItem('scd_lite_mode') === 'true' || document.body.classList.contains('lite-mode');
      const isPreloader = document.body.classList.contains('preloader-active');
      
      setShouldShow(!isMobile && !isLite && !isPreloader);
    };

    checkVisibility();

    const handleLiteChange = () => checkVisibility();
    const observer = new MutationObserver(() => checkVisibility());

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('scd_lite_mode_change', handleLiteChange);
    window.addEventListener('resize', handleLiteChange);

    return () => {
      observer.disconnect();
      window.removeEventListener('scd_lite_mode_change', handleLiteChange);
      window.removeEventListener('resize', handleLiteChange);
    };
  }, []);

  useEffect(() => {
    if (!shouldShow) return;

    const isClickable = (el: Element | null): boolean => {
      while (el && el !== document.documentElement) {
        const tag = el.tagName.toLowerCase();

        // Interactive tags
        if (['a', 'button', 'input', 'select', 'textarea', 'label', 'summary'].includes(tag)) return true;

        // ARIA roles
        const role = el.getAttribute('role');
        if (role && ['button', 'link', 'menuitem', 'tab', 'option', 'checkbox', 'radio', 'switch'].includes(role)) return true;

        // Common Tailwind / custom clickable classes
        const cls = (el as HTMLElement).className ?? '';
        if (typeof cls === 'string' && /\bcursor-pointer\b/.test(cls)) return true;

        // onClick prop compiled to attribute
        if ((el as HTMLElement).hasAttribute('onclick')) return true;

        el = el.parentElement;
      }
      return false;
    };

    const onMove = (e: MouseEvent) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const target = e.target;

      const clickable = isClickable(target as Element);

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = cursorRef.current;
        if (!el) return;
        el.style.left = `${clientX}px`;
        el.style.top = `${clientY}px`;
        el.style.transform = `translate(-50%, -50%) rotate(${clickable ? -30 : 0}deg)`;
        el.style.opacity = '1';
      });
    };

    const onLeave = () => { if (cursorRef.current) cursorRef.current.style.opacity = '0'; };
    const onEnter = () => { if (cursorRef.current) cursorRef.current.style.opacity = '1'; };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);
    document.documentElement.addEventListener('mouseenter', onEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      document.documentElement.removeEventListener('mouseenter', onEnter);
    };
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: '-200px',
        top: '-200px',
        width: '28px',
        height: '28px',
        pointerEvents: 'none',
        zIndex: 99999,
        transform: 'translate(-50%, -50%) rotate(0deg)',
        /* Smooth springy tilt snap, but NO transition on left/top (would lag) */
        transition: 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s ease',
        willChange: 'left, top, transform',
      }}
    >
      <img
        src="/drill.avif"
        loading="lazy"
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        draggable={false}
      />
    </div>
  );
};
