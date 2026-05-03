import { create } from 'zustand';

let _id = 0;

export const useNotificationsStore = create(set => ({
  toasts: [],
  push: (message, type = 'info') =>
    set(s => ({ toasts: [...s.toasts, { id: ++_id, message, type }] })),
  dismiss: (id) =>
    set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));
