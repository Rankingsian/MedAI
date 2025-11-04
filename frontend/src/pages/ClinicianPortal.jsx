import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ClinicianAuth from './ClinicianAuth.jsx'

export default function ClinicianPortal() {
  const { userRole, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user && userRole === 'clinician') {
      navigate('/clinician/dashboard', { replace: true })
    }
  }, [user, userRole, navigate])

  return <ClinicianAuth />
}
