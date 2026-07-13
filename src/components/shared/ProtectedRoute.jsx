// src/components/shared/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import authStore from '../../store/authStore';

export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { token, user } = authStore();

  // Verificar se está autenticado
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Se houver roles permitidas, verificar se o utilizador tem permissão
  if (allowedRoles.length > 0) {
    const userRole = user?.perfil || user?.role || 'USUARIO';
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return children;
};
