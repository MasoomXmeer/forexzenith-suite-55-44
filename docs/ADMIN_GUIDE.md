# Admin Guide

Comprehensive guide for administrators and managers of the AonePrime FX Trading Platform.

## 📋 Table of Contents

- [Admin Panel Access](#admin-panel-access)
- [User Management](#user-management)
- [Trading Oversight](#trading-oversight)
- [Financial Management](#financial-management)
- [System Configuration](#system-configuration)
- [Support Management](#support-management)
- [Reports & Analytics](#reports--analytics)

## 🔐 Admin Panel Access

### Accessing the Admin Panel

#### Login Requirements
- Admin or Super Admin role in the database
- Valid authentication credentials
- Navigate to `/admin` route

#### Admin Role Assignment
```sql
-- Assign admin role to a user
UPDATE profiles 
SET user_role = 'admin' 
WHERE email = 'admin@example.com';

-- Create super admin
UPDATE profiles 
SET user_role = 'super_admin' 
WHERE email = 'superadmin@example.com';
```

### Admin Panel Overview

#### Dashboard Statistics
- **Total Users**: Complete user count across all account types
- **Active Trades**: Currently open positions
- **Trading Volume**: Total volume traded (daily/monthly)
- **Commission Revenue**: Platform earnings from spreads/commissions

#### Navigation Tabs
- **Support**: Customer service and ticket management
- **Accounts**: Trading account management and oversight
- **Market Data**: MT5 configuration and market settings
- **Portfolio**: Portfolio analytics and performance monitoring
- **History**: Complete trading and transaction history
- **Markets**: Market configuration and pricing
- **Users**: User management and verification
- **Settings**: System configuration and platform settings

## 👥 User Management

### User Overview

#### User Statistics
- **Total Registered Users**: All platform users
- **Verified Users**: KYC-approved accounts
- **Active Traders**: Users with recent trading activity
- **Demo vs Live**: Account type distribution

#### User Search & Filtering
- Search by email, name, or user ID
- Filter by account type (Demo, Micro, Standard, VIP)
- Filter by verification status
- Filter by registration date range

### User Account Management

#### View User Details
```javascript
// Access user information
const userDetails = {
  personalInfo: "Name, email, phone, address",
  accountInfo: "Balance, equity, margin, free margin",
  tradingAccounts: "All associated trading accounts",
  verificationStatus: "KYC status and documents",
  tradingHistory: "Complete trade history",
  loginActivity: "Recent login sessions"
};
```

#### User Actions
- **View Profile**: Complete user information
- **Edit Details**: Modify user information
- **Change Account Type**: Upgrade/downgrade accounts
- **Suspend/Activate**: Account status management
- **Reset Password**: Force password reset
- **Add Notes**: Internal admin notes

### KYC Management

#### Document Verification
1. **Review Submissions**: Check uploaded documents
2. **Verify Authenticity**: Validate document legitimacy
3. **Update Status**: Approve, reject, or request resubmission
4. **Send Notifications**: Inform users of status changes

#### Verification Workflow
```javascript
const kycProcess = {
  pending: "Initial document submission",
  underReview: "Admin reviewing documents",
  approved: "Documents verified and approved",
  rejected: "Documents rejected with reason",
  resubmitted: "User provided new documents"
};
```

## 💹 Trading Oversight

### Trading Account Management

#### Account Monitoring
- **Real-time Balances**: Live account balances and equity
- **Margin Monitoring**: Margin usage and available margin
- **Position Tracking**: All open positions across accounts
- **Risk Assessment**: Account risk levels and alerts

#### Account Actions
```javascript
// Admin account management functions
const accountActions = {
  adjustBalance: "Credit/debit account balance",
  setLeverage: "Modify maximum leverage",
  closePositions: "Force close positions if necessary",
  freezeAccount: "Temporarily disable trading",
  setMarginCall: "Configure margin call levels",
  addBonus: "Add trading bonuses or credits"
};
```

### Trade Monitoring

#### Open Positions Overview
- **Position Details**: Symbol, size, entry price, P&L
- **Risk Metrics**: Total exposure, correlation analysis
- **Margin Requirements**: Used and available margin
- **Performance Tracking**: Winning/losing positions

#### Trade History Analysis
- **Volume Statistics**: Daily, weekly, monthly volumes
- **Profit/Loss Analysis**: Platform and user P&L
- **Popular Instruments**: Most traded symbols
- **Performance Metrics**: Win rates, average trade size

### Risk Management

#### System-Wide Risk Controls
```javascript
const riskControls = {
  maxLeverage: "Platform-wide leverage limits",
  positionLimits: "Maximum position sizes",
  exposureLimits: "Total symbol exposure limits",
  marginRequirements: "Minimum margin percentages",
  automaticStopOut: "Automatic position closure levels"
};
```

#### Automated Risk Monitoring
- **Margin Call Alerts**: Notify when accounts approach margin calls
- **Large Position Alerts**: Flag unusually large positions
- **Correlation Monitoring**: Track correlated position risks
- **Volatility Alerts**: High market volatility warnings

## 💰 Financial Management

### Deposit Management

#### Deposit Processing
1. **Review Deposits**: Verify incoming deposits
2. **Manual Credits**: Process offline deposits
3. **Bonus Application**: Apply deposit bonuses
4. **Status Updates**: Update deposit status

#### Payment Method Configuration
```javascript
const paymentMethods = {
  creditCard: {
    enabled: true,
    minDeposit: 10,
    maxDeposit: 50000,
    processingTime: "Instant"
  },
  bankTransfer: {
    enabled: true,
    minDeposit: 100,
    maxDeposit: 100000,
    processingTime: "1-3 business days"
  },
  cryptocurrency: {
    enabled: true,
    minDeposit: 50,
    maxDeposit: 25000,
    processingTime: "1-6 confirmations"
  }
};
```

### Withdrawal Management

#### Withdrawal Processing
1. **Withdrawal Requests**: Review pending withdrawals
2. **Verification Checks**: Ensure account verification
3. **Fraud Prevention**: Check for suspicious activity
4. **Manual Processing**: Approve/reject withdrawals

#### Withdrawal Limits
- **Daily Limits**: Per-account daily withdrawal limits
- **Monthly Limits**: Monthly withdrawal caps
- **VIP Limits**: Enhanced limits for VIP accounts
- **Verification Requirements**: Higher limits require verification

### Commission & Revenue Tracking

#### Revenue Analytics
- **Spread Revenue**: Earnings from bid-ask spreads
- **Commission Revenue**: Direct trading commissions
- **Swap Revenue**: Overnight position holding fees
- **Withdrawal Fees**: Processing fees collected

#### Commission Structure Management
```javascript
const commissionStructure = {
  forex: {
    major: 0.8, // pips
    minor: 1.2,
    exotic: 2.0
  },
  indices: {
    us500: 0.4,
    nasdaq: 0.6,
    dax: 1.0
  },
  commodities: {
    gold: 0.35,
    oil: 0.03
  }
};
```

## ⚙️ System Configuration

### Platform Settings

#### General Configuration
```javascript
const platformSettings = {
  tradingHours: {
    forex: "24/5 (Sunday 5pm - Friday 5pm EST)",
    indices: "Varies by market",
    commodities: "Varies by instrument"
  },
  minimumDeposit: {
    demo: 0,
    micro: 10,
    standard: 100,
    vip: 5000
  },
  maximumLeverage: {
    forex: "1:500",
    indices: "1:100",
    commodities: "1:50"
  }
};
```

#### Market Configuration
- **Trading Hours**: Configure market opening/closing times
- **Spread Settings**: Adjust spreads by instrument
- **Swap Rates**: Configure overnight financing rates
- **Margin Requirements**: Set margin percentages

### MT5 Integration Configuration

#### Connection Settings
```javascript
const mt5Config = {
  server: "your-mt5-server.com:443",
  credentials: {
    login: "mt5-account-number",
    password: "secure-password"
  },
  dataFeeds: {
    realTime: true,
    historical: true,
    depth: 5 // price depth levels
  },
  symbols: ["EURUSD", "GBPUSD", "USDJPY", "XAUUSD"]
};
```

#### Market Data Management
- **Price Feeds**: Configure real-time price sources
- **Symbol Management**: Add/remove tradeable instruments
- **Historical Data**: Manage chart data availability
- **Data Quality**: Monitor price feed reliability

### API Configuration

#### Rate Limiting
```javascript
const apiLimits = {
  authenticated: {
    requests: 1000,
    window: "1 hour"
  },
  unauthenticated: {
    requests: 100,
    window: "1 hour"
  },
  trading: {
    orders: 50,
    window: "1 minute"
  }
};
```

#### Security Settings
- **JWT Expiration**: Token lifetime configuration
- **CORS Settings**: Cross-origin request policies
- **IP Whitelisting**: Restrict access by IP address
- **Audit Logging**: Log all admin actions

## 🎧 Support Management

### Customer Support System

#### Ticket Management
1. **Incoming Tickets**: New customer support requests
2. **Assign Agents**: Route tickets to appropriate agents
3. **Priority Levels**: Urgent, High, Medium, Low
4. **Status Tracking**: Open, In Progress, Resolved, Closed

#### Support Categories
```javascript
const supportCategories = {
  technical: "Platform issues, login problems",
  trading: "Order execution, platform features",
  financial: "Deposits, withdrawals, payments",
  account: "Verification, profile updates",
  general: "General inquiries, feedback"
};
```

### Live Chat Management

#### Chat Features
- **Real-time Messaging**: Instant communication
- **File Sharing**: Document and image uploads
- **Chat History**: Complete conversation logs
- **Agent Assignment**: Route chats to specialists
- **Canned Responses**: Quick reply templates

#### Performance Metrics
- **Response Time**: Average first response time
- **Resolution Time**: Average ticket resolution time
- **Customer Satisfaction**: Post-interaction ratings
- **Agent Performance**: Individual agent statistics

### Knowledge Base Management

#### Content Management
- **Articles**: FAQ articles and guides
- **Categories**: Organize content by topic
- **Search Functionality**: Easy content discovery
- **Analytics**: Track popular articles
- **Updates**: Keep content current and accurate

## 📊 Reports & Analytics

### Trading Reports

#### Daily Trading Report
```javascript
const dailyReport = {
  volume: "Total trading volume",
  trades: "Number of trades executed",
  newUsers: "New registrations",
  deposits: "Total deposits received",
  withdrawals: "Total withdrawals processed",
  activeUsers: "Users who traded today",
  revenue: "Platform revenue generated"
};
```

#### Performance Analytics
- **User Activity**: Login frequency, session duration
- **Trading Patterns**: Popular instruments, trade sizes
- **Revenue Trends**: Daily, weekly, monthly revenue
- **Geographic Distribution**: Users by country/region

### Financial Reports

#### Revenue Breakdown
- **Spread Revenue**: Earnings from trading spreads
- **Commission Revenue**: Direct commission earnings
- **Swap Revenue**: Overnight position fees
- **Deposit Fees**: Processing fees collected
- **Net Revenue**: Total revenue minus expenses

#### Cost Analysis
- **Technology Costs**: Platform hosting and maintenance
- **Licensing Fees**: MT5 and third-party licenses
- **Support Costs**: Customer service expenses
- **Marketing Expenses**: User acquisition costs

### Regulatory Reports

#### Compliance Reporting
- **Trade Reporting**: Regulatory trade reporting
- **Risk Reports**: Platform risk exposure
- **AML Reports**: Anti-money laundering compliance
- **Audit Trails**: Complete activity logs

#### Export Capabilities
```javascript
const exportFormats = {
  csv: "Comma-separated values for spreadsheets",
  excel: "Microsoft Excel format",
  pdf: "Formatted reports for presentation",
  json: "Raw data for further processing"
};
```

## 🔧 Advanced Admin Functions

### Bulk Operations

#### Mass User Actions
- **Bulk Email**: Send notifications to user groups
- **Account Updates**: Mass account type changes
- **Bonus Distribution**: Apply bonuses to multiple accounts
- **Data Export**: Export user data for analysis

#### System Maintenance
- **Database Cleanup**: Remove old data and logs
- **Cache Management**: Clear and refresh system caches
- **Backup Management**: Database backup scheduling
- **System Updates**: Platform version management

### Integration Management

#### Third-Party Services
```javascript
const integrations = {
  paymentProcessors: "Configure payment gateways",
  kycProviders: "Identity verification services",
  emailServices: "Email delivery platforms",
  smsServices: "SMS notification providers",
  analyticsTools: "User behavior analytics"
};
```

#### API Management
- **Webhook Configuration**: Set up event notifications
- **API Key Management**: Generate and manage API keys
- **Rate Limit Configuration**: Adjust API usage limits
- **Monitoring**: Track API usage and performance

## 🚨 Emergency Procedures

### System Incidents

#### Incident Response
1. **Identify Issue**: Determine scope and impact
2. **Communication**: Notify relevant stakeholders
3. **Mitigation**: Implement temporary fixes
4. **Resolution**: Apply permanent solution
5. **Post-Mortem**: Analyze and improve processes

#### Emergency Contacts
- **Technical Lead**: System architecture issues
- **Trading Desk**: Market-related problems
- **Compliance Officer**: Regulatory concerns
- **CEO/Management**: Major incidents requiring executive decision

### Trading Halts

#### Market Suspension
```javascript
const marketHalt = {
  reasons: [
    "Extreme market volatility",
    "Technical system issues",
    "Regulatory requirements",
    "Major news events"
  ],
  procedure: [
    "Assess market conditions",
    "Notify users of suspension",
    "Close risky positions if necessary",
    "Monitor situation continuously",
    "Resume trading when safe"
  ]
};
```

---

**Admin responsibilities require careful attention to detail and thorough understanding of both trading and risk management principles. Always prioritize user safety and regulatory compliance.**