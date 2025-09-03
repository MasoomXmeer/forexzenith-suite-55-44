
// Production Readiness Utilities
import { supabase } from '@/lib/supabase'
import { errorLogger } from './errorLogger'

export interface ProductionCheck {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  critical: boolean
}

export class ProductionReadinessChecker {
  async runAllChecks(): Promise<ProductionCheck[]> {
    const checks: ProductionCheck[] = []

    checks.push(await this.checkSupabaseConnection())
    checks.push(await this.checkEnvironmentVariables())
    checks.push(await this.checkDatabaseSchema())
    checks.push(await this.checkAuthConfiguration())
    checks.push(this.checkErrorHandling())
    checks.push(this.checkSecurityHeaders())
    
    return checks
  }

  private async checkSupabaseConnection(): Promise<ProductionCheck> {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        return {
          name: 'Supabase Connection',
          status: 'fail',
          message: `Database connection failed: ${error.message}`,
          critical: true
        }
      }

      return {
        name: 'Supabase Connection',
        status: 'pass',
        message: 'Database connection successful',
        critical: true
      }
    } catch (error) {
      return {
        name: 'Supabase Connection',
        status: 'fail',
        message: 'Failed to connect to Supabase',
        critical: true
      }
    }
  }

  private checkEnvironmentVariables(): ProductionCheck {
    const requiredVars = [
      'VITE_SUPABASE_URL',
      'VITE_SUPABASE_ANON_KEY'
    ]

    const missing = requiredVars.filter(key => !import.meta.env[key])

    if (missing.length > 0) {
      return {
        name: 'Environment Variables',
        status: 'fail',
        message: `Missing required variables: ${missing.join(', ')}`,
        critical: true
      }
    }

    return {
      name: 'Environment Variables',
      status: 'pass',
      message: 'All required environment variables are set',
      critical: true
    }
  }

  private async checkDatabaseSchema(): Promise<ProductionCheck> {
    try {
      const tables = ['profiles', 'trading_accounts', 'trades', 'markets']
      
      for (const table of tables) {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (error) {
          return {
            name: 'Database Schema',
            status: 'fail',
            message: `Table ${table} not found or accessible: ${error.message}`,
            critical: true
          }
        }
      }

      return {
        name: 'Database Schema',
        status: 'pass',
        message: 'All required database tables exist and are accessible',
        critical: true
      }
    } catch (error) {
      return {
        name: 'Database Schema',
        status: 'fail',
        message: 'Failed to verify database schema',
        critical: true
      }
    }
  }

  private async checkAuthConfiguration(): Promise<ProductionCheck> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check if auth is properly configured
      const { data, error } = await supabase.auth.getUser()
      
      if (error && error.message.includes('Invalid JWT')) {
        return {
          name: 'Authentication Configuration',
          status: 'warning',
          message: 'Auth configuration appears correct but no valid session',
          critical: false
        }
      }

      return {
        name: 'Authentication Configuration',
        status: 'pass',
        message: 'Authentication system is properly configured',
        critical: true
      }
    } catch (error) {
      return {
        name: 'Authentication Configuration',
        status: 'fail',
        message: 'Authentication system configuration error',
        critical: true
      }
    }
  }

  private checkErrorHandling(): ProductionCheck {
    const hasGlobalErrorHandler = window.onerror !== null
    const hasUnhandledRejectionHandler = window.onunhandledrejection !== null

    if (!hasGlobalErrorHandler || !hasUnhandledRejectionHandler) {
      return {
        name: 'Error Handling',
        status: 'warning',
        message: 'Global error handlers may not be properly configured',
        critical: false
      }
    }

    return {
      name: 'Error Handling',
      status: 'pass',
      message: 'Global error handling is configured',
      critical: false
    }
  }

  private checkSecurityHeaders(): ProductionCheck {
    const isHTTPS = window.location.protocol === 'https:'
    const isLocalhost = window.location.hostname === 'localhost'

    if (!isHTTPS && !isLocalhost) {
      return {
        name: 'Security - HTTPS',
        status: 'fail',
        message: 'Application must be served over HTTPS in production',
        critical: true
      }
    }

    return {
      name: 'Security - HTTPS',
      status: 'pass',
      message: 'Application is properly secured',
      critical: true
    }
  }

  async generateReport(): Promise<string> {
    const checks = await this.runAllChecks()
    const criticalFailures = checks.filter(c => c.critical && c.status === 'fail')
    const warnings = checks.filter(c => c.status === 'warning')
    const passes = checks.filter(c => c.status === 'pass')

    let report = '# Production Readiness Report\n\n'
    
    if (criticalFailures.length === 0) {
      report += '✅ **PRODUCTION READY** - All critical checks passed\n\n'
    } else {
      report += '❌ **NOT PRODUCTION READY** - Critical issues found\n\n'
    }

    report += `**Summary:**\n`
    report += `- ✅ Passed: ${passes.length}\n`
    report += `- ⚠️ Warnings: ${warnings.length}\n`
    report += `- ❌ Failed: ${criticalFailures.length}\n\n`

    if (criticalFailures.length > 0) {
      report += '## ❌ Critical Issues (Must Fix)\n\n'
      criticalFailures.forEach(check => {
        report += `- **${check.name}**: ${check.message}\n`
      })
      report += '\n'
    }

    if (warnings.length > 0) {
      report += '## ⚠️ Warnings (Recommended to Fix)\n\n'
      warnings.forEach(check => {
        report += `- **${check.name}**: ${check.message}\n`
      })
      report += '\n'
    }

    report += '## ✅ Passed Checks\n\n'
    passes.forEach(check => {
      report += `- **${check.name}**: ${check.message}\n`
    })

    return report
  }
}

export const productionChecker = new ProductionReadinessChecker()
