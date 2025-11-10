# Quick Start - Video Calls

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Database (2 minutes)

```bash
cd backend
python database_setup.py --all
```

This will:
- ✅ Initialize Firestore collections
- ✅ Show you which indexes to create
- ✅ Create sample data for testing

### Step 2: Create Indexes (1 minute)

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore Database → Indexes

Click "Create Index" and add these (or wait for the app to prompt you):

1. **consultation_requests**: `user_id` (↑), `created_at` (↓)
2. **video_calls**: `patient_id` (↑), `scheduled_time` (↓)
3. **video_calls**: `clinician_id` (↑), `scheduled_time` (↓)

### Step 3: Start the App (1 minute)

```bash
# Terminal 1 - Backend
cd backend
uvicorn app.main:app --reload

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 4: Test It (1 minute)

1. **Create test users** in Firebase Console → Authentication:
   - patient@test.com
   - doctor@test.com

2. **As Patient**:
   - Login → Go to "Consult a Doctor"
   - Submit a request

3. **As Doctor**:
   - Login → Go to Clinician Dashboard
   - Assign the request
   - Schedule video call

4. **Both**:
   - Click "Join Video Call"
   - Start consultation!

---

## 📋 Code Snippets

### Backend: Create Video Call

```python
# When clinician schedules appointment
from app.api.v1.endpoints.video_calls import generate_room_id, generate_room_url

room_id = generate_room_id(consultation_request_id)
room_url = generate_room_url(room_id)

video_call = {
    "room_id": room_id,
    "room_url": room_url,
    "consultation_request_id": request_id,
    "patient_id": patient_id,
    "clinician_id": clinician_id,
    "status": "scheduled",
    "scheduled_time": scheduled_time
}

db.collection("video_calls").add(video_call)
```

### Frontend: Join Video Call

```javascript
// When user clicks "Join Video Call"
import { videoCallApi } from '../api/videoCallApi';

const joinCall = async (callId) => {
  const joinData = await videoCallApi.joinVideoCall(
    callId, 
    user.uid, 
    'patient'  // or 'clinician'
  );
  
  navigate(`/video-call/${callId}?role=patient`);
};
```

### Frontend: Embed Jitsi

```javascript
// VideoCall.jsx component
const api = new window.JitsiMeetExternalAPI('meet.jit.si', {
  roomName: roomId,
  parentNode: containerRef.current,
  userInfo: { displayName: userName }
});
```

---

## 🎯 Key Endpoints

```bash
# Create video call
POST /api/video-call/create

# Get video call
GET /api/video-call/{call_id}

# Join video call
POST /api/video-call/{call_id}/join?user_id={uid}&user_role=patient

# End video call
POST /api/video-call/{call_id}/end
```

---

## 📊 Database Structure

```
consultation_requests/{request_id}
├── user_id
├── clinician_id
├── status: "pending" → "assigned" → "completed"
├── video_room_id: "medai-abc123..."
└── video_room_url: "https://meet.jit.si/medai-abc123..."

video_calls/{call_id}
├── room_id: "medai-abc123..."
├── room_url: "https://meet.jit.si/medai-abc123..."
├── consultation_request_id
├── patient_id
├── clinician_id
├── status: "scheduled" → "active" → "completed"
├── scheduled_time
├── patient_joined: true/false
└── clinician_joined: true/false
```

---

## 🔍 How to Debug

### Check Backend
```bash
# Backend logs
tail -f backend.log

# Test endpoint
curl http://localhost:8000/api/video-call/{call_id}
```

### Check Frontend
```javascript
// Browser console
console.log('Video call data:', videoCall);
console.log('Join response:', joinData);
```

### Check Database
- Firebase Console → Firestore Database
- Look for `video_calls` collection
- Verify documents are created

---

## ✅ Checklist

Before going live:

- [ ] Firebase project created
- [ ] Firestore enabled
- [ ] Indexes created
- [ ] Security rules deployed
- [ ] Test users created
- [ ] Backend running
- [ ] Frontend running
- [ ] Video call tested end-to-end
- [ ] Camera/microphone permissions work
- [ ] Both patient and clinician can join

---

## 🆘 Quick Fixes

**Video button not showing?**
```javascript
// Check if video call exists
const videoCall = await videoCallApi.getVideoCallByRequest(requestId);
console.log('Video call:', videoCall);
```

**Can't join call?**
```javascript
// Check authorization
console.log('User ID:', user.uid);
console.log('Call patient_id:', videoCall.patient_id);
console.log('Call clinician_id:', videoCall.clinician_id);
```

**Jitsi not loading?**
```javascript
// Check if script loaded
console.log('Jitsi API:', window.JitsiMeetExternalAPI);
```

---

## 📚 Full Documentation

- **DATABASE_SCHEMA.md** - Complete schema
- **DATABASE_SETUP.md** - Detailed setup guide
- **VIDEO_CALL_GUIDE.md** - Technical deep dive
- **VIDEO_CALL_IMPLEMENTATION_SUMMARY.md** - Overview

---

## 🎉 That's It!

You now have a fully functional video call system using free Jitsi Meet!

**Questions?** Check the full documentation files.
