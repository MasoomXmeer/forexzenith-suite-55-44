
import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'
import { toast } from '@/hooks/use-toast'
import { errorLogger } from '@/utils/errorLogger'

// Debug logging to check React availability
console.log('🔍 React availability check:', { 
  React: typeof React, 
  useState: typeof useState,
  useEffect: typeof useEffect,
  reactKeys: React ? Object.keys(React).slice(0, 5) : 'React is null'
});

interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  account_type: 'standard' | 'premium' | 'vip'
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
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🏗️ AuthProvider rendering, React hooks available:', { useState: typeof useState, useEffect: typeof useEffect });
  
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session check:', { hasSession: !!session, userId: session?.user?.id })
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { event, hasSession: !!session, userId: session?.user?.id })
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
      errorLogger.error('Error fetching profile', { error: error.message, userId })
      toast({
        title: "Error",
        description: "Failed to load user profile",
        variant: "destructive"
      })
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    console.log('🔐 Starting sign in for:', email)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Sign in failed:', error)
        throw error
      }
      
      console.log('✅ Sign in successful')
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to AonePrimeFX"
      })
    } catch (error: any) {
      console.error('🚨 Sign in error:', error)
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    setIsLoading(true)
    console.log('📝 Starting sign up for:', email, { firstName, lastName })
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
      
      if (error) {
        console.error('❌ Sign up failed:', error)
        throw error
      }
      
      console.log('✅ Sign up successful')
      toast({
        title: "Account Created!",
        description: "Please check your email to verify your account"
      })
    } catch (error: any) {
      console.error('🚨 Sign up error:', error)
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      toast({
        title: "Signed Out",
        description: "Successfully signed out from AonePrimeFX"
      })
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      })
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
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const value: AuthContextType = {
    user,
    profile,
    session,
    isLoading,
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
