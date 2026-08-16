import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.js'
import ProtectedRoute from './ProtectedRoute'

export default function RequireRole({ role, children }) {
  const { isAdmin } = useAuth()

  return (
    <ProtectedRoute>
      {role === 'admin' && !isAdmin ? <Navigate to="/" replace /> : children}
    </ProtectedRoute>
  )
}
