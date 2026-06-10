import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../../lib/api';
import { TicketPass } from '../components/TicketPass';
import { Loader2, ArrowLeft } from 'lucide-react';

export function TicketPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/tickets/${id}`)
      .then((res) => {
        setTicket(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Ticket not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-aws-orange" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center">
        <p className="font-mono text-4xl font-bold text-white/20 mb-4">404</p>
        <p className="font-mono text-sm text-white/40 mb-6">Ticket not found</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-aws-orange text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </div>
    );
  }

  const passData = ticket.pass_types || {};

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center py-12 px-4">
      <div className="mb-8 text-center">
        <h1 className="font-sans font-black italic text-2xl uppercase tracking-tight text-white mb-1">
          Your Paddock Pass
        </h1>
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
          AWS Student Community Day Dhule 2026
        </p>
      </div>

      <TicketPass
        ticket_number={ticket.ticket_number}
        full_name={ticket.full_name}
        pass_name={passData.name || ticket.pass_slug}
        role={ticket.role}
        organization={ticket.organization}
        qr_token={ticket.qr_token}
        badge_color={passData.badge_color}
      />

      <Link
        to="/"
        className="mt-8 inline-flex items-center gap-2 text-white/30 text-xs font-mono uppercase tracking-widest hover:text-aws-orange transition-colors"
      >
        <ArrowLeft size={14} />
        Back to Home
      </Link>
    </div>
  );
}
