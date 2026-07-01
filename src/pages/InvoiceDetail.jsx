// src/components/InvoiceDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { InvoiceActions } from './InvoiceActions';
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

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta fatura?')) {
      return;
    }

    try {
      setDeleteLoading(true);
      setError(null);
      await deleteInvoice(id);
      setDeleteSuccess(true);
      
      setTimeout(() => {
        navigate('/faturas');
      }, 1500);
    } catch (err) {
      console.error('Erro ao deletar fatura:', err);
      setDeleteLoading(false);
      setError(err.friendlyMessage || 'Nao foi possivel deletar a fatura.');
    }
  };

  const getStatusProps = (status) => {
    const statusNormalizado = status?.toUpperCase();
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando Aprovacao', className: 'badge-warning' },
      'PROCESSANDO': { label: 'Processando', className: 'badge-info' },
      'PROCESSADO': { label: 'Processado', className: 'badge-success' },
      'APROVADO': { label: 'Aprovado', className: 'badge-success' },
      'REJEITADO': { label: 'Rejeitado', className: 'badge-danger' },
      'ERRO_EXTRACAO': { label: 'Erro na Extracao', className: 'badge-danger' },
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
          <span>{error || 'Fatura nao encontrada.'}</span>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusProps(invoice.status);

  return (
    <div className="invoice-detail-container">
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
          <button className="btn-icon" title="Baixar documento PDF original" disabled={deleteLoading}>
            <Download size={20} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading || deleteSuccess}
            className="btn-icon btn-danger"
            title="Excluir do banco de dados"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {deleteSuccess && (
        <div className="alert alert-success" role="alert">
          <CheckCircle size={20} />
          <span>Fatura excluida com sucesso! Atualizando repositorio...</span>
        </div>
      )}

      <div className="detail-content">
        <div className="info-card">
          <h2>Metadados de Identificacao</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>ID Universal (UUID)</label>
              <span className="value-id">{invoice.id || '-'}</span>
            </div>
            <div className="info-row">
              <label>Numero do Documento</label>
              <span>{invoice.numeroFatura || 'Nao identificado'}</span>
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

        <div className="info-card">
          <h2>Dados Contabeis e Financeiros</h2>
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
              <span>{invoice.fornecedor || 'Nao extraido'}</span>
            </div>
            <div className="info-row">
              <label>NUIT Fornecedor</label>
              <span>{invoice.nuitFornecedor || 'Nao identificado'}</span>
            </div>
            <div className="info-row">
              <label>Data da Fatura</label>
              <span>{formatarData(invoice.dataFatura)}</span>
            </div>
            <div className="info-row">
              <label>Data de Vencimento</label>
              <span>{invoice.dataVencimento ? formatarData(invoice.dataVencimento) : 'Nao informada'}</span>
            </div>
            <div className="info-row">
              <label>Categoria</label>
              <span>{invoice.categoria || 'Nao definida'}</span>
            </div>
          </div>
        </div>

        {(invoice.descricao || invoice.errosValidacao) && (
          <div className="info-card">
            <h2>Observacoes</h2>
            {invoice.descricao && (
              <p className="description"><strong>Descricao:</strong> {invoice.descricao}</p>
            )}
            {invoice.errosValidacao && (
              <p className="description error-text">
                <strong>Erros de Validacao:</strong> {invoice.errosValidacao}
              </p>
            )}
          </div>
        )}

        {(invoice.nomeArquivo || invoice.urlArquivo) && (
          <div className="info-card">
            <h2>Informacoes do Arquivo</h2>
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

        <div className="info-card">
          <h2>Acões</h2>
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