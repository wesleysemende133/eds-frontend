import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/layout/Navbar/Navbar'
import { ProtectedRoute } from './components/shared/ProtectedRoute'
import { Login } from './pages/Login/Login'
import { Register } from './pages/Register/Register'
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Invoices } from './pages/Invoices/Invoices'
import { InvoiceUpload } from './pages/InvoiceUpload/InvoiceUpload'
import { InvoiceDetail } from './pages/InvoiceDetail/InvoiceDetail'
import {Profile} from './pages/Profile/Profile' // ← CORREÇÃO: SEM as chaves {}
import authStore from './store/authStore'

// ... resto do código

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
