# 🔥 Firebase Setup Guide for MedAI

Quick guide to set up your Firebase project and deploy security rules.

---

## Step 1: Create Firebase Project (5 minutes)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Click "Add project" or "Create a project"

2. **Configure Project**
   - **Project name**: `medai-prod` (or your preferred name)
   - **Google Analytics**: Optional (you can enable later)
   - Click "Create project"
   - Wait for creation (~30 seconds)
   - Click "Continue"

---

## Step 2: Enable Firebase Authentication (2 minutes)

1. In Firebase Console, click **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Click **"Email/Password"** under "Sign-in providers"
4. **Enable** the "Email/Password" toggle
5. Click **"Save"**

**Optional but recommended**: Enable Google Sign-In
- Click "Google" provider
- Enable toggle
- Select support email
- Click "Save"

---

## Step 3: Create Firestore Database (2 minutes)

1. Click **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. **Start in**: **Production mode** (we'll deploy our custom rules next)
4. **Location**: Choose closest to your users (e.g., `us-central`, `europe-west`, `asia-southeast`)
5. Click **"Enable"**
6. Wait for database creation (~30 seconds)

---

## Step 4: Enable Firebase Storage (1 minute)

1. Click **"Storage"** in left sidebar
2. Click **"Get started"**
3. **Start in**: **Production mode**
4. **Location**: Use same as Firestore
5. Click **"Done"**

---

## Step 5: Download Service Account JSON (2 minutes)

1. Click **⚙️ Project Settings** (gear icon in left sidebar)
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Click **"Generate key"** in the popup
5. **Save the file** - it downloads as `medai-prod-xxxxx.json`
6. **IMPORTANT**: Keep this file secure, never share it!

---

## Step 6: Get Firebase Web App Config (2 minutes)

1. Still in **Project Settings**, go to **"General"** tab
2. Scroll down to **"Your apps"** section
3. Click the **web icon** `</>`
4. **App nickname**: `MedAI Web`
5. **DO NOT** check "Firebase Hosting"
6. Click **"Register app"**
7. **Copy** the `firebaseConfig` object values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",              // ← Copy this
  authDomain: "medai-prod.firebaseapp.com",   // ← Copy this
  projectId: "medai-prod",         // ← Copy this
  storageBucket: "medai-prod.appspot.com",    // ← Copy this
  messagingSenderId: "123456789",  // ← Copy this
  appId: "1:123:web:abc..."        // ← Copy this
};
```

8. **Save these values** - you'll need them for frontend deployment
9. Click **"Continue to console"**

---

## Step 7: Install Firebase CLI (1 minute)

Open your terminal and run:

```bash
npm install -g firebase-tools
```

Wait for installation to complete.

---

## Step 8: Login to Firebase (1 minute)

```bash
firebase login
```

- A browser window will open
- Select your Google account
- Click "Allow" to grant permissions
- Return to terminal, you should see "Success!"

---

## Step 9: Initialize Firebase in Your Project (2 minutes)

In your MedAI project directory:

```bash
cd /home/aian_tech/projects/plp_projects/final_project/MedAI
firebase init
```

**Answer the prompts:**

1. **Which Firebase features?** 
   - Use arrow keys to navigate
   - Press SPACE to select: `Firestore` and `Storage`
   - Press ENTER

2. **Use an existing project or create a new one?**
   - Choose: `Use an existing project`
   - Select your `medai-prod` project

3. **What file should be used for Firestore Rules?**
   - Press ENTER to accept: `firestore.rules` ✅ (we already have this file!)

4. **What file should be used for Firestore indexes?**
   - Press ENTER to accept: `firestore.indexes.json`

5. **What file should be used for Storage Rules?**
   - Type: `storage.rules`
   - Press ENTER ✅ (we already have this file!)

6. **File firestore.rules already exists. Overwrite?**
   - Type: `N` (No) - we want to keep our rules!

7. **File storage.rules already exists. Overwrite?**
   - Type: `N` (No) - we want to keep our rules!

---

## Step 10: Deploy Security Rules (1 minute)

```bash
firebase deploy --only firestore:rules,storage
```

**Expected output:**
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/medai-prod/overview
```

---

## Step 11: Verify Rules Deployed

1. Go back to **Firebase Console**
2. Click **"Firestore Database"** → **"Rules"** tab
3. You should see your rules with a recent timestamp
4. Click **"Storage"** → **"Rules"** tab  
5. You should see your storage rules

---

## ✅ Firebase Setup Complete!

**What you now have:**
- ✅ Firebase project created
- ✅ Authentication enabled (Email/Password)
- ✅ Firestore database created
- ✅ Storage enabled
- ✅ Security rules deployed
- ✅ Service account JSON downloaded
- ✅ Web app config values copied

**What you need for deployment:**

### For Backend (Render):
```bash
# Project ID (from Firebase Console → Project Settings)
FIREBASE_PROJECT_ID=medai-prod

# Service account JSON (convert to single line)
cat ~/Downloads/medai-prod-xxxxx.json | tr -d '\n'
# Copy the output for Render environment variable
```

### For Frontend (Vercel):
```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=medai-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=medai-prod
VITE_FIREBASE_STORAGE_BUCKET=medai-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc...
```

---

## 🚀 Ready for Next Step!

Once you've completed this Firebase setup, we'll proceed to:
1. Deploy backend to Render
2. Deploy frontend to Vercel
3. Test everything!
