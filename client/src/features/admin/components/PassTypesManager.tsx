import { useState, useEffect } from 'react';
import { Pencil, Save, X, Plus, Loader2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { api } from '../../../lib/api';
import { supabase } from '../../../lib/supabase';

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
  label: string | null;
}

export function PassTypesManager() {
  const [passTypes, setPassTypes] = useState<PassType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PassType>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
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

  useEffect(() => { 
    fetchPasses(); 
    
    const channel = supabase
      .channel('pass_types_manager_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pass_types' }, () => {
        fetchPasses();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'registrations' }, () => {
        // Registrations change sold count in backend
        fetchPasses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddNew = () => {
    setEditId(null);
    setFormData({ name: '', slug: '', description: '', price: 0, capacity: 0, perks: '', badge_color: '#6B7280', sort_order: 0, label: '' } as any);
    setShowCreate(true);
    setError(null);
  };

  const startEdit = (pt: PassType) => {
    setEditId(pt.id);
    setFormData({
      name: pt.name,
      slug: pt.slug,
      description: pt.description,
      price: pt.price,
      capacity: pt.capacity,
      perks: pt.perks.join(', '),
      badge_color: pt.badge_color,
      sort_order: pt.sort_order,
      is_active: pt.is_active,
      label: (pt as any).label || '',
    } as any);
    setShowCreate(true);
    setError(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setShowCreate(false);
    setError(null);
  };

  const saveEdit = async () => {
    if (!editId) return;
    setSaving(true);
    setError(null);
    try {
      await adminApi.updatePassType(editId, {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        perks: formData.perks.split(',').map(p => p.trim()).filter(Boolean),
        is_active: (formData as any).is_active,
        badge_color: formData.badge_color,
        sort_order: Number(formData.sort_order),
        label: (formData as any).label || null,
      });
      setEditId(null);
      setShowCreate(false);
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
        ...formData,
        price: Number(formData.price),
        capacity: Number(formData.capacity),
        sort_order: Number(formData.sort_order),
        perks: formData.perks.split(',').map(p => p.trim()).filter(Boolean),
        label: (formData as any).label || null,
      });
      setShowCreate(false);
      setFormData({ name: '', slug: '', description: '', price: 0, capacity: 0, perks: '', badge_color: '#6B7280', sort_order: 0 });
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
          onClick={handleAddNew}
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

      {/* Create / Edit form */}
      {showCreate && (
        <div className="border border-white/10 bg-[#111] p-6 mb-8 rounded-lg shadow-2xl">
          <h4 className="font-sans font-black italic text-xl text-white mb-6 uppercase tracking-tighter border-b border-white/10 pb-4">
            {editId ? 'Edit Pass Type' : 'Create New Pass Type'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Pass Name</label>
              <input value={formData.name} onChange={e => setFormData(d => ({...d, name: e.target.value}))} placeholder="e.g. VIP Paddock Pass" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>
            
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Slug (URL safe, no spaces)</label>
              <input value={formData.slug} onChange={e => setFormData(d => ({...d, slug: e.target.value}))} placeholder="e.g. vip-paddock" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Tag/Label (Optional)</label>
              <input value={(formData as any).label || ''} onChange={e => setFormData(d => ({...d, label: e.target.value}))} placeholder="e.g. MOST POPULAR, LIMITED" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Description</label>
              <input value={formData.description} onChange={e => setFormData(d => ({...d, description: e.target.value}))} placeholder="Short description of what the pass includes..." className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Price (₹)</label>
              <input type="number" value={formData.price} onChange={e => setFormData(d => ({...d, price: +e.target.value}))} placeholder="0" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Total Capacity</label>
              <input type="number" value={formData.capacity} onChange={e => setFormData(d => ({...d, capacity: +e.target.value}))} placeholder="0" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Perks (Comma Separated)</label>
              <textarea value={formData.perks} onChange={e => setFormData(d => ({...d, perks: e.target.value}))} placeholder="e.g. Front row seating, Exclusive Swag, Lunch included" rows={3} className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded resize-none" />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest block">Badge Color (Hex Code)</label>
              <div className="flex items-center gap-3 bg-[#050505] border border-white/10 px-3 py-1.5 rounded focus-within:border-aws-orange transition-colors">
                <div 
                  className="w-8 h-8 rounded border border-white/10 shrink-0" 
                  style={{ backgroundColor: formData.badge_color }} 
                />
                <input 
                  type="text" 
                  value={formData.badge_color} 
                  onChange={e => setFormData(d => ({...d, badge_color: e.target.value}))} 
                  placeholder="#FF9900"
                  maxLength={7}
                  className="bg-transparent border-none text-white font-mono text-sm uppercase w-full focus:outline-none placeholder:text-white/20" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Display Sort Order</label>
              <input type="number" value={formData.sort_order} onChange={e => setFormData(d => ({...d, sort_order: +e.target.value}))} placeholder="0" className="w-full bg-[#050505] border border-white/10 px-3 py-2.5 text-sm text-white font-mono focus:border-aws-orange focus:outline-none transition-colors rounded" />
            </div>
            
            {editId && (
              <div className="space-y-2">
                <label className="font-mono text-[10px] text-white/50 uppercase tracking-widest">Active Status</label>
                <div className="flex items-center gap-3 mt-2">
                  <button onClick={() => setFormData(d => ({...d, is_active: !(d as any).is_active}))} className={`w-10 h-5 rounded-full transition-colors relative ${((formData as any).is_active) ? 'bg-emerald-500' : 'bg-white/10'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${((formData as any).is_active) ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                  <span className="text-white/70 text-xs font-mono">{((formData as any).is_active) ? 'Active' : 'Hidden'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
            <button onClick={editId ? saveEdit : handleCreate} disabled={saving} className="px-6 py-2.5 bg-aws-orange text-black text-[11px] font-mono uppercase tracking-widest font-bold hover:bg-white disabled:opacity-50 rounded transition-colors shadow-[0_0_15px_rgba(255,153,0,0.3)]">
              {saving ? 'Saving...' : editId ? 'Save Changes' : 'Create Pass'}
            </button>
            <button onClick={cancelEdit} className="px-6 py-2.5 border border-white/10 text-white/60 text-[11px] font-mono uppercase tracking-widest hover:bg-white/5 hover:text-white rounded transition-colors">
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
              <th className="text-left py-2 px-3 font-mono text-white/30 uppercase tracking-widest text-[9px]">Tag</th>
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
                  <>
                    <td className="py-2 px-3 font-sans font-bold text-white">{pt.name}</td>
                    <td className="py-2 px-3 font-mono text-white/30">{pt.slug}</td>
                    <td className="py-2 px-3 font-mono text-white/50">{pt.label || '-'}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
