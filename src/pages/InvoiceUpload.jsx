import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, AlertCircle, CheckCircle, FileText, X } from 'lucide-react'
import { useInvoices } from '../hooks/useInvoices'
import './InvoiceUpload.css'

export const InvoiceUpload = () => {
  const navigate = useNavigate()
  const { uploadInvoice } = useInvoices()
  
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  const fileInputRef = useRef(null)

  // Limpeza de cache de memória para evitar Memory Leaks com ObjectURLs
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview)
      }
    }
  }, [preview])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  // ✅ Função para obter extensão do arquivo
  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || ''
  }

  // ✅ Função para verificar se é imagem
  const isImage = (file) => {
    return file.type?.startsWith('image/') || 
           ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'].includes(getFileExtension(file.name))
  }

  // ✅ Função para verificar se é PDF
  const isPDF = (file) => {
    return file.type === 'application/pdf' || getFileExtension(file.name) === 'pdf'
  }

  // ✅ Função para verificar se é documento do Office
  const isOffice = (file) => {
    const ext = getFileExtension(file.name)
    return ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp', 'rtf', 'txt'].includes(ext)
  }

  // ✅ Função para obter ícone do tipo de arquivo
  const getFileIcon = (file) => {
    const ext = getFileExtension(file.name)
    if (isPDF(file)) return '📄'
    if (isImage(file)) return '🖼️'
    if (ext === 'doc' || ext === 'docx') return '📝'
    if (ext === 'xls' || ext === 'xlsx') return '📊'
    if (ext === 'ppt' || ext === 'pptx') return '📑'
    return '📎'
  }

  // ✅ Função para obter descrição do tipo de arquivo
  const getFileTypeDescription = (file) => {
    const ext = getFileExtension(file.name)
    if (isPDF(file)) return 'Documento PDF'
    if (isImage(file)) return 'Imagem'
    if (ext === 'doc' || ext === 'docx') return 'Documento Word'
    if (ext === 'xls' || ext === 'xlsx') return 'Planilha Excel'
    if (ext === 'ppt' || ext === 'pptx') return 'Apresentação PowerPoint'
    if (ext === 'txt') return 'Arquivo de Texto'
    if (ext === 'rtf') return 'Documento RTF'
    if (ext === 'odt') return 'Documento OpenOffice'
    if (ext === 'ods') return 'Planilha OpenOffice'
    if (ext === 'odp') return 'Apresentação OpenOffice'
    return `Arquivo ${ext.toUpperCase()}`
  }

  const handleFileSelect = (selectedFile) => {
    setError('')
    setSuccess(false)

    // ✅ VALIDAÇÃO REMOVIDA: Aceitar qualquer tipo de arquivo
    // Apenas verifica se o arquivo existe
    if (!selectedFile) {
      setError('Nenhum arquivo selecionado.')
      return
    }

    // ✅ VALIDAÇÃO DE TAMANHO: Aumentar para 50MB
    const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`O arquivo excede o limite máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
      return
    }

    setFile(selectedFile)

    // ✅ GERAR PREVIEW APENAS PARA IMAGENS
    if (isImage(selectedFile)) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setPreview(null)
    }
  }

  const clearSelectedFile = () => {
    setFile(null)
    setPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Selecione um arquivo válido antes de enviar.')
      return
    }

    const formData = new FormData()
    formData.append('file', file) 
    
    // ✅ Opcional: Adicionar metadados adicionais
    formData.append('nomeOriginal', file.name)
    formData.append('tipoArquivo', file.type || getFileExtension(file.name))
    
    try {
      setLoading(true)
      setError('')
      
      await uploadInvoice(formData)
      
      setSuccess(true)
      clearSelectedFile()

      setTimeout(() => {
        navigate('/faturas')
      }, 2000)
    } catch (err) {
      console.error('Falha no upload do documento para o backend:', err)
      const apiMessage = err.response?.data?.message || 'Falha de comunicação com o servidor.'
      setError(apiMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload de Fatura</h1>
        <p>Envie documentos para processamento automático via OCR inteligente</p>
        <p className="upload-info">Formatos suportados: PDF, Imagens, Word, Excel, PowerPoint e mais</p>
      </div>

      {success && (
        <div className="alert alert-success" role="alert">
          <CheckCircle size={20} />
          <span>Documento enviado com sucesso! Aguarde o redirecionamento...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form" encType="multipart/form-data">
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="preview-image" onClick={(e) => e.stopPropagation()}>
              <img src={preview} alt="Pré-visualização do documento" />
              <button
                type="button"
                className="btn-remove"
                onClick={clearSelectedFile}
                disabled={loading}
                title="Remover arquivo"
              >
                <X size={16} />
              </button>
            </div>
          ) : file ? (
            <div className="preview-file" onClick={(e) => e.stopPropagation()}>
              <div className="file-icon-large">{getFileIcon(file)}</div>
              <div className="file-info-upload">
                <span className="file-name-large">{file.name}</span>
                <span className="file-type">{getFileTypeDescription(file)}</span>
                <span className="file-size-large">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <button
                type="button"
                className="btn-remove"
                onClick={clearSelectedFile}
                disabled={loading}
                title="Remover arquivo"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={48} className="upload-icon" />
              <h3>Arraste e solte seu arquivo aqui</h3>
              <p>ou clique para explorar os arquivos locais</p>
              <span className="file-types">
                📄 PDF | 🖼️ Imagens | 📝 Word | 📊 Excel | 📑 PowerPoint | 📎 Outros
              </span>
              <span className="file-size-limit">Tamanho máximo: 50MB</span>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            // ✅ REMOVER accept para aceitar todos os tipos
            // accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf,.odt,.ods,.odp"
            className="file-input"
            disabled={loading}
            style={{ display: 'none' }}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn-submit"
            disabled={!file || loading}
          >
            {loading ? 'Processando OCR...' : 'Enviar para Processamento'}
          </button>
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/faturas')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}