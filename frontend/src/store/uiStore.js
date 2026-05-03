import { create } from 'zustand';

export const useUIStore = create(set => ({
  mobileMenuOpen:    false,
  searchOverlayOpen: false,
  filterDrawerOpen:  false,
  activeModal:       null,

  toggleMobileMenu:    () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  closeMobileMenu:     () => set({ mobileMenuOpen: false }),
  openSearchOverlay:   () => set({ searchOverlayOpen: true }),
  closeSearchOverlay:  () => set({ searchOverlayOpen: false }),
  openFilterDrawer:    () => set({ filterDrawerOpen: true }),
  closeFilterDrawer:   () => set({ filterDrawerOpen: false }),
  openModal:  (name)   => set({ activeModal: name }),
  closeModal:          () => set({ activeModal: null }),
}));
