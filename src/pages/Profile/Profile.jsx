import React, { useState, useEffect } from 'react';
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
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProfile } from '../../hooks/useProfile';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
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

  useEffect(() => {
    const loadProfile = async () => {
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
    };
    
    loadProfile();
  }, [getProfile, navigate]);

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
      setSuccessMessage('Perfil atualizado com sucesso!');
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (profileLoading) {
    return (
      <div className="profile-container">
        <Spinner size="lg" label="Carregando perfil..." />
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-header-left">
          <Button variant="ghost" onClick={() => navigate('/')} className="btn-back">
            <ArrowLeft size={18} />
            Voltar
          </Button>
          <h1>Meu Perfil</h1>
        </div>
        <Button variant="secondary" onClick={handleLogout} className="btn-logout">
          <LogOut size={18} />
          Sair
        </Button>
      </div>

      {successMessage && (
        <Alert variant="success">
          <CheckCircle size={18} />
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          <AlertCircle size={18} />
          {error}
        </Alert>
      )}

      <Card className="profile-card" variant="elevated">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            {getInitials(formData.name)}
          </div>
          <h2>{formData.name || 'Utilizador'}</h2>
          <p className="profile-role">{user?.perfil || 'Utilizador'}</p>
        </div>

        {!isEditing ? (
          <div className="profile-view">
            <div className="profile-info">
              <div className="info-item">
                <div className="info-icon"><User size={18} /></div>
                <div className="info-content">
                  <span className="info-label">Nome completo</span>
                  <span className="info-value">{formData.name || 'Não informado'}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><Mail size={18} /></div>
                <div className="info-content">
                  <span className="info-label">E-mail</span>
                  <span className="info-value">{formData.email || 'Não informado'}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><Building size={18} /></div>
                <div className="info-content">
                  <span className="info-label">Empresa</span>
                  <span className="info-value">{formData.company || 'Não informada'}</span>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><Phone size={18} /></div>
                <div className="info-content">
                  <span className="info-label">Telefone</span>
                  <span className="info-value">{formData.phone || 'Não informado'}</span>
                </div>
              </div>
            </div>

            <Button variant="primary" onClick={() => setIsEditing(true)} className="btn-edit">
              <Edit2 size={18} />
              Editar Perfil
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-edit">
            <Input
              label="Nome completo"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome completo"
              icon={<User size={18} />}
              required
            />

            <Input
              label="E-mail"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              icon={<Mail size={18} />}
              disabled
              required
            />

            <Input
              label="Empresa"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="Nome da empresa"
              icon={<Building size={18} />}
            />

            <Input
              label="Telefone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+258 84 123 4567"
              icon={<Phone size={18} />}
            />

            <div className="form-actions">
              <Button type="submit" variant="primary" isLoading={loading} disabled={loading}>
                <Save size={18} />
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
              <Button type="button" variant="secondary" onClick={handleCancel} disabled={loading}>
                <X size={18} />
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </Card>

      <Card className="profile-card danger-zone" variant="bordered">
        <div className="danger-zone-header">
          <Shield size={20} />
          <h3>Zona de Perigo</h3>
        </div>
        <p className="danger-description">Ações irreversíveis que afetam a sua conta.</p>
        <div className="danger-actions">
          <Button variant="danger" onClick={handleLogout}>
            <LogOut size={18} />
            Sair da Conta
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Profile;
