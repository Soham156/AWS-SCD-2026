import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "When and where is AWS Student Community Day Dhule 2026?",
    answer: "The event is scheduled for August 14, 2026, at the SVKM's Institute of Technology Campus in Dhule, Maharashtra."
  },
  {
    question: "Who can attend the event?",
    answer: "The event is open to students, cloud enthusiasts, developers, and industry professionals. We have specific ticket tiers for students and professionals."
  },
  {
    question: "Do I need prior AWS experience?",
    answer: "Not at all! We have tracks for beginners as well as advanced workshops for experienced developers. There is something for everyone."
  },
  {
    question: "What should I bring with me?",
    answer: "Bring your laptop and charger for hands-on workshops, a valid ID card for entry, and a readiness to learn and network!"
  },
  {
    question: "Is lunch provided?",
    answer: "Yes, all pass tiers include lunch, high tea, and access to the networking paddock."
  }
];

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <SectionHeader title="Briefing Room" subtitle="Frequently asked questions about the event, ticketing, and logistics. Everything you need to know before lights out." sysId="08.FAQ" />

      <div className="max-w-3xl mx-auto mt-12 sm:mt-16 flex flex-col gap-4 relative z-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="group"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className={`w-full flex items-center justify-between p-5 sm:p-6 border text-left transition-colors duration-300 ${
                  isOpen 
                    ? 'bg-[#111] border-aws-orange/50' 
                    : 'bg-[#0a0a0a] border-white/5 hover:border-white/20 hover:bg-[#111]'
                }`}
              >
                <span className={`font-sans font-black italic text-base sm:text-lg uppercase tracking-tight pr-4 transition-colors ${
                  isOpen ? 'text-white' : 'text-white/70 group-hover:text-white'
                }`}>
                  {faq.question}
                </span>
                <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                  isOpen ? 'bg-aws-orange text-black' : 'bg-white/5 text-white/50 group-hover:bg-white/10 group-hover:text-white'
                }`}>
                  {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 bg-[#111] border-x border-b border-white/5 text-sm sm:text-base text-white/60 leading-relaxed font-sans">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
