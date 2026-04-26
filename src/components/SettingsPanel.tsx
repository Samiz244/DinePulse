import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import type { Restaurant } from '../types'

interface SettingsPanelProps {
  restaurant: Restaurant
  onUpdate:   () => void
}

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9-]/g, '')
}

export default function SettingsPanel({ restaurant, onUpdate }: SettingsPanelProps) {
  const [name,        setName]        = useState(restaurant.name)
  const [cuisineType, setCuisineType] = useState(restaurant.cuisine_type ?? '')
  const [slug,        setSlug]        = useState(restaurant.slug ?? '')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  // Sync fields if the parent refetches and passes a new restaurant object
  useEffect(() => {
    setName(restaurant.name)
    setCuisineType(restaurant.cuisine_type ?? '')
    setSlug(restaurant.slug ?? '')
  }, [restaurant.id])

  async function handleSaveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const trimmedName = name.trim()
    const trimmedSlug = slug.trim()
    if (!trimmedName) { setError('Restaurant name is required.'); return }

    setSaving(true)

    const payload: Record<string, string | null> = {
      name:         trimmedName,
      cuisine_type: cuisineType.trim() || null,
      slug:         trimmedSlug || null,
    }

    const { error: dbError } = await supabase
      .from('restaurants')
      .update(payload)
      .eq('id', restaurant.id)

    setSaving(false)

    if (dbError) {
      if (dbError.message.includes('unique') || dbError.code === '23505') {
        setError('This URL is already in use. Please choose a different slug.')
      } else {
        setError('Failed to save settings. Please try again.')
      }
      return
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    onUpdate()
  }

  const slugPreview = slug.trim()
    ? `dinepulse.com/restaurant/${slug.trim()}`
    : 'dinepulse.com/restaurant/your-slug'

  return (
    <div className="st-panel">

      <form className="st-form" onSubmit={handleSaveSettings}>

        <div className="st-section">
          <h2 className="st-section-title">Restaurant details</h2>

          <div className="st-field">
            <label htmlFor="st-name" className="st-label">Restaurant name</label>
            <input
              id="st-name"
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="st-input"
              placeholder="e.g. The Golden Fork"
            />
          </div>

          <div className="st-field">
            <label htmlFor="st-cuisine" className="st-label">
              Cuisine type
              <span className="st-label-hint"> — optional</span>
            </label>
            <input
              id="st-cuisine"
              type="text"
              value={cuisineType}
              onChange={e => setCuisineType(e.target.value)}
              className="st-input"
              placeholder="e.g. Italian, Japanese"
            />
          </div>

          <div className="st-field">
            <label htmlFor="st-slug" className="st-label">
              URL slug
              <span className="st-label-hint"> — lowercase letters and hyphens only</span>
            </label>
            <input
              id="st-slug"
              type="text"
              value={slug}
              onChange={e => setSlug(slugify(e.target.value))}
              className="st-input"
              placeholder="e.g. the-golden-fork"
              spellCheck={false}
              autoCapitalize="none"
            />
            <p className="st-slug-preview">{slugPreview}</p>
          </div>
        </div>

        {error  && <p className="st-error">{error}</p>}
        {saved  && <p className="st-success">✓ Settings saved.</p>}

        <button type="submit" disabled={saving} className="st-save-btn">
          {saving ? 'Saving…' : 'Save changes'}
        </button>

      </form>

      {/* Danger Zone */}
      <div className="st-danger-zone">
        <h3 className="st-danger-title">Danger zone</h3>
        <p className="st-danger-sub">
          Destructive actions will be available here in a future release.
        </p>
      </div>

    </div>
  )
}
