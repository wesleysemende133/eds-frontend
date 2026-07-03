import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Upload, 
  TrendingUp, 
  AlertCircle, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import './Dashboard.css';

export const Dashboard = () => {
  const { getInvoices } = useInvoices();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoices();
      const listaFaturas = Array.isArray(data) ? data : [];
      setInvoices(listaFaturas);
    } catch (err) {
      console.error('Erro ao buscar faturas:', err);
      setError(err.friendlyMessage || 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [getInvoices]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, inv) => {
        acc.total++;
        const status = inv.status?.toUpperCase();
        if (status === 'AGUARDANDO_APROVACAO' || status === 'PENDENTE') {
          acc.pendentes++;
        } else if (status === 'APROVADO' || status === 'PAGO' || status === 'PROCESSADO') {
          acc.aprovadas++;
        } else if (status === 'REJEITADO' || status === 'CANCELADO') {
          acc.rejeitadas++;
        }
        return acc;
      },
      { total: 0, pendentes: 0, aprovadas: 0, rejeitadas: 0 }
    );
  }, [invoices]);

  const getStatusProps = useCallback((status) => {
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando', variant: 'warning' },
      'PENDENTE': { label: 'Pendente', variant: 'warning' },
      'APROVADO': { label: 'Aprovado', variant: 'success' },
      'PROCESSADO': { label: 'Processado', variant: 'success' },
      'PAGO': { label: 'Pago', variant: 'success' },
      'REJEITADO': { label: 'Rejeitado', variant: 'danger' },
      'CANCELADO': { label: 'Cancelado', variant: 'danger' },
      'ERRO_EXTRACAO': { label: 'Erro', variant: 'danger' },
    };
    return statusMap[status?.toUpperCase()] || { label: status || 'Desconhecido', variant: 'default' };
  }, []);

  const formatarMoeda = useCallback((valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00';
    return `MT ${valor.toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }, []);

  const formatarData = useCallback((dataString) => {
    if (!dataString) return '-';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return '-';
      return data.toLocaleDateString('pt-MZ', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  }, []);

  const statCards = [
    {
      key: 'total',
      label: 'Total de Faturas',
      value: stats.total,
      icon: FileText,
      variant: 'primary'
    },
    {
      key: 'pendentes',
      label: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      variant: 'warning'
    },
    {
      key: 'aprovadas',
      label: 'Aprovadas',
      value: stats.aprovadas,
      icon: CheckCircle,
      variant: 'success'
    },
    {
      key: 'rejeitadas',
      label: 'Rejeitadas',
      value: stats.rejeitadas,
      icon: XCircle,
      variant: 'danger'
    }
  ];

  const tableColumns = [
    { key: 'id', label: 'ID', className: 'cell-id', render: (row) => row.id ? row.id.slice(0, 8) : 'N/A' },
    { key: 'numeroFatura', label: 'Número' },
    { key: 'fornecedor', label: 'Fornecedor' },
    { key: 'valorTotal', label: 'Valor', render: (row) => formatarMoeda(row.valorTotal) },
    { key: 'dataFatura', label: 'Data', render: (row) => formatarData(row.dataFatura) },
    { 
      key: 'status', 
      label: 'Status', 
      render: (row) => {
        const status = getStatusProps(row.status);
        return <Badge variant={status.variant}>{status.label}</Badge>;
      }
    },
    {
      key: 'acoes',
      label: 'Ações',
      className: 'cell-actions',
      render: (row) => (
        <Link to={`/faturas/${row.id}`} className="link-detail">
          <Eye size={16} />
          <span>Detalhes</span>
        </Link>
      )
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-container">
        <Spinner size="lg" label="Carregando faturas..." />
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Visão geral do sistema de gestão de faturas</p>
        </div>
        <Badge variant="info">{invoices.length} faturas</Badge>
      </div>

      {/* STATS GRID */}
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.key} className="stat-card">
              <div className="stat-card-inner">
                <div className={`stat-icon stat-icon-${card.variant}`}>
                  <Icon size={22} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">{card.label}</p>
                  <p className="stat-value">{card.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* QUICK ACTIONS */}
      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          <Link to="/faturas/upload" className="action-card">
            <div className="action-icon">
              <Upload size={24} />
            </div>
            <div>
              <span className="action-title">Nova Fatura</span>
              <span className="action-description">Upload com OCR automático</span>
            </div>
            <ArrowRight size={18} className="action-arrow" />
          </Link>
          <Link to="/faturas" className="action-card">
            <div className="action-icon">
              <FileText size={24} />
            </div>
            <div>
              <span className="action-title">Ver Faturas</span>
              <span className="action-description">Lista completa de documentos</span>
            </div>
            <ArrowRight size={18} className="action-arrow" />
          </Link>
        </div>
      </div>

      {/* RECENT INVOICES */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Faturas Recentes</h2>
          <Link to="/faturas" className="section-link">
            Ver todas
            <ArrowRight size={16} />
          </Link>
        </div>

        {error && (
          <Alert variant="danger">
            <AlertCircle size={16} />
            {error}
          </Alert>
        )}

        {invoices.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <h3>Nenhuma fatura encontrada</h3>
            <p>Faça upload da primeira fatura para começar.</p>
            <Link to="/faturas/upload">
              <Button variant="primary">
                <Upload size={16} />
                Upload
              </Button>
            </Link>
          </div>
        ) : (
          <Table
            columns={tableColumns}
            data={invoices.slice(0, 5)}
            onRowClick={(row) => window.location.href = `/faturas/${row.id}`}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
