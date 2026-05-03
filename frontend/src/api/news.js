const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const newsAPI = {
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/news`);
    if (!response.ok) throw new Error('Ошибка загрузки новостей');
    return response.json();
  },

  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/news/${slug}`);
    if (!response.ok) throw new Error('Новость не найдена');
    return response.json();
  },
};
