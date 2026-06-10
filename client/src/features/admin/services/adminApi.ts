import { api } from '../../../lib/api';

const getHeaders = () => ({
  'X-Admin-Key': sessionStorage.getItem('scd_admin_key') || '',
});

export const adminApi = {
  getStats: () => api.get('/api/admin/stats', { headers: getHeaders() }),

  getRegistrations: (filters: {
    pass_slug?: string;
    payment_status?: string;
    checked_in?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => api.get('/api/admin/registrations', { headers: getHeaders(), params: filters }),

  exportCSV: () => api.get('/api/admin/export-csv', {
    headers: getHeaders(),
    responseType: 'blob',
  }),

  updatePassType: (id: string, data: Record<string, any>) =>
    api.put(`/api/admin/passes/${id}`, data, { headers: getHeaders() }),

  createPassType: (data: Record<string, any>) =>
    api.post('/api/admin/passes', data, { headers: getHeaders() }),

  refund: (registration_id: string) =>
    api.post('/api/admin/refund', { registration_id }, { headers: getHeaders() }),
};
