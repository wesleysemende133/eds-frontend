// hooks/useAuth.js
import { useCallback } from 'react';
import authStore from '../store/authStore';
import api from '../services/api';

export const useAuth = () => {
  const user = authStore((state) => state.user);
  const token = authStore((state) => state.token);
  const loading = authStore((state) => state.loading);
  const error = authStore((state) => state.error);
  const setUser = authStore((state) => state.setUser);
  const setToken = authStore((state) => state.setToken);
  const setError = authStore((state) => state.setError);
  const logout = authStore((state) => state.logout);
  const setLoading = authStore((state) => state.setLoading);

  // ============================================================
  // LOGIN
  // ============================================================

  const login = useCallback(async (email, senha) => {
    console.log('🔑 Login iniciado para:', email);
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/login', { email, senha });
      console.log('✅ Login OK:', data);
      
      setToken(data.token);
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        perfil: data.perfil
      });
      
      // ✅ Salvar no localStorage
      const authState = {
        state: {
          token: data.token,
          user: {
            id: data.id,
            nomeCompleto: data.nomeCompleto,
            email: data.email,
            perfil: data.perfil
          }
        }
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
      
      return data;
    } catch (err) {
      console.error('❌ Erro no login:', err);
      const mensagem = err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao fazer login';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setToken, setUser]);

  // ============================================================
  // REGISTRO DE UTILIZADOR COMUM
  // ============================================================

  const register = useCallback(async (dados) => {
    console.log('📝 Registo iniciado para:', dados.email);
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/registrar', {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha
      });

      console.log('✅ Registo OK:', data);
      
      setToken(data.token);
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        perfil: data.perfil
      });
      
      // ✅ Salvar no localStorage
      const authState = {
        state: {
          token: data.token,
          user: {
            id: data.id,
            nomeCompleto: data.nomeCompleto,
            email: data.email,
            perfil: data.perfil
          }
        }
      };
      localStorage.setItem('auth-storage', JSON.stringify(authState));
      
      return data;
    } catch (err) {
      console.error('❌ Erro no registo:', err);
      const mensagem = err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao registrar';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setToken, setUser]);

  // ============================================================
  // ✅ REGISTRO DE EMPRESA (NOVO)
  // ============================================================

  const registerEmpresa = useCallback(async (dados) => {
    console.log('🏢 Registo de empresa iniciado para:', dados.email);
    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/auth/registrar-empresa', {
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

      console.log('✅ Empresa registrada com sucesso:', data);
      
      // ❌ NÃO fazer login automático para empresa (pode ou não)
      // O admin/empresa deve fazer login separadamente
      
      setLoading(false);
      return data;
    } catch (err) {
      console.error('❌ Erro no registo de empresa:', err);
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao registrar empresa';
      setError(mensagem);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  // ============================================================
  // LIMPAR ERROS
  // ============================================================

  const limparErros = useCallback(() => {
    setError(null);
  }, [setError]);

  // ============================================================
  // RETORNO
  // ============================================================

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    registrar: register,        // ✅ Compatibilidade
    registerEmpresa,            // ✅ NOVO - Registo de empresa
    logout,
    limparErros,
    isAuthenticated: !!token
  };
};

export default useAuth;