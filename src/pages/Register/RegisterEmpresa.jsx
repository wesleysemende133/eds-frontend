// src/pages/RegisterEmpresa.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, AlertCircle, 
  Building, Phone, Hash, MapPin, Globe, Plus, X 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

export const RegisterEmpresa = () => {
  const navigate = useNavigate();
  const { registerEmpresa, loading, error, limparErros } = useAuth();
  
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    nuit: '',
    endereco: '',
    website: '',
    adminNome: '',
    adminEmail: '',
    adminSenha: '',
    adminTelefone: '',
    funcionarios: [],
  });

  const [funcionario, setFuncionario] = useState({
    nome: '',
    email: '',
    senha: '',
    telefone: '',
    cargo: '',
  });

  const [senhaError, setSenhaError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) limparErros();
    if (senhaError) setSenhaError('');
  };

  const handleFuncionarioChange = (e) => {
    const { name, value } = e.target;
    setFuncionario(prev => ({ ...prev, [name]: value }));
  };

  const adicionarFuncionario = () => {
    if (!funcionario.nome || !funcionario.email || !funcionario.senha) {
      alert('Preencha nome, email e senha do funcionário');
      return;
    }
    setFormData(prev => ({
      ...prev,
      funcionarios: [...prev.funcionarios, { ...funcionario }]
    }));
    setFuncionario({ nome: '', email: '', senha: '', telefone: '', cargo: '' });
  };

  const removerFuncionario = (index) => {
    setFormData(prev => ({
      ...prev,
      funcionarios: prev.funcionarios.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.senha || formData.senha.length < 6) {
      setSenhaError('A senha precisa ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.adminNome || !formData.adminEmail || !formData.adminSenha) {
      alert('Preencha os dados do administrador');
      return;
    }

    try {
      await registerEmpresa(formData);
      alert('✅ Empresa registrada!');
      navigate('/login');
    } catch (err) {
      console.error('❌ Erro:', err);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-empresa">
        <div className="auth-header">
          <div className="brand-icon">✦</div>
          <h1>Registrar empresa</h1>
          <p>Preencha os dados para criar sua conta</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={16} />
            <span>{error}</span>
            <button onClick={limparErros} className="error-close">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          
          {/* Dados da Empresa */}
          <div className="form-section">
            <p className="section-label">Dados da empresa</p>
            
            <div className="field-group">
              <label htmlFor="nome">Nome da empresa *</label>
              <div className="field-input">
                <Building size={18} className="field-icon" />
                <input
                  id="nome"
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome da sua empresa"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="email">E-mail *</label>
              <div className="field-input">
                <Mail size={18} className="field-icon" />
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contato@empresa.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="senha">Senha *</label>
              <div className="field-input">
                <Lock size={18} className="field-icon" />
                <input
                  id="senha"
                  type="password"
                  name="senha"
                  value={formData.senha}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </div>
              {senhaError && <span className="field-error">{senhaError}</span>}
            </div>

            <div className="field-group">
              <label htmlFor="telefone">Telefone</label>
              <div className="field-input">
                <Phone size={18} className="field-icon" />
                <input
                  id="telefone"
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="84 123 4567"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="nuit">NUIT *</label>
              <div className="field-input">
                <Hash size={18} className="field-icon" />
                <input
                  id="nuit"
                  type="text"
                  name="nuit"
                  value={formData.nuit}
                  onChange={handleChange}
                  placeholder="123456789 (9 dígitos)"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="endereco">Endereço</label>
              <div className="field-input">
                <MapPin size={18} className="field-icon" />
                <input
                  id="endereco"
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Av. ..., Nº ..."
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="website">Website</label>
              <div className="field-input">
                <Globe size={18} className="field-icon" />
                <input
                  id="website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://suaempresa.com"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Administrador */}
          <div className="form-section">
            <p className="section-label">Administrador da empresa</p>

            <div className="field-group">
              <label htmlFor="adminNome">Nome completo *</label>
              <div className="field-input">
                <User size={18} className="field-icon" />
                <input
                  id="adminNome"
                  type="text"
                  name="adminNome"
                  value={formData.adminNome}
                  onChange={handleChange}
                  placeholder="Nome do administrador"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="adminEmail">E-mail *</label>
              <div className="field-input">
                <Mail size={18} className="field-icon" />
                <input
                  id="adminEmail"
                  type="email"
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="admin@empresa.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="adminSenha">Senha *</label>
              <div className="field-input">
                <Lock size={18} className="field-icon" />
                <input
                  id="adminSenha"
                  type="password"
                  name="adminSenha"
                  value={formData.adminSenha}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="field-group">
              <label htmlFor="adminTelefone">Telefone</label>
              <div className="field-input">
                <Phone size={18} className="field-icon" />
                <input
                  id="adminTelefone"
                  type="tel"
                  name="adminTelefone"
                  value={formData.adminTelefone}
                  onChange={handleChange}
                  placeholder="84 123 4567"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Funcionários */}
          <div className="form-section">
            <p className="section-label">
              Funcionários <span className="label-opcional">(opcional)</span>
            </p>

            <div className="funcionario-form">
              <input
                type="text"
                name="nome"
                value={funcionario.nome}
                onChange={handleFuncionarioChange}
                placeholder="Nome"
                disabled={loading}
              />
              <input
                type="email"
                name="email"
                value={funcionario.email}
                onChange={handleFuncionarioChange}
                placeholder="E-mail"
                disabled={loading}
              />
              <input
                type="password"
                name="senha"
                value={funcionario.senha}
                onChange={handleFuncionarioChange}
                placeholder="Senha"
                disabled={loading}
              />
              <input
                type="text"
                name="telefone"
                value={funcionario.telefone}
                onChange={handleFuncionarioChange}
                placeholder="Telefone"
                disabled={loading}
              />
              <input
                type="text"
                name="cargo"
                value={funcionario.cargo}
                onChange={handleFuncionarioChange}
                placeholder="Cargo"
                disabled={loading}
              />
              <button
                type="button"
                className="btn-add-funcionario"
                onClick={adicionarFuncionario}
                disabled={loading}
              >
                <Plus size={16} />
                Adicionar
              </button>
            </div>

            {formData.funcionarios.length > 0 && (
              <div className="funcionarios-lista">
                {formData.funcionarios.map((f, index) => (
                  <div key={index} className="funcionario-item">
                    <span>{f.nome}</span>
                    <span className="funcionario-email">{f.email}</span>
                    {f.cargo && <span className="funcionario-cargo">{f.cargo}</span>}
                    <button
                      type="button"
                      onClick={() => removerFuncionario(index)}
                      className="btn-remover"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? 'A registar...' : 'Registrar empresa'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Já tem conta? <Link to="/login">Entrar</Link>
          </p>
          <p>
            É pessoa física? <Link to="/registrar">Criar conta pessoal</Link>
          </p>
        </div>
      </div>
    </div>
  );
};