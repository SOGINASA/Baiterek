const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

export const notificationsAPI = {
  getAll: async ({ unread } = {}) => {
    const params = new URLSearchParams();
    if (unread) params.append('unread', '1');
    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка загрузки уведомлений');
    return response.json();
  },

  getUnreadCount: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/unread_count`, {
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка');
    return response.json();
  },

  markRead: async (id) => {
    const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка');
    return response.json();
  },

  markAllRead: async () => {
    const response = await fetch(`${API_BASE_URL}/notifications/read_all`, {
      method: 'PUT',
      headers: authHeaders(),
    });
    if (!response.ok) throw new Error('Ошибка');
    return response.json();
  },
};
