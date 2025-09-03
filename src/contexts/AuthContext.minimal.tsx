import * as React from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  account_type: 'standard' | 'premium' | 'vip'
  user_role: 'user' | 'admin' | 'super_admin'
  balance: number
  equity: number
  margin: number
  free_margin: number
  kyc_status: 'pending' | 'verified' | 'rejected'
  is_affiliate: boolean
  referral_code: string | null
  referred_by: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAdmin: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🏗️ Minimal AuthProvider starting...');
  
  const [user, setUser] = React.useState<User | null>(null)
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    console.log('📱 AuthProvider useEffect running...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session check:', { hasSession: !!session })
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setIsLoading(false)
    }).catch(error => {
      console.error('❌ Session check failed:', error)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { event, hasSession: !!session })
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    console.log('👤 Fetching profile for user:', userId)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      console.log('📊 Profile query result:', { data, error })

      if (error && error.code === 'PGRST116') {
        console.log('🆕 Profile not found, creating new profile...')
        // Profile doesn't exist, create one
        const newProfile = {
          id: userId,
          email: user?.email || '',
          first_name: '',
          last_name: '',
          account_type: 'standard' as const,
          user_role: 'user' as const,
          balance: 10000,
          equity: 10000,
          margin: 0,
          free_margin: 10000,
          kyc_status: 'pending' as const
        }

        console.log('💾 Creating profile with data:', newProfile)

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single()

        console.log('✅ Profile creation result:', { createdProfile, createError })

        if (createError) {
          console.error('❌ Profile creation failed:', createError)
          throw createError
        }
        setProfile(createdProfile)
      } else if (error) {
        console.error('❌ Profile fetch failed:', error)
        throw error
      } else {
        console.log('✅ Profile loaded successfully:', data)
        setProfile(data)
      }
    } catch (error: any) {
      console.error('🚨 Error in fetchProfile:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      })
      
      if (error) throw error
    } catch (error: any) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error('Sign out error:', error)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) throw error
      
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    } catch (error: any) {
      console.error('Update profile error:', error)
    }
  }

  const isAdmin = profile?.user_role === 'admin' || profile?.user_role === 'super_admin'

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
    isAdmin,
    signIn,
    signUp,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}