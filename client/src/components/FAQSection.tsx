import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeader } from './LayoutElements';
import { Plus, Minus } from 'lucide-react';

const faqs = [
{
question: "Who should attend AWS Student Community Day Dhule?",
answer: "Students, developers, builders, founders, cloud enthusiasts, and anyone curious about technology. If you've ever broken something while learning and somehow fixed it later, you'll fit right in. Aliens may attend, but only if they register first."
},
{
question: "Do I need AWS or cloud experience?",
answer: "Not at all. Whether you're deploying production workloads or still wondering what EC2 actually does, there's a session designed for you."
},
{
question: "Can beginners attend?",
answer: "Absolutely. Every cloud engineer started with a confused Google search, a free-tier account, and questionable confidence."
},
{
question: "What will I actually get from attending?",
answer: "Knowledge, networking, industry insights, career opportunities, certificates, swag, new connections, and at least three browser tabs you'll promise to revisit later. Food is obviously included."
},
{
question: "Will there be internships or job opportunities?",
answer: "Yes, absolutely! There will be active internship and job opportunities. Multiple sponsors, tech companies, and community partners are scouting for talented builders at the event. Make sure to keep your resumes updated, portfolios ready, and your LinkedIn profiles in prime condition!"
},
{
question: "Will there be networking opportunities?",
answer: "Yes. The professional kind. Not the kind involving routers, switches, cables, and subnet masks."
},
{
question: "Will there be AI sessions?",
answer: "Of course. It's 2026. Every technology event is legally required to mention AI at least once every few minutes."
},
{
question: "How is AWS Student Community Day different from a college seminar?",
answer: "Nobody is here because attendance is mandatory. Everyone is here because they genuinely want to learn, connect, and build."
},
{
question: "What if I attend alone?",
answer: "Half the attendees are thinking the exact same thing. By lunch you'll either have new friends, new collaborators, or at least a few new LinkedIn connections."
},
{
question: "Can I ask beginner questions?",
answer: "Please do. The only dangerous question is the one that silently becomes a production issue six months later."
},
{
question: "What if I don't understand a session?",
answer: "That's completely normal. Just ask questions, take notes, and remember that even experienced engineers spend half their careers searching for answers."
},
{
question: "What should I bring?",
answer: "Bring your ticket, a valid ID, a charged laptop, a charger, and enough battery life to survive the inevitable LinkedIn posting spree."
},
{
question: "Will food be provided?",
answer: "Yes. Cloud computing becomes significantly more difficult when your stomach enters power-saving mode."
},
{
question: "Will there be free swag?",
answer: "Yes. We know this was one of the first questions you wanted answered."
},
{
question: "Can I add this event to LinkedIn?",
answer: "Absolutely. We fully expect a significant percentage of attendees to post 'Excited to attend 🚀' before they even arrive."
},
{
question: "Is this worth spending an entire day on?",
answer: "You're asking this while spending hours scrolling social media. So yes, probably."
},
{
question: "What if I know everything already?",
answer: "Fantastic. We'd love to hear your keynote next year."
},
{
question: "What is the refund policy?",
answer: "Tickets are non-refundable once purchased. Ticket transfers may be allowed before the event. Also, if you weren't sure about attending, why did you race through registration faster than a production deployment?"
}
];


export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-transparent backdrop-blur-[8px] pt-10 sm:pt-12 lg:pt-16  -mt-10 sm:-mt-12 lg:-mt-16 mb-0">
        <SectionHeader title="Briefing Room" subtitle="" sysId="09.FAQ" />
      <p className="font-sans text-xs sm:text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-xl pb-2 mb-6 -mt-2 relative z-10">
        Frequently asked questions about the event, ticketing, and logistics. Everything you need to know before lights out.
      </p>
      </div>

      <div className="max-w-3xl mx-auto mt-12 sm:mt-16 flex flex-col gap-3 relative z-10">
        {faqs.map((faq, i) => {
          const isOpen = openIndex === i;
          
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
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
                <span className={`font-sans font-black italic text-sm sm:text-base uppercase tracking-tight pr-4 transition-colors ${
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

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    onUpdate={() => window.dispatchEvent(new Event('resize'))}
                    className="overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 bg-[#111] border-x border-b border-white/10 text-sm sm:text-base text-white/60 leading-relaxed font-sans">
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
