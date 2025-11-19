# 🔍 Debugging 502 Error - Quick Guide

A 502 error means your app built successfully but crashes when starting. Let's fix it!

---

## Step 1: Check the Logs (MOST IMPORTANT)

### On Render:
1. Go to your **medai-backend** service
2. Click **"Logs"** tab (left sidebar)
3. Look for red error messages at the bottom
4. Look for lines starting with `ERROR` or `Traceback`

### On Railway:
1. Click your service
2. Click **"Deployments"** tab
3. Click the latest deployment
4. Scroll to bottom of logs

**Common errors you might see:**

### Error 1: "FIREBASE_PROJECT_ID not found"
```
KeyError: 'FIREBASE_PROJECT_ID'
```
**Fix:** Environment variable not set. Go to Settings → Environment and add it.

### Error 2: "Failed to initialize Firebase"
```
Failed to initialize firebase_admin
```
**Fix:** `FIREBASE_SERVICE_ACCOUNT_JSON` is missing or invalid.

### Error 3: "No module named 'groq'"
```
ModuleNotFoundError: No module named 'groq'
```
**Fix:** Build used wrong requirements file. Verify build command.

### Error 4: "Address already in use"
```
OSError: [Errno 98] Address already in use
```
**Fix:** Port configuration issue (unlikely on cloud platforms).

---

## Step 2: Verify Environment Variables

### Required Variables:

Go to your service → **Settings** → **Environment Variables**

Check these are set:

1. ✅ `FIREBASE_PROJECT_ID` = your-project-id
2. ✅ `FIREBASE_SERVICE_ACCOUNT_JSON` = {full JSON string}
3. ✅ `GROQ_API_KEY` = gsk_your_key_here  
4. ✅ `CORS_ORIGINS` = * (for now)

### How to Check if FIREBASE_SERVICE_ACCOUNT_JSON is Valid:

It should:
- Start with `{"type":"service_account"`
- Be ONE LONG LINE (no line breaks)
- End with `}`
- Be around 2000+ characters long

---

## Step 3: Quick Test - Minimal Environment

If you're not sure which variable is the problem:

**Temporarily remove all optional variables**, keep only:
- `GROQ_API_KEY`
- `FIREBASE_PROJECT_ID`  
- `FIREBASE_SERVICE_ACCOUNT_JSON`

Redeploy and see if 502 persists.

---

## Step 4: Common Fixes

### Fix A: Firebase Service Account JSON Issue

The JSON might be truncated or have newlines. Let's regenerate it:

```bash
# On your local machine, navigate to where you downloaded the service account JSON
cd ~/Downloads

# Convert to single line and copy
cat your-firebase-service-account.json | jq -c | pbcopy  # Mac
cat your-firebase-service-account.json | jq -c | xclip   # Linux
```

Then paste into Render/Railway environment variable.

### Fix B: Port Binding Issue

The app might not be binding to the correct port. 

**On Render:** The PORT environment variable is auto-set, should work.

**On Railway:** Add environment variable:
- Key: `PORT`
- Value: Leave blank (Railway auto-fills)

---

## Step 5: Enable Debug Logging

Add this environment variable temporarily:
- Key: `LOG_LEVEL`
- Value: `debug`

This will show more detailed logs.

---

## 🚨 Share Your Logs

**Please share:**
1. The last 20-30 lines of logs from your deployment
2. Any error messages you see
3. Screenshot of your Environment Variables page (hide the actual values)

**Where to find logs:**
- **Render**: Click service → Logs tab → copy last 30 lines
- **Railway**: Click service → Deployments → latest → scroll to bottom

Paste the logs here and I'll tell you exactly what's wrong!

---

## Quick Checklist

- [ ] Build succeeded (you confirmed ✅)
- [ ] Checked logs for error messages
- [ ] Verified `FIREBASE_PROJECT_ID` is set
- [ ] Verified `FIREBASE_SERVICE_ACCOUNT_JSON` is set (and is valid JSON)
- [ ] Verified `GROQ_API_KEY` is set
- [ ] Tried redeploying after setting variables

---

**Next Step:** Share your deployment logs with me!
