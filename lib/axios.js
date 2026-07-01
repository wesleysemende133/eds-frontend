// hooks/useProfile.js
import { useState, useCallback } from 'react'
import api from '../lib/axios'
import authStore from '../store/authStore'

export const useProfile = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const setUser = authStore((state) => state.setUser)
  const user = authStore((state) => state.user)

  // ✅ BUSCAR PERFIL - CORRIGIDO
  const getProfile = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      // ✅ REMOVIDO o /api duplicado
      const { data } = await api.get('/usuarios/perfil')
      
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto || data.name,
        email: data.email,
        perfil: data.perfil,
        empresa: data.empresa,
        telefone: data.telefone,
      })
      
      return data
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao carregar perfil'
      setError(mensagem)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setUser])

  // ✅ ATUALIZAR PERFIL - CORRIGIDO
  const updateProfile = useCallback(async (dados) => {
    setLoading(true)
    setError(null)
    
    try {
      // ✅ REMOVIDO o /api duplicado
      const { data } = await api.put('/usuarios/perfil', {
        nome: dados.name || dados.nome,
        empresa: dados.company || dados.empresa,
        telefone: dados.phone || dados.telefone,
      })
      
      setUser({
        ...user,
        nomeCompleto: data.nomeCompleto || data.name,
        empresa: data.empresa,
        telefone: data.telefone,
      })
      
      return data
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao atualizar perfil'
      setError(mensagem)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setUser, user])

  // ✅ ALTERAR SENHA - CORRIGIDO
  const changePassword = useCallback(async (senhaAtual, novaSenha) => {
    setLoading(true)
    setError(null)
    
    try {
      // ✅ REMOVIDO o /api duplicado
      const { data } = await api.put('/usuarios/alterar-senha', {
        senhaAtual,
        novaSenha
      })
      
      return data
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || 
                       err.response?.data?.message || 
                       'Erro ao alterar senha'
      setError(mensagem)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    getProfile,
    updateProfile,
    changePassword,
    loading,
    error
  }
}