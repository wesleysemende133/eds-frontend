// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';

const authStore = create(
  persist(
    (set, get) => ({
      // ============================================================
      // ESTADOS GLOBAIS
      // ============================================================
      user: null,
      token: null,
      loading: false,
      error: null,

      // ============================================================
      // AÇÕES MODIFICADORAS
      // ============================================================
      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      logout: () => {
        set({ user: null, token: null, error: null });
        localStorage.removeItem('auth-storage');
      },

      // ============================================================
      // ✅ MÉTODOS DE AUTENTICAÇÃO
      // ============================================================

      // ✅ LOGIN
      login: async (email, senha) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, senha });
          const { token, id, email: userEmail, nomeCompleto, perfil } = response.data;
          
          set({
            user: { id, email: userEmail, nome: nomeCompleto, perfil },
            token,
            loading: false,
            error: null,
          });
          
          return response.data;
        } catch (error) {
          const mensagem = error.response?.data?.message || 
                           error.response?.data?.mensagem || 
                           'Erro ao fazer login';
          set({ error: mensagem, loading: false });
          throw error;
        }
      },

      // ✅ REGISTRO DE UTILIZADOR COMUM
      registrar: async (dados) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/registrar', {
            nome: dados.nome,
            email: dados.email,
            senha: dados.senha,
            telefone: dados.telefone || '',
          });
          set({ loading: false });
          return response.data;
        } catch (error) {
          const mensagem = error.response?.data?.message || 
                           error.response?.data?.mensagem || 
                           'Erro ao registrar';
          set({ error: mensagem, loading: false });
          throw error;
        }
      },

      // ✅ REGISTRO DE EMPRESA
      registrarEmpresa: async (dados) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/registrar-empresa', {
            nome: dados.nome,
            email: dados.email,
            senha: dados.senha,
            telefone: dados.telefone || '',
            nuit: dados.nuit,
            endereco: dados.endereco || '',
            website: dados.website || '',
            adminNome: dados.adminNome,
            adminEmail: dados.adminEmail,
            adminSenha: dados.adminSenha,
            adminTelefone: dados.adminTelefone || '',
            funcionarios: dados.funcionarios || [],
          });
          set({ loading: false });
          return response.data;
        } catch (error) {
          const mensagem = error.response?.data?.message || 
                           error.response?.data?.mensagem || 
                           'Erro ao registrar empresa';
          set({ error: mensagem, loading: false });
          throw error;
        }
      },

      // ============================================================
      // MÉTODOS DE CONSULTA (GETTERS)
      // ============================================================

      isAuthenticated: () => {
        return !!get().token;
      },

      isAdmin: () => {
        return get().user?.perfil === 'ADMIN';
      },

      isEmpresa: () => {
        return get().user?.perfil === 'EMPRESA';
      },

      isEmpresaAdmin: () => {
        return get().user?.perfil === 'EMPRESA_ADMIN';
      },

      getUser: () => {
        return get().user;
      },

      getToken: () => {
        return get().token;
      },
    }),
    {
      name: 'auth-storage', // Nome no localStorage
    }
  )
);

export default authStore;