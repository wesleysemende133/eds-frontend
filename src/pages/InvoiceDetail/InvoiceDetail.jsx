// src/components/InvoiceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
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

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getInvoiceById(id);
      setInvoice(data);
    } catch (err) {
      console.error('Erro ao buscar fatura:', err);
      setError(err.friendlyMessage || 'Erro ao carregar os detalhes da fatura.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  // ✅ Abrir modal de confirmação
  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  // ✅ Confirmar exclusão
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

  // ✅ Cancelar exclusão
  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getStatusProps = (status) => {
    const statusNormalizado = status?.toUpperCase();
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando Aprovação', className: 'badge-warning' },
      'PROCESSANDO': { label: 'Processando', className: 'badge-info' },
      'PROCESSADO': { label: 'Processado', className: 'badge-success' },
      'APROVADO': { label: 'Aprovado', className: 'badge-success' },
      'REJEITADO': { label: 'Rejeitado', className: 'badge-danger' },
      'ERRO_EXTRACAO': { label: 'Erro na Extração', className: 'badge-danger' },
      'CANCELADO': { label: 'Cancelado', className: 'badge-danger' },
      'PAGO': { label: 'Pago', className: 'badge-success' },
      'PENDENTE': { label: 'Pendente', className: 'badge-warning' },
    };
    return statusMap[statusNormalizado] || { label: status || 'Desconhecido', className: 'badge-default' };
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
      <div className="invoice-detail-container" role="status">
        <p className="loading-text">Carregando detalhes da fatura...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <button onClick={() => navigate('/faturas')} className="btn-back">
          <ArrowLeft size={20} />
          Voltar para listagem
        </button>
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} />
          <span>{error || 'Fatura não encontrada.'}</span>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusProps(invoice.status);

  return (
    <div className="invoice-detail-container">
      {/* ✅ MODAL DE CONFIRMAÇÃO */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza de que deseja excluir permanentemente esta fatura?</p>
              <p className="modal-warning">⚠️ Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="detail-header">
        <button 
          onClick={() => navigate('/faturas')} 
          className="btn-back"
          disabled={deleteLoading}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>Detalhes da Fatura</h1>
        
        <div className="header-actions">
          <button 
            className="btn-icon" 
            title="Baixar documento PDF original" 
            disabled={deleteLoading}
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={deleteLoading || deleteSuccess}
            className="btn-icon btn-danger"
            title="Excluir do banco de dados"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* MENSAGEM DE SUCESSO */}
      {deleteSuccess && (
        <div className="alert alert-success" role="alert">
          <CheckCircle size={20} />
          <span>Fatura excluída com sucesso! Redirecionando...</span>
        </div>
      )}

      {/* CONTEÚDO */}
      <div className="detail-content">
        {/* Metadados */}
        <div className="info-card">
          <h2>Metadados de Identificação</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>ID Universal (UUID)</label>
              <span className="value-id">{invoice.id || '-'}</span>
            </div>
            <div className="info-row">
              <label>Número do Documento</label>
              <span>{invoice.numeroFatura || 'Não identificado'}</span>
            </div>
            <div className="info-row">
              <label>Estado do Processamento</label>
              <span className={`badge ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="info-row">
              <label>Data de Recebimento</label>
              <span>{formatarDataHora(invoice.dataCriacao)}</span>
            </div>
          </div>
        </div>

        {/* Financeiros */}
        <div className="info-card">
          <h2>Dados Contábeis e Financeiros</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>Valor Nominal</label>
              <span className="value-amount">{formatarMoeda(invoice.valorTotal)}</span>
            </div>
            <div className="info-row">
              <label>Valor Base</label>
              <span>{formatarMoeda(invoice.valorBase)}</span>
            </div>
            <div className="info-row">
              <label>Valor IVA</label>
              <span>{formatarMoeda(invoice.valorIva)}</span>
            </div>
            <div className="info-row">
              <label>Entidade Emissora (Fornecedor)</label>
              <span>{invoice.fornecedor || 'Não extraído'}</span>
            </div>
            <div className="info-row">
              <label>NUIT Fornecedor</label>
              <span>{invoice.nuitFornecedor || 'Não identificado'}</span>
            </div>
            <div className="info-row">
              <label>Data da Fatura</label>
              <span>{formatarData(invoice.dataFatura)}</span>
            </div>
            <div className="info-row">
              <label>Data de Vencimento</label>
              <span>{invoice.dataVencimento ? formatarData(invoice.dataVencimento) : 'Não informada'}</span>
            </div>
            <div className="info-row">
              <label>Categoria</label>
              <span>{invoice.categoria || 'Não definida'}</span>
            </div>
          </div>
        </div>

        {/* Observações */}
        {(invoice.descricao || invoice.errosValidacao) && (
          <div className="info-card">
            <h2>Observações</h2>
            {invoice.descricao && (
              <p className="description"><strong>Descrição:</strong> {invoice.descricao}</p>
            )}
            {invoice.errosValidacao && (
              <p className="description error-text">
                <strong>Erros de Validação:</strong> {invoice.errosValidacao}
              </p>
            )}
          </div>
        )}

        {/* Arquivo */}
        {(invoice.nomeArquivo || invoice.urlArquivo) && (
          <div className="info-card">
            <h2>Informações do Arquivo</h2>
            <div className="info-grid">
              <div className="info-row">
                <label>Nome do Arquivo</label>
                <span>{invoice.nomeArquivo || '-'}</span>
              </div>
              <div className="info-row">
                <label>Caminho do Arquivo</label>
                <span className="file-path">{invoice.urlArquivo || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="info-card">
          <h2>Ações</h2>
          <InvoiceActions
            faturaId={invoice.id}
            status={invoice.status}
            onActionComplete={fetchInvoice}
          />
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;