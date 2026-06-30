import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { Invoices } from './pages/Invoices'
import { InvoiceUpload } from './pages/InvoiceUpload'
import { InvoiceDetail } from './pages/InvoiceDetail'
import { Profile } from './pages/Profile'
import authStore from './store/authStore'

function App() {
  const { token } = authStore()

  return (
    <Router>
      {token && <Navbar />}
      <main>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={token ? <Navigate to="/" replace /> : <Register />}
          />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faturas"
            element={
              <ProtectedRoute>
                <Invoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faturas/upload"
            element={
              <ProtectedRoute>
                <InvoiceUpload />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faturas/:id"
            element={
              <ProtectedRoute>
                <InvoiceDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
