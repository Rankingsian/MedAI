import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, MessageSquare, Clock, Send, Loader, Brain, Sparkles, TrendingUp, AlertTriangle, User, Bot } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { api } from '../api/client'

export default function ClinicianPatient() {
  const { user } = useAuth()
  const { user_id } = useParams()
  const navigate = useNavigate()

  const [consultations, setConsultations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [notes, setNotes] = useState([])
  const [noteText, setNoteText] = useState('')
  const [aiSummary, setAiSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [generatingSummary, setGeneratingSummary] = useState(false)
  const [patientHistory, setPatientHistory] = useState(null)

  useEffect(() => {
    if (!user_id) return
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/clinician/patient/${user_id}/consultations`)
        setConsultations(data)
        
        // Generate patient history summary
        if (data.length > 0) {
          const totalConsultations = data.length
          const recentConsultation = data[0]
          setPatientHistory({
            totalConsultations,
            lastVisit: recentConsultation.last_updated,
            totalMessages: data.reduce((sum, c) => sum + c.message_count, 0)
          })
        }
      } catch (err) {
        console.error('Failed to load consultations', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user_id])

  const loadConsultation = async (consultation_id) => {
    setSelected(consultation_id)
    setLoadingDetails(true)
    try {
      // Fetch combined consultation data (doc + messages + notes + ai_summary)
      const { data: full } = await api.get(`/consultation/${consultation_id}/full`)

      const msgs = full.messages || []
      const n = full.clinical_notes || []
      const meta = full.consultation || {}

      setMessages(msgs)
      setNotes(n)
      setAiSummary(full.ai_summary || null)
    } catch (err) {
      console.error('Failed to load consultation details', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleGenerateSummary = async () => {
    if (!selected) return
    setGeneratingSummary(true)
    try {
      const { data } = await api.post(`/clinician/consultation/${selected}/summary`, {})
      // backend returns ConsultationSummaryResponse
      setAiSummary({
        summary: data.summary,
        recommendations: data.recommendations,
        confidence: data.confidence,
        generated_at: data.generated_at,
      })
    } catch (err) {
      console.error('Failed to generate AI summary', err)
      alert('Failed to generate AI summary. Please try again.')
    } finally {
      setGeneratingSummary(false)
    }
  }

  const handleAddNote = async () => {
    if (!noteText.trim() || !selected) return
    try {
      await api.post(`/clinician/consultation/${selected}/note?clinician_id=${user.uid}&note=${encodeURIComponent(noteText.trim())}`)
      setNoteText('')
      // refresh notes
      const { data: notesRes } = await api.get(`/clinician/consultation/${selected}/notes`)
      setNotes(notesRes)
    } catch (err) {
      console.error('Failed to add note', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </button>

        {/* Patient Overview Card */}
        {patientHistory && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Patient #{user_id?.substring(0, 12)}</h1>
                <p className="text-gray-600">Complete consultation history and AI insights</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <FileText className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Consultations</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{patientHistory.totalConsultations}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">Total Messages</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{patientHistory.totalMessages}</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-teal-600 mb-1">
                  <Clock className="w-5 h-5" />
                  <span className="text-sm font-medium">Last Visit</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{new Date(patientHistory.lastVisit).toLocaleDateString()}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Consultation History</h2>
            <p className="text-sm text-gray-600 mb-4">Select a consultation to review</p>

            {loading ? (
              <div className="py-8 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
            ) : consultations.length === 0 ? (
              <div className="py-6 text-sm text-gray-600">No consultations found for this patient.</div>
            ) : (
              <div className="mt-4 space-y-3">
                {consultations.map(c => (
                  <button
                    key={c.consultation_id}
                    onClick={() => loadConsultation(c.consultation_id)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors ${selected === c.consultation_id ? 'bg-blue-50 border border-blue-100' : 'border border-gray-100'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-semibold">{c.first_message || 'Consultation'}</div>
                        <div className="text-xs text-gray-500">{new Date(c.last_updated).toLocaleString()}</div>
                      </div>
                      <div className="text-xs text-gray-500">{c.message_count} msgs</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
            {!selected ? (
              <div className="text-center py-20">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Select a consultation to view messages and add notes</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6 text-blue-600" />
                    Conversation
                  </h3>
                </div>
                {loadingDetails ? (
                  <div className="py-8 text-center"><Loader className="w-8 h-8 animate-spin mx-auto text-blue-600" /></div>
                ) : (
                  <div className="space-y-4 mb-6 max-h-96 overflow-auto pr-2">
                    {messages.map((m, idx) => (
                      <div key={idx} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {m.role !== 'user' && (
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                        <div className={`max-w-[75%] ${m.role === 'user' ? 'order-1' : ''}`}>
                          <div className={`rounded-2xl px-4 py-3 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                            <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : ''}
                          </p>
                        </div>
                        {m.role === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    Clinician Notes
                  </h4>
                  <div className="space-y-3 mb-4 max-h-40 overflow-auto">
                    {notes.length === 0 ? (
                      <div className="text-sm text-gray-500">No notes yet for this consultation.</div>
                    ) : (
                      notes.map((n, i) => (
                        <div key={i} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                          <div className="text-sm text-gray-800">{n.note}</div>
                          <div className="text-xs text-gray-400 mt-1">{n.clinician_id} • {n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-3">
                    <input 
                      value={noteText} 
                      onChange={(e) => setNoteText(e.target.value)} 
                      onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                      placeholder="Add a note or feedback" 
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    />
                    <button 
                      onClick={handleAddNote} 
                      className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Add Note
                    </button>
                  </div>
                </div>
                <div className="mt-6 border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Brain className="w-6 h-6 text-indigo-600" />
                      AI Clinical Summary & Recommendations
                    </h4>
                    <button 
                      onClick={handleGenerateSummary} 
                      disabled={generatingSummary}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generatingSummary ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate AI Summary
                        </>
                      )}
                    </button>
                  </div>

                  {aiSummary ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6"
                    >
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-gray-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            Clinical Summary
                          </h5>
                          {aiSummary.confidence && (
                            <span className="text-xs px-3 py-1 bg-white rounded-full font-semibold text-indigo-700">
                              Confidence: {(aiSummary.confidence * 100).toFixed(0)}%
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{aiSummary.summary}</div>
                      </div>
                      {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
                        <div className="border-t border-indigo-200 pt-4">
                          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-600" />
                            Recommended Actions
                          </h5>
                          <ul className="space-y-2">
                            {aiSummary.recommendations.map((r, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {aiSummary.generated_at && (
                        <div className="mt-4 pt-4 border-t border-indigo-200 text-xs text-gray-600">
                          Generated: {new Date(aiSummary.generated_at).toLocaleString()}
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
                      <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600">No AI summary generated yet</p>
                      <p className="text-sm text-gray-500 mt-1">Click the button above to generate AI-powered clinical insights</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
