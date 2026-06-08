import { useRef, useCallback } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

interface Props {
  ticket_number: string;
  full_name: string;
  pass_name: string;
  role: string;
  organization: string;
  qr_token: string;
  badge_color?: string;
}

export function TicketPass({ ticket_number, full_name, pass_name, role, organization, qr_token, badge_color = '#6B7280' }: Props) {
  const passRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!passRef.current) return;
    try {
      const canvas = await html2canvas(passRef.current, {
        backgroundColor: '#050505',
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `${ticket_number}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [ticket_number]);

  return (
    <div className="flex flex-col items-center">
      <div
        ref={passRef}
        className="w-[340px] bg-[#0a0a0a] border border-white/10 overflow-hidden"
      >
        {/* Header bar */}
        <div className="h-2" style={{ background: `linear-gradient(90deg, ${badge_color}, #FF9900)` }} />

        <div className="p-6">
          {/* Event branding */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="font-mono text-[9px] tracking-widest uppercase text-white/40">
                AWS Student Community Day
              </p>
              <p className="font-mono text-[9px] tracking-wider text-white/30">
                Dhule 2026
              </p>
            </div>
            <div
              className="px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider text-white"
              style={{ backgroundColor: badge_color }}
            >
              {pass_name}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-dashed border-white/10 mb-5" />

          {/* Attendee info */}
          <div className="mb-5">
            <p className="font-sans font-black italic text-xl uppercase tracking-tight text-white mb-1">
              {full_name}
            </p>
            {organization && (
              <p className="font-mono text-[10px] text-white/40">{organization}</p>
            )}
            {role && (
              <p className="font-mono text-[10px] text-aws-orange uppercase tracking-widest mt-1">
                {role}
              </p>
            )}
          </div>

          {/* QR Code */}
          <div className="flex justify-center mb-5 p-4 bg-white">
            {qr_token ? (
              <QRCodeCanvas value={qr_token} size={200} level="H" />
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 border border-gray-300">
                <p className="font-mono text-xs text-gray-400 text-center uppercase tracking-widest px-4">
                  QR Code pending payment confirmation
                </p>
              </div>
            )}
          </div>

          {/* Ticket number */}
          <div className="text-center">
            <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest mb-1">
              Ticket
            </p>
            <p className="font-mono text-lg font-bold text-white tracking-wider">
              {ticket_number || 'PENDING CONFIRMATION'}
            </p>
          </div>

          {/* Footer */}
          <div className="border-t border-dashed border-white/10 mt-5 pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-mono text-[8px] text-white/30">14 August 2026</p>
                <p className="font-mono text-[8px] text-white/30">SVKM's IoT, Dhule</p>
              </div>
              <p className="font-mono text-[8px] text-white/20">Show QR at gate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={handleDownload}
        className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-white/20 text-white/60 text-xs font-mono uppercase tracking-widest hover:bg-white/5 transition-colors"
      >
        <Download size={12} />
        Download Pass
      </button>
    </div>
  );
}
