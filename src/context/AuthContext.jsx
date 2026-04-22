import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

function mapAuthError(message) {
  if (message.includes('Invalid login credentials'))
    return 'Incorrect email or password.'
  if (message.includes('User already registered') || message.includes('already been registered'))
    return 'An account with this email already exists.'
  if (message.includes('Password should be'))
    return 'Password must be at least 6 characters.'
  if (message.includes('Unable to validate email'))
    return 'Please enter a valid email address.'
  return 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  async function fetchProfile(userId, email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setUser({ id: userId, email, fullName: data.full_name, role: data.role })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id, session.user.email)
      else setIsLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session)
        if (session) await fetchProfile(session.user.id, session.user.email)
        else { setUser(null); setIsLoading(false) }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signUp(email, password, fullName, role) {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    })
    if (error) return { error: mapAuthError(error.message) }
    return { error: null }
  }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: mapAuthError(error.message) }
    return { error: null }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
