import { useState, useEffect } from 'react';
import { adminApi } from '../services/adminApi';

export const SponsorsTable = () => {
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
                  {s.status === 'PENDING' && (
                    <>
                      <button onClick={() => handleUpdateStatus(s.id, 'APPROVED')} className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] hover:bg-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors">Approve</button>
                      <button onClick={() => handleUpdateStatus(s.id, 'REJECTED')} className="px-3 py-1 bg-[#E10600]/10 text-[#E10600] hover:bg-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors">Reject</button>
                    </>
                  )}
                  {s.status !== 'PENDING' && (
                    <button onClick={() => handleUpdateStatus(s.id, 'PENDING')} className="px-3 py-1 bg-white/10 text-white/70 hover:bg-white/20 text-xs font-mono uppercase tracking-widest transition-colors">Reset</button>
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
  );
};
