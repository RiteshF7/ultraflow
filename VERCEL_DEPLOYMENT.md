# Vercel Deployment Guide for UltraFlow

**Production URL**: https://ultraflow.vercel.app

This guide will help you deploy UltraFlow to Vercel with authentication working correctly.

## Prerequisites

1. A Vercel account ([Sign up here](https://vercel.com/signup))
2. A Supabase project ([Create one here](https://supabase.com/dashboard))
3. A Google OAuth application for authentication
4. A Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

## Step 1: Configure Supabase

### 1.1 Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - Project URL (e.g., `https://xxxxx.supabase.co`)
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 1.2 Configure Google OAuth in Supabase

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Google** provider
3. You have two options:

   **Option A: Use Supabase's OAuth (Easier)**
   - Simply enable Google and Supabase will handle the OAuth flow
   - Add your production URL to the allowed redirect URLs:
     - `https://ultraflow.vercel.app/**`
     - `https://ultraflow.vercel.app/auth/callback`

   **Option B: Use Your Own Google OAuth (More Control)**
   - Create a Google OAuth application:
     1. Go to [Google Cloud Console](https://console.cloud.google.com/)
     2. Create a new project or select existing
     3. Enable Google+ API
     4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
     5. Add authorized redirect URIs:
        - `https://your-supabase-project.supabase.co/auth/v1/callback`
        - `https://your-app.vercel.app/auth/callback` (for production)
        - `http://localhost:3000/auth/callback` (for local testing)
   - Enter the Client ID and Secret in Supabase

### 1.3 Configure Redirect URLs

1. In Supabase dashboard, go to **Authentication** → **URL Configuration**
2. Add your Site URL: `https://ultraflow.vercel.app`
3. Add Redirect URLs:
   ```
   https://ultraflow.vercel.app/**
   https://ultraflow.vercel.app/auth/callback
   http://localhost:3000/** (for local development)
   http://localhost:3000/auth/callback (for local development)
   ```

## Step 2: Deploy to Vercel

### 2.1 Initial Deployment

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New Project**
4. Import your GitHub repository
5. Configure the project:
   - Framework Preset: **Next.js**
   - Build Command: `pnpm build` (or leave default)
   - Install Command: `pnpm install` (or leave default)

### 2.2 Configure Environment Variables

Add the following environment variables in Vercel:

**Required:**
```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://ultraflow.vercel.app
NEXT_PUBLIC_SITE_URL=https://ultraflow.vercel.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hllhdkcyycsenqxcuzwy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Gemini API
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Encryption
ENCRYPTION_MASTER_KEY=your_64_character_hex_encryption_key
```

**Optional (if using):**
```env
# Stripe
STRIPE_API_KEY=your_stripe_api_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRO_MONTHLY_PLAN_ID=your_stripe_plan_id

# GitHub
GITHUB_ACCESS_TOKEN=your_github_access_token

# Server API Key
SERVER_API_KEY=your_server_api_key
```

### 2.3 Deploy

1. Click **Deploy**
2. Wait for the deployment to complete
3. Your app is available at `https://ultraflow.vercel.app`

## Step 3: Update Redirect URLs

After your first deployment:

1. Get your Vercel domain (e.g., `your-app.vercel.app`)
2. Go back to Supabase dashboard
3. Update the redirect URLs with your actual Vercel domain
4. If using custom Google OAuth, update the authorized redirect URIs in Google Cloud Console

## Step 4: Test Authentication

1. Visit your deployed app: `https://ultraflow.vercel.app`
2. Click **Login**
3. Click **Sign in with Google**
4. Complete the OAuth flow
5. You should be redirected back to your app and logged in

## Troubleshooting

### Issue: "Invalid Redirect URL" Error

**Solution:**
- Ensure your Vercel domain is added to Supabase redirect URLs
- Make sure there are no typos in the URLs
- Verify that the protocol is `https://` not `http://`

### Issue: "OAuth Configuration Error"

**Solution:**
- Double-check your Google OAuth credentials in Supabase
- Ensure the redirect URIs in Google Cloud Console match your Supabase callback URL
- Try regenerating the OAuth credentials

### Issue: "Session Not Persisting"

**Solution:**
- Check that cookies are enabled in your browser
- Verify that your domain is properly configured in Vercel
- Ensure the middleware is properly configured (it should be by default)

### Issue: "Environment Variables Not Working"

**Solution:**
- Make sure you've added all required environment variables in Vercel
- After adding/updating environment variables, redeploy the app
- Check that variable names match exactly (case-sensitive)

## Custom Domain Setup

If you're using a custom domain:

1. Add your custom domain in Vercel dashboard
2. Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to your custom domain
3. Update all redirect URLs in Supabase to use your custom domain
4. Redeploy the app

## Environment-Specific Configuration

The app automatically detects the environment:

- **Local Development**: Uses `http://localhost:3000`
- **Vercel Preview**: Uses `https://your-app-git-branch.vercel.app`
- **Vercel Production**: Uses your configured domain

The `getURL()` helper function in `utils/helpers.ts` handles this automatically:
```typescript
// Priority order:
// 1. NEXT_PUBLIC_APP_URL (if set)
// 2. NEXT_PUBLIC_VERCEL_URL (automatically set by Vercel)
// 3. http://localhost:3000 (fallback)
```

## Security Best Practices

1. **Never commit `.env.local` to git** - It's in `.gitignore` by default
2. **Keep Service Role Key secret** - Only add it in Vercel, never expose in client code
3. **Rotate keys regularly** - Especially if you suspect they've been compromised
4. **Use environment-specific keys** - Different keys for development, staging, and production
5. **Enable RLS (Row Level Security)** in Supabase for database tables

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)

## Support

If you encounter issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Review Vercel deployment logs
3. Check Supabase logs in your project dashboard
4. Ensure all environment variables are correctly set

