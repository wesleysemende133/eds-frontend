import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const authStore = create(
  persist(
    (set) => ({
      // --- ESTADOS GLOBAIS ---
      user: null,
      token: null,
      loading: false,
      error: null,

      // --- AÇÕES MODIFICADORAS (ACTIONS) ---
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      logout: () => {
        set({ user: null, token: null, error: null });
        // Remover do localStorage também
        localStorage.removeItem('auth-storage');
      },
    }),
    {
      name: 'auth-storage', // Nome no localStorage
    }
  )
);

export default authStore;
