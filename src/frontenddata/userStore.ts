import { create } from 'zustand';

interface UserState {
  username: string;
  token: string;
  setUsername: (username: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  username: '',
  token: '',
  setUsername: (username) => set({ username }),
  setToken: (token) => set({ token }),
  logout: () => set({ username: '', token: '' })
}));


