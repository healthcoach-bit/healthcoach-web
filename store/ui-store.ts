import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  // Sidebar/menu state
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  
  // Filter states for food logs
  dateFilter: {
    from?: string;
    to?: string;
  };
  setDateFilter: (filter: { from?: string; to?: string }) => void;
  
  // Photo upload state
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  
  // Delete modal state
  deleteModal: {
    isOpen: boolean;
    itemId: string | null;
    itemType: 'foodLog' | 'photo' | null;
    onSuccess?: () => void;
  };
  openDeleteModal: (itemId: string, itemType: 'foodLog' | 'photo', onSuccess?: () => void) => void;
  closeDeleteModal: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial state
      isMobileMenuOpen: false,
      dateFilter: {},
      uploadProgress: 0,
      deleteModal: {
        isOpen: false,
        itemId: null,
        itemType: null,
        onSuccess: undefined,
      },
      
      // Actions
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setDateFilter: (filter) => set({ dateFilter: filter }),
      setUploadProgress: (progress) => set({ uploadProgress: progress }),
      openDeleteModal: (itemId, itemType, onSuccess) => set({
        deleteModal: { isOpen: true, itemId, itemType, onSuccess }
      }),
      closeDeleteModal: () => set({
        deleteModal: { isOpen: false, itemId: null, itemType: null, onSuccess: undefined }
      }),
    }),
    {
      name: 'healthcoach-ui-storage',
      partialize: (state) => ({
        // Only persist date filter
        dateFilter: state.dateFilter,
      }),
    }
  )
);
