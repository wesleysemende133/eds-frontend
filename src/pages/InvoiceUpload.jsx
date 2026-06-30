import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, AlertCircle, CheckCircle } from 'lucide-react'
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

    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      handleFileSelect(droppedFile)
    }
  }

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile) {
      handleFileSelect(selectedFile)
    }
  }

  const handleFileSelect = (selectedFile) => {
    setError('')
    setSuccess(false)

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Por favor, selecione um arquivo PDF ou imagem (JPEG/PNG)')
      return
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 10MB')
      return
    }

    setFile(selectedFile)

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target.result)
      }
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Selecione um arquivo')
      return
    }

    try {
      setLoading(true)
      setError('')
      await uploadInvoice(file)
      setSuccess(true)
      setFile(null)
      setPreview(null)

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/faturas')
      }, 2000)
    } catch (err) {
      console.error('[v0] Upload error:', err)
      const message = err.response?.data?.message || 'Erro ao fazer upload'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload de Fatura</h1>
        <p>Envie documentos em PDF ou imagem</p>
      </div>

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>Fatura enviada com sucesso! Redirecionando...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div
          className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {preview ? (
            <div className="preview-image">
              <img src={preview} alt="Preview" />
              <button
                type="button"
                className="btn-remove"
                onClick={() => {
                  setFile(null)
                  setPreview(null)
                }}
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <Upload size={48} className="upload-icon" />
              <h3>Arraste o arquivo aqui</h3>
              <p>ou clique para selecionar</p>
              <span className="file-types">PDF, JPEG ou PNG (máx. 10MB)</span>
            </>
          )}

          <input
            type="file"
            onChange={handleFileInput}
            accept=".pdf,.jpg,.jpeg,.png"
            className="file-input"
            disabled={loading}
          />
        </div>

        {file && (
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
            {loading ? 'Enviando...' : 'Enviar Fatura'}
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
