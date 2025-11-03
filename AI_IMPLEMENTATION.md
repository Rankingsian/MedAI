# 🤖 AI Implementation Guide - MedAI

## Overview

MedAI uses **Hugging Face's Inference API** to access state-of-the-art medical AI models remotely without requiring local model downloads or GPU hardware.

---

## 🧠 AI Models Integrated

### 1. **BioBERT** (`dmis-lab/biobert-base-cased-v1.1`)
- **Type:** Question Answering / NER
- **Purpose:** Understanding medical terminology and symptom descriptions
- **Use Case:** When users ask specific medical questions
- **Function:** `query_biobert(text)`

### 2. **ClinicalBERT** (`emilyalsentzer/Bio_ClinicalBERT`)
- **Type:** Text Classification / Analysis
- **Purpose:** Analyzing clinical notes and lab results
- **Use Case:** Lab report summarization, medical text classification
- **Function:** `query_clinicalbert(text)`

### 3. **MedAlpaca 13B** (`medalpaca/medalpaca-13b`)
- **Type:** Conversational AI
- **Purpose:** Generating conversational medical advice
- **Use Case:** Primary model for chat consultations
- **Function:** `query_medalpaca(text)`

### 4. **BioGPT-Large** (`microsoft/BioGPT-Large`)
- **Type:** Text Generation
- **Purpose:** Disease prediction and medical text generation
- **Use Case:** Fallback model, general medical queries
- **Function:** `query_biogpt(text)`

---

## 🔧 Setup Instructions

### Step 1: Get Hugging Face API Key

1. Go to https://huggingface.co/settings/tokens
2. Click "New token"
3. Name it (e.g., "MedAI-Inference")
4. Select **"Write"** access (REQUIRED for Inference API)
   - ⚠️ "Read" access is NOT sufficient!
5. Copy the token

### Step 2: Configure Environment

Add to `backend/.env`:

```bash
HUGGINGFACE_API_KEY=hf_your_actual_token_here
```

### Step 3: Restart Backend

```bash
cd backend
source venv/bin/activate  # if using virtual environment
uvicorn app.main:app --reload
```

---

## 📡 API Structure

### Response Format

All AI functions return a structured response:

```json
{
  "model": "medalpaca/medalpaca-13b",
  "input": "I have a headache and fever",
  "output": "Based on your symptoms...",
  "confidence": 0.87
}
```

### Error Handling

- **503 Error (Model Loading):** Automatically waits 20s and retries
- **Missing API Key:** Returns friendly error message
- **Timeout:** 30-second timeout per request
- **HTTP Errors:** Logged with full error details

---

## 🎯 Usage Examples

### Example 1: Chat Consultation

```python
# In your endpoint
from app.services import ai_service

result = await ai_service.process_chat(
    message="I have chest pain",
    triage={"age": 45, "gender": "Male"}
)
# Uses MedAlpaca for conversational response
```

### Example 2: Lab Report Analysis

```python
result = await ai_service.summarize_lab_text(
    parsed_text="Glucose: 120 mg/dL, Cholesterol: 240 mg/dL..."
)
# Uses ClinicalBERT for analysis
```

### Example 3: Direct Model Query

```python
from app.services.ai_service import query_biobert

result = await query_biobert(
    "What causes diabetes?"
)
print(result["output"])
```

---

## ⚙️ Configuration

### Model Parameters

Each model supports different parameters:

**BioBERT:**
```python
{
    "max_length": 200,
    "temperature": 0.7
}
```

**ClinicalBERT:**
```python
{
    "max_length": 150
}
```

**MedAlpaca:**
```python
{
    "max_new_tokens": 300,
    "temperature": 0.8,
    "top_p": 0.9
}
```

**BioGPT:**
```python
{
    "max_length": 200,
    "temperature": 0.7
}
```

### Customizing Model Selection

To change which model is used for different tasks, modify `backend/app/services/ai_service.py`:

```python
# In process_chat function
# Change from MedAlpaca to BioGPT:
ai_response = await query_biogpt(deid_text)  # instead of query_medalpaca
```

---

## 🚀 Performance

### First Request
- **Time:** ~15-30 seconds
- **Reason:** Model needs to load on HF servers
- **Status:** 503 error, auto-retry

### Subsequent Requests
- **Time:** 2-5 seconds
- **Cached:** Model stays loaded for ~15 minutes

### Optimization Tips
1. **Warm-up requests:** Send a test query on startup
2. **Concurrent requests:** Use `asyncio.gather()` for parallel queries
3. **Caching:** Implement response caching for common queries

---

## 🔒 Security & Privacy

### Data Handling
- All patient data is **de-identified** before sending to AI models
- Uses `app.utils.deid` module for PII removal
- No raw patient data is sent to external APIs

### API Key Security
- Store API key in `.env` file (never commit to Git)
- `.env` is in `.gitignore`
- Use environment variables in production

---

## 🐛 Troubleshooting

### Issue: "API key not configured"

**Solution:**
```bash
# Check if .env file exists
cat backend/.env

# Verify HUGGINGFACE_API_KEY is set
echo $HUGGINGFACE_API_KEY

# Restart backend server
```

### Issue: 503 Service Unavailable

**Cause:** Model is loading (cold start)

**Solution:** Wait 20-30 seconds, the code automatically retries

### Issue: 401 Unauthorized

**Cause:** Invalid or expired API key

**Solution:**
1. Generate new token at https://huggingface.co/settings/tokens
2. Update `HUGGINGFACE_API_KEY` in `.env`
3. Restart backend

### Issue: 403 Forbidden - "insufficient permissions"

**Cause:** API token has "Read" access instead of "Write"

**Solution:**
1. Go to https://huggingface.co/settings/tokens
2. Create NEW token with **"Write"** access
3. Replace old token in `.env`
4. Restart backend

**Note:** The Inference API requires "Write" permissions, not just "Read"!

### Issue: Slow Responses

**Cause:** Model cold start or high HF server load

**Solutions:**
- Implement request caching
- Use webhook/async processing for non-urgent requests
- Consider upgrading to HF Pro for faster inference

---

## 📊 Monitoring

### Logging

All AI requests are logged:

```python
import logging
log = logging.getLogger(__name__)

# Logs include:
- Model name and endpoint
- Request input (de-identified)
- Response time
- Errors and retries
```

### Metrics to Track

1. **Response Time:** Average time per model
2. **Error Rate:** Failed requests / total requests
3. **Confidence Scores:** Average AI confidence
4. **Model Usage:** Which models are used most

---

## 💰 Cost Considerations

### Hugging Face Pricing

- **Free Tier:** Available for all models
- **Rate Limits:** ~30 requests/hour per model
- **Pro Account ($9/month):**
  - Faster inference
  - Higher rate limits
  - Priority access

### Cost Optimization

1. **Cache responses** for common queries
2. **Batch similar requests** when possible
3. **Use lighter models** for simpler tasks
4. **Implement request throttling**

---

## 🔄 Migration Path

### From Placeholder to Production

Current implementation is **production-ready** with:
- ✅ Real AI inference
- ✅ Error handling
- ✅ Async processing
- ✅ De-identification
- ✅ Logging

### Future Enhancements

1. **Add more models:**
   - Fine-tuned disease classifier
   - Medical image analysis (MedCLIP)
   - Drug interaction checker

2. **Implement caching:**
   - Redis for response caching
   - Vector DB for semantic search

3. **Add embeddings:**
   - Store consultation embeddings
   - Enable similarity search

---

## 📚 Resources

- **Hugging Face Docs:** https://huggingface.co/docs/api-inference
- **Model Cards:** Check each model's page on HF for capabilities
- **FastAPI Async:** https://fastapi.tiangolo.com/async/
- **HTTPX Docs:** https://www.python-httpx.org/

---

## 🆘 Support

For issues or questions:
1. Check server logs: `tail -f backend/logs/app.log`
2. Test models directly: https://huggingface.co/models
3. Verify API key: https://huggingface.co/settings/tokens

---

**Last Updated:** November 3, 2025
