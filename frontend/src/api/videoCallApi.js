import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Video Call API Client
 * Handles all video call related API requests
 */

export const videoCallApi = {
  /**
   * Create a new video call session
   */
  createVideoCall: async (data) => {
    const response = await axios.post(`${API_URL}/api/video-call/create`, data);
    return response.data;
  },

  /**
   * Get video call details by ID
   */
  getVideoCall: async (callId) => {
    const response = await axios.get(`${API_URL}/api/video-call/${callId}`);
    return response.data;
  },

  /**
   * Get video call by consultation request ID
   */
  getVideoCallByRequest: async (requestId) => {
    const response = await axios.get(`${API_URL}/api/video-call/request/${requestId}`);
    return response.data;
  },

  /**
   * Get all video calls for a patient
   */
  getPatientVideoCalls: async (patientId) => {
    const response = await axios.get(`${API_URL}/api/video-call/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get all video calls for a clinician
   */
  getClinicianVideoCalls: async (clinicianId) => {
    const response = await axios.get(`${API_URL}/api/video-call/clinician/${clinicianId}`);
    return response.data;
  },

  /**
   * Join a video call
   */
  joinVideoCall: async (callId, userId, userRole) => {
    const response = await axios.post(
      `${API_URL}/api/video-call/${callId}/join`,
      null,
      {
        params: {
          user_id: userId,
          user_role: userRole,
        },
      }
    );
    return response.data;
  },

  /**
   * End a video call
   */
  endVideoCall: async (callId) => {
    const response = await axios.post(`${API_URL}/api/video-call/${callId}/end`);
    return response.data;
  },

  /**
   * Cancel a scheduled video call
   */
  cancelVideoCall: async (callId) => {
    const response = await axios.delete(`${API_URL}/api/video-call/${callId}`);
    return response.data;
  },
};
