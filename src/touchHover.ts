/**
 * touchHover.ts
 *
 * Makes CSS :hover-equivalent work on touch screens by toggling
 * a `.touch-hover` class on the nearest interactive ancestor when
 * the user touches it.
 *
 * CSS in index.css then targets `.touch-hover` alongside `:hover`
 * so every hover effect works identically on touch devices.
 */

const INTERACTIVE = 'a, button, [role="button"], [role="tab"], [role="menuitem"], .gallery-tile, [data-hover]';

let lastTouched: Element | null = null;

function getInteractiveAncestor(el: Element | null): Element | null {
  while (el) {
    if (el.matches(INTERACTIVE)) return el;
    el = el.parentElement;
  }
  return null;
}

function clearLast() {
  lastTouched?.classList.remove('touch-hover');
  lastTouched = null;
}

export function initTouchHover() {
  // Only needed on touch devices
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.addEventListener('touchstart', (e) => {
    clearLast();
    const target = getInteractiveAncestor(e.target as Element);
    if (target) {
      target.classList.add('touch-hover');
      lastTouched = target;
    }
  }, { passive: true });

  // Remove after a short delay so transitions can complete
  document.addEventListener('touchend', () => {
    setTimeout(clearLast, 600);
  }, { passive: true });

  document.addEventListener('touchcancel', clearLast, { passive: true });
}
