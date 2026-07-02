// src/lib/axios.js
import axios from 'axios'
import authStore from '../store/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    const token = authStore.getState().token
    
    // ✅ Log da requisição
    console.log('🌐 [axios] Requisição:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
      data: config.data,
      token: token ? `${token.substring(0, 20)}...` : 'SEM TOKEN'
    })
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
  },
  (error) => {
    console.error('❌ [axios] Erro na requisição:', error)
    return Promise.reject(error)
  }
)

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    // ✅ Log da resposta
    console.log('✅ [axios] Resposta:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data
    })
    return response
  },
  (error) => {
    console.error('❌ [axios] Erro na resposta:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    })
    
    if (error.response?.status === 401) {
      const token = authStore.getState().token
      if (token) {
        console.warn('🔒 Token expirado. Fazendo logout...')
        authStore.getState().logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    if (error.response?.data?.message) {
      error.friendlyMessage = error.response.data.message
    } else if (error.response?.data?.mensagem) {
      error.friendlyMessage = error.response.data.mensagem
    } else {
      error.friendlyMessage = 'Erro na comunicação com o servidor'
    }
    
    return Promise.reject(error)
  }
)

export default api