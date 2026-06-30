import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Upload, TrendingUp, AlertCircle } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import './Dashboard.css'

export const Dashboard = () => {
  const { getInvoices } = useInvoices()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    total: 0,
    pendentes: 0,
    processadas: 0,
    rejeitadas: 0,
  })

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        const data = await getInvoices()
        setInvoices(data)

        // Calculate stats
        const stats = {
          total: data.length,
          pendentes: data.filter((inv) => inv.status === 'PENDENTE').length,
          processadas: data.filter((inv) => inv.status === 'PROCESSADA').length,
          rejeitadas: data.filter((inv) => inv.status === 'REJEITADA').length,
        }
        setStats(stats)
      } catch (err) {
        console.error('[v0] Error fetching invoices:', err)
        setError('Erro ao carregar faturas')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [])

  const getStatusBadge = (status) => {
    const statusMap = {
      PENDENTE: { label: 'Pendente', className: 'badge-warning' },
      PROCESSADA: { label: 'Processada', className: 'badge-success' },
      REJEITADA: { label: 'Rejeitada', className: 'badge-danger' },
    }
    const current = statusMap[status] || { label: status, className: 'badge-default' }
    return current
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema de gestão de faturas</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <FileText size={24} style={{ color: '#2563eb' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total de Faturas</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <AlertCircle size={24} style={{ color: '#f59e0b' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pendentes</p>
            <p className="stat-value">{stats.pendentes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
            <TrendingUp size={24} style={{ color: '#10b981' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Processadas</p>
            <p className="stat-value">{stats.processadas}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>
            <FileText size={24} style={{ color: '#ef4444' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Rejeitadas</p>
            <p className="stat-value">{stats.rejeitadas}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Ações Rápidas</h2>
        <div className="actions-grid">
          <Link to="/faturas/upload" className="action-card">
            <Upload size={28} />
            <span>Upload de Fatura</span>
          </Link>
          <Link to="/faturas" className="action-card">
            <FileText size={28} />
            <span>Ver Todas as Faturas</span>
          </Link>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="recent-section">
        <h2>Faturas Recentes</h2>

        {loading && <p className="loading-text">Carregando...</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && invoices.length === 0 && (
          <p className="empty-text">Nenhuma fatura encontrada</p>
        )}

        {!loading && !error && invoices.length > 0 && (
          <div className="invoices-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Número</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => {
                  const statusInfo = getStatusBadge(invoice.status)
                  return (
                    <tr key={invoice.id}>
                      <td className="cell-id">{invoice.id.slice(0, 8)}</td>
                      <td>{invoice.numero}</td>
                      <td className="cell-value">
                        R$ {invoice.valor?.toFixed(2) || '0.00'}
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        {new Date(invoice.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <Link to={`/faturas/${invoice.id}`} className="link-detail">
                          Detalhes
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
