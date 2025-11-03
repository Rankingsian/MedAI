import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Lock, Eye, Database, UserCheck, ArrowLeft } from 'lucide-react'

export default function Privacy() {
  const principles = [
    {
      icon: Shield,
      title: 'Data Protection',
      description: 'All health data is encrypted in transit and at rest using industry-standard encryption protocols.'
    },
    {
      icon: Eye,
      title: 'De-identification',
      description: 'Personal information is removed before AI processing to ensure your privacy is maintained.'
    },
    {
      icon: Lock,
      title: 'Secure Storage',
      description: 'Your data is stored in HIPAA-compliant cloud infrastructure with strict access controls.'
    },
    {
      icon: Database,
      title: 'Data Minimization',
      description: 'We only collect and retain data necessary for providing our services to you.'
    },
    {
      icon: UserCheck,
      title: 'Your Rights',
      description: 'You have the right to access, correct, or delete your personal health information at any time.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
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
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">Your privacy and data security are our top priorities</p>
            <p className="text-sm text-gray-500 mt-2">Last updated: October 31, 2024</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="prose prose-blue max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                At MedAI, we understand that your health information is deeply personal. We're committed to 
                protecting your privacy and ensuring the security of your data through cutting-edge technology 
                and strict compliance with healthcare privacy regulations including HIPAA.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">Information We Collect</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Health information you provide during consultations (symptoms, medical history, vital signs)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Lab reports and medical documents you upload</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Account information (name, email, authentication credentials)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Usage data and analytics to improve our services</span>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">How We Use Your Information</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Your information is used exclusively to provide and improve our healthcare services. We use 
                AI models to analyze your symptoms and lab reports, but only after de-identifying your personal 
                information. All AI consultations are reviewed by licensed medical professionals.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-8">Data Sharing</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                We never sell your personal health information. We only share data with:
              </p>
              <ul className="space-y-2 text-gray-600 mb-6">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Licensed healthcare professionals who review your consultations</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Service providers bound by strict confidentiality agreements</span>
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>When required by law or to protect public health</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {principles.map((principle, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <principle.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{principle.title}</h3>
                <p className="text-sm text-gray-600">{principle.description}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 mb-2">Questions About Your Privacy?</h3>
            <p className="text-gray-600 mb-4">
              Contact our Privacy Officer at privacy@medai.com or reach out through our support channels.
            </p>
            <Link
              to="/faq"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              View FAQ
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
