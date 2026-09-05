// src/pages/Admin/components/AdminTable.jsx
import React from 'react';

export const AdminTable = ({ columns, data, loading, emptyMessage = 'Nenhum dado encontrado.' }) => {
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="admin-empty-state">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <table className="admin-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={item.id || index}>
            {columns.map((col) => (
              <td key={`${item.id || index}-${col.key}`}>
                {col.render ? col.render(item) : item[col.key] || '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminTable;