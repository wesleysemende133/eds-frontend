import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Building, Calendar, Edit2, Save, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useProfile } from '../hooks/useProfile'
import './Profile.css'

export const Profile = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { updateProfile, loading, error } = useProfile()
  
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  })
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        company: user.company || '',
        phone: user.phone || ''
      })
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateProfile(formData)
      setSuccessMessage('Perfil atualizado com sucesso!')
      setIsEditing(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({
      name: user.name || '',
      email: user.email || '',
      company: user.company || '',
      phone: user.phone || ''
    })
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Meu Perfil</h1>
        <button
          className="btn-logout"
          onClick={handleLogout}
        >
          Sair
        </button>
      </div>

      {successMessage && (
        <div className="alert alert-success">
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-avatar">
          <User size={64} />
        </div>

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-info">
              <div className="info-row">
                <User size={20} />
                <div>
                  <label>Nome</label>
                  <p>{formData.name || 'Não informado'}</p>
                </div>
              </div>
              <div className="info-row">
                <Mail size={20} />
                <div>
                  <label>E-mail</label>
                  <p>{formData.email || 'Não informado'}</p>
                </div>
              </div>
              <div className="info-row">
                <Building size={20} />
                <div>
                  <label>Empresa</label>
                  <p>{formData.company || 'Não informada'}</p>
                </div>
              </div>
              <div className="info-row">
                <Calendar size={20} />
                <div>
                  <label>Telefone</label>
                  <p>{formData.phone || 'Não informado'}</p>
                </div>
              </div>
            </div>

            <button
              className="btn-edit"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 size={16} />
              Editar Perfil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit">
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled
              />
              <small>O e-mail não pode ser alterado</small>
            </div>

            <div className="form-group">
              <label htmlFor="company">Empresa</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={16} />
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}