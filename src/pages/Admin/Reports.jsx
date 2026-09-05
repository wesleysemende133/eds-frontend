// src/pages/Admin/Reports.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useAdmin } from '../../hooks/useAdmin';
import { useInvoices } from '../../hooks/useInvoices';
import './Admin.css';

export const Reports = ({ metrics }) => {
  const { getUsuarios } = useAdmin();
  const { listarFaturas } = useInvoices();
  
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
  const [periodo, setPeriodo] = useState('ano'); // 'ano' ou 'mes'
  const [usuarios, setUsuarios] = useState([]);
  const [faturas, setFaturas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados adicionais
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const usersData = await getUsuarios();
        setUsuarios(usersData || []);
        
        const invoicesData = await listarFaturas();
        setFaturas(invoicesData || []);
      } catch (err) {
        console.error('Erro ao carregar dados dos relatórios:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Dados do sistema
  const totalUsuarios = metrics?.totalUsuarios || usuarios?.length || 0;
  const totalEmpresas = metrics?.totalEmpresas || 0;
  const totalFaturas = metrics?.totalFaturas || faturas?.length || 0;
  const faturasAprovadas = metrics?.faturasAprovadas || 0;
  const faturasPendentes = metrics?.faturasPendentes || 0;
  const faturasRejeitadas = metrics?.faturasRejeitadas || 0;
  const faturamentoTotal = metrics?.faturamentoTotal || 0;

  // Calcular totais reais
  const totalAprovadas = faturas.filter(f => f.status === 'APROVADO').length;
  const totalPendentes = faturas.filter(f => f.status === 'AGUARDANDO_APROVACAO' || f.status === 'PENDENTE').length;
  const totalRejeitadas = faturas.filter(f => f.status === 'REJEITADO').length;
  const totalPagas = faturas.filter(f => f.status === 'PAGO').length;

  // Faturamento real
  const faturamentoReal = faturas
    .filter(f => f.status === 'APROVADO' || f.status === 'PAGO')
    .reduce((sum, f) => sum + (f.valorTotal || 0), 0);

  // Faturas por mês (dados reais)
  const getFaturasPorMes = () => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const resultado = meses.map((_, index) => {
      const mes = index + 1;
      const faturasMes = faturas.filter(f => {
        if (!f.dataFatura) return false;
        const data = new Date(f.dataFatura);
        return data.getMonth() + 1 === mes && data.getFullYear() === anoSelecionado;
      });
      return {
        mes: meses[index],
        total: faturasMes.length,
        valor: faturasMes.reduce((sum, f) => sum + (f.valorTotal || 0), 0)
      };
    });
    return resultado;
  };

  const faturasPorMes = getFaturasPorMes();
  const maxFaturasMes = Math.max(...faturasPorMes.map(m => m.total), 1);
  const maxValorMes = Math.max(...faturasPorMes.map(m => m.valor), 1);

  // Dados para exportar
  const handleExport = () => {
    const dados = {
      sistema: {
        totalUsuarios,
        totalEmpresas,
        totalFaturas,
        faturasAprovadas: totalAprovadas,
        faturasPendentes: totalPendentes,
        faturasRejeitadas: totalRejeitadas,
        faturamentoTotal: faturamentoReal,
      },
      faturasPorMes: faturasPorMes,
      usuarios: usuarios.map(u => ({
        nome: u.nomeCompleto || u.nome || u.email,
        email: u.email,
        perfil: u.perfil,
        ativo: u.ativo
      }))
    };
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_eds_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-tab-content active">
      <div className="admin-reports-container">
        {/* Header */}
        <div className="admin-reports-header">
          <div className="admin-reports-header-left">
            <BarChart3 size={20} />
            <h3>Relatórios do Sistema</h3>
            <span className="admin-badge">{new Date().getFullYear()}</span>
          </div>
          <div className="admin-reports-actions">
            <div className="period-selector">
              <select 
                className="admin-select"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="ano">Anual</option>
                <option value="mes">Mensal</option>
              </select>
            </div>
            <select 
              className="admin-select"
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(Number(e.target.value))}
            >
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
            </select>
            <Button variant="secondary" onClick={handleExport}>
              <Download size={16} />
              Exportar
            </Button>
          </div>
        </div>

        {/* Resumo Executivo */}
        <div className="admin-reports-summary">
          <div className="summary-card">
            <div className="summary-icon blue">
              <FileText size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{totalFaturas}</span>
              <span className="summary-label">Total Faturas</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon green">
              <CheckCircle size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{totalAprovadas}</span>
              <span className="summary-label">Aprovadas</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon orange">
              <Clock size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{totalPendentes}</span>
              <span className="summary-label">Pendentes</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon red">
              <XCircle size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{totalRejeitadas}</span>
              <span className="summary-label">Rejeitadas</span>
            </div>
          </div>
          <div className="summary-card">
            <div className="summary-icon purple">
              <DollarSign size={20} />
            </div>
            <div className="summary-content">
              <span className="summary-value">{formatarMoeda(faturamentoReal)}</span>
              <span className="summary-label">Faturamento</span>
            </div>
          </div>
        </div>

        {/* Gráfico de Faturas por Mês */}
        <Card className="report-chart-card">
          <div className="report-chart-header">
            <h4>Faturas por Mês - {anoSelecionado}</h4>
            <div className="chart-legend">
              <span><span className="legend-dot blue"></span> Quantidade</span>
              <span><span className="legend-dot green"></span> Valor (MT)</span>
            </div>
          </div>
          <div className="report-chart-body">
            {faturasPorMes.map((item, index) => (
              <div key={index} className="chart-bar-group">
                <div className="chart-bar-container">
                  <div 
                    className="chart-bar quantity"
                    style={{ 
                      height: `${(item.total / maxFaturasMes) * 100}%`,
                      minHeight: item.total > 0 ? '8px' : '0'
                    }}
                  >
                    <span className="chart-bar-value">{item.total}</span>
                  </div>
                  <div 
                    className="chart-bar value"
                    style={{ 
                      height: `${(item.valor / maxValorMes) * 100}%`,
                      minHeight: item.valor > 0 ? '8px' : '0'
                    }}
                  >
                    <span className="chart-bar-value">{formatarMoeda(item.valor)}</span>
                  </div>
                </div>
                <span className="chart-bar-label">{item.mes}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Resumo do Sistema */}
        <div className="admin-reports-grid">
          <Card className="report-card">
            <div className="report-icon blue">
              <Users size={24} />
            </div>
            <div className="report-content">
              <span className="report-value">{totalUsuarios}</span>
              <span className="report-label">Utilizadores</span>
              <span className="report-change up">Ativos: {usuarios.filter(u => u.ativo).length}</span>
            </div>
          </Card>

          <Card className="report-card">
            <div className="report-icon purple">
              <Building size={24} />
            </div>
            <div className="report-content">
              <span className="report-value">{totalEmpresas}</span>
              <span className="report-label">Empresas</span>
              <span className="report-change up">Registadas no sistema</span>
            </div>
          </Card>

          <Card className="report-card">
            <div className="report-icon green">
              <CheckCircle size={24} />
            </div>
            <div className="report-content">
              <span className="report-value">
                {totalFaturas > 0 ? Math.round((totalAprovadas / totalFaturas) * 100) : 0}%
              </span>
              <span className="report-label">Taxa de Aprovação</span>
              <span className="report-change up">
                {totalAprovadas} de {totalFaturas} faturas
              </span>
            </div>
          </Card>

          <Card className="report-card">
            <div className="report-icon orange">
              <DollarSign size={24} />
            </div>
            <div className="report-content">
              <span className="report-value">{formatarMoeda(faturamentoReal)}</span>
              <span className="report-label">Faturamento Total</span>
              <span className="report-change up">
                {faturasAprovadas > 0 ? 'Com faturas aprovadas' : 'Aguardando faturas'}
              </span>
            </div>
          </Card>
        </div>

        {/* Taxa de Conversão */}
        <Card className="report-conversion-card">
          <h4>Taxa de Conversão</h4>
          <div className="conversion-stats">
            <div className="conversion-step">
              <span className="step-label">Total</span>
              <span className="step-value">{totalFaturas}</span>
              <div className="step-bar">
                <div className="step-fill" style={{ width: '100%', background: '#e8edf4' }} />
              </div>
            </div>
            <div className="conversion-step">
              <span className="step-label">Aprovadas</span>
              <span className="step-value">{totalAprovadas}</span>
              <div className="step-bar">
                <div 
                  className="step-fill" 
                  style={{ 
                    width: `${totalFaturas > 0 ? (totalAprovadas / totalFaturas) * 100 : 0}%`,
                    background: '#22c55e'
                  }} 
                />
              </div>
            </div>
            <div className="conversion-step">
              <span className="step-label">Pagas</span>
              <span className="step-value">{totalPagas}</span>
              <div className="step-bar">
                <div 
                  className="step-fill" 
                  style={{ 
                    width: `${totalFaturas > 0 ? (totalPagas / totalFaturas) * 100 : 0}%`,
                    background: '#1a5276'
                  }} 
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

export default Reports;