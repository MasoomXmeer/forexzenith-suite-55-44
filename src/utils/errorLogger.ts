
interface ErrorLogData {
  message: string
  stack?: string
  level: 'error' | 'warn' | 'info'
  context?: Record<string, any>
  timestamp: string
  userId?: string
  url: string
  userAgent: string
}

class ErrorLogger {
  private isDevelopment = import.meta.env.DEV

  log(level: 'error' | 'warn' | 'info', message: string, context?: Record<string, any>) {
    const logData: ErrorLogData = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    // Always log to console in development
    if (this.isDevelopment) {
      if (level === 'error') {
        console.error(`[${level.toUpperCase()}]`, message, context)
      } else if (level === 'warn') {
        console.warn(`[${level.toUpperCase()}]`, message, context)
      } else {
        console.info(`[${level.toUpperCase()}]`, message, context)
      }
    }

    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorService(logData)
    }
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  logException(error: Error, context?: Record<string, any>) {
    const logData: ErrorLogData = {
      message: error.message,
      stack: error.stack,
      level: 'error',
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    }

    if (this.isDevelopment) {
      console.error('[EXCEPTION]', error.message, { error, context })
    } else {
      this.sendToErrorService(logData)
    }
  }

  private async sendToErrorService(logData: ErrorLogData) {
    try {
      // TODO: Replace with actual error tracking service (Sentry, LogRocket, etc.)
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData),
      })
    } catch (error) {
      // Fallback to console if error service fails
      console.error('Failed to send error to service:', error)
      console.error('Original error:', logData)
    }
  }
}

export const errorLogger = new ErrorLogger()

// Global error handler
window.addEventListener('error', (event) => {
  errorLogger.logException(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  })
})

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  errorLogger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    stack: event.reason?.stack
  })
})
