// src/pages/Admin/Settings.jsx
import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw,
  Globe,
  Clock,
  Upload,
  DollarSign,
  Mail,
  Building
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const Settings = () => {
  const [settings, setSettings] = useState({
    empresa: 'Enterprise Document System',
    emailSuporte: 'suporte@eds.co.mz',
    timeout: 30,
    maxUpload: 10,
    taxaIva: 16,
    moeda: 'MZN'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Configurações salvas:', settings);
    alert('Configurações salvas com sucesso!');
  };

  const handleReset = () => {
    setSettings({
      empresa: 'Enterprise Document System',
      emailSuporte: 'suporte@eds.co.mz',
      timeout: 30,
      maxUpload: 10,
      taxaIva: 16,
      moeda: 'MZN'
    });
  };

  return (
    <div className="admin-tab-content active">
      <Card className="admin-card">
        <div className="admin-card-header">
          <h3>
            <SettingsIcon size={18} />
            Configurações do Sistema
          </h3>
        </div>
        <div className="admin-card-body">
          <div className="admin-settings-grid">
            <div className="form-group">
              <label htmlFor="empresa">
                <Building size={16} />
                Nome da Empresa
              </label>
              <input
                id="empresa"
                name="empresa"
                type="text"
                value={settings.empresa}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="emailSuporte">
                <Mail size={16} />
                Email de Suporte
              </label>
              <input
                id="emailSuporte"
                name="emailSuporte"
                type="email"
                value={settings.emailSuporte}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="timeout">
                <Clock size={16} />
                Timeout de Sessão (minutos)
              </label>
              <input
                id="timeout"
                name="timeout"
                type="number"
                value={settings.timeout}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="maxUpload">
                <Upload size={16} />
                Máximo de Upload (MB)
              </label>
              <input
                id="maxUpload"
                name="maxUpload"
                type="number"
                value={settings.maxUpload}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="taxaIva">
                <DollarSign size={16} />
                Taxa de IVA Padrão (%)
              </label>
              <input
                id="taxaIva"
                name="taxaIva"
                type="number"
                value={settings.taxaIva}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="moeda">
                <Globe size={16} />
                Moeda
              </label>
              <select
                id="moeda"
                name="moeda"
                value={settings.moeda}
                onChange={handleChange}
              >
                <option value="MZN">MZN - Metical</option>
                <option value="USD">USD - Dólar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="ZAR">ZAR - Rand</option>
              </select>
            </div>
          </div>

          <div className="admin-settings-actions">
            <Button variant="primary" onClick={handleSave}>
              <Save size={18} />
              Salvar Configurações
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              <RotateCcw size={18} />
              Restaurar Padrão
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;