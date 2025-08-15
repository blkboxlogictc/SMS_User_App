# Vercel Deployment Trigger

This file is used to trigger Vercel deployments when pushed to GitHub.

## Deployment Information

- **Backend URL**: https://sms-user-app.onrender.com
- **Frontend**: To be deployed on Vercel
- **Repository**: https://github.com/blkboxlogictc/SMS_User_App

## Last Updated

Date: 2025-01-15
Status: Ready for frontend deployment
Backend: ✅ Successfully deployed
Frontend: 🔄 Triggering deployment

## Configuration

- Root Directory: `./client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Framework: Vite (React)

## Environment Variables Required

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL` (set to backend URL)
