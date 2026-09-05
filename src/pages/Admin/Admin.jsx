// src/pages/Admin/Admin.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Search, 
  RefreshCw,
  Plus,
  Activity
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAdmin } from '../../hooks/useAdmin';
import { Button } from '../../components/common/Button';
import { Alert } from '../../components/common/Alert';
import { AdminTabs } from './components/AdminTabs';
import { Dashboard } from './Dashboard';
import { Users } from './Users';
import { Invoices } from './Invoices';
import { Companies } from './Companies';
import { Reports } from './Reports';
import { Settings } from './Settings';
import api from '../../services/api'; // 🔥 IMPORTAR API
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDashboardMetrics, getUsuarios } = useAdmin();
  
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Tabs para navegação
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin' },
    { id: 'faturas', label: 'Faturas', path: '/admin/faturas', badge: invoices.length },
    { id: 'usuarios', label: 'Utilizadores', path: '/admin/usuarios', badge: users.length },
    { id: 'empresas', label: 'Empresas', path: '/admin/empresas', badge: metrics?.totalEmpresas || 0 },
    { id: 'relatorios', label: 'Relatórios', path: '/admin/relatorios' },
    { id: 'configuracoes', label: 'Configurações', path: '/admin/configuracoes' },
  ];

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const metricsData = await getDashboardMetrics();
      setMetrics(metricsData);

      const usersData = await getUsuarios();
      setUsers(usersData || []);

      // 🔥 Buscar faturas - API já importada
      try {
        const response = await api.get('/faturas');
        setInvoices(response.data || []);
      } catch (err) {
        console.warn('Erro ao buscar faturas:', err);
        setInvoices([]);
      }

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do administrativo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Verificar acesso
  const isAdmin = user?.perfil === 'ADMIN' || user?.perfil === 'ROLE_ADMIN';

  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button variant="primary" onClick={() => navigate('/')}>Voltar</Button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Topbar */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>
            <Activity size={28} className="admin-icon" />
            Painel <span className="highlight">Administrativo</span>
          </h1>
          <p>Gerencie faturas, utilizadores e configurações do sistema</p>
        </div>
        <div className="admin-topbar-right">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="secondary" onClick={loadData}>
            <RefreshCw size={18} /> Atualizar
          </Button>
          <Button variant="primary" onClick={() => navigate('/faturas/upload')}>
            <Plus size={18} /> Nova Fatura
          </Button>
        </div>
      </div>

      {/* Tabs de navegação */}
      <AdminTabs 
        tabs={tabs} 
        activeTab={window.location.pathname}
      />

      {/* Rotas internas do Admin */}
      <Routes>
        <Route 
          path="/" 
          element={
            <Dashboard 
              metrics={metrics} 
              users={users} 
              invoices={invoices}
              loading={loading}
            />
          } 
        />
        <Route 
          path="/faturas" 
          element={
            <Invoices 
              invoices={invoices} 
              loading={loading}
              onRefresh={loadData}
            />
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <Users 
              users={users} 
              loading={loading}
              onRefresh={loadData}
            />
          } 
        />
        <Route 
          path="/empresas" 
          element={
            <Companies 
              metrics={metrics}
              loading={loading}
            />
          } 
        />
        <Route 
          path="/relatorios" 
          element={
            <Reports 
              metrics={metrics}
            />
          } 
        />
        <Route 
          path="/configuracoes" 
          element={<Settings />} 
        />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>

      {/* Footer */}
      <div className="admin-footer">
        <p>EDS v1.0.0 • Painel Administrativo • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Admin;