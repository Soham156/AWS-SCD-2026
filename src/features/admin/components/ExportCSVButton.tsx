import { Download } from 'lucide-react';
import { adminApi } from '../services/adminApi';

export function ExportCSVButton() {
  const handleExport = async () => {
    try {
      const res = await adminApi.exportCSV();
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const date = new Date().toISOString().split('T')[0];
      link.download = `scd-registrations-${date}.csv`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    }
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-aws-orange text-black text-xs font-mono uppercase tracking-widest font-bold hover:bg-white transition-colors"
    >
      <Download size={14} />
      Export CSV
    </button>
  );
}
