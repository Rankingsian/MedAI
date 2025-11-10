# MedAI Database Schema

## Overview
This document describes the complete Firestore database schema for MedAI, including all collections, fields, and relationships.

---

## Collections

### 1. **users**
Stores basic user information for patients.

**Collection Path:** `users/{user_id}`

**Fields:**
- `uid` (string): Firebase Auth UID
- `email` (string): User email address
- `name` (string): Full name
- `role` (string): User role - "patient" or "clinician"
- `phone` (string, optional): Phone number
- `date_of_birth` (timestamp, optional): Date of birth
- `gender` (string, optional): Gender
- `createdAt` (timestamp): Account creation timestamp
- `updatedAt` (timestamp): Last update timestamp

**Indexes:**
- `email` (ascending)
- `role` (ascending)

---

### 2. **clinicians**
Stores clinician/doctor profiles and credentials.

**Collection Path:** `clinicians/{clinician_id}`

**Fields:**
- `uid` (string): Firebase Auth UID
- `email` (string): Clinician email
- `name` (string): Full name
- `specialization` (string): Medical specialization (e.g., "Cardiology", "General Medicine")
- `license_number` (string): Medical license number
- `status` (string): Account status - "pending", "approved", "suspended"
- `bio` (string, optional): Professional biography
- `years_experience` (number, optional): Years of practice
- `consultation_fee` (number, optional): Fee per consultation
- `availability` (array, optional): Available time slots
- `createdAt` (timestamp): Account creation timestamp
- `updatedAt` (timestamp): Last update timestamp

**Indexes:**
- `email` (ascending)
- `status` (ascending)
- `specialization` (ascending)

---

### 3. **consultations**
Stores AI consultation sessions and chat history.

**Collection Path:** `consultations/{consultation_id}`

**Fields:**
- `user_id` (string): Reference to user
- `status` (string): "active" or "completed"
- `triage_data` (map): Initial triage information
  - `age` (number)
  - `gender` (string)
  - `symptoms` (string)
  - `duration` (string)
- `ai_summary` (map, optional): AI-generated clinical summary
  - `summary` (string): Clinical summary text
  - `confidence` (number): Confidence score (0-1)
  - `recommendations` (array): List of recommendations
  - `generated_at` (timestamp): When summary was generated
- `created_at` (timestamp): Consultation start time
- `last_updated` (timestamp): Last message timestamp

**Subcollections:**
- `messages/{message_id}`: Chat messages
  - `role` (string): "user" or "ai"
  - `content` (string): Message text
  - `timestamp` (timestamp): Message time
  - `confidence` (number, optional): AI confidence score
  - `model` (string, optional): AI model used
  
- `clinical_notes/{note_id}`: Clinician notes
  - `clinician_id` (string): Who wrote the note
  - `note` (string): Note content
  - `timestamp` (timestamp): When note was added

**Indexes:**
- `user_id` (ascending), `last_updated` (descending)
- `status` (ascending)

---

### 4. **consultation_requests**
Stores requests for doctor consultations (appointments).

**Collection Path:** `consultation_requests/{request_id}`

**Fields:**
- `user_id` (string): Patient who made the request
- `clinician_id` (string, optional): Assigned clinician
- `consultation_id` (string, optional): Related AI consultation
- `summary` (string): Brief description of concern
- `details` (string, optional): Additional details
- `urgency` (string): "low", "medium", "high"
- `status` (string): "pending", "assigned", "in_progress", "completed", "cancelled"
- `appointment_date` (timestamp, optional): Scheduled appointment time
- `video_room_id` (string, optional): Unique video call room identifier
- `video_room_url` (string, optional): Full Jitsi Meet URL
- `created_at` (timestamp): Request creation time
- `updated_at` (timestamp): Last update time

**Subcollections:**
- `notes/{note_id}`: Consultation notes
  - `clinician_id` (string): Who wrote the note
  - `note` (string): Note content
  - `timestamp` (timestamp): When note was added

**Indexes:**
- `user_id` (ascending), `created_at` (descending)
- `clinician_id` (ascending), `status` (ascending)
- `status` (ascending), `created_at` (descending)
- `video_room_id` (ascending)

---

### 5. **video_calls**
Stores video call session information and metadata.

**Collection Path:** `video_calls/{call_id}`

**Fields:**
- `room_id` (string): Unique Jitsi room identifier
- `room_url` (string): Full Jitsi Meet URL
- `consultation_request_id` (string): Related appointment
- `patient_id` (string): Patient user ID
- `clinician_id` (string): Clinician user ID
- `status` (string): "scheduled", "active", "completed", "cancelled"
- `scheduled_time` (timestamp): When call is scheduled
- `started_at` (timestamp, optional): When call actually started
- `ended_at` (timestamp, optional): When call ended
- `duration_minutes` (number, optional): Call duration
- `patient_joined` (boolean): Whether patient joined
- `clinician_joined` (boolean): Whether clinician joined
- `recording_enabled` (boolean): Whether recording was enabled
- `created_at` (timestamp): Record creation time
- `updated_at` (timestamp): Last update time

**Indexes:**
- `room_id` (ascending)
- `patient_id` (ascending), `scheduled_time` (descending)
- `clinician_id` (ascending), `scheduled_time` (descending)
- `status` (ascending)

---

### 6. **lab_reports**
Stores uploaded lab reports and extracted data.

**Collection Path:** `lab_reports/{report_id}`

**Fields:**
- `user_id` (string): Patient who uploaded
- `file_name` (string): Original file name
- `file_url` (string): Storage URL
- `file_type` (string): MIME type
- `extracted_text` (string, optional): OCR extracted text
- `extracted_data` (map, optional): Structured data
  - `test_name` (string)
  - `results` (array): Test results
  - `date` (string)
- `status` (string): "uploaded", "processing", "completed", "failed"
- `uploaded_at` (timestamp): Upload time
- `processed_at` (timestamp, optional): Processing completion time

**Indexes:**
- `user_id` (ascending), `uploaded_at` (descending)
- `status` (ascending)

---

## Relationships

```
users (patient)
  ├── consultations (1:many)
  │     ├── messages (1:many)
  │     └── clinical_notes (1:many)
  ├── consultation_requests (1:many)
  │     ├── notes (1:many)
  │     └── video_calls (1:1)
  └── lab_reports (1:many)

clinicians
  ├── consultation_requests (1:many)
  │     └── video_calls (1:1)
  └── clinical_notes (1:many)

video_calls
  ├── patient (many:1 → users)
  ├── clinician (many:1 → clinicians)
  └── consultation_request (1:1)
```

---

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isClinician() {
      return isAuthenticated() && 
             exists(/databases/$(database)/documents/clinicians/$(request.auth.uid));
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(userId);
    }
    
    // Clinicians collection
    match /clinicians/{clinicianId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isOwner(clinicianId);
    }
    
    // Consultations collection
    match /consultations/{consultationId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      
      match /messages/{messageId} {
        allow read, write: if isAuthenticated();
      }
      
      match /clinical_notes/{noteId} {
        allow read: if isAuthenticated();
        allow write: if isClinician();
      }
    }
    
    // Consultation requests
    match /consultation_requests/{requestId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
      
      match /notes/{noteId} {
        allow read: if isAuthenticated();
        allow write: if isClinician();
      }
    }
    
    // Video calls
    match /video_calls/{callId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
    
    // Lab reports
    match /lab_reports/{reportId} {
      allow read: if isAuthenticated();
      allow create: if isAuthenticated();
      allow update: if isAuthenticated();
    }
  }
}
```

---

## Migration Script

To recreate the database from scratch, use the provided `database_setup.py` script which will:
1. Initialize Firestore collections
2. Create necessary indexes
3. Set up security rules
4. Create sample data (optional)

See `DATABASE_SETUP.md` for detailed migration instructions.
