// src/pages/Admin/Admin.jsx

import React, { useState, useEffect } from 'react';
import './Admin.css';
import '../../assets/styles/index.css';

// ============================================================
// COMPONENTES
// ============================================================

const StatCard = ({ label, value, change, changeType, icon }) => (
  <div className="stat-card animate-fade-in">
    <div className="label">{icon} {label}</div>
    <div className="value">{value}</div>
    {change && (
      <div className={`change ${changeType}`}>
        {changeType === 'up' ? '↑' : '↓'} {change}
      </div>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const statusMap = {
    'PENDENTE': 'pending',
    'APROVADA': 'approved',
    'REJEITADA': 'rejected',
    'EFETIVADA': 'efetivado',
    'CANCELADA': 'canceled'
  };
  return <span className={`status-badge ${statusMap[status] || 'pending'}`}>{status}</span>;
};

const Tab = ({ label, active, onClick }) => (
  <button className={`tab ${active ? 'active' : ''}`} onClick={onClick}>
    {label}
  </button>
);

// ============================================================
// DADOS MOCK (Atualizados com Meticais)
// ============================================================

const mockStats = [
  { label: 'Total Faturas', value: '1,247', change: '+12%', changeType: 'up', icon: '📄' },
  { label: 'Faturas Pendentes', value: '43', change: '-5%', changeType: 'down', icon: '⏳' },
  { label: 'Aprovadas', value: '892', change: '+8%', changeType: 'up', icon: '✅' },
  { label: 'Valor Total', value: 'MT 2.4M', change: '+15%', changeType: 'up', icon: '💰' },
];

const mockInvoices = [
  { id: '1', numero: 'FT-2024-001', fornecedor: 'Tech Solutions Ltda', valor: 'MT 12.450,00', data: '13/07/2024', status: 'PENDENTE' },
  { id: '2', numero: 'FT-2024-002', fornecedor: 'Global Services SA', valor: 'MT 8.320,50', data: '12/07/2024', status: 'APROVADA' },
  { id: '3', numero: 'FT-2024-003', fornecedor: 'InovaTech ME', valor: 'MT 5.678,90', data: '11/07/2024', status: 'REJEITADA' },
  { id: '4', numero: 'FT-2024-004', fornecedor: 'Mega Distribuidora', valor: 'MT 23.100,00', data: '10/07/2024', status: 'EFETIVADA' },
  { id: '5', numero: 'FT-2024-005', fornecedor: 'Alpha Consulting', valor: 'MT 3.250,75', data: '09/07/2024', status: 'PENDENTE' },
  { id: '6', numero: 'FT-2024-006', fornecedor: 'Maputo Comércio Lda', valor: 'MT 15.750,00', data: '08/07/2024', status: 'APROVADA' },
  { id: '7', numero: 'FT-2024-007', fornecedor: 'Beira Logística SA', valor: 'MT 42.300,00', data: '07/07/2024', status: 'EFETIVADA' },
];

const mockUsers = [
  { id: '1', nome: 'João Silva', email: 'joao@empresa.co.mz', role: 'Admin', status: 'Ativo' },
  { id: '2', nome: 'Maria Santos', email: 'maria@empresa.co.mz', role: 'Gestor', status: 'Ativo' },
  { id: '3', nome: 'Pedro Costa', email: 'pedro@empresa.co.mz', role: 'Usuário', status: 'Inativo' },
  { id: '4', nome: 'Ana Oliveira', email: 'ana@empresa.co.mz', role: 'Gestor', status: 'Ativo' },
  { id: '5', nome: 'Carlos Matusse', email: 'carlos@empresa.co.mz', role: 'Usuário', status: 'Ativo' },
];

const chartData = [
  { label: 'Jan', value: 65 },
  { label: 'Fev', value: 45 },
  { label: 'Mar', value: 75 },
  { label: 'Abr', value: 55 },
  { label: 'Mai', value: 85 },
  { label: 'Jun', value: 70 },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

const Admin = () => {
  const [activeTab, setActiveTab] = useState('faturas');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredInvoices, setFilteredInvoices] = useState(mockInvoices);
  const [filteredUsers, setFilteredUsers] = useState(mockUsers);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  // Filtrar faturas
  useEffect(() => {
    const filtered = mockInvoices.filter(inv =>
      inv.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.fornecedor.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInvoices(filtered);
  }, [searchTerm]);

  // ============================================================
  // RENDER
  // ============================================================

  if (loading) {
    return (
      <div className="main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="text-center">
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <h3 className="text-secondary">Carregando painel...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      {/* ============================================================
      TOPBAR
      ============================================================ */}
      <div className="topbar">
        <div className="page-title">
          <h2>👑 Painel Administrativo</h2>
          <p>Gerencie faturas, usuários e configurações do sistema</p>
        </div>
        <div className="actions">
          <input
            type="text"
            placeholder="🔍 Buscar faturas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn primary" onClick={() => alert('Nova fatura')}>
            + Nova Fatura
          </button>
        </div>
      </div>

      {/* ============================================================
      STATS
      ============================================================ */}
      <div className="stats-grid">
        {mockStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* ============================================================
      TABS
      ============================================================ */}
      <div className="tabs">
        <Tab
          label="📋 Faturas"
          active={activeTab === 'faturas'}
          onClick={() => setActiveTab('faturas')}
        />
        <Tab
          label="👥 Usuários"
          active={activeTab === 'usuarios'}
          onClick={() => setActiveTab('usuarios')}
        />
        <Tab
          label="📊 Relatórios"
          active={activeTab === 'relatorios'}
          onClick={() => setActiveTab('relatorios')}
        />
        <Tab
          label="⚙️ Configurações"
          active={activeTab === 'configuracoes'}
          onClick={() => setActiveTab('configuracoes')}
        />
      </div>

      {/* ============================================================
      TAB: FATURAS
      ============================================================ */}
      <div className={`tab-content ${activeTab === 'faturas' ? 'active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>📄 Lista de Faturas</h3>
            <div className="filters">
              <select defaultValue="">
                <option value="">Todos os status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="APROVADA">Aprovada</option>
                <option value="REJEITADA">Rejeitada</option>
                <option value="EFETIVADA">Efetivada</option>
                <option value="CANCELADA">Cancelada</option>
              </select>
              <select defaultValue="recentes">
                <option value="recentes">Mais recentes</option>
                <option value="antigos">Mais antigos</option>
                <option value="maior">Maior valor</option>
                <option value="menor">Menor valor</option>
              </select>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
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
                      <td><strong>{invoice.numero}</strong></td>
                      <td>{invoice.fornecedor}</td>
                      <td>{invoice.valor}</td>
                      <td>{invoice.data}</td>
                      <td><StatusBadge status={invoice.status} /></td>
                      <td>
                        <div className="actions-cell">
                          <button className="btn-icon" title="Visualizar">👁️</button>
                          <button className="btn-icon success" title="Aprovar">✅</button>
                          <button className="btn-icon danger" title="Rejeitar">❌</button>
                          <button className="btn-icon" title="Editar">✏️</button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6">
                      <div className="empty-state">
                        <div className="icon">📭</div>
                        <h4>Nenhuma fatura encontrada</h4>
                        <p className="text-muted">Tente ajustar os filtros de busca</p>
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
      <div className={`tab-content ${activeTab === 'usuarios' ? 'active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>👥 Usuários do Sistema</h3>
            <button className="btn primary" onClick={() => alert('Novo usuário')}>
              + Novo Usuário
            </button>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Função</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id}>
                    <td><strong>{user.nome}</strong></td>
                    <td>{user.email}</td>
                    <td>
                      <span className="status-badge approved">{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status === 'Ativo' ? 'approved' : 'canceled'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="btn-icon" title="Editar">✏️</button>
                        <button className="btn-icon" title="Permissões">🔑</button>
                        <button className="btn-icon danger" title="Remover">🗑️</button>
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
      TAB: RELATÓRIOS
      ============================================================ */}
      <div className={`tab-content ${activeTab === 'relatorios' ? 'active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>📊 Faturas por Mês</h3>
            <div className="filters">
              <select defaultValue="2024">
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-placeholder">
              {chartData.map((item, index) => (
                <div key={index} className="chart-bar-row">
                  <span className="label">{item.label}</span>
                  <div className="bar-track">
                    <div
                      className={`fill ${index % 2 === 0 ? 'blue' : 'green'}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="value">{item.value}%</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="card" style={{ marginBottom: 0 }}>
                <h4>📈 Resumo</h4>
                <div style={{ marginTop: '8px' }}>
                  <div className="flex justify-between">
                    <span className="text-muted">Total faturas</span>
                    <span className="font-bold">1.247</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted">Média mensal</span>
                    <span className="font-bold">104</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted">Taxa de aprovação</span>
                    <span className="font-bold text-success">71,5%</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted">Valor médio</span>
                    <span className="font-bold">MT 1.924,00</span>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: 0 }}>
                <h4>🏷️ Por Status</h4>
                <div style={{ marginTop: '8px' }}>
                  <div className="flex justify-between">
                    <span><span className="status-badge pending">Pendente</span></span>
                    <span className="font-bold">43</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span><span className="status-badge approved">Aprovada</span></span>
                    <span className="font-bold">892</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span><span className="status-badge rejected">Rejeitada</span></span>
                    <span className="font-bold">127</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span><span className="status-badge efetivado">Efetivada</span></span>
                    <span className="font-bold">185</span>
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
      <div className={`tab-content ${activeTab === 'configuracoes' ? 'active' : ''}`}>
        <div className="card">
          <div className="card-header">
            <h3>⚙️ Configurações do Sistema</h3>
          </div>

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
              <input type="text" defaultValue="17%" />
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
            <button className="btn primary" onClick={() => alert('Configurações salvas!')}>
              💾 Salvar Configurações
            </button>
            <button className="btn" onClick={() => alert('Configurações restauradas!')}>
              ↩️ Restaurar Padrão
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
      FOOTER
      ============================================================ */}
      <div style={{ marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--color-border)', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
        <p>🇲🇿 EDS Backend v1.0.0 • Painel Administrativo • {new Date().getFullYear()}</p>
        <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
          Moçambique - Todos os direitos reservados
        </p>
      </div>
    </div>
  );
};

export default Admin;