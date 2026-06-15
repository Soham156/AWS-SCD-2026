import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QrCode, Users, ArrowLeft, LogOut } from 'lucide-react';
import { api } from '../../../lib/api';
import { QRScanner } from '../components/QRScanner';
import { ScanFeedback } from '../components/ScanFeedback';
import { useScannerAuth } from '../hooks/useScannerAuth';
import { ScannerLogin } from '../components/ScannerLogin';

export function ScannerPage() {
  const { authed, login, logout, token: authKey } = useScannerAuth();
  const [scanResult, setScanResult] = useState<any>(null);
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [stats, setStats] = useState({ checked_in: 0, total: 0 });

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

  useEffect(() => {
    if (authed) {
      fetchStats();
    }
  }, [authed, fetchStats]);

  const handleScan = useCallback(async (token: string) => {
    setScannerEnabled(false);
    try {
      const res = await api.post('/api/scan/verify', 
        { qr_token: token },
        { headers: { 'X-Scanner-Key': authKey || '' } }
      );
      setScanResult(res.data);
      if (res.data.status === 'VALID') {
        fetchStats();
      }
    } catch {
      setScanResult({ status: 'INVALID' });
    }
  }, [fetchStats, authKey]);

  const handleDismiss = useCallback(() => {
    setScanResult(null);
    setScannerEnabled(true);
  }, []);

  if (!authed) {
    return <ScannerLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-white/30 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </Link>
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
            <button onClick={logout} className="text-white/30 hover:text-f1-red transition-colors" title="Logout">
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

      {/* Scanner */}
      <div className="max-w-md mx-auto px-4 py-4">
        <QRScanner onScan={handleScan} enabled={scannerEnabled} />
        <p className="text-center font-mono text-[10px] text-white/30 mt-4 uppercase tracking-widest">
          Point camera at attendee's QR code
        </p>
      </div>

      {/* Scan feedback overlay */}
      <ScanFeedback result={scanResult} onDismiss={handleDismiss} />
    </div>
  );
}
