// src/pages/Invoices.jsx
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Trash2, AlertCircle, Filter, Eye, X } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import './Invoices.css'

export const Invoices = () => {
  const { getInvoices, deleteInvoice } = useInvoices()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('ALL')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [invoiceToDelete, setInvoiceToDelete] = useState(null)

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statusParam = filter === 'ALL' ? null : filter
      const data = await getInvoices(statusParam)
      
      const listaFaturas = Array.isArray(data) ? data : data?.content || []
      setInvoices(listaFaturas)
    } catch (err) {
      console.error('Erro ao buscar faturas:', err)
      setError(err.friendlyMessage || 'Erro ao carregar faturas. Verifique se o servidor está online.')
    } finally {
      setLoading(false)
    }
  }, [filter, getInvoices])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // ✅ Abrir modal de confirmação
  const handleDeleteClick = (id) => {
    setInvoiceToDelete(id)
    setShowDeleteModal(true)
  }

  // ✅ Confirmar exclusão
  const confirmDelete = async () => {
    if (!invoiceToDelete) return

    try {
      setDeleteLoading(invoiceToDelete)
      setError(null)
      
      await deleteInvoice(invoiceToDelete)
      
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoiceToDelete))
      
      setShowDeleteModal(false)
      setInvoiceToDelete(null)
      
    } catch (err) {
      console.error('Erro ao deletar fatura:', err)
      setError(err.friendlyMessage || 'Não foi possível excluir a fatura.')
      await fetchInvoices()
    } finally {
      setDeleteLoading(null)
    }
  }

  // ✅ Cancelar exclusão
  const cancelDelete = () => {
    setShowDeleteModal(false)
    setInvoiceToDelete(null)
  }

  const getStatusBadge = (status) => {
    const statusNormalizado = status?.toUpperCase()
    const statusMap = {
      'AGUARDANDO_APROVACAO': { label: 'Aguardando Aprovação', className: 'badge-warning' },
      'PROCESSANDO': { label: 'Processando', className: 'badge-info' },
      'PROCESSADO': { label: 'Processado', className: 'badge-success' },
      'APROVADO': { label: 'Aprovado', className: 'badge-success' },
      'REJEITADO': { label: 'Rejeitado', className: 'badge-danger' },
      'ERRO_EXTRACAO': { label: 'Erro na Extração', className: 'badge-danger' },
      'CANCELADO': { label: 'Cancelado', className: 'badge-danger' },
      'PENDENTE': { label: 'Pendente', className: 'badge-warning' },
      'PAGO': { label: 'Pago', className: 'badge-success' },
    }
    return statusMap[statusNormalizado] || { label: status || 'Desconhecido', className: 'badge-default' }
  }

  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00'
    return `MT ${valor.toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  const formatarData = (dataString) => {
    if (!dataString) return '-'
    try {
      const data = new Date(dataString)
      if (isNaN(data.getTime())) return '-'
      return data.toLocaleDateString('pt-MZ', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    } catch {
      return '-'
    }
  }

  const formatarDataHora = (dataString) => {
    if (!dataString) return '-'
    try {
      const data = new Date(dataString)
      if (isNaN(data.getTime())) return '-'
      return data.toLocaleDateString('pt-MZ', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return '-'
    }
  }

  return (
    <div className="invoices-container">
      {/* ✅ MODAL DE CONFIRMAÇÃO */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirmar Exclusão</h3>
              <button className="modal-close" onClick={cancelDelete}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Tem certeza de que deseja excluir permanentemente esta fatura?</p>
              <p className="modal-warning">⚠️ Esta ação não pode ser desfeita.</p>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={cancelDelete}
                disabled={deleteLoading === invoiceToDelete}
              >
                Cancelar
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete}
                disabled={deleteLoading === invoiceToDelete}
              >
                {deleteLoading === invoiceToDelete ? 'Excluindo...' : 'Sim, Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="invoices-header">
        <h1>Gerenciar Faturas</h1>
        <Link to="/faturas/upload" className="btn-upload">
          + Novo Upload (OCR)
        </Link>
      </div>

      {/* FILTROS */}
      <div className="filters-section">
        <div className="filter-group">
          <Filter size={20} />
          <span>Filtrar por Status:</span>
        </div>
        <div className="filter-buttons">
          {['ALL', 'AGUARDANDO_APROVACAO', 'APROVADO', 'REJEITADO', 'CANCELADO', 'PAGO'].map((status) => (
            <button
              key={status}
              className={`filter-btn ${filter === status ? 'active' : ''}`}
              onClick={() => setFilter(status)}
              disabled={loading}
            >
              {status === 'ALL' ? 'Todos' : status.replace('_', ' ').toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* LOADING */}
      {loading && (
        <div className="loading-container">
          <p className="loading-text">Buscando documentos no banco de dados corporativo...</p>
        </div>
      )}

      {/* EMPTY STATE */}
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

      {/* TABLE */}
      {!loading && !error && invoices.length > 0 && (
        <div className="table-responsive">
          <table className="invoices-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Fornecedor</th>
                <th>Valor Nominal</th>
                <th>Data Fatura</th>
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
                    <td className="cell-numero">
                      {invoice.numeroFatura || 'Não extraído'}
                    </td>
                    <td className="cell-fornecedor">
                      {invoice.fornecedor || '-'}
                    </td>
                    <td className="cell-valor">
                      {formatarMoeda(invoice.valorTotal)}
                    </td>
                    <td>
                      {formatarData(invoice.dataFatura)}
                    </td>
                    <td>
                      {invoice.dataVencimento ? formatarData(invoice.dataVencimento) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="cell-date">
                      {formatarDataHora(invoice.dataCriacao)}
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
                        onClick={() => handleDeleteClick(invoice.id)}
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