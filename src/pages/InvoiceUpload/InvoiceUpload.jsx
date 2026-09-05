// src/pages/InvoiceUpload/InvoiceUpload.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  X, 
  ArrowRight,
  Info,
  AlertTriangle,
  RefreshCw,
  FileWarning,
  Copy,
  Image,
  File,
  FileSpreadsheet,
  FileArchive
} from 'lucide-react';
import { useInvoices } from '../../hooks/useInvoices';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Alert } from '../../components/common/Alert';
import './InvoiceUpload.css';

export const InvoiceUpload = () => {
  const navigate = useNavigate();
  const { uploadInvoice } = useInvoices();
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInput = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const getFileExtension = (filename) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const isImage = (file) => {
    return file.type?.startsWith('image/') || 
           ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'].includes(getFileExtension(file.name));
  };

  const EXTENSOES_PERMITIDAS = [
    'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp',
    'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
    'txt', 'rtf', 'odt', 'ods', 'odp'
  ];

  const handleFileSelect = (selectedFile) => {
    setError('');
    setSuccess(false);
    setErrorDetails(null);

    if (!selectedFile) {
      setError('Nenhum arquivo selecionado.');
      return;
    }

    const extensao = getFileExtension(selectedFile.name);
    if (!extensao || !EXTENSOES_PERMITIDAS.includes(extensao)) {
      setError(`Formato não suportado. Formatos permitidos: ${EXTENSOES_PERMITIDAS.join(', ')}`);
      return;
    }

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(`O arquivo excede o limite máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
      return;
    }

    setFile(selectedFile);

    if (isImage(selectedFile)) {
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const clearSelectedFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
    setErrorDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      setError('');
      setErrorDetails(null);
      
      await uploadInvoice(formData);
      
      setSuccess(true);
      clearSelectedFile();

      setTimeout(() => {
        navigate('/faturas');
      }, 2000);
    } catch (err) {
      console.error('Falha no upload:', err);
      
      const errorMessage = err.response?.data?.message || err.message || '';
      const errorStatus = err.response?.status;
      
      let userMessage = '';
      let userDetails = '';
      let errorIcon = AlertCircle;
      let errorVariant = 'danger';
      let userActions = [];

      if (errorStatus === 409 || 
          errorMessage?.toLowerCase().includes('duplicado') || 
          errorMessage?.toLowerCase().includes('duplicate') ||
          errorMessage?.toLowerCase().includes('already exists') ||
          errorMessage?.toLowerCase().includes('existente')) {
        
        userMessage = 'Esta fatura já existe no sistema';
        userDetails = 'Já existe uma fatura com este arquivo. Verifique a lista de faturas para evitar duplicações.';
        errorIcon = Copy;
        errorVariant = 'warning';
        userActions = [
          { label: 'Ver faturas', action: () => navigate('/faturas'), variant: 'primary' },
          { label: 'Tentar outro arquivo', action: clearSelectedFile, variant: 'secondary' }
        ];
      }
      else if (errorStatus === 400 || 
         errorMessage?.toLowerCase().includes('corrompido') ||
         errorMessage?.toLowerCase().includes('invalid') ||
         errorMessage?.toLowerCase().includes('corrupt')) {
        
        userMessage = 'Não foi possível ler o arquivo';
        userDetails = 'O arquivo parece estar danificado ou num formato que não conseguimos processar. Tente novamente com um arquivo diferente.';
        errorIcon = FileWarning;
        errorVariant = 'warning';
        userActions = [
          { label: 'Tentar novamente', action: clearSelectedFile, variant: 'primary' }
        ];
      }
      else if (errorStatus === 413) {
        userMessage = 'O arquivo é muito grande';
        userDetails = `O tamanho máximo permitido é de 50MB. O arquivo atual excede este limite.`;
        errorIcon = AlertTriangle;
        errorVariant = 'warning';
        userActions = [
          { label: 'Selecionar outro arquivo', action: clearSelectedFile, variant: 'primary' }
        ];
      }
      else if (errorStatus === 415) {
        userMessage = 'Formato não suportado';
        userDetails = `Formatos suportados: ${EXTENSOES_PERMITIDAS.join(', ')}`;
        errorIcon = Info;
        errorVariant = 'warning';
        userActions = [
          { label: 'Selecionar outro arquivo', action: clearSelectedFile, variant: 'primary' }
        ];
      }
      else if (errorStatus === 401 || errorStatus === 403) {
        userMessage = 'Sessão expirada';
        userDetails = 'A sua sessão expirou. Faça login novamente para continuar.';
        errorIcon = AlertCircle;
        errorVariant = 'danger';
        userActions = [
          { label: 'Fazer login', action: () => navigate('/login'), variant: 'primary' }
        ];
      }
      else {
        userMessage = 'Erro ao processar o arquivo';
        userDetails = err.friendlyMessage || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
        errorIcon = AlertCircle;
        errorVariant = 'danger';
        userActions = [
          { label: 'Tentar novamente', action: clearSelectedFile, variant: 'primary' }
        ];
      }

      setError(userMessage);
      setErrorDetails({
        message: userDetails,
        status: errorStatus,
        icon: errorIcon,
        variant: errorVariant,
        actions: userActions
      });
      
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="upload-container">
      {/* HEADER */}
      <div className="upload-header">
        <h1>Nova fatura</h1>
        <p>Envie o documento para processamento automático</p>
        <span className="upload-info">
          {EXTENSOES_PERMITIDAS.length} formatos suportados · até 50MB
        </span>
      </div>

      {/* SUCCESS */}
      {success && (
        <div className="success-box">
          <CheckCircle size={18} />
          Fatura enviada com sucesso!
        </div>
      )}

      {/* ERROR */}
      {error && errorDetails && (
        <div className={`error-box error-${errorDetails.variant}`}>
          <div className="error-icon-wrapper">
            {(() => {
              const Icon = errorDetails.icon;
              return <Icon size={20} />;
            })()}
          </div>
          <div className="error-content">
            <p className="error-title">{error}</p>
            <p className="error-desc">{errorDetails.message}</p>
            {errorDetails.actions && (
              <div className="error-actions">
                {errorDetails.actions.map((action, index) => (
                  <button
                    key={index}
                    className={`error-btn error-btn-${action.variant}`}
                    onClick={action.action}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="error-close"
            onClick={() => { setError(''); setErrorDetails(null); }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="drop-zone-wrapper">
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
                <img src={preview} alt="Pré-visualização" />
                <button
                  type="button"
                  className="btn-remove"
                  onClick={clearSelectedFile}
                  disabled={loading}
                >
                  <X size={16} />
                </button>
              </div>
            ) : file ? (
              <div className="preview-file" onClick={(e) => e.stopPropagation()}>
                <FileText size={40} className="file-icon" />
                <div className="file-info-upload">
                  <span className="file-name-large">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
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
                <div className="upload-icon-wrapper">
                  <Upload size={44} className="upload-icon" />
                </div>
                <h3>Arraste o arquivo aqui</h3>
                <p>ou clique para selecionar</p>
                <div className="formatos">
                  <span>📄 PDF</span>
                  <span>🖼️ Imagem</span>
                  <span>📝 Word</span>
                  <span>📊 Excel</span>
                  <span>📑 PowerPoint</span>
                </div>
                <span className="limite">Máximo 50MB</span>
              </>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              className="file-input"
              disabled={loading}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`btn-submit ${loading ? 'loading' : ''}`}
            disabled={!file || loading}
          >
            {loading ? 'A processar...' : 'Enviar para processamento'}
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            className="btn-cancel-upload"
            onClick={() => navigate('/faturas')}
            disabled={loading}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceUpload;