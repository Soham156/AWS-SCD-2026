import { Link, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { ChevronRight, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { usePassTypes } from '../hooks/usePassTypes';
import { useRegistration } from '../hooks/useRegistration';
import { useSettings } from '../hooks/useSettings';
import { PassTypeSelector } from '../components/PassTypeSelector';
import { RegistrationForm } from '../components/RegistrationForm';
import { OrderSummary } from '../components/OrderSummary';
import { PaymentEmbed } from '../components/PaymentEmbed';
import { SuccessScreen } from '../components/SuccessScreen';

const stepLabels = ['Select Pass', 'Register', 'Summary', 'Payment', 'Confirmed'];

export function TicketsPurchasePage() {
  const { passes, loading: passesLoading } = usePassTypes();
  const { registrationEnabled, loading: settingsLoading } = useSettings();
  const reg = useRegistration();
  const [searchParams, setSearchParams] = useSearchParams();

  // Restore order if orderId is present in URL
  const hasOrder = !!reg.order;
  const regStep = reg.step;
  const regLoading = reg.loading;
  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const passId = searchParams.get('passId');

    if (orderId && !hasOrder && regStep === 1 && !regLoading && !passesLoading && passes.length > 0) {
      reg.restoreOrder(orderId);
    } else if (passId && !hasOrder && regStep === 1 && !regLoading && !passesLoading && passes.length > 0) {
      const pass = passes.find(p => p.id === passId);
      if (pass) {
        reg.selectPass(pass);
        // Clear passId so back button works properly
        setSearchParams((prev) => {
          prev.delete('passId');
          return prev;
        }, { replace: true });
      }
    }
  }, [searchParams, hasOrder, regStep, regLoading, passesLoading, passes, reg, setSearchParams]);

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-aws-orange" size={32} />
      </div>
    );
  }

  if (!registrationEnabled) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4">
        <AlertCircle size={48} className="text-f1-red mb-4" />
        <h1 className="font-sans font-black italic text-3xl sm:text-4xl uppercase tracking-tight mb-2 text-center">Registrations Closed</h1>
        <p className="text-white/50 font-mono text-sm mb-8 text-center max-w-md">
          Ticket registrations are currently paused or haven't opened yet. Please check back later.
        </p>
        <Link to="/" className="px-6 py-3 bg-white/10 hover:bg-white/20 transition-colors font-mono text-xs uppercase tracking-widest border border-white/20 text-white hover:text-white">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      {/* Navbar minimal */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors">
          <ArrowLeft size={14} />
          Back to Event
        </Link>
      </div>

      <div className="flex-1 flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-3xl bg-[#0d0d0d] border border-white/10 shadow-2xl relative">
          {/* Top accent */}
          <div className="h-1 bg-gradient-to-r from-f1-red via-aws-orange to-f1-red" />

          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white mb-1">
              Paddock Pass
            </h2>
            <p className="font-mono text-xs text-white/30 uppercase tracking-widest">
              AWS Student Community Day 2026
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-1 px-6 py-4 border-b border-white/5 overflow-x-auto">
            {stepLabels.map((label, i) => {
              const stepNum = (i + 1) as 1 | 2 | 3 | 4 | 5;
              const isActive = reg.step === stepNum;
              const isComplete = reg.step > stepNum;
              return (
                <div key={i} className="flex items-center">
                  <div className={`flex items-center gap-2 px-2 py-1 text-xs font-mono uppercase tracking-wider transition-colors ${
                    isActive ? 'text-aws-orange' :
                    isComplete ? 'text-emerald-400' :
                    'text-white/20'
                  }`}>
                    <span className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold border ${
                      isActive ? 'border-aws-orange text-aws-orange' :
                      isComplete ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' :
                      'border-white/10 text-white/20'
                    }`}>
                      {isComplete ? '✓' : stepNum}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < 4 && <ChevronRight size={14} className="text-white/10 mx-2" />}
                </div>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-4 sm:p-8 min-h-[400px]">
            {reg.step === 1 && (
              <PassTypeSelector
                passes={passes}
                loading={passesLoading}
                onSelect={reg.selectPass}
              />
            )}

            {reg.step === 2 && reg.selectedPass && (
              <div className="max-w-md mx-auto">
                <RegistrationForm
                  selectedPass={reg.selectedPass}
                  initialAttendees={reg.attendees}
                  verifiedEmail={reg.primaryEmail}
                  loading={reg.loading}
                  error={reg.error}
                  onSubmit={reg.submitAttendees}
                  onBack={reg.goBack}
                />
              </div>
            )}

            {reg.step === 3 && reg.selectedPass && reg.order && (
              <div className="max-w-md mx-auto">
                <OrderSummary
                  selectedPass={reg.selectedPass}
                  quantity={reg.order.quantity}
                  attendees={reg.attendees}
                  discountAmount={reg.order.discountAmount}
                  loading={reg.loading}
                  onApplyPromo={reg.applyPromo}
                  onRemovePromo={reg.removePromo}
                  onProceed={reg.proceedToPaymentStep}
                  onBack={reg.goBack}
                />
              </div>
            )}

            {reg.step === 4 && reg.selectedPass && (
              <div className="max-w-md mx-auto">
                <PaymentEmbed
                  selectedPass={reg.selectedPass}
                  loading={reg.loading}
                  error={reg.error}
                  onInitiatePayment={reg.initiatePayment}
                  onBack={reg.goBack}
                />
              </div>
            )}

            {reg.step === 5 && reg.selectedPass && reg.order && (
              <div className="max-w-md mx-auto">
                <SuccessScreen
                  ticketNumber={reg.order.order_id.split('-')[0]} // Simplified
                  ticketId={reg.order.order_id}
                  fullName={reg.primaryEmail || "Group Buyer"}
                  email={reg.primaryEmail}
                  selectedPass={reg.selectedPass}
                  qrToken={"GROUP"} // For groups, we say tickets are emailed
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
