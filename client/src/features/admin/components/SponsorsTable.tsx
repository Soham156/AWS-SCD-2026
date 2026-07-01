import { useState, useEffect } from 'react';
import { X, Mail, Building2, User, Award } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const SponsorsTable = () => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSponsor, setSelectedSponsor] = useState<any | null>(null);

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      const { data } = await adminApi.getSponsors();
      if (Array.isArray(data)) {
        setSponsors(data);
      } else {
        console.error('Failed to fetch sponsors:', data);
        setSponsors([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateApplicationStatus('sponsor', id, status);
      fetchSponsors();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-white/50 font-mono text-sm">Loading...</div>;

  return (
    <>
      <div className="bg-[#111] border border-white/5 overflow-x-auto">
        <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-widest text-white/50">
            <th className="p-4 font-normal">Company & Contact</th>
            <th className="p-4 font-normal">Sponsorship Tier</th>
            <th className="p-4 font-normal">Details</th>
            <th className="p-4 font-normal">Status</th>
            <th className="p-4 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm font-sans divide-y divide-white/5">
          {sponsors.map(s => (
            <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="p-4 align-top w-1/4">
                <div className="font-bold text-white mb-1">{s.company}</div>
                <div className="text-white/60 text-xs mb-1">{s.contact}</div>
                <div className="text-white/40 text-xs break-all">{s.email}</div>
              </td>
              <td className="p-4 align-top w-1/4">
                <div className="font-bold text-aws-orange mb-1">{s.tier}</div>
              </td>
              <td className="p-4 align-top w-1/4">
                <div className="text-white/60 text-xs leading-relaxed max-w-sm">
                  {s.details || <span className="italic text-white/30">No details provided</span>}
                </div>
              </td>
              <td className="p-4 align-top w-1/4">
                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                  s.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                  s.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                  'bg-white/10 text-white/70'
                }`}>
                  {s.status}
                </span>
                <div className="text-white/30 text-[10px] font-mono mt-2">
                  {new Date(s.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="p-4 align-top">
                <div className="flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedSponsor(s)} 
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-widest transition-colors"
                  >
                    View Info
                  </button>
                  {s.status === 'PENDING' && (
                    <>
                      <button type="button" onClick={() => handleUpdateStatus(s.id, 'APPROVED')} className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] hover:bg-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors">Approve</button>
                      <button type="button" onClick={() => handleUpdateStatus(s.id, 'REJECTED')} className="px-3 py-1 bg-[#E10600]/10 text-[#E10600] hover:bg-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors">Reject</button>
                    </>
                  )}
                  {s.status !== 'PENDING' && (
                    <button type="button" onClick={() => handleUpdateStatus(s.id, 'PENDING')} className="px-3 py-1 bg-white/5 text-white/50 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-colors">Reset</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {sponsors.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-white/30 font-mono text-sm uppercase tracking-widest">
                No sponsor applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
    {/* Detailed Info Modal */}
    {selectedSponsor && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div data-lenis-prevent className="bg-[#0c0c0c] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative text-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-[#0c0c0c]/90 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-aws-orange">Sponsor Application Details</span>
              <h3 className="text-xl font-bold italic uppercase tracking-tight text-white mt-1">{selectedSponsor.company}</h3>
            </div>
            <button 
              onClick={() => setSelectedSponsor(null)} 
              className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/5 rounded"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-white/5 pb-6">
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Company Name</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Building2 size={14} className="text-white/40" />
                  <span>{selectedSponsor.company}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Sponsorship Tier</div>
                <div className="text-sm font-bold mt-1 text-aws-orange flex items-center gap-2">
                  <Award size={14} className="text-aws-orange" />
                  <span>{selectedSponsor.tier}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Contact Person</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <User size={14} className="text-white/40" />
                  <span>{selectedSponsor.contact}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Email Address</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Mail size={14} className="text-white/40" />
                  <a href={`mailto:${selectedSponsor.email}`} className="hover:text-aws-orange hover:underline">{selectedSponsor.email}</a>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="border-b border-white/5 pb-6">
              <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Proposal Details & Message</div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedSponsor.details || <span className="italic text-white/30">No details provided</span>}</p>
            </div>

            {/* Status Info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Current Status:</div>
                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                  selectedSponsor.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                  selectedSponsor.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                  'bg-white/10 text-white/70'
                }`}>
                  {selectedSponsor.status}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedSponsor.status !== 'APPROVED' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedSponsor.id, 'APPROVED'); setSelectedSponsor(prev => prev ? { ...prev, status: 'APPROVED' } : null); }} 
                    className="px-4 py-2 bg-[#00ff00]/15 hover:bg-[#00ff00]/25 text-[#00ff00] border border-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Approve
                  </button>
                )}
                {selectedSponsor.status !== 'REJECTED' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedSponsor.id, 'REJECTED'); setSelectedSponsor(prev => prev ? { ...prev, status: 'REJECTED' } : null); }} 
                    className="px-4 py-2 bg-[#E10600]/15 hover:bg-[#E10600]/25 text-[#E10600] border border-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Reject
                  </button>
                )}
                {selectedSponsor.status !== 'PENDING' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedSponsor.id, 'PENDING'); setSelectedSponsor(prev => prev ? { ...prev, status: 'PENDING' } : null); }} 
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white/80 border border-white/10 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Reset to Pending
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
