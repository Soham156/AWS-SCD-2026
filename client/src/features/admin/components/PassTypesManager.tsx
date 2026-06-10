import { useState, useEffect } from 'react';
import { Pencil, Save, X, Plus, Loader2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { api } from '../../../lib/api';

interface PassType {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  perks: string[];
  is_active: boolean;
  badge_color: string;
  sort_order: number;
}

export function PassTypesManager() {
  const [passTypes, setPassTypes] = useState<PassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PassType>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    name: '', slug: '', description: '', price: 0, capacity: 0,
    perks: '', badge_color: '#6B7280', sort_order: 0,
  });

  const fetchPasses = () => {
    adminApi.getPasses()
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPassTypes(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPasses(); }, []);

  const startEdit = (pt: PassType) => {
    setEditId(pt.id);
    setEditData({ ...pt, perks: pt.perks });
    setError(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({});
    setError(null);
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    setError(null);
    try {
      await adminApi.updatePassType(editId, {
        name: editData.name,
        description: editData.description,
        price: Number(editData.price),
        capacity: Number(editData.capacity),
        perks: editData.perks,
        is_active: editData.is_active,
        badge_color: editData.badge_color,
        sort_order: Number(editData.sort_order),
      });
      setEditId(null);
      fetchPasses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);
    setError(null);
    try {
      await adminApi.createPassType({
        ...createData,
        price: Number(createData.price),
        capacity: Number(createData.capacity),
        sort_order: Number(createData.sort_order),
        perks: createData.perks.split(',').map(p => p.trim()).filter(Boolean),
      });
      setShowCreate(false);
      setCreateData({ name: '', slug: '', description: '', price: 0, capacity: 0, perks: '', badge_color: '#6B7280', sort_order: 0 });
      fetchPasses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-white/30" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-sans font-bold text-sm text-white uppercase tracking-wider">Pass Types</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-aws-orange text-black text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-white transition-colors"
        >
          <Plus size={12} />
          Add Pass
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 border border-f1-red/30 bg-f1-red/10 text-f1-red text-xs font-mono">
          {error}
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="border border-white/10 bg-[#111] p-6 mb-8 rounded-lg shadow-2xl">
          <h4 className="font-sans font-black italic text-xl text-white mb-6 uppercase tracking-tighter border-b border-white/10 pb-4">
            Create New Pass Type
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Pass Name</label>
              <input value={createData.name} onChange={e => setCreateData(d => ({...d, name: e.target.value}))} placeholder="e.g. VIP Paddock Pass" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Slug (URL safe, no spaces)</label>
              <input value={createData.slug} onChange={e => setCreateData(d => ({...d, slug: e.target.value}))} placeholder="e.g. vip-paddock" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Description</label>
              <input value={createData.description} onChange={e => setCreateData(d => ({...d, description: e.target.value}))} placeholder="Short description of what the pass includes..." className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Price (₹)</label>
              <input type="number" value={createData.price} onChange={e => setCreateData(d => ({...d, price: +e.target.value}))} placeholder="0" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Total Capacity</label>
              <input type="number" value={createData.capacity} onChange={e => setCreateData(d => ({...d, capacity: +e.target.value}))} placeholder="0" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Perks (Comma Separated)</label>
              <textarea value={createData.perks} onChange={e => setCreateData(d => ({...d, perks: e.target.value}))} placeholder="e.g. Front row seating, Exclusive Swag, Lunch included" rows={3} className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded resize-none" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest block">Badge Color</label>
              <div className="flex items-center gap-3 bg-[#050505] border border-white/10 px-3 py-1.5 rounded focus-within:border-aws-orange transition-colors">
                <input type="color" value={createData.badge_color} onChange={e => setCreateData(d => ({...d, badge_color: e.target.value}))} className="bg-transparent border-0 w-8 h-8 cursor-pointer rounded" />
                <span className="text-white/70 font-mono text-xs">{createData.badge_color}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Display Sort Order</label>
              <input type="number" value={createData.sort_order} onChange={e => setCreateData(d => ({...d, sort_order: +e.target.value}))} placeholder="0" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <button onClick={handleCreate} disabled={saving} className="px-6 py-2.5 bg-emerald-500 text-white text-[11px] font-mono uppercase tracking-widest font-bold hover:bg-emerald-400 disabled:opacity-50 rounded transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              {saving ? 'Creating...' : 'Create Pass'}
            </button>
            <button onClick={() => setShowCreate(false)} className="px-6 py-2.5 border border-white/10 text-white/60 text-[11px] font-mono uppercase tracking-widest hover:bg-white/5 hover:text-white rounded transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Name</th>
              <th className="text-left py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Slug</th>
              <th className="text-right py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Price</th>
              <th className="text-right py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Sold/Cap</th>
              <th className="text-center py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Active</th>
              <th className="text-center py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Color</th>
              <th className="text-right py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {passTypes.map((pt) => (
              <tr key={pt.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                {editId === pt.id ? (
                  <>
                    <td className="py-2 px-3">
                      <input value={editData.name || ''} onChange={e => setEditData(d => ({...d, name: e.target.value}))} className="bg-[#0a0a0a] border border-white/10 px-2 py-1 text-xs text-white font-mono w-full focus:border-aws-orange focus:outline-none" />
                    </td>
                    <td className="py-2 px-3 font-mono text-white/30">{pt.slug}</td>
                    <td className="py-2 px-3">
                      <input type="number" value={editData.price || 0} onChange={e => setEditData(d => ({...d, price: +e.target.value}))} className="bg-[#0a0a0a] border border-white/10 px-2 py-1 text-xs text-white font-mono w-20 text-right focus:border-aws-orange focus:outline-none" />
                    </td>
                    <td className="py-2 px-3">
                      <input type="number" value={editData.capacity || 0} onChange={e => setEditData(d => ({...d, capacity: +e.target.value}))} className="bg-[#0a0a0a] border border-white/10 px-2 py-1 text-xs text-white font-mono w-16 text-right focus:border-aws-orange focus:outline-none" />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button onClick={() => setEditData(d => ({...d, is_active: !d.is_active}))} className={`w-8 h-4 rounded-full transition-colors ${editData.is_active ? 'bg-emerald-500' : 'bg-white/10'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${editData.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <input type="color" value={editData.badge_color || '#6B7280'} onChange={e => setEditData(d => ({...d, badge_color: e.target.value}))} className="w-6 h-6 bg-transparent border-0" />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={saveEdit} disabled={saving} className="p-1.5 text-emerald-400 hover:bg-emerald-400/10 transition-colors">
                          <Save size={14} />
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 text-white/30 hover:bg-white/5 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="py-2 px-3 font-sans font-bold text-white">{pt.name}</td>
                    <td className="py-2 px-3 font-mono text-white/30">{pt.slug}</td>
                    <td className="py-2 px-3 text-right font-mono text-white">₹{pt.price}</td>
                    <td className="py-2 px-3 text-right font-mono">
                      <span className="text-aws-orange">{pt.sold}</span>
                      <span className="text-white/20">/{pt.capacity}</span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-block w-2 h-2 rounded-full ${pt.is_active ? 'bg-emerald-400' : 'bg-white/10'}`} />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: pt.badge_color }} />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => startEdit(pt)} className="p-1.5 text-white/30 hover:text-aws-orange hover:bg-white/5 transition-colors">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
