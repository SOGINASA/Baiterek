const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const articlesAPI = {
  getAll: async ({ category, subsidiary, q } = {}) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (subsidiary) params.append('subsidiary', subsidiary);
    if (q) params.append('q', q);
    const response = await fetch(`${API_BASE_URL}/articles?${params}`);
    if (!response.ok) throw new Error('Ошибка загрузки статей');
    return response.json();
  },

  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
    if (!response.ok) throw new Error('Статья не найдена');
    return response.json();
  },
};
