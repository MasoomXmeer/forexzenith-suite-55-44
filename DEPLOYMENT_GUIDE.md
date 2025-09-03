
# AonePrimeFX Platform Deployment & Configuration Guide

This guide will help you deploy and configure your AonePrimeFX trading platform for production use without requiring technical expertise.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Database Setup](#supabase-database-setup)
3. [Environment Variables Configuration](#environment-variables-configuration)
4. [API Keys Setup](#api-keys-setup)
5. [Platform Deployment](#platform-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Testing Your Setup](#testing-your-setup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting, make sure you have:
- A Gmail or email account
- Access to a computer with internet connection
- Basic understanding of copy-paste operations
- About 30-60 minutes of time

## Supabase Database Setup

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign up with your email or GitHub account
4. Verify your email address

### Step 2: Create New Project
1. Click "New Project" in your Supabase dashboard
2. Choose your organization (use default if unsure)
3. Fill in project details:
   - **Name**: `aoneprimefx-production`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project"
5. Wait 2-3 minutes for setup to complete

### Step 3: Database Schema Setup
1. In your Supabase project, go to "SQL Editor" (left sidebar)
2. Click "New query"
3. Copy the entire content from `supabase_schema.sql` file
4. Paste it into the query editor
5. Click "Run" button
6. Repeat with `supabase_admin_setup.sql` file
7. You should see "Success" messages

### Step 4: Get Your Supabase Credentials
1. Go to "Settings" > "API" in your Supabase dashboard
2. Copy and save these values:
   - **Project URL** (starts with https://...)
   - **anon/public key** (starts with eyJ...)

## Environment Variables Configuration

### For Local Development
Create a `.env` file in your project root with:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
```

### For Production Deployment
When deploying to platforms like Vercel, Netlify, or similar:

1. **Vercel**: Go to Project Settings > Environment Variables
2. **Netlify**: Go to Site Settings > Environment Variables
3. Add these variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ALPHA_VANTAGE_API_KEY`

## API Keys Setup

### Alpha Vantage (Market Data) - FREE
1. Go to [alphavantage.co](https://www.alphavantage.co/support/#api-key)
2. Click "Get your free API key today"
3. Fill in your information:
   - First Name, Last Name, Email
   - Organization: "Personal" or your company name
   - Intended API usage: "Real-time and historical financial data"
4. Click "GET FREE API KEY"
5. Check your email for the API key
6. Copy the key (looks like: `ABCD1234EFGH5678`)

### Optional: Upgrade Alpha Vantage Plan
- Free plan: 25 requests per day
- Premium plans start at $25/month for 75 requests per minute
- For production with many users, consider upgrading

## Platform Deployment

### Option 1: Deploy to Vercel (Recommended)
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub, GitLab, or Bitbucket
3. Import your project repository
4. Configure build settings:
   - **Framework Preset**: React
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variables (see above)
6. Click "Deploy"

### Option 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up and connect your Git repository
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Add environment variables (see above)
5. Deploy

### Option 3: Manual Deployment
1. Run `npm run build` locally
2. Upload the `dist` folder to your web hosting provider
3. Configure environment variables in your hosting control panel

## Post-Deployment Configuration

### 1. Configure Supabase URL Settings
In your Supabase project:
1. Go to "Authentication" > "URL Configuration"
2. Add your production domain to:
   - **Site URL**: `https://yourdomain.com`
   - **Redirect URLs**: `https://yourdomain.com/**`

### 2. Set up Row Level Security (RLS)
The provided SQL scripts already include RLS policies. Verify they're active:
1. Go to "Authentication" > "Policies"
2. Ensure all tables have policies enabled

### 3. Create Admin User
1. Go to "Authentication" > "Users"
2. Click "Add user"
3. Create an admin account:
   - Email: your admin email
   - Password: strong password
   - Confirm password
4. After creation, go to SQL Editor and run:
```sql
UPDATE auth.users 
SET raw_app_meta_data = '{"role": "admin"}'::jsonb
WHERE email = 'your-admin-email@example.com';
```

## Testing Your Setup

### 1. Basic Functionality Test
1. Visit your deployed website
2. Try creating a new account
3. Check if you receive verification email
4. Log in with the new account
5. Navigate through different pages

### 2. Trading Features Test
1. Log into a user account
2. Go to Trading page
3. Check if market prices are loading
4. Try opening a demo trade
5. Verify account balance updates

### 3. Admin Panel Test
1. Log in with admin account
2. Go to `/admin` URL
3. Check if you can see user statistics
4. Verify all admin features work

## Configuration Options

### Platform Settings
Edit these in `src/config/platform.ts`:

```typescript
// Company Information
platform: {
  name: "YourCompanyName",
  fullName: "YourCompanyName.com",
  domain: "yourcompany.com"
}

// Minimum Deposit
defaults: {
  minDeposit: 100, // Change to your minimum
}

// Available Account Types
accountTypes: [
  // Modify based on your offerings
]
```

### Payment Methods
Configure in Supabase admin panel or update the `payment_methods` table.

### Market Data Update Frequency
In `src/config/platform.ts`:
```typescript
marketData: {
  updateInterval: 5000, // 5 seconds (adjust as needed)
}
```

## Troubleshooting

### Common Issues

**1. "Environment validation failed" Error**
- Check that all environment variables are set correctly
- Ensure no extra spaces in variable values
- Verify Supabase URL starts with `https://`

**2. "Failed to load user profile" Error**
- Check Supabase connection
- Verify database schema was set up correctly
- Check RLS policies are enabled

**3. Market Data Not Loading**
- Verify Alpha Vantage API key is correct
- Check API quota limits
- Look for console errors in browser

**4. Authentication Issues**
- Verify Supabase Auth settings
- Check redirect URLs are configured
- Ensure email templates are set up

**5. Admin Panel Not Accessible**
- Verify admin user role is set in database
- Check admin policies in Supabase
- Ensure user is logging in with correct email

### Getting Help

1. **Check Browser Console**: Press F12 and look for error messages
2. **Check Supabase Logs**: Go to your Supabase project > Logs
3. **Contact Support**: Keep this deployment guide handy when asking for help

## Security Checklist

Before going live:
- [ ] All environment variables are set securely
- [ ] Database RLS policies are enabled
- [ ] Strong passwords are used for admin accounts
- [ ] Supabase Auth is properly configured
- [ ] Domain is configured with HTTPS
- [ ] Regular backups are scheduled (Supabase handles this)

## Maintenance

### Regular Tasks
1. **Monitor API Usage**: Check Alpha Vantage quota monthly
2. **Update Dependencies**: Keep packages updated for security
3. **Database Backups**: Supabase handles this automatically
4. **Monitor Logs**: Check for errors regularly

### Scaling Considerations
- **Users > 1000**: Consider upgrading Supabase plan
- **High Trading Volume**: Upgrade Alpha Vantage plan
- **Multiple Regions**: Consider CDN setup

---

**Congratulations!** Your AonePrimeFX platform should now be production-ready. 

For additional support or custom modifications, consider hiring a developer familiar with React and Supabase.
