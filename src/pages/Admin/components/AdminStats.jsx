// src/pages/Admin/components/AdminStats.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AdminStats = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="admin-stats-grid">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        const isUp = stat.changeType === 'up';
        const TrendIcon = isUp ? TrendingUp : TrendingDown;
        const trendClass = isUp ? 'up' : 'down';

        return (
          <div 
            key={index} 
            className="admin-stat-card"
            onClick={stat.onClick}
            style={{ cursor: stat.onClick ? 'pointer' : 'default' }}
          >
            <div className="stat-top">
              <div className="stat-icon">
                {IconComponent && <IconComponent size={22} />}
              </div>
              {stat.change && (
                <span className={`stat-change ${trendClass}`}>
                  <TrendIcon size={12} />
                  {stat.change}
                </span>
              )}
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminStats;