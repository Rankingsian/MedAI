import React, { useState } from 'react';
import { X, Video, Calendar, Clock } from 'lucide-react';
import { videoCallApi } from '../api/videoCallApi';

/**
 * ScheduleVideoCallModal
 * 
 * Modal for clinicians to schedule a video call with a patient
 * after assigning a consultation request.
 */
const ScheduleVideoCallModal = ({ isOpen, onClose, consultationRequest, clinicianId, onSuccess }) => {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time');
      return;
    }

    try {
      setLoading(true);
      
      // Combine date and time
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      
      // Create video call
      const videoCall = await videoCallApi.createVideoCall({
        consultation_request_id: consultationRequest.request_id,
        patient_id: consultationRequest.user_id,
        clinician_id: clinicianId,
        scheduled_time: scheduledDateTime.toISOString(),
        recording_enabled: false,
      });

      if (onSuccess) {
        onSuccess(videoCall);
      }
      
      onClose();
    } catch (err) {
      console.error('Failed to schedule video call:', err);
      setError(err.response?.data?.detail || 'Failed to schedule video call');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Video Call</h2>
              <p className="text-sm text-gray-600">Set appointment time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Request Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Patient Request:</p>
          <p className="font-semibold text-gray-900">{consultationRequest.summary}</p>
          {consultationRequest.details && (
            <p className="text-sm text-gray-600 mt-2">{consultationRequest.details}</p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Date</span>
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Time</span>
            </label>
            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> A video call link will be automatically generated and shared with the patient.
              Both you and the patient will be able to join the call at the scheduled time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Scheduling...</span>
                </>
              ) : (
                <>
                  <Video className="w-5 h-5" />
                  <span>Schedule Call</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleVideoCallModal;
