// src/pages/Admin/Users.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  UserPlus, 
  Edit2, 
  Trash2,
  Search
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AdminTable } from './components/AdminTable';
import { AdminStatusBadge } from './components/AdminStatusBadge';
import './Admin.css';

export const Users = ({ users, loading, onRefresh }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    (user.nomeCompleto || user.nome || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { 
      key: 'nome', 
      label: 'Nome',
      render: (user) => <strong>{user.nomeCompleto || user.nome || user.email}</strong>
    },
    { key: 'email', label: 'Email' },
    { 
      key: 'perfil', 
      label: 'Perfil',
      render: (user) => (
        <AdminStatusBadge 
          status={user.perfil === 'ADMIN' ? 'approved' : 'pending'}
          label={user.perfil || 'USUARIO'}
        />
      )
    },
    { 
      key: 'ativo', 
      label: 'Status',
      render: (user) => (
        <AdminStatusBadge 
          status={user.ativo ? 'approved' : 'canceled'}
          label={user.ativo ? 'Ativo' : 'Inativo'}
        />
      )
    },
    { 
      key: 'acoes', 
      label: 'Ações',
      render: (user) => (
        <div className="admin-actions-cell">
          <button className="admin-btn-icon" title="Editar">
            <Edit2 size={16} />
          </button>
          <button className="admin-btn-icon danger" title={user.ativo ? 'Desativar' : 'Ativar'}>
            <Trash2 size={16} />
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
            <UsersIcon size={18} />
            Utilizadores do Sistema
            <span className="admin-badge">{users.length}</span>
          </h3>
          <div className="admin-card-actions">
            <div className="search-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Buscar utilizador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-search-input"
              />
            </div>
            <Button variant="primary" onClick={() => navigate('/registrar')}>
              <UserPlus size={18} />
              Novo Utilizador
            </Button>
          </div>
        </div>
        <div className="admin-card-body">
          <AdminTable 
            columns={columns} 
            data={filteredUsers} 
            loading={loading}
            emptyMessage="Nenhum utilizador encontrado."
          />
        </div>
      </div>
    </div>
  );
};

export default Users;