import { create } from 'zustand';

export const useNotificationsStore = create(set => ({
  notifications: [],
  unreadCount: 0,
  
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
  
  markAsRead: (id) => set(state => {
    const notifications = state.notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    );
    
    const unreadCount = notifications.filter(notif => !notif.read).length;
    
    return { notifications, unreadCount };
  }),
  
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
  
  removeNotification: (id) => set(state => {
    const notifications = state.notifications.filter(notif => notif.id !== id);
    const unreadCount = notifications.filter(notif => !notif.read).length;
    
    return { notifications, unreadCount };
  }),
}));