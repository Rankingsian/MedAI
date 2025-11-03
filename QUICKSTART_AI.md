# 🚀 Quick Start: Activate AI Features

## 3-Step Setup (5 minutes)

### Step 1: Get Your Free API Key

1. Visit: https://huggingface.co/settings/tokens
2. Click **"New token"**
3. Name: `MedAI-Inference`
4. Access: Select **"Write"** (REQUIRED for Inference API)
   - ⚠️ Don't select "Read" - it won't work!
5. Click **"Generate"**
6. **Copy the token** (starts with `hf_...`)

### Step 2: Add API Key to Backend

```bash
cd backend
echo "HUGGINGFACE_API_KEY=hf_your_token_here" >> .env
```

**Or edit manually:**
```bash
nano backend/.env
# Add this line:
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

### Step 3: Restart Backend Server

```bash
# Stop current server (Ctrl+C if running)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

---

## ✅ Test It Works

### Test 1: Chat Endpoint

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I have a fever and cough",
    "triage": {"age": 25, "gender": "Male"}
  }'
```

**Expected:** AI-generated medical advice

### Test 2: Frontend Chat

1. Open: http://localhost:5173
2. Login/Signup
3. Go to `/home`
4. Click **"Start New Consultation"**
5. Fill triage form
6. Submit and chat

**Expected:** Real AI responses in chat!

---

## 🎉 That's It!

Your MedAI now has:
- ✅ BioBERT for medical Q&A
- ✅ ClinicalBERT for lab analysis
- ✅ MedAlpaca for conversations
- ✅ BioGPT for disease prediction

All powered by Hugging Face's cloud AI!

---

## 📝 Notes

- **First request?** May take 20-30 seconds (model loading)
- **Free tier?** ~30 requests/hour per model
- **Production?** Consider HF Pro ($9/month)

---

## 🆘 Problems?

**"API key not configured"**
→ Check `.env` file has `HUGGINGFACE_API_KEY=hf_...`

**503 Error**
→ Normal! Model is loading. Wait 20s and retry.

**401 Error**
→ Invalid API key. Generate new one on HF website.

---

**Full docs:** See `AI_IMPLEMENTATION.md`
