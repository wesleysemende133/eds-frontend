import { useCallback } from 'react'
import api from '../lib/axios'

export const useInvoices = () => {
  
  // 1. Alinhado com @GetMapping de /api/faturas ou /api/faturas/status/{status}
  const getInvoices = useCallback(async (status = null) => {
    try {
      const url = status ? `/faturas/status/${status}` : '/faturas'
      const { data } = await api.get(url)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 2. Alinhado com @GetMapping("/{id}") recebendo UUID
  const getInvoiceById = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/faturas/${id}`)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 3. Alinhado com @PostMapping(value = "/upload") e DTO mapeado com 'file'
 const uploadInvoice = useCallback(async (formData) => {
    try {
      // O Axios detectará que formData é um Multipart e adicionará o header correto
      const { data } = await api.post('/faturas/upload', formData)
      return data
    } catch (err) {
      // Repassa o erro para o componente tratar
      throw err 
    }
  }, [])

  // 4. Alinhado com @DeleteMapping("/{id}") recebendo UUID
  const deleteInvoice = useCallback(async (id) => {
    try {
      // Retorna 204 No Content do Java. O Axios resolve como uma promise de sucesso vazia
      const { data } = await api.delete(`/faturas/${id}`)
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
  }
}