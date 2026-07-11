import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Search, 
  Copy, 
  Check, 
  Share2, 
  Mail, 
  Calendar, 
  Gift, 
  ExternalLink, 
  Loader2,
  Trophy
} from 'lucide-react';
import { api } from '../../../lib/api';
import copy from 'copy-to-clipboard';

interface ReferralRecord {
  date: string;
  points: number;
  email: string;
  pass_name: string;
}

interface ReferralResponse {
  found: boolean;
  referral_code: string;
  total_points: number;
  referral_count: number;
  referrals: ReferralRecord[];
}
export default function MyReferralsPage() {
  interface PublicLeaderboardEntry {
    name: string;
    pass: string;
    total_points: number;
    referrals: number;
  }

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<ReferralResponse | null>(null);
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [leaderboard, setLeaderboard] = useState<PublicLeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get<PublicLeaderboardEntry[]>('/api/orders/public-leaderboard');
        setLeaderboard(res.data);
      } catch (err) {
        console.error('Failed to fetch public leaderboard:', err);
      } finally {
        setLeaderboardLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    setData(null);

    try {
      const res = await api.get<ReferralResponse>(`/api/orders/my-referrals`, {
        params: { email: email.trim() }
      });
      setData(res.data);
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || 
        'Could not find any paid registration with that email address.'
      );
    } finally {
      setLoading(false);
    }
  };

  const referralUrl = data?.referral_code
    ? `${window.location.origin}/ticket?ref=${data.referral_code}`
    : '';

  const handleCopyLink = () => {
    if (!referralUrl) return;
    copy(referralUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    if (!data?.referral_code) return;
    copy(data.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const shareText = `Hey! I just registered for AWS Student Community Day Dhule 2026. Use my referral link to get your pass and let's meet on the grid! 🏁 ${referralUrl}`;

  const shareWhatsApp = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
  const shareLinkedIn = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col relative no-scrollbar">
      {/* Scrollbar-hide global overrides + Floating emoji wallpaper */}
      <style>{`
        html, body, .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        html::-webkit-scrollbar, body::-webkit-scrollbar, .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        @keyframes floatUp {
          0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
        }
        .emoji-float {
          position: fixed;
          z-index: 1;
          pointer-events: none;
          animation: floatUp linear infinite;
          font-size: 20px;
          opacity: 0;
          filter: grayscale(0.5) brightness(0.4);
        }
      `}
      </style>

      {/* Floating Emoji Wallpaper */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {['🏆','🎁','🚀','☁️','⭐','🏁','🎯','🔥','💎','🏆','🎁','🚀','☁️','⭐','🏁','🎯'].map((emoji, i) => (
          <span
            key={i}
            className="emoji-float"
            style={{
              left: `${5 + (i * 6.2) % 90}%`,
              animationDuration: `${14 + (i * 3.7) % 16}s`,
              animationDelay: `${(i * 2.3) % 12}s`,
              fontSize: `${16 + (i * 2.1) % 12}px`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      {/* Floating F1 Standing HUD (Visually at the same position as in image, limited to 5 rows like popup box) */}
      <aside className="fixed top-24 left-6 z-20 w-72 bg-[#0c0c12]/95 border border-white/10 rounded-lg overflow-hidden shadow-2xl backdrop-blur-md hidden lg:flex flex-col font-sans">
        {/* HUD Header */}
        <div className="bg-[#08080c] p-3.5 border-b border-white/5 flex items-center justify-between">
          <span className="font-sans font-black italic text-xs text-white tracking-wider uppercase">
            Leaderboard
          </span>
        </div>

        {/* Standings List */}
        <div className="p-3.5 space-y-1.5">
          <div className="font-mono text-[8px] text-white/35 uppercase tracking-[0.2em] mb-2.5">
            Top 5 Referrers
          </div>
          {leaderboardLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="animate-spin text-aws-orange" size={14} />
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-6 px-3 border border-white/5 border-dashed rounded font-mono text-[9px] text-white/40 leading-relaxed">
              Grid forming... <br />
              <span className="text-aws-orange font-sans font-bold italic uppercase mt-1 inline-block">Be the first to claim P1!</span>
            </div>
          ) : (
            leaderboard.slice(0, 5).map((entry, index) => {
              const isLeader = index === 0;
              return (
                <div 
                  key={index} 
                  className="flex items-center bg-[#0e0e13]/85 hover:bg-[#161622] border border-white/5 rounded-sm overflow-hidden h-8.5 transition-colors"
                >
                  <div 
                    className={`w-7.5 h-full flex items-center justify-center font-mono text-xs font-black select-none ${
                      isLeader ? 'bg-[#E10600] text-white' : 'bg-zinc-800 text-white/60'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div 
                    className={`w-1 h-full ${
                      entry.pass.toLowerCase().includes('vip') 
                        ? 'bg-emerald-500' 
                        : 'bg-aws-orange'
                    }`} 
                  />
                  <div className="flex-1 pl-2.5 flex flex-col justify-center min-w-0">
                    <span className="font-sans font-black italic uppercase tracking-wider text-[10.5px] text-white/95 truncate">
                      {entry.name}
                    </span>
                    <span className="font-mono text-[6.5px] text-white/35 uppercase truncate">
                      {entry.pass}
                    </span>
                  </div>
                  <div className="pr-2.5 text-right">
                    <span className="font-mono text-[9.5px] font-bold text-aws-orange">
                      {entry.total_points}
                    </span>
                    <span className="font-mono text-[7.5px] text-white/35 ml-0.5">PTS</span>
                  </div>
                </div>
              );
            })
          )}

          {/* Standings Slots Padding */}
          {!leaderboardLoading && leaderboard.length < 5 && Array.from({ length: 5 - leaderboard.length }).map((_, i) => {
            const pos = leaderboard.length + i + 1;
            return (
              <div 
                key={pos} 
                className="flex items-center bg-[#0a0a0c]/30 border border-white/5 border-dashed rounded-sm h-8.5 opacity-35 select-none"
              >
                <div className="w-7.5 h-full flex items-center justify-center font-mono text-xs font-bold bg-white/5 text-white/20">
                  {pos}
                </div>
                <div className="w-1 h-full bg-white/10" />
                <div className="flex-1 pl-2.5 font-mono text-[8px] text-white/20 uppercase tracking-wider">
                  Grid Slot Open
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Broadcast HUD Footer */}
        <div className="p-3.5 border-t border-white/5 bg-[#08080c]/50 flex items-center justify-between font-mono text-[8px] text-white/40 uppercase tracking-widest">
          <span>GP: DHULE 2026</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
            <span>LIVE</span>
          </div>
        </div>
      </aside>

      {/* Right Column: Main Refer & Win Content (No padding left, keeping content perfectly centered) */}
      <div className="w-full flex-1 flex flex-col relative z-10">
        {/* Header Navigation */}
        <header className="border-b border-white/5 bg-[#0a0a0a]/60 backdrop-blur-md px-4 sm:px-12 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <span className="font-sans font-black italic text-lg uppercase tracking-tighter text-white">
            AWS SCD <span className="text-aws-orange">2026</span>
          </span>
        </header>

        {/* Form & Action Center */}
        <div className="w-full flex-1 px-4 sm:px-12 py-10 flex flex-col items-center justify-start">
          {/* Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-aws-orange/10 rounded-full border border-aws-orange/20 mb-4 animate-pulse">
              <Gift className="text-aws-orange w-6 h-6" />
            </div>
            <h1 className="font-sans font-black italic text-4xl sm:text-6xl uppercase tracking-tighter mb-2 text-white">
              REFER & <span className="text-aws-orange drop-shadow-[0_0_15px_rgba(255,153,0,0.3)]">WIN</span>
            </h1>
            <p className="text-white/50 font-mono text-xs uppercase tracking-wider max-w-md mx-auto">
              Check your referral points, get your code, and share with friends to win prizes.
            </p>
          </div>

          {/* Lookup Card */}
          <div className="w-full max-w-md bg-[#0d0d0d]/80 border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl backdrop-blur-md">
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] mb-2">
                  Registration Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    placeholder="Enter registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#050505] border border-white/10 rounded-lg px-4 py-3 pl-10 font-mono text-xs text-white placeholder-white/20 focus:outline-none focus:border-aws-orange focus:ring-1 focus:ring-aws-orange transition-colors"
                    required
                  />
                  <Mail className="absolute left-3.5 top-3.5 text-white/25 w-4 h-4" />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-aws-orange text-black py-3 rounded-lg font-mono text-xs uppercase tracking-widest font-bold hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    Check Points
                  </>
                )}
              </button>
            </form>

            {/* Search Error */}
            {error && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-mono text-center">
                {error}
              </div>
            )}
          </div>

          {/* Dashboard Results */}
          <AnimatePresence mode="wait">
            {data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full space-y-8"
              >
                {/* Scoreboard Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto w-full">
                  <div className="bg-gradient-to-br from-[#111]/80 to-[#0a0a0a]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden backdrop-blur-sm">
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] mb-1">Total Points</p>
                    <p className="font-sans font-black italic text-4xl text-emerald-400">{data.total_points}</p>
                    <p className="font-mono text-[9px] text-white/20 uppercase mt-2">25 PTS per ticket</p>
                  </div>
                  <div className="bg-gradient-to-br from-[#111]/80 to-[#0a0a0a]/80 border border-white/5 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden backdrop-blur-sm">
                    <p className="font-mono text-[9px] text-white/40 uppercase tracking-[0.2em] mb-1">Referral Count</p>
                    <p className="font-sans font-black italic text-4xl text-aws-orange">{data.referral_count}</p>
                    <p className="font-mono text-[9px] text-white/20 uppercase mt-2">Friends registered</p>
                  </div>
                </div>

                {/* Referral Code & Social Sharing */}
                <div className="max-w-2xl mx-auto w-full bg-gradient-to-br from-[#1a1a2e]/90 to-[#16213e]/90 border border-aws-orange/20 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
                  <h3 className="font-sans font-black italic text-base uppercase tracking-tight text-aws-orange mb-3 text-center sm:text-left">
                    Share & Earn Rewards
                  </h3>
                  <p className="font-mono text-[11px] text-white/50 mb-6 leading-relaxed text-center sm:text-left">
                    Share your link with colleagues, students, or tech communities. They choose their own paddock passes, and you receive points!
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                    {/* Left Column: Code and Copy Link */}
                    <div className="space-y-4 flex flex-col justify-between">
                      {/* Raw Code Click box */}
                      <div 
                        onClick={handleCopyCode}
                        className="bg-[#050505] border border-dashed border-aws-orange/40 rounded-xl p-4 cursor-pointer hover:bg-aws-orange/[0.03] transition-colors text-center relative group"
                        title="Click to copy raw code"
                      >
                        <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] mb-1">
                          {copiedCode ? "Code Copied!" : "Your Referral Code (Click to Copy)"}
                        </p>
                        <p className="font-mono text-2xl font-bold text-aws-orange tracking-[0.3em]">
                          {data.referral_code}
                        </p>
                      </div>

                      {/* Copy Link Button */}
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className={`w-full inline-flex items-center justify-center gap-2 py-3.5 text-xs font-mono uppercase tracking-widest transition-all cursor-pointer rounded-lg border ${
                          copiedLink
                            ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                        {copiedLink ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>

                    {/* Right Column: Social Shares */}
                    <div className="bg-[#050505]/40 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                      <p className="font-mono text-[9px] text-white/30 uppercase tracking-[0.2em] mb-4 text-center">
                        Quick Share Shortcuts
                      </p>

                      <div className="space-y-3">
                        <a
                          href={shareWhatsApp}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-black font-bold py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                          Share on WhatsApp
                        </a>

                        <a
                          href={shareTwitter}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                          Share on X (Twitter)
                        </a>

                        <a
                          href={shareLinkedIn}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full flex items-center justify-center gap-2 bg-[#0A66C2] text-white font-bold py-2.5 rounded-lg text-[10px] font-mono uppercase tracking-wider hover:opacity-90 transition-opacity"
                        >
                          Share on LinkedIn
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral History List */}
                <div className="max-w-2xl mx-auto w-full bg-[#0d0d0d]/80 border border-white/5 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-md overflow-hidden">
                  <h3 className="font-sans font-black italic text-base uppercase tracking-tight text-white mb-6">
                    Referral Transactions
                  </h3>

                  {data.referrals.length === 0 ? (
                    <div className="text-center py-10 border border-white/5 border-dashed rounded-xl">
                      <p className="font-mono text-xs text-white/40 uppercase tracking-widest">No successful referrals yet</p>
                      <p className="font-mono text-[9px] text-white/20 uppercase tracking-widest mt-1">Share your link to unlock points!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto max-h-64 no-scrollbar">
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-white/40 uppercase text-[9px] tracking-wider sticky top-0 bg-[#0d0d0d] z-10">
                            <th className="pb-3 font-semibold">Attendee</th>
                            <th className="pb-3 font-semibold">Pass Type</th>
                            <th className="pb-3 font-semibold text-right">Points</th>
                            <th className="pb-3 font-semibold text-right">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {data.referrals.map((ref, idx) => (
                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 text-white/80">{ref.email}</td>
                              <td className="py-3 text-white/50">{ref.pass_name}</td>
                              <td className="py-3 text-emerald-400 font-bold text-right">+{ref.points}</td>
                              <td className="py-3 text-white/30 text-right">{formatDate(ref.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Leaderboard (visible only below lg breakpoint) */}
        <div className="lg:hidden px-4 sm:px-12 pb-8">
          <div className="bg-[#0c0c12]/95 border border-white/10 rounded-lg overflow-hidden shadow-2xl backdrop-blur-md font-sans">
            <div className="bg-[#08080c] p-3.5 border-b border-white/5 flex items-center justify-between">
              <span className="font-sans font-black italic text-xs text-white tracking-wider uppercase">
                Leaderboard
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] animate-pulse" />
                <span className="font-mono text-[8px] text-white/40 uppercase tracking-widest">LIVE</span>
              </div>
            </div>
            <div className="p-3.5 space-y-1.5">
              <div className="font-mono text-[8px] text-white/35 uppercase tracking-[0.2em] mb-2.5">
                Top 5 Referrers
              </div>
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="animate-spin text-aws-orange" size={14} />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-6 px-3 border border-white/5 border-dashed rounded font-mono text-[9px] text-white/40 leading-relaxed">
                  Grid forming... <br />
                  <span className="text-aws-orange font-sans font-bold italic uppercase mt-1 inline-block">Be the first to claim P1!</span>
                </div>
              ) : (
                leaderboard.slice(0, 5).map((entry, index) => {
                  const isLeader = index === 0;
                  return (
                    <div 
                      key={index} 
                      className="flex items-center bg-[#0e0e13]/85 border border-white/5 rounded-sm overflow-hidden h-8.5"
                    >
                      <div 
                        className={`w-7.5 h-full flex items-center justify-center font-mono text-xs font-black select-none ${
                          isLeader ? 'bg-[#E10600] text-white' : 'bg-zinc-800 text-white/60'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div 
                        className={`w-1 h-full ${
                          entry.pass.toLowerCase().includes('vip') 
                            ? 'bg-emerald-500' 
                            : 'bg-aws-orange'
                        }`} 
                      />
                      <div className="flex-1 pl-2.5 flex flex-col justify-center min-w-0">
                        <span className="font-sans font-black italic uppercase tracking-wider text-[10.5px] text-white/95 truncate">
                          {entry.name}
                        </span>
                        <span className="font-mono text-[6.5px] text-white/35 uppercase truncate">
                          {entry.pass}
                        </span>
                      </div>
                      <div className="pr-2.5 text-right">
                        <span className="font-mono text-[9.5px] font-bold text-aws-orange">
                          {entry.total_points}
                        </span>
                        <span className="font-mono text-[7.5px] text-white/35 ml-0.5">PTS</span>
                      </div>
                    </div>
                  );
                })
              )}
              {!leaderboardLoading && leaderboard.length < 5 && Array.from({ length: 5 - leaderboard.length }).map((_, i) => {
                const pos = leaderboard.length + i + 1;
                return (
                  <div 
                    key={pos} 
                    className="flex items-center bg-[#0a0a0c]/30 border border-white/5 border-dashed rounded-sm h-8.5 opacity-35 select-none"
                  >
                    <div className="w-7.5 h-full flex items-center justify-center font-mono text-xs font-bold bg-white/5 text-white/20">
                      {pos}
                    </div>
                    <div className="w-1 h-full bg-white/10" />
                    <div className="flex-1 pl-2.5 font-mono text-[8px] text-white/20 uppercase tracking-wider">
                      Grid Slot Open
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/5 bg-[#0a0a0a]/60 py-4 text-center relative z-10 mt-auto">
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
            AWS Student Community Day Dhule 2026 • Race to the Cloud
          </p>
        </footer>
      </div>
    </div>
  );
}
