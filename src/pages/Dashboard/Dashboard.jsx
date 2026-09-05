// src/pages/Dashboard/Dashboard.jsx
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
  ArrowRight,
  Plus,
  Search,
  DollarSign,
  Building,
  User,
  Calendar,
  ChevronRight,
  Download
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useInvoices } from '../../hooks/useInvoices';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import './Dashboard.css';

export const Dashboard = () => {
  const { user } = useAuth();  // ✅ Buscar o utilizador autenticado
  const { getInvoices } = useInvoices();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // ============================================================
  // CARREGAR DADOS
  // ============================================================

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

  // ============================================================
  // ESTATÍSTICAS
  // ============================================================

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
        if (inv.valorTotal) {
          acc.valorTotal += Number(inv.valorTotal);
        }
        return acc;
      },
      { total: 0, pendentes: 0, aprovadas: 0, rejeitadas: 0, valorTotal: 0 }
    );
  }, [invoices]);

  // ============================================================
  // FILTRAGEM
  // ============================================================

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    return invoices.filter(inv => 
      inv.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.numeroFatura?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [invoices, searchTerm]);

  // ============================================================
  // UTILITÁRIOS
  // ============================================================

  const getStatusProps = useCallback((status) => {
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando', variant: 'warning', icon: Clock },
      'PENDENTE': { label: 'Pendente', variant: 'warning', icon: Clock },
      'APROVADO': { label: 'Aprovado', variant: 'success', icon: CheckCircle },
      'PROCESSADO': { label: 'Processado', variant: 'success', icon: CheckCircle },
      'PAGO': { label: 'Pago', variant: 'success', icon: CheckCircle },
      'REJEITADO': { label: 'Rejeitado', variant: 'danger', icon: XCircle },
      'CANCELADO': { label: 'Cancelado', variant: 'danger', icon: XCircle },
    };
    return statusMap[status?.toUpperCase()] || { 
      label: status || 'Desconhecido', 
      variant: 'default', 
      icon: AlertCircle 
    };
  }, []);

  const formatarMoeda = useCallback((valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00';
    return `MT ${Number(valor).toLocaleString('pt-MZ', { 
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

  // ============================================================
  // ✅ NOME DO UTILIZADOR - COM FALLBACK
  // ============================================================

  const nomeUsuario = useMemo(() => {
    // Tentar diferentes campos onde o nome pode estar
    return user?.nome || 
           user?.nomeCompleto || 
           user?.name || 
           user?.username || 
           'Utilizador';
  }, [user]);

  // ============================================================
  // CARDS DE ESTATÍSTICAS
  // ============================================================

  const statCards = [
    {
      key: 'total',
      label: 'Total de faturas',
      value: stats.total,
      icon: FileText,
      variant: 'primary',
      desc: 'Todas as faturas registadas'
    },
    {
      key: 'pendentes',
      label: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      variant: 'warning',
      desc: 'Aguardando aprovação'
    },
    {
      key: 'aprovadas',
      label: 'Aprovadas',
      value: stats.aprovadas,
      icon: CheckCircle,
      variant: 'success',
      desc: 'Já processadas'
    },
    {
      key: 'rejeitadas',
      label: 'Rejeitadas',
      value: stats.rejeitadas,
      icon: XCircle,
      variant: 'danger',
      desc: 'Com problemas'
    },
    {
      key: 'valor',
      label: 'Valor total',
      value: formatarMoeda(stats.valorTotal),
      icon: DollarSign,
      variant: 'gold',
      desc: 'Montante acumulado'
    }
  ];

  // ============================================================
  // COLUNAS DA TABELA
  // ============================================================

  const tableColumns = [
    { 
      key: 'numeroFatura', 
      label: 'Número',
      className: 'cell-number',
      render: (row) => (
        <span className="invoice-number">{row.numeroFatura || 'N/A'}</span>
      )
    },
    { 
      key: 'fornecedor', 
      label: 'Fornecedor',
      render: (row) => (
        <span>{row.fornecedor || '-'}</span>
      )
    },
    { 
      key: 'valorTotal', 
      label: 'Valor',
      align: 'right',
      render: (row) => (
        <span className="cell-valor">{formatarMoeda(row.valorTotal)}</span>
      )
    },
    { 
      key: 'dataFatura', 
      label: 'Data',
      render: (row) => (
        <span className="cell-data">{formatarData(row.dataFatura)}</span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => {
        const status = getStatusProps(row.status);
        const Icon = status.icon;
        return (
          <span className={`status-badge status-${status.variant}`}>
            <Icon size={12} />
            {status.label}
          </span>
        );
      }
    },
    {
      key: 'acoes',
      label: '',
      className: 'cell-actions',
      render: (row) => (
        <Link to={`/faturas/${row.id}`} className="btn-detail">
          Ver
          <ChevronRight size={14} />
        </Link>
      )
    }
  ];

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-state">
          <Spinner size="lg" />
          <p>A carregar as faturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* ============================================================
          ✅ HEADER COM SAUDAÇÃO PERSONALIZADA
      ============================================================ */}
      <div className="dashboard-header">
        <div className="header-greeting">
          <h1>Olá, {nomeUsuario} 👋</h1>
          <p>Como estão as coisas por aqui?</p>
        </div>
        <Link to="/faturas/upload" className="btn-upload">
          <Upload size={16} />
          Nova fatura
        </Link>
      </div>

      {/* ============================================================
          STATS
      ============================================================ */}
      <div className="stats-grid">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className={`stat-card stat-${card.variant}`}>
              <div className="stat-icon">
                <Icon size={20} />
              </div>
              <div>
                <p className="stat-number">{card.value}</p>
                <p className="stat-label">{card.label}</p>
                <p className="stat-desc">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ============================================================
          AÇÕES RÁPIDAS
      ============================================================ */}
      <div className="quick-actions">
        <h2>O que fazer agora?</h2>
        <div className="actions-grid">
          <Link to="/faturas/upload" className="action-card">
            <div className="action-icon upload">
              <Upload size={20} />
            </div>
            <div>
              <span className="action-title">Adicionar fatura</span>
              <span className="action-desc">Upload com OCR</span>
            </div>
            <ChevronRight size={16} className="action-arrow" />
          </Link>
          <Link to="/faturas" className="action-card">
            <div className="action-icon list">
              <FileText size={20} />
            </div>
            <div>
              <span className="action-title">Ver faturas</span>
              <span className="action-desc">Lista completa</span>
            </div>
            <ChevronRight size={16} className="action-arrow" />
          </Link>
          <Link to="/relatorios" className="action-card">
            <div className="action-icon report">
              <Download size={20} />
            </div>
            <div>
              <span className="action-title">Relatórios</span>
              <span className="action-desc">Exportar dados</span>
            </div>
            <ChevronRight size={16} className="action-arrow" />
          </Link>
        </div>
      </div>

      {/* ============================================================
          FATURAS RECENTES
      ============================================================ */}
      <div className="recent-section">
        <div className="section-header">
          <div>
            <h2>Faturas recentes</h2>
            <p>As últimas faturas que foram processadas</p>
          </div>
          <div className="section-actions">
            <div className="search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link to="/faturas" className="see-all">
              Ver todas
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-box">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {invoices.length === 0 ? (
          <div className="empty-state">
            <FileText size={48} className="empty-icon" />
            <h3>Nenhuma fatura encontrada</h3>
            <p>Comece por fazer upload da sua primeira fatura.</p>
            <Link to="/faturas/upload" className="btn-empty">
              <Upload size={16} />
              Upload
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="invoices-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fornecedor</th>
                  <th>Valor</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.slice(0, 5).map((inv) => {
                  const status = getStatusProps(inv.status);
                  const Icon = status.icon;
                  return (
                    <tr key={inv.id} onClick={() => window.location.href = `/faturas/${inv.id}`}>
                      <td className="cell-number">{inv.numeroFatura || 'N/A'}</td>
                      <td>{inv.fornecedor || '-'}</td>
                      <td className="cell-valor">{formatarMoeda(inv.valorTotal)}</td>
                      <td className="cell-data">{formatarData(inv.dataFatura)}</td>
                      <td>
                        <span className={`status-badge status-${status.variant}`}>
                          <Icon size={12} />
                          {status.label}
                        </span>
                      </td>
                      <td className="cell-action">
                        <ChevronRight size={16} className="action-chevron" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;