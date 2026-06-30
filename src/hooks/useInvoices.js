import { useCallback } from 'react'
import api from '../lib/axios'

export const useInvoices = () => {
  
  // 1. Alinhado com @GetMapping de /api/faturas ou /api/faturas/status/{status}
  const getInvoices = useCallback(async (status = null) => {
    try {
      const url = status ? `/api/faturas/status/${status}` : '/api/faturas'
      const { data } = await api.get(url)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 2. Alinhado com @GetMapping("/{id}") recebendo UUID
  const getInvoiceById = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/api/faturas/${id}`)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 3. Alinhado com @PostMapping(value = "/upload") e DTO mapeado com 'file'
  const uploadInvoice = useCallback(async (fileObject) => {
    try {
      const formData = new FormData()
      
      // ALINHAMENTO SÊNIOR: A chave deve ser exatamente 'file' para casar com o DTO Java
      formData.append('file', fileObject)
      
      // OPCIONAL: Se o seu DTO aceitar 'descricao', o Spring captura do mesmo FormData:
      // formData.append('descricao', 'Fatura de infraestrutura local')

      // Sênior Tip: Omitimos o Header 'Content-Type'. O Axios e o Navegador identificam
      // o FormData e montam o cabeçalho com o 'boundary' dinâmico correto.
      const { data } = await api.post('/api/faturas/upload', formData)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  // 4. Alinhado com @DeleteMapping("/{id}") recebendo UUID
  const deleteInvoice = useCallback(async (id) => {
    try {
      // Retorna 204 No Content do Java. O Axios resolve como uma promise de sucesso vazia
      const { data } = await api.delete(`/api/faturas/${id}`)
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