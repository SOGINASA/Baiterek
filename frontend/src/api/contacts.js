const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const contactsAPI = {
  getAll: async ({ subsidiary, city } = {}) => {
    const params = new URLSearchParams();
    if (subsidiary) params.append('subsidiary', subsidiary);
    if (city) params.append('city', city);
    const response = await fetch(`${API_BASE_URL}/contacts?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки контактов');
    return response.json();
  },
};
