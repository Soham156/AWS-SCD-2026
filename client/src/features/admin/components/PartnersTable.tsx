import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

export const PartnersTable = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                  {p.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus(p.id, 'APPROVED')} className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] hover:bg-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors">Approve</button>
                      <button onClick={() => handleUpdateStatus(p.id, 'REJECTED')} className="px-3 py-1 bg-[#E10600]/10 text-[#E10600] hover:bg-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors">Reject</button>
                    </>
                  )}
                  {p.status !== 'PENDING' && (
                    <button onClick={() => handleUpdateStatus(p.id, 'PENDING')} className="px-3 py-1 bg-white/10 text-white/70 hover:bg-white/20 text-xs font-mono uppercase tracking-widest transition-colors">Reset</button>
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
  );
};
