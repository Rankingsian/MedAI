import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Stethoscope, MessageSquare, AlertTriangle, Send, ArrowLeft, Loader, Video } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'
import { videoCallApi } from '../api/videoCallApi'

const urgencyOptions = [
  { value: 'low', label: 'Low (routine follow-up)' },
  { value: 'medium', label: 'Medium (needs attention soon)' },
  { value: 'high', label: 'High (urgent medical concern)' }
]

const statusColors = {
  pending: 'bg-amber-100 text-amber-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600'
}

export default function RequestConsultation() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({
    summary: '',
    details: '',
    urgency: 'medium'
  })
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingRequests, setLoadingRequests] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [videoCallsMap, setVideoCallsMap] = useState({})

  const fetchRequests = async () => {
    if (!user) return
    try {
      setLoadingRequests(true)
      const { data } = await api.get(`/consultation/request/user/${user.uid}`)
      setRequests(data)
      
      // Fetch video calls for assigned/in_progress requests
      const videoCallsData = {}
      for (const request of data) {
        if (request.status === 'assigned' || request.status === 'in_progress') {
          try {
            const videoCall = await videoCallApi.getVideoCallByRequest(request.request_id)
            if (videoCall) {
              videoCallsData[request.request_id] = videoCall
            }
          } catch (err) {
            console.log('No video call for request:', request.request_id)
          }
        }
      }
      setVideoCallsMap(videoCallsData)
    } catch (err) {
      console.error('Failed to load requests:', err)
      setError('Failed to load your consultation requests. Please try again later.')
    } finally {
      setLoadingRequests(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      setError('Please sign in to request a consultation.')
      return
    }

    if (!form.summary.trim()) {
      setError('Please describe your concern.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSuccess('')

      await api.post('/consultation/request', {
        user_id: user.uid,
        summary: form.summary.trim(),
        details: form.details.trim() || undefined,
        urgency: form.urgency
      })

      setSuccess('Consultation request submitted! A clinician will review it shortly.')
      setForm({ summary: '', details: '', urgency: 'medium' })
      fetchRequests()
    } catch (err) {
      console.error('Failed to submit request:', err)
      setError(err.response?.data?.detail || 'Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-7 h-7 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Consult a Doctor</h1>
                <p className="text-gray-600 text-sm">
                  Submit a request to speak with a licensed healthcare professional.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700 text-sm">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary concern <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="summary"
                  value={form.summary}
                  onChange={handleChange}
                  placeholder="e.g., Ongoing chest discomfort when exercising"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  maxLength={160}
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Up to 160 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  name="details"
                  value={form.details}
                  onChange={handleChange}
                  placeholder="Add any relevant history, medications, or questions for the doctor"
                  rows={4}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  maxLength={1000}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Urgency level
                </label>
                <div className="grid sm:grid-cols-3 gap-3">
                  {urgencyOptions.map((option) => {
                    const selected = form.urgency === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleChange({ target: { name: 'urgency', value: option.value } })}
                        className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                          selected
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className={`w-4 h-4 ${selected ? 'text-blue-600' : 'text-gray-400'}`} />
                          <span className="text-sm font-semibold capitalize">{option.value}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">{option.label}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Request
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Requests Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 lg:h-full"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Your Requests
            </h2>

            {loadingRequests ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600">
                  No consultation requests yet. Submit your first request using the form.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => {
                  const videoCall = videoCallsMap[request.request_id]
                  return (
                    <div key={request.request_id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{request.summary}</p>
                          {request.details && (
                            <p className="text-sm text-gray-600 mt-1">
                              {request.details.length > 120
                                ? `${request.details.substring(0, 120)}...`
                                : request.details}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[request.status] || 'bg-gray-100 text-gray-600'}`}>
                          {request.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="mt-3 text-xs text-gray-500 flex items-center justify-between">
                        <span>
                          Submitted {new Date(request.created_at).toLocaleString()}
                        </span>
                        <span className="capitalize">Urgency: {request.urgency}</span>
                      </div>
                      
                      {/* Video Call Button */}
                      {videoCall && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => navigate(`/video-call/${videoCall.call_id}?role=patient`)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                          >
                            <Video className="w-4 h-4" />
                            {videoCall.status === 'scheduled' ? 'Join Video Call' : 'Rejoin Call'}
                          </button>
                          {videoCall.scheduled_time && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              Scheduled: {new Date(videoCall.scheduled_time).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
