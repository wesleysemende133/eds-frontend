import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Building,
  Calendar,
  DollarSign,
  Hash,
  Tag,
  Info,
  CreditCard,
  User,
  X
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { InvoiceActions } from '../../components/shared/InvoiceActions';
import './InvoiceDetail.css';

export const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getInvoiceById, deleteInvoice } = useInvoices();
  
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(id);
      
      if (!data) {
        setError('Fatura não encontrada');
        return;
      }
      
      setInvoice(data);
    } catch (err) {
      console.error('Erro ao buscar fatura:', err);
      
      if (err.response?.status === 404) {
        setError('Fatura não encontrada ou já foi removida');
        setTimeout(() => navigate('/faturas'), 2000);
      } else {
        setError(err.friendlyMessage || 'Erro ao carregar os detalhes da fatura.');
      }
    } finally {
      setLoading(false);
    }
  }, [id, getInvoiceById, navigate]);

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id, fetchInvoice]);

  const handleDeleteClick = () => setShowDeleteModal(true);

  const confirmDelete = async () => {
    setShowDeleteModal(false);
    
    try {
      setDeleteLoading(true);
      setError(null);
      
      await deleteInvoice(id);
      setDeleteSuccess(true);
      
      setTimeout(() => {
        navigate('/faturas', { replace: true });
      }, 2000);
      
    } catch (err) {
      console.error('Erro ao deletar fatura:', err);
      setDeleteLoading(false);
      setError(err.friendlyMessage || 'Não foi possível deletar a fatura. Tente novamente.');
    }
  };

  const cancelDelete = () => setShowDeleteModal(false);

  const getStatusProps = (status) => {
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando Aprovação', variant: 'warning' },
      'PROCESSANDO': { label: 'Processando', variant: 'info' },
      'PROCESSADO': { label: 'Processado', variant: 'success' },
      'APROVADO': { label: 'Aprovado', variant: 'success' },
      'REJEITADO': { label: 'Rejeitado', variant: 'danger' },
      'ERRO_EXTRACAO': { label: 'Erro na Extração', variant: 'danger' },
      'CANCELADO': { label: 'Cancelado', variant: 'danger' },
      'PAGO': { label: 'Pago', variant: 'success' },
      'PENDENTE': { label: 'Pendente', variant: 'warning' },
    };
    return statusMap[status?.toUpperCase()] || { label: status || 'Desconhecido', variant: 'default' };
  };

  const formatarData = (dataString) => {
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
  };

  const formatarDataHora = (dataString) => {
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
  };

  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00';
    return `MT ${valor.toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  if (loading) {
    return (
      <div className="invoice-detail-container">
        <div className="loading-container">
          <Spinner size="lg" label="Carregando detalhes da fatura..." />
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <Button variant="ghost" onClick={() => navigate('/faturas')} className="btn-back">
          <ArrowLeft size={18} />
          Voltar
        </Button>
        <Alert variant="danger">
          <AlertCircle size={18} />
          {error || 'Fatura não encontrada.'}
        </Alert>
      </div>
    );
  }

  const statusInfo = getStatusProps(invoice.status);

  return (
    <div className="invoice-detail-container">
      {/* Modal de Confirmação */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Confirmar Exclusão"
        footer={
          <>
            <Button variant="secondary" onClick={cancelDelete} disabled={deleteLoading}>
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
          </>
        }
      >
        <p>Tem certeza de que deseja excluir permanentemente esta fatura?</p>
        <p className="modal-warning">⚠️ Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* HEADER */}
      <div className="detail-header">
        <div className="detail-header-left">
          <Button variant="ghost" onClick={() => navigate('/faturas')} className="btn-back" disabled={deleteLoading}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
          <h1>Detalhes da Fatura</h1>
        </div>
        
        <div className="header-actions">
          <button className="btn-icon" disabled={deleteLoading} title="Baixar documento">
            <Download size={18} />
          </button>
          <button
            className="btn-icon btn-danger"
            onClick={handleDeleteClick}
            disabled={deleteLoading || deleteSuccess}
            title="Excluir"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* MENSAGEM DE SUCESSO */}
      {deleteSuccess && (
        <Alert variant="success">
          <CheckCircle size={18} />
          Fatura excluída com sucesso! Redirecionando...
        </Alert>
      )}

      {/* STATUS CARD */}
      <Card className="status-card">
        <div className="status-grid">
          <div className="status-item">
            <span className="status-label">Status</span>
            <span className="status-value">
              <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">ID Universal</span>
            <span className="status-value mono">{invoice.id || '-'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Data de Recebimento</span>
            <span className="status-value">{formatarDataHora(invoice.dataCriacao)}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Número do Documento</span>
            <span className="status-value highlight">{invoice.numeroFatura || 'Não identificado'}</span>
          </div>
        </div>
      </Card>

      {/* CONTENT */}
      <div className="detail-content">
        {/* LEFT COLUMN */}
        <div className="left-column">
          {/* METADADOS */}
          <Card className="info-card">
            <div className="card-header">
              <Info size={18} />
              <h3>Metadados de Identificação</h3>
            </div>
            <div className="info-grid">
              <div className="info-row">
                <label>Número do Documento</label>
                <span className="highlight">{invoice.numeroFatura || 'Não identificado'}</span>
              </div>
              <div className="info-row">
                <label>Categoria</label>
                <span>{invoice.categoria || 'Não definida'}</span>
              </div>
            </div>
          </Card>

          {/* FINANCEIRO */}
          <Card className="info-card">
            <div className="card-header">
              <CreditCard size={18} />
              <h3>Dados Financeiros</h3>
            </div>
            <div className="finance-grid">
              <div className="finance-item">
                <p className="finance-label">Valor Base</p>
                <p className="finance-value">{formatarMoeda(invoice.valorBase)}</p>
              </div>
              <div className="finance-item">
                <p className="finance-label">IVA</p>
                <p className="finance-value">{formatarMoeda(invoice.valorIva)}</p>
              </div>
              <div className="finance-item finance-total">
                <p className="finance-label">Valor Total</p>
                <p className="finance-value">{formatarMoeda(invoice.valorTotal)}</p>
              </div>
            </div>
          </Card>

          {/* FORNECEDOR */}
          <Card className="info-card">
            <div className="card-header">
              <Building size={18} />
              <h3>Fornecedor</h3>
            </div>
            <div className="info-grid">
              <div className="info-row">
                <label>Nome</label>
                <span className="highlight">{invoice.fornecedor || 'Não extraído'}</span>
              </div>
              <div className="info-row">
                <label>NUIT</label>
                <span className="mono">{invoice.nuitFornecedor || 'Não identificado'}</span>
              </div>
              <div className="info-row">
                <label>Data da Fatura</label>
                <span>{formatarData(invoice.dataFatura)}</span>
              </div>
              <div className="info-row">
                <label>Data de Vencimento</label>
                <span>{invoice.dataVencimento ? formatarData(invoice.dataVencimento) : 'Não informada'}</span>
              </div>
            </div>
          </Card>

          {/* ARQUIVO */}
          {(invoice.nomeArquivo || invoice.urlArquivo) && (
            <Card className="info-card">
              <div className="card-header">
                <FileText size={18} />
                <h3>Informações do Arquivo</h3>
              </div>
              <div className="info-grid">
                <div className="info-row">
                  <label>Nome do Arquivo</label>
                  <span className="file-name">{invoice.nomeArquivo || '-'}</span>
                </div>
                <div className="info-row">
                  <label>Caminho</label>
                  <span className="file-path">{invoice.urlArquivo || '-'}</span>
                </div>
              </div>
            </Card>
          )}

          {/* OBSERVAÇÕES */}
          {(invoice.descricao || invoice.errosValidacao) && (
            <Card className="info-card">
              <div className="card-header">
                <Info size={18} />
                <h3>Observações</h3>
              </div>
              {invoice.descricao && (
                <p className="description"><strong>Descrição:</strong> {invoice.descricao}</p>
              )}
              {invoice.errosValidacao && (
                <p className="description error-text">
                  <strong>Erros de Validação:</strong> {invoice.errosValidacao}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="right-column">
          {/* AÇÕES */}
          <Card className="info-card actions-card">
            <div className="card-header">
              <Tag size={18} />
              <h3>Ações</h3>
            </div>
            <InvoiceActions
              faturaId={invoice.id}
              status={invoice.status}
              onActionComplete={fetchInvoice}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
