// import { useEffect } from 'react';
// import { motion, AnimatePresence } from 'motion/react';
// import { X, ChevronRight } from 'lucide-react';
// import { usePassTypes } from '../hooks/usePassTypes';
// import { useRegistration } from '../hooks/useRegistration';
// import { PassTypeSelector } from './PassTypeSelector';
// import { RegistrationForm } from './RegistrationForm';
// import { PaymentEmbed } from './PaymentEmbed';
// import { SuccessScreen } from './SuccessScreen';

// interface Props {
//   isOpen: boolean;
//   onClose: () => void;
// }

// const stepLabels = ['Select Pass', 'Register', 'Payment', 'Confirmed'];

// export function TicketModal({ isOpen, onClose }: Props) {
//   const { passes, loading: passesLoading } = usePassTypes();
//   const reg = useRegistration();

//   // Lock body scroll when modal is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = '';
//     }
//     return () => { document.body.style.overflow = ''; };
//   }, [isOpen]);

//   const handleClose = () => {
//     reg.reset();
//     onClose();
//   };

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           className="fixed inset-0 z-[100] flex items-center justify-center p-4"
//         >
//           {/* Backdrop */}
//           <div
//             className="absolute inset-0 bg-black/80 backdrop-blur-sm"
//             onClick={handleClose}
//           />

//           {/* Modal */}
//           <motion.div
//             initial={{ opacity: 0, y: 30, scale: 0.97 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 20, scale: 0.97 }}
//             transition={{ duration: 0.3 }}
//             className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0d0d0d] border border-white/10 shadow-2xl"
//           >
//             {/* Top accent */}
//             <div className="h-1 bg-gradient-to-r from-f1-red via-aws-orange to-f1-red" />

//             {/* Header */}
//             <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
//               <div>
//                 <h2 className="font-sans font-black italic text-lg uppercase tracking-tight text-white">
//                   Paddock Pass
//                 </h2>
//                 <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
//                   AWS Student Community Day 2026
//                 </p>
//               </div>
//               <button
//                 onClick={handleClose}
//                 className="p-2 text-white/30 hover:text-white transition-colors"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             {/* Step indicator */}
//             <div className="flex items-center gap-1 px-6 py-3 border-b border-white/5 overflow-x-auto">
//               {stepLabels.map((label, i) => {
//                 const stepNum = (i + 1) as 1 | 2 | 3 | 4;
//                 const isActive = reg.step === stepNum;
//                 const isComplete = reg.step > stepNum;
//                 return (
//                   <div key={i} className="flex items-center">
//                     <div className={`flex items-center gap-1.5 px-2 py-1 text-[10px] font-mono uppercase tracking-wider transition-colors ${
//                       isActive ? 'text-aws-orange' :
//                       isComplete ? 'text-emerald-400' :
//                       'text-white/20'
//                     }`}>
//                       <span className={`w-5 h-5 flex items-center justify-center text-[9px] font-bold border ${
//                         isActive ? 'border-aws-orange text-aws-orange' :
//                         isComplete ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' :
//                         'border-white/10 text-white/20'
//                       }`}>
//                         {isComplete ? '✓' : stepNum}
//                       </span>
//                       <span className="hidden sm:inline">{label}</span>
//                     </div>
//                     {i < 3 && <ChevronRight size={12} className="text-white/10 mx-1" />}
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Content */}
//             <div className="p-6">
//               {reg.step === 1 && (
//                 <PassTypeSelector
//                   passes={passes}
//                   loading={passesLoading}
//                   onSelect={reg.selectPass}
//                 />
//               )}

//               {reg.step === 2 && reg.selectedPass && (
//                 <RegistrationForm
//                   selectedPass={reg.selectedPass}
//                   loading={reg.loading}
//                   error={reg.error}
//                   onSubmit={reg.submitForm}
//                   onBack={reg.goBack}
//                 />
//               )}

//               {reg.step === 3 && reg.selectedPass && (
//                 <PaymentEmbed
//                   selectedPass={reg.selectedPass}
//                   loading={reg.loading}
//                   error={reg.error}
//                   onInitiatePayment={reg.initiatePayment}
//                   onBack={reg.goBack}
//                 />
//               )}

//               {reg.step === 4 && reg.selectedPass && reg.ticketResult && (
//                 <SuccessScreen
//                   ticketNumber={reg.ticketResult.ticket_number}
//                   ticketId={reg.ticketResult.ticket_id}
//                   fullName={reg.formData.full_name}
//                   email={reg.formData.email}
//                   selectedPass={reg.selectedPass}
//                 />
//               )}
//             </div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// }
