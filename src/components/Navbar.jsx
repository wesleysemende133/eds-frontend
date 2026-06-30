import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import authStore from '../store/authStore'
import './Navbar.css'

export const Navbar = () => {
  const { user, logout } = authStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📄</span>
          EDS
        </Link>

        {user && (
          <div className="navbar-menu">
            <span className="navbar-user">Olá, {user.nome}</span>
            <Link to="/perfil" className="navbar-link">
              <User size={18} />
              Perfil
            </Link>
            <button onClick={handleLogout} className="navbar-logout">
              <LogOut size={18} />
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
