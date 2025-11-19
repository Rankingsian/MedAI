# ▲ Frontend Deployment to Vercel

Step-by-step guide to deploy MedAI frontend to Vercel.

---

## Prerequisites

Before starting, ensure you have:
- ✅ GitHub repository: https://github.com/Rankingsian/MedAI
- ✅ Backend deployed to Render (URL saved)
- ✅ Firebase web app configuration values
- ✅ Firebase project details

---

## Step 1: Sign Up / Login to Vercel

1. Go to: https://vercel.com/
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Project

1. On Vercel dashboard, click **"Add New..."** button
2. Select **"Project"**
3. In the "Import Git Repository" section:
   - Find **"Rankingsian/MedAI"**
   - If not shown, click **"Add GitHub Account"** or **"Adjust GitHub App Permissions"**
4. Click **"Import"** next to MedAI repository

---

## Step 3: Configure Project

### Framework Settings
- **Framework Preset**: Vite (should auto-detect)
- **Root Directory**: Click **"Edit"** → Enter `frontend` → Save

### Build Settings (Auto-detected)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

Leave these as auto-detected unless you need to change them.

---

## Step 4: Add Environment Variables

Click **"Environment Variables"** section.

Add each of these variables:

### Backend API URL

1. **Key**: `VITE_API_BASE_URL`
   **Value**: `https://medai-backend.onrender.com` (your Render backend URL)
   **Environment**: Production ✅ Preview ✅ Development ✅

### Firebase Configuration

Get these values from Firebase Console → Project Settings → Your apps:

2. **Key**: `VITE_FIREBASE_API_KEY`
   **Value**: `AIza...` (from Firebase config)
   **Environment**: All

3. **Key**: `VITE_FIREBASE_AUTH_DOMAIN`
   **Value**: `medai-prod.firebaseapp.com`
   **Environment**: All

4. **Key**: `VITE_FIREBASE_PROJECT_ID`
   **Value**: `medai-prod`
   **Environment**: All

5. **Key**: `VITE_FIREBASE_STORAGE_BUCKET`
   **Value**: `medai-prod.appspot.com`
   **Environment**: All

6. **Key**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
   **Value**: `123456789` (your sender ID)
   **Environment**: All

7. **Key**: `VITE_FIREBASE_APP_ID`
   **Value**: `1:123:web:abc...` (your app ID)
   **Environment**: All

### Optional Variables

8. **Key**: `VITE_FIREBASE_MEASUREMENT_ID` (if you have analytics)
   **Value**: `G-XXXXXXXXXX`
   **Environment**: All

---

## Step 5: Deploy!

1. Review all settings
2. Click **"Deploy"** button
3. Vercel will build and deploy your frontend

**This takes 2-4 minutes.** You'll see:
- ✅ Building
- ✅ Deploying
- ✅ Ready

---

## Step 6: Get Your Frontend URL

Once deployment completes:

1. You'll see **"Congratulations!"** 🎉
2. Your app URL will be shown (e.g., `https://medai-kappa.vercel.app`)
3. Click **"Visit"** to open your deployed app
4. **Copy and save this URL** - you need it for CORS configuration!

---

## Step 7: Verify Frontend Works

1. Visit your Vercel URL
2. You should see the MedAI landing page
3. Open browser DevTools (F12) → Console tab
4. Check for errors:
   - ✅ No Firebase configuration warnings
   - ✅ No API connection errors

**Don't test features yet** - we need to update CORS first!

---

## ✅ Frontend Deployment Complete!

**Your frontend URL:** `https://medai-kappa.vercel.app` (example)

**Save this URL** - you need it for the next step (CORS configuration)!

---

## Troubleshooting

### Build fails with "dist directory not found"
- Check **Root Directory** is set to `frontend`
- Verify **Output Directory** is `dist`

### "VITE_* is not defined" error
- Ensure all environment variables start with `VITE_`
- Redeploy after adding missing variables

### Firebase errors in browser console
- Check all Firebase config values are correct
- Verify values match Firebase Console → Project Settings

### Blank page after deployment
- Check browser console for errors
- Verify `VITE_API_BASE_URL` is set correctly
- Check Network tab for failed requests

---

## Next Step

Update CORS configuration in your Render backend to allow requests from Vercel!
