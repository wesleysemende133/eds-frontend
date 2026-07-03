import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import './Auth.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error, limparErros } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) limparErros();
  };

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
      <Card className="auth-card" variant="elevated">
        <div className="auth-header">
          <div className="brand-icon">EDS</div>
          <h1>Bem-vindo</h1>
          <p>Entre no sistema EDS</p>
        </div>

        {error && (
          <Alert variant="danger" onClose={limparErros}>
            <AlertCircle size={16} />
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
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
            autoComplete="email"
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
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            disabled={loading}
          >
            Entrar
            <ArrowRight size={18} />
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            Não tem conta? <Link to="/register">Registre-se</Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
