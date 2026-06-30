import { create } from 'zustand'

const authStore = create((set) => ({
  // --- ESTADOS GLOBAIS ---
  user: null,
  token: null,
  loading: false,
  error: null,

  // --- AÇÕES MODIFICADORAS (ACTIONS) ---
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setLoading: (loading) => set({ loading }), // Garante que a função exista no contrato
  setError: (error) => set({ error }),
  logout: () => set({ user: null, token: null, error: null })
}))

export default authStore