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


export const useUserStore = create<UserState & { setGuest: () => void; initialize: () => void }>((set, get) => ({
  username: '',
  userId: '',
  token: '',
  setUsername: (username) => {
    set({ username });
    localStorage.setItem('chappy_username', username);
  },
  setUserId: (userId) => {
    set({ userId });
    localStorage.setItem('chappy_userId', userId);
  },
  setToken: (token) => {
    set({ token });
    localStorage.setItem('chappy_jwt', token);
  },
  logout: () => {
    set({ username: '', userId: '', token: '' });
    localStorage.removeItem('chappy_username');
    localStorage.removeItem('chappy_userId');
    localStorage.removeItem('chappy_jwt');
  },
  isLoggedIn: () => {
    const { username } = get();
    return !!username && username !== 'guest';
  },
  setGuest: () => {
    set({ username: 'guest', userId: '', token: '' });
    localStorage.setItem('chappy_username', 'guest');
    localStorage.setItem('chappy_userId', '');
    localStorage.setItem('chappy_jwt', '');
  },
  initialize: () => {
    const username = localStorage.getItem('chappy_username') || '';
    const userId = localStorage.getItem('chappy_userId') || '';
    const token = localStorage.getItem('chappy_jwt') || '';
    set({ username, userId, token });
  }
}));


