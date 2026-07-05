import { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Calendar } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export const VolunteersTable = () => {
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const { data } = await adminApi.getVolunteers();
      if (Array.isArray(data)) {
        setVolunteers(data);
      } else {
        console.error('Failed to fetch volunteers:', data);
        setVolunteers([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateApplicationStatus('volunteer', id, status);
      fetchVolunteers();
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
              <th className="p-4 font-normal">Volunteer Name</th>
              <th className="p-4 font-normal">Contact Info</th>
              <th className="p-4 font-normal">Submission Date</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-white/5">
            {volunteers.map(v => (
              <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 align-top w-1/4">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <User size={14} className="text-aws-orange" />
                    {v.full_name}
                  </div>
                </td>
                <td className="p-4 align-top w-1/4">
                  <div className="text-white/60 text-xs flex items-center gap-1.5 mb-1.5">
                    <Mail size={12} className="text-white/30" />
                    {v.email}
                  </div>
                  <div className="text-white/40 text-xs flex items-center gap-1.5">
                    <Phone size={12} className="text-white/30" />
                    {v.phone}
                  </div>
                </td>
                <td className="p-4 align-top w-1/4">
                  <div className="text-white/60 text-xs flex items-center gap-1.5">
                    <Calendar size={12} className="text-white/30" />
                    {new Date(v.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="p-4 align-top w-1/8">
                  <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                    v.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                    v.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {v.status}
                  </span>
                </td>
                <td className="p-4 align-top">
                  <div className="flex flex-col gap-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedVolunteer(v)} 
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-widest transition-colors"
                    >
                      View Info
                    </button>
                    {v.status === 'PENDING' && (
                      <>
                        <button type="button" onClick={() => handleUpdateStatus(v.id, 'APPROVED')} className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] hover:bg-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors">Approve</button>
                        <button type="button" onClick={() => handleUpdateStatus(v.id, 'REJECTED')} className="px-3 py-1 bg-[#E10600]/10 text-[#E10600] hover:bg-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors">Reject</button>
                      </>
                    )}
                    {v.status !== 'PENDING' && (
                      <button type="button" onClick={() => handleUpdateStatus(v.id, 'PENDING')} className="px-3 py-1 bg-white/5 text-white/50 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-colors">Reset</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {volunteers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/30 font-mono text-xs">
                  No volunteer applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/10 max-w-lg w-full p-6 relative">
            <button 
              type="button" 
              onClick={() => setSelectedVolunteer(null)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-6">
              Volunteer Details
            </h3>

            <div className="space-y-4 text-sm font-sans">
              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Full Name</label>
                <div className="text-white font-bold text-base">{selectedVolunteer.full_name}</div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Email Address</label>
                <div className="text-white">{selectedVolunteer.email}</div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Phone Number</label>
                <div className="text-white">{selectedVolunteer.phone}</div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Submission Date</label>
                <div className="text-white">{new Date(selectedVolunteer.created_at).toLocaleString()}</div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Current Status</label>
                <span className={`inline-block mt-1 px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                  selectedVolunteer.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                  selectedVolunteer.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                  'bg-white/10 text-white/70'
                }`}>
                  {selectedVolunteer.status}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setSelectedVolunteer(null)} 
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase tracking-widest transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
