// src/pages/Admin/Invoices.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle, 
  XCircle,
  Eye,
  Search,
  Plus
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AdminTable } from './components/AdminTable';
import { AdminStatusBadge } from './components/AdminStatusBadge';
import './Admin.css';

export const Invoices = ({ invoices, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInvoices = invoices.filter(inv =>
    (inv.numeroFatura || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.fornecedor || '')?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'numeroFatura', label: 'Número' },
    { key: 'fornecedor', label: 'Fornecedor' },
    { 
      key: 'dataFatura', 
      label: 'Data',
      render: (inv) => inv.dataFatura ? new Date(inv.dataFatura).toLocaleDateString('pt-MZ') : '-'
    },
    { 
      key: 'valorTotal', 
      label: 'Valor',
      render: (inv) => formatarMoeda(inv.valorTotal)
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (inv) => (
        <AdminStatusBadge status={inv.status} />
      )
    },
    { 
      key: 'acoes', 
      label: 'Ações',
      render: (inv) => (
        <div className="admin-actions-cell">
          <button 
            className="admin-btn-icon" 
            onClick={() => navigate(`/faturas/${inv.id}`)}
            title="Ver detalhes"
          >
            <Eye size={16} />
          </button>
          <button className="admin-btn-icon success" title="Aprovar">
            <CheckCircle size={16} />
          </button>
          <button className="admin-btn-icon danger" title="Rejeitar">
            <XCircle size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-tab-content active">
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>
            <FileText size={18} />
            Faturas do Sistema
            <span className="admin-badge">{invoices.length}</span>
          </h3>
          <div className="admin-card-actions">
            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Buscar fatura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <Button variant="primary" onClick={() => navigate('/faturas/upload')}>
              <Plus size={18} />
              Nova Fatura
            </Button>
          </div>
        </div>
        <div className="admin-card-body">
          <AdminTable 
            columns={columns} 
            data={filteredInvoices} 
            loading={loading}
            emptyMessage="Nenhuma fatura encontrada."
          />
        </div>
      </div>
    </div>
  );
};

// Helpers
const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export default Invoices;