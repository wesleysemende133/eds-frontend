import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trash2, AlertCircle } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import './InvoiceDetail.css'

export const InvoiceDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getInvoiceById, deleteInvoice } = useInvoices()
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getInvoiceById(id)
        setInvoice(data)
      } catch (err) {
        console.error('[v0] Error fetching invoice:', err)
        setError('Erro ao carregar fatura')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchInvoice()
    }
  }, [id])

  const handleDelete = async () => {
    if (window.confirm('Tem certeza que deseja deletar esta fatura?')) {
      try {
        setDeleteLoading(true)
        await deleteInvoice(id)
        navigate('/faturas')
      } catch (err) {
        console.error('[v0] Error deleting invoice:', err)
        setError('Erro ao deletar fatura')
      } finally {
        setDeleteLoading(false)
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

  if (loading) {
    return (
      <div className="invoice-detail-container">
        <p className="loading-text">Carregando fatura...</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <button
          onClick={() => navigate('/faturas')}
          className="btn-back"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error || 'Fatura não encontrada'}</span>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusBadge(invoice.status)

  return (
    <div className="invoice-detail-container">
      <div className="detail-header">
        <button
          onClick={() => navigate('/faturas')}
          className="btn-back"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>Detalhes da Fatura</h1>
        <div className="header-actions">
          <button className="btn-icon" title="Baixar fatura">
            <Download size={20} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="btn-icon btn-danger"
            title="Deletar fatura"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="detail-content">
        {/* Basic Info */}
        <div className="info-card">
          <h2>Informações Básicas</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>ID</label>
              <span className="value-id">{invoice.id}</span>
            </div>
            <div className="info-row">
              <label>Número</label>
              <span>{invoice.numero}</span>
            </div>
            <div className="info-row">
              <label>Status</label>
              <span className={`badge ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="info-row">
              <label>Data de Envio</label>
              <span>{new Date(invoice.data).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="info-card">
          <h2>Informações Financeiras</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>Valor</label>
              <span className="value-amount">
                R$ {invoice.valor?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div className="info-row">
              <label>Fornecedor</label>
              <span>{invoice.fornecedor || '-'}</span>
            </div>
            <div className="info-row">
              <label>Data de Vencimento</label>
              <span>
                {invoice.dataVencimento
                  ? new Date(invoice.dataVencimento).toLocaleDateString('pt-BR')
                  : '-'}
              </span>
            </div>
            {invoice.dataPagamento && (
              <div className="info-row">
                <label>Data de Pagamento</label>
                <span>
                  {new Date(invoice.dataPagamento).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {invoice.descricao && (
          <div className="info-card">
            <h2>Descrição</h2>
            <p className="description">{invoice.descricao}</p>
          </div>
        )}

        {/* Metadata */}
        {invoice.metadados && Object.keys(invoice.metadados).length > 0 && (
          <div className="info-card">
            <h2>Metadados</h2>
            <div className="metadata-grid">
              {Object.entries(invoice.metadados).map(([key, value]) => (
                <div key={key} className="metadata-item">
                  <span className="metadata-key">{key}:</span>
                  <span className="metadata-value">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
