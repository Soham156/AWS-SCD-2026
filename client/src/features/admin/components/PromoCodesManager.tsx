import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Tag, Plus, Loader2, Edit2, Trash2, X, Eye, Users } from 'lucide-react';
import { usePromoCodes, type PromoCode, type PromoOrder } from '../hooks/usePromoCodes';

export function PromoCodesManager() {
  const { promos, loading, createPromo, updatePromo, deletePromo, getPromoOrders } = usePromoCodes();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: 10,
    min_quantity: 1,
    max_uses: 100,
    is_active: true
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewingOrders, setViewingOrders] = useState<{ promo: PromoCode, orders: PromoOrder[] } | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const handleOpenCreate = () => {
    setEditingPromo(null);
    setFormData({ code: '', discount_percentage: 10, min_quantity: 1, max_uses: 100, is_active: true });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormData({
      code: promo.code,
      discount_percentage: promo.discount_percentage,
      min_quantity: promo.min_quantity,
      max_uses: promo.max_uses,
      is_active: promo.is_active
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleViewOrders = async (promo: PromoCode) => {
    setOrdersLoading(true);
    setViewingOrders({ promo, orders: [] }); // Open modal immediately with loading state
    const { success, data } = await getPromoOrders(promo.id);
    if (success && data) {
      setViewingOrders({ promo, orders: data });
    }
    setOrdersLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload = {
      ...formData,
      discount_percentage: Number(formData.discount_percentage),
      min_quantity: Number(formData.min_quantity),
      max_uses: Number(formData.max_uses)
    };

    let result;
    if (editingPromo) {
      result = await updatePromo(editingPromo.id, payload);
    } else {
      result = await createPromo(payload);
    }

    if (result.success) {
      setIsFormOpen(false);
    } else {
      setFormError(result.error || 'Operation failed');
    }
    setFormLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this promo code? This cannot be undone.')) return;
    await deletePromo(id);
  };

  if (loading && !promos.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-aws-orange" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 bg-aws-orange text-black font-mono text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-colors"
        >
          <Plus size={16} /> New Promo Code
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/5 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 font-mono text-[10px] uppercase tracking-widest text-white/40 bg-black/40">
              <th className="p-4 font-normal">Code</th>
              <th className="p-4 font-normal">Discount</th>
              <th className="p-4 font-normal">Min Qty</th>
              <th className="p-4 font-normal">Usage</th>
              <th className="p-4 font-normal">Status</th>
              <th className="p-4 font-normal text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promos.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-white/30 font-mono text-xs">
                  No promo codes found
                </td>
              </tr>
            ) : (
              promos.map((promo) => (
                <tr key={promo.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                  <td className="p-4">
                    <span className="font-mono text-sm font-bold text-white bg-white/10 px-2 py-1 rounded-sm">
                      {promo.code}
                    </span>
                  </td>
                  <td className="p-4 font-sans font-bold text-aws-orange">
                    {promo.discount_percentage}%
                  </td>
                  <td className="p-4 font-mono text-xs text-white/70">
                    {promo.min_quantity} tickets
                  </td>
                  <td className="p-4 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className={promo.uses >= promo.max_uses ? 'text-f1-red' : 'text-white'}>
                        {promo.uses} / {promo.max_uses}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest rounded-sm ${promo.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {promo.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleViewOrders(promo)}
                      className="p-1.5 text-white/40 hover:text-white transition-colors"
                      title="View Orders"
                    >
                      <Users size={16} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(promo)}
                      className="p-1.5 text-white/40 hover:text-aws-orange transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(promo.id)}
                      className="p-1.5 text-white/40 hover:text-f1-red transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aws-orange to-f1-red" />
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-sans font-black italic text-xl uppercase tracking-tight text-white">
                    {editingPromo ? 'Edit Promo Code' : 'New Promo Code'}
                  </h3>
                  <button onClick={() => setIsFormOpen(false)} className="text-white/40 hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="p-3 bg-f1-red/10 border border-f1-red/20 text-f1-red text-xs font-mono uppercase">
                      {formError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Code</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white font-mono uppercase focus:border-aws-orange focus:outline-none transition-colors"
                      placeholder="e.g. EARLYBIRD20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={formData.discount_percentage}
                        onChange={e => setFormData({ ...formData, discount_percentage: Number(e.target.value) })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white font-mono focus:border-aws-orange focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Min. Quantity</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formData.min_quantity}
                        onChange={e => setFormData({ ...formData, min_quantity: Number(e.target.value) })}
                        className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white font-mono focus:border-aws-orange focus:outline-none transition-colors"
                        title="Minimum tickets required to apply"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-white/40 mb-2">Max Uses</label>
                    <input
                      type="number"
                      min={editingPromo ? editingPromo.uses : 1}
                      required
                      value={formData.max_uses}
                      onChange={e => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                      className="w-full bg-[#111] border border-white/10 px-4 py-3 text-white font-mono focus:border-aws-orange focus:outline-none transition-colors"
                      title="Total times this code can be used"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.is_active}
                      onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 accent-aws-orange bg-[#111] border-white/10"
                    />
                    <label htmlFor="isActive" className="text-sm text-white/70">
                      Active (can be used by attendees)
                    </label>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsFormOpen(false)}
                      className="px-6 py-3 text-xs font-mono uppercase tracking-widest text-white/50 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className="px-6 py-3 bg-white text-black text-xs font-mono uppercase tracking-widest font-bold hover:bg-aws-orange transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {formLoading && <Loader2 size={14} className="animate-spin" />}
                      Save Promo Code
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Orders Modal */}
      <AnimatePresence>
        {viewingOrders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl bg-[#0a0a0a] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-aws-orange to-f1-red" />
              
              <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-sans font-black italic text-xl uppercase tracking-tight text-white flex items-center gap-3">
                    <Tag className="text-aws-orange" size={24} />
                    {viewingOrders.promo.code} Usage
                  </h3>
                  <p className="font-mono text-xs text-white/40 mt-1">Orders that successfully used this promo code.</p>
                </div>
                <button onClick={() => setViewingOrders(null)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {ordersLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="animate-spin text-aws-orange" size={32} />
                  </div>
                ) : viewingOrders.orders.length === 0 ? (
                  <div className="text-center py-12 text-white/30 font-mono text-sm">
                    No orders have used this promo code yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 font-mono text-[10px] uppercase tracking-widest text-white/40">
                        <th className="pb-3 font-normal">Order ID</th>
                        <th className="pb-3 font-normal">Primary Email</th>
                        <th className="pb-3 font-normal">Date</th>
                        <th className="pb-3 font-normal text-right">Discount</th>
                        <th className="pb-3 font-normal text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingOrders.orders.map(order => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 font-mono text-[10px] text-white/50">
                            {order.id.split('-')[0]}...
                          </td>
                          <td className="py-3 font-sans text-sm text-white">
                            {order.primary_email || 'Pending'}
                          </td>
                          <td className="py-3 font-mono text-xs text-white/50">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 font-mono text-sm text-aws-orange text-right">
                            ₹{order.discount}
                          </td>
                          <td className="py-3 font-sans font-bold text-white text-right">
                            ₹{order.total_amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
