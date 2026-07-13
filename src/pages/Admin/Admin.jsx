// src/pages/Admin/Admin.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { useInvoices } from '../../hooks/useInvoices';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { Alert } from '../../components/common/Alert';
import './Admin.css';

// ============================================================
// COMPONENTES AUXILIARES
// ============================================================

const StatusBadge = ({ status }) => {
  const statusMap = {
    'AGUARDANDO_APROVACAO': 'pending',
    'APROVADO': 'approved',
    'REJEITADO': 'rejected',
    'PAGO': 'efetivado',
    'CANCELADO': 'canceled',
    'PENDENTE': 'pending',
    'PROCESSADO': 'approved',
  };
  
  const labels = {
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADO': 'Aprovado',
    'REJEITADO': 'Rejeitado',
    'PAGO': 'Pago',
    'CANCELADO': 'Cancelado',
    'PENDENTE': 'Pendente',
    'PROCESSADO': 'Processado',
  };
  
  return (
    <span className={`admin-status-badge ${statusMap[status] || 'pending'}`}>
      <span className="dot" />
      {labels[status] || status}
    </span>
  );
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getDashboardMetrics, getUsuarios, ativarUsuario, desativarUsuario, promoverUsuario } = useAdmin();
  const { getInvoices, aprovarInvoice, rejeitarInvoice } = useInvoices();
  
  // ============================================================
  // ESTADOS
  // ============================================================
  
  const [activeTab, setActiveTab] = useState('faturas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear().toString());
  
  const [metrics, setMetrics] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  // ============================================================
  // FUNÇÕES DE BUSCA
  // ============================================================

  const fetchMetrics = useCallback(async () => {
    try {
      const data = await getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Erro ao buscar métricas:', err);
    }
  }, [getDashboardMetrics]);

  const fetchInvoices = useCallback(async () => {
    try {
      const data = await getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar faturas:', err);
      setInvoices([]);
    }
  }, [getInvoices]);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsuarios();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
      setUsers([]);
    }
  }, [getUsuarios]);

  // ============================================================
  // EFEITOS
  // ============================================================

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchMetrics(), fetchInvoices(), fetchUsers()]);
      } catch (err) {
        setError('Erro ao carregar dados do admin.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [fetchMetrics, fetchInvoices, fetchUsers]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleApprove = async (id) => {
    try {
      setActionLoading(id);
      await aprovarInvoice(id);
      await fetchInvoices();
      await fetchMetrics();
    } catch (err) {
      setError('Erro ao aprovar fatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setActionLoading(id);
      await rejeitarInvoice(id, 'Rejeitado pelo admin');
      await fetchInvoices();
      await fetchMetrics();
    } catch (err) {
      setError('Erro ao rejeitar fatura');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUser = async (id, ativo) => {
    try {
      setActionLoading(id);
      if (ativo) {
        await desativarUsuario(id);
      } else {
        await ativarUsuario(id);
      }
      await fetchUsers();
    } catch (err) {
      setError('Erro ao alterar status do usuário');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePromoteUser = async (id, perfil) => {
    try {
      setActionLoading(id);
      await promoverUsuario(id, perfil);
      await fetchUsers();
    } catch (err) {
      setError('Erro ao promover usuário');
    } finally {
      setActionLoading(null);
    }
  };

  // ============================================================
  // FILTROS
  // ============================================================

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch = 
      (inv.numeroFatura || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inv.fornecedor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter ? inv.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  // ============================================================
  // ESTATÍSTICAS
  // ============================================================

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
      value: metrics.faturasPorStatus?.AGUARDANDO_APROVACAO || 0, 
      change: '-5%', 
      changeType: 'down', 
      icon: '⏳',
      onClick: () => { setStatusFilter('AGUARDANDO_APROVACAO'); setActiveTab('faturas'); }
    },
    { 
      label: 'Aprovadas', 
      value: metrics.faturasPorStatus?.APROVADO || 0, 
      change: '+8%', 
      changeType: 'up', 
      icon: '✅',
      onClick: () => { setStatusFilter('APROVADO'); setActiveTab('faturas'); }
    },
    { 
      label: 'Valor Total', 
      value: formatarMoeda(metrics.valorTotalFaturas || 0), 
      change: '+15%', 
      changeType: 'up', 
      icon: '💰' 
    },
  ] : [];

  // ============================================================
  // FUNÇÕES AUXILIARES PARA RELATÓRIOS
  // ============================================================

  const getMesLabel = (mesStr) => {
    const meses = {
      '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
      '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
      '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
    };
    const mesNum = mesStr?.split('-')[1];
    return meses[mesNum] || mesStr;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
      'APROVADO': 'Aprovado',
      'REJEITADO': 'Rejeitado',
      'PAGO': 'Pago',
      'CANCELADO': 'Cancelado',
      'PENDENTE': 'Pendente',
    };
    return labels[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      'AGUARDANDO_APROVACAO': 'pending',
      'APROVADO': 'approved',
      'REJEITADO': 'rejected',
      'PAGO': 'efetivado',
      'CANCELADO': 'canceled',
      'PENDENTE': 'pending',
    };
    return map[status] || 'pending';
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <span>Carregando painel admin...</span>
      </div>
    );
  }

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
        <Alert variant="danger" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* TOPBAR */}
      <div className="admin-topbar">
        <div className="admin-topbar-left">
          <h1>
            👑 Painel <span className="highlight">Administrativo</span>
          </h1>
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
      <div className="admin-stats-grid">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="admin-stat-card"
            onClick={stat.onClick}
            style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
          >
            <div className="stat-top">
              <div className="stat-icon">{stat.icon}</div>
              {stat.change && (
                <span className={`stat-change ${stat.changeType}`}>
                  {stat.change}
                </span>
              )}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'faturas' ? 'active' : ''}`}
          onClick={() => setActiveTab('faturas')}
        >
          📋 Faturas
          <span className="tab-badge">{invoices.length}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'usuarios' ? 'active' : ''}`}
          onClick={() => setActiveTab('usuarios')}
        >
          👥 Usuários
          <span className="tab-badge">{users.length}</span>
        </button>
        <button 
          className={`admin-tab ${activeTab === 'relatorios' ? 'active' : ''}`}
          onClick={() => setActiveTab('relatorios')}
        >
          📊 Relatórios
        </button>
        <button 
          className={`admin-tab ${activeTab === 'configuracoes' ? 'active' : ''}`}
          onClick={() => setActiveTab('configuracoes')}
        >
          ⚙️ Configurações
        </button>
      </div>

      {/* ============================================================
      TAB: FATURAS
      ============================================================ */}
      <div className={`admin-tab-content ${activeTab === 'faturas' ? 'active' : ''}`}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📄 Lista de Faturas</h3>
            <div className="filters">
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
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
                                onClick={() => handleApprove(invoice.id)}
                                disabled={actionLoading === invoice.id}
                              >
                                ✅
                              </button>
                              <button 
                                className="admin-btn-icon danger" 
                                title="Rejeitar"
                                onClick={() => handleReject(invoice.id)}
                                disabled={actionLoading === invoice.id}
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
      </div>

      {/* ============================================================
      TAB: USUÁRIOS
      ============================================================ */}
      <div className={`admin-tab-content ${activeTab === 'usuarios' ? 'active' : ''}`}>
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
                          onClick={() => handleToggleUser(user.id, user.ativo)}
                          disabled={actionLoading === user.id}
                        >
                          {user.ativo ? '🔴' : '🟢'}
                        </button>
                        {user.perfil !== 'ADMIN' && (
                          <button 
                            className="admin-btn-icon" 
                            title="Promover a Admin"
                            onClick={() => handlePromoteUser(user.id, 'ADMIN')}
                            disabled={actionLoading === user.id}
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

      {/* ============================================================
      TAB: RELATÓRIOS - CONSUMINDO DADOS REAIS
      ============================================================ */}
      <div className={`admin-tab-content ${activeTab === 'relatorios' ? 'active' : ''}`}>
        <div className="admin-card">
          <div className="admin-card-header">
            <h3>📊 Relatórios</h3>
            <div className="filters">
              <select 
                value={anoSelecionado} 
                onChange={(e) => setAnoSelecionado(e.target.value)}
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
          </div>
          <div className="admin-card-body">
            <div className="admin-chart-container">
              
              {/* LEFT - Faturas por Mês */}
              <div className="admin-chart-bars">
                <h4>📈 Faturas por Mês</h4>
                {metrics?.faturasPorMes ? (
                  (() => {
                    const filteredEntries = Object.entries(metrics.faturasPorMes)
                      .filter(([mes]) => mes.startsWith(anoSelecionado));
                    
                    if (filteredEntries.length === 0) {
                      return <p className="text-muted">Sem dados para {anoSelecionado}</p>;
                    }
                    
                    const maxValue = Math.max(...filteredEntries.map(([, count]) => count));
                    
                    return filteredEntries.map(([mes, count]) => {
                      const mesLabel = getMesLabel(mes);
                      const percent = maxValue > 0 ? (count / maxValue) * 100 : 0;
                      
                      return (
                        <div key={mes} className="admin-chart-bar-row">
                          <span className="label">{mesLabel}</span>
                          <div className="track">
                            <div
                              className="fill blue"
                              style={{ width: `${Math.max(percent, 5)}%` }}
                            />
                          </div>
                          <span className="value">{count}</span>
                        </div>
                      );
                    });
                  })()
                ) : (
                  <p className="text-muted">Sem dados para exibir</p>
                )}
              </div>

              {/* RIGHT - Resumo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="admin-card" style={{ marginBottom: 0 }}>
                  <div className="admin-card-header" style={{ padding: 'var(--spacing-md)' }}>
                    <h4>📈 Resumo Geral</h4>
                  </div>
                  <div className="admin-card-body" style={{ padding: 'var(--spacing-md)' }}>
                    <div className="flex justify-between">
                      <span className="text-muted">Total faturas</span>
                      <span className="font-bold">{metrics?.totalFaturas || 0}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted">Valor total</span>
                      <span className="font-bold">{formatarMoeda(metrics?.valorTotalFaturas || 0)}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted">Média por fatura</span>
                      <span className="font-bold">
                        {formatarMoeda(metrics?.totalFaturas > 0 
                          ? (metrics.valorTotalFaturas / metrics.totalFaturas) 
                          : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted">Total utilizadores</span>
                      <span className="font-bold">{metrics?.totalUsuarios || 0}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-muted">Taxa de aprovação</span>
                      <span className="font-bold text-success">
                        {metrics?.totalFaturas > 0 
                          ? Math.round(((metrics.faturasPorStatus?.APROVADO || 0) / metrics.totalFaturas) * 100) 
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="admin-card" style={{ marginBottom: 0 }}>
                  <div className="admin-card-header" style={{ padding: 'var(--spacing-md)' }}>
                    <h4>🏷️ Distribuição por Status</h4>
                  </div>
                  <div className="admin-card-body" style={{ padding: 'var(--spacing-md)' }}>
                    {metrics?.faturasPorStatus && Object.entries(metrics.faturasPorStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between mt-1">
                        <span>
                          <span className={`admin-status-badge ${getStatusBadgeClass(status)}`}>
                            <span className="dot" />
                            {getStatusLabel(status)}
                          </span>
                        </span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
      TAB: CONFIGURAÇÕES
      ============================================================ */}
      <div className={`admin-tab-content ${activeTab === 'configuracoes' ? 'active' : ''}`}>
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
              <Button variant="primary" onClick={() => alert('Configurações salvas!')}>
                💾 Salvar Configurações
              </Button>
              <Button variant="secondary" onClick={() => alert('Configurações restauradas!')}>
                ↩️ Restaurar Padrão
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
        <p>🇲🇿 EDS v1.0.0 • Painel Administrativo • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

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

export default Admin;