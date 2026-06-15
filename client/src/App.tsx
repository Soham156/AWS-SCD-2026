import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Suspense, lazy } from 'react';

const TicketPage = lazy(() => import('./features/ticketing/pages/TicketPage').then(module => ({ default: module.TicketPage })));
const TicketsPurchasePage = lazy(() => import('./features/ticketing/pages/TicketsPurchasePage').then(module => ({ default: module.TicketsPurchasePage })));
const ScannerPage = lazy(() => import('./features/scanner/pages/ScannerPage').then(module => ({ default: module.ScannerPage })));
const AdminPage = lazy(() => import('./features/admin/pages/AdminPage').then(module => ({ default: module.AdminPage })));
const SpeakerPage = lazy(() => import('./features/speaker/pages/SpeakerPage').then(module => ({ default: module.SpeakerPage })));
import { Preloader } from './components/Preloader';
import { HeaderSection } from './components/HeaderSection';
import { HeroSection } from './components/HeroSection';
import { LogoMarquee } from './components/LogoMarquee';
import { GridSection } from './components/GridSection';
import { DriversSection } from './components/DriversSection';
import { TimelineSection } from './components/TimelineSection';
import { CircuitSection } from './components/CircuitSection';
import { ConstructorsSection } from './components/ConstructorsSection';
import { TicketsSection } from './components/TicketsSection';
import { SpeakersSection } from './components/SpeakersSection';
import { GallerySection } from './components/GallerySection';
import { FAQSection } from './components/FAQSection';
import { DirectionsSection } from './components/DirectionsSection';
import { FooterSection } from './components/FooterSection';
const SponsorPage = lazy(() => import('./components/SponsorPage').then(module => ({ default: module.SponsorPage })));
const NotFoundPage = lazy(() => import('./components/NotFoundPage').then(module => ({ default: module.NotFoundPage })));
import { BackToTop } from './components/BackToTop';
import { CustomCursor } from './components/CustomCursor';
// import { SoundButton } from './components/SoundButton';
import { SmoothScroll } from './components/SmoothScroll';
import { SocialWall } from './components/SocialWall';
import { SectionDivider } from './components/LayoutElements';

function HomePage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#e0e0e0] flex flex-col overflow-x-clip">
      <AnimatePresence mode="wait">
        {loading && (
           <Preloader key="preloader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <div className={loading ? "fixed inset-0 opacity-0 pointer-events-none" : "relative opacity-0 animate-[fadeIn_1s_ease-out_forwards]"}>
        <HeaderSection />
        <main className="flex flex-col">
            {/* Act 1: Introduction */}
            <HeroSection />
            <LogoMarquee />
            <GridSection />

            {/* <SectionDivider label="// 02" /> */}

            {/* Act 2: The Program */}
            <TimelineSection />
            <SpeakersSection />

            {/* <SectionDivider label="// 03" /> */}

            {/* Act 3: The Team & Tickets */}
            <DriversSection />
            <TicketsSection />

            {/* <SectionDivider label="// 04" /> */}

            {/* Act 4: Venue & Logistics */}
            <CircuitSection />
            <DirectionsSection />

            {/* <SectionDivider label="// 05" /> */}

            {/* Act 5: Social Proof & Info */}
            <GallerySection />
            <SocialWall />
            <FAQSection />
            <ConstructorsSection />
            <FooterSection />
        </main>
      </div>

      {/* Tailwind inline raw utility animation for main content fade in */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; filter: blur(10px); }
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  // Disable right-click context menu site-wide
  useEffect(() => {
    const prevent = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', prevent);
    return () => document.removeEventListener('contextmenu', prevent);
  }, []);

  return (
  <>
    <SmoothScroll />
    <Suspense fallback={<Preloader key="suspense-loader" onComplete={() => {}} />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sponsors" element={<SponsorPage />} />
        <Route path="/ticket" element={<TicketsPurchasePage />} />
        <Route path="/ticket/:id" element={<TicketPage />} />
        <Route path="/speaker" element={<SpeakerPage />} />
        <Route path="/scanner" element={<ScannerPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
    <BackToTop />
    {/* <SoundButton /> */}
    <CustomCursor />
  </>
  );
}
