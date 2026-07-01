// hooks/useAuth.js
import { useCallback } from 'react'
import authStore from '../store/authStore'
import api from '../lib/axios'

export const useAuth = () => {
  const user = authStore((state) => state.user)
  const token = authStore((state) => state.token)
  const loading = authStore((state) => state.loading)
  const error = authStore((state) => state.error)
  const setUser = authStore((state) => state.setUser)
  const setToken = authStore((state) => state.setToken)
  const setError = authStore((state) => state.setError)
  const logout = authStore((state) => state.logout)
  const setLoading = authStore((state) => state.setLoading)

  const login = useCallback(async (email, senha) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/login', { email, senha })
      setToken(data.token)
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        perfil: data.perfil
      })
      return data
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao fazer login'
      setError(mensagem)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setToken, setUser])

  const register = useCallback(async (dados) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/registrar', {
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha
      })

      setToken(data.token)
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto,
        email: data.email,
        perfil: data.perfil
      })
      return data
    } catch (err) {
      const mensagem = err.response?.data?.mensagem || err.response?.data?.message || 'Erro ao registrar'
      setError(mensagem)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setToken, setUser])

  const limparErros = useCallback(() => {
    setError(null)
  }, [setError])

  return {
    user,
    token,
    loading,
    error,
    login,
    registrar: register,
    logout,
    limparErros,
    isAuthenticated: !!token
  }
}

// ✅ Exportação default para compatibilidade
export default useAuth