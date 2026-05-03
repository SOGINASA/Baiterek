import { create } from 'zustand';

export const useAuthStore = create(set => ({
  user: null,
  isAuth: false,
  loading: false,

  login: (userData) => set({ user: userData, isAuth: true }),
  logout: () => set({ user: null, isAuth: false }),

  mockLogin: () => {
    set({ loading: true });
    setTimeout(() => {
      set({
        loading: false,
        isAuth: true,
        user: {
          id: 'user-001',
          name: 'Ахмет Сейткали',
          email: 'akhmet@example.kz',
          iin: '****1234',
          role: 'entrepreneur',
        },
      });
    }, 800);
  },
}));
