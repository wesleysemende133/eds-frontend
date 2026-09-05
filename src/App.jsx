import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar/Navbar';
import { ProtectedRoute } from './components/shared/ProtectedRoute';
import { Login } from './pages/Login/Login';
import { Register } from './pages/Register/Register';
import { RegisterEmpresa } from './pages/Register/RegisterEmpresa';  // ✅ IMPORTAR
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Invoices } from './pages/Invoices/Invoices';
import { InvoiceUpload } from './pages/InvoiceUpload/InvoiceUpload';
import { InvoiceDetail } from './pages/InvoiceDetail/InvoiceDetail';
import { Profile } from './pages/Profile/Profile';
import Admin from './pages/Admin/Admin';
import authStore from './store/authStore';

function App() {
  const { token } = authStore();

  return (
    <Router>
      {token && <Navbar />}
      <main>
        <Routes>
          {/* ============================================================
              ROTAS PÚBLICAS
          ============================================================ */}
          <Route
            path="/login"
            element={token ? <Navigate to="/" replace /> : <Login />}
          />

          {/* ✅ REGISTO DE UTILIZADOR COMUM */}
          <Route
            path="/registrar"
            element={token ? <Navigate to="/" replace /> : <Register />}
          />

          {/* ✅ REGISTO DE EMPRESA (NOVO) */}
          <Route
            path="/registrar-empresa"
            element={token ? <Navigate to="/" replace /> : <RegisterEmpresa />}
          />

          {/* ============================================================
              ROTAS PROTEGIDAS
          ============================================================ */}
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

          {/* Rota Admin - Protegida com permissão ADMIN */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;