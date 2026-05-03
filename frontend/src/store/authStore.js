import { create } from 'zustand';

export const useAuthStore = create(set => ({
  user: null,
  isAuth: false,
  loading: false,
  
  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.access_token);
      
      set({ 
        user: data.user, 
        isAuth: true, 
        loading: false 
      });
      
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  register: async (email, password, fullName, binNumber) => {
    set({ loading: true });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName, bin_number: binNumber })
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      const data = await response.json();
      
      // Store token in localStorage
      localStorage.setItem('token', data.access_token);
      
      set({ 
        user: data.user, 
        isAuth: true, 
        loading: false 
      });
      
      return data;
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuth: false });
  },
  
  // Initialize auth state from localStorage
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, we would validate the token with the backend
      // For now, we'll just set isAuth to true and fetch user profile
      set({ isAuth: true, loading: true });
      
      // Fetch user profile
      fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        return response.json();
      })
      .then(data => {
        set({ user: data.user, isAuth: true, loading: false });
      })
      .catch(error => {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        set({ user: null, isAuth: false, loading: false });
      });
    }
  }
}));