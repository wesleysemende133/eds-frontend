import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Trash2, 
  AlertCircle, 
  Filter, 
  Eye, 
  Upload,
  RefreshCw,
  Search,
  CheckCircle,
  Circle
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
  AGUARDANDO_APROVACAO: { label: 'Aguardando Aprovação', variant: 'warning' },
  APROVADO: { label: 'Aprovado', variant: 'success' },
  REJEITADO: { label: 'Rejeitado', variant: 'danger' },
  ERRO_EXTRACAO: { label: 'Erro na Extração', variant: 'danger' },
  CANCELADO: { label: 'Cancelado', variant: 'danger' },
  PAGO: { label: 'Pago', variant: 'success' },
  PENDENTE: { label: 'Pendente', variant: 'warning' },
};

const FILTER_OPTIONS = ['ALL', 'AGUARDANDO_APROVACAO', 'APROVADO', 'REJEITADO', 'CANCELADO', 'PAGO'];

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
  // FORMATADORES (Memoizados)
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

  const formatarDataHora = useCallback((dataString) => {
    if (!dataString) return '-';
    try {
      const data = new Date(dataString);
      if (isNaN(data.getTime())) return '-';
      return data.toLocaleDateString('pt-MZ', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '-';
    }
  }, []);

  const getStatusBadge = useCallback((status) => {
    const statusInfo = STATUS_MAP[status?.toUpperCase()] || { label: status || 'Desconhecido', variant: 'default' };
    return statusInfo;
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
      setSuccessMessage('Fatura excluída com sucesso!');
      
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err) {
      console.error('Erro ao deletar fatura:', err);
      setError(err.friendlyMessage || 'Não foi possível excluir a fatura.');
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
  // DADOS COMPUTADOS (Memoizados)
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
      key: 'id', 
      label: 'ID', 
      className: 'cell-id', 
      render: (row) => row.id ? row.id.slice(0, 8) : 'N/A' 
    },
    { key: 'numeroFatura', label: 'Número', className: 'cell-numero' },
    { key: 'fornecedor', label: 'Fornecedor', className: 'cell-fornecedor' },
    { 
      key: 'valorTotal', 
      label: 'Valor', 
      className: 'cell-valor', 
      render: (row) => formatarMoeda(row.valorTotal) 
    },
    { 
      key: 'dataFatura', 
      label: 'Data', 
      render: (row) => formatarData(row.dataFatura) 
    },
    { 
      key: 'dataVencimento', 
      label: 'Vencimento', 
      render: (row) => row.dataVencimento ? formatarData(row.dataVencimento) : '-' 
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => {
        const status = getStatusBadge(row.status);
        return (
          <span className={`status-badge status-badge-${status.variant}`}>
            <span className="dot" />
            {status.label}
          </span>
        );
      }
    },
    { 
      key: 'dataCriacao', 
      label: 'Cadastro', 
      className: 'cell-date', 
      render: (row) => formatarDataHora(row.dataCriacao) 
    },
    {
      key: 'acoes',
      label: 'Ações',
      className: 'cell-actions',
      render: (row) => (
        <>
          <Link to={`/faturas/${row.id}`} className="action-link">
            <Eye size={16} />
            Detalhes
          </Link>
          <button
            className="action-delete"
            onClick={(e) => handleDeleteClick(e, row.id)}
            disabled={deleteLoading === row.id}
            aria-label="Excluir fatura"
          >
            <Trash2 size={16} />
          </button>
        </>
      )
    }
  ], [deleteLoading, formatarMoeda, formatarData, formatarDataHora, getStatusBadge, handleDeleteClick]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="invoices-container">
      {/* Modal de Confirmação */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="secondary" onClick={cancelDelete} disabled={deleteLoading === invoiceToDelete}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              disabled={deleteLoading === invoiceToDelete}
            >
              {deleteLoading === invoiceToDelete ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </>
        }
      >
        <p>Tem certeza de que deseja excluir permanentemente esta fatura?</p>
        <p className="modal-warning">⚠️ Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* HEADER */}
      <div className="invoices-header">
        <div className="header-left">
          <h1>Faturas</h1>
          <div className="header-stats">
            <span className="stat-item">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total</span>
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item stat-approved">
              <span className="stat-value">{stats.aprovadas}</span>
              <span className="stat-label">Aprovadas</span>
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item stat-pending">
              <span className="stat-value">{stats.pendentes}</span>
              <span className="stat-label">Pendentes</span>
            </span>
            <span className="stat-divider">|</span>
            <span className="stat-item stat-rejected">
              <span className="stat-value">{stats.rejeitadas}</span>
              <span className="stat-label">Rejeitadas</span>
            </span>
          </div>
        </div>
        <div className="header-actions">
          <Link to="/faturas/upload">
            <Button variant="primary">
              <Upload size={18} />
              Nova Fatura
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            onClick={fetchInvoices} 
            disabled={loading}
            className="btn-refresh"
            aria-label="Atualizar lista"
          >
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </Button>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Pesquisar por número, fornecedor ou NUIT..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              aria-label="Pesquisar faturas"
            />
          </div>
        </div>
        <div className="toolbar-right">
          <div className="filter-group">
            <Filter size={18} />
            <span>Filtrar:</span>
          </div>
          <div className="filter-buttons">
            {FILTER_OPTIONS.map((status) => (
              <Button
                key={status}
                variant={filter === status ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setFilter(status)}
                disabled={loading}
              >
                {status === 'ALL' ? 'Todos' : status.replace('_', ' ').toLowerCase()}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      {successMessage && (
        <Alert variant="success">
          <CheckCircle size={18} />
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          <AlertCircle size={18} />
          {error}
        </Alert>
      )}

      {/* LOADING */}
      {loading && (
        <div className="loading-container">
          <Spinner size="lg" />
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && invoices.length === 0 && (
        <Card className="empty-state">
          <FileText size={48} className="empty-icon" />
          <h2>Nenhuma fatura localizada</h2>
          <p>Envie um arquivo PDF ou imagem para iniciar o processamento OCR automático.</p>
          <Link to="/faturas/upload">
            <Button variant="primary">
              <Upload size={18} />
              Fazer Upload
            </Button>
          </Link>
        </Card>
      )}

      {/* TABLE */}
      {!loading && !error && filteredInvoices.length > 0 && (
        <Card className="table-card">
          <Table
            columns={tableColumns}
            data={filteredInvoices}
            onRowClick={handleRowClick}
          />
        </Card>
      )}
    </div>
  );
};

export default Invoices;