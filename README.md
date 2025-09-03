# AonePrimeFX Trading Platform

A professional forex trading platform built with React, TypeScript, and Supabase, offering advanced trading features, real-time market data, and comprehensive account management.

## 🚀 Features

### Trading Capabilities
- **Real-time Market Data**: Live price feeds for Forex, Commodities, and Indices
- **Advanced Trading Terminal**: Professional trading interface with charting
- **Copy Trading**: Follow and copy successful traders
- **Multi-Account Management**: Manage multiple trading accounts (Demo, Standard, Zero, Ultra Low)
- **Risk Management Tools**: Stop Loss/Take Profit calculators, position sizing

### Account Features
- **User Authentication**: Secure login/signup with Supabase Auth
- **KYC Verification**: Account verification system
- **Affiliate Program**: Referral system with commission tracking
- **Portfolio Analytics**: Real-time P&L tracking and performance metrics

### Admin Panel
- **User Management**: View and manage all users
- **Market Configuration**: Add/edit trading instruments
- **Support Ticket System**: Handle customer support requests
- **Payment Methods**: Configure deposit/withdrawal options
- **Platform Settings**: Manage system-wide configurations

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API, TanStack Query
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Charts**: TradingView Widget Integration
- **PWA**: Service Worker for offline functionality

## 📋 Prerequisites

- Node.js & npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account (free tier available at [supabase.com](https://supabase.com))

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

### 2. Configure Supabase

1. **Create a new Supabase project** at [app.supabase.com](https://app.supabase.com)

2. **Run the SQL schemas** in your Supabase SQL editor (in this order):
   - `supabase_schema.sql` - Main tables and authentication
   - `supabase_admin_tables.sql` - Admin functionality tables
   - `supabase_user_setup.sql` - Create initial admin user (optional)
   - `supabase_mt5_schema.sql` - MT5 integration tables (optional)

3. **Enable Email Auth** in Supabase:
   - Go to Authentication → Providers
   - Enable Email provider

4. **Update environment variables**:
   - Update `src/utils/envValidator.ts` with your Supabase credentials:
     ```typescript
     VITE_SUPABASE_URL: 'your-supabase-url',
     VITE_SUPABASE_ANON_KEY: 'your-anon-key'
     ```

### 3. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 📱 Mobile Responsiveness

The platform is fully responsive and includes:
- PWA support with offline functionality
- Mobile-optimized trading interface
- Bottom navigation for easy mobile access
- Gesture support for chart interactions

## 🔐 Security Features

- Row Level Security (RLS) policies for all database tables
- Secure authentication with Supabase Auth
- Protected routes requiring authentication
- Admin role-based access control
- Encrypted API keys and sensitive data

## 🚀 Deployment

### Deploy to Lovable
Open the repository in [Lovable](https://lovable.dev/projects/59a20f72-22c8-44cc-81d2-273be84ce417) and click on Share → Publish.

### Deploy to Other Platforms
The project can be deployed to any static hosting service:

```bash
npm run build
# Deploy the 'dist' folder to your hosting service
```

## 📊 Database Schema

The platform uses the following main tables:
- `profiles` - User profiles and account info
- `trading_accounts` - Multiple trading accounts per user
- `trades` - Trade history and open positions
- `support_tickets` - Customer support system
- `markets` - Available trading instruments
- `transactions` - Deposits and withdrawals
- `affiliate_commissions` - Affiliate tracking

## 🧪 Testing Accounts

After running the setup SQL files, you can:
1. Sign up for a new account via the signup page
2. Use the admin SQL script to grant admin privileges to your account

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, email support@aoneprimefx.com or create a support ticket in the platform.

## Project Info

**Lovable URL**: https://lovable.dev/projects/59a20f72-22c8-44cc-81d2-273be84ce417

## How can I edit this code?

There are several ways of editing your application:

**Use Lovable**
Simply visit the [Lovable Project](https://lovable.dev/projects/59a20f72-22c8-44cc-81d2-273be84ce417) and start prompting.

**Use your preferred IDE**
Clone this repo and push changes. The only requirement is having Node.js & npm installed.

**Edit directly in GitHub**
Navigate to files and use the edit button to make quick changes.

**Use GitHub Codespaces**
Launch a cloud development environment directly from your repository.