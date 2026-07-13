import React from 'react';

const StatsCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    gray: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[color] || colors.gray}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-sm mt-1 opacity-75">{title}</p>
    </div>
  );
};

export default StatsCard;
