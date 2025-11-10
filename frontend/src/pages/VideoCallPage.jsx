import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VideoCall from '../components/VideoCall';
import axios from 'axios';
import { ArrowLeft, Video, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * VideoCallPage
 * 
 * Full-page video call interface for patient-doctor consultations.
 * Handles joining the call, tracking participation, and ending the call.
 */
const VideoCallPage = () => {
  const { callId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [callData, setCallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinData, setJoinData] = useState(null);

  // Get user role from URL params or determine from user data
  const userRole = searchParams.get('role') || 'patient';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchCallData();
  }, [callId, user]);

  const fetchCallData = async () => {
    try {
      setLoading(true);
      
      // Fetch video call details
      const response = await axios.get(`${API_URL}/api/video-call/${callId}`);
      setCallData(response.data);

      // Join the call
      const joinResponse = await axios.post(
        `${API_URL}/api/video-call/${callId}/join`,
        null,
        {
          params: {
            user_id: user.uid,
            user_role: userRole,
          },
        }
      );
      
      setJoinData(joinResponse.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch call data:', err);
      setError(err.response?.data?.detail || 'Failed to load video call');
      setLoading(false);
    }
  };

  const handleCallEnd = async () => {
    try {
      // End the call on the backend
      await axios.post(`${API_URL}/api/video-call/${callId}/end`);
      
      // Navigate back to appropriate page
      if (userRole === 'patient') {
        navigate('/dashboard');
      } else {
        navigate('/clinician/dashboard');
      }
    } catch (err) {
      console.error('Failed to end call:', err);
      // Navigate anyway
      if (userRole === 'patient') {
        navigate('/dashboard');
      } else {
        navigate('/clinician/dashboard');
      }
    }
  };

  const handleBackClick = () => {
    const confirmLeave = window.confirm('Are you sure you want to leave the video call?');
    if (confirmLeave) {
      handleCallEnd();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg">Loading video call...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white p-8">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Unable to Join Call</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center space-x-2 mx-auto"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackClick}
            className="text-white hover:text-gray-300 transition"
            title="Leave call"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3">
            <Video className="w-6 h-6 text-blue-500" />
            <div>
              <h1 className="text-white font-semibold">
                {userRole === 'patient' ? 'Doctor Consultation' : 'Patient Consultation'}
              </h1>
              <p className="text-sm text-gray-400">
                {callData?.status === 'scheduled' ? 'Waiting for others...' : 'In progress'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-400">Scheduled</p>
          <p className="text-white font-medium">
            {callData?.scheduled_time ? new Date(callData.scheduled_time).toLocaleString() : 'Now'}
          </p>
        </div>
      </div>

      {/* Video Call Container */}
      <div className="flex-1 relative">
        {joinData && (
          <VideoCall
            roomId={joinData.room_id}
            displayName={joinData.display_name}
            userRole={joinData.user_role}
            onCallEnd={handleCallEnd}
          />
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div>
            <span className="font-medium text-white">MedAI</span> - Secure Video Consultation
          </div>
          <div>
            Room ID: <span className="font-mono text-white">{joinData?.room_id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCallPage;
