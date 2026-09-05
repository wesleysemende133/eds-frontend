// src/pages/Admin/components/AdminStatusBadge.jsx
import React from 'react';

export const AdminStatusBadge = ({ status, label }) => {
  const statusMap = {
    'AGUARDANDO_APROVACAO': 'pending',
    'APROVADO': 'approved',
    'REJEITADO': 'rejected',
    'PAGO': 'approved',
    'CANCELADO': 'canceled',
    'PENDENTE': 'pending',
    'PROCESSADO': 'approved',
    'Ativa': 'approved',
    'Inativa': 'canceled',
    'approved': 'approved',
    'pending': 'pending',
    'rejected': 'rejected',
    'canceled': 'canceled',
  };
  
  const labels = {
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADO': 'Aprovado',
    'REJEITADO': 'Rejeitado',
    'PAGO': 'Pago',
    'CANCELADO': 'Cancelado',
    'PENDENTE': 'Pendente',
    'PROCESSADO': 'Processado',
    'Ativa': 'Ativa',
    'Inativa': 'Inativa',
    'approved': 'Aprovado',
    'pending': 'Pendente',
    'rejected': 'Rejeitado',
    'canceled': 'Cancelado',
  };

  const variant = statusMap[status] || 'pending';
  const displayLabel = label || labels[status] || status || 'Desconhecido';

  return (
    <span className={`admin-status-badge ${variant}`}>
      <span className="dot" />
      {displayLabel}
    </span>
  );
};

export default AdminStatusBadge;