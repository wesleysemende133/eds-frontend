import { useState } from 'react'
import { User, Mail, Calendar, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import authStore from '../store/authStore'
import './Profile.css'

export const Profile = () => {
  const navigate = useNavigate()
  const { user } = authStore()
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aqui você faria uma chamada à API para atualizar o perfil
    console.log('[v0] Update profile:', formData)
    setEditing(false)
  }

  if (!user) {
    return (
      <div className="profile-container">
        <p>Usuário não encontrado</p>
      </div>
    )
  }

  const createdAt = user.criadoEm ? new Date(user.criadoEm).toLocaleDateString('pt-BR') : 'N/A'

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/')} className="btn-back">
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>Meu Perfil</h1>
      </div>

      <div className="profile-content">
        {/* Avatar Section */}
        <div className="profile-avatar-section">
          <div className="avatar">
            {user.nome?.[0]?.toUpperCase()}
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-card">
          <div className="card-header">
            <h2>Informações Pessoais</h2>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-edit">
                Editar
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form">
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
                    disabled
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-save">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="btn-cancel"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">Nome</span>
                <span className="info-value">{user.nome}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Email</span>
                <span className="info-value">{user.email}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Membro desde</span>
                <span className="info-value">{createdAt}</span>
              </div>
            </div>
          )}
        </div>

        {/* Account Settings */}
        <div className="profile-card">
          <h2>Configurações da Conta</h2>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-content">
                <span className="setting-title">Tema</span>
                <span className="setting-desc">Claro / Escuro</span>
              </div>
              <select className="setting-select">
                <option>Sistema</option>
                <option>Claro</option>
                <option>Escuro</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-content">
                <span className="setting-title">Notificações</span>
                <span className="setting-desc">Ativar/desativar notificações por email</span>
              </div>
              <label className="toggle">
                <input type="checkbox" defaultChecked />
                <span className="slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-content">
                <span className="setting-title">Privacidade</span>
                <span className="setting-desc">Configurar preferências de privacidade</span>
              </div>
              <button className="btn-link">Gerenciar</button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="profile-card danger-zone">
          <h2>Zona de Perigo</h2>
          <p>Ações que não podem ser desfeitas</p>
          <button className="btn-danger">Excluir Conta</button>
        </div>
      </div>
    </div>
  )
}
