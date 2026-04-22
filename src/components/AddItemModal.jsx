import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { MENU_CATEGORIES } from '../constants/menuCategories'

export default function AddItemModal({ isOpen, onClose, restaurantId, onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  function resetForm() {
    setName('')
    setDescription('')
    setPrice('')
    setCategory('')
    setErrors({})
    setSubmitError(null)
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function validate() {
    const next = {}
    if (!name.trim())
      next.name = 'Item name is required.'
    const parsed = parseFloat(price)
    if (!price || !isFinite(parsed) || parsed <= 0)
      next.price = 'Price must be greater than 0.'
    if (!MENU_CATEGORIES.includes(category))
      next.category = 'Please select a category.'
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

    const { error } = await supabase.from('menu_items').insert({
      restaurant_id: restaurantId,
      name:          name.trim(),
      description:   description.trim() || null,
      price:         parseFloat(price),
      category,
    })

    setIsSubmitting(false)

    if (error) {
      setSubmitError('Failed to add menu item. Please try again.')
      return
    }

    onSuccess()
    handleClose()
  }

  const inputClass = (field) =>
    `w-full bg-[#F5F5F5] rounded-xl px-4 py-3 text-sm text-[#212121] placeholder-[#BDBDBD] outline-none focus:ring-2 ${
      errors[field] ? 'ring-2 ring-red-400' : 'focus:ring-[#FF5722]'
    }`

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#212121]">Add menu item</h2>
          <button type="button" onClick={handleClose}
            className="text-[#757575] hover:text-[#212121] text-2xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">Item name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Margherita Pizza" className={inputClass('name')} />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className={inputClass('category')}>
              <option value="" disabled>Select a category</option>
              {MENU_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category}</p>}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">Price (£)</label>
            <input type="number" min="0.01" step="0.01" value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00" className={inputClass('price')} />
            {errors.price && <p className="text-xs text-red-600 mt-1">{errors.price}</p>}
          </div>

          {/* Description (optional) */}
          <div>
            <label className="block text-sm font-medium text-[#212121] mb-1">
              Description <span className="text-[#BDBDBD] font-normal">(optional)</span>
            </label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description…" className={inputClass('description')} />
          </div>

          {submitError && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{submitError}</p>
          )}

          <button type="submit" disabled={isSubmitting}
            className="w-full bg-[#FF5722] text-white font-semibold rounded-xl py-3.5 text-base hover:bg-[#E64A19] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
            {isSubmitting ? 'Adding…' : 'Add Item'}
          </button>

        </form>
      </div>
    </div>
  )
}
