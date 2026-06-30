import { useState, useCallback } from 'react'
import api from '../lib/axios'

export const useProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Busca os dados do perfil do usuário logado na API Java
  const getProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/api/usuarios/perfil')
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao carregar perfil.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualiza os dados cadastrais do perfil
  const updateProfile = useCallback(async (profileData) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.put('/api/usuarios/perfil', profileData)
      return data
    } catch (err) {
      const msg = err.response?.data?.message || 'Erro ao atualizar perfil.'
      setError(msg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getProfile,
    updateProfile,
    loading,
    error
  }
}