import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/axios';

// Componentes
import StatsCard from '../../components/admin/StatsCard';
import StatusChart from '../../components/admin/StatusChart';
import RecentActivity from '../../components/admin/RecentActivity';
import UserList from '../../components/admin/UserList';

const Dashboard = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get('/admin/dashboard/metricas');
        setMetrics(response.data);
      } catch (error) {
        console.error('Erro ao carregar métricas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard Administrativo</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard 
          title="Total Faturas" 
          value={metrics?.totalFaturas || 0}
          icon="📄"
          color="blue"
        />
        <StatsCard 
          title="Pendentes" 
          value={metrics?.faturasPendentes || 0}
          icon="⏳"
          color="yellow"
        />
        <StatsCard 
          title="Aprovadas" 
          value={metrics?.faturasAprovadas || 0}
          icon="✅"
          color="green"
        />
        <StatsCard 
          title="Pagas" 
          value={metrics?.faturasPagas || 0}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Valores */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatsCard 
          title="Valor Total" 
          value={`MT ${metrics?.valorTotalFaturas?.toFixed(2) || '0.00'}`}
          icon="💵"
          color="gray"
        />
        <StatsCard 
          title="Valor Pago" 
          value={`MT ${metrics?.valorTotalPago?.toFixed(2) || '0.00'}`}
          icon="✅"
          color="green"
        />
        <StatsCard 
          title="Valor Pendente" 
          value={`MT ${metrics?.valorTotalPendente?.toFixed(2) || '0.00'}`}
          icon="⏳"
          color="red"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusChart data={metrics?.faturasPorStatus} />
        <RecentActivity activities={metrics?.atividadesRecentes} />
      </div>

      {/* Lista de Usuários */}
      <div className="mt-6">
        <UserList />
      </div>
    </div>
  );
};

export default Dashboard;
