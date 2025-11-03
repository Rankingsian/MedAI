import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { AlertTriangle, Phone, FileText, ArrowLeft } from 'lucide-react'

export default function Disclaimer() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
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
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Important Disclaimer</h1>
            <p className="text-gray-600">Please read this carefully before using MedAI</p>
          </div>

          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-8">
            <div className="flex items-start space-x-4">
              <Phone className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-2xl font-bold text-red-900 mb-3">🚨 EMERGENCY NOTICE</h2>
                <p className="text-red-800 text-lg leading-relaxed mb-4">
                  <strong>If you are experiencing a medical emergency, call your local emergency services immediately (911 in the US) or go to the nearest emergency room.</strong>
                </p>
                <p className="text-red-700">
                  Do not use MedAI for emergency medical situations including but not limited to:
                </p>
                <ul className="mt-3 space-y-2 text-red-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Chest pain or pressure</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Difficulty breathing or shortness of breath</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Severe bleeding or injuries</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Signs of stroke (facial drooping, arm weakness, speech difficulty)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Loss of consciousness or severe confusion</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Suicidal thoughts or intentions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-blue-600" />
                  Medical Disclaimer
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  MedAI is designed for <strong>informational and educational purposes only</strong> and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. The information and recommendations provided by MedAI should not be considered as medical advice.
                </p>
              </div>

              <div className="border-l-4 border-amber-400 pl-4 py-2 bg-amber-50 rounded-r">
                <p className="text-amber-900 font-medium">
                  Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Limitations of AI Technology</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  While MedAI uses advanced AI models trained on medical literature, it has important limitations:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>AI cannot perform physical examinations or diagnostic tests</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Accuracy depends on the completeness and accuracy of information you provide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>AI may not detect rare conditions or unusual presentations</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Technology may occasionally provide incorrect or incomplete information</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">No Doctor-Patient Relationship</h3>
                <p className="text-gray-600 leading-relaxed">
                  Use of MedAI does not create a doctor-patient relationship. While licensed healthcare professionals review AI consultations, this does not constitute a formal medical consultation or establish a treatment relationship.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Liability Disclaimer</h3>
                <p className="text-gray-600 leading-relaxed">
                  MedAI and its operators are not liable for any actions you take based on information provided through the platform. Always consult with qualified healthcare professionals before making medical decisions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">When to See a Doctor</h3>
                <p className="text-gray-600 leading-relaxed mb-4">
                  You should consult a healthcare professional if:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Symptoms persist or worsen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>You need a prescription medication</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>You have a chronic medical condition</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>You're unsure about your symptoms</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>MedAI recommends seeing a doctor</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">By using MedAI, you acknowledge that you have read and understood this disclaimer.</h3>
            <p className="text-gray-600 mb-4">
              Have questions? Check our FAQ or contact our support team.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                to="/faq"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                View FAQ
              </Link>
              <Link
                to="/privacy"
                className="px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
