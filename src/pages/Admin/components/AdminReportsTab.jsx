import React from 'react';

const formatarMoeda = (valor) => {
  if (!valor) return 'MT 0,00';
  return `MT ${Number(valor).toLocaleString('pt-MZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
};

const getMesLabel = (mesStr) => {
  const meses = {
    '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
    '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
    '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
  };
  const mesNum = mesStr?.split('-')[1];
  return meses[mesNum] || mesStr;
};

export const AdminReportsTab = ({ metrics, anoSelecionado, onAnoChange }) => {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>📊 Relatórios</h3>
        <div className="filters">
          <select value={anoSelecionado} onChange={(e) => onAnoChange(e.target.value)}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>
      <div className="admin-card-body">
        <div className="admin-chart-container">

          {/* Faturas por Mês */}
          <div className="admin-chart-bars">
            <h4>📈 Faturas por Mês</h4>
            {metrics?.faturasPorMes ? (
              (() => {
                const filteredEntries = Object.entries(metrics.faturasPorMes)
                  .filter(([mes]) => mes.startsWith(anoSelecionado));

                if (filteredEntries.length === 0) {
                  return <p className="text-muted">Sem dados para {anoSelecionado}</p>;
                }

                const maxValue = Math.max(...filteredEntries.map(([, count]) => count));

                return filteredEntries.map(([mes, count]) => {
                  const mesLabel = getMesLabel(mes);
                  const percent = maxValue > 0 ? (count / maxValue) * 100 : 0;

                  return (
                    <div key={mes} className="admin-chart-bar-row">
                      <span className="label">{mesLabel}</span>
                      <div className="track">
                        <div
                          className="fill blue"
                          style={{ width: `${Math.max(percent, 5)}%` }}
                        />
                      </div>
                      <span className="value">{count}</span>
                    </div>
                  );
                });
              })()
            ) : (
              <p className="text-muted">Sem dados para exibir</p>
            )}
          </div>

          {/* Resumo */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="admin-card" style={{ marginBottom: 0 }}>
              <div className="admin-card-header" style={{ padding: 'var(--spacing-md)' }}>
                <h4>📈 Resumo Geral</h4>
              </div>
              <div className="admin-card-body" style={{ padding: 'var(--spacing-md)' }}>
                <div className="flex justify-between">
                  <span className="text-muted">Total faturas</span>
                  <span className="font-bold">{metrics?.totalFaturas || 0}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Valor total</span>
                  <span className="font-bold">{formatarMoeda(metrics?.valorTotalFaturas || 0)}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Média por fatura</span>
                  <span className="font-bold">
                    {formatarMoeda(metrics?.totalFaturas > 0
                      ? (metrics.valorTotalFaturas / metrics.totalFaturas)
                      : 0)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Total utilizadores</span>
                  <span className="font-bold">{metrics?.totalUsuarios || 0}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted">Taxa de aprovação</span>
                  <span className="font-bold text-success">
                    {metrics?.totalFaturas > 0
                      ? Math.round(((metrics.faturasPorStatus?.APROVADO || 0) / metrics.totalFaturas) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Distribuição por Status */}
            <div className="admin-card" style={{ marginBottom: 0 }}>
              <div className="admin-card-header" style={{ padding: 'var(--spacing-md)' }}>
                <h4>🏷️ Distribuição por Status</h4>
              </div>
              <div className="admin-card-body" style={{ padding: 'var(--spacing-md)' }}>
                {metrics?.faturasPorStatus && metrics.faturasPorStatus.map((status) => (
                  <div key={status.status} className="flex justify-between mt-1">
                    <span>
                      <span
                        style={{
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: status.cor,
                          marginRight: '8px'
                        }}
                      />
                      {status.status}
                    </span>
                    <span className="font-bold">{status.quantidade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
