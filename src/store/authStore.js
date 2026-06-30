import { create } from 'zustand'

const authStore = create((set) => ({
  user: (() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })(),
  token: localStorage.getItem('token') || null,
  loading: false,
  error: null,

  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  },

  setToken: (token) => {
    set({ token })
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  logout: () => {
    set({ user: null, token: null, error: null })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  isAuthenticated: () => {
    const { token } = authStore.getState()
    return !!token
  },
}))

export default authStore
