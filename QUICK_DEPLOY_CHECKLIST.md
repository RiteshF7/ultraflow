# 🚀 Quick Deploy Checklist for UltraFlow

**Production URL**: https://ultraflow.vercel.app

## Pre-Deployment Checklist

### ✅ Step 1: Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Set these variables for **Production** environment:

```bash
NEXT_PUBLIC_APP_URL=https://ultraflow.vercel.app
NEXT_PUBLIC_SITE_URL=https://ultraflow.vercel.app
NEXT_PUBLIC_SUPABASE_URL=https://hllhdkcyycsenqxcuzwy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key_here>
SUPABASE_SERVICE_ROLE_KEY=<your_key_here>
GEMINI_API_KEY=<your_key_here>
NEXT_PUBLIC_GEMINI_API_KEY=<your_key_here>
ENCRYPTION_MASTER_KEY=<your_64_char_hex_key_here>
```

**Optional** (if using):
```bash
STRIPE_API_KEY=<your_key_here>
STRIPE_WEBHOOK_SECRET=<your_key_here>
STRIPE_PRO_MONTHLY_PLAN_ID=<your_key_here>
GITHUB_ACCESS_TOKEN=<your_key_here>
SERVER_API_KEY=<your_key_here>
```

---

### ✅ Step 2: Supabase Configuration

**Dashboard**: https://app.supabase.com/project/hllhdkcyycsenqxcuzwy/auth/url-configuration

#### 2.1 Site URL
```
https://ultraflow.vercel.app
```

#### 2.2 Redirect URLs (Add all)
```
https://ultraflow.vercel.app/**
https://ultraflow.vercel.app/auth/callback
https://ultraflow.vercel.app/dashboard/account
http://localhost:3000/**
http://localhost:3000/auth/callback
```

---

### ✅ Step 3: Google OAuth Setup

**Google Cloud Console**: https://console.cloud.google.com/apis/credentials

#### Authorized Redirect URIs (Add both)
```
https://hllhdkcyycsenqxcuzwy.supabase.co/auth/v1/callback
https://ultraflow.vercel.app/auth/callback
```

---

### ✅ Step 4: Deploy/Redeploy

After configuring environment variables:

**Option A: Via Git**
```bash
git commit --allow-empty -m "Update environment configuration"
git push
```

**Option B: Via Vercel Dashboard**
- Go to Deployments tab
- Click "Redeploy" on the latest deployment

**Option C: Via Vercel CLI**
```bash
vercel --prod
```

---

## Post-Deployment Testing

### Test on Production: https://ultraflow.vercel.app

- [ ] 1. Visit homepage
- [ ] 2. Click "Login" button
- [ ] 3. Click "Sign in with Google"
- [ ] 4. Complete OAuth flow
- [ ] 5. Verify redirect to `/dashboard/account`
- [ ] 6. Check session persists on refresh
- [ ] 7. Test logout
- [ ] 8. Try accessing protected routes

---

## Quick Verification Commands

### Check if site is live:
```bash
curl -I https://ultraflow.vercel.app
```

### Test auth callback endpoint:
```bash
curl -I https://ultraflow.vercel.app/auth/callback
```

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| ❌ "Invalid Redirect URL" | Check Supabase redirect URLs include `https://ultraflow.vercel.app/auth/callback` |
| ❌ Environment vars not working | Redeploy after setting variables |
| ❌ Login redirects to wrong URL | Verify `NEXT_PUBLIC_APP_URL=https://ultraflow.vercel.app` in Vercel |
| ❌ Google OAuth error | Update Google Cloud Console redirect URIs |

---

## Important Links

| Resource | URL |
|----------|-----|
| 🌐 Live Site | https://ultraflow.vercel.app |
| 📊 Vercel Dashboard | https://vercel.com/dashboard |
| 🔐 Supabase Dashboard | https://app.supabase.com/project/hllhdkcyycsenqxcuzwy |
| 🔑 Google Cloud Console | https://console.cloud.google.com/apis/credentials |

---

## Status Check

✅ **Local Development**: Tested and Working  
⏳ **Production Deployment**: Awaiting Configuration  
📋 **Configuration Files**: Ready

---

## Need Help?

1. Review: `PRODUCTION_CONFIG.md` for detailed setup
2. Check: `VERCEL_DEPLOYMENT.md` for troubleshooting
3. See: `LOGIN_TEST_SUMMARY.md` for test results

**Last Updated**: October 11, 2025

