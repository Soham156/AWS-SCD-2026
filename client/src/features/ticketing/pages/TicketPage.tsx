import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { LanyardBadge } from '../components/LanyardBadge';
import { TicketPass } from '../components/TicketPass';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

export function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!id) return;

    let isMounted = true;
    let pollTimeout: any;
    let attempts = 0;

    const fetchTicket = async () => {
      try {
        const res = await api.get(`/api/tickets/${id}`);
        if (!isMounted) return;

        if (res.data.payment_status === 'PAID') {
          setTicket(res.data);
          setLoading(false);
        } else if (res.data.payment_status === 'FAILED') {
          setError('Payment Failed. Please try registering again.');
          setLoading(false);
        } else {
          // If status is PENDING or INITIATED, poll
          attempts++;
          if (attempts > 60) {
            setError('Payment verification timed out. Please check your email later or try refreshing.');
            setLoading(false);
          } else {
            pollTimeout = setTimeout(fetchTicket, 2000);
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Ticket not found');
        setLoading(false);
      }
    };

    fetchTicket();

    return () => {
      isMounted = false;
      if (pollTimeout) clearTimeout(pollTimeout);
    };
  }, [id]);

  const handleDownload = useCallback(async () => {
    if (!downloadRef.current) return;
    try {
      const dataUrl = await toPng(downloadRef.current, {
        backgroundColor: '#050505',
        pixelRatio: 2,
      });

      const width = downloadRef.current.offsetWidth;
      const height = downloadRef.current.offsetHeight;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [width, height],
      });
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
      pdf.save(`${ticket?.ticket_number || 'ticket'}.pdf`);
    } catch (err) {
      console.error('Download failed:', err);
    }
  }, [ticket]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <Loader2 size={32} className="animate-spin text-aws-orange mb-4" />
        <p className="font-mono text-sm text-white/50 tracking-widest uppercase">
          Loading Pass...
        </p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center">
        <p className="font-mono text-4xl font-bold text-white/20 mb-4">404</p>
        <p className="font-mono text-sm text-white/40 mb-6">{error || 'Ticket not found'}</p>
        <div className="flex gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-aws-orange text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          {error?.includes('timed out') && (
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-widest hover:text-white transition-colors cursor-pointer"
            >
              Refresh Status
            </button>
          )}
        </div>
      </div>
    );
  }

  const passData = ticket.pass_types || {};

  return (
    <div className="min-h-screen bg-[#050505] relative">
      {/* 3D Lanyard Badge — full viewport */}
      <LanyardBadge
        ticket_number={ticket.ticket_number}
        full_name={ticket.full_name}
        pass_name={passData.name || ticket.pass_slug}
        role={ticket.role}
        organization={ticket.organization}
        badge_color={passData.badge_color}
        qr_token={ticket.qr_token}
      />

      {/* Top-left nav */}
      <div className="fixed top-6 left-6 z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/30 text-xs font-mono uppercase tracking-widest hover:text-aws-orange transition-colors backdrop-blur-sm bg-black/30 px-3 py-2 border border-white/10"
        >
          <ArrowLeft size={14} />
          Home
        </Link>
      </div>

      {/* Top-right download */}
      <div className="fixed top-6 right-6 z-10">
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-2 bg-aws-orange text-black font-bold text-xs font-mono uppercase tracking-widest hover:bg-white hover:text-black transition-colors px-4 py-2 border border-aws-orange shadow-[0_0_15px_rgba(255,153,0,0.4)] cursor-pointer"
        >
          <Download size={14} />
          Download Pass
        </button>
      </div>

      {/* Hidden TicketPass for download capture */}
      <div className="fixed -left-[9999px] -top-[9999px]" aria-hidden="true">
        <div ref={downloadRef}>
          <TicketPass
            ticket_number={ticket.ticket_number}
            full_name={ticket.full_name}
            pass_name={passData.name || ticket.pass_slug}
            role={ticket.role}
            organization={ticket.organization}
            qr_token={ticket.qr_token}
            badge_color={passData.badge_color}
          />
        </div>
      </div>
    </div>
  );
}
