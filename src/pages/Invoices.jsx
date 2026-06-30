import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Trash2, AlertCircle, Filter, Eye } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import './Invoices.css'

export const Invoices = () => {
  const { getInvoices, deleteInvoice } = useInvoices()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [deleteLoading, setDeleteLoading] = useState(null)

  // Memoriza a função para evitar recriações desnecessárias no ciclo do useEffect
  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Alinha o parâmetro conforme esperado pelos Query Params do ControladorFatura
      const statusParam = filter === 'ALL' ? null : filter
      const data = await getInvoices(statusParam)
      
      // Garante resiliência caso o backend traga um objeto paginado (data.content) ou array vazio
      const listaFaturas = Array.isArray(data) ? data : data?.content || []
      setInvoices(listaFaturas)
    } catch (err) {
      console.error('Erro ao buscar faturas na API Java:', err)
      setError(err.friendlyMessage || 'Erro ao carregar faturas. Verifique se o servidor está online.')
    } finally {
      setLoading(false)
    }
  }, [filter, getInvoices])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleDelete = async (id) => {
    if (!id || !window.confirm('Tem certeza de que deseja deletar permanentemente esta fatura?')) {
      return
    }

    try {
      setDeleteLoading(id)
      setError(null)
      await deleteInvoice(id)
      setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch (err) {
      console.error('Erro ao deletar fatura no ControladorFatura:', err)
      setError(err.friendlyMessage || 'Não foi possível excluir a fatura.')
    } finally {
      setDeleteLoading(null)
    }
  }

  // Normalização do mapeamento de Enums do StatusFatura.java
  const getStatusBadge = (status) => {
    const statusNormalizado = status?.toUpperCase()
    const statusMap = {
      PENDENTE: { label: 'Pendente', className: 'badge-warning' },
      PROCESSADA: { label: 'Processada', className: 'badge-success' },
      PAGO: { label: 'Pago', className: 'badge-success' },
      REJEITADA: { label: 'Rejeitada', className: 'badge-danger' },
      CANCELADO: { label: 'Cancelado', className: 'badge-danger' },
    }
    return statusMap[statusNormalizado] || { label: status || 'Desconhecido', className: 'badge-default' }
  }

  return (
    <div className="invoices-container">
      <div className="invoices-header">
        <h1>Gerenciar Faturas</h1>
        <Link to="/faturas/upload" className="btn-upload">
          + Novo Upload (OCR)
        </Link>
      </div>

      {/* Seção de Filtros */}
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
              disabled={loading}
            >
              {status === 'ALL' ? 'Todos' : status.toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Mensagens de Feedback */}
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <p className="loading-text">Buscando documentos no banco de dados corporativo...</p>
        </div>
      )}

      {/* Estado Vazio (Empty State) */}
      {!loading && !error && invoices.length === 0 && (
        <div className="empty-state">
          <FileText size={48} />
          <h2>Nenhuma fatura localizada</h2>
          <p>Envie um arquivo PDF para iniciar o processamento OCR automático.</p>
          <Link to="/faturas/upload" className="btn-primary">
            Fazer Upload de Fatura
          </Link>
        </div>
      )}

      {/* Tabela de Dados */}
      {!loading && !error && invoices.length > 0 && (
        <div className="table-responsive">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Fornecedor</th>
                <th>Valor Nominal</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Data Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const statusInfo = getStatusBadge(invoice.status)
                return (
                  <tr key={invoice.id || Math.random()}>
                    <td className="cell-id" title={invoice.id}>
                      {invoice.id ? `${invoice.id.slice(0, 8)}...` : 'N/A'}
                    </td>
                    <td className="cell-numero">{invoice.numero || 'Não extraído'}</td>
                    <td className="cell-fornecedor">{invoice.fornecedor || '-'}</td>
                    <td className="cell-valor">
                      {invoice.valor !== undefined && invoice.valor !== null
                        ? invoice.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'MZN' })
                        : 'MT 0,00'}
                    </td>
                    <td>
                      {invoice.dataVencimento
                        ? new Date(invoice.dataVencimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
                        : '-'}
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="cell-date">
                      {invoice.data 
                        ? new Date(invoice.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                        : '-'}
                    </td>
                    <td className="cell-actions">
                      <Link
                        to={`/faturas/${invoice.id}`}
                        className="action-link"
                        title="Ver detalhes completos"
                      >
                        <Eye size={16} />
                        Detalhes
                      </Link>
                      <button
                        className="action-delete"
                        onClick={() => handleDelete(invoice.id)}
                        disabled={deleteLoading === invoice.id}
                        title="Deletar fatura do sistema"
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
