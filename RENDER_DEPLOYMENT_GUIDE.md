# 🎨 Backend Deployment to Render

Step-by-step guide to deploy MedAI backend to Render.

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub repository: https://github.com/Rankingsian/MedAI
- ✅ Firebase service account JSON file downloaded
- ✅ Groq API key
- ✅ Firebase project ID

---

## Step 1: Convert Service Account JSON to Single Line

Open terminal and run:

```bash
# Navigate to where you downloaded the service account JSON
cd ~/Downloads

# Convert to single line (copy the output!)
cat medai-prod-*.json | tr -d '\n'
```

**Copy the entire output** - you'll paste this into Render as an environment variable.

---

## Step 2: Sign Up / Login to Render

1. Go to: https://dashboard.render.com/
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Render to access your GitHub account

---

## Step 3: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Build and deploy from a Git repository"**
4. Click **"Next"**

---

## Step 4: Connect Repository

1. Find **"Rankingsian/MedAI"** in the list
   - If you don't see it, click **"Configure account"** and grant access
2. Click **"Connect"** next to MedAI repository

---

## Step 5: Configure Service Settings

Fill in the following:

### Basic Settings
- **Name**: `medai-backend` (or your preferred name)
- **Region**: Choose closest to you (e.g., Oregon (US West), Frankfurt (EU))
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Python 3`

### Build Settings
- **Build Command**: 
  ```bash
  pip install -r requirements.txt
  ```

- **Start Command**:
  ```bash
  uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### Instance Type
- Select **"Free"** (for now, can upgrade later)

---

## Step 6: Add Environment Variables

Click **"Advanced"** button, then scroll to **"Environment Variables"**.

Click **"Add Environment Variable"** for each of these:

### Required Variables:

1. **FIREBASE_PROJECT_ID**
   - Value: `medai-prod` (or your Firebase project ID)

2. **FIREBASE_SERVICE_ACCOUNT_JSON**
   - Value: Paste the single-line JSON from Step 1
   - ⚠️ Make sure it's the ENTIRE JSON string!

3. **GROQ_API_KEY**
   - Value: Your Groq API key (starts with `gsk_`)

4. **CORS_ORIGINS**
   - Value: `*` (for now, we'll update this after frontend deployment)

5. **ENVIRONMENT**
   - Value: `production`

### Optional but Recommended:

6. **LOG_LEVEL**
   - Value: `info`

7. **APP_PORT**
   - Value: `8000`

---

## Step 7: Deploy!

1. Review all settings
2. Click **"Create Web Service"** button at the bottom
3. Render will start building your app

**This will take 5-8 minutes.** You'll see:
- ✅ Cloning repository
- ✅ Installing dependencies
- ✅ Starting service

---

## Step 8: Verify Deployment

Once deployment shows **"Live"**:

1. Look for **"Your service is live at"** near the top
2. Copy your URL (e.g., `https://medai-backend.onrender.com`)
3. Click the URL to open in browser
4. You should see: `{"status":"ok"}`

### Test the API:

```bash
# Replace with your actual URL
curl https://medai-backend.onrender.com/

# Expected response:
{"status":"ok"}
```

---

## Step 9: Check Logs for Firebase Initialization

1. In Render dashboard, click **"Logs"** tab
2. Look for this line:
   ```
   Initialized Firebase app from FIREBASE_SERVICE_ACCOUNT_JSON env var
   ```
3. If you see this, Firebase is configured correctly! ✅

---

## ✅ Backend Deployment Complete!

**Your backend URL:** `https://medai-backend.onrender.com`

**Save this URL** - you'll need it for the frontend deployment!

---

## Troubleshooting

### Build fails with "requirements.txt not found"
- Check that **Root Directory** is set to `backend`

### Service starts but shows "Internal Server Error"
- Check **Logs** tab for errors
- Verify all environment variables are set correctly
- Confirm `FIREBASE_SERVICE_ACCOUNT_JSON` is valid JSON

### "Firebase initialization failed"
- Check that service account JSON is complete (no truncation)
- Verify it's a single line with no newlines
- Check `FIREBASE_PROJECT_ID` matches your Firebase project

---

## Next Step

Proceed to frontend deployment on Vercel!
