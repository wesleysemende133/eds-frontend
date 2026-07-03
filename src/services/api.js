// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  timeout: 30000,
});

// Interceptor para adicionar token
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    let token = null;
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        token = parsed?.state?.token || null;
      } catch (e) {
        console.error('Erro ao parsear auth-storage:', e);
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ Para FormData, remover Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ [api] Erro:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🔒 Token expirado. Fazendo logout...');
      localStorage.removeItem('auth-storage');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.data?.message) {
      error.friendlyMessage = error.response.data.message;
    } else if (error.response?.data?.mensagem) {
      error.friendlyMessage = error.response.data.mensagem;
    } else {
      error.friendlyMessage = 'Erro na comunicação com o servidor';
    }
    
    return Promise.reject(error);
  }
);

export default api;
