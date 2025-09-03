
// Production Configuration Override
import { platformConfig } from './platform'

// Production-specific overrides
export const productionConfig = {
  ...platformConfig,
  
  // Enhanced security for production
  security: {
    ...platformConfig.security,
    sessionTimeout: 15, // Shorter session timeout
    passwordRequirements: {
      minLength: 12, // Stronger passwords
      requireNumbers: true,
      requireSymbols: true,
      requireUppercase: true,
      requireLowercase: true,
      requireSpecialChars: true
    },
    twoFactorAuth: {
      enabled: true,
      required: true, // Require 2FA for all users in production
      methods: ["app", "sms"]
    }
  },

  // Production API settings
  api: {
    ...platformConfig.api,
    baseUrl: 'https://api.aoneprimefx.com',
    timeout: 5000, // Faster timeout for production
    rateLimit: {
      requests: 60, // More restrictive rate limiting
      window: 60000
    }
  },

  // Production market data settings
  marketData: {
    ...platformConfig.marketData,
    updateInterval: 2000, // More frequent updates
    enableRealTime: true,
    cacheDuration: 15000, // Shorter cache duration
    alphaVantage: {
      ...platformConfig.marketData.alphaVantage,
      rateLimit: 75, // Premium plan rate limit
      timeout: 5000
    }
  },

  // Production-ready defaults
  trading: {
    ...platformConfig.trading,
    defaults: {
      ...platformConfig.trading.defaults,
      minDeposit: 250, // Higher minimum for production
      commission: 0.0005, // Competitive commission
      maxLeverage: "1:500"
    }
  },

  // Enhanced error tracking for production
  errorTracking: {
    enabled: true,
    service: 'sentry', // Configure with your error tracking service
    environment: import.meta.env.PROD ? 'production' : 'development',
    sampleRate: 0.1 // Sample 10% of events in production
  },

  // Performance monitoring
  performance: {
    trackPageLoads: true,
    trackUserInteractions: true,
    maxBundleSize: 512000, // 512KB max bundle size
    enableServiceWorker: true
  }
}

// Use production config in production environment
export const getConfig = () => {
  return import.meta.env.PROD ? productionConfig : platformConfig
}

export default getConfig()
