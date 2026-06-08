import { api } from '../../../lib/api';

const ADMIN_KEY = 'idkbutily';

const headers = { 'X-Admin-Key': ADMIN_KEY };

export const adminApi = {
  getStats: () => api.get('/api/admin/stats', { headers }),

  getRegistrations: (filters: {
    pass_slug?: string;
    payment_status?: string;
    checked_in?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/api/admin/registrations', { headers, params: filters }),

  exportCSV: () => api.get('/api/admin/export-csv', {
    headers,
    responseType: 'blob',
  }),

  updatePassType: (id: string, data: Record<string, any>) =>
    api.put(`/api/admin/passes/${id}`, data, { headers }),

  createPassType: (data: Record<string, any>) =>
    api.post('/api/admin/passes', data, { headers }),

  refund: (registration_id: string) =>
    api.post('/api/admin/refund', { registration_id }, { headers }),
};
