import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { MENU_CATEGORIES } from '../constants/menuCategories'
import type { MenuItem } from '../types'

interface MenuItemModalProps {
  isOpen:       boolean
  onClose:      () => void
  restaurantId: string
  onSuccess:    () => void
  mode?:        'add' | 'edit'
  initialData?: MenuItem | null
}

interface FieldErrors {
  name?:     string
  price?:    string
  category?: string
}

export default function MenuItemModal({
  isOpen,
  onClose,
  restaurantId,
  onSuccess,
  mode = 'add',
  initialData = null,
}: MenuItemModalProps) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice]             = useState('')
  const [category, setCategory]       = useState('')
  const [errors, setErrors]           = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name)
      setDescription(initialData.description ?? '')
      setPrice(String(initialData.price))
      setCategory(initialData.category)
      setErrors({})
      setSubmitError(null)
    }
  }, [initialData?.id, mode])

  if (!isOpen) return null

  function resetForm() {
    setName(''); setDescription(''); setPrice(''); setCategory('')
    setErrors({}); setSubmitError(null)
  }

  function handleClose() { resetForm(); onClose() }

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (!name.trim()) next.name = 'Item name is required.'
    const parsed = parseFloat(price)
    if (!price || !isFinite(parsed) || parsed <= 0) next.price = 'Price must be greater than 0.'
    if (!(MENU_CATEGORIES as string[]).includes(category)) next.category = 'Please select a category.'
    return next
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitError(null)

    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return }
    setErrors({})
    setSubmitting(true)

    if (mode === 'edit') {
      if (!initialData) { setSubmitting(false); return }
      const { error } = await supabase
        .from('menu_items')
        .update({
          name:        name.trim(),
          description: description.trim() || null,
          price:       parseFloat(price),
          category,
        })
        .eq('id', initialData.id)

      setSubmitting(false)
      if (error) { setSubmitError('Failed to update menu item. Please try again.'); return }
    } else {
      const { error } = await supabase.from('menu_items').insert({
        restaurant_id: restaurantId,
        name:          name.trim(),
        description:   description.trim() || null,
        price:         parseFloat(price),
        category,
      })

      setSubmitting(false)
      if (error) { setSubmitError('Failed to add menu item. Please try again.'); return }
    }

    onSuccess()
    handleClose()
  }

  const inputCls = (field: keyof FieldErrors) =>
    `mim-input${errors[field] ? ' mim-input--error' : ''}`
  const selectCls = (field: keyof FieldErrors) =>
    `mim-select${errors[field] ? ' mim-select--error' : ''}`

  const title       = mode === 'edit' ? 'Edit item' : 'Add item'
  const submitLabel = isSubmitting
    ? (mode === 'edit' ? 'Saving…' : 'Adding…')
    : (mode === 'edit' ? 'Save changes' : 'Add item')

  return (
    <div className="mim-overlay">
      <div className="mim-backdrop" onClick={handleClose} />
      <div className="mim-sheet">

        <div className="mim-header">
          <h2 className="mim-title">{title}</h2>
          <button type="button" className="mim-close" onClick={handleClose}>×</button>
        </div>

        <form className="mim-form" onSubmit={handleSubmit}>

          <div className="mim-field">
            <label className="mim-label">Item name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Margherita Pizza" className={inputCls('name')} />
            {errors.name && <p className="mim-field-error">{errors.name}</p>}
          </div>

          <div className="mim-field">
            <label className="mim-label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className={selectCls('category')}>
              <option value="" disabled>Select a category</option>
              {(MENU_CATEGORIES as string[]).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="mim-field-error">{errors.category}</p>}
          </div>

          <div className="mim-field">
            <label className="mim-label">Price (£)</label>
            <input type="number" min="0.01" step="0.01" value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0.00" className={inputCls('price')} />
            {errors.price && <p className="mim-field-error">{errors.price}</p>}
          </div>

          <div className="mim-field">
            <label className="mim-label">
              Description <span className="mim-label-optional">(optional)</span>
            </label>
            <input type="text" value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="A short description…" className={inputCls('description' as keyof FieldErrors)} />
          </div>

          {submitError && <p className="mim-submit-error">{submitError}</p>}

          <button type="submit" disabled={isSubmitting} className="mim-submit-btn">
            {submitLabel}
          </button>

        </form>
      </div>
    </div>
  )
}
