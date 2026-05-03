const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export const bookingsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка загрузки бронирований');
    return response.json();
  },

  create: async ({ subsidiary_id, office_id, service_id, slot_at, duration_minutes = 30, note }) => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ subsidiary_id, office_id, service_id, slot_at, duration_minutes, note }),
    });
    if (!response.ok) throw new Error('Ошибка создания бронирования');
    return response.json();
  },

  cancel: async (id, reason) => {
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/cancel`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error('Ошибка отмены бронирования');
    return response.json();
  },
};
