
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
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
  const [senhaError, setSenhaError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) limparErros();
    if (senhaError) setSenhaError('');
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  console.log('🔄 Formulário submetido!');
  console.log('📝 Dados:', formData);
  
  if (formData.senha !== formData.confirmarSenha) {
    setSenhaError('As senhas não coincidem');
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
      <Card className="auth-card" variant="elevated">
        <div className="auth-header">
          <div className="brand-icon">EDS</div>
          <h1>Criar Conta</h1>
          <p>Registre-se no sistema EDS</p>
        </div>

        {error && (
          <Alert variant="danger" onClose={limparErros}>
            <AlertCircle size={16} />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Nome completo"
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Seu nome completo"
            icon={<User size={18} />}
            required
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="seu@email.com"
            icon={<Mail size={18} />}
            required
            disabled={loading}
          />

          <Input
            label="Senha"
            type="password"
            name="senha"
            value={formData.senha}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            required
            disabled={loading}
          />

          <Input
            label="Confirmar Senha"
            type="password"
            name="confirmarSenha"
            value={formData.confirmarSenha}
            onChange={handleChange}
            placeholder="••••••••"
            icon={<Lock size={18} />}
            error={senhaError}
            required
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            Registrar
            <ArrowRight size={18} />
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Já tem conta? <Link to="/login">Faça login</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

