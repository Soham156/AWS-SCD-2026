import { motion } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { MapPin, Plane, Train, Bus } from 'lucide-react';

export const DirectionsSection = () => {
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505] border-t border-white/5">
      <SectionHeader title="Track Directions" subtitle="Navigate to the circuit. Find the best routes to SVKM's Institute of Technology Campus, Dhule via air, train, or road." sysId="09.NAV" />

      <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 mt-12 sm:mt-16 relative z-10">
        
        {/* Google Maps Embed */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 min-h-[300px] sm:min-h-[400px] bg-[#111] border border-white/5 p-2 relative group"
        >
          {/* Subtle neon glow behind map */}
          <div className="absolute inset-0 bg-aws-orange/5 blur-xl group-hover:bg-aws-orange/10 transition-colors pointer-events-none"></div>
          
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d778.9748565349158!2d74.76861642464331!3d20.870206706633578!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bdec60f78cc96db%3A0x6ae5738a6d39c455!2sSVKM&#39;s%20Institute%20of%20Technology!5e1!3m2!1sen!2sin!4v1780047179109!5m2!1sen!2sin"
            className="w-full h-full min-h-[300px] sm:min-h-[400px] grayscale contrast-125 opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 relative z-10"
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="SVKM IOT Campus Location"
          ></iframe>
        </motion.div>

        {/* Directions Info */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-[#111] border border-white/5 p-5 sm:p-6 flex items-start gap-4 hover:border-aws-orange/30 transition-colors"
          >
            <MapPin size={24} className="text-aws-orange mt-1 shrink-0" />
            <div>
              <h3 className="font-sans font-black italic text-lg uppercase text-white mb-2 tracking-tighter">Venue Address</h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                SVKM's Institute of Technology,<br />
                Survey No. 499, Plot No. 2, Behind Gurudwara,<br />
                Mumbai - Agra National Highway,<br />
                Dhule, Maharashtra 424311
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-[#111] border border-white/5 p-5 sm:p-6 flex items-start gap-4 hover:border-f1-red/30 transition-colors"
          >
            <Train size={24} className="text-f1-red mt-1 shrink-0" />
            <div>
              <h3 className="font-sans font-black italic text-lg uppercase text-white mb-2 tracking-tighter">By Train</h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                The nearest major railway station is <strong>Dhule Railway Station (DHI)</strong> (approx. 8km away) or <strong>Chalisgaon Junction (CSN)</strong> (approx. 60km away). Taxis and auto-rickshaws are readily available from the station to the campus.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-[#111] border border-white/5 p-5 sm:p-6 flex items-start gap-4 hover:border-[#00ff00]/30 transition-colors"
          >
            <Bus size={24} className="text-[#00ff00] mt-1 shrink-0" />
            <div>
              <h3 className="font-sans font-black italic text-lg uppercase text-white mb-2 tracking-tighter">By Road</h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                The campus is conveniently located right on the Mumbai-Agra National Highway (NH 52). It is easily accessible by state transport buses and private vehicles.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-[#111] border border-white/5 p-5 sm:p-6 flex items-start gap-4 hover:border-blue-400/30 transition-colors"
          >
            <Plane size={24} className="text-blue-400 mt-1 shrink-0" />
            <div>
              <h3 className="font-sans font-black italic text-lg uppercase text-white mb-2 tracking-tighter">By Air</h3>
              <p className="font-sans text-sm text-white/60 leading-relaxed">
                The closest airports are <strong>Nashik Airport (ISK)</strong> (approx. 150km) and <strong>Aurangabad Airport (IXU)</strong> (approx. 150km). From either airport, you can hire a taxi or take a bus to Dhule.
              </p>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}
