# 🔧 Fix Render Build Error - Quick Guide

The build failed because Render tried to install heavy ML libraries (spaCy, transformers) that aren't needed since you're using Groq API.

## Solution: Update Build Command

### Step 1: Go to Render Dashboard

1. Open https://dashboard.render.com/
2. Click on your **medai-backend** service

### Step 2: Update Build Command

1. Click **"Settings"** tab (left sidebar)
2. Scroll to **"Build & Deploy"** section
3. Find **"Build Command"**
4. Click **"Edit"** button
5. **Replace** the current command with:
   ```bash
   pip install -r requirements-production.txt
   ```
6. Click **"Save Changes"**

### Step 3: Manual Redeploy

1. Click **"Manual Deploy"** button (top right)
2. Select **"Deploy latest commit"**
3. Click **"Deploy"**

**This will take 3-5 minutes.**

---

## What We Fixed

✅ **Before**: Used `requirements.txt` with spaCy, transformers, torch (fails to build)  
✅ **After**: Using `requirements-production.txt` with only essential dependencies  
✅ **AI**: Groq API handles all AI inference (no local models needed)

---

## Verify Fix

Once the build completes:

1. Check **"Logs"** tab
2. Look for successful deployment:
   ```
   ==> Build successful!
   ==> Your service is live
   ```
3. Test your backend URL: `https://medai-backend.onrender.com/`
4. Should show: `{"status":"ok"}`

---

## If Build Still Fails

Check logs for the specific error and let me know. Common issues:
- Environment variables not set (check "Environment" tab)
- Wrong Python version (should use Python 3.10+)
- Missing dependencies in production requirements

---

## Alternative: Render.yaml (Future)

For future deployments, you can create `render.yaml` in project root:

```yaml
services:
  - type: web
    name: medai-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements-production.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.10.0
```

This will auto-configure settings for future deployments.
