import { create } from 'zustand';
import { MOCK_ARTICLES } from '../constants/mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const useArticlesStore = create((set, get) => ({
  articles: [],
  article: null,
  loading: false,
  error: null,

  fetchArticles: async ({ category, subsidiary, q } = {}) => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (subsidiary) params.append('subsidiary', subsidiary);
      if (q) params.append('q', q);
      const response = await fetch(`${API_BASE_URL}/articles?${params}`);
      if (!response.ok) throw new Error('Ошибка загрузки статей');
      const data = await response.json();
      const list = Array.isArray(data) ? data : data.items ?? [];
      set({ articles: list, loading: false });
    } catch (err) {
      console.warn('API недоступен, используем mock:', err.message);
      set({ articles: MOCK_ARTICLES, loading: false, error: err.message });
    }
  },

  fetchBySlug: async (slug) => {
    set({ loading: true, error: null, article: null });
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${slug}`);
      if (!response.ok) throw new Error('Статья не найдена');
      const data = await response.json();
      set({ article: data, loading: false });
      return data;
    } catch (err) {
      const fallback = get().articles.find(a => a.slug === slug) ?? MOCK_ARTICLES.find(a => a.slug === slug) ?? null;
      set({ article: fallback, loading: false, error: err.message });
      return fallback;
    }
  },
}));
