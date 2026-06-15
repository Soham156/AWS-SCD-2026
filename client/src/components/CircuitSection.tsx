import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Mic, Laptop, TerminalSquare, Users, UtensilsCrossed, CircleUser } from 'lucide-react';

const spaces = [
  {
    id: 'auditorium',
    title: 'Main Auditorium',
    desc: 'Opening ceremony, guest keynotes, industry panel discussion, and closing ceremony.',
    icon: Mic,
    color: 'text-f1-red',
    border: 'border-f1-red',
    floor: 'fifth',
  },
  {
    id: 'presentation',
    title: 'Presentation Rooms',
    desc: 'Parallel Track A (AI & ML) and Track B (Cloud & DevOps) classrooms equipped with interactive senseboards.',
    icon: Laptop,
    color: 'text-[#00ff00]',
    border: 'border-[#00ff00]',
    floor: 'fifth',
  },
  {
    id: 'workshops',
    title: 'Hands-on Workshops',
    desc: 'Dedicated 5th-floor computer laboratories hosting active AWS cloud labs.',
    icon: TerminalSquare,
    color: 'text-aws-orange',
    border: 'border-aws-orange',
    floor: 'fifth',
  },
  {
    id: 'quadrangle',
    title: 'Central Quadrangle',
    desc: 'Physical company sponsor booths, interactive promotional displays, and community networking.',
    icon: Users,
    color: 'text-blue-400',
    border: 'border-blue-400',
    floor: 'ground',
  },
  {
    id: 'Cafeteria',
    title: 'Cafeteria',
    desc: 'Food and refreshment area for attendees.',
    icon: UtensilsCrossed,
    color: 'text-blue-400', 
    border: 'border-blue-400',
    floor: 'ground',
  },
  {
    id: 'Registration Area',
    title: 'Registration Area',
    desc: 'Registration area for attendees.',
    icon: CircleUser,    
    color: 'text-blue-400', 
    border: 'border-blue-400',
    floor: 'ground',
  },
];

export const CircuitSection = () => {
  const [activeFloor, setActiveFloor] = useState<'ground' | 'fifth'>('fifth');

  return (
    <section id="circuit" className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      {/* Background ambient light */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[150px] -translate-y-1/2 pointer-events-none" />

      <SectionHeader 
        title="The Venue & Spaces" 
        subtitle="SVKM's Institute of Technology, Dhule, is a world-class educational hub known for its modern infrastructure and commitment to engineering excellence." 
        sysId="06.VEN" 
      />

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 mt-12 sm:mt-16 relative z-10 items-start">
        
        {/* Left: Info Cards */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
          <AnimatePresence mode="popLayout">
            {spaces.filter(space => space.floor === activeFloor).map((space, i) => (
            <motion.div
              key={space.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              onClick={() => setActiveFloor(space.floor as 'ground' | 'fifth')}
              className={`bg-[#111] border p-5 sm:p-6 flex items-start gap-4 transition-colors cursor-pointer group ${
                activeFloor === space.floor 
                  ? `border-white/30 bg-[#151515]` 
                  : `border-white/5 hover:border-white/20`
              }`}
            >
              <div className={`p-3 bg-white/5 border border-white/10 shrink-0 group-hover:bg-white/10 transition-colors`}>
                <space.icon size={20} className={space.color} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-sans font-black italic text-lg uppercase text-white tracking-tighter">
                    {space.title}
                  </h3>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-white/30 border border-white/10 px-2 py-0.5">
                    {space.floor === 'ground' ? 'Ground Floor' : '5th Floor'}
                  </span>
                </div>
                <p className="font-sans text-sm text-white/60 leading-relaxed">
                  {space.desc}
                </p>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>

        {/* Right: Map Container */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 flex flex-col">
          
          {/* Floor Toggle */}
          <div className="flex border border-white/10 bg-[#0a0a0a] p-1 mb-4 w-max">
            <button
              onClick={() => setActiveFloor('ground')}
              className={`px-6 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                activeFloor === 'ground' ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              Ground Floor
            </button>
            <button
              onClick={() => setActiveFloor('fifth')}
              className={`px-6 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                activeFloor === 'fifth' ? 'bg-white text-black font-bold' : 'text-white/50 hover:text-white'
              }`}
            >
              5th Floor
            </button>
          </div>

          {/* Map Display */}
          <div className="bg-[#111] border border-white/10 aspect-video relative overflow-hidden flex items-center justify-center group">
            {/* Grid background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
            
            <AnimatePresence mode="wait">
              {activeFloor === 'ground' ? (
                <motion.div
                  key="ground"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col items-center justify-center text-center p-8 relative z-10"
                >
                  {/* Placeholder for Ground Floor SVG */}
                  <div className="w-full max-w-sm aspect-[21/9] border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest text-center">Ground Floor<br/>SVG Here</span>
                  </div>
                  <p className="font-sans text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
                    {spaces.filter(s => s.floor === 'ground').map(s => s.title).join(' • ')}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="fifth"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex flex-col items-center justify-center text-center p-8 relative z-10"
                >
                  {/* Placeholder for 5th Floor SVG */}
                  <div className="w-full max-w-sm aspect-[21/9] border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center mb-4">
                    <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest text-center">5th Floor<br/>SVG Here</span>
                  </div>
                  <p className="font-sans text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
                    {spaces.filter(s => s.floor === 'fifth').map(s => s.title).join(' • ')}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scanning line for tech feel */}
            <div className="absolute top-0 left-0 right-0 h-px bg-white/20 shadow-[0_0_10px_rgba(255,255,255,0.5)] z-20 animate-[scan_4s_ease-in-out_infinite] opacity-50 pointer-events-none" />
          </div>
          
        </div>

      </div>
    </section>
  );
};
