import { create } from "zustand";

interface ProfileState {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  toggleProfile: () => void;
  profileUserId: string | null;
  setProfileUserId: (userId: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isProfileOpen: false,
  profileUserId: null,
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false, profileUserId: null }),
  toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
  setProfileUserId: (userId) => set({ profileUserId: userId, isProfileOpen: !!userId }),
}));