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

  const handleFileSelect = (selectedFile) => {
    setError('')
    setSuccess(false)

    // 1. Validação de Extensão/MIME Type Aceitos pelo OCR do Backend Moçambicano
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Formato inválido. Selecione um documento PDF ou imagem (JPEG/PNG).')
      return
    }

    // 2. Validação Contida ao Limite Máximo Configurado no Spring Boot
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('O tamanho do arquivo excede o limite máximo permitido de 10MB.')
      return
    }

    setFile(selectedFile)

    // Abordagem Sênior: Geração de Preview Performática sem ler em Base64
    if (selectedFile.type.startsWith('image/')) {
      if (preview) URL.revokeObjectURL(preview)
      setPreview(URL.createObjectURL(selectedFile))
    } else {
      setPreview(null) // PDFs usam ícone genérico informacional
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

    // ALINHAMENTO SÊNIOR: A chave DEVE ser 'arquivo' para bater exato com o DTO Java 
    const formData = new FormData()
    formData.append('arquivo', file) 
    
    // Opcional: Se quiser passar a descrição capturada de algum input do formulário:
    // formData.append('descricao', 'Fatura de serviços de infraestrutura tecnológica')

    try {
      setLoading(true)
      setError('')
      
      // Envia o FormData contendo o arquivo mapeado corretamente para a API Java
      await uploadInvoice(formData)
      
      setSuccess(true)
      clearSelectedFile()

      setTimeout(() => {
        navigate('/faturas')
      }, 2000)
    } catch (err) {
      console.error('Falha no upload do documento para o backend:', err)
      
      // Extrai mensagens normatizadas devolvidas pelo RestControllerAdvice do Java
      const apiMessage = err.response?.data?.message || err.friendlyMessage
      setError(apiMessage || 'Falha de comunicação com o servidor de processamento OCR.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload de Fatura</h1>
        <p>Envie documentos para processamento automático via OCR inteligente</p>
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
          ) : file && file.type === 'application/pdf' ? (
            <div className="preview-pdf" onClick={(e) => e.stopPropagation()}>
              <FileText size={48} className="pdf-icon" />
              <span className="pdf-name">{file.name}</span>
              <button
                type="button"
                className="btn-remove"
                onClick={clearSelectedFile}
                disabled={loading}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={48} className="upload-icon" />
              <h3>Arraste e solte seu arquivo aqui</h3>
              <p>ou clique para explorar os arquivos locais</p>
              <span className="file-types">Formatos suportados: PDF, JPEG ou PNG (Max: 10MB)</span>
            </>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png"
            className="file-input"
            disabled={loading}
            style={{ display: 'none' }} // Oculta o input padrão para usar a DropZone estilizada
          />
        </div>

        {file && !preview && file.type !== 'application/pdf' && (
          <div className="file-info">
            <div className="file-details">
              <span className="file-name">{file.name}</span>
              <span className="file-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          </div>
        )}

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