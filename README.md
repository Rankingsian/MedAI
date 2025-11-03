# 🩺 MedAI — Your Virtual AI Doctor

MedAI is an AI-powered virtual healthcare assistant designed to provide preliminary medical advice, analyze symptoms, and assist doctors with patient triage.  
Built with **Python (FastAPI)**, **Firebase**, and **Hugging Face models**, it simulates an intelligent virtual doctor that interacts conversationally and gives health insights based on user input.

---

## 🌍 Overview

MedAI bridges the gap between patients and healthcare services by using Artificial Intelligence to:
- Help users understand possible causes of their symptoms.
- Suggest whether to visit a hospital or self-manage symptoms.
- Allow doctors to review AI-generated assessments.
- Keep health records securely stored for personalized insights.

It is designed to be **user-friendly for all generations**, including older adults (Baby Boomers and the Silent Generation), with a simple and accessible interface.

---

## 💡 Key Features

- 🧠 **AI-Powered Symptom Analysis** — Uses Hugging Face medical models to analyze symptoms and provide possible diagnoses.  
- 💬 **Conversational Interface** — Chat-style interface to interact naturally with the AI doctor.  
- 🩹 **Triage System** — Collects user information such as age, gender, and symptoms (optionally blood pressure and temperature) to guide assessment.  
- 👨‍⚕️ **Doctor Dashboard** — Allows medical professionals to review AI responses and provide verified feedback.  
- 🗂️ **Patient History** — Stores user interactions and medical advice securely in Firebase.  
- 🏠 **Landing Page** — Simple, clear introduction explaining the purpose and benefits of MedAI.  
- 🌐 **Multigenerational Design** — Easy navigation, large touch targets, and minimal text complexity for elderly users.

---

## 🧩 Architecture

**Frontend:**  
- React (or Next.js) for the main UI  
- Chat-style interface + simple forms for triage  

**Backend:**  
- Python (FastAPI)  
- Integrations with Hugging Face APIs  
- Firebase for Authentication and Database  

**AI Models (via Hugging Face Inference API):**

All models are accessed remotely through Hugging Face's Inference API - **no local downloads required**:

1. 🩻 **[BioBERT](https://huggingface.co/dmis-lab/biobert-base-cased-v1.1)** (`dmis-lab/biobert-base-cased-v1.1`)  
   - **Purpose:** Question answering and symptom understanding
   - **Endpoint:** `/api/chat` with BioBERT routing for medical Q&A

2. 💊 **[ClinicalBERT](https://huggingface.co/emilyalsentzer/Bio_ClinicalBERT)** (`emilyalsentzer/Bio_ClinicalBERT`)  
   - **Purpose:** Medical text classification and lab result analysis
   - **Endpoint:** Used for `/api/upload-lab` summarization

3. 🧬 **[MedAlpaca 13B](https://huggingface.co/medalpaca/medalpaca-13b)** (`medalpaca/medalpaca-13b`)  
   - **Purpose:** Conversational medical advice and diagnosis suggestions
   - **Endpoint:** Primary model for `/api/chat` consultations

4. 🩸 **[BioGPT-Large](https://huggingface.co/microsoft/BioGPT-Large)** (`microsoft/BioGPT-Large`)  
   - **Purpose:** Disease prediction and general medical text generation
   - **Endpoint:** Fallback model for various medical queries

### 🔑 **How It Works:**
- Models run on Hugging Face's cloud infrastructure
- Requires `HUGGINGFACE_API_KEY` environment variable
- Get your free API key: https://huggingface.co/settings/tokens
  - ⚠️ **IMPORTANT:** Create token with **"Write"** access (not just "Read")
- First request may take ~20 seconds (model loading)
- Subsequent requests are fast (~2-5 seconds)  

---

## 🗃️ Database (Firebase)

MedAI uses **Firebase** for:
- **Authentication:** Email/Google login for patients and doctors.  
- **Firestore:** Store user details, chat history, triage data, and doctor feedback.  
- **Storage:** Optionally upload medical reports or lab results for AI summarization.

**Firestore Collections:**
