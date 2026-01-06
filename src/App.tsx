import { useEffect } from 'react'
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'

// Pages (to be created)
import Dashboard from './pages/Dashboard'
import History from './pages/History'
import Login from './pages/Login'
import PosterCreator from './pages/PosterCreator'
import Signup from './pages/Signup'
import TemplateSelection from './pages/TemplateSelection'

// Admin
import AdminRoute from './components/admin/AdminRoute'
import AdminLayout from './pages/admin/AdminLayout'
import ContentTypes from './pages/admin/ContentTypes'
import AdminDashboard from './pages/admin/Dashboard'
import TemplateEditor from './pages/admin/TemplateEditor'
import AdminTemplates from './pages/admin/Templates'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function App() {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    initialize()
  }, [])
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/templates/:typeId" element={
          <ProtectedRoute>
            <TemplateSelection />
          </ProtectedRoute>
        } />
        <Route path="/create/:templateId" element={
          <ProtectedRoute>
            <PosterCreator />
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="templates" element={<AdminTemplates />} />
          <Route path="templates/new" element={<TemplateEditor />} />
          <Route path="templates/:id/edit" element={<TemplateEditor />} />
          <Route path="content-types" element={<ContentTypes />} />
          <Route path="stats" element={<AdminDashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
