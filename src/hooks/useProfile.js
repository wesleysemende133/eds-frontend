// src/hooks/useProfile.js
import { useState, useCallback } from 'react';
import api from '../services/api';
import authStore from '../store/authStore';

export const useProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const setUser = authStore((state) => state.setUser);
  const user = authStore((state) => state.user);

  // ✅ BUSCAR PERFIL
  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await api.get('/usuarios/perfil');
      console.log('📥 Perfil recebido:', data);
      
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto || data.name,
        email: data.email,
        perfil: data.perfil,
        empresa: data.empresa,
        telefone: data.telefone,
      });
      
      return data;
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao carregar perfil';
      setError(mensagem);
      console.error('❌ Erro ao buscar perfil:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // ✅ ATUALIZAR PERFIL E RECARREGAR
  const updateProfile = useCallback(async (dados) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📤 Atualizando perfil com:', dados);
      
      const { data } = await api.put('/usuarios/perfil', {
        nome: dados.name || dados.nome,
        empresa: dados.company || dados.empresa,
        telefone: dados.phone || dados.telefone,
      });
      
      console.log('✅ Perfil atualizado:', data);
      
      // ✅ Atualizar o store com os dados recebidos
      setUser({
        ...user,
        nomeCompleto: data.nomeCompleto || data.name,
        empresa: data.empresa,
        telefone: data.telefone,
      });
      
      // ✅ Atualizar também o localStorage
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          parsed.state.user = {
            ...parsed.state.user,
            nomeCompleto: data.nomeCompleto || data.name,
            empresa: data.empresa,
            telefone: data.telefone,
          };
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        } catch (e) {
          console.error('Erro ao atualizar localStorage:', e);
        }
      }
      
      return data;
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao atualizar perfil';
      setError(mensagem);
      console.error('❌ Erro ao atualizar perfil:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser, user]);

  // ✅ ALTERAR SENHA
  const changePassword = useCallback(async (senhaAtual, novaSenha) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data } = await api.put('/usuarios/alterar-senha', {
        senhaAtual,
        novaSenha
      });
      
      return data;
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao alterar senha';
      setError(mensagem);
      console.error('❌ Erro ao alterar senha:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getProfile,
    updateProfile,
    changePassword,
    loading,
    error
  };
};

export default useProfile;
