# Installation Guide

This guide will walk you through the complete installation process for the AonePrime FX Trading Platform.

## 📋 Prerequisites

### System Requirements
- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm, yarn, or bun
- **Database**: Supabase account (free tier available)
- **OS**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+

### Development Tools (Optional)
- **VS Code**: Recommended IDE with extensions
- **Git**: Version control
- **Docker**: For containerized deployment

## 🔧 Step 1: Environment Setup

### 1.1 Install Node.js
```bash
# Download and install Node.js from nodejs.org
# Verify installation
node --version
npm --version
```

### 1.2 Clone Repository
```bash
git clone <repository-url>
cd aoneprime-fx-platform
```

### 1.3 Install Dependencies
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using bun (recommended for speed)
bun install
```

## 🗄️ Step 2: Database Setup

### 2.1 Create Supabase Project
1. Visit [supabase.com](https://supabase.com)
2. Create a new account or sign in
3. Click "New Project"
4. Choose organization and fill project details
5. Wait for database initialization (2-3 minutes)

### 2.2 Configure Database Schema
```bash
# Navigate to SQL editor in Supabase dashboard
# Run the following schema files in order:

# 1. User setup and authentication
supabase_user_setup.sql

# 2. Main database schema
supabase_schema.sql

# 3. Trading-specific tables
supabase_trading_functions.sql

# 4. MT5 integration schema
supabase_mt5_schema.sql

# 5. Admin panel tables
supabase_admin_tables.sql

# 6. Admin setup (create admin user)
supabase_admin_setup.sql
```

### 2.3 Set Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
-- Continue for all tables...
```

## ⚙️ Step 3: Environment Configuration

### 3.1 Environment Variables
The application uses hardcoded Supabase credentials for demo purposes, but for production, create a `.env` file:

```bash
# .env (for production deployment)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
```

### 3.2 Supabase Configuration
In your Supabase dashboard:

1. **API Keys**: Copy your URL and anon key from Settings > API
2. **Authentication**: Configure email/password auth in Authentication > Settings
3. **Storage**: Create buckets for user documents and images
4. **Edge Functions**: Deploy the included edge functions

## 🔐 Step 4: Authentication Setup

### 4.1 Configure Auth Providers
In Supabase Dashboard > Authentication > Settings:

```json
{
  "site_url": "http://localhost:5173",
  "redirect_urls": [
    "http://localhost:5173/**",
    "https://yourdomain.com/**"
  ]
}
```

### 4.2 Email Templates (Optional)
Customize email templates in Authentication > Email Templates:
- Confirmation email
- Reset password
- Magic link

## 📊 Step 5: MT5 Integration (Optional)

### 5.1 MT5 Server Configuration
```json
{
  "server": "your-mt5-server.com",
  "login": "your-mt5-login",
  "password": "your-mt5-password",
  "timeout": 5000
}
```

### 5.2 Deploy MT5 Edge Functions
```bash
# Deploy MT5 connection function
supabase functions deploy mt5-connect

# Deploy real-time data function
supabase functions deploy mt5-realtime
```

## 🚀 Step 6: Start Development Server

### 6.1 Start the Application
```bash
# Using npm
npm run dev

# Using yarn
yarn dev

# Using bun
bun dev
```

### 6.2 Verify Installation
1. Open browser to `http://localhost:5173`
2. You should see the landing page
3. Create a test account via signup
4. Verify admin panel access at `/admin`

## 📱 Step 7: PWA Configuration

### 7.1 Service Worker
The service worker is automatically registered. For custom configuration:

```javascript
// src/utils/serviceWorker.ts
export const swConfig = {
  cacheName: 'aoneprime-fx-v1',
  staticAssets: [
    '/',
    '/static/js/bundle.js',
    '/static/css/main.css'
  ]
};
```

### 7.2 Web App Manifest
The manifest is pre-configured in `public/manifest.json`. Customize:

```json
{
  "name": "AonePrime FX",
  "short_name": "AonePrimeFX",
  "theme_color": "#E31E24",
  "background_color": "#FFFFFF",
  "display": "standalone",
  "scope": "/",
  "start_url": "/"
}
```

## 🔧 Step 8: Production Configuration

### 8.1 Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

### 8.2 Environment Variables for Production
```bash
# Set environment variables in your hosting platform
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
VITE_APP_ENV=production
```

## 🧪 Step 9: Testing

### 9.1 Run Tests
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run E2E tests
npm run test:e2e
```

### 9.2 Test User Accounts
Create test accounts for different user types:

```sql
-- Regular user
INSERT INTO profiles (id, email, first_name, last_name, user_role)
VALUES ('test-user-id', 'user@test.com', 'Test', 'User', 'user');

-- Admin user
INSERT INTO profiles (id, email, first_name, last_name, user_role)
VALUES ('test-admin-id', 'admin@test.com', 'Admin', 'User', 'admin');
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Dependencies Installation Failed
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 2. Supabase Connection Issues
- Verify URL and API keys
- Check network connectivity
- Ensure RLS policies are correctly set

#### 3. Build Failures
```bash
# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint
```

#### 4. PWA Not Working
- Ensure HTTPS in production
- Verify service worker registration
- Check manifest.json syntax

### Error Logs
Check logs in:
- Browser Developer Console
- Supabase Dashboard > Logs
- Network tab for API calls

## 📚 Next Steps

After successful installation:

1. Read the [Configuration Guide](./CONFIGURATION.md)
2. Follow the [User Guide](./USER_GUIDE.md)
3. Explore the [Admin Guide](./ADMIN_GUIDE.md)
4. Check the [API Reference](./API_REFERENCE.md)

## 🆘 Getting Help

If you encounter issues:

1. Check the [FAQ](./FAQ.md)
2. Search existing [GitHub Issues](link-to-issues)
3. Join our [Discord Community](link-to-discord)
4. Contact support at support@aoneprimefx.com

---

**Installation complete! 🎉 You're ready to start trading.**