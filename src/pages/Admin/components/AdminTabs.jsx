// src/pages/Admin/components/AdminTabs.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminTabs = ({ tabs, activeTab }) => {
  const navigate = useNavigate();

  const handleTabClick = (tab) => {
    if (tab.path) {
      navigate(tab.path);
    }
  };

  return (
    <div className="admin-tabs">
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        const isActive = activeTab === tab.id || activeTab === tab.path;

        return (
          <button
            key={tab.id}
            className={`admin-tab ${isActive ? 'active' : ''}`}
            onClick={() => handleTabClick(tab)}
          >
            {IconComponent && <IconComponent size={18} />}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="tab-badge">{tab.badge}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default AdminTabs;