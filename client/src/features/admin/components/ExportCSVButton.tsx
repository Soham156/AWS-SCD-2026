import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';

interface ExportCSVButtonProps {
  type: 'registrations' | 'volunteers' | 'speakers' | 'sponsors' | 'partners' | 'mpds';
}

export function ExportCSVButton({ type }: ExportCSVButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      let res;
      let filename = 'scd-export';
      
      switch (type) {
        case 'registrations':
          res = await adminApi.exportCSV();
          filename = 'scd-registrations';
          break;
        case 'volunteers':
          res = await adminApi.exportVolunteers();
          filename = 'scd-volunteers';
          break;
        case 'speakers':
          res = await adminApi.exportSpeakers();
          filename = 'scd-speakers';
          break;
        case 'sponsors':
          res = await adminApi.exportSponsors();
          filename = 'scd-sponsors';
          break;
        case 'partners':
          res = await adminApi.exportPartners();
          filename = 'scd-partners';
          break;
        case 'mpds':
          res = await adminApi.exportMpds();
          filename = 'scd-mpd';
          break;
      }

      if (res && res.data) {
        const blob = new Blob([res.data], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `${filename}-${date}.csv`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-aws-orange disabled:bg-aws-orange/50 text-black text-xs font-mono uppercase tracking-widest font-bold hover:bg-white disabled:hover:bg-aws-orange/50 disabled:cursor-not-allowed transition-colors"
    >
      {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
