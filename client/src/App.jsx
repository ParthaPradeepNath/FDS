import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { GradualBlur } from './components/ui/gradual-blur'
import ProtectedRoute from './components/ProtectedRoute'
import RequireRole from './components/RequireRole'
import { useAuth } from './context/useAuth'
import Landing from './pages/Landing'
import Login from './pages/Login'
import FeedbackForm from './pages/FeedbackForm'
import MyFeedback from './pages/MyFeedback'
import FeedbackDetails from './pages/FeedbackDetails'
import EditFeedback from './pages/EditFeedback'
import AdminDashboard from './pages/AdminDashboard'
import FeedbackList from './pages/FeedbackList'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-svh flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            <Route
              path="/feedback/new"
              element={
                <ProtectedRoute>
                  <NonAdminOnly>
                    <FeedbackForm />
                  </NonAdminOnly>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-feedback"
              element={
                <ProtectedRoute>
                  <NonAdminOnly>
                    <MyFeedback />
                  </NonAdminOnly>
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/:id"
              element={
                <ProtectedRoute>
                  <FeedbackDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/feedback/:id/edit"
              element={
                <ProtectedRoute>
                  <NonAdminOnly>
                    <EditFeedback />
                  </NonAdminOnly>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <RequireRole role="admin">
                  <AdminDashboard />
                </RequireRole>
              }
            />
            <Route
              path="/admin/feedback"
              element={
                <RequireRole role="admin">
                  <FeedbackList />
                </RequireRole>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <RequireRole role="admin">
                  <Reports />
                </RequireRole>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[1100] h-16 w-full">
          <GradualBlur className="h-full w-full" />
        </div>
        <Toaster richColors position="top-right" />
      </div>
    </BrowserRouter>
  )
}

function NonAdminOnly({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? <Navigate to="/admin" replace /> : children
}

function NotFound() {
  return (
    <div className="mx-auto max-w-md">
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-16 text-center">
        <span className="text-5xl">🧭</span>
        <h1 className="text-xl font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      </div>
    </div>
  )
}
