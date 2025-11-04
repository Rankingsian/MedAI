# 🚀 MedAI Enhancement Plan

## Overview
Transform MedAI into a complete telemedicine platform with user history, clinician portal, and consultation management.

---

## Phase 1: User History Management ✅ (Start Here)

### Backend Changes:
- [ ] Create Firestore schema for chat history
- [ ] Add `consultations` collection structure
- [ ] Create `/api/history` endpoint (GET user's consultations)
- [ ] Update `/api/chat` to save messages to history
- [ ] Add consultation metadata (timestamp, AI model, confidence)

### Frontend Changes:
- [ ] Update History page to show real data from Firestore
- [ ] Add consultation details view
- [ ] Show AI responses with confidence scores
- [ ] Add date filtering and search

**Database Schema:**
```
users/{userId}/
  consultations/{consultationId}/
    - createdAt: timestamp
    - status: "active" | "completed"
    - triageData: object
    - messages: array
      - role: "user" | "ai"
      - content: string
      - timestamp: timestamp
      - model: string
      - confidence: number
```

---

## Phase 2: Clinician Authentication System

### Backend:
- [ ] Create clinician role in Firebase Auth
- [ ] Add `/api/auth/clinician/signup` endpoint
- [ ] Add `/api/auth/clinician/login` endpoint
- [ ] Create clinician profile in Firestore on signup
- [ ] Middleware to verify clinician role

### Frontend:
- [ ] Create `/clinician/auth` page
- [ ] Clinician login/signup form
- [ ] Protected clinician routes
- [ ] Remove clinician button from landing page

**Database Schema:**
```
clinicians/{clinicianId}/
  - uid: string
  - email: string
  - name: string
  - specialization: string
  - licenseNumber: string
  - createdAt: timestamp
  - status: "pending" | "approved" | "suspended"
```

---

## Phase 3: Clinician Dashboard

### Features:
- [ ] Patient list view
- [ ] Search and filter patients
- [ ] View patient consultation history
- [ ] Add clinical notes to consultations
- [ ] View AI recommendations
- [ ] Dashboard statistics

### Components:
- [ ] `ClinicianDashboard.jsx` - Main dashboard
- [ ] `PatientList.jsx` - List of patients
- [ ] `PatientDetails.jsx` - Detailed patient view
- [ ] `ConsultationView.jsx` - View chat history
- [ ] `ClinicalNotes.jsx` - Add/edit notes

---

## Phase 4: Consultation Request System

### Backend:
- [ ] Create `consultation_requests` collection
- [ ] Add `/api/consultation/request` endpoint
- [ ] Add `/api/consultation/accept` endpoint
- [ ] Add `/api/consultation/complete` endpoint
- [ ] Notification system for new requests

### Frontend:
- [ ] "Consult a Doctor" button in user dashboard
- [ ] Request form with reason/urgency
- [ ] Request status tracking
- [ ] Clinician request queue
- [ ] In-progress consultation view

**Database Schema:**
```
consultation_requests/{requestId}/
  - userId: string
  - userName: string
  - clinicianId: string (null if unassigned)
  - status: "pending" | "assigned" | "in_progress" | "completed"
  - urgency: "low" | "medium" | "high"
  - reason: string
  - consultationId: string (reference)
  - createdAt: timestamp
  - updatedAt: timestamp
```

---

## Phase 5: Navigation & Routing

### Changes:
- [ ] Update landing page (remove clinician button)
- [ ] Create `/dashboard` as user home
- [ ] Create `/clinician` as clinician portal
- [ ] Update "Home" to go to `/dashboard`
- [ ] Add route guards for authenticated routes
- [ ] Separate layouts for user vs clinician

**Route Structure:**
```
Public:
  / - Landing page
  /auth - User login/signup
  /faq - FAQ
  /privacy - Privacy policy
  /disclaimer - Disclaimer

User (Protected):
  /dashboard - User home
  /triage - Symptom assessment
  /chat/:consultationId - AI consultation
  /upload - Lab upload
  /history - Past consultations
  /request-doctor - Request consultation

Clinician (Protected):
  /clinician/auth - Clinician login/signup
  /clinician/dashboard - Main dashboard
  /clinician/patients - Patient list
  /clinician/patient/:userId - Patient details
  /clinician/requests - Consultation requests
  /clinician/profile - Clinician profile
```

---

## Phase 6: AI-Doctor Collaboration

### Features:
- [ ] AI summary of patient history for clinician
- [ ] Side-by-side view: AI response vs clinical notes
- [ ] AI confidence indicators for clinician
- [ ] Suggest additional tests based on AI analysis
- [ ] Export patient report (AI + clinical notes)

---

## Phase 7: Scalability Improvements

### Code Organization:
- [ ] Split components into feature folders
- [ ] Create shared UI components library
- [ ] Implement React.lazy() for code splitting
- [ ] Add loading states and error boundaries
- [ ] Optimize Firestore queries with indexes

### Performance:
- [ ] Add pagination for history/patient lists
- [ ] Implement virtual scrolling for long lists
- [ ] Cache frequently accessed data
- [ ] Optimize bundle size
- [ ] Add service worker for offline support

---

## Implementation Order

### Week 1: Core Features
1. ✅ User History Management (Phase 1)
2. ✅ Clinician Authentication (Phase 2)
3. ✅ Basic Clinician Dashboard (Phase 3)

### Week 2: Consultation System
4. ✅ Consultation Requests (Phase 4)
5. ✅ Navigation Updates (Phase 5)

### Week 3: Advanced Features
6. ✅ AI-Doctor Collaboration (Phase 6)
7. ✅ Scalability Improvements (Phase 7)

---

## Technical Stack

**Backend:**
- FastAPI (existing)
- Firebase Admin SDK
- Firestore for data storage
- Firebase Auth for authentication

**Frontend:**
- React + Vite
- React Router v6
- Firebase SDK
- TailwindCSS
- Framer Motion

---

## Database Collections Summary

```
users/
  - uid, email, name, role, createdAt

clinicians/
  - uid, email, name, specialization, licenseNumber, status

consultations/
  - userId, consultationId, createdAt, status, messages[]

consultation_requests/
  - userId, clinicianId, status, urgency, reason

clinical_notes/
  - consultationId, clinicianId, notes, createdAt
```

---

## Next Steps

1. Start with Phase 1 (User History)
2. Test thoroughly before moving to next phase
3. Deploy incrementally
4. Gather feedback from test users
5. Iterate and improve

---

**Status:** Ready to implement
**Estimated Time:** 3 weeks for full implementation
**Priority:** High - Core features for production deployment
