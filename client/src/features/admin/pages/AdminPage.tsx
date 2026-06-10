import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Ticket, Users, Download, LogOut, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminLogin } from '../components/AdminLogin';
import { TelemetryCards } from '../components/TelemetryCards';
import { PassTypesManager } from '../components/PassTypesManager';
import { RegistrationsTable } from '../components/RegistrationsTable';
import { ExportCSVButton } from '../components/ExportCSVButton';

type Tab = 'overview' | 'passes' | 'registrations' | 'export';

const navItems: Array<{ key: Tab; label: string; icon: typeof BarChart3 }> = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'passes', label: 'Pass Types', icon: Ticket },
  { key: 'registrations', label: 'Registrations', icon: Users },
  { key: 'export', label: 'Export', icon: Download },
];

export function AdminPage() {
  const { authed, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  if (!authed) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-white/5 bg-[#0a0a0a] flex flex-col fixed h-full">
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2 text-white/30 hover:text-white text-xs font-mono uppercase tracking-widest transition-colors mb-3">
            <ArrowLeft size={12} />
            Back
          </Link>
          <h1 className="font-sans font-black italic text-lg uppercase tracking-tight">
            Race Control
          </h1>
          <p className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
            Admin Dashboard
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-mono uppercase tracking-widest transition-colors ${
                activeTab === item.key
                  ? 'bg-white/5 text-aws-orange border-l-2 border-aws-orange'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/[0.02]'
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-white/20 hover:text-f1-red hover:bg-f1-red/5 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-6 lg:p-8">
        {/* Tab header */}
        <div className="mb-6">
          <h2 className="font-sans font-black italic text-xl uppercase tracking-tight text-white">
            {navItems.find(i => i.key === activeTab)?.label}
          </h2>
          <div className="h-[2px] w-12 bg-gradient-to-r from-f1-red to-aws-orange mt-2" />
        </div>

        {/* Content */}
        {activeTab === 'overview' && <TelemetryCards />}
        {activeTab === 'passes' && <PassTypesManager />}
        {activeTab === 'registrations' && <RegistrationsTable />}
        {activeTab === 'export' && (
          <div className="bg-[#111] border border-white/5 p-8">
            <h3 className="font-sans font-bold text-sm text-white mb-2">Download Registrations</h3>
            <p className="font-mono text-xs text-white/40 mb-6">
              Export all registration data as a CSV file for offline analysis.
            </p>
            <ExportCSVButton />
          </div>
        )}
      </main>
    </div>
  );
}
