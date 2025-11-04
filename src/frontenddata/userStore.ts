import { create } from 'zustand';


interface UserState {
  username: string;
  token: string;
  setUsername: (username: string) => void; 
  setToken: (token: string) => void;
  logout: () => void;
  isLoggedIn: () => boolean;
  setGuest: () => void; //void för att det ej ska returnera värde
}


export const useUserStore = create<UserState & {setGuest: () => void}>((set, get) => ({
  username: '',
  token: '',
  setUsername: (username) => set({ username }),
  setToken: (token) => set({ token }),
  logout: () => set({ username: '', token: '' }),
  isLoggedIn: () => {
    const { username } = get();
    return !!username && username !== 'guest';
  },
  setGuest: () => set({ username: 'guest', token: '' })
}));


