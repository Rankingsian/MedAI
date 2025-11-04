import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Users, MessageSquare, Calendar, Search, 
  LogOut, Stethoscope, TrendingUp, Clock,
  FileText, ArrowRight, AlertTriangle, CheckCircle2, Loader2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function ClinicianDashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [requestsLoading, setRequestsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [clinicianProfile, setClinicianProfile] = useState(null)
  const [requests, setRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('pending')
  const [actionMessage, setActionMessage] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        navigate('/clinician/auth')
        return
      }

      try {
        setLoading(true)
        
        // Fetch clinician profile
        const profileResponse = await api.get(`/clinician/profile/${user.uid}`)
        setClinicianProfile(profileResponse.data)

        // Fetch patients list
        const patientsResponse = await api.get(`/clinician/patients?clinician_id=${user.uid}`)
        setPatients(patientsResponse.data)

        // Fetch consultation requests
        await fetchRequests(profileResponse.data?.uid || user.uid, statusFilter)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        if (err.response?.status === 404) {
          // Not a clinician, redirect to auth
          navigate('/clinician/auth')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, navigate])

  const handleLogout = async () => {
    await logout()
    navigate('/clinician/auth')
  }

  const filteredPatients = patients.filter(patient => 
    patient.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.last_message?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchRequests = async (clinicianId = user?.uid, status = statusFilter) => {
    if (!clinicianId) return
    try {
      setRequestsLoading(true)
      const params = new URLSearchParams()
      if (status && status !== 'all') params.append('status', status)
      const { data } = await api.get(`/consultation/requests?clinician_id=${clinicianId}${params.toString() ? `&${params.toString()}` : ''}`)
      setRequests(data)
    } catch (err) {
      console.error('Failed to fetch consultation requests:', err)
    } finally {
      setRequestsLoading(false)
    }
  }

  const handleAssign = async (requestId) => {
    if (!user) return
    try {
      setActionMessage('')
      await api.post(`/consultation/request/${requestId}/assign?clinician_id=${user.uid}`)
      setActionMessage('Consultation request assigned to you.')
      fetchRequests(user.uid)
    } catch (err) {
      console.error('Failed to assign request:', err)
      setActionMessage(err.response?.data?.detail || 'Failed to assign request.')
    }
  }

  const handleStatusUpdate = async (requestId, status) => {
    try {
      setActionMessage('')
      await api.post(`/consultation/request/${requestId}/status`, {
        status,
        clinician_id: user?.uid
      })
      setActionMessage(`Request marked as ${status.replace('_', ' ')}.`)
      fetchRequests(user?.uid)
    } catch (err) {
      console.error('Failed to update status:', err)
      setActionMessage(err.response?.data?.detail || 'Failed to update status.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Clinician Portal</h1>
              <p className="text-sm text-gray-600">
                {clinicianProfile?.name || user?.email}
                {clinicianProfile?.specialization && ` • ${clinicianProfile.specialization}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{patients.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Consultations</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {patients.reduce((sum, p) => sum + p.total_consultations, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {clinicianProfile?.status === 'approved' ? (
                    <span className="text-green-600">✓ Approved</span>
                  ) : clinicianProfile?.status === 'pending' ? (
                    <span className="text-amber-600">⏳ Pending</span>
                  ) : (
                    <span className="text-gray-600">Unknown</span>
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Patients List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Patient List</h2>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No patients found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <Link
                  key={patient.user_id}
                  to={`/clinician/patient/${patient.user_id}`}
                  className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Patient #{patient.user_id.substring(0, 8)}</p>
                          <p className="text-sm text-gray-500">
                            {patient.total_consultations} consultation{patient.total_consultations !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {patient.last_message && (
                        <p className="text-sm text-gray-600 ml-12">
                          Last message: "{patient.last_message.substring(0, 80)}{patient.last_message.length > 80 ? '...' : ''}"
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2 ml-12 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(patient.last_consultation).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>

        {/* Consultation Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Consultation Requests
              </h2>
              <p className="text-sm text-gray-500">Manage patient requests for real doctor consultations.</p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  fetchRequests(user?.uid, e.target.value)
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
              <button
                onClick={() => fetchRequests(user?.uid, statusFilter)}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>

          {actionMessage && (
            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
              {actionMessage}
            </div>
          )}

          {requestsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">No consultation requests found {statusFilter !== 'all' ? `with status "${statusFilter}"` : ''}.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const isAssignedToMe = request.clinician_id === user?.uid
                return (
                  <div key={request.request_id} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-blue-100 text-blue-700">
                            Patient #{request.user_id.substring(0, 8)}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                            statusColors[request.status] || 'bg-gray-100 text-gray-600'
                          }`}>
                            {request.status.replace('_', ' ')}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold capitalize bg-amber-100 text-amber-700">
                            Urgency: {request.urgency}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.summary}</h3>
                        {request.details && (
                          <p className="text-sm text-gray-600 mt-2">
                            {request.details}
                          </p>
                        )}
                        <div className="text-xs text-gray-500 mt-3">
                          Submitted {new Date(request.created_at).toLocaleString()}
                          {request.clinician_id && (
                            <span className="ml-3 text-emerald-600 text-xs font-semibold">
                              Assigned to you
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        {request.status === 'pending' && !request.clinician_id && (
                          <button
                            onClick={() => handleAssign(request.request_id)}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
                          >
                            Accept Request
                          </button>
                        )}
                        {isAssignedToMe && request.status === 'assigned' && (
                          <button
                            onClick={() => handleStatusUpdate(request.request_id, 'in_progress')}
                            className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
                          >
                            Start Consultation
                          </button>
                        )}
                        {isAssignedToMe && request.status === 'in_progress' && (
                          <button
                            onClick={() => handleStatusUpdate(request.request_id, 'completed')}
                            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Completed
                          </button>
                        )}
                        <Link
                          to={request.consultation_id ? `/clinician/patient/${request.user_id}` : `/clinician/patient/${request.user_id}`}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          View Patient History
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
