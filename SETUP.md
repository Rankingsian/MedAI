# MedAI Setup Guide

## Authentication Flow

The application follows this user flow:
1. **Landing Page** → Users click "Start Consultation Now" or "For Clinicians"
2. **Auth Page** → Users must login or create account (Firebase Auth)
3. **Protected Routes** → After authentication, users can access:
# MedAI — Setup Guide (updated)

This document explains how to get the MedAI frontend and backend running locally, what environment
variables are required, and optional steps to enable local ML inference.

## Firebase Console Setup (Detailed)

### 1. Create Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it (e.g., "medai-prod" or "medai-dev")
4. Select your organization/billing account
5. Click "Create"

### 2. Enable Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your newly created project
3. Click "Continue" to add Firebase to your Google Cloud project

### 3. Set Up Authentication
1. In Firebase Console, click "Authentication" → "Get Started"
2. Enable providers:
   - Email/Password (for basic auth)
   - Google Sign-In (optional but recommended)
   For each provider:
   - Click "Enable"
   - Configure OAuth consent screen if needed
   - Save

### 4. Configure Firestore Database
1. Click "Firestore Database" → "Create Database"
2. Choose "Production Mode"
3. Select a location closest to your users
4. Click "Enable"
5. Set up security rules (Firestore → Rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profile data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Consultations
    match /consultations/{consultId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor'
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor'
      );
    }
    
    // Lab reports
    match /lab_reports/{reportId} {
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor'
      );
      allow create: if request.auth != null;
      allow update: if request.auth != null && (
        resource.data.userId == request.auth.uid ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor'
      );
    }
    
    // Doctor reviews
    match /reviews/{reviewId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
    }
  }
}
```

### 5. Set Up Cloud Storage
1. Click "Storage" → "Get Started"
2. Choose production mode
3. Select a location (same as Firestore)
4. Set up security rules (Storage → Rules):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Lab reports - allow users to upload and access their own files
    match /lab_reports/{userId}/{fileName} {
      allow read: if request.auth != null && (
        request.auth.uid == userId ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor'
      );
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // General rule - no public access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 6. Create Service Account
1. In Firebase Console, go to Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save the JSON file as `backend/firebase-service-account.json`
4. Keep this file secure and never commit it to version control

### 7. Get Web Configuration
1. In Firebase Console, go to Project Settings → General
2. Under "Your apps", click the web icon (</>)
3. Register app with a nickname (e.g., "MedAI Web")
4. Copy the `firebaseConfig` object
5. Use these values in your `frontend/.env.local`:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 8. Initial Data Structure
Our app uses these Firestore collections:
- `users/`: User profiles and roles
  ```typescript
  interface User {
    uid: string;
    email: string;
    role: 'patient' | 'doctor';
    displayName?: string;
    photoURL?: string;
  }
  ```
- `consultations/`: Chat history and AI responses
  ```typescript
  interface Consultation {
    userId: string;
    timestamp: Timestamp;
    deidentified_text: string;
    response: string;
    confidence: number;
    recommend_doctor: boolean;
    reviewed?: {
      doctorId: string;
      timestamp: Timestamp;
      notes?: string;
    };
  }
  ```
- `lab_reports/`: Uploaded reports and analysis
  ```typescript
  interface LabReport {
    userId: string;
    timestamp: Timestamp;
    fileUrl: string;
    deidentified_text: string;
    summary: string;
    entities: Array<{text: string, label: string}>;
    reviewed?: {
      doctorId: string;
      timestamp: Timestamp;
      notes?: string;
    };
  }
  ```
- `reviews/`: Doctor reviews and sign-offs
  ```typescript
  interface Review {
    doctorId: string;
    timestamp: Timestamp;
    consultationId?: string;
    labReportId?: string;
    notes: string;
    approved: boolean;
  }
  ```

### 9. Testing Firebase Setup
1. Create a test user:
```javascript
// In Firebase Console → Authentication
// Click "Add User"
email: "test@example.com"
password: "securepassword123"
```

2. Set user as doctor (in Firestore):
```javascript
// Manually add document in Firestore
Collection: users
Document ID: (copy from Authentication uid)
{
  "uid": "(same as document ID)",
  "email": "test@example.com",
  "role": "doctor"
}
```

3. Test storage:
- Upload a test file to verify bucket access
- Check security rules are enforcing access control

## Overview   MedAI is split into two parts:
   - `frontend/` — Windsurf React app (Vite) served locally via `npm run dev` or deployed on Vercel.
   - `backend/` — FastAPI app (uvicorn) which handles authentication, AI workflows, OCR, and Firestore persistence.

   Both parts use Firebase for auth and storage. AI models may run locally (GPU recommended) or via Hugging Face Inference API.

   ## Environment variables

   There are example env files in `frontend/env.example` and `backend/env.example`.
   Create the actual env files before running the apps.

   Backend (.env)
   - Path: `backend/.env` (the backend's `app/core/config.py` reads `.env` by default)
   - Required variables (replace with your values):

   ```
   # Firebase
   FIREBASE_PROJECT_ID=your_project_id
   GOOGLE_APPLICATION_CREDENTIALS=./firebase-service-account.json  # path to service-account JSON
   FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com

   # Hugging Face (optional)
   HUGGINGFACE_API_KEY=hf_your_api_key_here

   # Optional model selection / device
   AI_MODEL_NAME=microsoft/BioGPT-Large
   EMBEDDINGS_MODEL=sentence-transformers/all-mpnet-base-v2
   TRANSFORMERS_DEVICE=auto   # auto/cpu/cuda

   # Local tools
   TESSERACT_CMD=            # set if tesseract is not on PATH

   # App settings
   ENVIRONMENT=development
   APP_HOST=0.0.0.0
   APP_PORT=8000
   LOG_LEVEL=info
   ```

   Frontend (.env.local)
   - Path: `frontend/.env.local` (Vite loads `VITE_` prefixed vars)
   - Example:

   ```
   VITE_API_BASE_URL=http://localhost:8000
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   Security note: never commit secrets (service account JSON, API keys) to public repos. Use environment-specific secret stores for production (Render/VERCEL secrets, GitHub Actions secrets, etc.).

   ## Firebase setup

   1. Create a Firebase project at https://console.firebase.google.com/
   2. Enable Authentication (Email/Password and/or Google sign-in)
   3. Enable Firestore and Storage (use native mode)
   4. Create a service account and download the JSON file; place it at `backend/firebase-service-account.json` or set `GOOGLE_APPLICATION_CREDENTIALS` to its path.

   ## Install system dependencies

   - Python 3.10+ and node 18+
   - Tesseract OCR (for lab report OCR)

   On Ubuntu/Debian:

   ```bash
   sudo apt update
   sudo apt install -y python3-venv python3-pip nodejs npm tesseract-ocr
   ```

   If you rely on advanced ML models locally, install CUDA and Pytorch per device instructions.

   ## Backend setup and run

   1. Create and activate a virtual environment

   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

   2. Create `backend/.env` (see example at `backend/env.example`) and place the Firebase service account JSON.

   3. Optional: install heavy ML dependencies for local inference (only if you plan to run models locally):

   ```bash
   # inside the activated venv
   pip install torch transformers sentence-transformers spacy[transformers]
   # install med7 or en_core_med7_lg if you plan to use med7 NER (may require additional licensing)
   ```

   4. Run the backend (development):

   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   The API base will be available at `http://localhost:8000` (or `APP_HOST:APP_PORT`).

   ## Frontend setup and run

   1. Configure `frontend/.env.local` using values from Firebase console and set `VITE_API_BASE_URL` to your backend URL.

   2. Install and run:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   The frontend will run on Vite default (usually `http://localhost:5173`).

   ## Optional: Hugging Face Inference API (serverless)

   If you don't want to run models locally, set `HUGGINGFACE_API_KEY` and modify the backend to use HF Inference API or hosted endpoints. See `backend/app/services/ai_service.py` for where generation is attempted; the code prefers local HF models if installed but falls back safely.

   ## Tesseract configuration (OCR)

   If `tesseract` is not on PATH, set `TESSERACT_CMD` in `backend/.env` to the executable path (e.g., `/usr/bin/tesseract`). The OCR pipeline uses `pytesseract`.

   ## Quick test

   Start backend and frontend. Then test the chat endpoint:

   ```bash
   curl -X POST "http://127.0.0.1:8000/api/v1/chat" -H "Content-Type: application/json" -d '{"message":"I have chest pain and shortness of breath","triage":{"age":45,"gender":"male"}}'
   ```

   And upload a lab file (replace `report.pdf`):

   ```bash
   curl -X POST "http://127.0.0.1:8000/api/v1/upload-lab" -F "file=@report.pdf"
   ```

   ## Next steps and production notes

   - Use secret management on Render/Vercel to store service account JSON and API keys.
   - If deploying models to a dedicated inference host, secure the endpoints and throttle usage.
   - Implement clinician verification flows and RBAC before exposing doctor review features publicly.

   If you want, I can now:
   - add an example `.env` for production and a `docker-compose` snippet to run all services locally,
   - or implement the doctor review endpoint and RBAC wiring next.
