import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../services/supabaseClient'
import type { AuthUser, UserRole } from '../types'

interface AuthContextValue {
  user:      AuthUser | null
  isLoading: boolean
  signUp:    (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>
  signIn:    (email: string, password: string) => Promise<{ error: string | null }>
  signOut:   () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function mapAuthError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Incorrect email or password.'
  if (message.includes('User already registered') || message.includes('already been registered'))
    return 'An account with this email already exists.'
  if (message.includes('Password should be'))
    return 'Password must be at least 6 characters.'
  if (message.includes('Unable to validate email'))
    return 'Please enter a valid email address.'
  if (message.includes('manager_signup_not_approved'))
    return 'This email is not on our approved list. Request early access to get started.'
  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]           = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const profileController         = useRef<AbortController | null>(null)

  async function fetchProfile(userId: string, email: string) {
    profileController.current?.abort()
    const controller = new AbortController()
    profileController.current = controller
    

    const { data, error, status } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .maybeSingle()

      console.log('[Auth] Profile status:', status)
      console.log('[Auth] Profile data:', data)
      console.log('[Auth] Profile error:', error)
    if (error) {
      console.error(`[Auth] Query Error | Status: ${status} | Code: ${error.code}`, error)
      setUser(null)
      setIsLoading(false)
      return
    }

    if (data === null) {
      console.warn(`[Auth] Visibility Gap | Profile ID ${userId} not visible or missing.`)
      setUser(null)
      setIsLoading(false)
      return
    }

    setUser({ id: userId, email, fullName: data.full_name, role: data.role as UserRole })
    setIsLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        
        if (!session) { setUser(null); setIsLoading(false) }
      }
    )

    return () => {
      subscription.unsubscribe()
      profileController.current?.abort()
    }
  }, [])

  async function signUp(email: string, password: string, fullName: string, role: UserRole) {
    if (role === 'manager') {
      const { data: approved, error: rpcError } = await supabase.rpc('check_manager_lead', { p_email: email })
      if (rpcError || !approved) {
        return { error: 'This email is not on our approved list. Request early access to get started.' }
      }
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    if (error) return { error: mapAuthError(error.message) }
    return { error: null }
  }

  async function signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) return { error: mapAuthError(error.message) }
    if (data.user) {
      await fetchProfile(data.user.id, data.user.email ?? email)
    }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
