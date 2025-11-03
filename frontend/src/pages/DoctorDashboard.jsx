import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Stethoscope, Search, Filter, CheckCircle, Clock, AlertCircle, ArrowLeft, Eye, Edit } from 'lucide-react'

export default function DoctorDashboard() {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const mockConsultations = [
    {
      id: 'C001',
      patientId: 'PT-1234',
      date: '2024-10-31',
      symptoms: 'Persistent headache, fever',
      aiConfidence: 0.85,
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'C002',
      patientId: 'PT-5678',
      date: '2024-10-30',
      symptoms: 'Mild cough, fatigue',
      aiConfidence: 0.72,
      status: 'reviewed',
      priority: 'low'
    },
    {
      id: 'C003',
      patientId: 'PT-9012',
      date: '2024-10-30',
      symptoms: 'Chest pain, shortness of breath',
      aiConfidence: 0.91,
      status: 'pending',
      priority: 'urgent'
    }
  ]

  const filteredConsultations = mockConsultations.filter(c => {
    if (filter !== 'all' && c.status !== filter) return false
    if (searchTerm && !c.patientId.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !c.symptoms.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'reviewed': return 'bg-green-100 text-green-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'low': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
                  <Stethoscope className="w-8 h-8 text-teal-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                  <p className="text-gray-600">Review and manage AI consultations</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Pending Reviews</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {mockConsultations.filter(c => c.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Consultations</p>
                    <p className="text-2xl font-bold text-gray-900">{mockConsultations.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Reviewed Today</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockConsultations.filter(c => c.status === 'reviewed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Urgent Cases</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockConsultations.filter(c => c.priority === 'urgent').length}
                    </p>
                  </div>
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by patient ID or symptoms..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symptoms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI Confidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredConsultations.map((consultation, index) => (
                    <motion.tr
                      key={consultation.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{consultation.patientId}</div>
                        <div className="text-xs text-gray-500">{consultation.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(consultation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">{consultation.symptoms}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{(consultation.aiConfidence * 100).toFixed(0)}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                              <div
                                className={`h-1.5 rounded-full ${
                                  consultation.aiConfidence >= 0.8 ? 'bg-green-600' :
                                  consultation.aiConfidence >= 0.6 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${consultation.aiConfidence * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${getPriorityColor(consultation.priority)}`}>
                          {consultation.priority.charAt(0).toUpperCase() + consultation.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(consultation.status)}`}>
                          {consultation.status.charAt(0).toUpperCase() + consultation.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded">
                            <Edit className="w-4 h-4" />
                          </button>
                          {consultation.status === 'pending' && (
                            <button className="text-teal-600 hover:text-teal-900 p-1 hover:bg-teal-50 rounded">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredConsultations.length === 0 && (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No consultations found</h3>
                <p className="text-gray-600">Try adjusting your filters or search term</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
