// src/hooks/useAdmin.js
import { useCallback } from 'react';
// 🔥 Importar SEM .js
import api from '../services/api';

export const useAdmin = () => {
  
  // ============================================================
  // DASHBOARD
  // ============================================================

  const getDashboardMetrics = useCallback(async () => {
    try {
      console.log('📊 [useAdmin] Buscando métricas do dashboard...');
      const { data } = await api.get('/admin/dashboard/metricas');
      console.log('📊 [useAdmin] Métricas recebidas:', data);
      return data;
    } catch (err) {
      console.error('❌ [useAdmin] Erro ao buscar métricas:', err);
      throw err;
    }
  }, []);

  // ============================================================
  // GESTÃO DE USUÁRIOS
  // ============================================================

  const getUsuarios = useCallback(async () => {
    try {
      console.log('👥 [useAdmin] Buscando lista de utilizadores...');
      const { data } = await api.get('/admin/usuarios');
      console.log('👥 [useAdmin] Utilizadores recebidos:', data);
      return data;
    } catch (err) {
      console.error('❌ [useAdmin] Erro ao buscar utilizadores:', err);
      throw err;
    }
  }, []);

  const ativarUsuario = useCallback(async (id) => {
    try {
      console.log('✅ [useAdmin] Ativando utilizador:', id);
      await api.post(`/admin/usuarios/${id}/ativar`);
      console.log('✅ [useAdmin] Utilizador ativado com sucesso');
      return true;
    } catch (err) {
      console.error('❌ [useAdmin] Erro ao ativar utilizador:', err);
      throw err;
    }
  }, []);

  const desativarUsuario = useCallback(async (id) => {
    try {
      console.log('⛔ [useAdmin] Desativando utilizador:', id);
      await api.post(`/admin/usuarios/${id}/desativar`);
      console.log('⛔ [useAdmin] Utilizador desativado com sucesso');
      return true;
    } catch (err) {
      console.error('❌ [useAdmin] Erro ao desativar utilizador:', err);
      throw err;
    }
  }, []);

  const promoverUsuario = useCallback(async (id, perfil) => {
    try {
      console.log('⬆️ [useAdmin] Promovendo utilizador:', id, 'para', perfil);
      await api.post(`/admin/usuarios/${id}/promover?perfil=${perfil}`);
      console.log('⬆️ [useAdmin] Utilizador promovido com sucesso');
      return true;
    } catch (err) {
      console.error('❌ [useAdmin] Erro ao promover utilizador:', err);
      throw err;
    }
  }, []);

  return {
    getDashboardMetrics,
    getUsuarios,
    ativarUsuario,
    desativarUsuario,
    promoverUsuario,
  };
};

export default useAdmin;