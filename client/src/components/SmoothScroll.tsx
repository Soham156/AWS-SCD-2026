import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initializes Lenis smooth scroll and syncs it with GSAP ScrollTrigger.
 * Render once at the app root level.
 */
export const SmoothScroll = () => {
  useEffect(() => {
    const lenis = new Lenis();

    // Sync Lenis scroll position with ScrollTrigger on every scroll event
    lenis.on('scroll', ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker for frame-perfect animation
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // Globally intercept anchor clicks for smooth scrolling via Lenis
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (!anchor) return;
      
      // Ignore if they click a React Router Link with no href, or a non-hash link
      const href = anchor.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        e.preventDefault();
        lenis.scrollTo(href);
      }
    };
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return null;
};
