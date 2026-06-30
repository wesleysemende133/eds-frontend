import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Upload, TrendingUp, AlertCircle, Eye } from 'lucide-react'
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
    pagas: 0,
    canceladas: 0,
  })

  useEffect(() => {
    let isMounted = true

    const fetchInvoices = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getInvoices()
        
        if (!isMounted) return

        // Garante que 'data' seja um array válido para evitar quebras de runtime
        const listaFaturas = Array.isArray(data) ? data : []
        setInvoices(listaFaturas)

        // Cálculo de Métricas perfeitamente alinhado com o StatusFatura.java
        const calculoStats = listaFaturas.reduce(
          (acc, inv) => {
            acc.total++
            const status = inv.status?.toUpperCase()
            if (status === 'PENDENTE') acc.pendentes++
            else if (status === 'PAGO' || status === 'PROCESSADA') acc.pagas++
            else if (status === 'CANCELADO' || status === 'REJEITADA') acc.canceladas++
            return acc
          },
          { total: 0, pendentes: 0, pagas: 0, canceladas: 0 }
        )

        setStats(calculoStats)
      } catch (err) {
        console.error('Erro de integração com a API de Faturas:', err)
        // Captura a mensagem amigável injetada pelo nosso api.js interceptor
        setError(err.friendlyMessage || 'Não foi possível carregar os dados da dashboard.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchInvoices()

    return () => {
      isMounted = false
    }
  }, [getInvoices])

  // Centralização da regra de badges (Alinhado ao modelo do backend)
  const getStatusProps = (status) => {
    const statusNormalizado = status?.toUpperCase()
    
    const statusMap = {
      PENDENTE: { label: 'Pendente', className: 'badge-warning' },
      PAGO: { label: 'Pago', className: 'badge-success' },
      PROCESSADA: { label: 'Processada', className: 'badge-success' },
      CANCELADO: { label: 'Cancelado', className: 'badge-danger' },
      REJEITADA: { label: 'Rejeitada', className: 'badge-danger' },
    }

    return statusMap[statusNormalizado] || { label: status || 'Desconhecido', className: 'badge-default' }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral do Enterprise Document System (EDS)</p>
      </div>

      {/* Grid de Estatísticas */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe' }}>
            <FileText size={24} style={{ color: '#0369a1' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total de Faturas</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <AlertCircle size={24} style={{ color: '#d97706' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pendentes</p>
            <p className="stat-value">{stats.pendentes}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7' }}>
            <TrendingUp size={24} style={{ color: '#15803d' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Pagas / Processadas</p>
            <p className="stat-value">{stats.pagas}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>
            <FileText size={24} style={{ color: '#b91c1c' }} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Canceladas</p>
            <p className="stat-value">{stats.canceladas}</p>
          </div>
        </div>
      </div>

      {/* Ações Rápidas Corporativas */}
      <div className="quick-actions">
        <h2>Ações Estratégicas</h2>
        <div className="actions-grid">
          <Link to="/faturas/upload" className="action-card">
            <Upload size={24} />
            <span>Processar Nova Fatura (OCR)</span>
          </Link>
          <Link to="/faturas" className="action-card">
            <FileText size={24} />
            <span>Visualizar Repositório</span>
          </Link>
        </div>
      </div>

      {/* Seção de Dados Recentes */}
      <div className="recent-section">
        <h2>Faturas Recentes</h2>

        {loading && (
          <div className="loading-container">
            <p className="loading-text">Buscando dados no servidor Java...</p>
          </div>
        )}
        
        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && invoices.length === 0 && (
          <p className="empty-text">Nenhum documento armazenado no banco de dados.</p>
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
                  <th>Data de Emissão</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 5).map((invoice) => {
                  const statusInfo = getStatusProps(invoice.status)
                  return (
                    <tr key={invoice.id}>
                      <td className="cell-id" title={invoice.id}>
                        {invoice.id ? `${invoice.id.slice(0, 8)}...` : 'N/A'}
                      </td>
                      <td>{invoice.numero || 'Não identificado'}</td>
                      <td className="cell-value">
                        {invoice.valor !== undefined && invoice.valor !== null
                          ? invoice.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'MZN' })
                          : 'MT 0,00'}
                      </td>
                      <td>
                        <span className={`badge ${statusInfo.className}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td>
                        {invoice.data 
                          ? new Date(invoice.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                          : 'S/D'}
                      </td>
                      <td>
                        <Link to={`/faturas/${invoice.id}`} className="link-detail" title="Ver Detalhes">
                          <Eye size={16} style={{ marginRight: '4px' }} />
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