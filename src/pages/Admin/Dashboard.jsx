// src/pages/Admin/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Building,
  Activity,
  Eye
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const Dashboard = ({ metrics, users, invoices, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <span>Carregando dashboard...</span>
      </div>
    );
  }

  const totalUsuarios = metrics?.totalUsuarios || 0;
  const totalEmpresas = metrics?.totalEmpresas || 0;
  const totalFaturas = metrics?.totalFaturas || 0;
  const faturasPendentes = metrics?.faturasPendentes || 0;
  const faturasAprovadas = metrics?.faturasAprovadas || 0;
  const faturasRejeitadas = metrics?.faturasRejeitadas || 0;
  const faturamentoTotal = metrics?.faturamentoTotal || 0;

  const taxaAprovacao = totalFaturas > 0 
    ? Math.round((faturasAprovadas / totalFaturas) * 100) 
    : 0;

  return (
    <div className="admin-dashboard-container">
      {/* Métricas */}
      <div className="admin-metrics-grid">
        <div className="metric-card metric-primary" onClick={() => navigate('/admin/usuarios')}>
          <div className="metric-icon"><Users size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{totalUsuarios}</span>
            <span className="metric-title">Utilizadores</span>
          </div>
        </div>

        <div className="metric-card metric-info" onClick={() => navigate('/admin/faturas')}>
          <div className="metric-icon"><FileText size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{totalFaturas}</span>
            <span className="metric-title">Faturas</span>
          </div>
        </div>

        <div className="metric-card metric-success">
          <div className="metric-icon"><DollarSign size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{formatarMoeda(faturamentoTotal)}</span>
            <span className="metric-title">Faturamento</span>
          </div>
        </div>

        <div className="metric-card metric-warning">
          <div className="metric-icon"><TrendingUp size={24} /></div>
          <div className="metric-content">
            <span className="metric-value">{taxaAprovacao}%</span>
            <span className="metric-title">Aprovação</span>
          </div>
        </div>
      </div>

      {/* Grid 2 colunas */}
      <div className="admin-grid-2">
        {/* Status das Faturas */}
        <div className="status-card">
          <div className="status-card-header">
            <BarChart3 size={20} />
            <h3>Distribuição de Faturas</h3>
          </div>
          <div className="status-chart">
            <StatusBar label="Aprovadas" count={faturasAprovadas} total={totalFaturas} color="approved" />
            <StatusBar label="Pendentes" count={faturasPendentes} total={totalFaturas} color="pending" />
            <StatusBar label="Rejeitadas" count={faturasRejeitadas} total={totalFaturas} color="rejected" />
          </div>
        </div>

        {/* Resumo */}
        <div className="pending-card">
          <div className="pending-card-header">
            <Activity size={20} />
            <h3>Resumo do Sistema</h3>
          </div>
          <div className="pending-stats">
            <SummaryItem icon={Users} label="Utilizadores" value={totalUsuarios} color="primary" />
            <SummaryItem icon={Building} label="Empresas" value={totalEmpresas} color="info" />
            <SummaryItem icon={FileText} label="Faturas" value={totalFaturas} color="primary" />
            <SummaryItem icon={Clock} label="Pendentes" value={faturasPendentes} color="warning" />
            <SummaryItem icon={CheckCircle} label="Aprovadas" value={faturasAprovadas} color="success" />
            <SummaryItem icon={XCircle} label="Rejeitadas" value={faturasRejeitadas} color="danger" />
          </div>
          <div className="admin-actions-row">
            <button className="view-all-btn" onClick={() => navigate('/admin/faturas')}>
              Ver faturas <Eye size={16} />
            </button>
            <button className="view-all-btn" onClick={() => navigate('/admin/usuarios')}>
              Ver utilizadores <Users size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componentes internos
const StatusBar = ({ label, count, total, color }) => (
  <div className="status-bar-wrapper">
    <div className="status-bar-label">
      <span className="status-bar-name">
        <span className={`dot ${color}`}></span>
        {label}
      </span>
      <span className="status-bar-count">{count}</span>
    </div>
    <div className="status-bar-track">
      <div 
        className={`status-bar-fill ${color}`}
        style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
      />
    </div>
  </div>
);

const SummaryItem = ({ icon: Icon, label, value, color }) => (
  <div className="pending-item">
    <Icon size={20} className={`icon-${color}`} />
    <span>{label}</span>
    <Badge variant={color}>{value}</Badge>
  </div>
);

const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export default Dashboard;