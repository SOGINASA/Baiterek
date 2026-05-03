import { create } from 'zustand';
import { MOCK_SERVICES } from '../constants/mockData';

export const useServicesStore = create((set, get) => ({
  services: [],
  loading: false,
  error: null,
  filters: { category: [], type: 'all', query: '' },

  fetchServices: () => {
    set({ loading: true });
    setTimeout(() => set({ services: MOCK_SERVICES, loading: false }), 400);
  },

  setFilter: (key, value) =>
    set(state => ({ filters: { ...state.filters, [key]: value } })),

  resetFilters: () =>
    set({ filters: { category: [], type: 'all', query: '' } }),

  getBySlug: (slug) => get().services.find(s => s.slug === slug),
}));
