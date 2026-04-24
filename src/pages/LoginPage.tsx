import { useState, useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './SignupPage.css'

export default function LoginPage() {
  const { user, signIn } = useAuth()
  const [params] = useSearchParams()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [fromSignup, setFromSignup] = useState(false)

  useEffect(() => {
    if (params.get('from') === 'signup') setFromSignup(true)
  }, [params])

  if (user?.role === 'manager') return <Navigate to="/admin" replace />

  async function handleLogin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: authError } = await signIn(
      email.trim().toLowerCase(),
      password,
    )

    if (authError) {
      setError(authError)
    }

    setSubmitting(false)
  }

  return (
    <div className="sp-page">
      <div className="sp-card">
        <span className="sp-logo">DinePulse</span>

        {fromSignup && (
          <p className="sp-success">
            ✓ Account created! Check your inbox to verify your email, then sign in below.
          </p>
        )}

        <p className="sp-heading">Manager login</p>
        <p className="sp-sub">
          Sign in to your DinePulse partner account.
        </p>

        <form className="sp-form" onSubmit={handleLogin}>

          <div className="sp-field">
            <label htmlFor="lp-email" className="sp-label">Email address</label>
            <input
              id="lp-email"
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
            <label htmlFor="lp-password" className="sp-label">Password</label>
            <input
              id="lp-password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password"
              className="sp-input"
            />
          </div>

          {error && <p className="sp-error">{error}</p>}

          <button type="submit" disabled={submitting} className="sp-submit">
            {submitting ? 'Signing in…' : 'Sign In →'}
          </button>

        </form>

        <p className="sp-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="sp-footer-link">Request access</Link>
        </p>
      </div>
    </div>
  )
}
