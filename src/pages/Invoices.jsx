import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Trash2, AlertCircle, Filter } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import './Invoices.css'

export const Invoices = () => {
  const { getInvoices, deleteInvoice } = useInvoices()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [deleteLoading, setDeleteLoading] = useState(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true)
        setError(null)
        const status = filter === 'ALL' ? null : filter
        const data = await getInvoices(status)
        setInvoices(data)
      } catch (err) {
        console.error('[v0] Error fetching invoices:', err)
        setError('Erro ao carregar faturas')
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [filter])

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta fatura?')) {
      try {
        setDeleteLoading(id)
        await deleteInvoice(id)
        setInvoices((prev) => prev.filter((inv) => inv.id !== id))
      } catch (err) {
        console.error('[v0] Error deleting invoice:', err)
        setError('Erro ao deletar fatura')
      } finally {
        setDeleteLoading(null)
      }
    }
  }

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
    <div className="invoices-container">
      <div className="invoices-header">
        <h1>Gerenciar Faturas</h1>
        <Link to="/faturas/upload" className="btn-upload">
          + Upload de Fatura
        </Link>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <Filter size={20} />
          <span>Filtrar por Status:</span>
        </div>
        <div className="filter-buttons">
          {['ALL', 'PENDENTE', 'PROCESSADA', 'REJEITADA'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'Todos' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && <p className="loading-text">Carregando faturas...</p>}

      {/* Empty */}
      {!loading && !error && invoices.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h2>Nenhuma fatura encontrada</h2>
          <p>Comece enviando uma nova fatura</p>
          <Link to="/faturas/upload" className="btn-primary">
            Upload de Fatura
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && !error && invoices.length > 0 && (
        <div className="table-responsive">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Fornecedor</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusInfo = getStatusBadge(invoice.status)
                return (
                  <tr key={invoice.id}>
                    <td className="cell-id">{invoice.id.slice(0, 8)}</td>
                    <td className="cell-numero">{invoice.numero}</td>
                    <td className="cell-fornecedor">
                      {invoice.fornecedor || '-'}
                    </td>
                    <td className="cell-valor">
                      R$ {invoice.valor?.toFixed(2) || '0.00'}
                    </td>
                    <td>
                      {invoice.dataVencimento
                        ? new Date(invoice.dataVencimento).toLocaleDateString('pt-BR')
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="cell-date">
                      {new Date(invoice.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="cell-actions">
                      <Link
                        to={`/faturas/${invoice.id}`}
                        className="action-link"
                        title="Ver detalhes"
                      >
                        Detalhes
                      </Link>
                      <button
                        className="action-delete"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteLoading === invoice.id}
                        title="Deletar fatura"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
