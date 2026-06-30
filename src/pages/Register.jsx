import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import './Auth.css'

export const Register = () => {
  const navigate = useNavigate()
  const { registrar, loading, error, limparErros } = useAuth()

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  })

  const [fieldError, setFieldError] = useState('')
  const [sucesso, setSucesso] = useState(false)

  // Reseta os estados de erro globais ao montar o componente
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
    if (limparErros && error) limparErros()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldError('')

    // 1. Validação Defensiva Local (Clean Code)
    if (!formData.nome.trim() || !formData.email.trim() || !formData.senha || !formData.confirmarSenha) {
      setFieldError('Por favor, preencha todos os campos.')
      return
    }

    // 2. Regra de Negócio Básica de Senhas coincidentes antes de enviar à API
    if (formData.senha !== formData.confirmarSenha) {
      setFieldError('As senhas informadas não coincidem.')
      return
    }

    if (formData.senha.length < 6) {
      setFieldError('A senha deve conter no mínimo 6 caracteres.')
      return
    }

    try {
      // 3. Estruturação do Payload idêntica ao RequisicaoRegistro.java do Spring Boot
      const payloadRegistro = {
        nome: formData.nome.trim(),
        email: formData.email.trim(),
        senha: formData.senha
      }

      await registrar(payloadRegistro)
      setSucesso(true)

      // Redireciona para o login após 2 segundos para dar feedback visual de sucesso
      setTimeout(() => {
        navigate('/login')
      }, 2000)

    } catch (err) {
      console.error('Falha ao processar o cadastro na API:', err)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Crie sua Conta</h1>
          <p>Cadastre-se no Enterprise Document System (EDS)</p>
        </div>

        {sucesso ? (
          <div className="alert alert-success" role="alert">
            <CheckCircle size={20} />
            <span>Cadastro realizado com sucesso! Redirecionando...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            {(error || fieldError) && (
              <div className="alert alert-error" role="alert">
                <AlertCircle size={20} />
                <span>{fieldError || error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="nome">Nome Completo</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Seu nome"
                  disabled={loading}
                  required
                />
              </div>
            </div>

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
                  placeholder="No mínimo 6 caracteres"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">Confirmar Senha</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="confirmarSenha"
                  type="password"
                  name="confirmarSenha"
                  value={formData.confirmarSenha}
                  onChange={handleChange}
                  placeholder="Repita sua senha"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Registrar Conta'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <p>
            Já tem uma conta?{' '}
            <Link to="/login">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}