# 🧪 Test Hugging Face Models

## ⚠️ IMPORTANT: API Endpoint Updated (November 2025)

HuggingFace has migrated to a new Inference Providers API:
- ❌ **Old:** `api-inference.huggingface.co` (deprecated, returns 404)
- ✅ **New:** `router.huggingface.co/hf-inference` (active)

**This has been updated in the code!**

## Issue: 404 Not Found

If you're still getting 404 errors, it could mean:
1. The old endpoint was being used (now fixed)
2. The model isn't available on the free tier

## ✅ Known Working Models (Free Tier)

Try these models that are **confirmed** to work:

### Option 1: GPT-2 (General Purpose)
```python
MODELS = {
    "biobert": "gpt2",
    "clinicalbert": "gpt2",
    "medalpaca": "gpt2",
    "biogpt": "gpt2",
}
```
- ✅ Always available
- ⚠️ Not medical-specific
- ✅ Fast responses

### Option 2: DistilGPT-2 (Smaller, Faster)
```python
MODELS = {
    "biobert": "distilgpt2",
    "clinicalbert": "distilgpt2",
    "medalpaca": "distilgpt2",
    "biogpt": "distilgpt2",
}
```
- ✅ Always available
- ✅ Faster than GPT-2
- ⚠️ Not medical-specific

### Option 3: Bio_ClinicalBERT (If accessible)
```python
MODELS = {
    "biobert": "emilyalsentzer/Bio_ClinicalBERT",
    "clinicalbert": "emilyalsentzer/Bio_ClinicalBERT",
    "medalpaca": "emilyalsentzer/Bio_ClinicalBERT",
    "biogpt": "emilyalsentzer/Bio_ClinicalBERT",
}
```
- ⚠️ May require special access
- ✅ Medical-focused

## 🔍 How to Test a Model

### Via curl (NEW ENDPOINT):
```bash
curl https://router.huggingface.co/hf-inference/models/gpt2 \
    -X POST \
    -H "Authorization: Bearer hf_YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"inputs": "What causes fever?"}'
```

### Via curl (OLD ENDPOINT - DEPRECATED):
```bash
# ❌ This will return 404 as of November 2025
curl https://api-inference.huggingface.co/models/gpt2 \
    -X POST \
    -H "Authorization: Bearer hf_YOUR_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"inputs": "What causes fever?"}'
```

### Expected Response:
- ✅ 200: Model works!
- ❌ 404: Model not found
- ❌ 403: Insufficient permissions
- ⚠️ 503: Model loading (wait 20s, retry)

## 🚀 Quick Fix

Edit `backend/app/services/ai_service.py`:

```python
# TEMPORARY: Use GPT-2 until we find accessible medical models
MODELS = {
    "biobert": "gpt2",
    "clinicalbert": "gpt2", 
    "medalpaca": "gpt2",
    "biogpt": "gpt2",
}
```

Then restart backend:
```bash
# Stop server (Ctrl+C)
# Start again
uvicorn app.main:app --reload
```

## 💡 Alternative: Use OpenAI or Anthropic

If HF Inference API doesn't have accessible medical models, consider:

1. **OpenAI GPT-4**
   - Excellent medical knowledge
   - Requires paid API key
   - More reliable

2. **Anthropic Claude**
   - Great for medical Q&A
   - Requires API key
   - Good medical reasoning

3. **Local Models**
   - Download BioGPT locally
   - Run with transformers library
   - Requires GPU/more RAM

## 📝 Current Status

**Issue:** `medalpaca/medalpaca-13b` returns 404

**Why:** 
- Model might not exist
- Might require special access
- Might not be on free Inference API

**Solution:** Using `microsoft/BioGPT` or `gpt2` as fallback

## 🔧 To Test What Works

1. Check model page: https://huggingface.co/microsoft/BioGPT
2. Look for "Hosted inference API" widget
3. If not present → Model not on free tier
4. Try model in browser first before coding

---

**Current recommendation:** Start with `gpt2` to verify everything works, then explore medical models.
