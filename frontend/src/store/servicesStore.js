import { create } from 'zustand';
import { servicesAPI } from '../api/services';
import { MOCK_SERVICES } from '../constants/mockData';

export const useServicesStore = create((set, get) => ({
  services: [],
  loading: false,
  error: null,
  filters: { category: [], type: 'all', query: '' },

  fetchServices: async () => {
    set({ loading: true, error: null });
    try {
      const { category, type, query } = get().filters;
      const categoryStr = category.length > 0 ? category[0] : null;
      
      const data = await servicesAPI.getAll(categoryStr, type, query);
      set({ services: data, loading: false });
    } catch (err) {
      console.warn('API ошибка, используем MOCK данные:', err.message);
      set({ services: MOCK_SERVICES, loading: false, error: err.message });
    }
  },

  setFilter: (key, value) => {
    set(state => ({ filters: { ...state.filters, [key]: value } }));
    // Перезагружаем услуги после изменения фильтров
    setTimeout(() => get().fetchServices(), 100);
  },

  resetFilters: () => {
    set({ filters: { category: [], type: 'all', query: '' } });
    setTimeout(() => get().fetchServices(), 100);
  },

  getBySlug: (slug) => get().services.find(s => s.slug === slug),
}));
