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

  // Buscar fatura - CORRIGIDO
  const fetchInvoice = async () => {
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
      
      // Tratamento específico para fatura não encontrada
      if (err.response?.status === 404) {
        setError('Fatura não encontrada ou já foi removida');
        setTimeout(() => navigate('/faturas'), 2000);
      } else {
        setError(err.friendlyMessage || 'Erro ao carregar os detalhes da fatura.');
      }
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
    console.log('🔄 [handleDelete] Botão de deletar clicado')
    console.log('🔄 [handleDelete] ID da fatura:', id)
    
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta fatura?')) {
      console.log('🔄 [handleDelete] Exclusão cancelada pelo usuário')
      return
    }

    console.log('🔄 [handleDelete] Usuário confirmou exclusão')

    try {
      setDeleteLoading(true)
      setError(null)
      
      console.log('🔄 [handleDelete] Chamando deleteInvoice...')
      const resultado = await deleteInvoice(id)
      console.log('🔄 [handleDelete] Resultado do deleteInvoice:', resultado)
      
      setDeleteSuccess(true)
      console.log('✅ [handleDelete] Exclusão bem-sucedida!')
      
      setTimeout(() => {
        console.log('🔄 [handleDelete] Redirecionando para lista de faturas...')
        navigate('/faturas', { replace: true })
      }, 1500)
      
    } catch (err) {
      console.error('❌ [handleDelete] Erro capturado:', err)
      console.error('❌ [handleDelete] Detalhes do erro:', {
        message: err.message,
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        friendlyMessage: err.friendlyMessage
      })
      
      setDeleteLoading(false)
      setError(err.friendlyMessage || 'Não foi possível deletar a fatura. Tente novamente.')
    }
  }

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
            type="button"
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
          <span>Fatura excluída com sucesso! Atualizando repositório...</span>
        </div>
      )}

      <div className="detail-content">
        {/* Metadados de Identificação */}
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

        {/* Dados Contábeis e Financeiros */}
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

        {/* Informações do Arquivo */}
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

        {/* Ações da Fatura */}
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