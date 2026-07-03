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
  Loader2,
  Banknote,
  Phone,
  Receipt,
  User
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { Alert } from '../../components/common/Alert';
import { Spinner } from '../../components/common/Spinner';
import { InvoiceActions } from '../../components/shared/InvoiceActions';
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

  const getStatusPagamentoProps = (status) => {
    const statusMap = {
      'NAO_APLICAVEL': { label: 'Não aplicável', variant: 'default' },
      'PENDENTE': { label: 'Aguardando pagamento', variant: 'warning' },
      'PROCESSANDO': { label: 'A processar', variant: 'info' },
      'PAGO': { label: 'Pago', variant: 'success' },
      'FALHOU': { label: 'Falhou', variant: 'danger' },
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
    return `MT ${valor.toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  const renderDadosPagamento = () => {
    if (!dadosPagamento) return null;

    const metodo = dadosPagamento.metodo?.replace('_', ' ');
    const statusPagamento = dadosPagamento.status;
    const statusInfo = getStatusPagamentoProps(statusPagamento);
    const dados = dadosPagamento.dados;
    const valor = dadosPagamento.valor;
    const referencia = dadosPagamento.referencia;
    const moeda = dadosPagamento.moeda || 'MZN';

    return (
      <Card className="info-card pagamento-card">
        <div className="card-header">
          <Banknote size={18} />
          <h3>Dados de Pagamento</h3>
        </div>
        <div className="pagamento-grid">
          <div className="pagamento-info">
            <div className="info-row">
              <label>Método</label>
              <span className="highlight">{metodo || 'Não identificado'}</span>
            </div>
            <div className="info-row">
              <label>Status</label>
              <Badge variant={statusInfo.variant}>
                {statusInfo.label}
              </Badge>
            </div>
            {referencia && (
              <div className="info-row">
                <label>Referência</label>
                <span className="mono">{referencia.numero}</span>
              </div>
            )}
            {valor && (
              <div className="info-row">
                <label>Valor</label>
                <span className="valor-pagamento">{formatarMoeda(valor)}</span>
              </div>
            )}
            {moeda && (
              <div className="info-row">
                <label>Moeda</label>
                <span>{moeda}</span>
              </div>
            )}
          </div>

          {dados && (
            <div className="pagamento-detalhes">
              <label>Detalhes</label>
              {dados.banco && (
                <div className="detalhe-item">
                  <Building size={14} />
                  <span><strong>Banco:</strong> {dados.banco}</span>
                </div>
              )}
              {dados.iban && (
                <div className="detalhe-item">
                  <Receipt size={14} />
                  <span><strong>IBAN:</strong> <span className="mono">{dados.iban}</span></span>
                </div>
              )}
              {dados.titular && (
                <div className="detalhe-item">
                  <User size={14} />
                  <span><strong>Titular:</strong> {dados.titular}</span>
                </div>
              )}
              {dados.swift && (
                <div className="detalhe-item">
                  <Tag size={14} />
                  <span><strong>SWIFT:</strong> {dados.swift}</span>
                </div>
              )}
              {dados.numero && (
                <div className="detalhe-item">
                  <Phone size={14} />
                  <span><strong>Telefone:</strong> {dados.numero}</span>
                </div>
              )}
              {dados.operadora && (
                <div className="detalhe-item">
                  <Tag size={14} />
                  <span><strong>Operadora:</strong> {dados.operadora}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    );
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

      <div className="detail-header">
        <div className="detail-header-left">
          <Button variant="ghost" onClick={() => navigate('/faturas')} className="btn-back" disabled={deleteLoading}>
            <ArrowLeft size={18} />
            Voltar
          </Button>
          <h1>Detalhes da Fatura</h1>
        </div>
        
        <div className="header-actions">
          <button
            className="btn-icon btn-download"
            onClick={handleDownload}
            disabled={deleteLoading || downloadLoading || !invoice?.urlArquivo}
            title={invoice?.urlArquivo ? 'Baixar documento' : 'Documento não disponível'}
          >
            {downloadLoading ? (
              <Loader2 size={18} className="spinning" />
            ) : (
              <Download size={18} />
            )}
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

      {deleteSuccess && (
        <Alert variant="success">
          <CheckCircle size={18} />
          Fatura excluída com sucesso! Redirecionando...
        </Alert>
      )}

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

      <div className="detail-content">
        <div className="left-column">
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

          {renderDadosPagamento()}

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

        <div className="right-column">
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
