import { useCallback } from 'react'
import authStore from '../store/authStore'
import api from '../lib/axios'

export const useAuth = () => {
  // SELETORES ATÔMICOS: Evitam re-renderizações desnecessárias na árvore do React
  const user = authStore((state) => state.user)
  const token = authStore((state) => state.token)
  const loading = authStore((state) => state.loading)
  const error = authStore((state) => state.error)
  const setUser = authStore((state) => state.setUser)
  const setToken = authStore((state) => state.setToken)
  const setError = authStore((state) => state.setError)
  const logout = authStore((state) => state.logout)
  
  // DEFESA DE ARQUITETURA: Se o store usar 'setLoading' ou 'setIsLoading', o hook não quebra
  const setLoading = authStore((state) => state.setLoading || state.setIsLoading || (() => {}))

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
      const mensagem = err.response?.data?.mensagem ?? err.response?.data?.message ?? 'Erro ao fazer login'
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
      // 🔥 Ajustado para bater exatamente com o DTO do seu Spring Boot
      const { data } = await api.post('/auth/registrar', {
        nome: dados.nome,   // Alterado de nomeCompleto para nome
        email: dados.email,
        senha: dados.senha
      })

      setToken(data.token)
      setUser({
        id: data.id,
        nomeCompleto: data.nomeCompleto, // Mantido aqui pois a API retorna nomeCompleto na resposta
        email: data.email,
        perfil: data.perfil
      })
      return data
    } catch (err) {
      // Captura o erro mapeado pelo seu validador ou tratamento global do Spring
      const mensagem = err.response?.data?.mensagem ?? err.response?.data?.message ?? 'Erro ao registrar'
      setError(mensagem)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setToken, setUser])
  
  // RESOLUÇÃO DE CONTRATO DO FORMULÁRIO: Evita quebra no useEffect do Register.jsx
  const limparErros = useCallback(() => {
    setError(null)
  }, [setError])

  return {
    user,
    token,
    loading,
    error,
    login,
    registrar: register, // Resolve o 'registrar is not a function' do componente
    logout,
    limparErros,         // Resolve a limpeza do estado visual do formulário
    isAuthenticated: !!token
  }
}