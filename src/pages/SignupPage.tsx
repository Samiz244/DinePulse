import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../context/AuthContext'
import './SignupPage.css'

export default function SignupPage() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()

  const [fullName,   setFullName]   = useState('')
  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  const role = 'manager' as const

  if (user?.role === 'manager') return <Navigate to="/admin" replace />

  async function handleSignup(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Lead gate: email must be on the approved list
    const { data: approved, error: rpcError } = await supabase.rpc('check_manager_lead', {
      p_email: email.trim().toLowerCase(),
    })

    if (rpcError) {
      console.error('check_manager_lead RPC error:', rpcError)
      setError('Database connection error. Please try again later.')
      setSubmitting(false)
      return
    }

    if (!approved) {
      setError("Your email hasn't been approved for early access yet. Request access on our homepage.")
      setSubmitting(false)
      return
    }

    const { error: authError } = await signUp(
      email.trim().toLowerCase(),
      password,
      fullName.trim(),
      role,
    )

    setSubmitting(false)

    if (authError) {
      setError(authError)
      return
    }

    navigate('/login?from=signup', { replace: true })
  }

  return (
    <div className="sp-page">
      <div className="sp-card">
        <span className="sp-logo">DinePulse</span>

        <p className="sp-heading">Create your account</p>
        <p className="sp-sub">
          Approved restaurants only. Your email must be on our early-access list.
        </p>

        <form className="sp-form" onSubmit={handleSignup}>

          <div className="sp-field">
            <label htmlFor="sp-name" className="sp-label">Full name</label>
            <input
              id="sp-name"
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className="sp-input"
            />
          </div>

          <div className="sp-field">
            <label htmlFor="sp-email" className="sp-label">Email address</label>
            <input
              id="sp-email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="owner@restaurant.com"
              autoCapitalize="none"
              className="sp-input"
            />
          </div>

          <div className="sp-field">
            <label htmlFor="sp-password" className="sp-label">Password</label>
            <input
              id="sp-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="sp-input"
            />
          </div>

          {error && <p className="sp-error">{error}</p>}

          <button type="submit" disabled={submitting} className="sp-submit">
            {submitting ? 'Creating account…' : 'Create Account →'}
          </button>

        </form>

        <p className="sp-footer">
          Already have an account?{' '}
          <Link to="/login" className="sp-footer-link">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
