# 🧠 ResumeIQ AI

> **Smart AI-Powered Resume Analysis for Modern Careers**

A premium, production-ready AI-powered resume analyzer built with React, Node.js, and Google Gemini AI. Upload your resume and get instant ATS scoring, skill detection, and career recommendations.

![ResumeIQ AI](frontend/public/logo.png)

---

## ✨ Features

- 📄 **PDF Upload** — Drag & drop or browse to upload your resume
- 🤖 **AI Analysis** — Powered by Google Gemini AI
- 📊 **ATS Score** — Animated circular score visualization
- 💻 **Technical Skills** — Auto-detect programming languages, frameworks, tools
- 🤝 **Soft Skills** — Identify leadership, communication, and more
- 💪 **Strengths** — Highlight what makes your resume strong
- ⚠️ **Weaknesses** — Honest areas for improvement
- 🔍 **Missing Skills** — Gap analysis for your target roles
- 💡 **Suggestions** — Actionable improvement recommendations
- 🎯 **Job Matching** — Best-fit role recommendations
- 🎨 **Premium UI** — Dark futuristic glassmorphism design
- 📱 **Responsive** — Mobile-first design

---

## 🛠️ Tech Stack

### Frontend
- React.js + Vite
- Tailwind CSS
- Framer Motion
- React Router
- React Icons
- Axios
- React Hot Toast

### Backend
- Node.js + Express.js
- Multer (file uploads)
- pdf-parse (PDF text extraction)
- Google Gemini AI
- CORS + dotenv

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/apikey))

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/resumeiq-ai.git
cd resumeiq-ai
```

### 2. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm run dev
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
resumeiq-ai/
├── frontend/
│   ├── public/
│   │   ├── logo.png
│   │   └── favicon.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Hero.jsx
│   │   │   ├── Features.jsx
│   │   │   ├── HowItWorks.jsx
│   │   │   ├── Benefits.jsx
│   │   │   ├── Testimonials.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ParticlesBackground.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── ScoreCircle.jsx
│   │   │   └── AnalysisCard.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── UploadPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   └── ErrorPage.jsx
│   │   ├── hooks/
│   │   │   └── useFileUpload.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   └── resumeRoutes.js
│   ├── controllers/
│   │   └── resumeController.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── pdfService.js
│   ├── middlewares/
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── promptTemplate.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 🌐 Deployment

### Frontend → Vercel
1. Push to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

### Backend → Render
1. Push to GitHub
2. Create Web Service on [Render](https://render.com)
3. Set root directory to `backend`
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add env variable: `GEMINI_API_KEY=your_key`
7. Deploy

---

## 📄 License

MIT License — feel free to use this project for learning, portfolios, or hackathons.

---

Built with ❤️ using React & Google Gemini AI
