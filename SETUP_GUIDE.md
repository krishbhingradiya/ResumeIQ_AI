# 🚀 ResumeIQ AI — Quick Setup & Deployment Guide

## Local Development Setup

### Step 1: Install Dependencies
```bash
cd backend
npm install
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend** (`backend/.env`):
```bash
# Copy from .env.example
cp backend/.env.example backend/.env

# Edit backend/.env and set:
GEMINI_API_KEY=AIzaSyDh_HRo_bcoohgpqLSTPi-A436VfFQEDLw
GROQ_API_KEY=your_groq_key_here  # Optional but recommended
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**Frontend** (`frontend/.env.local`):
```
VITE_API_URL=http://localhost:5000
```

### Step 3: Verify Configuration
```bash
cd backend
node verify-ai-services.js
```

Expected output:
```
✅ Configuration validated:
   • Gemini API: Configured
   • Groq API: Configured (fallback enabled)
```

### Step 4: Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
npm start
# or
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🌍 Deployment Guide

### Deploy to Render.com (Backend)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Update Gemini API integration with enhanced security"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [render.com/dashboard](https://render.com/dashboard)
   - Click "New +"  → "Web Service"
   - Connect your GitHub repository
   - Select branch: `main`

3. **Configure Environment**
   In Render dashboard, set environment variables:
   ```
   GEMINI_API_KEY=AIzaSyDh_HRo_bcoohgpqLSTPi-A436VfFQEDLw
   GROQ_API_KEY=your_groq_key_here
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   NODE_ENV=production
   ```

4. **Deploy**
   - Build command: `cd backend && npm install`
   - Start command: `cd backend && npm start`
   - Click "Create Web Service"

5. **Get Backend URL**
   - After deployment, you'll get a URL like `https://resumeiq-backend.onrender.com`
   - Save this for frontend configuration

### Deploy to Vercel (Frontend)

1. **Push code to GitHub**
   (Same as above)

2. **Import to Vercel**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "Add New +" → "Project"
   - Import your GitHub repository
   - Select root directory: `./frontend`

3. **Configure Environment**
   In Vercel project settings → Environment Variables:
   ```
   VITE_API_URL=https://resumeiq-backend.onrender.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy

5. **Verify Deployment**
   - Visit your Vercel URL
   - Open browser DevTools → Network tab
   - Upload a resume and check requests go to backend

---

## ✅ Verification Checklist

### Before Going to Production

- [ ] Local setup works (verify with all AI features)
- [ ] `verify-ai-services.js` shows all green checkmarks
- [ ] `.env` file is NOT committed to git
- [ ] Gemini API key is configured in production environment
- [ ] Backend health check passes: `GET /health`
- [ ] Frontend can communicate with backend (check CORS)
- [ ] Resume analysis works end-to-end
- [ ] Groq fallback is tested (optional but recommended)

### Production Monitoring

- [ ] Monitor backend logs for API key errors
- [ ] Monitor Gemini API usage dashboard
- [ ] Monitor Groq API usage (if configured)
- [ ] Check for rate limit errors in logs
- [ ] Test fallback occasionally by simulating Gemini failure

---

## 🔧 Troubleshooting

### "GEMINI_API_KEY is not configured"
- Check `backend/.env` file exists
- Verify key is not blank: `GEMINI_API_KEY=AIza...`
- If deploying, ensure env var is set in platform (Render/Heroku/etc)
- Restart server after updating env vars

### "AI service is temporarily busy"
- This means rate limit hit (normal behavior)
- System automatically retries with backoff
- If Groq configured, it falls back automatically
- Wait 60 seconds and retry

### "Empty response from AI"
- Check API key is valid (not expired)
- Check internet connectivity
- Verify API quotas not exhausted
- Try a simpler resume if it's very long

### Backend → Frontend communication fails
- Check `FRONTEND_URL` in backend `.env`
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS headers (check browser console)
- Ensure URLs don't have trailing slashes

---

## 📊 API Key Information

### Getting Gemini API Key
1. Visit [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Select your project (or create new)
4. Copy the key
5. Store securely (never commit to git)

### Getting Groq API Key (Optional)
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or login
3. Navigate to "Keys" section
4. Create new API key
5. Copy and store securely

### Free Tier Limits
- **Gemini**: 1500 requests/minute, 32k tokens/minute
- **Groq**: 30 requests/minute (free tier)
- Both have usage dashboards to monitor quota

---

## 🔒 Security Reminders

✅ **Do:**
- Use environment variables for all secrets
- Use `.env.example` as template (never commit `.env`)
- Store keys securely in platform dashboard
- Rotate keys regularly
- Monitor API usage for unusual activity

❌ **Don't:**
- Commit `.env` file to git
- Hardcode API keys in code
- Share API keys in chat/email
- Use same key across dev/prod
- Commit `.env` files anywhere

---

## 📞 Support Resources

- **Gemini API Docs**: https://ai.google.dev/docs
- **Groq API Docs**: https://console.groq.com/docs
- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs

---

**Last Updated**: May 27, 2026
**Version**: 2.0 (Enhanced Security)
