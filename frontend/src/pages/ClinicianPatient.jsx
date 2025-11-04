import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, FileText, MessageSquare, Clock, Send, Loader } from 'lucide-react'
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

  useEffect(() => {
    if (!user_id) return
    const load = async () => {
      setLoading(true)
      try {
        const { data } = await api.get(`/clinician/patient/${user_id}/consultations`)
        setConsultations(data)
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 bg-white rounded-xl p-4 shadow">
            <h2 className="text-lg font-semibold">Patient #{user_id?.substring(0,8)}</h2>
            <p className="text-sm text-gray-500">Consultation history</p>

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

          <div className="md:col-span-2 bg-white rounded-xl p-6 shadow">
            {!selected ? (
              <div className="text-center py-12 text-gray-600">Select a consultation to view messages and add notes.</div>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-4">Conversation</h3>
                {loadingDetails ? (
                  <div className="py-8 text-center"><Loader className="w-6 h-6 animate-spin mx-auto text-blue-600" /></div>
                ) : (
                  <div className="space-y-3 mb-6 max-h-96 overflow-auto">
                    {messages.map((m, idx) => (
                      <div key={idx} className={`p-3 rounded ${m.role === 'user' ? 'bg-gray-100 self-start' : 'bg-blue-50 self-end'}`}>
                        <div className="text-sm text-gray-800">{m.content}</div>
                        <div className="text-xs text-gray-400 mt-1">{m.role} • {m.timestamp ? new Date(m.timestamp).toLocaleString() : ''}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Clinician Notes</h4>
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
                    <input value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note or feedback" className="flex-1 border border-gray-200 rounded-lg px-3 py-2" />
                    <button onClick={handleAddNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add Note</button>
                  </div>
                </div>
                <div className="mt-4 border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">AI Summary & Recommendations</h4>
                    <div className="flex items-center gap-2">
                      <button onClick={handleGenerateSummary} className="px-3 py-1 bg-indigo-600 text-white rounded-md">Generate Summary</button>
                    </div>
                  </div>

                  {aiSummary ? (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4">
                      <div className="text-sm text-gray-800 mb-2">
                        <strong>Summary:</strong>
                        <div className="mt-1 whitespace-pre-wrap">{aiSummary.summary}</div>
                      </div>
                      <div className="text-sm text-gray-800">
                        <strong>Recommendations:</strong>
                        <ul className="list-disc ml-5 mt-1">
                          {(aiSummary.recommendations || []).map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No AI summary generated yet. Use the button above to generate one.</div>
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
