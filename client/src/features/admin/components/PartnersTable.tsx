import { useState, useEffect } from 'react';
import { X, Mail, Phone, User, Users as UsersIcon, MapPin, Linkedin, Link as LinkIcon, Search, Users, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';
import { adminApi } from '../services/adminApi';

export const PartnersTable = () => {
  const [partners, setPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);

  // Filter & Sort states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('date_desc');

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

  // Stats derived from original list
  const totalCount = partners.length;
  const approvedCount = partners.filter(p => p.status === 'APPROVED').length;
  const pendingCount = partners.filter(p => p.status === 'PENDING').length;
  const rejectedCount = partners.filter(p => p.status === 'REJECTED').length;

  const stats = [
    { label: 'Total Partnerships', value: totalCount, icon: Users, color: 'text-aws-orange', bg: 'bg-[#FF9900]/5' },
    { label: 'Approved Partners', value: approvedCount, icon: CheckCircle2, color: 'text-[#00ff00]', bg: 'bg-[#00ff00]/5' },
    { label: 'Pending Evaluation', value: pendingCount, icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/5' },
    { label: 'Rejected', value: rejectedCount, icon: AlertTriangle, color: 'text-[#E10600]', bg: 'bg-[#E10600]/5' }
  ];

  // Filtered & Sorted list
  const processedPartners = partners
    .filter(p => {
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          (p.community_name || '').toLowerCase().includes(query) ||
          (p.community_type || '').toLowerCase().includes(query) ||
          (p.organizer_name || '').toLowerCase().includes(query) ||
          (p.organizer_email || '').toLowerCase().includes(query) ||
          (p.city || '').toLowerCase().includes(query)
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
        return (a.community_name || '').localeCompare(b.community_name || '');
      }
      if (sortBy === 'name_desc') {
        return (b.community_name || '').localeCompare(a.community_name || '');
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
            placeholder="Search community name, organizer, location, type..."
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
          <option value="name_asc">Community: A-Z</option>
          <option value="name_desc">Community: Z-A</option>
        </select>
      </div>

      {/* Partners List Table */}
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
            {processedPartners.map(p => (
              <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 align-top w-1/4">
                  <div className="font-bold text-blue-400 mb-1">{p.community_name}</div>
                  <div className="text-white/60 text-xs">{p.community_type}</div>
                  <a href={p.website_url} target="_blank" rel="noreferrer" className="text-white/30 text-[10px] hover:text-white underline mt-1 inline-block">Website</a>
                </td>
                <td className="p-4 align-top w-1/4">
                  <div className="font-bold text-white mb-1">{p.organizer_name}</div>
                  <div className="text-white/60 text-xs">{p.organizer_email}</div>
                  <div className="text-white/40 text-xs mt-1">{p.organizer_phone}</div>
                </td>
                <td className="p-4 align-top w-1/5">
                  <div className="text-white mb-1">{p.city}</div>
                  <div className="text-white/60 text-xs">{p.member_size} members</div>
                </td>
                <td className="p-4 align-top w-1/8">
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
            {processedPartners.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/30 font-mono text-xs">
                  No community partners found.
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
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-aws-orange">Partner Application Details</span>
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
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <UsersIcon size={14} className="text-white/40" />
                    <span>{selectedPartner.community_type}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Member Size</div>
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <UsersIcon size={14} className="text-white/40" />
                    <span>{selectedPartner.member_size} members</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Organizer Name</div>
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <User size={14} className="text-white/40" />
                    <span>{selectedPartner.organizer_name}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Organizer Email</div>
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <Mail size={14} className="text-white/40" />
                    <a href={`mailto:${selectedPartner.organizer_email}`} className="hover:text-aws-orange hover:underline">{selectedPartner.organizer_email}</a>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">Organizer Phone</div>
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <Phone size={14} className="text-white/40" />
                    <span>{selectedPartner.organizer_phone}</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider">City / Location</div>
                  <div className="text-sm font-medium mt-1 flex items-center gap-2">
                    <MapPin size={14} className="text-white/40" />
                    <span>{selectedPartner.city}</span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6 text-sm">
                {selectedPartner.linkedin_url && (
                  <a 
                    href={selectedPartner.linkedin_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded transition-all"
                  >
                    <Linkedin size={14} />
                    LinkedIn Profile
                  </a>
                )}
                {selectedPartner.website_url && (
                  <a 
                    href={selectedPartner.website_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded transition-all"
                  >
                    <LinkIcon size={14} />
                    Community Website
                  </a>
                )}
              </div>

              {/* Expectations */}
              <div className="border-b border-white/5 pb-6">
                <div className="text-[10px] font-mono uppercase text-white/40 tracking-wider mb-2">Expectations / Message</div>
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
