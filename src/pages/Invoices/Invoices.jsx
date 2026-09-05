// src/pages/Invoices/Invoices.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Trash2, 
  AlertCircle, 
  Eye, 
  Upload,
  RefreshCw,
  Search,
  CheckCircle,
  Circle,
  ChevronRight,
  Plus,
  Calendar,
  Building,
  DollarSign,
  Clock
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import './Invoices.css';

// ============================================================
// CONSTANTES
// ============================================================

const STATUS_MAP = {
  AGUARDANDO_APROVACAO: { label: 'Aguardando', variant: 'warning', icon: Clock },
  APROVADO: { label: 'Aprovado', variant: 'success', icon: CheckCircle },
  REJEITADO: { label: 'Rejeitado', variant: 'danger', icon: AlertCircle },
  PAGO: { label: 'Pago', variant: 'success', icon: CheckCircle },
  PENDENTE: { label: 'Pendente', variant: 'warning', icon: Clock },
  CANCELADO: { label: 'Cancelado', variant: 'danger', icon: AlertCircle },
};

const FILTER_OPTIONS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'AGUARDANDO_APROVACAO', label: 'Aguardando' },
  { value: 'APROVADO', label: 'Aprovadas' },
  { value: 'REJEITADO', label: 'Rejeitadas' },
  { value: 'PAGO', label: 'Pagas' },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export const Invoices = () => {
  const navigate = useNavigate();
  const { getInvoices, deleteInvoice } = useInvoices();
  
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ============================================================
  // FORMATADORES
  // ============================================================

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

  const getStatusProps = useCallback((status) => {
    const info = STATUS_MAP[status?.toUpperCase()] || { 
      label: status || 'Desconhecido', 
      variant: 'default', 
      icon: Circle 
    };
    return info;
  }, []);

  // ============================================================
  // FUNÇÕES DE BUSCA
  // ============================================================

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statusParam = filter === 'ALL' ? null : filter;
      const data = await getInvoices(statusParam);
      
      const listaFaturas = Array.isArray(data) ? data : data?.content || [];
      setInvoices(listaFaturas);
    } catch (err) {
      console.error('Erro ao buscar faturas:', err);
      setError(err.friendlyMessage || 'Erro ao carregar faturas.');
    } finally {
      setLoading(false);
    }
  }, [filter, getInvoices]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setInvoiceToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) return;

    try {
      setDeleteLoading(invoiceToDelete);
      setError(null);
      
      await deleteInvoice(invoiceToDelete);
      
      setInvoices(prev => prev.filter(inv => inv.id !== invoiceToDelete));
      setSuccessMessage('Fatura removida com sucesso!');
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Erro ao deletar fatura:', err);
      setError(err.friendlyMessage || 'Não foi possível remover a fatura.');
      await fetchInvoices();
    } finally {
      setDeleteLoading(null);
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setInvoiceToDelete(null);
  };

  const handleRowClick = (row) => {
    navigate(`/faturas/${row.id}`);
  };

  // ============================================================
  // DADOS COMPUTADOS
  // ============================================================

  const filteredInvoices = useMemo(() => {
    if (!searchTerm) return invoices;
    
    const term = searchTerm.toLowerCase();
    return invoices.filter(invoice => (
      invoice.numeroFatura?.toLowerCase().includes(term) ||
      invoice.fornecedor?.toLowerCase().includes(term) ||
      invoice.nuitFornecedor?.includes(term)
    ));
  }, [invoices, searchTerm]);

  const stats = useMemo(() => ({
    total: invoices.length,
    aprovadas: invoices.filter(i => i.status === 'APROVADO').length,
    pendentes: invoices.filter(i => i.status === 'AGUARDANDO_APROVACAO').length,
    rejeitadas: invoices.filter(i => i.status === 'REJEITADO').length,
  }), [invoices]);

  // ============================================================
  // COLUNAS DA TABELA
  // ============================================================

  const tableColumns = useMemo(() => [
    { 
      key: 'numeroFatura', 
      label: 'Número',
      className: 'cell-numero',
      render: (row) => (
        <span className="invoice-number">{row.numeroFatura || 'N/A'}</span>
      )
    },
    { 
      key: 'fornecedor', 
      label: 'Fornecedor',
      render: (row) => (
        <span className="invoice-fornecedor">{row.fornecedor || '-'}</span>
      )
    },
    { 
      key: 'valorTotal', 
      label: 'Valor',
      align: 'right',
      render: (row) => (
        <span className="invoice-valor">{formatarMoeda(row.valorTotal)}</span>
      )
    },
    { 
      key: 'dataFatura', 
      label: 'Data',
      render: (row) => (
        <span className="invoice-data">{formatarData(row.dataFatura)}</span>
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
        <div className="row-actions">
          <button
            className="btn-delete"
            onClick={(e) => handleDeleteClick(e, row.id)}
            disabled={deleteLoading === row.id}
            title="Remover fatura"
          >
            <Trash2 size={16} />
          </button>
          <ChevronRight size={16} className="row-arrow" />
        </div>
      )
    }
  ], [deleteLoading, formatarMoeda, formatarData, getStatusProps, handleDeleteClick]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="invoices-container">
      {/* ============================================================
          MODAL DE CONFIRMAÇÃO
      ============================================================ */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Remover fatura?"
        footer={
          <div className="modal-footer">
            <button className="btn-cancel" onClick={cancelDelete} disabled={deleteLoading === invoiceToDelete}>
              Cancelar
            </button>
            <button 
              className="btn-danger" 
              onClick={confirmDelete}
              disabled={deleteLoading === invoiceToDelete}
            >
              {deleteLoading === invoiceToDelete ? 'A remover...' : 'Sim, remover'}
            </button>
          </div>
        }
      >
        <p>Tem certeza que deseja remover esta fatura?</p>
        <p className="modal-warning">Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* ============================================================
          HEADER
      ============================================================ */}
      <div className="invoices-header">
      <div>
        <h1>Faturas</h1>
        <p className="header-subtitle">Histórico completo de todas as faturas processadas</p>
      </div>        <div className="header-actions">
          <Link to="/faturas/upload" className="btn-upload">
            <Upload size={16} />
            Nova fatura
          </Link>
          <button 
            className="btn-refresh"
            onClick={fetchInvoices} 
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </div>

      {/* ============================================================
          STATS
      ============================================================ */}
      <div className="stats-row">
        <div className="stat-item">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item success">
          <span className="stat-number">{stats.aprovadas}</span>
          <span className="stat-label">Aprovadas</span>
        </div>
        <div className="stat-item warning">
          <span className="stat-number">{stats.pendentes}</span>
          <span className="stat-label">Pendentes</span>
        </div>
        <div className="stat-item danger">
          <span className="stat-number">{stats.rejeitadas}</span>
          <span className="stat-label">Rejeitadas</span>
        </div>
      </div>

      {/* ============================================================
          TOOLBAR
      ============================================================ */}
      <div className="toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Buscar por número ou fornecedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className={`filter-btn ${filter === opt.value ? 'active' : ''}`}
              onClick={() => setFilter(opt.value)}
              disabled={loading}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================
          MESSAGES
      ============================================================ */}
      {successMessage && (
        <div className="success-box">
          <CheckCircle size={16} />
          {successMessage}
        </div>
      )}

      {error && (
        <div className="error-box">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ============================================================
          LOADING
      ============================================================ */}
      {loading && (
        <div className="loading-box">
          <Spinner size="md" />
          <p>A carregar faturas...</p>
        </div>
      )}

      {/* ============================================================
          EMPTY STATE
      ============================================================ */}
      {!loading && !error && invoices.length === 0 && (
        <div className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h3>Nenhuma fatura encontrada</h3>
          <p>Comece por fazer upload da sua primeira fatura.</p>
          <Link to="/faturas/upload" className="btn-empty">
            <Upload size={16} />
            Fazer upload
          </Link>
        </div>
      )}

      {/* ============================================================
          TABLE
      ============================================================ */}
      {!loading && !error && filteredInvoices.length > 0 && (
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
              {filteredInvoices.map((inv) => {
                const status = getStatusProps(inv.status);
                const Icon = status.icon;
                return (
                  <tr key={inv.id} onClick={() => handleRowClick(inv)}>
                    <td className="cell-numero">
                      <span className="invoice-number">{inv.numeroFatura || 'N/A'}</span>
                    </td>
                    <td>{inv.fornecedor || '-'}</td>
                    <td className="cell-valor">{formatarMoeda(inv.valorTotal)}</td>
                    <td className="cell-data">{formatarData(inv.dataFatura)}</td>
                    <td>
                      <span className={`status-badge status-${status.variant}`}>
                        <Icon size={12} />
                        {status.label}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        className="btn-delete"
                        onClick={(e) => handleDeleteClick(e, inv.id)}
                        disabled={deleteLoading === inv.id}
                        title="Remover fatura"
                      >
                        <Trash2 size={16} />
                      </button>
                      <ChevronRight size={16} className="row-arrow" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Invoices;