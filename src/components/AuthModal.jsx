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
    'w-full bg-[#F5F5F5] border-none rounded-xl px-4 py-3 text-sm text-[#212121] placeholder-[#BDBDBD] outline-none focus:ring-2 focus:ring-[#FF5722] transition-shadow'

  return (
    /* Overlay — bg-black/60, full-screen on mobile, centred card on sm+ */
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop click closes modal */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Card — full-width sheet on mobile, rounded card on sm+ */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl px-6 pt-8 pb-10 sm:px-8 sm:pt-10 sm:pb-10">

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-[#757575] hover:text-[#212121] hover:bg-[#F5F5F5] transition-colors text-xl leading-none"
        >
          ×
        </button>

        {/* Brand header */}
        <div className="text-center mb-7">
          <span className="text-3xl font-bold text-[#FF5722]">DinePulse</span>
          <p className="text-sm text-[#757575] mt-2">
            {mode === 'login'
              ? 'Welcome back! Please enter your details.'
              : 'Create your account to get started.'}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex bg-[#F5F5F5] rounded-xl p-1 mb-6">
          {['login', 'signup'].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                mode === m
                  ? 'bg-white text-[#FF5722] shadow-sm'
                  : 'text-[#757575] hover:text-[#212121]'
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
                  { value: 'customer', icon: '🛒', label: 'Customer', desc: 'Browse & order food' },
                  { value: 'manager', icon: '🍽️', label: 'Manager', desc: 'Manage my restaurant' },
                ].map(({ value, icon, label, desc }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex flex-col items-center text-center gap-1.5 py-5 px-3 rounded-2xl border-2 transition-all active:scale-95 ${
                      role === value
                        ? 'border-[#FF5722] bg-[#FFF3F0] shadow-sm'
                        : 'border-[#E0E0E0] bg-white hover:border-[#BDBDBD]'
                    }`}
                  >
                    <span className="text-3xl">{icon}</span>
                    <p className="text-sm font-semibold text-[#212121]">{label}</p>
                    <p className="text-xs text-[#757575] leading-snug">{desc}</p>
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
            className="w-full bg-[#FF5722] text-white font-semibold rounded-xl py-3.5 text-base hover:bg-[#E64A19] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
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
