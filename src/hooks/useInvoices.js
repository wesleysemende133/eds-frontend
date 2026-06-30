import { useCallback } from 'react'
import api from '../lib/axios'

export const useInvoices = () => {
  const getInvoices = useCallback(async (status = null) => {
    try {
      const url = status ? `/faturas/status/${status}` : '/faturas'
      const { data } = await api.get(url)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  const getInvoiceById = useCallback(async (id) => {
    try {
      const { data } = await api.get(`/faturas/${id}`)
      return data
    } catch (err) {
      throw err
    }
  }, [])

  const uploadInvoice = useCallback(async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await api.post('/faturas/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data
    } catch (err) {
      throw err
    }
  }, [])

  const deleteInvoice = useCallback(async (id) => {
    try {
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
