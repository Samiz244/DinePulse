import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import { writeStaffSession } from '../guards/StaffGuard'
import './StaffDashboard.css'

export default function StaffEntry() {
  const navigate                      = useNavigate()
  const [slug, setSlug]               = useState('')
  const [code, setCode]               = useState('')
  const [submitting, setSubmitting]   = useState(false)
  const [error, setError]             = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Step 1: resolve restaurant by slug
    const { data: restaurant } = await supabase
      .from('restaurants')
      .select('id')
      .eq('slug', slug.trim().toLowerCase())
      .maybeSingle()

    if (!restaurant) {
      setError("Restaurant not found. Check the slug and try again.")
      setSubmitting(false)
      return
    }

    // Step 2: verify staff code
    const normalised = code.trim().toUpperCase()
    const { data: valid } = await supabase.rpc('verify_staff_code', {
      p_restaurant_id: restaurant.id,
      p_code:          normalised,
    })

    setSubmitting(false)

    if (!valid) {
      setError('Incorrect staff code. Please try again.')
      return
    }

    writeStaffSession({ restaurantId: restaurant.id, code: normalised, grantedAt: Date.now() })
    navigate('/staff/dashboard', { replace: true })
  }

  return (
    <div className="se-page">
      <div className="se-card">
        <span className="se-logo">DinePulse</span>
        <p className="se-title">Staff Entry</p>
        <p className="se-sub">
          Enter your restaurant's URL slug and staff code to access the kitchen display.
        </p>

        <form className="se-form" onSubmit={handleSubmit}>
          <div className="se-field">
            <label htmlFor="se-slug" className="se-label">Restaurant slug</label>
            <input
              id="se-slug"
              type="text"
              required
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="the-burger-joint"
              autoCapitalize="none"
              autoCorrect="off"
              className="se-input"
            />
          </div>

          <div className="se-field">
            <label htmlFor="se-code" className="se-label">Staff code</label>
            <input
              id="se-code"
              type="text"
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="e.g. ABC123"
              autoCapitalize="characters"
              autoCorrect="off"
              className="se-input"
            />
          </div>

          {error && <p className="se-error">{error}</p>}

          <button type="submit" disabled={submitting} className="se-submit">
            {submitting ? 'Verifying…' : 'Access Kitchen Display →'}
          </button>
        </form>
      </div>
    </div>
  )
}
