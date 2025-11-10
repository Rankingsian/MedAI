import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, MessageSquare, Calendar, Clock, User, Bot, 
  FileText, Loader, AlertCircle, CheckCircle2, Download 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function ConsultationDetail() {
  const { consultation_id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [consultation, setConsultation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchConsultationDetail = async () => {
      if (!user || !consultation_id) return
      
      try {
        setLoading(true)
        
        // Fetch consultation metadata
        const metadataResponse = await api.get(`/history/${user.uid}`)
        const consultationMeta = metadataResponse.data.find(
          c => c.consultation_id === consultation_id
        )
        
        if (!consultationMeta) {
          setError('Consultation not found')
          return
        }
        
        setConsultation(consultationMeta)
        
        // Fetch messages
        const messagesResponse = await api.get(`/consultation/${consultation_id}`)
        setMessages(messagesResponse.data)
      } catch (err) {
        console.error('Failed to fetch consultation:', err)
        setError('Failed to load consultation details')
      } finally {
        setLoading(false)
      }
    }

    fetchConsultationDetail()
  }, [user, consultation_id])

  const exportConsultation = () => {
    const content = messages.map(msg => 
      `[${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A'}] ${msg.role.toUpperCase()}: ${msg.content}`
    ).join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `consultation_${consultation_id}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 mx-auto animate-spin mb-4" />
          <p className="text-gray-600">Loading consultation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/history" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to History
          </Link>
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
        <Link to="/history" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to History
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {consultation?.first_message 
                    ? consultation.first_message.substring(0, 80) + (consultation.first_message.length > 80 ? '...' : '')
                    : 'Medical Consultation'}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {consultation?.last_updated && new Date(consultation.last_updated).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    {consultation?.message_count || messages.length} messages
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    consultation?.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {consultation?.status === 'completed' ? 'Completed' : 'Active'}
                  </span>
                </div>
              </div>
              <button
                onClick={exportConsultation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-blue-600" />
              Conversation History
            </h2>
            
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No messages found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role !== 'user' && (
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-blue-600" />
                      </div>
                    )}
                    
                    <div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                        {message.confidence !== undefined && message.confidence !== null && (
                          <div className="mt-2 pt-2 border-t border-gray-300/30 flex items-center gap-2 text-xs opacity-75">
                            <CheckCircle2 className="w-3 h-3" />
                            Confidence: {(message.confidence * 100).toFixed(0)}%
                            {message.model && ` • ${message.model}`}
                          </div>
                        )}
                      </div>
                      {message.timestamp && (
                        <p className={`text-xs text-gray-500 mt-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      )}
                    </div>
                    
                    {message.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-purple-600" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={() => navigate('/triage')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start New Consultation
            </button>
            <button
              onClick={() => navigate('/request-doctor')}
              className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors"
            >
              Request Doctor Review
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
