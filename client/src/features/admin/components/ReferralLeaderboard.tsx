import { useState, useEffect } from 'react';
import { Trophy, Loader2, RefreshCw, Eye, X } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface ReferralLogEntry {
  id: string;
  referrer_email: string;
  points: number;
  created_at: string;
  referrer_pass: string;
  referred_email: string;
  referred_quantity: number;
  referred_amount: number;
  referred_pass: string;
}

interface LeaderboardEntry {
  email: string;
  pass: string;
  referrals: number;
  total_points: number;
  details: ReferralLogEntry[];
}

export function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReferrer, setSelectedReferrer] = useState<LeaderboardEntry | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getReferralDetails();
      const logs: ReferralLogEntry[] = res.data;

      // Aggregate details by referrer email
      const map = new Map<string, LeaderboardEntry>();
      for (const log of logs) {
        const existing = map.get(log.referrer_email);
        if (existing) {
          existing.referrals += 1;
          existing.total_points += log.points;
          existing.details.push(log);
        } else {
          map.set(log.referrer_email, {
            email: log.referrer_email,
            pass: log.referrer_pass,
            referrals: 1,
            total_points: log.points,
            details: [log],
          });
        }
      }

      const sortedLeaderboard = Array.from(map.values()).sort(
        (a, b) => b.total_points - a.total_points
      );
      setLeaderboard(sortedLeaderboard);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load referral details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getRankBadge = (index: number) => {
    if (index === 0) return { emoji: '🥇', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' };
    if (index === 1) return { emoji: '🥈', color: 'text-gray-300', bg: 'bg-gray-300/10 border-gray-300/30' };
    if (index === 2) return { emoji: '🥉', color: 'text-amber-600', bg: 'bg-amber-600/10 border-amber-600/30' };
    return { emoji: `#${index + 1}`, color: 'text-white/40', bg: 'bg-white/5 border-white/10' };
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-aws-orange" size={28} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-sm text-red-400 mb-4">{error}</p>
        <button
          type="button"
          onClick={fetchData}
          className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 text-xs font-mono uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <h3 className="font-mono text-xs text-white/40 uppercase tracking-widest">
          Referral Leaderboard
        </h3>
        <button
          type="button"
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-white/40 text-xs font-mono uppercase tracking-widest hover:text-white/60 transition-colors cursor-pointer"
        >
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-16 bg-[#111] border border-white/5">
          <Trophy size={32} className="text-white/10 mx-auto mb-4" />
          <p className="font-mono text-sm text-white/30 mb-1">No referrals yet</p>
          <p className="font-mono text-xs text-white/15">Points will appear once attendees share their codes.</p>
        </div>
      ) : (
        <div className="bg-[#111] border border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/30 uppercase tracking-widest w-20">Rank</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/30 uppercase tracking-widest">Referrer Email</th>
                <th className="px-4 py-3 text-left font-mono text-[10px] text-white/30 uppercase tracking-widest">Referrer Pass</th>
                <th className="px-4 py-3 text-center font-mono text-[10px] text-white/30 uppercase tracking-widest">Referrals</th>
                <th className="px-4 py-3 text-right font-mono text-[10px] text-white/30 uppercase tracking-widest">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, i) => {
                const badge = getRankBadge(i);
                return (
                  <tr key={entry.email} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border ${badge.bg}`}>
                        {badge.emoji}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-white/80">{entry.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-[10px] font-mono border border-white/10 bg-white/5 text-white/60">
                        {entry.pass || 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className="font-mono text-sm text-emerald-400 font-bold">{entry.referrals}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedReferrer(entry)}
                          className="p-1 text-white/40 hover:text-aws-orange hover:bg-white/5 transition-colors rounded cursor-pointer"
                          title="View referred users details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono text-sm font-bold text-aws-orange">{entry.total_points}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Referred Users Details Modal */}
      {selectedReferrer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-white/10 max-w-2xl w-full max-h-[85vh] flex flex-col rounded-lg overflow-hidden shadow-2xl animate-fade-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <div>
                <p className="font-mono text-[9px] text-aws-orange uppercase tracking-wider mb-1">
                  Referred Details
                </p>
                <h4 className="font-sans font-bold text-sm text-white truncate max-w-[400px]" title={selectedReferrer.email}>
                  Referrer: {selectedReferrer.email}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReferrer(null)}
                className="p-1 text-white/55 hover:text-white hover:bg-white/5 rounded transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 overflow-y-auto flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] uppercase font-mono text-white/30 tracking-wider">
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Referred Email</th>
                      <th className="pb-2">Pass Category</th>
                      <th className="pb-2 text-center">Tickets</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedReferrer.details.map((log) => (
                      <tr key={log.id} className="border-b border-white/[0.02] last:border-0 hover:bg-white/[0.01]">
                        <td className="py-2.5 font-mono text-white/40">{formatDate(log.created_at)}</td>
                        <td className="py-2.5 font-mono text-white/80 max-w-[150px] truncate" title={log.referred_email}>
                          {log.referred_email}
                        </td>
                        <td className="py-2.5 font-mono text-white/70 max-w-[120px] truncate" title={log.referred_pass}>
                          {log.referred_pass}
                        </td>
                        <td className="py-2.5 text-center font-mono text-emerald-400">{log.referred_quantity}</td>
                        <td className="py-2.5 text-right font-mono text-white/60">₹{Number(log.referred_amount).toFixed(2)}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-aws-orange">+{log.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
