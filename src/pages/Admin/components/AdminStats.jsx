import React from 'react';

export const AdminStats = ({ stats }) => {
  if (!stats || stats.length === 0) return null;

  return (
    <div className="admin-stats-grid">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="admin-stat-card"
          onClick={stat.onClick}
          style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
        >
          <div className="stat-top">
            <div className="stat-icon">{stat.icon}</div>
            {stat.change && (
              <span className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </span>
            )}
          </div>
          <div className="stat-value">{stat.value}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
};
