import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../../../hooks/useAdmin';
import { useInvoices } from '../../../hooks/useInvoices';

export const useAdminData = () => {
  const { getDashboardMetrics, getUsuarios } = useAdmin();
  const { getInvoices } = useInvoices();

  const [metrics, setMetrics] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsData, invoicesData, usersData] = await Promise.all([
        getDashboardMetrics(),
        getInvoices(),
        getUsuarios()
      ]);
      setMetrics(metricsData);
      setInvoices(Array.isArray(invoicesData) ? invoicesData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (err) {
      setError('Erro ao carregar dados do admin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getDashboardMetrics, getInvoices, getUsuarios]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = fetchData;

  return { metrics, invoices, users, loading, error, refresh };
};
