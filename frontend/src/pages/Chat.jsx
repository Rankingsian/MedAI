import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { ArrowLeft } from 'lucide-react'
import { api } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function Chat() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDoctorBtn, setShowDoctorBtn] = useState(false)
  const [consultationId, setConsultationId] = useState(null)
  const { state } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // Safely handle speech recognition (may not be supported in all browsers)
  let listening = false
  let transcript = ''
  let resetTranscript = () => {}
  
  try {
    const speechRecognition = useSpeechRecognition()
    listening = speechRecognition.listening
    transcript = speechRecognition.transcript
    resetTranscript = speechRecognition.resetTranscript
  } catch (e) {
    console.warn('Speech recognition not supported:', e)
  }
  
  const endRef = useRef(null)

  // Allow chat access without triage data (for direct navigation)
  // Only redirect if explicitly needed
  // useEffect(() => {
  //   if (!state) {
  //     navigate('/triage')
  //   }
  // }, [state, navigate])

  useEffect(() => {
    if (state?.triage) {
      // Initialize chat with triage summary
      const triagePoints = []
      if (state.triage.age) triagePoints.push(`Age: ${state.triage.age}`)
      if (state.triage.gender) triagePoints.push(`Gender: ${state.triage.gender}`)
      if (state.triage.symptoms) triagePoints.push(`Symptoms: ${state.triage.symptoms}`)
      
      setMessages([
        { 
          role: 'system', 
          content: 'Triage information received:\n' + triagePoints.join('\n')
        }
      ])
    }
  }, [state])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Note: Removed full-screen loading/error states to prevent blocking the chat UI
  // Error and loading states are now shown inline within the chat interface

  async function send() {
    if (!input.trim()) return
    
    const userMsg = { role: 'user', content: input.trim() }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    setError(null)
    
    try {
      const triage = state?.triage
      
      // Generate consultation ID on first message
      if (!consultationId) {
        const newId = `consultation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setConsultationId(newId)
      }
      
      const payload = {
        message: userMsg.content,
        user_id: user?.uid, // Add authenticated user ID
        consultation_id: consultationId, // Link messages to same consultation
        triage: triage
          ? {
              age: triage.age ? Number(triage.age) : undefined,
              age_group: undefined,
              gender: triage.gender || undefined,
              primary_symptoms: triage.symptoms || undefined,
              symptom_duration: triage.duration || undefined,
              temperature: triage.temperature || undefined,
              blood_pressure: triage.bloodPressure || undefined,
              heart_rate: triage.heartRate || undefined,
              current_medications: triage.meds
                ? triage.meds.split(',').map((s) => s.trim()).filter(Boolean)
                : undefined,
            }
          : undefined,
      }
      
      const { data } = await api.post('/chat', payload)
      
      // Detect which AI model was used based on confidence
      let modelName = 'MedAI'
      if (data.confidence >= 0.9) {
        modelName = 'Llama 3.1' // Groq returns 0.9 confidence
      } else if (data.confidence >= 0.75) {
        modelName = 'MedAI Templates' // Template system
      }
      
      setMessages((m) => [...m, { 
        role: 'ai', 
        content: data.reply,
        confidence: data.confidence,
        model: modelName
      }])
      setShowDoctorBtn(Boolean(data.ai_recommend_doctor))
    } catch (e) {
      console.error('Chat API error:', e)
      setError('Failed to send message. Please try again.')
      setMessages((m) => [...m, { 
        role: 'system', 
        content: 'Sorry, there was an error processing your message. Please try again.' 
      }])
    } finally {
      setLoading(false)
    }
  }

  function onMic() {
    try {
      if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.')
        return
      }
      
      if (listening) {
        SpeechRecognition.stopListening()
        setInput((v) => (v ? v + ' ' + transcript : transcript))
        resetTranscript()
      } else {
        SpeechRecognition.startListening({ continuous: false })
      }
    } catch (e) {
      console.error('Speech recognition error:', e)
      alert('Voice input is not available in your browser.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/home" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Emergency Notice */}
          <div className="p-4 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ MedAI provides information only and is not a substitute for professional medical advice. 
              For emergencies, call local emergency services immediately.
            </p>
          </div>

          {/* Chat Window */}
          <div className="h-[calc(100vh-300px)] flex flex-col">
            <div className="flex-1 overflow-auto p-6 space-y-4">
              {messages.length === 0 && !loading && (
                <div className="text-center text-gray-500 py-12">
                  <p className="text-lg font-medium mb-2">Welcome to MedAI Chat</p>
                  <p className="text-sm">Start by asking about your health concerns</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    m.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : m.role === 'system'
                      ? 'bg-gray-100 text-gray-800 border border-gray-200'
                      : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    {m.role === 'ai' && m.confidence !== undefined && (
                      <div className="mt-2 pt-2 border-t border-gray-200 flex items-center gap-2 text-xs">
                        <span className="text-gray-500">🤖 {m.model || 'AI'}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          m.confidence >= 0.7 
                            ? 'bg-green-100 text-green-700' 
                            : m.confidence >= 0.4
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {(m.confidence * 100).toFixed(0)}% confident
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Type your message..." 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button 
                  onClick={onMic} 
                  className={`p-3 rounded-xl border ${
                    listening ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {listening ? '⬤' : '🎤'}
                </button>
                <button 
                  onClick={send}
                  disabled={!input.trim()} 
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>

              {/* Doctor Recommendation */}
              {showDoctorBtn && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-800 mb-2">
                    Based on your symptoms, we recommend consulting with a doctor.
                  </p>
                  <button
                    onClick={() => window.open('#', '_blank')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                  >
                    Book Doctor Appointment
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
