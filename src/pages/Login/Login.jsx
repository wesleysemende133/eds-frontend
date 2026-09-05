// src/pages/Login/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, User, Building, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, limparErros } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) limparErros();
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.senha);
      navigate('/');
    } catch (err) {
      // Erro já está no estado do useAuth
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">✦</div>
          <h1>Olá de novo</h1>
          <p>Entre para continuar</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={limparErros} className="error-close">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field-group">
            <label htmlFor="email">E-mail</label>
            <div className="field-input">
              <Mail size={18} className="field-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="senha">Senha</label>
            <div className="field-input">
              <Lock size={18} className="field-icon" />
              <input
                id="senha"
                type={showPassword ? 'text' : 'password'}
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePassword}
                tabIndex="-1"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="field-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Lembrar</span>
              </label>
              <Link to="/esqueci-senha" className="forgot-link">
                Esqueceu a senha?
              </Link>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'A entrar...' : 'Entrar'}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <div className="auth-actions">
          <p className="action-label">Novo por aqui?</p>
          <Link to="/registrar" className="action-link">
            <User size={18} />
            Criar conta pessoal
          </Link>
          <Link to="/registrar-empresa" className="action-link empresa">
            <Building size={18} />
            Registrar empresa
          </Link>
        </div>

        <div className="auth-footer">
          <p>
            Ao continuar, aceita os <Link to="/termos">termos</Link> e a{' '}
            <Link to="/privacidade">política de privacidade</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;