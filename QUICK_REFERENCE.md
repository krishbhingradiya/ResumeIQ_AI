# 🚀 ResumeIQ AI — Quick Reference Card

## ⚡ Quick Start (5 minutes)

### Step 1: Configure
```bash
# Backend setup
cd backend
cp .env.example .env
# Edit .env and set: GEMINI_API_KEY=AIzaSyDh_...

# Frontend setup  
cd frontend
echo "VITE_API_URL=http://localhost:5000" > .env.local
```

### Step 2: Verify
```bash
cd backend
node verify-ai-services.js
# Expected: All ✅ green
```

### Step 3: Run
```bash
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm run dev

# Visit: http://localhost:5173
```

---

## 🌍 Deploy to Production (10 minutes)

### Render (Backend)
```bash
# 1. Push to GitHub
git add . && git commit -m "Update Gemini API security"
git push origin main

# 2. Go to render.com/dashboard
# 3. New → Web Service → Connect GitHub repo
# 4. Set environment variables:
#    GEMINI_API_KEY=AIzaSyDh_...
#    GROQ_API_KEY=gsk_... (optional)
#    PORT=5000
#    FRONTEND_URL=https://your-frontend.vercel.app

# 5. Build: cd backend && npm install
#    Start: cd backend && npm start
```

### Vercel (Frontend)
```bash
# 1. Go to vercel.com/dashboard
# 2. Import project
# 3. Root directory: ./frontend
# 4. Set environment:
#    VITE_API_URL=https://your-backend.onrender.com
# 5. Deploy
```

---

## ✅ Verification Commands

```bash
# Check configuration
node backend/verify-ai-services.js

# Check backend is running
curl http://localhost:5000/health

# Check secrets are safe (no keys in git)
grep -r "AIzaSy" backend/services/
grep -r "gsk_" backend/services/

# View error handling utility
cat backend/utils/aiErrorHandler.js
```

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_COMPLETE.md` | Full summary (this update) |
| `COMPLETION_SUMMARY.md` | Task-by-task breakdown |
| `AI_SECURITY_SETUP.md` | Architecture & security details |
| `SETUP_GUIDE.md` | Local dev & deployment steps |
| `QUICK_REFERENCE.md` | This card 🎯 |

---

## 🔑 Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=AIzaSyDh_HRo_bcoohgpqLSTPi-A436VfFQEDLw
GROQ_API_KEY=gsk_... (optional)
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000
```

---

## 🆘 Troubleshooting (30 seconds)

| Problem | Solution |
|---------|----------|
| `GEMINI_API_KEY not found` | Check `.env` file exists |
| `Backend won't start` | Run `verify-ai-services.js` |
| `Frontend can't reach backend` | Check `VITE_API_URL` |
| `Rate limit error` | Normal — auto-retry kicks in |
| `Empty response` | Check API key is valid |

---

## 📊 Architecture at a Glance

```
Frontend (Vercel)
    ↓ HTTPS
Backend API (Render)
    ↓
Primary: Gemini 2.5-Flash
    ↓ Rate limit? Fallback to:
Secondary: Gemini 2.0-Flash
    ↓ Still failing? Fallback to:
Tertiary: Groq Llama 3.1-8B
    ↓ All fail? User sees helpful error
User-Friendly Error Message
```

---

## 📞 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Check server status |
| `/analyze` | POST | Analyze resume |
| `/compare` | POST | Compare resumes |
| `/chat` | POST | AI career advisor |
| `/jdMatch` | POST | Match resume to JD |

---

## 🎯 Security Checklist

- [ ] API keys in `.env` NOT in git
- [ ] `verify-ai-services.js` shows ✅
- [ ] No keys in console logs
- [ ] No keys in error messages
- [ ] `.gitignore` includes `.env`
- [ ] Production has env vars set

---

## ⚙️ Performance Tuning

### Rate Limit Hits Too Often?
1. Reduce resume length sent to API
2. Enable Groq API key (2x redundancy)
3. Add request batching
4. Monitor usage dashboard

### Slow Fallback?
1. Already optimized (2-30s backoff)
2. Ensure Groq API key configured
3. Check internet speed
4. Monitor API status dashboard

---

## 📦 What's New

### Error Handler (New!)
```javascript
// backend/utils/aiErrorHandler.js
isRateLimitError()       // Detect rate limits
isInvalidKeyError()      // Detect auth failures
isTimeoutError()         // Detect timeouts
isEmptyResponse()        // Detect empty responses
validateAPIKeyExists()   // Validate on startup
getUserFriendlyMessage() // User-facing errors
```

### Verification Tool (New!)
```bash
node backend/verify-ai-services.js
# Checks all services configured correctly
```

### Enhanced Services (Updated!)
- Better error detection
- Empty response checks
- Improved retry logic
- Sanitized error logging
- Multi-tier fallback

---

## 🚀 Next Steps

1. **Today**: Review docs, run verification
2. **Tomorrow**: Deploy to Render + Vercel
3. **This Week**: Monitor production logs
4. **Monthly**: Check API usage & costs

---

## 📞 Support Resources

- **Docs**: See files in project root
- **Gemini**: https://ai.google.dev/docs
- **Groq**: https://console.groq.com/docs
- **Render**: https://render.com/docs
- **Vercel**: https://vercel.com/docs

---

**Status**: ✅ COMPLETE
**Version**: 2.0 (Enhanced Security)
**Last Updated**: May 27, 2026
