
// AonePrimeFX Platform Configuration
export const platformConfig = {
  // Platform Information
  platform: {
    name: "AonePrime",
    fullName: "AonePrime",
    version: "1.0.0",
    description: "Professional Forex Trading Platform",
    logo: "/logo.png",
    favicon: "/favicon.ico",
    domain: "app.aoneprimefx.com"
  },

  // Brand Colors (XM.com inspired)
  theme: {
    colors: {
      primary: "#E31E24", // XM Red
      secondary: "#1A1A1A", // Dark Black
      accent: "#FFD700", // Gold
      success: "#00C851",
      warning: "#FF8800",
      danger: "#FF4444",
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#333333",
      textMuted: "#666666"
    },
    gradients: {
      primary: "linear-gradient(135deg, #E31E24 0%, #B71C1C 100%)",
      secondary: "linear-gradient(135deg, #1A1A1A 0%, #000000 100%)",
      hero: "linear-gradient(135deg, #E31E24 0%, #1A1A1A 100%)"
    }
  },

  // Trading Configuration
  trading: {
    // Available currency pairs
    supportedPairs: [
      // Major Forex Pairs
      { symbol: "EURUSD", name: "Euro / US Dollar", baseSpread: 0.8, minLot: 0.01, maxLot: 100, category: "Major" },
      { symbol: "GBPUSD", name: "British Pound / US Dollar", baseSpread: 1.2, minLot: 0.01, maxLot: 100, category: "Major" },
      { symbol: "USDJPY", name: "US Dollar / Japanese Yen", baseSpread: 0.5, minLot: 0.01, maxLot: 100, category: "Major" },
      { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", baseSpread: 1.0, minLot: 0.01, maxLot: 100, category: "Major" },
      { symbol: "USDCAD", name: "US Dollar / Canadian Dollar", baseSpread: 1.5, minLot: 0.01, maxLot: 100, category: "Major" },
      { symbol: "USDCHF", name: "US Dollar / Swiss Franc", baseSpread: 1.3, minLot: 0.01, maxLot: 100, category: "Major" },
      { symbol: "NZDUSD", name: "New Zealand Dollar / US Dollar", baseSpread: 1.8, minLot: 0.01, maxLot: 100, category: "Major" },
      
      // Cross Pairs
      { symbol: "EURGBP", name: "Euro / British Pound", baseSpread: 1.5, minLot: 0.01, maxLot: 100, category: "Cross" },
      { symbol: "EURJPY", name: "Euro / Japanese Yen", baseSpread: 1.0, minLot: 0.01, maxLot: 100, category: "Cross" },
      { symbol: "GBPJPY", name: "British Pound / Japanese Yen", baseSpread: 2.0, minLot: 0.01, maxLot: 100, category: "Cross" },
      
      
      // Metals
      { symbol: "XAUUSD", name: "Gold / US Dollar", baseSpread: 30, minLot: 0.01, maxLot: 100, category: "Metal" },
      { symbol: "XAGUSD", name: "Silver / US Dollar", baseSpread: 3, minLot: 0.01, maxLot: 100, category: "Metal" },
      
      // Energies
      { symbol: "USOIL", name: "US Oil", baseSpread: 3, minLot: 0.01, maxLot: 100, category: "Energy" },
      { symbol: "UKOIL", name: "UK Oil", baseSpread: 3, minLot: 0.01, maxLot: 100, category: "Energy" },
      
      // Indices
      { symbol: "US30", name: "US 30 Index", baseSpread: 2, minLot: 0.01, maxLot: 100, category: "Index" },
      { symbol: "US500", name: "US 500 Index", baseSpread: 1, minLot: 0.01, maxLot: 100, category: "Index" },
      { symbol: "NAS100", name: "NASDAQ 100", baseSpread: 1, minLot: 0.01, maxLot: 100, category: "Index" },
      { symbol: "GER30", name: "Germany 30", baseSpread: 1, minLot: 0.01, maxLot: 100, category: "Index" },
      { symbol: "UK100", name: "UK 100", baseSpread: 1, minLot: 0.01, maxLot: 100, category: "Index" },
      { symbol: "JPN225", name: "Japan 225", baseSpread: 8, minLot: 0.01, maxLot: 100, category: "Index" }
    ],

    // Leverage options
    leverageOptions: [
      { value: "1:30", label: "1:30" },
      { value: "1:50", label: "1:50" },
      { value: "1:100", label: "1:100" },
      { value: "1:200", label: "1:200" },
      { value: "1:500", label: "1:500" },
      { value: "1:1000", label: "1:1000" }
    ],

    // Default settings
    defaults: {
      leverage: "1:500",
      commission: 0.0007, // 0.07%
      minDeposit: 50,
      maxLeverage: "1:1000",
      spreadMultiplier: 1.0
    }
  },

  // Market Data Configuration
  marketData: {
    updateInterval: 5000, // 5 seconds for better real-time experience
    cacheDuration: 10000, // 10 seconds
    fallbackToDemo: true,
    sources: {
      primary: 'polygon',
      fallback: 'tradingview',
      simulation: 'internal'
    },
    rateLimit: {
      requestsPerMinute: 5, // Polygon.io free tier
      batchSize: 5 // Smaller batches for better performance
    },
    
    // Polygon.io API configuration
    polygon: {
      enabled: true,
      rateLimit: 5, // requests per minute for free tier
      timeout: 10000
    },
    
    // Alpha Vantage API configuration (legacy)
    alphaVantage: {
      apiKey: "H3LWCJIKC0W71ZE1",
      baseUrl: "https://www.alphavantage.co/query",
      rateLimit: 5, // requests per minute
      timeout: 10000
    },
    
    // TradingView configuration (fallback)
    tradingView: {
      enabled: true,
      theme: "dark",
      autosize: true,
      symbol: "FX:EURUSD",
      interval: "1"
    },

    // WebSocket configuration for real-time data
    websocket: {
      enabled: true,
      reconnectInterval: 5000,
      maxReconnectAttempts: 10
    },

    enableRealTime: true
  },

  // Account Configuration
  account: {
    // KYC requirements
    kyc: {
      required: true,
      documents: [
        { type: "identity", name: "Government ID", required: true },
        { type: "address", name: "Proof of Address", required: true },
        { type: "income", name: "Proof of Income", required: false }
      ]
    },

    // Account types
    accountTypes: [
      {
        type: "standard",
        name: "Standard Account",
        minDeposit: 50,
        maxLeverage: "1:500",
        commission: 0.0007,
        features: ["Basic Trading", "Email Support", "Mobile App", "Web Platform"]
      },
      {
        type: "premium",
        name: "Premium Account",
        minDeposit: 500,
        maxLeverage: "1:1000",
        commission: 0.0005,
        features: ["Advanced Trading", "Priority Support", "Market Analysis", "VPS Access", "Expert Advisors"]
      },
      {
        type: "vip",
        name: "VIP Account",
        minDeposit: 5000,
        maxLeverage: "1:1000",
        commission: 0.0003,
        features: ["All Premium Features", "Dedicated Manager", "Custom Analysis", "API Access", "Institutional Tools"]
      }
    ]
  },

  // Payment Methods
  payments: {
    methods: [
      {
        id: "credit_card",
        name: "Credit/Debit Card",
        provider: "Stripe",
        enabled: true,
        minAmount: 50,
        maxAmount: 10000,
        processingTime: "Instant",
        fees: "2.9% + $0.30"
      },
      {
        id: "bank_transfer",
        name: "Bank Wire Transfer",
        provider: "Manual",
        enabled: true,
        minAmount: 100,
        maxAmount: 50000,
        processingTime: "1-3 business days",
        fees: "$25"
      },
      {
        id: "crypto",
        name: "Cryptocurrency",
        provider: "Coinbase",
        enabled: false,
        minAmount: 50,
        maxAmount: 25000,
        processingTime: "10-60 minutes",
        fees: "1%"
      },
      {
        id: "paypal",
        name: "PayPal",
        provider: "PayPal",
        enabled: false,
        minAmount: 50,
        maxAmount: 5000,
        processingTime: "Instant",
        fees: "3.4% + $0.30"
      }
    ]
  },

  // Affiliate Program
  affiliate: {
    enabled: true,
    commissionStructure: {
      referralBonus: 50, // $50 per active referral
      revenueShare: 0.10, // 10% revenue share
      minimumPayout: 100 // $100 minimum payout
    },
    payoutSchedule: "monthly", // weekly, monthly, quarterly
    cookieDuration: 30 // days
  },

  // Security Settings
  security: {
    twoFactorAuth: {
      enabled: true,
      required: false,
      methods: ["app", "sms", "email"]
    },
    sessionTimeout: 30, // minutes
    passwordRequirements: {
      minLength: 8,
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      requireLowercase: true
    }
  },

  // Admin Panel
  admin: {
    roles: ["admin", "moderator", "support"],
    permissions: {
      admin: ["all"],
      moderator: ["users", "trades", "kyc"],
      support: ["users", "kyc"]
    }
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.DEV 
      ? 'http://localhost:3000' 
      : 'https://api.forexzenith.com',
    version: "v1",
    timeout: 10000, // milliseconds
    rateLimit: {
      requests: 100,
      window: 60000 // 1 minute
    }
  },

  // Feature Flags
  features: {
    socialTrading: false,
    copyTrading: false,
    algorithms: false,
    mobileApp: true,
    webTrader: true,
    marketNews: false,
    economicCalendar: false
  }
};

export default platformConfig;
