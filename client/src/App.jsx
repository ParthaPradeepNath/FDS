import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
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
import NotFound from './pages/NotFound'

function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <Footer />
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-[1100] h-16 w-full">
        <GradualBlur className="h-full w-full" />
      </div>
      <Toaster richColors position="top-right" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<SiteLayout />}>
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
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

function NonAdminOnly({ children }) {
  const { isAdmin } = useAuth()
  return isAdmin ? <Navigate to="/admin" replace /> : children
}
