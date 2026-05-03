import { create } from 'zustand';
import { MOCK_NEWS } from '../constants/mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const useNewsStore = create((set, get) => ({
  news: [],
  featured: null,
  article: null,
  loading: false,
  error: null,

  fetchNews: async ({ type, subsidiary, q } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (type && type !== 'all') params.append('type', type);
      if (subsidiary) params.append('subsidiary', subsidiary);
      if (q) params.append('q', q);
      const response = await fetch(`${API_BASE_URL}/news?${params}`);
      if (!response.ok) throw new Error('Ошибка загрузки новостей');
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.items ?? [];
      set({
        news: list,
        featured: list.find(n => n.is_featured) ?? list[0] ?? null,
        loading: false,
      });
    } catch (err) {
      console.warn('API недоступен, используем mock:', err.message);
      const list = MOCK_NEWS;
      set({ news: list, featured: list.find(n => n.featured) ?? null, loading: false, error: err.message });
    }
  },

  fetchBySlug: async (slug) => {
    set({ loading: true, error: null, article: null });
    try {
      const response = await fetch(`${API_BASE_URL}/news/${slug}`);
      if (!response.ok) throw new Error('Новость не найдена');
      const data = await response.json();
      set({ article: data, loading: false });
      return data;
    } catch (err) {
      const fallback = get().news.find(n => n.slug === slug) ?? MOCK_NEWS.find(n => n.slug === slug) ?? null;
      set({ article: fallback, loading: false, error: err.message });
      return fallback;
    }
  },
}));
