# Stuart Main Street App - Production Deployment Guide

This guide provides step-by-step instructions for deploying the Stuart Main Street App to production using Vercel (frontend) and Render (backend).

## Prerequisites

- [Vercel Account](https://vercel.com)
- [Render Account](https://render.com)
- [Supabase Project](https://supabase.com) (already configured)
- GitHub repository with your code

## Environment Variables

The following environment variables need to be configured in both platforms:

### Backend (Render)

```
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-render-postgres-connection-string>
SUPABASE_URL=https://jjcjmuxjbrubdwuxvovy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-supabase-service-role-key>
SUPABASE_ANON_KEY=<your-supabase-anon-key>
JWT_SECRET=<your-secure-jwt-secret>
```

### Frontend (Vercel)

```
VITE_SUPABASE_URL=https://jjcjmuxjbrubdwuxvovy.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
VITE_API_URL=<your-render-backend-url>
```

## Step 1: Deploy Backend to Render

### 1.1 Create New Web Service

1. Log into [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `stuart-main-street-api`
   - **Environment**: `Node`
   - **Region**: `Oregon (US West)`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### 1.2 Create PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure the database:
   - **Name**: `stuart-main-street-db`
   - **Database Name**: `stuart_main_street`
   - **User**: `stuart_user`
   - **Region**: `Oregon (US West)`
   - **Plan**: `Starter` (free tier)

### 1.3 Configure Environment Variables

In your web service settings, add the following environment variables:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=[Auto-filled from database connection]
SUPABASE_URL=https://jjcjmuxjbrubdwuxvovy.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[Your Supabase Service Role Key]
SUPABASE_ANON_KEY=[Your Supabase Anon Key]
JWT_SECRET=[Generate a secure random string]
```

### 1.4 Deploy

1. Click "Create Web Service"
2. Wait for the build and deployment to complete
3. Note your backend URL (e.g., `https://stuart-main-street-api.onrender.com`)

## Step 2: Deploy Frontend to Vercel

### 2.1 Import Project

1. Log into [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.2 Configure Environment Variables

In the Vercel project settings, add:

```
VITE_SUPABASE_URL=https://jjcjmuxjbrubdwuxvovy.supabase.co
VITE_SUPABASE_ANON_KEY=[Your Supabase Anon Key]
VITE_API_URL=[Your Render Backend URL from Step 1.4]
```

### 2.3 Deploy

1. Click "Deploy"
2. Wait for the build and deployment to complete
3. Note your frontend URL (e.g., `https://stuart-main-street.vercel.app`)

## Step 3: Configure Domain and SSL

### 3.1 Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Configure DNS records as instructed

### 3.2 Update CORS Settings

Update your backend CORS configuration to include your production frontend URL.

## Step 4: Database Migration

### 4.1 Run Database Setup

1. Connect to your Render PostgreSQL database
2. Run the database setup scripts:
   ```bash
   npm run db:setup
   npm run db:seed
   ```

### 4.2 Verify Database Schema

Ensure all tables are created correctly:

- `users`
- `businesses`
- `promotions`
- `business_images`

## Step 5: Supabase Configuration

### 5.1 Update Authentication Settings

1. In Supabase Dashboard → Authentication → Settings
2. Add your production URLs to:
   - **Site URL**: `https://your-domain.vercel.app`
   - **Redirect URLs**:
     - `https://your-domain.vercel.app/auth/callback`
     - `https://your-domain.vercel.app/**`

### 5.2 Configure Storage Policies

Ensure your storage bucket policies are configured for production:

- `business_images` bucket with proper RLS policies
- Public read access for business images
- Authenticated write access for business owners

## Step 6: Testing

### 6.1 Functionality Testing

Test the following features in production:

- [ ] User registration and login
- [ ] Business creation and management
- [ ] Image uploads
- [ ] Map functionality
- [ ] Promotions system
- [ ] PWA installation

### 6.2 Performance Testing

- [ ] Page load speeds
- [ ] Image optimization
- [ ] Mobile responsiveness
- [ ] Offline functionality

## Step 7: Monitoring and Maintenance

### 7.1 Set Up Monitoring

- Configure Vercel Analytics
- Set up Render monitoring
- Monitor Supabase usage

### 7.2 Backup Strategy

- Regular database backups via Render
- Supabase automatic backups
- Code repository backups

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Verify backend CORS configuration includes frontend URL
   - Check environment variables are set correctly

2. **Database Connection Issues**

   - Verify DATABASE_URL is correctly set
   - Check database is running and accessible

3. **Authentication Issues**

   - Verify Supabase URLs and keys
   - Check redirect URLs in Supabase settings

4. **Image Upload Issues**
   - Verify Supabase storage policies
   - Check bucket permissions

### Health Checks

- Backend health: `https://your-backend.onrender.com/api/health`
- Frontend: Check if app loads and PWA install prompt appears

## Security Checklist

- [ ] All environment variables are secure
- [ ] JWT secret is strong and unique
- [ ] Supabase RLS policies are properly configured
- [ ] HTTPS is enforced on all endpoints
- [ ] CORS is properly configured
- [ ] No sensitive data in client-side code

## Performance Optimization

- [ ] Images are optimized and compressed
- [ ] Static assets are cached
- [ ] Database queries are optimized
- [ ] CDN is configured (Vercel handles this automatically)

## Post-Deployment

1. Update DNS records if using custom domain
2. Set up monitoring and alerts
3. Configure backup schedules
4. Document any custom configurations
5. Train team on production environment

---

## Support

For issues with deployment:

- Check Vercel and Render documentation
- Review application logs
- Verify all environment variables
- Test locally with production environment variables

Remember to never commit sensitive environment variables to your repository!
