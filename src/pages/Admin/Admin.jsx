import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAdminData } from './hooks/useAdminData';
import { useAuth } from '../../hooks/useAuth';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import { AdminStats } from './components/AdminStats';
import { AdminTabs } from './components/AdminTabs';
import { AdminInvoicesTab } from './components/AdminInvoicesTab';
import { AdminReportsTab } from './components/AdminReportsTab';
import './Admin.css';

const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { aprovarInvoice, rejeitarInvoice } = useInvoices();
  const { metrics, invoices, users, loading, error, refresh } = useAdminData();

  const [activeTab, setActiveTab] = useState('faturas');
  const [searchTerm, setSearchTerm] = useState('');
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  const [actionLoading, setActionLoading] = useState(null);

  // Handlers
  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await aprovarInvoice(id);
      await refresh();
    } catch (err) {
      console.error('Erro ao aprovar fatura:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await rejeitarInvoice(id, 'Rejeitado pelo admin');
      await refresh();
    } catch (err) {
      console.error('Erro ao rejeitar fatura:', err);
    } finally {
      setActionLoading(null);
    }
  };

  // Estatísticas
  const stats = metrics ? [
    {
      label: 'Total Faturas',
      value: metrics.totalFaturas || 0,
      change: '+12%',
      changeType: 'up',
      icon: '📄',
      onClick: () => setActiveTab('faturas')
    },
    {
      label: 'Faturas Pendentes',
      value: metrics.faturasPendentes || 0,
      change: '-5%',
      changeType: 'down',
      icon: '⏳',
      onClick: () => { setActiveTab('faturas'); }
    },
    {
      label: 'Aprovadas',
      value: metrics.faturasAprovadas || 0,
      change: '+8%',
      changeType: 'up',
      icon: '✅',
      onClick: () => { setActiveTab('faturas'); }
    },
    {
      label: 'Valor Total',
      value: formatarMoeda(metrics.valorTotalFaturas || 0),
      change: '+15%',
      changeType: 'up',
      icon: '💰'
    },
  ] : [];

  // Tabs
  const tabs = [
    { id: 'faturas', label: 'Faturas', icon: '📋', badge: invoices.length },
    { id: 'usuarios', label: 'Usuários', icon: '👥', badge: users.length },
    { id: 'relatorios', label: 'Relatórios', icon: '📊' },
    { id: 'configuracoes', label: 'Configurações', icon: '⚙️' },
  ];

  // Loading
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <span>Carregando painel admin...</span>
      </div>
    );
  }

  // Acesso negado
  if (user?.perfil !== 'ADMIN') {
    return (
      <div className="admin-access-denied">
        <div className="icon">🚫</div>
        <h2>Acesso Negado</h2>
        <p>Você não tem permissão para acessar esta página.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Voltar ao Início
        </Button>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {error && (
        <Alert variant="danger" onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* TOPBAR */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>👑 Painel <span className="highlight">Administrativo</span></h1>
          <p>Gerencie faturas, usuários e configurações do sistema</p>
        </div>
        <div className="admin-topbar-right">
          <div className="search-wrapper">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Buscar faturas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={() => navigate('/faturas/upload')}>
            + Nova Fatura
          </Button>
        </div>
      </div>

      {/* STATS */}
      <AdminStats stats={stats} />

      {/* TABS */}
      <AdminTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* TAB: FATURAS */}
      {activeTab === 'faturas' && (
        <div className="admin-tab-content active">
          <AdminInvoicesTab
            invoices={invoices}
            onApprove={handleApprove}
            onReject={handleReject}
            loading={actionLoading}
          />
        </div>
      )}

      {/* TAB: USUÁRIOS */}
      {activeTab === 'usuarios' && (
        <div className="admin-tab-content active">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>👥 Usuários do Sistema</h3>
              <Button variant="primary" onClick={() => navigate('/registrar')}>
                + Novo Usuário
              </Button>
            </div>
            <div className="admin-card-body">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td><strong>{user.nome || user.email}</strong></td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-status-badge ${user.perfil === 'ADMIN' ? 'approved' : 'pending'}`}>
                          <span className="dot" />
                          {user.perfil || 'USUARIO'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-badge ${user.ativo ? 'approved' : 'canceled'}`}>
                          <span className="dot" />
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions-cell">
                          <button
                            className="admin-btn-icon"
                            title={user.ativo ? 'Desativar' : 'Ativar'}
                            onClick={() => {}}
                          >
                            {user.ativo ? '🔴' : '🟢'}
                          </button>
                          {user.perfil !== 'ADMIN' && (
                            <button
                              className="admin-btn-icon"
                              title="Promover a Admin"
                              onClick={() => {}}
                            >
                              ⬆️
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: RELATÓRIOS */}
      {activeTab === 'relatorios' && (
        <div className="admin-tab-content active">
          <AdminReportsTab
            metrics={metrics}
            anoSelecionado={anoSelecionado}
            onAnoChange={setAnoSelecionado}
          />
        </div>
      )}

      {/* TAB: CONFIGURAÇÕES */}
      {activeTab === 'configuracoes' && (
        <div className="admin-tab-content active">
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>⚙️ Configurações do Sistema</h3>
            </div>
            <div className="admin-card-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Nome da Empresa</label>
                  <input type="text" defaultValue="Enterprise Document System" />
                </div>
                <div className="form-group">
                  <label>Email de Suporte</label>
                  <input type="email" defaultValue="suporte@eds.co.mz" />
                </div>
                <div className="form-group">
                  <label>Timeout de Sessão (minutos)</label>
                  <input type="number" defaultValue="30" />
                </div>
                <div className="form-group">
                  <label>Máximo de upload (MB)</label>
                  <input type="number" defaultValue="10" />
                </div>
                <div className="form-group">
                  <label>Taxa de IVA Padrão</label>
                  <input type="text" defaultValue="16%" />
                </div>
                <div className="form-group">
                  <label>Moeda</label>
                  <select defaultValue="MZN">
                    <option value="MZN">MZN - Metical</option>
                    <option value="USD">USD - Dólar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="ZAR">ZAR - Rand</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <Button variant="primary">💾 Salvar Configurações</Button>
                <Button variant="secondary">↩️ Restaurar Padrão</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div style={{
        marginTop: '32px',
        paddingTop: '16px',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)'
      }}>
        <p>🇲🇿 EDS v1.0.0 • Painel Administrativo • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default Admin;
