/**
 * touchHover.ts
 *
 * Bridges the gap between mouse hover and touch/keyboard on mobile/tablet.
 *
 * Strategy:
 * - Adds `.touch-hover` to `.group` ancestor + the touched element itself on touchstart
 * - Removes it after a short delay on touchend (so transitions can complete)
 * - Also pauses / resumes GSAP marquee on tap via a custom event
 * - Only runs on devices with no native hover (touch screens)
 */

let lastGroup: Element | null = null;
let removeTimer: ReturnType<typeof setTimeout> | null = null;

/** Walk up and find nearest .group ancestor (or self) */
function nearestGroup(el: Element | null): Element | null {
  while (el && el !== document.documentElement) {
    if (
      el.classList.contains('group') ||
      el.classList.contains('gallery-tile') ||
      el.classList.contains('marquee-logo')
    ) return el;
    el = el.parentElement;
  }
  return null;
}

function clearLast() {
  if (removeTimer) clearTimeout(removeTimer);
  if (lastGroup) {
    lastGroup.classList.remove('touch-hover');
    lastGroup = null;
  }
}

export function initTouchHover() {
  // Only activate on real touch devices (no native hover)
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.addEventListener('touchstart', (e) => {
    const target = e.target as Element;

    // Clear previous group immediately so tap-switching feels responsive
    clearLast();

    const group = nearestGroup(target);
    if (group) {
      group.classList.add('touch-hover');
      lastGroup = group;
    }

    // Marquee: fire a pause event when a logo is tapped
    if (target.closest('.marquee-logo') || target.classList.contains('marquee-logo')) {
      window.dispatchEvent(new CustomEvent('marquee-tap', { detail: { pause: true } }));
    }
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    const target = e.target as Element;

    // Resume marquee after logo tap
    if (target.closest('.marquee-logo') || target.classList.contains('marquee-logo')) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('marquee-tap', { detail: { pause: false } }));
      }, 800);
    }

    // Keep .touch-hover alive for 500ms so CSS transitions finish
    removeTimer = setTimeout(clearLast, 500);
  }, { passive: true });

  document.addEventListener('touchcancel', clearLast, { passive: true });
}
