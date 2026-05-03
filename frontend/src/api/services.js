const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const servicesAPI = {
  getAll: async (category, type, query) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (type && type !== 'all') params.append('type', type);
    if (query) params.append('query', query);

    const response = await fetch(`${API_BASE_URL}/services?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки услуг');
    return response.json();
  },

  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/services/${slug}`);
    if (!response.ok) throw new Error('Услуга не найдена');
    return response.json();
  },
};
