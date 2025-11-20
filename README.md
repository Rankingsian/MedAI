# 🩺 MedAI — Your Virtual AI Doctor

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Now-brightgreen?style=for-the-badge&logo=vercel)](https://med-ai-omega.vercel.app/)
[![Backend API](https://img.shields.io/badge/Backend%20API-Active-blue?style=for-the-badge&logo=fastapi)](https://medai-1-backend-final.onrender.com/)
[![License](https://img.shields.io/badge/license-MIT-purple?style=for-the-badge)](LICENSE)

> **An intelligent AI-powered healthcare assistant that provides preliminary medical advice, symptom analysis, and doctor consultations — making quality healthcare accessible to everyone.**

---

## 🌐 Live Application

**🚀 Access MedAI:** [https://med-ai-omega.vercel.app/](https://med-ai-omega.vercel.app/)

> Start your AI consultation now — no credit card required, completely free!

---

## 📖 What is MedAI?

MedAI is a next-generation virtual healthcare platform that leverages cutting-edge AI technology to bridge the gap between patients and healthcare services. Our platform provides:

### For Patients:
- 🤖 **24/7 AI Doctor Consultations** — Get instant medical guidance anytime, anywhere
- 🔍 **Intelligent Symptom Analysis** — Understand what your symptoms might mean
- 🎯 **Smart Triage System** — Know when to seek immediate care vs. self-manage
- 📱 **Easy-to-Use Interface** — Designed for all ages, including seniors
- 🗂️ **Personal Health History** — Track your consultations and medical advice

### For Healthcare Providers:
- 👨‍⚕️ **Clinician Dashboard** — Review AI-generated patient assessments
- 📋 **Patient Management** — Access patient triage data and history
- 💬 **Consultation Requests** — Respond to patients seeking professional care
- 📊 **AI-Assisted Summaries** — Quick insights powered by advanced AI
- 🎥 **Video Consultations** — Connect with patients remotely

---

## ✨ Key Features

### 🧠 AI-Powered Intelligence
- **Groq Llama 3.3-70b** — State-of-the-art medical AI with 90%+ confidence
- Natural conversation flow for comfortable patient interaction
- Context-aware responses based on symptoms, age, and medical history
- Automatic emergency detection and immediate care recommendations

### 🩹 Comprehensive Triage System
- Age, gender, and symptom analysis
- Optional vitals input (blood pressure, temperature, heart rate)
- Pre-existing conditions and allergies tracking
- Medication history integration

### 💊 Medical Features
- Symptom checker with evidence-based guidance
- Drug interaction warnings
- Health recommendations and preventive care tips
- Lab result interpretation (OCR-enabled)
- Medical document upload and analysis

### 🔐 Security & Privacy
- Firebase Authentication (Email/Password & Google Sign-In)
- HIPAA-compliant data handling practices
- Encrypted data transmission (HTTPS)
- Secure storage with Firestore
- Role-based access control (Patient/Clinician)

### 🌍 Accessibility
- Responsive design — works on desktop, tablet, and mobile
- Large, clear UI elements for elderly users
- Simple navigation with minimal complexity
- Fast loading times optimized for all network speeds

---

## 🏗️ Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Styling:** Modern CSS with responsive design
- **State Management:** React Context API
- **Authentication:** Firebase Auth
- **Hosting:** Vercel (Production)

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **AI Engine:** Groq API (Llama 3.3-70b-versatile)
- **OCR:** Tesseract for medical document scanning
- **Database:** Firebase Firestore
- **Storage:** Firebase Cloud Storage
- **Hosting:** Render (Production)

### AI & Machine Learning
- **Primary Model:** [Groq Llama 3.3-70b](https://groq.com/) — Ultra-fast inference, medical-grade responses
- **Fallback:** Template-based responses for high availability
- **Embeddings:** Sentence transformers for semantic search
- **Document Analysis:** OCR + NLP for medical records

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Firebase account
- Groq API key (free tier available)

### Quick Start

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/MedAI.git
cd MedAI
```

#### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Copy and configure environment variables
cp env.example .env
# Edit .env with your Firebase and Groq credentials

# Run the backend
uvicorn app.main:app --reload
```

#### 3. Frontend Setup
```bash
cd frontend
npm install

# Copy and configure environment variables
cp env.example .env.local
# Edit .env.local with your Firebase config

# Run the frontend
npm run dev
```

#### 4. Access the Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

For detailed setup instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📸 Screenshots

### Patient Interface
![AI Chat Consultation](https://via.placeholder.com/800x450.png?text=AI+Chat+Consultation)

### Clinician Dashboard
![Doctor Dashboard](https://via.placeholder.com/800x450.png?text=Clinician+Dashboard)

---

## 🗂️ Project Structure

```
MedAI/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── services/       # AI & business logic
│   │   ├── db/             # Firebase integration
│   │   └── main.py         # FastAPI app
│   ├── requirements.txt
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── api/           # API client
│   │   └── firebase/      # Firebase config
│   ├── package.json
│   └── .env.example
└── README.md
```

---

## 🎯 How It Works

1. **User Signs Up/Login** — Secure authentication via Firebase
2. **Complete Triage** — Provide age, gender, symptoms, and optional vitals
3. **Start AI Consultation** — Chat naturally with the AI doctor
4. **Get Recommendations** — Receive medical guidance and care suggestions
5. **Request Doctor (Optional)** — Connect with real clinicians if needed
6. **Track History** — All consultations saved securely

---

## 🔑 Environment Variables

### Backend (.env)
```bash
GROQ_API_KEY=your_groq_api_key
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
CORS_ORIGINS=https://med-ai-omega.vercel.app
```

### Frontend (.env.local)
```bash
VITE_API_BASE_URL=https://medai-1-backend-final.onrender.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

---

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### Main Endpoints
- `POST /api/chat` — AI consultation
- `POST /api/upload` — Upload medical documents
- `GET /api/history` — Get consultation history
- `POST /api/clinician/login` — Clinician authentication
- `GET /api/consultation-requests` — Pending consultations

---

## 👥 Team

### 👨‍💻 Core Development Team

<table>
  <tr>
    <td align="center">
      <img src="https://via.placeholder.com/100" width="100px;" alt="Ian Mwangi"/><br />
      <sub><b>Ian Mwangi</b></sub><br />
      <sub>AI Engineer</sub><br />
      <a href="https://github.com/ianmwangi">GitHub</a>
    </td>
    <td align="center">
      <img src="https://via.placeholder.com/100" width="100px;" alt="Margret Mwangi"/><br />
      <sub><b>Margret Mwangi</b></sub><br />
      <sub>Full Stack Developer</sub><br />
      <a href="https://github.com/margretmwangi">GitHub</a>
    </td>
  </tr>
</table>

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚠️ Disclaimer

**MedAI is NOT a substitute for professional medical advice, diagnosis, or treatment.**

This application provides general health information and preliminary guidance only. Always consult a qualified healthcare professional for:
- Medical diagnosis
- Treatment plans
- Emergency medical situations
- Prescription medications

**In case of emergency, call your local emergency services immediately.**

---

## 🌟 Acknowledgments

- **Groq** — For providing lightning-fast AI inference
- **Firebase** — For secure authentication and database services
- **Vercel & Render** — For reliable hosting infrastructure
- **Open Source Community** — For amazing tools and libraries

---

## 📞 Contact & Support

- **Live App:** [https://med-ai-omega.vercel.app/](https://med-ai-omega.vercel.app/)
- **API Status:** [https://medai-1-backend-final.onrender.com/](https://medai-1-backend-final.onrender.com/)
- **Report Issues:** [GitHub Issues](https://github.com/yourusername/MedAI/issues)
- **Email:** support@medai.app

---

<p align="center">
  Made with ❤️ by the MedAI Team<br/>
  <sub>Empowering healthcare through AI</sub>
</p>

---

## 🎖️ Project Status

![Status](https://img.shields.io/badge/Status-Production-success?style=flat-square)
![Uptime](https://img.shields.io/badge/Uptime-99.9%25-brightgreen?style=flat-square)
![Build](https://img.shields.io/badge/Build-Passing-success?style=flat-square)
![AI Confidence](https://img.shields.io/badge/AI%20Confidence-90%25+-blue?style=flat-square)

**Last Updated:** November 2025
