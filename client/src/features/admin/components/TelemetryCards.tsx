import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, DollarSign, Users, MapPin } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface Stats {
  total_sold: number;
  total_revenue: number;
  total_checked_in: number;
  by_pass_type: Array<{
    slug: string;
    name: string;
    sold: number;
    capacity: number;
    revenue: number;
    checked_in: number;
  }>;
}

export function TelemetryCards() {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = () => {
    adminApi.getStats().then((res) => setStats(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!stats || !stats.by_pass_type) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-[#111] border border-white/5 p-5 animate-pulse">
            <div className="h-3 w-16 bg-white/10 rounded mb-3" />
            <div className="h-8 w-20 bg-white/10 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalCapacity = stats.by_pass_type?.reduce((a, b) => a + b.capacity, 0) || 0;

  const mainCards = [
    { label: 'Total Sold', value: stats.total_sold, icon: BarChart3, color: 'text-aws-orange' },
    { label: 'Revenue', value: `₹${stats.total_revenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
    { label: 'Checked In', value: stats.total_checked_in, icon: MapPin, color: 'text-blue-400' },
    { label: 'Remaining', value: totalCapacity - stats.total_sold, icon: Users, color: 'text-purple-400' },
  ];

  return (
    <div>
      {/* Main stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {mainCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#111] border border-white/5 p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <card.icon size={14} className={card.color} />
              <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">
                {card.label}
              </span>
            </div>
            <p className={`font-sans font-black italic text-2xl ${card.color}`}>
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Per pass type cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.by_pass_type.map((pt, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-sans font-bold text-sm text-white">{pt.name}</h4>
              <span className="font-mono text-[10px] text-white/30 uppercase">{pt.slug}</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/5 mb-3">
              <div
                className="h-full bg-aws-orange transition-all"
                style={{ width: `${Math.min(100, (pt.sold / pt.capacity) * 100)}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="font-mono text-lg font-bold text-white">{pt.sold}</p>
                <p className="font-mono text-[9px] text-white/30 uppercase">Sold</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-white/50">{pt.capacity}</p>
                <p className="font-mono text-[9px] text-white/30 uppercase">Capacity</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold text-emerald-400">₹{pt.revenue.toLocaleString()}</p>
                <p className="font-mono text-[9px] text-white/30 uppercase">Revenue</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
