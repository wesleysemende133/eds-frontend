import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusBadge } from './StatusBadge';

const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
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

export const AdminInvoicesTab = ({ invoices, onApprove, onReject, loading }) => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      (inv.numeroFatura || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? inv.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>📄 Lista de Faturas</h3>
        <div className="filters">
          <input
            type="text"
            placeholder="🔍 Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Todos os status</option>
            <option value="AGUARDANDO_APROVACAO">Aguardando Aprovação</option>
            <option value="APROVADO">Aprovado</option>
            <option value="REJEITADO">Rejeitado</option>
            <option value="PAGO">Pago</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>
      <div className="admin-card-body">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nº Fatura</th>
              <th>Fornecedor</th>
              <th>Valor (MT)</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td><strong>{invoice.numeroFatura || 'N/A'}</strong></td>
                  <td>{invoice.fornecedor || 'N/A'}</td>
                  <td>{formatarMoeda(invoice.valorTotal)}</td>
                  <td>{formatarData(invoice.dataFatura)}</td>
                  <td><StatusBadge status={invoice.status} /></td>
                  <td>
                    <div className="admin-actions-cell">
                      <button
                        className="admin-btn-icon"
                        title="Visualizar"
                        onClick={() => navigate(`/faturas/${invoice.id}`)}
                      >
                        👁️
                      </button>
                      {invoice.status === 'AGUARDANDO_APROVACAO' && (
                        <>
                          <button
                            className="admin-btn-icon success"
                            title="Aprovar"
                            onClick={() => onApprove(invoice.id)}
                            disabled={loading}
                          >
                            ✅
                          </button>
                          <button
                            className="admin-btn-icon danger"
                            title="Rejeitar"
                            onClick={() => onReject(invoice.id)}
                            disabled={loading}
                          >
                            ❌
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">
                  <div className="admin-empty-state">
                    <div className="icon">📭</div>
                    <h4>Nenhuma fatura encontrada</h4>
                    <p>Tente ajustar os filtros de busca</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
