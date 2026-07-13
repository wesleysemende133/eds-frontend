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

  // 🔥 CORRIGIDO: Usa /detalhes para incluir itens
  const getInvoiceById = useCallback(async (id) => {
    try {
      console.log('🔍 [getInvoiceById] Buscando fatura ID:', id);
      // ✅ Usar /detalhes para incluir os itens
      const { data } = await api.get(`/faturas/${id}/detalhes`);
      console.log('🔍 [getInvoiceById] Dados recebidos:', data);
      console.log('📦 [getInvoiceById] Itens (raw):', data.itens);
      
      // 🔥 Normalizar os itens (mapear campos do backend para o frontend)
      if (data.itens && Array.isArray(data.itens)) {
        data.itens = data.itens.map((item, index) => ({
          id: item.id || index,
          descricao: item.descricao || item.nome || 'Item sem descrição',
          quantidade: Number(item.quantidade) || 1,
          precoUnitario: item.valorUnitario || item.precoUnitario || 0,
          iva: item.taxaIva || item.iva || 0,
          total: item.valorTotal || item.total || 0,
          // Campos extras (opcionais)
          codigoProduto: item.codigoProduto,
          unidade: item.unidade,
          categoria: item.categoria,
          posicao: item.posicao,
        }));
        console.log('📦 [getInvoiceById] Itens normalizados:', data.itens);
      } else {
        data.itens = [];
        console.log('📦 [getInvoiceById] Nenhum item encontrado');
      }
      
      return data;
    } catch (err) {
      console.error('❌ [getInvoiceById] Erro:', err);
      throw err;
    }
  }, []);

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