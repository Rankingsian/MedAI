import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, FileText, CheckCircle, Loader, AlertCircle, ArrowLeft, FileCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'

export default function Upload() {
  const [status, setStatus] = useState('idle')
  const [fileName, setFileName] = useState('')
  const [parsed, setParsed] = useState('')
  const [aiNotes, setAiNotes] = useState('')
  
  const onDrop = useCallback(async (accepted) => {
    if (!accepted.length) return
    setStatus('uploading')
    const f = accepted[0]
    setFileName(f.name)
    try {
      const formData = new FormData()
      formData.append('file', f)
      setStatus('analysis')
      const { data } = await api.post('/upload-lab', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setParsed(data.parsed_text || '')
      setAiNotes(data.ai_notes || 'Analysis will be provided by our AI system.')
      setStatus('done')
    } catch (e) {
      setParsed('Upload failed. Please try again.')
      setAiNotes('')
      setStatus('error')
    }
  }, [])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxSize: 10485760
  })
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-4">
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
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab Report Analysis</h1>
            <p className="text-gray-600">Upload your medical test results for AI-powered insights</p>
          </div>

          <div {...getRootProps()} className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50' 
              : status === 'idle' 
              ? 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50' 
              : 'border-gray-200 bg-gray-50'
          }`}>
            <input {...getInputProps()} />
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                    <UploadIcon className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      {isDragActive ? 'Drop your file here' : 'Drag & drop your lab report'}
                    </p>
                    <p className="text-sm text-gray-500">
                      or click to browse • PDF, PNG, JPG up to 10MB
                    </p>
                  </div>
                </motion.div>
              )}
              
              {status === 'uploading' && (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                  <p className="text-lg font-semibold text-gray-900">Uploading...</p>
                </motion.div>
              )}
              
              {status === 'analysis' && (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto" />
                  <p className="text-lg font-semibold text-gray-900">Analyzing your report...</p>
                  <p className="text-sm text-gray-500">Our AI is processing your document</p>
                </motion.div>
              )}
              
              {status === 'done' && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                  <p className="text-lg font-semibold text-green-900">Analysis Complete!</p>
                </motion.div>
              )}
              
              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
                  <p className="text-lg font-semibold text-red-900">Upload Failed</p>
                  <button 
                    onClick={() => setStatus('idle')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {fileName && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-gray-50 rounded-xl flex items-center"
            >
              <FileCheck className="w-5 h-5 text-green-600 mr-3" />
              <span className="text-sm text-gray-700 font-medium">{fileName}</span>
            </motion.div>
          )}

          {parsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-6"
            >
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Extracted Text
                </h3>
                <div className="bg-white rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{parsed}</pre>
                </div>
              </div>

              {aiNotes && (
                <div className="bg-green-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                    AI Interpretation
                  </h3>
                  <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{aiNotes}</p>
                  </div>
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs text-amber-800">
                      <strong>Note:</strong> This is an AI-generated interpretation. Please consult with a healthcare professional for medical advice.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStatus('idle')
                    setFileName('')
                    setParsed('')
                    setAiNotes('')
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Upload Another
                </button>
                <Link
                  to="/history"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-center"
                >
                  View History
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Supported File Types</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">PDF Documents</p>
                <p className="text-sm text-gray-600">Lab reports, test results</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">PNG Images</p>
                <p className="text-sm text-gray-600">Scanned documents</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">JPG Images</p>
                <p className="text-sm text-gray-600">Photos of reports</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
