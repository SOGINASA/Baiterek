const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const subsidiariesAPI = {
  getAll: async ({ withCounts } = {}) => {
    const params = new URLSearchParams();
    if (withCounts) params.append('with_counts', '1');
    const response = await fetch(`${API_BASE_URL}/subsidiaries?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки организаций');
    return response.json();
  },

  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/subsidiaries/${slug}`);
    if (!response.ok) throw new Error('Организация не найдена');
    return response.json();
  },

  getServices: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/subsidiaries/${slug}/services`);
    if (!response.ok) throw new Error('Ошибка загрузки услуг организации');
    return response.json();
  },

  getContacts: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/subsidiaries/${slug}/contacts`);
    if (!response.ok) throw new Error('Ошибка загрузки контактов');
    return response.json();
  },

  getNews: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/subsidiaries/${slug}/news`);
    if (!response.ok) throw new Error('Ошибка загрузки новостей');
    return response.json();
  },
};
