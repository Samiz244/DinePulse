import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function switchMode(newMode) {
    setMode(newMode)
    setError(null)
    setEmail('')
    setPassword('')
    setFullName('')
    setRole('customer')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, fullName, role)

    setIsSubmitting(false)

    if (result.error) {
      setError(result.error)
    } else {
      onClose()
    }
  }

  const inputClass =
    'w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#212121] placeholder-[#BDBDBD] outline-none focus:ring-2 focus:ring-[#FF5722]'

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#212121]">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#757575] hover:text-[#212121] text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-[#F5F5F5] rounded-xl p-1 mb-6">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === m
                  ? 'bg-white text-[#FF5722] shadow-sm'
                  : 'text-[#757575]'
              }`}
            >
              {m === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full name — sign up only */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-1">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className={inputClass}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {/* Role selector — sign up only */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-[#212121] mb-2">I am a…</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'customer', label: '🛒 Customer', desc: 'Browse & order food' },
                  { value: 'manager', label: '🍽️ Manager', desc: 'Manage my restaurant' },
                ].map(({ value, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      role === value
                        ? 'border-[#FF5722] bg-[#FFF3F0]'
                        : 'border-[#E0E0E0] bg-white'
                    }`}
                  >
                    <p className="text-sm font-semibold text-[#212121]">{label}</p>
                    <p className="text-xs text-[#757575] mt-0.5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Inline error */}
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF5722] text-white font-semibold rounded-xl py-3.5 text-base hover:bg-[#E64A19] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Please wait…'
              : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>

        </form>
      </div>
    </div>
  )
}
