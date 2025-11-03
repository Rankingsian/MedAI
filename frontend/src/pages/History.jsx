import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MessageSquare, FileText, Calendar, ArrowRight, ArrowLeft, Clock } from 'lucide-react'

export default function History() {
  const mockHistory = [
    {
      id: 1,
      type: 'consultation',
      date: '2024-10-30',
      summary: 'Headache and fever symptoms',
      status: 'completed'
    },
    {
      id: 2,
      type: 'lab',
      date: '2024-10-28',
      summary: 'Blood test results analysis',
      status: 'reviewed'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
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

          {mockHistory.length === 0 ? (
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
              {mockHistory.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        item.type === 'consultation' ? 'bg-blue-100' : 'bg-purple-100'
                      }`}>
                        {item.type === 'consultation' ? (
                          <MessageSquare className="w-6 h-6 text-blue-600" />
                        ) : (
                          <FileText className="w-6 h-6 text-purple-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{item.summary}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status === 'completed' ? 'Completed' : 'Reviewed'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
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
