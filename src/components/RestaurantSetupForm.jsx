import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

export default function RestaurantSetupForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [passcode, setPasscode] = useState('')
  const [confirmPasscode, setConfirmPasscode] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-center max-w-sm w-full">
          <p className="text-4xl mb-4">🎉</p>
          <h2 className="text-xl font-bold text-[#212121] mb-2">Restaurant created!</h2>
          <p className="text-sm text-[#757575]">Your restaurant is live. More features coming soon.</p>
        </div>
      </div>
    )
  }

  function validate() {
    const next = {}
    if (!name.trim())          next.name    = 'Restaurant name is required.'
    if (!cuisine.trim())       next.cuisine = 'Cuisine type is required.'
    if (passcode.length < 6)   next.passcode = 'Passcode must be at least 6 characters.'
    if (passcode !== confirmPasscode) next.confirmPasscode = 'Passcodes do not match.'
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError(null)

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    setIsSubmitting(true)

    const { error } = await supabase.rpc('create_restaurant', {
      p_name:name.trim(),
      p_cuisine:cuisine.trim(),
      p_passcode:passcode,
    })

    setIsSubmitting(false)

    if (error) {
      console.error('Create restaurant RPC error:', error)
      setSubmitError('Failed to create restaurant. Please try again.')
      return
    }

    setDone(true)
    onSuccess()
  }

  const inputClass = (field) =>
    `w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#212121] placeholder-[#BDBDBD] outline-none focus:ring-2 ${
      errors[field] ? 'ring-2 ring-red-400' : 'focus:ring-[#FF5722]'
    }`

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-6 shadow-sm w-full max-w-md">

        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#212121]">Set up your restaurant</h2>
          <p className="text-sm text-[#757575] mt-1">This info will be visible to customers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">
              Restaurant name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. The Burger Joint"
              className={inputClass('name')}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Cuisine */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">
              Cuisine type
            </label>
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="e.g. Burgers, Sushi, Pizza…"
              className={inputClass('cuisine')}
            />
            {errors.cuisine && (
              <p className="text-xs text-red-600 mt-1">{errors.cuisine}</p>
            )}
          </div>

          {/* Passcode */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">
              Manager passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Min. 6 characters"
              className={inputClass('passcode')}
            />
            {errors.passcode && (
              <p className="text-xs text-red-600 mt-1">{errors.passcode}</p>
            )}
          </div>

          {/* Confirm Passcode */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">
              Confirm passcode
            </label>
            <input
              type="password"
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Re-enter your passcode"
              className={inputClass('confirmPasscode')}
            />
            {errors.confirmPasscode && (
              <p className="text-xs text-red-600 mt-1">{errors.confirmPasscode}</p>
            )}
          </div>

          {/* RPC error */}
          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF5722] text-white font-semibold rounded-xl py-3.5 text-base hover:bg-[#E64A19] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating…' : 'Create Restaurant'}
          </button>

        </form>
      </div>
    </div>
  )
}
