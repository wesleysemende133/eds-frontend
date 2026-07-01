// src/pages/InvoiceActions.jsx
import React, { useState } from 'react';
import { useInvoices } from '../hooks/useInvoices';
import './InvoiceActions.css';

export const InvoiceActions = ({ faturaId, status, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [acaoSelecionada, setAcaoSelecionada] = useState('');
  
  const { avaliarInvoice } = useInvoices();  // ← Usar o hook

  const executarAcao = async (acao, motivo = '') => {
    try {
      setLoading(true);
      
      // ✅ USAR O HOOK, NÃO O axios DIRETAMENTE
      await avaliarInvoice(faturaId, acao, motivo);
      
      setShowModal(false);
      setMotivo('');
      
      if (onActionComplete) {
        onActionComplete();
      }
      
    } catch (error) {
      const mensagem = error.response?.data?.message || 'Erro ao executar acao';
      alert(mensagem);
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcao = (acao) => {
    if (acao === 'REJEITAR' || acao === 'CANCELAR') {
      setAcaoSelecionada(acao);
      setShowModal(true);
    } else {
      executarAcao(acao);
    }
  };

  const renderButtons = () => {
    switch (status) {
      case 'AGUARDANDO_APROVACAO':
        return (
          <div className="action-buttons">
            <button 
              className="btn-aprovar" 
              onClick={() => handleAcao('APROVAR')}
              disabled={loading}
            >
              Aprovar
            </button>
            <button 
              className="btn-rejeitar" 
              onClick={() => handleAcao('REJEITAR')}
              disabled={loading}
            >
              Rejeitar
            </button>
            <button 
              className="btn-cancelar" 
              onClick={() => handleAcao('CANCELAR')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        );
      
      case 'APROVADO':
        return (
          <div className="action-buttons">
            <button 
              className="btn-efetivar" 
              onClick={() => handleAcao('EFETIVAR')}
              disabled={loading}
            >
              Efetivar
            </button>
            <span className="badge-success">Fatura Aprovada</span>
          </div>
        );
      
      case 'EFETIVADO':
        return (
          <div className="action-buttons">
            <span className="badge-success">Fatura Efetivada</span>
          </div>
        );
      
      case 'REJEITADO':
        return (
          <div className="action-buttons">
            <button 
              className="btn-reprocessar" 
              onClick={() => handleAcao('REPROCESSAR')}
              disabled={loading}
            >
              Reprocessar OCR
            </button>
            <span className="badge-danger">Fatura Rejeitada</span>
          </div>
        );
      
      case 'FALHA_LEITURA':
      case 'ERRO_VALIDACAO':
        return (
          <div className="action-buttons">
            <button 
              className="btn-reprocessar" 
              onClick={() => handleAcao('REPROCESSAR')}
              disabled={loading}
            >
              Reprocessar OCR
            </button>
            <button 
              className="btn-cancelar" 
              onClick={() => handleAcao('CANCELAR')}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="invoice-actions">
      {renderButtons()}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>
              {acaoSelecionada === 'REJEITAR' ? 'Motivo da Rejeicao' : 'Motivo do Cancelamento'}
            </h3>
            <p className="modal-subtitle">
              {acaoSelecionada === 'REJEITAR' 
                ? 'Informe o motivo para rejeitar esta fatura' 
                : 'Informe o motivo para cancelar esta fatura'}
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Digite o motivo..."
              rows={4}
              className="modal-textarea"
              autoFocus
            />
            <div className="modal-actions">
              <button 
                className="btn-modal-cancel" 
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-confirm" 
                onClick={() => executarAcao(acaoSelecionada, motivo)}
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};