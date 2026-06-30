import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

export const Login = () => {
  const navigate = useNavigate()
  // Adicionado o método "limparErros" (ou equivalente) caso seu useAuth exponha para resetar o estado global de erro
  const { login, loading, error, limparErros } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  })

  const [fieldError, setFieldError] = useState('')

  // Limpa os erros globais quando a tela de Login é desmontada ou montada
  useEffect(() => {
    if (limparErros) limparErros()
  }, [limparErros])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    setFieldError('')
    // Se o hook possuir uma função para limpar o erro da API ao digitar, invoque-a aqui
    if (limparErros && error) limparErros()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError('')

    // Validação defensiva (Clean Code) antes de gastar banda com requisição de rede
    if (!formData.email.trim() || !formData.senha) {
      setFieldError('Por favor, preencha todos os campos.')
      return
    }

    try {
      // Dispara a requisição para o seu ControladorAutenticacao.java no Spring Boot
      await login(formData.email.trim(), formData.senha)
      
      // Garante o redirecionamento seguro para a dashboard apenas após a resolução da Promise
      navigate('/', { replace: true })
    } catch (err) {
      // O erro da API já é capturado pelo useAuth e exposto na variável 'error'
      console.error('Falha na requisição de autenticação da API:', err)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Bem-vindo ao EDS</h1>
          <p>Sistema de Gestão de Documentos Empresariais</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Renderização condicional unificada e limpa */}
          {(error || fieldError) && (
            <div className="alert alert-error" role="alert">
              <AlertCircle size={20} />
              <span>{fieldError || error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={20} className="input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                id="senha"
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                disabled={loading}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem conta?{' '}
            <Link to="/register">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}