import { useState, useEffect } from 'react';
import { X, Mail, Phone, Briefcase, MapPin, Linkedin, Link as LinkIcon } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const SpeakersTable = () => {
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpeaker, setSelectedSpeaker] = useState<any | null>(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const { data } = await adminApi.getSpeakers();
      if (Array.isArray(data)) {
        setSpeakers(data);
      } else {
        console.error('Failed to fetch speakers:', data);
        setSpeakers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateApplicationStatus('speaker', id, status);
      fetchSpeakers();
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
            <th className="p-4 font-normal">Name & Contact</th>
            <th className="p-4 font-normal">Title & Category</th>
            <th className="p-4 font-normal">Level & Duration</th>
            <th className="p-4 font-normal">Status</th>
            <th className="p-4 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm font-sans divide-y divide-white/5">
          {speakers.map(s => (
            <tr key={s.id} className="hover:bg-white/[0.02] transition-colors">
              <td className="p-4 align-top">
                <div className="font-bold text-white mb-1">{s.full_name}</div>
                <div className="text-white/60 text-xs">{s.email}</div>
                <div className="text-white/40 text-xs mt-1">{s.organization}</div>
              </td>
              <td className="p-4 align-top">
                <div className="font-bold text-aws-orange mb-1">{s.session_title}</div>
                <div className="text-white/60 text-xs">{s.category}</div>
              </td>
              <td className="p-4 align-top">
                <div className="text-white mb-1">{s.session_level}</div>
                <div className="text-white/60 text-xs">{s.duration}</div>
              </td>
              <td className="p-4 align-top">
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
                    onClick={() => setSelectedSpeaker(s)} 
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
          {speakers.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-white/30 font-mono text-sm uppercase tracking-widest">
                No speaker applications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    
    {/* Detailed Info Modal */}
    {selectedSpeaker && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div data-lenis-prevent className="bg-[#0c0c0c] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col relative text-white rounded-lg shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-[#0c0c0c]/90 backdrop-blur-md px-6 py-4 border-b border-white/5 flex items-center justify-between z-10">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-aws-orange">Speaker Application Details</span>
              <h3 className="text-xl font-bold italic uppercase tracking-tight text-white mt-1">{selectedSpeaker.full_name}</h3>
            </div>
            <button 
              onClick={() => setSelectedSpeaker(null)} 
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
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Email Address</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Mail size={14} className="text-white/40" />
                  <a href={`mailto:${selectedSpeaker.email}`} className="hover:text-aws-orange hover:underline">{selectedSpeaker.email}</a>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Phone Number</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Phone size={14} className="text-white/40" />
                  <span>{selectedSpeaker.phone}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Organization & Role</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <Briefcase size={14} className="text-white/40" />
                  <span>{selectedSpeaker.designation} at {selectedSpeaker.organization}</span>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">City</div>
                <div className="text-sm font-medium mt-1 flex items-center gap-2">
                  <MapPin size={14} className="text-white/40" />
                  <span>{selectedSpeaker.city}</span>
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6 text-sm">
              {selectedSpeaker.linkedin_url && (
                <a 
                  href={selectedSpeaker.linkedin_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded transition-all"
                >
                  <Linkedin size={14} />
                  LinkedIn Profile
                </a>
              )}
              {selectedSpeaker.portfolio_url && (
                <a 
                  href={selectedSpeaker.portfolio_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded transition-all"
                >
                  <LinkIcon size={14} />
                  Portfolio / Website
                </a>
              )}
            </div>

            {/* Bio */}
            <div className="border-b border-white/5 pb-6">
              <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Biography</div>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedSpeaker.bio}</p>
            </div>

            {/* Session Info */}
            <div className="border-b border-white/5 pb-6 space-y-4">
              <div className="text-[10px] font-mono uppercase text-aws-orange tracking-[0.15em]">Proposed Session Info</div>
              
              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Session Title</div>
                <div className="text-base font-bold italic uppercase tracking-tight text-white mt-1">{selectedSpeaker.session_title}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Category</div>
                  <div className="text-sm font-medium mt-1">{selectedSpeaker.category}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Session Level</div>
                  <div className="text-sm font-medium mt-1">{selectedSpeaker.session_level}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Duration</div>
                  <div className="text-sm font-medium mt-1">{selectedSpeaker.duration}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Session Abstract</div>
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{selectedSpeaker.session_abstract}</p>
              </div>
            </div>

            {/* Additional Details */}
            {(selectedSpeaker.previous_experience || selectedSpeaker.notes) && (
              <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Additional Context</div>
                {selectedSpeaker.previous_experience && (
                  <div>
                    <div className="text-[10px] font-mono uppercase text-white/30">Previous Speaking Experience</div>
                    <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{selectedSpeaker.previous_experience}</p>
                  </div>
                )}
                {selectedSpeaker.notes && (
                  <div>
                    <div className="text-[10px] font-mono uppercase text-white/30">Organizer Notes</div>
                    <p className="text-sm text-white/70 mt-1 whitespace-pre-wrap">{selectedSpeaker.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Status Info */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Current Status:</div>
                <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                  selectedSpeaker.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                  selectedSpeaker.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                  'bg-white/10 text-white/70'
                }`}>
                  {selectedSpeaker.status}
                </span>
              </div>

              <div className="flex gap-2">
                {selectedSpeaker.status !== 'APPROVED' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedSpeaker.id, 'APPROVED'); setSelectedSpeaker(prev => prev ? { ...prev, status: 'APPROVED' } : null); }} 
                    className="px-4 py-2 bg-[#00ff00]/15 hover:bg-[#00ff00]/25 text-[#00ff00] border border-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Approve
                  </button>
                )}
                {selectedSpeaker.status !== 'REJECTED' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedSpeaker.id, 'REJECTED'); setSelectedSpeaker(prev => prev ? { ...prev, status: 'REJECTED' } : null); }} 
                    className="px-4 py-2 bg-[#E10600]/15 hover:bg-[#E10600]/25 text-[#E10600] border border-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors rounded-sm"
                  >
                    Reject
                  </button>
                )}
                {selectedSpeaker.status !== 'PENDING' && (
                  <button 
                    type="button" 
                    onClick={() => { handleUpdateStatus(selectedSpeaker.id, 'PENDING'); setSelectedSpeaker(prev => prev ? { ...prev, status: 'PENDING' } : null); }} 
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
