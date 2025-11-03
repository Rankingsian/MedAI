import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HelpCircle, ChevronDown, ArrowLeft } from 'lucide-react'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    {
      question: 'What is MedAI?',
      answer: 'MedAI is an AI-powered virtual healthcare assistant that provides preliminary medical advice, symptom analysis, and lab report interpretation. It combines advanced AI models with professional medical oversight to help you manage your health proactively.'
    },
    {
      question: 'Is MedAI a replacement for doctors?',
      answer: 'No. MedAI is designed to supplement, not replace, professional medical care. All AI-generated advice is reviewed by verified medical professionals, and we always recommend consulting with a healthcare provider for proper diagnosis and treatment.'
    },
    {
      question: 'How secure is my health data?',
      answer: 'Your privacy is our top priority. All data is encrypted, de-identified before AI processing, and stored securely in compliance with HIPAA standards. We never share your personal health information without your explicit consent.'
    },
    {
      question: 'What types of lab reports can I upload?',
      answer: 'MedAI supports PDF documents and image files (PNG, JPG) up to 10MB. We can process common lab reports including blood tests, urinalysis, metabolic panels, and more. Our OCR technology extracts text from both digital PDFs and scanned documents.'
    },
    {
      question: 'How accurate are the AI recommendations?',
      answer: 'Our AI models are trained on extensive medical literature and continuously improved. However, accuracy varies based on symptom complexity. All consultations include a confidence score, and we always recommend professional medical review for important health decisions.'
    },
    {
      question: 'When should I see a real doctor?',
      answer: 'Always seek immediate medical attention for emergencies. Our AI will recommend doctor visits for serious symptoms, medication needs, or complex conditions. Trust your instincts - if something feels seriously wrong, contact a healthcare provider immediately.'
    },
    {
      question: 'How much does MedAI cost?',
      answer: 'MedAI offers free basic consultations. Premium features including detailed lab analysis, priority doctor reviews, and extended history are available through our subscription plans. Check our pricing page for current rates.'
    },
    {
      question: 'Can I use voice input?',
      answer: 'Yes! We support voice input for describing symptoms and asking questions. This feature is especially helpful for users who prefer speaking over typing or have accessibility needs.'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-12">
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Frequently Asked Questions</h1>
            <p className="text-gray-600">Everything you need to know about MedAI</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
            <p className="text-gray-600 mb-4">We're here to help. Reach out to our support team.</p>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
