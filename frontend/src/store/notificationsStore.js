import { create } from 'zustand';
import { notificationsAPI } from '../api/notifications';

export const useNotificationsStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    try {
      const data = await notificationsAPI.getAll();
      const list = Array.isArray(data) ? data : [];
      set({ notifications: list, unreadCount: list.filter(n => !n.is_read).length });
    } catch (err) {
      console.warn('Не удалось загрузить уведомления:', err.message);
    }
  },

  fetchUnreadCount: async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      set({ unreadCount: data.count ?? 0 });
    } catch {
      // silent
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationsAPI.markAllRead();
      set(state => ({
        notifications: state.notifications.map(n => ({ ...n, is_read: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.warn(err.message);
    }
  },
  
  addNotification: (message, type = 'info') => set(state => {
    const newNotification = {
      id: Date.now() + Math.random(),
      message,
      type, // info, success, warning, error
      timestamp: new Date(),
      read: false
    };
    
    return {
      notifications: [newNotification, ...state.notifications].slice(0, 50), // Keep last 50
      unreadCount: state.unreadCount + 1
    };
  }),
  
  markAsRead: async (id) => {
    try { await notificationsAPI.markRead(id); } catch { /* local fallback */ }
    set(state => {
      const notifications = state.notifications.map(n =>
        n.id === id ? { ...n, read: true, is_read: true } : n
      );
      return { notifications, unreadCount: notifications.filter(n => !n.is_read && !n.read).length };
    });
  },
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  
  removeNotification: (id) => set(state => {
    const notifications = state.notifications.filter(notif => notif.id !== id);
    const unreadCount = notifications.filter(notif => !notif.read).length;
    
    return { notifications, unreadCount };
  }),
}));