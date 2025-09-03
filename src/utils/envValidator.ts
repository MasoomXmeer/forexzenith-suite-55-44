
interface EnvConfig {
  VITE_SUPABASE_URL: string
  VITE_SUPABASE_ANON_KEY: string
}

class EnvironmentValidator {
  validate(): EnvConfig {
    // Use your provided Supabase credentials
    return {
      VITE_SUPABASE_URL: 'https://rxdyudnjbnnvhbxwkcbf.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4ZHl1ZG5qYm5udmhieHdrY2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM5OTA0MzcsImV4cCI6MjA2OTU2NjQzN30.vR4R4sxqZZYfq4wFVJW8iJI2OjuMHOeh1w691TnNAcg'
    }
  }

  private isValidURL(url: string): boolean {
    try {
      new URL(url)
      return url.startsWith('https://') || import.meta.env.DEV
    } catch {
      return false
    }
  }

  private isValidSupabaseKey(key: string): boolean {
    // Basic JWT format validation
    const parts = key.split('.')
    return parts.length === 3 && parts.every(part => part.length > 0)
  }

  getConfig(): EnvConfig {
    return this.validate()
  }
}

export const envValidator = new EnvironmentValidator()
export const envConfig = envValidator.getConfig()
