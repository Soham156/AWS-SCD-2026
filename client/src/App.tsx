import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { TicketPage } from './features/ticketing/pages/TicketPage';
import { TicketsPurchasePage } from './features/ticketing/pages/TicketsPurchasePage';
import { ScannerPage } from './features/scanner/pages/ScannerPage';
import { AdminPage } from './features/admin/pages/AdminPage';
import { Preloader } from './components/Preloader';
import { HeaderSection } from './components/HeaderSection';
import { HeroSection } from './components/HeroSection';
import { LogoMarquee } from './components/LogoMarquee';
import { GridSection } from './components/GridSection';
import { DriversSection } from './components/DriversSection';
import { TimelineSection } from './components/TimelineSection';
import { CircuitSection } from './components/CircuitSection';
import { ConstructorsSection } from './components/ConstructorsSection';
import { ActivitiesSection } from './components/ActivitiesSection';
import { TicketsSection } from './components/TicketsSection';
import { SpeakersSection } from './components/SpeakersSection';
import { GallerySection } from './components/GallerySection';
import { FAQSection } from './components/FAQSection';
import { DirectionsSection } from './components/DirectionsSection';
import { FooterSection } from './components/FooterSection';
import { SponsorPage } from './components/SponsorPage';
import { BackToTop } from './components/BackToTop';
import { CustomCursor } from './components/CustomCursor';
import { SoundButton } from './components/SoundButton';
import { SmoothScroll } from './components/SmoothScroll';

function HomePage() {
  const [loading, setLoading] = useState(true);

  return (
    <div className="min-h-screen bg-[#050505] font-sans text-[#e0e0e0] flex flex-col">
      <AnimatePresence mode="wait">
        {loading && (
           <Preloader key="preloader" onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      <div className={loading ? "fixed inset-0 opacity-0 pointer-events-none" : "relative opacity-0 animate-[fadeIn_1s_ease-out_forwards]"}>
        <HeaderSection />
        <main className="flex flex-col">
            <HeroSection />
            <LogoMarquee />
            <GridSection />
            <SpeakersSection />
            <TimelineSection />
            <ActivitiesSection />
            <DriversSection />
            <TicketsSection />
            <CircuitSection />
            <DirectionsSection />
            <GallerySection />
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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/sponsors" element={<SponsorPage />} />
      <Route path="/ticket" element={<TicketsPurchasePage />} />
      <Route path="/ticket/:id" element={<TicketPage />} />
      <Route path="/scanner" element={<ScannerPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
    <BackToTop />
    <SoundButton />
    <CustomCursor />
  </>
  );
}
