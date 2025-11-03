import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Bell, 
  Lock, 
  Globe, 
  Moon, 
  Shield,
  Eye,
  Mail,
  Smartphone
} from 'lucide-react'

export default function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    healthTips: true,
    darkMode: false,
    language: 'en',
    twoFactorAuth: false,
    shareDataWithDoctors: true
  })

  const toggleSetting = (key) => {
    setSettings({ ...settings, [key]: !settings[key] })
    // In production, save to backend/Firestore
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link to="/home" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences and settings</p>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-4">
              <SettingToggle
                icon={<Mail className="w-5 h-5" />}
                title="Email Notifications"
                description="Receive updates and alerts via email"
                checked={settings.emailNotifications}
                onChange={() => toggleSetting('emailNotifications')}
              />
              <SettingToggle
                icon={<Smartphone className="w-5 h-5" />}
                title="SMS Notifications"
                description="Get text messages for urgent updates"
                checked={settings.smsNotifications}
                onChange={() => toggleSetting('smsNotifications')}
              />
              <SettingToggle
                icon={<Bell className="w-5 h-5" />}
                title="Appointment Reminders"
                description="Reminders before scheduled consultations"
                checked={settings.appointmentReminders}
                onChange={() => toggleSetting('appointmentReminders')}
              />
              <SettingToggle
                icon={<Mail className="w-5 h-5" />}
                title="Health Tips"
                description="Daily health tips and wellness advice"
                checked={settings.healthTips}
                onChange={() => toggleSetting('healthTips')}
              />
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Privacy & Security</h2>
            </div>

            <div className="space-y-4">
              <SettingToggle
                icon={<Lock className="w-5 h-5" />}
                title="Two-Factor Authentication"
                description="Add an extra layer of security to your account"
                checked={settings.twoFactorAuth}
                onChange={() => toggleSetting('twoFactorAuth')}
              />
              <SettingToggle
                icon={<Eye className="w-5 h-5" />}
                title="Share Data with Doctors"
                description="Allow your consultation history to be shared with healthcare providers"
                checked={settings.shareDataWithDoctors}
                onChange={() => toggleSetting('shareDataWithDoctors')}
              />
            </div>

            <div className="mt-6 pt-6 border-t">
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Change Password
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Moon className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Appearance</h2>
            </div>

            <div className="space-y-4">
              <SettingToggle
                icon={<Moon className="w-5 h-5" />}
                title="Dark Mode"
                description="Use dark theme throughout the app"
                checked={settings.darkMode}
                onChange={() => toggleSetting('darkMode')}
              />
            </div>
          </div>

          {/* Language & Region */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Language & Region</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-md p-6 border-2 border-red-200">
            <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors">
                Delete All Consultation History
              </button>
              <button className="w-full px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function SettingToggle({ icon, title, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <div className="text-gray-600 mt-1">{icon}</div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  )
}
