import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, FileText, X, ArrowRight } from 'lucide-react';
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
      
      await uploadInvoice(formData);
      
      setSuccess(true);
      clearSelectedFile();

      setTimeout(() => {
        navigate('/faturas');
      }, 2000);
    } catch (err) {
      console.error('Falha no upload:', err);
      setError(err.friendlyMessage || 'Falha de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Upload de Fatura</h1>
        <p>Envie documentos para processamento automático via OCR inteligente</p>
        <p className="upload-info">Formatos suportados: PDF, DOCX, XLSX, PPTX, imagens e mais</p>
      </div>

      {success && (
        <Alert variant="success">
          <CheckCircle size={18} />
          Documento enviado com sucesso! Redirecionando...
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          <AlertCircle size={18} />
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="upload-form" encType="multipart/form-data">
        <Card className="drop-zone-card">
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
                <div className="file-icon-large">
                  <FileText size={48} />
                </div>
                <div className="file-info-upload">
                  <span className="file-name-large">{file.name}</span>
                  <span className="file-type">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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
              className="file-input"
              disabled={loading}
              style={{ display: 'none' }}
            />
          </div>
        </Card>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            disabled={!file || loading}
          >
            {loading ? 'Processando OCR...' : 'Enviar para Processamento'}
            <ArrowRight size={18} />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() => navigate('/faturas')}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceUpload;
