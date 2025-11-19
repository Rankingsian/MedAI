# 🔧 URGENT: Update Render Build Command

## The Problem
Render is still trying to use `requirements.txt` which includes spaCy (causing the blis build error).

## The Solution
Tell Render to use `requirements-production.txt` instead.

---

## EXACT STEPS (Follow Carefully):

### Step 1: Go to Render Dashboard
1. Open: https://dashboard.render.com/
2. You should see your **medai-backend** service
3. **Click on it**

### Step 2: Open Settings
- On the left sidebar, click **"Settings"** (gear icon)

### Step 3: Find Build Command Section
- Scroll down until you see **"Build & Deploy"** section
- You'll see a field labeled **"Build Command"**
- It currently says: `pip install -r requirements.txt`

### Step 4: Edit Build Command
1. Click the **pencil/edit icon** next to "Build Command"
2. **Clear the existing text**
3. **Type exactly**:
   ```
   pip install -r requirements-production.txt
   ```
4. Click **"Save Changes"** button

### Step 5: Trigger Manual Deploy
1. Scroll to the top of the page
2. Click **"Manual Deploy"** button (top right)
3. Select **"Deploy latest commit"**
4. Click **"Deploy"**

---

## What to Expect

**The build will now:**
- ✅ Install lightweight dependencies only
- ✅ Skip spaCy, transformers, torch (no blis error!)
- ✅ Complete in 3-5 minutes
- ✅ Show "Build successful!" message

**You'll see in logs:**
```
Collecting groq==0.33.0
Collecting firebase-admin==6.5.0
...
==> Build successful!
==> Your service is live at https://medai-backend.onrender.com
```

---

## If You Don't See the Edit Button

Some users report Render UI differences:

**Alternative Method:**
1. Go to **Settings** tab
2. Look for **"Build Command"** under "Build & Deploy"
3.  Click anywhere in that section
4. It should become editable
5. Change the command and save

---

## Verify It Worked

Once deployed, test:
```bash
curl https://your-backend-url.onrender.com/
```

Should return: `{"status":"ok"}`

---

## Still Having Issues?

If the build command field is not editable or you can't find it:

1. Take a screenshot of your Render Settings page
2. Share it with me
3. I'll guide you through alternate deployment methods (render.yaml or Vercel Functions)

---

**IMPORTANT**: You MUST change the build command. The code is already fixed and pushed to GitHub. The only thing blocking you is Render still using the old requirements file.
