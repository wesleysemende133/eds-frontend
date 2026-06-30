import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react'
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
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  useEffect(() => {
    let isMounted = true

    const fetchInvoice = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getInvoiceById(id)
        if (isMounted) {
          setInvoice(data)
        }
      } catch (err) {
        console.error('Falha ao obter detalhes da fatura do backend:', err)
        if (isMounted) {
          setError(err.friendlyMessage || 'Erro ao carregar os detalhes da fatura.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (id) {
      fetchInvoice()
    }

    return () => {
      isMounted = false
    }
  }, [id, getInvoiceById])

  const handleDelete = async () => {
    if (!window.confirm('Tem certeza de que deseja excluir permanentemente esta fatura do sistema?')) {
      return
    }

    try {
      setDeleteLoading(true)
      setError(null)
      await deleteInvoice(id)
      setDeleteSuccess(true)
      
      // Redireciona com um delay para dar feedback visual de exclusão
      setTimeout(() => {
        navigate('/faturas')
      }, 1500)
    } catch (err) {
      console.error('Erro ao processar exclusão no ControladorFatura:', err)
      setDeleteLoading(false)
      setError(err.friendlyMessage || 'Não foi possível deletar a fatura. Tente novamente.')
    }
  }

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

  // Formatação robusta de datas UTC para evitar distorções de fuso horário local
  const formatarData = (dataString) => {
    if (!dataString) return '-'
    const data = new Date(dataString)
    return isNaN(data.getTime()) ? '-' : data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  // Formatação monetária padronizada para o mercado do EDS (Meticais)
  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00'
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'MZN' })
  }

  if (loading) {
    return (
      <div className="invoice-detail-container" role="status">
        <p className="loading-text">Consultando banco de dados da API Java...</p>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <button onClick={() => navigate('/faturas')} className="btn-back">
          <ArrowLeft size={20} />
          Voltar para listagem
        </button>
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} />
          <span>{error || 'Fatura solicitada não foi localizada.'}</span>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusProps(invoice.status)

  return (
    <div className="invoice-detail-container">
      <div className="detail-header">
        <button 
          onClick={() => navigate('/faturas')} 
          className="btn-back"
          disabled={deleteLoading}
        >
          <ArrowLeft size={20} />
          Voltar
        </button>
        <h1>Detalhes da Fatura</h1>
        
        <div className="header-actions">
          <button className="btn-icon" title="Baixar documento PDF original" disabled={deleteLoading}>
            <Download size={20} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading || deleteSuccess}
            className="btn-icon btn-danger"
            title="Excluir do banco de dados"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {deleteSuccess && (
        <div className="alert alert-success" role="alert">
          <CheckCircle size={20} />
          <span>Fatura excluída com sucesso! Atualizando repositório...</span>
        </div>
      )}

      <div className="detail-content">
        {/* Bloco de Identificação */}
        <div className="info-card">
          <h2>Metadados de Identificação</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>ID Universal (UUID)</label>
              <span className="value-id">{invoice.id}</span>
            </div>
            <div className="info-row">
              <label>Número do Documento</label>
              <span>{invoice.numero || 'Não identificado pelo OCR'}</span>
            </div>
            <div className="info-row">
              <label>Estado do Processamento</label>
              <span className={`badge ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
            </div>
            <div className="info-row">
              <label>Data de Recebimento</label>
              <span>{formatarData(invoice.data)}</span>
            </div>
          </div>
        </div>

        {/* Bloco Contábil */}
        <div className="info-card">
          <h2>Dados Contábeis e Financeiros</h2>
          <div className="info-grid">
            <div className="info-row">
              <label>Valor Nominal</label>
              <span className="value-amount">{formatarMoeda(invoice.valor)}</span>
            </div>
            <div className="info-row">
              <label>Entidade Emissora (Fornecedor)</label>
              <span>{invoice.fornecedor || 'Não extraído'}</span>
            </div>
            <div className="info-row">
              <label>Data de Vencimento</label>
              <span>{formatarData(invoice.dataVencimento)}</span>
            </div>
            {invoice.dataPagamento && (
              <div className="info-row">
                <label>Data de Liquidação</label>
                <span>{formatarData(invoice.dataPagamento)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bloco de Observações Internas */}
        {invoice.descricao && (
          <div className="info-card">
            <h2>Notas de Auditoria / Descrição</h2>
            <p className="description">{invoice.descricao}</p>
          </div>
        )}

        {/* Metadados Customizados Dinâmicos */}
        {invoice.metadados && Object.keys(invoice.metadados).length > 0 && (
          <div className="info-card">
            <h2>Parâmetros JSON Extraídos</h2>
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