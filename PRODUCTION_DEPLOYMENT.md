# 🚀 MedAI Production Deployment Guide

Complete guide for deploying MedAI to production with secure Firebase configuration, environment variables, CORS settings, and comprehensive testing procedures.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Service Account Setup](#firebase-service-account-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [CORS Configuration](#cors-configuration)
5. [Firebase Security Rules Deployment](#firebase-security-rules-deployment)
6. [Firebase Storage Setup](#firebase-storage-setup)
7. [Pre-Deployment Checklist](#pre-deployment-checklist)
8. [Testing in Production](#testing-in-production)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying to production, ensure you have:

- ✅ **Firebase Project** created at [Firebase Console](https://console.firebase.google.com/)
- ✅ **Firebase Authentication** enabled (Email/Password, Google Sign-In)
- ✅ **Firebase Firestore** database created
- ✅ **Firebase Storage** enabled
- ✅ **Hosting Platform** account (Render, Vercel, Railway, VPS, etc.)
- ✅ **Domain Name** (optional but recommended for production)
- ✅ **Firebase CLI** installed: `npm install -g firebase-tools`

---

## Firebase Service Account Setup

### Step 1: Download Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click **⚙️ Project Settings** → **Service Accounts** tab
4. Click **Generate New Private Key**
5. Download the JSON file (e.g., `medai-prod-firebase-adminsdk-xxxxx.json`)

> [!CAUTION]
> **This file contains sensitive credentials!** Never commit it to version control or share it publicly.

### Step 2: Choose Your Deployment Method

Based on your hosting platform, choose the appropriate method:

#### **Method 1: Environment Variable (RECOMMENDED)**

✅ **Best for:** Render, Vercel, Railway, Heroku, Cloud Functions  
✅ **Benefits:** Most secure, no file management, works with serverless

**Convert JSON to single-line string:**

```bash
# On macOS/Linux with jq installed:
cat firebase-service-account.json | jq -c

# On macOS/Linux without jq:
cat firebase-service-account.json | tr -d '\n'

# On Windows PowerShell:
(Get-Content firebase-service-account.json) -join ''
```

**Set environment variable on your platform:**

| Platform | How to Set |
|----------|------------|
| **Render** | Dashboard → Environment → Add `FIREBASE_SERVICE_ACCOUNT_JSON` |
| **Vercel** | Project Settings → Environment Variables → Add variable |
| **Railway** | Variables → New Variable → `FIREBASE_SERVICE_ACCOUNT_JSON` |
| **Heroku** | Settings → Config Vars → Add `FIREBASE_SERVICE_ACCOUNT_JSON` |

Paste the **entire single-line JSON string** as the value.

---

#### **Method 2: File-based (For VPS/Docker)**

✅ **Best for:** VPS, EC2, Digital Ocean, Docker with volumes  
✅ **Use when:** You have direct file system access

**Steps:**

1. Upload `firebase-service-account.json` to your server:
   ```bash
   scp firebase-service-account.json user@your-server:/path/to/medai/backend/
   ```

2. Set environment variable to point to the file:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/medai/backend/firebase-service-account.json
   ```

3. For systemd services, add to your service file:
   ```ini
   [Service]
   Environment="GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json"
   ```

4. **Secure the file:**
   ```bash
   chmod 600 firebase-service-account.json
   chown your-app-user:your-app-user firebase-service-account.json
   ```

---

#### **Method 3: Cloud Secret Manager**

✅ **Best for:** Google Cloud Platform, AWS, Azure  
✅ **Enterprise-grade:** Most secure for large-scale deployments

**Google Cloud Secret Manager:**
```bash
# Store secret
gcloud secrets create firebase-service-account --data-file=firebase-service-account.json

# Grant access to your service
gcloud secrets add-iam-policy-binding firebase-service-account \
  --member="serviceAccount:your-service@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

**AWS Secrets Manager:**
```bash
aws secretsmanager create-secret \
  --name medai/firebase-service-account \
  --secret-string file://firebase-service-account.json
```

---

## Environment Variables Configuration

### Backend Environment Variables

Create or update these environment variables on your hosting platform:

#### **Required Variables**

```bash
# CORS - Comma-separated list of allowed frontend origins
CORS_ORIGINS=https://medai.vercel.app,https://medai.yourdomain.com

# Firebase Project ID
FIREBASE_PROJECT_ID=your-project-id

# Firebase Service Account (Method 1)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}

# OR Firebase Service Account (Method 2)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-service-account.json
```

#### **AI API Keys (Choose One)**

```bash
# OPTION 1: Groq (Recommended - Free, Fast)
GROQ_API_KEY=gsk_your_groq_api_key_here

# OPTION 2: Hugging Face (Alternative)
HUGGINGFACE_API_KEY=hf_your_huggingface_api_key_here
```

#### **Optional Variables**

```bash
# Environment
ENVIRONMENT=production

# Server Configuration
APP_HOST=0.0.0.0
APP_PORT=8000
LOG_LEVEL=info

# Firebase Realtime Database (only if using)
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com
```

### Frontend Environment Variables

Set these in your frontend hosting platform:

#### **Required Variables**

```bash
# Backend API URL
VITE_API_BASE_URL=https://medai-backend.onrender.com

# Firebase Configuration (from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

#### **Optional Variables**

```bash
# Firebase Analytics
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_ANALYTICS=true
```

---

## Platform-Specific Guides

### 🎨 Render

**Backend (Web Service):**
1. Connect your GitHub repository
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `pip install -r requirements.txt`
4. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in **Environment** tab
6. Deploy

**Frontend (Static Site):**
1. Connect repository
2. Set **Root Directory**: `frontend`
3. Set **Build Command**: `npm install && npm run build`
4. Set **Publish Directory**: `dist`
5. Add environment variables
6. Deploy

---

### ▲ Vercel

**Frontend:**
1. Import your repository
2. Set **Root Directory**: `frontend`
3. Framework Preset: `Vite`
4. Add environment variables in **Settings → Environment Variables**
5. Deploy

**Backend (Serverless Functions):**
- Vercel supports Python serverless functions
- Create `api/` directory in project root
- Each `.py` file becomes an endpoint
- Note: May require refactoring for serverless architecture

---

### 🚂 Railway

**Backend:**
1. New Project → Deploy from GitHub
2. Select `backend` as root directory
3. Railway auto-detects Python and installs dependencies
4. Add **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in **Variables** tab
6. Deploy

**Frontend:**
1. Add new service from same repo
2. Select `frontend` as root directory
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run preview` or use Vercel/Netlify for frontend
5. Deploy

---

### 🐳 Docker (VPS/Self-Hosted)

**Backend Dockerfile** (already exists in `backend/Dockerfile`):
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Docker Compose**:
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file:
      - ./backend/.env
    volumes:
      - ./backend/firebase-service-account.json:/app/firebase-service-account.json:ro
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://backend:8000
      - VITE_FIREBASE_API_KEY=${VITE_FIREBASE_API_KEY}
    depends_on:
      - backend
```

Deploy:
```bash
docker-compose up -d
```

---

## CORS Configuration

### Understanding CORS Origins

The `CORS_ORIGINS` environment variable controls which frontend domains can access your backend API.

### Configuration Examples

```bash
# Development (local testing)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Production (single domain)
CORS_ORIGINS=https://medai.yourdomain.com

# Production (multiple domains - Vercel preview + production)
CORS_ORIGINS=https://medai.vercel.app,https://medai-git-main.vercel.app,https://medai.yourdomain.com

# Mixed (development + production)
CORS_ORIGINS=http://localhost:5173,https://medai.vercel.app,https://medai.yourdomain.com
```

> [!IMPORTANT]
> **For production, NEVER use `CORS_ORIGINS=*`** - this allows any website to access your API, posing a security risk!

### Testing CORS

```bash
# Test CORS preflight request
curl -X OPTIONS https://your-backend-url.com/api/chat \
  -H "Origin: https://your-frontend-url.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Expected response should include:
# Access-Control-Allow-Origin: https://your-frontend-url.com
# Access-Control-Allow-Methods: POST, GET, ...
```

---

## Firebase Security Rules Deployment

### Step 1: Deploy Firestore Rules

Two files are provided: `firestore.rules` and `storage.rules`

**Option A: Via Firebase Console (Manual)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Copy the contents of `firestore.rules` from this project
5. Paste into the rules editor
6. Click **Publish**

**Option B: Via Firebase CLI (Automated)**

```bash
# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init

# Select:
# - Firestore
# - Storage
# Use existing firestore.rules and storage.rules files

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Step 2: Deploy Storage Rules

**Via Console:**
1. Navigate to **Storage** → **Rules**
2. Copy contents of `storage.rules`
3. Paste and **Publish**

**Via CLI:**
```bash
firebase deploy --only storage
```

### Step 3: Verify Rules are Active

1. Go to Firestore → Rules tab
2. Check the **Published** timestamp
3. Test: Try to access data from unauthenticated browser (should fail)

---

## Firebase Storage Setup

### Step 1: Enable Storage

1. Go to **Firebase Console** → **Storage**
2. Click **Get Started**
3. Choose **Start in production mode**
4. Select a **location** (same as Firestore recommended)
5. Click **Done**

### Step 2: Configure Storage CORS (Optional)

For direct client uploads, configure CORS:

**Create `cors.json`:**
```json
[
  {
    "origin": ["https://medai.yourdomain.com", "https://medai.vercel.app"],
    "method": ["GET", "POST", "PUT", "DELETE"],
    "maxAgeSeconds": 3600
  }
]
```

**Apply CORS:**
```bash
# Requires Google Cloud SDK
gsutil cors set cors.json gs://your-project.appspot.com
```

### Step 3: Verify Storage is Working

1. In Firebase Console → Storage
2. Check that the bucket exists
3. Try uploading a test file manually
4. Verify file appears in storage

---

## Pre-Deployment Checklist

### 🔒 Security Checklist

- [ ] Firebase service account JSON is in `.gitignore`
- [ ] Service account JSON is set as environment variable (not in code)
- [ ] CORS is configured with specific domains (not `*`)
- [ ] Firestore security rules are deployed
- [ ] Storage security rules are deployed
- [ ] All `.env` files are in `.gitignore`
- [ ] No API keys or secrets committed to Git

### ⚙️ Configuration Checklist

**Backend:**
- [ ] `CORS_ORIGINS` set with production frontend URL
- [ ] `FIREBASE_PROJECT_ID` matches your Firebase project
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` or `GOOGLE_APPLICATION_CREDENTIALS` set
- [ ] `GROQ_API_KEY` or `HUGGINGFACE_API_KEY` set
- [ ] Backend deployed and accessible

**Frontend:**
- [ ] `VITE_API_BASE_URL` points to production backend
- [ ] All `VITE_FIREBASE_*` variables set correctly
- [ ] Firebase config values match Firebase Console
- [ ] Frontend deployed and accessible

### 🔥 Firebase Services Checklist

- [ ] Firebase Authentication enabled (Email/Password, Google)
- [ ] Firestore database created and accessible
- [ ] Storage enabled and accessible
- [ ] Firestore rules deployed and tested
- [ ] Storage rules deployed and tested
- [ ] Test user account created for testing

### 🌐 Domain & DNS (If Using Custom Domain)

- [ ] Domain DNS configured (A record or CNAME)
- [ ] SSL/TLS certificate issued (usually automatic with platform)
- [ ] Domain verified in Firebase Console (if using Firebase Hosting)
- [ ] CORS includes custom domain URL

---

## Testing in Production

### Pre-Flight System Check

Before user testing, verify all services are running:

```bash
# Check backend health
curl https://your-backend-url.com/

# Expected response:
# {"status":"ok"}

# Check backend with authentication (requires test token)
curl -X POST https://your-backend-url.com/api/chat \
  -H "Content-Type: application/json" \
  -H "Origin: https://your-frontend-url.com" \
  -d '{"message":"test","triage":{"age":30,"gender":"Male","symptoms":"test"}}'
```

### Feature Testing Procedures

#### 1️⃣ Patient Authentication Flow

**Test Steps:**
- [ ] Navigate to production frontend URL
- [ ] Click "Start Consultation Now"
- [ ] Click "Sign Up"
- [ ] Enter email and password
- [ ] Submit registration
- [ ] Verify: Email verification sent (check Firebase Console → Authentication → Users)
- [ ] Verify: Redirected to chat page after signup
- [ ] Logout
- [ ] Login with same credentials
- [ ] Verify: Successful login and redirect

**Expected Outcome:**
- New user appears in Firebase Authentication
- User document created in Firestore `users/` collection
- No errors in browser console

---

#### 2️⃣ AI Chat Consultation

**Test Steps:**
- [ ] Login as patient
- [ ] Navigate to chat page
- [ ] Enter symptoms: "I have a headache and fever"
- [ ] Send message
- [ ] Verify: AI response received within 10 seconds
- [ ] Verify: Response is relevant to symptoms
- [ ] Check: Consultation saved to Firestore `consultations/` collection

**Expected Outcome:**
- AI responds with medical advice
- Consultation document created with:
  - `userId`: current user's UID
  - `deidentified_text`: user's message
  - `response`: AI's reply
  - `timestamp`: current time
  - `confidence`: 0.0-1.0 score

**Check Backend Logs:**
```bash
# Look for:
# - "Initialized Firebase app from FIREBASE_SERVICE_ACCOUNT_JSON"
# - AI model inference successful
# - No errors
```

---

#### 3️⃣ Lab Report Upload

**Test Steps:**
- [ ] Login as patient
- [ ] Navigate to "Upload Lab Results"
- [ ] Select a PDF or image file (sample lab report)
- [ ] Click Upload
- [ ] Verify: Upload progress shown
- [ ] Verify: File uploaded successfully
- [ ] Verify: AI summary generated
- [ ] Check Firebase Storage: File exists at `lab_reports/{userId}/{filename}`
- [ ] Check Firestore: Document created in `lab_reports/` collection

**Expected Outcome:**
- File visible in Firebase Console → Storage
- Lab report document in Firestore with:
  - `userId`: current user's UID
  - `fileUrl`: storage download URL
  - `summary`: AI-generated summary
  - `timestamp`: upload time

---

#### 4️⃣ Clinician Authentication

**Prerequisite:** Create a clinician account using backend script:

```bash
# SSH into your backend server or run locally with production .env
cd backend
source venv/bin/activate
python create_clinician.py
# Enter email, password, name, license number
```

**Test Steps:**
- [ ] Navigate to production frontend
- [ ] Click "For Clinicians"
- [ ] Login with clinician credentials
- [ ] Verify: Redirected to Clinician Dashboard
- [ ] Verify: Dashboard shows clinician name
- [ ] Check URL: Should be `/clinician-dashboard`

**Expected Outcome:**
- Clinician user in Firebase Authentication with role claim
- Clinician document in Firestore `clinicians/` collection
- No 401 or 403 errors

---

#### 5️⃣ Clinician Dashboard Features

**Test Steps:**
- [ ] Login as clinician
- [ ] View "Pending Consultation Requests"
- [ ] Click on a consultation request
- [ ] Review patient symptoms and AI recommendations
- [ ] Accept consultation
- [ ] Verify: Status changes to "Accepted"
- [ ] Add clinical notes
- [ ] Save notes
- [ ] Verify: Notes appear in Firestore `clinical_notes/` collection

**Expected Outcome:**
- Consultation request shows patient details
- Clinical notes saved with:
  - `clinicianId`: clinician's UID
  - `patientId`: patient's UID
  - `consultationRequestId`: request ID
  - `notes`: clinical observations
  - `timestamp`: creation time

---

#### 6️⃣ Chat History Persistence

**Test Steps:**
- [ ] Login as patient
- [ ] Send multiple chat messages
- [ ] Logout
- [ ] Login again
- [ ] Navigate to chat history
- [ ] Verify: All previous messages visible
- [ ] Verify: Messages load in chronological order

**Expected Outcome:**
- All consultations for user visible
- Sorted by timestamp
- No duplicate or missing messages

---

#### 7️⃣ Security Rules Testing

**Test User Isolation:**
- [ ] Create two patient accounts (Patient A, Patient B)
- [ ] Login as Patient A, create consultation
- [ ] Note the consultation ID from Firestore
- [ ] Logout, login as Patient B
- [ ] Try to access Patient A's consultation directly:
  Open browser console and run:
  ```javascript
  import { db } from './config/firebase'
  import { doc, getDoc } from 'firebase/firestore'
  
  const consultDoc = await getDoc(doc(db, 'consultations', 'PATIENT_A_CONSULT_ID'))
  console.log(consultDoc.data()) // Should be undefined or error
  ```
- [ ] Verify: Patient B cannot access Patient A's data

**Clinician Access:**
- [ ] Login as clinician
- [ ] Verify: Clinician can read all consultations
- [ ] Verify: Clinician can read all lab reports

**Expected Outcome:**
- Patients can only access their own data
- Clinicians can access all patient data
- Security rules enforced

---

#### 8️⃣ Storage Security Testing

**Test Upload Restrictions:**
- [ ] Login as Patient A (user ID: `userA123`)
- [ ] Inspect Storage upload code
- [ ] Try to upload to another user's folder:
  ```javascript
  // Attempt to upload to Patient B's folder
  const storageRef = ref(storage, 'lab_reports/userB456/malicious.pdf')
  await uploadBytes(storageRef, file) // Should fail with permission error
  ```
- [ ] Verify: Upload denied by security rules

**Expected Outcome:**
- Users can only upload to their own folders
- Cross-user uploads blocked
- Error: "Permission denied" in console

---

### Verification Commands

**Check Firestore Data:**
```bash
# Via Firebase CLI
firebase firestore:get /users/{userId}
firebase firestore:get /consultations/{consultId}
```

**Check Storage Files:**
```bash
# Via gsutil (Google Cloud SDK)
gsutil ls gs://your-project.appspot.com/lab_reports/
```

**Check Backend Logs:**
- Render: Dashboard → Logs tab
- Vercel: Dashboard → Functions → Select function → Logs
- Railway: Project → Deployments → Logs
- VPS: `tail -f /var/log/medai/backend.log` or `journalctl -u medai-backend -f`

**Check Frontend Logs:**
- Open browser DevTools → Console
- Look for Firebase initialization messages
- Look for API request/response logs
- Check Network tab for failed requests

---

## Troubleshooting

### 🚨 CORS Errors

**Symptom:**
```
Access to XMLHttpRequest at 'https://backend.com/api/chat' from origin 'https://frontend.com' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

**Causes & Solutions:**

1. **CORS_ORIGINS not set or incorrect**
   ```bash
   # Check backend environment variable
   echo $CORS_ORIGINS
   
   # Should match your frontend URL exactly (including https://)
   # Fix: Update CORS_ORIGINS and restart backend
   ```

2. **Trailing slash mismatch**
   ```bash
   # Wrong:
   CORS_ORIGINS=https://medai.com/
   
   # Correct:
   CORS_ORIGINS=https://medai.com
   ```

3. **Protocol mismatch (http vs https)**
   ```bash
   # Frontend uses https:// but CORS_ORIGINS has http://
   # Fix: Ensure protocol matches
   ```

**Verify CORS is working:**
```bash
curl -X OPTIONS https://your-backend.com/api/chat \
  -H "Origin: https://your-frontend.com" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Look for header in response:
# Access-Control-Allow-Origin: https://your-frontend.com
```

---

### 🔥 Firebase Authentication Failures

**Symptom:**
```
Firebase: Error (auth/invalid-api-key)
```

**Solution:**
- Go to Firebase Console → Project Settings → General
- Copy `Web API Key`
- Update `VITE_FIREBASE_API_KEY` in frontend environment
- Redeploy frontend

---

**Symptom:**
```
Firebase: Error (auth/project-not-found)
```

**Solution:**
- Verify `VITE_FIREBASE_PROJECT_ID` matches Firebase Console
- Ensure Firebase project is not deleted
- Check Firebase Console → Project Settings → Project ID

---

**Symptom:**
```
User signs up but doesn't appear in Firestore users/ collection
```

**Solution:**
- Check browser console for errors
- Verify Firestore rules allow user document creation
- Ensure frontend creates user document after signup:
  ```javascript
  // In signup handler
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    email: user.email,
    role: 'patient',
    createdAt: serverTimestamp()
  })
  ```

---

### 📦 Firebase Storage Upload Failures

**Symptom:**
```
FirebaseError: Missing or insufficient permissions
```

**Solution:**
- Check Storage rules are deployed: Firebase Console → Storage → Rules
- Verify user is authenticated before upload
- Check file path matches rules pattern: `lab_reports/{userId}/{fileName}`
- Ensure `userId` in path matches `request.auth.uid`

---

**Symptom:**
```
Upload succeeds but file not visible in Storage console
```

**Solution:**
- Hard refresh Firebase Console (Ctrl+Shift+R)
- Check correct storage bucket (some projects have multiple)
- Verify `VITE_FIREBASE_STORAGE_BUCKET` matches Firebase Console

---

### 🔐 Service Account Credential Issues

**Symptom:**
```
Failed to initialize firebase_admin: Could not load credentials
```

**Backend Logs:**
```
google.auth.exceptions.DefaultCredentialsError: Could not load credentials
```

**Solution:**

1. **Check environment variable is set:**
   ```bash
   # For Method 1 (JSON string)
   echo $FIREBASE_SERVICE_ACCOUNT_JSON | head -c 100
   # Should show: {"type":"service_account"...
   
   # For Method 2 (file path)
   echo $GOOGLE_APPLICATION_CREDENTIALS
   # Should show: /path/to/firebase-service-account.json
   ```

2. **Verify JSON is valid:**
   ```bash
   echo $FIREBASE_SERVICE_ACCOUNT_JSON | jq .
   # Should parse without errors
   ```

3. **Check file exists and is readable:**
   ```bash
   ls -la $GOOGLE_APPLICATION_CREDENTIALS
   # Should show -rw------- permissions
   cat $GOOGLE_APPLICATION_CREDENTIALS | jq .project_id
   # Should output your project ID
   ```

4. **Platform-specific issues:**
   - **Render**: Environment variable might be truncated if too long. Break into multiple variables or use file upload feature.
   - **Vercel**: Ensure variable is set for the correct environment (Production/Preview/Development)
   - **Railway**: Check variable is not hidden due to whitespace

---

### ❌ "Environment variable not found" Errors

**Symptom:**
Backend crashes with `KeyError: 'FIREBASE_PROJECT_ID'`

**Solution:**
- Verify all required environment variables are set on hosting platform
- Check variable names match exactly (case-sensitive)
- Restart backend service after adding variables
- Check platform's environment variable documentation

**Required variables checklist:**
- ✅ `FIREBASE_PROJECT_ID`
- ✅ `FIREBASE_SERVICE_ACCOUNT_JSON` OR `GOOGLE_APPLICATION_CREDENTIALS`
- ✅ `CORS_ORIGINS`
- ✅ `GROQ_API_KEY` OR `HUGGINGFACE_API_KEY`

---

### 🩺 Debug Mode

Enable verbose logging temporarily to diagnose issues:

**Backend:**
```bash
# Add to environment variables
LOG_LEVEL=debug

# Restart backend
# Check logs for detailed Firebase initialization and API calls
```

**Frontend:**
```javascript
// Add to firebase.js temporarily
firebase.setLogLevel('debug')

// Check browser console for Firebase debug logs
```

---

### 🔍 Where to Check Logs

| Platform | How to Access Logs |
|----------|-------------------|
| **Render** | Dashboard → Logs tab (real-time) |
| **Vercel** | Dashboard → Functions → Logs |
| **Railway** | Project → Deployments → Logs |
| **Heroku** | `heroku logs --tail` |
| **Docker** | `docker logs -f container_name` |
| **VPS** | `tail -f /var/log/app.log` or `journalctl -u your-service -f` |

**Browser Logs:**
- Open DevTools (F12)
- **Console tab**: JavaScript errors, Firebase warnings
- **Network tab**: Failed API requests, CORS errors
- **Application tab**: LocalStorage, Firebase Auth state

---

## Additional Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli
- **Firestore Security Rules**: https://firebase.google.com/docs/firestore/security/get-started
- **Storage Security Rules**: https://firebase.google.com/docs/storage/security
- **CORS on MDN**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

## Quick Reference

### Essential URLs

- **Firebase Console**: https://console.firebase.google.com/
- **Google Cloud Console**: https://console.cloud.google.com/
- **Render Dashboard**: https://dashboard.render.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Railway Dashboard**: https://railway.app/dashboard

### Common Commands

```bash
# Firebase CLI
firebase login
firebase projects:list
firebase deploy --only firestore:rules
firebase deploy --only storage

# Check backend health
curl https://your-backend.com/

# Test API endpoint
curl -X POST https://your-backend.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'

# View backend logs (Render)
# Dashboard → Logs

# View Firestore data
# Firebase Console → Firestore → Data
```

---

## Support

If you encounter issues not covered in this guide:

1. **Check Firebase Console** for service status and quota limits
2. **Review backend and frontend logs** for specific error messages
3. **Test locally first** with production environment variables
4. **Verify security rules** are not blocking legitimate requests
5. **Check Firebase quotas** (Storage: 5GB free, Firestore: 1GB free)

---

**Status:** ✅ Ready for Production Deployment

**Last Updated:** {current_date}

---

*For development setup, see [SETUP.md](./SETUP.md)*  
*For AI configuration, see [AI_IMPLEMENTATION.md](./AI_IMPLEMENTATION.md)*
