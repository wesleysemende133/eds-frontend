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

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const statusParam = filter === 'ALL' ? null : filter
      const data = await getInvoices(statusParam)
      
      console.log('📋 Faturas recebidas:', data) // 👈 Debug
      
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

  // Invoices.jsx - handleDelete corrigido
  const handleDelete = async (id) => {
    if (!id || !window.confirm('Tem certeza de que deseja deletar permanentemente esta fatura?')) {
      return
    }

    try {
      setDeleteLoading(id)
      setError(null)
      
      // ✅ Aguardar a exclusão
      await deleteInvoice(id)
      
      // ✅ Remover a fatura da lista local (mais rápido que recarregar tudo)
      setInvoices(prev => prev.filter(inv => inv.id !== id))
      
      // ✅ Opcional: recarregar para garantir consistência
      // await fetchInvoices()
      
    } catch (err) {
      console.error('Erro ao deletar fatura:', err)
      setError(err.friendlyMessage || 'Não foi possível excluir a fatura.')
      // ✅ Recarregar para garantir consistência
      await fetchInvoices()
    } finally {
      setDeleteLoading(null)
    }
  }

  // ✅ CORRIGIDO: Adicionar todos os status possíveis
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

  // ✅ Função para formatar moeda
  const formatarMoeda = (valor) => {
    if (valor === undefined || valor === null) return 'MT 0,00'
    return `MT ${valor.toLocaleString('pt-MZ', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  // ✅ Função para formatar data
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

  // ✅ Função para formatar data e hora
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
      <div className="invoices-header">
        <h1>Gerenciar Faturas</h1>
        <Link to="/faturas/upload" className="btn-upload">
          + Novo Upload (OCR)
        </Link>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <Filter size={20} />
          <span>Filtrar por Status:</span>
        </div>
        <div className="filter-buttons">
          {['ALL', 'AGUARDANDO_APROVACAO', 'PROCESSANDO', 'PROCESSADO', 'APROVADO', 'REJEITADO', 'ERRO_EXTRACAO'].map((status) => (
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
                      {/* ✅ CORRIGIDO: usar numeroFatura */}
                      {invoice.numeroFatura || 'Não extraído'}
                    </td>
                    <td className="cell-fornecedor">
                      {/* ✅ CORRIGIDO: usar fornecedor */}
                      {invoice.fornecedor || '-'}
                    </td>
                    <td className="cell-valor">
                      {/* ✅ CORRIGIDO: usar valorTotal */}
                      {formatarMoeda(invoice.valorTotal)}
                    </td>
                    <td>
                      {/* ✅ ADICIONADO: dataFatura */}
                      {formatarData(invoice.dataFatura)}
                    </td>
                    <td>
                      {/* ✅ CORRIGIDO: dataVencimento */}
                      {invoice.dataVencimento ? formatarData(invoice.dataVencimento) : '-'}
                    </td>
                    <td>
                      <span className={`badge ${statusInfo.className}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="cell-date">
                      {/* ✅ CORRIGIDO: usar dataCriacao */}
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
                        type="button"
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