import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Ticket, Users, Download, LogOut, ArrowLeft, Mail, Menu, X } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { AdminLogin } from '../components/AdminLogin';
import { TelemetryCards } from '../components/TelemetryCards';
import { PassTypesManager } from '../components/PassTypesManager';
import { RegistrationsTable } from '../components/RegistrationsTable';
import { ExportCSVButton } from '../components/ExportCSVButton';
import { EmailShoutout } from '../components/EmailShoutout';
import { SpeakersTable } from '../components/SpeakersTable';
import { PartnersTable } from '../components/PartnersTable';
import { SponsorsTable } from '../components/SponsorsTable';
import { VolunteersTable } from '../components/VolunteersTable';
import { AdminSettings } from '../components/AdminSettings';
import { PromoCodesManager } from '../components/PromoCodesManager';
import { ReferralLeaderboard } from '../components/ReferralLeaderboard';
import { Mic, Handshake, Building2, Settings, Tag, UserCheck, Gift } from 'lucide-react';

type Tab = 'overview' | 'passes' | 'promo' | 'referrals' | 'registrations' | 'speakers' | 'partners' | 'sponsors' | 'volunteers' | 'shoutout' | 'export' | 'settings';

const navItems: Array<{ key: Tab; label: string; icon: any }> = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'passes', label: 'Pass Types', icon: Ticket },
  { key: 'promo', label: 'Promo Codes', icon: Tag },
  { key: 'referrals', label: 'Referrals', icon: Gift },
  { key: 'registrations', label: 'Registrations', icon: Users },
  { key: 'speakers', label: 'CFP Speakers', icon: Mic },
  { key: 'partners', label: 'Partners', icon: Handshake },
  { key: 'sponsors', label: 'Sponsors', icon: Building2 },
  { key: 'volunteers', label: 'Volunteers', icon: UserCheck },
  { key: 'shoutout', label: 'Email Shoutout', icon: Mail },
  { key: 'export', label: 'Export', icon: Download },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export function AdminPage() {
  const { authed, login, logout } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!authed) {
    return <AdminLogin onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-white/60 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="font-sans font-black italic text-sm uppercase tracking-tight">
            Race Control
          </h1>
        </div>
        <span className="font-mono text-[9px] text-white/30 uppercase tracking-widest">
          {navItems.find(i => i.key === activeTab)?.label}
        </span>
      </header>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-56 border-r border-white/5 bg-[#0a0a0a] flex flex-col fixed h-full z-50 transition-transform duration-300 md:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
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
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1 text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button type="button"
              key={item.key}
              onClick={() => {
                setActiveTab(item.key);
                setSidebarOpen(false);
              }}
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
          <button type="button"
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-mono uppercase tracking-widest text-white/20 hover:text-f1-red hover:bg-f1-red/5 transition-colors"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-0 md:ml-56 p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8">
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
        {activeTab === 'promo' && <PromoCodesManager />}
        {activeTab === 'referrals' && <ReferralLeaderboard />}
        {activeTab === 'registrations' && <RegistrationsTable />}
        {activeTab === 'speakers' && <SpeakersTable />}
        {activeTab === 'partners' && <PartnersTable />}
        {activeTab === 'sponsors' && <SponsorsTable />}
        {activeTab === 'volunteers' && <VolunteersTable />}
        {activeTab === 'shoutout' && <EmailShoutout />}
        {activeTab === 'export' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Registrations Export */}
            <div className="bg-[#111] border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-sans font-black italic uppercase tracking-tight text-white mb-2">Export Registrations</h3>
                <p className="font-sans text-xs text-white/40 mb-6">
                  Download all attendee registration data including ticket details, payment status, and check-in logs.
                </p>
              </div>
              <div>
                <ExportCSVButton type="registrations" />
              </div>
            </div>

            {/* Volunteers Export */}
            <div className="bg-[#111] border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-sans font-black italic uppercase tracking-tight text-white mb-2">Export Volunteers</h3>
                <p className="font-sans text-xs text-white/40 mb-6">
                  Download volunteer registration lists including personal details, academic details (college, branch, degree, year), and selection status.
                </p>
              </div>
              <div>
                <ExportCSVButton type="volunteers" />
              </div>
            </div>

            {/* Speakers / CFP Export */}
            <div className="bg-[#111] border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-sans font-black italic uppercase tracking-tight text-white mb-2">Export Speakers (CFP)</h3>
                <p className="font-sans text-xs text-white/40 mb-6">
                  Download call-for-proposal submissions containing speaker bios, session titles, duration, abstract details, and review status.
                </p>
              </div>
              <div>
                <ExportCSVButton type="speakers" />
              </div>
            </div>

            {/* Sponsors Export */}
            <div className="bg-[#111] border border-white/5 p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-sans font-black italic uppercase tracking-tight text-white mb-2">Export Sponsors</h3>
                <p className="font-sans text-xs text-white/40 mb-6">
                  Download corporate sponsor enquiries including contact details, desired tiers, proposals, and status.
                </p>
              </div>
              <div>
                <ExportCSVButton type="sponsors" />
              </div>
            </div>

            {/* Partners Export */}
            <div className="bg-[#111] border border-white/5 p-6 flex flex-col justify-between text-left">
              <div>
                <h3 className="font-sans font-black italic uppercase tracking-tight text-white mb-2">Export Partners</h3>
                <p className="font-sans text-xs text-white/40 mb-6">
                  Download community partnership registration details, member sizes, websites, and validation status.
                </p>
              </div>
              <div>
                <ExportCSVButton type="partners" />
              </div>
            </div>
          </div>
        )}
        {activeTab === 'settings' && <AdminSettings />}
      </main>
    </div>
  );
}

