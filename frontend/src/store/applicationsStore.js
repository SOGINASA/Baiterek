import { create } from 'zustand';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1489/api';

export const useApplicationsStore = create(set => ({
  applications: [],
  loading: false,
  error: null,
  
  fetchApplications: async () => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({ applications: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },
  
  fetchApplication: async (id) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      set({ application: data, loading: false });
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  // For creating/updating applications (if needed)
  createApplication: async (applicationData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Update the list by adding the new application
      set(state => ({
        applications: [...state.applications, data],
        loading: false
      }));
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
  
  updateApplication: async (id, applicationData) => {
    set({ loading: true, error: null });
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(applicationData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      // Update the application in the list
      set(state => ({
        applications: state.applications.map(app => 
          app.id === id ? data : app
        ),
        loading: false
      }));
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}));