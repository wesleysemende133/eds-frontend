// src/pages/Register/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register, loading, error, limparErros } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [senhaError, setSenhaError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) limparErros();
    if (senhaError) setSenhaError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== formData.confirmarSenha) {
      setSenhaError('As senhas não coincidem');
      return;
    }

    if (formData.senha.length < 6) {
      setSenhaError('A senha precisa ter pelo menos 6 caracteres');
      return;
    }

    try {
      await register({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha
      });
      navigate('/');
    } catch (err) {
      console.error('❌ Erro no registo:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">✦</div>
          <h1>Criar conta</h1>
          <p>Comece a usar o sistema</p>
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
            <label htmlFor="nome">Nome completo</label>
            <div className="field-input">
              <User size={18} className="field-icon" />
              <input
                id="nome"
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome completo"
                required
                disabled={loading}
              />
            </div>
          </div>

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
                placeholder="Mínimo 6 caracteres"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <div className="field-input">
              <Lock size={18} className="field-icon" />
              <input
                id="confirmarSenha"
                type={showConfirm ? 'text' : 'password'}
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                placeholder="Digite a senha novamente"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex="-1"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {senhaError && <span className="field-error">{senhaError}</span>}
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'A criar conta...' : 'Criar conta'}
          </button>
        </form>

        <div className="auth-divider">
          <span>ou</span>
        </div>

        <div className="auth-actions">
          <p className="action-label">Já tem conta?</p>
          <Link to="/login" className="action-link">
            Entrar
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

export default Register;