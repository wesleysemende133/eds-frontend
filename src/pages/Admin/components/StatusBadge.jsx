import React from 'react';

export const StatusBadge = ({ status }) => {
  const statusMap = {
    'AGUARDANDO_APROVACAO': 'pending',
    'APROVADO': 'approved',
    'REJEITADO': 'rejected',
    'PAGO': 'efetivado',
    'CANCELADO': 'canceled',
    'PENDENTE': 'pending',
    'PROCESSADO': 'approved',
  };
  
  const labels = {
    'AGUARDANDO_APROVACAO': 'Aguardando Aprovação',
    'APROVADO': 'Aprovado',
    'REJEITADO': 'Rejeitado',
    'PAGO': 'Pago',
    'CANCELADO': 'Cancelado',
    'PENDENTE': 'Pendente',
    'PROCESSADO': 'Processado',
  };
  
  return (
    <span className={`admin-status-badge ${statusMap[status] || 'pending'}`}>
      <span className="dot" />
      {labels[status] || status}
    </span>
  );
};
