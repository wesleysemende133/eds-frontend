import axios from 'axios';

// Cria a instância centralizada que todos os seus hooks (como useInvoices e useProfile) vão consumir
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000, // 15 segundos de timeout (bom para evitar travamentos em plataformas gratuitas)
});

// Interceptor Sênior: Injeta automaticamente o Token JWT em cada requisição se ele existir no localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('@EDS:token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de Resposta: Trata erros globais (como token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o back-end Java retornar 401 Unauthorized, limpa o token e desloga o usuário
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('@EDS:token');
      // Redirecionamento forçado para a tela de login se necessário:
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;