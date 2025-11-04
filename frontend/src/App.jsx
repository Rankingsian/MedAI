import React, { Suspense, lazy } from 'react'
import { Routes, Route, Link, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
const Home = lazy(() => import('./pages/Home.jsx'))
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import ClinicianSettings from './pages/ClinicianSettings.jsx'
import Triage from './pages/Triage.jsx'
import Chat from './pages/Chat.jsx'
import Upload from './pages/Upload.jsx'
import History from './pages/History.jsx'
import DoctorDashboard from './pages/DoctorDashboard.jsx'
const ClinicianPortal = lazy(() => import('./pages/ClinicianPortal.jsx'))
const ClinicianDashboard = lazy(() => import('./pages/ClinicianDashboard.jsx'))
const ClinicianPatient = lazy(() => import('./pages/ClinicianPatient.jsx'))
import RequestConsultation from './pages/RequestConsultation.jsx'
import FAQ from './pages/FAQ.jsx'
import Privacy from './pages/Privacy.jsx'
import Disclaimer from './pages/Disclaimer.jsx'

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/home" element={<Navigate to="/dashboard" replace />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/triage" element={<ProtectedRoute><Triage /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute requireRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/request-doctor" element={<ProtectedRoute><RequestConsultation /></ProtectedRoute>} />
          <Route path="/clinician" element={<Suspense fallback={<div>Loading...</div>}><ClinicianPortal /></Suspense>} />
          <Route
            path="/clinician/dashboard"
            element={
              <ProtectedRoute requireRole="clinician">
                <Suspense fallback={<div>Loading clinician dashboard...</div>}>
                  <ClinicianDashboard />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clinician/patient/:user_id"
            element={
              <ProtectedRoute requireRole="clinician">
                <Suspense fallback={<div>Loading patient...</div>}>
                  <ClinicianPatient />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route path="/clinician/settings" element={<ProtectedRoute requireRole="clinician"><ClinicianSettings /></ProtectedRoute>} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
        </Routes>
      </Suspense>

      {/* Global Footer for non-landing pages */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <Link to="/home" className="text-xl font-bold mb-4 block">MedAI</Link>
              <p className="text-gray-400 text-sm">
                Your trusted AI health companion with professional medical oversight.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link to="/triage" className="block text-gray-400 hover:text-white">Start Consultation</Link>
                <Link to="/upload" className="block text-gray-400 hover:text-white">Lab Analysis</Link>
                <Link to="/history" className="block text-gray-400 hover:text-white">History</Link>
                <Link to="/request-doctor" className="block text-gray-400 hover:text-white">Consult a Doctor</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link to="/faq" className="block text-gray-400 hover:text-white">FAQ</Link>
                <Link to="/privacy" className="block text-gray-400 hover:text-white">Privacy Policy</Link>
                <Link to="/disclaimer" className="block text-gray-400 hover:text-white">Disclaimer</Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Professionals</h4>
              <div className="space-y-2 text-sm">
                <Link to="/doctor" className="block text-gray-400 hover:text-white">Doctor Dashboard</Link>
                {/* Clinician portal is accessible via /clinician (no public link shown) */}
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MedAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
