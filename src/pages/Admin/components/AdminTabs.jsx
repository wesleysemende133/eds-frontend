import React from 'react';

export const AdminTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="admin-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon} {tab.label}
          {tab.badge !== undefined && (
            <span className="tab-badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  );
};
