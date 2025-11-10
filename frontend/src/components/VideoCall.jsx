import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Users } from 'lucide-react';

/**
 * VideoCall Component
 * 
 * Embeds Jitsi Meet for video consultations between patients and doctors.
 * Uses the free Jitsi Meet service (meet.jit.si).
 * 
 * Props:
 * - roomId: Unique room identifier
 * - displayName: User's display name
 * - userRole: "patient" or "clinician"
 * - onCallEnd: Callback when call ends
 */
const VideoCall = ({ roomId, displayName, userRole, onCallEnd }) => {
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    // Load Jitsi Meet External API script
    const loadJitsiScript = () => {
      return new Promise((resolve, reject) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeJitsi = async () => {
      try {
        await loadJitsiScript();

        if (!jitsiContainerRef.current) {
          throw new Error('Container ref not available');
        }

        // Jitsi Meet configuration
        const domain = 'meet.jit.si';
        const options = {
          roomName: roomId,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          userInfo: {
            displayName: displayName,
            email: '', // Optional
          },
          configOverwrite: {
            startWithAudioMuted: false,
            startWithVideoMuted: false,
            enableWelcomePage: false,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            enableClosePage: false,
            defaultLanguage: 'en',
            // Branding
            APP_NAME: 'MedAI Consultation',
            PROVIDER_NAME: 'MedAI',
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone',
              'camera',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'fodeviceselection',
              'hangup',
              'profile',
              'chat',
              'recording',
              'livestreaming',
              'etherpad',
              'sharedvideo',
              'settings',
              'raisehand',
              'videoquality',
              'filmstrip',
              'feedback',
              'stats',
              'shortcuts',
              'tileview',
              'download',
              'help',
              'mute-everyone',
            ],
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            SHOW_BRAND_WATERMARK: false,
            BRAND_WATERMARK_LINK: '',
            DEFAULT_REMOTE_DISPLAY_NAME: userRole === 'patient' ? 'Doctor' : 'Patient',
            DEFAULT_LOCAL_DISPLAY_NAME: displayName,
            MOBILE_APP_PROMO: false,
          },
        };

        // Initialize Jitsi Meet API
        const api = new window.JitsiMeetExternalAPI(domain, options);
        jitsiApiRef.current = api;

        // Event listeners
        api.addEventListener('videoConferenceJoined', () => {
          console.log('User joined the conference');
          setIsLoading(false);
        });

        api.addEventListener('participantJoined', (participant) => {
          console.log('Participant joined:', participant);
          setParticipantCount((prev) => prev + 1);
        });

        api.addEventListener('participantLeft', (participant) => {
          console.log('Participant left:', participant);
          setParticipantCount((prev) => Math.max(1, prev - 1));
        });

        api.addEventListener('videoConferenceLeft', () => {
          console.log('User left the conference');
          if (onCallEnd) {
            onCallEnd();
          }
        });

        api.addEventListener('readyToClose', () => {
          console.log('Ready to close');
          if (onCallEnd) {
            onCallEnd();
          }
        });

        api.addEventListener('errorOccurred', (error) => {
          console.error('Jitsi error:', error);
          setError('An error occurred during the video call');
        });

      } catch (err) {
        console.error('Failed to initialize Jitsi:', err);
        setError('Failed to load video call. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializeJitsi();

    // Cleanup
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomId, displayName, userRole, onCallEnd]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-white">
        <div className="text-center p-8">
          <VideoOff className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Video Call Error</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gray-900">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-lg">Connecting to video call...</p>
            <p className="text-sm text-gray-400 mt-2">Room: {roomId}</p>
          </div>
        </div>
      )}
      
      {/* Participant counter */}
      {!isLoading && (
        <div className="absolute top-4 right-4 z-20 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>{participantCount} {participantCount === 1 ? 'participant' : 'participants'}</span>
        </div>
      )}

      {/* Jitsi container */}
      <div ref={jitsiContainerRef} className="w-full h-full" />
    </div>
  );
};

export default VideoCall;
