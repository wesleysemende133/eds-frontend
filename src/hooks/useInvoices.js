// src/hooks/useInvoices.js
import { useCallback } from 'react'
import api from '../lib/axios'

export const useInvoices = () => {
  
  const getInvoices = useCallback(async (status = null) => {
    try {
      const url = status ? `/faturas/status/${status}` : '/faturas'
      console.log('📋 [getInvoices] URL:', url)
      const { data } = await api.get(url)
      console.log('📋 [getInvoices] Dados recebidos:', data)
      return data
    } catch (err) {
      console.error('❌ [getInvoices] Erro:', err)
      throw err
    }
  }, [])

  const getInvoiceById = useCallback(async (id) => {
    try {
      console.log('🔍 [getInvoiceById] Buscando fatura ID:', id)
      const { data } = await api.get(`/faturas/${id}`)
      console.log('🔍 [getInvoiceById] Dados recebidos:', data)
      return data
    } catch (err) {
      console.error('❌ [getInvoiceById] Erro:', err)
      throw err
    }
  }, [])

  const uploadInvoice = useCallback(async (formData) => {
    try {
      console.log('📤 [uploadInvoice] Iniciando upload...')
      const { data } = await api.post('/faturas/upload', formData)
      console.log('📤 [uploadInvoice] Upload concluído:', data)
      return data
    } catch (err) {
      console.error('❌ [uploadInvoice] Erro:', err)
      throw err 
    }
  }, [])

  // ✅ DELETE COM LOGS
  const deleteInvoice = useCallback(async (id) => {
    console.log('🗑️ [deleteInvoice] Iniciando exclusão da fatura ID:', id)
    console.log('🗑️ [deleteInvoice] URL:', `/faturas/${id}`)
    
    try {
      const response = await api.delete(`/faturas/${id}`)
      
      console.log('🗑️ [deleteInvoice] Resposta completa:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      })
      
      // ✅ Se chegou aqui, a exclusão foi bem-sucedida
      console.log('✅ [deleteInvoice] Fatura excluída com sucesso!')
      return true
      
    } catch (err) {
      console.error('❌ [deleteInvoice] Erro detalhado:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data
      })
      throw err
    }
  }, [])

  // ... resto das funções (avaliar, aprovar, etc.)

  return {
    getInvoices,
    getInvoiceById,
    uploadInvoice,
    deleteInvoice,
    // ... outros
  }
}