import { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, RefreshCw, Loader2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { api } from '../../../lib/api';

export function RegistrationsTable() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    pass_slug: '',
    payment_status: '',
    checked_in: '',
  });
  const [refunding, setRefunding] = useState<string | null>(null);
  const [passTypes, setPassTypes] = useState<{slug: string; name: string}[]>([]);
  const limit = 50;

  const fetchData = useCallback(() => {
    setLoading(true);
    adminApi.getRegistrations({ ...filters, page, limit })
      .then((res) => {
        setRegistrations(res.data.registrations);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filters, page]);

  useEffect(() => { 
    fetchData(); 
    api.get('/api/admin/passes').then(res => {
      if (Array.isArray(res.data)) setPassTypes(res.data);
    }).catch(console.error);
  }, [fetchData]);

  const handleRefund = async (registrationId: string) => {
    if (!confirm('Are you sure you want to refund this registration?')) return;
    setRefunding(registrationId);
    try {
      await adminApi.refund(registrationId);
      fetchData();
    } catch (err) {
      alert('Refund failed');
    } finally {
      setRefunding(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input
            value={filters.search}
            onChange={(e) => { setFilters(f => ({...f, search: e.target.value})); setPage(1); }}
            placeholder="Search name or email..."
            className="w-full bg-[#0a0a0a] border border-white/10 pl-9 pr-3 py-2 text-xs text-white font-mono placeholder:text-white/20 focus:border-aws-orange focus:outline-none"
          />
        </div>
        <select
          value={filters.pass_slug}
          onChange={(e) => { setFilters(f => ({...f, pass_slug: e.target.value})); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none"
        >
          <option value="">All Passes</option>
          {passTypes.map(pt => (
            <option key={pt.slug} value={pt.slug}>{pt.name}</option>
          ))}
        </select>
        <select
          value={filters.payment_status}
          onChange={(e) => { setFilters(f => ({...f, payment_status: e.target.value})); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none"
        >
          <option value="">All Payments</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
          <option value="REFUNDED">Refunded</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={filters.checked_in}
          onChange={(e) => { setFilters(f => ({...f, checked_in: e.target.value})); setPage(1); }}
          className="bg-[#0a0a0a] border border-white/10 px-3 py-2 text-xs text-white font-mono focus:border-aws-orange focus:outline-none"
        >
          <option value="">All Check-In</option>
          <option value="true">Checked In</option>
          <option value="false">Not Checked In</option>
        </select>
        <button onClick={fetchData} className="p-2 border border-white/10 text-white/30 hover:text-white hover:bg-white/5 transition-colors">
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-white/5">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-[#111] border-b border-white/10">
              {['Ticket', 'Pass', 'Name', 'Email', 'Phone', 'Role', 'Org', 'Payment', 'Checked In', 'Date', 'Actions'].map(h => (
                <th key={h} className="text-left py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px] whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="text-center py-8">
                  <Loader2 size={20} className="animate-spin text-white/20 mx-auto" />
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-white/20 font-mono text-xs">
                  No registrations found
                </td>
              </tr>
            ) : (
              registrations.map((r) => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-2 px-3 font-mono text-aws-orange font-bold">{r.ticket_number}</td>
                  <td className="py-2 px-3">
                    <span
                      className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold text-white uppercase"
                      style={{ backgroundColor: r.pass_types?.badge_color || '#6B7280' }}
                    >
                      {r.pass_slug}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-sans text-white">{r.full_name}</td>
                  <td className="py-2 px-3 font-mono text-white/50">{r.email}</td>
                  <td className="py-2 px-3 font-mono text-white/50">{r.phone || '-'}</td>
                  <td className="py-2 px-3 font-mono text-white/30 uppercase text-[10px]">{r.role}</td>
                  <td className="py-2 px-3 font-mono text-white/30 text-[10px]">{r.organization}</td>
                  <td className="py-2 px-3">
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase ${
                      r.payment_status === 'PAID' ? 'bg-emerald-400/10 text-emerald-400' :
                      r.payment_status === 'PENDING' ? 'bg-yellow-400/10 text-yellow-400' :
                      r.payment_status === 'REFUNDED' ? 'bg-blue-400/10 text-blue-400' :
                      'bg-red-400/10 text-red-400'
                    }`}>
                      {r.payment_status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    {r.checked_in ? (
                      <span className="text-emerald-400 text-[10px] font-mono">✓</span>
                    ) : (
                      <span className="text-white/10">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-mono text-white/20 text-[10px] whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">
                    {r.payment_status === 'PAID' && (
                      <button
                        onClick={() => handleRefund(r.id)}
                        disabled={refunding === r.id}
                        className="px-2 py-1 text-[9px] font-mono uppercase tracking-wider border border-f1-red/30 text-f1-red hover:bg-f1-red/10 transition-colors disabled:opacity-50"
                      >
                        {refunding === r.id ? '...' : 'Refund'}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="font-mono text-[10px] text-white/20">
            Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-white/10 text-white/30 hover:bg-white/5 disabled:opacity-20 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono text-xs text-white/40 px-3">{page}/{totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 border border-white/10 text-white/30 hover:bg-white/5 disabled:opacity-20 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
