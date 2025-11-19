# 🚀 Production Deployment Quick Start

**Quick reference for deploying MedAI to production**

For complete details, see [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)

---

## 📋 Pre-Deployment Checklist

### 1. Firebase Setup
- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore database created
- [ ] Storage enabled
- [ ] Service account JSON downloaded

### 2. Required Files Created
- [x] `firestore.rules` - Firestore security rules
- [x] `storage.rules` - Storage security rules  
- [x] `backend/env.example` - Backend environment template
- [x] `frontend/env.example` - Frontend environment template

### 3. Environment Variables Configured
- [ ] Backend: All required variables set on hosting platform
- [ ] Frontend: All VITE_* variables set
- [ ] CORS_ORIGINS includes production frontend URL
- [ ] AI API key set (GROQ_API_KEY or HUGGINGFACE_API_KEY)

---

## ⚡ Quick Deploy Steps

### Step 1: Deploy Firebase Security Rules

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage
```

### Step 2: Configure Backend Environment

**Required variables:**
```bash
CORS_ORIGINS=https://your-frontend-url.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
GROQ_API_KEY=gsk_your_api_key
```

### Step 3: Configure Frontend Environment

**Required variables:**
```bash
VITE_API_BASE_URL=https://your-backend-url.com
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 4: Deploy Services

Choose your platform and deploy:

| Platform | Backend Command | Frontend Command |
|----------|----------------|------------------|
| **Render** | Push to GitHub → Auto-deploy | Push to GitHub → Auto-deploy |
| **Vercel** | `vercel --prod` | `vercel --prod` |
| **Railway** | `railway up` | Deploy frontend separately |
| **Docker** | `docker-compose up -d` | Included in compose |

---

## ✅ Post-Deployment Testing

### 1. Health Check
```bash
curl https://your-backend-url.com/
# Expected: {"status":"ok"}
```

### 2. Test Authentication
- Visit frontend URL
- Sign up with test email
- Verify user appears in Firebase Console → Authentication

### 3. Test AI Chat
- Login as test user
- Send message: "I have a headache"
- Verify AI responds within 10 seconds

### 4. Test Lab Upload
- Upload a PDF file
- Verify file appears in Firebase Console → Storage
- Check Firestore for lab_reports document

### 5. Create Clinician Account
```bash
# SSH to backend or run locally with production .env
cd backend
python create_clinician.py
# Enter clinician details
```

### 6. Test Clinician Dashboard
- Login with clinician credentials
- Verify dashboard loads
- Check consultation requests appear

---

## 🔧 Common Issues

| Issue | Solution |
|-------|----------|
| **CORS Error** | Update `CORS_ORIGINS` to include frontend URL |
| **Firebase Auth Error** | Verify all `VITE_FIREBASE_*` variables set correctly |
| **Storage Upload Fails** | Deploy storage rules, check user authenticated |
| **Service Account Error** | Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON |

---

## 📚 Full Documentation

- **Complete Deployment Guide**: [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md)
- **Development Setup**: [SETUP.md](./SETUP.md)  
- **AI Configuration**: [AI_IMPLEMENTATION.md](./AI_IMPLEMENTATION.md)
- **Database Schema**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

---

## 🔐 Security Reminders

- ✅ Never commit `firebase-service-account.json` to Git
- ✅ Never use `CORS_ORIGINS=*` in production
- ✅ Always use HTTPS for production URLs
- ✅ Deploy security rules before allowing user access
- ✅ Test security rules with different user roles

---

**Need Help?** See the [Troubleshooting section](./PRODUCTION_DEPLOYMENT.md#troubleshooting) in PRODUCTION_DEPLOYMENT.md
