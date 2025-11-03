import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Stethoscope, 
  History, 
  User, 
  HelpCircle, 
  LogOut,
  Activity,
  FileText,
  Settings,
  ChevronRight,
  Calendar,
  Clock
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [recentConsultations, setRecentConsultations] = useState([])
  const [loading, setLoading] = useState(true)

  // Get user's first name for personalized greeting
  const getFirstName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0]
    }
    return user?.email?.split('@')[0] || 'there'
  }

  useEffect(() => {
    // Simulate fetching recent consultations
    // In production, this would fetch from your backend/Firestore
    setTimeout(() => {
      setRecentConsultations([
        // Mock data - replace with actual API call
        // { id: 1, date: '2024-11-01', symptoms: 'Headache and fever', status: 'completed' }
      ])
      setLoading(false)
    }, 500)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/auth')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/home" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">MedAI</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {getFirstName()}! 👋
            </h1>
            <p className="text-gray-600 text-lg">
              How can we help you with your health today?
            </p>
          </motion.div>

          {/* Primary Action - Start Consultation */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => navigate('/triage')}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-bold mb-1">Start New Consultation</h2>
                    <p className="text-blue-100">Get personalized health guidance from our AI</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-white group-hover:translate-x-2 transition-transform" />
              </div>
            </button>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* View History */}
            <motion.button
              onClick={() => navigate('/history')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <History className="w-7 h-7 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Consultation History</h3>
                  <p className="text-sm text-gray-600">View past consultations</p>
                </div>
              </div>
            </motion.button>

            {/* Upload Lab Results */}
            <motion.button
              onClick={() => navigate('/upload')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Upload Lab Results</h3>
                  <p className="text-sm text-gray-600">Analyze medical documents</p>
                </div>
              </div>
            </motion.button>

            {/* My Profile */}
            <motion.button
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <User className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">My Profile</h3>
                  <p className="text-sm text-gray-600">Manage your information</p>
                </div>
              </div>
            </motion.button>

            {/* Settings */}
            <motion.button
              onClick={() => navigate('/settings')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Settings className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Settings</h3>
                  <p className="text-sm text-gray-600">Preferences & security</p>
                </div>
              </div>
            </motion.button>

            {/* Help & Support */}
            <motion.button
              onClick={() => navigate('/faq')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                  <HelpCircle className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Help & Support</h3>
                  <p className="text-sm text-gray-600">FAQs and assistance</p>
                </div>
              </div>
            </motion.button>

            {/* Activity Dashboard */}
            <motion.button
              onClick={() => navigate('/history')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                  <Activity className="w-7 h-7 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Health Activity</h3>
                  <p className="text-sm text-gray-600">Track your wellness</p>
                </div>
              </div>
            </motion.button>
          </motion.div>

          {/* Recent Consultations Section */}
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Recent Consultations
              </h2>
              <Link 
                to="/history" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div
                    key={consultation.id}
                    className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{consultation.symptoms}</p>
                          <p className="text-sm text-gray-600">{consultation.date}</p>
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Stethoscope className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No consultations yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start your first consultation to get personalized health guidance
                </p>
                <button
                  onClick={() => navigate('/triage')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <Stethoscope className="w-5 h-5" />
                  Start First Consultation
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Tips Banner */}
          <motion.div 
            variants={itemVariants}
            className="bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl p-6 text-white"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Health Tip of the Day</h3>
                <p className="text-blue-50">
                  Stay hydrated! Drinking adequate water helps maintain your body's vital functions 
                  and can improve overall health. Aim for 8 glasses a day.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} MedAI. Your trusted health companion.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/disclaimer" className="text-gray-600 hover:text-blue-600 transition-colors">
                Disclaimer
              </Link>
              <Link to="/faq" className="text-gray-600 hover:text-blue-600 transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
