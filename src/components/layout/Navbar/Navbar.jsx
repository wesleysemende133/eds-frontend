// src/components/layout/Navbar/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Home, FileText, Upload } from 'lucide-react';
import authStore from '../../../store/authStore';
import './Navbar.css';

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = authStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📄</span>
          <span className="brand-text">EDS</span>
        </Link>

        {/* Menu Central */}
        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            <Home size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/faturas" className="nav-link">
            <FileText size={18} />
            <span>Faturas</span>
          </Link>
          <Link to="/faturas/upload" className="nav-link">
            <Upload size={18} />
            <span>Upload</span>
          </Link>
        </div>

        {/* Direita - Perfil e Logout */}
        <div className="navbar-right">
          <Link to="/perfil" className="nav-link profile-link">
            <User size={18} />
            <span className="user-name">{user?.nome || 'Perfil'}</span>
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;