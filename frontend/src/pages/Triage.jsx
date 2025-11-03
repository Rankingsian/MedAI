import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Activity, User, Thermometer, Heart, Clock, Pill, ChevronRight, ArrowLeft } from 'lucide-react'

export default function Triage() {
  const [form, setForm] = useState({
    age: '',
    gender: '',
    symptoms: '',
    duration: '',
    temperature: '',
    bloodPressure: '',
    heartRate: '',
    meds: ''
  })
  const navigate = useNavigate()
  
  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }
  
  function onSubmit(e) {
    e.preventDefault()
    if (!form.symptoms || !form.age || !form.gender) {
      alert('Please fill in your age, gender, and primary symptoms')
      return
    }
    navigate('/chat', { state: { triage: form } })
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Health Assessment</h1>
            <p className="text-gray-600">Help us understand your health concerns better</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={onChange}
                    placeholder="Enter your age"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={onChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select gender</option>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                    <option>Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Thermometer className="w-5 h-5 mr-2 text-green-600" />
                Vital Signs <span className="text-sm font-normal text-gray-500 ml-2">(Optional)</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Temperature (°F)</label>
                  <input
                    type="text"
                    name="temperature"
                    value={form.temperature}
                    onChange={onChange}
                    placeholder="98.6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                  <input
                    type="text"
                    name="bloodPressure"
                    value={form.bloodPressure}
                    onChange={onChange}
                    placeholder="120/80"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heart Rate (bpm)</label>
                  <input
                    type="text"
                    name="heartRate"
                    value={form.heartRate}
                    onChange={onChange}
                    placeholder="70"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-amber-600" />
                Symptoms & Medical History
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Symptoms <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="symptoms"
                    value={form.symptoms}
                    onChange={onChange}
                    placeholder="Describe your symptoms in detail..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent h-32 resize-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Symptom Duration
                    </label>
                    <input
                      type="text"
                      name="duration"
                      value={form.duration}
                      onChange={onChange}
                      placeholder="e.g., 2 days, 1 week"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Pill className="w-4 h-4 mr-1" />
                      Current Medications
                    </label>
                    <input
                      type="text"
                      name="meds"
                      value={form.meds}
                      onChange={onChange}
                      placeholder="List medications, if any"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800">
                <strong>Emergency Notice:</strong> If you're experiencing a medical emergency, 
                please call your local emergency services immediately. This tool is for informational purposes only.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/chat', { state: { triage: null } })}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Skip & Continue
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center group"
              >
                Start Consultation
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
