// src/hooks/useInvoices.js
import { useCallback } from 'react';
import api from '../services/api';

export const useInvoices = () => {
  
  const getInvoices = useCallback(async (status = null) => {
    try {
      const url = status ? `/faturas/status/${status}` : '/faturas';
      console.log('📋 [getInvoices] URL:', url);
      const { data } = await api.get(url);
      console.log('📋 [getInvoices] Dados recebidos:', data);
      return data;
    } catch (err) {
      console.error('❌ [getInvoices] Erro:', err);
      throw err;
    }
  }, []);

  const getInvoiceById = useCallback(async (id) => {
    try {
      console.log('🔍 [getInvoiceById] Buscando fatura ID:', id);
      const { data } = await api.get(`/faturas/${id}`);
      console.log('🔍 [getInvoiceById] Dados recebidos:', data);
      return data;
    } catch (err) {
      console.error('❌ [getInvoiceById] Erro:', err);
      throw err;
    }
  }, []);

  // ✅ UPLOAD CORRIGIDO
  const uploadInvoice = useCallback(async (formData) => {
    try {
      console.log('📤 [uploadInvoice] Iniciando upload...');
      
      const { data } = await api.post('/faturas/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('📤 [uploadInvoice] Upload concluído:', data);
      return data;
    } catch (err) {
      console.error('❌ [uploadInvoice] Erro:', err);
      console.error('❌ Detalhes:', err.response?.data);
      throw err;
    }
  }, []);

  const deleteInvoice = useCallback(async (id) => {
    console.log('🗑️ [deleteInvoice] Iniciando exclusão da fatura ID:', id);
    
    try {
      const response = await api.delete(`/faturas/${id}`);
      console.log('🗑️ [deleteInvoice] Resposta:', response.status);
      return true;
    } catch (err) {
      console.error('❌ [deleteInvoice] Erro:', err);
      throw err;
    }
  }, []);

  // Avaliar fatura
  const avaliarInvoice = useCallback(async (id, acao, motivo = '') => {
    try {
      const { data } = await api.post(`/faturas/${id}/avaliar`, {
        acao: acao,
        motivo: motivo || undefined
      });
      return data;
    } catch (err) {
      console.error('❌ [avaliarInvoice] Erro:', err);
      throw err;
    }
  }, []);

  // Aprovar fatura
  const aprovarInvoice = useCallback(async (id, observacao = '') => {
    try {
      const { data } = await api.post(
        `/faturas/${id}/aprovar`,
        observacao || undefined,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (err) {
      console.error('❌ [aprovarInvoice] Erro:', err);
      throw err;
    }
  }, []);

  // Rejeitar fatura
  const rejeitarInvoice = useCallback(async (id, motivo = '') => {
    try {
      const { data } = await api.post(
        `/faturas/${id}/rejeitar`,
        motivo || undefined,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (err) {
      console.error('❌ [rejeitarInvoice] Erro:', err);
      throw err;
    }
  }, []);

  // Efetivar fatura
  const efetivarInvoice = useCallback(async (id, observacao = '') => {
    try {
      const { data } = await api.post(
        `/faturas/${id}/efetivar`,
        observacao || undefined,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (err) {
      console.error('❌ [efetivarInvoice] Erro:', err);
      throw err;
    }
  }, []);

  // Cancelar fatura
  const cancelarInvoice = useCallback(async (id, motivo = '') => {
    try {
      const { data } = await api.post(
        `/faturas/${id}/cancelar`,
        motivo || undefined,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return data;
    } catch (err) {
      console.error('❌ [cancelarInvoice] Erro:', err);
      throw err;
    }
  }, []);

  // Reprocessar fatura
  const reprocessarInvoice = useCallback(async (id) => {
    try {
      const { data } = await api.post(`/faturas/${id}/reprocessar`);
      return data;
    } catch (err) {
      console.error('❌ [reprocessarInvoice] Erro:', err);
      throw err;
    }
  }, []);

  return {
    getInvoices,
    getInvoiceById,
    uploadInvoice,
    deleteInvoice,
    avaliarInvoice,
    aprovarInvoice,
    rejeitarInvoice,
    efetivarInvoice,
    cancelarInvoice,
    reprocessarInvoice,
  };
};

export default useInvoices;
