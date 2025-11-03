import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, userRole } = useAuth()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/" replace />
  }

  return children
}
