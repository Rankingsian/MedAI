import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requireRole = null }) {
  const { user, userRole, profileComplete } = useAuth()

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  if (requireRole && userRole !== requireRole) {
    return <Navigate to="/" replace />
  }

  // Redirect clinicians to complete their profile if needed
  if (userRole === 'clinician' && !profileComplete && window.location.pathname !== '/clinician/settings') {
    return <Navigate to="/clinician/settings" replace />
  }

  return children
}
