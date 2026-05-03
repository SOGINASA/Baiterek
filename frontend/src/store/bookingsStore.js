import { create } from 'zustand';
import { bookingsAPI } from '../api/bookings';

export const useBookingsStore = create((set) => ({
  bookings: [],
  loading: false,
  error: null,

  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const data = await bookingsAPI.getAll();
      set({ bookings: Array.isArray(data) ? data : [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false, bookings: [] });
    }
  },

  createBooking: async (bookingData) => {
    set({ loading: true, error: null });
    try {
      const data = await bookingsAPI.create(bookingData);
      set(state => ({ bookings: [data, ...state.bookings], loading: false }));
      return data;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  cancelBooking: async (id, reason) => {
    try {
      const data = await bookingsAPI.cancel(id, reason);
      set(state => ({
        bookings: state.bookings.map(b => b.id === id ? data : b),
      }));
      return data;
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },
}));
