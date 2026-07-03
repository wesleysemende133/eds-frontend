import { Navigate } from 'react-router-dom';
import authStore from '../../store/authStore';

export const ProtectedRoute = ({ children }) => {
  const { token } = authStore();
  
  console.log('🔒 ProtectedRoute - Token:', token ? '✅ Existe' : '❌ Não existe');

  if (!token) {
    console.log('🔒 Redirecionando para login...');
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
