// src/hooks/useInvoices.js
import { useCallback } from 'react'
import api from '../lib/axios'

export const useInvoices = () => {
  
  // 1. Listar faturas
  const getInvoices = useCallback(async (status = null) => {
    try {
      const url = status ? `/faturas/status/${status}` : '/faturas'
      const { data } = await api.get(url)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 2. Buscar fatura por ID
  const getInvoiceById = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/faturas/${id}`)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 3. Upload de fatura
  const uploadInvoice = useCallback(async (formData) => {
    try {
      const { data } = await api.post('/faturas/upload', formData)
      return data
    } catch (err) {
      throw err 
    }
  }, [])

  // 4. Deletar fatura
  const deleteInvoice = useCallback(async (id) => {
    try {
      const { data } = await api.delete(`/faturas/${id}`)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // ============================================================
  // 🔥 NOVOS MÉTODOS DE AVALIAÇÃO
  // ============================================================

  // 5. Avaliar fatura (endpoint genérico)
  const avaliarInvoice = useCallback(async (id, acao, motivo = '') => {
    try {
      const { data } = await api.post(`/faturas/${id}/avaliar`, {
        acao: acao,
        motivo: motivo || undefined
      })
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 6. Aprovar fatura
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
      )
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 7. Rejeitar fatura
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
      )
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 8. Efetivar fatura
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
      )
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 9. Cancelar fatura
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
      )
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 10. Reprocessar fatura
  const reprocessarInvoice = useCallback(async (id) => {
    try {
      const { data } = await api.post(`/faturas/${id}/reprocessar`)
      return data
    } catch (err) {
      throw err
    }
  }, [])

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
  }
}