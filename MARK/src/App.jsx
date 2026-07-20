import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LoginPage, SignupPage } from './pages/Auth'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './ProtectedRoute'

// Preserves query params (e.g. ?url=... from Web Share Target) during root redirect
const RootRedirect = () => {
  const location = useLocation()
  return <Navigate to={`/dashboard${location.search}`} replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Root — redirect to dashboard, preserving any share intent query params */}
          <Route path="/" element={<RootRedirect />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
