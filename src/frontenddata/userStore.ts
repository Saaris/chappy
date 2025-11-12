import { create } from 'zustand';


interface UserState {
  username: string;
  userId: string;
  token: string;
  setUsername: (username: string) => void; 
  setUserId: (userId: string) => void;
  setToken: (token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  setGuest: () => void; //void för att det ej ska returnera värde
}


export const useUserStore = create<UserState & {setGuest: () => void}>((set, get) => ({
  username: '',
  userId: '',
  token: '',
  setUsername: (username) => set({ username }),
  setUserId: (userId) => set({ userId }),
  setToken: (token) => set({ token }),
  logout: () => set({ username: '', userId: '', token: '' }),
  isLoggedIn: () => {
    const { username } = get();
    return !!username && username !== 'guest';
  },
  setGuest: () => set({ username: 'guest', userId: '', token: '' })
}));


