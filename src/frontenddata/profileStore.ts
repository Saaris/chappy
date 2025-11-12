import { create } from "zustand";

interface ProfileState {
  isProfileOpen: boolean;
  openProfile: () => void;
  closeProfile: () => void;
  setProfileUserId: (userId: string | null) => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  isProfileOpen: false,
  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false }),
  setProfileUserId: (userId) => set({ isProfileOpen: !!userId }),
}));