import React from 'react';
import './Table.css';

export const Table = ({
  columns,
  data,
  onRowClick,
  className = '',
  ...props
}) => {
  return (
    <div className="table-wrapper">
      <table className={`table ${className}`} {...props}>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className={col.className}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                Nenhum dado encontrado
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'table-row-clickable' : ''}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={col.className}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
