// src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Building, 
  Phone, 
  Edit2, 
  Save, 
  X, 
  LogOut,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Loader2,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import './Profile.css';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { getProfile, updateProfile, loading, error } = useProfile();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: ''
  });

  const loadProfile = useCallback(async () => {
    try {
      setProfileLoading(true);
      await getProfile();
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      if (err.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setProfileLoading(false);
    }
  }, [getProfile, navigate]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.nomeCompleto || user.name || '',
        email: user.email || '',
        company: user.empresa || user.company || '',
        phone: user.telefone || user.phone || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const dados = {
        nome: formData.name,
        empresa: formData.company,
        telefone: formData.phone
      };
      
      await updateProfile(dados);
      await getProfile();
      
      setSuccessMessage('Perfil atualizado com sucesso');
      setIsEditing(false);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.nomeCompleto || user?.name || '',
      email: user?.email || '',
      company: user?.empresa || user?.company || '',
      phone: user?.telefone || user?.phone || ''
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatPhone = (phone) => {
    if (!phone) return 'Não informado';
    return phone;
  };

  if (profileLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading">
          <Loader2 size={32} className="spinning" />
          <p>Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-left">
          <button 
            className="btn-back"
            onClick={() => navigate('/')}
            type="button"
          >
            <ArrowLeft size={18} />
            Voltar
          </button>
          <h1>Meu Perfil</h1>
        </div>
        <button 
          className="btn-logout"
          onClick={handleLogout}
          type="button"
        >
          <LogOut size={18} />
          Sair
        </button>
      </header>

      {/* Messages */}
      {successMessage && (
        <div className="alert-success">
          <CheckCircle size={18} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="alert-error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <section className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {getInitials(formData.name)}
          </div>
          <h2>{formData.name || 'Utilizador'}</h2>
          <span className="profile-role">{user?.perfil || 'Utilizador'}</span>
        </div>

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-info">
              <div className="info-item">
                <div className="info-icon">
                  <User size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">Nome completo</span>
                  <span className="info-value">{formData.name || 'Não informado'}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Mail size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">E-mail</span>
                  <span className="info-value">{formData.email || 'Não informado'}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Building size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">Empresa</span>
                  <span className="info-value">{formData.company || 'Não informada'}</span>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Phone size={18} />
                </div>
                <div className="info-content">
                  <span className="info-label">Telefone</span>
                  <span className="info-value">{formatPhone(formData.phone)}</span>
                </div>
              </div>
            </div>

            <button 
              className="btn-edit"
              onClick={() => setIsEditing(true)}
              type="button"
            >
              <Edit2 size={18} />
              Editar Perfil
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit">
            <div className="form-group">
              <label htmlFor="name">Nome completo</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Seu nome completo"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <div className="input-wrapper disabled">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="seu@email.com"
                  disabled
                />
              </div>
              <span className="field-hint">O e-mail não pode ser alterado</span>
            </div>

            <div className="form-group">
              <label htmlFor="company">Empresa</label>
              <div className="input-wrapper">
                <Building size={18} className="input-icon" />
                <input
                  id="company"
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Nome da empresa"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone</label>
              <div className="input-wrapper">
                <Phone size={18} className="input-icon" />
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+258 84 123 4567"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn-save"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinning" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Salvar
                  </>
                )}
              </button>
              <button 
                type="button" 
                className="btn-cancel-form"
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={18} />
                Cancelar
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Danger Zone */}
      <section className="profile-card danger-zone">
        <div className="danger-zone-header">
          <Shield size={20} />
          <h3>Zona de Perigo</h3>
        </div>
        <p className="danger-description">
          Ações irreversíveis que afetam a sua conta.
        </p>
        <div className="danger-actions">
          <button 
            className="btn-danger"
            onClick={handleLogout}
            type="button"
          >
            <LogOut size={18} />
            Sair da Conta
          </button>
        </div>
      </section>
    </div>
  );
};

export default Profile;