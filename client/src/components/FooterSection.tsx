import { motion } from 'motion/react';
import { AngledButton } from './LayoutElements';
import { Github, Linkedin, Twitter, Mail, ArrowUpRight } from 'lucide-react';

export const FooterSection = () => {
  return (
    <footer className="relative bg-[#050505] overflow-hidden mt-8 sm:mt-12 flex flex-col p-4 sm:px-12 lg:px-24 gap-8 sm:gap-12 z-10 border-t border-white/5 py-10 sm:py-16">
      <div className="flex flex-col md:flex-row gap-8 sm:gap-12 justify-between">
         
         <div className="flex flex-col max-w-sm">
           <div className="text-white font-sans font-black italic text-2xl sm:text-4xl mb-2 uppercase tracking-tighter">AWS SCD<br/>DHULE 2026.</div>
           <div className="text-white/60 text-xs sm:text-sm font-sans mb-6 sm:mb-8">Powering the next generation of cloud innovators. See You At The Starting Grid.</div>
           <a href="mailto:info@aws-scd-dhule.tech" className="inline-flex max-w-max items-center font-mono text-[10px] sm:text-xs text-aws-orange hover:text-white transition-colors mb-2 uppercase tracking-widest gap-2 break-all">
             <Mail size={14} className="shrink-0" /> info@aws-scd-dhule.tech
           </a>
         </div>

         <div className="grid grid-cols-2 gap-8 sm:gap-12 md:gap-24">
            <div className="flex flex-col">
               <span className="font-sans font-black italic text-base sm:text-lg uppercase text-white mb-3 sm:mb-4">Contact</span>
               <ul className="flex flex-col gap-3 font-mono text-[10px] sm:text-xs opacity-60 uppercase tracking-wider sm:tracking-widest">
                  <li>Soham Chaudhari<br/><span className="text-[#FF9900]">+91 98343 82337</span></li>
                  <li>Vaibhav Chaudhari<br/><span className="text-[#FF9900]">+91 80072 98092</span></li>
               </ul>
            </div>
            
            <div className="flex flex-col">
               <span className="font-sans font-black italic text-base sm:text-lg uppercase text-white mb-3 sm:mb-4">Social</span>
               <ul className="flex flex-col gap-3 font-mono text-[10px] sm:text-xs opacity-60 uppercase tracking-wider sm:tracking-widest">
                  <li><a href="https://linkedin.com/company/aws-sbg-at-svkm-iot-dhule" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#0a66c2] transition-colors"><Linkedin size={14} /> LinkedIn</a></li>
                  <li><a href="https://x.com/AWSCC_SVKMIOT" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors"><Twitter size={14} /> X / Twitter</a></li>
               </ul>
            </div>
         </div>
      </div>

      <div className="pt-6 sm:pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
         <span className="font-mono text-[9px] sm:text-[10px] text-gray-500 uppercase tracking-widest text-center md:text-left">© 2026 AWS Student Builder Group. All rights reserved.</span>
         <div className="flex text-[9px] sm:text-[10px] tracking-widest font-mono text-gray-500 uppercase space-x-4">
            <span className="text-[#00ff00]">STATUS: DEPLOYED</span>
         </div>
      </div>
    </footer>
  )
}
