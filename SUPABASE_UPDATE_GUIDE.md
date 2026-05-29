# Supabase Configuration Update Guide

## Overview
This document details the migration from the old Supabase project to the new Supabase project configuration for ResumeIQ AI.

---

## Changes Made

### 1. Frontend Environment Configuration

#### Updated `.env` file
```env
VITE_API_URL=http://localhost:5000
VITE_SUPABASE_URL=https://njptkwytwqtmqltijsoe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHRrd3l0d3F0bXFsdGlqc29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTg2MTAsImV4cCI6MjA5Mzk3NDYxMH0.4vk5ZgGbinum2hdIhNuBJQTMjAJxMm6ajyMBDg6PscY
```

#### Updated `.env.example` file
Now includes:
- Clear documentation for Supabase configuration
- Exact environment variable names for Vite
- Links to retrieve credentials
- Production-ready example values

### 2. Supabase Client Enhancement (`frontend/src/services/supabaseClient.js`)

**New Features:**
- ✅ Configuration validation with detailed error messages
- ✅ URL format validation
- ✅ JWT token format validation
- ✅ Automatic session refresh
- ✅ Session persistence
- ✅ Enhanced error detection utilities:
  - `isAuthError()` - Detects authentication failures
  - `isNetworkError()` - Detects network connectivity issues
  - `isDatabaseError()` - Detects database errors
  - `getSupabaseErrorMessage()` - Returns user-friendly error messages

**Benefits:**
- Prevents invalid configurations at startup
- Clear error messages for debugging
- Production-grade session management
- Better error handling for frontend integrations

### 3. Enhanced API Error Handler (`frontend/src/services/api.js`)

**New Error Detection for:**
- 🔐 Authentication errors (401) - Expired sessions, invalid credentials
- 🚫 Permission errors (403) - Access denied
- 📍 Not found errors (404) - Resource deleted
- ⚠️ Bad request errors (400) - Validation failures
- ⏳ Rate limiting (429) - Too many requests
- 💥 Server errors (5xx) - Backend issues
- 📡 Network errors - Connection failures, offline detection
- ⏱️ Timeout errors - Request exceeded time limit

**User-Friendly Messages:**
- Each error type returns a clear, actionable message
- No technical jargon exposed to users
- Helpful guidance for recovery

---

## Migration from Old to New Project

### Old Configuration
```
URL: https://dxajjzptceovzfxfttqa.supabase.co
Project ID: dxajjzptceovzfxfttqa
```

### New Configuration
```
URL: https://njptkwytwqtmqltijsoe.supabase.co
Project ID: njptkwytwqtmqltijsoe
```

### What Changed
- ✅ All hardcoded references removed
- ✅ Using environment variables exclusively
- ✅ Added validation and error handling
- ✅ Enhanced session management
- ✅ Production-ready error messages

---

## Verification Checklist

### Frontend Configuration
- [ ] `.env` file contains new Supabase URL
- [ ] `.env` file contains new ANON_KEY
- [ ] `.env.example` file is updated for team reference
- [ ] No hardcoded URLs in component files
- [ ] No hardcoded keys in component files
- [ ] `supabaseClient.js` initializes without errors

### Environment Variables
- [ ] `VITE_SUPABASE_URL` is correctly set
- [ ] `VITE_SUPABASE_ANON_KEY` is correctly set
- [ ] `VITE_API_URL` points to correct backend
- [ ] All variables are loaded at build time

### Error Handling
- [ ] Invalid Supabase URLs trigger clear errors
- [ ] Missing credentials show helpful messages
- [ ] Network failures are handled gracefully
- [ ] Authentication errors are detected
- [ ] Database errors are handled
- [ ] Timeouts show user-friendly messages

### Backend Configuration
- [ ] Backend `.env` contains API keys (NOT Supabase)
- [ ] `GEMINI_API_KEY` is set
- [ ] `GROQ_API_KEY` is set
- [ ] `PORT` is configured
- [ ] `FRONTEND_URL` is correct

---

## Deployment Configuration

### Vercel (Frontend)

Add these environment variables in Vercel Dashboard:

```
VITE_API_URL=https://your-render-backend.onrender.com
VITE_SUPABASE_URL=https://njptkwytwqtmqltijsoe.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qcHRrd3l0d3F0bXFsdGlqc29lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTg2MTAsImV4cCI6MjA5Mzk3NDYxMH0.4vk5ZgGbinum2hdIhNuBJQTMjAJxMm6ajyMBDg6PscY
```

### Render (Backend)

Add these environment variables in Render Dashboard:

```
GEMINI_API_KEY=<your-gemini-key>
GROQ_API_KEY=<your-groq-key>
PORT=5000
FRONTEND_URL=https://your-vercel-frontend.vercel.app
```

---

## Testing the Integration

### Local Testing

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm start
   # Should show: Server running on http://localhost:5000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Should show: Local: http://localhost:5173
   ```

3. **Test Supabase Connection:**
   - Open browser console
   - Should NOT show Supabase configuration errors
   - Check for: "✅ Supabase Configuration Validated"

4. **Test Features:**
   - Upload resume ✓
   - Compare resumes ✓
   - Match to job description ✓
   - Authenticity scan ✓
   - Roadmap generation ✓
   - Career chat ✓

### Production Testing

1. **Health Check:**
   ```bash
   curl https://your-render-backend.onrender.com/health
   # Should return: {"status":"ok"}
   ```

2. **Supabase Connection:**
   - Open frontend in browser
   - Check browser console for errors
   - Perform a request (e.g., upload resume)
   - Verify response is successful

3. **Error Handling Test:**
   - Turn off internet connection
   - Try to use a feature
   - Should show: "You appear to be offline. Please check your internet connection."

---

## Security Best Practices

### What NOT to Do
- ❌ Don't commit `.env` files to Git
- ❌ Don't hardcode URLs or keys in components
- ❌ Don't expose full error messages in production
- ❌ Don't share keys in Slack, email, or GitHub issues
- ❌ Don't use the same keys for development and production

### What TO Do
- ✅ Use `.env.example` for reference only
- ✅ Add `.env` to `.gitignore`
- ✅ Use environment variable system (Vercel, Render)
- ✅ Rotate keys periodically
- ✅ Use separate Supabase projects for dev and production
- ✅ Keep API keys in secure secrets management system

---

## Troubleshooting

### Issue: "Missing VITE_SUPABASE_URL environment variable"

**Solution:** 
1. Ensure `.env` file exists in `frontend/` directory
2. Verify `VITE_SUPABASE_URL` is set
3. Restart development server: `npm run dev`

### Issue: "Invalid VITE_SUPABASE_URL format"

**Solution:**
1. Check URL is: `https://njptkwytwqtmqltijsoe.supabase.co`
2. Verify URL includes protocol (`https://`)
3. Verify URL ends with `.supabase.co`

### Issue: "Invalid VITE_SUPABASE_ANON_KEY format"

**Solution:**
1. Ensure key is a valid JWT (3 parts separated by `.`)
2. Copy exact key from Supabase dashboard
3. Ensure no extra spaces or line breaks

### Issue: API calls failing with "Cannot connect to server"

**Solution:**
1. Ensure backend is running: `cd backend && npm start`
2. Check `VITE_API_URL` points to correct backend URL
3. For production: verify Render backend is running
4. Check firewall/CORS settings

### Issue: Authentication failing in production

**Solution:**
1. Verify `VITE_SUPABASE_ANON_KEY` is set in Vercel
2. Ensure session persistence is enabled
3. Check browser cookies are allowed
4. Verify session refresh is working

---

## Related Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify environment variables are set correctly
3. Review this guide's troubleshooting section
4. Check backend logs on Render dashboard
5. Review Supabase project logs in dashboard

---

**Last Updated:** May 29, 2026
**Configuration Version:** 1.0
**Status:** Production Ready ✅
