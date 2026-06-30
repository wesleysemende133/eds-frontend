import { Navigate } from 'react-router-dom'
import authStore from '../store/authStore'

export const ProtectedRoute = ({ children }) => {
  const { token } = authStore()

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return children
}
