import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Activity, CheckCircle2, XCircle, Clock, Server, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

interface HealthStatus {
  status: 'checking' | 'ok' | 'error';
  timestamp?: string;
  latency?: number;
  error?: string;
}

export const StatusPage = () => {
  const [health, setHealth] = useState<HealthStatus>({ status: 'checking' });

  useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now();
      try {
        const response = await api.get('/api/health');
        const latency = Date.now() - start;
        setHealth({
          status: 'ok',
          timestamp: response.data.timestamp,
          latency
        });
      } catch (err: any) {
        setHealth({
          status: 'error',
          error: err.message || 'Failed to connect to API server'
        });
      }
    };

    checkHealth();
    
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] pt-24 px-4 pb-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-aws-orange/5 rounded-full blur-[150px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-12">
          <Activity size={48} className={`mx-auto mb-6 ${health.status === 'ok' ? 'text-emerald-400' : health.status === 'error' ? 'text-f1-red' : 'text-aws-orange animate-pulse'}`} />
          <h1 className="font-sans font-black italic text-4xl sm:text-5xl uppercase tracking-tighter text-white mb-4">
            System Status
          </h1>
          <p className="font-mono text-xs sm:text-sm text-white/50 uppercase tracking-widest">
            Real-time API and platform health monitoring
          </p>
        </div>

        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
          {/* Main Status Header */}
          <div className={`p-6 rounded-xl border flex items-center gap-4 mb-8 ${
            health.status === 'ok' ? 'bg-emerald-500/10 border-emerald-500/30' : 
            health.status === 'error' ? 'bg-f1-red/10 border-f1-red/30' : 
            'bg-aws-orange/10 border-aws-orange/30'
          }`}>
            {health.status === 'ok' ? (
              <CheckCircle2 size={32} className="text-emerald-400 shrink-0" />
            ) : health.status === 'error' ? (
              <XCircle size={32} className="text-f1-red shrink-0" />
            ) : (
              <Activity size={32} className="text-aws-orange shrink-0 animate-spin" />
            )}
            
            <div>
              <h2 className={`font-sans font-bold text-xl uppercase tracking-tight ${
                health.status === 'ok' ? 'text-emerald-400' : 
                health.status === 'error' ? 'text-f1-red' : 
                'text-aws-orange'
              }`}>
                {health.status === 'ok' ? 'All Systems Operational' : 
                 health.status === 'error' ? 'Major Outage Detected' : 
                 'Checking Status...'}
              </h2>
              <p className="font-mono text-[10px] text-white/50 uppercase tracking-widest mt-1">
                Last updated: {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : '...'}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#111] border border-white/5 p-5 rounded-xl flex items-start gap-4">
              <Server size={20} className="text-white/40 mt-1 shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">API Endpoint</p>
                <p className="font-sans font-bold text-white">/api/health</p>
                <p className={`font-mono text-[10px] uppercase tracking-widest mt-2 ${health.status === 'ok' ? 'text-emerald-400' : 'text-f1-red'}`}>
                  {health.status === 'checking' ? 'Connecting...' : health.status === 'ok' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 p-5 rounded-xl flex items-start gap-4">
              <Clock size={20} className="text-white/40 mt-1 shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Response Latency</p>
                <p className="font-sans font-bold text-white">
                  {health.latency ? `${health.latency}ms` : '---'}
                </p>
                <p className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mt-2">
                  {health.latency && health.latency < 200 ? 'Excellent' : health.latency && health.latency < 500 ? 'Good' : health.latency ? 'Degraded' : 'Pending'}
                </p>
              </div>
            </div>

            <div className="bg-[#111] border border-white/5 p-5 rounded-xl flex items-start gap-4 sm:col-span-2">
              <ShieldCheck size={20} className="text-white/40 mt-1 shrink-0" />
              <div>
                <p className="font-mono text-[10px] text-white/40 uppercase tracking-widest mb-1">Database Connectivity</p>
                <p className="font-sans font-bold text-white">Supabase Managed Instance</p>
                <p className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest mt-2">
                  {health.status === 'checking' ? 'Verifying...' : health.status === 'ok' ? 'Connected' : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="font-mono text-[10px] text-white/30 uppercase tracking-widest">
              Automated checks run every 30 seconds
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
