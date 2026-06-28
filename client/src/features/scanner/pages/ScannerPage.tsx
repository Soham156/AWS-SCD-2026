import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Users, ArrowLeft, LogOut, Search } from 'lucide-react';
import { api } from '../../../lib/api';
import { QRScanner } from '../components/QRScanner';
import { ScanFeedback } from '../components/ScanFeedback';
import { useScannerAuth } from '../hooks/useScannerAuth';
import { ScannerLogin } from '../components/ScannerLogin';

export function ScannerPage() {
  const { authed, login, logout, token: authKey } = useScannerAuth();
  const [activeTab, setActiveTab] = useState<'qr' | 'search' | 'attendees'>('qr');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [stats, setStats] = useState({ checked_in: 0, total: 0 });
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Fetch stats
  const fetchStats = useCallback(() => {
    if (!authed) return;
    api.get('/api/scan/stats', {
      headers: { 'X-Scanner-Key': authKey || '' },
    }).then((res) => {
      setStats({
        checked_in: res.data.total_checked_in,
        total: res.data.total_sold,
      });
    }).catch(() => {});
  }, [authed, authKey]);

  // Fetch recent check-ins
  const fetchRecentCheckins = useCallback(() => {
    if (!authed) return;
    api.get('/api/scan/attendees', {
      headers: { 'X-Scanner-Key': authKey || '' },
    }).then((res) => {
      setRecentCheckins(res.data);
    }).catch(() => {});
  }, [authed, authKey]);

  useEffect(() => {
    if (authed) {
      fetchStats();
      fetchRecentCheckins();
    }
  }, [authed, fetchStats, fetchRecentCheckins]);

  const handleScan = useCallback(async (token: string) => {
    setScannerEnabled(false);
    try {
      const res = await api.post('/api/scan/verify', 
        { qr_token: token },
        { headers: { 'X-Scanner-Key': authKey || '' } }
      );
      setScanResult(res.data);
    } catch {
      setScanResult({ status: 'INVALID' });
    }
  }, [authKey]);

  const handleConfirmCheckin = useCallback(async (registrationId: string) => {
    setIsConfirming(true);
    try {
      const res = await api.post('/api/scan/checkin',
        { registration_id: registrationId },
        { headers: { 'X-Scanner-Key': authKey || '' } }
      );
      if (res.data.success) {
        setScanResult((prev: any) => ({
          ...prev,
          status: 'CHECKIN_SUCCESS',
        }));
        fetchStats();
        fetchRecentCheckins();
        // Refresh search results to show as checked in if we checked them in from search list
        if (searchQuery.trim()) {
          api.post('/api/scan/search',
            { query: searchQuery },
            { headers: { 'X-Scanner-Key': authKey || '' } }
          ).then((r) => setSearchResults(r.data)).catch(() => {});
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Check-in failed. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  }, [authKey, fetchStats, fetchRecentCheckins, searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await api.post('/api/scan/search',
        { query: searchQuery },
        { headers: { 'X-Scanner-Key': authKey || '' } }
      );
      setSearchResults(res.data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectAttendee = useCallback((reg: any) => {
    const passData = reg.pass_types as any;
    if (reg.checked_in) {
      setScanResult({
        status: 'ALREADY_CHECKED_IN',
        id: reg.id,
        attendee_name: reg.full_name,
        ticket_number: reg.ticket_number,
        pass_slug: passData?.slug || reg.pass_slug,
        organization: reg.organization,
        checked_in_at: reg.checked_in_at
      });
    } else {
      setScanResult({
        status: 'VALID',
        id: reg.id,
        attendee_name: reg.full_name,
        ticket_number: reg.ticket_number,
        pass_slug: passData?.slug || reg.pass_slug,
        organization: reg.organization
      });
    }
    setScannerEnabled(false);
  }, []);

  const handleDismiss = useCallback(() => {
    setScanResult(null);
    setScannerEnabled(true);
  }, []);

  if (!authed) {
    return <ScannerLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-12">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-sans font-black italic text-lg uppercase tracking-tight">
                Gate Scanner
              </h1>
              <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
                AWS SCD Dhule 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <QrCode size={24} className="text-aws-orange" />
            <button onClick={logout} className="text-white/30 hover:text-f1-red transition-colors cursor-pointer" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Live counter */}
      <div className="max-w-md mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4 p-3 border border-white/10 bg-white/5">
          <Users size={16} className="text-emerald-400" />
          <div className="font-mono text-sm">
            <span className="text-emerald-400 font-bold">{stats.checked_in}</span>
            <span className="text-white/30"> / </span>
            <span className="text-white/60">{stats.total}</span>
            <span className="text-white/30 text-[10px] ml-2 uppercase tracking-widest">Checked In</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 max-w-md mx-auto mb-4">
        <button
          onClick={() => setActiveTab('qr')}
          className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'qr' ? 'border-[#FF9900] text-[#FF9900] font-bold' : 'border-transparent text-white/40 hover:text-white/80'
          }`}
        >
          QR Scan
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'search' ? 'border-[#FF9900] text-[#FF9900] font-bold' : 'border-transparent text-white/40 hover:text-white/80'
          }`}
        >
          Manual Search
        </button>
        <button
          onClick={() => setActiveTab('attendees')}
          className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider text-center border-b-2 transition-all cursor-pointer ${
            activeTab === 'attendees' ? 'border-[#FF9900] text-[#FF9900] font-bold' : 'border-transparent text-white/40 hover:text-white/80'
          }`}
        >
          Checked In
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'qr' && (
        <div className="max-w-md mx-auto px-4 py-4">
          <QRScanner onScan={handleScan} enabled={scannerEnabled} />
          <p className="text-center font-mono text-[10px] text-white/30 mt-4 uppercase tracking-widest">
            Point camera at attendee's QR code
          </p>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="max-w-md mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search name, email, ticket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-2.5 pl-10 text-sm font-mono focus:border-aws-orange focus:outline-none placeholder-white/30"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-aws-orange hover:bg-aws-orange-dark disabled:opacity-50 active:scale-95 transition-all text-black font-sans font-black italic px-5 py-2.5 text-sm uppercase cursor-pointer"
            >
              {searching ? '...' : 'Search'}
            </button>
          </form>

          <div className="mt-6 space-y-2">
            {searching && (
              <p className="text-center font-mono text-[10px] text-white/30 uppercase tracking-widest">
                Searching Database...
              </p>
            )}
            {!searching && searchResults.length === 0 && searchQuery && (
              <p className="text-center font-mono text-[10px] text-white/30 uppercase tracking-widest">
                No results found
              </p>
            )}
            {!searching && searchResults.map((reg) => (
              <div
                key={reg.id}
                onClick={() => handleSelectAttendee(reg)}
                className="p-3 border border-white/10 bg-white/5 hover:border-aws-orange/40 hover:bg-white/[0.07] transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-sans font-bold text-sm text-white truncate">{reg.full_name}</p>
                  <p className="font-mono text-[9px] text-white/40 truncate">{reg.ticket_number} • {reg.email}</p>
                  <p className="font-mono text-[9px] text-aws-orange uppercase tracking-widest mt-0.5">
                    {(reg.pass_types as any)?.name || reg.pass_slug} pass
                  </p>
                </div>
                <div className="shrink-0">
                  {reg.checked_in ? (
                    <span className="font-mono text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/60 px-2 py-1 uppercase tracking-wider font-semibold">
                      Checked In
                    </span>
                  ) : (
                    <span className="font-mono text-[9px] text-white/40 border border-white/10 px-2 py-1 uppercase tracking-wider">
                      Pending
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'attendees' && (
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono text-xs text-white/30 uppercase tracking-widest">
              Checked In Attendees
            </h3>
            <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
              Live Gate Feed
            </span>
          </div>
          {recentCheckins.length === 0 ? (
            <p className="font-mono text-[10px] text-white/20 italic">No attendees checked in yet.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {recentCheckins.map((chk) => (
                <div key={chk.id} className="p-3 border border-white/5 bg-white/[0.02] flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-sans font-bold text-sm text-white truncate">{chk.full_name}</p>
                    <p className="font-mono text-[9px] text-white/40 truncate">{chk.ticket_number} • {chk.pass_slug?.toUpperCase()}</p>
                  </div>
                  <div className="text-right flex flex-col items-end shrink-0">
                    <span className="font-mono text-[10px] text-emerald-400 font-semibold">Checked In</span>
                    {chk.checked_in_at && (
                      <span className="font-mono text-[8px] text-white/30">
                        {new Date(chk.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Scan feedback overlay */}
      <ScanFeedback 
        result={scanResult} 
        onDismiss={handleDismiss} 
        onConfirm={handleConfirmCheckin}
        isConfirming={isConfirming}
      />
    </div>
  );
}
