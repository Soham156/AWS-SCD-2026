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

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return null;
};
