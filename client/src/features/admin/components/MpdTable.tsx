import { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Calendar, Search, Users, CheckCircle2, Clock, AlertTriangle, Mic } from 'lucide-react';
import { motion } from 'motion/react';
import { adminApi } from '../services/adminApi';

export const MpdTable = () => {
  const [mpds, setMpds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMpd, setSelectedMpd] = useState<any | null>(null);

  // Filter and Sort states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchMpds();
  }, []);

  const fetchMpds = async () => {
    try {
      const { data } = await adminApi.getMpds();
      if (Array.isArray(data)) {
        setMpds(data);
      } else {
        console.error('Failed to fetch mpds:', data);
        setMpds([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await adminApi.updateApplicationStatus('mpd', id, status);
      fetchMpds();
    } catch (err) {
      console.error(err);
    }
  };

  // Stats derived from the original unfiltered list
  const totalCount = mpds.length;
  const approvedCount = mpds.filter(m => m.status === 'APPROVED').length;
  const pendingCount = mpds.filter(m => m.status === 'PENDING').length;
  const rejectedCount = mpds.filter(m => m.status === 'REJECTED').length;

  const stats = [
    { label: 'Total Applications', value: totalCount, icon: Users, color: 'text-aws-orange', bg: 'bg-[#FF9900]/5' },
    { label: 'Accepted', value: approvedCount, icon: CheckCircle2, color: 'text-[#00ff00]', bg: 'bg-[#00ff00]/5' },
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/5' },
    { label: 'Rejected', value: rejectedCount, icon: AlertTriangle, color: 'text-[#E10600]', bg: 'bg-[#E10600]/5' }
  ];

  // Processed list (filtered & sorted)
  const processedMpds = mpds
    .filter(m => {
      // Status Filter
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;

      // Search Filter
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          (m.full_name || '').toLowerCase().includes(query) ||
          (m.email || '').toLowerCase().includes(query) ||
          (m.phone || '').toLowerCase().includes(query) ||
          (m.college || '').toLowerCase().includes(query) ||
          (m.branch || '').toLowerCase().includes(query) ||
          (m.degree || '').toLowerCase().includes(query) ||
          (m.english_fluency || '').toLowerCase().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'name_asc') {
        return (a.full_name || '').localeCompare(b.full_name || '');
      }
      if (sortBy === 'name_desc') {
        return (b.full_name || '').localeCompare(a.full_name || '');
      }
      if (sortBy === 'college_asc') {
        return (a.college || '').localeCompare(b.college || '');
      }
      return 0;
    });

  if (loading) return <div className="text-white/50 font-mono text-sm">Loading...</div>;

  return (
    <>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`border border-white/5 p-5 ${stat.bg}`}
          >
            <div className="flex items-center gap-2 mb-3">
              <stat.icon size={14} className={stat.color} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                {stat.label}
              </span>
            </div>
            <p className={`font-sans font-black italic text-2xl ${stat.color}`}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, college, fluency..."
            className="w-full bg-[#0a0a0a] border border-white/10 pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-white/20 focus:border-aws-orange focus:outline-none"
          />
        </div>
        
        {/* Filter by Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none"
        >
          <option value="date_desc">Submission: Newest First</option>
          <option value="date_asc">Submission: Oldest First</option>
          <option value="name_asc">Name: A-Z</option>
          <option value="name_desc">Name: Z-A</option>
          <option value="college_asc">College: A-Z</option>
        </select>
      </div>

      {/* MPD List Table */}
      <div className="bg-[#111] border border-white/5 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-xs font-mono uppercase tracking-widest text-white/50">
              <th className="p-4 font-normal">Candidate Name</th>
              <th className="p-4 font-normal">Contact Info</th>
              <th className="p-4 font-normal">College & Branch</th>
              <th className="p-4 font-normal">Fluency</th>
              <th className="p-4 font-normal">Submission Date</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm font-sans divide-y divide-white/5">
            {processedMpds.map(m => (
              <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 align-top w-1/5">
                  <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                    <User size={14} className="text-aws-orange" />
                    {m.full_name}
                  </div>
                </td>
                <td className="p-4 align-top w-1/5">
                  <div className="text-white/60 text-xs flex items-center gap-1.5 mb-1.5">
                    <Mail size={12} className="text-white/30" />
                    {m.email}
                  </div>
                  <div className="text-white/40 text-xs flex items-center gap-1.5">
                    <Phone size={12} className="text-white/30" />
                    {m.phone}
                  </div>
                </td>
                <td className="p-4 align-top w-1/5">
                  <div className="text-white font-semibold mb-1 text-xs">{m.college}</div>
                  <div className="text-white/50 text-[11px]">{m.branch} ({m.degree}, {m.year})</div>
                </td>
                <td className="p-4 align-top w-1/6">
                  <div className="text-white text-xs mb-1 flex items-center gap-1">
                    <Mic size={12} className="text-white/40" />
                    {m.english_fluency}
                  </div>
                </td>
                <td className="p-4 align-top w-1/6">
                  <div className="text-white/60 text-xs flex items-center gap-1.5">
                    <Calendar size={12} className="text-white/30" />
                    {new Date(m.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4 align-top w-1/8">
                  <span className={`px-2 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm ${
                    m.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                    m.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {m.status}
                  </span>
                </td>
                <td className="p-4 align-top">
                  <div className="flex flex-col gap-2">
                    <button 
                      type="button" 
                      onClick={() => setSelectedMpd(m)} 
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-mono uppercase tracking-widest transition-colors"
                    >
                      View Info
                    </button>
                    {m.status === 'PENDING' && (
                      <>
                        <button type="button" onClick={() => handleUpdateStatus(m.id, 'APPROVED')} className="px-3 py-1 bg-[#00ff00]/10 text-[#00ff00] hover:bg-[#00ff00]/20 text-xs font-mono uppercase tracking-widest transition-colors">Approve</button>
                        <button type="button" onClick={() => handleUpdateStatus(m.id, 'REJECTED')} className="px-3 py-1 bg-[#E10600]/10 text-[#E10600] hover:bg-[#E10600]/20 text-xs font-mono uppercase tracking-widest transition-colors">Reject</button>
                      </>
                    )}
                    {m.status !== 'PENDING' && (
                      <button type="button" onClick={() => handleUpdateStatus(m.id, 'PENDING')} className="px-3 py-1 bg-white/5 text-white/50 hover:bg-white/10 text-xs font-mono uppercase tracking-widest transition-colors">Reset</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {processedMpds.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-white/30 font-mono text-xs">
                  No moderator applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Info Modal */}
      {selectedMpd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/10 max-w-lg w-full p-6 relative">
            <button 
              type="button" 
              onClick={() => setSelectedMpd(null)} 
              className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className="font-sans font-black italic text-lg uppercase tracking-tight text-white mb-6">
              Moderator Candidate Details
            </h3>

            <div className="space-y-4 text-sm font-sans max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Full Name</label>
                  <div className="text-white font-bold">{selectedMpd.full_name}</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Current Status</label>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded-sm ${
                    selectedMpd.status === 'APPROVED' ? 'bg-[#00ff00]/10 text-[#00ff00]' :
                    selectedMpd.status === 'REJECTED' ? 'bg-[#E10600]/10 text-[#E10600]' :
                    'bg-white/10 text-white/70'
                  }`}>
                    {selectedMpd.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Email Address</label>
                  <div className="text-white text-xs break-all">{selectedMpd.email}</div>
                </div>
                <div>
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Phone Number</label>
                  <div className="text-white text-xs">{selectedMpd.phone}</div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">College</label>
                <div className="text-white">{selectedMpd.college}</div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Degree</label>
                  <div className="text-white">{selectedMpd.degree}</div>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Year</label>
                  <div className="text-white">{selectedMpd.year}</div>
                </div>
                <div className="col-span-1">
                  <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Branch</label>
                  <div className="text-white">{selectedMpd.branch}</div>
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">English Fluency Level</label>
                <div className="text-white font-semibold flex items-center gap-1.5 mt-0.5">
                  <Mic size={14} className="text-aws-orange" />
                  {selectedMpd.english_fluency}
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Past Experiences as Anchor/Host</label>
                <div className="text-white/80 text-xs bg-[#050505] border border-white/5 p-3 whitespace-pre-wrap font-sans mt-1 leading-relaxed">
                  {selectedMpd.past_experience}
                </div>
              </div>

              <div className="border-t border-white/5 pt-3">
                <label className="text-[10px] font-mono text-white/40 uppercase tracking-widest block mb-1">Submission Date</label>
                <div className="text-white text-xs">{new Date(selectedMpd.created_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/5 flex justify-end gap-2">
              <button 
                type="button" 
                onClick={() => setSelectedMpd(null)} 
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
