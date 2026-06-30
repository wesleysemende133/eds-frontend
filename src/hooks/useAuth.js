import { useCallback } from 'react'
import authStore from '../store/authStore'
import api from '../lib/axios'

export const useAuth = () => {
  const {
    user,
    token,
    loading,
    error,
    setUser,
    setToken,
    setLoading,
    setError,
    logout
  } = authStore()

  const login = useCallback(async (email, senha) => {
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/login', {
        email,
        senha
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

      const mensagem =
        err.response?.data?.mensagem ??
        err.response?.data?.message ??
        'Erro ao fazer login'

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
        nomeCompleto: dados.nomeCompleto,
        email: dados.email,
        senha: dados.senha,
        telefone: dados.telefone,
        perfil: dados.perfil
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

      const mensagem =
        err.response?.data?.mensagem ??
        err.response?.data?.message ??
        'Erro ao registrar'

      setError(mensagem)
      throw err

    } finally {
      setLoading(false)
    }

  }, [setLoading, setError, setToken, setUser])

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token
  }
}