import { motion } from 'motion/react';
import { SectionHeader, TelemetryData } from './LayoutElements';
import { MapPin, Navigation } from 'lucide-react';

const zones = [
  { name: "Main Grandstand", desc: "Main auditorium hosting keynote sessions, opening ceremony, and closing ceremony.", lat: "Sect 1" },
  { name: "Innovation Garage", desc: "Dedicated computer labs for practical workshops and technical cloud sessions.", lat: "Sect 2" },
  { name: "Strategy Rooms", desc: "Classrooms for technical tracks, breakout discussions, and parallel sessions.", lat: "Sect 3" },
  { name: "Networking Paddock", desc: "Open quadrangle area featuring sponsor booths, networking, expo activities, and community interaction.", lat: "Pit Lane" },
];

export const CircuitSection = () => {
  return (
    <section className="relative px-4 sm:px-12 lg:px-24 py-16 sm:py-24 border-t border-white/5 overflow-hidden">
      <SectionHeader title="The Circuit" subtitle="SVKM's Institute of Technology Campus transforms into the region's premier cloud innovation arena featuring keynote stages, sponsor booths, networking zones, technical classrooms, and dedicated workshop laboratories." sysId="VENUE.04" />

      <div className="w-full relative flex flex-col lg:flex-row gap-6 sm:gap-8 mt-8 sm:mt-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex-1 bg-[#111] border border-white/5 relative flex flex-col overflow-hidden"
        >
          {/* Circuit Grid Background */}
          
          <div className="w-full h-full min-h-[250px] sm:min-h-[350px] lg:min-h-[400px] relative flex shadow-inner group">
            {/* 5th Floor Plan SVG styled to fit F1 Theme */}
            <svg viewBox="0 0 600 300" className="absolute inset-0 w-full h-full object-contain p-2 sm:p-4 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
                </pattern>
                <filter id="neon">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              <g stroke="white" strokeWidth="2" fill="none" className="transition-all duration-300">
                  {/* Outer Walls */}
                  <rect x="20" y="20" width="560" height="260" stroke="#444" strokeWidth="4" />
                  
                  {/* Top Rooms */}
                  <rect x="30" y="30" width="80" height="60" />
                  <text x="70" y="60" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">WASHROOM</text>

                  <rect x="130" y="30" width="120" height="60" stroke="#FF9900" />
                  <text x="190" y="60" fill="#FF9900" fontSize="12" fontWeight="bold" textAnchor="middle" stroke="none">COMPUTER LABS</text>
                  
                  <rect x="270" y="30" width="200" height="60" stroke="#E10600" />
                  <text x="370" y="60" fill="#E10600" fontSize="14" fontWeight="bold" textAnchor="middle" stroke="none">AUDITORIUM</text>

                  <rect x="490" y="30" width="80" height="60" />
                  <text x="530" y="60" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">WASHROOM</text>
                  
                  {/* Core / Lifts / Stairs */}
                  <rect x="30" y="120" width="60" height="40" />
                  <line x1="30" y1="140" x2="90" y2="140" stroke="white" strokeWidth="1" strokeDasharray="3 3"/>
                  
                  <rect x="150" y="110" width="300" height="60" />
                  <rect x="150" y="110" width="40" height="60" fill="rgba(255,255,255,0.1)"/>
                  <text x="170" y="145" fill="white" fontSize="10" transform="rotate(-90 170 145)" textAnchor="middle" stroke="none">LIFTS</text>
                  
                  <rect x="410" y="110" width="40" height="60" fill="rgba(255,255,255,0.1)"/>
                  <text x="430" y="145" fill="white" fontSize="10" transform="rotate(-90 430 145)" textAnchor="middle" stroke="none">LIFTS</text>
                  
                  <rect x="490" y="120" width="60" height="40" />
                  <line x1="490" y1="140" x2="550" y2="140" stroke="white" strokeWidth="1" strokeDasharray="3 3"/>

                  {/* Bottom Rooms / Classrooms */}
                  <rect x="30" y="200" width="70" height="70" />
                  <text x="65" y="235" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">CLASSROOM</text>

                  <rect x="110" y="200" width="70" height="70" />
                  <text x="145" y="235" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">CLASSROOM</text>

                  <rect x="190" y="200" width="70" height="70" />
                  <text x="225" y="235" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">CLASSROOM</text>
                  
                  <rect x="340" y="200" width="70" height="70" />
                  <text x="375" y="235" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">CLASSROOM</text>

                  <rect x="420" y="200" width="70" height="70" />
                  <text x="455" y="235" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">CLASSROOM</text>

                  <rect x="500" y="200" width="70" height="70" />
                  <text x="535" y="235" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle" stroke="none">CLASSROOM</text>
                  
                  {/* Indicators / Active Zones (Simulated Data) */}
                  <circle cx="370" cy="60" r="15" fill="rgba(225,6,0,0.2)" stroke="#E10600" filter="url(#neon)">
                    <animate attributeName="r" values="15; 25; 15" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="1; 0; 1" dur="2s" repeatCount="indefinite" />
                  </circle>

                  <circle cx="190" cy="60" r="15" fill="rgba(255,153,0,0.2)" stroke="#FF9900" filter="url(#neon)">
                    <animate attributeName="r" values="15; 20; 15" dur="3s" repeatCount="indefinite" />
                  </circle>
              </g>
            </svg>
            
            <div className="absolute top-3 sm:top-6 left-3 sm:left-6 border-l-2 border-[#E10600] pl-2 sm:pl-3 z-10">
              <div className="text-xs sm:text-sm font-black font-sans uppercase text-white tracking-widest">SVKM IOT CAMPUS</div>
              <div className="text-[9px] sm:text-[10px] opacity-70 uppercase font-sans mt-1 max-w-[160px] sm:max-w-[200px] leading-relaxed">Survey No. 499, Plot No. 2, Mumbai Agra Highway, Dhule 424311</div>
            </div>
            
            <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 border-l-2 border-[#FF9900] pl-2 sm:pl-3 z-10 bg-[#111]/80 backdrop-blur p-1.5 sm:p-2">
              <div className="text-xs sm:text-sm font-black font-sans uppercase text-white tracking-widest">5TH FLOOR LEVEL</div>
            </div>

            <div className="absolute bottom-3 sm:bottom-6 right-3 sm:right-6 text-right border-r-2 border-[#00ff00] pr-2 sm:pr-3 z-10 bg-[#111]/80 backdrop-blur p-1.5 sm:p-2">
              <TelemetryData label="STATUS" value="CIRCUIT READY" color="text-[#00ff00]" />
            </div>
          </div>
        </motion.div>

        <div className="w-full lg:w-[400px] flex flex-col gap-3 sm:gap-4">
           <h3 className="font-sans font-black italic uppercase tracking-widest text-[#e0e0e0] border-b border-white/10 pb-2 mb-1 sm:mb-2 text-base sm:text-lg">Circuit Zones</h3>
           {zones.map((zone, i) => (
             <motion.div 
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
                className="bg-[#111] border border-white/5 p-3 sm:p-4 flex flex-col group hover:border-[#FF9900]/50 transition-colors"
             >
                <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                   <div className="font-sans font-black uppercase text-xs sm:text-sm text-white">{zone.name}</div>
                   <div className="text-[8px] sm:text-[9px] uppercase tracking-widest font-mono text-f1-red bg-f1-red/10 px-1 py-0.5">{zone.lat}</div>
                </div>
                <div className="text-[10px] sm:text-xs font-sans opacity-60 leading-relaxed">
                   {zone.desc}
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  )
}
