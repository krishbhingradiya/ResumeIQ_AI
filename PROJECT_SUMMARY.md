# ResumeIQ AI – Project Handoff & Developer Summary

## 1. Project Overview
**Name:** ResumeIQ AI
**Purpose:** A premium, production-grade AI-powered SaaS platform designed for both job seekers and recruiters. It leverages advanced Large Language Models (Google Gemini & Groq) to analyze, score, and manage resumes, generate tailored interview questions, and verify document authenticity.
**Architecture:** Client-Server model (React.js Frontend + Node.js/Express.js Backend)

---

## 2. Technology Stack

### 2.1 Frontend (Client)
- **Framework:** React.js (v19) with Vite
- **Styling:** Tailwind CSS (with custom glassmorphism and premium UI design tokens in `index.css`)
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **PDF Export:** `html2canvas` + `jspdf`
- **Routing:** React Router DOM (v7)
- **State Management:** React Hooks
- **API Communication:** Axios
- **Database/Auth SDK:** Supabase JS client (`@supabase/supabase-js`)

### 2.2 Backend (Server)
- **Framework:** Node.js with Express.js (v5)
- **File Parsing:** Multer (upload handling) & `pdf-parse` (text extraction)
- **AI Providers:** 
  - Google Gemini SDK (`@google/generative-ai`)
  - Groq SDK (`groq-sdk`) - Used for multi-provider architecture / failover handling
- **Configuration:** `dotenv`, `cors`

---

## 3. Core Features & Capabilities

### 3.1 Job Seeker Tools
- **Smart Resume Analysis:** Upload a PDF resume to get an ATS score, technical/soft skill breakdown, strengths, and weaknesses.
- **JD Match (Job Description Match):** Compares a user's resume against a specific target Job Description. Identifies skill gaps and provides actionable improvement suggestions.
- **Career Roadmap & Advisor:** An interactive, AI-driven career advisor chat that provides guidance on career paths, skill gaps, and next steps based on the user's resume context.
- **Mock Interview Generator:** Uses AI to generate customized mock interview questions tailored to the exact skills and experiences listed on the uploaded resume.
- **Report Exporting:** Users can download their detailed AI analysis as professional PDF reports.

### 3.2 Recruiter & Enterprise Tools
- **Recruiter Dashboard:** A centralized portal for managing applicants.
- **Resume Comparison:** Side-by-side comparison of multiple candidates against a single job description to determine the best fit.
- **Bulk Shortlisting:** AI-powered ranking and shortlisting of multiple resumes based on given criteria.
- **Authenticity Scanner:** A sophisticated forensic module that includes a deterministic keyword/pattern matching layer and an AI verification layer to reject non-resume documents (e.g., study materials, random PDFs).

---

## 4. System Architecture & Workflows

### 4.1 Multi-Provider AI Fallback System
To ensure high availability and prevent failures due to rate limits (429 errors), the backend utilizes an `aiEngine.js` abstraction. It intelligently routes prompts through primary AI providers (Gemini) and falls back to secondary providers (Groq) with exponential backoff and retry logic.

### 4.2 Document Processing Pipeline
1. **Upload:** User uploads a PDF via the React dropzone interface.
2. **Pre-validation (Authenticity):** The backend validates file type and runs the AuthenticityScanner to confirm it's actually a resume.
3. **Extraction:** `pdf-parse` extracts raw text from the buffer.
4. **AI Processing:** Structured prompts are sent to the AI Engine for the specific service.
5. **Response Formatting:** AI returns structured JSON data.
6. **Frontend Rendering:** Framer Motion and Recharts visualize the data dynamically.

---

## 5. Directory Structure Overview

```text
ai-resume-root/
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/                # Route definitions
│   │   ├── hooks/                # Custom hooks (e.g., useFileUpload)
│   │   ├── services/             # API client services & Supabase client
│   │   ├── utils/                # Helper functions
│   │   ├── App.jsx & main.jsx    # Entry points
│   │   └── index.css             # Global styles & Glassmorphism definitions
│   └── package.json
│
├── backend/                      # Node/Express application
│   ├── controllers/              # Request handlers
│   ├── services/                 # Business logic & AI interactions
│   │   ├── aiEngine.js           # Multi-provider AI core
│   │   ├── authenticityService.js# Fake resume detection
│   │   └── ...                   
│   ├── routes/                   # Express router definitions
│   ├── middlewares/              # File upload (multer), Error handling
│   ├── utils/                    # Prompt templates and formatting
│   ├── server.js                 # Server entry point
│   └── .env                      # API keys and environment variables
│
└── package.json                  # Root workspace definition
```

---

## 6. Known Development Standards
- **Running Locally:** The root directory contains a concurrently script (`npm run dev`) that launches both the Vite frontend and Node backend simultaneously.
- **Design Language:** The frontend enforces a dark, futuristic aesthetic featuring heavy use of glassmorphism, gradient buttons, and responsive grid layouts.
- **Error Handling:** Backend features global error middleware and safe fallback states to ensure the frontend always receives actionable feedback rather than silent crashes.
