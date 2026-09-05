// src/pages/InvoiceDetail/InvoiceDetail.jsx
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
  Info,
  CreditCard,
  Loader2,
  Banknote,
  Phone,
  Receipt,
  User,
  ChevronRight,
  Clock,
  Tag
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { InvoiceActions } from '../../components/shared/InvoiceActions';
import { FaturaItens } from '../../components/fatura/FaturaItens';
import api from '../../services/api';
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
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [dadosPagamento, setDadosPagamento] = useState(null);

  // ============================================================
  // BUSCAR FATURA
  // ============================================================

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
      
      if (data.dadosPagamento) {
        try {
          const parsed = typeof data.dadosPagamento === 'string' 
            ? JSON.parse(data.dadosPagamento) 
            : data.dadosPagamento;
          setDadosPagamento(parsed);
        } catch (e) {
          console.error('Erro ao parsear dados de pagamento:', e);
          setDadosPagamento(null);
        }
      } else {
        setDadosPagamento(null);
      }
      
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

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleDownload = async () => {
    if (!invoice?.urlArquivo) {
      alert('Arquivo não disponível para download.');
      return;
    }

    try {
      setDownloadLoading(true);
      
      const response = await api.get(`/faturas/${id}/download`, {
        responseType: 'blob'
      });

      const contentDisposition = response.headers['content-disposition'];
      let filename = invoice.nomeArquivo || 'fatura.pdf';
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      alert('Erro ao baixar o arquivo. Tente novamente.');
    } finally {
      setDownloadLoading(false);
    }
  };

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

  // ============================================================
  // UTILITÁRIOS
  // ============================================================

  const getStatusProps = (status) => {
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando', variant: 'warning' },
      'APROVADO': { label: 'Aprovado', variant: 'success' },
      'REJEITADO': { label: 'Rejeitado', variant: 'danger' },
      'PAGO': { label: 'Pago', variant: 'success' },
      'PENDENTE': { label: 'Pendente', variant: 'warning' },
      'CANCELADO': { label: 'Cancelado', variant: 'danger' },
    };
    return statusMap[status?.toUpperCase()] || { label: status || 'Desconhecido', variant: 'default' };
  };

  const getStatusPagamentoProps = (status) => {
    const statusMap = {
      'NAO_PAGO': { label: 'Não pago', variant: 'default' },
      'PENDENTE': { label: 'Pendente', variant: 'warning' },
      'PAGO': { label: 'Pago', variant: 'success' },
      'CANCELADO': { label: 'Cancelado', variant: 'danger' },
    };
    return statusMap[status] || { label: status || 'Desconhecido', variant: 'default' };
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
    return `MT ${Number(valor).toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // ============================================================
  // RENDER DADOS DE PAGAMENTO
  // ============================================================

  const renderDadosPagamento = () => {
    if (!dadosPagamento) return null;

    const metodo = dadosPagamento.metodo?.replace('_', ' ');
    const statusPagamento = dadosPagamento.status;
    const statusInfo = getStatusPagamentoProps(statusPagamento);
    const valor = dadosPagamento.valor;
    const referencia = dadosPagamento.referencia;
    
    const banco = dadosPagamento.banco;
    const iban = dadosPagamento.iban;
    const titular = dadosPagamento.titular;
    const numero = dadosPagamento.numero;
    const operadora = dadosPagamento.operadora;

    return (
      <div className="pagamento-section">
        <div className="section-label">
          <Banknote size={16} />
          <span>Dados de pagamento</span>
        </div>
        <div className="pagamento-grid">
          <div className="pagamento-info">
            <div className="info-row">
              <label>Método</label>
              <span>{metodo || 'Não identificado'}</span>
            </div>
            <div className="info-row">
              <label>Status</label>
              <span className={`status-pagamento ${statusInfo.variant}`}>
                {statusInfo.label}
              </span>
            </div>
            {referencia && (
              <div className="info-row">
                <label>Referência</label>
                <span className="mono">{referencia}</span>
              </div>
            )}
            {valor && (
              <div className="info-row">
                <label>Valor</label>
                <span className="valor-destaque">{formatarMoeda(valor)}</span>
              </div>
            )}
          </div>

          {(banco || iban || titular || numero || operadora) && (
            <div className="pagamento-detalhes">
              <p className="detalhes-label">Detalhes</p>
              {banco && (
                <div className="detalhe-item">
                  <Building size={14} />
                  <span>{banco}</span>
                </div>
              )}
              {iban && (
                <div className="detalhe-item">
                  <Hash size={14} />
                  <span className="mono">{iban}</span>
                </div>
              )}
              {titular && (
                <div className="detalhe-item">
                  <User size={14} />
                  <span>{titular}</span>
                </div>
              )}
              {numero && (
                <div className="detalhe-item">
                  <Phone size={14} />
                  <span>{numero}</span>
                </div>
              )}
              {operadora && (
                <div className="detalhe-item">
                  <Tag size={14} />
                  <span>{operadora}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="invoice-detail-container">
        <div className="loading-state">
          <Spinner size="lg" />
          <p>A carregar fatura...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <button className="btn-back" onClick={() => navigate('/faturas')}>
          <ArrowLeft size={16} />
          Voltar
        </button>
        <div className="error-box">
          <AlertCircle size={16} />
          {error || 'Fatura não encontrada.'}
        </div>
      </div>
    );
  }

  const statusInfo = getStatusProps(invoice.status);

  return (
    <div className="invoice-detail-container">
      {/* MODAL */}
      <Modal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Remover fatura?"
        footer={
          <div className="modal-footer">
            <button className="btn-cancel" onClick={cancelDelete} disabled={deleteLoading}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? 'A remover...' : 'Sim, remover'}
            </button>
          </div>
        }
      >
        <p>Tem certeza que deseja remover esta fatura?</p>
        <p className="modal-warning">Esta ação não pode ser desfeita.</p>
      </Modal>

      {/* HEADER */}
      <div className="detail-header">
        <div className="detail-header-left">
          <button className="btn-back" onClick={() => navigate('/faturas')}>
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div>
            <h1>{invoice.numeroFatura || 'Fatura'}</h1>
            <span className={`status-badge status-${statusInfo.variant}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <button
            className="btn-icon btn-download"
            onClick={handleDownload}
            disabled={deleteLoading || downloadLoading || !invoice?.urlArquivo}
            title={invoice?.urlArquivo ? 'Baixar documento' : 'Documento não disponível'}
          >
            {downloadLoading ? (
              <Loader2 size={16} className="spinning" />
            ) : (
              <Download size={16} />
            )}
          </button>
          <button
            className="btn-icon btn-delete"
            onClick={handleDeleteClick}
            disabled={deleteLoading || deleteSuccess}
            title="Remover fatura"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {deleteSuccess && (
        <div className="success-box">
          <CheckCircle size={16} />
          Fatura removida com sucesso!
        </div>
      )}

      {error && (
        <div className="error-box">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* CONTENT */}
      <div className="detail-content">
        {/* LEFT COLUMN */}
        <div className="left-column">
          {/* METADADOS */}
          <div className="info-section">
            <div className="section-label">
              <Info size={16} />
              <span>Informações gerais</span>
            </div>
            <div className="info-grid">
              <div className="info-row">
                <label>Número</label>
                <span className="valor-destaque">{invoice.numeroFatura || 'Não identificado'}</span>
              </div>
              <div className="info-row">
                <label>Categoria</label>
                <span>{invoice.categoria || 'Não definida'}</span>
              </div>
              <div className="info-row">
                <label>Data de criação</label>
                <span>{formatarDataHora(invoice.dataCriacao)}</span>
              </div>
              <div className="info-row">
                <label>ID</label>
                <span className="mono">{invoice.id || '-'}</span>
              </div>
            </div>
          </div>

          {/* FORNECEDOR */}
          <div className="info-section">
            <div className="section-label">
              <Building size={16} />
              <span>Fornecedor</span>
            </div>
            <div className="info-grid">
              <div className="info-row">
                <label>Nome</label>
                <span className="valor-destaque">{invoice.fornecedor || 'Não extraído'}</span>
              </div>
              <div className="info-row">
                <label>NUIT</label>
                <span className="mono">{invoice.nuitFornecedor || 'Não identificado'}</span>
              </div>
              <div className="info-row">
                <label>Data de emissão</label>
                <span>{formatarData(invoice.dataFatura)}</span>
              </div>
              <div className="info-row">
                <label>Data de vencimento</label>
                <span>{invoice.dataVencimento ? formatarData(invoice.dataVencimento) : 'Não informada'}</span>
              </div>
            </div>
          </div>

          {/* VALORES */}
          <div className="info-section valores-section">
            <div className="section-label">
              <DollarSign size={16} />
              <span>Valores</span>
            </div>
            <div className="valores-grid">
              <div className="valor-item">
                <span className="valor-label">Base</span>
                <span className="valor">{formatarMoeda(invoice.valorBase)}</span>
              </div>
              <div className="valor-item">
                <span className="valor-label">IVA</span>
                <span className="valor">{formatarMoeda(invoice.valorIva)}</span>
              </div>
              <div className="valor-item total">
                <span className="valor-label">Total</span>
                <span className="valor">{formatarMoeda(invoice.valorTotal)}</span>
              </div>
            </div>
          </div>

          {/* ITENS */}
          {invoice.itens && invoice.itens.length > 0 && (
            <div className="info-section itens-section">
              <div className="section-label">
                <Receipt size={16} />
                <span>Itens da fatura</span>
                <span className="itens-count">{invoice.itens.length}</span>
              </div>
              <FaturaItens 
                itens={invoice.itens}
                moeda={invoice.moeda || 'MZN'}
                showHeader={false}
                compact={true}
              />
            </div>
          )}

          {/* PAGAMENTO */}
          {renderDadosPagamento()}

          {/* ARQUIVO */}
          {(invoice.nomeArquivo || invoice.urlArquivo) && (
            <div className="info-section">
              <div className="section-label">
                <FileText size={16} />
                <span>Arquivo</span>
              </div>
              <div className="info-grid">
                <div className="info-row">
                  <label>Nome</label>
                  <span className="file-name">{invoice.nomeArquivo || '-'}</span>
                </div>
                <div className="info-row">
                  <label>Localização</label>
                  <span className="file-path mono">{invoice.urlArquivo || '-'}</span>
                </div>
              </div>
            </div>
          )}

          {/* OBSERVAÇÕES */}
          {(invoice.descricao || invoice.errosValidacao) && (
            <div className="info-section">
              <div className="section-label">
                <Info size={16} />
                <span>Observações</span>
              </div>
              {invoice.descricao && (
                <p className="observacao">{invoice.descricao}</p>
              )}
              {invoice.errosValidacao && (
                <p className="observacao erro">{invoice.errosValidacao}</p>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN - AÇÕES */}
        <div className="right-column">
          <div className="actions-section">
            <div className="section-label">
              <Tag size={16} />
              <span>Ações</span>
            </div>
            <InvoiceActions
              faturaId={invoice.id}
              status={invoice.status}
              onActionComplete={fetchInvoice}
            />
          </div>

          {/* RESUMO RÁPIDO */}
          <div className="resumo-section">
            <div className="section-label">
              <Clock size={16} />
              <span>Resumo rápido</span>
            </div>
            <div className="resumo-item">
              <span>Total</span>
              <span className="valor-destaque">{formatarMoeda(invoice.valorTotal)}</span>
            </div>
            <div className="resumo-item">
              <span>Itens</span>
              <span>{invoice.itens?.length || 0}</span>
            </div>
            <div className="resumo-item">
              <span>Status</span>
              <span className={`status-badge status-${statusInfo.variant}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;