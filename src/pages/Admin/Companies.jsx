// src/pages/Admin/Companies.jsx
import React, { useState } from 'react';
import { 
  Building, 
  Eye,
  Search
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AdminTable } from './components/AdminTable';
import { AdminStatusBadge } from './components/AdminStatusBadge';
import './Admin.css';

export const Companies = ({ metrics, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Dados de exemplo para empresas (depois vêm do backend)
  const companies = [
    {
      id: 1,
      nome: 'InforGlobal, Lda.',
      nuit: '400123456',
      email: 'geral@inforglobal.co.mz',
      telefone: '+258 21 304 330',
      endereco: 'Av. 24 de Julho, Maputo',
      status: 'Ativa'
    },
    {
      id: 2,
      nome: 'Decode TI, Lda.',
      nuit: '401987654',
      email: 'geral@decodeti.co.mz',
      telefone: '+258 21 492 746',
      endereco: 'Av. Vladimir Lenine, Maputo',
      status: 'Ativa'
    }
  ];

  const filteredCompanies = companies.filter(emp =>
    emp.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.nuit?.includes(searchTerm)
  );

  const columns = [
    { 
      key: 'nome', 
      label: 'Empresa',
      render: (emp) => <strong>{emp.nome}</strong>
    },
    { key: 'nuit', label: 'NUIT' },
    { key: 'email', label: 'Email' },
    { key: 'telefone', label: 'Telefone' },
    { 
      key: 'status', 
      label: 'Status',
      render: (emp) => (
        <AdminStatusBadge status={emp.status} />
      )
    },
    { 
      key: 'acoes', 
      label: 'Ações',
      render: (emp) => (
        <div className="admin-actions-cell">
          <button className="admin-btn-icon" title="Ver detalhes">
            <Eye size={16} />
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
            <Building size={18} />
            Empresas do Sistema
            <span className="admin-badge">{metrics?.totalEmpresas || 0}</span>
          </h3>
          <div className="admin-card-actions">
            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Buscar empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
          </div>
        </div>
        <div className="admin-card-body">
          <AdminTable 
            columns={columns} 
            data={filteredCompanies} 
            loading={loading}
            emptyMessage="Nenhuma empresa encontrada."
          />
        </div>
      </div>
    </div>
  );
};

export default Companies;