import axios from 'axios'
import authStore from '../store/authStore' // Importe sua store do Zustand

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 🚀 INTERCEPTOR DEFENSIVO: Injeta o JWT automaticamente em cada request
api.interceptors.request.use(
  (config) => {
    // Obtém o token atualizado diretamente do estado do Zustand
    const token = authStore.getState().token

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api