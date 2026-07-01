import { useState, useEffect } from 'react';
import { X, Mail, Phone, Users, MapPin, Linkedin, Link as LinkIcon } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const PartnersTable = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data } = await adminApi.getPartners();
      if (Array.isArray(data)) {
        setPartners(data);
      } else {
        console.error('Failed to fetch partners:', data);
        setPartners([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateApplicationStatus('partner', id, status);
      fetchPartners();
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
            <th className="p-4 font-normal">Community</th>
            <th className="p-4 font-normal">Contact</th>
            <th className="p-4 font-normal">Location & Size</th>
            <th className="p-4 font-normal">Status</th>
            <th className="p-4 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm font-sans divide-y divide-white/5">
          {partners.map(p => (
            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="p-4 align-top">
                <div className="font-bold text-blue-400 mb-1">{p.community_name}</div>
                <div className="text-white/60 text-xs">{p.community_type}</div>
                <a href={p.website_url} target="_blank" rel="noreferrer" className="text-white/30 text-[10px] hover:text-white underline mt-1 inline-block">Website</a>
              </td>
              <td className="p-4 align-top">
                <div className="font-bold text-white mb-1">{p.organizer_name}</div>
                <div className="text-white/60 text-xs">{p.organizer_email}</div>
                <div className="text-white/40 text-xs mt-1">{p.organizer_phone}</div>
              </td>
              <td className="p-4 align-top">
                <div className="text-white mb-1">{p.city}</div>
                <div className="text-white/60 text-xs">{p.member_size} members</div>
              </td>
              <td className="p-4 align-top">
                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                  p.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                  p.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                  'bg-white/10 text-white/70'
                }`}>
                  {p.status}
                </span>
                <div className="text-white/30 text-[10px] font-mono mt-2">
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </td>
              <td className="p-4 align-top">
                <div className="flex flex-col gap-2">
                  <button 
                    type="button" 
                    onClick={() => setSelectedPartner(p)} 
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-widest transition-colors"
                  >
                    View Info
                  </button>
                  {p.status === 'PENDING' && (
                    <>
                      <button type="button" onClick={() => handleUpdateStatus(p.id, 'APPROVED')} className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] hover:bg-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors">Approve</button>
                      <button type="button" onClick={() => handleUpdateStatus(p.id, 'REJECTED')} className="px-3 py-1 bg-[#E10600]/10 text-[#E10600] hover:bg-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors">Reject</button>
                    </>
                  )}
                  {p.status !== 'PENDING' && (
                    <button type="button" onClick={() => handleUpdateStatus(p.id, 'PENDING')} className="px-3 py-1 bg-white/5 text-white/50 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-colors">Reset</button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {partners.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-white/30 font-mono text-sm uppercase tracking-widest">
                No partner applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
    {/* Detailed Info Modal */}
    {selectedPartner && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div data-lenis-prevent className="bg-[#0c0c0c] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative text-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-[#0c0c0c]/90 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-blue-400">Partner Application Details</span>
              <h3 className="text-xl font-bold italic uppercase tracking-tight text-white mt-1">{selectedPartner.community_name}</h3>
            </div>
            <button 
              onClick={() => setSelectedPartner(null)} 
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
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Community Type</div>
                <div className="text-sm font-medium mt-1">{selectedPartner.community_type}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Member Size</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Users size={14} className="text-white/40" />
                  <span>{selectedPartner.member_size} members</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Organizer Name</div>
                <div className="text-sm font-medium mt-1">{selectedPartner.organizer_name}</div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Organizer Contact</div>
                <div className="text-sm font-medium mt-1 flex flex-col gap-1">
                  <span className="flex items-center gap-2">
                    <Mail size={14} className="text-white/40" />
                    <a href={`mailto:${selectedPartner.organizer_email}`} className="hover:text-blue-400 hover:underline">{selectedPartner.organizer_email}</a>
                  </span>
                  {selectedPartner.organizer_phone && (
                    <span className="flex items-center gap-2">
                      <Phone size={14} className="text-white/40" />
                      <span>{selectedPartner.organizer_phone}</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">City</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <MapPin size={14} className="text-white/40" />
                  <span>{selectedPartner.city}</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6 text-sm">
              {selectedPartner.website_url && (
                <a 
                  href={selectedPartner.website_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded transition-all"
                >
                  <LinkIcon size={14} />
                  Community Website
                </a>
              )}
              {selectedPartner.linkedin_url && (
                <a 
                  href={selectedPartner.linkedin_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded transition-all"
                >
                  <Linkedin size={14} />
                  Organizer LinkedIn
                </a>
              )}
            </div>

            {/* Expectations */}
            <div className="border-b border-white/5 pb-6">
              <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Expectations & Description</div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedPartner.expectations}</p>
            </div>

            {/* Status Info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Current Status:</div>
                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                  selectedPartner.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                  selectedPartner.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                  'bg-white/10 text-white/70'
                }`}>
                  {selectedPartner.status}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedPartner.status !== 'APPROVED' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedPartner.id, 'APPROVED'); setSelectedPartner(prev => prev ? { ...prev, status: 'APPROVED' } : null); }} 
                    className="px-4 py-2 bg-[#00ff00]/15 hover:bg-[#00ff00]/25 text-[#00ff00] border border-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Approve
                  </button>
                )}
                {selectedPartner.status !== 'REJECTED' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedPartner.id, 'REJECTED'); setSelectedPartner(prev => prev ? { ...prev, status: 'REJECTED' } : null); }} 
                    className="px-4 py-2 bg-[#E10600]/15 hover:bg-[#E10600]/25 text-[#E10600] border border-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Reject
                  </button>
                )}
                {selectedPartner.status !== 'PENDING' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedPartner.id, 'PENDING'); setSelectedPartner(prev => prev ? { ...prev, status: 'PENDING' } : null); }} 
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
