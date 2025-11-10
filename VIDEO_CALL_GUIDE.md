# Video Call Feature - Complete Guide

## Overview

The MedAI video call feature enables secure, real-time video consultations between patients and doctors using **Jitsi Meet**, a free and open-source video conferencing solution.

---

## Architecture

### Technology Stack

- **Frontend**: React with Jitsi Meet External API
- **Backend**: FastAPI with Firestore
- **Video Platform**: Jitsi Meet (meet.jit.si) - Free, no account required
- **Database**: Firestore for session management

### Why Jitsi Meet?

1. **Free**: No cost, no account required
2. **Secure**: End-to-end encryption available
3. **Reliable**: Battle-tested, used by millions
4. **Easy Integration**: Simple JavaScript API
5. **No Backend Required**: Runs entirely in the browser
6. **HIPAA Compliant**: Can be self-hosted for compliance

---

## End-to-End Workflow

### 1. Patient Requests Consultation

**Location**: `/request-doctor` page

```
Patient fills form:
├── Primary concern (required)
├── Additional details (optional)
└── Urgency level (low/medium/high)

↓ Submit

Backend creates consultation_request:
├── status: "pending"
├── user_id: patient's ID
└── No video call yet
```

**Code Flow**:
```javascript
// Frontend: RequestConsultation.jsx
await api.post('/consultation/request', {
  user_id: user.uid,
  summary: form.summary,
  details: form.details,
  urgency: form.urgency
});

// Backend: consultation_requests.py
doc_ref = db.collection("consultation_requests").add({
  "user_id": payload.user_id,
  "status": "pending",
  "created_at": datetime.utcnow()
})
```

---

### 2. Clinician Assigns Request

**Location**: `/clinician/dashboard` page

```
Clinician views pending requests
↓
Clicks "Assign to Me"
↓
Backend updates request:
├── status: "assigned"
├── clinician_id: doctor's ID
└── updated_at: timestamp
```

**Code Flow**:
```javascript
// Frontend: ClinicianDashboard.jsx
await api.post(`/consultation/request/${requestId}/assign?clinician_id=${user.uid}`);

// Backend: consultation_requests.py
doc_ref.update({
  "clinician_id": clinician_id,
  "status": "assigned",
  "updated_at": datetime.utcnow()
})
```

---

### 3. Clinician Schedules Video Call

**Location**: Clinician Dashboard (after assigning)

```
Clinician clicks "Schedule Video Call"
↓
Modal opens with date/time picker
↓
Clinician selects appointment time
↓
Backend creates video call:
├── Generates unique room_id
├── Creates Jitsi Meet URL
├── Links to consultation_request
└── Sets status: "scheduled"
```

**Code Flow**:
```javascript
// Frontend: ScheduleVideoCallModal.jsx
const videoCall = await videoCallApi.createVideoCall({
  consultation_request_id: request.request_id,
  patient_id: request.user_id,
  clinician_id: clinicianId,
  scheduled_time: scheduledDateTime.toISOString(),
  recording_enabled: false
});

// Backend: video_calls.py
room_id = generate_room_id(consultation_request_id)  // e.g., "medai-a1b2c3d4e5f6"
room_url = f"https://meet.jit.si/{room_id}"

video_call_data = {
  "room_id": room_id,
  "room_url": room_url,
  "consultation_request_id": payload.consultation_request_id,
  "patient_id": payload.patient_id,
  "clinician_id": payload.clinician_id,
  "status": "scheduled",
  "scheduled_time": payload.scheduled_time,
  "patient_joined": False,
  "clinician_joined": False
}

doc_ref = db.collection("video_calls").add(video_call_data)

// Also update consultation_request
db.collection("consultation_requests").document(request_id).update({
  "video_room_id": room_id,
  "video_room_url": room_url,
  "appointment_date": scheduled_time
})
```

**Room ID Generation**:
```python
def generate_room_id(consultation_request_id: str) -> str:
    timestamp = datetime.utcnow().isoformat()
    raw = f"medai-{consultation_request_id}-{timestamp}"
    hash_obj = hashlib.sha256(raw.encode())
    room_id = f"medai-{hash_obj.hexdigest()[:16]}"
    return room_id
```

---

### 4. Patient Sees Video Call Link

**Location**: `/request-doctor` page (automatically refreshes)

```
Patient's request list updates:
├── Status badge shows "assigned"
├── "Join Video Call" button appears
└── Scheduled time is displayed

Patient clicks "Join Video Call"
↓
Navigates to: /video-call/{call_id}?role=patient
```

**Code Flow**:
```javascript
// Frontend: RequestConsultation.jsx
// Fetch video calls for assigned requests
const videoCall = await videoCallApi.getVideoCallByRequest(request.request_id);

// Display button
<button onClick={() => navigate(`/video-call/${videoCall.call_id}?role=patient`)}>
  <Video /> Join Video Call
</button>
```

---

### 5. Joining the Video Call

**Location**: `/video-call/{call_id}` page

```
User (patient or clinician) clicks join
↓
Frontend fetches call details
↓
Backend verifies authorization
↓
Backend updates join status
↓
Jitsi Meet loads in iframe
↓
User joins video conference
```

**Code Flow**:
```javascript
// Frontend: VideoCallPage.jsx
// 1. Fetch call data
const response = await axios.get(`${API_URL}/api/video-call/${callId}`);
setCallData(response.data);

// 2. Join the call
const joinResponse = await axios.post(
  `${API_URL}/api/video-call/${callId}/join`,
  null,
  {
    params: {
      user_id: user.uid,
      user_role: userRole  // "patient" or "clinician"
    }
  }
);

// Backend: video_calls.py
// Verify authorization
if user_role == "patient" and data.get("patient_id") != user_id:
    raise HTTPException(403, "Not authorized")

// Update join status
updates = {
  "patient_joined": True if user_role == "patient" else data.get("patient_joined"),
  "clinician_joined": True if user_role == "clinician" else data.get("clinician_joined"),
  "status": "active",  // First person joining activates the call
  "started_at": datetime.utcnow()
}

doc_ref.update(updates)

// Return join data
return {
  "room_url": data.get("room_url"),
  "room_id": data.get("room_id"),
  "display_name": user_name,
  "user_role": user_role
}
```

---

### 6. Video Call Session

**Location**: Embedded Jitsi Meet

```
Jitsi Meet initializes:
├── Loads external API script
├── Creates iframe with room
├── Configures settings
└── Handles events

Features available:
├── Video on/off
├── Audio mute/unmute
├── Screen sharing
├── Chat messages
├── Participant list
└── Recording (optional)
```

**Code Flow**:
```javascript
// Frontend: VideoCall.jsx
// Load Jitsi script
const script = document.createElement('script');
script.src = 'https://meet.jit.si/external_api.js';
document.body.appendChild(script);

// Initialize Jitsi
const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
  roomName: roomId,  // e.g., "medai-a1b2c3d4e5f6"
  width: '100%',
  height: '100%',
  parentNode: containerRef.current,
  userInfo: {
    displayName: displayName  // "Dr. Jane Smith" or "John Doe"
  },
  configOverwrite: {
    startWithAudioMuted: false,
    startWithVideoMuted: false,
    prejoinPageEnabled: false,
    APP_NAME: 'MedAI Consultation'
  }
});

// Event listeners
api.addEventListener('videoConferenceJoined', () => {
  console.log('User joined');
});

api.addEventListener('participantJoined', (participant) => {
  console.log('Another participant joined');
  setParticipantCount(prev => prev + 1);
});

api.addEventListener('videoConferenceLeft', () => {
  console.log('User left');
  handleCallEnd();
});
```

---

### 7. Ending the Call

**Location**: Video call page

```
User clicks "Leave" or closes window
↓
Frontend calls end endpoint
↓
Backend updates call:
├── status: "completed"
├── ended_at: timestamp
├── duration_minutes: calculated
└── Updates consultation_request status

Both users are redirected to dashboard
```

**Code Flow**:
```javascript
// Frontend: VideoCallPage.jsx
const handleCallEnd = async () => {
  await axios.post(`${API_URL}/api/video-call/${callId}/end`);
  
  if (userRole === 'patient') {
    navigate('/dashboard');
  } else {
    navigate('/clinician/dashboard');
  }
};

// Backend: video_calls.py
// Calculate duration
started = data.get("started_at")
duration_seconds = (now - started).total_seconds()
duration_minutes = int(duration_seconds / 60)

// Update video call
doc_ref.update({
  "status": "completed",
  "ended_at": now,
  "duration_minutes": duration_minutes,
  "updated_at": now
})

// Update consultation request
db.collection("consultation_requests")
  .document(consultation_request_id)
  .update({
    "status": "completed",
    "updated_at": now
  })
```

---

## Database Schema

### consultation_requests Collection

```javascript
{
  request_id: "req_abc123",
  user_id: "patient_uid",
  clinician_id: "doctor_uid",
  summary: "Persistent headaches",
  details: "For 2 weeks...",
  urgency: "medium",
  status: "assigned",  // pending → assigned → in_progress → completed
  video_room_id: "medai-a1b2c3d4e5f6",  // Added when video call created
  video_room_url: "https://meet.jit.si/medai-a1b2c3d4e5f6",
  appointment_date: "2025-11-10T14:00:00Z",
  created_at: "2025-11-09T10:00:00Z",
  updated_at: "2025-11-09T11:00:00Z"
}
```

### video_calls Collection

```javascript
{
  call_id: "call_xyz789",
  room_id: "medai-a1b2c3d4e5f6",
  room_url: "https://meet.jit.si/medai-a1b2c3d4e5f6",
  consultation_request_id: "req_abc123",
  patient_id: "patient_uid",
  clinician_id: "doctor_uid",
  status: "scheduled",  // scheduled → active → completed → cancelled
  scheduled_time: "2025-11-10T14:00:00Z",
  started_at: "2025-11-10T14:02:00Z",  // When first person joined
  ended_at: "2025-11-10T14:32:00Z",    // When call ended
  duration_minutes: 30,
  patient_joined: true,
  clinician_joined: true,
  recording_enabled: false,
  created_at: "2025-11-09T11:00:00Z",
  updated_at: "2025-11-10T14:32:00Z"
}
```

---

## API Endpoints

### Create Video Call
```http
POST /api/video-call/create
Content-Type: application/json

{
  "consultation_request_id": "req_abc123",
  "patient_id": "patient_uid",
  "clinician_id": "doctor_uid",
  "scheduled_time": "2025-11-10T14:00:00Z",
  "recording_enabled": false
}

Response:
{
  "call_id": "call_xyz789",
  "room_id": "medai-a1b2c3d4e5f6",
  "room_url": "https://meet.jit.si/medai-a1b2c3d4e5f6",
  "status": "scheduled",
  ...
}
```

### Get Video Call
```http
GET /api/video-call/{call_id}

Response:
{
  "call_id": "call_xyz789",
  "room_id": "medai-a1b2c3d4e5f6",
  "room_url": "https://meet.jit.si/medai-a1b2c3d4e5f6",
  "status": "scheduled",
  ...
}
```

### Join Video Call
```http
POST /api/video-call/{call_id}/join?user_id={uid}&user_role=patient

Response:
{
  "room_url": "https://meet.jit.si/medai-a1b2c3d4e5f6",
  "room_id": "medai-a1b2c3d4e5f6",
  "display_name": "John Doe",
  "user_role": "patient"
}
```

### End Video Call
```http
POST /api/video-call/{call_id}/end

Response:
{
  "call_id": "call_xyz789",
  "status": "completed",
  "duration_minutes": 30,
  ...
}
```

---

## Security Considerations

### 1. Room ID Security
- **Unique**: SHA-256 hash ensures uniqueness
- **Unpredictable**: Includes timestamp and request ID
- **Prefix**: "medai-" prefix identifies our rooms

### 2. Authorization
- Users must be authenticated
- Patient can only join their own calls
- Clinician can only join assigned calls
- Backend verifies authorization before returning room URL

### 3. Jitsi Meet Security
- **Default**: Rooms are public but hard to guess
- **Lobby Mode**: Can enable waiting room
- **Password Protection**: Can add room password
- **Self-Hosting**: For HIPAA compliance, self-host Jitsi

### 4. Data Privacy
- Video/audio not stored by default
- Recording requires explicit consent
- Room automatically closes when empty
- No persistent chat history

---

## Self-Hosting Jitsi (Optional)

For HIPAA compliance or additional control:

### 1. Install Jitsi Meet Server

```bash
# Ubuntu/Debian
wget -qO - https://download.jitsi.org/jitsi-key.gpg.key | sudo apt-key add -
sudo sh -c "echo 'deb https://download.jitsi.org stable/' > /etc/apt/sources.list.d/jitsi-stable.list"
sudo apt update
sudo apt install jitsi-meet
```

### 2. Configure SSL

```bash
sudo /usr/share/jitsi-meet/scripts/install-letsencrypt-cert.sh
```

### 3. Update Backend Configuration

```python
# backend/app/api/v1/endpoints/video_calls.py
JITSI_DOMAIN = "meet.yourdomain.com"  # Your self-hosted domain
```

### 4. Enable Authentication (Optional)

```bash
# /etc/prosody/conf.avail/meet.yourdomain.com.cfg.lua
VirtualHost "meet.yourdomain.com"
    authentication = "internal_plain"
```

---

## Troubleshooting

### Issue: Video call button not showing

**Check**:
1. Request status is "assigned" or "in_progress"
2. Video call was created (check Firestore)
3. Frontend is fetching video calls correctly

### Issue: Cannot join video call

**Check**:
1. User is authenticated
2. User has permission (patient_id or clinician_id matches)
3. Call status is not "cancelled"
4. Network allows WebRTC connections

### Issue: Video/audio not working

**Check**:
1. Browser permissions for camera/microphone
2. HTTPS connection (required for WebRTC)
3. Firewall allows WebRTC ports (UDP 10000)
4. Browser supports WebRTC (Chrome, Firefox, Safari, Edge)

### Issue: Poor video quality

**Solutions**:
1. Check internet connection speed
2. Close other bandwidth-heavy applications
3. Reduce video quality in Jitsi settings
4. Use wired connection instead of WiFi

---

## Testing

### Manual Testing

1. **Create Test Users**:
   - Patient: patient@test.com
   - Doctor: doctor@test.com

2. **Patient Flow**:
   - Login as patient
   - Go to /request-doctor
   - Submit consultation request
   - Wait for assignment

3. **Clinician Flow**:
   - Login as doctor
   - Go to /clinician/dashboard
   - Assign pending request
   - Schedule video call

4. **Join Call**:
   - Both users click "Join Video Call"
   - Verify video/audio works
   - Test chat and screen sharing
   - End call

### Automated Testing

```python
# backend/tests/test_video_calls.py
import pytest
from app.api.v1.endpoints.video_calls import generate_room_id

def test_room_id_generation():
    room_id = generate_room_id("test_request_123")
    assert room_id.startswith("medai-")
    assert len(room_id) == 22  # "medai-" + 16 hex chars

def test_create_video_call():
    response = client.post("/api/video-call/create", json={
        "consultation_request_id": "test_req",
        "patient_id": "patient_123",
        "clinician_id": "doctor_456",
        "scheduled_time": "2025-11-10T14:00:00Z"
    })
    assert response.status_code == 200
    assert "room_url" in response.json()
```

---

## Future Enhancements

1. **Recording**: Save call recordings to Cloud Storage
2. **Transcription**: Automatic transcription of consultations
3. **Screen Sharing**: Enhanced screen sharing for lab results
4. **Waiting Room**: Implement lobby for scheduled calls
5. **Call Quality**: Monitor and report connection quality
6. **Mobile Apps**: Native iOS/Android apps with Jitsi SDK
7. **Calendar Integration**: Sync with Google Calendar/Outlook
8. **Reminders**: Email/SMS reminders before scheduled calls
9. **Analytics**: Track call duration, quality, and completion rates
10. **AI Assistant**: Real-time AI suggestions during consultation

---

## Resources

- [Jitsi Meet Documentation](https://jitsi.github.io/handbook/)
- [Jitsi External API](https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe)
- [Self-Hosting Guide](https://jitsi.github.io/handbook/docs/devops-guide/devops-guide-quickstart)
- [HIPAA Compliance](https://jitsi.org/security/)
- [WebRTC Basics](https://webrtc.org/getting-started/overview)

---

## Support

For video call issues:
1. Check browser console for errors
2. Verify Firestore documents are created
3. Test with different browsers
4. Check network/firewall settings
5. Review backend logs for API errors
