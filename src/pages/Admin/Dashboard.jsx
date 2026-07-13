// src/pages/Admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Eye
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import './Admin.css';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDashboardMetrics } = useAdmin();
  
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
        setError('Erro ao carregar os dados do dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Verificar permissão
  if (user?.perfil !== 'ADMIN') {
    return (
      <div className="admin-access-denied">
        <AlertCircle size={48} />
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <Spinner size="lg" label="Carregando dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <Alert variant="danger">
          <AlertCircle size={18} />
          {error}
        </Alert>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }

  const total = metrics?.totalFaturas || 0;
  const aprovadas = metrics?.faturasPorStatus?.APROVADO || 0;
  const pendentes = metrics?.faturasPorStatus?.AGUARDANDO_APROVACAO || 0;
  const rejeitadas = metrics?.faturasPorStatus?.REJEITADO || 0;

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>Dashboard Administrativo</h1>
          <p className="admin-subtitle">
            Visão geral do sistema EDS
          </p>
        </div>
        <div className="admin-header-actions">
          <Button variant="primary" onClick={() => navigate('/admin/usuarios')}>
            <Users size={18} />
            Gerenciar Utilizadores
          </Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="metrics-grid">
        <div className="metric-card metric-primary" onClick={() => navigate('/admin/usuarios')}>
          <div className="metric-icon"><Users size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{metrics?.totalUsuarios || 0}</span>
            <span className="metric-title">Total de Utilizadores</span>
          </div>
        </div>

        <div className="metric-card metric-info" onClick={() => navigate('/admin/faturas')}>
          <div className="metric-icon"><FileText size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{total}</span>
            <span className="metric-title">Total de Faturas</span>
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-icon"><DollarSign size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">
              {formatarMoeda(metrics?.valorTotalFaturas || 0)}
            </span>
            <span className="metric-title">Receita Total</span>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon"><TrendingUp size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">
              {total > 0 ? Math.round((aprovadas / total) * 100) : 0}%
            </span>
            <span className="metric-title">Taxa de Aprovação</span>
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="admin-grid-2">
        <Card className="status-card">
          <h3>Distribuição de Status</h3>
          <div className="status-chart">
            {Object.entries(metrics?.faturasPorStatus || {}).map(([status, count]) => (
              <div key={status} className="status-bar-wrapper">
                <div className="status-bar-label">
                  <span className="status-bar-name">{getStatusLabel(status)}</span>
                  <span className="status-bar-count">{count}</span>
                </div>
                <div className="status-bar-track">
                  <div 
                    className="status-bar-fill"
                    style={{
                      width: `${total > 0 ? (count / total) * 100 : 0}%`,
                      backgroundColor: getStatusColor(status)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="pending-card">
          <h3>Faturas Pendentes</h3>
          <div className="pending-stats">
            <div className="pending-item">
              <Clock size={20} className="icon-warning" />
              <span>Aguardando Aprovação</span>
              <Badge variant="warning">{pendentes}</Badge>
            </div>
            <div className="pending-item">
              <CheckCircle size={20} className="icon-success" />
              <span>Aprovadas</span>
              <Badge variant="success">{aprovadas}</Badge>
            </div>
            <div className="pending-item">
              <XCircle size={20} className="icon-danger" />
              <span>Rejeitadas</span>
              <Badge variant="danger">{rejeitadas}</Badge>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="view-all-btn"
            onClick={() => navigate('/admin/faturas')}
          >
            Ver todas as faturas <Eye size={16} />
          </Button>
        </Card>
      </div>
    </div>
  );
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const getStatusLabel = (status) => {
  const labels = {
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADO': 'Aprovado',
    'REJEITADO': 'Rejeitado',
    'PAGO': 'Pago',
    'CANCELADO': 'Cancelado',
    'PENDENTE': 'Pendente',
  };
  return labels[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    'AGUARDANDO_APROVACAO': 'var(--color-warning)',
    'APROVADO': 'var(--color-success)',
    'REJEITADO': 'var(--color-danger)',
    'PAGO': 'var(--color-primary)',
    'CANCELADO': 'var(--color-gray-500)',
    'PENDENTE': 'var(--color-warning)',
  };
  return colors[status] || 'var(--color-gray-400)';
};

export default Dashboard;
