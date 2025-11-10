import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageSquare, FileText, Calendar, ArrowRight, ArrowLeft, Clock, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function History() {
  const { user } = useAuth()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const { data } = await api.get(`/history/${user.uid}`)
        setConsultations(data)
      } catch (err) {
        console.error('Failed to fetch history:', err)
        setError('Failed to load consultation history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Consultation History</h1>
            <p className="text-gray-600">Review your past consultations and lab analyses</p>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Loader className="w-12 h-12 text-blue-600 mx-auto animate-spin mb-4" />
              <p className="text-gray-600">Loading your consultation history...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading History</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : consultations.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No History Yet</h3>
              <p className="text-gray-600 mb-6">Start your first consultation to see it here</p>
              <Link
                to="/triage"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {consultations.map((consultation, index) => (
                <motion.div
                  key={consultation.consultation_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-100">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {consultation.first_message 
                            ? consultation.first_message.substring(0, 60) + (consultation.first_message.length > 60 ? '...' : '')
                            : 'Medical Consultation'}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(consultation.last_updated).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            consultation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {consultation.message_count} messages
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            consultation.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {consultation.status === 'completed' ? 'Completed' : 'Active'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link
                      to={`/consultation/${consultation.consultation_id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
